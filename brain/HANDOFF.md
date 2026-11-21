# HANDOFF - where we left off (2026-11-21) - read this first in a new chat
## State
- Old series (TheLittleEpic, 2.5D): videos 1-13 in Drive folder 1-uCqfGVyoJBbyNCT8zVw0PvM1xXqFMlh. Done; pizza = #14 paused.
- NEW series "WHAT IF" (GTA 6 first, 6 videos, ONE AT A TIME), Drive folder "What if" 1C3YDZzPqlFhBQM_7rurN7XRCnhhyqT_o.
  What If 1 (wi-gta-nosleep) + 2 (wi-gta-leonida) were made in Golden Neon 2D, then DELETED by the owner -> REMAKE both
  with the Stick3D pack (library/stick3d, brain/stick3d/README.md) in the Golden Neon colours. Scripts + facts stay.
  #3 wi-gta-physics script ready (not built). #4 money, #5 skip work, #6 healing: queued, not written.
- Repo Vicevinnybeats/Shorts is PUBLIC (free Actions minutes). Never commit secrets or plain voice audio.
## Voice (in progress)
- Owner's own voice clone, owner will NOT record again. Encrypted reference assets/voice/owner_ref.wav.enc, key = secret VOICE_KEY.
- Engine chosen: Chatterbox (MIT) via pipeline/voice/chatterbox_tts.py; test workflow voice-test-chatterbox.yml.
  OpenVoice rejected by owner (not his voice); VoiceStudio rejected (non-commercial licence).
- Owner feedback so far: louder, cleaner, more energy, but don't over-stress single words ("sleep"). Current test 4:
  exag 0.65, cfg 0.4, chain highpass/afftdn/deesser/compressor/loudnorm -13 LUFS, sentence pauses 0.42 s.
  Test 4 is in Drive "What if/Voice recordings (upload here)" (1F6XSSLmmOwDsKYZEjTQLwjTJO5NjTLoA) - WAITING for verdict.
- When approved: wire Chatterbox into render-final.yml (episode.json "clone": "owner"; words via align_words.py; same
  voice chain), then remake What If 1 and 2 when the owner says go.
## After that
- Blender (Higgsfield Bridge MCP, bl_* tools): owner must open Blender + Higgsfield panel + Connect. Use only FREE tools
  (no bl_generate_3d / credits). Save new objects + notes in brain/stick3d.
## Rules that matter most
- Free only; never publish; one video at a time; stop after each and wait for the owner.
- Agent World: PAUSED (don't call it).
- Cheap mode: write+verify the script yourself, ONE builder agent, max 1-2 fix rounds, use mybrain query first.
- Drive upload flow: brain/drive.md. Owner notes/feedback: brain/feedback.md, brain/channel-rules.md (bottom = newest).
