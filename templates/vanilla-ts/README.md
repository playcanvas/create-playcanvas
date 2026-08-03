# PlayCanvas + TypeScript Starter

A Vite-powered PlayCanvas Engine project with TypeScript, hot module replacement, ESLint and Prettier.

## Prerequisites

Node.js 22.23.2 or later.

## Getting started

```bash
npm create playcanvas@latest playcanvas-project -- --template vanilla-ts
cd playcanvas-project
npm install
npm run dev
```

Open <http://localhost:5173>. Edit `src/App.ts` to test hot module replacement.

## Scripts

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start the Vite development server |
| `npm run build`     | Build for production              |
| `npm run start`     | Preview the production build      |
| `npm run lint`      | Run ESLint                        |
| `npm run fmt`       | Check formatting                  |
| `npm run typecheck` | Run TypeScript checks             |

## Project structure

```text
.
├── public/
│   └── environment-map.png
├── src/
│   ├── assets/
│   ├── App.ts
│   ├── main.ts
│   └── style.css
├── eslint.config.mjs
├── index.html
└── tsconfig.json
```

Run `npm run build` to generate a deployable static site in `dist/`.

## Further reading

- [PlayCanvas Engine manual](https://developer.playcanvas.com/user-manual/engine/)
- [PlayCanvas examples](https://playcanvas.github.io/)
- [Vite documentation](https://vite.dev/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
