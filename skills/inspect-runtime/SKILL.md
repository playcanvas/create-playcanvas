---
name: inspect-runtime
description: Use when reading state from a running PlayCanvas app, to reach its live Application through the Engine devtools hook without changing app code.
---

# Inspect a running app

From Engine 2.23, every app announces itself to a hook at
`globalThis[Symbol.for('playcanvas.inspector')]`. Read live state through it instead of adding
`window.app` or debug code to the app.

## Attach

- Resolve `scripts/devtools-hook.js` relative to this skill and inject it as an init script that
  runs before any page script. A hook defined later misses existing apps; reload instead.
- Page code then reads `globalThis.__playcanvasApps`, a `Map` from each live app to
  `{ version, revision, protocol }`. `app.init()` adds the entry and `app.destroy()` removes it.
- The script chains a hook defined before it, such as a devtools extension's.
- No entry means the Engine predates 2.23, is a non-debug 2.23.0 build, the hook loaded late, or
  the app set `devtools: false`. The Engine swallows hook errors.

## Read state

- Read after `frameend`, so values reflect a rendered frame.
- Return plain numbers and strings to the caller, not Engine objects.
- Useful reads: `app.root.findByName()` and `findByTag()`, world positions and
  `meshInstance.aabb`, `app.stats.drawCallCount` and `frameTime`, and
  `entity.anim.baseLayer.activeState`.
- Pause with `app.timeScale = 0`; `update` still runs with a zero `dt`. Step one frame by restoring
  the scale, then zeroing it again on the next `frameend`.
- Revert anything you change to take a measurement.

## Inspector panel

`@playcanvas/inspector` is a debug panel: `new Inspector(app)` shows the hierarchy, assets, GPU
resources, frame graph, physics, and frame timings; `record: true` records from creation. It must
import the app's own `playcanvas` package, so add it only to development builds. It draws over the
canvas and applies view overrides, so destroy it before `verify-pixels` captures. Stepping through
draws needs the debug build.

With `mcp: true` (0.5.0+), `await inspector.executeTool(name, args)` runs the tools `getTools()`
lists: find entities, get objects by `$id`, record frames, take screenshots, and read logs.
