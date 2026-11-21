import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Striped beach umbrella + towel (What If #2 beach). Origin = pole base in the sand; canopy rim ~2.15 high, radius 1.25.
def build():
    cyl("pole", 0.035, 2.6, (0, 0, 1.3), mat("cream"), verts=10)
    n, R, zr, zt = 8, 1.25, 2.15, 2.65
    for i in range(n):
        a0, a1 = i * 2 * math.pi / n, (i + 1) * 2 * math.pi / n
        verts = [(0, 0, zt), (R * math.cos(a0), R * math.sin(a0), zr), (R * math.cos(a1), R * math.sin(a1), zr)]
        me = bpy.data.meshes.new(f"panel{i}")
        me.from_pydata(verts, [], [(0, 1, 2)])
        me.update()
        o = bpy.data.objects.new(f"panel{i}", me)
        bpy.context.scene.collection.objects.link(o)
        sol = o.modifiers.new("thick", "SOLIDIFY")
        sol.thickness = 0.04
        o.data.materials.append(mat("coral") if i % 2 == 0 else mat("cream"))
    ball("tip", 0.07, (0, 0, zt + 0.04), mat("gold", emit=1.5))
    box("towel", (1.6, 0.8, 0.03), (0.6, -0.9, 0.015), mat("cyan"), 0.01)
    box("towelstripe", (1.6, 0.16, 0.035), (0.6, -0.9, 0.016), mat("white"), 0)
run(build)
