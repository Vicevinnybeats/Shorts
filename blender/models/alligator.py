import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Florida alligator (What If #2, golf-course pond). Origin = belly on the ground, centre of the body; length along +X
# (snout at +X, ~3.6 long). Olive back, cream belly, scute ridges, gold emissive eyes so it reads in dim sets.
def build():
    g, g2, belly = mat("#4c6b34"), mat("#3a5428"), mat("#d9cf9e")
    box("body", (1.5, 0.78, 0.36), (0.0, 0, 0.26), g, 0.08)
    box("belly", (1.4, 0.7, 0.08), (0.0, 0, 0.1), belly, 0.03)
    box("neck", (0.5, 0.6, 0.3), (0.95, 0, 0.26), g, 0.07)
    box("head", (0.55, 0.52, 0.26), (1.38, 0, 0.27), g, 0.07)
    box("snout", (0.62, 0.36, 0.14), (1.9, 0, 0.22), g, 0.05)
    box("jaw", (0.95, 0.34, 0.08), (1.7, 0, 0.12), belly, 0.03)
    for s in (-1, 1):
        ball(f"eyebump{s}", 0.09, (1.42, s * 0.17, 0.42), g2)
        ball(f"eye{s}", 0.05, (1.47, s * 0.19, 0.46), mat("gold", emit=2.5))
        ball(f"nostril{s}", 0.03, (2.17, s * 0.06, 0.3), mat("ink"))
        for i in range(5):
            box(f"tooth{s}{i}", (0.03, 0.02, 0.05), (1.55 + i * 0.12, s * 0.16, 0.16), mat("cream"), 0)
        for fx, nm in ((0.55, "f"), (-0.55, "b")):
            box(f"leg{nm}{s}", (0.18, 0.34, 0.12), (fx, s * 0.5, 0.1), g2, 0.04, rot=(0, 0, s * 0.35))
            box(f"foot{nm}{s}", (0.22, 0.16, 0.05), (fx + 0.06, s * 0.68, 0.03), g2, 0.02)
    # tail: shrinking segments toward -X
    w, h, x = 0.66, 0.3, -0.95
    for i in range(7):
        L = 0.36
        box(f"tail{i}", (L, w, h), (x, 0, 0.08 + h / 2), g if i % 2 == 0 else g2, 0.04)
        x -= L * 0.9; w *= 0.8; h *= 0.85
    # back ridges (scutes)
    for i in range(12):
        xx = 0.65 - i * 0.22
        hh = 0.09 if xx > -0.9 else 0.07
        for s in ((-1, 1) if xx > -0.9 else (0,)):
            z = 0.47 if xx > -0.7 else 0.38 - (abs(xx) - 0.7) * 0.18
            cyl(f"scute{i}{s}", 0.05, hh, (xx, s * 0.14, z), g2, verts=4, r2=0.0)
run(build)
