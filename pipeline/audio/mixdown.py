"""Episode mix built on the skill's synth audio (vendor/audio: dsp, instruments, sfx_gen).

usage: python pipeline/audio/mixdown.py <voice.wav> <words.json> <sound.json|-> <out_dir> [--duration S]
sound.json (per episode, optional):
  {"music": {"mood": "warm", "bpm": 84, "key": 57, "level_lu": -10},
   "sfx": [{"t": 1.2, "fn": "whoosh", "args": {"dur": 0.6}, "gain_db": -6, "pan": 0.3}, ...]}
Mix rules (skill standard, adapted for Shorts; the narration must always be clearly on top): voice unchanged, music bed ~10 LU under the voice and ducked a further
-3 dB while words are spoken (keyed from words.json), SFX -6 dB, master -14 LUFS integrated, true peak <= -1 dBTP,
48 kHz / 24-bit stereo. Writes mix.wav, stem_*.wav and mix_report.json.
"""
import argparse, json, os, sys
import numpy as np
from scipy import ndimage, signal

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, "vendor", "audio"))
from dsp import SR, ns, st, dbg, rng, read_wav, write_wav, integrated, true_peak, lra, place, pan, momentary_max  # noqa: E402
import instruments as I  # noqa: E402
import sfx_gen as G  # noqa: E402

TARGET_LUFS, CEIL_DBTP = -14.0, -1.0
HOOK_S = 3.0             # no background beds in the first 3 s: the hook is voice first
BED_UNDER_VOICE = 16.0   # beds sit at least 16 LU under the narration
BED_DUCK_DB = -10.0      # and dip a further 10 dB while a word is spoken
CHORDS = {"warm": [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]],
          "wonder": [[0, 7, 14, 16], [5, 12, 16, 19], [9, 16, 19, 23], [7, 14, 17, 21]],
          "tense": [[0, 3, 7, 10], [1, 5, 8, 12], [0, 3, 7, 10], [-2, 2, 5, 8]],
          "playful": [[0, 4, 7, 12], [5, 9, 12, 17], [7, 11, 14, 19], [0, 4, 7, 12]],
          # "What if" series: dark cinematic bed (no plucked arpeggio): low minor pads, soft timpani pulse, vibes motif
          "cinematic": [[0, 3, 7, 10], [-4, 0, 3, 7], [-7, -3, 0, 3], [-5, -1, 2, 7]]}


def music_bed(dur, mood="warm", bpm=84, key=57, seed=11):
    """Simple original bed: pad chords + plucked arpeggio. Phase 1 replaces this with the /library/audio moods."""
    r = rng(seed)
    out = np.zeros((2, ns(dur) + ns(2.0)))
    beat = 60.0 / bpm
    bar = 4 * beat
    prog = CHORDS.get(mood, CHORDS["warm"])
    t, i = 0.0, 0
    if mood == "cinematic":
        while t < dur:
            ch = prog[i % len(prog)]
            place(out, I.pad([I.m2f(key - 24 + n) for n in ch[:3]], bar * 1.05, vel=0.55, r=r, att=1.2, rel=1.4, warm=600.0), t)
            for k in (0, 2):
                place(out, 0.45 * I.timpani(I.m2f(key - 24 + ch[0]), vel=0.35 + 0.15 * (k == 0), r=r, dur=1.4), t + k * beat)
            if i % 2 == 1:
                for k, n in enumerate((ch[2], ch[1] + 12, ch[3])):
                    place(out, pan(I.vibes(I.m2f(key + n), vel=0.3, r=r, dur=1.4), 0.3 * (k - 1)), t + (1 + k) * beat)
            t += bar
            i += 1
        return out[:, : ns(dur)]
    while t < dur:
        ch = prog[i % len(prog)]
        place(out, I.pad([I.m2f(key - 12 + n) for n in ch[:3]], bar, vel=0.5, r=r), t)
        for k in range(8):
            n = ch[k % len(ch)] + (12 if k >= 4 else 0)
            place(out, pan(I.pluck(I.m2f(key + n), vel=0.35 + 0.1 * (k % 2 == 0), r=r), 0.4 * np.sin(k)), t + k * beat / 2)
        t += bar
        i += 1
    return out[:, : ns(dur)]


def duck_curve(n, words, depth_db=-3.0, pad=0.12, smooth=0.08):
    g = np.zeros(n)
    for w in words:
        g[max(0, ns(w["s"] - pad)): ns(w["e"] + pad)] = 1.0
    g = ndimage.uniform_filter1d(g, max(1, ns(smooth)))
    return dbg(depth_db * g)


def limiter(x, ceil_db=CEIL_DBTP, look=0.005, rel=0.08):
    """look-ahead peak limiter on 4x-oversampled peaks; returns x scaled so true peak <= ceil"""
    up = np.abs(signal.resample_poly(x, 4, 1, axis=-1)).max(0)
    pk = up.reshape(-1, 4).max(1)[: x.shape[1]]
    need = np.minimum(1.0, dbg(ceil_db) / np.maximum(pk, 1e-9))
    need = ndimage.minimum_filter1d(need, ns(look) * 2 + 1)
    a = np.exp(-1.0 / (rel * SR))
    g = np.empty_like(need)
    cur = 1.0
    for i, v in enumerate(need):  # instant attack (look-ahead window), exponential release
        cur = v if v < cur else a * cur + (1 - a) * v
        g[i] = cur
    return x * g[None, :]


def cue_time(words, phrase):
    """start (s) of the first occurrence of `phrase` in the narration (same rule as src/engine/timeline.ts)"""
    import re
    n = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
    p = [n(x) for x in phrase.split() if n(x)]
    for i in range(len(words) - len(p) + 1):
        if all(n(words[i + j]["w"]) == p[j] for j in range(len(p))):
            return words[i]["s"]
    raise ValueError(f"cue not found in narration: {phrase!r}")


def crowd(dur, r, voices=24, cheer=0.0, energy=1.0):
    """stadium crowd from the skill's synth voices: many distant babblers (+ applause and hurrahs when cheer > 0)"""
    out = np.zeros(ns(dur))
    for _ in range(voices):
        v = G.babble(dur, r, r.uniform(95, 240), r.uniform(0.9, 1.2), r.uniform(3.6, 5.2) * energy, r.uniform(0.5, 0.85), fmax=3200)
        out[: len(v)] += v[: len(out)] * r.uniform(0.4, 1.0)
    if cheer > 0:
        a = G.applause(dur, r, 60)
        a = a.mean(0) if a.ndim == 2 else a
        out[: len(a)] += a[: len(out)] * cheer * 1.6
        for _ in range(int(10 * cheer)):
            h = G.hurrah(r, r.uniform(110, 230), r.uniform(1.0, 1.18))
            h = h.mean(0) if np.ndim(h) == 2 else h
            i = ns(r.uniform(0, max(0.01, dur - 1.0)))
            seg = out[i: i + len(h)]
            seg += h[: len(seg)] * r.uniform(0.3, 0.7)
    return out / max(1e-9, np.abs(out).max())


def call_sfx(ev, r):
    if ev["fn"] == "crowd":
        return crowd(r=r, **ev.get("args", {}))
    fn = getattr(G, ev["fn"])
    args = dict(ev.get("args", {}))
    try:
        return fn(r=r, **args)
    except TypeError:
        return fn(args.pop("dur", 1.0), r, **args)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("voice"); ap.add_argument("words"); ap.add_argument("sound"); ap.add_argument("out")
    ap.add_argument("--duration", type=float, default=None)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    v, sr = read_wav(a.voice)
    v = st(v.mean(0))
    if sr != SR:
        v = signal.resample_poly(v, SR, sr, axis=-1)
    words = json.load(open(a.words))
    sound = json.load(open(a.sound)) if a.sound != "-" and os.path.exists(a.sound) else {}
    dur = a.duration or (v.shape[1] / SR + 0.6)
    N = ns(dur)
    voice = np.zeros((2, N)); place(voice, v, 0.0)
    v_lufs = integrated(voice)

    m = sound.get("music", {})
    music = music_bed(dur, m.get("mood", "warm"), m.get("bpm", 84), m.get("key", 57))
    music *= dbg(v_lufs + m.get("level_lu", -10.0) - integrated(music))
    music *= duck_curve(N, words)[None, :]
    music[:, -ns(1.2):] *= np.linspace(1, 0, ns(1.2))[None, :]  # fade out with the last word

    # SFX in two kinds. HITS (< 1.5 s: kicks, whooshes, thumps) keep their gain_db and dip only -3 dB under words.
    # BEDS (>= 1.5 s or "bed": true: crowds, breeze, murmur) are levelled against the VOICE: at most
    # BED_UNDER_VOICE LU under it, ducked a further BED_DUCK_DB while words are spoken, and never inside the hook.
    hits, beds = np.zeros((2, N)), np.zeros((2, N))
    hook_end = HOOK_S
    for k, ev in enumerate(sound.get("sfx", [])):
        t = ev["t"] if "t" in ev else cue_time(words, ev["cue"]) + ev.get("offset", 0.0)
        x = pan(st(call_sfx(ev, rng(100 + k))).mean(0), ev.get("pan", 0.0))
        is_bed = ev.get("bed", x.shape[1] / SR >= 1.5)
        if is_bed:
            if t < hook_end:                               # the hook belongs to the voice alone
                cut = ns(hook_end - t)
                if cut >= x.shape[1]:
                    continue
                x, t = x[:, cut:], hook_end
                x[:, : ns(0.4)] *= np.linspace(0, 1, ns(0.4))[None, :]
            lvl = integrated(x)
            if np.isfinite(lvl):
                target = v_lufs + min(ev.get("level_lu", -BED_UNDER_VOICE), -BED_UNDER_VOICE)
                x = x * dbg(target - lvl)
            place(beds, x, max(0.0, t))
        else:
            # hits are levelled against the voice too: loudest moment = voice + gain_db, never above voice - 4 LU
            pk = momentary_max(x)
            if np.isfinite(pk):
                x = x * dbg(v_lufs + min(ev.get("gain_db", -6.0), -4.0) - pk)
            place(hits, x, max(0.0, t))
    hits *= duck_curve(N, words, depth_db=-3.0)[None, :]
    beds *= duck_curve(N, words, depth_db=BED_DUCK_DB, pad=0.2, smooth=0.12)[None, :]
    sfx = hits + beds

    stems = {"voice": voice, "music": music, "sfx": sfx}
    mix = voice + music + sfx
    gain = dbg(TARGET_LUFS - integrated(mix))
    for _ in range(5):  # limiting lowers loudness: re-aim the gain until the limited mix sits on target
        out = limiter(mix * gain)
        err = TARGET_LUFS - integrated(out)
        if abs(err) < 0.1:
            break
        gain *= dbg(err)
    mix = out
    write_wav(os.path.join(a.out, "mix.wav"), mix)
    for k, s in stems.items():
        write_wav(os.path.join(a.out, f"stem_{k}.wav"), s * gain)
    vo, rest = integrated(voice * gain), integrated((music + sfx) * gain)
    rep = {"voice_over_rest_lu": round(vo - rest, 1) if np.isfinite(rest) else None, "duration_s": round(dur, 3), "integrated_lufs": round(integrated(mix), 2), "true_peak_dbtp": round(true_peak(mix), 2),
           "lra_lu": round(lra(mix), 2), "voice_lufs_pre": round(v_lufs, 2), "sfx_events": len(sound.get("sfx", []))}
    json.dump(rep, open(os.path.join(a.out, "mix_report.json"), "w"), indent=1)
    print(json.dumps(rep))


if __name__ == "__main__":
    main()
