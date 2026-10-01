---
name: configure-animation
description: Use before playing, blending, or retargeting GLB animation clips in PlayCanvas, or when diagnosing T-pose, frozen playback, or binding failures.
---

# Animation setup

Get clip and joint names from `inspect-glb`; never guess them.

- For one clip, use the surface's simple playback path. For blending, transitions, or events, adapt
  an `AnimStateGraph` from an official animation example with `find-examples`.
- Put the `anim` component on or above the rendered skinned hierarchy, not on a separate pivot.
- Clamp every 1D blend parameter to its first and last child points. The Engine does not; values
  outside the span zero every weight and can make synced speeds non-finite, freezing the pose.
- Retarget only when each source `animationTargets` path, minus its `.translation`, `.rotation`,
  `.scale`, or `.weights` suffix, matches a destination `nodePaths` entry below the model root.
  Equal joint counts or similar names are not enough.
- Scale a wrapper, never skinned bones.

## Prove playback

An active state or advancing state time does not prove motion. Sample two non-root joints over
several rendered frames (`inspect-runtime`) at idle and at both ends of each blend tree. Zero joint motion means a
binding, playback, or blend-weight failure.

## Diagnose

- T-pose: no clip assigned, target paths differ, or the anim component sits outside the rendered
  hierarchy.
- Frozen pose: an unclamped blend input or a non-finite speed.
- Partial or exploded motion: incompatible rigs.

Read only the reference matching the code: [direct Engine](references/direct-engine.md),
[React](references/react.md), or [Web Components](references/web-components.md).
