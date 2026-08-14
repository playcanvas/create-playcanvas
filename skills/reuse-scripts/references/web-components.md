# Web Components projects

Expose an Engine script as an ES module and register it as an asset:

```html
<pc-app>
    <pc-asset src="/scripts/camera-controls.mjs"></pc-asset>
    <pc-scene>
        <pc-entity name="Camera">
            <pc-camera></pc-camera>
            <pc-scripts>
                <pc-script name="cameraControls" move-speed="4"></pc-script>
            </pc-scripts>
        </pc-entity>
    </pc-scene>
</pc-app>
```

The `name` must equal the class's static `scriptName`. Extra kebab-case attributes map to camelCase
script properties. Use the `attributes` JSON attribute for nested or reserved properties; it
recursively merges partial grouped objects into the script's defaults. Arrays are not merged element
by element, so an array in the JSON replaces the script's default array whole, and a kebab-case
attribute always wins over the same key inside the JSON.

Use `asset:`, `entity:`, `vec2:`, `vec3:`, `vec4:`, or `color:` prefixes where a property needs a
typed reference. Verify the selected script's export, property names, and defaults against the
installed Engine file.
