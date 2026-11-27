import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Tall LIFEGUARD CHAIR (What If #6 breath pool/lake: a lifeguard is always watching). Origin = floor centre, faces the
# front (-Y, three +z). Four splayed white legs, a ladder with 5 rungs on the front, coral seat top z 2.3 (a puppet
# sits with its feet on the foot board at z 1.73), backrest, a coral/white sun canopy on a pole (top z ~4.2), a cream
# life ring on the back left.
def build():
    white, red = mat("white"), mat("coral")
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(f"leg{sx}{sy}", (0.1, 0.1, 2.4), (sx * 0.55, sy * 0.5, 1.15), white, 0.02, rot=(sy * -0.12, sx * 0.12, 0))
    for i in range(5):
        box(f"rung{i}", (1.0, 0.08, 0.06), (0, -0.56 + i * 0.016, 0.35 + i * 0.4), white, 0.01)
    box("seat", (1.0, 0.7, 0.1), (0, 0, 2.25), red, 0.03)
    box("back", (1.0, 0.08, 0.7), (0, 0.38, 2.65), red, 0.03)
    for sx in (-1, 1):
        box(f"arm{sx}", (0.08, 0.7, 0.06), (sx * 0.5, 0, 2.55), white, 0.01)
        box(f"armpost{sx}", (0.06, 0.06, 0.3), (sx * 0.5, -0.3, 2.4), white, 0.01)
    box("foot", (1.0, 0.25, 0.06), (0, -0.48, 1.7), white, 0.01)
    cyl("pole", 0.03, 1.7, (0.55, 0.42, 3.3), white, verts=10)
    for i in range(6):
        a0 = i * math.pi / 3
        box(f"canopy{i}", (0.75, 0.55, 0.03), (0.55 + 0.32 * math.cos(a0 + 0.52), 0.42 + 0.32 * math.sin(a0 + 0.52), 4.12),
            red if i % 2 else white, 0.0, rot=(0, 0, a0 + 0.52))
    ball("tip", 0.06, (0.55, 0.42, 4.2), mat("gold"), seg=10)
    torus("ring", 0.3, 0.08, (-0.62, 0.62, 1.4), mat("#fff1dc"), rot=(math.pi / 2, 0, 0.3))
run(build)
