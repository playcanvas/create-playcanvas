import { Application, Entity } from '@playcanvas/react';
import { Camera, Light, Render, Script } from '@playcanvas/react/components';
import { useMaterial } from '@playcanvas/react/hooks';
import type { Entity as PcEntity } from 'playcanvas';
import { useState } from 'react';

import { ArPlacement } from './ar-placement';
import './starter.css';

function App() {
    const [camera, setCamera] = useState<PcEntity | null>(null);
    const [preview, setPreview] = useState<PcEntity | null>(null);
    const surface = useMaterial({ diffuse: '#474d57' });
    const cyan = useMaterial({ diffuse: '#1ab3e6' });
    const coral = useMaterial({ diffuse: '#ff5926' });

    return (
        <>
            <Application graphicsDeviceOptions={{ alpha: true, xrCompatible: true }}>
                <Entity name="camera" ref={setCamera} position={[3, 2.4, 4]} rotation={[-20, 37, 0]}>
                    <Camera clearColor="#0d141f" />
                </Entity>
                <Entity name="light" rotation={[45, 30, 0]}>
                    <Light type="directional" intensity={2} />
                </Entity>
                <Entity name="preview" ref={setPreview}>
                    <Entity name="surface" scale={[4, 0.15, 4]}>
                        <Render type="cylinder" material={surface} />
                    </Entity>
                    <Entity name="box" position={[0, 0.65, 0]}>
                        <Render type="box" material={cyan} />
                    </Entity>
                    <Entity name="reticle" position={[0, 0.12, 0]} scale={[1.5, 0.03, 1.5]}>
                        <Render type="cylinder" material={coral} />
                    </Entity>
                </Entity>
                {camera && preview && (
                    <Entity name="placement">
                        <Script script={ArPlacement} camera={camera} preview={preview} />
                    </Entity>
                )}
            </Application>
            <div className="hud">
                <section className="panel">
                    <h1>AR Placement</h1>
                    <p id="xr-status">Checking AR support…</p>
                    <div className="controls">
                        <button id="xr-button" disabled>
                            Start AR
                        </button>
                    </div>
                </section>
            </div>
        </>
    );
}

export default App;
