import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Mic on a stand (stage). Origin = floor centre of the base; mic at ~1.9.
def build():
    cyl("base", 0.32, 0.05, (0, 0, 0.025), mat("dark"), verts=24)
    cyl("pole", 0.025, 1.75, (0, 0, 0.9), mat("grey", rough=0.3, metal=0.6), verts=12)
    cyl("clip", 0.03, 0.12, (0, -0.04, 1.8), mat("dark"), rot=(0.6, 0, 0), verts=12)
    cyl("mic", 0.045, 0.2, (0, -0.1, 1.86), mat("dark"), rot=(0.6, 0, 0), verts=16)
    ball("head", 0.075, (0, -0.17, 1.95), mat("grey", rough=0.4, metal=0.5))
    torus("ring", 0.05, 0.012, (0, -0.13, 1.91), mat("gold", emit=2.0), rot=(0.6, 0, 0))
run(build)
