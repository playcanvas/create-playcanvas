---
name: apply-conventions
description: Use when writing PlayCanvas Engine code touching transforms, cameras, lights, materials, meshes, bounds, or imports, to apply Engine conventions and avoid legacy APIs.
---

# Engine conventions

Check version-sensitive APIs against installed `playcanvas` declarations.

## Coordinates

- Right-handed, +Y up, metres. `entity.forward`, cameras, and `lookAt` use -Z.
- Directional and spot lights shine along local -Y, straight down by default. Aim them with
  `setEulerAngles`, not `lookAt`.
- glTF models usually face +Z; record per-model yaw with `calibrate-model`.
- Angle APIs take degrees in XYZ order. Keep pitch, yaw, and roll as app state; never feed
  `getEulerAngles()` back into `setEulerAngles()`. Interpolate with `math.lerpAngle` or
  `Quat.slerp`.
- Use world setters on semantic roots and `setLocal*` below a parent. Never scale rigid-body roots
  or skinned bones.

## Current APIs

- `render` and `anim` components, not `model` and `animation`.
- ESM `class X extends Script` with `static scriptName`, not `createScript`.
- `Mesh.fromGeometry(device, new BoxGeometry())`, not `createBox` and the other `create*` helpers.
- Named imports from `playcanvas`; shipped scripts only from `playcanvas/scripts/esm/**`.

## Cameras

- FOV is vertical, 45° by default. Check shipped camera scripts before writing controls
  (`reuse-scripts`).

## Materials and bounds

- `StandardMaterial.useMetalness` defaults to `false`; enable it before using `metalness`.
- Call `material.update()` after property edits. Per-mesh values use `meshInstance.setParameter()`
  with no update or clone.
- Clone shared materials, including imported ones, before editing them for some meshes.
- `setParameter` uploads raw values; convert sRGB colours with `Color#linear()`.
- Back faces cull by default; counter-clockwise winding is the front face.
- Entities have no `aabb`; union descendant `meshInstance.aabb`. If `mesh.update()` skips bounds,
  set `mesh.aabb` yourself, and expand it by any vertex-shader displacement.

## Verify in the running app

Offline values cannot prove facing, poses, or placement. Read values from the running app with
`inspect-runtime`, and judge visuals only from screenshots you have inspected. A saved file path is
not evidence.
