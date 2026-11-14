## First-Person Game

Orb Run, a small first-person game: collect the five orbs in a walled yard before the 90-second clock runs out. A wall with two doorways divides the yard, and a walkway on pillars runs through a gap in it, up a flight of stairs at each end. Each corner has a terrace, reached by a ramp or by jumping across from the walkway. The game starts on a click or a tap, can be won or lost, and starts again.

### Controls

- **Keyboard and mouse:** click to play. Move with WASD or the arrow keys, look with the mouse, jump with Space and hold Shift to sprint. Escape gives the mouse back and holds the game, and a click resumes it. The keyboard and mouse only steer while the browser has locked the mouse to the game, so play in an ordinary browser tab: a preview pane embedded in an editor may refuse the lock, and the game says so when that happens.
- **Touch:** tap to play. Steer with a thumb on the left half of the screen, look by dragging on the right half, and double-tap to jump.

### How it fits together

- `src/game.ts` is the game, an engine script. It builds the level, gives the player the engine's first-person controller, keeps the state of a run and fires a `game:state` app event for the HUD to follow.
- `public/level.glb` is the level, put together from a small kit of parts on a grid of 2 m cells: blocks, half blocks, ramps, stairs and decks. Its tints are vertex colours, and its one texture is an ambient occlusion map baked in Blender, which shades every corner and the foot of every wall and step at no cost while the game runs. It also holds a second, simpler mesh that is never drawn, which is what the player stands on: a flight of stairs is a ramp in it, so the player glides up.
- The HUD is markup, in `index.html` (`src/App.tsx` in React), styled by `src/game.css`. It shows the orbs found, the seconds left, a card for each state and a circle where a thumb is steering.

### Make it your own

- **Replace the level** with any GLB. The game finds its nodes by name: a mesh called `level` to look at, any number called `orb-…` to collect, and one called `spawn` where the player starts. A mesh called `collision` is what the player stands on and walks into. Leave it out and the player stands on `level` itself, which suits a level with no stairs.
- **Keep the player in.** This level's collision mesh has unseen walls that rise above the yard's own, so nobody jumps out. An open level needs the same, or somewhere to catch a player who falls off it.
- **Replace the game** by rewriting `src/game.ts`. Keep its shape: one state, changed in one place, which stops the clock outside play, a `reset()` that the first run goes through too, and a pause when the mouse is given back or the page is hidden. Fire the same `game:state` event, or rework the HUD to follow your own.
- **Keep** the player and camera in the scene, the sky and the two lights, and the HUD's card and joystick circle. None of them depends on Orb Run.
