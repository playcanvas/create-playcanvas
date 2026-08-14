import colors from 'picocolors';

const { cyan, magenta, yellow } = colors;

export const FORMATS = [
    {
        name: 'engine',
        display: 'Engine',
        description: 'with the PlayCanvas Engine API directly',
        color: yellow
    },
    {
        name: 'react',
        display: 'React',
        description: 'with @playcanvas/react',
        color: cyan
    },
    {
        name: 'web-components',
        display: 'Web Components',
        description: 'with @playcanvas/web-components',
        color: magenta
    }
];

// Every format holds a `base` directory of shared tooling plus one directory per starter.
// Assets a starter needs in every format live once in `_shared/<starter>`. The first entry is the default.
export const STARTERS = [
    {
        name: 'spinning-cube',
        display: 'Spinning Cube',
        category: 'Basics',
        description: 'a rotating cube and a light'
    },
    {
        name: 'interactive-sphere',
        display: 'Interactive Sphere',
        category: 'Basics',
        description: 'orbit controls, a grid and pointer picking'
    },
    {
        name: 'model-viewer',
        display: 'Model Viewer',
        category: 'Viewers',
        description: 'a glTF model, orbit controls and a procedural sky'
    },
    {
        name: 'splat-viewer',
        display: 'Splat Viewer',
        category: 'Viewers',
        description: 'a Gaussian splat and orbit controls'
    },
    {
        name: 'product-configurator',
        display: 'Product Configurator',
        category: 'Viewers',
        description: 'product variants, materials and orbit controls'
    },
    {
        name: 'physics-playground',
        display: 'Physics Playground',
        category: 'Games',
        description: 'rigid bodies, collisions, spawning and reset'
    },
    {
        name: 'first-person-controller',
        display: 'First-Person Controller',
        category: 'Games',
        description: 'first-person movement, mouse look and jumping'
    },
    {
        name: 'third-person-controller',
        display: 'Third-Person Controller',
        category: 'Games',
        description: 'an animated character, follow camera and locomotion'
    },
    {
        name: 'sprite-game',
        display: 'Sprite Game',
        category: 'Games',
        description: 'an orthographic camera, sprite animation and input'
    },
    {
        name: 'scene-editor',
        display: 'Scene Editor',
        category: 'Tools',
        description: 'selection and translate, rotate and scale gizmos'
    },
    {
        name: 'vr-starter',
        display: 'VR Starter',
        category: 'XR',
        description: 'immersive VR, controllers and locomotion'
    },
    {
        name: 'ar-placement',
        display: 'AR Placement',
        category: 'XR',
        description: 'mobile AR, hit testing and object placement'
    }
];
