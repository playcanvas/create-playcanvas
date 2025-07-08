# @playcanvas/react + TypeScript Starter

A modern, batteries-included starter for building PlayCanvas experiences with React and TypeScript, HMR and ESLint.

## Prerequisites

* **Node.js ≥ 20.19.0** (or ≥ 22.12.0). Use [nvm](https://github.com/nvm-sh/nvm) to install/switch:

```bash
nvm install 22 # or 20.19+
nvm use 22
```

---

## Getting Started

Scaffold and install dependencies:

```bash
npm create playcanvas@latest -t react-ts
cd playcanvas-project
npm install
```

Start the dev server with hot-module reload:

```bash
npm run dev
```

Open <http://localhost:5173> to view the app. Any file changes trigger instant reloads.

---

## Scripts

| Command            | Description                          |
|--------------------|--------------------------------------|
| `npm run dev`      | Start Vite dev server with HMR       |
| `npm run build`    | Type-check & bundle for production   |
| `npm run preview`  | Preview the production build locally |
| `npm run lint`     | Run ESLint over the codebase         |

---

## Project Structure

```
.
├── public/               # Static assets copied as-is
├── src/
│   ├── Scene.tsx         # React wrapper around a PlayCanvas application
│   ├── App.tsx           # Entry component
│   └── main.tsx          # Vite/React bootstrap
├── vite.config.ts        # Vite + React plugin config
└── ...
```

## Linting & Formatting

ESLint is pre-configured with TypeScript, React hooks, React Refresh, and global browser/node globals. Adjust `eslint.config.js` as your codebase grows.

---

## Deployment

Run `npm run build` to generate a static production bundle in `dist/`. Deploy the contents of that folder to any static hosting provider (Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.).

---

## Further Reading

* [PlayCanvas Engine Docs](https://developer.playcanvas.com)
* [PlayCanvas React Docs](https://playcanvas-react.vercel.app)
* [React Docs](https://react.dev/)
* [Vite Docs](https://vitejs.dev/)
* [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Made with ❤️. PRs and issues welcome!
