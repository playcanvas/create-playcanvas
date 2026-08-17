import { Application, Entity } from '@playcanvas/react';
import { Camera, Collision, Light, Render, RigidBody } from '@playcanvas/react/components';
import { useMaterial, usePhysics } from '@playcanvas/react/hooks';
import type { Entity as PcEntity, StandardMaterial } from 'playcanvas';
import { useEffect, useRef } from 'react';

import { addFirstPersonController } from './controller';
import './starter.css';

function Block({
    name,
    position,
    scale,
    material
}: {
    name: string;
    position: [number, number, number];
    scale: [number, number, number];
    material: StandardMaterial;
}) {
    return (
        <Entity name={name} position={position} scale={scale}>
            <Render type="box" material={material} />
            <Collision type="box" halfExtents={[scale[0] / 2, scale[1] / 2, scale[2] / 2]} />
            <RigidBody type="static" />
        </Entity>
    );
}

function Scene() {
    const player = useRef<PcEntity>(null);
    const camera = useRef<PcEntity>(null);
    const { isPhysicsLoaded } = usePhysics();
    const floor = useMaterial({ diffuse: '#ab9c85', emissive: '#22201b', gloss: 0.2 });
    const wall = useMaterial({ diffuse: '#c2bdb0', emissive: '#272623', gloss: 0.25 });
    const blue = useMaterial({ diffuse: '#154a7a', emissive: '#040f18', gloss: 0.4 });
    const green = useMaterial({ diffuse: '#2e6638', emissive: '#09140b', gloss: 0.2 });

    useEffect(() => {
        if (isPhysicsLoaded && player.current && camera.current) {
            return addFirstPersonController(player.current, camera.current);
        }
    }, [isPhysicsLoaded]);

    return (
        <>
            <Entity name="light" rotation={[50, 30, 0]}>
                <Light type="directional" intensity={2.5} castShadows shadowBias={0.2} normalOffsetBias={0.05} />
            </Entity>
            <Entity name="fill" rotation={[-25, -140, 0]}>
                <Light type="directional" intensity={0.8} />
            </Entity>
            <Block name="floor" position={[0, -0.1, 0]} scale={[18, 0.2, 18]} material={floor} />
            <Block name="back-wall" position={[0, 1.5, -9]} scale={[18, 3, 0.3]} material={wall} />
            <Block name="left-wall" position={[-9, 1.5, 0]} scale={[0.3, 3, 18]} material={wall} />
            <Block name="right-wall" position={[9, 1.5, 0]} scale={[0.3, 3, 18]} material={wall} />
            <Block name="blue-crate" position={[-2, 0.75, -3]} scale={[1.5, 1.5, 1.5]} material={blue} />
            <Block name="green-crate" position={[3, 0.5, 1]} scale={[2.5, 1, 1]} material={green} />
            <Entity name="player" ref={player} position={[0, 1, 5]}>
                <Collision type="capsule" radius={0.45} height={1.8} />
                <RigidBody type="dynamic" mass={80} angularFactor={[0, 0, 0]} />
                <Entity name="camera" ref={camera} position={[0, 0.65, 0]}>
                    <Camera clearColor="#61a3db" fov={80} />
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
            </div>
        </>
    );
}

export default App;
