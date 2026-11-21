import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Smartphone standing upright (screen faces -Y = camera). Origin = centre. The screen content is drawn in the scene.
def build():
    box("body", (0.4, 0.05, 0.72), (0, 0, 0), mat("dark"), 0.04)
    box("screen", (0.34, 0.006, 0.62), (0, -0.026, 0), mat("ink", rough=0.2), 0)
    box("stand", (0.3, 0.3, 0.04), (0, 0.1, -0.36), mat("navy3"), 0.01)
run(build)
