import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Sunny park PICNIC TABLE (What If #4 snack + small cut). Origin = floor centre; table runs along X (2.6 long),
# top z 1.05 (0.9 deep), benches on both sides (front bench at y -0.85, seat z 0.6). Warm honey wood, coral/cream
# checked runner on top.
def build():
    w, w2 = mat("#c98a4b", rough=0.8), mat("#a86e36", rough=0.8)
    for i in range(4):
        box(f"plank{i}", (2.6, 0.21, 0.07), (0, -0.33 + i * 0.22, 1.02), w, 0.02)
    for s in (-1, 1):
        box(f"seat{s}", (2.6, 0.32, 0.07), (0, s * 0.85, 0.6), w, 0.02)
        for sx in (-1, 1):
            box(f"legA{s}{sx}", (0.09, 0.09, 1.25), (sx * 1.0, s * 0.42, 0.52), w2, 0.01, rot=(s * 0.62, 0, 0))
        box(f"brace{s}", (0.09, 1.9, 0.08), (s * 1.0, 0, 0.5), w2, 0.01)
    box("runner", (0.9, 0.92, 0.012), (0, 0, 1.062), mat("coral"), 0)
    for i in range(3):
        for j in range(3):
            if (i + j) % 2 == 0:
                box(f"check{i}{j}", (0.3, 0.3, 0.004), (-0.3 + i * 0.3, -0.3 + j * 0.3, 1.07), mat("#fff1dc"), 0)
run(build)
