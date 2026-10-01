---
name: reduce-draw-calls
description: Use when a PlayCanvas app has too many draw calls or is CPU-bound, before hand-merging meshes or writing custom renderers.
---

# Cut draw calls

Measure first with `app.stats.drawCallCount` or `MiniStats`; the per-pass `app.stats.drawCalls`
breakdown fills only in profiler builds. Also halve the pixel ratio and call `app.resizeCanvas()`:
if frame time drops, the cost is fill rate, not draw calls. Stop at the first rung that meets the
budget and report before-and-after counts.

## 1. Stop drawing hidden things

An element at opacity 0 still draws. Set `enabled = false`.

## 2. BatchManager

Call `app.batcher.addGroup(name, dynamic, maxAabbSize)`, then set `batchGroupId` on render, sprite,
or element components. Use `dynamic: false` for geometry that never moves. Members join when
enabled in the live tree, in any order, and groups regenerate automatically when membership
changes. Call `markGroupDirty(id)` only after moving members of a static group. Manual `AppOptions`
bootstraps must set `batchManager`.

## 3. Hardware instancing

Use this for many copies of one mesh and material with per-frame transforms. Build a buffer with
`VertexFormat.getDefaultInstancingFormat(device)`, one mat4 per instance, and call
`meshInstance.setInstancing(vb)`; `instancingCount` follows the buffer.

There is no per-instance culling. By default the group always draws; `setInstancing(vb, true)`
culls it as one unit against a `RenderComponent#customAabb` covering every instance. Split large
instance sets into spatial chunks. Custom vertex chunks need the `INSTANCING` path
(`override-shader-chunks`). Start from the `graphics/instancing-basic` and
`graphics/instancing-custom` examples.

Confirm the image is unchanged with `verify-pixels`.
