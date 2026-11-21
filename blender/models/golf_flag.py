import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Golf hole flag (What If #2 golf course). Origin = hole on the ground; pole 2.4 tall; coral flag points +X.
def build():
    cyl("cup", 0.2, 0.04, (0, 0, 0.01), mat("ink"), verts=24)
    torus("rim", 0.21, 0.025, (0, 0, 0.02), mat("white"))
    cyl("pole", 0.035, 2.4, (0, 0, 1.2), mat("white"), verts=10)
    box("flag", (0.75, 0.03, 0.48), (0.4, 0, 2.12), mat("coral"), 0.01)
    box("band", (0.75, 0.035, 0.07), (0.4, 0, 2.12), mat("gold", emit=1.5), 0)
    ball("knob", 0.06, (0, 0, 2.42), mat("gold"))
    ball("golfball", 0.07, (0.55, -0.3, 0.07), mat("white"))
run(build)
