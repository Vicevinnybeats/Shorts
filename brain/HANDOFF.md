# HANDOFF - where we left off (2026-11-21 16:05 UTC) - read this FIRST in a new chat (owner wants: brain, not chat history)
Work branch: claude/determined-feynman-hahwfr (NOT merged to main; render on this branch). Repo is PUBLIC.

## NOW (open items, in order)
1. What If 1 (wi-gta-nosleep) sound fix: remix-audio run 44922080023 (reuses render-final run 44912499914 picture+voice,
   applies episode.json "voice_eq" clarity chain + music level_lu -16). When done: git pull, measure
   episodes/wi-gta-nosleep/preview.mp4 bands (ffmpeg ebur128 on highpass1000+lowpass5000; target ~ -21 LUFS like old
   gta-radio; it was -28.3 before the fix), send preview to owner (SendUserFile). Owner judges.
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
