# Web Components projects

`<pc-model>` already covers the simplest case without any script: when the loaded container has
animations it adds an `anim` component and assigns `animations[0]` under the state name `animation`.
It always takes the first clip and has no attribute for choosing another.

There is no animation component beyond that. Put explicit clip selection, multiple clips, state
graphs, and retargeting in a module-scoped Engine `Script`, load it with `<pc-asset>`, and attach it
to the same `<pc-entity>` hierarchy as the rendered model using `<pc-scripts>` and `<pc-script>`.

Pass clip names and simple configuration as `<pc-script>` attributes. Use its `attributes` JSON
attribute for nested state-graph configuration. Keep scale on a visual child `<pc-entity>`, not on
skinned bones, and confirm playback after `pc-app` is ready.
