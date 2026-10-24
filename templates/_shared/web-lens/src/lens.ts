import snapchat from '@snap/web-lens-api';

// Everything the game asks of Snapchat goes through here. Outside Snapchat, the Web Lens API
// answers from a built-in stub with canned data, so the game runs in any browser. Inside it, any
// call can still fail, so each one falls back to playing on without the feature

const BEST_KEY = 'best';

let ready: Promise<void> | undefined;
let best: Promise<number> | undefined;
let avatar: Promise<string | undefined> | undefined;
let saving = Promise.resolve();
let submitting = Promise.resolve();

const warn = (feature: string) => (err: Error) => console.warn(`Web Lens ${feature} unavailable:`, err.message);

// phone browsers report only their own notch, so in development reserve the room Snapchat's own
// controls take at the top of the Lens (see lens.css)
if (import.meta.env.DEV) document.documentElement.classList.add('simulate-insets');

/** Discovers what this host serves. Every other call here waits for it. */
export const initLens = () => (ready ??= snapchat.init().then(() => undefined, warn('API')));

/** Whether Snapchat can show this Lens's leaderboard. Valid once {@link initLens} resolves. */
export const hasLeaderboard = () => snapchat.isSupported('leaderboards');

/**
 * Resolves the player's best score. Snapchat storage keeps it between launches, where
 * `localStorage` starts empty every time the Lens opens.
 */
export const loadBest = () =>
    (best ??= initLens()
        .then(async () => {
            if (!snapchat.isSupported('storage')) return 0;

            // the first read opens the store, which can take seconds on a cold start
            const result = await snapchat.storage.get(BEST_KEY);
            return result.found && typeof result.value === 'number' ? result.value : 0;
        })
        .catch((err: Error) => {
            warn('storage')(err);
            return 0;
        }));

/** Submits a finished run to the leaderboard and keeps the player's best. Resolves the best score. */
export const recordScore = async (score: number) => {
    await initLens();
    if (snapchat.isSupported('leaderboards')) {
        submitting = snapchat.leaderboards
            .submitScore({ score: Math.round(score) })
            .then(() => undefined, warn('leaderboard'));
    }

    // wait for the first read, or this write could replace a save that is still loading
    const previous = await loadBest();
    if (score <= previous) return previous;

    best = Promise.resolve(score);
    if (snapchat.isSupported('storage')) {
        // keep one write in flight at a time, and the chain going after a failed save
        saving = saving.then(() => snapchat.storage.set(BEST_KEY, score)).catch(warn('storage'));
    }
    return score;
};

/** Opens Snapchat's leaderboard panel, once the latest score has reached it. */
export const showLeaderboard = async () => {
    await submitting;
    await snapchat.leaderboards.show().catch(warn('leaderboard'));
};

/** Resolves a URL for the player's Bitmoji portrait, or `undefined` if there is none to show. */
export const loadAvatar = () =>
    (avatar ??= initLens().then(async () => {
        // the desktop stub's avatar is an empty placeholder, so show none there
        if (!snapchat.isSupported('bitmoji') || snapchat.isStub) return undefined;

        try {
            const { hasAvatar } = await snapchat.bitmoji.getAvatarInfo();
            // the URL expires after about five minutes, so show it as soon as it resolves
            return hasAvatar ? (await snapchat.bitmoji.get2DAvatar()).url : undefined;
        } catch (err) {
            warn('Bitmoji')(err as Error);
            return undefined;
        }
    }));
