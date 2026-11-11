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

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;

const device = await createGraphicsDevice(canvas);
device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

const createOptions = new AppOptions();
createOptions.graphicsDevice = device;
createOptions.componentSystems = [
    RenderComponentSystem,
    CameraComponentSystem,
    LightComponentSystem,
    ScriptComponentSystem
];
createOptions.xr = XrManager;

const app = new AppBase(canvas);
app.init(createOptions);
app.start();

// Set the canvas to fill the window and automatically change resolution to be the same as the canvas size
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);

// Ensure canvas is resized when window changes size
const resize = () => app.resizeCanvas();
window.addEventListener('resize', resize);
app.on('destroy', () => {
    window.removeEventListener('resize', resize);
});

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
