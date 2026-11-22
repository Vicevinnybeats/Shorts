import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Desert mesa / canyon wall piece (sunny desert highway). Origin = ground centre; ~24 wide, ~11 tall, layered rock bands.
def build():
    cols = ["#c4572c", "#d9743a", "#e8914f", "#b94b26", "#de8a4c"]
    for i in range(5):
        w = 24 - i * 3.2
        box(f"layer{i}", (w, 9 - i * 1.1, 2.4), (i * 0.4, 0, 1.2 + i * 2.2), mat(cols[i], rough=0.95), 0.25, rot=(0, 0, 0.02 * i))
    for i, (x, h) in enumerate([(-9, 4), (-6.5, 2.5), (8.5, 3), (10.5, 1.6)]):
        box(f"rock{i}", (2.2, 2.4, h), (x, -4.2, h / 2), mat(cols[(i + 2) % 5], rough=0.95), 0.3, rot=(0, 0, 0.4 * i))
    box("cap", (8, 4.5, 0.6), (1.6, 0, 11.6), mat("#f0a868", rough=0.9), 0.2)
run(build)
