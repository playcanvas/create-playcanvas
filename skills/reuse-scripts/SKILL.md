---
name: reuse-scripts
description: Use before writing PlayCanvas behaviour from scratch, to reuse the scripts and helpers the installed Engine already ships.
---

# Reuse shipped Engine code

Before writing behaviour, check what the installed `playcanvas` package already provides.

Scripts live under `scripts/esm/**`; import only from there. List them:

```sh
rg 'static scriptName =' node_modules/playcanvas/scripts/esm \
  | sed "s|.*/scripts/esm/||; s|:.*static scriptName = ['\"]|  ->  |; s|['\"].*||" \
  | sort
```

Common ones are `CameraControls`, `FirstPersonController`, `ThirdPersonController`,
`ShadowCatcher`, `ProceduralSky`, `Water`, and `Grid`, plus XR and splat scripts. Modules under
`scripts/esm/parsers` are resource-handler classes, not scripts.

Core exports that are not scripts include `CameraFrame` for post-processing, `Picker`
(`getSelectionAsync`), `TransformGizmo`, `OutlineRenderer`, `MiniStats`, `GltfExporter`, and
`UsdzExporter`.

## Integrate

1. Read the source for exports, `@attribute` properties, defaults, and required components.
2. Find its official example with `find-examples`, and copy the assets, layers, scene settings, and
   render setup it depends on.
3. Adapt configuration and extension points. If nothing fits, implement only the missing part and
   say what was missing.
4. After a rendered frame, fail on console, shader, or missing-asset errors.

Keep a shipped script's input mapping and damping unless asked otherwise, and verify input
directions with real input rather than deriving signs from memory.

Grouped property updates differ by surface; preserve defaults you do not change. Read only the
reference matching the code: [direct Engine](references/direct-engine.md),
[React](references/react.md), or [Web Components](references/web-components.md).
