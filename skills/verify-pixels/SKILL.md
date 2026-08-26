---
name: verify-pixels
description: Use when changing PlayCanvas rendering code that must not change the rendered image — draw-call optimization, hardware instancing, shader or material refactors, or asset pipeline swaps — to prove the output unchanged before shipping.
---

# Prove pixels unchanged

A rendering change that must not alter the image is not proven by eyeballing a screenshot at one
pose. Build a deterministic capture, compare byte-exact counts across a pose × phase matrix, and
prove the capture harness itself is trustworthy before trusting what it reports about the change.

## Make the frame deterministic

- Drive every animated shader or vertex effect from one app-owned time value, never `Date.now()` or
  `performance.now()` read inside the render path, so a captured phase is exactly reproducible.
- Freeze the clock with `app.timeScale = 0` before capturing; nothing should advance between frames
  you did not explicitly step.
- Step frames explicitly: set `app.autoRender = false` once, then set `app.renderNextFrame = true`
  before each frame you want rendered. The engine renders exactly that frame and clears the flag —
  do not rely on the free-running render loop plus a timed screenshot.
- Read the rendered pixels with `await device.readPixelsAsync(x, y, w, h, pixels)` against the exact
  backbuffer, not a re-encoded screenshot (e.g. `canvas.toDataURL`) that can introduce compression or
  colour-management differences the eye won't catch. In the installed engine this method lives on
  `WebglGraphicsDevice`, not the base `GraphicsDevice` type, so narrow to it (or branch on
  `device.isWebGL2`) before calling; a WebGPU project needs its own equivalent readback. If the
  project already has a screenshot path, hold it to the same rule: fixed size, fixed pose, no lossy
  step before the byte comparison.

## Build a pose × phase matrix

Single-pose, single-frame proof cannot see everything a rendering refactor can break. Choose at
least two representative camera poses — angles that would expose a dropped instance, a wrong batch
bound, or a seam differently — and at least two animation phases, including one mid-animation, not
only frame zero. Capture every pose × phase pair for the build before the change and the build after
it, with the same canvas size, camera, and lighting each time.

## Run a same-build control first

Before trusting any diff between the old and new build, capture the same pose × phase matrix twice
from the *unmodified* build. Two captures of identical, frozen state must be bit-identical. If they
are not, the capture path itself is the source of noise — an unseeded animation, an asset still
loading, a GPU timing race — and must be fixed before it can say anything about the real change.

## Gate and report

Byte-compare each pose × phase pair between the two builds; do not diff by looking. Zero differing
pixels passes outright. Any nonzero diff must be reviewed on-screen, and its cause and extent stated
in the change description — never merged silently. Report the actual count every time, for example
"0 of 65536 pixels differ" or "312 of 65536 pixels differ, confined to the object's silhouette edge".
"Looks the same" or "no visible difference" is not a result.
