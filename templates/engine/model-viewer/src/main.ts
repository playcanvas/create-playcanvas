import type { ContainerResource } from 'playcanvas';
import {
    AppBase,
    AppOptions,
    Asset,
    AssetListLoader,
    CameraComponentSystem,
    ContainerHandler,
    Entity,
    FILLMODE_FILL_WINDOW,
    RESOLUTION_AUTO,
    RenderComponentSystem,
    ScriptComponentSystem,
    TONEMAP_ACES2,
    TextureHandler,
    createGraphicsDevice
} from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { ProceduralSky } from 'playcanvas/scripts/esm/sky/procedural-sky.mjs';

import './style.css';

// Swap this for your own model - anything you drop in public/ is served from the site root
const MODEL_URL = '/playcanvas-cube.glb';

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;

const device = await createGraphicsDevice(canvas);
device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

const createOptions = new AppOptions();
createOptions.graphicsDevice = device;
createOptions.componentSystems = [RenderComponentSystem, CameraComponentSystem, ScriptComponentSystem];
createOptions.resourceHandlers = [TextureHandler, ContainerHandler];

const app = new AppBase(canvas);
app.init(createOptions);

// Set the canvas to fill the window and automatically change resolution to be the same as the canvas size
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);

// Ensure canvas is resized when window changes size
const resize = () => app.resizeCanvas();
window.addEventListener('resize', resize);
app.on('destroy', () => {
    window.removeEventListener('resize', resize);
});

// Load the model before starting, so the first frame already has something in it
const model = new Asset('model', 'container', { url: MODEL_URL });

await new Promise<void>((resolve) => {
    new AssetListLoader([model], app.assets).load(() => resolve());
});

app.start();

// A container asset holds the whole glTF scene, so instantiate it to get an entity hierarchy
app.root.addChild((model.resource as ContainerResource).instantiateRenderEntity());

// The procedural sky is both the background and the image-based lighting, so no light or
// environment map asset is needed. Its default luminance is scene-scale bright, so turn it down to
// keep the model out of clipping
const sky = new Entity('sky');
sky.addComponent('script');
sky.script?.create(ProceduralSky, {
    properties: { luminance: 0.2 }
});
app.root.addChild(sky);

// Create camera entity with orbit controls. The sky is HDR, so it needs tone mapping to bring it
// back into displayable range - without it the whole image blows out to white
const camera = new Entity('camera');
camera.addComponent('camera', {
    toneMapping: TONEMAP_ACES2
});
camera.setPosition(2.6, 1.5, 3.2);
camera.lookAt(0, 0, 0);
camera.addComponent('script');
camera.script?.create(CameraControls, { properties: { sceneSize: 2.5 } });
app.root.addChild(camera);
