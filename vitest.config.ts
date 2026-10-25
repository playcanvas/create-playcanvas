import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // only this checkout's tests, not those of any worktree nested inside it
        include: ['__tests__/**/*.test.ts']
    }
});
