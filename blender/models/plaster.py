import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Close-up FINGER with a sticking plaster wrapped round it (What If #4 small cut, insert shot). The finger lies along +X
# (tip at +X ~1.6, knuckle/base at x -1.6), radius 0.32, axis at z 0.36 so it rests on a table top (origin = table
# contact under the finger centre). Tan plaster band (0.5 wide) round the middle with a cream pad on top + air holes.
def build():
    skin, nail = mat("#f3d2b3", rough=0.75), mat("#f7dccb", rough=0.35)
    cyl("finger", 0.32, 3.0, (-0.1, 0, 0.36), skin, rot=(0, math.pi / 2, 0), verts=32)
    ball("tip", 0.32, (1.4, 0, 0.36), skin, seg=24)
    ball("nail", 0.22, (1.52, 0, 0.55), nail, scale=(1.3, 1.0, 0.32), seg=20)
    for i, x in enumerate((0.55, -0.85)):  # knuckle creases
        torus(f"crease{i}", 0.325, 0.012, (x, 0, 0.36), mat("#e2b79a"), rot=(0, math.pi / 2, 0))
    cyl("band", 0.34, 0.5, (-0.15, 0, 0.36), mat("#e8b98a", rough=0.8), rot=(0, math.pi / 2, 0), verts=32, bevel=0.01)
    box("pad", (0.26, 0.42, 0.05), (-0.15, 0, 0.7), mat("#fff1dc"), 0.02)
    for i in range(6):
        ball(f"hole{i}", 0.018, (-0.15 + (-0.16 if i < 3 else 0.16), -0.2 + (i % 3) * 0.2, 0.68 + (0.0 if i % 3 == 1 else -0.03)), mat("#c9915e"), seg=8)
run(build)
