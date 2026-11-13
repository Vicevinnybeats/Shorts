"""Kokoro TTS (free, open source, CPU): text -> voice.wav (24 kHz mono) + words.json [{w, s, e}] in seconds.

usage: python pipeline/voice/kokoro_tts.py <script.txt> <out_dir> [--voice am_michael] [--speed 1.0]
Kokoro returns per-token start/end times for English; chunks are concatenated and their times offset.
"""
import argparse, json, os, re, sys, time
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wordmap import map_script
import soundfile as sf

SR = 24000
PUNCT_ONLY = re.compile(r"^[^\w]+$")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script"); ap.add_argument("out")
    ap.add_argument("--voice", default=os.environ.get("NARRATOR_VOICE", "am_michael"))
    ap.add_argument("--speed", type=float, default=float(os.environ.get("NARRATOR_SPEED", "1.0")))
    a = ap.parse_args()
    from kokoro import KPipeline  # heavy import after arg parsing

    text = open(a.script, encoding="utf-8").read().strip()
    os.makedirs(a.out, exist_ok=True)
    t0 = time.time()
    pipe = KPipeline(lang_code=a.voice[0], repo_id="hexgrad/Kokoro-82M")
    audio, words, offset = [], [], 0.0
    # split on blank lines / sentences so long scripts never hit the 510-token limit
    for res in pipe(text, voice=a.voice, speed=a.speed, split_pattern=r"\n+"):
        chunk = res.audio.cpu().numpy() if hasattr(res.audio, "cpu") else np.asarray(res.audio)
        for tok in (res.tokens or []):
            if tok.start_ts is None or tok.end_ts is None or PUNCT_ONLY.match(tok.text):
                continue
            words.append({"w": tok.text, "s": round(offset + tok.start_ts, 3), "e": round(offset + tok.end_ts, 3)})
        audio.append(chunk)
        offset += len(chunk) / SR
    # Kokoro tokenises punctuation separately: re-attach it to the previous word so captions read naturally
    wav = np.concatenate(audio) if audio else np.zeros(SR, dtype=np.float32)
    sf.write(os.path.join(a.out, "voice.wav"), wav, SR, subtype="PCM_16")
    words = map_script(text.split(), words)
    json.dump(words, open(os.path.join(a.out, "words.json"), "w"), indent=0)
    info = {"engine": "kokoro", "voice": a.voice, "speed": a.speed, "seconds_audio": round(len(wav) / SR, 2),
            "seconds_compute": round(time.time() - t0, 1), "words": len(words)}
    json.dump(info, open(os.path.join(a.out, "voice_info.json"), "w"), indent=1)
    print(json.dumps(info))


if __name__ == "__main__":
    sys.exit(main())
