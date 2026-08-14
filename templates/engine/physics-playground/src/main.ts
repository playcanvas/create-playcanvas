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
    createGraphicsDevice
} from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import './starter.css';

const { default: Ammo } = await import('sync-ammo');
Object.assign(globalThis, { Ammo });

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
floor.addComponent('render', { type: 'box' });
floor.addComponent('collision', { type: 'box', halfExtents: { x: 5, y: 0.1, z: 5 } });
floor.addComponent('rigidbody', { type: 'static' });
floor.setLocalScale(10, 0.2, 10);
floor.setPosition(0, -0.1, 0);
app.root.addChild(floor);

const bodies: Entity[] = [];
const spawn = () => {
    const type = Math.random() > 0.5 ? 'box' : 'sphere';
    const entity = new Entity(type);
    entity.addComponent('render', { type, material });
    entity.addComponent('collision', { type, halfExtents: { x: 0.5, y: 0.5, z: 0.5 }, radius: 0.5 });
    entity.addComponent('rigidbody', { type: 'dynamic', mass: 1, restitution: 0.35 });
    entity.setPosition(Math.random() * 3 - 1.5, 5 + bodies.length * 0.7, Math.random() * 3 - 1.5);
    entity.setEulerAngles(Math.random() * 90, Math.random() * 90, 0);
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
