import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Sunny wooden PIER (What If #6 breath hook/test1/land/ask). Origin = WATER LEVEL at the near end, centre of the deck.
# Deck 3.4 wide (X), runs from y +1.6 (near, toward the camera in three = +z) to y -16 (far, three z -16); deck TOP
# z 1.2. Posts every 2.6 go down to z -3 (into the water), low railing on both sides (top z 2.1) with a gap at +X
# around y -10.1 for the swim LADDER (rails down to z -1.4), two mooring bollards, a coral/cream flag at the far end.
# Warm honey/grey wood, steel ladder.
def build():
    w, w2, w3 = mat("#c99a63", rough=0.85), mat("#b0824f", rough=0.85), mat("#8a6440", rough=0.9)
    y0, y1 = 1.6, -16.0
    n = int((y0 - y1) / 0.34)
    for i in range(n):
        y = y0 - 0.17 - i * 0.34
        box(f"plank{i}", (3.4, 0.3, 0.08), (0, y, 1.16), w if i % 3 else w2, 0.015)
    for s in (-1, 1):
        box(f"joist{s}", (0.16, y0 - y1, 0.22), (s * 1.45, (y0 + y1) / 2, 1.0), w3, 0.01)
        k = 0
        y = y0 - 0.2
        while y > y1:
            cyl(f"post{s}_{k}", 0.13, 4.6, (s * 1.62, y, -0.7), w3, verts=10)
            if not (s > 0 and -11.6 < y < -8.6):
                cyl(f"rpost{s}_{k}", 0.06, 0.9, (s * 1.62, y, 1.65), w2, verts=8)
            k += 1
            y -= 2.6
        segs = [(y0 - 0.2, y1)] if s < 0 else [(y0 - 0.2, -8.6), (-11.6, y1)]
        for j, (a, b) in enumerate(segs):
            box(f"rail{s}_{j}", (0.1, a - b, 0.1), (s * 1.62, (a + b) / 2, 2.1), w2, 0.02)
    steel = mat("#c4c9d2", rough=0.3, metal=0.6)
    for j, dy in enumerate((-0.35, 0.35)):
        cyl(f"lrail{j}", 0.04, 3.2, (1.82, -10.1 + dy, -0.3), steel, verts=10)
        torus(f"lbend{j}", 0.2, 0.04, (1.62, -10.1 + dy, 1.3), steel, rot=(math.pi / 2, 0, 0))
    for i in range(5):
        cyl(f"lstep{i}", 0.035, 0.7, (1.82, -10.1, 0.8 - i * 0.5), steel, rot=(math.pi / 2, 0, 0), verts=8)
    for i, y in enumerate((-2.0, -13.0)):
        cyl(f"bollard{i}", 0.17, 0.4, (-1.15, y, 1.4), mat("dark"), verts=14, bevel=0.03)
        cyl(f"bollcap{i}", 0.22, 0.08, (-1.15, y, 1.62), mat("dark"), verts=14)
    cyl("flagpole", 0.05, 3.4, (-1.3, y1 + 0.5, 2.9), mat("white"), verts=10)
    box("flag", (0.02, 0.9, 0.55), (-1.3, y1 + 0.05, 4.3), mat("coral"), 0.0)
    box("flagband", (0.025, 0.9, 0.16), (-1.3, y1 + 0.05, 4.3), mat("#fff1dc"), 0.0)
run(build)
