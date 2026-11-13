# Health check

| Area | Result |
|---|---|
| Remotion + three.js + skill look engine | ⏭️ skipped |
| Kokoro TTS (CPU) + word timings | ❌ failure |
| VoiceStudio (Docker, CPU) | ✅ success |
| Skill synth audio + ducking + loudness | ⏭️ skipped |
| Google Drive (rclone) | ✅ success |

## Render
```

```
- Simple 3D scene + captions, 1080x1920: no result
- Skill look engine, 540x960 (half): no result

## Voice
- VoiceStudio: pull 158 s, start 14 s, generate 8 s, HTTP 403

## Audio mix
- no result

## Drive
```
::notice::Google Drive is not configured yet (no secrets): skipping 'init'.
```
