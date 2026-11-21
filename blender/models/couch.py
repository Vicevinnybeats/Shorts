import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Remy's den couch (What If #1). Origin = floor centre of the seat; seat top z 0.92; front faces -Y (camera).
def build():
    box("seat", (4.8, 1.5, 0.76), (0, 0, 0.46), mat("navy2"), 0.05)
    box("back", (4.8, 0.34, 1.3), (0, 0.62, 1.3), mat("navy2"), 0.06)
    for s in (-1, 1):
        box(f"cushion{s}", (2.2, 1.3, 0.18), (s * 1.15, -0.05, 0.92), mat("navy3"), 0.07)
        box(f"backcush{s}", (2.1, 0.22, 0.8), (s * 1.12, 0.38, 1.35), mat("navy3"), 0.08)
        box(f"arm{s}", (0.4, 1.6, 1.5), (s * 2.55, 0, 0.75), mat("navy"), 0.08)
        for t in (-1, 1):
            cyl(f"leg{s}{t}", 0.06, 0.1, (s * 2.5, t * 0.65, 0.05), mat("dark"), verts=12)
    box("pillow", (0.8, 0.22, 0.7), (1.75, 0.3, 1.35), mat("coral"), 0.1, rot=(0, 0.15, 0))
    box("strip", (4.8, 0.04, 0.05), (0, -0.77, 0.14), mat("gold", emit=3.0), 0)
run(build)
