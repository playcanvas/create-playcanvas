/// <reference types="vite/client" />

declare module 'playcanvas/scripts/esm/camera-controls.mjs' {
    import type { Script } from 'playcanvas';

    export const CameraControls: typeof Script & (new () => Script);
}

declare module 'playcanvas/scripts/esm/grid.mjs' {
    import type { Script } from 'playcanvas';

    export const Grid: typeof Script & (new () => Script);
}

declare module 'playcanvas/scripts/esm/sky/procedural-sky.mjs' {
    import type { Script } from 'playcanvas';

    export const ProceduralSky: typeof Script & (new () => Script);
}
