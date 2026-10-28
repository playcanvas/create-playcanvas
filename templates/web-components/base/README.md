# PlayCanvas Web Components + TypeScript Starter

A Vite-powered `@playcanvas/web-components` project with TypeScript, ESLint and Prettier. The scene is
declared as HTML custom elements in `index.html`.

## Prerequisites

Node.js 22.23.2 or later.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Edit `index.html` to change the scene.

## Inspector

`npm run dev` loads the [PlayCanvas Inspector](https://github.com/playcanvas/inspector), a debug panel for the hierarchy, assets, materials, textures, frame graph and physics. Press the backquote key (<kbd>&#96;</kbd>) to show or hide it, <kbd>F9</kbd> to pause and <kbd>F10</kbd> to step a frame. It is wired up in `vite.config.ts` and `src/inspector.ts` and is left out of production builds.

## Scripts

Run these with `npm run <script>`:

| Script      | Description                       |
| ----------- | --------------------------------- |
| `dev`       | Start the Vite development server |
| `build`     | Build for production              |
| `start`     | Preview the production build      |
| `lint`      | Run ESLint                        |
| `fmt`       | Check formatting                  |
| `typecheck` | Run TypeScript checks             |

Run `npm run build` to generate a deployable static site in `dist/`. Its paths are relative, so it runs from any folder, such as a GitHub Pages project site or an itch.io upload.

## How it fits together

`index.html` holds the scene: `<pc-app>` wraps a `<pc-scene>` of `<pc-entity>` elements, each with
components such as `<pc-camera>`, `<pc-light>` and `<pc-render>` attached. Entities are real DOM elements,
so `document.querySelector` reaches them and `setAttribute` changes them.

`src/main.ts` covers the two things HTML alone cannot do:

- **Attaching engine scripts.** `<pc-script-instance name="...">` resolves scripts that `<pc-asset>`
  fetched at runtime. Scripts imported through the bundler — like `CameraControls` and `Grid` here — are
  attached through the entity instead, reached via `whenReady()` and the element's `.entity` property.
- **Responding to pointer input.** `<pc-app>` picks whatever is under the pointer and dispatches an
  ordinary `PointerEvent` on the `<pc-entity>` it hit, so `addEventListener('pointerup', ...)` works on a
  3D entity exactly as it would on a `<button>`. Events are only generated for entities that have a
  listener.

## Editor support

The package ships a Custom Elements Manifest, which gives tag and attribute completion in `index.html`.
JetBrains IDEs pick it up automatically. For VS Code, add to `.vscode/settings.json`:

```json
{
    "html.customData": ["./node_modules/@playcanvas/web-components/dist/vscode.html-custom-data.json"]
}
```

## Coding agents

`AGENTS.md` gives coding agents such as Claude Code, Codex and Cursor this project's commands, layout, conventions and checks. `CLAUDE.md` imports it for Claude Code.

## Agent skills

This project includes [`@playcanvas/skills`](https://github.com/playcanvas/skills) under `.claude/skills/` and `.agents/skills/`, so Claude Code, Codex and Cursor pick up PlayCanvas-specific workflows automatically.

## Further reading

- [PlayCanvas Web Components manual](https://developer.playcanvas.com/user-manual/web-components/)
- [Web Components examples](https://playcanvas.github.io/web-components/examples)
- [Vite documentation](https://vite.dev/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
