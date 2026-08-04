import { whenReady } from '@playcanvas/web-components';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import './style.css';

// wait on <pc-camera> rather than the <pc-entity> holding it - an entity becomes ready before its
// component children do, and CameraControls needs the camera component to already exist
const cameraComponent = await whenReady('pc-camera');

// engine scripts are resolved by the bundler, so they are attached through the entity rather than
// with <pc-script name="...">, which only resolves scripts fetched at runtime by <pc-asset>
const camera = cameraComponent.closestEntity;
camera?.entity?.addComponent('script');
camera?.entity?.script?.create(CameraControls);
