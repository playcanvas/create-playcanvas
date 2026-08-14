# React projects

Import the named script class and attach it through React:

```tsx
import { Entity } from '@playcanvas/react';
import { Camera, Script } from '@playcanvas/react/components';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

<Entity name="Camera" position={[4, 1, 4]}>
    <Camera />
    <Script script={CameraControls} />
</Entity>;
```

Keep imported or custom script constructors at module scope. Declaring a class inside a component
creates a new identity on render and can recreate the script.

Props on `<Script>` become script properties. Pass complete grouped properties or use a ref to
mutate the existing group after mount. Verify the current component props in the installed
`@playcanvas/react` declarations.

If the installed Engine script subpaths have no declarations, add:

```ts
declare module 'playcanvas/scripts/esm/*.mjs';
declare module 'playcanvas/scripts/esm/*/*.mjs';
```
