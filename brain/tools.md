# Tools

| Area | Choice | Status (2026-11-13) |
|---|---|---|
| Renderer | Remotion 4.0.290 + @remotion/three, three 0.175, CPU WebGL (SwiftShader / `--gl=swangle`) | Works on runners. Simple 3D still at 540x960 ~3 s. |
| Look engine | mromidev/claude-animated-shorts `templates/bridge`, cloned fresh each run (`scripts/fetch-skill.sh`) | Renders on the runner, but costs **66.9 s/frame at half resolution on the 2-CPU private runner** (~2,230 runner-minutes per 67 s short). Too slow for free minutes as-is. |
| 3D props | Kenney CC0 kits | kenney.nl refuses automated downloads (403). Not bypassed. Skill world renders without them; Phase 1 makes our own props. |
| Memory | `/brain` markdown | MyBrain needs a paid OpenRouter key + PostgreSQL: not used. |
| Voice | **Kokoro 82M (Apache-2.0)**, CPU, per-word timestamps | Chosen narrator engine. On the runner: 145 words -> 38-50 s of speech in 48-63 s compute. Candidates am_michael, bm_george, am_fenrir, af_heart in `health/voice/` - owner picks one. |
| Voice (alt) | VoiceStudio Docker CPU (OmniVoice) | **Rejected.** Runs on CPU, but its default model OmniVoice is CC-BY-NC (non-commercial) + Llama 3 licence and the API refuses until the licence is accepted. A monetized channel is commercial use, so we do not accept it. Image is 18 GB (3.5 min pull). |
| Word timings | Kokoro tokens; faster-whisper `base.en` cross-check; script spelling mapped back (`pipeline/voice/wordmap.py`) | Works on runner (alignment 9 s). |
| Audio | Skill `dsp/instruments/sfx_gen` + `pipeline/audio/mixdown.py`: ducking -3 dB under words, music ~-10 LU, SFX -6 dB, -14 LUFS, -1 dBTP | Works on runner: real narration mix -14.03 LUFS, -1.0 dBTP, 16 s. |
| Captions | `src/captions/Captions.tsx`, bundled Montserrat 900 | Works. |
| Storage | Google Drive via rclone; config built from 3 secrets | Waiting for secrets (docs/SETUP-SECRETS.md). |
| HyperFrames | Optional; not needed so far (Remotion does captions/overlays) | Not installed. |

## Render cost on the free private runner (2 CPUs), measured 2026-11-13
| Scene | Resolution | s/frame | Runner-minutes for a 67 s short (2,000 frames) |
|---|---|---|---|
| Skill look engine (bridge demo: 74 cards, 4096 shadows, ink + lens blur + bloom) | 540x960 | 66.9 | ~2,230 |
| Trivial 3D object + captions (pipeline test) | 1080x1920 | ~3.8 (1,506 frames = 95 min over 4 jobs) | ~125 |
render-final `_pipeline-test`: voice 74 s, mix 16 s, 4 parallel chunks 20-28 min each, assemble 1 min. End to end OK.
