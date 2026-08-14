import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';

import { ArPlacement } from './ar-placement';
import './starter.css';

const [camera, placement] = await Promise.all([
    whenReady<EntityElement>('pc-entity[name="camera"]'),
    whenReady<EntityElement>('pc-entity[name="placement"]')
]);
placement.entity!.addComponent('script');
placement.entity!.script!.create(ArPlacement, { properties: { camera: camera.entity } });
