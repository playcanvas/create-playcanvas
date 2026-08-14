import type { EntityElement } from '@playcanvas/web-components';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import './starter.css';

const { default: Ammo } = await import('sync-ammo');
Object.assign(globalThis, { Ammo });
const { whenReady } = await import('@playcanvas/web-components');

const camera = await whenReady<EntityElement>('pc-entity[name="camera"]');
camera.entity!.addComponent('script');
camera.entity!.script!.create(CameraControls, { properties: { sceneSize: 8 } });

const bodies = document.getElementById('bodies')!;
let count = 0;
const spawn = () => {
    const type = count++ % 2 ? 'sphere' : 'box';
    bodies.insertAdjacentHTML(
        'beforeend',
        `<pc-entity data-body position="${(count % 3) - 1} ${3 + count * 0.7} ${(count % 2) - 0.5}" rotation="${count * 13} ${count * 29} 0"><pc-render type="${type}"></pc-render><pc-collision type="${type}"></pc-collision><pc-rigidbody type="dynamic" mass="1" restitution="0.35"></pc-rigidbody></pc-entity>`
    );
};
const reset = () => {
    bodies.replaceChildren();
    count = 0;
    for (let i = 0; i < 7; i++) spawn();
};

document.getElementById('spawn')!.onclick = spawn;
document.getElementById('reset')!.onclick = reset;
reset();
