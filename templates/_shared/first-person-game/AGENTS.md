## First-person game

This project is a first-person game. `src/game.ts` holds the whole game as one engine script.

- The game reads `public/level.glb` by node name: a mesh called `level` to draw, a mesh called `collision` to stand on, nodes called `orb-…` and a node called `spawn`. A replacement level needs the same names. Without a `collision` mesh the game uses `level` for both.
- The `collision` mesh is never drawn. It is simpler than `level`: stairs are ramps in it, since the player's capsule can't climb steps, and unseen walls above the yard's own keep the player in. The game has no handling for a player who leaves the level.
- The level's tints are vertex colours, and its base colour texture is a baked ambient occlusion map, so the shading falls on sunlit surfaces as well as shaded ones. Changing the level's shape means baking the map again, or the shading no longer matches.
- The game is paused by setting `app.timeScale` to 0, which stops physics and every script's `dt`. Anything that should keep moving while paused has to use real time.
- The engine's first-person controller only reads the keyboard and mouse while the canvas holds the pointer lock. A browser that refuses the lock, such as an embedded preview pane or one driven by automation, can't steer with them, so the game holds the run there and shows its `blocked` card. To play a run in a test there, start it with a `pointerdown` on the canvas whose `pointerType` is `'touch'`, which needs no lock, and move the player by setting the velocity of its rigid body. A synthetic touch event can't steer either, and the controller logs a pointer-capture error for one.
- The game pauses only when a lock it held is lost, and shows the `blocked` card on `pointerlockerror`. Don't pause on every `pointerlockchange`: a browser that refuses the lock can fire one too.
- The game recreates the controller in `reset()`, so tune `jumpForce` and `speedGround` there.
