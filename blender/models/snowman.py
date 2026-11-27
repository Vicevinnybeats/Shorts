import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Small beach snowman (What If #7 snow: "the first snowman in Vice City history", melts to a puddle by lunch).
# Origin = ground centre, ~1.55 tall, faces +Z in three (-Y here). Three snow balls, coal eyes/smile/buttons,
# carrot nose, stick arms, coral scarf, and tiny sunglasses pushed up on the head (Vice City touch).
def build():
    snow, coal = mat("#f4f8ff", rough=0.9), mat("ink")
    ball("base", 0.42, (0, 0, 0.38), snow, scale=(1, 1, 0.92), seg=20)
    ball("mid", 0.31, (0, 0, 0.92), snow, scale=(1, 1, 0.94), seg=18)
    ball("head", 0.22, (0, 0, 1.33), snow, seg=16)
    for s in (-1, 1):
        ball(f"eye{s}", 0.03, (s * 0.075, -0.195, 1.38), coal)
    for i in range(5):
        a = math.pi * (0.25 + 0.5 * i / 4)
        ball(f"smile{i}", 0.018, (math.cos(a) * -0.1, -0.205, 1.27 - math.sin(a) * 0.035), coal)
    cyl("carrot", 0.04, 0.2, (0, -0.31, 1.33), mat("#ff8a2a"), rot=(math.pi / 2, 0, 0), verts=10, r2=0.004)
    for i, z in enumerate((1.02, 0.88, 0.62, 0.46)):
        ball(f"button{i}", 0.032, (0, -0.31 if z > 0.8 else -0.415, z), coal)
    torus("scarf", 0.2, 0.05, (0, 0, 1.15), mat("coral"))
    box("scarftail", (0.08, 0.03, 0.26), (0.11, -0.2, 1.0), mat("coral"), 0.01, rot=(0.1, 0, -0.15))
    for s in (-1, 1):
        cyl(f"arm{s}", 0.018, 0.55, (s * 0.48, 0, 1.02), mat("#6b4a28"), rot=(0, s * 1.0, 0), verts=6)
        cyl(f"twig{s}", 0.012, 0.14, (s * 0.72, 0, 1.2), mat("#6b4a28"), rot=(0, s * 0.3, 0), verts=6)
        box(f"lens{s}", (0.09, 0.02, 0.05), (s * 0.07, -0.13, 1.5), mat("#1c2032"), 0.01, rot=(0.6, 0, 0))
    box("bridge", (0.05, 0.015, 0.015), (0, -0.14, 1.51), mat("gold"), 0, rot=(0.6, 0, 0))
run(build)
