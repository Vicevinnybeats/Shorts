import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# West Indian manatee, cute low-poly (What If #7 snow: manatees gather in a power plant's warm-water outflow).
# Origin = body centre (place it just under the water line); ~3.4 long along +X (head at +X, paddle tail at -X).
# Soft grey body, lighter muzzle with whisker dots, small dark eyes, two front flippers, round paddle tail.
def build():
    b, b2, muz = mat("#8f989c"), mat("#7a8488"), mat("#b9bfb8")
    ball("body", 0.62, (0.0, 0, 0.0), b, scale=(1.75, 1.0, 0.82), seg=20)
    ball("back", 0.5, (-0.75, 0, 0.0), b, scale=(1.3, 0.9, 0.72), seg=16)
    ball("head", 0.38, (1.18, 0, 0.06), b, scale=(1.0, 0.95, 0.85), seg=16)
    ball("muzzle", 0.26, (1.48, 0, -0.02), muz, scale=(0.9, 1.15, 0.85), seg=16)
    for s in (-1, 1):
        ball(f"eye{s}", 0.035, (1.3, s * 0.3, 0.17), mat("ink"))
        for i in range(3):
            ball(f"whisk{s}{i}", 0.014, (1.66, s * (0.08 + i * 0.07), 0.0 - i * 0.03), mat("#4d5558"))
        box(f"flipper{s}", (0.34, 0.12, 0.05), (0.62, s * 0.62, -0.28), b2, 0.03, rot=(s * 0.5, 0.25, s * 0.5))
    ball("nostrils", 0.03, (1.68, 0, 0.12), mat("#4d5558"), scale=(1, 2.2, 0.6))
    # round paddle tail (flat disc)
    cyl("tail", 0.52, 0.07, (-1.75, 0, -0.04), b2, verts=24)
    box("tailroot", (0.4, 0.42, 0.22), (-1.35, 0, -0.02), b, 0.08)
    # a few pale marks on the back (texture only)
    for i, (x, y) in enumerate(((-0.2, 0.2), (0.3, -0.25), (-0.6, -0.1))):
        box(f"mark{i}", (0.18, 0.03, 0.01), (x, y, 0.5), mat("#a3abaf"), 0.005, rot=(0, 0, 0.4 * (i - 1)))
run(build)
