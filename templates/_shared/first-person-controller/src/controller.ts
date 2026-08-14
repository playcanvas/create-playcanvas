import type { Entity } from 'playcanvas';
import { FirstPersonController } from 'playcanvas/scripts/esm/first-person-controller.mjs';

export const addFirstPersonController = (player: Entity, camera: Entity) => {
    if (!player.script) player.addComponent('script');
    player.script!.create(FirstPersonController, {
        properties: {
            camera,
            jumpForce: 650,
            speedGround: 55
        }
    });

    return () => {
        player.script?.destroy('firstPersonController');
    };
};
