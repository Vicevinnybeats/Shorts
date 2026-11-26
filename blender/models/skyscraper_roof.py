import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Rooftop of a sunny skyscraper (What If #3 physics: the jump / dolly zoom down). Origin = roof deck centre (deck top
# z 0); 12 x 12 deck with a parapet, stair exit hut (door faces the front -Y), AC unit, water tank, antenna. The tower
# body runs DOWN to z -70 with glassy window bands so the camera can look down the facade to the street.
W, T = 12.0, 70.0
def build():
    fac, glass, deck, par = mat("#f1d9b5", rough=0.8), mat("#4f86b8", rough=0.25, metal=0.2), mat("#cfc6b6", rough=0.9), mat("#efe2cb", rough=0.8)
    box("tower", (W, W, T), (0, 0, -T / 2 - 0.05), fac, 0.08)
    for k in range(int(T // 2.4)):
        z = -1.4 - k * 2.4
        box(f"band{k}", (W + 0.06, W + 0.06, 1.1), (0, 0, z), glass, 0)
    for s in (-1, 1):  # vertical piers on all four faces
        for i in range(-2, 3):
            box(f"pierF{s}{i}", (0.35, 0.2, T), (i * 2.6, s * (W / 2 + 0.08), -T / 2), fac, 0)
            box(f"pierS{s}{i}", (0.2, 0.35, T), (s * (W / 2 + 0.08), i * 2.6, -T / 2), fac, 0)
    box("deck", (W - 0.1, W - 0.1, 0.1), (0, 0, -0.05), deck, 0)
    for s in (-1, 1):
        box(f"parX{s}", (W + 0.3, 0.3, 0.55), (0, s * W / 2, 0.27), par, 0.04)
        box(f"parY{s}", (0.3, W + 0.3, 0.55), (s * W / 2, 0, 0.27), par, 0.04)
        box(f"capX{s}", (W + 0.4, 0.4, 0.08), (0, s * W / 2, 0.58), mat("#d9743a"), 0.02)
        box(f"capY{s}", (0.4, W + 0.4, 0.08), (s * W / 2, 0, 0.58), mat("#d9743a"), 0.02)
    # stair exit hut (back-left), door on its front face
    box("hut", (2.8, 2.4, 2.7), (-3.6, 3.4, 1.35), mat("#e8d2ae", rough=0.8), 0.05)
    box("hutRoof", (3.1, 2.7, 0.18), (-3.6, 3.4, 2.78), mat("#d9743a"), 0.03)
    box("door", (1.1, 0.06, 2.0), (-3.6, 2.18, 1.0), mat("coral"), 0.02)
    box("knob", (0.1, 0.06, 0.1), (-3.2, 2.13, 1.0), mat("gold", rough=0.3, metal=0.6), 0)
    box("exitSign", (0.6, 0.05, 0.22), (-3.6, 2.17, 2.25), mat("#3fae5a", emit=1.5), 0)
    # AC unit (back-right)
    box("ac", (2.2, 1.6, 1.1), (3.4, 3.6, 0.55), mat("#dfe3e8", rough=0.5, metal=0.3), 0.05)
    for i in (-1, 1):
        cyl(f"fan{i}", 0.45, 0.06, (3.4 + i * 0.55, 3.6, 1.12), mat("dark"), verts=16)
    # water tank on legs (right)
    for j, (dx, dy) in enumerate(((-0.6, -0.6), (0.6, -0.6), (-0.6, 0.6), (0.6, 0.6))):
        box(f"leg{j}", (0.12, 0.12, 1.2), (4.3 + dx, -0.6 + dy, 0.6), mat("#8a6a4a"), 0)
    cyl("tank", 0.95, 1.6, (4.3, -0.6, 2.0), mat("#c8925e", rough=0.8), verts=20)
    cyl("tankTop", 1.0, 0.4, (4.3, -0.6, 3.0), mat("#b5804f"), verts=20, r2=0.1)
    # antenna mast (back centre)
    cyl("mast", 0.07, 5.0, (0.8, 4.6, 2.5), mat("grey", metal=0.6), verts=8)
    ball("beacon", 0.16, (0.8, 4.6, 5.1), mat("coral", emit=2.0))
    # skylight + vents for texture on the deck
    box("skylight", (3.0, 1.2, 0.25), (0.6, 1.0, 0.12), glass, 0.03)
    for i in range(3):
        cyl(f"vent{i}", 0.18, 0.5, (-1.2 + i * 1.1, -2.8 if i != 1 else 4.8, 0.25), mat("grey", metal=0.5), verts=10)
run(build)
