#!/usr/bin/env node
// zero-dep glb metadata inspector. bounds come from decoded vertex positions, not accessor min/max,
// so a rotated node reports its true extent and models can be placed touching.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const MAX_ACCESSOR_VALUES = 30_000_000;
const TYPES = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };

// componentType -> byte size, signedness and normalized divisor (glTF 2.0 table 3.1 / 5.1)
const COMPONENTS = {
    5120: { size: 1, signed: true, norm: 127, read: (b, o) => b.readInt8(o) },
    5121: { size: 1, signed: false, norm: 255, read: (b, o) => b.readUInt8(o) },
    5122: { size: 2, signed: true, norm: 32767, read: (b, o) => b.readInt16LE(o) },
    5123: { size: 2, signed: false, norm: 65535, read: (b, o) => b.readUInt16LE(o) },
    5125: { size: 4, signed: false, norm: 4294967295, read: (b, o) => b.readUInt32LE(o) },
    5126: { size: 4, signed: true, norm: 1, read: (b, o) => b.readFloatLE(o) }
};

const tryCatch = (fn) => {
    try {
        return [null, fn()];
    } catch (error) {
        return [error];
    }
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
    const buffer = g.buffers?.[index];
    if (!buffer) return null;
    const uri = buffer.uri;
    if (uri === undefined) return index === 0 ? bin : null;
    const base64 = /^data:[^,]*;base64,(.*)$/s.exec(uri);
    return base64 ? Buffer.from(base64[1], 'base64') : null;
};

const readAccessor = (g, bin, accessor, type = 'VEC3') => {
    const acc = g.accessors?.[accessor];
    if (!acc) return ['no-position-accessor'];
    if (acc.bufferView === undefined && !acc.sparse) return ['no-vertex-data'];
    const comp = COMPONENTS[acc.componentType];
    const size = TYPES[acc.type];
    if (!comp || !size || acc.type !== type || !Number.isInteger(acc.count) || acc.count < 1) {
        return ['unsupported-accessor'];
    }
    if (acc.count * size > MAX_ACCESSOR_VALUES) return ['accessor-too-large'];
    const data = new Float32Array(acc.count * size);
    const scale = acc.normalized ? comp.norm : 1;
    const read = (bytes, offset) => {
        const value = comp.read(bytes, offset) / scale;
        return acc.normalized && comp.signed && value < -1 ? -1 : value;
    };

    if (acc.bufferView !== undefined) {
        const view = g.bufferViews?.[acc.bufferView];
        if (!view || !Number.isInteger(view.byteLength)) return ['unsupported-accessor'];
        if (view.extensions?.EXT_meshopt_compression) return ['meshopt-compressed'];
        const bytes = bufferBytes(g, bin, view.buffer ?? 0);
        if (!bytes) return ['external-buffer'];
        const width = comp.size * size;
        const stride = view.byteStride ?? width;
        const base = (view.byteOffset ?? 0) + (acc.byteOffset ?? 0);
        const used = (acc.byteOffset ?? 0) + (acc.count - 1) * stride + width;
        if (stride < width || base < 0 || used > view.byteLength || base + (acc.count - 1) * stride + width > bytes.length) {
            return ['truncated-buffer'];
        }
        for (let i = 0; i < acc.count; i++) {
            for (let k = 0; k < size; k++) data[i * size + k] = read(bytes, base + i * stride + k * comp.size);
        }
    }

    if (acc.sparse) {
        const sparse = acc.sparse;
        const idx = sparse.indices;
        const values = sparse.values;
        const idxComp = idx && [5121, 5123, 5125].includes(idx.componentType) ? COMPONENTS[idx.componentType] : null;
        const idxView = g.bufferViews?.[idx?.bufferView];
        const valueView = g.bufferViews?.[values?.bufferView];
        if (!Number.isInteger(sparse.count) || sparse.count < 1 || sparse.count > acc.count || !idxComp ||
            !Number.isInteger(idxView?.byteLength) || !Number.isInteger(valueView?.byteLength)) {
            return ['invalid-sparse-accessor'];
        }
        if (idxView.extensions?.EXT_meshopt_compression || valueView.extensions?.EXT_meshopt_compression) {
            return ['meshopt-compressed'];
        }
        const idxBytes = bufferBytes(g, bin, idxView.buffer ?? 0);
        const valueBytes = bufferBytes(g, bin, valueView.buffer ?? 0);
        if (!idxBytes || !valueBytes) return ['external-buffer'];
        const idxBase = (idxView.byteOffset ?? 0) + (idx.byteOffset ?? 0);
        const valueBase = (valueView.byteOffset ?? 0) + (values.byteOffset ?? 0);
        const valueWidth = comp.size * size;
        const idxUsed = (idx.byteOffset ?? 0) + sparse.count * idxComp.size;
        const valueUsed = (values.byteOffset ?? 0) + sparse.count * valueWidth;
        if (idxBase < 0 || valueBase < 0 || idxUsed > idxView.byteLength || valueUsed > valueView.byteLength ||
            idxBase + sparse.count * idxComp.size > idxBytes.length || valueBase + sparse.count * valueWidth > valueBytes.length) {
            return ['truncated-buffer'];
        }
        let prev = -1;
        for (let i = 0; i < sparse.count; i++) {
            const index = idxComp.read(idxBytes, idxBase + i * idxComp.size);
            if (index <= prev || index >= acc.count) return ['invalid-sparse-accessor'];
            prev = index;
            for (let k = 0; k < size; k++) {
                data[index * size + k] = read(valueBytes, valueBase + i * valueWidth + k * comp.size);
            }
        }
    }

    return [null, data];
};

const accumulate = (data, matrix, min, max, morphs = []) => {
    for (let i = 0; i < data.length; i += 3) {
        let x = data[i];
        let y = data[i + 1];
        let z = data[i + 2];
        for (const [weight, delta] of morphs) {
            x += delta[i] * weight;
            y += delta[i + 1] * weight;
            z += delta[i + 2] * weight;
        }
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
};

// loose fallback: bound the 8 corners of the accessor's local box. over-estimates a mesh that does
// not fill its box when the node rotation is not a multiple of 90 degrees.
const accumulateCorners = (acc, matrix, min, max) => {
    if (!acc?.min || !acc?.max) return false;
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
    return true;
};

export const inspectGlb = (buf) => {
    if (buf.length < 20 || buf.readUInt32LE(0) !== GLB_MAGIC || buf.readUInt32LE(16) !== JSON_CHUNK) {
        throw new Error('not a GLB (or JSON chunk missing)');
    }
    if (buf.readUInt32LE(4) !== 2) throw new Error('unsupported GLB version');
    if (buf.readUInt32LE(8) !== buf.length) throw new Error('invalid GLB length');
    const jsonLength = buf.readUInt32LE(12);
    if (20 + jsonLength > buf.length) throw new Error('invalid JSON chunk length');
    const g = JSON.parse(buf.toString('utf8', 20, 20 + jsonLength));
    const binAt = 20 + jsonLength;
    let bin = null;
    if (binAt < buf.length) {
        if (binAt + 8 > buf.length || buf.readUInt32LE(binAt + 4) !== BIN_CHUNK) {
            throw new Error('invalid BIN chunk');
        }
        const length = buf.readUInt32LE(binAt);
        if (binAt + 8 + length !== buf.length) throw new Error('invalid BIN chunk length');
        bin = buf.subarray(binAt + 8);
    }
    const nodes = g.nodes ?? [];
    const nodeName = (i) => nodes[i]?.name ?? `node_${i}`;
    const parents = new Array(nodes.length).fill(-1);
    for (let i = 0; i < nodes.length; i++) {
        for (const child of nodes[i].children ?? []) {
            if (!Number.isInteger(child) || !nodes[child] || parents[child] !== -1) throw new Error('invalid node graph');
            parents[child] = i;
        }
    }
    const nodePath = (i) => {
        const names = [];
        const seen = new Set();
        for (; i >= 0; i = parents[i]) {
            if (seen.has(i)) throw new Error('invalid node graph');
            seen.add(i);
            names.unshift(nodeName(i));
        }
        return names.join('/');
    };
    const children = new Set(nodes.flatMap((n) => n.children ?? []));
    const roots = g.scenes?.[g.scene ?? 0]?.nodes ?? nodes.map((_, i) => i).filter((i) => !children.has(i));

    const world = new Array(nodes.length);
    const seen = new Set();
    const walk = (i, parent) => {
        if (!Number.isInteger(i) || !nodes[i] || seen.has(i)) throw new Error('invalid node graph');
        seen.add(i);
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
    let morphed = false;
    let fallback = false;
    let incomplete = false;
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].mesh === undefined || !world[i]) continue;
        meshNodes++;
        // glTF 2.0: "the transform of the skinned mesh node MUST be ignored" - joints drive the pose
        const matrix = nodes[i].skin === undefined ? world[i] : IDENTITY;
        const mesh = g.meshes?.[nodes[i].mesh];
        for (const prim of mesh?.primitives ?? []) {
            const [error, data] = prim.extensions?.KHR_draco_mesh_compression
                ? ['draco-compressed']
                : readAccessor(g, bin, prim.attributes?.POSITION);
            if (error) {
                notes.add(error);
                if (error === 'meshopt-compressed' || !accumulateCorners(g.accessors?.[prim.attributes?.POSITION], matrix, min, max)) {
                    incomplete = true;
                } else {
                    fallback = true;
                }
                continue;
            }
            const morphs = [];
            if (prim.targets?.length) {
                morphed = true;
                const weights = nodes[i].weights ?? mesh.weights ?? [];
                for (let k = 0; k < prim.targets.length; k++) {
                    const weight = weights[k] ?? 0;
                    if (!Number.isFinite(weight)) {
                        notes.add('invalid-morph-weight');
                        incomplete = true;
                        continue;
                    }
                    const accessor = prim.targets[k].POSITION;
                    if (!weight || accessor === undefined) continue;
                    const [morphError, delta] = readAccessor(g, bin, accessor);
                    if (morphError || delta.length !== data.length) {
                        notes.add(`morph-${morphError ?? 'accessor-size'}`);
                        incomplete = true;
                        continue;
                    }
                    morphs.push([weight, delta]);
                }
            }
            accumulate(data, matrix, min, max, morphs);
        }
    }

    const ok = min[0] !== Infinity;
    const morphAnimated = (g.animations ?? []).some((a) =>
        (a.channels ?? []).some((c) => c.target?.path === 'weights')
    );
    const skinned = !!g.skins?.length;
    return {
        aabb: ok ? { min: min.map(round), max: max.map(round) } : null,
        dims: ok ? max.map((v, i) => round(v - min[i])) : null,
        center: ok ? max.map((v, i) => round((v + min[i]) / 2)) : null,
        groundOffset: ok ? round(-min[1]) : null,
        boundsSource: ok ? (incomplete ? 'incomplete' : fallback ? 'accessor-minmax' : 'vertices') : null,
        boundsPose: skinned ? 'bind' : morphed ? 'default-morph' : 'static',
        requiresRuntimeCheck: skinned || morphAnimated || notes.size > 0,
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
        morphed,
        morphAnimated,
        skinned
    };
};

const main = import.meta.main ?? (process.argv[1] &&
    fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1]));
if (main) {
    const files = process.argv.slice(2);
    if (!files.length) {
        console.error('usage: node inspect.mjs <file.glb> [more.glb ...]');
        process.exit(1);
    }
    // report per-file failures so one unreadable file cannot discard a whole glob
    const out = files.map((file) => {
        const [error, result] = tryCatch(() => inspectGlb(fs.readFileSync(file)));
        return error ? { file, error: error instanceof Error ? error.message : String(error) } : { file, ...result };
    });
    if (out.some((result) => result.error)) process.exitCode = 1;
    console.log(JSON.stringify(out.length === 1 ? out[0] : out, null, 2));
}
