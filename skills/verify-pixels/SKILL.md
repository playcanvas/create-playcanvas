---
name: verify-pixels
description: Use when a PlayCanvas rendering change is meant to leave the image unchanged, to prove it with deterministic captures and pixel comparison.
---

# Prove pixels unchanged

## Choose the gate

- Byte-exact: the change keeps the same decoded data and the same shading math, so every pixel
  must match.
- Side-by-side review: the change alters sampled values, random order, precision, or where math
  runs. Report it as "not byte-gateable" and show old and new at each pose; do not invent
  thresholds.

## Make frames deterministic

- Load every asset and match camera, canvas size, lighting, and animation time between builds. Seed
  incidental randomness.
- Drive animated shaders from one app-owned time value, not `Date.now()` or `performance.now()`.
- `app.timeScale = 0` makes `dt` zero, but `update` still runs; anything counting frames or reading
  wall-clock time still advances.
- Set `app.autoRender = false`, then `app.renderNextFrame = true` before each frame to capture.

## Capture and compare

- WebGL: `await (device as WebglGraphicsDevice).readPixelsAsync(x, y, w, h, pixels)`. WebGPU:
  render into a `RenderTarget` and read its `colorBuffer` with `Texture#read()`. Avoid colour
  conversion and lossy encoding.
- Capture the unmodified build twice first. The captures must match exactly, or the harness itself
  is noisy.
- Cover every touched surface in at least two poses, plus a mid-animation phase where relevant.
- Report the count, for example "0 of 65536 pixels differ", or the count and where the differences
  are. "Looks the same" is not a result.

Keep harness code out of the shipped bundle; attach it through `inspect-runtime`.
