import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';

import { addFirstPersonController } from './controller';
import './starter.css';

await Promise.all([
    whenReady('pc-entity[name="player"] > pc-collision'),
    whenReady('pc-entity[name="player"] > pc-rigid-body')
]);
const [player, camera] = await Promise.all([
    whenReady<EntityElement>('pc-entity[name="player"]'),
    whenReady<EntityElement>('pc-entity[name="camera"]')
]);
addFirstPersonController(player.entity!, camera.entity!);
