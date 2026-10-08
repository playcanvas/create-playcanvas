import type { Entity, RigidBodyComponentSystem } from 'playcanvas';
import { Script, Vec3 } from 'playcanvas';
import { ThirdPersonController } from 'playcanvas/scripts/esm/third-person-controller.mjs';

/** Ground probes under the player's box collider (half width 0.4): centre, edges and corners */
const FEET = [-0.38, 0, 0.38].flatMap((x) => [-0.38, 0, 0.38].map((z) => [x, z]));

class RobotAnimation extends Script {
    static scriptName = 'robotAnimation';

    time = 0;
    y = 0;

    initialize() {
        this.y = this.entity.getLocalPosition().y;
    }

    update(dt: number) {
        const body = this.entity.parent as Entity | null;
        const velocity = body?.rigidbody?.linearVelocity;
        const speed = velocity ? Math.hypot(velocity.x, velocity.z) : 0;
        this.time += dt * Math.min(speed * 2, 14);

        const swing = Math.sin(this.time) * Math.min(speed * 5, 45);
        this.entity.findByName('left-arm')?.setLocalEulerAngles(swing, 0, 0);
        this.entity.findByName('right-arm')?.setLocalEulerAngles(-swing, 0, 0);
        this.entity.findByName('left-leg')?.setLocalEulerAngles(-swing, 0, 0);
        this.entity.findByName('right-leg')?.setLocalEulerAngles(swing, 0, 0);
        this.entity.setLocalPosition(0, this.y + Math.abs(Math.sin(this.time)) * Math.min(speed * 0.01, 0.04), 0);
    }
}

export const addThirdPersonController = (player: Entity, camera: Entity, model: Entity) => {
    const sys = player.rigidbody!.system as RigidBodyComponentSystem;
    sys.gravity.set(0, -18, 0);
    if (!player.script) player.addComponent('script');
    const controller = player.script!.create(ThirdPersonController, {
        properties: {
            camera,
            characterModel: model,
            cameraDistance: 5,
            cameraHeight: 0.5,
            initialPitch: 15,
            invertLookY: true,
            jumpForce: 520,
            speedGround: 60
        }
    })!;

    // The stock ground check is one ray from the centre, so a player standing on a ledge reads as
    // airborne and can't jump. Count it grounded when any probe under the collider finds a solid
    // surface; triggers (colliders without a rigid body) only stop the camera
    const [from, to] = [new Vec3(), new Vec3()];
    const solid = { filterCallback: (e: Entity) => !!e.rigidbody };
    let grounded = false;
    Object.defineProperty(controller, '_grounded', {
        get: () => grounded,
        set: () => {
            const p = player.getPosition();
            grounded = FEET.some(([x, z]) => {
                from.set(p.x + x, p.y, p.z + z);
                to.set(from.x, p.y - 1.1, from.z);
                return !!sys.raycastFirst(from, to, solid);
            });
        }
    });

    if (!model.script) model.addComponent('script');
    model.script!.create(RobotAnimation);

    return () => {
        player.script?.destroy('thirdPersonController');
        model.script?.destroy('robotAnimation');
    };
};
