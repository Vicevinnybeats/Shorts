# Channel rules

## Hard rules (from the owner)
- Free only. Never sign up for, enable or suggest anything paid. If a step would cost money: stop and ask.
- The owner works only from Claude on phone/desktop. All heavy work runs on GitHub Actions.
- Work in phases; stop after each one and wait for "go".
- Never publish, upload to YouTube/Instagram or send anything without explicit approval.
- No credentials in the repo. GitHub Actions secrets only.

## Identity
- Channel name: **TheLittleEpic** (YouTube, Instagram, Gmail/Drive). Same name everywhere.
- Instagram must be a Professional account linked to a Facebook Page (needed for automatic Reel publishing).

## Sound rule (owner feedback 2026-11-14: "I don't hear any voice at the start")
- The narration is always clearly on top: background beds (crowd, breeze, murmur) are levelled 16+ LU under the voice
  and dip a further 10 dB on every word; hits (kicks, whooshes) peak at least 4 LU under the voice.
- No background bed in the first 3 seconds: the hook is voice first. Enforced in pipeline/audio/mixdown.py for every video.

## Format
- One channel, YouTube Shorts + Instagram Reels. 55-70 s, 9:16, 1080x1920, 30 fps.
- Same narrator, same visual style, same short intro sting on every video. Each series has its own look.
- Bold word-by-word captions, readable on a phone.
- English.

## Channel theme (decided 2026-11-14, replaces the five series below and the 'What If' series)
ONE theme for the whole channel: a tense everyday moment or face-off, decided by a surprising rule of science or
psychology (the "Why the Second Draw Always Wins" kind of video, but NOT history). Varied, hooky titles.
Style: 2.5D (flat illustrated layers + parallax camera, plain Remotion, no WebGL except rare special shots).
Format: paradox hook in 2 s -> face-off/tension -> "wait, why?" -> the real rule via an everyday comparison -> ironic
twist -> a last-line question. Every fact verified; drop a title if the science does not hold up.
No Zapier/auto-upload until the owner says so. Show test videos in the chat.

## Five rotating series (retired 2026-11-14, kept for reference)
1. **Tiny World**: cinematic stories at insect/drop/seed/crumb scale, real nature facts.
2. **Made of Time**: one place or object across decades; fixed or slow camera, time passing around it.
3. **Inside Out**: the camera flies where humans can't go. Educational, accurate, stunning.
4. **Alternate Earth**: real history with one change, on a living 3D globe and in the streets. Always say clearly what really happened vs. what is imagined.
5. **Animals Explain Humans**: reversed nature-documentary voice; an animal narrates humans. Funny.

## Script formula
- 55-70 s, ~140-170 words.
- 0-2 s hook that stops the scroll: a specific number, a surprising statement, or a "Day 1" opening.
- Arc: setup -> problem -> turn -> emotional or funny payoff.
- At least one real, checkable fact per video (except pure-comedy Series 5). Verify every fact with a web search, list sources in metadata. Never invent statistics.
- Last line: a question that makes people comment.
- Big stories become Part 1/2/3; Part 1 ends on a cliffhanger. Track in `series-parts.md`.

## Anti-template rule (YouTube inauthentic-content policy)
Every video has its own story, scenes, camera plan and shot timing. Never swap nouns in the same script.
Vary shot count, pacing, lighting, locations and characters. If two videos would look nearly the same, redo one.

## Animation skill (mromidev/claude-animated-shorts)
Used ONLY for visual and audio technique: 2D characters in a 3D world, ink outlines, painted environments, lens blur,
gliding camera, lighting, shadows, textures, grade, shot pacing, synth SFX/music, mix (ducking + loudness).
Never reuse its story, topic, characters, script or themes (no bridges/soldiers story, no reference-channel material).
Its reference frames are private study material: never upload, publish or send them.

## Workflow per video
topic -> facts + script -> STOP for script approval -> story.ts shot plan -> render-stills -> look fixes ->
STOP for stills approval -> render-final -> metadata -> Drive /Shorts/Review -> record in brain.

## Team workflow (owner, 2026-11-15)
- All agents (script-writer, asset-library, scene-builder, voice-captions, then qa-reviewer) work together, at the
  same time, on ONE video. Make only one video, then stop and wait until the owner says to make the next one.
- Same channel theme for every video (everyday face-off decided by a surprising science rule), same style bible.
- Upload schedule: DAILY (owner, 2026-11-17). Bios say 'every day'.

## Agent World (owner, 2026-11-20): PAUSED
- Do NOT use the Agent World tools (start_task / report_step) until the owner says to turn them back on.

## New series (owner, 2026-11-21): "WHAT IF" - GTA 6 first, 6 videos, ONE AT A TIME
- 70-100 s stories, premise -> hour/day chapters -> real science -> twist -> question. Style kit: library/whatif/ (see
  brain/style-whatif.md). Characters in the spirit of the owner's reference screenshots but ORIGINAL (not their robot).
- Drive folder for this series (owner): https://drive.google.com/drive/folders/1C3YDZzPqlFhBQM_7rurN7XRCnhhyqT_o
  (id 1C3YDZzPqlFhBQM_7rurN7XRCnhhyqT_o). Old TheLittleEpic videos stay in the old folder.
- GTA 6 what-if plan: 1 30 days no sleep (wi-gta-nosleep, DONE 2026-11-21, in What if folder) | 2 moving to the real Leonida (wi-gta-leonida, BUILT 2026-11-21, stills checked, awaiting owner review) |
  3 GTA physics in real life (falls, crashes) | 4 GTA money became real (inflation) | 5 everyone skipped work for GTA 6 |
  6 healing like a GTA character (wound/bone healing).
- QUEUE (owner 2026-11-21: make ONLY video 1 now, queue the rest): 2 Leonida, 3 GTA physics, 4 GTA money, 5 everyone
  skips work, 6 GTA healing - status: QUEUED, start one only when the owner says so.
- Look (owner 2026-11-21): "Golden Neon" line-art (black bg, glowing gold/coral outlines, dotted light lines, spotlight,
  particles) COMBINED with the what-if HUD (live counter, bars, chapter screens, choice cards, phone) + strong motion
  graphics (draw-on lines, punch-in chapters) and a motion-graphics opening sting that is also the hook.
- Audio for this series: narrator Kokoro "bm_george" (episode.json "voice"), music mood "cinematic" (new bed).
- 2026-11-21: Actions minutes ran out on the private repo; owner made Vicevinnybeats/Shorts PUBLIC (unlimited free minutes).
  Never commit secrets: the repo is public now.
- 2026-11-21 owner: ONLY video 2 for now. #3 (wi-gta-physics) script is ready but must NOT be built until the owner says so.
- 2026-11-21: Stick3D pack installed (brain/stick3d/README.md). What If 1+2 deleted from Drive; remake both with Stick3D
  in Golden Neon colours when the owner says go. Voice: sentence pauses 0.42 s, speed 0.92 for What If.
- VOICE ORDER (owner 2026-11-21): 1) owner's OWN recorded voice first (always, when a recording exists),
  2) Kokoro bm_george only as fallback. Then use Blender MCP for better 3D objects (save them in brain/stick3d).
  How it works: owner uploads <episode-id>.m4a to Drive "What if/Voice recordings (upload here)"
  (1F6XSSLmmOwDsKYZEjTQLwjTJO5NjTLoA) -> Claude downloads it to episodes/<id>/voice.m4a -> render-final uses it
  (ffmpeg clean + loudnorm, faster-whisper word timings) instead of TTS. Repo is public: the recording becomes public too.
- 2026-11-21 owner: ONE long recording of his voice, reused for ALL videos (not per video) -> plan: free open-source
  voice cloning from a clean reference clip. Preferred engine: Chatterbox TTS (Resemble AI, MIT licence, CPU OK,
  zero-shot from ~10-30 s reference). Avoid non-commercial licences (Coqui XTTS CPML, F5-TTS CC-BY-NC weights).
  Upload goes to Drive "What if/Voice recordings (upload here)". Not built yet: waits for the upload.
  Privacy: repo is public -> keep the reference clip out of the repo if the owner wants (options: private assets repo
  + token secret, or accept it being public). Metadata must still say the narration is a synthetic copy of his voice.
- 2026-11-21 voice-clone tool decision: owner's accent sounds off -> use OpenVoice V2 (MyShell, MIT): Kokoro bm_george
  speaks the script (clean accent, our pauses/speed), OpenVoice tone-colour converter turns it into the owner's voice from
  a 1-5 min reference. Backup: Chatterbox (copies accent). Skip RVC (needs GPU training) and Seed-VC (GPL-3.0).
  Never use the owner's spoken recording itself as narration (long pauses) - reference only.
  First upload (Drive file "Vice vinny New school samples.mp3", 44 s) was a beat/sample track, not speech -> asked again.
