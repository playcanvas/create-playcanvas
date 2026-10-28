# AGENTS.md

A PlayCanvas app in TypeScript and React, built with Vite. The scene is declared in JSX with `@playcanvas/react`, which drives the PlayCanvas Engine. `README.md` describes the starter this project began from and how to control it.

## Commands

- `npm install` installs dependencies.
- `npm run dev` starts the dev server, usually at <http://localhost:5173>, with hot reload and the PlayCanvas Inspector.
- `npm run typecheck` checks types.
- `npm run lint` runs ESLint, and `npm run lint:fix` fixes what it can.
- `npm run fmt` checks formatting, and `npm run fmt:fix` applies Prettier.
- `npm run build` builds the production site into `dist/`, and `npm run start` serves it.

## Layout

- `index.html` is the page, with the `#root` element React renders into.
- `src/main.tsx` mounts `<App />` inside `<StrictMode>`.
- `src/App.tsx` holds the scene: an `<Application>` of `<Entity>` elements, with components such as `<Camera>`, `<Light>` and `<Render>` inside them.
- `src/starter.css` styles the page and the starter's panels.
- `src/inspector.ts` loads the Inspector. `vite.config.ts` adds it in the dev server only, so production builds leave it out.
- `public/` holds files copied into the build as they are, such as models and textures.

## Conventions

- Import `<Application>` and `<Entity>` from `@playcanvas/react`, components from `@playcanvas/react/components` and hooks such as `useApp`, `useAppEvent` and `useModel` from `@playcanvas/react/hooks`. Engine classes and types come from `playcanvas`.
- Reach an entity's engine object through a `ref`, typed with `Entity` from `playcanvas`.
- Do per-frame work in `useAppEvent('update', (dt) => ...)` on engine objects, not in React state, which would re-render every frame.
- In development, `<StrictMode>` mounts each component twice, so anything an effect adds to the engine, such as an entity, a script or an event listener, needs a cleanup that removes it.
- Builds use relative URLs (`base: './'` in `vite.config.ts`), so they run from any folder. Load files in `public/` with relative paths such as `./model.glb`, not `/model.glb`.
- The engine ships ready-made scripts, such as camera controls and character controllers, under `playcanvas/scripts/esm/`. Use one before writing the same behavior yourself.
- `node_modules/playcanvas/build/playcanvas.d.ts` documents the installed engine's API.
- TypeScript is strict, and unused locals and parameters are errors.

## Checking your work

- Run `npm run typecheck`, `npm run lint` and `npm run build` before you finish. All three must pass.
- To see the result, run `npm run dev` and open the page in a browser. The console should show `Powered by PlayCanvas` and no errors. Press the backquote key for the Inspector, which shows the hierarchy, assets, materials, textures, frame graph and physics. <kbd>F9</kbd> pauses and <kbd>F10</kbd> steps a frame.

## Agent skills

`.claude/skills/` and `.agents/skills/` hold PlayCanvas skills for coding agents. Use them rather than working from memory: `build-app` when restructuring the app, `find-examples` for a feature the project doesn't use yet, `reuse-scripts` before writing a behavior, `inspect-glb` before placing a model, `inspect-runtime` to read state from the running app, and `verify-pixels` to prove a refactor leaves the image unchanged.
