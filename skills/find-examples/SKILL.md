---
name: find-examples
description: Use when implementing a PlayCanvas feature the project does not use yet, to find and adapt the official example matching the installed version.
---

# Official examples

Examples are version-matched recipes to adapt, not modules to import. When the Engine ships a script
for the behaviour, use `reuse-scripts` first.

## Find the example

If `node_modules/playcanvas/examples/src/examples` exists, it is a linked or source checkout: read
it locally. The npm package omits `examples/`, so otherwise fetch from the installed tag:

```sh
TAG="v$(node -p "JSON.parse(require('fs').readFileSync('node_modules/playcanvas/package.json')).version")" || exit 1
gh api "repos/playcanvas/engine/git/trees/$TAG?recursive=1" | grep -o '"examples/src/examples/[^"]*\.example\.mjs"'
gh api "repos/playcanvas/engine/contents/examples/src/examples/<category>/<name>.example.mjs?ref=$TAG" \
  --jq .content | base64 --decode
```

Read the resolved package, not the dependency list; `playcanvas` is often transitive. An empty list
means an invalid tag: stop rather than guess. Use `main` only when the version has no tag.

| Surface | Repository | Ref | Example paths |
| --- | --- | --- | --- |
| direct Engine | `playcanvas/engine` | `v<version>` | `examples/src/examples/<category>/<name>.example.mjs` |
| Web Components | `playcanvas/web-components` | `v<version>` | `examples/<name>.html` |
| React | `playcanvas/developer-site` | `main` | `docs/user-manual/react/examples/<name>.mdx` |

Search the surface's catalog first, then the Engine's. React pages track the latest package; verify
each prop against the installed declarations. Fetch example assets, including the Draco, Basis, and
Ammo decoders under `examples/assets/wasm`, from the same ref.

## Adapt it

Keep component options, scene setup, materials, shaders, assets, and update logic; drop the example
browser's controls and imports. When one example joins several systems, such as layers, depth,
camera frame, and sky, get that baseline rendering before customizing it.

Read only the reference matching the code: [direct Engine](references/direct-engine.md),
[React](references/react.md), or [Web Components](references/web-components.md).
