# Standard builder brief (What If / Imagine videos) - read this fully before building
You are the ONE builder for one episode (given in your task). You work in your own git worktree:
`git fetch origin claude/determined-feynman-hahwfr && git checkout -B wt-<episode> origin/claude/determined-feynman-hahwfr`;
publish with `git pull --rebase origin claude/determined-feynman-hahwfr && git push origin HEAD:claude/determined-feynman-hahwfr`.
Other builders may run in parallel: never edit other episodes; prefer new files over editing shared library files
(shared changes additive only). Free tools only; never publish/upload; never create/edit GO_FINAL; never touch voice
code or workflows; script.txt + RESEARCH.md of your episode are final (fact-checked) - do not change them. No sub-agents.
If you hit a usage limit, commit+push WIP first.
READ: CLAUDE.md; brain/HANDOFF.md; bottom ~110 lines of brain/channel-rules.md; brain/motion-design.md;
library/skills/motion-design/references/style-rules.md + pitfalls.md; brain/stick3d/README.md (Blender objects table);
your episode's script.txt + RESEARCH.md. Ask the map first: `mybrain query "<question>"`.
REFERENCE (approved): episodes/wi-gta-money, wi-gta-healing, wi-gta-physics (episode.json, sound.json, metadata.json,
story.tsx) + library/stick3d/daylight.tsx + library/stick3d/water.tsx. Match their quality/conventions: bright daylight
big 3D worlds, Remy (REMY3D + beanie), Golden Neon only for HUD, warm sun + soft fill, drop/blob shadows, per-line shots
with hard cuts, shape-morph on every place change, HUD text word-by-word blur-to-sharp, subject centred, one
non-reversing NAMED camera move per shot (pull back, dolly zoom, crane + land, push-in, orbit, tracking, low hero
angle, top-down), varied, named in a comment.
NO DOUBLE TEXT (most common mistake): on-screen words must never repeat what the caption says at that moment. Numbers
+ units as HUD are fine; labels/stamps with the same words as the narration are NOT. Check every still for this.
CREATE episodes/<ep>/{episode.json (composition "Ep-<ep>", stick3d-bright, gl swangle, chunks 6, clone none,
publish false, stills), sound.json, metadata.json (sources from RESEARCH.md, "Remy is fictional. Not affiliated with
Rockstar Games or Take-Two. No game footage, art or logos are used." where GTA is named, "Narration: AI voice (Google
AI Studio, Gemini TTS).", AI disclosure, contains_synthetic_media false, test true, tags, Instagram caption), story.tsx}.
Voice = Gemini Algieba (~2.3-2.6 words/s), stay cue-driven. End with an A-D question card (letters + short answers).
Reuse library/models/*.glb; new bpy models under blender/models/ (headless workflow builds them on push; poll
`git fetch` until the .glb appear, max ~25 min; check previews; add rows to the README table).
CHECK (max 2 fix rounds): typecheck; stills at half scale --gl=swangle (every shot + mid-morph) - setup may need
`npm ci`, `bash scripts/fetch-skill.sh`, `node scripts/gen-registry.mjs`; Chromium /opt/pw-browsers/chromium; LOOK at
every still; contact sheet library/previews/whatif/<ep>-stick3d.png; note in brain/render-log.md (not HANDOFF);
commit (trailer below) + push.
Trailer:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019RediFF51hqccXe4quizri
REPORT (short): shot list with camera moves, new models, stills checked, open issues, last commit hash.
