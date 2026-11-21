import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Palm tree (What If #2 Miami street / beach). Origin = trunk base; crown ~5 high; trunk leans toward +X.
def build():
    trunk, ring = mat("#7a5a36"), mat("#5e4329")
    x, z = 0.0, 0.0
    for i in range(10):
        r = 0.2 - i * 0.008
        lean = 0.035 * i
        cyl(f"trunk{i}", r, 0.5, (x, 0, z + 0.25), trunk if i % 2 == 0 else ring, rot=(0, lean, 0), verts=10, r2=r * 0.92)
        x += math.sin(lean) * 0.5; z += math.cos(lean) * 0.48
    for i in range(3):
        a = i * 2.1
        ball(f"coco{i}", 0.13, (x + math.cos(a) * 0.18, math.sin(a) * 0.18, z - 0.12), mat("#4a3420"))
    leaf, leaf2 = mat("#2f9e5a"), mat("#257a46")
    for i in range(8):
        a = i * math.pi / 4 + 0.2
        droop = 0.55 if i % 2 == 0 else 0.35
        for j in range(3):
            d = 0.35 + j * 0.62
            px, py = x + math.cos(a) * d, math.sin(a) * d
            pz = z + 0.1 - (j * j) * 0.07 * (1 + droop) - j * 0.06
            box(f"leaf{i}{j}", (0.75, 0.42 - j * 0.1, 0.05), (px, py, pz), leaf if (i + j) % 2 == 0 else leaf2, 0.015,
                rot=(0, 0.12 + j * 0.2 * (1 + droop), a))
    ball("crown", 0.24, (x, 0, z + 0.05), leaf2)
run(build)
