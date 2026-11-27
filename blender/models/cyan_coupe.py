import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# "MAIN CHARACTER" COUPE (What If #8): fast generic coupe, no brand. Origin = bottom centre; 3.0 long along +X (front),
# glossy cyan body, gold racing stripe over the roof, dark glass, white headlights, coral tail lights, cyan underglow.
def build():
    body, dark = mat("cyan", rough=0.25), mat("dark")
    box("lower", (3.0, 1.28, 0.38), (0, 0, 0.38), body, 0.1)
    box("nose", (0.8, 1.22, 0.22), (1.25, 0, 0.38), body, 0.1, rot=(0, 0.14, 0))
    box("cabin", (1.3, 1.06, 0.36), (-0.2, 0, 0.7), body, 0.14)
    box("glass", (1.32, 1.08, 0.22), (-0.17, 0, 0.74), mat("ink", rough=0.15), 0.07)
    box("windshield", (0.06, 1.0, 0.32), (0.46, 0, 0.7), mat("ink", rough=0.15), 0.02, rot=(0, -0.9, 0))
    box("stripe", (3.04, 0.26, 0.02), (0, 0, 0.575), mat("gold"), 0)
    box("stripeRoof", (1.2, 0.26, 0.02), (-0.2, 0, 0.885), mat("gold"), 0)
    box("spoiler", (0.26, 1.24, 0.05), (-1.42, 0, 0.8), dark, 0.02)
    for s in (-1, 1):
        box(f"strut{s}", (0.05, 0.05, 0.22), (-1.4, s * 0.45, 0.66), dark, 0)
        box(f"head{s}", (0.04, 0.28, 0.08), (1.6, s * 0.4, 0.44), mat("hot", emit=3.0), 0)
        box(f"tail{s}", (0.04, 0.32, 0.08), (-1.51, s * 0.38, 0.46), mat("coral", emit=3.0), 0)
        for t in (-1, 1):
            cyl(f"wheel{s}{t}", 0.26, 0.22, (t * 0.98, s * 0.62, 0.26), dark, rot=(math.pi / 2, 0, 0), verts=18)
            cyl(f"rim{s}{t}", 0.13, 0.23, (t * 0.98, s * 0.62, 0.26), mat("gold", metal=0.6, rough=0.3), rot=(math.pi / 2, 0, 0), verts=10)
    box("underglow", (2.6, 1.0, 0.02), (0, 0, 0.12), mat("cyan", emit=2.5), 0)
run(build)
