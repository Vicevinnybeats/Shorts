import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Heist DUFFEL BAG full of stylised cash (What If #5). Origin = floor centre, bag 1.1 long along X, ~0.62 tall body,
# zip open on top: green bundle tops (no real banknote design) peek out. Navy canvas, coral end caps, gold zip + buckles,
# two carry handles arching over the top (to z ~0.9). Front faces -Y.
def handle(name, y, s, m):
    pts = [(-0.2, 0.6), (-0.16, 0.8), (-0.06, 0.9), (0.06, 0.9), (0.16, 0.8), (0.2, 0.6)]
    for i in range(len(pts) - 1):
        (x0, z0), (x1, z1) = pts[i], pts[i + 1]
        L = math.hypot(x1 - x0, z1 - z0); ang = math.atan2(x1 - x0, z1 - z0)
        cyl(f"{name}{i}", 0.025, L + 0.03, ((x0 + x1) / 2, y, (z0 + z1) / 2), m, rot=(0, ang, 0), verts=10)

def build():
    cv, cv2 = mat("navy3", rough=0.9), mat("navy2", rough=0.9)
    body = cyl("body", 0.33, 1.1, (0, 0, 0.31), cv, rot=(0, math.pi / 2, 0), verts=28)
    body.scale = (1, 1.05, 0.92)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for s in (-1, 1):
        cyl(f"cap{s}", 0.31, 0.06, (s * 0.56, 0, 0.31), mat("coral", rough=0.7), rot=(0, math.pi / 2, 0), verts=28, bevel=0.02)
        torus(f"ring{s}", 0.31, 0.018, (s * 0.53, 0, 0.31), mat("gold"), rot=(0, math.pi / 2, 0))
        box(f"strap{s}", (0.07, 0.7, 0.012), (s * 0.28, 0, 0.6), cv2, 0.004)
        box(f"buckle{s}", (0.09, 0.03, 0.06), (s * 0.28, -0.345, 0.33), mat("gold"), 0.008)
    box("zipGap", (0.86, 0.17, 0.05), (0, 0, 0.6), mat("ink"), 0.01)
    for s in (-1, 1):
        box(f"zip{s}", (0.9, 0.025, 0.03), (0, s * 0.1, 0.615), mat("gold"), 0.006)
    box("puller", (0.03, 0.08, 0.02), (0.47, -0.11, 0.62), mat("gold"), 0.005)
    for i in range(4):
        x = -0.3 + i * 0.2
        r = (0.1 * (i % 2), 0, 0.15 * (i - 1.5))
        box(f"cash{i}", (0.17, 0.13, 0.08), (x, 0.01 * (i % 2), 0.63 + 0.01 * (i % 3)), mat("#7fc47a", rough=0.85), 0.006, rot=r)
        box(f"cashBand{i}", (0.04, 0.135, 0.085), (x, 0.01 * (i % 2), 0.63 + 0.01 * (i % 3)), mat("#f4ead2"), 0.004, rot=r)
    handle("handleA", -0.06, 1, cv2)
    handle("handleB", 0.06, 1, cv2)
    box("grip", (0.16, 0.16, 0.05), (0, 0, 0.9), mat("coral"), 0.02)
    box("tag", (0.12, 0.01, 0.16), (-0.42, -0.35, 0.42), mat("gold"), 0.01)
run(build)
