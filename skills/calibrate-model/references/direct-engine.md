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
    model.setLocalPosition(-t.center[0] * t.scale, t.y, -t.center[2] * t.scale);
    const root = new Entity(name);
    const yaw = new Entity(`${name}-yaw`);
    yaw.setLocalEulerAngles(0, t.yaw, 0);
    yaw.addChild(model);
    root.addChild(yaw);
    return root;
};
```

Only position and rotate the returned root. Keep the yaw, scale, and pivot compensation inside
`instance()`.
