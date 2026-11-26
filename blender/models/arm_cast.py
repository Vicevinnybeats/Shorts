import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Forearm CAST in a SLING (What If #4 broken arm, friendly). Origin = cast centre. The cast lies along X (0.7 long,
# r 0.11) and is held in front of a puppet's chest (h 2.5: put it at about (0, 1.02, +0.12) in front of the puppet);
# hand end at +X (skin fist + fingers), elbow end at -X. Navy sling cradle under it with a strap rising to the neck
# (+Z, toward -X shoulder). White cast with doodle signatures (coral heart, gold star, cyan zigzag).
def build():
    cast, skin = mat("#fbfaf6", rough=0.9), mat("#f3d2b3", rough=0.75)
    cyl("cast", 0.11, 0.62, (0, 0, 0), cast, rot=(0, math.pi / 2, 0), verts=24, bevel=0.0)
    ball("elbow", 0.115, (-0.31, 0, 0), cast, seg=16)
    torus("cuff", 0.105, 0.025, (0.31, 0, 0), cast, rot=(0, math.pi / 2, 0))
    ball("fist", 0.1, (0.4, 0, 0.0), skin, scale=(1.1, 0.95, 0.9), seg=16)
    ball("thumb", 0.04, (0.38, -0.06, 0.07), skin, seg=10)
    ball("heart1", 0.03, (-0.08, -0.105, 0.03), mat("coral"), scale=(1, 0.3, 1), seg=8)
    ball("heart2", 0.03, (-0.035, -0.105, 0.03), mat("coral"), scale=(1, 0.3, 1), seg=8)
    ball("star", 0.035, (0.13, -0.1, -0.03), mat("gold"), scale=(1, 0.3, 1), seg=6)
    for i in range(3):
        box(f"zig{i}", (0.06, 0.01, 0.015), (-0.2 + i * 0.05, -0.108, -0.04 + (i % 2) * 0.03), mat("#36b6d9"), 0, rot=(0, (0.6 if i % 2 else -0.6), 0))
    sling = mat("#2e3658", rough=0.85)
    box("cradle", (0.72, 0.26, 0.05), (0, 0, -0.13), sling, 0.02)
    box("cradleFront", (0.72, 0.03, 0.16), (0, -0.13, -0.07), sling, 0.01)
    box("strap", (0.07, 0.03, 0.75), (-0.18, -0.12, 0.3), sling, 0.01, rot=(0, -0.5, 0))
run(build)
