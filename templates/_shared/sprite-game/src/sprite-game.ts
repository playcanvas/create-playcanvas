import type { SpriteComponent } from 'playcanvas';
import {
    ADDRESS_CLAMP_TO_EDGE,
    Asset,
    Color,
    Entity,
    FILTER_NEAREST,
    PIXELFORMAT_RGBA8,
    Script,
    SPRITE_RENDERMODE_SIMPLE,
    SPRITETYPE_ANIMATED,
    Sprite,
    StandardMaterial,
    Texture,
    TextureAtlas,
    Vec2,
    Vec4
} from 'playcanvas';

const CELL = 24;
const FRAMES = 4;
const SPEED = 3;

class SpriteGame extends Script {
    static scriptName = 'spriteGame';

    keys = new Set<string>();
    player!: Entity;
    velocity = 0;
    grounded = true;

    initialize() {
        const canvas = document.createElement('canvas');
        canvas.width = CELL * FRAMES;
        canvas.height = CELL;
        const ctx = canvas.getContext('2d')!;

        for (let i = 0; i < FRAMES; i++) {
            const x = i * CELL;
            ctx.fillStyle = '#ff5f45';
            ctx.fillRect(x + 7, 4 + (i % 2), 10, 11);
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(x + 9, 1 + (i % 2), 6, 5);
            ctx.fillStyle = '#222';
            ctx.fillRect(x + 8 + (i % 2) * 5, 15, 3, 7);
            ctx.fillRect(x + 13 - (i % 2) * 5, 15, 3, 7);
        }

        const texture = new Texture(this.app.graphicsDevice, {
            width: canvas.width,
            height: canvas.height,
            format: PIXELFORMAT_RGBA8,
            mipmaps: false
        });
        texture.addressU = ADDRESS_CLAMP_TO_EDGE;
        texture.addressV = ADDRESS_CLAMP_TO_EDGE;
        texture.minFilter = FILTER_NEAREST;
        texture.magFilter = FILTER_NEAREST;
        texture.setSource(canvas);

        const atlas = new TextureAtlas();
        atlas.texture = texture;
        atlas.frames = Object.fromEntries(
            Array.from({ length: FRAMES }, (_, i) => [
                String(i),
                {
                    rect: new Vec4(i * CELL, 0, CELL, CELL),
                    pivot: new Vec2(0.5, 0),
                    border: new Vec4()
                }
            ])
        );

        const sprite = new Sprite(this.app.graphicsDevice, {
            atlas,
            frameKeys: Array.from({ length: FRAMES }, (_, i) => String(i)),
            pixelsPerUnit: CELL,
            renderMode: SPRITE_RENDERMODE_SIMPLE
        });
        const asset = new Asset('runner', 'sprite', { url: '' });
        asset.resource = sprite;
        asset.loaded = true;
        this.app.assets.add(asset);

        this.player = new Entity('runner');
        this.player.addComponent('sprite', { type: SPRITETYPE_ANIMATED });
        this.player.sprite!.addClip({ name: 'run', fps: 10, loop: true, spriteAsset: asset.id });
        this.player.sprite!.autoPlayClip = 'run';
        this.player.setLocalScale(2.5, 2.5, 2.5);
        this.entity.addChild(this.player);

        const sky = new StandardMaterial();
        sky.emissive = new Color(0.86, 0.95, 1);
        sky.update();
        const decoration = (
            name: string,
            type: 'box' | 'sphere',
            position: [number, number, number],
            scale: [number, number, number],
            material: StandardMaterial
        ) => {
            const entity = new Entity(name);
            entity.addComponent('render', { type, material });
            entity.setLocalPosition(...position);
            entity.setLocalScale(...scale);
            this.entity.addChild(entity);
        };
        decoration('cloud-left', 'sphere', [-3.8, 4, -1], [1.2, 0.5, 0.2], sky);
        decoration('cloud-center', 'sphere', [-2.9, 4.1, -1], [1.4, 0.65, 0.2], sky);
        decoration('cloud-right', 'sphere', [3.6, 3.6, -1], [1.7, 0.6, 0.2], sky);

        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        this.on('destroy', () => {
            window.removeEventListener('keydown', this.onKeyDown);
            window.removeEventListener('keyup', this.onKeyUp);
            texture.destroy();
            sky.destroy();
        });
    }

    onKeyDown = (event: KeyboardEvent) => {
        this.keys.add(event.code);
        if (event.code === 'Space' && this.grounded) {
            this.velocity = 5;
            this.grounded = false;
        }
    };

    onKeyUp = (event: KeyboardEvent) => this.keys.delete(event.code);

    update(dt: number) {
        const direction =
            Number(this.keys.has('ArrowRight') || this.keys.has('KeyD')) -
            Number(this.keys.has('ArrowLeft') || this.keys.has('KeyA'));
        const position = this.player.getLocalPosition();

        this.velocity -= 12 * dt;
        const x = mathClamp(position.x + direction * SPEED * dt, -5.5, 5.5);
        let y = position.y + this.velocity * dt;
        if (y <= 0) {
            y = 0;
            this.velocity = 0;
            this.grounded = true;
        }

        this.player.setLocalPosition(x, y, position.z);
        this.player.setLocalScale(direction < 0 ? -2.5 : 2.5, 2.5, 2.5);
        const component = this.player.sprite as SpriteComponent;
        component.speed = direction ? 1 : 0;
    }
}

const mathClamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export { SpriteGame };
