import fs from 'node:fs';
import path from 'node:path';

import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
    entries: ['src/index'],
    clean: true,
    rollup: {
        inlineDependencies: true,
        esbuild: {
            target: 'node22',
            minify: true
        }
    },
    hooks: {
        // the skills each project is given ship beside the bundle, copied from the pinned
        // @playcanvas/skills. A stub build runs from src, which reads them from node_modules
        'build:done'(ctx) {
            if (ctx.options.stub) return;
            fs.cpSync(
                path.join(ctx.options.rootDir, 'node_modules/@playcanvas/skills/skills'),
                path.join(ctx.options.outDir, 'skills'),
                { recursive: true }
            );
        }
    }
});
