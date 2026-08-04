import {
    AppBase,
    AppOptions,
    Asset,
    AssetListLoader,
    CameraComponentSystem,
    Entity,
    FILLMODE_FILL_WINDOW,
    GSplatComponentSystem,
    GSplatHandler,
    RESOLUTION_AUTO,
    ScriptComponentSystem,
    TextureHandler,
    createGraphicsDevice
} from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import './style.css';

// Hosted so the template stays small. Drop a .sog or .ply in public/ and point this at it instead
const SPLAT_URL = 'https://developer.playcanvas.com/assets/toy-cat.sog';

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;

// Antialiasing is disabled - splat rendering is fragment bound, so MSAA costs a lot and adds little
const device = await createGraphicsDevice(canvas, { antialias: false });
device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

const createOptions = new AppOptions();
createOptions.graphicsDevice = device;
createOptions.componentSystems = [CameraComponentSystem, GSplatComponentSystem, ScriptComponentSystem];
// TextureHandler is required as well as GSplatHandler - a .sog is a container whose splat data is
// stored as textures, and without it the splat loads but silently renders nothing
createOptions.resourceHandlers = [TextureHandler, GSplatHandler];

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

// Load the splat before starting, so the first frame already has something in it
const splat = new Asset('splat', 'gsplat', { url: SPLAT_URL });

await new Promise<void>((resolve) => {
    new AssetListLoader([splat], app.assets).load(() => resolve());
});

app.start();

// Splats are captured in their own space, so this one needs offsetting and flipping upright
const toyCat = new Entity('toy cat');
toyCat.addComponent('gsplat', { asset: splat });
toyCat.setPosition(0, -0.7, 0);
toyCat.setEulerAngles(0, 0, 180);
app.root.addChild(toyCat);

// Create camera entity with orbit controls
const camera = new Entity('camera');
camera.addComponent('camera');
camera.setPosition(0, 0, 2.5);
camera.addComponent('script');
camera.script?.create(CameraControls);
app.root.addChild(camera);
