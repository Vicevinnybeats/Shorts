import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
from _deco import build_deco
# Pastel mint Art-Deco-style beach hotel (generic, no name). See _deco.py for sizes. Peach trim, sky-blue accents.
def build():
    build_deco("#c4ecd9", "#ffb48f", "#5fb7e6")
run(build)
