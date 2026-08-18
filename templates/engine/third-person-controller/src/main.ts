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

const BLOCK_SCALE: [number, number, number] = [2.4, 1, 2.4];
const BLOCK_HALF_EXTENTS: [number, number, number] = [1.2, 0.5, 1.2];
const BLOCKS: [number, number, number][] = [
    [-4.5, 0.5, -3.5],
    [4.2, 0.5, -2.8],
    [-3.7, 0.5, 3.2],
    [3.8, 0.5, 3.6]
];
const TREES: [number, number, number][] = [
    [-7, -6, 1.1],
    [6.5, -6.5, 1.25],
    [-7.5, 5, 0.9],
    [7, 5.5, 1.15],
    [-2.2, -8, 0.85]
];
const PINE_LAYERS: [number, number, number][] = [
    [1.9, 2.1, 1.8],
    [2.65, 1.6, 1.55],
    [3.3, 1.1, 1.4]
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
groundMaterial.diffuse = new Color(0.2, 0.4, 0.18);
groundMaterial.update();
const blockMaterial = new StandardMaterial();
blockMaterial.diffuse = new Color(0.34, 0.35, 0.3);
blockMaterial.update();

const ground = new Entity('ground');
ground.setLocalScale(20, 0.2, 20);
ground.setPosition(0, -0.1, 0);
ground.addComponent('render', { type: 'box', material: groundMaterial });
ground.addComponent('collision', { type: 'box', halfExtents: new Vec3(10, 0.1, 10) });
ground.addComponent('rigidbody', { type: 'static' });
app.root.addChild(ground);

for (const [i, position] of BLOCKS.entries()) {
    const block = new Entity(`block-${i}`);
    block.setPosition(...position);
    block.setLocalScale(...BLOCK_SCALE);
    block.setEulerAngles(0, i * 25, 0);
    block.addComponent('render', { type: 'box', material: blockMaterial });
    block.addComponent('collision', { type: 'box', halfExtents: new Vec3(...BLOCK_HALF_EXTENTS) });
    block.addComponent('rigidbody', { type: 'static' });
    app.root.addChild(block);
}

const wood = new StandardMaterial();
wood.diffuse = new Color(0.34, 0.18, 0.08);
wood.update();
const leaves = new StandardMaterial();
leaves.diffuse = new Color(0.08, 0.3, 0.12);
leaves.update();
const tips = new StandardMaterial();
tips.diffuse = new Color(0.12, 0.4, 0.16);
tips.update();
const prop = (
    name: string,
    position: [number, number, number],
    scale: [number, number, number],
    material: StandardMaterial
) => {
    const entity = new Entity(name);
    entity.setPosition(...position);
    entity.setLocalScale(...scale);
    entity.addComponent('render', { type: 'box', material });
    entity.addComponent('collision', {
        type: 'box',
        halfExtents: new Vec3(scale[0] / 2, scale[1] / 2, scale[2] / 2)
    });
    entity.addComponent('rigidbody', { type: 'static' });
    app.root.addChild(entity);
};
for (const [i, [x, z, size]] of TREES.entries()) {
    prop(`tree-${i}-trunk`, [x, size * 0.9, z], [size * 0.38, size * 1.8, size * 0.38], wood);
    for (const [j, [y, width, height]] of PINE_LAYERS.entries()) {
        const crown = new Entity(`tree-${i}-crown-${j}`);
        crown.setPosition(x, size * y, z);
        crown.setLocalScale(size * width, size * height, size * width);
        crown.addComponent('render', { type: 'cone', material: j === 1 ? tips : leaves });
        app.root.addChild(crown);
    }
}
prop('fallen-log', [0, 0.35, 6], [3.8, 0.7, 0.7], wood);
prop('stump', [-1.8, 0.4, -2.2], [0.9, 0.8, 0.9], wood);

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
limb('left-leg', [-0.15, -0.44, 0], -0.43, [0.24, 0.86, 0.34], pants);
limb('right-leg', [0.15, -0.44, 0], -0.43, [0.24, 0.86, 0.34], pants);
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
