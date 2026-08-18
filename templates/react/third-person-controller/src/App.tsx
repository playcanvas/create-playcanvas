import { Application, Entity } from '@playcanvas/react';
import { Camera, Collision, Light, Render, RigidBody } from '@playcanvas/react/components';
import { useMaterial, usePhysics } from '@playcanvas/react/hooks';
import type { Entity as PcEntity, StandardMaterial } from 'playcanvas';
import { useEffect, useRef } from 'react';

import { addThirdPersonController } from './controller';
import './starter.css';

const BLOCK_SCALE: [number, number, number] = [2.4, 1, 2.4];
const BLOCK_HALF_EXTENTS: [number, number, number] = [1.2, 0.5, 1.2];
const BLOCKS: [number, number, number][] = [
    [-4.5, 0.5, -3.5],
    [4.2, 0.5, -2.8],
    [-3.7, 0.5, 3.2],
    [3.8, 0.5, 3.6]
];
const TREES: [number, number, number][] = [
    [-7, -6, 1.1],
    [6.5, -6.5, 1.25],
    [-7.5, 5, 0.9],
    [7, 5.5, 1.15],
    [-2.2, -8, 0.85]
];
const PINE_LAYERS: [number, number, number][] = [
    [1.9, 2.1, 1.8],
    [2.65, 1.6, 1.55],
    [3.3, 1.1, 1.4]
];

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

function Pine({
    name,
    position: [x, z],
    size,
    wood,
    leaves,
    tips
}: {
    name: string;
    position: [number, number];
    size: number;
    wood: StandardMaterial;
    leaves: StandardMaterial;
    tips: StandardMaterial;
}) {
    return (
        <>
            <Block
                name={`${name}-trunk`}
                position={[x, size * 0.9, z]}
                scale={[size * 0.38, size * 1.8, size * 0.38]}
                material={wood}
            />
            {PINE_LAYERS.map(([y, width, height], i) => (
                <Entity
                    key={i}
                    name={`${name}-crown-${i}`}
                    position={[x, size * y, z]}
                    scale={[size * width, size * height, size * width]}
                >
                    <Render type="cone" material={i === 1 ? tips : leaves} />
                </Entity>
            ))}
        </>
    );
}

function Scene() {
    const player = useRef<PcEntity>(null);
    const camera = useRef<PcEntity>(null);
    const model = useRef<PcEntity>(null);
    const { isPhysicsLoaded } = usePhysics();
    const shirt = useMaterial({ diffuse: '#268bd2' });
    const skin = useMaterial({ diffuse: '#c78759' });
    const pants = useMaterial({ diffuse: '#2e4a85' });
    const ground = useMaterial({ diffuse: '#33662e' });
    const block = useMaterial({ diffuse: '#57594d' });
    const wood = useMaterial({ diffuse: '#572e14' });
    const leaves = useMaterial({ diffuse: '#144d1f' });
    const tips = useMaterial({ diffuse: '#1f6629' });

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
            {BLOCKS.map((position, i) => (
                <Entity key={i} name={`block-${i}`} position={position} rotation={[0, i * 25, 0]} scale={BLOCK_SCALE}>
                    <Render type="box" material={block} />
                    <Collision type="box" halfExtents={BLOCK_HALF_EXTENTS} />
                    <RigidBody type="static" />
                </Entity>
            ))}
            {TREES.map(([x, z, size], i) => (
                <Pine
                    key={i}
                    name={`tree-${i}`}
                    position={[x, z]}
                    size={size}
                    wood={wood}
                    leaves={leaves}
                    tips={tips}
                />
            ))}
            <Block name="fallen-log" position={[0, 0.35, 6]} scale={[3.8, 0.7, 0.7]} material={wood} />
            <Block name="stump" position={[-1.8, 0.4, -2.2]} scale={[0.9, 0.8, 0.9]} material={wood} />
            <Entity name="player" ref={player} position={[0, 1.1, 0]}>
                <Collision type="capsule" radius={0.5} height={2.4} linearOffset={[0, 0.1, 0]} />
                <RigidBody type="dynamic" mass={70} angularFactor={[0, 0, 0]} />
                <Entity name="character" ref={model} position={[0, 0.2, 0]}>
                    <Entity name="body" scale={[0.56, 0.88, 0.38]}>
                        <Render type="box" material={shirt} />
                    </Entity>
                    <Entity name="head" position={[0, 0.76, 0]} scale={[0.52, 0.6, 0.52]}>
                        <Render type="box" material={skin} />
                    </Entity>
                    <Entity name="left-arm" position={[-0.38, 0.44, 0]}>
                        <Entity position={[0, -0.44, 0]} scale={[0.18, 0.88, 0.32]}>
                            <Render type="box" material={shirt} />
                        </Entity>
                    </Entity>
                    <Entity name="right-arm" position={[0.38, 0.44, 0]}>
                        <Entity position={[0, -0.44, 0]} scale={[0.18, 0.88, 0.32]}>
                            <Render type="box" material={shirt} />
                        </Entity>
                    </Entity>
                    <Entity name="left-leg" position={[-0.15, -0.44, 0]}>
                        <Entity position={[0, -0.43, 0]} scale={[0.24, 0.86, 0.34]}>
                            <Render type="box" material={pants} />
                        </Entity>
                    </Entity>
                    <Entity name="right-leg" position={[0.15, -0.44, 0]}>
                        <Entity position={[0, -0.43, 0]} scale={[0.24, 0.86, 0.34]}>
                            <Render type="box" material={pants} />
                        </Entity>
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
