import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# BROOM (What If #8 chores). Origin = bristle bottom centre; handle straight up along Z to 2.0; honey wood handle
# with a coral grip, gold ferrule, a wide straw head 0.62 wide with dark binding stripes. Hold at a puppet's hand.
def build():
    cyl("handle", 0.035, 1.7, (0, 0, 1.15), mat("#d9b07a"), verts=12)
    cyl("grip", 0.045, 0.3, (0, 0, 1.85), mat("coral"), verts=12)
    cyl("ferrule", 0.06, 0.1, (0, 0, 0.3), mat("gold", metal=0.4), verts=12)
    box("head", (0.62, 0.16, 0.26), (0, 0, 0.17), mat("#e8c66a", rough=0.9), 0.03)
    for z in (0.22, 0.28):
        box(f"bind{z}", (0.64, 0.17, 0.025), (0, 0, z), mat("dark"), 0)
    for i in range(9):
        box(f"tuft{i}", (0.06, 0.15, 0.08), (-0.28 + i * 0.07, 0, 0.03), mat("#d6ae4e", rough=0.95), 0.01)
run(build)
