import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Big burlap SACK of potatoes (What If #5 "like carrying a big bag of potatoes", ~10 kg). Origin = floor centre,
# ~0.95 tall: a lumpy tan sack, tied neck with rope at z ~0.73, gathered top, a cream label patch with a coral band
# (no text) on the front (-Y), three potatoes spilled at the foot (front right). Front faces -Y.
def build():
    sack, sack2 = mat("#c9a26b", rough=0.95), mat("#b38c57", rough=0.95)
    ball("belly", 0.36, (0, 0, 0.33), sack, scale=(1, 0.9, 0.95), seg=20)
    cyl("upper", 0.3, 0.3, (0, 0, 0.58), sack, verts=20, r2=0.13, bevel=0.03)
    torus("rope", 0.125, 0.025, (0, 0, 0.73), mat("#8a5a2b"))
    cyl("gather", 0.12, 0.16, (0, 0, 0.83), sack2, verts=14, r2=0.2, bevel=0.02)
    for i in range(6):
        a = i * math.pi / 3
        ball(f"lump{i}", 0.07, (0.15 * math.cos(a), 0.15 * math.sin(a), 0.92), sack2, scale=(1, 1, 0.6), seg=10)
    box("label", (0.26, 0.012, 0.2), (0, -0.325, 0.36), mat("#fff1dc"), 0.01, rot=(0.12, 0, 0))
    box("labelBand", (0.26, 0.014, 0.04), (0, -0.333, 0.42), mat("coral"), 0.005, rot=(0.12, 0, 0))
    for k, (x, y, r) in enumerate([(0.36, -0.28, 0.07), (0.47, -0.17, 0.06), (0.28, -0.42, 0.055)]):
        ball(f"potato{k}", r, (x, y, r * 0.75), mat("#b98a4e"), scale=(1.3, 0.95, 0.8), seg=12)
run(build)
