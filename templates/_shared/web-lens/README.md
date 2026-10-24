## Snapchat Web Lens

A portrait, one-thumb dodge game set up to run inside Snapchat as a [Web Lens](https://developers.snap.com/web-lenses/home). It submits each run to the Lens leaderboard, keeps the player's best score in Snapchat storage and shows their Bitmoji, all through the [Web Lens API](https://developers.snap.com/web-lenses/web-lens-api).

### Controls

Drag left and right to steer the ball around the falling blocks. Tap to start, and tap again after a crash to play another run.

### Publishing to Snapchat

```bash
npm run package
```

This builds the game into `dist/lens/`, checks it against the [Web Lens upload rules](https://developers.snap.com/web-lenses/requirements) and writes a zip to `dist/` to upload through [My Lenses](https://my-lenses.snapchat.com/). It writes no zip if:

- the zip is over 8 MB, or `index.html` is over 1 MB
- the build refers to one of its own files by an absolute path, such as `/assets/game.js`
- the build loads anything from another host, such as a script from a CDN or a web font
- the build uses something the Lens sandbox blocks, such as an `<iframe>` or a web app manifest

It warns about any other host your scripts mention, since a Lens can't reach the network. To check the build itself, `npm run start` serves it under the same rules, so a request for anything outside the zip fails in the browser console as it would in Snapchat.

### How it fits together

- `src/dodge-game.ts` is the game, an engine script that fires a `game:state` app event for the HUD to follow.
- `src/lens.ts` wraps the Web Lens API. Outside Snapchat the API answers from a built-in stub with canned data, so the game runs in any browser, and every call falls back to playing on without the feature.
- `src/lens.css` fills the phone screen and shows a 9:16 column on wider screens. It keeps the HUD clear of the controls Snapchat draws over the top of a Lens, and `npm run dev` marks the room they take.
- `vite.config.ts` makes every URL in the build relative, which a Lens needs.

Lenses run on phones, in portrait. To try the game on yours, run `npm run dev -- --host` and open the network URL it prints.

When you're ready to publish, follow Snap's [publishing guide](https://developers.snap.com/web-lenses/publishing): you'll also need a 512 × 512 PNG icon and a 5-second, 720 × 1280 preview video.
