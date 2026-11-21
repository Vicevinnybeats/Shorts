import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Game controller (held by Remy). Origin = centre; 0.56 wide (X), thin in Z, buttons on top (+Z).
def build():
    box("body", (0.4, 0.24, 0.1), (0, 0, 0), mat("dark"), 0.035)
    for s in (-1, 1):
        box(f"grip{s}", (0.16, 0.26, 0.1), (s * 0.22, 0.05, -0.01), mat("dark"), 0.05, rot=(0, 0, s * 0.35))
        cyl(f"stick{s}", 0.03, 0.04, (s * 0.07, 0.06, 0.06), mat("navy3"), verts=12)
    ball("btnA", 0.022, (0.15, -0.03, 0.055), mat("coral", emit=0.6))
    ball("btnB", 0.022, (0.19, 0.01, 0.055), mat("gold", emit=0.6))
    ball("btnC", 0.022, (0.11, 0.01, 0.055), mat("amber", emit=0.6))
    box("dpadH", (0.08, 0.025, 0.015), (-0.15, -0.01, 0.055), mat("grey"), 0)
    box("dpadV", (0.025, 0.08, 0.015), (-0.15, -0.01, 0.055), mat("grey"), 0)
    box("lightbar", (0.14, 0.02, 0.02), (0, -0.125, 0.03), mat("gold", emit=3.0), 0)
run(build)
