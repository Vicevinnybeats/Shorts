import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
import bmesh
# Rescue LIFE RING on a POST (What If #6 breath cold shore). Origin = floor centre, faces the front (-Y, three +z).
# Wooden post 2.5 tall with a small sloped roof cap, a hook board, a coral/white ring buoy (R 0.45) hanging at z 1.58,
# a coiled cream throw rope under it, a gold reflector stripe on the post.
def build():
    w = mat("#8a6440", rough=0.9)
    box("post", (0.18, 0.18, 2.5), (0, 0.12, 1.25), w, 0.02)
    box("cap", (0.34, 0.34, 0.08), (0, 0.12, 2.54), mat("navy"), 0.02, rot=(0.2, 0, 0))
    box("board", (0.6, 0.06, 0.5), (0, 0.0, 1.95), w, 0.02)
    box("refl", (0.19, 0.01, 0.1), (0, 0.025, 0.9), mat("gold"), 0.0)
    cyl("hook", 0.025, 0.2, (0, -0.1, 2.0), mat("dark"), rot=(math.pi / 2, 0, 0), verts=8)
    for i in range(8):
        a0 = i * math.pi / 4
        bpy.ops.mesh.primitive_torus_add(major_radius=0.45, minor_radius=0.1, major_segments=32, minor_segments=8,
                                         location=(0, -0.15, 1.58), rotation=(math.pi / 2, 0, 0))
        o = bpy.context.active_object
        o.name = f"ringseg{i}"
        bm = bmesh.new()
        bm.from_mesh(o.data)
        kill = [v for v in bm.verts if ((math.atan2(v.co.y, v.co.x) - a0) % (2 * math.pi)) > math.pi / 4 + 0.02]
        bmesh.ops.delete(bm, geom=kill, context="VERTS")
        bm.to_mesh(o.data)
        bm.free()
        o.data.materials.append(mat("coral") if i % 2 == 0 else mat("white"))
    for i in range(3):
        torus(f"rope{i}", 0.2 - i * 0.03, 0.025, (0, -0.12, 0.95 - i * 0.05), mat("#f2e6c8"), rot=(math.pi / 2, 0, 0))
run(build)
