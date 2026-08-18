import {
    AppBase,
    AppOptions,
    CameraComponentSystem,
    Color,
    Entity,
    FILLMODE_FILL_WINDOW,
    LightComponentSystem,
    RenderComponentSystem,
    RESOLUTION_AUTO,
    ScriptComponentSystem,
    StandardMaterial,
    createGraphicsDevice
} from 'playcanvas';
import { Grid } from 'playcanvas/scripts/esm/grid.mjs';

import { SceneEditor } from './scene-editor';
import './starter.css';

document.body.insertAdjacentHTML(
    'beforeend',
    '<div class="hud"><section class="panel"><h1>Scene Editor</h1><p>Select an object, then translate, rotate or scale it.</p><div class="controls"><button data-target="0" aria-pressed="true">Cube</button><button data-target="1">Sphere</button></div><div class="controls"><button data-mode="translate" aria-pressed="true">Move</button><button data-mode="rotate">Rotate</button><button data-mode="scale">Scale</button></div></section></div>'
);

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
const device = await createGraphicsDevice(canvas);
const options = new AppOptions();
options.graphicsDevice = device;
options.componentSystems = [RenderComponentSystem, CameraComponentSystem, LightComponentSystem, ScriptComponentSystem];

const app = new AppBase(canvas);
app.init(options);
app.start();
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);

app.scene.ambientLight = new Color(0.25, 0.28, 0.34);

const coral = new StandardMaterial();
coral.diffuse = new Color(1, 0.32, 0.27);
coral.update();
const cyan = new StandardMaterial();
cyan.diffuse = new Color(0.14, 0.68, 0.88);
cyan.update();

const cube = new Entity('cube');
cube.addComponent('render', { type: 'box', material: coral });
cube.setPosition(-1.2, 0.5, 0);
app.root.addChild(cube);

const sphere = new Entity('sphere');
sphere.addComponent('render', { type: 'sphere', material: cyan });
sphere.setPosition(1.2, 0.5, 0);
app.root.addChild(sphere);

const grid = new Entity('grid');
grid.addComponent('script');
grid.script!.create(Grid);
grid.setLocalScale(12, 12, 12);
app.root.addChild(grid);

const camera = new Entity('camera');
camera.addComponent('camera', { clearColor: new Color(0.04, 0.06, 0.09) });
camera.setPosition(4, 3.2, 5);
camera.lookAt(0, 0.5, 0);
app.root.addChild(camera);

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

const editor = new Entity('editor');
editor.addComponent('script');
editor.script!.create(SceneEditor, {
    properties: {
        camera,
        targets: [cube, sphere],
        layer: app.scene.layers.getLayerByName('World')
    }
});
app.root.addChild(editor);

window.addEventListener('resize', () => app.resizeCanvas());
