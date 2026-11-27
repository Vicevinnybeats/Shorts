import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# ONE stylised banknote (What If #5 "a bill weighs about one gram"). NOT a real banknote: plain green paper, lighter
# frame, a darker oval in the middle (no portrait, no text, no serial numbers). 0.36 long (X) x 0.155 wide (Y),
# 0.006 thick, lies flat; origin = bottom centre (top face up).
def build():
    box("paper", (0.36, 0.155, 0.006), (0, 0, 0.003), mat("#7fc47a", rough=0.85), 0.0015)
    box("frame", (0.33, 0.128, 0.0015), (0, 0, 0.0066), mat("#bfe8b4", rough=0.85), 0)
    box("inner", (0.30, 0.1, 0.0015), (0, 0, 0.0074), mat("#8fd08a", rough=0.85), 0)
    ball("oval", 0.04, (0, 0, 0.0082), mat("#4f9a55"), scale=(1.35, 1.0, 0.03), seg=16)
    for sx in (-1, 1):
        ball(f"corner{sx}", 0.016, (sx * 0.125, 0.032 * sx, 0.0082), mat("#4f9a55"), scale=(1, 1, 0.05), seg=10)
run(build)
