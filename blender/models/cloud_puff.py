import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Soft cloud puff (daylight sky). Origin = centre bottom; ~7 wide; flat-ish bottom.
def build():
    for i, (x, y, z, r) in enumerate([(0, 0, 1.2, 1.7), (-1.8, 0.2, 0.9, 1.3), (1.9, -0.1, 0.9, 1.35), (-3.2, 0, 0.6, 0.9), (3.3, 0.1, 0.6, 0.85), (0.8, 0.4, 2.1, 1.1), (-0.9, -0.3, 1.9, 1.0)]):
        ball(f"p{i}", r, (x, y, z), mat("#ffffff", rough=1.0), scale=(1, 0.8, 0.85), seg=14)
run(build)
