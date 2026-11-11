import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';
import type { Entity } from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { Grid } from 'playcanvas/scripts/esm/grid.mjs';

import { SceneEditor } from './scene-editor';
import type { Mode, Shape } from './scene-editor';
import './starter.css';

// The camera is awaited as <pc-camera> rather than the <pc-entity> holding it - an entity becomes
// ready before its component children do, and the scripts need the camera component to exist
const [appElement, cameraComponent, grid, host] = await Promise.all([
    whenReady('pc-app'),
    whenReady('pc-camera'),
    whenReady<EntityElement>('pc-entity[name="grid"]'),
    whenReady<EntityElement>('pc-entity[name="editor"]')
]);
const app = appElement.app!;
const camera = cameraComponent.closestEntity!.entity!;

// Engine scripts are resolved by the bundler, so they are attached through the entity rather than
// with <pc-script-instance name="...">, which only resolves scripts fetched at runtime by <pc-asset>
camera.addComponent('script');
camera.script!.create(CameraControls, { properties: { sceneSize: 5 } });
grid.entity!.addComponent('script');
grid.entity!.script!.create(Grid);
host.entity!.addComponent('script');
const editor = host.entity!.script!.create(SceneEditor, { properties: { camera } }) as SceneEditor;

// The HUD drives the editor, and follows its selection
const modes = document.querySelectorAll<HTMLButtonElement>('[data-mode]');
modes.forEach((button) => {
    button.addEventListener('click', () => {
        editor.mode = button.dataset.mode as Mode;
        modes.forEach((other) => (other.ariaPressed = String(other === button)));
    });
});
document.querySelectorAll<HTMLButtonElement>('[data-add]').forEach((button) => {
    button.addEventListener('click', () => editor.add(button.dataset.add as Shape));
});

const remove = document.getElementById('delete') as HTMLButtonElement;
remove.addEventListener('click', () => editor.remove());
document.getElementById('reset')!.addEventListener('click', () => editor.reset());
app.on('editor:select', (selected: Entity | null) => {
    remove.disabled = !selected;
});
