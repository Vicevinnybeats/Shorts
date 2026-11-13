# Health check

| Area | Result |
|---|---|
| Remotion + three.js + skill look engine | ⏭️ skipped |
| Kokoro TTS (CPU) + word timings | ✅ success |
| VoiceStudio (Docker, CPU) | ✅ success |
| Skill synth audio + ducking + loudness | ✅ success |
| Google Drive (rclone) | ✅ success |

## Render
```

```
- Simple 3D scene + captions, 1080x1920: no result
- Skill look engine, 540x960 (half): no result

## Voice
- Kokoro `af_heart`: 45.02 s of speech in 57.2 s compute, 145 timed words
- Kokoro `am_fenrir`: 38.12 s of speech in 48.5 s compute, 145 timed words
- Kokoro `am_michael`: 49.67 s of speech in 62.5 s compute, 145 timed words
- Kokoro `bm_george`: 45.52 s of speech in 58.8 s compute, 145 timed words
- faster-whisper word alignment: 9 s
- VoiceStudio: pull 210 s, start 14 s, generate 6 s, HTTP 403

## Audio mix
- {'duration_s': 50.275, 'integrated_lufs': -14.03, 'true_peak_dbtp': -1.0, 'lra_lu': 9.7, 'voice_lufs_pre': -24.57, 'sfx_events': 3}

## Drive
```
::notice::Google Drive is not configured yet (no secrets): skipping 'init'.
```
