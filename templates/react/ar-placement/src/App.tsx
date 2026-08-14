import { Application, Entity } from '@playcanvas/react';
import { Camera, Light, Script } from '@playcanvas/react/components';
import type { Entity as PcEntity } from 'playcanvas';
import { useState } from 'react';

import { ArPlacement } from './ar-placement';
import './starter.css';

function App() {
    const [camera, setCamera] = useState<PcEntity | null>(null);

    return (
        <>
            <Application graphicsDeviceOptions={{ alpha: true, xrCompatible: true }}>
                <Entity name="camera" ref={setCamera}>
                    <Camera clearColor="#00000000" />
                </Entity>
                <Entity name="light" rotation={[45, 30, 0]}>
                    <Light type="directional" intensity={2} />
                </Entity>
                {camera && (
                    <Entity name="placement">
                        <Script script={ArPlacement} camera={camera} />
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
