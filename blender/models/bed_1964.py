import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# 1960s wooden bed (Randy sleeps 14 h). Origin = floor centre; length along X, headboard at -X; mattress top z 0.95.
def build():
    box("frame", (4.4, 2.2, 0.7), (0, 0, 0.35), mat("wood"), 0.04)
    box("headboard", (0.2, 2.3, 2.0), (-2.25, 0, 1.0), mat("wood64"), 0.05)
    box("footboard", (0.2, 2.3, 1.4), (2.25, 0, 0.7), mat("wood64"), 0.05)
    box("trim", (0.22, 2.32, 0.05), (-2.25, 0, 2.0), mat("gold", emit=1.5), 0)
    box("mattress", (4.2, 2.0, 0.26), (0, 0, 0.82), mat("cream"), 0.06)
    box("pillow", (0.9, 1.2, 0.28), (-1.6, 0, 1.08), mat("white"), 0.1)
run(build)
