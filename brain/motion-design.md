# Motion Design skill (owner's, added 2026-11-22) - how we use it for the Shorts
Source (unchanged): library/skills/motion-design/ (SKILL.md, references/style-rules.md, pitfalls.md, engine-3d.md,
sound-and-music.md, scripts, templates). It was written for 8-20 s SaaS/brand ads rendered as 4K HTML pages; we do NOT
use its chat workflow or its HTML engine. We use its RULES inside our Remotion + Stick3D pipeline (1080x1920, captions,
render-final on GitHub). Read references/style-rules.md + pitfalls.md before building or fixing any video.

## Rules we adopt (apply to every video, with the owner's own rules first)
- Shot changes: hard cuts on beats are fine (owner wants real cuts). Every PLACE change / big transition is a SHAPE
  MORPH, never a cross dissolve: the outgoing key object (counter card, TV screen, map, phone, clock face) grows to fill
  the frame, floods with the next shot's background colour, next shot eases in 93% -> 100%; ~8% squash anticipation first.
- Subject DEAD CENTRE (invisible crosshair); leave room for HUD (top) and captions (bottom).
- Something ALWAYS moves (slow push/drift at least). Direction never reverses inside a move; one continuous curve per move.
- Fast first, then slow for longer; first drafts are too fast - give holds room.
- Text (HUD labels, titles): word by word, each word fades up from blurred to sharp with a small rise, 0.06-0.09 s
  stagger, leaves the same way; no bounces, no scale pops, no hard reveal edge. Sentence case, short lines.
  (Still obey NO DOUBLE TEXT: on-screen text never repeats the caption at the same moment.)
- Light from ONE main source (sun/key) + soft fill; shallow depth of field (background softly out of focus) if cheap.
- Small celebratory details on payoff beats (tick stamps on, glow flash, light sweep) - no lens flares, light leaks,
  2010 drop shadows, glows on everything.
- Every example in the series should feel different (camera grammar, look), not the same move again.
- Claims: everything on screen true and sourced (already our rule).
