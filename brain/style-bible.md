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
- On-screen text: CaptionSans 900, only above y 1350 and inside 60 px side margins; split long lines.
- Never put text over animation or over other text; nobody stands in the caption band in wide shots.

## Settings used so far (each new video gets a new setting in the same style)
| Episode | Setting | Library file |
|---|---|---|
| goalkeeper-still | night stadium | environments25/stadium.tsx |
| slow-queue | bright supermarket | environments25/supermarket.tsx |
| coin-flip | warm night kitchen | environments25/kitchen.tsx |
| lift-button | morning office lobby + lift, city street | environments25/office.tsx |
