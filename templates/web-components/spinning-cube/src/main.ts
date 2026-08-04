import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';
import { Script } from 'playcanvas';

import './style.css';

class Rotate extends Script {
    static scriptName = 'rotate';

    update(dt: number) {
        this.entity.rotate(10 * dt, 20 * dt, 30 * dt);
    }
}

// Engine scripts are resolved by the bundler, so they are attached through the entity rather than
// with <pc-script name="...">, which only resolves scripts fetched at runtime by <pc-asset>
const cube = await whenReady<EntityElement>('pc-entity[name="cube"]');

cube.entity?.addComponent('script');
cube.entity?.script?.create(Rotate);
