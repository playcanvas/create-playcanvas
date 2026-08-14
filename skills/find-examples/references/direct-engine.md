# Direct Engine projects

Keep the project application's existing graphics-device, application, component-system, resource
handler, resize, and teardown setup. Do not copy the example bootstrap over it.

Port the useful setup into the existing application function:

- create entities with named imports from `playcanvas`;
- add only the component systems or resource handlers the feature requires;
- register loaded assets with the existing asset registry;
- attach per-frame work to the application update event or an Engine `Script`;
- unregister external events when the application or owning entity is destroyed.

Examples may use `Application`, `AppBase`, or helpers specific to the examples browser. Match the
application class already used by the project.
