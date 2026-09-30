---
name: add-effects
description: Use when adding visual effects to a PlayCanvas app, to choose between particle systems, shader chunks, runtime meshes, and post-processing.
---

# Effects

Pick the Engine building block first, then adapt its closest official example with
`find-examples`:

- Particle systems: the `particlesystem` component (`graphics/particles-*` examples).
- Custom shading on existing surfaces: `StandardMaterial` chunk overrides
  (`override-shader-chunks`), or a `ShaderMaterial` when the effect needs its own shader pair.
- Procedural or per-frame geometry: a runtime-updated `Mesh` on a `render` component
  (`graphics/mesh-*` examples), or `WideLineRenderer` for lines with width.
- Full-screen effects: `CameraFrame` (`light-scene`).
- Gaussian splat effects: the shipped gsplat scripts (`reuse-scripts`).

## Engine gotchas

- `CurveSet` takes one key array per channel. A flattened array type-checks, then fails at texture
  upload.
- Create emitters and meshes at load and reuse them. Fire an emitter with `reset()` then `play()`;
  one-shots use `loop: false`.
- The first use of a shader stalls a frame. Render each effect once behind a loading screen.
- Animate values with `setParameter`, not a per-frame `material.update()`.
- A lit material on a custom mesh needs normals; otherwise use an unlit material.

Trigger each effect through the app's real inputs, and confirm repeated triggers keep entity counts
stable.
