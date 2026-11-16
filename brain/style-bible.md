# Style bible - TheLittleEpic (keep every video identical in look and sound)

Owner request 2026-11-15: "remember the textures and the faces ... to make those videos always identical with the
same voice". Code source of truth: `library/style/channel.ts` (new episodes import from it).

## Voice
- Kokoro TTS (free, Apache-2.0), voice **am_michael**, speed 1.0, every video. Set in render-final
  (`NARRATOR_VOICE`, default am_michael) and in `library/style/channel.ts` VOICE. Never change per episode.
- Mix: voice-first (see channel-rules.md sound rule), -14 LUFS, -1 dBTP, no bed in the first 3 s.

## Faces and bodies (characters25/Person - the only character rig)
- Bean-shaped head, plum ink outline `#241726` (INK), dot eyes with white catch-light, simple brows, line mouth.
- Expressions: neutral, calm, smile, laugh, smirk, worried, shock, focused, determined, cheer. No other face styles.
- Stick limbs with rounded ends, two-tone top (jersey + jersey2 shading), breathing + arm sway on idle (`t` prop).
- Hair styles: short, buzz, curly, bun, none. Skin/hair from the swatches in channel.ts (SKIN, HAIR).
- Leads so far are in CAST (Leo keeper, Maya, Sam, Zoe, Leo kitchen, Ava); extras from EXTRAS.
- Front view for talking/standing (symmetric poses), profile only for runs/dives/kicks.

## Textures and drawing
- Flat vector shapes with thick ink outlines (6-10 px at 1080 wide), no gradients on characters.
- Backgrounds: static walls/shelves/streets drawn once into cached images (CachedSvg) - tile lines, panel seams,
  window skylines, product rows; parallax layers p 0.2-0.6 behind, subject at p 1.
- Lighting = overlays only (no blend modes): Grade per mood, Pool key light, vignette, flash on impacts, speed lines.
- Explanation shots: the LAB look (navy #121a36, faint grid, soft spotlight, cream/gold/red/green text and icons).
- Every explanation shot gets its own picture; never repeat a diagram in one video.

## Text and captions
- Captions: Montserrat 900 uppercase, white + active word yellow #ffd93b, at 80 % height, 1-3 words.
- On-screen text: CaptionSans 900, only between y 300 and y 1350 (top 300 px is covered by the phone UI and can be cut off by camera zoom) and inside 60 px side margins; split long lines.
- Never put text over animation or over other text; nobody stands in the caption band in wide shots.

## Settings used so far (each new video gets a new setting in the same style)
| Episode | Setting | Library file |
|---|---|---|
| goalkeeper-still | night stadium | environments25/stadium.tsx |
| slow-queue | bright supermarket | environments25/supermarket.tsx |
| coin-flip | warm night kitchen | environments25/kitchen.tsx |
| lift-button | morning office lobby + lift, city street | environments25/office.tsx |
| tickle | evening living room | environments25/livingroom.tsx |
| toast | bright morning cafe | environments25/cafe.tsx |
| pole | sunny town square | environments25/square.tsx |
| silent | cosy game night | environments25/gamenight.tsx |

## Motion rules (adopted 2026-11-16 from motion-director, github.com/sharbelxyz/motion-director, MIT)
Code: `src/engine25/motion.tsx` (EASE, arrive/leave/camMove, stagger, Label, countValue/stampScale, SAFE_TEXT).
Check: `scripts/motion-check.mjs <video>` (runs in render-final QA; also run it on stills-era previews).
- Eases by role: arrivals land on a long tail (EASE.arrive), exits ~45 % shorter and accelerate out (EASE.exit),
  camera moves ease both ways (EASE.camera); linear only for spinning/progress.
- Every on-screen label has a deliberate entrance AND exit (Label enter="rise|scale|words|present"); vary entrances
  inside a video; a landed label is dead still (no pulse/wobble on text; characters keep breathing/blinking).
- Overlap: the next element starts when the previous is 30-50 % done (stagger); words 60-120 ms apart.
- Nothing holds still for more than ~3 s: if a shot is long, give it a second beat (a change in a big part of the frame).
- Frame 0 is the hook: something meaningful on screen at frame 0, never empty.
- One idea per frame: when the idea changes, prefer a cut over a crossfade (we keep 5-frame crossfades only on place
  changes, with labels hidden).
- Counters start at the first real value, fill well inside their beat, STOP and get a small stamp pop; every number
  on screen has a source.
- No zoom for its own sake: a push follows a specific element and must not push labels out of the safe box
  (SAFE_TEXT: y 300-1350, 60 px left, 120 px right for the like/comment rail).
- Transitions have a cause when possible (whip, object carries into the next shot, iris from an action).

### First measurement (2026-11-16, picture holds over 3 s, captions band excluded)
goalkeeper-still: 3.7 s at 9.7 s, 6.0 s at 51.3 s, 6.2 s at 57.6 s | lift-button: 5.8 s at 40.4 s |
coin-flip: 3.1 s at 43.8 s | slow-queue, tickle, toast, pole, silent: none.
