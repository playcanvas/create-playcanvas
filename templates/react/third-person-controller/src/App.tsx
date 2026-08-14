import { Application, Entity } from '@playcanvas/react';
import { Camera, Collision, Light, Render, RigidBody } from '@playcanvas/react/components';
import { usePhysics } from '@playcanvas/react/hooks';
import type { Entity as PcEntity } from 'playcanvas';
import { useEffect, useRef } from 'react';

import { addThirdPersonController } from './controller';
import './starter.css';

function Scene() {
    const player = useRef<PcEntity>(null);
    const camera = useRef<PcEntity>(null);
    const model = useRef<PcEntity>(null);
    const { isPhysicsLoaded } = usePhysics();

    useEffect(() => {
        if (isPhysicsLoaded && player.current && camera.current && model.current) {
            return addThirdPersonController(player.current, camera.current, model.current);
        }
    }, [isPhysicsLoaded]);

    return (
        <>
            <Entity name="camera" ref={camera} position={[0, 3, 6]}>
                <Camera clearColor="#0f1421" />
            </Entity>
            <Entity name="light" rotation={[45, 30, 0]}>
                <Light type="directional" intensity={2.5} castShadows />
            </Entity>
            <Entity name="ground" position={[0, -0.1, 0]} scale={[20, 0.2, 20]}>
                <Render type="box" />
                <Collision type="box" />
                <RigidBody type="static" />
            </Entity>
            <Entity name="player" ref={player} position={[0, 1, 0]}>
                <Collision type="capsule" radius={0.45} height={1.8} />
                <RigidBody type="dynamic" mass={70} angularFactor={[0, 0, 0]} />
                <Entity name="robot" ref={model}>
                    <Entity name="body" scale={[0.8, 0.9, 0.45]}>
                        <Render type="box" />
                    </Entity>
                    <Entity name="head" position={[0, 0.72, 0]} scale={[0.55, 0.55, 0.55]}>
                        <Render type="sphere" />
                    </Entity>
                    <Entity name="left-arm" position={[-0.58, 0, 0]} scale={[0.22, 0.85, 0.22]}>
                        <Render type="box" />
                    </Entity>
                    <Entity name="right-arm" position={[0.58, 0, 0]} scale={[0.22, 0.85, 0.22]}>
                        <Render type="box" />
                    </Entity>
                    <Entity name="left-leg" position={[-0.24, -0.85, 0]} scale={[0.28, 0.8, 0.3]}>
                        <Render type="box" />
                    </Entity>
                    <Entity name="right-leg" position={[0.24, -0.85, 0]} scale={[0.28, 0.8, 0.3]}>
                        <Render type="box" />
                    </Entity>
                </Entity>
            </Entity>
        </>
    );
}

function App() {
    return (
        <>
            <Application usePhysics>
                <Scene />
            </Application>
            <div className="hud">
                <section className="panel">
                    <h1>Third-Person Controller</h1>
                    <p>Use WASD to move, Space to jump and drag to orbit.</p>
                </section>
            </div>
        </>
    );
}

export default App;
