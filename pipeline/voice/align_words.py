"""Word timings for any voice.wav that has none (e.g. VoiceStudio): faster-whisper (CPU, int8) word timestamps,
then the script's own words are mapped onto them so captions show the exact script spelling.

usage: python pipeline/voice/align_words.py <voice.wav> <script.txt> <words.json> [--model base.en]
"""
import argparse, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wordmap import map_script

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("wav"); ap.add_argument("script"); ap.add_argument("out")
    ap.add_argument("--model", default="base.en")
    a = ap.parse_args()
    from faster_whisper import WhisperModel
    m = WhisperModel(a.model, device="cpu", compute_type="int8")
    segs, _ = m.transcribe(a.wav, word_timestamps=True, beam_size=5, language="en")
    heard = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in s.words]
    script = open(a.script, encoding="utf-8").read().split()
    out = map_script(script, heard)
    json.dump(out, open(a.out, "w"), indent=0)
    print(json.dumps({"aligned": len(out), "heard": len(heard)}))

if __name__ == "__main__":
    main()
