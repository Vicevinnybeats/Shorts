# Stick3D pack - INSTALLED 2026-11-21 (owner's zip "Stick3D-Pack-v4")
What: 9:16 "stick figure in 3D" engine: bean-body 2D puppets (big round head, ink outline, stick limbs, expressive
faces, IK hands, sweat/nervous acting) inside 3D toon rooms (three.js via @remotion/three) with props, light shafts,
dust, camera rigs (Catmull-Rom paths, FOV kicks), transitions. Owner decision: the WHAT IF series uses THIS look,
in the Golden Neon colour theme (black/navy rooms, gold #f5b942 + coral #ff7a59 + cyan #5fd4e6 accents, glow/shafts).
## Where things are
- Engine: library/stick3d/{toon.tsx (Box, BrickWall, CanvasPlane, Surface, Billboard, Shadow), puppet.ts (Look, Pose,
  drawPuppet), kit.tsx (Rig, CamSet, Person, Lights, Room, Desk, Door, Sign, Clock, Calendar, ChartScreen, Stairs, Chip,
  Grade, seg/lerp/clamp), props.tsx (Floor, WallDoor, SideWall, Glow, Shaft, Plant, Shelf, Frame, WindowCity, Lamp,
  Monitor, Chair, Cooler, Cabinet, Rug, Dust), extra.tsx (Cam/camAt, FaceGroup/hand, Extrude, Arrow3D, Domino, Globe,
  Crown, Throne, SpotCone, Curtain, Lectern, Building, StreetLamp, StreetSign, Taxi, Hydrant, Bench, Bin, Barrier,
  PressCam, ChipStack, Card, Dice, HangLamp, Mug, Stars)}
- Reference episodes (code only, not compiled): library/stick3d/examples/*.tsx.ref (patterns: jump-back shock, stairs,
  door walk-through, carry box, dominoes, crown physics, cable snap, whip transition).
- Pack rules (data, adapted, not blindly followed): brain/stick3d/{RULES, STYLE-SPEC, STYLE-RULES-v2, ACTION-LIBRARY,
  QUALITY-CHECKLIST, CREATIVE-FREEDOM}.md + MASTER-PROMPT.reference.md. Our channel rules win where they differ
  (format 1080x1920, our captions/safe area, NO "trim silences for fast pace": owner wants natural pauses).
- Install test: composition "Stick3DTest" (src/tests/Stick3DTest.tsx) with NEON3D palette + REMY3D look.
## Must know
- 3D needs GL "swangle" (swiftshader gives no WebGL context). Episode.json: "gl": "swangle". ~4.7 s per half-scale
  still on this CPU -> renders are slow; use more chunks (6) on GitHub Actions (repo is public = free minutes).
- Shaft colour = "r,g,b" string; Dust colour = rgba() string.
- NOT committed: the pack's BENCHMARK mp4 and voiceover mp3 (reference media, never commit/re-upload).
- Keep text real: every fact verified with sources in RESEARCH.md, as always.
## Voice (owner 2026-11-21, 2nd note: "too fast, no pauses between sentences")
- kokoro_tts.py: one chunk per sentence + real pause NARRATOR_GAP (default 0.42 s); episode.json "speed" (What If: 0.92)
  and "pause" override per episode. Voice bm_george, music "cinematic".
## Next (NOT started, owner: "don't start yet")
- What If 1 (wi-gta-nosleep) + 2 (wi-gta-leonida): deleted from Drive (trash) -> REMAKE both with Stick3D in Golden Neon.
- Owner wants better 3D objects made with Blender (MCP) and saved here -> see "Blender objects" when done.
