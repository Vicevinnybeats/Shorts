"""Owner's voice clone with Chatterbox (Resemble AI, MIT licence): text -> voice.wav in the owner's own voice.

usage: python pipeline/voice/chatterbox_tts.py <script.txt> <reference.wav> <out_dir> [--gap 0.42] [--exag 0.5] [--cfg 0.5]
Each sentence is generated separately (natural pauses), edge silences trimmed, joined with a constant pause.
Word timings come afterwards from pipeline/voice/align_words.py (faster-whisper), like any recorded voice.
"""
import argparse, os, re, sys, time
import numpy as np, soundfile as sf


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script"); ap.add_argument("ref"); ap.add_argument("out")
    ap.add_argument("--gap", type=float, default=float(os.environ.get("NARRATOR_GAP", "0.42")))
    ap.add_argument("--exag", type=float, default=0.5); ap.add_argument("--cfg", type=float, default=0.5)
    ap.add_argument("--ref-start", type=float, default=20.0); ap.add_argument("--ref-len", type=float, default=12.0)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    import torch
    from chatterbox.tts import ChatterboxTTS
    t0 = time.time()
    # a clean ~12 s slice of the owner's reference is the voice prompt
    x, sr = sf.read(a.ref, dtype="float32", always_2d=True); x = x.mean(1)
    s0 = int(a.ref_start * sr); x = x[s0:s0 + int(a.ref_len * sr)]
    prompt = os.path.join(a.out, "prompt.wav"); sf.write(prompt, x, sr)
    model = ChatterboxTTS.from_pretrained(device="cuda" if torch.cuda.is_available() else "cpu")
    text = " ".join(open(a.script, encoding="utf-8").read().split())
    sents = [s for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    out, SR = [], model.sr
    for i, s in enumerate(sents):
        w = model.generate(s, audio_prompt_path=prompt, exaggeration=a.exag, cfg_weight=a.cfg).squeeze().cpu().numpy()
        loud = np.flatnonzero(np.abs(w) > 0.02 * (np.abs(w).max() + 1e-9))
        if loud.size: w = w[max(0, loud[0] - int(0.04 * SR)): loud[-1] + int(0.06 * SR)]
        if out: out.append(np.zeros(int(a.gap * SR), dtype=np.float32))
        out.append(w.astype(np.float32))
        print(f"[{i + 1}/{len(sents)}] {len(w) / SR:.1f}s  {s[:50]}", flush=True)
    wav = np.concatenate(out)
    sf.write(os.path.join(a.out, "voice.wav"), wav, SR, subtype="PCM_16")
    os.remove(prompt)
    print({"engine": "chatterbox", "seconds_audio": round(len(wav) / SR, 2), "seconds_compute": round(time.time() - t0, 1)})


if __name__ == "__main__":
    sys.exit(main())
