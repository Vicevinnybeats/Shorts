import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Sunny two-storey school (What If #3 pedestrian test). Origin = ground centre, front faces -Y. 16 wide, 7 deep,
# 7.4 tall + a small clock tower (clock face z ~8.8, roof tip ~11.6). Warm brick, cream trim, blue windows, coral doors,
# yellow flag at +X, low cream fence at y -6.2.
def build():
    brick, trim, glass = mat("#d0785a", rough=0.85), mat("#f4e8d4", rough=0.8), mat("#4f86b8", rough=0.25, metal=0.2)
    box("main", (16, 7, 7.0), (0, 0, 3.5), brick, 0.06)
    box("cornice", (16.4, 7.4, 0.4), (0, 0, 7.2), trim, 0.04)
    box("band", (16.1, 7.1, 0.25), (0, 0, 3.6), trim, 0)
    for row, z in enumerate((1.9, 5.3)):
        for i in range(-3, 4):
            if row == 0 and i == 0:
                continue
            x = i * 2.1
            box(f"win{row}_{i + 3}", (1.3, 0.1, 1.6), (x, -3.52, z), glass, 0)
            box(f"sill{row}_{i + 3}", (1.5, 0.2, 0.12), (x, -3.58, z - 0.86), trim, 0)
            box(f"mull{row}_{i + 3}", (0.07, 0.12, 1.6), (x, -3.58, z), trim, 0)
    box("porch", (3.6, 1.0, 0.3), (0, -4.0, 0.15), trim, 0.03)
    box("step", (3.0, 0.5, 0.15), (0, -4.7, 0.075), trim, 0.02)
    for s in (-1, 1):
        box(f"door{s}", (0.8, 0.1, 2.2), (s * 0.44, -3.53, 1.4), mat("coral"), 0.02)
        box(f"col{s}", (0.3, 0.3, 3.0), (s * 1.6, -4.25, 1.8), trim, 0.03)
    box("canopy", (3.8, 1.3, 0.2), (0, -4.0, 3.3), trim, 0.03)
    box("tower", (2.6, 2.6, 2.6), (0, 0, 8.7), brick, 0.05)
    cyl("towerRoof", 2.0, 1.6, (0, 0, 10.8), mat("#3f6f9e"), verts=4, r2=0.05, rot=(0, 0, math.pi / 4))
    cyl("clock", 0.8, 0.08, (0, -1.32, 8.8), mat("#fffaf0"), rot=(math.pi / 2, 0, 0), verts=28)
    torus("clockRim", 0.8, 0.06, (0, -1.36, 8.8), mat("gold"), rot=(math.pi / 2, 0, 0))
    box("hand1", (0.06, 0.04, 0.55), (0, -1.4, 9.05), mat("ink"), 0)
    box("hand2", (0.42, 0.04, 0.06), (0.2, -1.4, 8.8), mat("ink"), 0)
    cyl("flagpole", 0.06, 8.0, (9.5, -2.0, 4.0), mat("#dfe3e8", metal=0.5), verts=10)
    box("flag", (1.6, 0.04, 1.0), (10.3, -2.0, 7.3), mat("#f5b942"), 0.01)
    for i in range(-7, 8):  # low front fence
        box(f"post{i + 7}", (0.1, 0.1, 0.9), (i * 1.2, -6.2, 0.45), trim, 0)
    box("fenceRail", (17, 0.08, 0.1), (0, -6.2, 0.8), trim, 0)
    box("fenceRail2", (17, 0.08, 0.1), (0, -6.2, 0.4), trim, 0)
run(build)
