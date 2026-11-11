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
const CAMERA_FOCUS = new Vec3(0, 0.8, 0);
const CAMERA_PITCH = new Vec2(-85, -4);

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;

const device = await createGraphicsDevice(canvas);
device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

const createOptions = new AppOptions();
createOptions.graphicsDevice = device;
createOptions.componentSystems = [
    RenderComponentSystem,
    CameraComponentSystem,
    LightComponentSystem,
    ScriptComponentSystem
];
createOptions.resourceHandlers = [TextureHandler, ContainerHandler];

const app = new AppBase(canvas);
app.init(createOptions);

// Set the canvas to fill the window and automatically change resolution to be the same as the canvas size
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);

// Ensure canvas is resized when window changes size
const resize = () => app.resizeCanvas();
window.addEventListener('resize', resize);
app.on('destroy', () => {
    window.removeEventListener('resize', resize);
});

const product = new Asset('car', 'container', { url: PRODUCT_URL });
await new Promise<void>((resolve) => new AssetListLoader([product], app.assets).load(() => resolve()));

app.start();

const car = product.resource!.instantiateRenderEntity();
car.setLocalEulerAngles(-90, -25, 0);
app.root.addChild(car);
app.root.syncHierarchy();

const meshes = car.findComponents('render').flatMap((render) => render.meshInstances);
const bounds = meshes[0].aabb.clone();
meshes.slice(1).forEach((mesh) => bounds.add(mesh.aabb));
const scale = 5 / Math.max(bounds.halfExtents.x * 2, bounds.halfExtents.z * 2);
car.setLocalScale(scale, scale, scale);
app.root.syncHierarchy();
bounds.copy(meshes[0].aabb);
meshes.slice(1).forEach((mesh) => bounds.add(mesh.aabb));
car.setPosition(-bounds.center.x, 0.03 - bounds.getMin().y, -bounds.center.z);

const body = meshes.filter((mesh) => mesh.material?.name === 'material');
const panels = meshes.filter((mesh) => mesh.material?.name === 'material_1');
const paint = body[0].material!.clone() as StandardMaterial;
const shade = panels[0].material!.clone() as StandardMaterial;
body.forEach((mesh) => (mesh.material = paint));
panels.forEach((mesh) => (mesh.material = shade));

// Each paint button in index.html carries its finish's two colors
const buttons = document.querySelectorAll<HTMLButtonElement>('#paints button');
const choose = (button: HTMLButtonElement) => {
    paint.diffuse.fromString(button.dataset.color!);
    shade.diffuse.fromString(button.dataset.shade!);
    paint.update();
    shade.update();
    buttons.forEach((item) => (item.ariaPressed = String(item === button)));
};
buttons.forEach((button) => (button.onclick = () => choose(button)));
choose(buttons[0]);

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
