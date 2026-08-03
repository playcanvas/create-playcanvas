import typescriptConfig from '@playcanvas/eslint-config/typescript';

export default [
    ...typescriptConfig,
    {
        files: ['scripts/**/*.cjs'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off'
        }
    }
];
