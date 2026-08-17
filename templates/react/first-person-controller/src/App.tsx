import { Application, Entity } from '@playcanvas/react';
import { Camera, Collision, Light, Render, RigidBody } from '@playcanvas/react/components';
import { usePhysics } from '@playcanvas/react/hooks';
import type { Entity as PcEntity } from 'playcanvas';
import { useEffect, useRef } from 'react';

import { addFirstPersonController } from './controller';
import './starter.css';

function Scene() {
    const player = useRef<PcEntity>(null);
    const camera = useRef<PcEntity>(null);
    const { isPhysicsLoaded } = usePhysics();

    useEffect(() => {
        if (isPhysicsLoaded && player.current && camera.current) {
            return addFirstPersonController(player.current, camera.current);
        }
    }, [isPhysicsLoaded]);

    return (
        <>
            <Entity name="light" rotation={[50, 30, 0]}>
                <Light type="directional" intensity={2.5} />
            </Entity>
            <Entity name="floor" position={[0, -0.1, 0]} scale={[18, 0.2, 18]}>
                <Render type="box" />
                <Collision type="box" halfExtents={[9, 0.1, 9]} />
                <RigidBody type="static" />
            </Entity>
            <Entity name="crate" position={[-2, 0.75, -3]} scale={[1.5, 1.5, 1.5]}>
                <Render type="box" />
                <Collision type="box" halfExtents={[0.75, 0.75, 0.75]} />
                <RigidBody type="static" />
            </Entity>
            <Entity name="crate" position={[3, 0.5, 1]} scale={[2.5, 1, 1]}>
                <Render type="box" />
                <Collision type="box" halfExtents={[1.25, 0.5, 0.5]} />
                <RigidBody type="static" />
            </Entity>
            <Entity name="player" ref={player} position={[0, 1, 5]}>
                <Collision type="capsule" radius={0.45} height={1.8} />
                <RigidBody type="dynamic" mass={80} angularFactor={[0, 0, 0]} />
                <Entity name="camera" ref={camera} position={[0, 0.65, 0]}>
                    <Camera clearColor="#0f1421" />
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
                    <h1>First-Person Controller</h1>
                    <p>Click the scene, then use WASD, mouse look and Space to jump.</p>
                </section>
                <span className="crosshair" />
            </div>
        </>
    );
}

export default App;
