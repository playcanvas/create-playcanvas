# PlayCanvas Engine + TypeScript Starter

A Vite-powered PlayCanvas Engine project with TypeScript, hot module replacement, ESLint and Prettier.

## Prerequisites

Node.js 22.23.2 or later.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Edit the files under `src/` and save to see the scene update.

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

## Coding agents

`AGENTS.md` gives coding agents such as Claude Code, Codex and Cursor this project's commands, layout, conventions and checks. `CLAUDE.md` imports it for Claude Code.

## Agent skills

This project includes [`@playcanvas/skills`](https://github.com/playcanvas/skills) under `.claude/skills/` and `.agents/skills/`, so Claude Code, Codex and Cursor pick up PlayCanvas-specific workflows automatically.

## Further reading

- [PlayCanvas Engine manual](https://developer.playcanvas.com/user-manual/engine/)
- [PlayCanvas examples](https://playcanvas.github.io/)
- [Vite documentation](https://vite.dev/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
