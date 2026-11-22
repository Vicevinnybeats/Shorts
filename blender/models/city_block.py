import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Sunny city block for daylight skylines (What If daylight look). Origin = ground centre; ~14 x 10 footprint, up to ~22 tall.
# Warm pastel facades with glassy window bands and roof details; low poly so many blocks can fill a skyline.
B = [(-5, 0, 3.2, 3.2, 14, "#f3e2c4"), (-1.4, 1, 3.0, 3.6, 22, "#9cc8e8"), (2.0, -0.5, 3.4, 3.0, 11, "#f2b48a"),
     (5.2, 0.6, 2.8, 3.2, 17, "#efe7d8"), (0.6, -3.2, 3.6, 2.6, 7, "#e88f6a"), (-4.2, -3.0, 3.0, 2.8, 9, "#c9e0c4")]
def build():
    for i, (x, y, w, d, h, col) in enumerate(B):
        box(f"b{i}", (w, d, h), (x, y, h / 2), mat(col, rough=0.8), 0.06)
        for k in range(int(h // 1.6)):
            z = 1.0 + k * 1.6
            box(f"win{i}_{k}", (w + 0.04, d + 0.04, 0.42), (x, y, z), mat("#4f86b8", rough=0.25, metal=0.2), 0)
        box(f"roof{i}", (w * 0.4, d * 0.4, 0.6), (x + w * 0.15, y, h + 0.3), mat("#b9b2a6"), 0.04)
    cyl("tank", 0.6, 1.4, (-1.4, 1.6, 22.7), mat("#d9743a"), verts=12)
run(build)
