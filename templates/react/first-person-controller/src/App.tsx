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
    const floor = useMaterial({ diffuse: '#474d52', emissive: '#0e0f10', gloss: 0.2 });
    const wall = useMaterial({ diffuse: '#6b737a', emissive: '#151718', gloss: 0.25 });
    const blue = useMaterial({ diffuse: '#154a7a', emissive: '#040f18', gloss: 0.4 });
    const green = useMaterial({ diffuse: '#2e6638', emissive: '#09140b', gloss: 0.2 });
    const wood = useMaterial({ diffuse: '#7a451a', emissive: '#180e05', gloss: 0.2 });
    const metal = useMaterial({ diffuse: '#475461', emissive: '#0e1113', gloss: 0.5 });

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
            <Block name="front-wall" position={[0, 1.5, 9]} scale={[18, 3, 0.3]} material={wall} />
            <Block name="left-wall" position={[-9, 1.5, 0]} scale={[0.3, 3, 18]} material={wall} />
            <Block name="right-wall" position={[9, 1.5, 0]} scale={[0.3, 3, 18]} material={wall} />
            <Block name="blue-crate" position={[-2, 0.75, -3]} scale={[1.5, 1.5, 1.5]} material={blue} />
            <Block name="green-crate" position={[3, 0.5, 1]} scale={[2.5, 1, 1]} material={green} />
            <Block name="cargo-left-0" position={[-5.5, 0.75, -5.5]} scale={[2, 1.5, 2]} material={wood} />
            <Block name="cargo-left-1" position={[-5.5, 2, -5.5]} scale={[1.5, 1, 1.5]} material={blue} />
            <Block name="cargo-right-0" position={[5.3, 0.6, -4.8]} scale={[2.4, 1.2, 2]} material={green} />
            <Block name="cargo-right-1" position={[5.3, 1.7, -4.8]} scale={[1.5, 1, 1.5]} material={wood} />
            <Block name="cargo-center" position={[0, 0.6, -6.5]} scale={[2.2, 1.2, 1.8]} material={blue} />
            {[-3.5, 0, 3.5].flatMap((z, i) => [
                <Block
                    key={`left-${i}`}
                    name={`shelf-left-post-${i}`}
                    position={[-6.8, 1.4, z]}
                    scale={[0.25, 2.8, 0.25]}
                    material={metal}
                />,
                <Block
                    key={`right-${i}`}
                    name={`shelf-right-post-${i}`}
                    position={[6.8, 1.4, z]}
                    scale={[0.25, 2.8, 0.25]}
                    material={metal}
                />
            ])}
            <Block name="shelf-left-low" position={[-6.8, 0.65, 0]} scale={[1.1, 0.18, 7.5]} material={metal} />
            <Block name="shelf-left-high" position={[-6.8, 2.1, 0]} scale={[1.1, 0.18, 7.5]} material={metal} />
            <Block name="shelf-right-low" position={[6.8, 0.65, 0]} scale={[1.1, 0.18, 7.5]} material={metal} />
            <Block name="shelf-right-high" position={[6.8, 2.1, 0]} scale={[1.1, 0.18, 7.5]} material={metal} />
            <Block name="pallet" position={[-2.5, 0.15, 2.5]} scale={[3, 0.3, 2]} material={wood} />
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
