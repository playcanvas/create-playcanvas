import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';

import { Platformer } from './platformer';
import './starter.css';

const game = await whenReady<EntityElement>('pc-entity[name="game"]');
game.entity!.addComponent('script');
game.entity!.script!.create(Platformer);
