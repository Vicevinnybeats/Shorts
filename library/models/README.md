# Blender models (saved for reuse in later videos)
Built headless on GitHub Actions (.github/workflows/blender-models.yml) from blender/models/<name>.py:
<name>.glb (low poly, flat Golden Neon colours, emissive strips) + previews/<name>.png + BUILD-LOG.txt.
Served to Remotion through public/models -> ../library/models (staticFile("models/<name>.glb")); loaded in the
Stick3D toon look by library/stick3d/glb.tsx (<Glb name=... fallback=...>). Catalogue: brain/stick3d/README.md.
