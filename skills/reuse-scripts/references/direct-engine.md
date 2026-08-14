# Direct Engine projects

Import the named script class and attach it to the owning entity:

```ts
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

camera.addComponent('script');
const controls = camera.script?.create(CameraControls);
```

Some production helpers are core Engine exports rather than scripts. Follow the matching example's
construction style instead of forcing them through `script.create`:

```ts
import { CameraFrame } from 'playcanvas';

const frame = new CameraFrame(app, camera.camera!);
frame.rendering.sceneDepthMap = true;
frame.update();
```

Keep script constructors at module scope. `create` takes two distinct option keys that are not
interchangeable: `properties` is assigned straight onto the instance, while `attributes` supplies
declared `@attribute` fields. Passing the wrong one silently does nothing.

Prefer mutating an existing grouped property when only a few fields change:

```ts
import { ProceduralSky } from 'playcanvas/scripts/esm/sky/procedural-sky.mjs';

const sky = skyEntity.script?.create(ProceduralSky);
if (sky) sky.sunLight = sun;
```

If the installed script subpaths have no declarations, declare only the patterns the project uses:

```ts
declare module 'playcanvas/scripts/esm/*.mjs';
declare module 'playcanvas/scripts/esm/*/*.mjs';
```
