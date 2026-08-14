---
name: build-app
description: Use when creating or restructuring a PlayCanvas application with the direct Engine API, @playcanvas/react, or @playcanvas/web-components to choose the active authoring surface and apply its bootstrap, lifecycle, ownership, asset-loading, and Engine interop patterns.
---

# Build an Engine application

Read `package.json` and the application entry point before changing its structure. Choose the
authoring surface from the code being edited:

- read [references/react.md](references/react.md) for `@playcanvas/react` imports and JSX;
- read [references/web-components.md](references/web-components.md) for `pc-*` elements or
  `@playcanvas/web-components` imports;
- read [references/direct-engine.md](references/direct-engine.md) for direct `playcanvas` bootstrap
  code without a wrapper-owned lifecycle.

Installed dependencies alone are insufficient when a project contains more than one surface.
Preserve the surface that owns the current entry point and lifecycle.

## Render at an intentional density

PlayCanvas defaults `graphicsDevice.maxPixelRatio` to 1 for predictable fill-rate cost. In a
quality-oriented browser app, set it deliberately after the application exists and before its
initial automatic resize; `Math.min(window.devicePixelRatio, 2)` is a practical high-DPI starting
point. Keep 1 only as a measured performance decision, and resize the canvas again after changing
the value.

Verify the real backbuffer in a browser: for automatic resolution, `canvas.width / canvas.clientWidth`
and the height ratio should match the chosen pixel ratio. CSS dimensions and a screenshot filepath
do not prove rendering density.

For every surface:

- verify version-sensitive APIs against installed declarations or source;
- keep one owner for application creation, assets, entities, update callbacks, and teardown;
- prefer the surface's declarative or lifecycle primitives before reaching into the Engine;
- put per-entity and per-frame behavior in an Engine `Script` when page or view state is not its
  natural owner;
- clamp the per-frame delta before advancing gameplay, timers, physics, or a state clock, so a
  backgrounded tab or a slow frame cannot inject one large integration step;
- clean up external events and resources in the lifecycle that created them.
