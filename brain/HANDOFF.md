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
  Test 4 APPROVED by the owner (2026-11-21).
- DONE: Chatterbox wired into render-final.yml as DEFAULT voice (test-4 settings, align_words.py timings). First real
  check = the What If 1 remake. What If 1 REBUILT in Stick3D (commit face8f4, stills checked) - WAITING for owner OK on
  the frames. UPDATE: 12 Blender .glb props (library/models, headless Blender workflow blender-models.yml) + lighting rig
  in every scene (commit 7d5cec9). render-final run 44912499914 SUCCESS (97 s, clone voice). Drive step skipped (no rclone secrets) -> preview
  episodes/wi-gta-nosleep/preview.mp4 sent to owner in chat; full MP4 = artifact final-wi-gta-nosleep of that run
  (Drive via Zapier + drive-put, brain/drive.md) once the owner approves.
  What If 2 only after that.
## After that
- Blender: owner will NOT use his computer and will NOT pay for Higgsfield -> no Higgsfield Bridge. Use free headless
  Blender (GitHub Actions / cloud), bpy scripts in the repo, save objects + notes in brain/stick3d.
## Rules that matter most
- Free only; never publish; one video at a time; stop after each and wait for the owner.
- Agent World: PAUSED (don't call it).
- Cheap mode: write+verify the script yourself, ONE builder agent, max 1-2 fix rounds, use mybrain query first.
- Drive upload flow: brain/drive.md. Owner notes/feedback: brain/feedback.md, brain/channel-rules.md (bottom = newest).
