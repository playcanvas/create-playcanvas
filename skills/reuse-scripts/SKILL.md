---
name: reuse-scripts
description: Use before implementing non-core PlayCanvas behavior to discover the installed Engine's curated scripts and reuse or adapt those that fit the required behavior and approved art direction.
---

# Engine scripts

Before writing behavior from scratch, inspect the curated scripts shipped with the installed
`playcanvas` package under `scripts/esm/**`. Discover the current set:

```sh
rg 'static scriptName =' node_modules/playcanvas/scripts/esm \
  | sed "s|.*/scripts/esm/||; s|:.*static scriptName = ['\"]|  ->  |; s|['\"].*||" \
  | sort
```

Read the selected file for its named export, `@attribute` properties, and defaults. Not every module
is a `Script`; the parsers below `scripts/esm/parsers` are plain classes registered with a resource
handler instead.

Only import from `scripts/esm/**`. Legacy sibling directories depend on the global Engine namespace.
After selecting a script, use `find-examples` to locate its matching versioned Engine example. When
`node_modules/playcanvas` is a linked or source checkout, its `examples/src/examples/**` are already
on disk; read them there and skip the fetch.

## Check fit before integration

Compare candidates with the required behavior, approved art direction, and runtime constraints.
Reuse a suitable script directly or adapt its configuration and extension points. If none fits,
state the limitation and implement only the missing behavior, preserving reusable parts and their
lifecycle, bounds, and input invariants.

For visual behavior, resolve an unclear art direction with the user before substantial implementation.
Present references, mockups, or inexpensive variants; follow existing approval and confirm significant
departures. A script's default appearance is only a starting point for assessing its fit.

## Adapt the reference integration

Treat the selected script source and its closest official example as complementary references:

1. Read the source for exports, properties, defaults, fallbacks, required components, and lifecycle.
2. Read the example for assets, entity references, mesh requirements, layer ordering, scene settings,
   and render-pipeline setup.
3. Integrate the selected behavior with its required components, assets, and passes. Adapt the look
   to the approved direction and preserve defaults and dependencies that still apply.
4. After a rendered frame, fail on console, shader, or missing-asset diagnostics. Exercise the
   behavior with real input where applicable and inspect returned screenshots from representative
   views at the final backbuffer density.
5. Use the example to check integration correctness and the user's approved direction to judge the
   final look. Report any remaining gap.

If no matching example exists, state that and derive the integration from installed source instead
of inventing it from memory.

## Preserve grouped defaults

Grouped property updates differ by authoring surface. Read the selected reference and preserve
defaults that are not being changed.

Read exactly one reference matching the code being edited:
[direct Engine](references/direct-engine.md), [React](references/react.md), or
[Web Components](references/web-components.md). Choose from imports and markup, not installed
dependencies alone.
