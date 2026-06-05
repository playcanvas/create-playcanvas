import typescriptConfig from '@playcanvas/eslint-config/typescript';

export default [
    ...typescriptConfig,
    {
        // template projects ship their own eslint setup; lint only this CLI's own source
        ignores: ['templates', 'dist']
    }
];
