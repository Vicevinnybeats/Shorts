import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Big sunny window frame (open, no glass) for daylight interiors. Origin = bottom centre of the opening; 6 wide x 4 tall.
def build():
    W, Hh, t = 6.0, 4.0, 0.22
    white = mat("#f7f3ea", rough=0.6)
    box("top", (W + 2 * t, 0.3, t), (0, 0, Hh + t / 2), white, 0.03)
    box("bottom", (W + 2 * t, 0.5, t), (0, -0.1, -t / 2), white, 0.03)
    box("left", (t, 0.3, Hh), (-W / 2 - t / 2, 0, Hh / 2), white, 0.03)
    box("right", (t, 0.3, Hh), (W / 2 + t / 2, 0, Hh / 2), white, 0.03)
    for x in (-W / 6, W / 6):
        box(f"mull{x}", (0.08, 0.12, Hh), (x * 3 / 1.5 / 2, 0, Hh / 2), white, 0)
    box("trans", (W, 0.12, 0.08), (0, 0, Hh * 0.68), white, 0)
    box("sill", (W + 0.8, 0.7, 0.12), (0, -0.35, -0.2), mat("#e9dcc5"), 0.03)
run(build)
