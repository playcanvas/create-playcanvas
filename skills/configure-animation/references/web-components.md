# Web Components projects

Use `<pc-anim>` inside `<pc-model>` to animate the model hierarchy. Without `<pc-anim-clip>`
children, it assigns every animation from the model's container by track name and starts the first
clip. Select and cross-fade declaratively:

```html
<pc-entity>
    <pc-model asset="character">
        <pc-anim clip="Idle" transition-time="0.2"></pc-anim>
    </pc-model>
</pc-entity>
```

Add `<pc-anim-clip name="...">` children to declare a subset, rename states, set per-clip `loop` or
`speed`, or source tracks through an explicit `asset`. Use `<pc-anim>` attributes for `activate`,
`clip`, `speed`, and `transition-time`; its `play`, `pause`, and `transition` methods cover imperative
playback.

Use a module-scoped Engine `Script` only for state graphs, retargeting, or orchestration beyond that
component contract. Keep scale on a visual child `<pc-entity>`, not on skinned bones, and confirm
playback after `pc-app` is ready.
