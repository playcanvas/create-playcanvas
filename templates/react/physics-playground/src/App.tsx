import { Application, Entity } from '@playcanvas/react';
import { Camera, Collision, Light, Render, RigidBody, Script } from '@playcanvas/react/components';
import { useMaterial } from '@playcanvas/react/hooks';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { useState } from 'react';

import './starter.css';

const COLORS = ['#29ade6', '#f25738', '#f9ad2e'];
const TYPES = ['box', 'sphere', 'capsule', 'cylinder'] as const;
const SCALES: [number, number, number][] = [
    [0.9, 0.9, 0.9],
    [0.9, 0.9, 0.9],
    [0.7, 1.1, 0.7],
    [0.8, 1.1, 0.8]
];

function Body({ i }: { i: number }) {
    const type = TYPES[i % TYPES.length];
    const material = useMaterial({ diffuse: COLORS[i % COLORS.length], gloss: 0.45 });
    return (
        <Entity
            position={[((i % 4) - 1.5) * 1.1, 0.7 + Math.floor(i / 4) * 1.1, (Math.floor(i / 4) - 1) * 1.4]}
            rotation={[i * 13, i * 29, 0]}
            scale={SCALES[i % SCALES.length]}
        >
            <Render type={type} material={material} />
            <Collision type={type} />
            <RigidBody type="dynamic" mass={1} restitution={0.35} />
        </Entity>
    );
}

function Floor() {
    const material = useMaterial({ diffuse: '#2e333d', gloss: 0.2 });
    return (
        <Entity name="floor" position={[0, -0.1, 0]} scale={[10, 0.2, 10]}>
            <Render type="box" material={material} />
            <Collision type="box" halfExtents={[5, 0.1, 5]} />
            <RigidBody type="static" />
        </Entity>
    );
}

function App() {
    const [count, setCount] = useState(12);
    const [reset, setReset] = useState(0);

    return (
        <>
            <Application usePhysics>
                <Entity name="camera" position={[10, 8, 10]} rotation={[-23, 45, 0]}>
                    <Camera clearColor="#0d121c" />
                    <Script script={CameraControls} sceneSize={10} />
                </Entity>
                <Entity name="light" rotation={[45, 35, 0]}>
                    <Light type="directional" intensity={2.5} castShadows shadowBias={0.2} normalOffsetBias={0.05} />
                </Entity>
                <Floor />
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
                                setCount(12);
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
