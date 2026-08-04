import { Application, Entity } from '@playcanvas/react';
import { Camera, Light, Render } from '@playcanvas/react/components';
import { useAppEvent } from '@playcanvas/react/hooks';
import type { Entity as PcEntity } from 'playcanvas';
import { useRef } from 'react';

function Scene() {
    const cube = useRef<PcEntity>(null);

    // Rotate the cube according to the delta time since the last frame
    useAppEvent('update', (dt: number) => cube.current?.rotate(10 * dt, 20 * dt, 30 * dt));

    return (
        <>
            <Entity name="camera" position={[0, 0, 3]}>
                <Camera clearColor="#8099e6" />
            </Entity>
            <Entity name="light" rotation={[45, 0, 0]}>
                <Light type="directional" />
            </Entity>
            <Entity name="cube" ref={cube}>
                <Render type="box" />
            </Entity>
        </>
    );
}

function App() {
    return (
        <Application>
            <Scene />
        </Application>
    );
}

export default App;
