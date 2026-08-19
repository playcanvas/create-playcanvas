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
- `boundsSource` and `boundsPose` for proving how and at which pose the bounds were measured;
- `requiresRuntimeCheck` for animated morphs, skins, and incomplete decoding;
- `nodePaths`, `clips`, `joints`, and `animationTargets` for animation setup and rig comparison;
- `morphed`, `morphAnimated`, and `skinned` for pose-sensitive assets.

## Bounds precision

`aabb`, `dims`, `center`, and `groundOffset` are decoded from actual vertex positions, default morph
weights, and each node's world matrix. Confirm both source and pose before relying on them:

- `vertices` means every primitive was decoded and the bounds are exact for `boundsPose`.
- `accessor-minmax` means at least one primitive could not be decoded, so its bounds fall back to the
  node-transformed local box. That over-estimates a mesh which does not fill its own box on a node
  rotated off-axis, by up to 41 percent for a 45-degree yaw. `boundsNotes` gives the cause.
- `incomplete` means some visible default-pose geometry could not be measured; do not calibrate from
  the reported bounds.
- `null` means no usable bounds could be recovered.

`static` and `default-morph` bounds describe visible geometry at its authored default pose. `bind`
describes skinned vertices before animation. When `requiresRuntimeCheck` is true, confirm grounding
and maximum animated extent in the running application even if `boundsSource` is `vertices`.

Carry `boundsSource`, `aabb`, `dims`, `center`, and `groundOffset` into the asset tuning record.
`groundOffset` seats the base in Y; `center.x` and `center.z` are the horizontal pivot offset that
`calibrate-model` must compensate, so a placed root sits where the mesh appears, not where the
authored pivot happens to be. Running the inspector alone is not placement evidence. Its global AABB supports plane grounding and
broad-phase spacing, but cannot locate a non-planar support surface or attachment point. Use an
authored mount point or confirm the support in the running application before placing another model.

## Extract from compressed containers

The bundled inspector decodes plain, interleaved, quantized, and sparse vertex buffers. For Draco,
Meshopt, or external buffers, `boundsNotes` names the cause. Parse and rewrite a scratch copy with
glTF Transform's lossless `copy` command, then inspect that copy rather than shipping it:

```sh
npx --yes @gltf-transform/cli@4.4.2 copy in.glb scratch.glb
node <skill-directory>/scripts/inspect.mjs scratch.glb
```

`copy` preserves decoded vertex values, scenes, nodes, and materials while removing Draco and
Meshopt compression. Existing lossy compression may already have quantized the source. Do not
substitute `optimize`: it enables additional transforms unless each one is understood and disabled.

The Engine has no `EXT_meshopt_compression` support, so a meshopt asset will not render as shipped.
If it must appear in the scene, transcode it to an uncompressed GLB the same way — subject to the
project's rules on modifying assets — so it both loads and measures.

These geometry-fit bounds can intentionally disagree with the Engine's runtime culling AABB.
`MeshInstance.aabb` transforms the declared local box and expands it conservatively for morph
targets, so it can be larger than visible geometry. Place static models from exact inspected bounds;
confirm morph and skin extremes at runtime. A skinned mesh node's own transform is ignored here
because glTF requires it; the Engine resolves to the same result.

Shortlist files first; do not dump an entire asset pack into context. Bounds cannot prove facing.
glTF convention is +Z forward while PlayCanvas entities face -Z, and asset packs vary. Confirm each
directional model once in the running app as the `apply-conventions` skill describes, and store its
yaw correction with its scale and grounding.

Use `npx @gltf-transform/cli inspect` only when vertex or texture statistics justify extra tooling.
