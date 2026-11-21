import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Chips bag (snack). Origin = bottom centre.
def build():
    box("bag", (0.5, 0.18, 0.62), (0, 0, 0.31), mat("coral"), 0.07)
    box("band", (0.51, 0.19, 0.14), (0, 0, 0.36), mat("gold", emit=0.5), 0.03)
    box("crimp", (0.5, 0.1, 0.05), (0, 0, 0.64), mat("gold"), 0.01)
run(build)
