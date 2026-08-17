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
    '<div class="hud"><section class="panel"><h1>First-Person Controller</h1><p>Click the scene, then use WASD, mouse look and Space to jump.</p></section><span class="crosshair"></span></div>'
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

const material = new StandardMaterial();
material.diffuse = new Color(0.18, 0.45, 0.68);
material.update();

const block = (name: string, position: [number, number, number], scale: [number, number, number]) => {
    const entity = new Entity(name);
    entity.addComponent('render', { type: 'box', material });
    entity.addComponent('collision', {
        type: 'box',
        halfExtents: { x: scale[0] / 2, y: scale[1] / 2, z: scale[2] / 2 }
    });
    entity.addComponent('rigidbody', { type: 'static' });
    entity.setPosition(...position);
    entity.setLocalScale(...scale);
    app.root.addChild(entity);
};

block('floor', [0, -0.1, 0], [18, 0.2, 18]);
block('wall', [0, 1.5, -9], [18, 3, 0.3]);
block('wall', [-9, 1.5, 0], [0.3, 3, 18]);
block('wall', [9, 1.5, 0], [0.3, 3, 18]);
block('crate', [-2, 0.75, -3], [1.5, 1.5, 1.5]);
block('crate', [3, 0.5, 1], [2.5, 1, 1]);

const player = new Entity('player');
player.addComponent('collision', { type: 'capsule', radius: 0.45, height: 1.8 });
player.addComponent('rigidbody', { type: 'dynamic', mass: 80, angularFactor: { x: 0, y: 0, z: 0 } });
player.setPosition(0, 1, 5);
app.root.addChild(player);

const camera = new Entity('camera');
camera.addComponent('camera', { clearColor: new Color(0.06, 0.08, 0.13) });
camera.setLocalPosition(0, 0.65, 0);
player.addChild(camera);
addFirstPersonController(player, camera);

const light = new Entity('light');
light.addComponent('light', { type: 'directional', intensity: 2.5 });
light.setEulerAngles(50, 30, 0);
app.root.addChild(light);

window.addEventListener('resize', () => app.resizeCanvas());
