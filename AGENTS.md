# AGENTS.md

`create-playcanvas` is the scaffolder behind `npm create playcanvas`: a small CLI in `src/` and the projects it copies from `templates/`. Most changes here are to a starter, so most of this file is about what a starter has to be. `README.md` covers the mechanics, under [Adding a starter](README.md#adding-a-starter).

## Commands

- `npm install` installs dependencies.
- `npm run build` builds the CLI into `dist/`, and `node dist/index.mjs` runs it. `npm run dev` builds a stub that runs it straight from `src/`.
- `node dist/index.mjs <dir> --format <format> --starter <starter>` scaffolds one starter without prompts.
- `npm test` runs the tests, `npm run lint` ESLint, `npm run fmt` the Prettier check and `npm run typecheck` TypeScript. `lint:fix` and `fmt:fix` fix what they can.

## Layout

- `src/` is the CLI, with one file per prompt step in `src/steps/`.
- `templates/index.ts` lists the `FORMATS`, the `STARTERS` and the `FEATURES` a starter can ask for.
- `templates/_common/`, `<format>/base/`, `_shared/<starter>/`, `_features/` and `<format>/<starter>/` are the layers a project is assembled from, in that order.
- `__tests__/` checks the catalog and the scaffolder. `.github/workflows/ci.yml` scaffolds every starter in every format, then formats, lints, typechecks and builds it.
- The agent skills given to each project come from the `@playcanvas/skills` dependency. Change a skill in that repository, not here.

## What a starter is for

A starter is a minimal working version of one kind of application, such as a model viewer, a product configurator, a first-person game or a Web Lens. Someone picks it by saying what they are building. It is not a how-to for a technique, such as picking or rigid bodies: the [engine examples](https://playcanvas.github.io/) teach those, and a starter uses a technique only where its application needs it. `spinning-cube` is the one exception, the blank project for someone who wants only the skeleton.

Minimal means the smallest complete loop for that kind of application, not a list of features. A game starts, can be won or lost and starts again. A configurator holds the choices as state and shows them in the scene. A viewer loads an asset and lets you look around it.

A starter is also the first hour of someone's project. They run it, read it, delete part of it and build on the rest, and they copy its patterns for years. Hold every starter to these:

- **Lean.** Every line, file and dependency earns its place. Add no dependency for what the engine or the platform already does, no helper that is used once and no handling for a case that can't happen.
- **Useful.** It runs straight after `npm install`, and it holds the pieces a project of its kind needs first.
- **Readable.** It reads from top to bottom. A comment says why: a tuned value, a workaround, an order that matters. It doesn't restate the line below it.
- **Inspiring.** The result makes someone want to keep going. That comes from what is on screen, such as a good asset, good lighting and controls that respond, and never from the amount of code or the number of features.
- **Exemplary.** It shows the way the format is meant to be used, with current public APIs. People will copy it, so a shortcut here becomes a habit everywhere.
- **Deletable.** It is plain which parts are the demo and which are the skeleton, and removing the demo leaves a project that works. The skeleton is what the starter is for: the state, input, HUD, loading and packaging its kind of application needs. The demo is the part to replace, kept in as few files as it can be, as `web-lens` keeps its game in one.
- **Shippable.** It works on a phone as well as a desktop, and its build deploys as it is.
- **Legible to agents.** Its layout is predictable, and its `AGENTS.md` says what an agent can't see from the code.

Each starter also has to earn its place in the catalog. A starter is three scenes to keep working through every engine release, so it must be a kind of application that no other starter covers. Improve a starter before adding one, and open an issue before proposing a new one.

When lean and inspiring pull apart, improve the picture, not the feature list.

## Rules for a starter

### Every format

- The three formats show the same scene: the same entities, names, transforms, colors and HUD text. A change to one is a change to all three.
- Code that doesn't depend on the format lives once, in `_shared/<starter>/src/`. Never paste the same logic into three scenes.
- Use the scripts the engine ships under `playcanvas/scripts/esm/` before writing a behavior. Where one falls short, fix it in the engine. Don't reach into its private members or patch it from a starter.
- A shared script talks to the page through its properties and app events, as `web-lens` does with `game:state`. It doesn't look up DOM elements.
- The HUD is markup: `index.html` in Engine and Web Components, JSX in React. Don't build it from an HTML string in TypeScript. Style it with the classes in `starter.css`.
- Use the engine's named constants, such as `PROJECTION_ORTHOGRAPHIC`, and name a tuned number or say in a comment what it was tuned for.
- Render at the display's pixel ratio, capped at 2. The engine's own default is 1, which looks soft on a high-density display, so an Engine starter sets `device.maxPixelRatio`.
- Remove what you add: event listeners, and the materials, textures and meshes you create.
- Bundle the assets a starter needs in `_shared/<starter>/public/`, keep them small and record third-party ones in an `ASSET_LICENSES.md`. A sample too large to bundle can load from `developer.playcanvas.com`, with a comment that says how to swap it for a local file. Use no asset that depicts a third party's brand or product.
- Replacing the sample asset must not break the code. Don't depend on a model's material or node names without saying so where the asset is named.
- A starter that needs a keyboard, a headset or another device says so in its README.

### Engine

- The scene is one `src/main.ts` that reads in order: device, app, assets, scene, behavior.
- Use the same bootstrap as `spinning-cube`: an `AppBase` given only the component systems and resource handlers the scene uses.

### React

- Declare the scene in JSX. React state drives the HUD and the scene's props, with ordinary event handlers.
- Do per-frame work in `useAppEvent('update', ...)` on engine objects, not in React state.
- Use an effect only for what JSX can't express, and give it a cleanup, since `<StrictMode>` mounts everything twice in development.

### Web Components

- Declare the scene in `index.html`. `src/main.ts` holds only what HTML can't do, such as attaching a bundled script once `whenReady()` resolves.

## Describing a starter

- `_shared/<starter>/README.md` says what the starter is, how to control it and which parts to replace and which to keep.
- The `description` in `STARTERS` and the row in the README's table promise only what the scene shows.
- Write commands for npm. The scaffolder rewrites them for the package manager in use.
- Add the starter to `images/starter-catalog.webp`.

## Existing starters

Some starters were written before these rules and don't meet all of them, and some are how-tos, not applications. Don't model a new starter on a how-to, and don't copy a pattern from a starter that breaks a rule here. `model-viewer` is the one to imitate for comments, and `web-lens` for structure, touch input and its README. When you change a starter, bring what you touch up to this bar.

## Checking your work

- Run `npm test`, `npm run lint`, `npm run fmt` and `npm run typecheck`. All four must pass.
- After changing a starter, run `npm run build`, scaffold that starter in each format into a temporary directory, and in each one run `npm install`, `npm run fmt`, `npm run lint`, `npm run typecheck` and `npm run build`. That is what CI does.
- Then run `npm run dev` in each and look at it. CI never runs a starter, so nothing else catches a blank canvas, a console error or a format that has drifted from the other two. Check a phone-sized viewport too.
- Say plainly what you couldn't check, such as an XR starter without a headset or an AR-capable phone.

## Commits

Commit messages and pull request titles follow Conventional Commits, such as `feat:`, `fix:` and `docs:`.
