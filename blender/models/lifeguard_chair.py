import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Tall LIFEGUARD CHAIR (What If #6 breath pool/lake: a lifeguard is always watching). Origin = floor centre, faces the
# front (-Y, three +z). Four straight white legs with cross braces, a ladder with 5 rungs on the front, coral seat top
# z 2.3 (a puppet stands on the foot board at z 1.73), backrest, a coral/white striped sun umbrella on a pole at the
# back right (top ~4.3), a cream life ring hanging on the back.
def build():
    white, red = mat("white"), mat("coral")
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(f"leg{sx}{sy}", (0.1, 0.1, 2.3), (sx * 0.5, sy * 0.45, 1.15), white, 0.02)
        box(f"brace{sx}", (0.06, 0.9, 0.06), (sx * 0.5, 0, 0.9), white, 0.01)
    box("braceBack", (1.0, 0.06, 0.06), (0, 0.45, 0.9), white, 0.01)
    for i in range(5):
        box(f"rung{i}", (1.0, 0.07, 0.06), (0, -0.47, 0.35 + i * 0.32), white, 0.01)
    box("seat", (1.1, 0.75, 0.1), (0, 0, 2.3), red, 0.03)
    box("back", (1.1, 0.08, 0.7), (0, 0.4, 2.7), red, 0.03)
    for sx in (-1, 1):
        box(f"arm{sx}", (0.08, 0.7, 0.06), (sx * 0.55, 0, 2.6), white, 0.01)
        box(f"armpost{sx}", (0.06, 0.06, 0.3), (sx * 0.55, -0.3, 2.45), white, 0.01)
    box("foot", (1.0, 0.28, 0.06), (0, -0.55, 1.7), white, 0.01)
    cyl("pole", 0.035, 2.0, (0.5, 0.5, 3.3), white, verts=10)
    cyl("umbrella", 0.95, 0.4, (0.5, 0.5, 4.2), red, r2=0.05, verts=16)
    cyl("umbBand", 0.62, 0.12, (0.5, 0.5, 4.17), mat("#fff1dc"), r2=0.45, verts=16)
    ball("tip", 0.07, (0.5, 0.5, 4.42), mat("gold"), seg=10)
    torus("ring", 0.3, 0.08, (-0.3, 0.52, 1.5), mat("#fff1dc"), rot=(math.pi / 2, 0, 0))
run(build)
