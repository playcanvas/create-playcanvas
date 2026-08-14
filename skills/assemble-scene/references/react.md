# React projects

Represent the complete gameplay object as one component:

```tsx
import { Entity } from '@playcanvas/react';
import { Collision, RigidBody } from '@playcanvas/react/components';

// Model is the project's calibrated component from calibrate-model, not a library export
const Enemy = ({ id, position, heading }) => (
    <Entity name={`Enemy_${id}`} position={position} rotation={[0, heading, 0]}>
        <RigidBody type="dynamic" mass={1} />
        <Collision type="capsule" />
        <Model id="enemy" src="/models/Enemy.glb" />
    </Entity>
);
```

Use stable React keys when mapping repeated objects. Mount and unmount the component root to own the
whole Engine hierarchy; do not manually destroy entities created by JSX.

Before using physics, set `usePhysics` on `<Application>` and install the `sync-ammo` peer
dependency. Missing either one leaves `RigidBody` and `Collision` inert with only a console warning,
so confirm bodies actually move rather than assuming the markup took effect.
