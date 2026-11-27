import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Modern double BED (What If #8 NPC morning). Origin = floor centre; 3.2 long along X with the headboard at -X,
# 2.0 wide (Y), mattress top z 0.9; light oak frame, cream sheets, coral duvet folded back, two white pillows,
# a gold emissive strip under the headboard. Front faces -Y.
def build():
    oak, oak2 = mat("#d9b07a", rough=0.6), mat("#c49660", rough=0.6)
    box("base", (3.2, 2.0, 0.34), (0, 0, 0.3), oak, 0.04)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(f"leg{sx}{sy}", (0.12, 0.12, 0.14), (sx * 1.5, sy * 0.9, 0.07), oak2, 0.01)
    box("head", (0.14, 2.06, 1.25), (-1.62, 0, 0.92), oak, 0.05)
    box("headPad", (0.08, 1.8, 0.62), (-1.53, 0, 1.12), mat("#efe3cc"), 0.04)
    box("headLight", (0.03, 1.7, 0.03), (-1.52, 0, 0.6), mat("gold", emit=2.0), 0)
    box("mattress", (3.05, 1.9, 0.3), (0.02, 0, 0.62), mat("#fffaf0", rough=0.8), 0.07)
    box("duvet", (1.9, 1.96, 0.1), (0.62, 0, 0.82), mat("coral", rough=0.85), 0.05)
    box("fold", (0.3, 1.98, 0.12), (-0.38, 0, 0.84), mat("#ffb59c", rough=0.85), 0.05)
    for s in (-1, 1):
        box(f"pillow{s}", (0.5, 0.78, 0.2), (-1.18, s * 0.46, 0.88), mat("white", rough=0.9), 0.09)
run(build)
