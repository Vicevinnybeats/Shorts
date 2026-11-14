# Style decisions

| Date | Decision | Why |
|---|---|---|
| 2026-11-13 | Look engine = the skill's `templates/bridge` (ink pass, lens blur, grade, toon cards, painted textures), fetched fresh each run | Owner's choice of visual style; repo stays small |
| 2026-11-13 | Captions: Montserrat 900 (bundled, OFL), uppercase, 1-3 word phrases, active word yellow #ffd93b, white text, 14 px dark outline, at 66 % height | Owner wants bold captions readable on a phone; skill's own rule "no captions" does NOT apply to this channel |
| 2026-11-13 | Narrator engine: Kokoro (Apache-2.0). Voice: pending owner pick from health/voice/ (am_michael, bm_george, am_fenrir, af_heart) | VoiceStudio's OmniVoice model is non-commercial; Kokoro is free for commercial use and fast on CPU |
| 2026-11-14 | Render budget profile: 3D buffer 540x960 (dpr 0.5) stretched to 1080x1920, captions full-res page text; ink pass on; lens blur = one 28-tap gather fed by the ink pass depth (no MSAA); bloom off by default; shadow map 1024 | Full skill look measured 46 s/frame; budget profile 5.8 s/frame (4 CPUs) - fits the free minutes |
| 2026-11-14 | Captions at 76 % height, wrap to two lines, 78-108 px | Clear of the subject and of the YouTube/IG buttons |
| 2026-11-14 | Push-in = lens narrowing (creep), never camera travel | Camera travel toward a far look point flew through the subject |
| 2026-11-14 | First episode: Tiny World "The Sugar Road" (ant-kitchen), narrator Kokoro am_michael (owner has not picked a voice yet) | Owner asked for one video to see the look |
| 2026-11-14 | 2.5D engine (src/engine25): DOM/SVG depth layers + parallax camera (snap zoom, pans, push-ins, whip, pull-out, impact kick), overlay lighting (grade, floodlight beams, key-light pool, vignette, flash), speed lines instead of motion blur | 0.49 s/frame at 1080x1920 on 4 CPUs (vs 5.8 s budget 3D, 46 s full 3D); owner wants fast renders and better camera/light |
| 2026-11-14 | 2.5D characters (library/characters25): skill-style bean heads, plum ink, stick limbs; front-view poses symmetric, profile flag for runs/dives; crowd from simplified figures with distance fade | Skill look adapted to 2.5D |
| 2026-11-14 | 2.5D speed rules: crowd drawn once per pose into a cached image (CrowdImg); lighting overlays without CSS blend modes; render with --concurrency=2 and 6 chunks for 2.5D | First 2.5D render ran 2.2-3 s/frame on the 2-CPU runner (0.49 locally) |
| 2026-11-14 | Animation polish: breathing + arm sway on idle characters, run cycle with knee lift + arm pump + body bob, kick wind-up, diving arcs with 2 ghost trail copies + grass burst, squash on catch, 7-frame crossfade only where the place changes, captions at 80 % height | Owner: "make good animations" |
