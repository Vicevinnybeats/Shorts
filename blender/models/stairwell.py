import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
from mathutils import Vector
# Bright stairwell (What If #3: "Remy takes the stairs"). Origin = floor centre at the bottom of the flight.
# One flight of 12 steps runs DOWN from the top landing (x -4.2, z 3.0) to the floor at x +3.0 (step 0.6 x 0.25),
# 2.2 deep (Y, centre y 0); back wall at +Y 1.3 with a sunny window; coral hand rail on the back side; gold nosings.
N, RUN, RISE = 12, 0.6, 0.25
def link(name, a, b, r, material):
    a, b = Vector(a), Vector(b); d = b - a
    rot = Vector((0, 0, 1)).rotation_difference(d).to_euler()
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=r, depth=d.length, location=(a + b) / 2, rotation=rot)
    o = bpy.context.active_object; o.name = name; o.data.materials.append(material); return o
def build():
    st, nose, wall = mat("#e8dccb", rough=0.85), mat("#f5b942"), mat("#f4e8d4", rough=0.9)
    x0 = 3.0 - N * RUN  # top step's left edge (-4.2)
    for i in range(N):
        h = (N - i) * RISE
        x = x0 + i * RUN + RUN / 2
        box(f"step{i}", (RUN, 2.2, h), (x, 0, h / 2), st, 0.02)
        box(f"nose{i}", (0.08, 2.22, 0.05), (x - RUN / 2 + 0.04, 0, h - 0.02), nose, 0)
    box("landing", (2.4, 2.2, N * RISE), (x0 - 1.2, 0, N * RISE / 2), st, 0.02)
    box("floor", (14, 4.0, 0.1), (0, 0.4, -0.05), mat("#d8cbb6", rough=0.9), 0)
    box("wall", (14, 0.2, 8), (0, 1.3, 4), wall, 0)
    box("window", (2.4, 0.1, 2.0), (-0.6, 1.19, 4.6), mat("#9fd0f2", emit=0.6), 0)
    box("winFrame", (2.6, 0.12, 0.12), (-0.6, 1.17, 3.55), mat("#ffffff"), 0)
    box("winBar", (0.1, 0.12, 2.0), (-0.6, 1.17, 4.6), mat("#ffffff"), 0)
    rm = mat("coral")
    top, bot = Vector((x0, 0.95, N * RISE + 0.95)), Vector((3.0, 0.95, 0.95))
    link("rail", top, bot, 0.05, rm)
    link("railTop", (x0 - 2.4, 0.95, N * RISE + 0.95), top, 0.05, rm)
    for i in range(0, N + 1, 3):
        x = x0 + i * RUN; h = (N - i) * RISE
        link(f"post{i}", (x, 0.95, h), (x, 0.95, h + 0.95), 0.035, rm)
    box("floorNo", (0.9, 0.06, 0.6), (-4.6, 1.18, 5.2), mat("#3fae5a"), 0.02)
run(build)
