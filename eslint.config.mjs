import typescriptConfig from '@playcanvas/eslint-config/typescript';

export default [
    ...typescriptConfig,
    {
        // template projects and vendored skills ship their own setup; lint only this CLI's own source
        ignores: ['templates', 'skills', 'dist']
    }
];
