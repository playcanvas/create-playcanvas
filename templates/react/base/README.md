# PlayCanvas React + TypeScript Starter

A Vite-powered `@playcanvas/react` project with TypeScript, hot module replacement, ESLint and Prettier.

## Prerequisites

Node.js 22.23.2 or later.

## Getting started

```bash
npm create playcanvas@latest playcanvas-project -- --format react
cd playcanvas-project
npm install
npm run dev
```

Open <http://localhost:5173>. Edit the files under `src/` and save to see the scene update.

## Inspector

`npm run dev` loads the [PlayCanvas Inspector](https://github.com/playcanvas/inspector), a debug panel for the hierarchy, assets, materials, textures, frame graph and physics. Press the backquote key (<kbd>&#96;</kbd>) to show or hide it, <kbd>F9</kbd> to pause and <kbd>F10</kbd> to step a frame. It is wired up in `vite.config.ts` and `src/inspector.ts` and is left out of production builds.

## Scripts

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start the Vite development server |
| `npm run build`     | Build for production              |
| `npm run start`     | Preview the production build      |
| `npm run lint`      | Run ESLint                        |
| `npm run fmt`       | Check formatting                  |
| `npm run typecheck` | Run TypeScript checks             |

Run `npm run build` to generate a deployable static site in `dist/`.

## Agent skills

This project includes [`@playcanvas/skills`](https://github.com/playcanvas/skills) under `.claude/skills/` and `.agents/skills/`, so Claude Code, Codex and Cursor pick up PlayCanvas-specific workflows automatically.

## Further reading

- [PlayCanvas React manual](https://developer.playcanvas.com/user-manual/react/)
- [React documentation](https://react.dev/)
- [Vite documentation](https://vite.dev/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
