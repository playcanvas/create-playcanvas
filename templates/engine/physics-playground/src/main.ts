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

const material = new StandardMaterial();
material.diffuse = new Color(0.22, 0.62, 0.88);
material.update();

const floor = new Entity('floor');
floor.setLocalScale(10, 0.2, 10);
floor.setPosition(0, -0.1, 0);
floor.addComponent('render', { type: 'box' });
floor.addComponent('collision', { type: 'box', halfExtents: new Vec3(5, 0.1, 5) });
floor.addComponent('rigidbody', { type: 'static' });
app.root.addChild(floor);

const bodies: Entity[] = [];
const spawn = () => {
    const i = bodies.length;
    const type = i % 2 ? 'sphere' : 'box';
    const entity = new Entity(type);
    entity.setPosition((i % 3) - 1, 3 + i * 0.7, (i % 2) - 0.5);
    entity.setEulerAngles(i * 13, i * 29, 0);
    entity.addComponent('render', { type, material });
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
    for (let i = 0; i < 7; i++) spawn();
};

const camera = new Entity('camera');
camera.addComponent('camera', { clearColor: new Color(0.05, 0.07, 0.11) });
camera.addComponent('script');
camera.script!.create(CameraControls, { properties: { sceneSize: 8 } });
camera.setPosition(8, 6, 8);
app.root.addChild(camera);

const light = new Entity('light');
light.addComponent('light', { type: 'directional', castShadows: true, intensity: 2 });
light.setEulerAngles(45, 35, 0);
app.root.addChild(light);

document.getElementById('spawn')!.onclick = spawn;
document.getElementById('reset')!.onclick = reset;
reset();
window.addEventListener('resize', () => app.resizeCanvas());
