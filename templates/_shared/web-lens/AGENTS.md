## Snapchat Web Lens

This project is a Snapchat Web Lens: Snapchat runs it in a sandbox, from an uploaded zip.

- Run `npm run package` after a change. It builds into `dist/lens/`, checks the build against the Web Lens upload rules and writes the zip to `dist/`, or reports why it wrote none.
- A Lens can't reach the network. Bundle every asset into the build, and load nothing from another host, such as a script from a CDN, a web font or a remote model.
- The zip must stay under 8 MB and `index.html` under 1 MB.
- `npm run start` serves the build under the Lens sandbox's rules, so a request that would fail in Snapchat also fails in the browser console.
- `src/lens.ts` is the only code that talks to Snapchat. Outside Snapchat, the Web Lens API answers from a stub with canned data, so the game runs in any browser. Call `recordScore(score)` when a run ends.
- Keep the layout portrait and the HUD inside the safe area, using the `--inset-*` properties from `src/lens.css`.
