import type { Entity } from 'playcanvas';
import { math, Script } from 'playcanvas';
import { ThirdPersonController } from 'playcanvas/scripts/esm/third-person-controller.mjs';

class RobotAnimation extends Script {
    static scriptName = 'robotAnimation';

    time = 0;

    update(dt: number) {
        const body = this.entity.parent as Entity | null;
        const velocity = body?.rigidbody?.linearVelocity;
        const speed = velocity ? Math.hypot(velocity.x, velocity.z) : 0;
        this.time += dt * math.clamp(speed * 2, 2, 14);

        const swing = Math.sin(this.time) * math.clamp(speed * 5, 4, 45);
        this.entity.findByName('left-arm')?.setLocalEulerAngles(swing, 0, 0);
        this.entity.findByName('right-arm')?.setLocalEulerAngles(-swing, 0, 0);
        this.entity.findByName('left-leg')?.setLocalEulerAngles(-swing, 0, 0);
        this.entity.findByName('right-leg')?.setLocalEulerAngles(swing, 0, 0);
        this.entity.setLocalPosition(0, -1 + Math.abs(Math.sin(this.time)) * Math.min(speed * 0.01, 0.04), 0);
    }
}

export const addThirdPersonController = (player: Entity, camera: Entity, model: Entity) => {
    if (!player.script) player.addComponent('script');
    player.script!.create(ThirdPersonController, {
        properties: {
            camera,
            characterModel: model,
            cameraDistance: 6,
            cameraHeight: 1.2,
            initialPitch: 20,
            jumpForce: 520,
            speedGround: 60
        }
    });

    if (!model.script) model.addComponent('script');
    model.script!.create(RobotAnimation);

    return () => {
        player.script?.destroy('thirdPersonController');
        model.script?.destroy('robotAnimation');
    };
};
