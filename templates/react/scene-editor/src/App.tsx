import { Application, Entity } from '@playcanvas/react';
import { Camera, Light, Render, Script } from '@playcanvas/react/components';
import { useApp } from '@playcanvas/react/hooks';
import type { Entity as PcEntity } from 'playcanvas';
import { Grid } from 'playcanvas/scripts/esm/grid.mjs';
import { useEffect, useRef } from 'react';

import { SceneEditor } from './scene-editor';
import './starter.css';

function Scene() {
    const app = useApp();
    const host = useRef<PcEntity>(null);
    const camera = useRef<PcEntity>(null);
    const cube = useRef<PcEntity>(null);
    const sphere = useRef<PcEntity>(null);

    useEffect(() => {
        const node = host.current;
        const layer = app.scene.layers.getLayerByName('World');
        if (!node || !camera.current || !cube.current || !sphere.current || !layer) return;
        if (!node.script) node.addComponent('script');
        node.script!.create(SceneEditor, {
            properties: { camera: camera.current, targets: [cube.current, sphere.current], layer }
        });
        return () => {
            node.script?.destroy('sceneEditor');
        };
    }, [app]);

    return (
        <>
            <Entity name="camera" ref={camera} position={[5, 4, 6]} rotation={[-20, 40, 0]}>
                <Camera clearColor="#0a0f17" />
            </Entity>
            <Entity name="light" rotation={[45, 30, 0]}>
                <Light type="directional" intensity={2.5} />
            </Entity>
            <Entity name="grid" scale={[100, 100, 100]}>
                <Script script={Grid} />
            </Entity>
            <Entity name="cube" ref={cube} position={[-1.2, 0.5, 0]}>
                <Render type="box" />
            </Entity>
            <Entity name="sphere" ref={sphere} position={[1.2, 0.5, 0]}>
                <Render type="sphere" />
            </Entity>
            <Entity name="editor" ref={host} />
        </>
    );
}

function App() {
    return (
        <>
            <Application>
                <Scene />
            </Application>
            <div className="hud">
                <section className="panel">
                    <h1>Scene Editor</h1>
                    <p>Select an object, then translate, rotate or scale it.</p>
                    <div className="controls">
                        <button data-target="0" aria-pressed="true">
                            Cube
                        </button>
                        <button data-target="1">Sphere</button>
                    </div>
                    <div className="controls">
                        <button data-mode="translate" aria-pressed="true">
                            Move
                        </button>
                        <button data-mode="rotate">Rotate</button>
                        <button data-mode="scale">Scale</button>
                    </div>
                </section>
            </div>
        </>
    );
}

export default App;
