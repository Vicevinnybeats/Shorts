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
- 2026-11-21 OWNER VOICE (final, owner won't record again): source = his upload "Vincent_Short_Voice.mp3" (4 min).
  Cleaned 100 s reference (denoise, pauses removed) is stored ENCRYPTED: assets/voice/owner_ref.wav.enc
  (openssl aes-256-cbc pbkdf2; key = GitHub Actions secret VOICE_KEY, added by the owner). Never commit the plain audio.
  Use: episode.json "clone": "owner" -> render-final: Kokoro (words, pauses, speed) -> pipeline/voice/openvoice_convert.py
  (OpenVoice V2 tone colour) -> owner's voice; timings unchanged. Test: workflow voice-test (artifact final-voicetest ->
  drive-put). Metadata: "Narration: AI voice clone of the creator's own voice."
- 2026-11-21: owner: OpenVoice test "not sounding like my voice"; asked for VoiceStudio -> declined (OmniVoice is
  CC-BY-NC non-commercial). Owner: "take the best one" -> Chatterbox (MIT) test made: pipeline/voice/chatterbox_tts.py,
  workflow voice-test-chatterbox (own venv, Python 3.11, encrypted ref + VOICE_KEY). Waiting for owner's verdict
  before wiring it into render-final (then: "clone": "owner" + engine chatterbox, words via align_words.py).
- 2026-11-21 owner on Chatterbox test 1: "louder, cleaner, more emotion and energy" -> exaggeration 0.75, cfg 0.4,
  voice chain: highpass 75, afftdn, deesser, compressor, loudnorm -16 LUFS (use the same chain in render-final).
- 2026-11-21 owner on voice test 3: "the word 'sleep' is too much" + "louder" -> exaggeration 0.65 (not 0.75), no "!" on
  short punchy words (write "No sleep." not "No sleep!"), voice loudness -13 LUFS.
- 2026-11-21 owner APPROVED voice test 4 ("do voice 4"). Chatterbox owner clone is now the DEFAULT narrator in
  render-final.yml: exag 0.65, cfg 0.4, ref_start 20, pause 0.42 s, chain highpass75/afftdn/deesser/compressor/-13 LUFS,
  word timings via align_words.py. episode.json overrides: "clone": "none" (Kokoro), "clone_engine": "openvoice",
  "exag", "cfg", "ref_start", "pause". Note: Chatterbox ignores "speed" (Kokoro only). Not yet tested in a full render.
- 2026-11-21 owner: does NOT want to use his own computer and does NOT want to pay for Higgsfield. -> No Higgsfield
  Bridge / local Blender. 3D objects instead from Blender run HEADLESS for free (GitHub Actions or the cloud container),
  bpy scripts committed to the repo, results saved in brain/stick3d. Never spend Higgsfield credits.
- 2026-11-21 owner: "keep the Stick3D in my style like before" -> What If uses the installed Stick3D pack look AS-IS
  (Stick3DTest: NEON3D palette + REMY3D puppets, 3D toon rooms, shafts, dust, camera rigs); Golden Neon = colours only.
- 2026-11-21 owner: Blender = OPTION 2 (headless Blender on GitHub Actions, bpy scripts in repo -> .glb, no owner computer,
  no Higgsfield). Live local Blender MCP only if an object cannot be done that way. Objects are built once, reused.
- 2026-11-21 owner: SAVE every Blender .glb model for reuse: library/models/<name>.glb + a line in brain/stick3d/README.md
  ("Blender objects": name, what it is, colours, which video used it). Reuse before making a new one.
- 2026-11-21 owner: EVERY scene needs DECENT LIGHTING (key + fill + rim on the characters, motivated practical lights,
  no flat/dark scenes) and What If videos use Blender .glb assets (headless Blender on Actions) for the main props.
- 2026-11-21 owner on What If 1 render (Chatterbox test-4 settings): "not natural, not loud enough, not clear; should be
  natural flow and clear". Asked to compare with VoiceStudio. VoiceStudio = OmniVoice CC-BY-NC (non-commercial, API refuses
  until licence accepted, health checks fail) -> not usable on a monetized channel unless the owner decides otherwise.
  Test voice-compare.yml: A current, B natural (multi-sentence takes, exag 0.5, cfg 0.5, ref 20 s, no denoise, clarity EQ), C Kokoro.
- 2026-11-21 owner: DROPS his own voice clone ("still not what I want") -> use a normal stock voice. VoiceStudio refused
  (non-commercial licence); owner chose "Kokoro, other voice" -> sent samples am_michael, am_fenrir, bm_george, af_heart
  (health/voice/). Waiting for his pick; then What If 1 re-render with episode.json "clone": "none" + "voice": <pick>.
- 2026-11-21 owner: "kokoro bm_george is the best, use it for EVERY video". DEFAULT narrator = Kokoro bm_george (render-final
  default clone "none", NARRATOR_VOICE bm_george). What If pace: speed 0.92, pause 0.42. Owner clone only if an episode
  explicitly sets "clone": "owner". Stock TTS voice -> metadata contains_synthetic_media false (as old videos).
- 2026-11-21 owner (What If 1 redo): voice = Kokoro bm_george (his pick). Make LIGHTING better + real SHADOWS (characters
  and props cast soft shadows on floor/walls; no floating look) + CAMERA that keeps moving THROUGH cuts into the next scene
  (motivated moves: push-in, orbit, whip/carry-over; no static shots, no hard jumps unless on purpose). Applies to EVERY video.
- MISTAKES NOT TO REPEAT (owner feedback 2026-11-21):
  1. Owner voice clone (Chatterbox/OpenVoice) = rejected: muddy, glued phrases, unnatural. Use Kokoro bm_george.
  2. Never denoise a voice that is already clean (afftdn smears it). Check the 1-5 kHz band vs old videos (~-21..-24 LUFS).
  3. Rooms were too dark: characters lit but sets murky. Keep sets readable, not just the hero.
  4. Frame-check stills before rendering; text never under captions or the counter card.
  5. Never use non-commercial licences (VoiceStudio/OmniVoice) and never spend credits.
  6. Keep the state in brain/HANDOFF.md, not in chat (tokens).
- 2026-11-21 owner on What If 1 redo: bm_george "not natural and too slow" (speed 0.92 + 0.42 s per-sentence pauses).
  -> new Kokoro option NARRATOR_FLOW=natural (paragraph takes), samples of 11 voices at speed 1.05 (voice-samples.yml ->
  health/voice/samples/). Owner picks a voice BEFORE What If 2. Never again speed < 1.0 or per-sentence pauses by default.
- 2026-11-21 owner: VOICE = Kokoro am_liam for EVERY video (render-final default), natural flow (paragraph takes),
  speed 1.05, pause 0.3. bm_george (slow, per-sentence) rejected.
- ANIMATION RULE (owner 2026-11-21): NO DOUBLE TEXT. On-screen text/stamps must never show the same words as the
  captions at the same time (e.g. red "YOU'RE NOT." stamp while the caption says "You're not."). On-screen text only
  adds NEW info (numbers, labels, counters, choices) or is timed so it does not overlap the caption saying it.
  Motion graphics: yes, smooth and purposeful, NOT extreme (no constant shaking, flashing, glitch spam).
- 2026-11-21 owner on What If 1 (am_liam): "no cuts, everything pasted together in a sequence". Two causes:
  (a) voice had no breaks at all (one paragraph take) -> natural flow now = one take per script LINE + 0.45 s pause
      between lines (beats). Inside a line it stays natural. Each script line = one beat.
  (b) picture was one continuous drifting camera with carry-over whips -> felt like one long sequence.
  RULE: edit like a real Short: distinct SHOTS with real CUTS (hard cuts on the beat/line change, mostly), a few
  purposeful transitions (slide/wipe/fade/zoom via the official @remotion/transitions TransitionSeries), different
  framings per shot (wide / medium / close-up / insert), camera motion INSIDE a shot only. Not one continuous move.
  Tool found on GitHub: @remotion/transitions (official Remotion package, same version as remotion). Others seen:
  Remocn/remocn, av/remotion-bits (not added; check licence first).
- 2026-11-21 owner: "use GitHub tools for good voiceovers, we're going in a loop". Stop tweaking one engine; compare
  REAL alternatives side by side, owner picks by ear, then lock it. Candidates (free, commercial-OK, CPU):
  Kokoro (Apache-2.0, current), resemble-ai/chatterbox (MIT, built-in voice, no clone) + Chatterbox Turbo (MIT),
  KittenML/KittenTTS (Apache-2.0). Rejected: VoiceStudio/OmniVoice (non-commercial), voice-pro (GPL), MisoTTS/neutts
  (unclear licence), VibeVoice/Zonos/Orpheus/Dia (need a GPU for good speed). Test: .github/workflows/tts-compare.yml
  -> health/voice/compare/*.mp3. ORDER: fix What If 1 completely first, THEN What If 2 (owner: "after 1 make 2").
- 2026-11-22 owner: "speak slower, leave spaces between sentences" (for every video). Voice default now
  NARRATOR_FLOW=spaced: one take per sentence, 0.38 s pause after each sentence, 0.65 s after each script line (beat),
  speed 0.97 (am_liam). History: 0.92 + per-sentence 0.42 = "too slow/not natural"; one paragraph take = "pasted
  together"; 1.05 per-line = "too fast, no spaces". Stay near 0.97 / 0.38 / 0.65 unless the owner says otherwise.
- 2026-11-22 owner: has a local Gemini TTS script (gemini-2.5-flash-preview-tts, Google AI Studio free tier). We rebuilt
  it in the repo: pipeline/voice/gemini_tts.py (REST, key from env GEMINI_API_KEY = GitHub Actions secret, never in chat
  or repo), samples via gemini-voices.yml -> health/voice/gemini/. Word timings via align_words.py. Not yet wired into
  render-final (do after the owner picks a Gemini voice). Free tier = rate limits + Google may use free-tier data.
- 2026-11-22 owner shared reference stills (not ours, style only): bright daylight full 3D worlds (red canyon, railway
  with steam train, deep blue canyon with half-built bridges), big scale/depth, 2D bean puppet composited in 3D, one big
  word-by-word caption. Owner asks: same look but KEEP our own character (Remy). Plan: test ONE scene first (sky + fog
  + large Blender environment), compare with current look, then decide. Never copy their characters or scenes 1:1.
- 2026-11-22 owner: VOICE DEFAULT = Google AI Studio (Gemini TTS) for EVERY video from now on (voice name: owner picks
  from health/voice/gemini samples; wire into render-final as default engine, Kokoro only as fallback if the key/quota fails).
- 2026-11-22 owner: the new bright 3D look test = What If 1's GTA story (same script), not a new topic. DO NOT START
  until the owner says go.
- Blender answer given: Blender MCP works with Claude Desktop / Claude Code ON HIS COMPUTER without Higgsfield (e.g. the
  "MCP for Blender" add-on), but needs his computer on. In the cloud we use headless Blender on GitHub Actions (free).
- 2026-11-22 owner picked Gemini voice ALGIEBA (default for every video; render-final: episode.json "tts" default
  "gemini", "gemini_voice" default "Algieba", Kokoro am_liam only as fallback). Some Gemini voices paused too long ->
  style prompt now asks for brief natural breaths only (pipeline/voice/gemini_tts.py STYLE).
- 2026-11-22 owner: key that was pasted in chat was replaced by the owner (never paste keys in chat; secrets only in
  GitHub / local config). What If 1 = built in the CLOUD (no owner computer, headless Blender) in the new BRIGHT
  daylight big-3D-world look (owner reference stills) with Remy, Gemini Algieba voice. What If 2 = owner will test
  live with Blender MCP + Claude Desktop on his PC (models exported as .glb into this repo -> same renderer).
- 2026-11-22 owner gave his Motion Design skill (library/skills/motion-design) "for better animations". Summary of how
  we apply it: brain/motion-design.md. Owner: don't make the video yet - What If 1 bright restyle PAUSED until he says go.
- 2026-11-22 bug: caption "SLEEP." missing in "Play. Sleep. Repeat." (Gemini said it fast, aligner gave ~0 s). Fix:
  align_words.py now gives every word >= 0.18 s on screen with increasing starts. Check fast word lists in every video.
- 2026-11-24 owner (REMEMBER, not started): after the 3 GTA What If videos (#1 nosleep, #2 leonida, #3 physics),
  test ANOTHER THEME to see what works (A/B the topic, keep the look). Use MORE CAMERA SHOTS / named camera moves,
  like his reference (a pixel-art lighthouse short, style only): 01 PULL BACK (reveal), 02 DOLLY ZOOM (vertigo),
  03 CRANE + LAND (rise over, then settle). Also add: push-in, orbit, tracking/truck, low hero angle, top-down,
  whip-to-match. Plan each video's shot list with a named move per shot (in the storyboard) and vary them.
- 2026-11-27 caught in What If 6 render: HUD "SEVERAL MIN" and "BLACKOUT / NO WARNING" appeared while the caption said
  the same words -> removed. Builders still slip on NO DOUBLE TEXT: always check the final render frame sheet for it.
- 2026-11-27 lesson: render-final has a concurrency group per branch -> GitHub keeps only ONE pending run; a third
  GO_FINAL push cancels the one that was waiting (#8 NPC got cancelled). Max 2 renders at a time: one running + one waiting.
