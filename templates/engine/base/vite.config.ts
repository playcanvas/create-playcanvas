import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        {
            // Dev only: install the PlayCanvas Inspector before the app starts (press ` to toggle)
            name: 'playcanvas-inspector',
            apply: 'serve',
            config: () => ({ optimizeDeps: { include: ['@playcanvas/inspector'] } }),
            transformIndexHtml: () => [
                { tag: 'script', attrs: { type: 'module', src: '/src/inspector.ts' }, injectTo: 'head-prepend' }
            ]
        }
    ]
});
