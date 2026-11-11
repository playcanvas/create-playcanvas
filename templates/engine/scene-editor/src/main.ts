import {
    AppBase,
    AppOptions,
    CameraComponentSystem,
    Color,
    Entity,
    FILLMODE_FILL_WINDOW,
    LightComponentSystem,
    RESOLUTION_AUTO,
    RenderComponentSystem,
    ScriptComponentSystem,
    createGraphicsDevice
} from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { Grid } from 'playcanvas/scripts/esm/grid.mjs';

import { SceneEditor } from './scene-editor';
import type { Mode, Shape } from './scene-editor';
import './starter.css';

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

const app = new AppBase(canvas);
app.init(createOptions);
app.start();

// Set the canvas to fill the window and automatically change resolution to be the same as the canvas size
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);

// Ensure canvas is resized when window changes size
const resize = () => app.resizeCanvas();
window.addEventListener('resize', resize);
app.on('destroy', () => {
    window.removeEventListener('resize', resize);
});

const light = new Entity('light');
light.addComponent('light', { type: 'directional', intensity: 2.5 });
light.setEulerAngles(45, 30, 0);
app.root.addChild(light);

// A weaker light from behind keeps the sides the first can't reach from going black
const fill = new Entity('fill');
fill.addComponent('light', { type: 'directional', intensity: 0.8 });
fill.setEulerAngles(-25, -140, 0);
app.root.addChild(fill);

const grid = new Entity('grid');
grid.addComponent('script');
grid.script!.create(Grid);
grid.setLocalScale(12, 12, 12);
app.root.addChild(grid);

// Create camera entity with orbit controls
const camera = new Entity('camera');
camera.addComponent('camera', { clearColor: new Color(0.04, 0.06, 0.09) });
camera.setPosition(4, 3.2, 5);
camera.lookAt(0, 0.5, 0);
camera.addComponent('script');
camera.script!.create(CameraControls, { properties: { sceneSize: 5 } });
app.root.addChild(camera);

// The editor creates the objects under its own entity, from the scene saved in this browser
const host = new Entity('editor');
host.addComponent('script');
const editor = host.script!.create(SceneEditor, { properties: { camera } }) as SceneEditor;
app.root.addChild(host);

// The HUD drives the editor, and follows its selection
const modes = document.querySelectorAll<HTMLButtonElement>('[data-mode]');
modes.forEach((button) => {
    button.addEventListener('click', () => {
        editor.mode = button.dataset.mode as Mode;
        modes.forEach((other) => (other.ariaPressed = String(other === button)));
    });
});
document.querySelectorAll<HTMLButtonElement>('[data-add]').forEach((button) => {
    button.addEventListener('click', () => editor.add(button.dataset.add as Shape));
});

const remove = document.getElementById('delete') as HTMLButtonElement;
remove.addEventListener('click', () => editor.remove());
document.getElementById('reset')!.addEventListener('click', () => editor.reset());
app.on('editor:select', (selected: Entity | null) => {
    remove.disabled = !selected;
});
