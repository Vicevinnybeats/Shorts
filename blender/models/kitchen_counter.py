import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Bright KITCHEN COUNTER (What If #5 weighing scenes). Origin = floor centre; 4.0 long (X), 0.9 deep (Y), worktop top
# z 1.3 (fits a puppet h 2.5), mint cabinets with gold knobs and a dark toe kick, cream worktop with a gold edge,
# a sink at x +1.2 with a steel faucet, a little herb pot at x -1.7. Front faces -Y; the back edge is at y +0.45.
def build():
    mint, mint2, top = mat("#9fd8c8", rough=0.6), mat("#8ccab9", rough=0.6), mat("#f6efe2", rough=0.4)
    steel = mat("#c4c9d2", rough=0.25, metal=0.6)
    box("toe", (3.9, 0.8, 0.12), (0, 0.04, 0.06), mat("dark"), 0.01)
    box("carcass", (4.0, 0.86, 1.1), (0, 0, 0.67), mint2, 0.02)
    for i in range(4):
        x = -1.5 + i * 1.0
        box(f"door{i}", (0.92, 0.04, 0.95), (x, -0.44, 0.66), mint, 0.03)
        ball(f"knob{i}", 0.035, (x + (0.36 if i % 2 else -0.36), -0.47, 0.98), mat("gold"), seg=10)
    box("worktop", (4.1, 0.94, 0.08), (0, 0, 1.26), top, 0.02)
    box("edge", (4.1, 0.02, 0.03), (0, -0.475, 1.25), mat("gold"), 0)
    box("sink", (0.7, 0.45, 0.02), (1.2, 0.0, 1.301), steel, 0.01)
    box("sinkHole", (0.6, 0.36, 0.02), (1.2, 0.0, 1.306), mat("#7d8391"), 0.01)
    cyl("faucet", 0.03, 0.4, (1.2, 0.32, 1.5), steel, verts=12)
    box("spout", (0.04, 0.26, 0.04), (1.2, 0.2, 1.69), steel, 0.01)
    cyl("pot", 0.11, 0.16, (-1.7, 0.2, 1.38), mat("coral"), verts=16, r2=0.09, bevel=0.01)
    for i in range(5):
        a = i * 1.26
        ball(f"leaf{i}", 0.07, (-1.7 + 0.06 * math.cos(a), 0.2 + 0.06 * math.sin(a), 1.52 + 0.03 * (i % 2)), mat("#6fae52"), scale=(1, 1, 1.3), seg=10)
run(build)
