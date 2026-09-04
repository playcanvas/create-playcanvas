---
name: apply-conventions
description: Use when writing or reviewing PlayCanvas Engine code involving entity transforms, cameras, physics, materials, model orientation, bounds, or imports to apply the Engine's coordinate and API conventions.
---

# Engine conventions

Read `package.json` and the installed `playcanvas` source before relying on version-sensitive API
details. Apply these stable conventions throughout the project.

## Coordinates and angles

- Use the right-handed coordinate system: +Y is up and the gameplay ground plane is XZ.
- Treat `entity.forward` and the camera viewing direction as -Z; `entity.right` is +X and
  `entity.up` is +Y. `lookAt` points -Z at the target.
- Expect glTF models authored toward +Z to need a yaw correction. Inspect and calibrate each
  directional model instead of applying one global correction.
- Pass degrees in XYZ order to high-level angle APIs.
- Keep pitch, yaw, and roll as application state. Do not repeatedly read `getEulerAngles()` and
  feed its decomposition back into `setEulerAngles()`.
- Interpolate periodic angles with `math.lerpAngle()` or rotations with `Quat.slerp()`, not scalar
  lerp across the 0/360 seam.

## Transforms and units

- Use `setPosition`, `setRotation`, and `setEulerAngles` for world transforms.
- Use the `setLocal*` variants below a parent.
- Treat units as metres. Physics gravity defaults to `(0, -9.81, 0)`.
- Keep gameplay transforms on a semantic root and asset-authoring corrections on a child.
- Do not scale rigid-body roots or skinned bones.

## Cameras, materials, and bounds

- Perspective camera FOV is vertical and defaults to 45 degrees.
- Smooth an orbit camera's focus, yaw, pitch, and distance, then derive its position. Do not
  `Vec3.lerp()` between orbit positions on opposite sides of the focus; the chord crosses the subject.
- Before writing custom camera input, inspect the installed controller script and its matching
  Engine example. Preserve their gesture mapping and damping unless the product explicitly asks
  for different behavior; do not derive signs from memory.
- Define the input contract in screen space, then verify positive and negative movement on both axes
  with real input after a rendered frame. Judge the camera basis or a projected fixed landmark, not
  world-space camera coordinates or internal angle signs; both can approve inverted behavior.
- Materials cull back faces by default; counter-clockwise winding defines the front face.
- Clone and reassign a shared material before editing it for only some meshes, including default
  and asset-imported materials. Per-mesh uniforms use `meshInstance.setParameter()` without cloning.
- `setParameter` uploads raw values; author colours in sRGB and convert with `Color#linear()`
  before upload — do not hand-roll gamma.
- Entities do not have an `aabb`. Union descendant `meshInstance.aabb` values after transforms have
  synchronized.
- Let `Mesh.update()` calculate local bounds. If passing `false` for `updateBoundingBox`, assign an
  explicit `mesh.aabb` before the mesh can be culled.
- Expand custom-mesh bounds by the maximum vertex-shader displacement; CPU bounds do not observe
  shader deformation.
- Treat offline skinned-mesh bounds as bind-pose estimates and confirm animated poses at runtime.

## Imports

Use named ESM imports from `playcanvas`. Import production scripts only from
`playcanvas/scripts/esm/**`; legacy sibling script directories depend on a global Engine namespace.

## Runtime confirmation

Offline measurements cannot prove facing, animated poses, or final placement. Confirm each one in the
running application:

- Start the project's own dev server or build; do not construct a separate harness.
- Log the value from inside the Engine, using `getPosition()`, `getEulerAngles()`, a
  `meshInstance.aabb`, or an anim component's active state, from a `Script` or an update callback.
- For large or vertex-displaced meshes, inspect their runtime AABB and `visibleThisFrame` after a
  rendered frame from at least two representative camera angles.
- Confirm a directional model's visible front aligns with its semantic root's `forward`; a stored
  yaw or runtime transform alone cannot prove mesh facing.
- Read that logged value from the browser console. Screenshots judge composition and orientation;
  numeric claims require logged values.
- Record the confirmed value in application state or an asset tuning record, then remove the logging.
