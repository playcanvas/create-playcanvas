import { Application, Entity } from '@playcanvas/react';
import { Camera, Light, Script } from '@playcanvas/react/components';
import { useApp, useAppEvent } from '@playcanvas/react/hooks';
import { useCallback, useEffect, useState } from 'react';

import { CARDS, DodgeGame } from './dodge-game';
import type { GameEvents, GameState } from './dodge-game';
import { hasLeaderboard, loadAvatar, loadBest, recordScore, showLeaderboard } from './lens';
import './lens.css';

function Scene({ onState }: { onState: GameEvents['game:state'] }) {
    const app = useApp();
    useAppEvent<GameEvents>('game:state', onState);

    useEffect(() => {
        // render at up to twice the CSS resolution: sharp on a phone, without the cost of 3x
        // eslint-disable-next-line react-hooks/immutability -- the device belongs to the engine, not React
        app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio, 2);
    }, [app]);

    return (
        <>
            {/* fix the field's width, so a taller phone shows more of the falling blocks */}
            <Entity name="camera" position={[0, 0, 7]}>
                <Camera clearColor="#0b1020" fov={45} horizontalFov />
            </Entity>
            <Entity name="light" rotation={[40, 30, 0]}>
                <Light type="directional" intensity={1.5} />
            </Entity>
            <Entity name="game">
                <Script script={DodgeGame} />
            </Entity>
        </>
    );
}

function App() {
    const [state, setState] = useState<GameState>('ready');
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const [avatar, setAvatar] = useState<string>();

    useEffect(() => {
        loadBest().then(setBest);
        loadAvatar().then(setAvatar);
    }, []);

    // the HUD follows the game's state, and the Lens records each finished run
    const onState = useCallback((next: GameState, value: number) => {
        setState(next);
        setScore(value);
        if (next === 'over') recordScore(value).then(setBest);
    }, []);

    const card = CARDS[state];

    return (
        <main className="lens">
            {/* lens.css sizes the canvas, filling a phone screen and centering a 9:16 column anywhere wider */}
            <Application>
                <Scene onState={onState} />
            </Application>
            <div className="lens-hud">
                <header className="lens-bar">
                    {avatar && <img className="lens-avatar" src={avatar} alt="Your Bitmoji" />}
                    <span className="lens-score">{score}</span>
                    <span className="lens-best">Best {best}</span>
                </header>
                {card && (
                    <section className="lens-card">
                        <h1 className="lens-title">{card.title}</h1>
                        {state === 'over' && hasLeaderboard() && (
                            <button className="lens-leaderboard" onClick={showLeaderboard}>
                                Leaderboard
                            </button>
                        )}
                        <p className="lens-hint">{card.hint}</p>
                    </section>
                )}
            </div>
        </main>
    );
}

export default App;
