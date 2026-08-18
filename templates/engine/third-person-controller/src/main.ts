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

import { addThirdPersonController } from './controller';
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
    '<div class="hud"><section class="panel"><h1>Third-Person Controller</h1><p>Click the scene, then use WASD to move, mouse to orbit and Space to jump.</p></section></div>'
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
app.scene.ambientLight = new Color(0.28, 0.32, 0.38);

const groundMaterial = new StandardMaterial();
groundMaterial.diffuse = new Color(0.32, 0.48, 0.27);
groundMaterial.update();
const rockMaterial = new StandardMaterial();
rockMaterial.diffuse = new Color(0.38, 0.41, 0.43);
rockMaterial.update();

const ground = new Entity('ground');
ground.setLocalScale(20, 0.2, 20);
ground.setPosition(0, -0.1, 0);
ground.addComponent('render', { type: 'box', material: groundMaterial });
ground.addComponent('collision', { type: 'box', halfExtents: new Vec3(10, 0.1, 10) });
ground.addComponent('rigidbody', { type: 'static' });
app.root.addChild(ground);

for (const [i, position] of [
    [-4.5, 0.25, -3.5],
    [4.2, 0.2, -2.8],
    [-3.7, 0.18, 3.2],
    [3.8, 0.28, 3.6]
].entries()) {
    const rock = new Entity(`rock-${i}`);
    rock.addComponent('render', { type: 'box', material: rockMaterial });
    rock.setPosition(...(position as [number, number, number]));
    rock.setLocalScale(0.9, 0.5, 0.7);
    rock.setEulerAngles(0, i * 25, 0);
    app.root.addChild(rock);
}

const player = new Entity('player');
player.setPosition(0, 1.1, 0);
player.addComponent('collision', {
    type: 'capsule',
    radius: 0.5,
    height: 2.4,
    linearOffset: new Vec3(0, 0.1, 0)
});
player.addComponent('rigidbody', { type: 'dynamic', mass: 70, angularFactor: Vec3.ZERO });
app.root.addChild(player);

const shirt = new StandardMaterial();
shirt.diffuse = new Color(0.15, 0.55, 0.9);
shirt.update();
const skin = new StandardMaterial();
skin.diffuse = new Color(0.78, 0.53, 0.35);
skin.update();
const pants = new StandardMaterial();
pants.diffuse = new Color(0.18, 0.29, 0.52);
pants.update();

const model = new Entity('character');
model.setLocalPosition(0, 0.2, 0);
const part = (
    parent: Entity,
    name: string,
    position: [number, number, number],
    scale: [number, number, number],
    material: StandardMaterial
) => {
    const entity = new Entity(name);
    entity.addComponent('render', { type: 'box', material });
    entity.setLocalPosition(...position);
    entity.setLocalScale(...scale);
    parent.addChild(entity);
};
const limb = (
    name: string,
    position: [number, number, number],
    offset: number,
    scale: [number, number, number],
    material: StandardMaterial
) => {
    const joint = new Entity(name);
    joint.setLocalPosition(...position);
    model.addChild(joint);
    part(joint, `${name}-mesh`, [0, offset, 0], scale, material);
};
part(model, 'body', [0, 0, 0], [0.56, 0.88, 0.38], shirt);
part(model, 'head', [0, 0.76, 0], [0.52, 0.6, 0.52], skin);
limb('left-arm', [-0.38, 0.44, 0], -0.44, [0.18, 0.88, 0.32], shirt);
limb('right-arm', [0.38, 0.44, 0], -0.44, [0.18, 0.88, 0.32], shirt);
limb('left-leg', [-0.15, -0.44, 0], -0.43, [0.26, 0.86, 0.34], pants);
limb('right-leg', [0.15, -0.44, 0], -0.43, [0.26, 0.86, 0.34], pants);
player.addChild(model);

const camera = new Entity('camera');
camera.addComponent('camera', { clearColor: new Color(0.48, 0.72, 0.9) });
camera.setPosition(0, 3, 6);
app.root.addChild(camera);
addThirdPersonController(player, camera, model);

const light = new Entity('light');
light.addComponent('light', {
    type: 'directional',
    intensity: 2.5,
    castShadows: true,
    shadowBias: 0.2,
    normalOffsetBias: 0.05
});
light.setEulerAngles(45, 30, 0);
app.root.addChild(light);

window.addEventListener('resize', () => app.resizeCanvas());
