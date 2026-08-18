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

import { SpriteGame } from './sprite-game';
import './starter.css';

document.body.insertAdjacentHTML(
    'beforeend',
    '<div class="hud"><section class="panel"><h1>Sprite Game</h1><p>Use A/D or the arrow keys to move and Space to jump.</p></section></div>'
);

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
const device = await createGraphicsDevice(canvas);
device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

const options = new AppOptions();
options.graphicsDevice = device;
options.componentSystems = [RenderComponentSystem, CameraComponentSystem, SpriteComponentSystem, ScriptComponentSystem];

const app = new AppBase(canvas);
app.init(options);
app.start();
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);

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
game.script!.create(SpriteGame);
app.root.addChild(game);

window.addEventListener('resize', () => app.resizeCanvas());
