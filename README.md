# create-playcanvas

[![NPM Version](https://img.shields.io/npm/v/create-playcanvas)](https://www.npmjs.com/package/create-playcanvas)
[![NPM Downloads](https://img.shields.io/npm/dw/create-playcanvas)](https://npmtrends.com/create-playcanvas)
[![License](https://img.shields.io/npm/l/create-playcanvas)](https://github.com/playcanvas/create-playcanvas/blob/main/LICENSE)
[![Discord](https://img.shields.io/badge/Discord-5865F2?style=flat&logo=discord&logoColor=white&color=black)](https://discord.gg/RSaMRzg)
[![Reddit](https://img.shields.io/badge/Reddit-FF4500?style=flat&logo=reddit&logoColor=white&color=black)](https://www.reddit.com/r/PlayCanvas)
[![X](https://img.shields.io/badge/X-000000?style=flat&logo=x&logoColor=white&color=black)](https://x.com/intent/follow?screen_name=playcanvas)

| [Engine Manual](https://developer.playcanvas.com/user-manual/engine/) | [React Manual](https://developer.playcanvas.com/user-manual/react/) | [Examples](https://playcanvas.github.io/) | [Forum](https://forum.playcanvas.com/) |

Scaffold a Vite-powered PlayCanvas project with TypeScript. Pick a format and a runnable starter, then build from there.

## Getting Started

```bash
# npm
npm create playcanvas@latest
# pnpm
pnpm create playcanvas@latest
# yarn
yarn create playcanvas
# bun
bun x create-playcanvas@latest
```

Then follow the prompts. Requires Node.js 22.23.2 or later.

## Formats

| Format           | Description                                  |
| ---------------- | -------------------------------------------- |
| `engine`         | The PlayCanvas Engine API directly           |
| `react`          | `@playcanvas/react` components               |
| `web-components` | `@playcanvas/web-components` custom elements |

Every format uses TypeScript and includes Vite, ESLint, Prettier and a production build.

## Starters

Every starter is available in every format. `spinning-cube` is the default.

| Starter                   | Category | Description                                         |
| ------------------------- | -------- | --------------------------------------------------- |
| `spinning-cube`           | Basics   | A rotating cube and a light                         |
| `interactive-sphere`      | Basics   | Orbit controls, a grid and pointer picking          |
| `model-viewer`            | Viewers  | A glTF model, orbit controls and a procedural sky   |
| `splat-viewer`            | Viewers  | A Gaussian splat and orbit controls                 |
| `product-configurator`    | Viewers  | Product variants, materials and orbit controls      |
| `physics-playground`      | Games    | Rigid bodies, collisions, spawning and reset        |
| `first-person-controller` | Games    | First-person movement, mouse look and jumping       |
| `third-person-controller` | Games    | An animated character, follow camera and locomotion |
| `sprite-game`             | Games    | An orthographic camera, sprite animation and input  |
| `scene-editor`            | Tools    | Selection plus translate, rotate and scale gizmos   |
| `vr-starter`              | XR       | Immersive VR, controllers and locomotion            |
| `ar-placement`            | XR       | Mobile AR, hit testing and object placement         |

![The twelve PlayCanvas starter scenes](https://raw.githubusercontent.com/playcanvas/create-playcanvas/main/images/starter-catalog.webp)

Internally, each format has a `base` directory plus one directory per starter. Code and assets shared by all formats live in `templates/_shared/<starter>`. Reusable capabilities with format-specific setup live in `templates/_features/<feature>`; the physics feature provides pinned Ammo.js assets for Engine and Web Components while React keeps its framework adapter.

## CLI Options

Pass a project name and options to skip the prompts:

```bash
npm create playcanvas@latest my-game -- -f react -y
```

| Option             | Shorthand | Description                                             |
| ------------------ | --------- | ------------------------------------------------------- |
| `--format <name>`  | `-f`      | Use a format from the list above                        |
| `--starter <name>` | `-s`      | Use a starter from the list above                       |
| `--overwrite`      |           | Remove existing files from a non-empty target directory |
| `--no-skills`      |           | Omit the PlayCanvas agent skills (included by default)  |
| `--yes`            | `-y`      | Skip the prompts and take the defaults                  |
| `--help`           | `-h`      | Show command help                                       |

`--yes` takes `playcanvas-project`, the `engine` format and the `spinning-cube` starter for anything you don't pass. It never deletes files, so a non-empty target directory still needs `--overwrite`. The previous `--template` and `--boilerplate` long flags remain accepted for compatibility.

## Agent skills

Every project includes [`@playcanvas/skills`](https://github.com/playcanvas/skills) so AI coding agents such as Claude Code, Codex and Cursor pick up PlayCanvas-specific workflows automatically, with no install step. They are copied into `.claude/skills/` and `.agents/skills/`. Pass `--no-skills` to leave them out.

## Development

```bash
npm install
npm run build
node dist/index.mjs
```

Contributions are welcome. Please open an issue before proposing a new format, starter or another substantial change.

## License

[MIT](LICENSE)
