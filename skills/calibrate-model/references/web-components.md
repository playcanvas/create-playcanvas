# Web Components projects

Keep gameplay placement on the outer entity and calibration on a visual child:

```html
<pc-app>
    <pc-asset id="ship" src="/models/ship.glb"></pc-asset>
    <pc-scene>
        <pc-entity name="Ship" position="12 0 -4" rotation="0 90 0">
            <pc-entity position="0 1.2 0" rotation="0 180 0" scale="0.9 0.9 0.9">
                <pc-model asset="ship"></pc-model>
            </pc-entity>
        </pc-entity>
    </pc-scene>
</pc-app>
```

Generate repeated markup from one `{ scale, y, yaw }` record per asset. Keep all vector attributes
space-separated and use degrees for rotations.
