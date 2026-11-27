import { createStudio } from './studio.js';

import './starter.css';

const canvas = document.getElementById('application-canvas');
if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Expected an #application-canvas element in index.html');
}

await createStudio(canvas);
