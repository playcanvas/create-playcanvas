---
name: bake-lighting
description: Use when a PlayCanvas scene's static lighting, shadows, or ambient occlusion costs too much per frame, or lighting must ship precomputed for startup or payload budgets.
---

# Precompute static lighting

Static geometry lit by static lights can bake into lightmap textures once, removing per-frame
shadow-map rendering and per-pixel dynamic lighting for that light entirely.

## Engine `Lightmapper` flags

- Engine-only bootstraps must register it: `AppOptions.lightmapper = Lightmapper`. `Application`
  wires this by default; only a manual `AppOptions` assembly needs the explicit line.
- Per light: `light.bake = true`, then `light.affectDynamic = false` once every mesh it lights is
  lightmapped, so it stops contributing to the real-time pass.
- Per mesh: `render.lightmapped = true` — required for the mesh to receive any light once
  `affectDynamic` is false, a correctness requirement, not just an optimization —
  `render.lightmapSizeMultiplier` to size its lightmap, `render.castShadowsLightmap` so lightmapped
  meshes still shadow each other in the bake.
- Bake mode: `BAKE_COLOR` for flat diffuse materials; `BAKE_COLORDIR` adds a dominant-light-direction
  pass for normal- or specular-mapped materials that need one.
- Baked ambient occlusion, independent of any light: `scene.ambientBake` plus
  `ambientBakeNumSamples`, `ambientBakeOcclusionBrightness`/`OcclusionContrast`.
- Run `app.lightmapper.bake(null, mode)` once the scene exists; `null` bakes every lightmapped node.

## Verify UVs before trusting this on real assets

Procedural primitives auto-generate a usable UV set; imported GLB models often do not ship a second,
non-overlapping UV channel suitable for a lightmap atlas. Read the installed engine's source for
what its `Lightmapper` actually requires — which UV set it samples, whether it unwraps one for you —
before assuming a real model will bake correctly. Do not carry a primitive-only test result into
production assets unchecked.

## Choose the rung by budget, not by default

On-device bake cost scales with baked-node count and lightmap resolution; estimate it against the
startup budget before choosing a rung. Stay on-device unless:

- the estimated bake time does not fit the startup or first-paint budget on the target device, or
- the result needs stylized material detail beyond lighting that the runtime `Lightmapper` cannot
  produce.

Only then move to an offline bake shipped as assets, following the same shape as any other
generated-asset pipeline: registry-keyed per-asset configs (a new asset is a config change, not new
pipeline code), a CLI with per-target fast paths, staged size logging, worker-thread parallelism for
build time, and a coverage self-audit that fails the bake when an expected output is missing or
empty.

## Keep dynamic objects consistent

Whichever rung you use, dynamic objects moving through baked lighting must not read as ignoring it:
sample or approximate the baked occlusion/shadow field for them and their attachments so they dim to
the same levels as the static geometry around them, and ground them with a contact shadow. A
dynamic object whose custom shading must meet baked maps is `override-shader-chunks` territory.

## Prove it

Capture `verify-pixels`-style frames both in and out of the baked shadow, before and after the
change, and compare them. A screenshot glanced at once is not proof the bake reproduced the lighting
it removed.
