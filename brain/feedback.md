# Owner feedback

| Date | Episode / stage | Feedback | What we changed |
|---|---|---|---|
| 2026-11-14 | ant-kitchen test video | Cuts are good. Wants better camera moves and lighting, much faster rendering, one channel with one theme ("Why the Second Draw Always Wins" style, not history), 2.5D, diverse hooky titles, no Zapier yet, show videos in the chat | Switched to one theme + 2.5D; new title list; Zapier paused |
| 2026-11-14 | goalkeeper-still v2 | Crowd noise hides the voice at the start; keep that in mind for every clip | Mixer: beds levelled vs voice (-16 LU) + ducked -10 dB on words, hits <= voice -4 LU, no beds in the first 3 s; hook crowd removed; remix-audio workflow |

## Episode 2 remake feedback (standing rules)
- No on-screen text may overlap animation, other text or the captions: keep board/diagram text above y≈1350 and inside the frame width; split long lines.
- Never repeat the same visual across consecutive shots (e.g. the old dot diagrams in slow/snake/fair). Each shot gets its own image.
- No character's feet/body sits in the caption band in wide shots; lanes/rows end above it.
- Avoid abstract "dots" for people: show the characters themselves.

## 2026-11-16 owner rejected "Why You Always Pick the Slow Queue" (video 2)
- "I don't like it": removed from Drive, to be replaced by another video (not started until the owner says so).

## 2026-11-17 owner: "Make just 3 stories about GTA 6 in the same style but don't make the video yet"
- Scripts only (gta-countdown, gta-delay, gta-download). Same theme: everyday moment + science rule, our own cast.
- IP: no Rockstar logo, game footage, characters or map; the game is only named in words. Metadata will say "not affiliated with Rockstar Games".

## 2026-11-18 owner: GTA 6 will be out when the limit resets -> 3 other (post-launch) stories, verified info
- New scripts: gta-allnighter, gta-minimap, gta-hype (work after launch). Pre-launch scripts kept, marked outdated.
- After launch: re-check verified launch facts (official sales/records from Take-Two/Rockstar, not rumours) before building.

## 2026-11-20 scheduled post-launch fact check (GTA 6)
- Verified: Metacritic 99 (ties highest ever). Not verified: sales (only Sensor Tower estimates; Take-Two gave no figure yet).
- All 3 post-launch scripts still accurate. Suggested addition to gta-hype: the 99 Metacritic line. Re-check sales after Take-Two reports.

## 2026-11-21 owner on What If 1: "some animations are wrong" + "the voice pauses too much, should be natural" (REMEMBER)
Problems found in wi-gta-nosleep (never repeat them):
1. Typewriter labels held half-typed ("LAUNCH NIG", "PLAY · SLEEP · REPEA") -> labels finish in <=0.35 s, no cut words on held frames.
2. Choice cards shown half-built at the start AND at the end -> once, at the end, fully built fast.
3. Character close-ups ran behind the captions -> bodies always above y 1430.
4. Empty black frames with tiny HUD -> bigger counters/bars, fill y 300-1350, add environment.
5. Chapter screens overlapping subtitles/counter -> clear spacing, hide counter during chapters.
6. Leftover glitch grid over the next beat (microsleep eyes) -> clean transitions.
7. End text repeating the narration word for word -> on-screen text 2-4 words.
Voice: pipeline/voice/kokoro_tts.py now reads lines as flowing paragraphs, trims chunk silences, 0.16 s breath gap.
Kit fixes + rules live in library/whatif and brain/style-whatif.md ("Motion fixes 2026-11-21").
