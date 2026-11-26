// WHAT IF #4 "What If You Healed Like a GTA 6 Character?" - bright DAYLIGHT Stick3D look (as approved for What If 1-3:
// big 3D worlds with sky, clouds, sun, haze; Remy = REMY3D puppet + beanie; Golden Neon only for HUD; cyan only for the
// GAME version: the instant health bar, the hologram burger, the ghost that keeps running). Central motif: a big HEALTH
// BAR (game, cyan, refills in a blink) against the slow REAL healing timeline (gold, days/weeks/months).
// Facts (RESEARCH.md): small cut closes ~1 week, remodelling for months; scar ~80% as strong; plasma ~1 day, red cells
// 4-6 weeks, 8+ weeks between whole-blood donations; simple fracture 6-8 weeks, severe 3-6 months.
// Friendly: no gore, no realistic injury, no needles (stylised blood bag, the tube ends in a capped connector).
// "GTA" only as words: no game footage, art, maps or logos. Not medical advice (metadata).
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
import { NEON, NeonDefs, StrokeWord, CompareBars, ChoiceCards, NeonPath, WI_FONT, drawOn } from "../../library/whatif/kit";
import { Box, Cyl, Ball, Surface } from "../../library/stick3d/toon";
import { Person, V3, clamp, Grade } from "../../library/stick3d/kit";
import { REMY3D } from "../../src/tests/Stick3DTest";
import { Cam, Key, FaceGroup } from "../../library/stick3d/extra";
import { Glb } from "../../library/stick3d/glb";
import { DaySky, SunRig, DayGround, CityBackdrop, Palms, Clouds, WindowWall, SunPatch, disp, DAY } from "../../library/stick3d/daylight";
import { drawPuppet, Look, Pose } from "../../library/stick3d/puppet";
import { N3, Halo, FloorPool, NeonBar, Motes, Panel } from "../../library/stick3d/neon";

// ---------------------------------------------------------------- cast
const REMY: Look = { ...REMY3D, beanie: "#2e3658", beanieBand: N3.gold, pom: N3.amber };
const { gold: GOLD, coral: CORAL, amber: AMBER, text: CREAM, cyan: CYAN, dim: DIM } = NEON;

// ---------------------------------------------------------------- shots
type ShotDef = { id: string; cue: string; parent: string; sub: number };
const DEFS: ShotDef[] = [
  { id: "hook", cue: "What if you", parent: "hook", sub: 0 },
  { id: "hookb", cue: "Eat a snack,", parent: "hook", sub: 1 },
  { id: "test1", cue: "Test one. A", parent: "test1", sub: 0 },
  { id: "cut", cue: "In real life, a small", parent: "cut", sub: 0 },
  { id: "layers", cue: "Underneath, your body", parent: "layers", sub: 0 },
  { id: "scar", cue: "And the new", parent: "scar", sub: 0 },
  { id: "test2", cue: "Test two. Giving", parent: "test2", sub: 0 },
  { id: "plasma", cue: "In real life, your body replaces", parent: "plasma", sub: 0 },
  { id: "cells", cue: "But the red", parent: "cells", sub: 0 },
  { id: "calendar", cue: "That's why blood", parent: "cells", sub: 1 },
  { id: "test3", cue: "Test three. A", parent: "test3", sub: 0 },
  { id: "xray", cue: "In real life, a simple", parent: "xray", sub: 0 },
  { id: "xrayb", cue: "A bad break", parent: "xray", sub: 1 },
  { id: "rest", cue: "No snack fixes", parent: "rest", sub: 0 },
  { id: "realbar", cue: "So the real", parent: "realbar", sub: 0 },
  { id: "outro", cue: "In the game, you heal", parent: "outro", sub: 0 },
  { id: "ask", cue: "What's the slowest", parent: "ask", sub: 0 },
];
const DEF: Record<string, ShotDef> = Object.fromEntries(DEFS.map((d) => [d.id, d]));
const SHOTS = DEFS.map((d) => ({ id: d.id, cue: d.cue }));
const TR_FRAMES = 14;
/** place of each scene (parent): a PLACE change = shape-morph transition, everything else = hard cut */
const PLACE: Record<string, string> = {
  hook: "park", test1: "park", cut: "park", layers: "skin", scar: "park", test2: "donor", plasma: "donor", cells: "donor",
  test3: "street", xray: "clinic", rest: "home", realbar: "park", outro: "park", ask: "park",
};
/** background colour of each scene = the flood colour of the morph INTO it */
const BG: Record<string, string> = {
  hook: "#cfe9fb", test1: "#cfe9fb", cut: "#cfe9fb", layers: "#ffe6da", scar: "#cfe9fb", test2: "#eef3f8", plasma: "#eef3f8",
  cells: "#eef3f8", test3: "#e9dcc6", xray: "#e6f4f0", rest: "#f4e8d4", realbar: "#cfe9fb", outro: "#cfe9fb", ask: "#cfe9fb",
};
/** key object of the OUTGOING shot that becomes the transition shape (screen rect, radius) */
const KEY_DEF = { cx: 540, cy: 900, w: 380, h: 380, r: 190 };
const KEY_OBJ: Record<string, typeof KEY_DEF> = {
  cut: { cx: 540, cy: 900, w: 300, h: 220, r: 50 },                   // the plaster pad
  layers: { cx: 540, cy: 960, w: 420, h: 300, r: 40 },                // the skin block
  scar: { cx: 540, cy: 760, w: 300, h: 300, r: 150 },                 // Remy's healed fingertip
  calendar: { cx: 540, cy: 760, w: 420, h: 460, r: 30 },              // the wall calendar
  test3: { cx: 540, cy: 1000, w: 320, h: 170, r: 85 },                // the cast
  xrayb: { cx: 540, cy: 700, w: 520, h: 380, r: 24 },                 // the lightbox
  rest: { cx: 540, cy: 760, w: 320, h: 320, r: 160 },                 // the pillow
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

// ---------------------------------------------------------------- HUD pieces (bars, icons, numbers - never caption words)
const HEART = "M 0 16 C -34 -6 -26 -34 0 -20 C 26 -34 34 -6 0 16 Z";
const PLUS = "M -9 -26 L 9 -26 L 9 -9 L 26 -9 L 26 9 L 9 9 L 9 26 L -9 26 L -9 9 L -26 9 L -26 -9 L -9 -9 Z";
/** THE MOTIF: a game-style HEALTH BAR. kind "game" = cyan with a plus (refills in a blink); "real" = gold with a heart
 *  (fills slowly). 10 segments, hot top highlight, a soft flash sweep when it jumps up. */
const HealthBar: React.FC<{ f: number; y: number; fill: number; kind: "game" | "real"; at: number; out?: number; x?: number; w?: number; h?: number; flash?: number }> =
  ({ f, y, fill, kind, at, out = Infinity, x = 540, w = 860, h = 64, flash = -999 }) => {
    const p = drawOn(f, at, 12) * leaveO(f, out); if (p <= 0) return null;
    const col = kind === "game" ? CYAN : GOLD, x0 = x - w / 2 + 104, x1 = x + w / 2 - 14, tw = x1 - x0;
    const fw = tw * clamp(fill), segs = 10, fl = Math.max(0, 1 - Math.abs(f - flash - 6) / 8);
    return <g opacity={p} transform={`translate(0 ${(1 - p) * 14})`}>
      <rect x={x - w / 2} y={y - 16} width={w} height={h + 32} rx={(h + 32) / 2} fill="#0b0d1a" opacity={0.6} />
      <circle cx={x - w / 2 + 52} cy={y + h / 2} r={38} fill={kind === "game" ? "#0b3a46" : "#3a2a0c"} />
      <g transform={`translate(${x - w / 2 + 52} ${y + h / 2 + (kind === "real" ? 2 : 0)}) scale(${kind === "real" ? 1.05 : 0.95})`}>
        <path d={kind === "game" ? PLUS : HEART} fill={col} stroke="#0b0d1a" strokeWidth={3} />
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
/** the REAL healing TIMELINE: a track with `ticks` (days/weeks/months), a fill that grows, an optional range zone
 *  (e.g. weeks 4-6 drawn lighter) and the big value number under it (from RESEARCH.md, e.g. "~1 WEEK") */
const Timeline: React.FC<{ f: number; y: number; at: number; fill: number; ticks: number; value: string; valueAt: number; color?: string; zone?: [number, number]; out?: number }> =
  ({ f, y, at, fill, ticks, value, valueAt, color = GOLD, zone, out = Infinity }) => {
    const p = drawOn(f, at, 12) * leaveO(f, out); if (p <= 0) return null;
    const x0 = 170, x1 = 960, tw = x1 - x0, h = 54, fw = tw * clamp(fill);
    return <g opacity={p}>
      <Plate x={60} y={y - 30} w={960} h={250} o={1} />
      {/* calendar icon */}
      <g transform={`translate(112 ${y + h / 2})`}>
        <rect x={-34} y={-30} width={68} height={62} rx={10} fill="none" stroke={color} strokeWidth={5} />
        <path d="M -34 -12 L 34 -12 M -18 -40 L -18 -22 M 18 -40 L 18 -22" stroke={color} strokeWidth={5} strokeLinecap="round" />
        {[-14, 0, 14].map((xx) => <rect key={xx} x={xx - 4} y={2} width={8} height={8} rx={2} fill={color} />)}
      </g>
      <rect x={x0} y={y} width={tw} height={h} rx={12} fill="#141a2c" stroke={DIM} strokeWidth={2.5} />
      {zone && <rect x={x0 + tw * zone[0]} y={y + 4} width={tw * (zone[1] - zone[0])} height={h - 8} rx={8} fill={color} opacity={0.18 * clamp(fill / zone[0])} />}
      {fw > 4 && <>
        <rect x={x0 + 4} y={y + 4} width={Math.max(0, fw - 8)} height={h - 8} rx={9} fill={color} opacity={0.9} />
        <rect x={x0 + 8} y={y + 8} width={Math.max(0, fw - 16)} height={(h - 16) * 0.3} rx={5} fill="#ffffff" opacity={0.4} />
      </>}
      {Array.from({ length: ticks + 1 }, (_, i) => <rect key={i} x={x0 + (tw * i) / ticks - 2} y={y + h + 6} width={4} height={i % ticks === 0 ? 22 : 14} rx={2} fill={x0 + (tw * i) / ticks <= x0 + fw + 1 ? color : DIM} />)}
      <HudText f={f} x={x1} y={y + h + 112} size={70} color={color} at={valueAt} anchor="end" spacing={1}>{value}</HudText>
    </g>;
  };
/** 12 small month cells under a timeline; they light one after another (rebuilding goes on for months) */
const MonthCells: React.FC<{ f: number; y: number; at: number; lit: number; color?: string }> = ({ f, y, at, lit, color = AMBER }) => {
  const p = drawOn(f, at, 12); if (p <= 0) return null;
  return <g opacity={p}>{Array.from({ length: 12 }, (_, i) => {
    const x = 170 + i * 66, on = clamp(lit - i);
    return <g key={i}>
      <rect x={x} y={y} width={54} height={54} rx={10} fill="#141a2c" stroke={DIM} strokeWidth={2.5} />
      {on > 0 && <rect x={x + 5} y={y + 5 + 44 * (1 - on)} width={44} height={44 * on} rx={7} fill={color} opacity={0.9} />}
    </g>;
  })}</g>;
};
/** test icons: small cut (plaster), giving blood (drop), broken arm (bone) */
const ICON: Record<string, string> = {
  cut: "M -40 -14 L 40 -14 Q 52 -14 52 0 Q 52 14 40 14 L -40 14 Q -52 14 -52 0 Q -52 -14 -40 -14 Z M -14 -14 L -14 14 M 14 -14 L 14 14",
  drop: "M 0 -42 C 14 -20 32 -2 32 14 A 32 32 0 0 1 -32 14 C -32 -2 -14 -20 0 -42 Z",
  bone: "M -26 -8 L 26 -8 M -26 8 L 26 8 M -26 -8 A 11 11 0 1 0 -36 0 A 11 11 0 1 0 -26 8 M 26 -8 A 11 11 0 1 1 36 0 A 11 11 0 1 1 26 8",
};
/** three test tiles (cut / blood / bone); the current test lights gold, done ones get a tick */
const TestTracker: React.FC<{ f: number; at: number; active: number; out?: number; y?: number }> = ({ f, at, active, out = Infinity, y = 420 }) => {
  const o = leaveO(f, out); if (f < at - 2 || o <= 0) return null;
  return <g opacity={o}>{["cut", "drop", "bone"].map((ic, i) => {
    const x = 540 + (i - 1) * 156, p = drawOn(f, at + i * 3, 12), on = i === active, done = i < active;
    const col = on ? GOLD : done ? AMBER : DIM;
    return <g key={ic} transform={`translate(${x} ${y - (1 - p) * 14})`} opacity={p}>
      <rect x={-62} y={-62} width={124} height={124} rx={24} fill={on ? "#3a2a0c" : "#0b0d1a"} opacity={on ? 0.8 : 0.55} />
      <NeonPath d="M -38 -62 L 38 -62 Q 62 -62 62 -38 L 62 38 Q 62 62 38 62 L -38 62 Q -62 62 -62 38 L -62 -38 Q -62 -62 -38 -62 Z" w={on ? 4.5 : 2.5} color={col} glow={on ? 1 : 0.3} />
      <g transform={ic === "drop" ? "" : "rotate(-30)"}><NeonPath d={ICON[ic]} w={on ? 5 : 3.5} color={col} glow={on ? 0.8 : 0.2} hot={on} /></g>
      {done && <NeonPath d="M 30 -50 l 10 10 l 20 -24" w={5} color={GOLD} />}
    </g>;
  })}</g>;
};
/** round icon tile (rest / food / sleep / no-snack) */
const IconTile: React.FC<{ f: number; x: number; y: number; at: number; kind: "bed" | "apple" | "moon" | "burger"; strike?: number; color?: string }> = ({ f, x, y, at, kind, strike = 0, color = GOLD }) => {
  const p = drawOn(f, at, 12); if (p <= 0) return null;
  const d = kind === "bed" ? "M -40 18 L -40 -22 M -40 4 L 40 4 L 40 18 M -40 -6 L 40 -6 L 40 4 M -30 -6 a 9 9 0 1 1 0.1 0"
    : kind === "apple" ? "M 0 -16 C -30 -34 -46 -4 -34 18 C -24 38 -8 34 0 28 C 8 34 24 38 34 18 C 46 -4 30 -34 0 -16 Z M 0 -18 C 2 -30 8 -36 14 -38"
      : kind === "moon" ? "M 14 -34 A 36 36 0 1 0 30 22 A 28 28 0 1 1 14 -34 Z"
        : "M -36 2 C -36 -30 36 -30 36 2 Z M -38 10 L 38 10 M -36 20 C -36 30 36 30 36 20 Z";
  return <g transform={`translate(${x} ${y - (1 - p) * 16})`} opacity={p}>
    <circle r={78} fill={kind === "burger" ? "#0b3a46" : "#3a2a0c"} opacity={0.8} />
    <circle r={78} fill="none" stroke={color} strokeWidth={4} opacity={0.9} />
    <NeonPath d={d} w={5} color={color} hot />
    {strike > 0 && <NeonPath d="M -54 54 L 54 -54" w={9} color={CORAL} p={strike} hot />}
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
/** cyan hologram puppet = the GAME version (shrugs it off, keeps running): silhouette + bright rim, translucent */
const Ghost: React.FC<{ p: V3; h?: number; o?: number; f: number; pose?: Omit<Pose, "t"> }> = ({ p, h = 2.5, o = 0.7, f, pose = { mood: "grin", arms: "up" } }) => o <= 0.01 ? null : (
  <group position={p}>
    <Panel p={[0, h * 0.5, 0]} s={[h * 512 / 768, h]} px={[256, 384]} face additive o={o} dep={Math.floor(f / 2)} draw={(c, W, H) => {
      drawPuppet(c, W, H, REMY, { ...pose, t: f });
      c.globalCompositeOperation = "source-in"; c.fillStyle = "rgba(95,227,255,0.85)"; c.fillRect(0, 0, W, H); c.globalCompositeOperation = "source-over";
    }} />
    <Halo p={[0, h * 0.55, -0.1]} r={h * 0.6} color={CYAN} o={0.35 * o} />
  </group>
);
/** expanding ring (abstract, friendly): a flat torus that grows + fades */
const Ring: React.FC<{ p: V3; u: number; at: number; color?: string; s?: number; rot?: V3 }> = ({ p, u, at, color = "#fff3d0", s = 1, rot = [0, 0, 0] }) => {
  const q = (u - at) / 16; if (q < 0 || q > 1) return null;
  const r = s * (0.4 + 2.2 * Easing.out(Easing.cubic)(q));
  return <group position={p} rotation={rot}>
    <mesh><torusGeometry args={[r, 0.06 * s, 8, 48]} /><meshBasicMaterial color={color} transparent opacity={1 - q} toneMapped={false} depthWrite={false} /></mesh>
    <Halo p={[0, 0, 0]} r={r * 1.2} color={color} o={0.55 * (1 - q)} />
  </group>;
};
/** Remy's arm in a cast + sling, held in front of his chest (turns with the puppet billboard) */
const Cast: React.FC<{ p: V3; h?: number }> = ({ p, h = 2.5 }) => (
  <FaceGroup p={p}><group position={[0, h * 0.4, 0.14]} scale={h / 2.5}>
    <Glb name="arm_cast" line={2} fallback={<Cyl p={[0, 0, 0]} rt={0.11} h={0.7} rot={[0, 0, Math.PI / 2]} color="#fbfaf6" line={2} />} />
  </group></FaceGroup>
);
/** cyan hologram burger (the game heal): spins slowly, cyan halo + rising sparkles */
const HoloBurger: React.FC<{ p: V3; o: number; f: number; s?: number }> = ({ p, o, f, s = 1.6 }) => o <= 0.01 ? null : (
  <group position={[p[0], p[1] + 0.08 * Math.sin(f * 0.12), p[2]]}>
    <group rotation={[0.15, f * 0.05, 0]} scale={s * (0.6 + 0.4 * o)}><Glb name="burger" line={2} fallback={<Ball p={[0, 0.25, 0]} r={0.3} color="#e7a24a" />} /></group>
    <Halo p={[0, 0.4 * s, 0]} r={1.1 * s} color={CYAN} o={0.5 * o} />
    <FloorPool p={[0, -p[1] + 0.03, 0]} r={1.2 * s} color={CYAN} o={0.35 * o} />
    {Array.from({ length: 6 }, (_, i) => { const yy = ((f * 0.03 + i / 6) % 1); return <Ball key={i} p={[Math.sin(i * 2.1) * 0.6 * s, yy * 1.4 * s, Math.cos(i * 2.1) * 0.4 * s]} r={0.05 * s * (1 - yy)} color={CYAN} ink={0} />; })}
  </group>
);

// ---------------------------------------------------------------- worlds
const Street: React.FC<{ z?: number; w?: number; len?: number; y?: number }> = ({ z = 0, w = 6, len = 160, y = 0 }) => (
  <group position={[0, y, z]}>
    <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[len, w]} /><meshLambertMaterial color={disp(DAY.asphalt)} /></mesh>
    {Array.from({ length: 24 }, (_, i) => <mesh key={i} position={[-len / 2 + i * 6, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.4, 0.16]} /><meshBasicMaterial color={disp("#fff6d8")} /></mesh>)}
    {[-1, 1].map((s) => <mesh key={s} position={[0, 0.06, s * (w / 2 + 0.9)]} receiveShadow><boxGeometry args={[len, 0.12, 1.8]} /><meshLambertMaterial color={disp("#e6dccb")} /></mesh>)}
  </group>
);
/** sunny park: lawn, a paved plaza, the picnic table (top y 1.05, at z -1.2), palms, city far away */
const TABLE_Z = -1.2;
const ParkWorld: React.FC<{ t: number; hero?: V3; warm?: number; table?: boolean }> = ({ t, hero = [0, 0, 0.6], warm = 0, table = true }) => (<>
  <DaySky fogNear={40} fogFar={190} warm={warm} />
  <SunRig target={hero} />
  <DayGround base={DAY.grass} speck="#6fae52" y={-0.05} z={-40} />
  <Surface lit p={[0, 0.01, 0]} s={[16, 12]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#efe2c8")} b={disp("#e4d4b4")} unit={2.0} />
  <Surface lit p={[0, 0.008, 9]} s={[3.2, 8]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#efe2c8")} b={disp("#e4d4b4")} unit={1.6} />
  {table && <>
    <Glb name="picnic_table" p={[0, 0, TABLE_Z]} line={2} blob={1.6} fallback={<Box p={[0, 0.9, TABLE_Z]} s={[2.6, 0.12, 0.9]} color="#c98a4b" line={2} />} />
    <Glb name="chips_bag" p={[-0.9, 1.06, TABLE_Z]} rot={[0, 0.4, 0]} s={0.8} line={2} />
    <Glb name="soda_can" p={[0.95, 1.06, TABLE_Z + 0.1]} s={0.9} line={2} />
  </>}
  <Palms at={[[-7, 0, -6], [7.5, 0, -7], [-11, 0, 3], [11, 0, 2], [-4, 0, -14], [5, 0, -16]]} s={1.3} />
  <CityBackdrop z={-80} spread={160} />
  <Clouds t={t} at={[[-30, 28, -100], [24, 34, -120], [50, 24, -90], [-60, 22, -70]]} s={5} />
</>);
/** bright friendly blood-donor centre: tiled floor, big window to the sunny city, two donor chairs, the bag stand,
 *  a juice-and-snack table, a heart poster and the wall calendar (x -3.2) */
const WALL_Z = -4.6;
const DonorWorld: React.FC<{ t: number; target?: V3; weeks?: number }> = ({ t, target = [0, 1, 0], weeks = 0 }) => (<>
  <DaySky fogNear={30} fogFar={160} />
  <SunRig target={target} dir={[5, 9, 6]} />
  <DayGround base={DAY.grass} speck="#6fae52" y={-0.4} z={-60} />
  <CityBackdrop z={-50} spread={120} />
  <Clouds t={t} at={[[-20, 22, -90], [26, 28, -110]]} s={5} />
  <Surface lit p={[0, 0.01, 0]} s={[26, 18]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#eef2f6")} b={disp("#e2e8ef")} unit={1.6} />
  <WindowWall z={WALL_Z} win={{ x: 2.6, y: 1.1, w: 6.4, h: 4.2 }} a="#f6f2ea" kind="plain" />
  <SunPatch p={[1.4, 0, 0.4]} s={[6, 3]} o={0.25} />
  {/* heart poster (coral drop + plus), no words */}
  <Panel p={[-6.4, 2.6, WALL_Z + 0.04]} s={[1.6, 2.0]} px={[256, 320]} dep={1} draw={(c, W, H) => {
    c.fillStyle = "#fff7ef"; c.fillRect(0, 0, W, H); c.strokeStyle = "#ff7a59"; c.lineWidth = 10; c.strokeRect(8, 8, W - 16, H - 16);
    c.fillStyle = "#ff7a59"; c.beginPath(); c.moveTo(W / 2, 50); c.bezierCurveTo(W / 2 + 40, 110, W / 2 + 80, 150, W / 2 + 80, 190); c.arc(W / 2, 190, 80, 0, Math.PI); c.bezierCurveTo(W / 2 - 80, 150, W / 2 - 40, 110, W / 2, 50); c.fill();
    c.fillStyle = "#fff7ef"; c.fillRect(W / 2 - 10, 160, 20, 64); c.fillRect(W / 2 - 32, 182, 64, 20);
  }} />
  <WallCalendar p={[-3.2, 2.5, WALL_Z + 0.05]} weeks={weeks} />
  <Glb name="donation_chair" p={[0, 0, 0]} line={2} blob={1.3} fallback={<Box p={[0, 0.6, 0]} s={[1.2, 0.3, 1.1]} color={CORAL} line={2} />} />
  <Glb name="donation_chair" p={[4.8, 0, -1.0]} rot={[0, -0.3, 0]} line={2} blob={1.3} />
  <Glb name="blood_bag_stand" p={[2.3, 0, -0.2]} rot={[0, Math.PI, 0]} line={2} blob={0.6} />
  <Glb name="side_table" p={[-5.4, 0, -2.8]} s={0.9} line={2} blob={0.8} />
  <Glb name="soda_can" p={[-5.6, 0.92, -2.8]} s={0.8} line={2} />
  <Glb name="chips_bag" p={[-5.15, 0.92, -2.85]} s={0.6} rot={[0, -0.3, 0]} line={2} />
</>);
/** wall calendar: 8 week rows x 7 days; days cross off in gold up to `weeks`, a coral drop marks the next donation */
const WallCalendar: React.FC<{ p: V3; weeks: number }> = ({ p, weeks }) => {
  const days = Math.floor(weeks * 7);
  return <Panel p={p} s={[2.4, 3.0]} px={[384, 480]} dep={days} draw={(c, W, H) => {
    c.fillStyle = "#fffaf2"; c.fillRect(0, 0, W, H);
    c.fillStyle = "#ff7a59"; c.fillRect(0, 0, W, 64);
    c.fillStyle = "#fffaf2"; [0.3, 0.7].forEach((x) => { c.beginPath(); c.arc(W * x, 18, 9, 0, 7); c.fill(); });
    const cw = (W - 40) / 7, ch = (H - 100) / 8;
    for (let r = 0; r < 8; r++) for (let d = 0; d < 7; d++) {
      const x = 20 + d * cw, y = 82 + r * ch, i = r * 7 + d;
      c.strokeStyle = "#d9cdb8"; c.lineWidth = 2; c.strokeRect(x + 2, y + 2, cw - 4, ch - 4);
      if (i < days) { c.strokeStyle = "#f5b942"; c.lineWidth = 6; c.lineCap = "round"; c.beginPath(); c.moveTo(x + 9, y + 9); c.lineTo(x + cw - 9, y + ch - 9); c.moveTo(x + cw - 9, y + 9); c.lineTo(x + 9, y + ch - 9); c.stroke(); }
      if (i === 55) { c.fillStyle = "#ff4d5e"; c.beginPath(); const cx = x + cw / 2, cy = y + ch / 2 + 4; c.moveTo(cx, cy - 16); c.quadraticCurveTo(cx + 13, cy, cx + 11, cy + 6); c.arc(cx, cy + 6, 11, 0, Math.PI); c.quadraticCurveTo(cx - 13, cy, cx, cy - 16); c.fill(); }
    }
  }} />;
};
/** bright clinic room: mint-white floor, cream back wall with a window, the X-ray lightbox (screen centre y 2.25 at
 *  x -1.2) with the bone film drawn on a Panel just in front, the hospital bed at the right */
const CLINIC_Z = -4.0, BOX_X = -1.2, BOX_Y = 2.25;
const ClinicWorld: React.FC<{ t: number; knit: number; bad: number; target?: V3 }> = ({ t, knit, bad, target = [0, 1.5, -2] }) => (<>
  <DaySky fogNear={30} fogFar={160} />
  <SunRig target={target} dir={[6, 10, 6]} />
  <DayGround base={DAY.grass} speck="#6fae52" y={-0.4} z={-60} />
  <CityBackdrop z={-50} spread={110} />
  <Surface lit p={[0, 0.01, 0]} s={[24, 18]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#eaf6f2")} b={disp("#dcefe9")} unit={1.6} />
  <WindowWall z={CLINIC_Z} win={{ x: 4.4, y: 1.2, w: 4.4, h: 3.6 }} a="#f4efe6" kind="plain" />
  <SunPatch p={[3.4, 0, 0]} s={[5, 3]} o={0.22} />
  <Glb name="xray_lightbox" p={[BOX_X, 0, CLINIC_Z + 0.09]} line={2} fallback={<Box p={[BOX_X, BOX_Y, CLINIC_Z + 0.1]} s={[2.7, 2.0, 0.16]} color="#eef1f5" line={2} />} />
  <XrayFilm p={[BOX_X, BOX_Y, CLINIC_Z + 0.24]} knit={knit} bad={bad} />
  <Halo p={[BOX_X, BOX_Y, CLINIC_Z + 0.5]} r={2.2} color="#dff4ff" o={0.35} />
  <Glb name="hospital_bed" p={[2.6, 0, -1.6]} line={2} blob={1.8} fallback={<Box p={[2.6, 0.8, -1.6]} s={[3.2, 0.4, 1.3]} color="#fffaf0" line={2} />} />
  <Glb name="side_table" p={[0.6, 0, -2.6]} s={0.8} line={2} blob={0.6} />
  {void t}
</>);
/** X-ray film of a forearm: two bones; `knit` 0..1 closes the break in the radius (gold callus glow grows);
 *  `bad` 0..1 = a second, bigger break in the ulna that knits much more slowly (shown by its own progress) */
const XrayFilm: React.FC<{ p: V3; knit: number; bad: number }> = ({ p, knit, bad }) => (
  <Panel p={p} s={[2.3, 1.62]} px={[640, 450]} dep={`${Math.round(knit * 40)}-${Math.round(bad * 40)}`} draw={(c, W, H) => {
    c.fillStyle = "#0f1f33"; c.fillRect(0, 0, W, H);
    c.strokeStyle = "rgba(160,210,255,0.08)"; c.lineWidth = 2; for (let x = 0; x < W; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
    const bone = (y: number, th: number, brk: number, gap: number, prog: number) => {
      c.strokeStyle = "#dff4ff"; c.lineCap = "round"; c.lineWidth = th;
      const x0 = W * 0.1, x1 = W * 0.9, bx = W * brk, g = gap * (1 - prog);
      c.beginPath(); c.moveTo(x0, y); c.lineTo(bx - g / 2, y); c.moveTo(bx + g / 2, y); c.lineTo(x1, y); c.stroke();
      c.fillStyle = "#dff4ff"; [x0, x1].forEach((x) => { c.beginPath(); c.arc(x, y - th * 0.35, th * 0.62, 0, 7); c.arc(x, y + th * 0.35, th * 0.62, 0, 7); c.fill(); });
      if (gap > 0) {
        const gr = c.createRadialGradient(bx, y, 2, bx, y, th * 1.8); gr.addColorStop(0, `rgba(255,207,110,${0.95 * prog})`); gr.addColorStop(1, "rgba(255,207,110,0)");
        c.fillStyle = gr; c.beginPath(); c.ellipse(bx, y, th * 1.9, th * 1.2, 0, 0, 7); c.fill();
        if (prog > 0.05) { c.strokeStyle = `rgba(255,207,110,${prog})`; c.lineWidth = th * 0.9; c.beginPath(); c.moveTo(bx - g / 2 - 4, y); c.lineTo(bx + g / 2 + 4, y); c.stroke(); }
      }
    };
    bone(H * 0.36, H * 0.09, 0.4, bad > 0 ? 70 : 0, bad);
    bone(H * 0.64, H * 0.1, 0.56, 34, knit);
  }} />
);
/** abstract SKIN BLOCK cross-section: top skin, pink middle layer, warm deep layer; the healed line on top; coral
 *  fibres criss-cross into the middle layer as `rebuild` grows (the body keeps rebuilding underneath) */
const SkinBlock: React.FC<{ rebuild: number; t: number }> = ({ rebuild, t }) => (<>
  <Box p={[0, 2.7, 0]} s={[7, 0.5, 4]} color="#f3d2b3" line={3} />
  <Box p={[0, 1.6, 0]} s={[7, 1.7, 4]} color="#f9b8a6" line={3} />
  <Box p={[0, 0.4, 0]} s={[7, 0.8, 4]} color="#ffe0a8" line={3} />
  <Box p={[0, 2.96, 0]} s={[0.22, 0.04, 3.2]} color="#ffe8dc" line={1} />
  {Array.from({ length: 14 }, (_, i) => {
    const on = clamp(rebuild * 14 - i); if (on <= 0) return null;
    const x = -0.9 + (i % 7) * 0.3, z = i < 7 ? 1.0 : 1.7;
    return <Box key={i} p={[x, 1.6 + Math.sin(i * 1.7) * 0.4, 2.02]} s={[0.08, 1.2 * on, 0.02]} rot={[0, 0, (i % 2 ? 0.6 : -0.6)]} color="#ffd2c2" line={0} />;
  })}
  <Motes t={t} c={[0, 1.6, 2.1]} area={[1.4, 0.7, 0.1]} n={14} color={N3.gold} size={0.07} />
  <Halo p={[0, 1.7, 2.2]} r={1.6} color={N3.gold} o={0.35 * rebuild} />
</>);

// ---------------------------------------------------------------- shot builder
type View = { world: React.ReactNode; hud?: React.ReactNode };
const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number, sub: number, us: number, ls: number): View => {
  const t = f / FPS;
  switch (id) {
    case "hook": {
      // sub 0 = CRANE + LAND: drops from above the palms and lands level on Remy at the picnic table (WHAT IF draws on)
      // sub 1 = PUSH-IN: slow push into Remy munching chips; the cyan GAME health bar jumps from low to full in a blink,
      //         then the gold REAL bar appears under it, nearly empty (no words: the bars are the message)
      const HB = C("your health bar", 50), LS = C("Let's see how", 95);
      const R: V3 = [0, 0, 0.6];
      const munch = sub ? Math.max(0, Math.sin(u * 0.5)) : 0;
      const world = <>
        <ParkWorld t={t} hero={R} />
        <Hero p={R} look={REMY} pose={{ mood: sub ? (u > HB ? "grin" : "laugh") : "smile", arms: sub && u < LS ? "hold" : sub ? "chest" : "down", tilt: munch * 0.03 }} f={f} rimO={0.4} />
        {sub && u < LS ? <FaceGroup p={R}><group position={[0.02, 0.92 + munch * 0.05, 0.2]} rotation={[0, 0, 0.1]}><Glb name="chips_bag" s={0.7} line={2} /></group></FaceGroup> : null}
        {sub ? <Move us={us} ls={ls} at={line({ pos: [1.6, 2.6, 12.5], look: [0, 1.4, 0.6], fov: 44 }, { pos: [0.5, 2.1, 6.8], look: [0, 1.45, 0.6], fov: 44 })} />
          : <Move us={us} ls={ls} at={line({ pos: [0.4, 9.5, 15], look: [0, 1.0, 0.6], fov: 46 }, { pos: [0.6, 2.7, 10.2], look: [0, 1.6, 0.6], fov: 46 })} />}
      </>;
      const wp = k(u, 0, 34, 0.42, 1, EASE.arrive);
      const fill = sub ? (u < HB ? 0.2 : k(u, HB, HB + 9, 0.2, 1, Easing.out(Easing.cubic))) : 0.2;
      const hud = <>
        {!sub && <StrokeWord text="WHAT IF" x={540} y={565} h={125} p={wp} />}
        {!sub && <HudText f={u} x={540} y={415} size={56} color={AMBER} at={22}>#4</HudText>}
        {sub ? <HealthBar f={us} y={360} fill={fill} kind="game" at={2} flash={HB - (len - ls)} /> : null}
        {sub ? <HealthBar f={u} y={500} fill={0.2 + 0.02 * clamp((u - LS) / 60)} kind="real" at={LS} /> : null}
      </>;
      return { world, hud };
    }
    case "test1": { // TRACKING / TRUCK: the camera trucks sideways with Remy across the park; a tiny gold spark = the small cut; the cyan bar dips and snaps back
      const SC = C("A small cut.", 20), IG = C("In the game,", 45), GO = C("gone in a", 65);
      const e = shotE(us, ls);
      const x = -4.2 + 4.2 * e, R: V3 = [x, 0, 1.6];
      const ouch = u > SC + 2 && u < IG + 6;
      const world = <>
        <ParkWorld t={t} hero={[0, 0, 1]} />
        <Hero p={R} look={REMY} pose={{ mood: ouch ? "shock" : "smile", arms: ouch ? "chest" : "down", walk: u * 0.32, speed: e < 0.97 && !ouch ? 1 : 0 }} f={f} rimO={0.35} />
        <Ring p={[x + 0.05, 1.05, 1.8]} u={u} at={SC + 4} color={N3.gold} s={0.25} />
        {u > IG - 4 && <Ghost p={[x - 1.9, 0, 0.9]} f={f} o={k(u, IG - 4, IG + 6, 0, 0.8) * (1 - k(u, GO + 20, GO + 34, 0, 1))} pose={{ mood: "grin", arms: "up" }} />}
        <Move us={us} ls={ls} at={() => ({ pos: [x + 0.9, 2.7, R[2] + 8.6], look: [x - 0.2, 1.4, R[2]], fov: 46 })} />
      </>;
      const fill = u < IG ? 1 : k(u, IG, IG + 6, 1, 0.78, Easing.out(Easing.cubic)) + k(u, IG + 8, IG + 16, 0, 0.22, Easing.out(Easing.cubic));
      const hud = <>
        <TestTracker f={u} at={4} active={0} out={len - 8} />
        <HealthBar f={u} y={560} fill={fill} kind="game" at={IG - 8} flash={IG + 8} />
      </>;
      return { world, hud };
    }
    case "cut": { // ORBIT: slow arc around the close-up finger with its plaster on the picnic table; gold sparkles = healing; the real timeline fills to ~1 week
      const CI = C("closes in about", 30), AW = C("a week.", 50);
      const F: V3 = [0, 1.06, TABLE_Z];
      const world = <>
        <ParkWorld t={t} hero={F} />
        <group position={F} rotation={[0, -0.35, 0]}><Glb name="plaster" s={0.34} line={2} fallback={<Cyl p={[0, 0.12, 0]} rt={0.11} h={1} rot={[0, 0, Math.PI / 2]} color="#f3d2b3" line={2} />} /></group>
        <Motes t={t} c={[F[0], F[1] + 0.3, F[2]]} area={[0.6, 0.3, 0.3]} n={12} color={N3.gold} size={0.025} />
        <Halo p={[F[0] - 0.05, F[1] + 0.25, F[2] + 0.1]} r={0.5} color={N3.gold} o={0.3 + 0.2 * Math.sin(f * 0.1)} />
        <Move us={us} ls={ls} at={orbit([F[0] + 0.05, F[1] + 0.12, F[2]], 2.9, 1.0, -0.5, 0.2, 40)} />
      </>;
      const hud = <Timeline f={u} y={380} at={CI - 10} fill={k(u, CI, AW + 14, 0, 1, Easing.out(Easing.cubic))} ticks={7} value="~1 WEEK" valueAt={AW + 2} />;
      return { world, hud };
    }
    case "layers": { // CRANE + LAND: from high above the healed skin surface the camera descends and lands level with the cut-away block; fibres keep knitting underneath
      const KR = C("keeps rebuilding", 22);
      const rebuild = k(u, KR - 6, len, 0.05, 1, Easing.inOut(Easing.quad));
      const world = <>
        <DaySky fogNear={40} fogFar={190} top="#6aa8e8" horizon="#ffe6da" />
        <SunRig target={[0, 1.5, 0]} dir={[5, 10, 7]} />
        <Surface lit p={[0, 0, 0]} s={[60, 60]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#fbe9df")} b={disp("#f6dccf")} unit={3} />
        <SkinBlock rebuild={rebuild} t={t} />
        <Move us={us} ls={ls} at={line({ pos: [0.6, 13, 9.5], look: [0, 1.9, 0], fov: 46 }, { pos: [0.4, 2.6, 13.0], look: [0, 2.25, 0], fov: 46 })} />
      </>;
      const hud = <>
        <Timeline f={u} y={380} at={0} fill={1} ticks={7} value="~1 WEEK" valueAt={-99} />
        <MonthCells f={u} y={660} at={KR - 8} lit={k(u, KR, len + 30, 0, 12, Easing.linear)} />
      </>;
      return { world, hud };
    }
    case "scar": { // LOW HERO ANGLE: from near the paving, looking up at Remy holding up his healed finger; strength bars: original 100% vs scar ~80%
      const HS = C("Healed scar tissue", 35), EP = C("eighty percent", 60);
      const R: V3 = [0, 0, 0.6];
      const world = <>
        <ParkWorld t={t} hero={R} />
        <Hero p={R} look={REMY} pose={{ mood: u > EP ? "worry" : "smile", arms: "point", armK: 0.9 }} f={f} rimO={0.4} />
        <Halo p={[0.62, 1.55, 0.8]} r={0.35} color={N3.gold} o={0.45} />
        <Move us={us} ls={ls} at={line({ pos: [0.9, 0.45, 10.8], look: [0.1, 2.9, 0.6], fov: 48 }, { pos: [0.6, 0.6, 9.4], look: [0.1, 2.85, 0.6], fov: 48 })} />
      </>;
      const hud = <>
        <Plate x={50} y={340} w={980} h={470} o={arrive(u, HS - 8, 12)} />
        <CompareBars f={u} y={440} gap={210} bh={70} labelSize={44} valueSize={60} rows={[
          { label: "ORIGINAL", fill: 1.0, value: "100%", at: HS },
          { label: "SCAR", fill: 0.8, value: "~80%", color: CORAL, at: EP },
        ]} />
      </>;
      return { world, hud };
    }
    case "test2": { // PULL BACK (reveal): from Remy in the donor chair back to the whole bright donor centre; game: the bar drops, a cyan burger pops up and it refills
      const IG = C("In the game, you lose", 35), GB = C("grab a burger", 60);
      const R: V3 = [0, 0.2, 0.05];
      const world = <>
        <DonorWorld t={t} target={[0.4, 1, 0]} />
        <Person p={R} h={2.5} look={REMY} pose={{ mood: u > GB ? "grin" : "smile", arms: "down" }} f={f} shadow={false} />
        <HoloBurger p={[-1.4, 1.5, 1.6]} o={k(u, GB - 4, GB + 8, 0, 1)} f={f} s={1.7} />
        <Move us={us} ls={ls} at={line({ pos: [0.6, 2.1, 5.0], look: [0.3, 1.45, 0], fov: 46 }, { pos: [1.6, 3.4, 13.5], look: [0.4, 1.7, -0.5], fov: 46 })} />
      </>;
      const fill = u < IG + 8 ? 1 : u < GB ? k(u, IG + 8, IG + 18, 1, 0.55, Easing.out(Easing.cubic)) : k(u, GB + 4, GB + 12, 0.55, 1, Easing.out(Easing.cubic));
      const hud = <>
        <TestTracker f={u} at={4} active={1} out={len - 8} />
        <HealthBar f={u} y={560} fill={fill} kind="game" at={IG - 6} flash={GB + 4} />
      </>;
      return { world, hud };
    }
    case "plasma": { // PUSH-IN: toward the stylised blood bag on its stand; the amber (liquid) layer glows and refills; the real timeline fills to ~1 day
      const AD = C("about a day", 40);
      const B: V3 = [1.9, 2.0, -0.2];
      const glow = 0.45 + 0.25 * Math.sin(f * 0.15);
      const world = <>
        <DonorWorld t={t} target={B} />
        <Person p={[0, 0.2, 0.05]} h={2.5} look={REMY} pose={{ mood: "smile", arms: "down", lookX: 0.6 }} f={f} shadow={false} />
        <Halo p={[B[0], B[1] + 0.25, B[2] + 0.2]} r={0.55} color={N3.amber} o={glow} />
        {Array.from({ length: 5 }, (_, i) => { const q = ((u * 0.02 + i / 5) % 1); return <Ball key={i} p={[B[0] - 0.2 + i * 0.1, B[1] + 0.05 + q * 0.45, B[2] + 0.12]} r={0.025 * (1 - q)} color={N3.amber} ink={0} />; })}
        <Move us={us} ls={ls} at={line({ pos: [3.2, 2.5, 7.6], look: [1.8, 2.3, -0.2], fov: 44 }, { pos: [2.4, 2.3, 4.4], look: [1.85, 2.3, -0.2], fov: 44 })} />
      </>;
      const hud = <Timeline f={u} y={380} at={6} fill={k(u, AD - 16, AD + 14, 0, 1, Easing.out(Easing.cubic))} ticks={4} value="~1 DAY" valueAt={AD + 2} color={AMBER} />;
      return { world, hud };
    }
    case "cells": {
      // sub 0 = TRACKING / TRUCK: the camera trucks with Remy along the room while red-cell discs pop up behind him one week at a time
      // sub 1 = DOLLY ZOOM (vertigo): on Remy in front of the wall calendar; the camera dollies in as the FOV widens, the
      //         8-week grid stretches behind him while the days cross off
      const FS = C("four to six", 40), EW = C("eight weeks", 120);
      const weeks = sub ? k(u, EW - 40, len, 1.5, 8, Easing.inOut(Easing.quad)) : 0;
      const e = shotE(us, ls);
      const x = sub ? -3.2 : -5.6 + 5.0 * e;
      const R: V3 = sub ? [-2.3, 0, -3.3] : [x, 0, 1.8];
      const cells = sub ? 0 : e * 6.4;
      const world = <>
        <DonorWorld t={t} target={[R[0], 1, R[2]]} weeks={sub ? weeks : 1.5} />
        {sub ? null : Array.from({ length: 6 }, (_, i) => {
          const on = clamp(cells - i); if (on <= 0) return null;
          const cx = x - 1.45 + (i % 2) * 0.62, cy = 0.7 + Math.floor(i / 2) * 0.62 + 0.06 * Math.sin(f * 0.08 + i);
          return <group key={i} position={[cx, cy, 1.4]} rotation={[0.5, f * 0.02 + i, 0.2]} scale={0.62 * Easing.out(Easing.back(1.6))(on)}>
            <mesh><torusGeometry args={[0.28, 0.14, 12, 28]} /><meshBasicMaterial color={disp("#ff7466")} toneMapped={false} /></mesh>
            <mesh scale={[1, 1, 0.35]}><sphereGeometry args={[0.2, 16, 12]} /><meshBasicMaterial color={disp("#e84d40")} toneMapped={false} /></mesh>
          </group>;
        })}
        {sub ? <Hero p={R} look={REMY} pose={{ mood: u > EW ? "shock" : "worry", arms: u > EW ? "head" : "chest" }} f={f} rimO={0.4} />
          : <Hero p={R} look={REMY} pose={{ mood: "smile", arms: "down", walk: u * 0.3, speed: e < 0.97 ? 1 : 0 }} f={f} rimO={0.35} />}
        {sub ? <Move us={us} ls={ls} at={dollyZoom([-2.9, 2.1, -3.6], [0.1, 0.06, 1], 17, 7.5, 22)} />
          : <Move us={us} ls={ls} at={() => ({ pos: [x + 1.0, 2.6, 10.2], look: [x + 0.2, 1.7, 0.6], fov: 46 })} />}
      </>;
      const hud = sub ? <>
        <Plate x={200} y={360} w={680} h={150} o={arrive(u, EW - 8, 10)} />
        <HudText f={u} x={540} y={470} size={96} color={GOLD} at={EW - 6} spacing={2}>8+ WEEKS</HudText>
      </> : <Timeline f={u} y={380} at={4} fill={k(u, FS - 20, FS + 24, 0, 1, Easing.out(Easing.cubic))} ticks={6} value="4-6 WEEKS" valueAt={FS + 4} color={CORAL} zone={[4 / 6, 1]} />;
      return { world, hud };
    }
    case "test3": { // ORBIT: an arc around Remy (arm in a cast) on the sunny street; the cyan ghost hops off the parked car and jogs on, its bar snaps back
      const IG = C("In the game, you climb", 35), KR = C("keep running", 65);
      const R: V3 = [0, 0.12, 2.2];
      const gx = -1.5 - k(u, IG, len + 20, 0, 1.3, Easing.linear);
      const world = <>
        <DaySky fogNear={40} fogFar={190} />
        <SunRig target={[0, 0, 1]} />
        <DayGround base={DAY.grass} speck="#6fae52" y={-0.05} />
        <Street z={-2.2} w={7} />
        <CityBackdrop z={-70} spread={150} />
        <Palms at={[[-10, 0, -9], [6, 0, -9.5], [15, 0, -8], [-17, 0, 5]]} s={1.3} />
        <Clouds t={t} at={[[-30, 26, -100], [20, 32, -120], [50, 22, -90]]} s={5} />
        <group position={[-3.4, 0, -2.0]}><Glb name="toy_car" s={2.0} line={2} blob={1.2} /></group>
        {u > IG - 6 && <Ghost p={[gx, 0.02, -1.0]} f={f} o={k(u, IG - 6, IG + 4, 0, 0.85)} pose={{ mood: "grin", arms: "down", walk: u * 0.45, speed: 1, flip: true }} />}
        <Hero p={R} look={REMY} pose={{ mood: u > KR ? "deadpan" : "smile", arms: "chest" }} f={f} rimO={0.35} />
        <Cast p={R} />
        <Move us={us} ls={ls} at={orbit([0, 1.5, 1.6], 9.2, 1.4, -0.42, 0.22, 44)} />
      </>;
      const fill = u < IG + 4 ? 1 : k(u, IG + 4, IG + 10, 1, 0.5, Easing.out(Easing.cubic)) + k(u, KR - 6, KR + 2, 0, 0.5, Easing.out(Easing.cubic));
      const hud = <>
        <TestTracker f={u} at={4} active={2} out={len - 8} />
        <HealthBar f={u} y={560} fill={fill} kind="game" at={IG - 6} flash={KR - 4} />
      </>;
      return { world, hud };
    }
    case "xray": {
      // sub 0 = PUSH-IN: toward the glowing X-ray lightbox; the break in the bone closes and a gold callus grows; timeline 6-8 weeks
      // sub 1 = PULL BACK (reveal): from a second film (a bad break, two cracks) back to Remy waiting by the hospital bed
      const SE = C("six to eight", 40), CT = C("can take months", 140);
      const knit = sub ? 1 : k(u, SE - 10, len + 10, 0, 1, Easing.inOut(Easing.quad));
      const bad = sub ? k(us, 6, ls + 60, 0.02, 0.45, Easing.linear) : 0;
      const R: V3 = [1.2, 0.02, -0.4];
      const world = <>
        <ClinicWorld t={t} knit={sub ? 0.6 : knit} bad={bad} target={sub ? [1, 1, -1] : [BOX_X, BOX_Y, CLINIC_Z]} />
        <Hero p={R} look={REMY} pose={{ mood: sub ? "worry" : "smile", arms: "chest", lookX: -0.5 }} f={f} rimO={0.35} />
        <Cast p={R} />
        {sub ? <Move us={us} ls={ls} at={line({ pos: [BOX_X + 0.15, BOX_Y + 0.25, 2.6], look: [BOX_X, BOX_Y + 0.55, CLINIC_Z], fov: 44 }, { pos: [1.2, 2.7, 9.6], look: [0.2, 1.75, -1.6], fov: 46 })} />
          : <Move us={us} ls={ls} at={line({ pos: [0.6, 2.4, 7.5], look: [BOX_X + 0.5, 2.0, CLINIC_Z], fov: 46 }, { pos: [BOX_X + 0.15, BOX_Y + 0.25, 2.6], look: [BOX_X, BOX_Y + 0.55, CLINIC_Z], fov: 44 })} />}
      </>;
      const hud = sub ? <Timeline f={us} y={380} at={2} fill={k(us, 4, ls, 0.15, 1, Easing.out(Easing.cubic))} ticks={6} value="3-6 MONTHS" valueAt={Math.max(8, CT - (len - ls) - 6)} color={CORAL} zone={[0.5, 1]} />
        : <Timeline f={u} y={380} at={SE - 16} fill={k(u, SE - 8, SE + 30, 0, 1, Easing.out(Easing.cubic))} ticks={8} value="6-8 WEEKS" valueAt={SE + 4} zone={[6 / 8, 1]} />;
      return { world, hud };
    }
    case "rest": { // TOP-DOWN (lowering): straight down on Remy asleep in bed with his cast; the game burger gets crossed out, then rest / food / sleep icons light up
      const RG = C("Rest, good", 35), GF = C("good food,", 45), SL = C("and sleep", 60);
      const world = <>
        <SunRig target={[0, 1, 0]} dir={[6, 12, 4]} />
        <DaySky fogNear={30} fogFar={140} />
        <Surface lit p={[0, 0.01, 0]} s={[24, 24]} rot={[-Math.PI / 2, 0, 0]} kind="wood" a={disp(DAY.wood)} b={disp(DAY.wood2)} unit={1.6} />
        <Surface lit p={[0.2, 0.02, 0.6]} s={[5.4, 6.4]} rot={[-Math.PI / 2, 0, 0]} kind="carpet" a={disp("#9fc7e8")} b={disp("#b9d8f0")} unit={1.2} />
        <SunPatch p={[-1.8, 0.02, 1.6]} s={[4, 3]} o={0.25} />
        <Glb name="bed_1964" p={[0, 0, 0]} rot={[0, -Math.PI / 2, 0]} line={2} fallback={<Box p={[0, 0.6, 0]} s={[2, 0.7, 4.4]} color="#efe3cc" line={2} />} />
        <Panel p={[0, 1.02, 0.1]} s={[2.5 * 512 / 768, 2.5]} rot={[-Math.PI / 2, 0, 0]} px={[512, 768]} dep={Math.floor(f / 3)} draw={(c, W, H) => drawPuppet(c, W, H, REMY, { mood: "sleep", arms: "chest", t: f })} />
        <Box p={[0, 1.1, 1.0]} s={[1.9, 0.12, 2.3]} color={disp(CORAL)} line={2} />
        <group position={[0.15, 1.24, 0.05]} rotation={[-Math.PI / 2, 0, 0]}><Glb name="arm_cast" line={2} /></group>
        <Glb name="side_table" p={[1.75, 0, -1.6]} s={0.9} line={2} />
        <Ball p={[1.6, 1.05, -1.5]} r={0.16} color={disp("#e0453a")} />
        <Cyl p={[1.95, 1.08, -1.75]} rt={0.09} h={0.3} color={disp("#bfe3f7")} line={1} />
        <Motes t={t} c={[0, 1.6, -0.4]} area={[1.2, 0.4, 1]} n={10} color="#ffffff" size={0.05} o={0.6} />
        <Move us={us} ls={ls} at={line({ pos: [0, 14, 0.9], look: [0, 0.9, 0.1], fov: 46 }, { pos: [0, 9.2, 0.7], look: [0, 0.9, 0.1], fov: 46 })} />
      </>;
      // the crossed-out game burger leaves its slot before the three real icons (rest / food / sleep) arrive
      const hud = u < RG - 10 ? <IconTile f={u} x={540} y={470} at={4} kind="burger" color={CYAN} strike={k(u, 16, 30, 0, 1)} />
        : <>
          <IconTile f={u} x={300} y={470} at={RG - 2} kind="bed" />
          <IconTile f={u} x={540} y={470} at={GF} kind="apple" />
          <IconTile f={u} x={780} y={470} at={SL} kind="moon" />
        </>;
      return { world, hud };
    }
    case "realbar": { // TRACKING / TRUCK: the camera trucks with Remy along the park path past a giant real health bar on the lawn that fills, slowly
      const IR = C("It refills.", 30);
      const e = shotE(us, ls);
      const x = -3.0 + 3.6 * e, R: V3 = [x, 0, 1.4];
      const fill = 0.25 + k(u, IR - 6, len + 40, 0, 0.35, Easing.linear);
      const BW = 6, BX = 0.2, BY = 3.4, BZ = -3.4;
      const world = <>
        <ParkWorld t={t} hero={[0, 0, 0]} table={false} />
        <Box p={[BX, BY, BZ]} s={[BW + 0.5, 1.3, 0.3]} color={disp("#1b2238")} line={3} />
        <NeonBar p={[BX - BW / 2 + (BW * fill) / 2, BY, BZ + 0.2]} s={[BW * fill, 0.9, 0.1]} color={N3.gold} glow={0.6} />
        {[-1, 1].map((s) => <Cyl key={s} p={[BX + s * (BW / 2 - 0.4), BY / 2 - 0.3, BZ]} rt={0.1} h={BY - 0.6} color={disp("#9aa0ab")} line={2} />)}
        <Panel p={[BX - BW / 2 - 0.9, BY, BZ + 0.1]} s={[1.3, 1.3]} px={[160, 160]} dep={1} draw={(c, W) => {
          c.fillStyle = "#3a2a0c"; c.beginPath(); c.arc(W / 2, W / 2, W * 0.47, 0, 7); c.fill(); c.strokeStyle = "#f5b942"; c.lineWidth = 8; c.stroke();
          c.fillStyle = "#f5b942"; c.beginPath(); c.moveTo(W / 2, W * 0.74); c.bezierCurveTo(W * 0.1, W * 0.5, W * 0.25, W * 0.2, W / 2, W * 0.38); c.bezierCurveTo(W * 0.75, W * 0.2, W * 0.9, W * 0.5, W / 2, W * 0.74); c.fill();
        }} />
        <Halo p={[BX - BW / 2 + BW * fill, BY, BZ + 0.4]} r={0.9} color={N3.gold} o={0.5 + 0.2 * Math.sin(f * 0.2)} />
        <Hero p={R} look={REMY} pose={{ mood: "smile", arms: "chest", walk: u * 0.22, speed: e < 0.97 ? 0.6 : 0 }} f={f} rimO={0.35} />
        <Cast p={R} />
        <Move us={us} ls={ls} at={() => ({ pos: [x + 0.4, 3.0, R[2] + 11.5], look: [x * 0.5 - 0.3, 2.9, R[2] - 1.5], fov: 48 })} />
      </>;
      return { world };
    }
    case "outro": { // CRANE UP (rise): from Remy's height the camera rises over the park: the cyan game bar is full in a blink, the gold real bar creeps on, one sun tick per day
      const IR = C("In real life, your body is", 40), ES = C("every single day", 85);
      const R: V3 = [0, 0, 1.6];
      const BW = 7.6, BZ = -3.6;
      const real = 0.35 + k(u, IR, len + 20, 0, 0.25, Easing.linear);
      const game = k(u, 4, 10, 0.3, 1, Easing.out(Easing.cubic));
      const days = Math.max(0, Math.min(7, Math.floor((u - ES + 4) / 7) + 1));
      const world = <>
        <ParkWorld t={t} hero={[0, 0, 0]} table={false} warm={0.25} />
        {[[5.6, CYAN, game], [3.8, N3.gold, real]].map(([y, col, fl], i) => <group key={i}>
          <Box p={[0, y as number, BZ]} s={[BW + 0.5, 1.2, 0.3]} color={disp("#1b2238")} line={3} />
          <NeonBar p={[-BW / 2 + (BW * (fl as number)) / 2, y as number, BZ + 0.2]} s={[BW * (fl as number), 0.8, 0.1]} color={col as string} glow={0.6} />
        </group>)}
        {[-1, 1].map((s) => <Cyl key={s} p={[s * (BW / 2 - 0.4), 1.6, BZ - 0.1]} rt={0.1} h={6.0} color={disp("#9aa0ab")} line={2} />)}
        {Array.from({ length: days }, (_, i) => <group key={i}><Ball p={[-BW / 2 + 0.6 + i * 1.0, 2.7, BZ + 0.2]} r={0.22} color={disp(N3.amber)} ink={0.03} /><Halo p={[-BW / 2 + 0.6 + i * 1.0, 2.7, BZ + 0.3]} r={0.5} color={N3.gold} o={0.4} /></group>)}
        <Hero p={R} look={REMY} pose={{ mood: "grin", arms: "chest" }} f={f} rimO={0.4} />
        <Cast p={R} />
        <Move us={us} ls={ls} at={line({ pos: [0.6, 1.9, 9.4], look: [0, 1.7, 0], fov: 48 }, { pos: [0.6, 7.0, 15.5], look: [0, 2.3, -2.6], fov: 48 })} />
      </>;
      return { world };
    }
    default: { // ask - CRANE + LAND: drops gently from above and lands level on Remy at the picnic table (cast off, plaster gone); the question card (A-D)
      const R: V3 = [0, 0, 0.6];
      const world = <>
        <ParkWorld t={t} hero={R} warm={0.4} />
        <Hero p={R} look={REMY} pose={{ mood: "grin", arms: u > 26 ? "point" : "up", armK: u > 26 ? 1 : 0.8 }} f={f} rimO={0.45} />
        <Move us={us} ls={ls} at={line({ pos: [0.8, 9.5, 15.5], look: [0, 1.2, 0.6], fov: 46 }, { pos: [0.4, 3.0, 13.8], look: [0, 2.0, 0.6], fov: 46 })} />
      </>;
      const hud = <>
        <HudText f={u} x={540} y={420} size={60} color={CREAM} at={4} out={len + 30}>COMMENT</HudText>
        <HudText f={u} x={540} y={505} size={76} color={GOLD} at={8} out={len + 30}>A, B, C OR D</HudText>
        <ChoiceCards f={u} y={720} at={12} cw={470} ch={130} cards={[{ letter: "A", text: "A CUT" }, { letter: "B", text: "A BREAK" }, { letter: "C", text: "A SPRAIN" }, { letter: "D", text: "OTHER" }]} />
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
  id: "wi-gta-healing",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: N3.bg,
};
export default story;
