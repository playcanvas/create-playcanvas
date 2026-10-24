import {
    AppBase,
    AppOptions,
    CameraComponentSystem,
    Color,
    Entity,
    FILLMODE_NONE,
    LightComponentSystem,
    RESOLUTION_AUTO,
    RenderComponentSystem,
    ScriptComponentSystem,
    createGraphicsDevice
} from 'playcanvas';

import { CARDS, DodgeGame } from './dodge-game';
import type { GameState } from './dodge-game';
import { hasLeaderboard, loadAvatar, loadBest, recordScore, showLeaderboard } from './lens';
import './lens.css';

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
const device = await createGraphicsDevice(canvas);
device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

const options = new AppOptions();
options.graphicsDevice = device;
options.componentSystems = [RenderComponentSystem, CameraComponentSystem, LightComponentSystem, ScriptComponentSystem];

const app = new AppBase(canvas);
app.init(options);
app.start();

// lens.css sizes the canvas, filling a phone screen and centering a 9:16 column anywhere wider,
// and the drawing buffer follows its size every frame
app.setCanvasFillMode(FILLMODE_NONE);
app.setCanvasResolution(RESOLUTION_AUTO);

const camera = new Entity('camera');
camera.addComponent('camera', {
    clearColor: new Color().fromString('#0b1020'),
    fov: 45,
    // fix the field's width, so a taller phone shows more of the falling blocks
    horizontalFov: true
});
camera.setPosition(0, 0, 7);
app.root.addChild(camera);

const light = new Entity('light');
light.addComponent('light', { type: 'directional', intensity: 1.5 });
light.setEulerAngles(40, 30, 0);
app.root.addChild(light);

// the HUD follows the game's state, and the Lens records each finished run
const hud = {
    avatar: document.querySelector<HTMLImageElement>('.lens-avatar')!,
    score: document.querySelector('.lens-score')!,
    best: document.querySelector('.lens-best')!,
    card: document.querySelector<HTMLElement>('.lens-card')!,
    title: document.querySelector('.lens-title')!,
    hint: document.querySelector('.lens-hint')!,
    leaderboard: document.querySelector<HTMLButtonElement>('.lens-leaderboard')!
};
const showBest = (best: number) => {
    hud.best.textContent = `Best ${best}`;
};

app.on('game:state', (state: GameState, score: number) => {
    const card = CARDS[state];
    hud.score.textContent = String(score);
    hud.card.hidden = !card;
    if (card) {
        hud.title.textContent = card.title;
        hud.hint.textContent = card.hint;
    }
    hud.leaderboard.hidden = state !== 'over' || !hasLeaderboard();
    if (state === 'over') recordScore(score).then(showBest);
});
hud.leaderboard.addEventListener('click', showLeaderboard);

loadBest().then(showBest);
loadAvatar().then((url) => {
    if (!url) return;
    hud.avatar.src = url;
    hud.avatar.hidden = false;
});

const game = new Entity('game');
game.addComponent('script');
game.script!.create(DodgeGame);
app.root.addChild(game);
