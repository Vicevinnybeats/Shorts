// 2.5D lighting: everything is a plain transparent overlay (gradients, NO blend modes: on a CPU-only renderer a
// blend mode forces an extra full-frame compositing pass, measured at ~0.2 s/frame).
// Key light pool, floodlight beams, rim glow, vignette, colour grade and flash - the skill's lighting moods in 2D.
import React from "react";
import { AbsoluteFill } from "remotion";

export type Mood = { grade: string; gradeOp: number; vignette: number; glow?: string };
export const MOODS: Record<string, Mood> = {
  floodlit: { grade: "#1b2a6b", gradeOp: 0.16, vignette: 0.55, glow: "#fff1c9" },      // night match: cool shadows, warm lamps
  tension: { grade: "#0b2a4a", gradeOp: 0.28, vignette: 0.7, glow: "#cfe6ff" },        // cold blue pressure
  warm: { grade: "#ff9d3c", gradeOp: 0.12, vignette: 0.45, glow: "#ffd9a0" },          // memory / payoff
  explain: { grade: "#24304f", gradeOp: 0.08, vignette: 0.35 },                         // clean, readable diagrams
};

/** Colour grade: a multiply tint + vignette (+ optional soft warm glow from the top, the floodlights). */
export const Grade: React.FC<{ mood: Mood; strength?: number }> = ({ mood, strength = 1 }) => (
  <>
    <AbsoluteFill style={{ background: mood.grade, opacity: mood.gradeOp * strength * 0.8 }} />
    {mood.glow && <AbsoluteFill style={{ background: `radial-gradient(120% 55% at 50% 0%, ${mood.glow}33 0%, transparent 60%)`, opacity: strength }} />}
    <AbsoluteFill style={{ background: `radial-gradient(85% 60% at 50% 48%, transparent 55%, rgba(5,6,18,${mood.vignette * strength}) 100%)` }} />
  </>
);

/** Floodlight beams fanning down from lamp positions (x in design px). */
export const Beams: React.FC<{ from: { x: number; y: number }[]; color?: string; opacity?: number; spread?: number; length?: number }> = ({ from, color = "#fff3d6", opacity = 0.22, spread = 22, length = 2200 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {from.map((l, i) => {
      const toward = (540 - l.x) / 1080;                       // beams lean toward the pitch centre
      return (
        <div key={i} style={{
          position: "absolute", left: l.x - 300, top: l.y, width: 600, height: length,
          transformOrigin: "50% 0", transform: `rotate(${-toward * 38}deg)`,
          background: `linear-gradient(to bottom, ${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")} 0%, transparent 85%)`,
          clipPath: `polygon(${50 - 2}% 0, ${50 + 2}% 0, ${50 + spread}% 100%, ${50 - spread}% 100%)`,
        }} />
      );
    })}
  </AbsoluteFill>
);

/** A soft pool of light on the subject (key light), drawn with a radial gradient and screen blend. */
export const Pool: React.FC<{ x: number; y: number; rx?: number; ry?: number; color?: string; opacity?: number }> = ({ x, y, rx = 420, ry = 520, color = "#fff1d0", opacity = 0.35 }) => (
  <div style={{ position: "absolute", left: x - rx, top: y - ry, width: rx * 2, height: ry * 2, borderRadius: "50%",
    background: `radial-gradient(closest-side, ${color} 0%, transparent 100%)`, opacity: opacity * 0.7, pointerEvents: "none" }} />
);

/** White flash (the skill's 4-frame flash after the hook / on impacts). */
export const Flash: React.FC<{ framesSince: number; len?: number }> = ({ framesSince, len = 5 }) => {
  if (framesSince < 0 || framesSince >= len) return null;
  return <AbsoluteFill style={{ background: "#fff", opacity: 1 - framesSince / len }} />;
};

/** Speed lines for whip pans / fast motion (instead of motion blur). */
export const SpeedLines: React.FC<{ amount: number; angle?: number; seed?: number }> = ({ amount, angle = 0, seed = 3 }) => {
  if (amount <= 0.02) return null;
  const lines = Array.from({ length: 26 }, (_, i) => {
    const r = Math.sin(i * 91.7 + seed) * 0.5 + 0.5, r2 = Math.sin(i * 37.1 + seed * 3) * 0.5 + 0.5;
    return <div key={i} style={{ position: "absolute", left: -200 + r2 * 300, top: r * 1920, width: 900 + r * 700, height: 3 + r2 * 6,
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)", opacity: amount * (0.4 + r * 0.6) }} />;
  });
  return <AbsoluteFill style={{ transform: `rotate(${angle}deg)`, pointerEvents: "none" }}>{lines}</AbsoluteFill>;
};
