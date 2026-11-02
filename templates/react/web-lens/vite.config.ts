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

// Approximates its permissions policy, which turns off device features such as the camera and
// motion sensors
const LENS_PERMISSIONS = [
    'camera=()',
    'microphone=()',
    'display-capture=()',
    'accelerometer=()',
    'gyroscope=()',
    'magnetometer=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'midi=()'
].join(', ');

// https://vite.dev/config/
export default defineConfig({
    // Snapchat serves a Lens from its own origin, so every URL in the build must be relative
    base: './',
    build: {
        // npm run package zips this folder and writes the zip beside it, inside the ignored dist/
        outDir: 'dist/lens',
        // source maps only add to the 8 MB upload
        sourcemap: false,
        // a PlayCanvas build is 1-2.5 MB minified, nearly all of it engine code the first frame needs,
        // so warn only for chunks well past that rather than at Vite's 500 kB default
        chunkSizeWarningLimit: 3000
    },
    preview: {
        // npm run start serves the build under the Lens rules, so loading anything from outside the
        // zip, or using a device such as the camera, fails in the browser as it would in Snapchat
        headers: {
            'Content-Security-Policy': LENS_SANDBOX,
            'Permissions-Policy': LENS_PERMISSIONS,
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
