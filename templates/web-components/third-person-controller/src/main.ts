import type { EntityElement } from '@playcanvas/web-components';

import { addThirdPersonController } from './controller';
import './starter.css';

const { default: Ammo } = await import('sync-ammo');
Object.assign(globalThis, { Ammo });
const { whenReady } = await import('@playcanvas/web-components');
const [player, camera, model] = await Promise.all([
    whenReady<EntityElement>('pc-entity[name="player"]'),
    whenReady<EntityElement>('pc-entity[name="camera"]'),
    whenReady<EntityElement>('pc-entity[name="robot"]')
]);
addThirdPersonController(player.entity!, camera.entity!, model.entity!);
