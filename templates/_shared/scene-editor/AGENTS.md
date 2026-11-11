## Scene Editor

This project is a scene editor that saves its scene in the browser.

- `src/scene-editor.ts` is the only code that creates, selects, transforms or saves the objects. Add an editing feature there, and let the HUD reach it through the script's `mode`, `add()`, `remove()` and `reset()` and its `editor:select` app event.
- The scene is saved to `localStorage` after every change and loaded on start, so a saved scene hides a change to `DEFAULT_SCENE`. Press **Reset**, or clear `localStorage`, before you check one.
- Bump `STORAGE_KEY` whenever the `Item` type changes. A scene saved in the old format would otherwise be loaded as if it were the new one.
- A click only selects. The script tells a click from a drag by how far the pointer moved, and ignores one that started on a gizmo handle, so keep both checks when you change the pointer handling.
