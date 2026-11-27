import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# ICE SHEET CHUNK / pressure ridge block (What If #9 respawn, generic icy look, no animals). Origin = floor centre.
# Irregular 7-sided slab ~5 wide: pale-blue ice sides (h 1.0), snow cap on top (top y ~1.2), two broken ice blocks
# leaning on it and a small spike. Scale freely to make ridges / bergs on the flat ice sheet.
def build():
    ice, ice2, snow = mat("#9fd3ec", rough=0.3), mat("#7cbfe0", rough=0.3), mat("#f4fbff", rough=0.8)
    cyl("slab", 2.5, 1.0, (0, 0, 0.5), ice, verts=7, bevel=0.12)
    cyl("cap", 2.42, 0.24, (0, 0, 1.08), snow, verts=7, bevel=0.1)
    box("block1", (1.3, 1.0, 1.1), (1.9, -0.6, 0.55), ice2, 0.1, rot=(0.25, -0.2, 0.5))
    box("block1cap", (1.25, 0.95, 0.18), (1.95, -0.6, 1.12), snow, 0.06, rot=(0.25, -0.2, 0.5))
    box("block2", (0.9, 0.8, 0.8), (-2.0, 0.8, 0.4), ice, 0.08, rot=(-0.2, 0.15, 1.1))
    cyl("spike", 0.5, 1.6, (-0.6, 0.5, 1.6), ice2, verts=5, r2=0.05, bevel=0.0)
run(build)
