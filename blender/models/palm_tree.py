import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Palm tree (sunny coast/city). Origin = ground; ~6 tall; curved trunk, 7 fronds.
def build():
    x = 0.0
    for i in range(6):
        x += 0.08 * i
        cyl(f"trunk{i}", 0.22 - i * 0.015, 1.0, (x, 0, 0.5 + i * 0.95), mat("#9a6a3c", rough=0.9), rot=(0, 0.06 * i, 0), verts=10)
    top = (x + 0.3, 0, 6.0)
    for k in range(7):
        a = k / 7 * 2 * math.pi
        box(f"frond{k}", (2.6, 0.6, 0.08), (top[0] + math.cos(a) * 1.2, math.sin(a) * 1.2, top[2] - 0.3), mat("#3fa34d", rough=0.8), 0.02, rot=(0, 0.45, a))
    ball("nuts", 0.35, (top[0], 0, top[2] - 0.2), mat("#6b4a28"))
run(build)
