# Shorts

Automated, free-only pipeline for 55-70 s vertical (1080x1920) 3D animated story shorts for one YouTube + Instagram
channel. All heavy work (Remotion + three.js rendering, voice, audio, ffmpeg) runs on GitHub Actions. Every video is
reviewed by the owner on their phone before anything is published.

| Path | What |
|---|---|
| `src/` | Remotion project: compositions, captions, health scene. `src/vendor/` is fetched at run time (gitignored). |
| `library/` | Reusable characters, environments, props, textures, camera moves, lighting, audio moods (Phase 1) |
| `episodes/<id>/` | `episode.json`, `script.txt`, `story.ts`, `sound.json`, `metadata.json`, `stills/` |
| `brain/` | Project memory: rules, topics, parts, feedback, performance, render log |
| `pipeline/` | Voice (Kokoro / VoiceStudio + word timings), audio mix, logging, reports |
| `scripts/` | Skill fetch, CC0 asset fetch, stills/bench renderers, Drive (rclone), commit helper |
| `.github/workflows/` | `health-check`, `render-stills`, `render-final` |

## Workflows (start them from the GitHub app: Actions -> workflow -> Run workflow)
- **health-check**: verifies every tool, benchmarks render speed, makes narrator samples, tests the mix and Drive.
- **render-stills** (`episode`): key stills -> `episodes/<id>/stills/` (small JPGs) + Drive `/Shorts/Review/<id>/stills`.
  Also runs on every push that changes an episode.
- **render-final** (`episode`): voice -> music + SFX -> mix -> chunked Remotion render with captions -> mux -> QA ->
  MP4 + metadata JSON to Drive `/Shorts/Review/<id>/`. Also runs when `episodes/<id>/GO_FINAL` is pushed (only after
  the owner says "go"). Never publishes.

## Visual style
Techniques come from [mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) (MIT), cloned
fresh on every run by `scripts/fetch-skill.sh` and never committed. Only its look and sound techniques are used; stories,
characters and topics are this channel's own. 3D props: Kenney CC0 kits, downloaded and cached by the workflow.

Secrets: see `docs/SETUP-SECRETS.md`.
