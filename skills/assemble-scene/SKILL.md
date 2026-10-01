---
name: assemble-scene
description: Use when composing PlayCanvas entity hierarchies from models, colliders, rigid bodies, and scripts, so each object has one semantic root and clear lifecycle.
---

# Scene assembly

Each scene object has one named root. Put position, heading, `rigidbody`, `collision`, and
scripts on the root, and the calibrated visual from `calibrate-model` below it. Apply calibration
once; if the tuning record is missing, calibrate first.

- Name roots by role, with predictable names for repeated instances.
- Size colliders from measured bounds and keep them aligned with render bounds.
- Space roots by the scaled footprint in the tuning record, not by pivot position. A non-90° yaw
  rotates the footprint, so reserve its larger horizontal extent.
- Keep UI, effects, cameras, and lights outside model hierarchies.
- Remove the root through its surface's lifecycle and unregister events it owns.
- Rigid bodies need Ammo loaded first (`build-app`).

## Check placement

After a rendered frame, measure each support or attachment at the object's actual position, using
a mount point, raycast, or geometry sample read through `inspect-runtime`. A positive gap floats; a negative gap penetrates.
Overlapping world AABBs between unrelated roots are a failure unless two different views prove the
overlap is empty space.

Read only the reference matching the code: [direct Engine](references/direct-engine.md),
[React](references/react.md), or [Web Components](references/web-components.md).
