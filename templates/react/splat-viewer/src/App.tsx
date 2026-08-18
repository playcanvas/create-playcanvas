import { Application, Entity } from '@playcanvas/react';
import { Camera, GSplat, Script } from '@playcanvas/react/components';
import { useSplat } from '@playcanvas/react/hooks';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

// Hosted so the template stays small. Capture or edit your own splat at https://superspl.at, then
// drop the .sog or .ply in public/ and point this at it instead
const SPLAT_URL = 'https://developer.playcanvas.com/assets/toy-cat.sog';

function Splat() {
    const { asset } = useSplat(SPLAT_URL);

    // Don't render until the splat is loaded
    if (!asset) return null;

    // Splats are captured in their own space, so this one needs offsetting and flipping upright
    return (
        <Entity name="toy cat" position={[0, -0.7, 0]} rotation={[0, 0, 180]}>
            <GSplat asset={asset} />
        </Entity>
    );
}

// Antialiasing is disabled - splat rendering is fragment bound, so MSAA costs a lot and adds little
function App() {
    return (
        <Application graphicsDeviceOptions={{ antialias: false }}>
            {/* Create a camera entity with orbit controls */}
            <Entity name="camera" position={[0, 0, 2.8]}>
                <Camera clearColor="#8f949e" />
                <Script script={CameraControls} sceneSize={2} />
            </Entity>

            <Splat />
        </Application>
    );
}

export default App;
