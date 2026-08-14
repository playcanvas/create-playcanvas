import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import './starter.css';

const COLORS = ['#41b6e6', '#ff6b6b', '#f7c948'];

const camera = await whenReady<EntityElement>('pc-entity[name="camera"]');
camera.entity!.addComponent('script');
camera.entity!.script!.create(CameraControls, { properties: { sceneSize: 4 } });

const products = Array.from(document.querySelectorAll<EntityElement>('[data-product]'));
document.querySelectorAll<HTMLButtonElement>('#products button').forEach((button, i) => {
    button.onclick = () => {
        products.forEach((product, j) => (product.entity!.enabled = i === j));
        document.querySelectorAll<HTMLButtonElement>('#products button').forEach((item, j) => {
            item.ariaPressed = String(i === j);
        });
    };
});
document.querySelectorAll<HTMLButtonElement>('#colors button').forEach((button, i) => {
    button.onclick = () => document.querySelector('pc-material')!.setAttribute('diffuse', COLORS[i]);
});
