import reactConfig from '@playcanvas/eslint-config/react';
import typescriptConfig from '@playcanvas/eslint-config/typescript';

export default [
    ...typescriptConfig,
    ...reactConfig,
    {
        rules: {
            'react/jsx-uses-react': 'off',
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off'
        }
    },
    {
        files: ['scripts/**/*.cjs'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off'
        }
    }
];
