import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# 1960s table radio (Randy's room). Origin = bottom centre; grille + glowing amber dial on the front (-Y).
def build():
    box("body", (1.3, 0.55, 0.7), (0, 0, 0.37), mat("wood64"), 0.07)
    box("grille", (0.7, 0.02, 0.45), (-0.22, -0.28, 0.38), mat("#1a1008"), 0.01)
    for i in range(6):
        box(f"bar{i}", (0.02, 0.02, 0.42), (-0.5 + i * 0.11, -0.295, 0.38), mat("amber", emit=0.4), 0)
    cyl("dial", 0.11, 0.03, (0.38, -0.285, 0.45), mat("amber", emit=2.5), rot=(math.pi / 2, 0, 0), verts=24)
    for i, x in enumerate((0.28, 0.48)):
        cyl(f"knob{i}", 0.045, 0.05, (x, -0.29, 0.2), mat("cream"), rot=(math.pi / 2, 0, 0), verts=16)
    box("handle", (0.6, 0.06, 0.05), (0, 0, 0.75), mat("cream"), 0.02)
    for s in (-1, 1):
        cyl(f"foot{s}", 0.04, 0.04, (s * 0.5, 0, 0.02), mat("wood2"), verts=10)
run(build)
