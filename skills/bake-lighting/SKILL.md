---
name: bake-lighting
description: Use when static PlayCanvas lighting, shadows, or ambient occlusion cost too much per frame and should be baked into lightmaps.
---

# Bake static lighting

Lightmaps remove per-frame shadow and lighting cost for static lights on static geometry.

- `Application` registers `Lightmapper`; manual `AppOptions` bootstraps set
  `lightmapper = Lightmapper`.
- On the light, set `bake = true`; once every mesh it lights is lightmapped, set
  `affectDynamic = false`.
- On each mesh, set `render.lightmapped = true`, or it goes unlit once `affectDynamic` is off. Size
  it with `lightmapSizeMultiplier`; `castShadowsLightmap` lets meshes shadow each other.
- Set the mode on `scene.lightmapMode`: `BAKE_COLOR` for flat diffuse, or the default
  `BAKE_COLORDIR`, which adds direction for normal- or specular-mapped materials.
- Bake AO without lights with `scene.ambientBake`, `ambientBakeNumSamples`, and
  `ambientBakeOcclusionBrightness` and `ambientBakeOcclusionContrast`.
- The Engine bakes once on the first rendered frame. Call `app.lightmapper.bake(null, mode)` only
  for nodes added later or to re-bake.

## A second UV set is required

A node bakes only when every mesh instance has `SEMANTIC_TEXCOORD1`. Otherwise it is skipped, with
only a debug-build log, and stays dynamically lit. Primitives have the set; imported GLBs often do
not. Check, then unwrap or re-export.

## On-device or offline

Time `bake()` on the target device. Move to an offline bake shipped as textures only when it misses
the startup budget or needs detail the runtime lightmapper cannot produce, and state the added
download size.

Dynamic objects moving through baked light need approximated occlusion and a contact shadow, or
they look pasted on. Compare `verify-pixels` captures in and out of baked shadow.
