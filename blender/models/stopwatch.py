import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Handheld STOPWATCH (What If #6 breath "land" test). Origin = centre of the dial; dial r 0.29 faces the front (-Y,
# three +z); stem + coral crown button on top, side button at upper right, a short coral lanyard loop. The scene draws
# the moving hand on top (three z +0.08). Gold case, cream dial with 12 ink ticks.
def build():
    gold = mat("gold", rough=0.35, metal=0.4)
    cyl("case", 0.34, 0.12, (0, 0, 0), gold, rot=(math.pi / 2, 0, 0), verts=36, bevel=0.02)
    cyl("dial", 0.29, 0.02, (0, -0.06, 0), mat("#fffaf0"), rot=(math.pi / 2, 0, 0), verts=36)
    for i in range(12):
        a = i * math.pi / 6
        L = 0.07 if i % 3 == 0 else 0.04
        r = 0.25 - L / 2
        box(f"tick{i}", (0.018, 0.01, L), (r * math.sin(a), -0.072, r * math.cos(a)), mat("ink"), 0, rot=(0, a, 0))
    cyl("stem", 0.045, 0.1, (0, 0, 0.38), gold, verts=12)
    cyl("crown", 0.075, 0.07, (0, 0, 0.46), mat("coral"), verts=16, bevel=0.01)
    cyl("side", 0.035, 0.08, (0.26, 0, 0.26), gold, rot=(0, -math.pi / 4, 0), verts=10)
    torus("loop", 0.09, 0.018, (0, 0, 0.58), mat("coral"), rot=(math.pi / 2, 0, 0))
run(build)
