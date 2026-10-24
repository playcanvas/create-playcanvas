import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';

import { CARDS, DodgeGame } from './dodge-game';
import type { GameState } from './dodge-game';
import { hasLeaderboard, loadAvatar, loadBest, recordScore, showLeaderboard } from './lens';
import './lens.css';

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

const { app } = await whenReady('pc-app');
app!.on('game:state', (state: GameState, score: number) => {
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

// the game is an engine script imported through the bundler, so it attaches through the entity
const game = await whenReady<EntityElement>('pc-entity[name="game"]');
game.entity!.addComponent('script');
game.entity!.script!.create(DodgeGame);
