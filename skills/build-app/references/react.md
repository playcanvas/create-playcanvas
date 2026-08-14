# React applications

Let React own application, asset, entity, and component lifecycles. Use `<Application>`, `<Entity>`,
exports from `@playcanvas/react/components`, and installed asset hooks instead of creating matching
Engine objects manually.

Respect the subpath split, which is the most common import error: `Application`, `Entity`, and
`Container` come from the package root, components from `@playcanvas/react/components`, and hooks
from `@playcanvas/react/hooks`. The package is ESM only.

Keep hooks unconditional and asset URLs stable. Mount and unmount JSX to create and destroy the
owned Engine hierarchy; do not manually destroy entities created by React. Clean up imperative
resources in the effect that created them.

Use `useApp()` or refs only when no declarative component covers the Engine API. Put per-frame work
in an Engine `Script` or `useAppEvent('update', cb)` instead of React state. Keep `Script` classes at
module scope so renders do not create new constructor identities.

Verify components, hooks, props, and required peer dependencies against the installed
`@playcanvas/react` declarations before using them.
