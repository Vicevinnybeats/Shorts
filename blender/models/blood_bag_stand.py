import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Stand with a STYLISED blood bag (What If #4, friendly, no needle): wheeled 5-spoke base, steel pole to z 2.6, hook
# arm, a soft rounded bag (centre z ~2.0, 0.55 wide, 0.8 tall) split in two layers: amber PLASMA on top (z 2.1-2.36),
# coral RED CELLS below (z 1.64-2.1), white label with a coral drop; a soft tube loops down to z ~1.0 at +X and ends in
# a capped connector (no needle). Origin = floor centre, front faces -Y.
def build():
    steel = mat("#c4c9d2", rough=0.3, metal=0.6)
    for i in range(5):
        a = i * 2 * math.pi / 5
        box(f"spoke{i}", (0.5, 0.07, 0.05), (0.25 * math.cos(a), 0.25 * math.sin(a), 0.08), steel, 0.01, rot=(0, 0, a))
        ball(f"wheel{i}", 0.05, (0.5 * math.cos(a), 0.5 * math.sin(a), 0.05), mat("dark"), seg=10)
    cyl("pole", 0.03, 2.55, (0, 0, 1.33), steel, verts=12)
    box("hookarm", (0.5, 0.04, 0.04), (0.18, 0, 2.6), steel, 0)
    torus("hook", 0.05, 0.012, (0.4, 0, 2.55), steel, rot=(math.pi / 2, 0, 0))
    bx = 0.4
    box("bagRed", (0.55, 0.16, 0.48), (bx, 0, 1.88), mat("#e0453a", rough=0.35), 0.1)
    box("bagPlasma", (0.53, 0.15, 0.27), (bx, 0, 2.25), mat("#ffcf6e", rough=0.35), 0.08)
    box("bagSeal", (0.5, 0.17, 0.05), (bx, 0, 2.42), mat("#f4f4f6"), 0.02)
    box("label", (0.3, 0.02, 0.22), (bx, -0.09, 1.88), mat("#fffaf0"), 0.01)
    ball("drop", 0.05, (bx, -0.105, 1.86), mat("coral"), scale=(1, 0.3, 1.25), seg=12)
    ball("dropTip", 0.03, (bx, -0.105, 1.93), mat("coral"), scale=(1, 0.3, 1.3), seg=8)
    pts = [(bx, 0, 1.62), (bx + 0.06, 0, 1.45), (bx + 0.14, 0, 1.3), (bx + 0.24, 0, 1.18), (bx + 0.36, 0, 1.1), (bx + 0.5, 0, 1.04)]
    for i in range(len(pts) - 1):
        (x0, y0, z0), (x1, y1, z1) = pts[i], pts[i + 1]
        L = math.dist(pts[i], pts[i + 1]); ang = math.atan2(x1 - x0, z1 - z0)
        cyl(f"tube{i}", 0.018, L + 0.02, ((x0 + x1) / 2, 0, (z0 + z1) / 2), mat("#e0453a", rough=0.3), rot=(0, ang, 0), verts=8)
    cyl("cap", 0.04, 0.1, (bx + 0.55, 0, 1.03), mat("#5fe3ff"), rot=(0, math.pi / 2, 0), verts=12)
run(build)
