# PlayCanvas Starter Catalog

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

## Template Layout

Each format has a `base` directory plus one directory per starter. Code and assets shared by all formats live in `templates/_shared/<starter>`. Reusable capabilities with format-specific setup live in `templates/_features/<feature>`; the physics feature provides pinned Ammo.js assets for Engine and Web Components while React keeps its framework adapter.
