# WHAT IF style - "Golden Neon" (owner look, 2026-11-21)

Code: `library/whatif/kit.tsx` (HUD, props, stage, motion helpers) + `library/whatif/figure.tsx` (characters).
Previews: `library/previews/whatif/kit.png`, `characters.png` (rebuild: `CHROME_PATH=... node library/previews/whatif/build.mjs`).
First episode: `episodes/wi-gta-nosleep/story.tsx` (use it as the template for the series).

## Palette (`NEON`)
bg `#020203` (pure black) | gold `#f5b942` (main line) | amber `#ffcf6e` (digits, highlights) | hot `#fff3d0` (core of
"hot" lines, faces) | coral `#ff7a59` (accent, warnings, picks) | red `#ff4d5e` (rare) | cyan `#5fe3ff` (HUD detail /
"not real" things only) | dim `#8a6a2e` and faint `#3a2c14` (background line art) | text `#fff1d6`, muted `#b89a66`.

## Look
- Everything is thin glowing line art on black. Glow = 2-3 stacked strokes (x5 width 7 %, x2.4 width 20 %, core) -
  `NeonPath`, `NeonText`. NO CSS blur/filters (CPU renders). Gradients only for Spotlight cone/pool, TV glow, vignette.
- Dotted/dashed light lines trace buildings, windows, floors (`dash="0 14"`, round caps); they travel (`travel=-f`).
- Soft spotlight cone from above (`Spotlight`), floating dust (`Particles`), glow ellipse under characters (`FloorGlow`).
- Characters (`NeonFigure`, `LOOKS`): black silhouettes with a glowing outline of the UNION of the body parts, simple
  round head, minimal neon eyes/mouth. Remy = hoodie (hood + drawstrings + pocket) + beanie with pom tuft (gold);
  extras: Mo cap (coral), June bun, Kit spiky hair, Randy (1964) flat-top + collar (warm white).
  Poses: stand, sit, play (controller via `prop`), slump, wave, point, shrug. Lying = rotate(-90) + `Blanket`.
  Expressions: neutral, happy, focused, tired (heavy lids + bags), dizzy (spinning spirals), shocked, sick, sleep.

## Components (kit.tsx)
Primitives: `NEON`, `NeonPath` (d, p draw-on, dash/travel, glow, hot), `NeonText` (tube = outline neon), `HudText`
(enter rise/scale/words/type/present + exit), `drawOn(f, at, d)`, `StrokeWord` (stroke font W H A T I F, draws on letter
by letter), `Stamp`, `Digits`. Stage: `Stage` (full-frame svg, cam, `hud` = screen-space layer), `Plane p` (parallax),
`camDrift`, `camKick`, `NeonDefs`, `Bake` (cache finished static line art with CachedSvg). Light: `Spotlight`,
`Particles`, `FloorGlow`. HUD: `LiveCounter` (top-left card 380x150 at 70,316: label, ticking digits + stamp, DAY tag,
live dot, `display` override), `CompareBars` (overshoot fill), `ChapterScreen` (brackets draw on, punch-in, light sweep,
`glitch`), `ChoiceCards` (2x2 A-D, pick highlight), `Phone` + `Notification`, `Bubble`, `Calendar30`.
Props: `Controller`, `TV`, `Couch` (part back/front so a sitter is between), `SnackPile` (items pop in), `Bed`,
`Blanket`, `Clock` (hours), `CarBack`, `Road` (perspective, traveling dashes, bend), `MissionMarker` (broken 0..1),
`RoomLines` (bare = floor only), `Skyline`, `Zzz`, `RepeatIcon`, `MoonIcon`.

## Motion rules (on top of brain/style-bible.md motion rules)
- Lines DRAW ON (EASE.arrive), never just appear; counters tick and stamp; bars fill with a back-ease overshoot;
  chapter screens punch in (scale 1.4 -> 1) with a light sweep; dotted lines travel; camera pushes slowly (EASE.camera).
- Frame 0 = the hook sting: "WHAT IF" already mid-draw, Remy lit, then counter + subtitle.
- HUD layout: counter card top-left (y 316-466) -> other text starts at y >= 540 in shots with a counter.
- Microsleep / blackouts: full black frames with all text hidden.
- Text only y 300-1350, x 60-960; never over line art or other text; crossfades (5 f, place changes) hide the HUD.

## Do / don't
- DO keep backgrounds pure black and the gold dominant; coral for the "twist" word, cyan only for unreal/HUD detail.
- DO bake static scenery (`Bake done`) once its draw-on is finished; no text or url(#gradient) inside a Bake.
- DON'T copy the reference channel's robot: no dark round head with cyan glowing VISOR eyes, no puffer vest, no
  robot parts. Our heads are black with thin line eyes; outfits are hoodies/caps/hair.
- DON'T use game art, logos or screenshots; "GTA 6" only as plain words. Real people (Randy Gardner) only as neon
  silhouettes, never photos.
- DON'T use CSS filters/blur or text below 30 px (it disappears at phone size).
