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
## Own voice (owner asked 2026-11-21)
- Owner may record his own narration (more real than TTS). Upload folder: Drive "What if/Voice recordings (upload here)"
  id 1F6XSSLmmOwDsKYZEjTQLwjTJO5NjTLoA. Pipeline path to add when the first file arrives: use the uploaded file as
  voice.wav and run pipeline/voice/align_words.py (word timings) instead of Kokoro; captions follow the real voice.
## Blender objects (built headless on GitHub Actions, saved for reuse in every later video)
How: write blender/models/<name>.py (helpers in blender/models/_lib.py: palette, box/cyl/ball/torus, export, preview), push ->
workflow blender-models (Blender 4.2.3 LTS tarball, cached) writes library/models/<name>.glb + previews/<name>.png +
BUILD-LOG.txt and commits them back ([skip ci]). Use in Remotion: `<Glb name="couch" p=... fallback={...} />`
(library/stick3d/glb.tsx: toon material + ink outlines, emissive parts unlit; served via public/models -> ../library/models).
Units: 1 = scene unit (puppet h 2.5); origin at floor centre unless noted; front faces the camera (+Z in three).

| name | file | what it is | colours | used in |
|---|---|---|---|---|
| couch | library/models/couch.glb | 3-seat couch, seat top 0.92, puppet sits inside the seat (legs hidden) | navy #252d48/#2e3758, coral pillow, gold emissive base strip | wi-gta-nosleep den (hook, crash, hour0, hour17, hour24, micro, ask) |
| side_table | library/models/side_table.glb | snack side table, top at 1.0, lower shelf | dark wood #3a2717/#24180e, gold emissive edge | den |
| game_controller | library/models/game_controller.glb | controller 0.56 wide (origin centre) | dark #1c2032, coral/gold/amber buttons, gold light bar | Remy's hands, speedrun station |
| chips_bag | library/models/chips_bag.glb | chips bag 0.62 tall | coral, gold band | den snacks |
| soda_can | library/models/soda_can.glb | can 0.34 tall | gold metal, coral band | den snacks |
| pizza_box | library/models/pizza_box.glb | pizza box 0.95 square | cardboard #b9772e, coral logo | den snacks |
| smartphone | library/models/smartphone.glb | phone on a stand (origin centre), screen drawn in scene | dark, ink screen | hour0 (SILENT) |
| toy_car | library/models/toy_car.glb | toy car 1.35 long along +X | coral, dark glass/wheels, cyan headlights, gold roof light | hour24 game road |
| mic_stand | library/models/mic_stand.glb | mic stand, mic at ~1.95 | dark base, steel pole, gold ring | day2 stage |
| radio_1964 | library/models/radio_1964.glb | 1960s table radio | walnut #5a3a1e, amber dial/grille | 1964 room |
| tv_1964 | library/models/tv_1964.glb | 1960s console TV with rabbit ears (top ~2.9) | wood, dark screen, cream knobs | 1964 room (OFF) |
| bed_1964 | library/models/bed_1964.glb | wooden bed 4.4 long, headboard at -X, mattress top 0.95 | wood, cream mattress, white pillow, gold trim | Randy sleeps 14 h |
