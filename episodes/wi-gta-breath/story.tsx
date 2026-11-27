// WHAT IF #6 "What If You Held Your Breath Like a GTA 6 Character?" - bright DAYLIGHT Stick3D look (as approved for
// What If 1-4: big 3D worlds with sky, clouds, sun, haze; Remy = REMY3D puppet + beanie; Golden Neon only for HUD; cyan
// only for the GAME version: the AIR BAR that barely moves, the cyan hologram swimmer). Central motif: the cyan game AIR
// BAR (bubbles icon, hardly drops) against the gold REAL breath timer (lungs / stopwatch, seconds run out fast).
// Facts (RESEARCH.md): most adults ~30-90 s; trained freedivers several minutes; static apnea record without extra
// oxygen 11:35; cold water shock = gasp in the first minute; 1-10-1 (1 min breathing, ~10 min movement, ~1 h before
// hypothermia); breath-hold games underwater -> blackout without warning; never alone, never ignore the urge to breathe.
// SAFETY: nobody drowns or is shown in danger. Remy is always safe and supervised: in every water shot a lifeguard or a
// buddy is visible (the freediver has a safety buddy); the blackout shot shows an EMPTY pool (no person). No game
// footage/art/logos ("GTA" only as words). Water = cheap but convincing (library/stick3d/water.tsx): translucent tinted
// planes, caustic light nets, light shafts, bubbles, blue fog under water.
// Every beat is cue-driven (C(phrase, fallback)) so the picture follows words.json. Real shots with hard cuts; every
// PLACE change = shape morph; one NAMED camera move per shot (comment on each case), never reversing.
// Layout: HUD y 300-1350; figures stay above y 1430 (captions own 1440-1640).
// NO DOUBLE TEXT: on-screen words never repeat what the caption says at that moment (bars, icons, numbers instead).
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, getInputProps } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { ShotSpan, cueTime, FPS } from "../../src/engine/timeline";
import type { Word } from "../../src/captions/Captions";
import { EASE, arrive } from "../../src/engine25/motion";
import { NEON, NeonDefs, StrokeWord, ChoiceCards, NeonPath, WI_FONT, drawOn } from "../../library/whatif/kit";
import { Box, Cyl, Ball, Surface } from "../../library/stick3d/toon";
import { Person, V3, clamp, Grade } from "../../library/stick3d/kit";
import { REMY3D } from "../../src/tests/Stick3DTest";
import { Cam, Key, FaceGroup } from "../../library/stick3d/extra";
import { Glb } from "../../library/stick3d/glb";
import { DaySky, SunRig, DayGround, CityBackdrop, Palms, Clouds, disp, DAY } from "../../library/stick3d/daylight";
import { WaterSurface, Caustics, Ripples, UnderwaterWorld, LightShafts, Bubbles } from "../../library/stick3d/water";
import { drawPuppet, Look, Pose } from "../../library/stick3d/puppet";
import { N3, Halo, Motes, Panel } from "../../library/stick3d/neon";

// ---------------------------------------------------------------- cast
const REMY: Look = { ...REMY3D, beanie: "#2e3658", beanieBand: N3.gold, pom: N3.amber };
/** lifeguard (red shirt) and Remy's buddy (sky-blue hoodie): always near the water */
const GUARD: Look = { skin: "#c98a5e", body: "#e5463a", outfit: "shirt", hair: "short", hairColor: "#2a1a10", shoe: "#0b0d1a" };
const BUDDY: Look = { skin: "#8d5a3c", body: "#4fb6e0", outfit: "hoodie", hair: "bob", hairColor: "#1b1b2a", shoe: "#0b0d1a" };
const { gold: GOLD, coral: CORAL, amber: AMBER, text: CREAM, cyan: CYAN, dim: DIM } = NEON;

// ---------------------------------------------------------------- shots
type ShotDef = { id: string; cue: string; parent: string; sub: number };
const DEFS: ShotDef[] = [
  { id: "hook", cue: "What if you", parent: "hook", sub: 0 },
  { id: "hookb", cue: "Swim to the", parent: "hook", sub: 1 },
  { id: "test1", cue: "Test one.", parent: "test1", sub: 0 },
  { id: "land", cue: "In real life, most", parent: "land", sub: 0 },
  { id: "freediver", cue: "Trained freedivers", parent: "freediver", sub: 0 },
  { id: "record", cue: "The record without", parent: "record", sub: 0 },
  { id: "test2", cue: "Test two.", parent: "test2", sub: 0 },
  { id: "gasp", cue: "In real life, falling", parent: "gasp", sub: 0 },
  { id: "rule", cue: "That's why rescuers", parent: "rule", sub: 0 },
  { id: "ruleb", cue: "One minute to", parent: "rule", sub: 1 },
  { id: "test3", cue: "Test three.", parent: "test3", sub: 0 },
  { id: "blackout", cue: "In real life, pushing", parent: "blackout", sub: 0 },
  { id: "safety", cue: "That's why safety", parent: "safety", sub: 0 },
  { id: "surface", cue: "In the game, your air", parent: "surface", sub: 0 },
  { id: "surfaceb", cue: "In real life, a buddy", parent: "surface", sub: 1 },
  { id: "ask", cue: "How long can", parent: "ask", sub: 0 },
];
const DEF: Record<string, ShotDef> = Object.fromEntries(DEFS.map((d) => [d.id, d]));
const SHOTS = DEFS.map((d) => ({ id: d.id, cue: d.cue }));
const TR_FRAMES = 14;
/** place of each scene (parent): a PLACE change = shape-morph transition, everything else = hard cut */
const PLACE: Record<string, string> = {
  hook: "pier", test1: "pier", land: "pier", freediver: "deep", record: "deep", test2: "lake", gasp: "lake", rule: "lake",
  test3: "pool", blackout: "poolwater", safety: "pool", surface: "pool", ask: "pier",
};
/** background colour of each scene = the flood colour of the morph INTO it */
const BG: Record<string, string> = {
  hook: "#cfe9fb", test1: "#cfe9fb", land: "#cfe9fb", freediver: "#1f6fa8", record: "#1f6fa8", test2: "#c9d6e0", gasp: "#c9d6e0",
  rule: "#c9d6e0", test3: "#d6f1fb", blackout: "#2f93c8", safety: "#d6f1fb", surface: "#d6f1fb", ask: "#cfe9fb",
};
/** key object of the OUTGOING shot that becomes the transition shape (screen rect, radius) */
const KEY_DEF = { cx: 540, cy: 900, w: 380, h: 380, r: 190 };
const KEY_OBJ: Record<string, typeof KEY_DEF> = {
  land: { cx: 720, cy: 1190, w: 170, h: 170, r: 85 },                // the stopwatch dial
  record: { cx: 540, cy: 560, w: 520, h: 200, r: 40 },                // the record clock plate
  ruleb: { cx: 540, cy: 520, w: 260, h: 300, r: 30 },                 // the middle 1-10-1 tile
  test3: { cx: 540, cy: 1180, w: 420, h: 260, r: 130 },               // the pool water
  blackout: { cx: 540, cy: 520, w: 300, h: 260, r: 40 },              // the warning sign
  surfaceb: { cx: 540, cy: 520, w: 300, h: 260, r: 130 },             // the extra-life hearts
};

// ---------------------------------------------------------------- helpers
const k = (u: number, a: number, b: number, from: number, to: number, e = EASE.camera) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const lerp3 = (a: V3, b: V3, e: number): V3 => [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
/** shot clock -> 0..1 with the house camera ease: FAST first, then slow for longer (cubic ease-out), never reversing */
const shotE = (us: number, ls: number) => { const x = clamp(us / Math.max(1, ls)); return 1 - Math.pow(1 - x, 3); };
type CamPose = { pos: V3; look: V3; fov?: number; roll?: number };
/** one named camera move per shot: `at(e)` gives the camera for progress e (0..1, eased) */
const Move: React.FC<{ us: number; ls: number; at: (e: number) => CamPose }> = ({ us, ls, at }) => {
  const c = at(shotE(us, ls));
  const key: Key = { t: 0, pos: c.pos, look: c.look, fov: c.fov ?? 46, roll: c.roll ?? 0 };
  return <Cam t={us / FPS} keys={[key]} />;
};
/** straight move between two camera poses (push-in, pull back, crane, truck, low angle, top-down) */
const line = (a: CamPose, b: CamPose) => (e: number): CamPose => ({ pos: lerp3(a.pos, b.pos, e), look: lerp3(a.look, b.look, e), fov: (a.fov ?? 46) + ((b.fov ?? 46) - (a.fov ?? 46)) * e, roll: (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * e });
/** ORBIT around `c` from angle a0 to a1 (radians, 0 = camera on +z) at radius r, height h */
const orbit = (c: V3, r: number, h: number, a0: number, a1: number, fov = 44) => (e: number): CamPose => {
  const a = a0 + (a1 - a0) * e; return { pos: [c[0] + r * Math.sin(a), c[1] + h, c[2] + r * Math.cos(a)], look: c, fov };
};
/** DOLLY ZOOM (vertigo): the camera travels from d0 to d1 along `dir` toward the subject while the FOV widens so the
 *  subject keeps its size (d * tan(fov/2) constant) and the background stretches away */
const dollyZoom = (subj: V3, dir: V3, d0: number, d1: number, fov0: number) => (e: number): CamPose => {
  const K = d0 * Math.tan((fov0 * Math.PI) / 360), d = d0 + (d1 - d0) * e;
  const n = Math.hypot(dir[0], dir[1], dir[2]);
  return { pos: [subj[0] + (dir[0] / n) * d, subj[1] + (dir[1] / n) * d, subj[2] + (dir[2] / n) * d], look: subj, fov: (2 * Math.atan(K / d) * 180) / Math.PI };
};
let mctx: CanvasRenderingContext2D | null = null;
const measure = (w: string, size: number) => {
  if (!mctx) mctx = document.createElement("canvas").getContext("2d");
  if (!mctx) return w.length * size * 0.76;
  mctx.font = `900 ${size}px CaptionSans, Arial, sans-serif`; return mctx.measureText(w).width;
};
/** HUD text (motion-design rules): word by word, each word fades up from soft (blurred halo) to sharp with a small rise,
 *  0.08 s stagger, leaves the same way; no bounces/pops; ink outline keeps it readable on bright daylight */
const HudText: React.FC<{ f: number; x: number; y: number; size: number; color?: string; at: number; out?: number; children: string; anchor?: "start" | "middle" | "end"; spacing?: number }> =
  ({ f, x, y, size, color = NEON.gold, at, out = Infinity, children, anchor = "middle", spacing = 0 }) => {
    if (f < at) return null;
    const ws = children.split(" "), cw = (w: string) => measure(w, size) + spacing * w.length, gap = size * 0.3;
    const total = ws.reduce((t2, w) => t2 + cw(w), 0) + gap * (ws.length - 1);
    let cx = anchor === "middle" ? x - total / 2 : anchor === "end" ? x - total : x;
    return <g>{ws.map((w, i) => {
      const x0 = cx; cx += cw(w) + gap;
      const p = arrive(f, at + i * 2.4, 11), ex = Number.isFinite(out) ? clamp((f - out - i * 2.4) / 9) : 0;
      const o = p * (1 - ex); if (o <= 0.01) return null;
      const dy = (1 - p) * 16 - ex * 12;
      const c = { x: x0, y: y + dy, fontFamily: WI_FONT, fontWeight: 900, fontSize: size, letterSpacing: spacing };
      return <g key={i} opacity={o}>
        <text {...c} fill="none" stroke={color} strokeWidth={size * 0.35} opacity={0.35 * (1 - p + ex)} strokeLinejoin="round">{w}</text>
        <text {...c} fill={color} stroke="#0b0d1a" strokeWidth={size * 0.13} paintOrder="stroke" strokeLinejoin="round">{w}</text>
      </g>;
    })}</g>;
  };
const leaveO = (f: number, out: number) => (Number.isFinite(out) ? 1 - clamp((f - out) / 9) : 1);
/** dark rounded plate behind HUD graphics (readable on bright daylight) */
const Plate: React.FC<{ x: number; y: number; w: number; h: number; o: number; r?: number; fill?: string }> = ({ x, y, w, h, o, r = 22, fill = "#0b0d1a" }) => o <= 0 ? null : <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} opacity={0.52 * o} />;
/** live clock digits (m:ss) - plain text, re-drawn every frame (a counting number, never a caption word) */
const mss = (s: number) => { const t = Math.max(0, Math.floor(s)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; };
const Digits: React.FC<{ x: number; y: number; size: number; text: string; color?: string; o?: number; anchor?: "start" | "middle" | "end" }> = ({ x, y, size, text, color = GOLD, o = 1, anchor = "middle" }) => o <= 0.01 ? null : (
  <text x={x} y={y} textAnchor={anchor} fontFamily={WI_FONT} fontWeight={900} fontSize={size} letterSpacing={2} fill={color} stroke="#0b0d1a" strokeWidth={size * 0.12} paintOrder="stroke" strokeLinejoin="round" opacity={o} style={{ fontVariantNumeric: "tabular-nums" }}>{text}</text>
);

// ---------------------------------------------------------------- HUD icons (line art, Golden Neon)
const ICON: Record<string, string> = {
  lungs: "M -5 -34 L -5 -10 M 5 -34 L 5 -10 M -5 -12 C -14 -20 -36 -10 -36 14 C -36 32 -22 36 -8 30 C -5 28 -5 18 -5 8 Z M 5 -12 C 14 -20 36 -10 36 14 C 36 32 22 36 8 30 C 5 28 5 18 5 8 Z",
  burst: "M -48 -34 L -38 -24 M 48 -34 L 38 -24 M 0 -54 L 0 -42 M -54 4 L -42 4 M 54 4 L 42 4",
  up: "M 0 -40 L 0 -62 M -10 -52 L 0 -63 L 10 -52",
  snow: "M 0 -38 L 0 38 M -33 -19 L 33 19 M -33 19 L 33 -19 M -9 -30 L 0 -22 L 9 -30 M -9 30 L 0 22 L 9 30 M -30 -6 L -22 -12 M 30 6 L 22 12 M -30 6 L -22 12 M 30 -6 L 22 -12",
  ring: "M 0 -30 A 30 30 0 1 1 -0.1 -30 Z M 0 -14 A 14 14 0 1 1 -0.1 -14 Z M 0 34 L 0 52 M -9 44 L 0 53 L 9 44",
  therm: "M -8 18 L -8 -34 A 8 8 0 0 1 8 -34 L 8 18 A 15 15 0 1 1 -8 18 Z",
  person: "M 0 -38 A 11 11 0 1 1 -0.1 -38 Z M -20 34 C -20 2 20 2 20 34",
  buddy: "M -16 -36 A 10 10 0 1 1 -16.1 -36 Z M -34 32 C -34 2 2 2 2 32 M 18 -30 A 10 10 0 1 1 17.9 -30 Z M 0 36 C 0 8 36 8 36 36",
  vest: "M -24 -34 L -9 -34 L -5 -18 L 5 -18 L 9 -34 L 24 -34 L 30 32 L 5 32 L 5 -4 L -5 -4 L -5 32 L -30 32 Z M -28 6 L -5 6 M 5 6 L 28 6",
  trophy: "M -24 -34 L 24 -34 L 20 -6 C 16 10 -16 10 -20 -6 Z M -23 -26 C -42 -26 -38 0 -17 0 M 23 -26 C 42 -26 38 0 17 0 M 0 9 L 0 22 M -16 32 L 16 32 L 11 22 L -11 22 Z",
  swim: "M -40 22 Q -30 14 -20 22 Q -10 30 0 22 Q 10 14 20 22 Q 30 30 40 22 M 14 -10 A 9 9 0 1 1 13.9 -10 Z M -30 6 Q -8 -28 22 -20",
  bubbles: "M -12 10 A 14 14 0 1 1 -12.1 10 Z M 14 -10 A 10 10 0 1 1 13.9 -10 Z M 18 20 A 7 7 0 1 1 17.9 20 Z",
  heart: "M 0 30 C -50 -4 -38 -44 0 -22 C 38 -44 50 -4 0 30 Z",
};
/** THE MOTIF: a game-style AIR BAR. kind "game" = cyan with bubbles (barely moves, refills in a blink); "real" = gold
 *  with lungs (runs out). 10 segments, hot top highlight, a soft flash when it jumps up. */
const AirBar: React.FC<{ f: number; y: number; fill: number; kind: "game" | "real"; at: number; out?: number; x?: number; w?: number; h?: number; flash?: number }> =
  ({ f, y, fill, kind, at, out = Infinity, x = 540, w = 860, h = 60, flash = -999 }) => {
    const p = drawOn(f, at, 12) * leaveO(f, out); if (p <= 0) return null;
    const col = kind === "game" ? CYAN : GOLD, x0 = x - w / 2 + 104, x1 = x + w / 2 - 14, tw = x1 - x0;
    const fw = tw * clamp(fill), segs = 10, fl = Math.max(0, 1 - Math.abs(f - flash - 6) / 8);
    return <g opacity={p} transform={`translate(0 ${(1 - p) * 14})`}>
      <rect x={x - w / 2} y={y - 16} width={w} height={h + 32} rx={(h + 32) / 2} fill="#0b0d1a" opacity={0.6} />
      <circle cx={x - w / 2 + 52} cy={y + h / 2} r={38} fill={kind === "game" ? "#0b3a46" : "#3a2a0c"} />
      <g transform={`translate(${x - w / 2 + 52} ${y + h / 2}) scale(${kind === "game" ? 0.95 : 0.78})`}>
        <path d={kind === "game" ? ICON.bubbles : ICON.lungs} fill={kind === "game" ? "none" : col} stroke={kind === "game" ? col : "#0b0d1a"} strokeWidth={kind === "game" ? 6 : 3} />
      </g>
      <rect x={x0} y={y} width={tw} height={h} rx={12} fill="#141a2c" stroke={DIM} strokeWidth={2.5} />
      {fw > 4 && <>
        <rect x={x0 + 4} y={y + 4} width={Math.max(0, fw - 8)} height={h - 8} rx={9} fill={col} opacity={0.92} />
        <rect x={x0 + 8} y={y + 8} width={Math.max(0, fw - 16)} height={(h - 16) * 0.32} rx={5} fill="#ffffff" opacity={0.45} />
      </>}
      {Array.from({ length: segs - 1 }, (_, i) => <rect key={i} x={x0 + (tw * (i + 1)) / segs - 2} y={y + 3} width={4} height={h - 6} fill="#141a2c" opacity={0.85} />)}
      {fl > 0 && <rect x={x0} y={y - 6} width={tw} height={h + 12} rx={14} fill="none" stroke="#ffffff" strokeWidth={6} opacity={fl} />}
    </g>;
  };
/** the REAL breath TIMER (gold): stopwatch icon, a track with `ticks`, a fill that grows, an optional range zone
 *  (lighter), the live clock under the icon and the big value under the track (from RESEARCH.md, e.g. "30-90 S") */
const BreathTimer: React.FC<{ f: number; y: number; at: number; fill: number; ticks: number; value: string; valueAt: number; clock?: string; color?: string; zone?: [number, number]; out?: number }> =
  ({ f, y, at, fill, ticks, value, valueAt, clock, color = GOLD, zone, out = Infinity }) => {
    const p = drawOn(f, at, 12) * leaveO(f, out); if (p <= 0) return null;
    const x0 = 190, x1 = 960, tw = x1 - x0, h = 54, fw = tw * clamp(fill);
    return <g opacity={p}>
      <Plate x={60} y={y - 30} w={960} h={250} o={1} />
      {/* stopwatch icon */}
      <g transform={`translate(122 ${y + h / 2 + 4})`}>
        <circle r={34} fill="none" stroke={color} strokeWidth={5} />
        <path d="M 0 -34 L 0 -44 M -9 -46 L 9 -46 M 24 -26 L 31 -33" stroke={color} strokeWidth={5} strokeLinecap="round" />
        <path d={`M 0 0 L ${Math.sin(fill * Math.PI * 2) * 24} ${-Math.cos(fill * Math.PI * 2) * 24}`} stroke={color} strokeWidth={5} strokeLinecap="round" />
      </g>
      <rect x={x0} y={y} width={tw} height={h} rx={12} fill="#141a2c" stroke={DIM} strokeWidth={2.5} />
      {zone && <rect x={x0 + tw * zone[0]} y={y + 4} width={tw * (zone[1] - zone[0])} height={h - 8} rx={8} fill={color} opacity={0.22} />}
      {fw > 4 && <>
        <rect x={x0 + 4} y={y + 4} width={Math.max(0, fw - 8)} height={h - 8} rx={9} fill={color} opacity={0.9} />
        <rect x={x0 + 8} y={y + 8} width={Math.max(0, fw - 16)} height={(h - 16) * 0.3} rx={5} fill="#ffffff" opacity={0.4} />
      </>}
      {Array.from({ length: ticks + 1 }, (_, i) => <rect key={i} x={x0 + (tw * i) / ticks - 2} y={y + h + 6} width={4} height={i % ticks === 0 ? 22 : 14} rx={2} fill={x0 + (tw * i) / ticks <= x0 + fw + 1 ? color : DIM} />)}
      {clock && <Digits x={122} y={y + h + 112} size={56} text={clock} color={CREAM} />}
      <HudText f={f} x={x1} y={y + h + 112} size={68} color={color} at={valueAt} anchor="end" spacing={1}>{value}</HudText>
    </g>;
  };
/** round icon tile */
const IconTile: React.FC<{ f: number; x: number; y: number; at: number; icon: string; extra?: string; strike?: number; color?: string; r?: number; out?: number; label?: string }> =
  ({ f, x, y, at, icon, extra, strike = 0, color = GOLD, r = 78, out = Infinity, label }) => {
    const p = drawOn(f, at, 12) * leaveO(f, out); if (p <= 0) return null;
    const s = r / 78;
    return <g transform={`translate(${x} ${y - (1 - p) * 16})`} opacity={p}>
      <circle r={r} fill={color === CYAN ? "#0b3a46" : "#3a2a0c"} opacity={0.82} />
      <circle r={r} fill="none" stroke={color} strokeWidth={4} opacity={0.9} />
      <g transform={`scale(${s})`}>
        <NeonPath d={ICON[icon]} w={5} color={color} hot />
        {extra && <NeonPath d={ICON[extra]} w={5} color={color} hot />}
        {strike > 0 && <><circle r={56} fill="none" stroke={CORAL} strokeWidth={8} opacity={strike} /><NeonPath d="M -40 -40 L 40 40" w={8} color={CORAL} p={strike} hot /></>}
      </g>
      {label && <HudText f={f} x={0} y={r + 66} size={50} color={color} at={at + 6}>{label}</HudText>}
    </g>;
  };
/** three test tiles (land / cold water / diving); the current test lights gold, done ones get a tick */
const TestTracker: React.FC<{ f: number; at: number; active: number; out?: number; y?: number }> = ({ f, at, active, out = Infinity, y = 420 }) => {
  const o = leaveO(f, out); if (f < at - 2 || o <= 0) return null;
  return <g opacity={o}>{["lungs", "snow", "ring"].map((ic, i) => {
    const x = 540 + (i - 1) * 156, p = drawOn(f, at + i * 3, 12), on = i === active, done = i < active;
    const col = on ? GOLD : done ? AMBER : DIM;
    return <g key={ic} transform={`translate(${x} ${y - (1 - p) * 14})`} opacity={p}>
      <rect x={-62} y={-62} width={124} height={124} rx={24} fill={on ? "#3a2a0c" : "#0b0d1a"} opacity={on ? 0.8 : 0.55} />
      <NeonPath d="M -38 -62 L 38 -62 Q 62 -62 62 -38 L 62 38 Q 62 62 38 62 L -38 62 Q -62 62 -62 38 L -62 -38 Q -62 -62 -38 -62 Z" w={on ? 4.5 : 2.5} color={col} glow={on ? 1 : 0.3} />
      <g transform="scale(0.8)"><NeonPath d={ICON[ic]} w={on ? 5.5 : 4} color={col} glow={on ? 0.8 : 0.2} hot={on} /></g>
      {done && <NeonPath d="M 30 -50 l 10 10 l 20 -24" w={5} color={GOLD} />}
    </g>;
  })}</g>;
};
/** the 1-10-1 card: three tiles (icon + value) that light one after another on their cues */
const RuleTiles: React.FC<{ f: number; y: number; at: [number, number, number] }> = ({ f, y, at }) => (<g>
  {([["lungs", "1 MIN"], ["swim", "10 MIN"], ["therm", "~1 H"]] as const).map(([ic, v], i) => {
    const x = 540 + (i - 1) * 300, p = drawOn(f, at[i], 12); if (p <= 0) return null;
    return <g key={i} opacity={p} transform={`translate(${x} ${y - (1 - p) * 16})`}>
      <rect x={-130} y={-150} width={260} height={300} rx={30} fill="#0b0d1a" opacity={0.62} />
      <NeonPath d="M -100 -150 L 100 -150 Q 130 -150 130 -120 L 130 120 Q 130 150 100 150 L -100 150 Q -130 150 -130 120 L -130 -120 Q -130 -150 -100 -150 Z" w={4} color={GOLD} glow={0.8} />
      <g transform="translate(0 -50) scale(1.15)"><NeonPath d={ICON[ic]} w={5} color={GOLD} hot />{ic === "therm" && <NeonPath d="M 0 22 L 0 0" w={9} color={CORAL} />}</g>
      <HudText f={f} x={0} y={100} size={62} color={GOLD} at={at[i] + 4} spacing={1}>{v}</HudText>
    </g>;
  })}
</g>);
/** coral warning sign: triangle with "!" */
const WarnSign: React.FC<{ f: number; x: number; y: number; at: number; s?: number }> = ({ f, x, y, at, s = 1 }) => {
  const p = drawOn(f, at, 12); if (p <= 0) return null;
  return <g opacity={p} transform={`translate(${x} ${y - (1 - p) * 14}) scale(${s})`}>
    <path d="M 0 -96 L 104 84 L -104 84 Z" fill="#3a1410" opacity={0.85} stroke="#0b0d1a" strokeWidth={6} strokeLinejoin="round" />
    <NeonPath d="M 0 -96 L 104 84 L -104 84 Z" w={9} color={CORAL} join="round" hot />
    <NeonPath d="M 0 -36 L 0 26" w={14} color={CORAL} hot />
    <circle cx={0} cy={56} r={9} fill={CORAL} />
  </g>;
};

// ---------------------------------------------------------------- 3D helpers
const ShadowSetup: React.FC = () => {
  const { scene } = useThree();
  React.useLayoutEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.Material & { isLineMaterial?: boolean; alphaTest?: number };
      const skip = !!mat.isLineMaterial || mat.blending === THREE.AdditiveBlending || (mat.transparent && !(mat.alphaTest && mat.alphaTest > 0)) || m.geometry?.type === "ConeGeometry";
      const flat = m.geometry?.type === "PlaneGeometry" && Math.abs(m.rotation.x + Math.PI / 2) < 0.01;
      m.castShadow = !skip && !flat;
      m.receiveShadow = !skip && !!(mat as THREE.MeshLambertMaterial).isMeshLambertMaterial || !!(mat as THREE.MeshToonMaterial).isMeshToonMaterial;
    });
  });
  return null;
};
/** soft DROP SHADOW of a standing puppet: its silhouette laid on the floor, stretched away from the sun */
const SH_YAW = Math.atan2(6, 4.5);
const DropShadow: React.FC<{ p: V3; h: number; look: Look; pose: Omit<Pose, "t">; f: number; o?: number }> = ({ p, h, look, pose, f, o = 0.55 }) => {
  const L = h * 0.94, W = h * 512 / 768;
  return <group position={[p[0], p[1] + 0.035, p[2]]} rotation={[0, SH_YAW, 0]}>
    <Panel p={[0, 0, -L / 2 + 0.06]} s={[W, L]} rot={[-Math.PI / 2, 0, 0]} px={[256, 384]} draw={(c, Wc, Hc) => {
      drawPuppet(c, Wc, Hc, look, { ...pose, t: f, sweat: 0 });
      c.globalCompositeOperation = "source-in";
      const g = c.createLinearGradient(0, Hc, 0, 0); g.addColorStop(0, `rgba(2,3,10,${o})`); g.addColorStop(1, `rgba(2,3,10,${o * 0.35})`);
      c.fillStyle = g; c.fillRect(0, 0, Wc, Hc); c.globalCompositeOperation = "source-over";
    }} />
  </group>;
};
/** puppet + soft white halo behind it + contact blob + drop shadow (standing on a floor) */
const Hero: React.FC<{ p: V3; look: Look; pose: Omit<Pose, "t">; f: number; h?: number; shadow?: boolean; rimO?: number }> = ({ p, look, pose, f, h = 2.5, shadow = true, rimO = 0.3 }) => (<>
  <Halo p={[p[0], p[1] + h * 0.62, p[2] - 0.25]} r={h * 0.72} color="#ffffff" o={rimO * 0.6} />
  {shadow ? <DropShadow p={p} h={h} look={look} pose={pose} f={f} /> : null}
  <Person p={p} h={h} look={look} pose={pose} f={f} shadow={shadow} sy={p[1]} />
</>);
/** the life jacket worn by a puppet (turns with the puppet billboard) */
const Jacket: React.FC<{ p: V3; h?: number }> = ({ p, h = 2.5 }) => (
  <FaceGroup p={p}><group position={[0, h * 0.4, 0.26]} scale={[h / 2.5 * 0.92, h / 2.5 * 0.42, h / 2.5 * 0.6]}>
    <Glb name="life_jacket" line={2} fallback={<Box p={[0, 0, 0]} s={[0.85, 0.8, 0.25]} color="#ff8a2a" line={2} />} />
  </group></FaceGroup>
);
/** stopwatch held in front of a puppet's chest; the hand sweeps with `sec` (one turn = 60 s) */
const Watch: React.FC<{ p: V3; sec: number; h?: number; s?: number }> = ({ p, sec, h = 2.5, s = 1 }) => {
  const a = -(sec / 60) * Math.PI * 2;
  return <FaceGroup p={p}><group position={[0.35 * h / 2.5, h * 0.36, 0.3]} scale={s * 0.55}>
    <Glb name="stopwatch" line={2} fallback={<Cyl p={[0, 0, 0]} rt={0.34} h={0.12} rot={[Math.PI / 2, 0, 0]} color={GOLD} line={2} />} />
    <group position={[0, 0, 0.09]} rotation={[0, 0, a]}><Box p={[0, 0.1, 0]} s={[0.03, 0.22, 0.02]} color="#ff4d5e" line={0} /></group>
    <Ball p={[0, 0, 0.1]} r={0.03} color="#0b0d1a" ink={0} />
    <Halo p={[0, 0, 0.12]} r={0.6} color={N3.gold} o={0.3} />
  </group></FaceGroup>;
};
/** cyan hologram puppet = the GAME version (swims, lounges, never needs air). `rot` lays it down (no billboard) */
const Ghost: React.FC<{ p: V3; h?: number; o?: number; f: number; pose?: Omit<Pose, "t">; rot?: V3 }> = ({ p, h = 2.5, o = 0.7, f, pose = { mood: "grin", arms: "up" }, rot }) => o <= 0.01 ? null : (
  <group position={p}>
    <Panel p={rot ? [0, 0, 0] : [0, h * 0.5, 0]} rot={rot} s={[h * 512 / 768, h]} px={[256, 384]} face={!rot} additive o={o} dep={Math.floor(f / 2)} draw={(c, W, H) => {
      drawPuppet(c, W, H, REMY, { ...pose, t: f });
      c.globalCompositeOperation = "source-in"; c.fillStyle = "rgba(95,227,255,0.85)"; c.fillRect(0, 0, W, H); c.globalCompositeOperation = "source-over";
    }} />
    <Halo p={rot ? [0, 0, 0] : [0, h * 0.55, -0.1]} r={h * 0.6} color={CYAN} o={0.35 * o} />
  </group>
);
/** dark SILHOUETTE swimmer (freediver / safety buddy) with long fins, drawn on a panel; `rot` z = PI -> head down */
const Diver: React.FC<{ p: V3; f: number; h?: number; rotZ?: number; arms?: Pose["arms"]; kick?: number; color?: string }> = ({ p, f, h = 2.5, rotZ = 0, arms = "up", kick = 1, color = "#164670" }) => {
  const H2 = h * 1.25, W2 = h * 512 / 768;
  const fk = Math.round(Math.sin(f * 0.18) * 8 * kick);
  return <group position={p} rotation={[0, 0, rotZ]}>
    <Panel p={[0, H2 / 2 - h * 0.25, 0]} s={[W2, H2]} px={[256, 480]} dep={`${fk}-${arms}`} draw={(c, W) => {
      drawPuppet(c, W, 384, { skin: "#000", body: "#000", outfit: "hoodie", hair: "short", hairColor: "#000", shoe: "#000" }, { t: 0, arms, mood: "deadpan" });
      // fins below the feet
      c.fillStyle = "#000";
      [-1, 1].forEach((s) => { const k2 = s * fk; c.beginPath(); c.moveTo(W / 2 + s * 14 - 10, 372); c.lineTo(W / 2 + s * 14 + 10, 372); c.lineTo(W / 2 + s * 30 + k2 + 16, 478); c.lineTo(W / 2 + s * 30 + k2 - 22, 478); c.closePath(); c.fill(); });
      c.globalCompositeOperation = "source-in"; c.fillStyle = color; c.fillRect(0, 0, W, 480); c.globalCompositeOperation = "source-over";
    }} />
  </group>;
};
/** splash: ring + a few white droplets flying out (abstract, friendly) */
const Splash: React.FC<{ p: V3; u: number; at: number; s?: number }> = ({ p, u, at, s = 1 }) => {
  const q = (u - at) / 18; if (q < 0 || q > 1) return null;
  return <group position={p}>
    {Array.from({ length: 9 }, (_, i) => { const a = i * 0.7, r = q * 1.1 * s; return <Ball key={i} p={[Math.cos(a) * r, Math.sin(q * Math.PI) * (0.5 + (i % 3) * 0.25) * s, Math.sin(a) * r * 0.6]} r={0.07 * s * (1 - q * 0.6)} color="#f4fdff" ink={0} />; })}
    <Halo p={[0, 0.2, 0]} r={1.2 * s} color="#ffffff" o={0.5 * (1 - q)} />
  </group>;
};

// ---------------------------------------------------------------- worlds
/** sunny sea + wooden pier (deck top y 1.2, from z 5.6 to z -12), beach strip + city far away */
const DECK = 1.2;
const PierWorld: React.FC<{ t: number; hero?: V3; warm?: number; waterO?: number; glint?: number }> = ({ t, hero = [0, DECK, 1.5], warm = 0, waterO = 0.8, glint = 0.32 }) => (<>
  <DaySky fogNear={50} fogFar={230} warm={warm} />
  <SunRig target={hero} />
  <mesh position={[0, -5, -60]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[400, 400]} /><meshLambertMaterial color={disp("#d9c79c")} /></mesh>
  <Caustics t={t} p={[0, -4.95, -10]} s={[80, 80]} rep={14} o={0.3} />
  <WaterSurface t={t} p={[0, 0, -40]} s={[400, 400]} color="#2fa8d0" o={waterO} glint={glint} rep={70} />
  <Surface lit p={[0, 0.15, -85]} s={[420, 34]} rot={[-Math.PI / 2, 0, 0]} kind="plain" a={disp(DAY.sand)} b={disp("#e2bb83")} unit={4} />
  <Palms at={[[-30, 0.15, -78], [-14, 0.15, -82], [8, 0.15, -80], [26, 0.15, -77], [44, 0.15, -83]]} s={1.6} />
  <CityBackdrop z={-110} spread={170} />
  <Clouds t={t} at={[[-30, 28, -120], [24, 34, -140], [55, 24, -110], [-60, 22, -90]]} s={5} />
  <Glb name="pier" p={[0, 0, 4]} line={2} fallback={<Box p={[0, DECK - 0.1, -3]} s={[3.4, 0.2, 17]} color="#c99a63" line={2} />} />
  <Glb name="buoy" p={[9, 0, -26]} s={1.2} line={2} />
  <Glb name="buoy" p={[-12, 0, -38]} s={1.2} line={2} />
</>);
/** cold grey-blue lake: pebble shore at the front (z > -1), still lake, dark green hills, life ring post */
const ColdWorld: React.FC<{ t: number; target?: V3 }> = ({ t, target = [0, 1, 0] }) => (<>
  <DaySky top="#7f9cb8" horizon="#d2dce5" haze="#c8d3dd" fogNear={24} fogFar={150} />
  <SunRig target={target} dir={[-5, 9, 6]} k={0.7} fill={1.15} />
  <mesh position={[0, -4, -60]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[400, 400]} /><meshLambertMaterial color={disp("#6d7a72")} /></mesh>
  <WaterSurface t={t} p={[0, 0, -60]} s={[400, 400]} color="#557f97" o={0.86} glint={0.2} rep={60} />
  <Surface lit p={[0, 0.06, 7]} s={[90, 16]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#a9a294")} b={disp("#9c9586")} unit={0.9} />
  <mesh position={[0, 0.03, -1.3]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[90, 1.0]} /><meshBasicMaterial color={disp("#eef5f8")} transparent opacity={0.55} depthWrite={false} /></mesh>
  {[[-6, 0.1, 3, 0.7], [-4.2, 0.1, 5.5, 0.45], [5.5, 0.1, 2.2, 0.6], [7.5, 0.1, 4.5, 0.9], [-9, 0.1, 1.5, 0.8]].map(([x, y, z, r], i) => <Ball key={i} p={[x, y, z]} r={r} s={[1.3, 0.6, 1]} color={disp("#8e8f8c")} />)}
  {[[-60, -95, 26], [-15, -110, 32], [35, -100, 24], [80, -115, 30]].map(([x, z, r], i) => <Ball key={i} p={[x, -4, z]} r={r} s={[1.6, 0.55, 1]} color={disp(i % 2 ? "#5d7a6b" : "#6c8676")} ink={0.02} />)}
  <Glb name="life_ring_post" p={[3.2, 0.06, 1.2]} rot={[0, -0.3, 0]} line={2} blob={0.5} fallback={<Cyl p={[3.2, 1.2, 1.2]} rt={0.1} h={2.5} color="#8a6440" />} />
  <Glb name="buoy" p={[-4, 0, -14]} s={1.1} line={2} />
  <Clouds t={t} at={[[-30, 20, -100], [10, 26, -120], [45, 18, -90], [-70, 24, -110], [70, 30, -130]]} s={6} />
  <Motes t={t} c={[0, 1.2, 0]} area={[8, 2.2, 4]} n={22} color="#ffffff" size={0.05} o={0.55} />
</>);
/** sunny pool: cream deck, pool basin x -4..4, z -9..1 (water y -0.25, floor y -2.4), ladder on the right wall,
 *  lifeguard chair at the back left (lifeguard always on watch), dive rings on the floor */
const PX = 4, PZ0 = -9, PZ1 = 1, WY = -0.25, FY = -2.4;
const CHAIR: V3 = [-4.6, 0, -10.8];
const PoolBasin: React.FC<{ t: number }> = ({ t }) => {
  const W = PX * 2, L = PZ1 - PZ0, cz = (PZ0 + PZ1) / 2, D = -FY;
  const tile = { kind: "tile" as const, a: disp("#bfe8f5"), b: disp("#a9dcee"), unit: 0.5 };
  return <>
    <Surface lit p={[0, FY, cz]} s={[W, L]} rot={[-Math.PI / 2, 0, 0]} {...tile} />
    {[-2, 0, 2].map((x) => <mesh key={x} position={[x, FY + 0.01, cz]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.3, L - 1.4]} /><meshLambertMaterial color={disp("#24628f")} /></mesh>)}
    <Surface lit p={[0, FY / 2, PZ0]} s={[W, D]} {...tile} />
    <Surface lit p={[0, FY / 2, PZ1]} s={[W, D]} rot={[0, Math.PI, 0]} {...tile} />
    <Surface lit p={[-PX, FY / 2, cz]} s={[L, D]} rot={[0, Math.PI / 2, 0]} {...tile} />
    <Surface lit p={[PX, FY / 2, cz]} s={[L, D]} rot={[0, -Math.PI / 2, 0]} {...tile} />
    <Caustics t={t} p={[0, FY + 0.03, cz]} s={[W, L]} rep={3} o={0.4} />
    {[[-1.4, -5.2, CORAL], [0.3, -4.2, GOLD], [1.6, -6.0, "#5fd0ff"]].map(([x, z, c], i) => <mesh key={i} position={[x as number, FY + 0.08, z as number]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.32, 0.07, 8, 28]} /><meshLambertMaterial color={disp(c as string)} /></mesh>)}
    <Glb name="pool_ladder" p={[PX, 0, -3.4]} rot={[0, -Math.PI / 2, 0]} line={2} />
  </>;
};
const PoolWorld: React.FC<{ t: number; target?: V3; guard?: boolean }> = ({ t, target = [0, 0, -2], guard = true }) => {
  const W = PX * 2, cz = (PZ0 + PZ1) / 2;
  const deck = { kind: "tile" as const, a: disp("#f4ead8"), b: disp("#ebdfc8"), unit: 1.2 };
  return <>
    <DaySky fogNear={45} fogFar={200} />
    <SunRig target={target} dir={[6, 10, 5]} />
    <DayGround base={DAY.grass} speck="#6fae52" y={-3} z={-60} />
    {/* deck around the pool hole */}
    <Surface lit p={[0, 0.01, PZ1 + 20]} s={[80, 40]} rot={[-Math.PI / 2, 0, 0]} {...deck} />
    <Surface lit p={[0, 0.01, PZ0 - 20]} s={[80, 40]} rot={[-Math.PI / 2, 0, 0]} {...deck} />
    <Surface lit p={[-(PX + 20), 0.01, cz]} s={[40, PZ1 - PZ0]} rot={[-Math.PI / 2, 0, 0]} {...deck} />
    <Surface lit p={[PX + 20, 0.01, cz]} s={[40, PZ1 - PZ0]} rot={[-Math.PI / 2, 0, 0]} {...deck} />
    {/* white coping */}
    <Box p={[0, 0.04, PZ0 - 0.15]} s={[W + 0.6, 0.1, 0.3]} color={disp("#fbf8f0")} line={1} />
    <Box p={[0, 0.04, PZ1 + 0.15]} s={[W + 0.6, 0.1, 0.3]} color={disp("#fbf8f0")} line={1} />
    <Box p={[-PX - 0.15, 0.04, cz]} s={[0.3, 0.1, PZ1 - PZ0]} color={disp("#fbf8f0")} line={1} />
    <Box p={[PX + 0.15, 0.04, cz]} s={[0.3, 0.1, PZ1 - PZ0]} color={disp("#fbf8f0")} line={1} />
    <PoolBasin t={t} />
    <WaterSurface t={t} p={[0, WY, cz]} s={[W, PZ1 - PZ0]} color="#3cc3e8" o={0.5} glint={0.38} rep={4} />
    <Glb name="lifeguard_chair" p={CHAIR} rot={[0, 0.3, 0]} line={2} blob={1.2} fallback={<Box p={[CHAIR[0], 1.2, CHAIR[2]]} s={[1, 2.4, 1]} color="#fffaf0" line={2} />} />
    {guard && <Person p={[CHAIR[0] + 0.16, 1.73, CHAIR[2] + 0.53]} h={2.3} look={GUARD} pose={{ mood: "smile", arms: "down", lookX: 0.4 }} f={0} shadow={false} />}
    <Palms at={[[-12, 0, -14], [11, 0, -15], [-16, 0, 2], [15, 0, 0], [3, 0, -22]]} s={1.3} />
    <CityBackdrop z={-80} spread={160} />
    <Clouds t={t} at={[[-30, 28, -110], [26, 34, -130], [55, 24, -100]]} s={5} />
  </>;
};

// ---------------------------------------------------------------- shot builder
type View = { world: React.ReactNode; hud?: React.ReactNode };
const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number, sub: number, us: number, ls: number): View => {
  const t = f / FPS;
  switch (id) {
    case "hook": {
      // sub 0 = CRANE + LAND: drops from high over the sea and lands level on Remy at the end of the sunny pier (WHAT IF #6)
      // sub 1 = TOP-DOWN (lowering): straight down into the clear water beside the pier: the cyan GAME swimmer glides
      //         along the sandy bottom while the cyan air bar barely moves; the gold real bar appears, already dropping
      const LT = C("Let's test that.", 110);
      const R: V3 = [0, DECK, 1.5];
      if (!sub) {
        const world = <>
          <PierWorld t={t} hero={R} />
          <Hero p={R} look={REMY} pose={{ mood: "smile", arms: "down", lookX: 0.2 }} f={f} rimO={0.4} />
          <Move us={us} ls={ls} at={line({ pos: [1.6, 13, 19], look: [0, 1.8, 0], fov: 46 }, { pos: [0.8, 4.0, 10.8], look: [0, 2.7, 1.5], fov: 46 })} />
        </>;
        const wp = k(u, 0, 34, 0.42, 1, EASE.arrive);
        return { world, hud: <><StrokeWord text="WHAT IF" x={540} y={565} h={125} p={wp} /><HudText f={u} x={540} y={415} size={56} color={AMBER} at={22}>#6</HudText></> };
      }
      const T: V3 = [5, 0, -2];
      const gz = 2.6 - 6.2 * clamp(us / Math.max(1, ls + 20));
      const world = <>
        <PierWorld t={t} hero={T} waterO={0.5} glint={0.12} />
        <Ghost p={[T[0] - 0.2, -2.2, gz]} h={3.0} rot={[-Math.PI / 2, 0, 0.12 * Math.sin(f * 0.08)]} f={f} o={0.85} pose={{ mood: "grin", arms: "up", walk: f * 0.25, speed: 0.6 }} />
        <Bubbles p={[T[0] - 0.2, -3.0, gz - 1.2]} t={t} n={8} rise={3} spread={0.3} />
        <Move us={us} ls={ls} at={line({ pos: [T[0], 16, T[2] + 0.4], look: [T[0], -2, T[2]], fov: 46 }, { pos: [T[0], 7.5, T[2] + 0.3], look: [T[0], -2, T[2]], fov: 46 })} />
      </>;
      const air = 1 - 0.03 * clamp(us / Math.max(1, ls));
      const hud = <>
        <AirBar f={us} y={360} fill={air} kind="game" at={3} />
        <AirBar f={u} y={500} fill={1 - k(u, LT, LT + 40, 0, 0.35, Easing.linear)} kind="real" at={LT - 6} />
      </>;
      return { world, hud };
    }
    case "test1": { // TRACKING (lead): Remy walks down the pier toward us, cheeks full (holding his breath); the camera backs up ahead of him; the cyan air bar barely moves
      const IG = C("In the game,", 35);
      const e = shotE(us, ls);
      const z = -6 + 6.5 * e, R: V3 = [0, DECK, z];
      const world = <>
        <PierWorld t={t} hero={[0, DECK, 0]} />
        <Hero p={R} look={REMY} pose={{ mood: "gulp", arms: "down", walk: u * 0.3, speed: e < 0.97 ? 1 : 0, squash: 0.03 }} f={f} rimO={0.35} />
        <Move us={us} ls={ls} at={() => ({ pos: [1.0, 3.6, z + 8.6], look: [0, 2.5, z - 0.5], fov: 46 })} />
      </>;
      const fill = 1 - 0.04 * k(u, IG, len, 0, 1, Easing.linear);
      const hud = <>
        <TestTracker f={u} at={4} active={0} out={len - 8} />
        <AirBar f={u} y={560} fill={fill} kind="game" at={IG - 8} />
      </>;
      return { world, hud };
    }
    case "land": { // PUSH-IN: from a medium shot into Remy holding his breath with the stopwatch; the gold real timer runs, the 30-90 s zone lights up
      const TN = C("thirty to ninety", 60), SE = C("seconds.", 85);
      const R: V3 = [0, DECK, 1.5];
      const sec = k(u, 6, len + 30, 0, 75, Easing.linear);
      const world = <>
        <PierWorld t={t} hero={R} />
        <Hero p={R} look={REMY} pose={{ mood: u > SE + 10 ? "worry" : "gulp", arms: "hold", squash: 0.03 }} f={f} rimO={0.4} />
        <Watch p={R} sec={sec} />
        <Move us={us} ls={ls} at={line({ pos: [0.7, 3.3, 10.0], look: [0, 2.5, 1.5], fov: 46 }, { pos: [0.3, 2.85, 6.2], look: [0, 2.55, 1.5], fov: 46 })} />
      </>;
      const hud = <BreathTimer f={u} y={380} at={4} fill={sec / 120} ticks={4} zone={[0.25, 0.75]} clock={mss(sec)} value="30-90 S" valueAt={Math.max(TN + 6, SE + 2)} />;
      return { world, hud };
    }
    case "freediver": { // CRANE DOWN (descend): the camera sinks with a freediver gliding head-down along the buoy line into deep blue; a safety buddy watches from above
      const SM = C("several minutes.", 80);
      const e = shotE(us, ls);
      const dy = -2.2 - 4.6 * e;
      const world = <>
        <UnderwaterWorld t={t} surfaceY={0} fogNear={2} fogFar={26} />
        <SunRig target={[0, -5, 0]} dir={[3, 12, 4]} k={0.6} fill={1.2} />
        <LightShafts at={[[-3, -3], [1.5, -6], [4, -2], [-6, -8], [6, -10]]} len={18} t={t} o={0.2} />
        <Glb name="buoy" p={[0, 0, 0]} line={2} fallback={<Cyl p={[0, -7, 0]} rt={0.02} h={14} color="#f2e6c8" line={0} />} />
        <Diver p={[0.55, dy, -0.4]} f={f} h={2.0} rotZ={Math.PI} arms="up" />
        <Bubbles p={[0.55, dy - 1.2, 0.1]} t={t} n={9} rise={4} />
        <Diver p={[-2.2, -1.9, -0.6]} f={f} h={1.8} arms="down" kick={0.5} color="#1d527f" />
        <Motes t={t} c={[0, dy, 1]} area={[5, 5, 3]} n={24} color="#e9fbff" size={0.04} o={0.6} />
        <Move us={us} ls={ls} at={() => ({ pos: [2.4, -1.2 - 4.6 * e, 9.6], look: [0, -2.4 - 4.6 * e, -0.4], fov: 46 })} />
      </>;
      const hud = <BreathTimer f={u} y={380} at={6} fill={k(u, 10, len, 0.12, 0.42, Easing.out(Easing.cubic))} ticks={12} value="SEVERAL MIN" valueAt={SM + 14} />;
      return { world, hud };
    }
    case "record": { // ORBIT: a slow arc around the freediver rising beside the line, the safety buddy coming down to meet him; the record clock counts to 11:35
      const EM = C("eleven minutes.", 70);
      const REC = 11 * 60 + 35;
      const secs = u < EM ? k(u, 4, EM, 0, REC * 0.92, Easing.inOut(Easing.quad)) : k(u, EM, EM + 10, REC * 0.92, REC, Easing.out(Easing.cubic));
      const dy = -6.4 + 1.0 * clamp(us / Math.max(1, ls));
      const world = <>
        <UnderwaterWorld t={t} surfaceY={0} fogNear={2} fogFar={26} />
        <SunRig target={[0, -5, 0]} dir={[3, 12, 4]} k={0.6} fill={1.2} />
        <LightShafts at={[[-3, -3], [1.5, -6], [4, -2], [-6, 2], [6, 4]]} len={18} t={t} o={0.2} />
        <Glb name="buoy" p={[0, 0, 0]} line={2} />
        <Diver p={[0.6, dy, 0.1]} f={f} h={2.0} arms="down" kick={0.6} />
        <Diver p={[-1.5, -4.2, -0.2]} f={f} h={1.8} arms="down" kick={0.4} color="#1d527f" />
        <Bubbles p={[0.6, dy + 2.4, 0.1]} t={t} n={6} rise={3} />
        <Motes t={t} c={[0, -5, 1]} area={[5, 4, 3]} n={24} color="#e9fbff" size={0.04} o={0.6} />
        <Move us={us} ls={ls} at={orbit([0, -4.8, 0], 10.5, 0.9, -0.55, 0.3, 44)} />
      </>;
      const pin = arrive(u, 6, 12);
      const hud = <>
        <Plate x={160} y={420} w={760} h={250} o={pin} r={30} />
        <IconTile f={u} x={290} y={545} at={8} icon="trophy" r={70} />
        <Digits x={640} y={600} size={150} text={mss(secs)} color={u > EM + 4 ? GOLD : CREAM} o={pin} />
        {u > EM + 2 && <rect x={170} y={430} width={740} height={230} rx={28} fill="none" stroke="#ffffff" strokeWidth={6} opacity={Math.max(0, 1 - Math.abs(u - EM - 8) / 8)} />}
      </>;
      return { world, hud };
    }
    case "test2": { // PULL BACK (reveal): from the cyan game swimmer lounging in the water back to the cold grey-blue lake; Remy stays on the shore in his jacket, the lifeguard by the ring post
      const IG = C("In the game,", 35);
      const R: V3 = [-0.9, 0.06, 2.8];
      const world = <>
        <ColdWorld t={t} target={[0, 1, 0]} />
        <Ghost p={[1.2, -0.75, -3.0]} f={f} o={k(u, 2, 10, 0, 0.85)} pose={{ mood: "grin", arms: "head" }} />
        <Ripples p={[1.2, 0, -3.0]} t={t} r={1.6} o={0.4} />
        <Hero p={R} look={REMY} pose={{ mood: "worry", arms: "chest", nerv: 0.7 }} f={f} rimO={0.35} />
        <Person p={[4.2, 0.06, 0.9]} h={2.4} look={GUARD} pose={{ mood: "smile", arms: "down", lookX: -0.4 }} f={f} shadow={false} />
        <Move us={us} ls={ls} at={line({ pos: [1.4, 1.7, 3.6], look: [1.2, 0.6, -3.0], fov: 46 }, { pos: [0.2, 3.8, 14.0], look: [-0.1, 1.6, -0.5], fov: 46 })} />
      </>;
      const hud = <>
        <TestTracker f={u} at={4} active={1} out={len - 8} />
        <IconTile f={u} x={540} y={640} at={IG + 4} icon="therm" extra="up" color={CYAN} />
      </>;
      return { world, hud };
    }
    case "gasp": { // LOW ANGLE: from the waterline, looking up at Remy as an icy wave washes over his shoes; he gasps (safe on the shore, the lifeguard behind)
      const GP = C("makes you gasp", 35), FM = C("first minute,", 60);
      const R: V3 = [0, 0.06, 0.6];
      const world = <>
        <ColdWorld t={t} target={R} />
        <mesh position={[0, 0.08, 0.2 + 0.5 * Math.sin(Math.min(1, u / 30) * Math.PI)]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[14, 2.2]} /><meshLambertMaterial color={disp("#8fb6c9")} transparent opacity={0.7} depthWrite={false} /></mesh>
        <Splash p={[0, 0.1, 0.8]} u={u} at={GP - 10} s={1.3} />
        <Hero p={R} look={REMY} pose={{ mood: u > GP - 6 ? "shock" : "worry", arms: u > GP - 6 ? "chest" : "down", nerv: 0.8, squash: u > GP - 6 && u < GP + 10 ? 0.06 : 0 }} f={f} rimO={0.35} />
        <Person p={[2.5, 0.06, -0.6]} h={2.4} look={GUARD} pose={{ mood: "smile", arms: "down", lookX: -0.5 }} f={f} shadow={false} />
        <Move us={us} ls={ls} at={line({ pos: [0.9, 0.45, 8.4], look: [0.2, 2.7, 0.6], fov: 48 }, { pos: [0.6, 0.5, 7.0], look: [0.1, 2.7, 0.6], fov: 48 })} />
      </>;
      const hud = <>
        <IconTile f={u} x={540} y={470} at={4} icon="snow" out={GP - 6} />
        <IconTile f={u} x={540} y={470} at={GP} icon="lungs" extra="burst" />
        <AirBar f={u} y={640} fill={1 - k(u, GP, FM + 20, 0, 0.6, Easing.out(Easing.cubic))} kind="real" at={GP + 4} />
      </>;
      return { world, hud };
    }
    case "rule": {
      // sub 0 = PUSH-IN: on Remy (now in a life jacket) and the lifeguard at the rescue ring post; the 1-10-1 numbers rise
      // sub 1 = TRACKING / TRUCK: the camera trucks sideways with the two along the cold shore; the three tiles light on their cues
      const ON = C("the one, ten,", 40), OM = C("One minute to", 110), AT = C("About ten minutes", 160), AH = C("Around an hour", 230);
      const e = shotE(us, ls);
      const x = sub ? -2.4 + 3.0 * e : -0.8;
      const R: V3 = [x, 0.06, 1.6], G: V3 = [x + 1.7, 0.06, 1.1];
      const walking = sub && e < 0.97;
      const world = <>
        <ColdWorld t={t} target={[x, 1, 1]} />
        <Hero p={R} look={REMY} pose={{ mood: "smile", arms: "down", walk: walking ? u * 0.3 : 0, speed: walking ? 0.8 : 0 }} f={f} rimO={0.35} />
        <Jacket p={R} />
        <Hero p={G} look={GUARD} pose={{ mood: "smile", arms: sub ? "down" : "point", armK: 0.7, lookX: -0.4, walk: walking ? u * 0.3 : 0, speed: walking ? 0.8 : 0 }} f={f} h={2.45} rimO={0.3} />
        {sub ? <Move us={us} ls={ls} at={() => ({ pos: [x + 1.0, 2.9, 12.4], look: [x + 0.85, 2.0, 0.8], fov: 46 })} />
          : <Move us={us} ls={ls} at={line({ pos: [0.3, 2.9, 13.2], look: [0.05, 2.0, 1.0], fov: 46 }, { pos: [0.15, 2.6, 9.6], look: [0.05, 2.1, 1.2], fov: 46 })} />}
      </>;
      const hud = sub ? <RuleTiles f={u} y={520} at={[OM - 2, AT - 2, AH - 2]} />
        : <>
          <Plate x={250} y={360} w={580} h={200} o={arrive(u, ON - 8, 10)} r={30} />
          <HudText f={u} x={540} y={510} size={150} color={GOLD} at={ON - 4} spacing={4}>1-10-1</HudText>
        </>;
      return { world, hud };
    }
    case "test3": { // CRANE + LAND: from high above the sunny pool the camera descends and lands at the deck; the cyan game swimmer lies on the bottom, its air bar barely moves; lifeguard on the chair
      const IG = C("In the game,", 40);
      const R: V3 = [-1.2, 0, 2.8];
      const world = <>
        <PoolWorld t={t} target={[0, 0, -2]} />
        <Ghost p={[1.0, FY + 0.15, -3.8]} rot={[-Math.PI / 2, 0, 0.5]} f={f} o={k(u, IG - 10, IG, 0, 0.9)} pose={{ mood: "grin", arms: "up" }} />
        <Bubbles p={[1.0, FY + 0.3, -4.6]} t={t} n={6} rise={2} spread={0.2} />
        <Hero p={R} look={REMY} pose={{ mood: "smile", arms: "down", lookX: 0.4 }} f={f} rimO={0.35} />
        <Move us={us} ls={ls} at={line({ pos: [1.2, 15, 15], look: [0, -0.5, -3], fov: 46 }, { pos: [0.6, 3.6, 10.6], look: [0, 0.8, -2.0], fov: 46 })} />
      </>;
      const hud = <>
        <TestTracker f={u} at={4} active={2} out={len - 8} />
        <AirBar f={u} y={560} fill={1 - 0.03 * k(u, IG, len, 0, 1, Easing.linear)} kind="game" at={IG - 6} />
      </>;
      return { world, hud };
    }
    case "blackout": { // DOLLY ZOOM (vertigo): under the water of the EMPTY pool, the camera glides toward the dive rings as the FOV widens and the pool walls stretch away; the coral warning comes up
      const BO = C("black out", 60), WW = C("without warning.", 75);
      const world = <>
        <UnderwaterWorld t={t} surfaceY={WY} top="#d2f6ff" mid="#46b3df" deep="#1f78b0" fogNear={4} fogFar={30} />
        <SunRig target={[0, FY, -4]} dir={[3, 12, 5]} k={0.7} fill={1.2} />
        <PoolBasin t={t} />
        <LightShafts at={[[-2.5, -3], [1.0, -6], [2.8, -1.5], [-1, -8]]} surfaceY={WY} len={4} w={0.9} t={t} o={0.28} lean={0.22} />
        <Bubbles p={[-1.5, FY + 0.1, -6.5]} t={t} n={6} rise={2.2} spread={0.25} size={0.05} />
        <Bubbles p={[2.2, FY + 0.1, -2.5]} t={t * 0.8} n={5} rise={2.2} spread={0.25} size={0.05} />
        <Move us={us} ls={ls} at={dollyZoom([0.2, FY + 0.2, -5.0], [0.05, 0.22, 1], 9.5, 3.6, 34)} />
      </>;
      const real = 1 - k(u, 6, BO + 10, 0, 0.9, Easing.in(Easing.quad));
      const hud = <>
        <AirBar f={u} y={360} fill={real} kind="real" at={4} out={WW + 12} />
        <WarnSign f={u} x={540} y={560} at={WW + 16} s={1.1} />
        <HudText f={u} x={540} y={770} size={92} color={CORAL} at={WW + 22} spacing={2}>BLACKOUT</HudText>
        <HudText f={u} x={540} y={860} size={58} color={CREAM} at={WW + 28}>NO WARNING</HudText>
      </>;
      return { world, hud };
    }
    case "safety": { // LOW HERO ANGLE: from the deck tiles up at Remy and his buddy at the pool edge, the lifeguard on the tall chair behind them; never-alone + breathe icons
      const AL = C("underwater alone,", 55), UB = C("urge to breathe.", 110);
      const R: V3 = [-0.9, 0, 2.8], B: V3 = [0.9, 0, 2.6];
      const world = <>
        <PoolWorld t={t} target={[0, 1, 1]} />
        <Hero p={R} look={REMY} pose={{ mood: "smile", arms: "down", lookX: 0.3 }} f={f} rimO={0.4} />
        <Hero p={B} look={BUDDY} pose={{ mood: "grin", arms: "down", lookX: -0.3, flip: true }} f={f} h={2.4} rimO={0.4} />
        <Move us={us} ls={ls} at={line({ pos: [0.5, 0.45, 13.6], look: [-0.6, 2.0, 0.5], fov: 48 }, { pos: [0.3, 0.55, 12.0], look: [-0.6, 2.0, 0.5], fov: 48 })} />
      </>;
      const hud = <>
        <IconTile f={u} x={380} y={470} at={AL - 2} icon="person" strike={k(u, AL + 4, AL + 16, 0, 1)} />
        <IconTile f={u} x={700} y={470} at={UB - 6} icon="lungs" extra="up" />
      </>;
      return { world, hud };
    }
    case "surface": {
      // sub 0 = ORBIT: around Remy popping up at the surface in his life jacket, his buddy beside him, ripples spreading; the cyan game air bar refills in a blink
      // sub 1 = PULL BACK (reveal): from the two at the ladder back to the whole sunny pool with the lifeguard; two gold "extra life" hearts (+1, +1)
      const RS = C("refills at the", 40), BD = C("a buddy and", 100), LJ = C("a life jacket", 120);
      const pop = sub ? 1 : k(u, 0, 14, 0, 1, Easing.out(Easing.cubic));
      const R: V3 = [-0.2, WY - 1.15 - 0.5 * (1 - pop), -2.6], B: V3 = [1.6, WY - 1.05, -3.0];
      const world = <>
        <PoolWorld t={t} target={[0.5, 0, -2.6]} />
        <Person p={R} look={REMY} pose={{ mood: sub ? "grin" : "laugh", arms: sub ? "up" : "down", armK: 0.6 }} f={f} shadow={false} />
        <Jacket p={R} />
        <Person p={B} h={2.4} look={BUDDY} pose={{ mood: "grin", arms: "down", lookX: -0.4, flip: true }} f={f} shadow={false} />
        <Jacket p={B} h={2.4} />
        <Ripples p={[R[0], WY, R[2]]} t={t} r={1.8} o={0.55} />
        <Ripples p={[B[0], WY, B[2]]} t={t + 0.7} r={1.4} o={0.45} />
        <Splash p={[R[0], WY, R[2]]} u={u} at={0} s={1.0} />
        {sub ? <Move us={us} ls={ls} at={line({ pos: [1.2, 1.4, 3.6], look: [0.6, 0.3, -2.8], fov: 46 }, { pos: [1.6, 5.6, 14.5], look: [-0.5, 0.6, -3.2], fov: 46 })} />
          : <Move us={us} ls={ls} at={orbit([0.6, -0.4, -2.8], 7.6, 2.0, -0.5, 0.2, 44)} />}
      </>;
      const hud = sub ? <>
        {[[BD - 2, "buddy", 380], [LJ - 2, "vest", 700]].map(([at, ic, x]) => <g key={ic as string}>
          <IconTile f={u} x={x as number} y={500} at={at as number} icon="heart" r={92} />
          {u >= (at as number) && <g transform={`translate(${x} 494) scale(0.62)`} opacity={drawOn(u, (at as number) + 4, 10)}><NeonPath d={ICON[ic as string]} w={6} color="#0b0d1a" /></g>}
          <HudText f={u} x={(x as number) + 92} y={430} size={54} color={GOLD} at={(at as number) + 6}>+1</HudText>
        </g>)}
      </> : <AirBar f={u} y={360} fill={u < RS ? 0.25 : k(u, RS, RS + 8, 0.25, 1, Easing.out(Easing.cubic))} kind="game" at={2} flash={RS + 2} />;
      return { world, hud };
    }
    default: { // ask - PUSH-IN: a gentle push back on the sunny pier toward Remy with his stopwatch; the question card (A-D)
      const R: V3 = [0, DECK, 1.5];
      const world = <>
        <PierWorld t={t} hero={R} warm={0.4} />
        <Hero p={R} look={REMY} pose={{ mood: "grin", arms: "hold" }} f={f} rimO={0.45} />
        <Watch p={R} sec={u * 0.5} />
        <Move us={us} ls={ls} at={line({ pos: [1.0, 3.4, 13.5], look: [0, 2.3, 1.5], fov: 46 }, { pos: [0.6, 3.2, 10.4], look: [0, 2.5, 1.5], fov: 46 })} />
      </>;
      const hud = <>
        <HudText f={u} x={540} y={420} size={60} color={CREAM} at={4} out={len + 30}>COMMENT</HudText>
        <HudText f={u} x={540} y={505} size={76} color={GOLD} at={8} out={len + 30}>A, B, C OR D</HudText>
        <ChoiceCards f={u} y={720} at={12} cw={470} ch={130} cards={[{ letter: "A", text: "UNDER 30 S" }, { letter: "B", text: "30-60 S" }, { letter: "C", text: "60-90 S" }, { letter: "D", text: "OVER 90 S" }]} />
      </>;
      return { world, hud };
    }
  }
};

// ---------------------------------------------------------------- scene: one WebGL canvas per shot + SVG HUD on top
const renderDpr = () => Number((getInputProps() as { dpr?: number }).dpr ?? 0.5);
const cueLocal = (words: Word[], phrase: string, span: ShotSpan, fallback: number) => {
  try { return Math.round(cueTime(words, phrase, span.a / FPS - 0.3) * FPS) - span.a; } catch { return fallback; }
};
/** SHAPE MORPH (every place change): the outgoing key object squashes ~8%, grows to fill the frame and floods with the
 *  next scene's background colour; the next shot eases in 93% -> 100% while the flood clears. No cross dissolve. */
type MorphProps = { cx: number; cy: number; w: number; h: number; r: number; color: string };
const MorphPres: React.FC<TransitionPresentationComponentProps<MorphProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps: m }) => {
  if (presentationDirection === "exiting") {
    const sq = p < 0.18 ? Math.sin((p / 0.18) * Math.PI) * 0.08 : 0;
    const g = Easing.in(Easing.cubic)(clamp((p - 0.18) / 0.42));
    const sc = 1 + g * (2600 / Math.min(m.w, m.h));
    const w = m.w * sc * (1 + sq), h = m.h * sc * (1 - sq);
    return <AbsoluteFill>{children}<div style={{ position: "absolute", left: m.cx - w / 2, top: m.cy - h / 2, width: w, height: h, borderRadius: m.r * sc, background: m.color, opacity: clamp(p / 0.12) }} /></AbsoluteFill>;
  }
  if (p < 0.6) return <AbsoluteFill style={{ opacity: 0 }}>{children}</AbsoluteFill>;
  const q = Easing.out(Easing.cubic)(clamp((p - 0.6) / 0.4));
  return <AbsoluteFill><AbsoluteFill style={{ transform: `scale(${0.93 + 0.07 * q})` }}>{children}</AbsoluteFill><AbsoluteFill style={{ background: m.color, opacity: 1 - q }} /></AbsoluteFill>;
};
const morph = (m: MorphProps): TransitionPresentation<MorphProps> => ({ component: MorphPres, props: m });
/** one shot = its own WebGL canvas + HUD; animation clock = the parent scene (u), camera clock = this shot (us) */
const ShotView: React.FC<{ span: ShotSpan; pa: number; pb: number; words: Word[] }> = ({ span, pa, pb, words }) => {
  const us = useCurrentFrame();
  const f = span.a + us, u = f - pa, len = pb - pa, ls = span.b - span.a;
  const d = DEF[span.id];
  const parentSpan: ShotSpan = { id: d.parent, a: pa, b: pb, i: span.i };
  const v = build(d.parent, f, u, len, (p, fb) => cueLocal(words, p, parentSpan, fb), d.sub, us, ls);
  return (
    <AbsoluteFill style={{ background: N3.bg }}>
      <ThreeCanvas width={1080} height={1920} dpr={renderDpr()} linear flat shadows="soft" gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }}>
        <color attach="background" args={[disp(DAY.skyHorizon)]} />
        <group>{v.world}</group>
        <ShadowSetup />
      </ThreeCanvas>
      <Grade t={f / FPS} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,14,30,.5) 0%, rgba(10,14,30,.38) 26%, rgba(10,14,30,.16) 40%, rgba(10,14,30,0) 50%)" }} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}><NeonDefs />{v.hud || null}</svg>
    </AbsoluteFill>
  );
};
/** the edit: hard cuts on beat changes; a shape morph on every place change (the outgoing shot is extended by the
 *  transition length so every cut still lands on its narration cue) */
const Scene: React.FC<SceneProps> = ({ spans, words }) => {
  const parentOf = (id: string) => DEF[id].parent;
  const range = (p: string) => { const ss = spans.filter((x) => parentOf(x.id) === p); return [ss[0].a, ss[ss.length - 1].b]; };
  const out: React.ReactNode[] = [];
  spans.forEach((sp, i) => {
    const next = spans[i + 1];
    const tr = next && PLACE[DEF[next.id].parent] !== PLACE[DEF[sp.id].parent] ? morph({ ...(KEY_OBJ[sp.id] ?? KEY_DEF), color: BG[DEF[next.id].parent] }) : undefined;
    const [pa, pb] = range(parentOf(sp.id));
    out.push(<TransitionSeries.Sequence key={sp.id} durationInFrames={Math.max(1, sp.b - sp.a + (tr ? TR_FRAMES : 0))}>
      <ShotView span={sp} pa={pa} pb={pb} words={words} />
    </TransitionSeries.Sequence>);
    if (tr) out.push(<TransitionSeries.Transition key={sp.id + "-tr"} presentation={tr} timing={linearTiming({ durationInFrames: TR_FRAMES })} />);
  });
  return <AbsoluteFill style={{ background: N3.bg }}><TransitionSeries>{out}</TransitionSeries></AbsoluteFill>;
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "wi-gta-breath",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: N3.bg,
};
export default story;
