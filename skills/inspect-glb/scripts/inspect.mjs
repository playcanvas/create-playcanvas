#!/usr/bin/env node
// zero-dep glb metadata inspector. bounds come from decoded vertex positions, not accessor min/max,
// so a rotated node reports its true extent and models can be placed touching.
import fs from 'node:fs';

const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

// componentType -> byte size, signedness and normalized divisor (glTF 2.0 table 3.1 / 5.1)
const COMPONENTS = {
    5120: { size: 1, signed: true, norm: 127, read: (b, o) => b.readInt8(o) },
    5121: { size: 1, signed: false, norm: 255, read: (b, o) => b.readUInt8(o) },
    5122: { size: 2, signed: true, norm: 32767, read: (b, o) => b.readInt16LE(o) },
    5123: { size: 2, signed: false, norm: 65535, read: (b, o) => b.readUInt16LE(o) },
    5125: { size: 4, signed: false, norm: 4294967295, read: (b, o) => b.readUInt32LE(o) },
    5126: { size: 4, signed: true, norm: 1, read: (b, o) => b.readFloatLE(o) }
};

const mul = (a, b) => {
    const o = new Array(16);
    for (let c = 0; c < 4; c++) {
        for (let r = 0; r < 4; r++) {
            o[c * 4 + r] =
                a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
        }
    }
    return o;
};

const compose = ([tx, ty, tz], [x, y, z, w], [sx, sy, sz]) => {
    const x2 = x + x,
        y2 = y + y,
        z2 = z + z;
    const xx = x * x2,
        xy = x * y2,
        xz = x * z2;
    const yy = y * y2,
        yz = y * z2,
        zz = z * z2;
    const wx = w * x2,
        wy = w * y2,
        wz = w * z2;
    return [
        (1 - (yy + zz)) * sx,
        (xy + wz) * sx,
        (xz - wy) * sx,
        0,
        (xy - wz) * sy,
        (1 - (xx + zz)) * sy,
        (yz + wx) * sy,
        0,
        (xz + wy) * sz,
        (yz - wx) * sz,
        (1 - (xx + yy)) * sz,
        0,
        tx,
        ty,
        tz,
        1
    ];
};

const xform = (m, [x, y, z]) => [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14]
];

// + 0 normalizes -0 so a floored model reports 0, not -0
const round = (v) => Math.round(v * 1e4) / 1e4 + 0;

// buffer 0 of a GLB is the BIN chunk; other buffers are external files or data URIs
const bufferBytes = (g, bin, index) => {
    const uri = g.buffers?.[index]?.uri;
    if (uri === undefined) return bin;
    const base64 = /^data:[^,]*;base64,(.*)$/s.exec(uri);
    return base64 ? Buffer.from(base64[1], 'base64') : null;
};

// widen min/max with every decoded POSITION transformed by matrix. returns null on success,
// otherwise a reason the vertices could not be read so the caller can fall back and say so.
const accumulate = (g, bin, accessor, matrix, min, max) => {
    const acc = g.accessors?.[accessor];
    if (!acc) return 'no-position-accessor';
    if (acc.sparse) return 'sparse-accessor';
    if (acc.bufferView === undefined) return 'no-vertex-data';
    const comp = COMPONENTS[acc.componentType];
    if (!comp || acc.type !== 'VEC3') return 'unsupported-accessor';
    const view = g.bufferViews?.[acc.bufferView];
    if (!view) return 'unsupported-accessor';
    if (view.extensions?.EXT_meshopt_compression) return 'meshopt-compressed';
    const bytes = bufferBytes(g, bin, view.buffer ?? 0);
    if (!bytes) return 'external-buffer';
    const stride = view.byteStride ?? comp.size * 3;
    const base = (view.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    if (!acc.count || base + (acc.count - 1) * stride + comp.size * 3 > bytes.length) return 'truncated-buffer';
    const scale = acc.normalized ? comp.norm : 1;
    for (let v = 0; v < acc.count; v++) {
        const o = base + v * stride;
        let x = comp.read(bytes, o) / scale;
        let y = comp.read(bytes, o + comp.size) / scale;
        let z = comp.read(bytes, o + comp.size * 2) / scale;
        if (acc.normalized && comp.signed) {
            if (x < -1) x = -1;
            if (y < -1) y = -1;
            if (z < -1) z = -1;
        }
        // inlined to avoid allocating a vector per vertex on million-vertex meshes
        const px = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
        const py = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
        const pz = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
        if (px < min[0]) min[0] = px;
        if (py < min[1]) min[1] = py;
        if (pz < min[2]) min[2] = pz;
        if (px > max[0]) max[0] = px;
        if (py > max[1]) max[1] = py;
        if (pz > max[2]) max[2] = pz;
    }
    return null;
};

// loose fallback: bound the 8 corners of the accessor's local box. over-estimates a mesh that does
// not fill its box when the node rotation is not a multiple of 90 degrees.
const accumulateCorners = (acc, matrix, min, max) => {
    if (!acc?.min || !acc?.max) return;
    for (let c = 0; c < 8; c++) {
        const point = xform(matrix, [
            c & 1 ? acc.max[0] : acc.min[0],
            c & 2 ? acc.max[1] : acc.min[1],
            c & 4 ? acc.max[2] : acc.min[2]
        ]);
        for (let k = 0; k < 3; k++) {
            if (point[k] < min[k]) min[k] = point[k];
            if (point[k] > max[k]) max[k] = point[k];
        }
    }
};

export const inspectGlb = (buf) => {
    if (buf.length < 20 || buf.readUInt32LE(0) !== GLB_MAGIC || buf.readUInt32LE(16) !== JSON_CHUNK) {
        throw new Error('not a GLB (or JSON chunk missing)');
    }
    const jsonLength = buf.readUInt32LE(12);
    const g = JSON.parse(buf.toString('utf8', 20, 20 + jsonLength));
    const binAt = 20 + jsonLength;
    const bin =
        binAt + 8 <= buf.length && buf.readUInt32LE(binAt + 4) === BIN_CHUNK
            ? buf.subarray(binAt + 8, binAt + 8 + buf.readUInt32LE(binAt))
            : null;
    const nodes = g.nodes ?? [];
    const nodeName = (i) => nodes[i]?.name ?? `node_${i}`;
    const parents = new Array(nodes.length).fill(-1);
    for (let i = 0; i < nodes.length; i++) {
        for (const child of nodes[i].children ?? []) parents[child] = i;
    }
    const nodePath = (i) => {
        const names = [];
        for (; i >= 0; i = parents[i]) names.unshift(nodeName(i));
        return names.join('/');
    };
    const children = new Set(nodes.flatMap((n) => n.children ?? []));
    const roots = g.scenes?.[g.scene ?? 0]?.nodes ?? nodes.map((_, i) => i).filter((i) => !children.has(i));

    const world = new Array(nodes.length);
    const walk = (i, parent) => {
        const n = nodes[i];
        const local = n.matrix ?? compose(n.translation ?? [0, 0, 0], n.rotation ?? [0, 0, 0, 1], n.scale ?? [1, 1, 1]);
        world[i] = mul(parent, local);
        for (const child of n.children ?? []) walk(child, world[i]);
    };
    for (const root of roots) walk(root, IDENTITY);

    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    const notes = new Set();
    let meshNodes = 0;
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].mesh === undefined || !world[i]) continue;
        meshNodes++;
        // glTF 2.0: "the transform of the skinned mesh node MUST be ignored" - joints drive the pose
        const matrix = nodes[i].skin === undefined ? world[i] : IDENTITY;
        for (const prim of g.meshes?.[nodes[i].mesh]?.primitives ?? []) {
            const note = prim.extensions?.KHR_draco_mesh_compression
                ? 'draco-compressed'
                : accumulate(g, bin, prim.attributes?.POSITION, matrix, min, max);
            if (!note) continue;
            notes.add(note);
            accumulateCorners(g.accessors?.[prim.attributes?.POSITION], matrix, min, max);
        }
    }

    const ok = min[0] !== Infinity;
    return {
        aabb: ok ? { min: min.map(round), max: max.map(round) } : null,
        dims: ok ? max.map((v, i) => round(v - min[i])) : null,
        center: ok ? max.map((v, i) => round((v + min[i]) / 2)) : null,
        groundOffset: ok ? round(-min[1]) : null,
        boundsSource: ok ? (notes.size ? 'accessor-minmax' : 'vertices') : null,
        ...(notes.size ? { boundsNotes: [...notes].sort() } : {}),
        nodes: nodes.length,
        nodePaths: nodes.map((_, i) => nodePath(i)).sort(),
        meshNodes,
        materials: (g.materials ?? []).map((m, i) => m.name ?? `material_${i}`),
        clips: (g.animations ?? []).map((a, i) => ({
            name: a.name ?? `clip_${i}`,
            duration: round(Math.max(0, ...a.samplers.map((s) => g.accessors?.[s.input]?.max?.[0] ?? 0)))
        })),
        joints: [...new Set((g.skins ?? []).flatMap((s) => s.joints ?? []).map(nodeName))].sort(),
        animationTargets: [
            ...new Set(
                (g.animations ?? [])
                    .flatMap((a) => a.channels ?? [])
                    .flatMap((c) =>
                        c.target?.node === undefined ? [] : [`${nodePath(c.target.node)}.${c.target.path}`]
                    )
            )
        ].sort(),
        skinned: !!g.skins?.length
    };
};

if (import.meta.main ?? import.meta.filename === process.argv[1]) {
    const files = process.argv.slice(2);
    if (!files.length) {
        console.error('usage: node inspect.mjs <file.glb> [more.glb ...]');
        process.exit(1);
    }
    // report per-file failures so one unreadable file cannot discard a whole glob
    const out = files.map((file) => {
        try {
            return { file, ...inspectGlb(fs.readFileSync(file)) };
        } catch (e) {
            return { file, error: e.message };
        }
    });
    console.log(JSON.stringify(out.length === 1 ? out[0] : out, null, 2));
}
