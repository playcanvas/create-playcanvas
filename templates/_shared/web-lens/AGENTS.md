## Snapchat Web Lens

This project is a Snapchat Web Lens: Snapchat runs it in a sandbox, from an uploaded zip.

- Run `npm run package` after a change. It builds into `dist/lens/`, checks the build against the Web Lens upload rules and writes the zip to `dist/`, or reports why it wrote none.
- A Lens can't reach the network. Bundle every asset into the build, and load nothing from another host, such as a script from a CDN, a web font or a remote model.
- The zip must stay under 8 MB and `index.html` under 1 MB.
- Snapchat disables the camera and microphone for Web Lenses. Keep `getUserMedia`, `getDisplayMedia` and `ImageCapture` out of the build entirely.
- Motion sensors, geolocation, payments, MIDI, USB and WebRTC are off too, so design for pointer input.
- `localStorage` and IndexedDB start empty every time the Lens opens. To keep data between launches, use the Web Lens API's [storage](https://developers.snap.com/web-lenses/storage), `snapchat.storage`: check `snapchat.isSupported('storage')` after `init()` resolves, write nothing until the first read answers, and chain writes through one promise. Each value can be up to 32 KiB, and the whole store 100 KiB. `src/lens.ts` keeps the best score this way.
- `npm run start` serves the build under the Lens sandbox's rules, so a request that would fail in Snapchat also fails in the browser console.
- `src/lens.ts` is the only code that talks to Snapchat. Outside Snapchat, the Web Lens API answers from a stub with canned data, so the game runs in any browser. Call `recordScore(score)` when a run ends.
- Keep the layout portrait and the HUD inside the safe area, using the `--inset-*` properties from `src/lens.css`.
