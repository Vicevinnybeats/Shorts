import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
from mathutils import Vector
# Friendly SEATED crash-test dummy (What If #3 seat-belt diagram; a mannequin, never a person, never hurt).
# Origin = seat contact (bottom of the pelvis, z 0), faces the front (-Y). Hips z ~0.25, shoulders z ~1.12, head top ~1.9.
# Yellow body, dark joints, black/yellow target marks on the head sides + chest; hands forward at steering height.
def limb(name, a, b, r, material):
    a, b = Vector(a), Vector(b); d = b - a
    rot = Vector((0, 0, 1)).rotation_difference(d).to_euler()
    bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=r, depth=d.length, location=(a + b) / 2, rotation=rot)
    o = bpy.context.active_object; o.name = name; o.data.materials.append(material); bpy.ops.object.shade_smooth(); return o
def target(name, loc, rot, r=0.11):
    cyl(name + "k", r, 0.02, loc, mat("ink"), rot=rot, verts=20)
    cyl(name + "y", r * 0.45, 0.03, loc, mat("#ffd23a"), rot=rot, verts=16)
def build():
    Y, J = mat("#f2c230", rough=0.45), mat("#2b2f3a", rough=0.5)
    box("pelvis", (0.7, 0.5, 0.34), (0, 0, 0.17), Y, 0.08)
    box("torso", (0.74, 0.42, 0.82), (0, 0.04, 0.78), Y, 0.12, rot=(-0.1, 0, 0))
    box("chestPlate", (0.5, 0.04, 0.3), (0, -0.19, 0.95), J, 0.02, rot=(-0.1, 0, 0))
    limb("neck", (0, 0.06, 1.18), (0, 0.04, 1.36), 0.09, J)
    ball("head", 0.3, (0, 0.02, 1.58), Y, scale=(0.92, 0.95, 1.05), seg=20)
    for s in (-1, 1):
        target(f"tH{s}", (s * 0.285, 0.02, 1.6), (0, math.pi / 2, 0), 0.09)
        ball(f"hip{s}", 0.13, (s * 0.24, -0.12, 0.24), J)
        limb(f"thigh{s}", (s * 0.24, -0.12, 0.24), (s * 0.26, -0.82, 0.26), 0.12, Y)
        ball(f"knee{s}", 0.12, (s * 0.26, -0.82, 0.26), J)
        limb(f"shin{s}", (s * 0.26, -0.82, 0.26), (s * 0.26, -0.95, -0.38), 0.1, Y)
        box(f"foot{s}", (0.18, 0.36, 0.12), (s * 0.26, -1.08, -0.43), J, 0.03)
        ball(f"shoulder{s}", 0.12, (s * 0.43, 0.02, 1.12), J)
        limb(f"upper{s}", (s * 0.43, 0.02, 1.12), (s * 0.47, -0.32, 0.8), 0.09, Y)
        ball(f"elbow{s}", 0.09, (s * 0.47, -0.32, 0.8), J)
        limb(f"fore{s}", (s * 0.47, -0.32, 0.8), (s * 0.3, -0.72, 0.95), 0.08, Y)
        ball(f"hand{s}", 0.09, (s * 0.3, -0.74, 0.96), J)
    target("tC", (0.2, -0.22, 1.02), (math.pi / 2 - 0.1, 0, 0), 0.08)
run(build)
