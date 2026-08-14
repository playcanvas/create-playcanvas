import {
    AppBase,
    AppOptions,
    CameraComponentSystem,
    Color,
    Entity,
    FILLMODE_FILL_WINDOW,
    LightComponentSystem,
    RenderComponentSystem,
    RESOLUTION_AUTO,
    ScriptComponentSystem,
    XrManager,
    createGraphicsDevice
} from 'playcanvas';

import { ArPlacement } from './ar-placement';
import './starter.css';

document.body.insertAdjacentHTML(
    'beforeend',
    '<div class="hud"><section class="panel"><h1>AR Placement</h1><p id="xr-status">Checking AR support…</p><div class="controls"><button id="xr-button" disabled>Start AR</button></div></section></div>'
);

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
const device = await createGraphicsDevice(canvas);
const options = new AppOptions();
options.graphicsDevice = device;
options.componentSystems = [RenderComponentSystem, CameraComponentSystem, LightComponentSystem, ScriptComponentSystem];
options.xr = XrManager;

const app = new AppBase(canvas);
app.init(options);
app.start();
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);

const camera = new Entity('camera');
camera.addComponent('camera', { clearColor: new Color(0, 0, 0, 0) });
app.root.addChild(camera);

const light = new Entity('light');
light.addComponent('light', { type: 'directional', intensity: 2 });
light.setEulerAngles(45, 30, 0);
app.root.addChild(light);

const placement = new Entity('placement');
placement.addComponent('script');
placement.script!.create(ArPlacement, { properties: { camera } });
app.root.addChild(placement);

window.addEventListener('resize', () => app.resizeCanvas());
