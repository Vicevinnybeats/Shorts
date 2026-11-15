# Performance

| Episode | Platform | Published | Views 48 h | Avg view % | Likes | Comments | Notes |
|---|---|---|---|---|---|---|---|

## 2026-11-15: GL mode is the bottleneck for 2.5D
- Benchmark (tickle, 60 frames, scale 1, pinned to 2 CPUs like the runner): --gl=swangle 0.72-0.80 s/frame;
  --gl=swiftshader 0.10-0.14 s/frame; --gl=angle 0.11-0.14 s/frame. Same picture (PSNR 40-44 dB = JPEG noise).
- swangle forced WebGL-style GPU emulation for flat SVG pages; 2.5D episodes now render with swiftshader (default in
  render-final, render-stills, bench-render); 3D episodes set "gl": "swangle" in episode.json (ant-kitchen).
- Chunk default 6 -> 3: per-job setup (~1 min + whole-minute rounding) dominates once frames are fast.
  Expected per video: ~25-35 runner minutes (was ~110-120), ~12-15 min waiting (was ~30).
