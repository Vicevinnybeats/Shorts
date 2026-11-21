import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Low sports car (What If #2 "fast cars"). Origin = bottom centre; length 2.8 along +X (front); gold body, cyan lights.
def build():
    body, dark = mat("gold"), mat("dark")
    box("lower", (2.8, 1.2, 0.36), (0, 0, 0.36), body, 0.08)
    box("nose", (0.7, 1.16, 0.2), (1.2, 0, 0.36), body, 0.08, rot=(0, 0.12, 0))
    box("cabin", (1.2, 1.0, 0.34), (-0.15, 0, 0.66), body, 0.12)
    box("glass", (1.22, 1.02, 0.2), (-0.12, 0, 0.7), mat("ink", rough=0.2), 0.06)
    box("windshield", (0.06, 0.96, 0.3), (0.45, 0, 0.66), mat("ink", rough=0.2), 0.02, rot=(0, -0.9, 0))
    box("spoiler", (0.24, 1.18, 0.05), (-1.32, 0, 0.75), dark, 0.02)
    for s in (-1, 1):
        box(f"strut{s}", (0.05, 0.05, 0.2), (-1.3, s * 0.45, 0.62), dark, 0)
        box(f"stripe{s}", (2.0, 0.02, 0.06), (0, s * 0.61, 0.42), mat("coral"), 0)
        box(f"head{s}", (0.04, 0.26, 0.07), (1.41, s * 0.38, 0.42), mat("cyan", emit=3.0), 0)
        box(f"tail{s}", (0.04, 0.3, 0.07), (-1.41, s * 0.36, 0.44), mat("coral", emit=3.0), 0)
        for t in (-1, 1):
            cyl(f"wheel{s}{t}", 0.24, 0.2, (t * 0.92, s * 0.58, 0.24), dark, rot=(math.pi / 2, 0, 0), verts=18)
            cyl(f"rim{s}{t}", 0.12, 0.21, (t * 0.92, s * 0.58, 0.24), mat("grey", metal=0.7, rough=0.3), rot=(math.pi / 2, 0, 0), verts=10)
    box("underglow", (2.4, 0.9, 0.02), (0, 0, 0.12), mat("cyan", emit=2.0), 0)
run(build)
