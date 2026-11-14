import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';

import './starter.css';
import { setupVr } from './vr';

const [appElement, rig, camera] = await Promise.all([
    whenReady('pc-app'),
    whenReady<EntityElement>('pc-entity[name="xr-rig"]'),
    whenReady<EntityElement>('pc-entity[name="camera"]')
]);
setupVr(appElement.app!, rig.entity!, camera.entity!);
