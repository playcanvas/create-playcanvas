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
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import './starter.css';

const COLORS = [new Color(0.16, 0.68, 0.9), new Color(0.95, 0.34, 0.22), new Color(0.98, 0.68, 0.18)];
const TYPES = ['box', 'sphere', 'capsule', 'cylinder'] as const;
const SCALES: [number, number, number][] = [
    [0.9, 0.9, 0.9],
    [0.9, 0.9, 0.9],
    [0.7, 1.1, 0.7],
    [0.8, 1.1, 0.8]
];

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
    '<div class="hud"><section class="panel"><h1>Physics Playground</h1><p>Rigid bodies, collisions and runtime spawning.</p><div class="controls"><button id="spawn">Spawn object</button><button id="reset">Reset</button></div></section></div>'
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
app.systems.rigidbody!.gravity.set(0, -9.81, 0);

const materials = COLORS.map((color) => {
    const material = new StandardMaterial();
    material.diffuse = color;
    material.gloss = 0.45;
    material.update();
    return material;
});

const floorMaterial = new StandardMaterial();
floorMaterial.diffuse = new Color(0.18, 0.2, 0.24);
floorMaterial.gloss = 0.2;
floorMaterial.update();

const floor = new Entity('floor');
floor.setLocalScale(10, 0.2, 10);
floor.setPosition(0, -0.1, 0);
floor.addComponent('render', { type: 'box', material: floorMaterial });
floor.addComponent('collision', { type: 'box', halfExtents: new Vec3(5, 0.1, 5) });
floor.addComponent('rigidbody', { type: 'static' });
app.root.addChild(floor);

const bodies: Entity[] = [];
const spawn = () => {
    const i = bodies.length;
    const type = TYPES[i % TYPES.length];
    const entity = new Entity(type);
    entity.setPosition(((i % 4) - 1.5) * 1.1, 0.7 + Math.floor(i / 4) * 1.1, (Math.floor(i / 4) - 1) * 1.4);
    entity.setEulerAngles(i * 13, i * 29, 0);
    entity.setLocalScale(...SCALES[i % SCALES.length]);
    entity.addComponent('render', { type, material: materials[i % materials.length] });
    entity.addComponent('collision', {
        type,
        halfExtents: new Vec3(0.5, 0.5, 0.5),
        radius: 0.5
    });
    entity.addComponent('rigidbody', { type: 'dynamic', mass: 1, restitution: 0.35 });
    app.root.addChild(entity);
    bodies.push(entity);
};
const reset = () => {
    bodies.splice(0).forEach((entity) => entity.destroy());
    for (let i = 0; i < 12; i++) spawn();
};

const camera = new Entity('camera');
camera.setPosition(10, 8, 10);
camera.lookAt(0, 2, 0);
camera.addComponent('camera', { clearColor: new Color(0.05, 0.07, 0.11) });
camera.addComponent('script');
camera.script!.create(CameraControls, { properties: { sceneSize: 10 } });
app.root.addChild(camera);

const light = new Entity('light');
light.addComponent('light', {
    type: 'directional',
    intensity: 2.5,
    castShadows: true,
    shadowBias: 0.2,
    normalOffsetBias: 0.05
});
light.setEulerAngles(45, 35, 0);
app.root.addChild(light);

document.getElementById('spawn')!.onclick = spawn;
document.getElementById('reset')!.onclick = reset;
reset();
window.addEventListener('resize', () => app.resizeCanvas());
