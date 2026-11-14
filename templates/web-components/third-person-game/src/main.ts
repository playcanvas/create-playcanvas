import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';

import { addThirdPersonController } from './controller';
import './starter.css';

await Promise.all([
    whenReady('pc-entity[name="player"] > pc-collision'),
    whenReady('pc-entity[name="player"] > pc-rigid-body')
]);
const [player, camera, model] = await Promise.all([
    whenReady<EntityElement>('pc-entity[name="player"]'),
    whenReady<EntityElement>('pc-entity[name="camera"]'),
    whenReady<EntityElement>('pc-entity[name="character"]')
]);
addThirdPersonController(player.entity!, camera.entity!, model.entity!);
