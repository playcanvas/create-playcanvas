import { Application, Entity } from '@playcanvas/react';
import { Camera, Collision, Light, Render, RigidBody, Script } from '@playcanvas/react/components';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { useState } from 'react';

import './starter.css';

function Body({ i }: { i: number }) {
    const type = i % 2 ? 'sphere' : 'box';
    return (
        <Entity position={[(i % 3) - 1, 3 + i * 0.7, (i % 2) - 0.5]} rotation={[i * 13, i * 29, 0]}>
            <Render type={type} />
            <Collision type={type} />
            <RigidBody type="dynamic" mass={1} restitution={0.35} />
        </Entity>
    );
}

function App() {
    const [count, setCount] = useState(7);
    const [reset, setReset] = useState(0);

    return (
        <>
            <Application usePhysics>
                <Entity name="camera" position={[8, 6, 8]}>
                    <Camera clearColor="#0d121c" />
                    <Script script={CameraControls} sceneSize={8} />
                </Entity>
                <Entity name="light" rotation={[45, 35, 0]}>
                    <Light type="directional" intensity={2} castShadows />
                </Entity>
                <Entity name="floor" position={[0, -0.1, 0]} scale={[10, 0.2, 10]}>
                    <Render type="box" />
                    <Collision type="box" halfExtents={[5, 0.1, 5]} />
                    <RigidBody type="static" />
                </Entity>
                {Array.from({ length: count }, (_, i) => (
                    <Body key={`${reset}-${i}`} i={i} />
                ))}
            </Application>
            <div className="hud">
                <section className="panel">
                    <h1>Physics Playground</h1>
                    <p>Rigid bodies, collisions and runtime spawning.</p>
                    <div className="controls">
                        <button onClick={() => setCount((value) => value + 1)}>Spawn object</button>
                        <button
                            onClick={() => {
                                setCount(7);
                                setReset((value) => value + 1);
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </section>
            </div>
        </>
    );
}

export default App;
