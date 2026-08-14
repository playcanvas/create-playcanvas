# Direct Engine projects

Create one root and place a previously calibrated model beneath it:

```ts
import { Entity } from 'playcanvas';

const root = new Entity('Enemy_1');
root.addChild(instance('enemy'));
root.setPosition(x, 0, z);
root.setEulerAngles(0, heading, 0);
app.root.addChild(root);
```

Add physics and scripts to `root`, not the calibrated child. Move, rotate, enable, disable, and
destroy the root as one gameplay object.
