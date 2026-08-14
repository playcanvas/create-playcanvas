# React projects

Let React own the asset and component lifecycle for simple playback:

```tsx
import { Entity } from '@playcanvas/react';
import { Anim, Render } from '@playcanvas/react/components';
import { useModel } from '@playcanvas/react/hooks';

const Character = () => {
    const { asset, error } = useModel('/models/Character.glb');
    if (error) throw new Error(error);
    if (!asset) return null;

    return (
        <Entity name="Character">
            <Render type="asset" asset={asset} />
            <Anim asset={asset} activate />
        </Entity>
    );
};
```

Use `Anim` only when inspection confirms the asset has one clip. It takes `asset` plus
`AnimComponent` properties such as `speed`, `activate`, `playing`, `stateGraph`, and `targets`, and
it has no way to name a clip. Published React examples show `clip="Walk" loop`; those props do not
exist, so the component drops them with a development warning and plays the assigned track anyway.
Verify props against the installed `@playcanvas/react` declarations rather than an example.

Use a module-scoped Engine `Script` attached with `<Script>` for multiple clips, explicit selection,
state graphs, transitions, or retargeting. Keep per-frame animation state in the Engine component or
script rather than React state.
