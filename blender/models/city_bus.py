import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# City BUS (What If #8 commute). Origin = floor centre; 7.6 long along +X (front at +X), 2.3 wide, roof z ~3.1;
# cream body with a coral band and gold roof line, dark-blue window band, a front door at x +2.9 (-Y side), cyan
# destination strip (blank, no text), 6 wheels. Front faces -Y in Blender (= +Z in three: the door side).
def build():
    body, dark, win = mat("#f6efe2", rough=0.5), mat("dark"), mat("#3a5f8a", rough=0.15)
    box("lower", (7.6, 2.3, 1.2), (0, 0, 0.95), body, 0.1)
    box("upper", (7.5, 2.26, 1.3), (0, 0, 2.25), body, 0.12)
    box("band", (7.62, 2.32, 0.28), (0, 0, 1.38), mat("coral"), 0.03)
    box("roofLine", (7.4, 2.2, 0.1), (0, 0, 2.93), mat("gold"), 0.03)
    box("winL", (6.2, 0.04, 0.9), (-0.5, -1.15, 2.2), win, 0.02)
    box("winR", (6.2, 0.04, 0.9), (-0.5, 1.15, 2.2), win, 0.02)
    box("windshield", (0.05, 2.0, 1.3), (3.81, 0, 2.05), win, 0.03)
    box("dest", (0.06, 1.4, 0.24), (3.82, 0, 2.85), mat("cyan", emit=1.5), 0)
    box("door", (0.9, 0.05, 2.0), (2.9, -1.16, 1.3), win, 0.02)
    box("doorFrame", (0.06, 0.06, 2.0), (2.9, -1.18, 1.3), dark, 0)
    for s in (-1, 1):
        box(f"head{s}", (0.05, 0.3, 0.14), (3.81, s * 0.8, 0.75), mat("hot", emit=2.5), 0)
        box(f"tail{s}", (0.05, 0.3, 0.14), (-3.81, s * 0.8, 0.75), mat("coral", emit=2.5), 0)
    box("bumper", (0.12, 2.3, 0.22), (3.82, 0, 0.42), dark, 0.03)
    for x in (2.4, -1.8, -2.8):
        for s in (-1, 1):
            cyl(f"wheel{x}{s}", 0.48, 0.3, (x, s * 1.05, 0.48), dark, rot=(math.pi / 2, 0, 0), verts=20)
            cyl(f"hub{x}{s}", 0.22, 0.32, (x, s * 1.05, 0.48), mat("grey", metal=0.6, rough=0.3), rot=(math.pi / 2, 0, 0), verts=12)
run(build)
