# Web Components projects

Keep gameplay placement on the outer entity and calibration on a visual child:

```html
<pc-app>
    <pc-asset id="model" src="/models/model.glb"></pc-asset>
    <pc-scene>
        <pc-entity name="Model" position="12 0 -4" rotation="0 90 0">
            <pc-entity rotation="0 180 0">
                <pc-entity position="-0.45 1.2 0.225" scale="0.9 0.9 0.9">
                    <pc-model asset="model"></pc-model>
                </pc-entity>
            </pc-entity>
        </pc-entity>
    </pc-scene>
</pc-app>
```

Generate repeated markup from one `{ scale, y, yaw, center }` record per asset. Calculate the visual
position as `-center.x * scale, y, -center.z * scale`. Keep vector attributes space-separated and use
degrees for rotations.
