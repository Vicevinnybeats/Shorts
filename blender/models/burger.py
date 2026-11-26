import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Friendly cartoon burger (What If #4 "grab a burger" = the game heal). Origin = bottom centre, ~0.62 wide, 0.5 tall.
# Sesame bun, lettuce, cheese, patty. Use s ~1 next to a puppet's hand (h 2.5), or big as a hologram (scene tints it).
def build():
    bun, patty = mat("#e7a24a", rough=0.6), mat("#6b3a1f", rough=0.8)
    cyl("bunBottom", 0.3, 0.1, (0, 0, 0.05), bun, verts=28, bevel=0.03)
    cyl("patty", 0.31, 0.09, (0, 0, 0.145), patty, verts=28, bevel=0.03)
    box("cheese", (0.5, 0.5, 0.025), (0, 0, 0.2), mat("#f5c542"), 0.005, rot=(0, 0, 0.4))
    cyl("lettuce", 0.33, 0.04, (0, 0, 0.235), mat("#6fae52"), verts=14, bevel=0.0)
    cyl("tomato", 0.28, 0.035, (0, 0, 0.27), mat("coral"), verts=24)
    ball("bunTop", 0.31, (0, 0, 0.29), bun, scale=(1, 1, 0.62), seg=24)
    for i in range(9):
        a = i * 2.39996
        rr = 0.06 + 0.17 * ((i * 0.37) % 1)
        ball(f"seed{i}", 0.022, (rr * math.cos(a), rr * math.sin(a), 0.29 + 0.19 * math.sqrt(max(0, 1 - (rr / 0.31) ** 2))), mat("#fff1dc"), scale=(1.5, 0.8, 0.6), seg=8)
run(build)
