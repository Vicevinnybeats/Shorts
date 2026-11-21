"""Turn a narration (Kokoro, clean English + our pauses) into the OWNER's voice with OpenVoice V2 (MyShell, MIT).

usage: python pipeline/voice/openvoice_convert.py <in_voice.wav> <reference.wav> <out_voice.wav>
Only the timbre ("tone colour") changes: timing stays identical, so words.json stays valid.
Checkpoints: Hugging Face myshell-ai/OpenVoiceV2 (converter/config.json + checkpoint.pth), cached by the setup action.
"""
import os, sys, tempfile
import numpy as np, soundfile as sf


def chunks(path, sec=10.0):
    """reference -> ~10 s pieces (OpenVoice averages their embeddings; more pieces = steadier voice)"""
    x, sr = sf.read(path, dtype="float32", always_2d=True)
    x = x.mean(1)
    out, n = [], int(sec * sr)
    d = tempfile.mkdtemp()
    for i in range(0, max(1, len(x) - n // 2), n):
        p = os.path.join(d, f"ref{i // n:03d}.wav")
        sf.write(p, x[i:i + n], sr)
        out.append(p)
    return out


def main():
    src, ref, dst = sys.argv[1:4]
    import torch
    from huggingface_hub import hf_hub_download
    from openvoice.api import ToneColorConverter
    cfg = hf_hub_download("myshell-ai/OpenVoiceV2", "converter/config.json")
    ckpt = hf_hub_download("myshell-ai/OpenVoiceV2", "converter/checkpoint.pth")
    dev = "cuda:0" if torch.cuda.is_available() else "cpu"
    tcc = ToneColorConverter(cfg, device=dev, enable_watermark=False)
    tcc.load_ckpt(ckpt)
    tgt = tcc.extract_se(chunks(ref))
    srcs = chunks(src)
    src_se = tcc.extract_se(srcs[: min(len(srcs), 8)])
    tmp = dst + ".ov.wav"
    tcc.convert(audio_src_path=src, src_se=src_se, tgt_se=tgt, output_path=tmp, tau=0.3)
    y, sr = sf.read(tmp, dtype="float32")
    x, sr0 = sf.read(src, dtype="float32")
    if sr != sr0:  # back to the narration sample rate so all timings line up
        from scipy.signal import resample_poly
        from math import gcd
        g = gcd(sr0, sr); y = resample_poly(y, sr0 // g, sr // g).astype(np.float32)
    y = y[: len(x)] if len(y) >= len(x) else np.pad(y, (0, len(x) - len(y)))
    sf.write(dst, y, sr0, subtype="PCM_16")
    os.remove(tmp)
    print({"openvoice": "ok", "seconds": round(len(y) / sr0, 2), "device": dev})


if __name__ == "__main__":
    sys.exit(main())
