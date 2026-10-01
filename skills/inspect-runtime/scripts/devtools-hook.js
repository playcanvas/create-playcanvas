// Records every PlayCanvas app (Engine 2.23+) in globalThis.__playcanvasApps, a Map from app to
// { version, revision, protocol }. Run it before any page script; apps created earlier are missed.
// Plain script with no imports or exports, so it runs as an init script, a <script>, or an import.
{
    const key = Symbol.for('playcanvas.inspector');
    const prev = globalThis[key];
    const apps = (globalThis.__playcanvasApps ??= new Map());

    // chain a hook defined earlier, such as a devtools extension's, and install only once
    if (!prev?.playcanvasApps) {
        globalThis[key] = {
            playcanvasApps: apps,
            register(app, info) {
                apps.set(app, info);
                prev?.register?.(app, info);
            },
            unregister(app) {
                apps.delete(app);
                prev?.unregister?.(app);
            }
        };
    }
}
