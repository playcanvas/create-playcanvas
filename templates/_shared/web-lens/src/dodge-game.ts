import type { CameraComponent } from 'playcanvas';
import { Color, Entity, Script, StandardMaterial, math } from 'playcanvas';

/** Where a run is: waiting for the first tap, in play, held while the Lens is hidden, or crashed. */
export type GameState = 'ready' | 'playing' | 'paused' | 'over';

/** The app event the game fires whenever its state or score changes, for the HUD to follow. */
export type GameEvents = {
    'game:state': (state: GameState, score: number) => void;
};

/** What the HUD card says in each state. `null` hides the card. */
export const CARDS: Record<GameState, { title: string; hint: string } | null> = {
    ready: { title: 'Dodge', hint: 'Drag to steer. Tap to play' },
    playing: null,
    paused: { title: 'Paused', hint: 'Tap to resume' },
    over: { title: 'Game over', hint: 'Tap to play again' }
};

const PLAYER_RADIUS = 0.3;
const BLOCK_HEIGHT = 0.45;
const BLOCK_DEPTH = 0.6;
const BLOCKS = 16;
const STARS = 24;
const STAR_DEPTH = -2;

// how many field widths the player travels for a drag across the whole canvas
const DRAG_SCALE = 1.4;

// seconds after a crash before a tap starts a new run, so the drag that crashed doesn't restart
const RESTART_DELAY = 0.8;

const YELLOW = new Color(1, 0.99, 0);
const BLOCK_COLORS = [new Color(1, 0.36, 0.42), new Color(0.2, 0.75, 1), new Color(0.62, 0.45, 1)];
const STAR_COLOR = new Color(0.45, 0.55, 1);

type Block = { entity: Entity; width: number; counted: boolean };

const createMaterial = (color: Color, glow: number) => {
    const material = new StandardMaterial();
    material.diffuse = color;
    material.emissive = new Color(color.r * glow, color.g * glow, color.b * glow);
    material.update();
    return material;
};

/**
 * A one-thumb dodge game: drag to steer the ball around the falling blocks. It renders the field
 * at z = 0 for a camera that looks down -Z from its z position, and talks to the page only
 * through the `game:state` app event.
 */
class DodgeGame extends Script {
    static scriptName = 'dodgeGame';

    state: GameState = 'ready';
    score = 0;

    elapsed = 0;
    spawnIn = 0;
    overFor = 0;

    // half the visible field at z = 0, refreshed every frame from the camera
    halfWidth = 2.5;
    halfHeight = 4.4;

    playerX = 0;
    pointerId = -1;
    pointerX = 0;

    camera: CameraComponent | null = null;
    player!: Entity;
    blocks: Block[] = [];
    stars: Entity[] = [];

    initialize() {
        const blockMaterials = BLOCK_COLORS.map((color) => createMaterial(color, 0.3));
        const playerMaterial = createMaterial(YELLOW, 0.5);
        const starMaterial = createMaterial(STAR_COLOR, 1);

        this.player = new Entity('player');
        this.player.addComponent('render', { type: 'sphere', material: playerMaterial });
        this.player.setLocalScale(PLAYER_RADIUS * 2, PLAYER_RADIUS * 2, PLAYER_RADIUS * 2);
        this.entity.addChild(this.player);

        // a fixed pool of blocks, recycled as they fall off the bottom
        for (let i = 0; i < BLOCKS; i++) {
            const entity = new Entity(`block-${i}`);
            entity.addComponent('render', { type: 'box', material: blockMaterials[i % blockMaterials.length] });
            entity.enabled = false;
            this.entity.addChild(entity);
            this.blocks.push({ entity, width: 1, counted: false });
        }

        // streaks behind the field that show the speed
        for (let i = 0; i < STARS; i++) {
            const star = new Entity(`star-${i}`);
            star.addComponent('render', { type: 'box', material: starMaterial });
            star.setLocalScale(0.03, math.random(0.2, 0.6), 0.03);
            star.setLocalPosition(math.random(-4, 4), math.random(-7, 7), STAR_DEPTH);
            this.entity.addChild(star);
            this.stars.push(star);
        }

        const canvas = this.app.graphicsDevice.canvas;
        canvas.addEventListener('pointerdown', this.onPointerDown);
        canvas.addEventListener('pointermove', this.onPointerMove);
        canvas.addEventListener('pointerup', this.onPointerUp);
        canvas.addEventListener('pointercancel', this.onPointerUp);
        canvas.addEventListener('contextmenu', this.onContextMenu);
        document.addEventListener('visibilitychange', this.onVisibilityChange);

        this.on('destroy', () => {
            canvas.removeEventListener('pointerdown', this.onPointerDown);
            canvas.removeEventListener('pointermove', this.onPointerMove);
            canvas.removeEventListener('pointerup', this.onPointerUp);
            canvas.removeEventListener('pointercancel', this.onPointerUp);
            canvas.removeEventListener('contextmenu', this.onContextMenu);
            document.removeEventListener('visibilitychange', this.onVisibilityChange);
            for (const material of [...blockMaterials, playerMaterial, starMaterial]) material.destroy();
        });

        this.setState('ready');
    }

    onPointerDown = (event: PointerEvent) => {
        this.pointerId = event.pointerId;
        this.pointerX = event.clientX;
        this.app.graphicsDevice.canvas.setPointerCapture(event.pointerId);

        if (this.state === 'paused') {
            this.setState('playing');
        } else if (this.state === 'ready' || (this.state === 'over' && this.overFor > RESTART_DELAY)) {
            this.restart();
        }
    };

    onPointerMove = (event: PointerEvent) => {
        if (event.pointerId !== this.pointerId) return;

        // the drag is relative, so the thumb never has to cover the ball, and normalized by the
        // canvas width, so a swipe moves the ball the same distance on every phone
        if (this.state === 'playing') {
            const width = this.app.graphicsDevice.canvas.clientWidth;
            this.playerX += ((event.clientX - this.pointerX) / width) * this.halfWidth * 2 * DRAG_SCALE;
        }
        this.pointerX = event.clientX;
    };

    onPointerUp = (event: PointerEvent) => {
        if (event.pointerId === this.pointerId) this.pointerId = -1;
    };

    // a long press would otherwise open the context menu over the game
    onContextMenu = (event: Event) => event.preventDefault();

    // Snapchat can hide the Lens without closing it, so hold the run until the player taps back in
    onVisibilityChange = () => {
        if (document.hidden && this.state === 'playing') this.setState('paused');
    };

    get playerY() {
        return -this.halfHeight * 0.7;
    }

    restart() {
        for (const block of this.blocks) block.entity.enabled = false;
        this.score = 0;
        this.elapsed = 0;
        this.spawnIn = 0;
        this.playerX = 0;
        this.setState('playing');
    }

    crash() {
        this.overFor = 0;
        this.setState('over');

        // only Android vibrates, and only once the player has interacted, which a crash always follows
        if ('vibrate' in navigator && navigator.userActivation.hasBeenActive) navigator.vibrate(80);
    }

    setState(state: GameState) {
        this.state = state;
        this.app.fire('game:state', state, this.score);
    }

    // fit the field to the camera: it fixes the width, so a taller phone sees further up and down
    fitField() {
        this.camera ??= this.app.root.findComponent('camera') as CameraComponent | null;
        const { width, height } = this.app.graphicsDevice;
        if (!this.camera || !width || !height) return;

        const half = this.camera.entity.getPosition().z * Math.tan(this.camera.fov * 0.5 * math.DEG_TO_RAD);
        const aspect = width / height;
        this.halfWidth = this.camera.horizontalFov ? half : half * aspect;
        this.halfHeight = this.camera.horizontalFov ? half / aspect : half;
    }

    spawn() {
        const block = this.blocks.find((b) => !b.entity.enabled);
        if (!block) return;

        block.width = math.random(0.8, Math.min(1.8, this.halfWidth));
        block.counted = false;
        const room = this.halfWidth - block.width / 2;
        block.entity.setLocalScale(block.width, BLOCK_HEIGHT, BLOCK_DEPTH);
        block.entity.setLocalPosition(math.random(-room, room), this.halfHeight + BLOCK_HEIGHT, 0);
        block.entity.enabled = true;
    }

    update(dt: number) {
        this.fitField();

        // blocks fall faster the longer a run lasts
        const speed = Math.min(4 + this.elapsed * 0.12, 9);

        // the stars sit behind the field, where the camera sees more, so they wrap beyond its edges
        const top = this.halfHeight * 1.5;
        const drift = (this.state === 'playing' ? speed * 0.5 : 0.8) * dt;
        for (const star of this.stars) {
            const { x, y } = star.getLocalPosition();
            star.setLocalPosition(x, y - drift < -top ? y - drift + top * 2 : y - drift, STAR_DEPTH);
        }

        const limit = this.halfWidth - PLAYER_RADIUS;
        this.playerX = math.clamp(this.playerX, -limit, limit);
        const playerY = this.playerY;
        this.player.setLocalPosition(this.playerX, playerY, 0);

        if (this.state === 'over') this.overFor += dt;
        if (this.state !== 'playing') return;

        // and come more often
        this.elapsed += dt;
        this.spawnIn -= dt;
        if (this.spawnIn <= 0) {
            this.spawn();
            this.spawnIn = Math.max(0.9 - this.elapsed * 0.012, 0.38);
        }

        for (const block of this.blocks) {
            if (!block.entity.enabled) continue;

            const { x, y: from } = block.entity.getLocalPosition();
            const y = from - speed * dt;
            block.entity.setLocalPosition(x, y, 0);

            // circle against box: the distance from the ball's center to the nearest point of the block
            const dx = Math.max(Math.abs(this.playerX - x) - block.width / 2, 0);
            const dy = Math.max(Math.abs(playerY - y) - BLOCK_HEIGHT / 2, 0);
            if (dx * dx + dy * dy < PLAYER_RADIUS * PLAYER_RADIUS) {
                this.crash();
                return;
            }

            if (!block.counted && y < playerY - BLOCK_HEIGHT) {
                block.counted = true;
                this.score++;
                this.setState('playing');
            }

            if (y < -this.halfHeight - BLOCK_HEIGHT) block.entity.enabled = false;
        }
    }
}

export { DodgeGame };
