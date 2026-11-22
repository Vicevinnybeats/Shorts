# HANDOFF - where we left off (2026-11-21 16:05 UTC) - read this FIRST in a new chat (owner wants: brain, not chat history)
Work branch: claude/determined-feynman-hahwfr (NOT merged to main; render on this branch). Repo is PUBLIC.

## NOW (open items, in order)
0000000. (owner 2026-11-22) slower voice + spaces between sentences -> flow "spaced" (speed 0.97, 0.38 s / 0.65 s).
   Re-rendering BOTH What If 1 and 2 (separate GO_FINAL pushes). Next topic = #3 wi-gta-physics (script ready, not built).
000000. (owner ~20:20) "make both videos for now" without picking a voice -> kept Kokoro am_liam (default).
   What If 1 (cuts + am_liam, run 44939643924, 68 s, 1-5 kHz -20.0) SENT. What If 2 RENDERED (run 44947593679, 69 s, 1-5 kHz -20.1) and SENT 21:18. Both waiting for owner verdict;
   approved -> Drive 'What if' folder via Zapier + drive-put (brain/drive.md).
   Voice pick from health/voice/compare still open; a different voice = re-render (picture timing follows the voice).
00000. (owner ~19:25) "use GitHub tools for good voiceovers, it's a loop; fix video 1, then video 2".
   What If 2 render CANCELLED (run 44940497484). tts-compare DONE (6 files in health/voice/compare/, sent 20:17) ->
   -> he picks -> wire engine into render-final -> re-render What If 1 (re-edit 1fac241 already has real cuts) ->
   owner OK -> only then What If 2 (f0c934a, GO_FINAL file exists; re-touch it to render).
   Note: What If 1 render with cuts + am_liam finished (run 44939643924, preview committed) - NOT sent, voice will change.
0000. (owner ~19:05) "No cuts, everything pasted together" -> What If 2 render CANCELLED (run 44938267008).
   Voice: natural = per-line takes + 0.45 s pauses (kokoro_tts.py, render-final default). Picture: builder re-edits
   What If 1 into real shots + cuts with @remotion/transitions; then the same for What If 2. Then render both, previews.
   STATUS: What If 1 re-edit DONE (1fac241, 23 shots, hard cuts + 5 transitions), render started. What If 2 next.
000. (owner 2026-11-21 ~18:30) Voice am_liam natural 1.05 = default. BOTH videos in progress (owner asked for both):
   What If 1 fix (no double text, microsleep framing, calm motion graphics) + What If 2 (wi-gta-leonida) remake in Stick3D
   + Blender props + lighting/shadows/camera carry-over, am_liam. One builder agent per video. Then GO_FINAL each,
   previews to owner. Items below are history.
   STATUS: What If 1 RENDERED (run 44936176684): 54.6 s, am_liam ~3.9 words/s (same rate as the sample owner chose),
   master -14.1, 1-5 kHz -20.0 (clearest so far). Preview sent, WAITING for verdict.
   What If 2 rebuilt (75f8ed6, 7 new Blender models, stills checked) -> GO_FINAL render started.
   Lesson: two builders on one checkout -> a stale-index commit deleted files; use a worktree on a SEPARATE local branch.
00. OWNER: bm_george "not natural, too slow" -> voice-samples.yml makes 11 Kokoro voices (natural flow, speed 1.05)
   into health/voice/samples/*.mp3 -> send to owner, he picks -> set render-final default + episode.json
   (NARRATOR_FLOW natural must be wired into render-final's Kokoro step), then re-render What If 1, then What If 2.
0. What If 1 REDO RENDERED (run 44927000990, 106.7 s, bm_george; master -14.1, 1-5 kHz -23.9, bass -15.7). Preview sent to
   owner - WAITING for verdict. Seen in frame sheet: microsleep shot frames Remy half off the right edge (fix if owner
   wants changes). Then: Drive "What if" folder via Zapier + drive-put (brain/drive.md), then What If 2.
   Items 1-3 below are history (owner dropped his clone).
1. What If 1 sound fix DONE (remix 2, run 44922935325): clarity band 1-5 kHz -28.3 -> -23.4 LUFS (old What If 2 -23.7,
   gta-radio -21.2), bass -17.0, master -14.1; voice_eq in episode.json, music level_lu -19. Preview sent to owner,
   WAITING for verdict. GitHub artifact downloads are blocked by this sandbox's proxy -> deliver via repo preview or Drive.
2. Owner voice complaints (What If 1 render): "not natural, phrases glued, muddy, not loud/clear, old videos were louder".
   Done: clarity EQ (no afftdn denoise), music lower. Still open: NATURAL FLOW -> regenerate voice with chatterbox
   --chunk-chars 160 --exag 0.5 --cfg 0.5 --gap 0.35 --ref-len 20 (test: voice-compare.yml run 44921323877, artifact
   final-voicecompare, A=old B=natural C=Kokoro; not yet sent to owner). Then wire chosen settings into render-final.
3. Muddy REFERENCE: assets/voice/owner_ref.wav.enc was over-cleaned (denoise + pauses cut). The original
   "Vincent_Short_Voice.mp3" (4 min) is NOT in Drive anymore -> asked owner to re-upload it in chat. If he does: make a
   new lightly processed ref (no denoise, keep natural pauses, loudnorm), encrypt with a NEW key (openssl aes-256-cbc
   -pbkdf2), owner adds it as secret (e.g. VOICE_KEY2) - never commit plain audio, never print the key except to owner.
   "Vice vinny New school samples.mp3" = a mastered beat (FL Studio, -6.6 LUFS, no pauses), NOT a voice reference.
4. After owner approves What If 1: full MP4 to Drive "What if" folder as What If 1 (flow brain/drive.md: Zapier
   resumable session + drive-put; render-final's own Drive step is skipped - no rclone secrets). Then What If 2 remake.

## What exists now
- What If 1 rebuilt in Stick3D (owner's pack look AS-IS, Golden Neon colours only) + 12 Blender .glb props + lighting rig
  in every scene (commits face8f4, 7d5cec9). Script facts fixed: "AT the drink-drive limit", "tongue twisters".
  Metadata: contains_synthetic_media true + "Narration: AI voice clone of the creator's own voice."
- Voice: Chatterbox (MIT) owner clone = DEFAULT narrator in render-final (episode.json "clone" default owner; "none" ->
  Kokoro). Settings exag 0.65 cfg 0.4 ref_start 20 pause 0.42 (overridable per episode: exag, cfg, ref_start, pause,
  voice_eq, clone_engine). Default chain now = clarity EQ (see render-final), NOT afftdn.
- Blender: headless Blender 4.2 LTS on Actions (.github/workflows/blender-models.yml, on push blender/models/**).
  Scripts blender/models/*.py -> library/models/<name>.glb + previews/; loader library/stick3d/glb.tsx (falls back to
  box props); public/models -> ../library/models. Table of models: brain/stick3d/README.md "Blender objects". REUSE first.
- Remix sound only (5 min, no new picture): remix-audio.yml (inputs episode, run_id; dispatch on this branch).

## Series state
- Old series (TheLittleEpic, 2.5D): videos 1-13 in Drive folder 1-uCqfGVyoJBbyNCT8zVw0PvM1xXqFMlh. Done; pizza = #14 paused.
- WHAT IF (GTA 6, 6 videos, ONE AT A TIME), Drive "What if" 1C3YDZzPqlFhBQM_7rurN7XRCnhhyqT_o. #1 in review, #2
  wi-gta-leonida remake next (same Stick3D + Blender + lighting), #3 wi-gta-physics script ready, #4-6 queued.

## Owner decisions (details: brain/channel-rules.md bottom)
- Free only, never publish, never spend Higgsfield credits (balance 0, free plan), no owner computer (no Blender MCP /
  Higgsfield Bridge). VoiceStudio/OmniVoice = non-commercial licence -> not used.
- Every scene: decent lighting (key + fill + rim, motivated practicals). Main props = Blender .glb, saved for reuse.
- Cheap mode: read brain first, mybrain query before code, write+fact-check script yourself, ONE builder agent per
  video, max 1-2 fix rounds, stop after each video. Agent World paused.
- Commits with [skip ci] skip ALL push workflows; pushing episodes/** (without it) triggers render-stills (-> Drive stills).
  GO_FINAL commit must NOT have [skip ci]. Bot commits (stills/health/log) land on the branch: git pull before push.
