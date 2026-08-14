# Web Components projects

A `playcanvas/web-components` example needs no translation: it is already a `pc-*` document, so copy
its markup and adjust asset paths and attributes.

Translating an Engine example instead, keep its feature options, assets, materials, shaders, and
update logic. Drop its graphics device and application bootstrap because `<pc-app>` owns them.

- Express supported entities and components with `pc-*` elements.
- Register assets as direct children of `<pc-app>` with `<pc-asset>`.
- Put per-entity behavior in an Engine `Script` loaded through `<pc-asset>` and attached with
  `<pc-scripts>` and `<pc-script>`.
- Use `whenReady` for page-level glue or Engine APIs with no declarative element.
- Fetch example assets from the same Engine tag as the source example.

Verify element and attribute names against the installed `@playcanvas/web-components` package. Do
not translate an unsupported Engine component into a guessed custom element.
