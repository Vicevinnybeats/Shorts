"""Map the script's own words (exact spelling + punctuation) onto timed words from a TTS engine or recogniser."""
import difflib, re


def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower())


def map_script(script, heard):
    script = [w for w in script if norm(w)]
    heard = [h for h in heard if norm(h["w"])]
    sm = difflib.SequenceMatcher(a=[norm(x) for x in script], b=[norm(h["w"]) for h in heard], autojunk=False)
    out = [None] * len(script)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                out[i1 + k] = {"w": script[i1 + k], "s": heard[j1 + k]["s"], "e": heard[j1 + k]["e"]}
        elif i2 > i1 and j2 > j1:  # e.g. "1,000" spoken as "one thousand": spread the heard span over the script words
            s, e, n = heard[j1]["s"], heard[j2 - 1]["e"], i2 - i1
            for k in range(n):
                out[i1 + k] = {"w": script[i1 + k], "s": round(s + (e - s) * k / n, 3), "e": round(s + (e - s) * (k + 1) / n, 3)}
    for i, w in enumerate(out):  # words never heard: squeeze into the gap between neighbours
        if w is None:
            prev_e = out[i - 1]["e"] if i and out[i - 1] else 0.0
            nxt = next((x for x in out[i + 1:] if x), None)
            out[i] = {"w": script[i], "s": prev_e, "e": nxt["s"] if nxt else round(prev_e + 0.3, 3)}
    return out
