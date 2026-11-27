import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
import bmesh
# SWIM RING / ring buoy (What If #9 respawn): Remy floats safely in it in the open ocean. Origin = ring centre, ring
# lies FLAT (in three: XZ plane, y up). Major radius 0.62, tube 0.2 (outer ~0.82). 8 alternating coral/white
# segments, a cream grab rope around the outside held by 4 coral clips.
def arc(name, R, r, a0, a1, material):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=64, minor_segments=10, location=(0, 0, 0))
    o = bpy.context.active_object
    bpy.ops.object.mode_set(mode="EDIT")
    bm = bmesh.from_edit_mesh(o.data)
    kill = []
    for v in bm.verts:
        a = math.atan2(v.co.y, v.co.x) % (2 * math.pi)
        if not (a0 - 1e-4 <= a <= a1 + 1e-4):
            kill.append(v)
    bmesh.ops.delete(bm, geom=kill, context="VERTS")
    bmesh.update_edit_mesh(o.data)
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.shade_smooth()
    o.name = name
    o.data.materials.append(material)
    return o

def build():
    n = 8
    step = 2 * math.pi / n
    for k in range(n):
        a0, a1 = k * step, min((k + 1) * step + 2 * math.pi / 64, 2 * math.pi)
        arc(f"seg{k}", 0.62, 0.2, a0, a1, mat("coral" if k % 2 == 0 else "white", rough=0.45))
    torus("rope", 0.84, 0.025, (0, 0, 0), mat("cream"))
    for k in range(4):
        a = k * math.pi / 2 + math.pi / 8
        box(f"clip{k}", (0.09, 0.09, 0.16), (math.cos(a) * 0.8, math.sin(a) * 0.8, 0), mat("coral"), 0.02, rot=(0, 0, a))
run(build)
