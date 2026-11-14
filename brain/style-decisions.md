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
