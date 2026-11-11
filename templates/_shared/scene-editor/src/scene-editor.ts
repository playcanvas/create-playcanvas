// The editor: it owns the objects, the selection, the gizmo and the saved scene, and it is the file
// to grow to make this starter your own (see "Make it your own" in README.md). The entry file only
// sets up the camera, light and grid around it, and wires the HUD to `mode`, `add()`, `remove()`,
// `reset()` and the `editor:select` app event
import type { Layer, MeshInstance } from 'playcanvas';
import {
    Color,
    Entity,
    Gizmo,
    Picker,
    RotateGizmo,
    ScaleGizmo,
    Script,
    StandardMaterial,
    TranslateGizmo
} from 'playcanvas';

export type Mode = 'translate' | 'rotate' | 'scale';
export type Shape = 'box' | 'sphere' | 'cone';

/** The app event the editor fires whenever the selection changes, for the HUD to follow. */
export type EditorEvents = {
    'editor:select': (selected: Entity | null) => void;
};

type Triple = [number, number, number];

/** One object, as it is saved. */
type Item = { shape: Shape; position: Triple; rotation: Triple; scale: Triple };

// bump the version whenever Item changes, so a scene saved in the old format is ignored
const STORAGE_KEY = 'scene-editor:v1';

const GIZMOS = { translate: TranslateGizmo, rotate: RotateGizmo, scale: ScaleGizmo };
const COLORS: Record<Shape, string> = { box: '#ff5145', sphere: '#24addf', cone: '#ffc033' };
const DEFAULT_SCENE: Item[] = [
    { shape: 'box', position: [-1.2, 0.5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    { shape: 'sphere', position: [1.2, 0.5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }
];

// how far the pointer can travel, in CSS pixels, and still count as a click rather than an orbit
const CLICK_SLOP = 4;

class SceneEditor extends Script {
    static scriptName = 'sceneEditor';

    /** The camera the gizmo and the picker render from. Set it when the script is created. */
    camera!: Entity;

    selected: Entity | null = null;
    items: Entity[] = [];

    gizmo?: TranslateGizmo | RotateGizmo | ScaleGizmo;
    gizmoLayer!: Layer;
    gizmoMode: Mode = 'translate';
    picker!: Picker;
    materials = {} as Record<Shape, StandardMaterial>;

    // where the pointer went down, and whether it went down on one of the gizmo's handles
    downX = 0;
    downY = 0;
    onHandle = false;

    get mode() {
        return this.gizmoMode;
    }

    /** Which gizmo the selected object shows. */
    set mode(mode: Mode) {
        if (mode === this.gizmoMode) return;
        this.gizmoMode = mode;

        // a mode set as the script is created arrives before initialize()
        if (this.gizmo) this.createGizmo();
    }

    initialize() {
        this.gizmoLayer = Gizmo.createLayer(this.app);
        this.picker = new Picker(this.app, 1, 1);
        for (const [shape, color] of Object.entries(COLORS) as [Shape, string][]) {
            const material = new StandardMaterial();
            material.diffuse = new Color().fromString(color);
            material.update();
            this.materials[shape] = material;
        }

        const saved = localStorage.getItem(STORAGE_KEY);
        this.build(saved ? JSON.parse(saved) : DEFAULT_SCENE);
        this.createGizmo();

        const { canvas } = this.app.graphicsDevice;
        canvas.addEventListener('pointerdown', this.onPointerDown);
        canvas.addEventListener('pointerup', this.onPointerUp);

        this.on('destroy', () => {
            canvas.removeEventListener('pointerdown', this.onPointerDown);
            canvas.removeEventListener('pointerup', this.onPointerUp);
            this.build([]);
            this.gizmo?.destroy();
            this.picker.destroy();
            this.app.scene.layers.remove(this.gizmoLayer);
            Object.values(this.materials).forEach((material) => material.destroy());
        });
    }

    /** Adds an object at the origin and selects it, ready to move. */
    add(shape: Shape) {
        this.select(this.create({ shape, position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }));
        this.save();
    }

    /** Deletes the selected object. */
    remove() {
        if (!this.selected) return;
        this.items.splice(this.items.indexOf(this.selected), 1);
        this.selected.destroy();
        this.select(null);
        this.save();
    }

    /** Forgets the saved scene and goes back to the default one. */
    reset() {
        localStorage.removeItem(STORAGE_KEY);
        this.build(DEFAULT_SCENE);
    }

    select(item: Entity | null) {
        this.selected = item;
        if (item) this.gizmo?.attach(item);
        else this.gizmo?.detach();
        this.app.fire('editor:select', item);
    }

    // replaces every object with the ones in a saved scene
    build(scene: Item[]) {
        this.select(null);
        this.items.splice(0).forEach((item) => item.destroy());
        scene.forEach((item) => this.create(item));
    }

    create({ shape, position, rotation, scale }: Item) {
        const entity = new Entity(shape);
        entity.addComponent('render', { type: shape, material: this.materials[shape] });
        entity.setLocalPosition(...position);
        entity.setLocalEulerAngles(...rotation);
        entity.setLocalScale(...scale);
        this.entity.addChild(entity);
        this.items.push(entity);
        return entity;
    }

    save() {
        const scene = this.items.map((item) => ({
            shape: item.render!.type,
            position: item.getLocalPosition().toArray(),
            rotation: item.getLocalEulerAngles().toArray(),
            scale: item.getLocalScale().toArray()
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scene));
    }

    // each gizmo is its own class, so changing mode swaps one for another on the same object
    createGizmo() {
        this.gizmo?.destroy();
        this.gizmo = new GIZMOS[this.gizmoMode](this.camera.camera!, this.gizmoLayer);
        this.gizmo.on('pointer:down', (_x: number, _y: number, handle?: MeshInstance) => {
            this.onHandle = !!handle;
        });

        // the camera's own scripts would orbit with the same drag, so hold them until it ends
        this.gizmo.on('transform:start', () => this.holdCamera(true));
        this.gizmo.on('transform:end', () => {
            this.holdCamera(false);
            this.save();
        });
        if (this.selected) this.gizmo.attach(this.selected);
    }

    holdCamera(held: boolean) {
        if (this.camera.script) this.camera.script.enabled = !held;
    }

    onPointerDown = (event: PointerEvent) => {
        this.downX = event.offsetX;
        this.downY = event.offsetY;
    };

    // a click selects what is under it, or nothing. A drag on a handle or to orbit the camera isn't one
    onPointerUp = (event: PointerEvent) => {
        const moved = Math.hypot(event.offsetX - this.downX, event.offsetY - this.downY);
        if (!this.onHandle && moved <= CLICK_SLOP) this.pick(event.offsetX, event.offsetY);
        this.onHandle = false;
    };

    // the picker renders the scene's meshes into an offscreen buffer and reads back the one under
    // the pointer, so it is exact for any mesh, and it sees only the World layer, not the gizmo
    async pick(x: number, y: number) {
        const { canvas } = this.app.graphicsDevice;
        const world = this.app.scene.layers.getLayerByName('World')!;
        this.picker.resize(canvas.clientWidth, canvas.clientHeight);
        this.picker.prepare(this.camera.camera!, this.app.scene, [world]);
        const [hit] = await this.picker.getSelectionAsync(x, y);
        this.select(this.items.find((item) => item.render!.meshInstances.includes(hit as MeshInstance)) ?? null);
    }
}

export { SceneEditor };
