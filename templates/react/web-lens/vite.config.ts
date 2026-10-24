import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Approximates the Web Lens sandbox, which allows resources from the Lens itself and nothing else
const LENS_SANDBOX = [
    "default-src 'self' data: blob:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:",
    "style-src 'self' 'unsafe-inline'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'"
].join('; ');

// https://vite.dev/config/
export default defineConfig({
    // Snapchat serves a Lens from its own origin, so every URL in the build must be relative
    base: './',
    build: {
        // npm run package zips this folder and writes the zip beside it, inside the ignored dist/
        outDir: 'dist/lens',
        // source maps only add to the 8 MB upload
        sourcemap: false
    },
    preview: {
        // npm run start serves the build under the Lens rules, so a request for anything outside
        // the zip fails in the browser console as it would in Snapchat
        headers: {
            'Content-Security-Policy': LENS_SANDBOX,
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp'
        }
    },
    plugins: [
        react(),
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
