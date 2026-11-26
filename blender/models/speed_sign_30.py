import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import *  # noqa
# Round "30" speed-limit sign on a pole (What If #3: 30 zones near schools). Origin = pole foot; sign centre z 2.8,
# r 0.62, faces the front (-Y). White face, red ring, black "30".
def build():
    cyl("pole", 0.06, 3.3, (0, 0, 1.65), mat("#9aa0ab", metal=0.6, rough=0.35), verts=12)
    face = (math.pi / 2, 0, 0)
    cyl("ring", 0.62, 0.05, (0, -0.06, 2.8), mat("#d93a2b"), rot=face, verts=40)
    cyl("face", 0.49, 0.06, (0, -0.07, 2.8), mat("#fffaf0"), rot=face, verts=40)
    bpy.ops.object.text_add(location=(0, -0.105, 2.8), rotation=(math.pi / 2, 0, 0))
    t = bpy.context.active_object
    t.data.body = "30"; t.data.size = 0.5; t.data.extrude = 0.01
    t.data.align_x = "CENTER"; t.data.align_y = "CENTER"
    bpy.ops.object.convert(target="MESH")
    t = bpy.context.active_object
    t.name = "digits"; t.data.materials.append(mat("ink"))
    box("clamp", (0.18, 0.08, 0.1), (0, 0.02, 2.4), mat("#6b707b"), 0.01)
run(build)
