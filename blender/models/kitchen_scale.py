import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Digital KITCHEN SCALE (What If #5 "one gram" / "ten kilograms"). Origin = floor centre, 0.5 wide (X) x 0.42 deep,
# steel weighing plate on top (top z 0.105), front with a dark display window (centre x 0, y -0.218, z 0.04,
# 0.25 x 0.065; the scene draws the digits on a Panel just in front) and two cream buttons. Front faces -Y.
def build():
    box("base", (0.5, 0.42, 0.07), (0, 0, 0.035), mat("#f4f4f6", rough=0.4), 0.02)
    box("foot", (0.46, 0.38, 0.015), (0, 0, 0.0075), mat("dark"), 0.005)
    box("plinth", (0.3, 0.26, 0.015), (0, 0.02, 0.078), mat("#d9dce2"), 0.004)
    box("plate", (0.46, 0.36, 0.02), (0, 0.02, 0.095), mat("#c4c9d2", rough=0.25, metal=0.6), 0.008)
    box("displayRim", (0.28, 0.008, 0.06), (0, -0.212, 0.036), mat("gold"), 0.003)
    box("display", (0.25, 0.012, 0.045), (0, -0.216, 0.036), mat("#1c2a24"), 0.003)
    for s in (-1, 1):
        cyl(f"btn{s}", 0.014, 0.01, (s * 0.19, -0.214, 0.036), mat("cream"), rot=(math.pi / 2, 0, 0), verts=12)
run(build)
