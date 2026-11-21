import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Soda can (snack). Origin = bottom centre, 0.34 tall.
def build():
    cyl("can", 0.1, 0.34, (0, 0, 0.17), mat("gold", rough=0.35, metal=0.5), verts=20)
    cyl("band", 0.102, 0.1, (0, 0, 0.2), mat("coral"), verts=20)
    cyl("lid", 0.085, 0.012, (0, 0, 0.346), mat("grey", rough=0.3, metal=0.6), verts=20)
run(build)
