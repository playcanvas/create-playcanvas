import { whenReady } from '@playcanvas/web-components';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import './starter.css';

const MATERIALS = ['cyan-material', 'coral-material', 'yellow-material'];
const TYPES = ['box', 'sphere', 'capsule', 'cylinder'];
const SCALES = ['0.9 0.9 0.9', '0.9 0.9 0.9', '0.7 1.1 0.7', '0.8 1.1 0.8'];

const camera = (await whenReady('pc-camera')).closestEntity!.entity!;
camera.addComponent('script');
camera.script!.create(CameraControls, { properties: { sceneSize: 10 } });

const bodies = document.getElementById('bodies')!;
let count = 0;
const spawn = () => {
    const i = count++;
    const type = TYPES[i % TYPES.length];
    bodies.insertAdjacentHTML(
        'beforeend',
        `<pc-entity data-body position="${((i % 4) - 1.5) * 1.1} ${0.7 + Math.floor(i / 4) * 1.1} ${(Math.floor(i / 4) - 1) * 1.4}" rotation="${i * 13} ${i * 29} 0" scale="${SCALES[i % SCALES.length]}"><pc-render type="${type}" material="${MATERIALS[i % MATERIALS.length]}"></pc-render><pc-collision type="${type}"></pc-collision><pc-rigidbody type="dynamic" mass="1" restitution="0.35"></pc-rigidbody></pc-entity>`
    );
};
const reset = () => {
    bodies.replaceChildren();
    count = 0;
    for (let i = 0; i < 12; i++) spawn();
};

document.getElementById('spawn')!.onclick = spawn;
document.getElementById('reset')!.onclick = reset;
reset();
