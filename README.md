# create-playcanvas

[![NPM Version](https://img.shields.io/npm/v/create-playcanvas)](https://www.npmjs.com/package/create-playcanvas)
[![CI](https://github.com/playcanvas/create-playcanvas/actions/workflows/ci.yml/badge.svg)](https://github.com/playcanvas/create-playcanvas/actions/workflows/ci.yml)

Spin up a ready-to-code [PlayCanvas](https://playcanvas.com/) project in seconds.

```bash
npm create playcanvas@latest
```

Also works with other package managers:

```bash
pnpm create playcanvas
yarn create playcanvas
bun create playcanvas
```

The CLI will prompt you for:

1. **Project name** - folder to create (defaults to `playcanvas-project`)
2. **Overwrite behavior** - if the folder already exists
3. **Package name** - used in `package.json`
4. **Framework & variant** - pick from templates below

## Non-interactive Usage

Skip the prompts when scripting or if you know what you want:

```bash
npm create playcanvas@latest my-game -- -t react-ts --overwrite
```

| Flag                | Shorthand | Description                                        |
| ------------------- | --------- | -------------------------------------------------- |
| `--template <name>` | `-t`      | Directly choose template variant (see list below)  |
| `--overwrite`       |           | Remove existing files in target directory          |
| `--help`            | `-h`      | Show help/usage information                        |

## Templates

| Template     | Description                            |
| ------------ | -------------------------------------- |
| `vanilla-ts` | Vanilla TypeScript + PlayCanvas Engine |
| `react-ts`   | React + TypeScript + PlayCanvas React  |

_To add your own template, drop a folder in `templates/<name>` and update `templates/index.js`._

## Development

Clone the repo, then:

```bash
npm install
npm run dev     # stub build for local development
node index.js   # test the CLI locally
```

Or use `npm link` to test as if installed globally:

```bash
npm link
create-playcanvas
```

## Contributing

Bug reports, feature requests and PRs are welcome! Want to create a new template? Please file an issue first if you plan major changes.

1. Fork / clone
2. Create a branch: `git checkout -b feat/my-awesome-idea`
3. Commit with conventional-commit messages
4. Push and open a PR

## License

MIT
