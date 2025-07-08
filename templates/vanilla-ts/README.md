# PlayCanvas + Vite Starter

A modern, batteries-included starter for building WebGL/PlayCanvas experiences with TypeScript.

* **PlayCanvas** `^2.8.2` – high-performance WebGL engine
* **Vite** `^7` – ultra-fast dev server & bundler with HMR
* **TypeScript** `~5.8` – static typing out-of-the-box
* **ESLint** `^9` – linting with recommended TypeScript rules

---

## Prerequisites

* **Node.js ≥ 20.19.0** (or ≥ 22.12.0). Use [nvm](https://github.com/nvm-sh/nvm) to install/switch:

```bash
nvm install 22 # or 20.19+
nvm use 22
```

---

## Getting Started

Clone the repo and install dependencies:

```bash
git clone <your-repo-url> playcanvas-project
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
│   ├── components/
│   │   └── PlayCanvasCanvas.tsx  # React wrapper around a PlayCanvas application
│   ├── App.tsx           # Entry component
│   └── main.tsx          # Vite/React bootstrap
├── vite.config.ts        # Vite + React plugin config
└── ...
```

### `PlayCanvasCanvas.tsx` (concept)

```tsx
import { useEffect, useRef } from 'react'
import * as pc from 'playcanvas'

export default function PlayCanvasCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const app = new pc.Application(canvas, {})
    app.start()
    // demo scene setup here…

    return () => app.destroy() // cleanup on unmount
  }, [])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
}
```

Use the component anywhere in your React tree to embed a PlayCanvas scene.

---

## Linting & Formatting

ESLint is pre-configured with TypeScript, React hooks, React Refresh, and global browser/node globals. Adjust `eslint.config.js` as your codebase grows.

---

## Deployment

Run `npm run build` to generate a static production bundle in `dist/`. Deploy the contents of that folder to any static hosting provider (Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.).

---

## Further Reading

* [PlayCanvas Engine Docs](https://developer.playcanvas.com/en/api/)
* [Vite Docs](https://vitejs.dev/)
* [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Made with ❤️ and ☕ by **Your Name**. PRs and issues welcome!
