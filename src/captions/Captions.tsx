// Bold word-by-word captions for phones: short phrases (1-3 words), the spoken word pops in yellow,
// white heavy type with a thick dark outline, lower-middle of the frame (clear of the YouTube/IG UI).
// Timings come from words.json (seconds). All sizes are specified at 1080x1920 and scale with the frame.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { loadFont } from "@remotion/fonts";
// bundled with the project (OFL font from npm), so renders never depend on a font CDN
import montserrat900 from "@fontsource/montserrat/files/montserrat-latin-900-normal.woff2";

const fontFamily = "CaptionSans";
loadFont({ family: fontFamily, url: montserrat900, weight: "900" });

export type Word = { w: string; s: number; e: number };
type Group = { words: Word[]; s: number; e: number };

/** Split into phrases of at most `max` words, breaking early on punctuation or a pause > 0.35 s. */
export const groupWords = (words: Word[], max = 3): Group[] => {
  const out: Group[] = [];
  let cur: Word[] = [];
  const flush = () => { if (cur.length) out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; };
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const punct = /[.,!?;:…—]$/.test(w.w);
    const gap = next ? next.s - w.e > 0.35 : true;
    if (cur.length >= max || punct || gap) flush();
  });
  flush();
  // each phrase stays up until the next one starts (no flicker between words)
  out.forEach((g, i) => { if (out[i + 1]) g.e = Math.max(g.e, out[i + 1].s); });
  return out;
};

export const Captions: React.FC<{ words: Word[]; yFrac?: number }> = ({ words, yFrac = 0.66 }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const k = height / 1920;
  const t = frame / fps;
  const groups = useMemo(() => groupWords(words), [words]);
  const g = groups.find((x) => t >= x.s - 0.03 && t < x.e + 0.03);
  if (!g) return null;
  const pop = interpolate(t - g.s, [0, 0.12], [0.82, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) });
  const n = g.words.map((w) => w.w).join(" ").length;
  const size = (n > 18 ? 78 : n > 13 ? 90 : 108) * k;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", top: `${yFrac * 100}%`, left: "6%", transform: `translateY(-50%) scale(${pop})`, width: "88%",
        textAlign: "center", fontFamily, fontWeight: 900, fontSize: size, lineHeight: 1.08, letterSpacing: -0.5 * k,
        textTransform: "uppercase", color: "#ffffff", WebkitTextStroke: `${14 * k}px #120c16`, paintOrder: "stroke fill",
        textShadow: `0 ${6 * k}px ${14 * k}px rgba(0,0,0,0.45)`,
      }}>
        {g.words.map((w, i) => {
          const on = t >= w.s - 0.03;
          const active = on && t < w.e + 0.05;
          // a real space between words, so long phrases can wrap onto a second line
          return (
            <React.Fragment key={i}>
              {i > 0 ? " " : null}
              <span style={{ color: active ? "#ffd93b" : "#ffffff", opacity: on ? 1 : 0.0 }}>{w.w}</span>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
