# create-playcanvas

[![NPM Version](https://img.shields.io/npm/v/create-playcanvas)](https://www.npmjs.com/package/create-playcanvas)
[![NPM Downloads](https://img.shields.io/npm/dw/create-playcanvas)](https://npmtrends.com/create-playcanvas)
[![License](https://img.shields.io/npm/l/create-playcanvas)](https://github.com/playcanvas/create-playcanvas/blob/main/LICENSE)
[![Discord](https://img.shields.io/badge/Discord-5865F2?style=flat&logo=discord&logoColor=white&color=black)](https://discord.gg/RSaMRzg)
[![Reddit](https://img.shields.io/badge/Reddit-FF4500?style=flat&logo=reddit&logoColor=white&color=black)](https://www.reddit.com/r/PlayCanvas)
[![X](https://img.shields.io/badge/X-000000?style=flat&logo=x&logoColor=white&color=black)](https://x.com/intent/follow?screen_name=playcanvas)

| [Engine Manual](https://developer.playcanvas.com/user-manual/engine/) | [React Manual](https://developer.playcanvas.com/user-manual/react/) | [Examples](https://playcanvas.github.io/) | [Forum](https://forum.playcanvas.com/) |

Scaffold a Vite-powered PlayCanvas project with TypeScript. Choose the PlayCanvas Engine directly or build with [`@playcanvas/react`](https://github.com/playcanvas/react).

## Getting Started

Requires Node.js 22.23.2 or later.

```bash
npm create playcanvas@latest
cd playcanvas-project
npm install
npm run dev
```

The interactive setup asks for a project name, handles an existing target directory, sets the package name and lets you choose a template.

You can also use another package manager:

```bash
pnpm create playcanvas@latest
yarn create playcanvas
bun x create-playcanvas@latest
```

## Templates

| Template     | Description                         |
| ------------ | ----------------------------------- |
| `vanilla-ts` | TypeScript with PlayCanvas Engine   |
| `react-ts`   | TypeScript with `@playcanvas/react` |

Both templates include Vite, hot module replacement, ESLint, Prettier and a production build.

## CLI Options

Pass a project name and template to skip the prompts:

```bash
npm create playcanvas@latest my-game -- --template react-ts
```

| Option              | Shorthand | Description                                             |
| ------------------- | --------- | ------------------------------------------------------- |
| `--template <name>` | `-t`      | Use a template from the list above                      |
| `--overwrite`       |           | Remove existing files from a non-empty target directory |
| `--help`            | `-h`      | Show command help                                       |

## Development

```bash
npm install
npm run build
node dist/index.mjs
```

Contributions are welcome. Please open an issue before proposing a new template or another substantial change.

## License

[MIT](LICENSE)
