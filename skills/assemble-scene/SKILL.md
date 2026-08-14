---
name: assemble-scene
description: Use when composing PlayCanvas Engine, React, or Web Components gameplay entities, model hierarchies, colliders, or physics objects to create one semantic root per object with calibrated visuals and predictable lifecycle ownership.
---

# Scene assembly

Represent one gameplay object with one named semantic root. Put gameplay position, heading,
rigid-body, collision, and behavior on that root. Put calibrated render transforms below it.

Consume the existing tuning record from `calibrate-model` exactly once. If it is missing, stop and
calibrate the model; do not calculate or adjust asset tuning during assembly.

## Assembly rules

- Name roots by gameplay role and use predictable names for repeated instances.
- Apply model calibration once inside the visual child; never reapply scale, grounding, or authored
  yaw during placement.
- Space neighbouring roots by their scaled footprints and pivot offsets from `calibrate-model`, not
  by pivot position. A non-90° authored yaw rotates a footprint, so reserve its larger horizontal
  extent as a conservative radius.
- Put rigid-body and collision components on the same root. Size colliders from measured bounds.
- Use local transforms below a parent and world transforms only for semantic roots.
- Keep UI, effects, cameras, and lights outside gameplay model hierarchies.
- Remove the root through its authoring surface's lifecycle. Unregister external events it owns.
- Do not scale rigid-body roots or skinned bones.

## Prove placement

Declare intentional support, attachment, or containment relationships between roots. After a
rendered frame, measure each relationship at the supported object's actual position. Use a mount
point, collision ray, or geometry sample; use a support root's AABB maximum only when its top is flat
across the full footprint. Record the signed contact gap: positive means floating and negative means
penetration. A relationship name does not exempt the pair from this check.

Union descendant world `meshInstance.aabb` values for each semantic root and compare unrelated peer
roots. Any intersection with positive depth on X, Y, and Z beyond a small tolerance is an unresolved
placement failure: move the root from its calibrated footprint, or prove the apparent AABB overlap
is empty geometry from at least two materially different views. Never accept one model inside
another from a single screenshot.

Also check expected root counts, component descendants, aligned render and collider bounds, and
role-based names. Compare final dimensions with each calibration record's intended size and reference
object. Inspect composition and facing from images returned into your context by an image-capable
browser tool. A saved screenshot path, screen coordinate, AABB, or visibility flag is not visual
evidence. If you cannot inspect the image, report those claims unverified. Hierarchy and placement
claims require runtime values logged from the application itself, as the `apply-conventions` skill
describes.

Read exactly one reference matching the code being edited:
[direct Engine](references/direct-engine.md), [React](references/react.md), or
[Web Components](references/web-components.md). Choose from imports and markup, not installed
dependencies alone.
