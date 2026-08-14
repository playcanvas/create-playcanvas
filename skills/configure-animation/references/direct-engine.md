# Direct Engine projects

Use clips exposed by the loaded container resource and attach animation to the entity owning the
render hierarchy:

```ts
import type { Asset, ContainerResource } from 'playcanvas';

const res = container.resource as ContainerResource;
const entity = res.instantiateRenderEntity();
entity.addComponent('anim', { activate: true });
const clip = (res.animations as Asset[]).find((asset) => asset.name.includes('Idle'));
if (!clip) throw new Error(`no Idle clip; have ${res.animations.map((asset) => asset.name).join(', ')}`);
entity.anim?.assignAnimation('Idle', clip.resource);
```

Fail at the missing clip instead of optional-chaining past it. A silent missing assignment appears
later as a T-pose with little diagnostic context.

Place the anim component on or above the complete skinned render hierarchy before it initializes.
Attaching it to an unrelated pivot does not bind the clip.

Clamp 1D state-graph parameters to their authored child range. For children at `0.5`, `3.5`, and
`8`, do not pass an unclamped movement speed:

```ts
entity.anim?.setFloat('locomotion', Math.max(0.5, Math.min(8, speed)));
```

After assignment, drive the real gameplay inputs through the range and sample expected moving
joints across multiple update frames. Treat non-finite `activeStateCurrentTime`,
`activeStateProgress`, or component speed as a playback failure.
