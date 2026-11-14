import type { Entity, RigidBodyComponentSystem } from 'playcanvas';
import { FirstPersonController } from 'playcanvas/scripts/esm/first-person-controller.mjs';

export const addFirstPersonController = (player: Entity, camera: Entity) => {
    (player.rigidbody!.system as RigidBodyComponentSystem).gravity.set(0, -18, 0);
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
