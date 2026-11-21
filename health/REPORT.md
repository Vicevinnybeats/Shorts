# Health check

| Area | Result |
|---|---|
| Remotion + three.js + skill look engine | ✅ success |
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
- **Simple 3D scene + captions, 1080x1920**: 1.23 s/frame on 4 CPUs (first frame 4.036 s) -> about **41 runner-minutes** for a 67 s short (2,000 frames)
- **Skill look engine, 540x960 (half)**: 51.97 s/frame on 4 CPUs (first frame 115.52 s) -> about **1732 runner-minutes** for a 67 s short (2,000 frames)

## Voice
- Kokoro `af_heart`: 45.5 s of speech in 27.6 s compute, 145 timed words
- Kokoro `am_fenrir`: 44.25 s of speech in 27.0 s compute, 145 timed words
- Kokoro `am_michael`: 49.9 s of speech in 32.1 s compute, 145 timed words
- Kokoro `bm_george`: 55.56 s of speech in 32.5 s compute, 145 timed words
- faster-whisper word alignment: 7 s
- VoiceStudio: pull 156 s, start 11 s, generate 4 s, HTTP 403

## Audio mix
- {'voice_over_rest_lu': 12.7, 'duration_s': 50.501, 'integrated_lufs': -14.05, 'true_peak_dbtp': -1.0, 'lra_lu': 1.59, 'voice_lufs_pre': -23.88, 'sfx_events': 3}

## Drive
```
::notice::Google Drive is not configured yet (no secrets): skipping 'init'.
```
