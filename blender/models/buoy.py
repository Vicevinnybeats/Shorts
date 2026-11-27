import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Freediving DIVE BUOY (What If #6 breath). Origin = WATER LINE at the buoy centre. Orange float (r 0.55, bevelled),
# white band, short mast (top z 1.6) with a red "diver down" flag with a white diagonal, and the guide LINE hanging
# straight down to z -14 (thin cream rope, coral depth marks every 2) with a gold weight at the end.
def build():
    cyl("float", 0.55, 0.6, (0, 0, 0.05), mat("#ff8a2a", rough=0.6), verts=24, bevel=0.12)
    cyl("band", 0.565, 0.12, (0, 0, 0.12), mat("white"), verts=24)
    cyl("mast", 0.035, 1.3, (0, 0, 0.95), mat("white"), verts=8)
    box("flag", (0.55, 0.02, 0.4), (0.3, 0, 1.38), mat("#e0453a"), 0.0)
    box("diag", (0.66, 0.025, 0.08), (0.3, 0, 1.38), mat("white"), 0.0, rot=(0, -0.62, 0))
    cyl("line", 0.018, 14.0, (0, 0, -7.0), mat("#f2e6c8"), verts=6)
    cyl("weight", 0.12, 0.3, (0, 0, -14.1), mat("gold", rough=0.4, metal=0.4), verts=12, bevel=0.03)
    for i in range(6):
        cyl(f"mark{i}", 0.03, 0.12, (0, 0, -2.0 - i * 2.0), mat("coral"), verts=8)
run(build)
