import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { ProceduralSky } from 'playcanvas/scripts/esm/sky/procedural-sky.mjs';

import './starter.css';
import './style.css';

// The camera is awaited as <pc-camera> rather than the <pc-entity> holding it - an entity becomes
// ready before its component children do, and CameraControls needs the camera component to exist
const [cameraComponent, sky] = await Promise.all([
    whenReady('pc-camera'),
    whenReady<EntityElement>('pc-entity[name="sky"]')
]);

// Engine scripts are resolved by the bundler, so they are attached through the entity rather than
// with <pc-script-instance name="...">, which only resolves scripts fetched at runtime by <pc-asset>
const camera = cameraComponent.closestEntity;
camera?.entity?.addComponent('script');
camera?.entity?.script?.create(CameraControls, { properties: { sceneSize: 2.5 } });

sky.entity?.addComponent('script');

// The sky's default luminance is scene-scale bright, so turn it down to keep the model out of clipping
sky.entity?.script?.create(ProceduralSky, {
    properties: { luminance: 0.2 }
});
