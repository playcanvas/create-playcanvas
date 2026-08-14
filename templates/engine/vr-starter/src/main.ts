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

import './starter.css';
import { setupVr } from './vr';

document.body.insertAdjacentHTML(
    'beforeend',
    '<div class="hud"><section class="panel"><h1>VR Starter</h1><p id="xr-status">Checking VR support…</p><div class="controls"><button id="xr-button" disabled>Enter VR</button></div></section></div>'
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

const floor = new Entity('floor');
floor.addComponent('render', { type: 'plane' });
floor.setLocalScale(10, 1, 10);
app.root.addChild(floor);

for (let i = 0; i < 12; i++) {
    const cube = new Entity(`cube-${i}`);
    cube.addComponent('render', { type: 'box' });
    cube.setPosition(Math.sin(i) * 3, 0.5 + (i % 3) * 0.6, Math.cos(i) * 3);
    cube.setLocalScale(0.4, 0.4, 0.4);
    app.root.addChild(cube);
}

const rig = new Entity('xr-rig');
const camera = new Entity('camera');
camera.addComponent('camera', { clearColor: new Color(0.04, 0.06, 0.09) });
camera.setLocalPosition(0, 1.6, 4);
rig.addChild(camera);
app.root.addChild(rig);
setupVr(app, rig, camera);

const light = new Entity('light');
light.addComponent('light', { type: 'directional', intensity: 2 });
light.setEulerAngles(45, 30, 0);
app.root.addChild(light);

window.addEventListener('resize', () => app.resizeCanvas());
