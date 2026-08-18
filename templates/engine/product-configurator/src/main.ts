import type { ContainerResource, RenderComponent } from 'playcanvas';
import {
    AppBase,
    AppOptions,
    Asset,
    AssetListLoader,
    CameraComponentSystem,
    Color,
    ContainerHandler,
    CylinderGeometry,
    Entity,
    FILLMODE_FILL_WINDOW,
    LightComponentSystem,
    Mesh,
    MeshInstance,
    RenderComponentSystem,
    RESOLUTION_AUTO,
    ScriptComponentSystem,
    StandardMaterial,
    TextureHandler,
    TONEMAP_ACES2,
    Vec2,
    Vec3,
    createGraphicsDevice
} from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { ProceduralSky } from 'playcanvas/scripts/esm/sky/procedural-sky.mjs';

import './product.css';
import './starter.css';

const PRODUCT_URL = 'https://developer.playcanvas.com/assets/lambo.glb';
const PAINTS = [
    { name: 'Crimson', color: '#d6293e', shade: '#9b1731' },
    { name: 'Arctic', color: '#d8e4e9', shade: '#8fa8b5' },
    { name: 'Volt', color: '#9acb34', shade: '#3c742d' }
];
const CAMERA_FOCUS = new Vec3(0, 0.8, 0);
const CAMERA_PITCH = new Vec2(-85, -4);

document.body.insertAdjacentHTML(
    'beforeend',
    `<div class="hud"><section class="panel"><h1>Product Configurator</h1><p>Choose a paint finish, then drag to orbit.</p><div class="controls variants" id="paints">${PAINTS.map(({ name, color }, i) => `<button aria-pressed="${i === 0}" data-color="${color}"><span class="finish" style="--color:${color}"></span>${name}</button>`).join('')}</div></section></div>`
);

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
const device = await createGraphicsDevice(canvas);
device.maxPixelRatio = Math.min(device.maxPixelRatio, 2);

const options = new AppOptions();
options.graphicsDevice = device;
options.componentSystems = [RenderComponentSystem, CameraComponentSystem, LightComponentSystem, ScriptComponentSystem];
options.resourceHandlers = [TextureHandler, ContainerHandler];

const app = new AppBase(canvas);
app.init(options);
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);

const product = new Asset('car', 'container', { url: PRODUCT_URL });
await new Promise<void>((resolve) => new AssetListLoader([product], app.assets).load(() => resolve()));

app.start();

const car = (product.resource as ContainerResource).instantiateRenderEntity();
car.setLocalEulerAngles(-90, -25, 0);
app.root.addChild(car);
app.root.syncHierarchy();

const meshes = (car.findComponents('render') as RenderComponent[]).flatMap((render) => render.meshInstances);
const bounds = meshes[0].aabb.clone();
meshes.slice(1).forEach((mesh) => bounds.add(mesh.aabb));
const scale = 5 / Math.max(bounds.halfExtents.x * 2, bounds.halfExtents.z * 2);
car.setLocalScale(scale, scale, scale);
app.root.syncHierarchy();
bounds.copy(meshes[0].aabb);
meshes.slice(1).forEach((mesh) => bounds.add(mesh.aabb));
car.setPosition(-bounds.center.x, 0.03 - bounds.getMin().y, -bounds.center.z);

const body = meshes.filter((mesh) => mesh.material.name === 'material');
const panels = meshes.filter((mesh) => mesh.material.name === 'material_1');
const paint = body[0].material.clone() as StandardMaterial;
const shade = panels[0].material.clone() as StandardMaterial;
body.forEach((mesh) => (mesh.material = paint));
panels.forEach((mesh) => (mesh.material = shade));
paint.diffuse.fromString(PAINTS[0].color);
shade.diffuse.fromString(PAINTS[0].shade);
paint.update();
shade.update();

const sky = new Entity('sky');
sky.addComponent('script');
sky.script!.create(ProceduralSky, { properties: { luminance: 0.18 } });
app.root.addChild(sky);

const camera = new Entity('camera');
camera.setPosition(5.5, 3.2, 6.5);
camera.lookAt(CAMERA_FOCUS);
camera.addComponent('camera', { fov: 40, toneMapping: TONEMAP_ACES2, renderSceneColorMap: true });
camera.addComponent('script');
camera.script!.create(CameraControls, {
    properties: {
        sceneSize: 6.2,
        focusPoint: CAMERA_FOCUS,
        pitchRange: CAMERA_PITCH,
        enableFly: false,
        enablePan: false
    }
});
app.root.addChild(camera);

const ground = new Entity('studio-ground');
const podium = new StandardMaterial();
podium.diffuse = new Color(0.3, 0.32, 0.34);
podium.metalness = 0.15;
podium.gloss = 0.65;
podium.update();

ground.setPosition(0, -0.08, 0);
ground.addComponent('render', {
    meshInstances: [
        new MeshInstance(
            Mesh.fromGeometry(
                device,
                new CylinderGeometry({ radius: 4, height: 0.16, heightSegments: 1, capSegments: 128 })
            ),
            podium
        )
    ],
    castShadows: false,
    receiveShadows: true
});
app.root.addChild(ground);

const light = new Entity('light');
light.addComponent('light', {
    type: 'directional',
    intensity: 2.5,
    castShadows: true,
    shadowBias: 0.2,
    normalOffsetBias: 0.05
});
light.setEulerAngles(45, -145, 0);
app.root.addChild(light);

document.querySelectorAll<HTMLButtonElement>('#paints button').forEach((button, i, buttons) => {
    button.onclick = () => {
        paint.diffuse.fromString(PAINTS[i].color);
        shade.diffuse.fromString(PAINTS[i].shade);
        paint.update();
        shade.update();
        buttons.forEach((item, j) => (item.ariaPressed = String(i === j)));
    };
});

window.addEventListener('resize', () => app.resizeCanvas());
