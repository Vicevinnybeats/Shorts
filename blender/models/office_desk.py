import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# OFFICE DESK workstation (What If #8 work). Origin = floor centre; desk 2.4 wide (X), 1.1 deep, top z 1.12; front
# modesty panel faces -Y (= +z toward the camera); the MONITOR sits at the front edge with its screen facing +Y
# (= -z in three, toward the worker behind the desk); the monitor is OFF-CENTRE at x +0.55 so a worker at x -0.3
# stays visible from the front; keyboard, mug, potted plant, desk lamp, and a navy
# office chair behind the desk (seat z 0.75). A low grey cubicle partition 2.9 wide behind it all (y +1.6, top 1.9).
def build():
    top, leg = mat("#f6efe2", rough=0.4), mat("#c4c9d2", rough=0.3, metal=0.5)
    box("top", (2.4, 1.1, 0.07), (0, 0, 1.09), top, 0.02)
    box("edge", (2.4, 0.02, 0.03), (0, -0.56, 1.08), mat("gold"), 0)
    box("panel", (2.3, 0.04, 0.8), (0, -0.48, 0.62), mat("#9fd8c8"), 0.02)
    for x in (-1.12, 1.12):
        box(f"leg{x}", (0.06, 1.0, 1.06), (x, 0, 0.53), leg, 0.01)
    box("drawers", (0.5, 0.9, 0.7), (0.8, 0.05, 0.56), mat("#8ccab9"), 0.02)
    box("monBack", (1.05, 0.06, 0.62), (0.55, -0.25, 1.62), mat("dark"), 0.03)
    box("screen", (0.97, 0.02, 0.54), (0.55, -0.215, 1.62), mat("#bfe6f2", emit=1.2), 0)
    box("neck", (0.06, 0.06, 0.3), (0.55, -0.28, 1.27), mat("dark"), 0)
    box("foot", (0.36, 0.22, 0.03), (0.55, -0.28, 1.14), mat("dark"), 0.01)
    box("kb", (0.7, 0.22, 0.04), (0.1, 0.15, 1.15), mat("#e6dccb"), 0.01)
    cyl("mug", 0.07, 0.15, (-0.62, 0.25, 1.2), mat("coral"), verts=16)
    cyl("pot", 0.1, 0.16, (1.0, 0.25, 1.21), mat("#d9b07a"), verts=14, r2=0.08)
    for i in range(6):
        a = i * 1.05
        ball(f"leaf{i}", 0.08, (1.0 + 0.07 * math.cos(a), 0.25 + 0.07 * math.sin(a), 1.38 + 0.04 * (i % 2)), mat("#6fae52"), scale=(1, 1, 1.4), seg=10)
    cyl("lampBase", 0.1, 0.03, (-0.98, -0.3, 1.14), mat("dark"), verts=14)
    box("lampArm", (0.03, 0.03, 0.5), (-0.98, -0.3, 1.4), mat("dark"), 0, rot=(0.3, 0, 0))
    cyl("lampHead", 0.12, 0.14, (-0.98, -0.15, 1.62), mat("gold"), verts=14, r2=0.05)
    box("seat", (0.62, 0.6, 0.12), (0, 0.85, 0.75), mat("navy3"), 0.05)
    box("back", (0.58, 0.1, 0.7), (0, 1.15, 1.18), mat("navy3"), 0.05)
    cyl("stem", 0.04, 0.5, (0, 0.85, 0.45), leg, verts=10)
    for i in range(5):
        a = i * 1.2566
        box(f"star{i}", (0.34, 0.05, 0.04), (0.17 * math.cos(a), 0.85 + 0.17 * math.sin(a), 0.1), mat("dark"), 0, rot=(0, 0, a))
    box("partition", (2.9, 0.08, 1.9), (0, 1.6, 0.95), mat("#9aa0b8", rough=0.9), 0.03)
    box("partTrim", (2.92, 0.1, 0.05), (0, 1.6, 1.9), mat("gold"), 0)
    box("note1", (0.18, 0.01, 0.18), (-0.6, 1.555, 1.45), mat("amber"), 0)
    box("note2", (0.18, 0.01, 0.18), (-0.35, 1.555, 1.5), mat("cyan"), 0)
run(build)
