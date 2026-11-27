import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
from _deco import build_deco
# Pastel pink Art-Deco-style beach hotel (generic, no name). See _deco.py for sizes. Seafoam trim, coral accents.
def build():
    build_deco("#f6bccb", "#7fd6c8", "#ff8a73")
run(build)
