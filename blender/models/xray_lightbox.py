import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Wall X-RAY LIGHTBOX (What If #4 broken arm). Origin = floor centre under it; mounts on a wall (back at y +0.08).
# Glowing screen 2.4 x 1.7, centre z 2.25, facing -Y (the X-ray image - bone knitting - is drawn by the scene on a Panel
# just in front, ~0.05 in front of the screen). Cream frame, two film clips on top, a small switch with a gold light.
def build():
    box("frame", (2.7, 0.16, 2.0), (0, 0, 2.25), mat("#eef1f5", rough=0.6), 0.04)
    box("screen", (2.4, 0.02, 1.7), (0, -0.085, 2.25), mat("#dff4ff", emit=1.6), 0)
    for s in (-1, 1):
        box(f"clip{s}", (0.22, 0.06, 0.12), (s * 0.55, -0.1, 3.08), mat("#9aa0b8", metal=0.5, rough=0.4), 0.01)
    box("switchplate", (0.18, 0.04, 0.26), (1.2, -0.09, 1.38), mat("#d6dbe3"), 0.01)
    ball("switchlight", 0.03, (1.2, -0.12, 1.44), mat("gold", emit=3.0), seg=8)
    box("shelf", (2.7, 0.3, 0.06), (0, -0.07, 1.22), mat("#d6dbe3"), 0.01)
run(build)
