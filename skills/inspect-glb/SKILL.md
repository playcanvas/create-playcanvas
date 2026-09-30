---
name: inspect-glb
description: Use before loading, placing, scaling, or animating GLB models in PlayCanvas to measure bounds, grounding, clips, joints, and hierarchy with the bundled offline inspector.
---

# Inspect GLBs

Resolve `scripts/inspect.mjs` relative to this skill and run it before choosing transforms or
animation names. Shortlist files; do not dump a whole asset pack into context.

```sh
node <skill-directory>/scripts/inspect.mjs public/models/*.glb
```

## Read the output

- `dims`, `center`, and `groundOffset` give the uniform scale input, the pivot offset, and the Y
  seat. Non-zero `center.x` or `center.z` means the model does not sit on its root.
- `boundsSource`: trust bounds for placement only when it is `vertices`. `accessor-minmax` can
  over-estimate rotated nodes by up to 41 percent; `incomplete` or `null` means do not calibrate.
  `boundsNotes` gives the cause.
- `boundsPose`: `static` and `default-morph` are the authored pose; `bind` is the skinned rest pose.
- `requiresRuntimeCheck` flags morphs, skins, or partial decoding; confirm extents in the app.
- `nodePaths`, `clips`, `joints`, and `animationTargets` feed `configure-animation`.

Bounds cannot prove facing. Confirm it in the running app and record the yaw with
`calibrate-model`. Runtime `meshInstance.aabb` expands conservatively for morphs, so place static
models from inspected bounds.

## Compressed files

The inspector decodes plain, interleaved, quantized, and sparse buffers. For Draco, Meshopt, or
external buffers, inspect a lossless scratch copy; do not use `optimize`, which applies extra
transforms:

```sh
npx --yes @gltf-transform/cli@4.4.2 copy in.glb scratch.glb
```

The Engine cannot load `EXT_meshopt_compression`; see `load-assets` before shipping such files.
