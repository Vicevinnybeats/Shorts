import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Twin-bell ALARM CLOCK (What If #5 counting: ~2.8 hours). Origin = floor centre. Round coral body r 0.28 (axis to the
# front), gold rim; white face disc (r 0.235) centre at (0, -0.08, 0.36) - the scene draws tick marks + hands on a
# Panel just in front (three.js: y 0.36, z ~0.1). Two gold bells + hammer on top, two little feet. Front faces -Y.
def build():
    cyl("body", 0.28, 0.14, (0, 0, 0.36), mat("coral", rough=0.5), rot=(math.pi / 2, 0, 0), verts=32, bevel=0.03)
    torus("rim", 0.26, 0.025, (0, -0.075, 0.36), mat("gold", rough=0.3, metal=0.4), rot=(math.pi / 2, 0, 0))
    cyl("face", 0.235, 0.01, (0, -0.075, 0.36), mat("#fffaf0"), rot=(math.pi / 2, 0, 0), verts=32)
    for s in (-1, 1):
        b = ball(f"bell{s}", 0.11, (s * 0.17, 0, 0.66), mat("gold", rough=0.3, metal=0.5), scale=(1, 1, 0.75), seg=16)
        b.rotation_euler = (0, s * 0.45, 0)
        cyl(f"foot{s}", 0.035, 0.12, (s * 0.17, 0, 0.06), mat("dark"), rot=(0, s * 0.4, 0), verts=10)
    cyl("stem", 0.02, 0.18, (0, 0, 0.68), mat("dark"), verts=8)
    box("hammer", (0.32, 0.03, 0.03), (0, 0, 0.77), mat("dark"), 0.008)
    ball("knob", 0.035, (0, 0.1, 0.62), mat("gold"), seg=10)
run(build)
