# create-playcanvas

[![NPM Version](https://img.shields.io/npm/v/create-playcanvas)](https://www.npmjs.com/package/create-playcanvas)
[![NPM Downloads](https://img.shields.io/npm/dw/create-playcanvas)](https://npmtrends.com/create-playcanvas)
[![License](https://img.shields.io/npm/l/create-playcanvas)](https://github.com/playcanvas/create-playcanvas/blob/main/LICENSE)
[![Discord](https://img.shields.io/badge/Discord-5865F2?style=flat&logo=discord&logoColor=white&color=black)](https://discord.gg/RSaMRzg)
[![Reddit](https://img.shields.io/badge/Reddit-FF4500?style=flat&logo=reddit&logoColor=white&color=black)](https://www.reddit.com/r/PlayCanvas)
[![X](https://img.shields.io/badge/X-000000?style=flat&logo=x&logoColor=white&color=black)](https://x.com/intent/follow?screen_name=playcanvas)

| [Engine Manual](https://developer.playcanvas.com/user-manual/engine/) | [React Manual](https://developer.playcanvas.com/user-manual/react/) | [Examples](https://playcanvas.github.io/) | [Forum](https://forum.playcanvas.com/) |

Scaffold a Vite-powered PlayCanvas project with TypeScript. Choose the PlayCanvas Engine directly, [`@playcanvas/react`](https://github.com/playcanvas/react) or [`@playcanvas/web-components`](https://github.com/playcanvas/web-components).

## Getting Started

Requires Node.js 22.23.2 or later.

```bash
npm create playcanvas@latest
cd playcanvas-project
npm install
npm run dev
```

The interactive setup asks for a project name, handles an existing target directory, sets the package name and lets you choose a template and a boilerplate.

You can also use another package manager:

```bash
pnpm create playcanvas@latest
yarn create playcanvas
bun x create-playcanvas@latest
```

## Templates

| Template         | Description                                  |
| ---------------- | -------------------------------------------- |
| `engine`         | The PlayCanvas Engine API directly           |
| `react`          | `@playcanvas/react` components               |
| `web-components` | `@playcanvas/web-components` custom elements |

Every template is TypeScript, and includes Vite, ESLint, Prettier and a production build.

## Boilerplates

Each template offers a choice of starting scene. `spinning-cube` is the default.

| Boilerplate          | Description                                    |
| -------------------- | ---------------------------------------------- |
| `spinning-cube`      | A rotating cube and a light                    |
| `interactive-sphere` | Orbit controls, a grid and pointer picking     |
| `model-viewer`       | A glTF model, orbit controls, a procedural sky |
| `splat-viewer`       | A Gaussian splat and orbit controls            |

A template is a `base` directory of shared tooling plus one directory per boilerplate, which is copied over the top. Assets a boilerplate needs in every template live once in `templates/_shared/<boilerplate>` and are seeded in first.

## CLI Options

Pass a project name, template and boilerplate to skip the prompts:

```bash
npm create playcanvas@latest my-game -- --template react --boilerplate spinning-cube
```

| Option                 | Shorthand | Description                                             |
| ---------------------- | --------- | ------------------------------------------------------- |
| `--template <name>`    | `-t`      | Use a template from the list above                      |
| `--boilerplate <name>` | `-b`      | Use a boilerplate from the list above                   |
| `--overwrite`          |           | Remove existing files from a non-empty target directory |
| `--help`               | `-h`      | Show command help                                       |

## Development

```bash
npm install
npm run build
node dist/index.mjs
```

Contributions are welcome. Please open an issue before proposing a new template or another substantial change.

## License

[MIT](LICENSE)
