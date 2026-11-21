# Health check

| Area | Result |
|---|---|
| Remotion + three.js + skill look engine | ⛔ cancelled |
| Kokoro TTS (CPU) + word timings | ✅ success |
| VoiceStudio (Docker, CPU) | ✅ success |
| Skill synth audio + ducking + loudness | ✅ success |
| Google Drive (rclone) | ✅ success |

## Render
```
node v22.23.5
remotion 4.0.290
three 
skill e3b817b6afc6cd413466d43f11ba31209e034bbf
cpus 4
Mem:              15           1          12           0           2          14
kenney models 0
```
- **Simple 3D scene + captions, 1080x1920**: 1.37 s/frame on 4 CPUs (first frame 4.233 s) -> about **46 runner-minutes** for a 67 s short (2,000 frames)
- Skill look engine, 540x960 (half): no result

## Voice
- Kokoro `af_heart`: 45.5 s of speech in 28.3 s compute, 145 timed words
- Kokoro `am_fenrir`: 44.25 s of speech in 27.6 s compute, 145 timed words
- Kokoro `am_michael`: 49.85 s of speech in 32.7 s compute, 145 timed words
- Kokoro `bm_george`: 55.54 s of speech in 33.3 s compute, 145 timed words
- faster-whisper word alignment: 25 s
- VoiceStudio: pull 135 s, start 13 s, generate 6 s, HTTP 403

## Audio mix
- {'voice_over_rest_lu': 12.7, 'duration_s': 50.45, 'integrated_lufs': -14.04, 'true_peak_dbtp': -1.0, 'lra_lu': 1.61, 'voice_lufs_pre': -23.88, 'sfx_events': 3}

## Drive
```
::notice::Google Drive is not configured yet (no secrets): skipping 'init'.
```
