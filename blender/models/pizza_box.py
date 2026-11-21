import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Pizza box (snack). Origin = bottom centre.
def build():
    box("box", (0.95, 0.95, 0.1), (0, 0, 0.05), mat("#b9772e"), 0.01)
    box("lidline", (0.93, 0.01, 0.012), (0, -0.476, 0.085), mat("wood2"), 0)
    box("logo", (0.5, 0.12, 0.006), (0, 0, 0.102), mat("coral"), 0)
run(build)
