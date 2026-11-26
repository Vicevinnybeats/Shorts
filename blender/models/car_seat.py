import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Crash-test SLED: a car seat bolted on a grey test platform with a steering wheel in front (What If #3 seat belt).
# Origin = floor centre; seat cushion top z 0.62 at y -0.05 (three.js: put crash_dummy at (0, 0.62, 0.05)).
# Front = -Y. The belt itself is drawn by the scene (animated bands), not part of the model.
def build():
    N, N2, G = mat("navy3", rough=0.7), mat("navy2", rough=0.7), mat("#b9bec8", rough=0.4, metal=0.5)
    box("sled", (2.2, 3.2, 0.2), (0, -0.4, 0.1), G, 0.04)
    for s in (-1, 1):
        box(f"rail{s}", (0.12, 3.4, 0.08), (s * 0.95, -0.4, 0.24), mat("#f5b942"), 0)
    box("riser", (0.9, 0.8, 0.22), (0, 0.05, 0.31), mat("dark"), 0.03)
    box("cushion", (0.92, 0.95, 0.2), (0, -0.05, 0.52), N, 0.07)
    box("back", (0.92, 0.2, 1.1), (0, 0.48, 1.12), N, 0.08, rot=(-0.18, 0, 0))
    box("headrest", (0.5, 0.18, 0.3), (0, 0.6, 1.85), N2, 0.06)
    for s in (-1, 1):
        box(f"bolster{s}", (0.14, 0.22, 0.9), (s * 0.48, 0.42, 1.05), N2, 0.05, rot=(-0.18, 0, 0))
        box(f"pipe{s}", (0.03, 0.9, 0.03), (s * 0.45, -0.05, 0.63), mat("coral"), 0)
    # steering column + wheel in front of the hands
    cyl("column", 0.06, 1.0, (0, -1.05, 0.85), G, rot=(0.9, 0, 0), verts=10)
    box("dash", (1.6, 0.35, 0.5), (0, -1.55, 0.6), mat("dark"), 0.05)
    torus("wheel", 0.3, 0.045, (0, -0.8, 1.0), mat("ink"), rot=(1.2, 0, 0))
    cyl("hub", 0.09, 0.08, (0, -0.8, 1.0), mat("#f5b942"), rot=(1.2, 0, 0), verts=12)
run(build)
