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
            <Entity position={[0, t.y, 0]} rotation={[0, t.yaw, 0]} scale={[t.scale, t.scale, t.scale]}>
                <Render type="asset" asset={asset} />
            </Entity>
        </Entity>
    );
};
```

Add project-specific prop types without changing the two-level transform structure. Keep hooks
unconditional and asset URLs stable.
