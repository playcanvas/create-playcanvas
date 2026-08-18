import type { EntityElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';

import { SpriteGame } from './sprite-game';
import './starter.css';

const game = await whenReady<EntityElement>('pc-entity[name="game"]');
game.entity!.addComponent('script');
game.entity!.script!.create(SpriteGame);
