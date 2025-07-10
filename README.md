# Create a PlayCanvas project in seconds

A simple one line command to sin up a read-to-code PlayCanvas project in seconds.

```bash
# npm (recommended)
npm create playcanvas@latest

# pnpm
pnpm create playcanvas

# yarn
yarn create playcanvas

# bun
bun create playcanvas
```

The CLI will prompt you for:

1. **Project name** – folder to create (defaults to `playcanvas-project`).
2. **Overwrite behavior** if the folder exists.
3. **Package name** – used in `package.json`.
4. **Framework & variant** – pick from templates below.
5. **Scaffolding** – project files are copied and tweaked; a final cheat-sheet is printed.

### Non-interactive / flags

Skip the questions when scripting or if you know what you want:

```bash
npm create playcanvas@latest my-game -t react-ts --overwrite
```

Flags:

| Flag                         | Shorthand | Description                                          |
| ---------------------------- | --------- | ---------------------------------------------------- |
| `--template <name>`          | `-t`      | Directly choose template variant (see list below).   |
| `--overwrite`                |           | Remove existing files in target directory.           |
| `--help`                     | `-h`      | Show help/usage information.                         |

## 🎨 Templates

(TBD)

| Template     | Description                 |
| ------------ | --------------------------- |
| `vanilla-ts` | Plain Typescript PlayCanvas |
| `react-ts`   | React + TypeScript          |

_To add your own template, drop a folder in `templates/<name>` and update the `templates/index.js`

## 🛠 Development

Clone the repo, then:

```bash
npm install     # or npm, yarn, bun
npm run dev     # compile TypeScript → dist (if needed)
npm link        # you can now run `npx create-playcanvas` to test 
```

## 🤝 Contributing

Bug reports, feature requests and PRs are welcome! Want to create a new template? Please file an issue first if you plan major changes.

1. Fork / clone.
2. Create a branch: `git checkout -b feat/my-awesome-idea`.
3. Commit with conventional-commit messages.
4. Push and open a PR.
