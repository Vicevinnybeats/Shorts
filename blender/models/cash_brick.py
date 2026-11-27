import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# A BRICK of stylised cash (What If #5): 10 bundles of 100 bills = 1,000 bills ($100,000 in $100s). Each bundle =
# a green block 0.36 (X) x 0.155 (Y) x 0.022 (100 bills ~1.1 cm; scene scale 1 unit ~ 0.5 m) with a cream paper band.
# NOT real money: plain green, lighter top bill with a dark oval (no portrait, no text, no serials).
# Brick = 0.22 tall; origin = bottom centre. 10 bricks stacked = the ~1 m tower (2.2).
def build():
    g1, g2, top, band = mat("#6db86a", rough=0.85), mat("#7fc47a", rough=0.85), mat("#bfe8b4", rough=0.85), mat("#f4ead2", rough=0.7)
    for i in range(10):
        z = 0.011 + i * 0.022
        j = ((i * 37) % 7 - 3) * 0.004
        box(f"bundle{i}", (0.36, 0.155, 0.0205), (j, -j * 0.5, z), g1 if i % 2 else g2, 0.003, rot=(0, 0, j * 0.6))
        box(f"band{i}", (0.06, 0.158, 0.0215), (j, -j * 0.5, z), band, 0.002, rot=(0, 0, j * 0.6))
    box("topBill", (0.33, 0.13, 0.0015), (0, 0, 0.2208), top, 0)
    ball("oval", 0.035, (0.09, 0, 0.2218), mat("#4f9a55"), scale=(1.35, 1.0, 0.03), seg=14)
    box("topBand", (0.06, 0.158, 0.002), (0, 0, 0.2222), band, 0)
run(build)
