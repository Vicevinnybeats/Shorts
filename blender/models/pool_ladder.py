import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Swimming POOL LADDER (What If #6 breath pool). Origin = top of the pool EDGE (deck level, z 0) at the ladder centre;
# the steel rails rise 0.9 above the deck, bend over the edge and go down the wall into the water on the FRONT side
# (-Y, three +z) to z -1.7; 4 non-slip steps (cream with gold edge) at z -0.35..-1.4. Rails 0.6 apart.
def build():
    steel = mat("#d3d8e0", rough=0.25, metal=0.7)
    for j, sx in enumerate((-0.3, 0.3)):
        cyl(f"up{j}", 0.035, 0.9, (sx, 0.25, 0.45), steel, verts=10)
        torus(f"bend{j}", 0.18, 0.035, (sx, 0.07, 0.9), steel, rot=(0, math.pi / 2, 0))
        cyl(f"down{j}", 0.035, 2.6, (sx, -0.11, -0.4), steel, verts=10)
        cyl(f"foot{j}", 0.05, 0.08, (sx, 0.25, 0.02), steel, verts=10)
    for i in range(4):
        z = -0.35 - i * 0.35
        box(f"step{i}", (0.6, 0.2, 0.05), (0, -0.2, z), mat("#efe3cc"), 0.01)
        box(f"edge{i}", (0.6, 0.03, 0.055), (0, -0.3, z), mat("gold"), 0.0)
run(build)
