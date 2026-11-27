import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# LIFE JACKET worn by a puppet (What If #6 breath safety/surface). Origin = centre of the vest. Two bright orange foam
# front panels (0.38 wide, 0.82 tall, a gap down the middle), a collar pad behind the neck (top), shoulder pads, two
# navy straps with gold buckles across the front, cream reflective strips. Shallow (0.26 deep) so it sits in front of
# the 2D puppet's torso: place in a FaceGroup at (0, ~0.42h, +0.12), scale h/2.5.
def build():
    orange = mat("#ff8a2a", rough=0.7)
    for s in (-1, 1):
        box(f"panel{s}", (0.38, 0.24, 0.82), (s * 0.22, 0, 0), orange, 0.08)
        box(f"refl{s}", (0.3, 0.02, 0.06), (s * 0.22, -0.125, 0.26), mat("#fff1dc"), 0.0)
        box(f"shoulder{s}", (0.2, 0.3, 0.14), (s * 0.24, 0.08, 0.46), orange, 0.05)
    box("collar", (0.5, 0.2, 0.18), (0, 0.12, 0.5), orange, 0.07)
    for i, z in enumerate((-0.05, -0.27)):
        box(f"strap{i}", (0.86, 0.03, 0.07), (0, -0.13, z), mat("navy"), 0.01)
        box(f"buckle{i}", (0.12, 0.04, 0.1), (0, -0.15, z), mat("gold", rough=0.4, metal=0.3), 0.01)
run(build)
