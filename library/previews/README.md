# Reusable look library (textures, sets, faces)

Everything in TheLittleEpic videos is drawn in code, so the "textures" ARE the files in `library/`. Reuse them by
importing the same components and CAST keys: same faces, outfits, colours and sets in every video.

| What | Where (code) | Preview |
|---|---|---|
| Faces + outfits of every character (CAST keys) | `library/style/channel.ts` -> `CAST`, `SKIN`, `HAIR` | `cast.jpg` (rebuild: `cast-sheet.tsx`) |
| Character rig (body, poses, expressions) | `library/characters25/person.tsx` | `cast.jpg` |
| Channel colours, caption + safe-area rules | `library/style/channel.ts` (`LAB`, `CAPTIONS`, `SAFE`) | - |
| Lab / explainer board | `library/environments25/lab.tsx` | `sets/*.jpg` (middle frames) |
| Cafe, living room, square/park, game night, market, auction, kitchen, office/lift, stadium, supermarket, pizzeria | `library/environments25/*.tsx` | `sets/<episode>.jpg` (3 frames from each finished video) |
| Army office, gym, sunrise park, pass/contract/calendar props | `library/environments25/army.tsx` | `army/*.png` |
| Narration voice | Kokoro `am_michael` (`VOICE` in channel.ts) | - |
| Motion rules (eases, labels, counters) | `src/engine25/motion.tsx` | - |
| WHAT IF "Golden Neon" kit (HUD, props) + characters (Remy, Mo, June, Kit, Randy; poses, expressions) | `library/whatif/kit.tsx`, `figure.tsx` | `whatif/kit.png`, `whatif/characters.png` |

Episode -> set map: tickle (livingroom), toast (cafe), pole (square), silent (gamenight), first-offer (market),
winner (auction), lift-button (office), coin-flip (kitchen), goalkeeper-still (stadium), gta-army (army), pizza (pizzeria, WIP).
Full prop/API list: `brain/asset-index.md`. Style rules: `brain/style-bible.md`.
