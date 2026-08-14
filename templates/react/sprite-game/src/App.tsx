import { Application, Entity } from '@playcanvas/react';
import { Camera, Render, Script } from '@playcanvas/react/components';

import { SpriteGame } from './sprite-game';
import './starter.css';

function App() {
    return (
        <>
            <Application>
                <Entity name="camera" position={[0, 1, 10]}>
                    <Camera projection={1} orthoHeight={5} clearColor="#0d121c" />
                </Entity>
                <Entity name="ground" position={[0, -2.1, 0]} scale={[20, 0.2, 1]}>
                    <Render type="box" />
                </Entity>
                <Entity name="game">
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
