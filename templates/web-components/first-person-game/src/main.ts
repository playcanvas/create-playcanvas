import type { AssetElement, EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';
import type { Asset } from 'playcanvas';
import { ProceduralSky } from 'playcanvas/scripts/esm/sky/procedural-sky.mjs';

import { CARDS, Game } from './game';
import type { GameEvents } from './game';
import './game.css';
import './starter.css';

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

// A thumb on the left of the screen steers, and the circle and knob show where it is
const onJoystick: GameEvents['joystick:left'] = (baseX, baseY, knobX, knobY) => {
    hud.joystick.hidden = hud.knob.hidden = baseX < 0;
    hud.joystick.style.left = `${baseX}px`;
    hud.joystick.style.top = `${baseY}px`;
    hud.knob.style.left = `${knobX}px`;
    hud.knob.style.top = `${knobY}px`;
};

const { app } = await whenReady('pc-app');
app!.on('game:state', onState);
app!.on('joystick:left', onJoystick);

// The player is awaited as its components rather than the <pc-entity> holding them - an entity
// becomes ready before its component children do, and the game needs its rigid body to exist
await Promise.all([
    whenReady('pc-entity[name="player"] > pc-collision'),
    whenReady('pc-entity[name="player"] > pc-rigid-body'),
    whenReady('pc-entity[name="sun"] > pc-light'),
    whenReady('pc-camera')
]);
const [level, sun, sky, player, camera, game] = await Promise.all([
    whenReady<AssetElement>('pc-asset#level'),
    whenReady<EntityElement>('pc-entity[name="sun"]'),
    whenReady<EntityElement>('pc-entity[name="sky"]'),
    whenReady<EntityElement>('pc-entity[name="player"]'),
    whenReady<EntityElement>('pc-entity[name="camera"]'),
    whenReady<EntityElement>('pc-entity[name="game"]')
]);

// Engine scripts are resolved by the bundler, so they are attached through the entity rather than
// with <pc-script-instance name="...">, which only resolves scripts fetched at runtime by <pc-asset>.
// The sky's default luminance is scene-scale bright, so turn it down to keep the yard out of clipping
sky.entity!.addComponent('script');
sky.entity!.script!.create(ProceduralSky, {
    properties: { luminance: 0.3, azimuth: 150, elevation: 45, sunLight: sun.entity }
});

game.entity!.addComponent('script');
game.entity!.script!.create(Game, {
    properties: { level: level.asset as Asset<'container'>, player: player.entity, camera: camera.entity }
});
