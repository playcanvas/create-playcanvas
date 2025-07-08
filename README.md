# create-playcanvas

> A zero-config scaffolder for boot-strapping PlayCanvas projects.

`create-playcanvas` spins up a ready-to-code PlayCanvas workspace in seconds, complete with modern tooling and opinionated defaults. Pick a template (Vanilla JS, React + TS, etc.), answer a few prompts (or skip them with flags) and you're ready to `npm run dev`.

---

## ✨ Features

• **Interactive CLI** – chooses project name, template & variant for you.<br>
• **TypeScript / JavaScript templates** – Vanilla engine or React integration.<br>
• **Zero build-setup** – Vite, ESLint, Prettier and environment files pre-configured.<br>
• **Smart defaults** – sensible `.gitignore`, ready-to-commit project layout.

---

## 📦 Installation

You don't install anything globally – just run the CLI with your favourite package manager:

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

Want to live on the edge? Point directly at the repo's `main` branch:

```bash
npm create playcanvas@github:playcanvas/create-playcanvas
```

---

## 🚀 Usage

### 1. Interactive mode (zero arguments)

```bash
npm create playcanvas@latest
```

The CLI will prompt you for:

1. **Project name** – folder to create (defaults to `playcanvas-project`).
2. **Overwrite behavior** if the folder exists.
3. **Package name** – used in `package.json`.
4. **Framework & variant** – pick from templates below.
5. **Scaffolding** – project files are copied and tweaked; a final cheat-sheet is printed.

### 2. Non-interactive / flags

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

---

## 🎨 Templates

(TBD)

| Template     | Description                 |
| ------------ | --------------------------- |
| `vanilla`    | Plain JavaScript PlayCanvas |
| `react-ts`   | React + TypeScript + Vite   |

_To add your own template, drop a folder in `templates/<name>` and it will be auto-detected._

---

## 🛠 Development

Clone the repo, then:

```bash
npm install     # or npm, yarn, bun
npm run dev     # compile TypeScript → dist (if needed)
npm link        # you can now run `npx create-playcanvas` to test 
```

---

## 🤝 Contributing

Bug reports, feature requests and PRs are welcome! Want to create a new template? Please file an issue first if you plan major changes.

1. Fork / clone.
2. Create a branch: `git checkout -b feat/my-awesome-idea`.
3. Commit with conventional-commit messages.
4. Push and open a PR.