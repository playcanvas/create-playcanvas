# Ammo.js

These files are copied from `playcanvas/engine` tag `v2.21.4` (commit
`e287e0c67f3c20c689a52b7c53d2b7fedbe887da`) at
`examples/assets/wasm/ammo/`.

They are a WebAssembly build of [ammo.js](https://github.com/kripken/ammo.js),
distributed under the zlib license in `LICENSE`.

The asm.js fallback in that folder, `ammo.js`, is left out, so the starters
configure no fallback: every browser that runs them supports WebAssembly, and
Vite would copy the 2 MB file into every physics project's build.

## SHA-256

```text
5645b5a0c4f03be9d9d1ae604ffacd5e5e525310cfd1d0ed27474cdd1f34aab0  ammo.wasm.js
a61b504d4a6ce6bb93bd843e0f61edb8115e7317f1b3462247031a83ddb25d09  ammo.wasm.wasm
```
