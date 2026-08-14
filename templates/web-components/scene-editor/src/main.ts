import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';
import { Grid } from 'playcanvas/scripts/esm/grid.mjs';

import { SceneEditor } from './scene-editor';
import './starter.css';

const [appElement, camera, grid, cube, sphere, editor] = await Promise.all([
    whenReady('pc-app'),
    whenReady<EntityElement>('pc-entity[name="camera"]'),
    whenReady<EntityElement>('pc-entity[name="grid"]'),
    whenReady<EntityElement>('pc-entity[name="cube"]'),
    whenReady<EntityElement>('pc-entity[name="sphere"]'),
    whenReady<EntityElement>('pc-entity[name="editor"]')
]);

grid.entity!.addComponent('script');
grid.entity!.script!.create(Grid);
editor.entity!.addComponent('script');
editor.entity!.script!.create(SceneEditor, {
    properties: {
        camera: camera.entity,
        targets: [cube.entity, sphere.entity],
        layer: appElement.app!.scene.layers.getLayerByName('World')
    }
});
