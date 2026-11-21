# Shared helpers for headless Blender model scripts (run by .github/workflows/blender-models.yml).
# Usage inside a model script:  from _lib import *;  run(build)  where build() creates the objects.
# Units = metres = scene units of the Stick3D engine (a puppet is 2.5 tall). Blender Z-up / -Y = front; the glTF
# exporter turns that into three.js Y-up with the front facing +Z (toward the camera). Flat PBR colours only
# (Golden Neon palette), emissive strips where something glows; low poly + bevels so the toon outlines read well.
import bpy, sys, os, math, traceback

PAL = {
    "gold": "#f5b942", "amber": "#ffcf6e", "coral": "#ff7a59", "cyan": "#5fe3ff", "hot": "#fff3d0",
    "navy": "#1b2238", "navy2": "#252d48", "navy3": "#2e3758", "ink": "#0b0d1a", "wood": "#3a2717", "wood2": "#24180e",
    "wood64": "#5a3a1e", "cream": "#efe3cc", "white": "#fffaf0", "grey": "#9aa0b8", "dark": "#1c2032", "brick": "#7a2f26",
}

def _lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def rgb(hexstr):
    h = hexstr.lstrip("#")
    return tuple(_lin(int(h[i:i + 2], 16)) for i in (0, 2, 4))

_mats = {}
def mat(key, emit=0.0, rough=0.65, metal=0.0):
    """material by palette key or '#rrggbb'; emit > 0 adds emission of the same colour"""
    name = f"{key}_e{emit}"
    if name in _mats:
        return _mats[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    col = rgb(PAL.get(key, key))
    b.inputs["Base Color"].default_value = (*col, 1.0)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit > 0:
        for nm in ("Emission Color", "Emission"):
            if nm in b.inputs:
                b.inputs[nm].default_value = (*col, 1.0)
                break
        if "Emission Strength" in b.inputs:
            b.inputs["Emission Strength"].default_value = emit
    m.diffuse_color = (*col, 1.0)  # Workbench preview colour
    _mats[name] = m
    return m

def _finish(o, name, material, bevel):
    o.name = name
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        md = o.modifiers.new("bevel", "BEVEL")
        md.width = bevel
        md.segments = 2
        md.limit_method = "ANGLE"
    o.data.materials.append(material)
    return o

def box(name, size, loc, material, bevel=0.03, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = size
    return _finish(o, name, material, bevel)

def cyl(name, r, h, loc, material, rot=(0, 0, 0), verts=24, r2=None, bevel=0.0):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=loc, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r2, depth=h, location=loc, rotation=rot)
    o = bpy.context.active_object
    return _finish(o, name, material, bevel)

def ball(name, r, loc, material, scale=(1, 1, 1), seg=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=max(6, seg // 2), radius=r, location=loc)
    o = bpy.context.active_object
    o.scale = scale
    bpy.ops.object.shade_smooth()
    return _finish(o, name, material, 0)

def torus(name, R, r, loc, material, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=32, minor_segments=8, location=loc, rotation=rot)
    o = bpy.context.active_object
    return _finish(o, name, material, 0)

def export(path):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=False, export_apply=True)

def preview(path, size=360):
    """small Workbench render (material colours, cavity, soft shadow) framed on the model's bounds"""
    from mathutils import Vector
    sc = bpy.context.scene
    objs = [o for o in sc.objects if o.type == "MESH"]
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    ctr, rad = (lo + hi) / 2, max((hi - lo).length / 2, 0.1)
    bpy.ops.object.empty_add(location=ctr)
    tgt = bpy.context.active_object
    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 50
    cam = bpy.data.objects.new("cam", cam_data)
    sc.collection.objects.link(cam)
    d = Vector((0.75, -1.3, 0.75)).normalized()
    cam.location = ctr + d * rad * 3.4
    c = cam.constraints.new("TRACK_TO")
    c.target = tgt
    c.track_axis = "TRACK_NEGATIVE_Z"
    c.up_axis = "UP_Y"
    sc.camera = cam
    sc.render.engine = "BLENDER_WORKBENCH"
    sh = sc.display.shading
    sh.light = "STUDIO"
    sh.color_type = "MATERIAL"
    sh.show_cavity = True
    sh.show_shadows = True
    try:
        sh.background_type = "VIEWPORT"
        sh.background_color = (0.02, 0.02, 0.035)
    except Exception:
        pass
    sc.render.resolution_x = sc.render.resolution_y = size
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = "PNG"
    sc.render.filepath = os.path.abspath(path)
    os.makedirs(os.path.dirname(sc.render.filepath), exist_ok=True)
    bpy.ops.render.render(write_still=True)

def run(build):
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    out = argv[0] if argv else "/tmp/model.glb"
    prev = argv[1] if len(argv) > 1 else None
    bpy.ops.wm.read_factory_settings(use_empty=True)
    try:
        build()
        export(out)
        print(f"MODEL OK {out} {os.path.getsize(out)} bytes")
    except Exception:
        traceback.print_exc()
        print(f"MODEL FAIL {out}")
        sys.exit(1)
    if prev:
        try:
            preview(prev)
            print(f"PREVIEW OK {prev}")
        except Exception:
            traceback.print_exc()
            print(f"PREVIEW FAIL {prev}")
