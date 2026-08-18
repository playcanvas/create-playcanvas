import { Application, Entity } from '@playcanvas/react';
import { Camera, Render, Script } from '@playcanvas/react/components';
import { useMaterial } from '@playcanvas/react/hooks';

import { SpriteGame } from './sprite-game';
import './starter.css';

function App() {
    const dirt = useMaterial({ emissive: '#734729' });
    const grass = useMaterial({ emissive: '#479e57' });

    return (
        <>
            <Application>
                <Entity name="camera" position={[0, 0, 10]}>
                    <Camera projection={1} orthoHeight={4.4} clearColor="#5cb9e6" />
                </Entity>
                <Entity name="dirt" position={[0, -3.39, 0]} scale={[20, 2.6, 1]}>
                    <Render type="box" material={dirt} />
                </Entity>
                <Entity name="grass" position={[0, -2, 0]} scale={[20, 0.18, 1]}>
                    <Render type="box" material={grass} />
                </Entity>
                <Entity name="game" position={[0, -2.15, 0]}>
                    <Script script={SpriteGame} />
                </Entity>
            </Application>
            <div className="hud">
                <section className="panel">
                    <h1>Sprite Game</h1>
                    <p>Use A/D or the arrow keys to move and Space to jump.</p>
                </section>
            </div>
        </>
    );
}

export default App;
