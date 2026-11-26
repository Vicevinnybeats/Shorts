import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Blood DONATION chair (What If #4, bright friendly donor centre). Origin = floor centre, front faces -Y (camera).
# Cushion top z 0.78; a puppet (h 2.5) "sits" by standing with its feet at y 0.18 (legs hidden by the front skirt).
# Back reclines behind (to +Y), leg rest in front, a padded arm rest on +X at z 1.0 (the arm that donates).
def build():
    up, up2, base = mat("coral", rough=0.7), mat("#e8604a", rough=0.7), mat("#eef1f5", rough=0.5)
    steel = mat("#b9bec8", rough=0.35, metal=0.5)
    box("plinth", (1.0, 1.0, 0.12), (0, 0.1, 0.06), base, 0.03)
    cyl("column", 0.12, 0.45, (0, 0.1, 0.33), steel, verts=16)
    box("skirt", (1.2, 0.08, 0.62), (0, -0.52, 0.42), base, 0.03)
    box("seat", (1.2, 1.1, 0.2), (0, 0.0, 0.68), up, 0.07)
    box("back", (1.2, 0.22, 1.5), (0, 0.72, 1.35), up, 0.09, rot=(-0.38, 0, 0))
    box("head", (0.6, 0.2, 0.32), (0, 1.05, 2.15), up2, 0.07, rot=(-0.38, 0, 0))
    box("legrest", (1.1, 0.8, 0.14), (0, -0.85, 0.5), up2, 0.06, rot=(-0.35, 0, 0))
    for s in (-1, 1):
        box(f"armpost{s}", (0.1, 0.1, 0.4), (s * 0.68, 0.05, 0.85), steel, 0.02)
        box(f"arm{s}", (0.22, 0.9 if s < 0 else 1.3, 0.12), (s * 0.7, -0.05 if s < 0 else -0.25, 1.05), up2, 0.05)
    box("trim", (1.22, 0.04, 0.04), (0, -0.56, 0.75), mat("gold", emit=1.5), 0)
run(build)
