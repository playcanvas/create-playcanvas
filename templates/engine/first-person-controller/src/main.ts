import {
    AppBase,
    AppOptions,
    CameraComponentSystem,
    CollisionComponentSystem,
    Color,
    Entity,
    FILLMODE_FILL_WINDOW,
    LightComponentSystem,
    RenderComponentSystem,
    RESOLUTION_AUTO,
    RigidBodyComponentSystem,
    ScriptComponentSystem,
    StandardMaterial,
    Vec3,
    WasmModule,
    createGraphicsDevice
} from 'playcanvas';

import { addFirstPersonController } from './controller';
import './starter.css';

WasmModule.setConfig('Ammo', {
    glueUrl: '/ammo/ammo.wasm.js',
    wasmUrl: '/ammo/ammo.wasm.wasm',
    fallbackUrl: '/ammo/ammo.js'
});
await new Promise<void>((resolve) => {
    WasmModule.getInstance('Ammo', () => resolve());
});

document.body.insertAdjacentHTML(
    'beforeend',
    '<div class="hud"><section class="panel"><h1>First-Person Controller</h1><p>Click the scene, then use WASD, mouse look and Space to jump.</p></section></div>'
);

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
const device = await createGraphicsDevice(canvas);
const options = new AppOptions();
options.graphicsDevice = device;
options.componentSystems = [
    RenderComponentSystem,
    CameraComponentSystem,
    LightComponentSystem,
    ScriptComponentSystem,
    CollisionComponentSystem,
    RigidBodyComponentSystem
];

const app = new AppBase(canvas);
app.init(options);
app.start();
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);

const material = (color: Color) => {
    const result = new StandardMaterial();
    result.diffuse = color;
    result.emissive = new Color(color.r * 0.2, color.g * 0.2, color.b * 0.2);
    result.update();
    return result;
};

const floor = material(new Color(0.67, 0.61, 0.52));
const wall = material(new Color(0.76, 0.74, 0.68));
const blue = material(new Color(0.08, 0.29, 0.48));
const green = material(new Color(0.18, 0.4, 0.22));

const block = (
    name: string,
    position: [number, number, number],
    scale: [number, number, number],
    blockMaterial: StandardMaterial
) => {
    const entity = new Entity(name);
    entity.setPosition(...position);
    entity.setLocalScale(...scale);
    entity.addComponent('render', { type: 'box', material: blockMaterial });
    entity.addComponent('collision', {
        type: 'box',
        halfExtents: new Vec3(scale[0] / 2, scale[1] / 2, scale[2] / 2)
    });
    entity.addComponent('rigidbody', { type: 'static' });
    app.root.addChild(entity);
};

block('floor', [0, -0.1, 0], [18, 0.2, 18], floor);
block('back-wall', [0, 1.5, -9], [18, 3, 0.3], wall);
block('front-wall', [0, 1.5, 9], [18, 3, 0.3], wall);
block('left-wall', [-9, 1.5, 0], [0.3, 3, 18], wall);
block('right-wall', [9, 1.5, 0], [0.3, 3, 18], wall);
block('blue-crate', [-2, 0.75, -3], [1.5, 1.5, 1.5], blue);
block('green-crate', [3, 0.5, 1], [2.5, 1, 1], green);

const player = new Entity('player');
player.setPosition(0, 1, 5);
player.addComponent('collision', { type: 'capsule', radius: 0.45, height: 1.8 });
player.addComponent('rigidbody', { type: 'dynamic', mass: 80, angularFactor: Vec3.ZERO });
app.root.addChild(player);

const camera = new Entity('camera');
camera.addComponent('camera', { clearColor: new Color(0.38, 0.64, 0.86), fov: 80 });
camera.setLocalPosition(0, 0.65, 0);
player.addChild(camera);
addFirstPersonController(player, camera);

const light = new Entity('light');
light.addComponent('light', {
    type: 'directional',
    intensity: 2.5,
    castShadows: true,
    shadowBias: 0.2,
    normalOffsetBias: 0.05
});
light.setEulerAngles(50, 30, 0);
app.root.addChild(light);

const fill = new Entity('fill');
fill.addComponent('light', { type: 'directional', intensity: 0.8 });
fill.setEulerAngles(-25, -140, 0);
app.root.addChild(fill);

window.addEventListener('resize', () => app.resizeCanvas());
