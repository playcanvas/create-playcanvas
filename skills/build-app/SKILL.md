---
name: build-app
description: Use when creating or restructuring a PlayCanvas app with the Engine API, @playcanvas/react, or @playcanvas/web-components, covering bootstrap, input, resize, physics, update loop, UI, and lifecycle.
---

# Build an Engine application

Read `package.json` and the entry point, keep the surface that owns the lifecycle, and read only its
reference: [direct Engine](references/direct-engine.md), [React](references/react.md), or
[Web Components](references/web-components.md). Choose from imports and markup, not dependencies.

## Bootstrap

- Input is opt-in. `app.keyboard`, `mouse`, `touch`, `gamepads`, and `elementInput` stay `null`
  unless passed to `new Application(canvas, { ... })`; UI buttons need `new ElementInput(canvas)`.
- The Engine adds no window resize listener; call `app.resizeCanvas()` from your own handler.
- `graphicsDevice.maxPixelRatio` defaults to 1. Raise it, at most to `window.devicePixelRatio`, only
  where the target holds its frame budget, call `app.resizeCanvas()`, and confirm with
  `canvas.width / canvas.clientWidth`.
- Rigid bodies stay inert until Ammo loads through `WasmModule`. Copy the loader from the
  `physics/falling-shapes` example with `find-examples`.
- `devtools` defaults to `true`, so debugging tools can find the app (`inspect-runtime`). Set it to
  `false` only to hide a production build.

## Update loop

- `dt` is already clamped by `app.maxDeltaTime` (0.1 s); tune it instead of clamping by hand.
  `app.timeScale` scales it, and `0` pauses scaled time.
- Keep app state explicit and owned in one place; advance time-dependent logic from `dt`, and reset
  through the same setup used at start.

## UI

- Render UI from app state; never keep the source of truth in the DOM or UI elements.
- Use a DOM or React overlay, or Engine `screen` and `element` components adapted from a
  `user-interface` example.
- Hide unused elements with `enabled = false`; an element at opacity 0 still draws.

## Ownership

- Keep one owner for app creation, assets, entities, update callbacks, and teardown.
- Prefer the surface's declarative primitives. Put per-entity and per-frame behaviour in an Engine
  `Script`.
- Remove external events and resources in the lifecycle that created them.
