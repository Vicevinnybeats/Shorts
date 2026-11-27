// GTA 6 WHAT IF #8 "Imagine You Were an NPC in GTA 6 for One Day" - bright DAYLIGHT Stick3D look (as approved for
// What If 1-6: big 3D worlds with sky, clouds, sun, haze; Remy = REMY3D puppet + beanie; Golden Neon only for HUD;
// cyan only for the GAME layer). Remy is a background "NPC" with a small floating cyan NPC marker. Central motif: a
// 24-hour DAY RING (HUD) that fills slice by slice as his day goes: sleep ~9 H, commute ~27 MIN, work ~7.5 H, chores
// ~2 H, leisure = the rest (~5 H, of it TV ~2.6 H). Then the NPC LOOP (a circular path through his five places, high
// top-down), the cyan "main character" coupe whooshes past while Remy waves, the twist (a spotlight swings onto Remy,
// his NPC marker flips into a gold star), and Remy steps off the loop onto a new gold branch path.
// Facts (RESEARCH.md): ATUS 2024 (15+, per day): sleep 9.04 h; employed on days worked 7.60 h; household 2.01 h;
// leisure 5.07 h; TV 2.6 h. ACS 2023 mean one-way commute 26.8 min. The ring uses 9 / 0.45 / 7.5 / 2 h and leisure =
// the rest of the day (5.05 h): different survey groups, so it is an illustration of the averages, not one diary.
// Every beat is cue-driven (C(phrase, fallback)) so the picture follows words.json. Real shots with hard cuts; every
// PLACE change = shape morph; one NAMED camera move per shot (comment on each case), never reversing.
// Layout: HUD y 300-1350; figures stay above y 1430 (captions own 1440-1640).
// NO DOUBLE TEXT: on-screen words never repeat what the caption says at that moment (numbers, units, icons instead;
// the NPC marker and the star are icons, no letters).
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
import { Cam, Key, FaceGroup, SpotCone, StreetLamp } from "../../library/stick3d/extra";
import { Glb } from "../../library/stick3d/glb";
import { DaySky, SunRig, DayGround, CityBackdrop, Palms, Clouds, WindowWall, SunPatch, disp, DAY } from "../../library/stick3d/daylight";
import { drawPuppet, Look, Pose } from "../../library/stick3d/puppet";
import { N3, Halo, Panel, FloorPool } from "../../library/stick3d/neon";

// ---------------------------------------------------------------- cast
const REMY: Look = { ...REMY3D, beanie: "#2e3658", beanieBand: N3.gold, pom: N3.amber };
const MOM: Look = { skin: "#e0a77e", body: "#ff9a7a", outfit: "blazer", shirt: "#fff3d0", hair: "swept", hairColor: "#6a3a22", shoe: "#0b0d1a" };
const PAL: Look = { skin: "#8d5a3b", body: "#4fa3c4", outfit: "shirt", hair: "flattop", hairColor: "#141018", shoe: "#0b0d1a" };
const KID: Look = { skin: "#f3d2b3", body: "#7fc47a", outfit: "hoodie", hair: "swept", hairColor: "#8a5a32", shoe: "#0b0d1a" };
const GREY: Look = { skin: "#e8c4a0", body: "#b4b9c8", outfit: "shirt", hair: "short", hairColor: "#3a3340", shoe: "#2b3350" };
const GREY2: Look = { skin: "#c98a5e", body: "#c7bfae", outfit: "hoodie", hair: "bob", hairColor: "#2a1a12", shoe: "#2b3350" };
const { gold: GOLD, coral: CORAL, amber: AMBER, text: CREAM, cyan: CYAN, muted: MUTED, hot: HOT } = NEON;
const RED = "#ff4d5e";

// ---------------------------------------------------------------- shots
type ShotDef = { id: string; cue: string; parent: string; sub: number };
const DEFS: ShotDef[] = [
  { id: "hook", cue: "Imagine you were", parent: "hook", sub: 0 },
  { id: "hookb", cue: "No missions.", parent: "hook", sub: 1 },
  { id: "wake", cue: "Remy wakes up.", parent: "wake", sub: 0 },
  { id: "commute", cue: "Then the commute.", parent: "commute", sub: 0 },
  { id: "work", cue: "On days they", parent: "work", sub: 0 },
  { id: "chores", cue: "Somewhere in there,", parent: "chores", sub: 0 },
  { id: "leisure", cue: "Then free time.", parent: "leisure", sub: 0 },
  { id: "leisureb", cue: "And the biggest", parent: "leisure", sub: 1 },
  { id: "loop", cue: "That's the real", parent: "loop", sub: 0 },
  { id: "car", cue: "Meanwhile, the main", parent: "car", sub: 0 },
  { id: "twist", cue: "But here's the", parent: "twist", sub: 0 },
  { id: "twistb", cue: "To the people", parent: "twist", sub: 1 },
  { id: "outro", cue: "In the game,", parent: "outro", sub: 0 },
  { id: "outrob", cue: "In real life, you", parent: "outro", sub: 1 },
  { id: "ask", cue: "What's one thing", parent: "ask", sub: 0 },
];
const DEF: Record<string, ShotDef> = Object.fromEntries(DEFS.map((d) => [d.id, d]));
const SHOTS = DEFS.map((d) => ({ id: d.id, cue: d.cue }));
const TR_FRAMES = 14;
/** place of each scene (parent): a PLACE change = shape-morph transition, everything else = hard cut */
const PLACE: Record<string, string> = {
  hook: "street", wake: "bedroom", commute: "busstop", work: "office", chores: "kitchen", leisure: "living",
  loop: "loop", car: "street", twist: "street", outro: "loop", ask: "loop",
};
/** background colour of each scene = the flood colour of the morph INTO it */
const BG: Record<string, string> = {
  hook: "#cfe9fb", wake: "#ffe2c4", commute: "#cfe9fb", work: "#eef3f8", chores: "#eef3f8", leisure: "#ffd9b0",
  loop: "#d8f0c8", car: "#cfe9fb", twist: "#cfe9fb", outro: "#d8f0c8", ask: "#d8f0c8",
};
/** key object of the OUTGOING shot that becomes the transition shape (screen rect, radius) */
const RING = { cx: 270, cy: 420, r: 84 };
const KEY_DEF = { cx: 540, cy: 900, w: 380, h: 380, r: 190 };
const RING_KEY = { cx: RING.cx, cy: RING.cy, w: 220, h: 220, r: 110 };
const KEY_OBJ: Record<string, typeof KEY_DEF> = {
  hookb: { cx: 540, cy: 760, w: 300, h: 300, r: 150 },                 // the NPC marker over Remy's head
  wake: RING_KEY, commute: RING_KEY, work: RING_KEY, chores: RING_KEY, leisureb: RING_KEY, // the day ring
  loop: { cx: 540, cy: 620, w: 150, h: 150, r: 75 },                    // the repeat tile
  twistb: { cx: 540, cy: 700, w: 260, h: 260, r: 130 },                 // the gold star
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
/** DOLLY ZOOM (vertigo): the camera travels from d0 to d1 along `dir` while the FOV changes so the subject keeps its
 *  size (d * tan(fov/2) constant) and the background swells / stretches */
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

// ---------------------------------------------------------------- HUD icons (line icons, centred, ~90 px)
const ICON: Record<string, string> = {
  moon: "M 14 -38 A 38 38 0 1 0 38 14 A 30 30 0 1 1 14 -38 Z M 26 -30 L 30 -22 M 34 -34 L 38 -26",
  bus: "M -36 -34 L 36 -34 Q 42 -34 42 -28 L 42 24 L -42 24 L -42 -28 Q -42 -34 -36 -34 Z M -34 -24 L 34 -24 L 34 -2 L -34 -2 Z M -26 24 L -26 34 M 26 24 L 26 34 M -30 12 L -22 12 M 22 12 L 30 12",
  work: "M -40 -32 L 40 -32 L 40 18 L -40 18 Z M -12 18 L -16 34 M 12 18 L 16 34 M -24 34 L 24 34 M -28 -18 L 6 -18 M -28 -4 L 18 -4",
  broom: "M 30 -42 L -4 14 M -22 6 L 14 26 L 2 42 L -34 22 Z M -26 30 L -32 40 M -16 36 L -20 44 M -6 40 L -8 46",
  sofa: "M -42 -6 L -42 30 L 42 30 L 42 -6 M -42 -6 Q -42 -16 -32 -16 L -32 8 L 32 8 L 32 -16 Q 42 -16 42 -6 M -32 -16 L -32 -30 L 32 -30 L 32 -16 M -34 30 L -34 38 M 34 30 L 34 38",
  tv: "M -42 -30 L 42 -30 L 42 22 L -42 22 Z M -18 34 L 18 34 M 0 22 L 0 34 M -16 -44 L 0 -30 L 16 -44",
  marker: "M 0 42 L -26 -2 A 30 30 0 1 1 26 -2 Z M 0 -30 A 10 10 0 1 1 -0.1 -30",
  bag: "M -40 -2 Q -40 -18 -24 -18 L 24 -18 Q 40 -18 40 -2 L 40 26 Q 40 32 32 32 L -32 32 Q -40 32 -40 26 Z M -14 -18 Q -14 -36 0 -36 Q 14 -36 14 -18 M -10 8 L 10 8 M 0 -2 L 0 18",
  repeat: "M -34 -6 A 34 30 0 0 1 28 -18 M 28 -18 L 30 -36 M 28 -18 L 10 -16 M 34 6 A 34 30 0 0 1 -28 18 M -28 18 L -30 36 M -28 18 L -10 16",
  page: "M -30 -42 L 16 -42 L 32 -26 L 32 42 L -30 42 Z M 16 -42 L 16 -26 L 32 -26 M -18 -16 L 20 -16 M -18 0 L 20 0 M -18 16 L 20 16 M -18 30 L 6 30",
  pen: "M -30 30 L -24 12 L 18 -30 L 30 -18 L -12 24 Z M 12 -24 L 24 -12",
  heart: "M 0 34 L -34 0 Q -46 -16 -32 -30 Q -16 -42 0 -24 Q 16 -42 32 -30 Q 46 -16 34 0 Z",
};
/** round icon tile; `strike` draws a red line through it, `lit` makes it glow */
const IconTile: React.FC<{ f: number; x: number; y: number; at: number; kind: string; strike?: number; color?: string; r?: number; out?: number; dim?: boolean }> = ({ f, x, y, at, kind, strike = 0, color = GOLD, r = 70, out = Infinity, dim }) => {
  const p = drawOn(f, at, 12) * leaveO(f, out); if (p <= 0) return null;
  return <g transform={`translate(${x} ${y - (1 - p) * 16})`} opacity={p * (dim ? 0.55 : 1)}>
    <circle r={r} fill={color === CYAN ? "#0b3a46" : "#3a2a0c"} opacity={0.8} />
    <circle r={r} fill="none" stroke={color} strokeWidth={4} opacity={0.9} />
    <g transform={`scale(${(r / 78) * 0.95})`}><NeonPath d={ICON[kind]} w={5} color={color} hot={!dim} /></g>
    {strike > 0 && <NeonPath d={`M ${-r * 0.72} ${r * 0.72} L ${r * 0.72} ${-r * 0.72}`} w={9} color={RED} p={strike} hot />}
  </g>;
};

// ---------------------------------------------------------------- THE MOTIF: the 24-hour day ring
/** hours per slice (sleep, commute one way, work day, chores, leisure = the rest of the day); sums to 24 */
const HOURS = [9, 0.45, 7.5, 2, 5.05];
const SCOL = ["#9fb4ff", CORAL, GOLD, HOT, AMBER]; // night blue for sleep, then Golden Neon
const SICON = ["moon", "bus", "work", "broom", "sofa"];
const TV_H = 2.6;
const START = HOURS.map((_, i) => HOURS.slice(0, i).reduce((a, b) => a + b, 0));
const ang = (h: number) => (h / 24) * Math.PI * 2 - Math.PI / 2; // 0 h at the top, clockwise
const arc = (cx: number, cy: number, r: number, h0: number, h1: number) => {
  const a0 = ang(h0), a1 = ang(h1), big = h1 - h0 > 12 ? 1 : 0;
  return `M ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${big} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`;
};
/** donut of the day: slices < n are full (dimmed), slice n grows with `fill` (bright), the centre shows its icon;
 *  `tv` (0..1) draws the TV part as an inner coral arc inside the leisure slice */
const DayRing: React.FC<{ f: number; at: number; n: number; fill: number; tv?: number; out?: number; cx?: number; cy?: number; r?: number; icon?: string }> =
  ({ f, at, n, fill, tv = 0, out = Infinity, cx = RING.cx, cy = RING.cy, r = RING.r, icon }) => {
    const o = drawOn(f, at, 12) * leaveO(f, out); if (o <= 0) return null;
    const W = r * 0.42, gap = 0.08;
    return <g opacity={o}>
      <circle cx={cx} cy={cy} r={r + W * 0.62} fill="#0b0d1a" opacity={0.55} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3a2c14" strokeWidth={W} opacity={0.8} />
      {[0, 6, 12, 18].map((h) => { const a = ang(h); return <line key={h} x1={cx + (r + W * 0.55) * Math.cos(a)} y1={cy + (r + W * 0.55) * Math.sin(a)} x2={cx + (r + W * 0.8) * Math.cos(a)} y2={cy + (r + W * 0.8) * Math.sin(a)} stroke={CREAM} strokeWidth={4} opacity={0.7} />; })}
      {HOURS.map((h, i) => {
        const part = i < n ? 1 : i === n ? fill : 0; if (part <= 0.001) return null;
        const h0 = START[i] + (i ? gap : 0), h1 = START[i] + Math.max(gap * 2, h * part) - gap;
        return <g key={i}>
          {i === n && <path d={arc(cx, cy, r, h0, Math.max(h0 + 0.02, h1))} fill="none" stroke={SCOL[i]} strokeWidth={W * 1.5} opacity={0.25} />}
          <path d={arc(cx, cy, r, h0, Math.max(h0 + 0.02, h1))} fill="none" stroke={SCOL[i]} strokeWidth={W} opacity={i === n ? 1 : 0.72} />
        </g>;
      })}
      {tv > 0 && <path d={arc(cx, cy, r - W * 0.18, START[4] + gap, START[4] + gap + (TV_H - gap) * tv)} fill="none" stroke={CORAL} strokeWidth={W * 0.5} />}
      {icon && <g transform={`translate(${cx} ${cy}) scale(${r / 150})`}><NeonPath d={ICON[icon]} w={6} color={tv > 0 ? CORAL : SCOL[Math.min(4, n)]} hot /></g>}
    </g>;
  };
/** the day ring with its readout on one dark plate (top of frame): ring left, value right */
const DayHud: React.FC<{ f: number; at: number; n: number; fillAt: number; value: string; tvAt?: number; out?: number; icon?: string }> = ({ f, at, n, fillAt, value, tvAt, out = Infinity, icon }) => {
  const o = drawOn(f, at, 12) * leaveO(f, out); if (o <= 0) return null;
  const fill = tvAt === undefined ? k(f, fillAt, fillAt + 22, 0, 1, Easing.out(Easing.cubic)) : 1;
  const tv = tvAt === undefined ? 0 : k(f, tvAt, tvAt + 22, 0, 1, Easing.out(Easing.cubic));
  const valAt = tvAt ?? fillAt;
  return <g opacity={o}>
    <Plate x={130} y={298} w={820} h={244} o={1} r={44} />
    <DayRing f={f} at={at} n={n} fill={fill} tv={tv} icon={icon ?? (tvAt !== undefined ? "tv" : SICON[n])} />
    <text x={410} y={378} fontFamily={WI_FONT} fontWeight={900} fontSize={38} fill={MUTED} letterSpacing={3}>24 H</text>
    <HudText f={f} x={406} y={478} size={96} color={tvAt !== undefined ? CORAL : SCOL[n]} at={valAt + 8} out={out} anchor="start" spacing={2}>{value}</HudText>
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
/** THE NPC MARKER: a small floating cyan map-pin with a person glyph (no letters) over Remy's head. `flip` 0..1 turns
 *  it round on the spot (squashes to edge-on) and at the half-way point it becomes a GOLD STAR (the "you" icon). */
const drawPin = (c: CanvasRenderingContext2D, W: number, H: number, sx: number) => {
  c.save(); c.translate(W / 2, H / 2); c.scale(Math.max(0.04, sx), 1);
  const R = W * 0.3;
  const g = c.createRadialGradient(0, -R * 0.3, R * 0.2, 0, -R * 0.3, R * 1.6); g.addColorStop(0, "rgba(95,227,255,0.3)"); g.addColorStop(1, "rgba(95,227,255,0)");
  c.fillStyle = g; c.fillRect(-W / 2, -H / 2, W, H);
  c.beginPath(); c.moveTo(0, R * 1.45); c.lineTo(-R * 0.86, R * 0.2); c.arc(0, -R * 0.3, R, Math.PI * 0.85, Math.PI * 0.15); c.closePath();
  c.fillStyle = "#5fe3ff"; c.fill(); c.lineWidth = W * 0.035; c.strokeStyle = "#ffffff"; c.stroke();
  c.fillStyle = "#06222b"; c.beginPath(); c.arc(0, -R * 0.3, R * 0.62, 0, 7); c.fill();
  c.fillStyle = "#5fe3ff"; c.beginPath(); c.arc(0, -R * 0.48, R * 0.2, 0, 7); c.fill();
  c.beginPath(); c.ellipse(0, -R * 0.02, R * 0.34, R * 0.2, 0, Math.PI, 0); c.fill();
  c.restore();
};
const drawStar = (c: CanvasRenderingContext2D, W: number, H: number, sx: number, glow: number) => {
  c.save(); c.translate(W / 2, H / 2); c.scale(Math.max(0.04, sx), 1);
  const R = W * 0.34;
  const g = c.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 1.5); g.addColorStop(0, `rgba(255,214,110,${0.18 + 0.14 * glow})`); g.addColorStop(1, "rgba(255,214,110,0)");
  c.fillStyle = g; c.fillRect(-W / 2, -H / 2, W, H);
  c.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? R * 0.45 : R; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  c.closePath(); c.fillStyle = "#f5b942"; c.fill(); c.lineJoin = "round"; c.lineWidth = W * 0.035; c.strokeStyle = "#fff3d0"; c.stroke();
  c.fillStyle = "rgba(255,255,255,0.55)"; c.beginPath(); c.ellipse(-R * 0.18, -R * 0.22, R * 0.12, R * 0.22, -0.5, 0, 7); c.fill();
  c.restore();
};
const NpcTag: React.FC<{ p: V3; f: number; flip?: number; s?: number; o?: number }> = ({ p, f, flip = 0, s = 0.62, o = 1 }) => {
  if (o <= 0.01) return null;
  const a = flip * Math.PI, sx = Math.abs(Math.cos(a)), star = flip >= 0.5;
  const glow = star ? 0.5 + 0.5 * Math.sin(f * 0.2) : 0;
  return <group position={[p[0], p[1] + 0.07 * Math.sin(f * 0.12), p[2]]}>
    <Panel p={[0, 0, 0]} s={[s, s]} px={[192, 192]} face o={o} dep={`${star ? 1 : 0}|${sx.toFixed(2)}|${glow.toFixed(1)}`} draw={(c, W, H) => (star ? drawStar(c, W, H, sx, glow) : drawPin(c, W, H, sx))} />
    <Halo p={[0, 0, -0.05]} r={s * 0.6} color={star ? N3.gold : CYAN} o={(star ? 0.3 : 0.25) * o} />
  </group>;
};
/** expanding ring (a jump / a thud): a flat torus that grows + fades */
const Ring: React.FC<{ p: V3; u: number; at: number; color?: string; s?: number; rot?: V3 }> = ({ p, u, at, color = "#fff3d0", s = 1, rot = [-Math.PI / 2, 0, 0] }) => {
  const q = (u - at) / 16; if (q < 0 || q > 1) return null;
  const r = s * (0.4 + 2.2 * Easing.out(Easing.cubic)(q));
  return <group position={p} rotation={rot}>
    <mesh><torusGeometry args={[r, 0.05 * s, 8, 48]} /><meshBasicMaterial color={color} transparent opacity={1 - q} toneMapped={false} depthWrite={false} /></mesh>
  </group>;
};
/** bright fabric couch built from boxes (the navy Blender couch reads as a dark slab in daylight) */
const BrightCouch: React.FC<{ p: V3; s?: number; rotY?: number }> = ({ p, s = 1, rotY = 0 }) => (
  <group position={p} scale={s} rotation={[0, rotY, 0]}>
    <Box p={[0, 0.42, 0]} s={[4.8, 0.84, 1.5]} color={disp("#4fa3c4")} line={3} />
    <Box p={[0, 1.3, -0.62]} s={[4.8, 1.3, 0.34]} color={disp("#4fa3c4")} line={3} />
    <Box p={[-1.15, 0.92, 0.05]} s={[2.2, 0.18, 1.3]} color={disp("#f3e6cc")} line={3} /><Box p={[1.15, 0.92, 0.05]} s={[2.2, 0.18, 1.3]} color={disp("#f3e6cc")} line={3} />
    <Box p={[-2.55, 0.75, 0]} s={[0.4, 1.5, 1.6]} color={disp("#3f8fb0")} line={3} /><Box p={[2.55, 0.75, 0]} s={[0.4, 1.5, 1.6]} color={disp("#3f8fb0")} line={3} />
    <Box p={[1.75, 1.35, -0.35]} s={[0.8, 0.7, 0.22]} rot={[0, 0, 0.15]} color={disp("#f5b942")} line={3} />
  </group>
);
/** the TV picture: a cartoon show (sun, hills, a bouncing ball) - no text, no real show */
const TvPicture: React.FC<{ p: V3; w: number; h: number; f: number }> = ({ p, w, h, f }) => (
  <Panel p={p} s={[w, h]} px={[400, 226]} dep={Math.floor(f / 2)} draw={(c, W, H) => {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#6fc3ff"); g.addColorStop(1, "#c8ecff"); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = "#ffd76e"; c.beginPath(); c.arc(W * 0.8, H * 0.25, H * 0.13, 0, 7); c.fill();
    c.fillStyle = "#7fc46a"; c.beginPath(); c.ellipse(W * 0.3, H * 1.05, W * 0.45, H * 0.4, 0, 0, 7); c.fill();
    c.fillStyle = "#5fae55"; c.beginPath(); c.ellipse(W * 0.85, H * 1.1, W * 0.4, H * 0.42, 0, 0, 7); c.fill();
    const bx = W * (0.2 + 0.6 * ((f * 0.012) % 1)), by = H * 0.72 - Math.abs(Math.sin(f * 0.16)) * H * 0.4;
    c.fillStyle = "#ff7a59"; c.beginPath(); c.arc(bx, by, H * 0.08, 0, 7); c.fill();
    c.fillStyle = "rgba(255,255,255,.12)"; c.fillRect(0, 0, W, H * 0.12);
  }} />
);
/** a gold "you" heart that floats up from a friend (tiny face-on panel) */
const FloatHeart: React.FC<{ p: V3; u: number; at: number; s?: number }> = ({ p, u, at, s = 0.4 }) => {
  const q = (u - at) / 50; if (q < 0) return null;
  const o = q < 0.2 ? q / 0.2 : Math.max(0, 1 - (q - 0.2) / 0.8);
  return <Panel p={[p[0] + Math.sin(q * 6) * 0.08, p[1] + q * 1.1, p[2]]} s={[s, s]} px={[96, 96]} face o={o} dep={1} draw={(c, W) => {
    c.translate(W / 2, W / 2 + 4); c.scale(W / 100, W / 100);
    c.beginPath(); c.moveTo(0, 34); c.lineTo(-34, 0); c.quadraticCurveTo(-46, -16, -32, -30); c.quadraticCurveTo(-16, -42, 0, -24); c.quadraticCurveTo(16, -42, 32, -30); c.quadraticCurveTo(46, -16, 34, 0); c.closePath();
    c.fillStyle = "#ff7a59"; c.fill(); c.lineWidth = 6; c.strokeStyle = "#fff3d0"; c.stroke();
  }} />;
};

// ---------------------------------------------------------------- worlds
const Street: React.FC<{ z?: number; w?: number; len?: number }> = ({ z = 0, w = 6, len = 160 }) => (
  <group position={[0, 0, z]}>
    <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[len, w]} /><meshLambertMaterial color={disp(DAY.asphalt)} /></mesh>
    {Array.from({ length: 27 }, (_, i) => <mesh key={i} position={[-len / 2 + i * 6, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.4, 0.16]} /><meshBasicMaterial color={disp("#fff6d8")} /></mesh>)}
    {[-1, 1].map((s) => <mesh key={s} position={[0, 0.06, s * (w / 2 + 0.9)]} receiveShadow><boxGeometry args={[len, 0.12, 1.8]} /><meshLambertMaterial color={disp("#e6dccb")} /></mesh>)}
  </group>
);
/** sunny city STREET: sidewalk plaza, a road behind, palms, street lamps, the skyline in the haze, background NPCs */
const STREET_Z = -6.2;
const StreetWorld: React.FC<{ t: number; f: number; hero?: V3; warm?: number; extras?: boolean; stop?: boolean }> = ({ t, f, hero = [0, 0, 0.6], warm = 0, extras = true, stop }) => (<>
  <DaySky fogNear={40} fogFar={190} warm={warm} />
  <SunRig target={hero} />
  <DayGround base={DAY.sand} speck="#c99a62" y={-0.05} z={-40} />
  <Surface lit p={[0, 0.01, 0.5]} s={[40, 11]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#efe2c8")} b={disp("#e4d4b4")} unit={2.0} />
  <Street z={STREET_Z} w={7} />
  <Palms at={[[-7, 0, -2.6], [7.5, 0, -2.4], [-12, 0, 2], [12, 0, 3], [-4, 0, -12], [6, 0, -13]]} s={1.3} />
  <StreetLamp p={[-4.2, 0, -2.2]} on={0} />
  <StreetLamp p={[4.4, 0, -2.2]} on={0} flip />
  {stop && <Glb name="bus_stop" p={[3.0, 0, -2.9]} rot={[0, Math.PI, 0]} line={2} blob={1.6} fallback={<Box p={[3.0, 1.4, -2.9]} s={[3.4, 2.8, 1.4]} color={disp("#bfe6f2")} line={2} />} />}
  <CityBackdrop z={-85} spread={170} />
  <Clouds t={t} at={[[-30, 28, -100], [24, 34, -120], [50, 24, -90], [-60, 22, -70]]} s={5} />
  {extras && <>
    <Person p={[-5.4 + ((f * 0.02) % 3), 0, -2.0]} h={2.3} look={GREY} pose={{ mood: "deadpan", walk: f * 0.22, speed: 0.6 }} f={f} />
    <Person p={[5.8 - ((f * 0.018) % 3), 0, -1.6]} h={2.35} look={GREY2} pose={{ mood: "deadpan", walk: f * 0.2, speed: 0.6, flip: true }} f={f} />
  </>}
</>);
/** dawn BEDROOM: plank floor, window wall with the warm morning sky, the bed, nightstand + alarm clock */
const BWALL = -3.4;
const BedroomWorld: React.FC<{ t: number; target?: V3; dawn?: number }> = ({ t, target = [0, 1, -1], dawn = 1 }) => (<>
  <DaySky fogNear={30} fogFar={160} warm={dawn} />
  <SunRig target={target} dir={[7, 5, 6]} k={0.9} />
  <DayGround base={DAY.grass} speck="#6fae52" y={-0.4} z={-60} />
  <CityBackdrop z={-55} spread={120} />
  <Clouds t={t} at={[[-20, 18, -90], [26, 22, -110]]} s={5} />
  <Surface lit p={[0, 0.01, 0]} s={[22, 16]} rot={[-Math.PI / 2, 0, 0]} kind="plank" a={disp("#d9b07a")} b={disp("#c99c66")} unit={1.6} />
  <WindowWall z={BWALL} W={28} H={8} win={{ x: 1.4, y: 1.6, w: 3.6, h: 2.8 }} a="#f3e2ec" kind="plain" />
  <SunPatch p={[1.2, 0, -1.0]} s={[5, 2.6]} o={0.3} />
  <Glb name="bed_modern" p={[-1.6, 0, -1.9]} line={2} blob={1.6} fallback={<Box p={[-1.6, 0.45, -1.9]} s={[3.2, 0.9, 2.0]} color={disp("#f6efe2")} line={2} />} />
  <Glb name="side_table" p={[3.6, 0, -2.5]} s={0.9} line={2} blob={0.6} />
  <Surface lit p={[1.2, 0.02, 0.2]} s={[3.6, 2.4]} rot={[-Math.PI / 2, 0, 0]} kind="carpet" a={disp("#ffcf9e")} b={disp("#f5b98a")} unit={0.8} />
</>);
/** bright OFFICE: carpet, a big window wall to the city, Remy's desk + two more desks with grey NPC coworkers */
const OWALL = -5.0;
const OfficeWorld: React.FC<{ t: number; f: number; target?: V3 }> = ({ t, f, target = [0, 1, -0.6] }) => (<>
  <DaySky fogNear={30} fogFar={160} />
  <SunRig target={target} dir={[5, 9, 6]} />
  <DayGround base={DAY.grass} speck="#6fae52" y={-0.4} z={-60} />
  <CityBackdrop z={-45} spread={120} />
  <Clouds t={t} at={[[-20, 22, -90], [26, 28, -110]]} s={5} />
  <Surface lit p={[0, 0.01, 0]} s={[30, 20]} rot={[-Math.PI / 2, 0, 0]} kind="carpet" a={disp("#c9d3e0")} b={disp("#bcc7d6")} unit={0.9} />
  <WindowWall z={OWALL} W={34} H={9} win={{ x: 0, y: 1.2, w: 12, h: 3.6 }} a="#eef0f4" kind="plain" />
  <SunPatch p={[0.4, 0, -1.4]} s={[7, 3]} o={0.2} />
  <Glb name="office_desk" p={[0, 0, -0.4]} line={2} blob={1.4} fallback={<Box p={[0, 0.56, -0.4]} s={[2.4, 1.12, 1.1]} color={disp("#f6efe2")} line={2} />} />
  {[-4.6, 4.6].map((x, i) => <group key={x}>
    <Glb name="office_desk" p={[x, 0, -2.6]} line={2} blob={1.2} />
    <Person p={[x - 0.3, -0.5, -3.5]} h={2.4} look={i ? GREY2 : GREY} pose={{ mood: "deadpan", arms: "hold", armK: 0.6 }} f={f} shadow={false} />
    <NpcTag p={[x - 0.3, 2.45, -3.5]} f={f + i * 20} s={0.46} />
  </group>)}
</>);
/** bright KITCHEN: tiled floor, window wall to the sunny city, the counter along the back (top y 1.3) */
const KWALL = -3.3, KCNT: V3 = [0, 0, -2.75];
const KitchenWorld: React.FC<{ t: number; target?: V3 }> = ({ t, target = [0, 1, 0] }) => (<>
  <DaySky fogNear={30} fogFar={160} warm={0.25} />
  <SunRig target={target} dir={[5, 9, 6]} />
  <DayGround base={DAY.grass} speck="#6fae52" y={-0.4} z={-60} />
  <CityBackdrop z={-50} spread={120} />
  <Clouds t={t} at={[[-20, 22, -90], [26, 28, -110]]} s={5} />
  <Surface lit p={[0, 0.01, 0]} s={[24, 18]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#eef2f6")} b={disp("#e2e8ef")} unit={1.2} />
  <WindowWall z={KWALL} W={30} H={9} win={{ x: 0.4, y: 1.9, w: 5.2, h: 2.8 }} a="#f6efe2" kind="plain" />
  <SunPatch p={[0.6, 0, 0.2]} s={[6, 3]} o={0.22} />
  <Glb name="kitchen_counter" p={KCNT} line={2} fallback={<Box p={[0, 0.65, KCNT[2]]} s={[4, 1.3, 0.9]} color={disp("#9fd8c8")} line={2} />} />
  <Glb name="kitchen_counter" p={[-5.6, 0, KCNT[2]]} line={2} />
</>);
/** evening LIVING ROOM: warm sky through the window, rug, the bright couch, flat TV on the right, floor lamp glow */
const LWALL = -3.4;
const LivingWorld: React.FC<{ t: number; f: number; target?: V3 }> = ({ t, f, target = [0, 1, -1] }) => (<>
  <DaySky fogNear={30} fogFar={160} warm={1} top="#6f8fd8" />
  <SunRig target={target} dir={[-8, 5, 4]} k={0.85} />
  <DayGround base={DAY.grass} speck="#6fae52" y={-0.4} z={-60} />
  <CityBackdrop z={-50} spread={120} />
  <Clouds t={t} at={[[-20, 18, -90], [26, 22, -110]]} s={5} />
  <Surface lit p={[0, 0.01, 0]} s={[22, 16]} rot={[-Math.PI / 2, 0, 0]} kind="plank" a={disp("#d9b07a")} b={disp("#c99c66")} unit={1.6} />
  <WindowWall z={LWALL} W={28} H={8} win={{ x: -2.6, y: 1.6, w: 4.2, h: 2.8 }} a="#f4e8d4" kind="plain" />
  <Surface lit p={[0.4, 0.02, 0.4]} s={[6.4, 3.6]} rot={[-Math.PI / 2, 0, 0]} kind="carpet" a={disp("#ffcf9e")} b={disp("#f5b98a")} unit={0.8} />
  <BrightCouch p={[-0.6, 0, -1.6]} />
  <group position={[1.75, 0, 0.5]} rotation={[0, -0.5, 0]} scale={0.75}>
    <Glb name="flat_tv" blob={1.5} fallback={<><Box p={[0, 0.35, 0]} s={[3.2, 0.7, 0.8]} color="#3a2717" /><Box p={[0, 1.95, -0.1]} s={[2.55, 1.5, 0.1]} color="#0b0d1a" /></>} />
    <TvPicture p={[0, 1.95, 0.01]} w={2.36} h={1.32} f={f} />
    <FloorPool p={[0, 0.03, 1.8]} r={1.8} color={CYAN} o={0.22} />
  </group>
  <Cyl p={[-3.9, 1.3, -2.4]} rt={0.05} h={2.6} color={disp("#2b3350")} line={2} />
  <Cyl p={[-3.9, 2.7, -2.4]} rt={0.24} rb={0.42} h={0.5} color={disp("#ffe9a8")} line={2} />
  <Halo p={[-3.9, 2.5, -2.3]} r={1.4} color={N3.amber} o={0.5} />
</>);
/** the NPC LOOP: a round lawn with a cream ring path (radius LR) through mini versions of his five places; a gold
 *  BRANCH path leaves the ring at the front-right toward the sunny distance (drawn on by `branch` 0..1) */
const LR = 3.2;
const ringPt = (a: number, r = LR): V3 => [r * Math.sin(a), 0, r * Math.cos(a)];
const STATIONS: { a: number; el: (p: V3, a: number) => React.ReactNode }[] = [
  { a: Math.PI * 0.95, el: (p, a) => <Glb key="bed" name="bed_modern" p={p} rot={[0, a + Math.PI / 2, 0]} s={0.5} line={1.5} blob={0.8} /> },
  { a: Math.PI * 1.35, el: (p, a) => <Glb key="stop" name="bus_stop" p={p} rot={[0, a, 0]} s={0.5} line={1.5} blob={0.8} /> },
  { a: Math.PI * 1.75, el: (p, a) => <Glb key="desk" name="office_desk" p={p} rot={[0, a, 0]} s={0.55} line={1.5} blob={0.8} /> },
  { a: Math.PI * 0.15, el: (p, a) => <Glb key="cnt" name="kitchen_counter" p={p} rot={[0, a, 0]} s={0.5} line={1.5} blob={0.8} /> },
  { a: Math.PI * 0.55, el: (p, a) => <BrightCouch key="couch" p={p} s={0.36} rotY={a} /> },
];
const BRANCH = (q: number): V3 => { const a = 0.42, s0 = ringPt(a), e: V3 = [14, 0, 7.5], c: V3 = [8, 0, 4.2]; const m = 1 - q; return [m * m * s0[0] + 2 * m * q * c[0] + q * q * e[0], 0, m * m * s0[2] + 2 * m * q * c[2] + q * q * e[2]]; };
const LoopWorld: React.FC<{ t: number; f: number; target?: V3; branch?: number; warm?: number; arrow?: number }> = ({ t, f, target = [0, 0, 0], branch = 0, warm = 0, arrow = 1 }) => (<>
  <DaySky fogNear={45} fogFar={200} warm={warm} />
  <SunRig target={target} dir={[6, 12, 5]} />
  <DayGround base={DAY.grass} speck="#6fae52" y={-0.05} z={-40} />
  <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[LR + 2.6, 64]} /><meshLambertMaterial color={disp("#a6d88a")} /></mesh>
  <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><ringGeometry args={[LR - 0.55, LR + 0.55, 96]} /><meshLambertMaterial color={disp("#f1e3c6")} /></mesh>
  {/* cyan direction chevrons along the loop (the game's "route"), drifting round */}
  {arrow > 0 && Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 + f * 0.01;
    return <group key={i} position={[LR * Math.sin(a), 0.06, LR * Math.cos(a)]} rotation={[-Math.PI / 2, 0, a + Math.PI / 2]}>
      <mesh><circleGeometry args={[0.2, 3]} /><meshBasicMaterial color={disp(CYAN)} transparent opacity={0.85 * arrow} toneMapped={false} /></mesh>
    </group>;
  })}
  {STATIONS.map((s) => s.el(ringPt(s.a, LR + 1.55), s.a))}
  <Glb name="palm_tree_day" p={[0, 0, 0]} s={0.9} line={2} blob={1.2} />
  {branch > 0 && Array.from({ length: 22 }, (_, i) => {
    const q = (i + 0.5) / 22; if (q > branch) return null;
    const a = BRANCH(q), b = BRANCH(Math.min(1, q + 0.03)), yaw = Math.atan2(b[0] - a[0], b[2] - a[2]);
    return <Box key={i} p={[a[0], 0.06, a[2]]} s={[1.0, 0.08, 0.62]} rot={[0, yaw + Math.PI / 2, 0]} color={disp(i % 2 ? "#f5b942" : "#ffcf6e")} line={1.5} />;
  })}
  <Palms at={[[-12, 0, -6], [11, 0, -9], [-15, 0, 6], [16, 0, -2], [-6, 0, -16], [7, 0, -18]]} s={1.3} />
  <CityBackdrop z={-80} spread={170} />
  <Clouds t={t} at={[[-30, 28, -100], [24, 34, -120], [50, 24, -90], [-60, 22, -70]]} s={5} />
</>);

// ---------------------------------------------------------------- shot builder
type View = { world: React.ReactNode; hud?: React.ReactNode };
const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number, sub: number, us: number, ls: number): View => {
  const t = f / FPS;
  switch (id) {
    case "hook": {
      // sub 0 = CRANE + LAND: drops from above the palms and lands level on Remy, a background NPC on the sunny
      //         sidewalk while grey passers-by walk the loop behind him; the small cyan NPC marker bobs over his head
      // sub 1 = PUSH-IN: slow push into Remy idling; two game icons (mission marker, heist bag) get struck out in red
      const NM = C("No missions.", 0), NH = C("No heists.", 30), JN = C("Just a normal", 55);
      const R: V3 = [0, 0, 0.8];
      const world = <>
        <StreetWorld t={t} f={f} hero={R} />
        <Hero p={R} look={REMY} pose={{ mood: sub && u > JN ? "smile" : "deadpan", arms: sub && u > JN ? "shrug" : "down", armK: 0.7 }} f={f} rimO={0.4} />
        <NpcTag p={[R[0], 3.0, R[2]]} f={f} />
        {sub ? <Move us={us} ls={ls} at={line({ pos: [0.7, 2.6, 11.5], look: [0, 1.75, 0.8], fov: 44 }, { pos: [0.35, 2.3, 7.4], look: [0, 1.85, 0.8], fov: 44 })} />
          : <Move us={us} ls={ls} at={line({ pos: [0.4, 10.5, 16], look: [0, 1.0, 0.8], fov: 46 }, { pos: [0.6, 2.7, 10.6], look: [0, 1.7, 0.8], fov: 46 })} />}
      </>;
      const wp = k(u, 0, 34, 0.42, 1, EASE.arrive);
      const hud = <>
        {!sub && <StrokeWord text="WHAT IF" x={540} y={470} h={125} p={wp} />}
        {!sub && <HudText f={u} x={540} y={335} size={56} color={AMBER} at={22}>#8</HudText>}
        {sub ? <>
          <IconTile f={u} x={380} y={400} at={NM - 4} kind="marker" strike={k(u, NM + 6, NM + 16, 0, 1)} out={len - 8} />
          <IconTile f={u} x={700} y={400} at={NH - 4} kind="bag" strike={k(u, NH + 6, NH + 16, 0, 1)} out={len - 8} />
        </> : null}
      </>;
      return { world, hud };
    }
    case "wake": { // PULL BACK (reveal): from the ringing alarm clock on the nightstand back to the dawn bedroom: Remy stretches beside his bed; the day ring's sleep slice fills to ~9 H
      const WU = 4, NH = C("nine hours", 60);
      const R: V3 = [1.3, 0, -0.5];
      const ring = u > WU && u < WU + 24 ? Math.sin(u * 1.6) * 0.06 : 0;
      const world = <>
        <BedroomWorld t={t} target={[1, 1, -1]} dawn={1} />
        <Glb name="desk_clock" p={[3.6, 0.9 * 1.08, -2.5]} rot={[0, -0.35 + ring, ring]} s={1.5} line={2} />
        <Hero p={R} look={REMY} pose={{ mood: u < WU + 14 ? "tired" : "smile", lids: u < WU + 30 ? 0.5 : 0.15, arms: u < WU + 34 ? "up" : "down", armK: 0.9, squash: u < WU + 34 ? -0.04 : 0 }} f={f} rimO={0.4} />
        <NpcTag p={[R[0], 3.0, R[2]]} f={f} />
        <Move us={us} ls={ls} at={line({ pos: [3.0, 1.9, 1.6], look: [3.3, 1.3, -2.4], fov: 44 }, { pos: [1.2, 3.0, 9.4], look: [0.6, 1.95, -1.0], fov: 46 })} />
      </>;
      const hud = <DayHud f={u} at={NH - 20} n={0} fillAt={NH} value="~9 H" />;
      return { world, hud };
    }
    case "commute": { // TRACKING / TRUCK: the camera trucks left along the sidewalk with the city bus pulling in behind Remy at the stop; the commute slice (~27 MIN) is a thin sliver of the day
      const TS = C("twenty seven", 70);
      const e = shotE(us, ls);
      const R: V3 = [0.4, 0, -1.2];
      const busX = k(u, 0, Math.max(30, TS + 10), 26, -0.4, Easing.out(Easing.cubic));
      const world = <>
        <StreetWorld t={t} f={f} hero={R} stop extras={false} />
        <Glb name="city_bus" p={[busX, 0, STREET_Z + 0.6]} line={2} blob={2.5} fallback={<Box p={[busX, 1.5, STREET_Z + 0.6]} s={[7.6, 3, 2.3]} color={disp("#f6efe2")} line={2} />} />
        <Hero p={R} look={REMY} pose={{ mood: "deadpan", arms: "hold", armK: 0.5, lookX: 0.6 }} f={f} rimO={0.4} />
        <NpcTag p={[R[0], 3.0, R[2]]} f={f} />
        <Person p={[-2.2, 0, -1.6]} h={2.3} look={GREY} pose={{ mood: "deadpan", arms: "hold", armK: 0.5 }} f={f} />
        <NpcTag p={[-2.2, 2.9, -1.6]} f={f + 30} s={0.46} />
        <Move us={us} ls={ls} at={() => ({ pos: [3.4 - 2.8 * e, 2.6, 8.4], look: [1.4 - 1.2 * e, 1.7, -1.4], fov: 46 })} />
      </>;
      const hud = <DayHud f={u} at={4} n={1} fillAt={TS} value="~27 MIN" />;
      return { world, hud };
    }
    case "work": { // ORBIT: a slow arc round Remy's desk in the bright office (grey NPC coworkers with their own markers); the work slice fills to ~7.5 H
      const SH = C("seven and a", 45);
      const R: V3 = [-0.3, 0, -1.1];
      const world = <>
        <OfficeWorld t={t} f={f} target={[0, 1, -0.6]} />
        <Hero p={R} look={REMY} pose={{ mood: u > SH + 20 ? "tired" : "deadpan", lids: u > SH + 20 ? 0.35 : 0, arms: "hold", armK: 0.7, lookX: 0.5 }} f={f} rimO={0.35} shadow={false} />
        <NpcTag p={[R[0], 3.0, R[2]]} f={f} />
        <Move us={us} ls={ls} at={orbit([0, 1.45, -0.7], 7.6, 1.3, 0.5, -0.12, 44)} />
      </>;
      const hud = <DayHud f={u} at={4} n={2} fillAt={SH} value="~7.5 H" />;
      return { world, hud };
    }
    case "chores": { // LOW HERO ANGLE: from the kitchen floor, looking up at Remy sweeping with a broom while a pot steams on the counter; the chores slice fills to ~2 H
      const TH = C("two hours", 40);
      const R: V3 = [0, 0, -0.6];
      const sw = Math.sin(f * 0.22) * 0.16;
      const world = <>
        <KitchenWorld t={t} target={[0, 1, -0.6]} />
        <Cyl p={[-1.0, 1.42, KCNT[2]]} rt={0.24} h={0.26} color={disp("#c4c9d2")} line={2} />
        {[0, 1, 2].map((i) => { const q = ((f * 0.02 + i / 3) % 1); return <Halo key={i} p={[-1.0 + Math.sin(f * 0.05 + i) * 0.1, 1.75 + q * 1.0, KCNT[2] + 0.1]} r={0.25 + q * 0.3} color="#ffffff" o={0.5 * (1 - q)} />; })}
        <Hero p={R} look={REMY} pose={{ mood: "deadpan", arms: "hold", armK: 0.8, lookX: -0.3 }} f={f} rimO={0.4} />
        <FaceGroup p={R}><group position={[0.55, 0.05, 0.25]} rotation={[0, 0, 0.28 + sw]}>
          <Glb name="broom" line={2} fallback={<Cyl p={[0, 1, 0]} rt={0.04} h={2} color={disp("#d9b07a")} line={2} />} />
        </group></FaceGroup>
        <NpcTag p={[R[0], 3.0, R[2]]} f={f} />
        <Move us={us} ls={ls} at={line({ pos: [-0.9, 0.45, 7.9], look: [0, 1.45, -0.6], fov: 46 }, { pos: [0.6, 0.6, 7.0], look: [0, 1.4, -0.6], fov: 46 })} />
      </>;
      const hud = <DayHud f={u} at={4} n={3} fillAt={TH} value="~2 H" />;
      return { world, hud };
    }
    case "leisure": {
      // sub 0 = CRANE DOWN (lowering): from up near the ceiling the camera sinks to couch height in the warm evening
      //         living room, Remy flops on the couch; the leisure slice fills the rest of the ring (~5 H)
      // sub 1 = DOLLY ZOOM (vertigo): on Remy staring at the glowing TV, the room swells round him; a coral TV arc
      //         grows inside the leisure slice (~2.6 H)
      const FH = C("five hours", 45), TV = C("around two", 60);
      const R: V3 = [-0.7, 0.45, -1.55];
      const world = <>
        <LivingWorld t={t} f={f} target={[0, 1, -1]} />
        <Hero p={R} look={REMY} pose={{ mood: sub ? (u > TV ? "grin" : "smile") : "smile", arms: sub ? "down" : u > 20 ? "head" : "down", armK: 0.8, lookX: 1, lids: sub ? 0.25 : 0 }} f={f} rimO={0.4} shadow={false} />
        <NpcTag p={[R[0], 3.6, R[2]]} f={f} />
        {sub ? <Move us={us} ls={ls} at={dollyZoom([0.25, 2.05, -0.7], [0.1, 0.1, 1], 9.5, 15, 46)} />
          : <Move us={us} ls={ls} at={line({ pos: [0.4, 7.5, 11.0], look: [0.3, 1.0, -1.0], fov: 46 }, { pos: [0.3, 2.6, 10.2], look: [0.3, 1.8, -1.0], fov: 46 })} />}
      </>;
      const hud = sub ? <DayHud f={u} at={-99} n={5} fillAt={-99} tvAt={TV} value="~2.6 H" />
        : <DayHud f={u} at={4} n={4} fillAt={FH} value="~5 H" />;
      return { world, hud };
    }
    case "loop": { // TOP-DOWN (high, lowering): straight down onto the round lawn; Remy walks the ring path through his five places, the cyan route chevrons drift round; icons light one by one, then the repeat tile
      const cues = [C("Sleep,", 30), C("commute,", 45), C("work,", 60), C("chores,", 75), C("screen.", 90)];
      const RP = C("Repeat.", 110);
      const a = -0.45 + u * 0.008, R = ringPt(a);
      const world = <>
        <LoopWorld t={t} f={f} />
        <Hero p={R} h={2.2} look={REMY} pose={{ mood: "deadpan", walk: u * 0.24, speed: 0.6 }} f={f} rimO={0.3} shadow={false} />
        <NpcTag p={[R[0], 2.75, R[2]]} f={f} s={0.6} />
        <Move us={us} ls={ls} at={line({ pos: [0, 21, 17], look: [0, 0, -1.3], fov: 48 }, { pos: [0, 17.5, 15], look: [0, 0, -1.1], fov: 48 })} />
      </>;
      const hud = <>
        <Plate x={60} y={350} w={960} h={170} o={drawOn(u, cues[0] - 6, 10)} r={40} />
        {SICON.map((ic, i) => <IconTile key={ic} f={u} x={150 + i * 195} y={435} at={cues[i] - 2} kind={i === 4 ? "tv" : ic} color={i === 4 ? CORAL : SCOL[i]} r={64} />)}
        <IconTile f={u} x={540} y={620} at={RP} kind="repeat" color={CYAN} r={70} />
      </>;
      return { world, hud };
    }
    case "car": { // LOW HERO ANGLE: from the kerb, looking up at Remy on the sidewalk; the cyan "main character" coupe blasts past on the road behind him (speed streaks) and Remy waves
      const DP = C("drives past", 30);
      const cx = k(u, DP - 14, DP + 30, -14, 17, Easing.linear); // ~0.7 units/frame: visible ~0.4 s across the frame
      const R: V3 = [0, 0, 0.8];
      const waving = u > DP - 4;
      const world = <>
        <StreetWorld t={t} f={f} hero={R} extras={false} />
        <group position={[cx, 0, STREET_Z + 1.3]}>
          <Glb name="cyan_coupe" s={1.5} line={2} blob={1.5} fallback={<Box p={[0, 0.5, 0]} s={[4.5, 1, 1.9]} color={disp(CYAN)} line={2} />} />
          {Math.abs(cx) < 30 && [0.35, 0.8, 1.2].map((y, i) => <mesh key={i} position={[-4.2 - i * 0.6, y, 0.4 - i * 0.3]}><boxGeometry args={[4 + i * 1.4, 0.06, 0.06]} /><meshBasicMaterial color={disp(i === 1 ? CYAN : "#ffffff")} transparent opacity={0.7} toneMapped={false} /></mesh>)}
          <NpcTag p={[0, 2.3, 0]} f={f} flip={1} s={0.7} />
        </group>
        <Hero p={R} look={REMY} pose={{ mood: waving ? "smile" : "deadpan", arms: "down", ...(waving ? { armR: [0.34 + 0.09 * Math.sin(u * 0.45), 0.98] as [number, number], armRK: 1 } : {}), lookX: Math.max(-0.8, Math.min(0.8, cx * 0.15)), tilt: waving ? Math.sin(u * 0.45) * 0.03 : 0 }} f={f} rimO={0.4} />
        <NpcTag p={[R[0], 3.0, R[2]]} f={f} />
        <Move us={us} ls={ls} at={line({ pos: [-0.6, 0.8, 8.8], look: [0, 1.75, 0.0], fov: 48 }, { pos: [0.4, 0.85, 8.0], look: [0, 1.7, 0.0], fov: 48 })} />
      </>;
      return { world, hud: null }; // no HUD: the coupe and the wave carry the beat
    }
    case "twist": {
      // sub 0 = ORBIT: a half-orbit round Remy; a spotlight swings onto him from above and his cyan NPC marker turns
      //         round on the spot and becomes a gold star (the "you" icon)
      // sub 1 = PULL BACK (reveal): back from Remy to the people around him (a friend, his mum, a kid) beaming at
      //         him, little hearts float up; the gold star stays over Remy
      const TW = C("the twist.", 15);
      const R: V3 = [0, 0, 0.8];
      const sw = k(u, TW - 4, TW + 20, -0.75, 0, Easing.out(Easing.cubic));
      const flip = sub ? 1 : k(u, TW + 12, TW + 30, 0, 1, Easing.inOut(Easing.cubic));
      const world = <>
        <StreetWorld t={t} f={f} hero={R} extras={false} warm={0.2} />
        <group position={[0, 9.5, 0.8]} rotation={[0, 0, sw]}>
          <SpotCone p={[0, 0, 0]} h={10} r={1.7} color="#fff2c0" o={0.2} />
        </group>
        <FloorPool p={[Math.sin(-sw) * 9.5 * 0.95 + R[0], 0.04, R[2]]} r={1.7} color={N3.amber} o={0.45 * (1 - Math.abs(sw))} />
        <Hero p={R} look={REMY} pose={{ mood: flip > 0.5 ? (sub ? "laugh" : "grin") : "shock", arms: flip > 0.5 ? "up" : "chest", armK: 0.8 }} f={f} rimO={0.55} />
        <NpcTag p={[R[0], sub ? 2.95 : 3.05, R[2]]} f={f} flip={flip} s={sub ? 0.85 : 0.7} />
        {sub ? <>
          <Hero p={[-2.4, 0, 0.2]} look={PAL} pose={{ mood: "grin", arms: "point", armK: 0.7, lookX: 0.8, flip: true }} f={f} rimO={0.3} />
          <Hero p={[2.4, 0, 0.1]} look={MOM} pose={{ mood: "laugh", arms: "chest", lookX: -0.8 }} f={f} rimO={0.3} />
          <Hero p={[1.3, 0, 1.9]} h={1.6} look={KID} pose={{ mood: "grin", arms: "up", armK: 0.7, lookX: -0.6 }} f={f} rimO={0.3} />
          {[[-2.4, 2.6, 0.2], [2.4, 2.6, 0.1], [1.3, 1.8, 1.9]].map((p, i) => <FloatHeart key={i} p={p as V3} u={u} at={8 + i * 14} />)}
          {[[-2.4, 2.6, 0.2], [2.4, 2.6, 0.1], [1.3, 1.8, 1.9]].map((p, i) => <FloatHeart key={"b" + i} p={p as V3} u={u} at={40 + i * 12} />)}
        </> : null}
        {sub ? <Move us={us} ls={ls} at={line({ pos: [0.3, 2.4, 6.0], look: [0, 1.9, 0.8], fov: 44 }, { pos: [0.6, 3.4, 12.2], look: [0, 1.6, 0.6], fov: 46 })} />
          : <Move us={us} ls={ls} at={orbit([0, 1.8, 0.8], 7.2, 0.8, -0.55, 0.35, 44)} />}
      </>;
      return { world, hud: null };
    }
    case "outro": {
      // sub 0 = CRANE UP (rise): from Remy on the loop path the camera rises over the round lawn: his five places on the
      //         ring, the cyan route chevrons; a cyan "script" page icon in the HUD (lines, no words)
      // sub 1 = TRACKING: the camera trucks with Remy as he steps OFF the ring onto a new gold branch path that draws
      //         on ahead of him toward the sunny distance; the page gets a gold pen stroke
      const CY = C("change yours", 40);
      const a0 = Math.PI * 0.2;
      let R: V3;
      if (sub) {
        const q = k(us, 6, ls, 0, 0.55, Easing.inOut(Easing.quad));
        R = q <= 0 ? ringPt(0.42) : BRANCH(q);
      } else R = ringPt(a0 + u * 0.006);
      const branch = sub ? k(us, 0, ls * 0.7, 0.15, 1, Easing.out(Easing.cubic)) : 0;
      const e = shotE(us, ls);
      const world = <>
        <LoopWorld t={t} f={f} target={R} branch={branch} warm={sub ? 0.5 : 0.2} arrow={sub ? 0.5 : 1} />
        <Hero p={R} h={2.2} look={REMY} pose={{ mood: sub ? (us > 20 ? "grin" : "smile") : "deadpan", walk: u * 0.24, speed: 0.6, arms: sub && us > 30 ? "up" : "down", armK: 0.6 }} f={f} rimO={0.4} />
        <NpcTag p={[R[0], 2.85, R[2]]} f={f} flip={1} s={0.6} />
        {sub ? <Move us={us} ls={ls} at={() => ({ pos: [R[0] - 1.6 - 0.4 * e, 6.0, R[2] + 9.6], look: [R[0] + 0.2, 1.2, R[2] - 1.2], fov: 46 })} />
          : <Move us={us} ls={ls} at={line({ pos: [R[0] * 0.2 + 0.4, 2.2, 13.0], look: [0, 1.4, 2.0], fov: 46 }, { pos: [0.6, 15.5, 15.5], look: [0, 0, 0.6], fov: 46 })} />}
      </>;
      const hud = sub ? <>
        <IconTile f={u} x={540} y={440} at={-99} kind="page" color={CYAN} r={74} />
        <g opacity={drawOn(u, CY - 4, 10)} transform="translate(610 370)"><NeonPath d={ICON.pen} w={6} color={GOLD} hot /></g>
        <NeonPath d="M 500 456 L 580 456" w={7} color={GOLD} p={k(u, CY, CY + 16, 0, 1)} hot />
      </> : <IconTile f={u} x={540} y={440} at={10} kind="page" color={CYAN} r={74} />;
      return { world, hud };
    }
    default: { // ask - CRANE + LAND: drops from above the loop and lands level on Remy at the start of his new gold path (gold star overhead); the question card (A-D)
      const R: V3 = BRANCH(0.3);
      const world = <>
        <LoopWorld t={t} f={f} target={R} branch={1} warm={0.5} arrow={0.5} />
        <Hero p={R} look={REMY} pose={{ mood: "grin", arms: u > 26 ? "point" : "up", armK: u > 26 ? 1 : 0.8 }} f={f} rimO={0.45} />
        <NpcTag p={[R[0], 3.2, R[2]]} f={f} flip={1} s={0.65} />
        <Move us={us} ls={ls} at={line({ pos: [R[0] + 0.8, 10.5, R[2] + 15.5], look: [R[0], 1.2, R[2]], fov: 46 }, { pos: [R[0] + 0.4, 3.0, R[2] + 13.2], look: [R[0], 2.0, R[2]], fov: 46 })} />
      </>;
      const hud = <>
        <HudText f={u} x={540} y={420} size={60} color={CREAM} at={4} out={len + 30}>COMMENT</HudText>
        <HudText f={u} x={540} y={505} size={76} color={GOLD} at={8} out={len + 30}>A, B, C OR D</HudText>
        <ChoiceCards f={u} y={720} at={12} cw={470} ch={130} cards={[{ letter: "A", text: "SLEEP" }, { letter: "B", text: "WORK" }, { letter: "C", text: "SCREEN TIME" }, { letter: "D", text: "COMMUTE" }]} />
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
  id: "wi-gta-npc",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: N3.bg,
};
export default story;
