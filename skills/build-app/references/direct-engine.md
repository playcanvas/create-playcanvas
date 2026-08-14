# Direct Engine applications

Keep the project's existing `Application` or `AppBase` bootstrap, graphics-device setup, component
systems, resource handlers, resize behavior, and teardown. Do not introduce a wrapper lifecycle
around an established direct Engine application.

Use named imports from `playcanvas`. Let the application own the root hierarchy, asset registry,
update loop, canvas resizing, and destruction. Register loaded assets before attaching them to
components, and unregister external events when their owning entity or application is destroyed.

Put reusable per-entity behavior in an Engine `Script`. Use application update events for small
application-level loops, and remove each callback during teardown.
