import { Application, Entity } from '@playcanvas/react';
import { Camera, Light, Render } from '@playcanvas/react/components';
import { useApp, useMaterial } from '@playcanvas/react/hooks';
import type { Entity as PcEntity } from 'playcanvas';
import { useEffect, useRef } from 'react';

import './starter.css';
import { setupVr } from './vr';

function Scene() {
    const app = useApp();
    const rig = useRef<PcEntity>(null);
    const camera = useRef<PcEntity>(null);
    const floor = useMaterial({ diffuse: '#61666e' });
    const wall = useMaterial({ diffuse: '#3d424a' });
    const cyan = useMaterial({ diffuse: '#1fb3db' });
    const coral = useMaterial({ diffuse: '#ff594d' });
    const yellow = useMaterial({ diffuse: '#ffbf33' });

    useEffect(() => {
        if (rig.current && camera.current) return setupVr(app, rig.current, camera.current);
    }, [app]);

    return (
        <>
            <Entity name="light" rotation={[45, 30, 0]}>
                <Light type="directional" intensity={2} castShadows shadowBias={0.2} normalOffsetBias={0.05} />
            </Entity>
            <Entity name="floor" scale={[10, 1, 10]}>
                <Render type="plane" material={floor} />
            </Entity>
            {[
                ['back-wall', [0, 2, -3.5], [8, 4, 0.2]],
                ['left-wall', [-4, 2, 0], [0.2, 4, 7]],
                ['right-wall', [4, 2, 0], [0.2, 4, 7]]
            ].map(([name, position, scale]) => (
                <Entity
                    key={name as string}
                    name={name as string}
                    position={position as [number, number, number]}
                    scale={scale as [number, number, number]}
                >
                    <Render type="box" material={wall} />
                </Entity>
            ))}
            {[
                [-2.4, cyan],
                [0, coral],
                [2.4, yellow]
            ].map(([x, material], i) => (
                <Entity key={i} position={[x as number, 2.4, -3.35]} scale={[1.3, 1.3, 0.12]}>
                    <Render type="box" material={material as never} />
                </Entity>
            ))}
            {[-2.4, 0, 2.4].map((x) => (
                <Entity key={x} position={[x, 0.45, -1.6]} scale={[1, 0.9, 1]}>
                    <Render type="box" material={wall} />
                </Entity>
            ))}
            <Entity position={[-2.4, 1.35, -1.6]} scale={[0.7, 0.7, 0.7]}>
                <Render type="sphere" material={cyan} />
            </Entity>
            <Entity position={[0, 1.35, -1.6]} scale={[0.7, 0.7, 0.7]}>
                <Render type="box" material={coral} />
            </Entity>
            <Entity position={[2.4, 1.35, -1.6]} scale={[0.8, 0.9, 0.8]}>
                <Render type="cone" material={yellow} />
            </Entity>
            <Entity name="xr-rig" ref={rig}>
                <Entity name="camera" ref={camera} position={[0, 1.6, 4]}>
                    <Camera clearColor="#292e38" />
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
