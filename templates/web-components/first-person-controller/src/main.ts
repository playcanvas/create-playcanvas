import type { EntityElement } from '@playcanvas/web-components';

import { addFirstPersonController } from './controller';
import './starter.css';

const { default: Ammo } = await import('sync-ammo');
Object.assign(globalThis, { Ammo });
const { whenReady } = await import('@playcanvas/web-components');
const [player, camera] = await Promise.all([
    whenReady<EntityElement>('pc-entity[name="player"]'),
    whenReady<EntityElement>('pc-entity[name="camera"]')
]);
addFirstPersonController(player.entity!, camera.entity!);
