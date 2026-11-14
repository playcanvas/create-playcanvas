import { Application, Entity } from '@playcanvas/react';
import { Camera, Collision, Light, RigidBody, Script } from '@playcanvas/react/components';
import { useAppEvent, useModel, usePhysics } from '@playcanvas/react/hooks';
import type { Entity as PcEntity } from 'playcanvas';
import { SHADOW_PCF5_32F, TONEMAP_ACES2 } from 'playcanvas';
import { ProceduralSky } from 'playcanvas/scripts/esm/sky/procedural-sky.mjs';
import { useCallback, useRef, useState } from 'react';

import { CARDS, Game } from './game';
import type { GameEvents, GameState } from './game';
import './game.css';
import './starter.css';

// Swap this for your own level - files in public/ are served next to index.html, so use a ./ path.
// The game finds its nodes by name: a mesh called `level` to look at, one called `collision` to
// stand on, any number called `orb-…` to collect, and one called `spawn` where the player starts
const LEVEL_URL = './level.glb';

function Scene({
    onState,
    onJoystick
}: {
    onState: GameEvents['game:state'];
    onJoystick: GameEvents['joystick:left'];
}) {
    const [sun, setSun] = useState<PcEntity | null>(null);
    const [player, setPlayer] = useState<PcEntity | null>(null);
    const [camera, setCamera] = useState<PcEntity | null>(null);
    const { asset: level } = useModel(LEVEL_URL);
    const { isPhysicsLoaded } = usePhysics();

    useAppEvent<GameEvents>('game:state', onState);
    useAppEvent<GameEvents>('joystick:left', onJoystick);

    return (
        <>
            {/* The sun is a directional light that the sky keeps pointing the way its own sun does.
                Its shadows reach 45 m, far enough to cross the yard from any corner, split into
                four cascades because one shadow map over that distance is too coarse up close */}
            <Entity name="sun" ref={setSun}>
                <Light
                    type="directional"
                    intensity={2}
                    castShadows
                    shadowDistance={45}
                    numCascades={4}
                    shadowResolution={2048}
                    shadowType={SHADOW_PCF5_32F}
                    shadowBias={0.2}
                    normalOffsetBias={0.05}
                />
            </Entity>

            {/* The procedural sky is both the background and the ambient light. Its default
                luminance is scene-scale bright, so turn it down to keep the yard out of clipping */}
            <Entity name="sky">
                {sun && <Script script={ProceduralSky} luminance={0.3} azimuth={150} elevation={45} sunLight={sun} />}
            </Entity>

            {/* The sky lights the shade blue. A warm light from the other side, with no shadows of
                its own, stands in for the sunlight the ground bounces back, so the shade stays soft
                and the sand warm */}
            <Entity name="fill" rotation={[60, -30, 0]}>
                <Light type="directional" intensity={0.7} color="#ffdbb3" />
            </Entity>

            {/* The player is a capsule the physics moves, with the camera at eye height. The game
                places it at the level's spawn point and gives it a first-person controller */}
            <Entity name="player" ref={setPlayer}>
                <Collision type="capsule" radius={0.45} height={1.8} />
                <RigidBody type="dynamic" mass={80} angularFactor={[0, 0, 0]} />
                {/* The sky is HDR, so the camera needs tone mapping to bring it back into
                    displayable range */}
                <Entity name="camera" ref={setCamera} position={[0, 0.65, 0]}>
                    <Camera fov={80} toneMapping={TONEMAP_ACES2} />
                </Entity>
            </Entity>

            {/* The game needs the level loaded, physics running and the player in the scene */}
            {level && isPhysicsLoaded && player && camera && (
                <Entity name="game">
                    <Script script={Game} level={level} player={player} camera={camera} />
                </Entity>
            )}
        </>
    );
}

function App() {
    const [hud, setHud] = useState<{ state: GameState; found: number; total: number; seconds: number }>();
    const joystick = useRef<HTMLDivElement>(null);
    const knob = useRef<HTMLDivElement>(null);

    // The HUD follows the game's state
    const onState = useCallback<GameEvents['game:state']>((state, found, total, seconds) => {
        setHud({ state, found, total, seconds });
    }, []);

    // A thumb on the left of the screen steers, and the circle and knob show where it is. They move
    // with every touch event, so they are placed directly rather than through React state
    const onJoystick = useCallback<GameEvents['joystick:left']>((baseX, baseY, knobX, knobY) => {
        if (!joystick.current || !knob.current) return;
        joystick.current.hidden = knob.current.hidden = baseX < 0;
        joystick.current.style.left = `${baseX}px`;
        joystick.current.style.top = `${baseY}px`;
        knob.current.style.left = `${knobX}px`;
        knob.current.style.top = `${knobY}px`;
    }, []);

    const card = hud && CARDS[hud.state];

    return (
        <>
            <Application usePhysics>
                <Scene onState={onState} onJoystick={onJoystick} />
            </Application>
            <div className="hud">
                {hud && (
                    <header className="status">
                        <span>
                            {hud.found} / {hud.total}
                        </span>
                        <span>{hud.seconds}s</span>
                    </header>
                )}
                {card && (
                    <section className="panel card">
                        <h1>{card.title}</h1>
                        <p>{card.hint}</p>
                    </section>
                )}
                <div className="crosshair" />
                <div className="joystick" ref={joystick} hidden />
                <div className="joystick-knob" ref={knob} hidden />
            </div>
        </>
    );
}

export default App;
