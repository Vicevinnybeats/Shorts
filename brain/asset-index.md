# Asset index

Filled in Phase 1 from `/library/index.json` (characters x emotions, environments, objects, textures, camera moves,
lighting presets, audio moods). Each entry also records which episodes used it, so videos never look the same.

## environments25/army.tsx (episode gta-army, 2026-11-20) - generic military office, park run, university gym
No real insignia, logos, flags or unit badges anywhere (wording rule in episodes/gta-army/RESEARCH.md).
- `ARMY` palette (office beige/olive, steel desk, gold pass, sunrise park, gym maroon/gold, audio player).
- `CounselorOffice({ f })` full 1080x1920 backdrop (cached): beige wall + olive wainscot, window with half-lowered
  blinds, corkboard with blank forms + sticky note, big NOV wall calendar, filing cabinet, potted plant, ceiling light,
  live wall clock (f). Floor line y 1250; floor calm in y 1440-1640.
- `Desk({ x, y, scale })` steel desk front (x centre, y floor, 760 wide); `DESK_TOP = 180` (top height, x scale).
  Seating: `SEATED_POSE` + `seatedY(deskY, scale)`; draw the Person (shadow 0) BEFORE the Desk.
- `Contract({ x, y, scale, signed 0..1, label = "CONTRACT" })` 440x580 sheet centred; signature draws on.
  `SIGN_END`, `contractSignPoint(t)` give the pen-tip position in Contract-local units.
- `Pen({ x, y, rot = 30, scale })` ballpoint, (x, y) = tip, ~300 long.
- `PassCard({ x, y, scale, pop 0..1 })` golden ticket "4 DAY PASS" (600x320 centred), pop = overshoot + turn + shine.
- `Calendar({ x, y, scale, circled 0..1, month = "NOV", day = 14 })` 460x580 page centred, real 2026 weekday layout,
  red hand-drawn ring draws around `day`.
- Uniform: `SOLDIER_LOOK` (= CAST.soldier1), `SOLDIER2_LOOK` (= CAST.soldier2), `COUNSELOR_LOOK` (= CAST.counselor);
  add `CamoShirt` (darker blobs + blank chest tape + collar) and optional `PatrolCap` with the SAME props as the Person.
- `Headphones({ x, y, scale, facing?, pose?, rot?, color })` same x/y/scale as the Person (feet); profile poses
  (runPose) get one cup + band, front poses two cups. Kai (CAST.kai) runs with them.
- `ParkPath({ f, scroll })` (alias `RunPath`) sunrise park: sky/sun still, hills p 0.1, tree line p 0.3, path + near
  trees + bench p 1; `scroll` px moves the world left (keep the runner centred). Runner feet on the path at y ~1330.
- `Gym({ f })` university gym backdrop (cached): three big windows, maroon/gold stripe, far treadmills row,
  dumbbell rack, rubber floor from y 1250.
- `Treadmill({ x, y, scale, f, speed = 14 })` side view facing +x, moving belt; `TREADMILL_DECK = 70` (runner at
  y - 70*scale).
- `Audiobook({ x, y, scale, locked 0..1 })` old-school pocket player (300x500 centred) with a book cover (no text),
  click wheel, earbuds; `locked` dims the screen and pops a gold padlock.
- CAST keys added in library/style/channel.ts: `soldier1`, `soldier2`, `counselor`.
