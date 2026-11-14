import {
    AppBase,
    AppOptions,
    Asset,
    AssetListLoader,
    CameraComponentSystem,
    CollisionComponentSystem,
    Color,
    ContainerHandler,
    Entity,
    FILLMODE_FILL_WINDOW,
    LightComponentSystem,
    RenderComponentSystem,
    RESOLUTION_AUTO,
    RigidBodyComponentSystem,
    ScriptComponentSystem,
    SHADOW_PCF5_32F,
    TextureHandler,
    TONEMAP_ACES2,
    Vec3,
    WasmModule,
    createGraphicsDevice
} from 'playcanvas';
import { ProceduralSky } from 'playcanvas/scripts/esm/sky/procedural-sky.mjs';

import { CARDS, Game } from './game';
import type { GameEvents } from './game';
import './game.css';
import './starter.css';

// Swap this for your own level - files in public/ are served next to index.html, so use a ./ path.
// The game finds its nodes by name: a mesh called `level` to look at, one called `collision` to
// stand on, any number called `orb-…` to collect, and one called `spawn` where the player starts
const LEVEL_URL = './level.glb';

// Physics runs in Ammo, a WebAssembly module, which has to be ready before the app is created
WasmModule.setConfig('Ammo', {
    glueUrl: './ammo/ammo.wasm.js',
    wasmUrl: './ammo/ammo.wasm.wasm'
});
await new Promise<void>((resolve) => {
    WasmModule.getInstance('Ammo', () => resolve());
});

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;

const device = await createGraphicsDevice(canvas);
device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

const createOptions = new AppOptions();
createOptions.graphicsDevice = device;
createOptions.componentSystems = [
    RenderComponentSystem,
    CameraComponentSystem,
    LightComponentSystem,
    ScriptComponentSystem,
    CollisionComponentSystem,
    RigidBodyComponentSystem
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

// Load the level before starting, so the first frame already has something in it
const level = new Asset('level', 'container', { url: LEVEL_URL });

await new Promise<void>((resolve) => {
    new AssetListLoader([level], app.assets).load(() => resolve());
});

app.start();

// The HUD follows the game's state
const hud = {
    orbs: document.getElementById('orbs')!,
    time: document.getElementById('time')!,
    card: document.getElementById('card')!,
    title: document.getElementById('card-title')!,
    hint: document.getElementById('card-hint')!,
    joystick: document.getElementById('joystick')!,
    knob: document.getElementById('joystick-knob')!
};

const onState: GameEvents['game:state'] = (state, found, total, seconds) => {
    const card = CARDS[state];
    hud.orbs.textContent = `${found} / ${total}`;
    hud.time.textContent = `${seconds}s`;
    hud.card.hidden = !card;
    if (card) {
        hud.title.textContent = card.title;
        hud.hint.textContent = card.hint;
    }
};
app.on('game:state', onState);

// A thumb on the left of the screen steers, and the circle and knob show where it is
const onJoystick: GameEvents['joystick:left'] = (baseX, baseY, knobX, knobY) => {
    hud.joystick.hidden = hud.knob.hidden = baseX < 0;
    hud.joystick.style.left = `${baseX}px`;
    hud.joystick.style.top = `${baseY}px`;
    hud.knob.style.left = `${knobX}px`;
    hud.knob.style.top = `${knobY}px`;
};
app.on('joystick:left', onJoystick);

// The sun is a directional light that the sky keeps pointing the way its own sun does
const sun = new Entity('sun');
sun.addComponent('light', {
    type: 'directional',
    intensity: 2,
    castShadows: true,
    // far enough to reach across the yard from any corner
    shadowDistance: 45,
    // one shadow map over that distance is too coarse up close, so split it into cascades
    numCascades: 4,
    shadowResolution: 2048,
    shadowType: SHADOW_PCF5_32F,
    shadowBias: 0.2,
    normalOffsetBias: 0.05
});
app.root.addChild(sun);

// The procedural sky is both the background and the ambient light. Its default luminance is
// scene-scale bright, so turn it down to keep the yard out of clipping
const sky = new Entity('sky');
sky.addComponent('script');
sky.script!.create(ProceduralSky, {
    properties: { luminance: 0.3, azimuth: 150, elevation: 45, sunLight: sun }
});
app.root.addChild(sky);

// The sky lights the shade blue. A warm light from the other side, with no shadows of its own,
// stands in for the sunlight the ground bounces back, so the shade stays soft and the sand warm
const fill = new Entity('fill');
fill.addComponent('light', { type: 'directional', intensity: 0.7, color: new Color().fromString('#ffdbb3') });
fill.setEulerAngles(60, -30, 0);
app.root.addChild(fill);

// The player is a capsule the physics moves, with the camera at eye height. The game places it
// at the level's spawn point and gives it a first-person controller
const player = new Entity('player');
player.addComponent('collision', { type: 'capsule', radius: 0.45, height: 1.8 });
player.addComponent('rigidbody', { type: 'dynamic', mass: 80, angularFactor: Vec3.ZERO });
app.root.addChild(player);

// The sky is HDR, so the camera needs tone mapping to bring it back into displayable range
const camera = new Entity('camera');
camera.addComponent('camera', { fov: 80, toneMapping: TONEMAP_ACES2 });
camera.setLocalPosition(0, 0.65, 0);
player.addChild(camera);

const game = new Entity('game');
game.addComponent('script');
game.script!.create(Game, { properties: { level, player, camera } });
app.root.addChild(game);
