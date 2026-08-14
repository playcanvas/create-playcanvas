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
    orthoHeight: 5,
    clearColor: new Color(0.05, 0.07, 0.13)
});
camera.setPosition(0, 1, 10);
app.root.addChild(camera);

const ground = new Entity('ground');
ground.addComponent('render', { type: 'box' });
ground.setLocalScale(20, 0.2, 1);
ground.setPosition(0, -2.1, 0);
app.root.addChild(ground);

const game = new Entity('game');
game.addComponent('script');
game.script!.create(SpriteGame);
app.root.addChild(game);

window.addEventListener('resize', () => app.resizeCanvas());
