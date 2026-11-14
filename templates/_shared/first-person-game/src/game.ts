// The game, and the file to replace to make this starter your own (see "Make it your own" in
// README.md). Only the entry file uses it, to attach `Game` and drive the HUD from the `game:state`
// app event and `CARDS`
import type { Asset, Entity, RigidBodyComponentSystem } from 'playcanvas';
import { Script, Vec3 } from 'playcanvas';
import { FirstPersonController } from 'playcanvas/scripts/esm/first-person-controller.mjs';

/**
 * Where a run is: waiting for the first click, in play, held, held because the browser wouldn't
 * lock the mouse, or finished either way.
 */
export type GameState = 'ready' | 'playing' | 'paused' | 'blocked' | 'won' | 'lost';

/** The app events the HUD follows. */
export type GameEvents = {
    /** Fired by the game whenever its state, the orbs found or the whole seconds left change. */
    'game:state': (state: GameState, found: number, total: number, seconds: number) => void;

    /**
     * Fired by the controller as a thumb on the left of the screen steers: where it went down and
     * where it is now, in page pixels, and -1 for all four once it lifts.
     */
    'joystick:left': (baseX: number, baseY: number, knobX: number, knobY: number) => void;
};

/** What the HUD card says in each state. `null` hides the card. */
export const CARDS: Record<GameState, { title: string; hint: string } | null> = {
    ready: { title: 'Orb Run', hint: 'Collect every orb before the clock runs out. Click or tap to play' },
    playing: null,
    paused: { title: 'Paused', hint: 'Click or tap to resume' },
    blocked: {
        title: 'Mouse not locked',
        hint: "The browser didn't lock the mouse to the game, and the keyboard and mouse can't steer without it. Click to try again, or open the game in its own browser tab if this keeps happening"
    },
    won: { title: 'You got them all', hint: 'Click or tap to play again' },
    lost: { title: 'Out of time', hint: 'Click or tap to play again' }
};

// seconds a run lasts
const TIME_LIMIT = 90;

// how close the middle of the player must come to an orb to collect it, in metres
const REACH = 1.2;

// the height of the player's middle above the ground it stands on: half the capsule's height
const PLAYER_HEIGHT = 0.9;

// milliseconds after a run ends before a click starts another, so a touch that was steering when
// the clock ran out doesn't restart it
const RESTART_DELAY = 800;

// stronger than Earth's 9.8, so a jump is quick and lands firmly
const GRAVITY = -18;

// degrees an orb turns each second
const ORB_SPIN = 90;

/**
 * A first-person game: collect every orb in the level before the clock runs out. It builds the level
 * from the `level` asset, gives `player` a first-person controller and talks to the page only
 * through the `game:state` app event.
 *
 * The level is a GLB whose nodes are found by name: a mesh called `level` to look at, one called
 * `collision` to stand on, any number called `orb-…` to collect, and one called `spawn` where the
 * player starts.
 */
class Game extends Script {
    static scriptName = 'game';

    /** The level's GLB, as a loaded container asset. */
    level!: Asset<'container'>;

    /** The player: an entity with a capsule collision and a dynamic rigid body. */
    player!: Entity;

    /** The camera, a child of the player at eye height. */
    camera!: Entity;

    state: GameState = 'ready';
    found = 0;
    timeLeft = TIME_LIMIT;
    endedAt = 0;

    // whether the canvas holds the mouse
    locked = false;

    orbs: Entity[] = [];
    spawn = new Vec3();

    initialize() {
        const canvas = this.app.graphicsDevice.canvas;

        const root = this.level.resource!.instantiateRenderEntity();
        this.entity.addChild(root);

        // the player stands on the level's collision mesh, which is simpler than the one they see: a
        // flight of stairs is a ramp in it, so the capsule glides up. It is never drawn. A level
        // without one is stood on as it is seen
        const solid = (root.findByName('collision') ?? root.findByName('level')) as Entity;
        solid.addComponent('collision', { type: 'mesh', renderAsset: solid.render!.asset });
        solid.addComponent('rigidbody', { type: 'static' });
        if (solid.name === 'collision') solid.render!.enabled = false;

        this.orbs = root.find((node) => node.name.startsWith('orb-')) as Entity[];
        this.spawn.copy(root.findByName('spawn')!.getPosition()).add(new Vec3(0, PLAYER_HEIGHT, 0));

        (this.app.systems.rigidbody as RigidBodyComponentSystem).gravity.set(0, GRAVITY, 0);
        if (!this.player.script) this.player.addComponent('script');

        canvas.addEventListener('pointerdown', this.onPointerDown);
        document.addEventListener('pointerlockchange', this.onPointerLockChange);
        document.addEventListener('pointerlockerror', this.onPointerLockError);
        document.addEventListener('visibilitychange', this.onVisibilityChange);
        this.on('destroy', () => {
            canvas.removeEventListener('pointerdown', this.onPointerDown);
            document.removeEventListener('pointerlockchange', this.onPointerLockChange);
            document.removeEventListener('pointerlockerror', this.onPointerLockError);
            document.removeEventListener('visibilitychange', this.onVisibilityChange);
            this.player.script?.destroy('firstPersonController');
            root.destroy();
            this.app.timeScale = 1;
        });

        this.reset();
    }

    /** Puts everything back where a run starts. The first run goes through here too. */
    reset() {
        this.found = 0;
        this.timeLeft = TIME_LIMIT;
        for (const orb of this.orbs) orb.enabled = true;

        this.player.rigidbody!.teleport(this.spawn);
        this.player.rigidbody!.linearVelocity = Vec3.ZERO;

        // a new controller each run, so the view starts level and facing into the yard again
        this.player.script!.destroy('firstPersonController');
        this.camera.setLocalEulerAngles(0, 0, 0);
        this.player.script!.create(FirstPersonController, {
            properties: {
                camera: this.camera,
                // tuned for the player's 80 kg under this gravity: a jump rises about 1.8 m, enough
                // for every step and gap in the yard, and the ground speed is a brisk run
                jumpForce: 650,
                speedGround: 55
            }
        });

        this.setState('ready');
    }

    setState(state: GameState) {
        this.state = state;

        // stop the clock outside play: physics, the controller and this script's own update all
        // run on scaled time, so nothing moves and no time is lost
        this.app.timeScale = state === 'playing' ? 1 : 0;
        this.report();
    }

    report() {
        this.app.fire('game:state', this.state, this.found, this.orbs.length, Math.ceil(this.timeLeft));
    }

    end(state: 'won' | 'lost') {
        this.endedAt = performance.now();
        this.setState(state);

        // hand the mouse back, after the state has changed, so losing the lock isn't read as a pause
        if (document.pointerLockElement) document.exitPointerLock();
    }

    onPointerDown = (event: PointerEvent) => {
        if (this.state === 'playing') return;

        if (this.state === 'won' || this.state === 'lost') {
            if (performance.now() - this.endedAt < RESTART_DELAY) return;
            this.reset();

            // the controller asks for the mouse on every click, but the one this reset made joined
            // too late to hear this click, so ask for it here. Only here: asking twice for one
            // click makes the browser report a lock that was lost
            if (event.pointerType === 'mouse') this.app.graphicsDevice.canvas.requestPointerLock();
        }

        this.setState('playing');
    };

    // Escape gives the mouse back, which holds the game. Only a lock that was held can be lost: a
    // browser that refuses the lock also reports a change, and touch never has one
    onPointerLockChange = () => {
        const locked = document.pointerLockElement === this.app.graphicsDevice.canvas;
        if (this.locked && !locked && this.state === 'playing') this.setState('paused');
        this.locked = locked;
    };

    // The controller ignores the keyboard and the mouse until the canvas holds the lock. A browser
    // can refuse it, as a preview pane embedded in an editor does, and Chrome does for a second after
    // Escape. Say so, since otherwise the run starts and nothing steers it
    onPointerLockError = () => {
        if (this.state === 'playing') this.setState('blocked');
    };

    onVisibilityChange = () => {
        if (document.hidden && this.state === 'playing') this.setState('paused');
    };

    update(dt: number) {
        if (this.state !== 'playing') return;

        const position = this.player.getPosition();

        const seconds = Math.ceil(this.timeLeft);
        this.timeLeft = Math.max(this.timeLeft - dt, 0);

        const found = this.found;
        for (const orb of this.orbs) {
            if (!orb.enabled) continue;
            orb.rotate(0, ORB_SPIN * dt, 0);
            if (orb.getPosition().distance(position) < REACH) {
                orb.enabled = false;
                this.found++;
            }
        }

        if (this.found === this.orbs.length) this.end('won');
        else if (this.timeLeft === 0) this.end('lost');
        else if (this.found !== found || Math.ceil(this.timeLeft) !== seconds) this.report();
    }
}

export { Game };
