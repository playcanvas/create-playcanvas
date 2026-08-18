import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';

import { ArPlacement } from './ar-placement';
import './starter.css';

const [camera, preview, placement] = await Promise.all([
    whenReady<EntityElement>('pc-entity[name="camera"]'),
    whenReady<EntityElement>('pc-entity[name="preview"]'),
    whenReady<EntityElement>('pc-entity[name="placement"]')
]);
placement.entity!.addComponent('script');
placement.entity!.script!.create(ArPlacement, { properties: { camera: camera.entity, preview: preview.entity } });
