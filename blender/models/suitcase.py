import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Rolling suitcase (What If #2 arrival). Origin = bottom centre; shell ~1.0 tall, pulled-up handle to 1.6; front faces -Y.
def build():
    box("shell", (0.72, 0.36, 0.92), (0, 0, 0.54), mat("coral"), 0.07)
    for i in (-1, 0, 1):
        box(f"rib{i}", (0.05, 0.38, 0.86), (i * 0.22, 0, 0.54), mat("#e0613f"), 0.02)
    box("zip", (0.74, 0.37, 0.03), (0, 0, 0.54), mat("dark"), 0.01)
    box("sticker1", (0.2, 0.02, 0.14), (-0.15, -0.19, 0.75), mat("cyan"), 0.01)
    box("sticker2", (0.16, 0.02, 0.16), (0.17, -0.19, 0.38), mat("gold"), 0.01)
    for s in (-1, 1):
        cyl(f"pole{s}", 0.022, 0.56, (s * 0.2, 0.12, 1.27), mat("grey", metal=0.6, rough=0.3), verts=8)
        cyl(f"wheel{s}", 0.06, 0.05, (s * 0.26, 0.1, 0.06), mat("ink"), rot=(0, math.pi / 2, 0), verts=12)
    box("handle", (0.48, 0.07, 0.06), (0, 0.12, 1.56), mat("dark"), 0.02)
    box("grip", (0.2, 0.08, 0.05), (0, -0.19, 1.04), mat("gold", emit=1.2), 0.02)
run(build)
