"""Gemini TTS (Google AI Studio, free tier): text -> voice.wav (24 kHz mono). Word timings come afterwards from
pipeline/voice/align_words.py, like any engine without its own timings.

usage: python pipeline/voice/gemini_tts.py <script.txt> <out_dir> [--voice Charon] [--model gemini-2.5-flash-preview-tts]
       [--style "..."] [--gap 0.38] [--line-gap 0.65] [--per-line]
env:   GEMINI_API_KEY (GitHub Actions secret; never commit it, never print it)

Default: the whole script in ONE request (fewest calls = safest on free-tier rate limits), with a style line asking for
a calm, clear, slightly slow narrator and a short pause after every sentence. --per-line makes one request per script
line and inserts real pauses (--line-gap) between lines (more control, more requests; retries on HTTP 429).
"""
import argparse, base64, json, os, sys, time, urllib.error, urllib.request
import numpy as np, soundfile as sf

SR = 24000
API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
# owner 2026-11-22: pauses were too long on some voices -> natural pace, only brief breaths between sentences.
STYLE = ("Read this as a calm, clear documentary narrator for a YouTube Short. Natural, friendly, unhurried pace. "
         "Leave only a brief, natural breath between sentences, never a long pause. Do not add any words.")


def tts(text, voice, model, key, tries=6):
    body = {"contents": [{"parts": [{"text": text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
    req = urllib.request.Request(API.format(model=model), data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "x-goog-api-key": key})
    for i in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                data = json.load(r)
            b64 = data["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
            return np.frombuffer(base64.b64decode(b64), dtype="<i2").astype(np.float32) / 32768.0
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")[:300]
            if e.code in (429, 500, 503) and i < tries - 1:
                wait = 20 * (i + 1)
                print(f"HTTP {e.code}, retry in {wait}s: {msg}", flush=True); time.sleep(wait); continue
            sys.exit(f"Gemini TTS failed: HTTP {e.code}: {msg}")
        except (KeyError, IndexError) as e:
            sys.exit(f"Gemini TTS: no audio in response ({e})")


def trim(w, pad=0.04):
    loud = np.flatnonzero(np.abs(w) > 0.02 * (np.abs(w).max() + 1e-9))
    return w[max(0, loud[0] - int(pad * SR)): loud[-1] + int(pad * SR)] if loud.size else w


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script"); ap.add_argument("out")
    ap.add_argument("--voice", default=os.environ.get("NARRATOR_VOICE_GEMINI", "Algieba"))
    ap.add_argument("--model", default="gemini-2.5-flash-preview-tts")
    ap.add_argument("--style", default=STYLE)
    ap.add_argument("--gap", type=float, default=0.38); ap.add_argument("--line-gap", type=float, default=0.65)
    ap.add_argument("--per-line", action="store_true")
    a = ap.parse_args()
    key = os.environ.get("GEMINI_API_KEY", "")
    if not key:
        sys.exit("GEMINI_API_KEY is not set (add it as a GitHub Actions secret)")
    os.makedirs(a.out, exist_ok=True)
    lines = [l.strip() for l in open(a.script, encoding="utf-8").read().splitlines() if l.strip()]
    t0 = time.time()
    if a.per_line:
        parts = []
        for i, l in enumerate(lines):
            if parts:
                parts.append(np.zeros(int(a.line_gap * SR), np.float32))
            parts.append(trim(tts(f"{a.style}\n\n{l}", a.voice, a.model, key)))
            print(f"[{i + 1}/{len(lines)}] {l[:50]}", flush=True)
            time.sleep(4)  # stay under free-tier requests-per-minute
        wav = np.concatenate(parts)
    else:
        wav = trim(tts(a.style + "\n\n" + "\n".join(lines), a.voice, a.model, key))
    sf.write(os.path.join(a.out, "voice.wav"), wav, SR, subtype="PCM_16")
    info = {"engine": "gemini", "model": a.model, "voice": a.voice, "per_line": a.per_line,
            "seconds_audio": round(len(wav) / SR, 2), "seconds_compute": round(time.time() - t0, 1)}
    json.dump(info, open(os.path.join(a.out, "voice_info.json"), "w"), indent=1)
    print(json.dumps(info))


if __name__ == "__main__":
    main()
