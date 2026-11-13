# Style decisions

| Date | Decision | Why |
|---|---|---|
| 2026-11-13 | Look engine = the skill's `templates/bridge` (ink pass, lens blur, grade, toon cards, painted textures), fetched fresh each run | Owner's choice of visual style; repo stays small |
| 2026-11-13 | Captions: Montserrat 900 (bundled, OFL), uppercase, 1-3 word phrases, active word yellow #ffd93b, white text, 14 px dark outline, at 66 % height | Owner wants bold captions readable on a phone; skill's own rule "no captions" does NOT apply to this channel |
| 2026-11-13 | Narrator engine: Kokoro (Apache-2.0). Voice: pending owner pick from health/voice/ (am_michael, bm_george, am_fenrir, af_heart) | VoiceStudio's OmniVoice model is non-commercial; Kokoro is free for commercial use and fast on CPU |
