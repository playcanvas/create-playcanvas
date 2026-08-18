import { Entity } from '@playcanvas/react';
import { Camera, Environment, Render, Script } from '@playcanvas/react/components';
import { useEnvAtlas, useMaterial } from '@playcanvas/react/hooks';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { Grid } from 'playcanvas/scripts/esm/grid.mjs';
import { useEffect, useState } from 'react';

/**
 * The Scene renders a sphere with a grid and camera controls
 */
function Scene({ onClick }: SceneProps) {
    const [hovering, setHovering] = useState(false);

    // Set a material color based on the hover state
    const diffuse = hovering ? '#40ccff' : '#e6edf9';

    // Create a material for the sphere
    const material = useMaterial({ diffuse });

    // Load the environment map
    const { asset: envMap } = useEnvAtlas('/environment-map.png');

    // Change the mouse cursor based on the hover state
    useEffect(() => {
        document.body.style.cursor = hovering ? 'pointer' : 'default';

        return () => {
            document.body.style.cursor = '';
        };
    }, [hovering]);

    // Don't render until the environment map is loaded
    if (!envMap) return null;

    return (
        <>
            {/* Render some environment lighting using the environment map */}
            <Environment envAtlas={envMap} showSkybox={false} />

            {/* Render a background grid */}
            <Entity scale={[12, 12, 12]}>
                <Script script={Grid} />
            </Entity>

            {/* Create a camera entity with camera controls */}
            <Entity name="camera" position={[3.2, 1.5, 3.2]} rotation={[-10, 45, 0]}>
                <Camera clearColor="#07101a" />
                <Script script={CameraControls} sceneSize={3} />
            </Entity>

            {/* Create and position entity with pointer events */}
            <Entity
                position={[0, 0.7, 0]}
                scale={[1.25, 1.25, 1.25]}
                onClick={onClick}
                onPointerOver={() => setHovering(true)}
                onPointerOut={() => setHovering(false)}
            >
                {/* Render a sphere with the material */}
                <Render type="sphere" material={material} />
            </Entity>
        </>
    );
}

type SceneProps = {
    onClick: () => void;
};

export default Scene;
