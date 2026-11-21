import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Snack side table (den). Origin = floor centre; top surface z 1.0; gold edge strip on the front.
def build():
    box("top", (2.1, 0.95, 0.08), (0, 0, 0.96), mat("wood"), 0.02)
    box("shelf", (1.9, 0.8, 0.05), (0, 0, 0.3), mat("wood2"), 0.01)
    for s in (-1, 1):
        for t in (-1, 1):
            box(f"leg{s}{t}", (0.08, 0.08, 0.92), (s * 0.95, t * 0.4, 0.46), mat("wood2"), 0.01)
    box("edge", (2.1, 0.03, 0.03), (0, -0.49, 0.97), mat("gold", emit=2.5), 0)
run(build)
