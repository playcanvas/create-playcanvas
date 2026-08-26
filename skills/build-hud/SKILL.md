---
name: build-hud
description: Use when building a PlayCanvas game's on-screen interface such as ready, pause, and victory overlays, menus, and live indicators like gauges, timers, or reload meters, so the interface is driven by game state, readable over the scene, and separate from the 3D hierarchy.
---

# Game interface

A HUD is a view of game state, not a source of it. Render it from the current state each frame or on
each transition; never store gameplay truth in the DOM or a UI element.

## Choose the UI layer

- Build the interface in the natural UI layer for the surface — a DOM or React overlay, or the
  Engine `screen` and `element` UI — decided with the `build-app` skill. Keep it outside gameplay
  model hierarchies, as `assemble-scene` requires.
- For a screen-space Engine UI, adapt a user-interface example with `find-examples` rather than
  guessing element anchoring, scaling, and font handling.

## Drive from state

- Map each overlay to a game state and each indicator to a snapshot field. A transition shows or
  hides overlays; it does not duplicate the state the game already owns (see `manage-game-state`).
- An indicator that is idle most of the time toggles `enabled` with its visibility; an element left
  drawing at opacity 0 still costs a draw call every frame (see `reduce-draw-calls`).
- Anchor and scale elements to the viewport so the layout holds at the target resolution and on
  resize. Verify at the acceptance resolution, not the default window size.
- Keep copy minimal and legible over the scene: back text with a plate or shadow where the frame is
  bright, and unify interface colour with the scene's grade from `light-scene`.

## Prove it reflects state

Drive real input through every transition and confirm with screenshots that the correct overlay
shows and each indicator tracks the snapshot — a reload meter empties and refills, a timer advances,
a menu appears only in its state. A saved filepath or a visibility flag is not visual evidence;
inspect the returned pixels as the local agent guide requires.

Choose the authoring surface with the `build-app` skill and build the interface through its own UI
primitives before reaching into the Engine.
