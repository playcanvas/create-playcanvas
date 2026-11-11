## Scene Editor

A small scene editor. Select an object by clicking it, transform it with a gizmo, add and delete objects, and find the scene as you left it when you come back.

### Controls

Click an object to select it, and click empty space to clear the selection. Drag the gizmo to transform the selected object, and choose **Move**, **Rotate** or **Scale** to change the gizmo. Drag anywhere else to orbit the camera. **Add box**, **Add sphere** and **Add cone** add an object at the origin, **Delete** removes the selected one and **Reset** brings back the default scene.

### How it fits together

- `src/scene-editor.ts` is the editor, an engine script. It owns the objects, the selection, the gizmo and the saved scene, and it fires an `editor:select` app event for the HUD to follow.
- `src/main.ts` (`src/App.tsx` in React) sets up the camera, lights and grid, and wires the HUD's buttons to the editor's `mode`, `add()`, `remove()` and `reset()`.
- The scene is saved to `localStorage` after every change, as a list of `Item`s: a shape with a position, rotation and scale.

### Make it your own

- **Edit your own objects.** `create()` builds an entity from an `Item`. Swap the primitive shapes for your own models, and add to `Item` whatever else an object has to remember, such as a color or a name. Bump `STORAGE_KEY` whenever `Item` changes, so a scene saved in the old format is ignored.
- **Save somewhere else.** `save()` and the load in `initialize()` are the only code that touches `localStorage`. Point them at a file or your own server to share a scene.
- **Keep the selection and the gizmo.** Neither depends on what the objects are. `pick()` matches the mesh under the pointer to the object that owns it, so change that match if an object becomes a hierarchy of meshes.
- **Add undo.** There is none yet. Every change already passes through `add()`, `remove()` or the gizmo's `transform:end`, which is where a history would record it.
