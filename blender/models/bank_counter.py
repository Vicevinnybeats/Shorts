import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Bright BANK teller COUNTER (What If #5; generic, no bank name or logo). Origin = floor centre, 5.0 long (X),
# counter top z 1.32 (customer side -Y, depth 0.8), cream marble top with a gold edge, warm wood front panels.
# Two teller WINDOWS (open frames, no glass): posts at x -2.5 / 0 / +2.5, window centres x -1.25 and +1.25, header
# beam at z 2.85 with a gold light strip and an amber sign light over each window; each window has a steel deposit
# tray (front) and a dark slot; a cream paper stack (x -1.95) and a desk bell (x -0.55) at the left window,
# a coral desk lamp behind the right one. Front faces -Y.
def build():
    wood, wood2, top = mat("#c8925e", rough=0.7), mat("#b5804f", rough=0.7), mat("#f4eee4", rough=0.35)
    steel = mat("#c4c9d2", rough=0.25, metal=0.6)
    box("plinth", (5.0, 0.7, 0.12), (0, 0.05, 0.06), mat("#7a5434"), 0.01)
    box("body", (5.0, 0.8, 1.15), (0, 0, 0.66), wood2, 0.02)
    for i in range(5):
        box(f"panel{i}", (0.9, 0.04, 0.85), (-2.0 + i * 1.0, -0.41, 0.66), wood, 0.03)
    box("top", (5.1, 0.9, 0.08), (0, 0, 1.28), top, 0.02)
    box("edge", (5.1, 0.02, 0.03), (0, -0.455, 1.27), mat("gold"), 0)
    for i, x in enumerate((-2.5, 0.0, 2.5)):
        box(f"post{i}", (0.12, 0.12, 1.45), (x, 0.1, 2.05), mat("#f4eee4", rough=0.4), 0.02)
    box("header", (5.2, 0.24, 0.32), (0, 0.1, 2.85), wood2, 0.03)
    box("strip", (5.0, 0.02, 0.05), (0, -0.03, 2.8), mat("gold", emit=1.4), 0)
    for i, x in enumerate((-1.25, 1.25)):
        box(f"sill{i}", (2.3, 0.08, 0.06), (x, 0.1, 1.36), mat("#e8dcc8"), 0.01)
        box(f"tray{i}", (0.5, 0.34, 0.03), (x, -0.22, 1.335), steel, 0.01)
        box(f"slot{i}", (0.5, 0.06, 0.12), (x, 0.08, 1.42), mat("dark"), 0.01)
        box(f"sign{i}", (0.7, 0.02, 0.2), (x, -0.03, 2.55), mat("#1b2238"), 0.01)
        box(f"signLight{i}", (0.5, 0.025, 0.06), (x, -0.04, 2.55), mat("amber", emit=1.4), 0)
    for i in range(4):
        box(f"paper{i}", (0.34, 0.24, 0.012), (-1.95 + 0.01 * i, -0.15, 1.33 + i * 0.013), mat("#fffaf0"), 0.002, rot=(0, 0, 0.08 * i))
    cyl("bellBase", 0.07, 0.03, (-0.55, -0.2, 1.335), mat("dark"), verts=16)
    ball("bell", 0.065, (-0.55, -0.2, 1.36), mat("gold", rough=0.3, metal=0.5), scale=(1, 1, 0.7), seg=14)
    cyl("lampPole", 0.02, 0.5, (1.95, 0.25, 1.57), mat("dark"), verts=8)
    cyl("lampShade", 0.16, 0.14, (1.95, 0.25, 1.86), mat("coral"), verts=16, r2=0.07)
run(build)
