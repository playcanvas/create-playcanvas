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

import { addThirdPersonController } from './controller';
import { loadPhysics } from './load-physics';
import './starter.css';

await loadPhysics();

document.body.insertAdjacentHTML(
    'beforeend',
    '<div class="hud"><section class="panel"><h1>Third-Person Controller</h1><p>Use WASD to move, Space to jump and drag to orbit the camera.</p></section></div>'
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

const ground = new Entity('ground');
ground.addComponent('render', { type: 'box' });
ground.addComponent('collision', { type: 'box', halfExtents: { x: 10, y: 0.1, z: 10 } });
ground.addComponent('rigidbody', { type: 'static' });
ground.setLocalScale(20, 0.2, 20);
ground.setPosition(0, -0.1, 0);
app.root.addChild(ground);

const player = new Entity('player');
player.addComponent('collision', { type: 'capsule', radius: 0.45, height: 1.8 });
player.addComponent('rigidbody', { type: 'dynamic', mass: 70, angularFactor: { x: 0, y: 0, z: 0 } });
player.setPosition(0, 1, 0);
app.root.addChild(player);

const blue = new StandardMaterial();
blue.diffuse = new Color(0.15, 0.55, 0.9);
blue.update();
const white = new StandardMaterial();
white.diffuse = new Color(0.85, 0.9, 0.96);
white.update();

const model = new Entity('robot');
const part = (name: string, position: [number, number, number], scale: [number, number, number], material = blue) => {
    const entity = new Entity(name);
    entity.addComponent('render', { type: name === 'head' ? 'sphere' : 'box', material });
    entity.setLocalPosition(...position);
    entity.setLocalScale(...scale);
    model.addChild(entity);
};
part('body', [0, 0, 0], [0.8, 0.9, 0.45]);
part('head', [0, 0.72, 0], [0.55, 0.55, 0.55], white);
part('left-arm', [-0.58, 0, 0], [0.22, 0.85, 0.22]);
part('right-arm', [0.58, 0, 0], [0.22, 0.85, 0.22]);
part('left-leg', [-0.24, -0.85, 0], [0.28, 0.8, 0.3], white);
part('right-leg', [0.24, -0.85, 0], [0.28, 0.8, 0.3], white);
player.addChild(model);

const camera = new Entity('camera');
camera.addComponent('camera', { clearColor: new Color(0.06, 0.08, 0.13) });
camera.setPosition(0, 3, 6);
app.root.addChild(camera);
addThirdPersonController(player, camera, model);

const light = new Entity('light');
light.addComponent('light', { type: 'directional', castShadows: true, intensity: 2.5 });
light.setEulerAngles(45, 30, 0);
app.root.addChild(light);

window.addEventListener('resize', () => app.resizeCanvas());
