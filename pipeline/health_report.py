"""Builds health/REPORT.md from the health-check artifacts and prints it (for the job summary).

usage: python3 pipeline/health_report.py <artifacts_dir> <report.md>
"""
import glob, json, os, sys

A, OUT = sys.argv[1], sys.argv[2]
res = {k: os.environ.get(v, "?") for k, v in
       [("render", "R_RENDER"), ("kokoro", "R_KOKORO"), ("voicestudio", "R_VS"), ("audio", "R_AUDIO"), ("drive", "R_DRIVE")]}
icon = lambda r: {"success": "✅", "failure": "❌", "skipped": "⏭️", "cancelled": "⛔"}.get(r, "❔")


def j(path):
    try:
        return json.load(open(path))
    except Exception:
        return None


def txt(path):
    try:
        return open(path).read().strip()
    except Exception:
        return ""


L = ["# Health check", ""]
L += ["| Area | Result |", "|---|---|"]
names = {"render": "Remotion + three.js + skill look engine", "kokoro": "Kokoro TTS (CPU) + word timings",
         "voicestudio": "VoiceStudio (Docker, CPU)", "audio": "Skill synth audio + ducking + loudness", "drive": "Google Drive (rclone)"}
for k, n in names.items():
    L.append(f"| {n} | {icon(res[k])} {res[k]} |")

R = os.path.join(A, "health-render")
L += ["", "## Render", "```", txt(os.path.join(R, "versions.txt")), "```"]
for name, label in [("bench_simple.json", "Simple 3D scene + captions, 1080x1920"), ("bench_skill.json", "Skill look engine, 540x960 (half)")]:
    b = j(os.path.join(R, name))
    if b:
        L.append(f"- **{label}**: {b['s_per_frame']} s/frame on {b['cpus']} CPUs (first frame {b['first_frame_s']} s) "
                 f"-> about **{b['est_minutes_2000f']} runner-minutes** for a 67 s short (2,000 frames)")
    else:
        L.append(f"- {label}: no result")

V = os.path.join(A, "health-voice-kokoro")
L += ["", "## Voice"]
for d in sorted(glob.glob(os.path.join(V, "kokoro_*"))):
    i = j(os.path.join(d, "voice_info.json"))
    if i:
        L.append(f"- Kokoro `{i['voice']}`: {i['seconds_audio']} s of speech in {i['seconds_compute']} s compute, {i['words']} timed words")
al = j(os.path.join(V, "align_timing.json"))
if al:
    L.append(f"- faster-whisper word alignment: {al['align_s']} s")
vs = os.path.join(A, "health-voice-voicestudio")
vi, vp = j(os.path.join(vs, "voice_info.json")), j(os.path.join(vs, "pull.json"))
if vi or vp:
    L.append(f"- VoiceStudio: pull {vp and vp.get('pull_s')} s, start {vi and vi.get('startup_s')} s, generate {vi and vi.get('generate_s')} s, HTTP {vi and vi.get('http')}")
else:
    L.append("- VoiceStudio: no result (failed, timed out or skipped)")

m = j(os.path.join(A, "health-audio", "mix_report.json"))
L += ["", "## Audio mix", f"- {m}" if m else "- no result"]
L += ["", "## Drive", "```", txt(os.path.join(A, "health-drive", "drive.txt")) or "no output", "```"]
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w").write("\n".join(L) + "\n")
print("\n".join(L))
