import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Beach-store shelf unit (What If #7 snow: "nobody owns a snow shovel" - beach gear everywhere, one EMPTY slot).
# Origin = floor centre; 4.4 wide (X), 0.8 deep, 2.5 tall; front faces +Z in three (-Y here).
# Shelf tops at y 0.28 / 0.88 / 1.48 / 2.08. Row 0 beach balls, row 1 sunscreen bottles, row 2 flip flops with an
# EMPTY GAP from x -0.65 to +0.65 (two bare peg hooks; the scene draws the missing item outline there), row 3 sun hats
# and rolled towels. Blank header plate on top (no text/logo).
def build():
    back, frame, shelf = mat("#f4ead8"), mat("#8fd3c1"), mat("#fffaf0")
    box("back", (4.4, 0.06, 2.5), (0, 0.37, 1.25), back, 0.01)
    for s in (-1, 1):
        box(f"side{s}", (0.08, 0.8, 2.6), (s * 2.2, 0, 1.3), frame, 0.02)
    box("kick", (4.4, 0.75, 0.22), (0, 0, 0.11), frame, 0.02)
    for i, z in enumerate((0.25, 0.85, 1.45, 2.05)):
        box(f"shelf{i}", (4.32, 0.76, 0.06), (0, 0, z), shelf, 0.01)
        box(f"lip{i}", (4.32, 0.03, 0.09), (0, -0.39, z - 0.01), mat("gold"), 0.005)
    box("header", (4.4, 0.1, 0.4), (0, -0.05, 2.8), mat("coral"), 0.03)
    # row 0: beach balls
    cols = ("coral", "#5fe3ff", "#f5b942", "white")
    for i in range(8):
        ball(f"bb{i}", 0.2, (-1.85 + i * 0.53, -0.05, 0.48), mat(cols[i % 4]), seg=12)
    # row 1: sunscreen bottles
    for i in range(14):
        x = -2.0 + i * 0.3
        cyl(f"sun{i}", 0.07, 0.28, (x, -0.1, 1.02), mat("#ffcf6e" if i % 2 else "#ff9f43"), verts=10)
        cyl(f"cap{i}", 0.04, 0.06, (x, -0.1, 1.19), mat("white"), verts=8)
    # row 2: flip flops (pairs) left and right of the EMPTY gap
    for i in range(6):
        side = -1 if i < 3 else 1
        x = side * (0.95 + (i % 3) * 0.42)
        c = mat(("coral", "#5fe3ff", "#f5b942")[i % 3])
        for j in (-1, 1):
            box(f"ff{i}{j}", (0.13, 0.04, 0.3), (x + j * 0.08, -0.15, 1.64), c, 0.01, rot=(0.25, 0, 0))
    for s in (-1, 1):
        cyl(f"peg{s}", 0.015, 0.3, (s * 0.25, 0.2, 1.95), mat("#9aa0b8", metal=0.4), rot=(math.pi / 2, 0, 0), verts=6)
    # row 3: sun hats + rolled towels
    for i in range(4):
        x = -1.7 + i * 1.1
        cyl(f"brim{i}", 0.24, 0.03, (x, -0.05, 2.1), mat("#e9c48e"), verts=16)
        cyl(f"crown{i}", 0.12, 0.12, (x, -0.05, 2.18), mat("#e9c48e"), verts=12)
        cyl(f"towel{i}", 0.08, 0.45, (x + 0.55, -0.05, 2.17), mat(("#5fe3ff", "coral")[i % 2]), rot=(0, math.pi / 2, 0), verts=10)
run(build)
