import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Stylised coastal power plant (What If #7 snow: manatees crowd around the warm-water outflow). Generic, no logo/name.
# Origin = ground level at the centre of the pad; front faces +Z in three (-Y here). Pad 16 x 10; main hall 9 x 5 x 4.8
# (cream, mint roof band, blue window strips), turbine hall at +X, two tall stacks (top ~14) with coral/white bands
# behind, a concrete seawall along the front edge (three z +5.0) with a big round OUTFLOW pipe mouth at x 0, centre
# y -0.15 (half under a water line at y ~ -0.25). Steam/warm water are drawn by the scene.
def build():
    cream, mint, conc, glass = mat("#efe6d6"), mat("#8fd3c1"), mat("#c9c3b8"), mat("#7fb4e0", rough=0.3)
    coral, white, dark = mat("coral"), mat("white"), mat("#2a2f3d")
    box("pad", (16, 10, 0.3), (0, 0, -0.15), conc, 0.02)
    box("seawall", (16, 0.6, 0.9), (0, -5.0, -0.45), mat("#b7b0a4"), 0.04)
    # main hall + roof band + window strips on the front
    box("hall", (9, 5, 4.8), (-1.5, 0.5, 2.4), cream, 0.06)
    box("hallroof", (9.2, 5.2, 0.4), (-1.5, 0.5, 4.95), mint, 0.04)
    for r, z in enumerate((1.4, 3.2)):
        for i in range(5):
            box(f"win{r}{i}", (1.2, 0.06, 0.9), (-5.0 + i * 1.75, -2.02, z), glass, 0.01)
    box("door", (1.6, 0.06, 2.0), (1.9, -2.03, 1.0), mint, 0.02)
    # turbine hall (lower, at +X) with a curved-ish roof (two steps)
    box("turbine", (5, 4.4, 3.2), (5.2, 0.8, 1.6), mat("#e6dccb"), 0.05)
    box("turbroof", (5.2, 4.6, 0.35), (5.2, 0.8, 3.35), coral, 0.04)
    box("turbroof2", (3.6, 3.6, 0.35), (5.2, 0.8, 3.7), coral, 0.04)
    for i in range(3):
        box(f"twin{i}", (0.9, 0.06, 1.2), (3.8 + i * 1.4, -1.43, 1.7), glass, 0.01)
    # two stacks with coral/white bands
    for j, x in enumerate((-4.0, -1.2)):
        cyl(f"stack{j}", 0.7, 13.6, (x, 3.6, 6.8), white, verts=20, r2=0.55)
        for k, z in enumerate((9.6, 11.4, 13.2)):
            cyl(f"band{j}{k}", 0.64 - (z - 6.8) * 0.011, 0.75, (x, 3.6, z), coral, verts=20)
        cyl(f"rim{j}", 0.6, 0.2, (x, 3.6, 13.7), dark, verts=20)
    # pipes from the hall to the outflow
    cyl("pipeA", 0.35, 3.0, (0.0, -3.4, 0.25), mat("#9aa0b8", metal=0.3), rot=(math.pi / 2, 0, 0), verts=16)
    # outflow mouth in the seawall: big ring + dark inside
    cyl("mouth", 0.95, 0.7, (0.0, -5.25, -0.15), conc, rot=(math.pi / 2, 0, 0), verts=24)
    cyl("mouthin", 0.75, 0.72, (0.0, -5.26, -0.15), dark, rot=(math.pi / 2, 0, 0), verts=24)
    # railing along the seawall
    for i in range(15):
        box(f"post{i}", (0.06, 0.06, 0.8), (-7.0 + i * 1.0, -4.85, 0.4), mat("#f5b942"), 0)
    box("rail", (14.2, 0.06, 0.06), (0, -4.85, 0.8), mat("#f5b942"), 0)
    # small transformer yard at -X front
    for i in range(3):
        box(f"tx{i}", (0.8, 0.8, 1.0), (-6.6 + i * 1.1, -3.0, 0.5), mat("#9aa0b8"), 0.03)
run(build)
