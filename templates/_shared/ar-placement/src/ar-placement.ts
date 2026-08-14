import type { Entity, Quat, Vec3, XrHitTestSource } from 'playcanvas';
import {
    Color,
    Entity as PcEntity,
    Script,
    StandardMaterial,
    XRSPACE_LOCALFLOOR,
    XRTRACKABLE_PLANE,
    XRTRACKABLE_POINT,
    XRTYPE_AR
} from 'playcanvas';

class ArPlacement extends Script {
    static scriptName = 'arPlacement';

    camera!: Entity;
    reticle!: Entity;
    position?: Vec3;
    rotation?: Quat;
    source?: XrHitTestSource;

    initialize() {
        const material = new StandardMaterial();
        material.diffuse = new Color(1, 0.35, 0.15);
        material.update();

        this.reticle = new PcEntity('reticle');
        this.reticle.addComponent('render', { type: 'cylinder', material });
        this.reticle.setLocalScale(0.15, 0.01, 0.15);
        this.reticle.enabled = false;
        this.app.root.addChild(this.reticle);

        const button = document.getElementById('xr-button') as HTMLButtonElement;
        button.onclick = () => this.start();
        this.app.xr?.hitTest.on('available', this.startHitTest, this);
        this.app.xr?.input.on('select', this.place, this);
        this.app.xr?.on(`available:${XRTYPE_AR}`, this.updateStatus, this);
        this.updateStatus(this.app.xr?.isAvailable(XRTYPE_AR) ?? false);

        this.on('destroy', () => {
            button.onclick = null;
            this.app.xr?.hitTest.off('available', this.startHitTest, this);
            this.app.xr?.input.off('select', this.place, this);
            this.app.xr?.off(`available:${XRTYPE_AR}`, this.updateStatus, this);
        });
    }

    start() {
        if (!this.app.xr?.isAvailable(XRTYPE_AR)) return;
        this.camera.camera?.startXr(XRTYPE_AR, XRSPACE_LOCALFLOOR, {
            callback: (error) => {
                if (error) this.setStatus(error.message);
            }
        });
    }

    startHitTest() {
        this.app.xr?.hitTest.start({
            entityTypes: [XRTRACKABLE_POINT, XRTRACKABLE_PLANE],
            callback: (error, source) => {
                if (error || !source) {
                    this.setStatus('Unable to start hit testing');
                    return;
                }
                this.source = source;
                source.on('result', (position, rotation) => this.updateReticle(position, rotation));
            }
        });
    }

    updateReticle(position: Vec3, rotation: Quat) {
        this.position = position.clone();
        this.rotation = rotation.clone();
        this.reticle.enabled = true;
        this.reticle.setPosition(position);
        this.reticle.setRotation(rotation);
        this.setStatus('Select to place a box');
    }

    place() {
        if (!this.position || !this.rotation) return;
        const box = new PcEntity('placed-box');
        box.addComponent('render', { type: 'box' });
        box.setLocalScale(0.2, 0.2, 0.2);
        box.setPosition(this.position.x, this.position.y + 0.1, this.position.z);
        box.setRotation(this.rotation);
        this.app.root.addChild(box);
    }

    updateStatus(available: boolean) {
        const button = document.getElementById('xr-button') as HTMLButtonElement;
        button.disabled = !available;
        this.setStatus(available ? 'AR is available' : 'AR requires a compatible mobile device and secure context');
    }

    setStatus(message: string) {
        document.getElementById('xr-status')!.textContent = message;
    }
}

export { ArPlacement };
