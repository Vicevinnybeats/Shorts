# Tools

| Area | Choice | Status (2026-11-13) |
|---|---|---|
| Renderer | Remotion 4.0.290 + @remotion/three, three 0.175, CPU WebGL (SwiftShader / `--gl=swangle`) | Works on runners. Simple 3D still at 540x960 ~3 s. |
| Look engine | mromidev/claude-animated-shorts `templates/bridge`, cloned fresh each run (`scripts/fetch-skill.sh`) | Renders on the runner, but costs **66.9 s/frame at half resolution on the 2-CPU private runner** (~2,230 runner-minutes per 67 s short). Too slow for free minutes as-is. |
| 3D props | Kenney CC0 kits | kenney.nl refuses automated downloads (403). Not bypassed. Skill world renders without them; Phase 1 makes our own props. |
| Memory | `/brain` markdown | MyBrain needs a paid OpenRouter key + PostgreSQL: not used. |
| Voice | Kokoro 82M (CPU) with per-word timestamps | Works on runners: full 145-word narration incl. model download ~74 s. |
| Voice (alt) | VoiceStudio Docker CPU (OmniVoice) | Tested by health-check (10-minute limit). |
| Word timings | Kokoro tokens; faster-whisper `base.en` for other engines; script spelling mapped back (`pipeline/voice/wordmap.py`) | Tested locally. |
| Audio | Skill `dsp/instruments/sfx_gen` + `pipeline/audio/mixdown.py`: ducking -3 dB under words, music ~-10 LU, SFX -6 dB, -14 LUFS, -1 dBTP | Mix 16 s on runner. |
| Captions | `src/captions/Captions.tsx`, bundled Montserrat 900 | Works. |
| Storage | Google Drive via rclone; config built from 3 secrets | Waiting for secrets (docs/SETUP-SECRETS.md). |
| HyperFrames | Optional; not needed so far (Remotion does captions/overlays) | Not installed. |
