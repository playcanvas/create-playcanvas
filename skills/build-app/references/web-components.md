# Web Components applications

Install `playcanvas` and `@playcanvas/web-components`, register the component module, and map both
module specifiers when using import maps. Pin package versions in production CDN URLs; do not use
`@latest`.

```html
<script type="importmap">
    {
        "imports": {
            "playcanvas": "/node_modules/playcanvas/build/playcanvas.mjs",
            "@playcanvas/web-components": "/node_modules/@playcanvas/web-components/dist/pwc.mjs"
        }
    }
</script>
<script type="module" src="/node_modules/@playcanvas/web-components/dist/pwc.mjs"></script>
```

Build supported application structure declaratively:

```html
<pc-app>
    <pc-asset id="ship" src="/models/ship.glb"></pc-asset>
    <pc-scene>
        <pc-entity name="Ship" position="0 0 -4">
            <pc-model asset="ship"></pc-model>
        </pc-entity>
    </pc-scene>
</pc-app>
```

- Put assets directly below `<pc-app>` and component elements directly below their `<pc-entity>`.
- Give every `pc-*` element an explicit closing tag; self-closing syntax is unsupported.
- Write vectors as space-separated numbers, rotations in degrees, and enums by name.
- Treat a present boolean attribute as true unless its value is `false`; remove it to restore the
  Engine default.

Load Engine `Script` modules with `<pc-asset>`, then attach them through `<pc-script>` and
`<pc-script-instance>`. Match the instance element's `name` to the class's static `scriptName`.
Extra kebab-case attributes map to camelCase properties; use the `attributes` JSON attribute for
nested or reserved values.

Use `whenReady` for occasional page-level Engine access:

```js
import { whenReady } from '@playcanvas/web-components';

const { app } = await whenReady('pc-app');
```

Use element properties such as `.app`, `.entity`, `.scene`, and `.component` only when no
declarative element covers the API. Put per-entity and per-frame behavior in an Engine `Script`, not
page glue.

Verify elements and attributes against the installed `@playcanvas/web-components` declarations.
