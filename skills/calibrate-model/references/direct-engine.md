# Direct Engine projects

Return a calibrated pivot whose parent can be placed without knowing how the asset was authored:

```ts
import { Entity } from 'playcanvas';

const instance = (name: keyof typeof ASSET_TUNING) => {
    const t = ASSET_TUNING[name];
    const model = containers[name].resource.instantiateRenderEntity({
        castShadows: true
    });
    model.setLocalScale(t.scale, t.scale, t.scale);
    model.setLocalPosition(0, t.y, 0);
    model.setLocalEulerAngles(0, t.yaw, 0);
    const root = new Entity(name);
    root.addChild(model);
    return root;
};
```

Only position and rotate the returned root. Keep the calibration inside `instance()`.
