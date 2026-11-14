// Narration-driven timing: shots start on cue phrases found in words.json, so picture always follows the voice.
import type { Word } from "../captions/Captions";

export const FPS = 30;
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Words for previews before a voice exists: the script at a steady 2.85 words/s. */
export const roughWords = (script: string, wps = 2.85): Word[] => {
  let t = 0.15;
  return script.split(/\s+/).filter(Boolean).map((w) => {
    const d = 1 / wps + (/[.!?]$/.test(w) ? 0.25 : /[,;:]$/.test(w) ? 0.1 : 0);
    const out = { w, s: t, e: t + d * 0.85 };
    t += d;
    return out;
  });
};

/** Seconds at which `phrase` starts in the narration (first match after `after` seconds). */
export const cueTime = (words: Word[], phrase: string, after = -1): number => {
  const p = phrase.split(/\s+/).map(norm).filter(Boolean);
  for (let i = 0; i <= words.length - p.length; i++) {
    if (words[i].s < after) continue;
    if (p.every((x, k) => norm(words[i + k].w) === x)) return words[i].s;
  }
  throw new Error(`cue not found in narration: "${phrase}"`);
};

export const totalFrames = (words: Word[], tail = 0.9) =>
  Math.max(90, Math.ceil(((words.length ? words[words.length - 1].e : 3) + tail) * FPS));

export type ShotSpec = { id: string; cue: string; lead?: number };
export type ShotSpan = { id: string; a: number; b: number; i: number };

/** Resolves cue phrases to frame spans [a, b). A shot starts `lead` s (default 0.12 s) before its cue word. */
export const resolveShots = (specs: ShotSpec[], words: Word[]): ShotSpan[] => {
  const total = totalFrames(words);
  let after = -1;
  const starts = specs.map((s, i) => {
    if (i === 0) return 0;
    const t = cueTime(words, s.cue, after);
    after = t;
    return Math.max(1, Math.round((t - (s.lead ?? 0.12)) * FPS));
  });
  return specs.map((s, i) => ({ id: s.id, a: starts[i], b: i + 1 < starts.length ? starts[i + 1] : total, i }));
};

export const shotAt = (spans: ShotSpan[], f: number) => spans.find((s) => f >= s.a && f < s.b) ?? spans[spans.length - 1];
