import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { Grid } from 'playcanvas/scripts/esm/grid.mjs';

import './style.css';

const HOVER_COLOR = 'orange';
const DEFAULT_COLOR = 'lightgrey';

const [camera, grid, sphere] = await Promise.all([
    whenReady<EntityElement>('pc-entity[name="camera"]'),
    whenReady<EntityElement>('pc-entity[name="grid"]'),
    whenReady<EntityElement>('pc-entity[name="sphere"]')
]);

// engine scripts are resolved by the bundler, so they are attached through the entity rather than
// with <pc-script name="...">, which only resolves scripts fetched at runtime by <pc-asset>
camera.entity?.addComponent('script');
camera.entity?.script?.create(CameraControls);
grid.entity?.addComponent('script');
grid.entity?.script?.create(Grid);

const material = document.querySelector('pc-material')!;
const counterElement = document.getElementById('counter')!;

let count = 0;

// pc-app picks whatever is under the pointer and dispatches a regular DOM PointerEvent on it, so
// the sphere is wired up like any other element
sphere.addEventListener('pointerenter', () => {
    material.setAttribute('diffuse', HOVER_COLOR);
    document.body.style.cursor = 'pointer';
});

sphere.addEventListener('pointerleave', () => {
    material.setAttribute('diffuse', DEFAULT_COLOR);
    document.body.style.cursor = 'default';
});

sphere.addEventListener('pointerup', () => {
    count++;
    counterElement.textContent = `Click Count: ${count}`;
});
