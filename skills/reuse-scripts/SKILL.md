---
name: reuse-scripts
description: Use before implementing non-core PlayCanvas behavior to discover and reuse production scripts shipped with the installed Engine, reproduce their official example integration, and verify the result against the installed version.
---

# Engine scripts

The installed `playcanvas` package ships production scripts under `scripts/esm/**`. Discover the
current set rather than maintaining a stale list:

```sh
rg 'static scriptName =' node_modules/playcanvas/scripts/esm \
  | sed "s|.*/scripts/esm/||; s|:.*static scriptName = ['\"]|  ->  |; s|['\"].*||" \
  | sort
```

Read the selected file for its named export, `@attribute` properties, and defaults. Not every module
is a `Script`; the parsers below `scripts/esm/parsers` are plain classes registered with a resource
handler instead.

Only import from `scripts/esm/**`. Legacy sibling directories depend on the global Engine namespace.
After selecting a script, use `find-examples` to locate its matching versioned Engine example.

Use a relevant shipped script as the default implementation. If it cannot own the whole feature,
preserve its input signs, angular damping, bounds, and lifecycle invariants in the custom portion
instead of replacing them from memory.

## Reproduce the reference integration

Treat the selected script source and its closest official example as complementary references:

1. Read the source for exports, properties, defaults, fallbacks, required components, and lifecycle.
2. Read the example for assets, entity references, mesh requirements, layer ordering, scene settings,
   and render-pipeline setup.
3. Reproduce the smallest working baseline before customizing it. Preserve defaults that are not
   deliberately changed, and tune one property group at a time.
4. After a rendered frame, fail on console, shader, or missing-asset diagnostics. Exercise the
   behavior with real input where applicable and inspect returned screenshots from representative
   views at the final backbuffer density.
5. Compare the result with the official example when visual quality matters. Keep iterating or
   report the gap; a running fallback is not proof of correct integration.

If no matching example exists, state that and derive the integration from installed source instead
of inventing it from memory.

For an outdoor water scene, start from `graphics/water.example.mjs` as one integration recipe. It
combines `Water`, `ProceduralSky`, `CameraControls`, `CameraFrame`, a dedicated water layer, scene
depth, normal and caustics textures, and conservative rendering defaults. Establish that complete
baseline before adapting its camera, assets, time of day, or water tuning.

## Preserve grouped defaults

Grouped property updates differ by authoring surface. Read the selected reference and preserve
defaults that are not being changed.

Read exactly one reference matching the code being edited:
[direct Engine](references/direct-engine.md), [React](references/react.md), or
[Web Components](references/web-components.md). Choose from imports and markup, not installed
dependencies alone.
