# Web Components projects

Expose the selected script as an ES module and register its URL with a `pc-asset` directly under
`pc-app`. Attach a `pc-script` to the owning `pc-entity`, with a `pc-script-instance` for the class.

The `name` must equal the class's static `scriptName`. Extra kebab-case attributes map to camelCase
script properties. Use the `attributes` JSON attribute for nested or reserved properties; it
recursively merges partial grouped objects into the script's defaults. Arrays are not merged element
by element, so an array in the JSON replaces the script's default array whole, and a kebab-case
attribute always wins over the same key inside the JSON.

Use `asset:`, `entity:`, `vec2:`, `vec3:`, `vec4:`, or `color:` prefixes where a property needs a
typed reference. Verify the selected script's export, property names, and defaults against the
installed Engine file.
