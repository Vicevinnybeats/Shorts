import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Swimming POOL LADDER (What If #6 breath pool). Origin = top of the pool EDGE (deck level, z 0) at the ladder centre;
# each steel rail rises 0.9 from the deck (y +0.25), runs over the edge at z 0.9 (rounded corners) and goes down the
# wall into the water on the FRONT side (-Y, three +z) at y -0.11 to z -1.7; 4 non-slip steps (cream with gold edge)
# at z -0.35..-1.4. Rails 0.6 apart.
def build():
    steel = mat("#d3d8e0", rough=0.25, metal=0.7)
    for j, sx in enumerate((-0.3, 0.3)):
        cyl(f"up{j}", 0.035, 0.85, (sx, 0.25, 0.43), steel, verts=10)
        cyl(f"top{j}", 0.035, 0.36, (sx, 0.07, 0.9), steel, rot=(math.pi / 2, 0, 0), verts=10)
        ball(f"cornerA{j}", 0.036, (sx, 0.25, 0.9), steel, seg=10)
        ball(f"cornerB{j}", 0.036, (sx, -0.11, 0.9), steel, seg=10)
        cyl(f"down{j}", 0.035, 2.6, (sx, -0.11, -0.4), steel, verts=10)
        cyl(f"foot{j}", 0.06, 0.06, (sx, 0.25, 0.03), steel, verts=12)
    for i in range(4):
        z = -0.35 - i * 0.35
        box(f"step{i}", (0.6, 0.2, 0.05), (0, -0.2, z), mat("#efe3cc"), 0.01)
        box(f"edge{i}", (0.6, 0.03, 0.055), (0, -0.3, z), mat("gold"), 0.0)
run(build)
