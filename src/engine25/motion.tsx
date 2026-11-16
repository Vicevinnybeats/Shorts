// Motion rules for every episode, adapted from motion-director (github.com/sharbelxyz/motion-director, MIT,
// (c) 2026 Sharbel) to our 2.5D SVG engine. Rules (see brain/style-bible.md "Motion rules"):
//  - eases by ROLE: arrivals land on a long tail (expo.out), exits are ~45 % shorter and accelerate out
//    (power3.in), camera moves ease both ways (power2.inOut); linear only for rotation/progress
//  - a landed label is dead still (no wobble/pulse loops on text; characters may breathe)
//  - overlap: the next element starts when the previous is 30-50 % done; words 60-120 ms apart
//  - a counter starts at its first real value, fills well inside its beat, STOPS and is stamped
//  - nothing on screen holds still for more than ~3 s (scripts/motion-check.mjs measures it)
// Labels are SVG <text> with opacity/scale/offset only (no CSS blur: filters are slow on CPU renders).
import React from "react";
import { Easing, interpolate } from "remotion";

export const EASE = {
  arrive: Easing.bezier(0.16, 1, 0.3, 1),     // expo.out-like: fast in, long soft landing
  exit: Easing.bezier(0.55, 0, 0.75, 0.2),    // power3.in-like: accelerate away
  camera: Easing.bezier(0.45, 0, 0.55, 1),    // power2.inOut
  linear: Easing.linear,
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0..1 progress of an arrival that starts at frame `a` and lasts `d` frames */
export const arrive = (f: number, a: number, d = 12) => interpolate(f, [a, a + d], [0, 1], { ...clamp, easing: EASE.arrive });
/** 0..1 progress of an exit (shorter than the arrival by default) */
export const leave = (f: number, a: number, d = 7) => interpolate(f, [a, a + d], [0, 1], { ...clamp, easing: EASE.exit });
/** eased camera value between two keys */
export const camMove = (f: number, a: number, b: number, from: number, to: number) => interpolate(f, [a, b], [from, to], { ...clamp, easing: EASE.camera });
/** start frame of item i in an overlapped sequence: each starts when the previous is `overlap` done */
export const stagger = (start: number, i: number, dur: number, overlap = 0.6) => start + i * dur * overlap;

/** safe text box for 9:16 (design px): nothing above y 300 (phone UI + camera zoom), no copy below 1350,
 *  60 px side margins and a wider right margin for the like/comment rail */
export const SAFE_TEXT = { top: 300, bottom: 1350, left: 60, right: 1080 - 120 } as const;

type Enter = "rise" | "scale" | "words" | "present";
/**
 * An on-screen label with a deliberate entrance and exit (both required, like motion-director's Line).
 * f = frame relative to the shot; enterAt/exitAt in frames (exitAt = Infinity: stays until the cut).
 * `hidden` hides it entirely (e.g. during a crossfade).
 */
export const Label: React.FC<{ f: number; x: number; y: number; size: number; color: string; enter: Enter; enterAt: number;
  exitAt: number; children: string; weight?: number; hidden?: boolean }> = ({ f, x, y, size, color, enter, enterAt, exitAt, children, weight = 900, hidden }) => {
  if (hidden || f < enterAt) return null;
  const out = Number.isFinite(exitAt) ? leave(f, exitAt) : 0;
  if (out >= 1) return null;
  const common = { textAnchor: "middle" as const, fontFamily: "CaptionSans", fontWeight: weight, fontSize: size, fill: color };
  if (enter === "words") {
    const words = children.split(" ");
    // measure-free layout: render as one text with per-word tspans fading in 3 frames apart
    return (
      <text x={x} y={y - out * 20} opacity={1 - out} {...common}>
        {words.map((w, i) => { const p = arrive(f, enterAt + i * 3, 9); return <tspan key={i} opacity={p}>{w + (i < words.length - 1 ? " " : "")}</tspan>; })}
      </text>
    );
  }
  const p = enter === "present" ? 1 : arrive(f, enterAt, enter === "scale" ? 15 : 12);
  const s = enter === "scale" ? 1.18 - 0.18 * p : 1;
  const dy = enter === "rise" ? (1 - p) * 34 : 0;
  return (
    <g opacity={p * (1 - out)} transform={`translate(${x} ${y + dy - out * 20}) scale(${s})`}>
      <text x={0} y={0} {...common}>{children}</text>
    </g>
  );
};

/** A counter that starts at `from`, reaches `to` well inside its beat, stops, and is stamped (a short pop). */
export const countValue = (f: number, startAt: number, dur: number, from: number, to: number) =>
  Math.round(interpolate(f, [startAt, startAt + dur], [from, to], { ...clamp, easing: EASE.arrive }));
export const stampScale = (f: number, startAt: number, dur: number) => {
  const t = f - (startAt + dur);
  return t < 0 || t > 8 ? 1 : 1 + 0.12 * Math.sin((t / 8) * Math.PI);
};
