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
    createGraphicsDevice
} from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import './starter.css';

const COLORS = ['#41b6e6', '#ff6b6b', '#f7c948'];

document.body.insertAdjacentHTML(
    'beforeend',
    `<div class="hud"><section class="panel"><h1>Product Configurator</h1><p>Switch the model and finish, then drag to orbit.</p><div class="controls" id="products"><button aria-pressed="true">Chair</button><button>Lamp</button><button>Speaker</button></div><div class="controls" id="colors">${COLORS.map((color) => `<button class="swatch" style="--color:${color}" aria-label="${color}"></button>`).join('')}</div></section></div>`
);

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
const device = await createGraphicsDevice(canvas);
device.maxPixelRatio = Math.min(device.maxPixelRatio, 2);

const options = new AppOptions();
options.graphicsDevice = device;
options.componentSystems = [RenderComponentSystem, CameraComponentSystem, LightComponentSystem, ScriptComponentSystem];

const app = new AppBase(canvas);
app.init(options);
app.start();
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);

const material = new StandardMaterial();
material.diffuse = new Color().fromString(COLORS[0]);
material.metalness = 0.15;
material.gloss = 0.65;
material.update();

const part = (
    parent: Entity,
    name: string,
    type: 'box' | 'cone' | 'cylinder' | 'sphere',
    position: [number, number, number],
    scale: [number, number, number]
) => {
    const entity = new Entity(name);
    entity.addComponent('render', { type, material });
    entity.setLocalPosition(...position);
    entity.setLocalScale(...scale);
    parent.addChild(entity);
};

const chair = new Entity('chair');
part(chair, 'seat', 'box', [0, 0.8, 0], [1.6, 0.18, 1.6]);
part(chair, 'back', 'box', [0, 1.65, 0.7], [1.6, 1.5, 0.18]);
for (const x of [-0.65, 0.65]) {
    for (const z of [-0.65, 0.65]) part(chair, 'leg', 'cylinder', [x, 0.35, z], [0.14, 0.7, 0.14]);
}

const lamp = new Entity('lamp');
part(lamp, 'base', 'cylinder', [0, 0.12, 0], [1.3, 0.24, 1.3]);
part(lamp, 'stem', 'cylinder', [0, 1.25, 0], [0.16, 2.3, 0.16]);
part(lamp, 'shade', 'cone', [0, 2.35, 0], [1.4, 1.2, 1.4]);

const speaker = new Entity('speaker');
part(speaker, 'case', 'box', [0, 1.15, 0], [1.5, 2.3, 0.8]);
part(speaker, 'woofer', 'cylinder', [0, 0.85, 0.43], [0.75, 0.12, 0.75]);
part(speaker, 'tweeter', 'cylinder', [0, 1.65, 0.43], [0.35, 0.12, 0.35]);
speaker.findByName('woofer')?.setLocalEulerAngles(90, 0, 0);
speaker.findByName('tweeter')?.setLocalEulerAngles(90, 0, 0);

const products = [chair, lamp, speaker];
products.forEach((product, i) => {
    product.enabled = i === 0;
    app.root.addChild(product);
});

const camera = new Entity('camera');
camera.addComponent('camera', { clearColor: new Color(0.04, 0.06, 0.09) });
camera.addComponent('script');
camera.script!.create(CameraControls, { properties: { sceneSize: 4 } });
camera.setPosition(4, 2.6, 5);
app.root.addChild(camera);

const light = new Entity('light');
light.addComponent('light', { type: 'directional', intensity: 2.5 });
light.setEulerAngles(45, 35, 0);
app.root.addChild(light);

document.querySelectorAll<HTMLButtonElement>('#products button').forEach((button, i) => {
    button.onclick = () => {
        products.forEach((product, j) => (product.enabled = i === j));
        document.querySelectorAll<HTMLButtonElement>('#products button').forEach((item, j) => {
            item.ariaPressed = String(i === j);
        });
    };
});
document.querySelectorAll<HTMLButtonElement>('#colors button').forEach((button, i) => {
    button.onclick = () => {
        material.diffuse.fromString(COLORS[i]);
        material.update();
    };
});

window.addEventListener('resize', () => app.resizeCanvas());
