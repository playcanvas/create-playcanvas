import colors from 'picocolors';

const { cyan, yellow } = colors;

export const TEMPLATES = [
    {
        name: 'vanilla-ts',
        display: 'Vanilla',
        description: 'with PlayCanvas Engine',
        color: yellow
    },
    {
        name: 'react-ts',
        display: 'React',
        description: 'with @playcanvas/react',
        color: cyan
    }
];
