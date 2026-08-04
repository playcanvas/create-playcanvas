import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';
import type { Texture } from 'playcanvas';
import { Asset, TEXTURETYPE_RGBP } from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { Grid } from 'playcanvas/scripts/esm/grid.mjs';

import './style.css';

const HOVER_COLOR = 'orange';
const DEFAULT_COLOR = 'lightgrey';

// The camera is awaited as <pc-camera> rather than the <pc-entity> holding it - an entity becomes
// ready before its component children do, and CameraControls needs the camera component to exist
const [appElement, cameraComponent, grid, sphere] = await Promise.all([
    whenReady('pc-app'),
    whenReady('pc-camera'),
    whenReady<EntityElement>('pc-entity[name="grid"]'),
    whenReady<EntityElement>('pc-entity[name="sphere"]')
]);

// This is a pre-generated environment atlas rather than an equirectangular image, so it is applied
// straight to the scene instead of through <pc-sky>
const app = appElement.app!;
const envAtlas = new Asset(
    'env-atlas',
    'texture',
    { url: '/environment-map.png' },
    {
        type: TEXTURETYPE_RGBP,
        mipmaps: false
    }
);

app.assets.add(envAtlas);
await new Promise<void>((resolve) => {
    envAtlas.ready(() => resolve());
    app.assets.load(envAtlas);
});

// Light the scene from the environment, with the skybox itself left hidden
app.scene.envAtlas = envAtlas.resource as Texture;
const skyboxLayer = app.scene.layers.getLayerByName('Skybox');
if (skyboxLayer) {
    skyboxLayer.enabled = false;
}

// Engine scripts are resolved by the bundler, so they are attached through the entity rather than
// with <pc-script name="...">, which only resolves scripts fetched at runtime by <pc-asset>
const camera = cameraComponent.closestEntity;
camera?.entity?.addComponent('script');
camera?.entity?.script?.create(CameraControls);
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
