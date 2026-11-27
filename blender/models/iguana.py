import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Green iguana, cute low-poly (What If #7 snow: cold-stunned iguanas drop softly from a palm, then warm up and climb
# back - no harm). Origin = belly on the ground, body centre; ~1.5 long along +X (snout at +X, tail to -X).
# Bright greens, pale belly, orange-ish dewlap, spiky back crest, big friendly eye (dark + white glint).
def build():
    g, g2, belly, crest = mat("#5fb83f"), mat("#468f2c"), mat("#b9e08a"), mat("#3f7f27")
    box("body", (0.62, 0.34, 0.24), (0.0, 0, 0.17), g, 0.07)
    box("belly", (0.56, 0.3, 0.05), (0.0, 0, 0.06), belly, 0.02)
    box("neck", (0.24, 0.26, 0.2), (0.4, 0, 0.2), g, 0.06)
    box("head", (0.28, 0.24, 0.19), (0.6, 0, 0.23), g, 0.06)
    box("snout", (0.16, 0.18, 0.12), (0.78, 0, 0.2), g, 0.04)
    box("dewlap", (0.16, 0.04, 0.12), (0.52, 0, 0.09), mat("#f2a64a"), 0.02)
    for s in (-1, 1):
        ball(f"eyewhite{s}", 0.055, (0.64, s * 0.115, 0.27), mat("white"))
        ball(f"eye{s}", 0.038, (0.655, s * 0.14, 0.275), mat("ink"))
        ball(f"glint{s}", 0.012, (0.67, s * 0.168, 0.29), mat("white"))
        ball(f"cheek{s}", 0.04, (0.55, s * 0.12, 0.17), mat("#7cc95a"))
        for fx, nm in ((0.22, "f"), (-0.22, "b")):
            box(f"leg{nm}{s}", (0.08, 0.2, 0.06), (fx, s * 0.22, 0.07), g2, 0.025, rot=(0, 0, s * 0.3))
            box(f"foot{nm}{s}", (0.12, 0.08, 0.025), (fx + 0.04, s * 0.32, 0.015), g2, 0.01)
    # long striped tail (alternating green / dark green bands), tapering to -X
    w, h, x = 0.24, 0.16, -0.38
    for i in range(9):
        L = 0.16
        box(f"tail{i}", (L, w, h), (x, 0, 0.04 + h / 2), g if i % 2 == 0 else g2, 0.03)
        x -= L * 0.92; w *= 0.84; h *= 0.86
    # back crest spikes from the neck to the base of the tail
    for i in range(9):
        xx = 0.48 - i * 0.11
        hh = 0.08 if i < 6 else 0.06
        z = 0.31 if xx > -0.3 else 0.25
        cyl(f"spike{i}", 0.025, hh, (xx, 0, z + hh / 2 - 0.01), crest, verts=4, r2=0.0)
run(build)
