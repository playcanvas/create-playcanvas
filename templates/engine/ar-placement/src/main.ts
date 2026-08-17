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
camera.addComponent('camera', { clearColor: new Color(0.05, 0.08, 0.12, 1) });
camera.setPosition(3, 2.4, 4);
camera.lookAt(0, 0.5, 0);
app.root.addChild(camera);

const light = new Entity('light');
light.addComponent('light', { type: 'directional', intensity: 2 });
light.setEulerAngles(45, 30, 0);
app.root.addChild(light);

const material = (color: Color) => {
    const value = new StandardMaterial();
    value.diffuse = color;
    value.update();
    return value;
};
const surface = material(new Color(0.28, 0.3, 0.34));
const cyan = material(new Color(0.1, 0.7, 0.9));
const coral = material(new Color(1, 0.35, 0.15));
const preview = new Entity('preview');
for (const [name, type, position, scale, value] of [
    ['surface', 'cylinder', [0, 0, 0], [4, 0.15, 4], surface],
    ['box', 'box', [0, 0.65, 0], [1, 1, 1], cyan],
    ['reticle', 'cylinder', [0, 0.12, 0], [1.5, 0.03, 1.5], coral]
] as const) {
    const entity = new Entity(name);
    entity.addComponent('render', { type, material: value });
    entity.setLocalPosition(position[0], position[1], position[2]);
    entity.setLocalScale(scale[0], scale[1], scale[2]);
    preview.addChild(entity);
}
app.root.addChild(preview);

const placement = new Entity('placement');
placement.addComponent('script');
placement.script!.create(ArPlacement, { properties: { camera, preview } });
app.root.addChild(placement);

window.addEventListener('resize', () => app.resizeCanvas());
