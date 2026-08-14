# Web Components projects

Represent the whole gameplay object below one semantic root:

```html
<pc-entity name="Enemy_1" position="4 0 -3" rotation="0 90 0">
    <pc-rigidbody type="dynamic" mass="1"></pc-rigidbody>
    <pc-collision type="capsule"></pc-collision>
    <pc-entity position="0 0.8 0" rotation="0 180 0" scale="0.01 0.01 0.01">
        <pc-model asset="enemy"></pc-model>
    </pc-entity>
</pc-entity>
```

Keep component tags as direct children of the owning `<pc-entity>`. Register the model with a
direct-child `<pc-asset>` under `<pc-app>`. Before using rigid bodies, load Ammo with a direct-child
`<pc-module name="Ammo">` carrying its `glue`, `wasm`, and `fallback` attributes; `<pc-app>` awaits
its direct-child modules before creating the graphics device, so every body in the document depends
on that one element. Add and remove the semantic root as one DOM subtree.
