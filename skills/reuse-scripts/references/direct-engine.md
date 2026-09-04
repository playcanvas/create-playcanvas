# Direct Engine projects

Import the selected class from its installed module, add a script component to the owning entity,
and attach it with `entity.script.create()`. Preserve an existing script component.

Some production helpers are core Engine exports rather than scripts. Follow the matching example's
construction and teardown contract instead of forcing them through `script.create`.

Keep script constructors at module scope. `create` takes two distinct option keys that are not
interchangeable: `properties` is assigned straight onto the instance, while `attributes` supplies
declared `@attribute` fields. Passing the wrong one silently does nothing.

Prefer mutating an existing grouped property when only a few fields change; preserve other defaults
and follow any update or rebuild contract in the selected source.

If the installed script subpaths have no declarations, declare only the patterns the project uses:

```ts
declare module 'playcanvas/scripts/esm/*.mjs';
declare module 'playcanvas/scripts/esm/*/*.mjs';
```
