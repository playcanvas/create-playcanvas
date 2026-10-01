---
name: override-shader-chunks
description: Use when a PlayCanvas StandardMaterial needs custom shading its properties cannot express, such as stylized looks or vertex displacement, before writing a ShaderMaterial.
---

# Override shader chunks

Overriding a `StandardMaterial` chunk keeps fog, tone mapping, shadows, skinning, and instancing
intact. Use a `ShaderMaterial` only when the look needs its own vertex and fragment pair.

- Set `material.shaderChunksVersion` to the installed major.minor, such as `'2.23'`. Chunk names
  and contracts change between versions, so read the installed chunk source, not memory.
- Set chunks with `material.getShaderChunks(SHADERLANGUAGE_GLSL).set(name, source)` and the WGSL
  equivalent, then call `material.update()`. For every material on a device, use
  `ShaderChunks.get(device, language)`; the global `shaderChunks` object is deprecated.
- Supply both GLSL and WGSL. On WebGPU, one GLSL-only chunk sends the whole shader through a
  transpiler that is usually not loaded, so it fails to compile. Otherwise pin the device to WebGL.
- Clone shared materials, including imported ones, before overriding them for only some meshes.
  Per-mesh uniforms use `meshInstance.setParameter()`.
- Uniforms are raw; convert sRGB colours with `Color#linear()`.
- Vertex chunks that read the model matrix, such as `transformCoreVS`, must keep the `INSTANCING`
  path with a `matrix_model` fallback, like the stock chunk.
- Expand mesh bounds by the maximum displacement; CPU bounds do not see shader deformation.
- For an emissive-only look, implement `getEmission()` writing `dEmission`, zero `diffuse` and
  `specular`, and disable `useSkybox`.
