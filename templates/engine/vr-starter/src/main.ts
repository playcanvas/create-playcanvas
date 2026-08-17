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
    StandardMaterial,
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
app.scene.ambientLight = new Color(0.32, 0.34, 0.38);

const material = (color: Color) => {
    const value = new StandardMaterial();
    value.diffuse = color;
    value.update();
    return value;
};
const floorMaterial = material(new Color(0.38, 0.4, 0.43));
const wallMaterial = material(new Color(0.24, 0.26, 0.29));
const cyan = material(new Color(0.12, 0.7, 0.86));
const coral = material(new Color(1, 0.35, 0.3));
const yellow = material(new Color(1, 0.75, 0.2));

const floor = new Entity('floor');
floor.addComponent('render', { type: 'plane', material: floorMaterial });
floor.setLocalScale(10, 1, 10);
app.root.addChild(floor);

const part = (
    name: string,
    type: 'box' | 'sphere' | 'cone',
    position: [number, number, number],
    scale: [number, number, number],
    value: StandardMaterial
) => {
    const entity = new Entity(name);
    entity.addComponent('render', { type, material: value });
    entity.setPosition(...position);
    entity.setLocalScale(...scale);
    app.root.addChild(entity);
};
part('back-wall', 'box', [0, 2, -3.5], [8, 4, 0.2], wallMaterial);
part('left-wall', 'box', [-4, 2, 0], [0.2, 4, 7], wallMaterial);
part('right-wall', 'box', [4, 2, 0], [0.2, 4, 7], wallMaterial);
part('cyan-panel', 'box', [-2.4, 2.4, -3.35], [1.3, 1.3, 0.12], cyan);
part('coral-panel', 'box', [0, 2.4, -3.35], [1.3, 1.3, 0.12], coral);
part('yellow-panel', 'box', [2.4, 2.4, -3.35], [1.3, 1.3, 0.12], yellow);
[-2.4, 0, 2.4].forEach((x, i) => {
    part(`pedestal-${i}`, 'box', [x, 0.45, -1.6], [1, 0.9, 1], wallMaterial);
});
part('sphere', 'sphere', [-2.4, 1.35, -1.6], [0.7, 0.7, 0.7], cyan);
part('cube', 'box', [0, 1.35, -1.6], [0.7, 0.7, 0.7], coral);
part('cone', 'cone', [2.4, 1.35, -1.6], [0.8, 0.9, 0.8], yellow);

const rig = new Entity('xr-rig');
const camera = new Entity('camera');
camera.addComponent('camera', { clearColor: new Color(0.16, 0.18, 0.22) });
camera.setLocalPosition(0, 1.6, 4);
rig.addChild(camera);
app.root.addChild(rig);
setupVr(app, rig, camera);

const light = new Entity('light');
light.addComponent('light', {
    type: 'directional',
    intensity: 2,
    castShadows: true,
    shadowBias: 0.2,
    normalOffsetBias: 0.05
});
light.setEulerAngles(45, 30, 0);
app.root.addChild(light);

window.addEventListener('resize', () => app.resizeCanvas());
