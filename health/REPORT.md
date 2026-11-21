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
- **Simple 3D scene + captions, 1080x1920**: 1.24 s/frame on 4 CPUs (first frame 4.047 s) -> about **41 runner-minutes** for a 67 s short (2,000 frames)
- **Skill look engine, 540x960 (half)**: 56.42 s/frame on 4 CPUs (first frame 116.536 s) -> about **1881 runner-minutes** for a 67 s short (2,000 frames)

## Voice
- Kokoro `af_heart`: 45.5 s of speech in 18.6 s compute, 145 timed words
- Kokoro `am_fenrir`: 44.22 s of speech in 18.1 s compute, 145 timed words
- Kokoro `am_michael`: 49.85 s of speech in 21.2 s compute, 145 timed words
- Kokoro `bm_george`: 55.57 s of speech in 21.6 s compute, 145 timed words
- faster-whisper word alignment: 7 s
- VoiceStudio: pull 106 s, start 8 s, generate 6 s, HTTP 403

## Audio mix
- {'voice_over_rest_lu': 12.7, 'duration_s': 50.449, 'integrated_lufs': -14.04, 'true_peak_dbtp': -1.0, 'lra_lu': 1.61, 'voice_lufs_pre': -23.88, 'sfx_events': 3}

## Drive
```
::notice::Google Drive is not configured yet (no secrets): skipping 'init'.
```
