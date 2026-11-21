import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Flat TV on a low media console (What If #2 hurricane news). Origin = floor centre; screen faces -Y, screen centre
# at z 1.95, 2.4 x 1.36 (the picture - hurricane cone etc. - is drawn by the scene on a plane just in front of it).
def build():
    box("console", (3.2, 0.8, 0.6), (0, 0.1, 0.34), mat("wood"), 0.04)
    box("consoletop", (3.3, 0.85, 0.06), (0, 0.1, 0.66), mat("wood2"), 0.02)
    box("consolestrip", (3.0, 0.03, 0.04), (0, -0.31, 0.12), mat("gold", emit=2.5), 0)
    for s in (-1, 1):
        box(f"door{s}", (1.4, 0.02, 0.4), (s * 0.78, -0.31, 0.36), mat("wood2"), 0.01)
        box(f"leg{s}", (0.08, 0.08, 0.06), (s * 1.45, 0.1, 0.03), mat("dark"), 0)
    box("neck", (0.3, 0.1, 0.5), (0, 0.15, 0.9), mat("dark"), 0.02)
    box("foot", (0.8, 0.4, 0.04), (0, 0.1, 0.71), mat("dark"), 0.01)
    box("frame", (2.55, 0.1, 1.5), (0, 0.1, 1.95), mat("ink"), 0.03)
    box("screen", (2.4, 0.02, 1.36), (0, 0.04, 1.95), mat("#10131f", rough=0.2), 0)
    ball("led", 0.025, (1.15, 0.04, 1.24), mat("coral", emit=3.0))
run(build)
