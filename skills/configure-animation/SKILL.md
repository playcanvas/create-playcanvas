---
name: configure-animation
description: Use before playing, blending, or retargeting GLB animation clips in PlayCanvas Engine, React, or Web Components to inspect clip and joint names, attach animation to the rendered hierarchy, keep blend inputs valid, and diagnose T-pose, frozen playback, or binding failures.
---

# Animation setup

Use the `inspect-glb` skill first. Never guess clip or joint names.

## Choose the smallest playback model

- Use the selected authoring surface's simple playback path for a single clip.
- Use an `AnimStateGraph` for locomotion blending, transitions, or event-driven actions.
- Adapt the official animation examples with the `find-examples` skill instead of writing a state
  graph from memory.

## Keep blend inputs valid

Clamp every 1D blend parameter to the first and last child points before updating it. PlayCanvas
does not clamp values outside that span: every child can receive zero weight and synchronized clips
can receive non-finite speeds, freezing the pose. Exercise the first, interior, and last blend
points with real gameplay input.

## Retarget only compatible rigs

For each source `animationTargets` entry, remove its final `.translation`, `.rotation`, `.scale`, or
`.weights` suffix and match the remaining path against the destination's `nodePaths`. The top-level
model root may differ; the remaining parent chain must match. Equal joint counts or similar bone
names are insufficient. Confirm the result in the running app as the `apply-conventions` skill
describes; frozen, partial, or exploded motion means the rigs are incompatible.

## Prove playback

An assigned clip, active state, or advancing state time does not prove that the skeleton is moving.
For clips expected to move, sample the local position or rotation of two non-root joints over
several rendered frames. Require a finite animation speed, active-state time, and progress, and
confirm pose changes at idle and at both ends of each blend tree. Zero joint motion indicates a
binding, playback, or blend-weight failure even when reported state names look correct.

## Diagnose failures

- A T-pose usually means no clip was assigned, target paths differ, or animation is attached outside
  the rendered hierarchy.
- Put scale on a model wrapper, not skinned bones.
- Match playback rate to real movement speed when visible foot sliding matters.

Read exactly one reference matching the code being edited:
[direct Engine](references/direct-engine.md), [React](references/react.md), or
[Web Components](references/web-components.md). Choose from imports and markup, not installed
dependencies alone.
