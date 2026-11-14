"""Builds the first-person starter's level from a kit of parts, bakes its ambient occlusion into a
texture and exports it as a GLB.

Run from the repository root. It was written for Blender 5.2:

    blender --background --factory-startup --python tools/first-person-level.py -- templates/_shared/first-person-game/public/level.glb

The level is a walled yard on a grid of 2 m cells, put together from the parts in `KIT`: blocks,
ramps, stairs, decks on pillars and so on. Each part fills whole cells and rises in 2 m storeys, so
any part fits against any other. `STOREYS`, further down, draws which part goes where, a
character a cell, with a key above it. Edit the drawing to change the level.

The GLB holds:

- `level`, the mesh the player sees. Its tints are vertex colours, and its one texture is the
  baked occlusion, a greyscale map that darkens every corner and the foot of every wall and step.
  The map is the material's base colour, so it shades sunlight as well as the light of the sky.
  Faces that lie in one plane and touch share a patch of the map, whichever parts they belong to,
  and the map's pixels line up with the kit's grid, so the shading has no seam where parts meet.
- `collision`, the mesh the player stands on and walks into, which is never drawn. It is the same
  parts without the detail: a flight of stairs is a ramp in it, so the player's capsule glides up,
  and unseen walls rise above the yard's own to keep the player in.
- `orb-N`, the pickups, which share one mesh.
- `spawn`, an empty where the player starts.

Coordinates are PlayCanvas's: x right, y up, z towards the viewer.
"""

import math
import os
import sys
import tempfile

import bmesh
import bpy
import numpy
from mathutils import Vector

OUTPUT = sys.argv[sys.argv.index('--') + 1]

# the side of a cell, and the height of a storey, in metres
CELL = 2
# the yard is this many cells each way, inside its walls. An odd number, so it has a middle cell
SIZE = 13
# how thick a deck is, in metres. Thin, so the 1.8 m player can walk under it
SLAB = 0.125
# how high the unseen walls that keep the player in go, in metres
BARRIER = 14

# every edge of every part lies on a grid this fine, in metres
GRID = 0.25
# the occlusion map is square, this many pixels across
ATLAS = 1024
# the map's pixels to a grid step, the most that fit. A whole number, so that where one part meets
# another falls between two pixels and never across one
DENSITY = 4
# pixels left around each surface in the map, so its neighbour doesn't bleed into it
PAD = 2
# a surface narrower than this, in metres, such as a stair's riser, gets twice the pixels a metre,
# or its shading would be only a few pixels wide
THIN = 0.75
# how far to either side of a surface to look, in metres, to tell whether it can be seen
SKIN = 0.005
# how far the shading is spread past the edge of each surface, in pixels: further than texture
# filtering or a JPEG block reaches
SPREAD = 16
# how far a surface looks for something that occludes it, in metres
AO_DISTANCE = 2.0
AO_SAMPLES = 1024
# the occlusion is raised to this power. 1 takes it as baked, which is true to the light but reads
# as faint next to full sun, and more deepens the shade in corners
AO_CONTRAST = 2.0
JPEG_QUALITY = 88

# tints, as they should look on screen
SAND = (0.78, 0.62, 0.42)
SAND_DARK = (0.62, 0.48, 0.32)
TILE_A = (0.60, 0.56, 0.50)
TILE_B = (0.52, 0.49, 0.44)
STONE = (0.70, 0.68, 0.63)
STONE_DARK = (0.58, 0.56, 0.52)
SLATE = (0.32, 0.40, 0.56)
TEAL = (0.08, 0.50, 0.52)
ORANGE = (0.92, 0.44, 0.10)
GOLD = (1.0, 0.72, 0.12)

UP = Vector((0, 1, 0))
FACINGS = {'N': Vector((0, 0, -1)), 'E': Vector((1, 0, 0)), 'S': Vector((0, 0, 1)), 'W': Vector((-1, 0, 0))}

# start from nothing: the factory scene comes with a cube, a light and a camera
for leftover in list(bpy.data.objects):
    bpy.data.objects.remove(leftover)


def to_blender(point):
    """A PlayCanvas position as a Blender one: Blender's z is up, and its y runs the other way."""
    x, y, z = point
    return Vector((x, -z, y))


class Island:
    """A flat patch of the level: the faces that lie in one plane and touch, whichever parts they
    belong to. It gets one rectangle of the occlusion map, so the shading runs unbroken from part
    to part."""

    def __init__(self, normal, points):
        self.normal = normal
        # the map's axes on the plane: across and up for a wall or a slope
        self.u = UP.cross(normal).normalized() if abs(normal.y) < 0.99 else Vector((1, 0, 0))
        self.v = normal.cross(self.u)
        self.height = normal.dot(points[0])
        across, up = [p.dot(self.u) for p in points], [p.dot(self.v) for p in points]
        # lie the island on its long side: low, wide rectangles pack the map tightly
        if max(up) - min(up) > max(across) - min(across):
            self.u, self.v, across, up = self.v, self.u, up, across
        self.low = min(across), min(up)
        self.size = max(across) - self.low[0], max(up) - self.low[1]
        self.density = DENSITY / GRID * (2 if min(self.size) < THIN else 1)
        # a slope's length is off the grid, so round up
        self.pixels = tuple(math.ceil(side * self.density - 1e-6) for side in self.size)
        self.x = self.y = 0

    def uv(self, point):
        return (
            (self.x + PAD + (point.dot(self.u) - self.low[0]) * self.density) / ATLAS,
            (self.y + PAD + (point.dot(self.v) - self.low[1]) * self.density) / ATLAS,
        )

    def samples(self, across, up):
        """A position in each of the island's pixels, `across` and `up` of the way over it."""
        a = self.low[0] + (numpy.arange(self.pixels[0]) + across) / self.density
        b = self.low[1] + (numpy.arange(self.pixels[1]) + up) / self.density
        plane = numpy.array(self.normal * self.height)
        return plane + a[None, :, None] * numpy.array(self.u) + b[:, None, None] * numpy.array(self.v)


def touching(a, b):
    """Whether two rectangles, as (low, high) along each of two axes, share a length of edge or
    overlap. Meeting at a corner doesn't count."""
    shared = [min(a[axis][1], b[axis][1]) - max(a[axis][0], b[axis][0]) for axis in (0, 1)]
    return min(shared) > -1e-4 and max(shared) > 1e-4


class Sheets:
    """A mesh built from flat faces. With `seen`, each vertex carries a tint and each face a place
    in the occlusion map."""

    def __init__(self, seen):
        self.bm = bmesh.new()
        self.seen = seen
        # each face, its corners as PlayCanvas positions, whether it is a rectangle of its own,
        # which another part can cover exactly, and whether it has a place in the occlusion map
        self.faces = []
        # the volumes the parts fill: the low and high corners of a box and, for a ramp, the
        # normal and height of the plane it lies under
        self.solids = []
        if seen:
            self.tint = self.bm.verts.layers.float_color.new('Color')
            self.uvs = self.bm.loops.layers.uv.new('UVMap')

    def polygon(self, points, tint, whole=False, mapped=True):
        """One face through `points`, counter-clockwise seen from outside. A face the player
        never sees, which is there to cast a shadow, is left out of the occlusion map."""
        verts = []
        for point in points:
            vert = self.bm.verts.new(to_blender(point))
            if self.seen:
                # a vertex colour is linear light
                vert[self.tint] = (*(c**2.2 for c in tint), 1.0)
            verts.append(vert)
        self.faces.append((self.bm.faces.new(verts), [Vector(point) for point in points], whole, mapped))

    def grid(self, origin, u, v, tint, mapped=True):
        """A rectangle from `origin` along `u` and `v`, facing u x v."""
        origin, u, v = Vector(origin), Vector(u), Vector(v)
        self.polygon([origin, origin + u, origin + u + v, origin + v], tint, True, mapped)

    def solid(self, a, b, under=None):
        """Records the box between two opposite corners as filled, below the plane through the
        three points of `under` if given."""
        normal, height = Vector(), 1.0
        if under:
            normal = (under[1] - under[0]).cross(under[2] - under[1]).normalized()
            height = normal.dot(under[0])
        self.solids.append((*map(min, a, b), *map(max, a, b), *normal, height))

    def cull(self):
        """Removes every pair of rectangles that lie on each other, where two parts meet: a block
        against a block, or a block on a floor tile. Neither face can be seen."""
        seats = {}
        for record in self.faces:
            if record[2]:
                key = tuple(sorted(tuple(round(c * 8) for c in point) for point in record[1]))
                seats.setdefault(key, []).append(record)
        hidden = [record for records in seats.values() if len(records) > 1 for record in records]
        bmesh.ops.delete(self.bm, geom=[record[0] for record in hidden], context='FACES')
        gone = {id(record) for record in hidden}
        self.faces = [record for record in self.faces if id(record) not in gone]
        return len(hidden)

    def pack(self):
        """Sorts the faces into islands, gives each island its rectangle of the map and each face
        its UVs. Returns the islands."""
        planes = {}
        for _, points, _, mapped in self.faces:
            if not mapped:
                continue
            normal = (points[1] - points[0]).cross(points[2] - points[1]).normalized()
            key = tuple(round(c * 1000) for c in (*normal, normal.dot(points[0])))
            planes.setdefault(key, (normal, []))[1].append(points)

        islands, owner = [], {}
        for normal, faces in planes.values():
            # the faces of a plane fall into groups that touch, each of which is an island
            frame = Island(normal, faces[0])
            boxes = []
            for points in faces:
                across, up = [p.dot(frame.u) for p in points], [p.dot(frame.v) for p in points]
                boxes.append(((min(across), max(across)), (min(up), max(up))))
            group = list(range(len(faces)))
            for i in range(len(faces)):
                for j in range(i):
                    if group[i] != group[j] and touching(boxes[i], boxes[j]):
                        group = [group[j] if g == group[i] else g for g in group]
            for g in set(group):
                members = [points for points, of in zip(faces, group) if of == g]
                island = Island(normal, [point for points in members for point in points])
                islands.append(island)
                owner.update((id(points), island) for points in members)

        # shelves: the tallest islands first, each shelf as high as its first island. Along a
        # shelf the islands stand in columns, one on another while they fit under the shelf's top
        x, y, shelf, width, filled = ATLAS, 0, 0, 0, 0
        for island in sorted(islands, key=lambda i: (-i.pixels[1], -i.pixels[0])):
            w, h = (side + 2 * PAD for side in island.pixels)
            if w > width or filled + h > shelf:
                # a new column, on a new shelf if this one is full
                x, width, filled = x + width, w, 0
                if x + w > ATLAS:
                    x, y, shelf = 0, y + shelf, h
            island.x, island.y = x, y + filled
            filled += h
        if y + shelf > ATLAS:
            raise SystemExit(f'the islands need {y + shelf} rows of a {ATLAS} pixel map: lower DENSITY')

        for face, points, _, mapped in self.faces:
            if mapped:
                for loop, point in zip(face.loops, points):
                    loop[self.uvs].uv = owner[id(points)].uv(point)
        return islands

    def inside(self, points):
        """Which of an array of positions are inside a part."""
        solids = numpy.array(self.solids)
        low, high = points.min(axis=(0, 1)), points.max(axis=(0, 1))
        near = ((solids[:, 0:3] < high) & (solids[:, 3:6] > low)).all(axis=1)
        result = numpy.zeros(points.shape[:2], dtype=bool)
        for solid in solids[near]:
            result |= (
                (points > solid[0:3]).all(axis=2)
                & (points < solid[3:6]).all(axis=2)
                & (points @ solid[6:9] < solid[9])
            )
        return result

    def visible(self, islands):
        """The pixels of the map that lie wholly on a surface that can be seen: just behind every
        corner of the pixel is a part, and just in front of it is open air. That leaves out the
        pixels where one part is buried in another, such as a floor under a crate."""
        mask = numpy.zeros((ATLAS, ATLAS), dtype=bool)
        for island in islands:
            skin = numpy.array(island.normal) * SKIN
            seen = numpy.ones(island.pixels[::-1], dtype=bool)
            for across in (0.1, 0.9):
                for up in (0.1, 0.9):
                    points = island.samples(across, up)
                    seen &= self.inside(points - skin) & ~self.inside(points + skin)
            x, y = island.x + PAD, island.y + PAD
            mask[y:y + island.pixels[1], x:x + island.pixels[0]] = seen
        return mask

    def to_object(self, name):
        mesh = bpy.data.meshes.new(name)
        self.bm.to_mesh(mesh)
        self.bm.free()
        obj = bpy.data.objects.new(name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        return obj


class Slot:
    """Where a part goes: a cell of the yard, a storey and a facing. A part draws itself in its
    own coordinates, standing in the cell x 0 to 2, z 0 to -2 and facing north, and the slot turns
    and moves each face into place."""

    def __init__(self, sheets, cell, storey, facing):
        self.sheets = sheets
        self.seen = sheets.seen
        forward = FACINGS[facing]
        self.axes = (forward.cross(UP), UP, -forward)
        self.centre = Vector((
            (cell[0] - SIZE / 2 + 0.5) * CELL,
            storey * CELL,
            (cell[1] - SIZE / 2 + 0.5) * CELL,
        ))

    def turn(self, vector):
        x, y, z = Vector(vector)
        return self.axes[0] * x + self.axes[1] * y + self.axes[2] * z

    def move(self, point):
        x, y, z = Vector(point)
        return self.centre + self.turn((x - CELL / 2, y, z + CELL / 2))

    def polygon(self, points, tint):
        self.sheets.polygon([self.move(point) for point in points], tint)

    def grid(self, origin, u, v, tint, mapped=True):
        self.sheets.grid(self.move(origin), self.turn(u), self.turn(v), tint, mapped)

    def box(self, x, z, y, tint, faces='NSEWTB'):
        """A box from the ranges x=(x0, x1), z=(z0, z1), y=(y0, y1), in the part's coordinates.

        `faces` picks which to build: North (-z), South (+z), East (+x), West (-x), Top and
        Bottom. A lower-case letter builds a face the player never sees, which only casts a
        shadow.
        """
        (x0, x1), (z0, z1), (y0, y1) = x, z, y
        w, d, h = x1 - x0, z1 - z0, y1 - y0
        self.sheets.solid(self.move((x0, y0, z0)), self.move((x1, y1, z1)))
        # nothing collides with the underside of a part
        if not self.seen:
            faces = faces.replace('B', '')
        sides = {
            'T': ((x0, y1, z1), (w, 0, 0), (0, 0, -d)),
            'B': ((x0, y0, z0), (w, 0, 0), (0, 0, d)),
            'S': ((x0, y0, z1), (w, 0, 0), (0, h, 0)),
            'N': ((x1, y0, z0), (-w, 0, 0), (0, h, 0)),
            'E': ((x1, y0, z1), (0, 0, -d), (0, h, 0)),
            'W': ((x0, y0, z0), (0, 0, d), (0, h, 0)),
        }
        for side, (origin, u, v) in sides.items():
            if side in faces:
                self.grid(origin, u, v, tint)
            elif side.lower() in faces:
                self.grid(origin, u, v, tint, mapped=False)

    def slope(self, cells, tint, side_tint):
        """A ramp `cells` long that climbs one storey going north: the slope, a wall under each
        side, one at its top, and a floor under each cell."""
        length = cells * CELL
        rise = Vector((0, CELL, -length))
        foot, top = self.move((0, 0, 0)), self.move((CELL, CELL, -length))
        self.sheets.solid(foot, top, under=(foot, self.move((CELL, 0, 0)), top))
        self.grid((0, 0, 0), (CELL, 0, 0), rise, tint)
        self.grid((CELL, 0, -length), (-CELL, 0, 0), (0, CELL, 0), side_tint)
        self.underside(cells, side_tint)
        for x, points in ((0, [(0, 0, 0), (0, CELL, -length), (0, 0, -length)]), (CELL, [(0, 0, 0), (0, 0, -length), (0, CELL, -length)])):
            self.polygon([(x, py, pz) for _, py, pz in points], side_tint)

    def flight(self, cells, steps, tread_tint, riser_tint):
        """A flight of `steps` steps, `cells` long, that climbs one storey going north: a tread
        and a riser for each, a wall under each side, one at its top, and a floor under each cell."""
        length = cells * CELL
        going, lift = length / steps, CELL / steps
        for i in range(steps):
            z, y = -going * i, lift * i
            self.sheets.solid(self.move((0, 0, z)), self.move((CELL, y + lift, -length)))
            self.grid((0, y, z), (CELL, 0, 0), (0, lift, 0), riser_tint)
            self.grid((0, y + lift, z), (CELL, 0, 0), (0, 0, -going), tread_tint)
            self.grid((0, 0, z - going), (0, 0, going), (0, y + lift, 0), riser_tint)
            self.grid((CELL, 0, z), (0, 0, -going), (0, y + lift, 0), riser_tint)
        self.grid((CELL, 0, -length), (-CELL, 0, 0), (0, CELL, 0), riser_tint)
        self.underside(cells, riser_tint)

    def underside(self, cells, tint):
        """The floor under a part, a cell at a time, so each lies exactly on the tile under it."""
        if not self.seen:
            return
        for i in range(cells):
            self.grid((0, 0, -CELL * (i + 1)), (CELL, 0, 0), (0, 0, CELL), tint)


# --- the kit -----------------------------------------------------------------------------------
#
# Each part draws what is seen and what is solid, through a slot for each. `cells` is how many cells
# long it is, starting at the cell it is placed in and running the way it faces.


def block(seen, solid, tint=STONE):
    """1x1: a cube filling one cell and one storey."""
    for slot in (seen, solid):
        slot.box((0, CELL), (-CELL, 0), (0, CELL), tint)


def half(seen, solid, tint=STONE):
    """1x1: half a storey high, low enough to jump onto."""
    for slot in (seen, solid):
        slot.box((0, CELL), (-CELL, 0), (0, CELL / 2), tint)


def ramp_2(seen, solid, tint=STONE):
    """2x1: a ramp two cells long that climbs one storey."""
    for slot in (seen, solid):
        slot.slope(2, tint, tint)


def ramp_3(seen, solid, tint=STONE):
    """3x1: a ramp three cells long that climbs one storey."""
    for slot in (seen, solid):
        slot.slope(3, tint, tint)


def stairs_2(seen, solid, tint=STONE):
    """2x1: a flight of eight steps, two cells long, that climbs one storey. What is solid is a
    ramp, so the player glides up."""
    seen.flight(2, 8, tint, STONE_DARK)
    solid.slope(2, tint, STONE_DARK)


def deck(seen, solid, tint=STONE):
    """1x1: a slab at the top of a storey, to walk on, with a pillar under its middle."""
    for slot in (seen, solid):
        slot.box((0, CELL), (-CELL, 0), (CELL - SLAB, CELL), tint)
        slot.box((0.75, 1.25), (-1.25, -0.75), (0, CELL - SLAB), STONE_DARK, 'NSEW')


def parapet(seen, solid, tint=STONE_DARK):
    """1x1: a low wall along the south edge of a cell."""
    for slot in (seen, solid):
        slot.box((0, CELL), (-0.5, 0), (0, 0.5), tint, 'NSEWT')


def crate(seen, solid, tint=ORANGE):
    """A 1 m cube in the middle of a cell."""
    for slot in (seen, solid):
        slot.box((0.5, 1.5), (-1.5, -0.5), (0, 1), tint, 'NSEWT')


def wall(seen, solid, tint=SAND):
    """1x1: a stretch of the yard's wall, a storey and a half high, seen from the south. What is
    solid is a sheet that rises far above it, so nobody jumps out."""
    seen.box((0, CELL), (-CELL, 0), (0, CELL * 1.5), tint, 'STn')
    solid.box((0, CELL), (-CELL, 0), (0, BARRIER), tint, 'S')


def tower(seen, solid, tint=SAND_DARK):
    """1x1: a corner tower with a battlement at each corner, seen from the south and the east."""
    top = CELL * 2.25
    seen.box((0, CELL), (-CELL, 0), (0, top), tint, 'SETnw')
    solid.box((0, CELL), (-CELL, 0), (0, BARRIER), tint, 'SE')
    for x in (0, CELL - 0.5):
        for z in (-CELL, -0.5):
            seen.box((x, x + 0.5), (z, z + 0.5), (top, top + 0.5), tint, 'NSEWT')


KIT = {
    'block': block,
    'half': half,
    'ramp-2': ramp_2,
    'ramp-3': ramp_3,
    'stairs-2': stairs_2,
    'deck': deck,
    'parapet': parapet,
    'crate': crate,
    'wall': wall,
    'tower': tower,
}

# --- the level ---------------------------------------------------------------------------------
#
# The yard is drawn a storey at a time, from the ground up, with north at the top. Each character
# is a cell:
#
#   .        nothing
#   #  %     a block, in stone or in slate
#   =        a half block
#   +        a deck
#   o  c     a crate, in orange or in teal
#   ^ > v <  stairs that climb that way, drawn along both of their cells
#   N E S W  a ramp that climbs that way, drawn along its two or its three cells
#   _ ~ [ ]  a parapet along the south, north, west or east edge of the cell
#   *        an orb
#   @        where the player starts: the middle of the cells marked
#
# A part on an upper storey needs a block or a deck under it to stand on, and an orb floats over
# whatever is below it. A block with nothing under it makes a doorway. The west half mirrors the
# east, and the south half the north.

STOREYS = [
    """
    %%WW.....EE%%
    %%....v....%%
    %%...cvc...%%
    %%.++.+.++.%%
    ......+......
    ..o...+...o..
    ###.#####.###
    ..o...+...o..
    ......+......
    %%.++.+.++.%%
    %%...c^c...%%
    %%....^....%%
    %%WW..@..EE%%
    """,
    """
    *...........*
    .].........[.
    .].........[.
    .............
    .............
    .............
    ######*######
    .............
    .............
    .............
    .].........[.
    .].........[.
    *...........*
    """,
]

PARTS = {
    '#': ('block', STONE),
    '%': ('block', SLATE),
    '=': ('half', STONE),
    '+': ('deck', STONE),
    'o': ('crate', ORANGE),
    'c': ('crate', TEAL),
}
# a parapet stands along the south edge of its cell, so it faces away from the edge it is on
PARAPETS = {'_': 'N', '~': 'S', '[': 'E', ']': 'W'}
CLIMBS = {
    '^': ('stairs', 'N'), '>': ('stairs', 'E'), 'v': ('stairs', 'S'), '<': ('stairs', 'W'),
    'N': ('ramp', 'N'), 'E': ('ramp', 'E'), 'S': ('ramp', 'S'), 'W': ('ramp', 'W'),
}

# each entry is a part, the cell it goes in as (column, row) counted from the north-west corner,
# the storey it stands on, the way it faces, and its tint if not the part's own
LEVEL = []
# the orbs, as (column, row) and the height of the ground there, and the cells the player starts in
ORBS = []
STARTS = []


def place(part, cell, storey=0, facing='N', tint=None):
    LEVEL.append((part, cell, storey, facing, tint))


def run(rows, mark, column, row, step):
    """How many cells in a row from here, going by `step`, hold `mark`."""
    length = 0
    while 0 <= column < SIZE and 0 <= row < SIZE and rows[row][column] == mark:
        column, row, length = column + step[0], row + step[1], length + 1
    return length


# the yard's walls and corner towers, in the ring of cells around it
for i in range(SIZE):
    place('wall', (i, -1), facing='N')
    place('wall', (i, SIZE), facing='S')
    place('wall', (-1, i), facing='W')
    place('wall', (SIZE, i), facing='E')
place('tower', (-1, -1), facing='N')
place('tower', (SIZE, -1), facing='E')
place('tower', (SIZE, SIZE), facing='S')
place('tower', (-1, SIZE), facing='W')

for storey, drawing in enumerate(STOREYS):
    rows = drawing.split()
    if len(rows) != SIZE or any(len(line) != SIZE for line in rows):
        raise SystemExit(f'storey {storey} is not {SIZE} cells by {SIZE}')
    for row, line in enumerate(rows):
        for column, mark in enumerate(line):
            cell = (column, row)
            if mark in PARTS:
                part, tint = PARTS[mark]
                place(part, cell, storey, tint=tint)
            elif mark in PARAPETS:
                place('parapet', cell, storey, PARAPETS[mark])
            elif mark in CLIMBS:
                part, facing = CLIMBS[mark]
                ahead = (int(FACINGS[facing].x), int(FACINGS[facing].z))
                # how far into its run this cell is, counted from the foot
                behind = run(rows, mark, column, row, (-ahead[0], -ahead[1])) - 1
                # stairs are always two cells long, so a longer run is one flight after another. A
                # ramp is as long as its run
                length = 2 if part == 'stairs' else behind + run(rows, mark, column, row, ahead)
                if behind % length == 0:
                    if f'{part}-{length}' not in KIT:
                        raise SystemExit(f'storey {storey} has a {part} {length} cells long at {cell}')
                    place(f'{part}-{length}', cell, storey, facing)
            elif mark == '*':
                ORBS.append((cell, storey * CELL))
            elif mark == '@':
                STARTS.append(cell)
            elif mark != '.':
                raise SystemExit(f'storey {storey} has an unknown mark {mark!r} at {cell}')

SPAWN = tuple(sum(axis) / len(STARTS) for axis in zip(*STARTS))


def at(cell, height=0.0):
    """The middle of a cell, as a position."""
    return ((cell[0] - SIZE / 2 + 0.5) * CELL, height, (cell[1] - SIZE / 2 + 0.5) * CELL)


# `seen` is what the player sees, and carries the baked occlusion. `solid` is what the player
# stands on and walks into
seen = Sheets(seen=True)
solid = Sheets(seen=False)

for part, cell, storey, facing, tint in LEVEL:
    slots = Slot(seen, cell, storey, facing), Slot(solid, cell, storey, facing)
    KIT[part](*slots, *([tint] if tint else []))

# the floor: a tile for each cell in two shades to look at, and one sheet to stand on, with no
# seams to catch on
edge = SIZE * CELL / 2
for column in range(SIZE):
    for row in range(SIZE):
        x, _, z = at((column, row))
        tint = TILE_A if (column + row) % 2 else TILE_B
        seen.grid((x - 1, 0, z + 1), (CELL, 0, 0), (0, 0, -CELL), tint)
seen.solid((-edge, -CELL, -edge), (edge, 0, edge))
solid.grid((-edge, 0, edge), (2 * edge, 0, 0), (0, 0, -2 * edge), TILE_A)

culled = seen.cull()
solid.cull()
islands = seen.pack()
visible = seen.visible(islands)
level = seen.to_object('level')
mesh = level.data
collision = solid.to_object('collision')

# --- bake the occlusion into the map --------------------------------------------------------

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = AO_SAMPLES
# take every sample: left on, adaptive sampling stops after a few and the map comes out grainy
scene.cycles.use_adaptive_sampling = False
if scene.world is None:
    scene.world = bpy.data.worlds.new('world')
scene.world.light_settings.distance = AO_DISTANCE

white = bpy.data.materials.new('level')
white.use_nodes = True
white.use_backface_culling = True
nodes, links = white.node_tree.nodes, white.node_tree.links
shader = nodes['Principled BSDF']
shader.inputs['Roughness'].default_value = 0.9
shader.inputs['Metallic'].default_value = 0.0
# matte: no reflection of the sky, which would wash the tints out and show through the occlusion
shader.inputs['Specular IOR Level'].default_value = 0.0
mesh.materials.append(white)
# the collision mesh is never drawn, and has no UVs for the map, so it gets a material of its own
collision.data.materials.append(bpy.data.materials.new('collision'))

# the bake fills whichever image the material's selected texture node holds
baked = bpy.data.images.new('occlusion', ATLAS, ATLAS, alpha=False)
target = nodes.new('ShaderNodeTexImage')
target.image = baked
nodes.active = target

# only the mesh that is seen takes part: the unseen walls would shade the yard
collision.hide_render = True
bpy.ops.object.select_all(action='DESELECT')
level.select_set(True)
bpy.context.view_layer.objects.active = level
scene.render.bake.target = 'IMAGE_TEXTURES'
scene.render.bake.margin = 0
bpy.ops.object.bake(type='AO')


def around(image):
    """The sum of each pixel and its eight neighbours."""
    image = numpy.pad(image, 1, mode='edge')
    return sum(image[y:y + ATLAS, x:x + ATLAS] for y in range(3) for x in range(3))


pixels = numpy.empty(ATLAS * ATLAS * 4, dtype=numpy.float32)
baked.pixels.foreach_get(pixels)
grey = pixels[0::4].reshape(ATLAS, ATLAS).copy()

# keep only the pixels that can be seen, and spread them outwards a pixel at a time over the rest.
# A pixel half under another part bakes dark, and filtering would pull that into the surface next
# to it as a dark fringe along every join
known = visible.copy()
grey[~known] = 0
for _ in range(SPREAD):
    count = around(known.astype(numpy.float32))
    fresh = ~known & (count > 0)
    grey[fresh] = around(grey)[fresh] / count[fresh]
    known |= fresh
grey[~known] = 1

# smooth away what grain the samples left, with each pixel the mean of itself and its neighbours,
# then deepen the shade
grey = around(grey) / 9
pixels[0::4] = pixels[1::4] = pixels[2::4] = grey.reshape(-1) ** AO_CONTRAST
baked.pixels.foreach_set(pixels)

# write the map as a greyscale JPEG: it is smooth, so it compresses well
scene.view_settings.view_transform = 'Standard'
scene.render.image_settings.file_format = 'JPEG'
scene.render.image_settings.color_mode = 'BW'
scene.render.image_settings.quality = JPEG_QUALITY
jpeg = os.path.join(tempfile.mkdtemp(), 'occlusion.jpg')
baked.save_render(jpeg, scene=scene)

# the map is the material's base colour, which the vertex colours tint
occlusion = bpy.data.images.load(jpeg)
occlusion.name = 'occlusion'
target.image = occlusion
links.new(target.outputs['Color'], shader.inputs['Base Color'])
mesh.color_attributes.active_color = mesh.color_attributes['Color']
mesh.color_attributes.render_color_index = 0

# --- the pickups and the spawn point ---------------------------------------------------------

gem = bmesh.new()
bmesh.ops.create_cone(gem, cap_ends=False, segments=4, radius1=0.26, radius2=0.0, depth=0.42)
for vert in gem.verts:
    vert.co.z += 0.21
bmesh.ops.mirror(gem, geom=gem.verts[:] + gem.faces[:], axis='Z', merge_dist=1e-4)
bmesh.ops.recalc_face_normals(gem, faces=gem.faces[:])
orb_mesh = bpy.data.meshes.new('orb')
gem.to_mesh(orb_mesh)
gem.free()

glow = bpy.data.materials.new('orb')
glow.use_nodes = True
glow.use_backface_culling = True
shader = glow.node_tree.nodes['Principled BSDF']
shader.inputs['Base Color'].default_value = (*GOLD, 1)
shader.inputs['Emission Color'].default_value = (*GOLD, 1)
shader.inputs['Emission Strength'].default_value = 1.0
shader.inputs['Roughness'].default_value = 0.3
orb_mesh.materials.append(glow)

# an orb floats at the height of the middle of a player standing under it
for i, (cell, ground) in enumerate(ORBS):
    orb = bpy.data.objects.new(f'orb-{i + 1}', orb_mesh)
    orb.location = to_blender(at(cell, ground + 0.9))
    scene.collection.objects.link(orb)

spawn = bpy.data.objects.new('spawn', None)
spawn.location = to_blender(at(SPAWN))
scene.collection.objects.link(spawn)

# --- export ----------------------------------------------------------------------------------

wanted = dict(
    filepath=OUTPUT,
    export_format='GLB',
    export_yup=True,
    export_apply=True,
    export_normals=True,
    export_texcoords=True,
    export_tangents=False,
    export_vertex_color='ACTIVE',
    export_all_vertex_colors=False,
    export_active_vertex_color_when_no_material=True,
    export_materials='EXPORT',
    # keep the JPEG as it was written
    export_image_format='AUTO',
    export_animations=False,
    export_cameras=False,
    export_lights=False,
    export_extras=False,
)
known = bpy.ops.export_scene.gltf.get_rna_type().properties.keys()
bpy.ops.export_scene.gltf(**{k: v for k, v in wanted.items() if k in known})

print(
    f'LEVEL parts={len(LEVEL)}, seen={len(mesh.vertices)} vertices, solid={len(collision.data.vertices)} vertices, '
    f'hidden faces removed={culled}, islands={len(islands)}, map={ATLAS}px at {DENSITY / GRID:.0f} px/m, '
    f'visible={visible.mean():.0%} of the map, rows used={max(i.y + i.pixels[1] + 2 * PAD for i in islands)}, '
    f'jpeg={os.path.getsize(jpeg)} bytes, skipped_options={[k for k in wanted if k not in known]}'
)
