import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# RANDOM SPAWN MAP PIN (What If #9 respawn): classic teardrop location pin, origin = the TIP (it lands there), pin
# axis = up (three +y). Head ball r 0.5 centre at z 1.45; cone from the tip to r 0.45 at z 1.25. Cyan body (emissive
# so it glows on the globe), white inner disc on both faces (front -Y = three +z), gold ring under the head.
def build():
    body = mat("cyan", emit=0.7, rough=0.35)
    cyl("cone", 0.02, 1.25, (0, 0, 0.62), body, verts=24, r2=0.45)
    ball("head", 0.5, (0, 0, 1.45), body, seg=24)
    for s in (-1, 1):
        cyl(f"dot{s}", 0.2, 0.06, (0, s * 0.47, 1.47), mat("white", emit=0.4), rot=(math.pi / 2, 0, 0), verts=20)
    torus("ring", 0.43, 0.04, (0, 0, 1.12), mat("gold", emit=0.3, rough=0.3))
run(build)
