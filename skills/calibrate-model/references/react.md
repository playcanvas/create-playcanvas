# React projects

Keep semantic transforms on the outer entity and calibration on the rendered child:

```tsx
import { Entity } from '@playcanvas/react';
import { Render } from '@playcanvas/react/components';
import { useModel } from '@playcanvas/react/hooks';

const Model = ({ id, src, heading = 0, position = [0, 0, 0] }) => {
    const { asset, error } = useModel(src);
    const t = ASSET_TUNING[id];
    if (error) throw new Error(error);
    if (!asset) return null;

    return (
        <Entity name={id} position={position} rotation={[0, heading, 0]}>
            <Entity rotation={[0, t.yaw, 0]}>
                <Entity
                    position={[-t.center[0] * t.scale, t.y, -t.center[2] * t.scale]}
                    scale={[t.scale, t.scale, t.scale]}
                >
                    <Render type="asset" asset={asset} />
                </Entity>
            </Entity>
        </Entity>
    );
};
```

Add project-specific prop types without changing the three-level transform structure. Keep hooks
unconditional and asset URLs stable.
