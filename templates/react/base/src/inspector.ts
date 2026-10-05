// Loaded by the dev server only (see vite.config.ts), so production builds never include it
import { Inspector } from '@playcanvas/inspector';
import type { AppBase } from 'playcanvas';

import './inspector.css';

type Hook = {
    register?(app: AppBase, info: object): void;
    unregister?(app: AppBase): void;
};

// Every app announces itself to this hook as it starts, whichever format created it
const KEY = Symbol.for('playcanvas.inspector');
const scope = globalThis as unknown as Record<symbol, Hook | undefined>;

// Keep a hook installed earlier, such as a devtools extension's
const prev = scope[KEY];

scope[KEY] = {
    register(app, info) {
        prev?.register?.(app, info);

        // Skip headless apps, such as the null apps @playcanvas/react creates for validation. Each
        // panel destroys itself with its app
        if (!app.graphicsDevice.isNull) new Inspector(app, { visible: false });
    },
    unregister(app) {
        prev?.unregister?.(app);
    }
};

console.info('PlayCanvas Inspector: press ` to toggle');

// Key hint, kept in the starter's header panel when it has one (React and Web Components render it
// later) and shown as a corner chip otherwise
const hint = document.createElement('p');
hint.className = 'inspector-hint';
hint.innerHTML = '<kbd>`</kbd> inspector · <kbd>F9</kbd> pause · <kbd>F10</kbd> step';
const place = () => {
    const parent = document.querySelector('.panel') ?? document.body;
    if (hint.parentElement !== parent) parent.append(hint);
};
new MutationObserver(place).observe(document.body, { childList: true, subtree: true });
place();
