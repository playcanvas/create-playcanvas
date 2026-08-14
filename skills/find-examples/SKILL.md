---
name: find-examples
description: Use when implementing an unfamiliar PlayCanvas feature such as animation, particles, shaders, physics, UI, splats, or XR to find the official Engine, React, or Web Components example matching the installed package version and adapt it to the project.
---

# Official examples

Use official examples as version-matched recipes. Engine and Web Components examples are standalone
applications to adapt, not modules to import.

Use the `reuse-scripts` skill instead when the installed Engine ships a production script for the
required behavior.

## Find the matching example

When `node_modules/playcanvas` is a local source checkout or linked build — a symlink, a workspace,
or a path dependency — its `examples/src/examples/**` are already on disk. Read them directly and
skip the GitHub fetch below. A linked engine can sit ahead of any published tag, and a pre-release
version (`-alpha`, `-beta`) may have no matching public tree, so the on-disk source is the ground
truth. Fall back to GitHub only when the examples are absent locally; the published npm package
omits `examples/`.

```sh
ls node_modules/playcanvas/examples/src/examples 2>/dev/null && echo "linked engine: read local examples, skip the fetch"
```

Search the active surface's own catalog first, then the Engine catalog. Engine examples are the
largest set and port to every surface; the per-surface catalogs are smaller but need no translation.

| Surface | Repository | Package | Ref | Example paths |
| --- | --- | --- | --- | --- |
| direct Engine | `playcanvas/engine` | `playcanvas` | `v<version>` | `examples/src/examples/<category>/<name>.example.mjs` |
| Web Components | `playcanvas/web-components` | `@playcanvas/web-components` | `v<version>` | `examples/<name>.html` |
| React | `playcanvas/developer-site` | `@playcanvas/react` | `main` | `docs/user-manual/react/examples/<name>.mdx` |

Resolve the installed version instead of assuming the newest API:

```sh
PKG=playcanvas # or @playcanvas/web-components
TAG="v$(node -p "JSON.parse(require('fs').readFileSync('node_modules/$PKG/package.json')).version")" || exit 1
gh api "repos/playcanvas/engine/git/trees/$TAG?recursive=1" \
  | grep -o '"examples/src/examples/[^"]*\.example\.mjs"'
```

Read the resolved package rather than the dependency list; `playcanvas` is often a transitive
dependency of `@playcanvas/react` or `@playcanvas/web-components`. Stop on a failed read instead of
requesting an invalid tag: an unresolved version produces an empty example list, not an error. When
the package is not below the project root's `node_modules`, run the command from the workspace that
depends on it.

List a different surface by substituting its repository and path pattern, such as
`'"examples/[^"]*\.html"'` for Web Components. Fetch a candidate from the same ref:

```sh
gh api "repos/playcanvas/engine/contents/examples/src/examples/<category>/<name>.example.mjs?ref=$TAG" \
  --jq .content | base64 --decode
```

Use `main` only when the installed version has no tag. It may contain unsupported APIs. Example
asset URLs refer to `examples/assets/`; fetch assets from the same ref or substitute project assets.

The React catalog is documentation rather than a tagged release: it is small, tracks the latest
package, and its snippets are page fragments. Verify every prop and hook it uses against the
installed `@playcanvas/react` declarations, and port an Engine example when no React example covers
the feature.

## Adapt the recipe

Keep component options, scene construction, materials, shaders, assets, and update logic. Drop the
example browser's controls and context imports.

When one example integrates several required systems, reproduce that integration as one baseline
before splitting or customizing it. Copying one script's parameters while omitting its layers,
depth map, camera frame, sky, or assets is not an adaptation of the example.

Read exactly one reference matching the code being edited:
[direct Engine](references/direct-engine.md), [React](references/react.md), or
[Web Components](references/web-components.md). Choose from imports and markup, not installed
dependencies alone.
