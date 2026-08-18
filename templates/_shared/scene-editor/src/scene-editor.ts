import type { Entity, Layer } from 'playcanvas';
import { Gizmo, RotateGizmo, ScaleGizmo, Script, TranslateGizmo } from 'playcanvas';

type Mode = 'translate' | 'rotate' | 'scale';

class SceneEditor extends Script {
    static scriptName = 'sceneEditor';

    camera!: Entity;
    targets: Entity[] = [];
    layer!: Layer;
    selected = 0;
    gizmo?: TranslateGizmo | RotateGizmo | ScaleGizmo;

    initialize() {
        this.layer = Gizmo.createLayer(this.app);
        this.setMode('translate');

        document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
            button.onclick = () => this.setMode(button.dataset.mode as Mode);
        });
        document.querySelectorAll<HTMLButtonElement>('[data-target]').forEach((button) => {
            button.onclick = () => {
                this.selected = Number(button.dataset.target);
                this.gizmo?.attach([this.targets[this.selected]]);
                this.updateButtons();
            };
        });
        this.on('destroy', () => this.gizmo?.destroy());
        this.updateButtons();
    }

    setMode(mode: Mode) {
        this.gizmo?.destroy();
        const camera = this.camera.camera!;
        this.gizmo =
            mode === 'rotate'
                ? new RotateGizmo(camera, this.layer)
                : mode === 'scale'
                  ? new ScaleGizmo(camera, this.layer)
                  : new TranslateGizmo(camera, this.layer);
        this.gizmo.attach([this.targets[this.selected]]);
        document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
            button.ariaPressed = String(button.dataset.mode === mode);
        });
    }

    updateButtons() {
        document.querySelectorAll<HTMLButtonElement>('[data-target]').forEach((button) => {
            button.ariaPressed = String(Number(button.dataset.target) === this.selected);
        });
    }
}

export { SceneEditor };
