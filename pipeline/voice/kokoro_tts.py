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
    # Natural flow (owner 2026-11-21: "the voice pauses too much"): single line breaks are NOT pauses any more.
    # Lines are joined into paragraphs (only blank lines split); Kokoro itself chunks long paragraphs at sentence
    # ends to stay under its 510-token limit. Each chunk's leading/trailing silence is trimmed and chunks are
    # joined with one short, constant breath gap.
    paras = [" ".join(l.strip() for l in p.splitlines() if l.strip()) for p in re.split(r"\n\s*\n", text)]
    flow = "\n\n".join(p for p in paras if p)
    GAP, PAD = float(os.environ.get("NARRATOR_GAP", "0.16")), 0.04
    for res in pipe(flow, voice=a.voice, speed=a.speed, split_pattern=r"\n\n+"):
        chunk = res.audio.cpu().numpy() if hasattr(res.audio, "cpu") else np.asarray(res.audio)
        loud = np.flatnonzero(np.abs(chunk) > 0.02 * (np.abs(chunk).max() + 1e-9))
        lead = max(0, loud[0] - int(PAD * SR)) if loud.size else 0
        tail = min(len(chunk), loud[-1] + int(PAD * SR)) if loud.size else len(chunk)
        chunk = chunk[lead:tail]
        if audio:  # one short breath between chunks
            audio.append(np.zeros(int(GAP * SR), dtype=chunk.dtype))
            offset += GAP
        shift = offset - lead / SR
        end = offset + len(chunk) / SR
        for tok in (res.tokens or []):
            if tok.start_ts is None or tok.end_ts is None or PUNCT_ONLY.match(tok.text):
                continue
            s0 = min(max(offset, shift + tok.start_ts), end)
            words.append({"w": tok.text, "s": round(s0, 3), "e": round(min(max(s0, shift + tok.end_ts), end), 3)})
        audio.append(chunk)
        offset = end
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
