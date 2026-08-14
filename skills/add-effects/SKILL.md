---
name: add-effects
description: Use when adding transient visual effects or trails to a PlayCanvas app to select an Engine-native implementation, place and layer it correctly, manage its lifecycle, and verify the rendered result.
---

# Effects and game feel

Add transient effects as short-lived, self-owning entities triggered by application events, not as
permanent scene fixtures.

Reuse before authoring. Adapt the closest official particle example with `find-examples`, prefer the
Engine's built-in particle component over a hand-written system, and discover any shipped trail or
effect script with `reuse-scripts`.

Copy particle curve construction from the installed example exactly. `CurveSet` takes one key array
per channel, such as `new CurveSet([0, x0, 1, x1], [0, y0, 1, y1], [0, z0, 1,
z1])`; do not flatten three channels into one array. A malformed curve can type-check and then fail
inside the particle texture upload. Create one emitter, render a frame, and require empty runtime
and console diagnostics before reusing the helper for smoke, spray, or splashes.

For a polished wake, smoke, or spray requirement, do not stop at scaled planes, crossed billboards,
or generic render primitives. Use the built-in particle component for smoke and spray; reserve a
custom mesh and material for a continuously sampled wake ribbon. Verify tint and blending against
the actual scene lighting and surface.

## Place and layer

- Spawn an effect at the emitter's world mount point, either parent it there or copy the world
  transform once, and let it destroy itself when finished. Never leak emitters.
- Keep additive or transparent effects above the surface they sit on and biased toward the camera so
  they do not z-fight. Inspect soft transparency at grazing angles for hard edges, black quads, or
  dropout.
- Size and orient effects from the emitter's calibrated bounds, not a guessed constant.

## Moving trails

- Treat built-in render primitives as blocking geometry for soft effects. Follow the closest
  official example to choose particles, a custom mesh, textures, materials, and blending for the
  intended visual behavior.
- Match every custom mesh's vertex streams to its material. A lit `StandardMaterial` needs normals;
  calculate and set them before `mesh.update()`, or deliberately use an unlit material. Treat a
  missing vertex-attribute diagnostic as a rendering failure even when some frames still appear.
  For a dynamic horizontal ribbon created with `setVertexStream`, allocate a normal array alongside
  positions, fill every vertex with `(0, 1, 0)`, and upload it as `SEMANTIC_NORMAL` before the first
  `update()`. Recheck this whenever changing the ribbon's material type.
- Never attach an empty dynamic mesh to an enabled render component. Upload a valid initial vertex
  and index set before creating its `MeshInstance`, or keep the render entity disabled until the
  first complete update. On reset, disable it or restore valid seed geometry; do not call
  `mesh.clear()` while an enabled renderer still references it. Reflection and refraction cameras
  render the same mesh and can expose this lifecycle bug before the gameplay camera does.
- Judge a trail from its intended cameras. If it reads as a flat decal, use the reference example to
  add the minimum depth cue needed rather than stacking arbitrary geometry.
- Sample the trail continuously. Append segments on a small time- or distance-step and interpolate
  between them; coarse per-distance chunks make the trail stutter and break into visible dashes as
  the object speeds up.
- Anchor it to the mover's contact or exhaust point, scale emission rate and length with speed, and
  fade the tail so it dissolves instead of cutting off with a hard edge.

## Camera shake and hit feedback

- Drive camera shake as a decaying offset on a camera parent or an additive layer; never write it
  into the smoothed chase position, or it fights the follow. Keep shake and follow separate, as the
  orbit-camera rule in `apply-conventions` requires.
- Stagger the parts of a compound effect over a few frames — flash, then smoke, then splash — so an
  event reads as a sequence rather than a single pop.
- Keep the readable peak long enough for the gameplay camera to see the layers together. A flash can
  be brief, but the longer-lived layers should overlap for several frames rather than leaving the
  primary action frame visually identical to the idle state.
- For side-mounted emitters, derive every spawn point and direction from calibrated world-space
  mounts on the mover. Confirm the effect starts outside the source geometry from both sides; an
  active cooldown with only a tiny flash elsewhere in the frame is failed feedback.

## Prove it fires

Trigger each effect through real gameplay input and confirm with a screenshot captured at its peak,
not a saved filepath. Confirm the effect is visible from the gameplay camera and from a grazing
angle, that emitters are gone after their lifetime (query the entity count), and that nothing leaves
a black quad or a hard edge over the surface.

Choose the authoring surface with the `build-app` skill; create effects through its entity and
component primitives and own their lifecycle in the surface that spawned them.
