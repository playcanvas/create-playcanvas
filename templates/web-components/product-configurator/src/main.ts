import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';
import { Vec2, Vec3 } from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import './starter.css';

const COLORS = ['#41b6e6', '#ff6b6b', '#f7c948'];
const CAMERA_FOCUS = new Vec3(0, 1.1, 0);
const CAMERA_PITCH = new Vec2(-85, -4);

const camera = (await whenReady('pc-camera')).closestEntity!.entity!;
camera.addComponent('script');
camera.script!.create(CameraControls, {
    properties: {
        sceneSize: 5.5,
        focusPoint: CAMERA_FOCUS,
        pitchRange: CAMERA_PITCH,
        enableFly: false,
        enablePan: false
    }
});

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
