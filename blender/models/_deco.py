# Shared builder for generic pastel Art-Deco-style beach hotels (What If #7 snow, Vice City streets). No names/logos.
# Origin = ground centre; 8 wide (X), 4 deep, body 7 tall, stepped parapet to ~8.3, central fin to 9.5; front faces +Z
# in three (-Y here). Three floors of blue windows with "eyebrow" ledges, horizontal speed lines on the corners,
# entrance canopy + glass doors at the front centre.
from _lib import *  # noqa

def build_deco(main_hex, trim_hex, accent_hex):
    main, trim, acc, glass = mat(main_hex), mat(trim_hex), mat(accent_hex), mat("#7fb4e0", rough=0.3)
    box("body", (8, 4, 7), (0, 0, 3.5), main, 0.05)
    box("base", (8.1, 4.1, 0.6), (0, 0, 0.3), trim, 0.03)
    for i, z in enumerate((7.15, 7.55, 8.05)):
        w = (8.0, 5.2, 2.6)[i]
        box(f"step{i}", (w, 3.8 - i * 0.3, (0.3, 0.5, 0.5)[i]), (0, 0, z), main if i else trim, 0.03)
    box("fin", (0.9, 0.5, 9.5), (0, -2.1, 4.75), trim, 0.04)
    for k in range(3):
        box(f"fingroove{k}", (1.0, 0.55, 0.08), (0, -2.12, 8.2 + k * 0.4), acc, 0)
    for fl, z in enumerate((3.4, 5.5)):
        for x in (-2.9, -1.35, 1.35, 2.9):
            box(f"win{fl}{x}", (1.1, 0.06, 1.1), (x, -2.02, z), glass, 0.01)
            box(f"brow{fl}{x}", (1.4, 0.4, 0.08), (x, -2.2, z + 0.7), trim, 0.01)
    for x in (-2.9, 2.9):
        box(f"gwin{x}", (1.6, 0.06, 1.2), (x, -2.02, 1.4), glass, 0.01)
    for s in (-1, 1):
        for k in range(3):
            box(f"speed{s}{k}", (0.08, 4.1, 0.1), (s * 4.0, 0, 6.2 + k * 0.3), acc, 0)
            box(f"speedf{s}{k}", (1.2, 0.08, 0.1), (s * 3.45, -2.03, 6.2 + k * 0.3), acc, 0)
    box("canopy", (2.8, 1.2, 0.14), (0, -2.6, 2.45), acc, 0.02)
    box("doors", (1.6, 0.06, 1.9), (0, -2.03, 1.05), glass, 0.01)
    box("step", (2.4, 0.6, 0.15), (0, -2.35, 0.08), trim, 0.01)
