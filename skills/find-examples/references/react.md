# React projects

Drop graphics-device, application, component-system, and resource-handler setup because
`<Application>` owns it.

- Express entities and components with `<Entity>` and exports from `@playcanvas/react/components`.
- Load assets with hooks such as `useModel`, `useTexture`, and `useEnvAtlas` when available in the
  installed package.
- Attach Engine `Script` subclasses with React's `<Script script={Type} />`.
- Put frame callbacks in a `Script` or `useAppEvent('update', cb)` instead of updating React state
  every frame.
- Use `useApp()` only when no declarative component covers the Engine API. Clean up resources in the
  effect that created them.
- Keep hooks unconditional and asset URLs stable.

Verify component and hook names against the installed `@playcanvas/react` declarations before
translating the example.
