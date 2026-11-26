import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
import bmesh
from mathutils import Vector
# Friendly round parachute (What If #3: "parachutes exist for a reason"). Origin = a hanging puppet's feet (z 0);
# harness at z 1.5, canopy dome r 2.8 with its rim at z 5.0 (top ~6.7); 12 coral/cream panels, gold apex; 12 cords.
R, CZ = 2.8, 5.0
def link(name, a, b, r, material):
    a, b = Vector(a), Vector(b); d = b - a
    rot = Vector((0, 0, 1)).rotation_difference(d).to_euler()
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=r, depth=d.length, location=(a + b) / 2, rotation=rot)
    o = bpy.context.active_object; o.name = name; o.data.materials.append(material); return o
def build():
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=R, location=(0, 0, 0))
    o = bpy.context.active_object; o.name = "canopy"
    bm = bmesh.new(); bm.from_mesh(o.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.05], context="VERTS")
    for f in bm.faces:
        c = f.calc_center_median(); a = math.atan2(c.y, c.x)
        f.material_index = int(((a + math.pi) / (2 * math.pi)) * 12) % 2
    bm.to_mesh(o.data); bm.free()
    o.data.materials.append(mat("coral", rough=0.7)); o.data.materials.append(mat("#fff1dc", rough=0.7))
    o.scale = (1, 1, 0.62); o.location = (0, 0, CZ)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bpy.ops.object.shade_smooth()
    md = o.modifiers.new("solid", "SOLIDIFY"); md.thickness = 0.06
    ball("apex", 0.32, (0, 0, CZ + R * 0.62 - 0.05), mat("gold"), scale=(1, 1, 0.5))
    torus("skirt", R, 0.05, (0, 0, CZ), mat("#d9563c"))
    cm = mat("#3a2a1a")
    for i in range(12):
        a = i / 12 * 2 * math.pi
        link(f"cord{i}", (math.cos(a) * R * 0.98, math.sin(a) * R * 0.98, CZ), (math.cos(a) * 0.25, math.sin(a) * 0.12, 1.55), 0.015, cm)
    box("harness", (0.7, 0.18, 0.12), (0, 0, 1.5), mat("gold"), 0.02)
    for s in (-1, 1):
        box(f"strap{s}", (0.08, 0.12, 0.7), (s * 0.3, 0, 1.15), mat("gold"), 0.01)
run(build)
