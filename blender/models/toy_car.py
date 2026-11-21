import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Toy car for the "game world" road (What If #1). Origin = bottom centre; length along +X (front); cyan headlights.
def build():
    box("body", (1.35, 0.6, 0.3), (0, 0, 0.25), mat("coral"), 0.06)
    box("cabin", (0.7, 0.52, 0.24), (-0.05, 0, 0.5), mat("coral"), 0.05)
    box("glass", (0.72, 0.54, 0.11), (-0.05, 0, 0.52), mat("dark", rough=0.2), 0.02)
    box("roof", (0.18, 0.12, 0.06), (-0.05, 0, 0.65), mat("gold", emit=2.0), 0.01)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl(f"wheel{sx}{sy}", 0.13, 0.1, (sx * 0.42, sy * 0.3, 0.13), mat("dark"), rot=(math.pi / 2, 0, 0), verts=16)
    for sy in (-1, 1):
        box(f"head{sy}", (0.03, 0.12, 0.07), (0.68, sy * 0.18, 0.28), mat("cyan", emit=3.0), 0)
        box(f"tail{sy}", (0.03, 0.12, 0.07), (-0.68, sy * 0.18, 0.28), mat("coral", emit=3.0), 0)
run(build)
