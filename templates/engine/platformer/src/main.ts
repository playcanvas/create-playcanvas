import {
    AppBase,
    AppOptions,
    CameraComponentSystem,
    Color,
    Entity,
    FILLMODE_FILL_WINDOW,
    RenderComponentSystem,
    RESOLUTION_AUTO,
    ScriptComponentSystem,
    SpriteComponentSystem,
    StandardMaterial,
    createGraphicsDevice
} from 'playcanvas';

import { Platformer } from './platformer';
import './starter.css';

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;

const device = await createGraphicsDevice(canvas);
device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

const createOptions = new AppOptions();
createOptions.graphicsDevice = device;
createOptions.componentSystems = [
    RenderComponentSystem,
    CameraComponentSystem,
    SpriteComponentSystem,
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

const camera = new Entity('camera');
camera.addComponent('camera', {
    projection: 1,
    orthoHeight: 4.4,
    clearColor: new Color(0.36, 0.73, 0.9)
});
camera.setPosition(0, 0, 10);
app.root.addChild(camera);

const dirtMaterial = new StandardMaterial();
dirtMaterial.emissive = new Color(0.45, 0.28, 0.16);
dirtMaterial.update();
const grassMaterial = new StandardMaterial();
grassMaterial.emissive = new Color(0.28, 0.62, 0.34);
grassMaterial.update();

const dirt = new Entity('dirt');
dirt.addComponent('render', { type: 'box', material: dirtMaterial });
dirt.setLocalScale(20, 2.6, 1);
dirt.setPosition(0, -3.39, 0);
app.root.addChild(dirt);

const grass = new Entity('grass');
grass.addComponent('render', { type: 'box', material: grassMaterial });
grass.setLocalScale(20, 0.18, 1);
grass.setPosition(0, -2, 0);
app.root.addChild(grass);

const game = new Entity('game');
game.setPosition(0, -2.15, 0);
game.addComponent('script');
game.script!.create(Platformer);
app.root.addChild(game);
