---
name: manage-game-state
description: Use when structuring a PlayCanvas game's control flow — a small state machine such as ready, playing, paused, and over, pointer-lock capture, pausing on focus or pointer-lock loss, a full reset, and a stable clock and timestep — so the loop stays deterministic and recoverable.
---

# Game state and loop

Model the game as a small explicit state machine with one owner of the clock. Every transition names
its states; behaviour, input, and the interface read the current state rather than a scatter of
booleans.

## States and transitions

- Enumerate the states — for example ready, playing, paused, over — and make transitions explicit
  and total. Do not infer state from side effects.
- Gate the simulation on the active state: advance gameplay, timers, and physics only while playing.

## Capture input and pause

- Request pointer lock from a user gesture such as a click, never on load. Treat loss of pointer lock
  and tab blur as a pause: freeze the simulation and the clock, and resume on the next gesture.
- Make `pointerlockchange` idempotent: when `document.pointerLockElement` is the canvas, transition
  ready or paused to playing and leave playing unchanged; only transition playing to paused when the
  element is no longer the canvas. Never implement it as a toggle. Browsers and automation can both
  report an already-acquired lock, and a duplicate enter event must not pause the game.
- Clamp the per-frame delta before integrating anything, as `build-app` requires, so a backgrounded
  tab or a slow frame cannot inject one large step into movement, cooldowns, or the clock.

## Reset

- A reset restores every owned system to its ready values — entities, camera, clock, timers,
  cooldowns, effects, and overlays — not only the player. Route reset through the same setup the
  initial state uses, so ready and reset cannot drift apart.
- Transition to `ready` explicitly before releasing pointer lock. Never derive the reset state from
  `document.pointerLockElement`; pointer lock is an input side effect, not the state machine.
- Define timer semantics once and keep them literal in state and snapshots. A field named `reload`
  is remaining cooldown time: `0` means ready, firing assigns a positive duration, and the active
  loop counts it down to exactly `0`. Do not expose a normalized readiness value under that name.

## Prove the loop

Drive the full cycle with real input: enter play, lose pointer lock and confirm the clock and
simulation freeze, resume, reset and confirm every field returns to its ready value, then reach the
end state and restart. Read these from the app's own state snapshot, never from console mutation —
manufactured state is not evidence.

Choose the authoring surface with the `build-app` skill and own the loop and lifecycle in the surface
that creates the application.
