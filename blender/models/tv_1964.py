import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# 1960s console TV (Randy's room, switched off). Origin = bottom centre; screen faces -Y; rabbit-ear antennas.
def build():
    for s in (-1, 1):
        for t in (-1, 1):
            cyl(f"leg{s}{t}", 0.04, 0.12, (s * 0.7, t * 0.45, 0.06), mat("wood2"), verts=10)
    box("cabinet", (1.6, 1.1, 1.0), (0, 0, 0.62), mat("wood"), 0.04)
    box("tube", (1.5, 1.05, 1.0), (0, 0, 1.6), mat("wood64"), 0.06)
    box("screen", (1.0, 0.03, 0.72), (-0.15, -0.52, 1.6), mat("#1c1f26", rough=0.25), 0.04)
    for i, z in enumerate((1.8, 1.55, 1.3)):
        cyl(f"knob{i}", 0.05, 0.05, (0.55, -0.53, z), mat("cream"), rot=(math.pi / 2, 0, 0), verts=12)
    box("grille", (1.3, 0.02, 0.5), (0, -0.56, 0.62), mat("#2a1b10"), 0.01)
    for s in (-1, 1):
        cyl(f"ant{s}", 0.015, 0.9, (s * 0.2, 0, 2.48), mat("grey", metal=0.6, rough=0.3), rot=(0, s * 0.5, 0), verts=8)
    ball("antbase", 0.08, (0, 0, 2.12), mat("dark"))
run(build)
