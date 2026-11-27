import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# City BUS STOP shelter (What If #8 commute). Origin = floor centre; 3.4 wide (X), 1.4 deep, roof top z ~2.95;
# open front (-Y), glass back + one glass side (+X), slim bench inside (seat top z 0.62), steel frame, coral roof
# edge, a pole at x -2.2 with a round blank sign (cyan disc + white bus glyph bar, no text). Front faces -Y.
def build():
    steel, glass = mat("#c4c9d2", rough=0.3, metal=0.6), mat("#bfe6f2", rough=0.1)
    for x in (-1.65, 1.65):
        for y in (-0.6, 0.6):
            box(f"post{x}{y}", (0.08, 0.08, 2.7), (x, y, 1.35), steel, 0.01)
    box("roof", (3.6, 1.6, 0.12), (0, 0, 2.76), mat("#f6efe2"), 0.03)
    box("roofEdge", (3.62, 0.04, 0.16), (0, -0.8, 2.76), mat("coral"), 0.01)
    box("roofCap", (3.62, 0.04, 0.16), (0, 0.8, 2.76), mat("coral"), 0.01)
    box("back", (3.24, 0.03, 2.1), (0, 0.6, 1.4), glass, 0)
    box("side", (0.03, 1.16, 2.1), (1.65, 0, 1.4), glass, 0)
    box("backRail", (3.3, 0.06, 0.06), (0, 0.6, 0.32), steel, 0.01)
    box("ad", (1.0, 0.05, 1.5), (1.05, 0.56, 1.45), mat("#ffcf6e", emit=0.6), 0.02)
    box("seat", (2.0, 0.42, 0.07), (-0.4, 0.32, 0.62), mat("#d9b07a"), 0.02)
    for x in (-1.2, 0.4):
        box(f"seatLeg{x}", (0.06, 0.3, 0.6), (x, 0.36, 0.3), steel, 0.01)
    cyl("pole", 0.05, 3.0, (-2.2, -0.4, 1.5), steel, verts=12)
    cyl("sign", 0.36, 0.06, (-2.2, -0.4, 2.85), mat("cyan"), rot=(math.pi / 2, 0, 0), verts=28)
    cyl("signRim", 0.4, 0.04, (-2.2, -0.37, 2.85), mat("white"), rot=(math.pi / 2, 0, 0), verts=28)
    box("glyph", (0.36, 0.02, 0.2), (-2.2, -0.44, 2.87), mat("white"), 0.03)
    box("glyphWin", (0.28, 0.025, 0.07), (-2.2, -0.45, 2.9), mat("cyan"), 0)
    box("curb", (5.4, 1.8, 0.12), (-0.4, 0, 0.06), mat("#e6dccb"), 0.02)
run(build)
