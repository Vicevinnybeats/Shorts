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
| suitcase | library/models/suitcase.glb | rolling suitcase, shell ~1.0 + pulled handle to 1.6 (front -Y), use s 0.72 at a puppet's hand | coral shell + ribs, cyan/gold stickers, gold grip | wi-gta-leonida hook, miami |
| palm_tree | library/models/palm_tree.glb | palm, trunk leans to +X, crown ~5 high | brown ringed trunk, two greens, coconuts | wi-gta-leonida street, golf, beach, respawn |
| beach_umbrella | library/models/beach_umbrella.glb | striped umbrella (rim ~2.15, r 1.25) + towel; s 1.3 so a puppet fits under it | coral/cream panels, gold tip, cyan towel | wi-gta-leonida wish, beach (sky, ask), respawn |
| sports_car | library/models/sports_car.glb | low sports car 2.8 long along +X | gold body, coral stripe, cyan head/underglow, coral tail | wi-gta-leonida wish (fast cars) |
| golf_flag | library/models/golf_flag.glb | hole cup + flag pole 2.4 + golf ball | white pole, coral flag, gold band | wi-gta-leonida golf |
| alligator | library/models/alligator.glb | Florida alligator ~3.6 long, snout +X, belly on the ground | olive #4c6b34/#3a5428, cream belly/teeth, gold emissive eyes | wi-gta-leonida golf/twist/above, wish swamp, map (s 0.26) |
| flat_tv | library/models/flat_tv.glb | flat TV on a media console, screen centre z 1.95 (2.4x1.36, picture drawn by the scene on a Panel just in front) | wood console + gold strip, ink frame, coral LED | wi-gta-leonida tv (hurricane cone) |
Florida set pieces (code, not .glb): library/stick3d/leonida.tsx - FloridaMap (real outline slab + 67 county dots), SkyWall, StormCloud, Bolt, Water, Spiral, Tufts, Rain.
| city_block | library/models/city_block.glb | cluster of 6 pastel towers (up to ~22 tall) with glassy window bands, for skylines | cream/peach/sky-blue/terracotta, blue glass | wi-gta-nosleep daylight (window views, plaza) |
| desert_mesa | library/models/desert_mesa.glb | layered red-rock mesa ~24 wide, 11 tall (scale wide/flat) | rust/orange rock bands | wi-gta-nosleep desert highway |
| cloud_puff | library/models/cloud_puff.glb | soft low-poly cloud ~7 wide | white | daylight skies |
| palm_tree_day | library/models/palm_tree_day.glb | curved palm ~6 tall (What If 2 keeps its own palm_tree) | brown trunk, green fronds | wi-gta-nosleep daylight (den view, 1964 San Diego, plaza) |
| window_frame | library/models/window_frame.glb | open window frame 6x4 with mullions + sill (scale to the opening) | warm white | daylight interiors (WindowWall in library/stick3d/daylight.tsx) |
| cactus | library/models/cactus.glb | saguaro ~4 tall | green | wi-gta-nosleep desert highway |
| skyscraper_roof | library/models/skyscraper_roof.glb | roof deck (top y 0, 12x12, parapet, stair hut with coral door at (-3.6,-3.4) facing +z, AC, water tank, mast); tower runs DOWN to y -70 with window bands | cream facade, blue glass, terracotta caps | wi-gta-physics roof (hook, test1, gravity dolly zoom, ask) |
| parachute | library/models/parachute.glb | round canopy r 2.8 (rim y 5.0, top ~6.7), 12 cords to a harness at y 1.5; origin = hanging puppet's feet | coral/cream panels, gold apex + harness | wi-gta-physics chute |
| crash_dummy | library/models/crash_dummy.glb | SEATED crash-test dummy, origin = pelvis bottom, faces +z, head top ~1.9, hands at steering height | yellow #f2c230, dark joints, black/yellow target marks | wi-gta-physics belt (on car_seat at (0, 0.62, 0.05)) |
| car_seat | library/models/car_seat.glb | crash-test sled: car seat (cushion top 0.62) on a grey platform with rails + steering wheel/dash in front (+z) | navy seat, coral piping, gold rails | wi-gta-physics belt |
| speed_sign_30 | library/models/speed_sign_30.glb | round "30" speed-limit sign on a 3.3 pole, sign centre y 2.8, faces +z | white face, red ring, black 30 | wi-gta-physics school street |
| school_building | library/models/school_building.glb | 2-storey school 16x7x7.4 + clock tower (~11.6), porch + coral doors, flag pole at +x, low fence at z +6.2; faces +z | warm brick, cream trim, blue windows | wi-gta-physics test3/survive/zone |
| stairwell | library/models/stairwell.glb | one flight of 12 steps DOWN from a landing (x -4.2, y 3.0) to the floor at x +3.0 (step 0.6 x 0.25, 2.2 deep), back wall z -1.3 with window, coral rail | cream steps, gold nosings, coral rail | wi-gta-physics stairs |
| burger | library/models/burger.glb | cartoon burger ~0.62 wide, 0.5 tall (origin bottom centre) | sesame bun, lettuce, cheese, patty, coral tomato | wi-gta-healing test2 (cyan hologram "game heal") |
| plaster | library/models/plaster.glb | close-up FINGER (along +X, tip at +X, r 0.32, axis z 0.36) with a sticking plaster round the middle; use s ~0.34 on a table | skin #f3d2b3, tan band, cream pad | wi-gta-healing cut (insert on the picnic table) |
| picnic_table | library/models/picnic_table.glb | park picnic table 2.6 long along X, top y 1.05, benches both sides | honey wood, coral/cream checked runner | wi-gta-healing park (hook, test1, cut, scar, ask) |
| donation_chair | library/models/donation_chair.glb | blood-donor chair, cushion top 0.78 (puppet feet at y 0.18 to "sit"), reclined back, leg rest, padded arm rest at +X | coral upholstery, white plinth, gold trim | wi-gta-healing donor centre |
| blood_bag_stand | library/models/blood_bag_stand.glb | wheeled stand, pole 2.6, STYLISED bag (amber plasma top / coral red cells, white label + drop) at x +0.4, tube ends in a capped connector (no needle) | steel, amber, coral, cyan cap | wi-gta-healing test2/plasma (rot PI so the tube points to the chair) |
| xray_lightbox | library/models/xray_lightbox.glb | wall X-ray lightbox, glowing screen 2.4x1.7 at y 2.25 (film drawn by the scene on a Panel ~0.15 in front) | cream frame, pale-blue emissive screen, gold switch light | wi-gta-healing xray |
| arm_cast | library/models/arm_cast.glb | forearm cast along X (0.7, r 0.11) + skin fist + navy sling cradle with a short strap; hold at (0, 0.4h, +0.14) in front of a puppet (FaceGroup) | white cast with coral/gold/cyan doodles, navy sling | wi-gta-healing test3, xray, rest, realbar, outro |
| hospital_bed | library/models/hospital_bed.glb | clinic bed 3.2 long along X, head end -X raised, mattress top 1.0, side rails, wheels | mint frame, white sheets, coral blanket | wi-gta-healing xray |
