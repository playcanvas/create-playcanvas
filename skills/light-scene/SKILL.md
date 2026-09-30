---
name: light-scene
description: Use when lighting or rendering a PlayCanvas scene, covering lights, ambient and environment lighting, sky, shadows, tone mapping, exposure, fog, and post-processing.
---

# Light and render a scene

Engine defaults give a flat, dark image; change them deliberately. Tune against inspected
screenshots, one class of value at a time.

## Defaults to change

- `scene.ambientLight` is black, so unlit sides render pure black. Light ambient and reflections
  from an environment atlas or skybox, or set an ambient colour.
- Cameras default to `TONEMAP_LINEAR`. Choose `TONEMAP_NEUTRAL`, `TONEMAP_ACES2`, or
  `TONEMAP_FILMIC` (on `cameraFrame.rendering.toneMapping` when using `CameraFrame`), set exposure,
  then balance light intensities to it.
- Shadows are off. Enable `castShadows` on the key light. Directional `shadowDistance` is 40 m, so
  use cascades for large scenes, and `SHADOWUPDATE_THISFRAME` for static shadows. Size resolution to
  the framed subject.
- Lights shine along local -Y (`apply-conventions`).

## Use what ships

- `CameraFrame` handles tone mapping, bloom, SSAO, DOF, vignette, and grading. Call `update()` after
  changes and destroy it with the app. Keep bloom intensity within the documented 0 to 0.1.
- `scene.sky.type` (`SKYTYPE_DOME`, `SKYTYPE_BOX`, `SKYTYPE_INFINITE`) grounds an environment sky.
- The `ProceduralSky` script owns a linked sun light: set the light's base intensity, then tune
  elevation and azimuth on the sky, not the light.
- The `ShadowCatcher` script grounds subjects that have no lit floor.
- Clustered lighting is on by default, so many point and spot lights are cheap.
- Bake static lights with `bake-lighting`; stylize shading with `override-shader-chunks`.

Find each integration's example with `find-examples`.

## Warning signs

- Albedo washing toward white: reduce exposure, sky, and light intensity before darkening
  materials.
- Large areas clipped white or crushed black: rebalance exposure and lights before adding post.
- A fog colour that differs from the sky horizon breaks the horizon line.
