---
name: calibrate-model
description: Use before repeatedly placing GLB models in PlayCanvas Engine, React, or Web Components to measure each asset once and record its uniform scale, grounding offset, and yaw correction in a stable nested transform.
---

# Model calibration

Use the `inspect-glb` skill to measure every unique GLB before mass placement. Rely on `dims` and
`groundOffset` for contact-accurate placement only when it reports `boundsSource: vertices`. Store
one tuning record per asset:

```ts
const ASSET_TUNING = {
    model: {
        boundsSource: 'vertices',
        aabb: { min: [-4, -1, -9], max: [4, 6, 9] },
        dims: [8, 7, 18],
        center: [0, 2.5, 0],
        groundOffset: 1,
        intended: { dimension: 'length', size: 18 },
        scale: 0.9,
        y: 0.9,
        yaw: 180
    }
} as const;
```

## Calculate the record

1. Pick and record the intended dimension and size: character height, building footprint, or
   vehicle length. Base it on world units or an already calibrated reference model.
2. Calculate `scale = intendedSize / measuredDimension`.
3. For a floor-resting model, calculate `y = groundOffset * scale`. Record a deliberate offset for
   waterlines, embedded objects, or airborne models.
4. Confirm directional facing once in the running app, as the `apply-conventions` skill describes.
   PlayCanvas entities face -Z while glTF convention is +Z, but asset packs vary.
5. Retain `boundsSource`, `aabb`, `dims`, `center`, `groundOffset`, and the intended size with
   `{ scale, y, yaw }`. Use the scaled footprint and centre for initial spacing; do not re-derive or
   add per-instance nudges.

Keep gameplay position and heading on an outer semantic root, and seat the model on one predictable
reference point beneath it so a root position means the same thing for every asset: by default the
footprint centre over the base. Apply the authored yaw on a wrapper, then the scale and the full
offset on the render child inside it, so an off-centre pivot is compensated in the authored frame and
never re-rotated by the yaw or by gameplay heading:

```ts
const yaw = new Entity('yaw');
yaw.setLocalEulerAngles(0, t.yaw, 0);
const visual = instantiate(asset);
visual.setLocalScale(t.scale, t.scale, t.scale);
visual.setLocalPosition(-t.center[0] * t.scale, t.y, -t.center[2] * t.scale);
yaw.addChild(visual);
root.addChild(yaw);
```

Keep `y` as the local correction that brings the measured minimum to the root plane; the X and Z
terms bring the footprint centre onto the root axis. Place that root at a measured support point. A support name or global AABB maximum is not
a surface measurement. Use an authored mount point or runtime support query for curved or stepped
geometry. Treat skinned bounds as bind-pose estimates and confirm foot contact in the active poses.

Read exactly one reference matching the code being edited:
[direct Engine](references/direct-engine.md), [React](references/react.md), or
[Web Components](references/web-components.md). Choose from imports and markup, not installed
dependencies alone.
