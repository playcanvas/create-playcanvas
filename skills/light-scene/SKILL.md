---
name: light-scene
description: Use when a PlayCanvas scene must read as a deliberate cinematic image rather than a flat asset preview, to set key and ambient lighting, sky and image-based lighting, shadows, tone mapping and exposure, and a restrained post-process grade of bloom, fog, and colour.
---

# Cinematic rendering

A polished frame is lit and graded, not just populated. Treat lighting, sky, shadows, tone mapping,
and post as one pass over the assembled scene, and tune every value against a real screenshot rather
than from memory.

Prefer shipped building blocks over hand-written shaders and passes. Discover them with the
`reuse-scripts` skill and adapt the closest official example with `find-examples`:

- the core `CameraFrame` helper for tone mapping, ambient occlusion, bloom, vignette, and grade;
- a procedural sky and image-based light for ambient colour and reflections;
- a shadow catcher for grounding subjects that have no lit floor.

For an outdoor scene with water, stop before authoring the scene and read both `reuse-scripts` and
`find-examples`. Use `graphics/water.example.mjs` as the initial composition recipe: it already
joins the production `Water` script, sky, sun, `CameraFrame`, water layer, scene depth, and
reflection pipeline. Get that complete frame rendering before replacing its assets or tuning its
look. A custom normal-mapped material, tessellated plane, or reflection-coloured mesh is not the
baseline and does not substitute for `Water` when the brief asks for reflective water.

Keep the two named production integrations visible in the implementation:

- import and create `Water` from `playcanvas/scripts/esm/water.mjs` on the water entity, preserving
  the example's required render component, camera reference, water layer, depth map, and textures;
- construct `CameraFrame` from `playcanvas` for the gameplay camera, set a deliberate tone map and
  restrained grade, call `update()`, and destroy it with the application.

Do not continue to cosmetic tuning while either integration is missing or diagnostics report a
shader, texture, or framebuffer error.

## Light and expose

- Establish one dominant key light with a clear direction and warm or cool intent, then add soft
  fill or ambient so shadows are not crushed to black. A single flat ambient with no key reads as an
  asset gallery.
- Choose a physically based tone mapping and a deliberate exposure, then balance light intensities to
  that exposure, not the reverse.
- Drive ambient and reflections from the sky or an environment map, not a constant colour, so
  materials pick up their surroundings.
- Tune the HDR stack in isolation before styling it. Begin with neutral tone mapping, scene exposure
  `1`, procedural-sky luminance near its official-example value, bloom off, grading neutral, fog off,
  and reflection/specular strengths at their defaults. Capture a screenshot, then change one class of
  value at a time. Do not simultaneously raise key intensity, sky luminance, exposure, reflection,
  saturation, fog brightness, and bloom.
- Treat linked procedural skies as the owner of the sun light's direction, colour, and intensity.
  Set the light's base intensity before assigning it to the sky and tune the sky elevation/azimuth;
  do not also hand-author the light transform or colour as though they remained independent.
- Preserve the source assets' albedo colours. If diffuse texture colours collapse toward white or a
  single warm tint, reduce the HDR stack before compensating with darker material colours.

## Shadow and ground

- Enable shadows on the key light and size the shadow area and resolution to the framed subject, not
  the whole world. Soften the penumbra rather than only raising resolution.
- Ground subjects with a contact or catcher shadow when the surface beneath them is not itself lit.

## Grade with restraint

- Bloom, fog, vignette, and colour grade unify a frame; overdone bloom and heavy fog destroy
  silhouette and depth. Start subtle and increase only against the screenshot. `CameraFrame` bloom
  intensity is documented for the `0` to `0.1` range; stay inside it.
- Match fog colour and density to the sky so the horizon stays coherent.
- Preserve surface detail through the brightest reflection path. If glare clips a large part of the
  frame to white or a reflection becomes an opaque black blob, rebalance exposure, light intensity,
  reflection strength, and shadow bias before adding more post-processing.
- Compare both the brightest surface and the shadow-facing side of the hero subject in the same
  screenshot. Reject the grade if either broad highlight clipping or crushed-black silhouette hides
  texture detail. A mechanically valid frame is not visually complete while either failure remains.

## Prove the look

Tune against pixels, not numbers. Capture the intended framing with an image-returning browser
screenshot tool and inspect the returned image, as `apply-conventions` and the local agent guide
require; a saved filepath is not evidence. Confirm the subject is exposed and readable, shadows are
present but not crushed, and the grade is restrained, from the real gameplay camera at the target
resolution. Confirm the post-process camera keeps rendering as it orbits and pitches.

Choose the authoring surface with the `build-app` skill and set lights, camera, and scene settings
through its own primitives before reaching into the Engine.
