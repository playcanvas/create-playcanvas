import { Application, Container, Entity } from '@playcanvas/react';
import { Camera, Script } from '@playcanvas/react/components';
import { useModel } from '@playcanvas/react/hooks';
import { TONEMAP_ACES2 } from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { ProceduralSky } from 'playcanvas/scripts/esm/sky/procedural-sky.mjs';

// Swap this for your own model - anything you drop in public/ is served from the site root
const MODEL_URL = '/playcanvas-cube.glb';

function Model() {
    const { asset } = useModel(MODEL_URL);

    // Don't render until the model is loaded
    if (!asset) return null;

    return <Container asset={asset} />;
}

function App() {
    return (
        <Application>
            {/* The procedural sky is both the background and the image-based lighting, so no
                light or environment map asset is needed. Its default luminance is scene-scale
                bright, so turn it down to keep the model out of clipping */}
            <Entity name="sky">
                <Script script={ProceduralSky} luminance={0.2} />
            </Entity>

            {/* Create a camera entity with orbit controls. The sky is HDR, so it needs tone
                mapping to bring it back into displayable range - without it the whole image blows
                out to white */}
            <Entity name="camera" position={[2.6, 1.5, 3.2]} rotation={[-16, 39, 0]}>
                <Camera toneMapping={TONEMAP_ACES2} />
                <Script script={CameraControls} sceneSize={2.5} />
            </Entity>

            <Model />
        </Application>
    );
}

export default App;
