import { Application, Entity } from '@playcanvas/react';
import { Camera, Light, Script } from '@playcanvas/react/components';
import { useApp, useAppEvent } from '@playcanvas/react/hooks';
import type { Entity as PcEntity } from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { Grid } from 'playcanvas/scripts/esm/grid.mjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { SceneEditor } from './scene-editor';
import type { EditorEvents, Mode, Shape } from './scene-editor';
import './starter.css';

const MODES: { mode: Mode; label: string }[] = [
    { mode: 'translate', label: 'Move' },
    { mode: 'rotate', label: 'Rotate' },
    { mode: 'scale', label: 'Scale' }
];
const SHAPES: Shape[] = ['box', 'sphere', 'cone'];

function Scene({
    editor,
    mode,
    onSelect
}: {
    editor: RefObject<SceneEditor | null>;
    mode: Mode;
    onSelect: EditorEvents['editor:select'];
}) {
    const app = useApp();

    // the editor needs the camera's entity, which exists once the camera has rendered
    const [camera, setCamera] = useState<PcEntity | null>(null);

    useAppEvent<EditorEvents>('editor:select', onSelect);

    useEffect(() => {
        // render at up to twice the CSS resolution: sharp on a phone, without the cost of 3x
        // eslint-disable-next-line react-hooks/immutability -- the device belongs to the engine, not React
        app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio, 2);
    }, [app]);

    return (
        <>
            <Entity name="light" rotation={[45, 30, 0]}>
                <Light type="directional" intensity={2.5} />
            </Entity>
            {/* A weaker light from behind keeps the sides the first can't reach from going black */}
            <Entity name="fill" rotation={[-25, -140, 0]}>
                <Light type="directional" intensity={0.8} />
            </Entity>
            <Entity name="grid" scale={[12, 12, 12]}>
                <Script script={Grid} />
            </Entity>
            {/* Create a camera entity with orbit controls */}
            <Entity name="camera" ref={setCamera} position={[4, 3.2, 5]} rotation={[-23, 39, 0]}>
                <Camera clearColor="#0a0f17" />
                <Script script={CameraControls} sceneSize={5} />
            </Entity>
            {/* The editor creates the objects under its own entity, from the scene saved in this browser */}
            {camera && (
                <Entity name="editor">
                    <Script ref={editor} script={SceneEditor} camera={camera} mode={mode} />
                </Entity>
            )}
        </>
    );
}

function App() {
    // the HUD's buttons call the editor script through this
    const editor = useRef<SceneEditor>(null);
    const [mode, setMode] = useState<Mode>('translate');
    const [selected, setSelected] = useState(false);

    const onSelect = useCallback((entity: PcEntity | null) => setSelected(!!entity), []);

    return (
        <>
            <Application>
                <Scene editor={editor} mode={mode} onSelect={onSelect} />
            </Application>
            <div className="hud">
                <section className="panel">
                    <h1>Scene Editor</h1>
                    <p>Click an object to select it, then drag its gizmo. Drag anywhere else to orbit.</p>
                    <div className="controls">
                        {MODES.map((item) => (
                            <button
                                key={item.mode}
                                aria-pressed={mode === item.mode}
                                onClick={() => setMode(item.mode)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="controls">
                        {SHAPES.map((shape) => (
                            <button key={shape} onClick={() => editor.current?.add(shape)}>
                                Add {shape}
                            </button>
                        ))}
                    </div>
                    <div className="controls">
                        <button disabled={!selected} onClick={() => editor.current?.remove()}>
                            Delete
                        </button>
                        <button onClick={() => editor.current?.reset()}>Reset</button>
                    </div>
                </section>
            </div>
        </>
    );
}

export default App;
