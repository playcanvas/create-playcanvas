import { Application, Entity } from '@playcanvas/react';
import { Camera, Light, Render } from '@playcanvas/react/components';
import { useApp } from '@playcanvas/react/hooks';
import type { Entity as PcEntity } from 'playcanvas';
import { useEffect, useRef } from 'react';

import './starter.css';
import { setupVr } from './vr';

function Scene() {
    const app = useApp();
    const rig = useRef<PcEntity>(null);
    const camera = useRef<PcEntity>(null);

    useEffect(() => {
        if (rig.current && camera.current) return setupVr(app, rig.current, camera.current);
    }, [app]);

    return (
        <>
            <Entity name="light" rotation={[45, 30, 0]}>
                <Light type="directional" intensity={2} />
            </Entity>
            <Entity name="floor" scale={[10, 1, 10]}>
                <Render type="plane" />
            </Entity>
            {Array.from({ length: 12 }, (_, i) => (
                <Entity
                    key={i}
                    position={[Math.sin(i) * 3, 0.5 + (i % 3) * 0.6, Math.cos(i) * 3]}
                    scale={[0.4, 0.4, 0.4]}
                >
                    <Render type="box" />
                </Entity>
            ))}
            <Entity name="xr-rig" ref={rig}>
                <Entity name="camera" ref={camera} position={[0, 1.6, 4]}>
                    <Camera clearColor="#0a0f17" />
                </Entity>
            </Entity>
        </>
    );
}

function App() {
    return (
        <>
            <Application graphicsDeviceOptions={{ xrCompatible: true }}>
                <Scene />
            </Application>
            <div className="hud">
                <section className="panel">
                    <h1>VR Starter</h1>
                    <p id="xr-status">Checking VR support…</p>
                    <div className="controls">
                        <button id="xr-button" disabled>
                            Enter VR
                        </button>
                    </div>
                </section>
            </div>
        </>
    );
}

export default App;
