import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Saguaro cactus (desert highway). Origin = ground; ~4 tall.
def build():
    g = mat("#4c9a52", rough=0.85)
    cyl("stem", 0.35, 3.6, (0, 0, 1.8), g, verts=12); ball("top", 0.35, (0, 0, 3.6), g)
    cyl("armL1", 0.22, 1.0, (-0.6, 0, 1.6), g, rot=(0, math.pi / 2, 0), verts=10); cyl("armL2", 0.22, 1.2, (-1.05, 0, 2.2), g, verts=10); ball("tL", 0.22, (-1.05, 0, 2.8), g)
    cyl("armR1", 0.2, 0.8, (0.5, 0, 2.2), g, rot=(0, math.pi / 2, 0), verts=10); cyl("armR2", 0.2, 0.9, (0.85, 0, 2.65), g, verts=10); ball("tR", 0.2, (0.85, 0, 3.1), g)
run(build)
