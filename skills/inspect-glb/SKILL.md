---
name: inspect-glb
description: Use before loading, placing, scaling, or animating GLB assets in PlayCanvas to measure bounds, grounding offset, clips, joints, and hierarchy offline with the bundled zero-dependency inspector.
---

# Inspect GLBs

Resolve `scripts/inspect.mjs` relative to this skill directory and run it before choosing entity
transforms or animation names:

```sh
node <skill-directory>/scripts/inspect.mjs public/models/Character.glb
node <skill-directory>/scripts/inspect.mjs public/models/{Ship,Enemy}_*.glb
```

The output provides:

- `dims` for calculating a uniform scale;
- `groundOffset` for the model wrapper's local Y position;
- `center` for the pivot offset from the geometry centre: a non-zero X or Z means the root's
  position is not where the model appears, and Y feeds grounding;
- `boundsSource` for proving how precisely the bounds were measured;
- `nodePaths`, `clips`, `joints`, and `animationTargets` for animation setup and rig comparison;
- `skinned` to flag bind-pose bounds that need runtime confirmation.

## Bounds precision

`aabb`, `dims`, `center`, and `groundOffset` are decoded from actual vertex positions and transformed
by each node's world matrix, so they are exact and can place meshes touching without a gap. Confirm
`boundsSource` before relying on that precision:

- `vertices` means every primitive was decoded and the bounds are exact.
- `accessor-minmax` means at least one primitive could not be decoded, so its bounds fall back to the
  node-transformed local box. That over-estimates a mesh which does not fill its own box on a node
  rotated off-axis, by up to 41 percent for a 45-degree yaw. `boundsNotes` gives the cause.

Carry `boundsSource`, `aabb`, `dims`, `center`, and `groundOffset` into the asset tuning record.
`groundOffset` seats the base in Y; `center.x` and `center.z` are the horizontal pivot offset that
`calibrate-model` must compensate, so a placed root sits where the mesh appears, not where the
authored pivot happens to be. Running the inspector alone is not placement evidence. Its global AABB supports plane grounding and
broad-phase spacing, but cannot locate a non-planar support surface or attachment point. Use an
authored mount point or confirm the support in the running application before placing another model.

## Extract from any container with gltf-transform

The bundled inspector decodes plain vertex buffers only. When a primitive is draco- or
meshopt-compressed, sparse, or in an external buffer it falls back to `accessor-minmax` or reports
nothing, and `boundsNotes` names the cause. Use gltf-transform as the precursor that normalizes any
container into a plain GLB the inspector can then measure exactly. Decompress a scratch copy with the
passes that would alter geometry or hierarchy disabled, and inspect the copy rather than shipping it:

```sh
npx @gltf-transform/cli optimize in.glb scratch.glb \
  --compress false --simplify false --flatten false --join false
node <skill-directory>/scripts/inspect.mjs scratch.glb
```

The Engine has no `EXT_meshopt_compression` support, so a meshopt asset will not render as shipped.
If it must appear in the scene, transcode it to an uncompressed GLB the same way — subject to the
project's rules on modifying assets — so it both loads and measures.

These exact bounds intentionally disagree with the Engine at runtime. `MeshInstance.aabb` transforms
the mesh's declared local box, so for a node rotated off-axis it reads larger than the geometry
really is. Treat that difference as expected and place from these bounds. A skinned mesh node's own
transform is ignored here because glTF requires it; the Engine resolves to the same result.

Shortlist files first; do not dump an entire asset pack into context. Bounds cannot prove facing.
glTF convention is +Z forward while PlayCanvas entities face -Z, and asset packs vary. Confirm each
directional model once in the running app as the `apply-conventions` skill describes, and store its
yaw correction with its scale and grounding.

Use `npx @gltf-transform/cli inspect` only when vertex or texture statistics justify extra tooling.
