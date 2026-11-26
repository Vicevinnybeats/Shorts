import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Bright clinic / HOSPITAL BED (What If #4 broken arm). Origin = floor centre, bed runs along X (3.2 long), head end at
# -X with a raised back section; mattress top z 1.0; side faces -Y (camera). Mint frame, white sheets, coral blanket,
# white pillow, steel rails + wheels.
def build():
    mint, steel = mat("#8fd3c1", rough=0.6), mat("#c4c9d2", rough=0.3, metal=0.6)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl(f"leg{sx}{sy}", 0.04, 0.55, (sx * 1.45, sy * 0.6, 0.38), steel, verts=10)
            ball(f"wheel{sx}{sy}", 0.08, (sx * 1.45, sy * 0.6, 0.08), mat("dark"), seg=10)
    box("frame", (3.2, 1.35, 0.16), (0, 0, 0.7), mint, 0.04)
    box("mattress", (3.0, 1.25, 0.22), (0.15, 0, 0.89), mat("#fffaf0"), 0.08)
    box("backrest", (1.0, 1.25, 0.2), (-1.2, 0, 1.25), mat("#fffaf0"), 0.08, rot=(0, 0.55, 0))
    box("pillow", (0.45, 0.9, 0.2), (-1.3, 0, 1.55), mat("white"), 0.09, rot=(0, 0.55, 0))
    box("blanket", (1.5, 1.3, 0.06), (0.75, 0, 1.03), mat("coral"), 0.03)
    box("blanketFold", (0.25, 1.32, 0.08), (0.05, 0, 1.05), mat("#ffe2d6"), 0.03)
    box("headboard", (0.1, 1.35, 1.1), (-1.6, 0, 1.15), mint, 0.04)
    box("footboard", (0.1, 1.35, 0.6), (1.6, 0, 0.95), mint, 0.04)
    for sy in (-1, 1):
        box(f"rail{sy}", (1.2, 0.05, 0.05), (-0.6, sy * 0.68, 1.3), steel, 0.01)
        for i in range(3):
            box(f"railpost{sy}{i}", (0.04, 0.04, 0.45), (-1.1 + i * 0.5, sy * 0.68, 1.08), steel, 0)
run(build)
