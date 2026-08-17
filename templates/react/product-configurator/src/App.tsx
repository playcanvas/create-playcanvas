import { Application, Entity } from '@playcanvas/react';
import { Camera, Light, Render, Script } from '@playcanvas/react/components';
import { useMaterial } from '@playcanvas/react/hooks';
import type { StandardMaterial } from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { useState } from 'react';

import './starter.css';

const COLORS = ['#41b6e6', '#ff6b6b', '#f7c948'];

function Chair({ material }: { material: StandardMaterial }) {
    return (
        <Entity name="chair">
            <Entity position={[0, 0.8, 0]} scale={[1.6, 0.18, 1.6]}>
                <Render type="box" material={material} />
            </Entity>
            <Entity position={[0, 1.65, 0.7]} scale={[1.6, 1.5, 0.18]}>
                <Render type="box" material={material} />
            </Entity>
            {[-0.65, 0.65].flatMap((x) =>
                [-0.65, 0.65].map((z) => (
                    <Entity key={`${x}-${z}`} position={[x, 0.35, z]} scale={[0.14, 0.7, 0.14]}>
                        <Render type="cylinder" material={material} />
                    </Entity>
                ))
            )}
        </Entity>
    );
}

function Product({ product, material }: { product: number; material: StandardMaterial }) {
    if (product === 0) return <Chair material={material} />;
    if (product === 1) {
        return (
            <Entity name="lamp">
                <Entity position={[0, 0.12, 0]} scale={[1.3, 0.24, 1.3]}>
                    <Render type="cylinder" material={material} />
                </Entity>
                <Entity position={[0, 1.25, 0]} scale={[0.16, 2.3, 0.16]}>
                    <Render type="cylinder" material={material} />
                </Entity>
                <Entity position={[0, 2.35, 0]} scale={[1.4, 1.2, 1.4]}>
                    <Render type="cone" material={material} />
                </Entity>
            </Entity>
        );
    }

    return (
        <Entity name="speaker">
            <Entity position={[0, 1.15, 0]} scale={[1.5, 2.3, 0.8]}>
                <Render type="box" material={material} />
            </Entity>
            <Entity position={[0, 0.85, 0.43]} rotation={[90, 0, 0]} scale={[0.75, 0.12, 0.75]}>
                <Render type="cylinder" material={material} />
            </Entity>
            <Entity position={[0, 1.65, 0.43]} rotation={[90, 0, 0]} scale={[0.35, 0.12, 0.35]}>
                <Render type="cylinder" material={material} />
            </Entity>
        </Entity>
    );
}

function Scene({ product, color }: { product: number; color: string }) {
    const material = useMaterial({ diffuse: color, metalness: 0.15, gloss: 0.65 });

    return (
        <>
            <Entity name="camera" position={[4, 2.6, 5]}>
                <Camera clearColor="#0a0f17" />
                <Script script={CameraControls} sceneSize={4} />
            </Entity>
            <Entity name="light" rotation={[45, 35, 0]}>
                <Light type="directional" intensity={2.5} />
            </Entity>
            <Product product={product} material={material} />
        </>
    );
}

function App() {
    const [product, setProduct] = useState(0);
    const [color, setColor] = useState(COLORS[0]);

    return (
        <>
            <Application>
                <Scene product={product} color={color} />
            </Application>
            <div className="hud">
                <section className="panel">
                    <h1>Product Configurator</h1>
                    <p>Switch the model and finish, then drag to orbit.</p>
                    <div className="controls">
                        {['Chair', 'Lamp', 'Speaker'].map((name, i) => (
                            <button key={name} aria-pressed={product === i} onClick={() => setProduct(i)}>
                                {name}
                            </button>
                        ))}
                    </div>
                    <div className="controls">
                        {COLORS.map((value) => (
                            <button
                                key={value}
                                className="swatch"
                                style={{ '--color': value } as React.CSSProperties}
                                aria-label={value}
                                onClick={() => setColor(value)}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}

export default App;
