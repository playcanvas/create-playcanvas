import colors from 'picocolors';

const { cyan, magenta, yellow } = colors;

export const TEMPLATES = [
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

// Every template holds a `base` directory of shared tooling plus one directory per boilerplate,
// which is copied over the top. Assets a boilerplate needs in every template live once in
// `_shared/<boilerplate>` and are seeded in first. The first entry is the default.
export const BOILERPLATES = [
    {
        name: 'spinning-cube',
        display: 'Spinning Cube',
        description: 'a rotating cube and a light'
    },
    {
        name: 'interactive-sphere',
        display: 'Interactive Sphere',
        description: 'orbit controls, a grid and pointer picking'
    },
    {
        name: 'model-viewer',
        display: 'Model Viewer',
        description: 'a glTF model, orbit controls and a procedural sky'
    },
    {
        name: 'splat-viewer',
        display: 'Splat Viewer',
        description: 'a Gaussian splat and orbit controls'
    }
];
