import { Application, Entity } from '@playcanvas/react';
import { Camera, Collision, Light, Render, RigidBody } from '@playcanvas/react/components';
import { useMaterial, usePhysics } from '@playcanvas/react/hooks';
import type { Entity as PcEntity } from 'playcanvas';
import { useEffect, useRef } from 'react';

import { addThirdPersonController } from './controller';
import './starter.css';

function Scene() {
    const player = useRef<PcEntity>(null);
    const camera = useRef<PcEntity>(null);
    const model = useRef<PcEntity>(null);
    const { isPhysicsLoaded } = usePhysics();
    const shirt = useMaterial({ diffuse: '#268bd2' });
    const skin = useMaterial({ diffuse: '#c78759' });
    const pants = useMaterial({ diffuse: '#2e4a85' });
    const ground = useMaterial({ diffuse: '#527a45' });
    const rock = useMaterial({ diffuse: '#61696e' });

    useEffect(() => {
        if (isPhysicsLoaded && player.current && camera.current && model.current) {
            return addThirdPersonController(player.current, camera.current, model.current);
        }
    }, [isPhysicsLoaded]);

    return (
        <>
            <Entity name="camera" ref={camera} position={[0, 3, 6]}>
                <Camera clearColor="#7ab8e6" />
            </Entity>
            <Entity name="light" rotation={[45, 30, 0]}>
                <Light type="directional" intensity={2.5} castShadows shadowBias={0.2} normalOffsetBias={0.05} />
            </Entity>
            <Entity name="ground" position={[0, -0.1, 0]} scale={[20, 0.2, 20]}>
                <Render type="box" material={ground} />
                <Collision type="box" halfExtents={[10, 0.1, 10]} />
                <RigidBody type="static" />
            </Entity>
            {[
                [-4.5, 0.25, -3.5],
                [4.2, 0.2, -2.8],
                [-3.7, 0.18, 3.2],
                [3.8, 0.28, 3.6]
            ].map((position, i) => (
                <Entity
                    key={i}
                    position={position as [number, number, number]}
                    rotation={[0, i * 25, 0]}
                    scale={[0.9, 0.5, 0.7]}
                >
                    <Render type="box" material={rock} />
                </Entity>
            ))}
            <Entity name="player" ref={player} position={[0, 1, 0]}>
                <Collision type="capsule" radius={0.45} height={1.8} />
                <RigidBody type="dynamic" mass={70} angularFactor={[0, 0, 0]} />
                <Entity name="character" ref={model}>
                    <Entity name="body" scale={[0.56, 0.88, 0.38]}>
                        <Render type="box" material={shirt} />
                    </Entity>
                    <Entity name="head" position={[0, 0.76, 0]} scale={[0.52, 0.6, 0.52]}>
                        <Render type="box" material={skin} />
                    </Entity>
                    <Entity name="left-arm" position={[-0.38, 0, 0]} scale={[0.18, 0.88, 0.32]}>
                        <Render type="box" material={shirt} />
                    </Entity>
                    <Entity name="right-arm" position={[0.38, 0, 0]} scale={[0.18, 0.88, 0.32]}>
                        <Render type="box" material={shirt} />
                    </Entity>
                    <Entity name="left-leg" position={[-0.15, -0.87, 0]} scale={[0.26, 0.86, 0.34]}>
                        <Render type="box" material={pants} />
                    </Entity>
                    <Entity name="right-leg" position={[0.15, -0.87, 0]} scale={[0.26, 0.86, 0.34]}>
                        <Render type="box" material={pants} />
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
                    <p>Click the scene, then use WASD to move, mouse to orbit and Space to jump.</p>
                </section>
            </div>
        </>
    );
}

export default App;
