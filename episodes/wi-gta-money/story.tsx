// WHAT IF #5 "What If You Had GTA 6 Money in Real Life?" - bright DAYLIGHT Stick3D look (as approved for What If 1-4:
// big 3D worlds with sky, clouds, sun, haze; Remy = REMY3D puppet + beanie; Golden Neon only for HUD; cyan only for the
// GAME version). Central motif: a cyan game "$" COUNTER that jumps instantly against real PHYSICAL cash (stylised green
// bricks/bills: NO real banknote images, portraits or serial numbers) that has weight, height and counting time.
// Facts (RESEARCH.md): a US bill ~1 g; $1M in $100s = 10,000 bills ~10 kg; stack ~1.1 m; 1 bill/s -> 10,000 s = 2.8 h
// (2:46:40); banks report cash over $10,000 (CTR); structuring to dodge it is illegal. No bank names, no game art.
// Every beat is cue-driven (C(phrase, fallback)) so the picture follows words.json. Real shots with hard cuts; every
// PLACE change = shape morph; one NAMED camera move per shot (comment on each case), never reversing.
// Layout: HUD y 300-1350; figures stay above y 1430 (captions own 1440-1640).
// NO DOUBLE TEXT: on-screen words never repeat what the caption says at that moment (numbers, units, icons instead).
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
import { DaySky, SunRig, DayGround, CityBackdrop, Palms, Clouds, WindowWall, SunPatch, disp, DAY } from "../../library/stick3d/daylight";
import { drawPuppet, Look, Pose } from "../../library/stick3d/puppet";
import { N3, Halo, Panel } from "../../library/stick3d/neon";

// ---------------------------------------------------------------- cast
const REMY: Look = { ...REMY3D, beanie: "#2e3658", beanieBand: N3.gold, pom: N3.amber };
const { gold: GOLD, coral: CORAL, amber: AMBER, text: CREAM, cyan: CYAN, dim: DIM } = NEON;
const RED = "#ff4d5e";

// ---------------------------------------------------------------- shots
type ShotDef = { id: string; cue: string; parent: string; sub: number };
const DEFS: ShotDef[] = [
  { id: "hook", cue: "What if you", parent: "hook", sub: 0 },
  { id: "hookb", cue: "One heist,", parent: "hook", sub: 1 },
  { id: "hookc", cue: "Let's see what", parent: "hook", sub: 2 },
  { id: "test1", cue: "Test one.", parent: "test1", sub: 0 },
  { id: "bill", cue: "In real life, a US", parent: "bill", sub: 0 },
  { id: "tenk", cue: "A million dollars in", parent: "tenk", sub: 0 },
  { id: "weight", cue: "That's about ten", parent: "weight", sub: 0 },
  { id: "tower", cue: "Stacked up,", parent: "tower", sub: 0 },
  { id: "test2", cue: "Test two.", parent: "test2", sub: 0 },
  { id: "count", cue: "In real life, if", parent: "count", sub: 0 },
  { id: "countb", cue: "ten thousand bills take", parent: "count", sub: 1 },
  { id: "test3", cue: "Test three.", parent: "test3", sub: 0 },
  { id: "bank", cue: "In real life, US banks", parent: "bank", sub: 0 },
  { id: "split", cue: "And splitting it", parent: "split", sub: 0 },
  { id: "recap", cue: "So a million", parent: "recap", sub: 0 },
  { id: "recapb", cue: "It's a heavy", parent: "recap", sub: 1 },
  { id: "outro", cue: "In the game, money", parent: "outro", sub: 0 },
  { id: "ask", cue: "What would you", parent: "ask", sub: 0 },
];
const DEF: Record<string, ShotDef> = Object.fromEntries(DEFS.map((d) => [d.id, d]));
const SHOTS = DEFS.map((d) => ({ id: d.id, cue: d.cue }));
const TR_FRAMES = 14;
/** place of each scene (parent): a PLACE change = shape-morph transition, everything else = hard cut */
const PLACE: Record<string, string> = {
  hook: "plaza", test1: "plaza", bill: "kitchen", tenk: "kitchen", weight: "kitchen", tower: "kitchen",
  test2: "park", count: "park", test3: "bank", bank: "bank", split: "bank", recap: "plaza", outro: "plaza", ask: "plaza",
};
/** background colour of each scene = the flood colour of the morph INTO it */
const BG: Record<string, string> = {
  hook: "#cfe9fb", test1: "#cfe9fb", bill: "#eef3f8", tenk: "#eef3f8", weight: "#eef3f8", tower: "#eef3f8",
  test2: "#cfe9fb", count: "#cfe9fb", test3: "#f4eee4", bank: "#f4eee4", split: "#f4eee4", recap: "#cfe9fb", outro: "#cfe9fb", ask: "#cfe9fb",
};
/** key object of the OUTGOING shot that becomes the transition shape (screen rect, radius) */
const KEY_DEF = { cx: 540, cy: 900, w: 380, h: 380, r: 190 };
const KEY_OBJ: Record<string, typeof KEY_DEF> = {
  test1: { cx: 540, cy: 590, w: 760, h: 130, r: 65 },                  // the cyan game counter
  tower: { cx: 640, cy: 960, w: 200, h: 640, r: 24 },                  // the cash tower
  countb: { cx: 540, cy: 415, w: 560, h: 170, r: 60 },                 // the timer plate
  split: { cx: 540, cy: 760, w: 440, h: 440, r: 60 },                  // the red stamp
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
const money = (v: number) => "$" + Math.round(v).toLocaleString("en-US");
const hms = (s: number) => { const t = Math.floor(s); return `${Math.floor(t / 3600)}:${String(Math.floor((t % 3600) / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; };

// ---------------------------------------------------------------- HUD pieces (counter, icons, numbers - never caption words)
/** THE MOTIF: the cyan GAME money counter. The number JUMPS (no roll-up): game money is just a number. A white flash
 *  ring sweeps it on every jump (`flash` = frame of the jump). */
const GameCounter: React.FC<{ f: number; y: number; value: number; at: number; out?: number; flash?: number; x?: number; sc?: number }> =
  ({ f, y, value, at, out = Infinity, flash = -999, x = 540, sc = 1 }) => {
    const p = drawOn(f, at, 12) * leaveO(f, out); if (p <= 0) return null;
    const w = 760, h = 130, fl = Math.max(0, 1 - Math.abs(f - flash - 4) / 8), pop = f >= flash && f < flash + 10 ? 1 + 0.05 * Math.sin(((f - flash) / 10) * Math.PI) : 1;
    return <g opacity={p} transform={`translate(${x} ${y + (1 - p) * 14}) scale(${sc})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="#06222b" opacity={0.78} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="none" stroke={CYAN} strokeWidth={4} opacity={0.85} />
      <circle cx={-w / 2 + 66} cy={0} r={44} fill="#0b3a46" stroke={CYAN} strokeWidth={4} />
      <text x={-w / 2 + 66} y={22} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={64} fill={CYAN}>$</text>
      <g transform={`translate(${40} 0) scale(${pop})`}>
        <text x={0} y={30} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={86} fill={CYAN} stroke="#06222b" strokeWidth={8} paintOrder="stroke" letterSpacing={2}>{money(value)}</text>
      </g>
      {fl > 0 && <rect x={-w / 2 - 8} y={-h / 2 - 8} width={w + 16} height={h + 16} rx={h / 2 + 8} fill="none" stroke="#ffffff" strokeWidth={7} opacity={fl} />}
    </g>;
  };
/** line icons (centred, ~90 px) */
const ICON: Record<string, string> = {
  bag: "M -44 -4 Q -44 -22 -26 -22 L 26 -22 Q 44 -22 44 -4 L 44 22 Q 44 30 36 30 L -36 30 Q -44 30 -44 22 Z M -16 -22 Q -16 -42 0 -42 Q 16 -42 16 -22 M -44 4 L 44 4",
  clock: "M 0 -38 A 38 38 0 1 1 -0.1 -38 Z M 0 -22 L 0 0 L 16 10",
  bank: "M -46 -12 L 0 -40 L 46 -12 Z M -34 -4 L -34 24 M -12 -4 L -12 24 M 12 -4 L 12 24 M 34 -4 L 34 24 M -48 32 L 48 32",
  thumb: "M -34 -2 L -34 34 L -16 34 L -16 -2 Z M -16 0 L -2 -26 Q 4 -40 14 -32 Q 20 -26 14 -10 L 32 -10 Q 44 -10 40 2 L 34 28 Q 31 34 22 34 L -16 34",
  paper: "M -28 -40 L 14 -40 L 30 -24 L 30 40 L -28 40 Z M 14 -40 L 14 -24 L 30 -24 M -16 -14 L 18 -14 M -16 0 L 18 0 M -16 14 L 8 14",
  weight: "M -14 -26 Q 0 -44 14 -26 M -30 -14 L 30 -14 L 40 34 L -40 34 Z",
  ruler: "M -14 -44 L 14 -44 L 14 44 L -14 44 Z M 14 -30 L 0 -30 M 14 -15 L 5 -15 M 14 0 L 0 0 M 14 15 L 5 15 M 14 30 L 0 30",
  gov: "M -44 34 L 44 34 M -38 26 L 38 26 M -30 22 L -30 2 M -10 22 L -10 2 M 10 22 L 10 2 M 30 22 L 30 2 M -38 0 L 38 0 M -26 -4 A 26 26 0 0 1 26 -4 Z M 0 -30 L 0 -44 L 14 -40 L 0 -36",
};
/** three test tiles (carry / count / bank); the current test lights gold, done ones get a tick */
const TestTracker: React.FC<{ f: number; at: number; active: number; out?: number; y?: number }> = ({ f, at, active, out = Infinity, y = 420 }) => {
  const o = leaveO(f, out); if (f < at - 2 || o <= 0) return null;
  return <g opacity={o}>{["bag", "clock", "bank"].map((ic, i) => {
    const x = 540 + (i - 1) * 156, p = drawOn(f, at + i * 3, 12), on = i === active, done = i < active;
    const col = on ? GOLD : done ? AMBER : DIM;
    return <g key={ic} transform={`translate(${x} ${y - (1 - p) * 14})`} opacity={p}>
      <rect x={-62} y={-62} width={124} height={124} rx={24} fill={on ? "#3a2a0c" : "#0b0d1a"} opacity={on ? 0.8 : 0.55} />
      <NeonPath d="M -38 -62 L 38 -62 Q 62 -62 62 -38 L 62 38 Q 62 62 38 62 L -38 62 Q -62 62 -62 38 L -62 -38 Q -62 -62 -38 -62 Z" w={on ? 4.5 : 2.5} color={col} glow={on ? 1 : 0.3} />
      <g transform="scale(0.85)"><NeonPath d={ICON[ic]} w={on ? 5 : 3.5} color={col} glow={on ? 0.8 : 0.2} hot={on} /></g>
      {done && <NeonPath d="M 30 -50 l 10 10 l 20 -24" w={5} color={GOLD} />}
    </g>;
  })}</g>;
};
/** round icon tile; `strike` draws a red line through it */
const IconTile: React.FC<{ f: number; x: number; y: number; at: number; kind: string; strike?: number; color?: string; r?: number; sweat?: boolean }> = ({ f, x, y, at, kind, strike = 0, color = GOLD, r = 78, sweat }) => {
  const p = drawOn(f, at, 12); if (p <= 0) return null;
  return <g transform={`translate(${x} ${y - (1 - p) * 16})`} opacity={p}>
    <circle r={r} fill={color === CYAN ? "#0b3a46" : "#3a2a0c"} opacity={0.8} />
    <circle r={r} fill="none" stroke={color} strokeWidth={4} opacity={0.9} />
    <g transform={`scale(${r / 78})`}><NeonPath d={ICON[kind]} w={5} color={color} hot /></g>
    {sweat && <path d={`M ${r * 0.62} ${-r * 0.62} q 9 14 0 20 q -9 -6 0 -20 Z`} fill={CYAN} opacity={0.9 * clamp((f - at - 10) / 8)} />}
    {strike > 0 && <NeonPath d={`M ${-r * 0.7} ${r * 0.7} L ${r * 0.7} ${-r * 0.7}`} w={9} color={RED} p={strike} hot />}
  </g>;
};
/** one gold "real" readout: icon on the left, big value on the right, on a dark plate */
const Readout: React.FC<{ f: number; y: number; at: number; icon: string; value: string; out?: number; color?: string; w?: number }> = ({ f, y, at, icon, value, out = Infinity, color = GOLD, w = 620 }) => {
  const o = drawOn(f, at, 12) * leaveO(f, out); if (o <= 0) return null;
  return <g opacity={o}>
    <Plate x={540 - w / 2} y={y - 90} w={w} h={170} o={1} r={34} />
    <g transform={`translate(${540 - w / 2 + 92} ${y - 6})`}><NeonPath d={ICON[icon]} w={5} color={color} hot /></g>
    <HudText f={f} x={540 - w / 2 + 180} y={y + 30} size={92} color={color} at={at + 4} out={out} anchor="start" spacing={2}>{value}</HudText>
  </g>;
};
/** HUD bill tile: a stylised green bill (no portrait, no serials) with "$100" on it */
const BillIcon: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-36} width={160} height={72} rx={8} fill="#7fc47a" stroke="#0b0d1a" strokeWidth={4} />
    <rect x={-70} y={-27} width={140} height={54} rx={5} fill="none" stroke="#d8f2cf" strokeWidth={3} />
    <ellipse cx={0} cy={0} rx={20} ry={17} fill="#4f9a55" />
    <text x={-62} y={-8} fontFamily={WI_FONT} fontWeight={900} fontSize={18} fill="#2f6a35">100</text>
    <text x={62} y={22} textAnchor="end" fontFamily={WI_FONT} fontWeight={900} fontSize={18} fill="#2f6a35">100</text>
  </g>
);

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
/** the heist DUFFEL BAG (Blender model) */
const Duffel: React.FC<{ p: V3; s?: number; rot?: V3; blob?: number }> = ({ p, s = 1, rot = [0, 0, 0], blob = 0 }) => (
  <Glb name="duffel_bag" p={p} s={s} rot={rot} line={2} blob={blob} fallback={<Box p={[p[0], p[1] + 0.32 * s, p[2]]} s={[1.1 * s, 0.6 * s, 0.6 * s]} color={disp("#2e3758")} line={2} />} />
);
/** Remy carrying the bag at his side (turns with the billboard); `sag` lowers it (heavy) */
const CarriedBag: React.FC<{ p: V3; sag?: number; s?: number }> = ({ p, sag = 0, s = 0.85 }) => (
  <FaceGroup p={p}><group position={[0.95, 0.22 - sag * 0.12, 0.2]} rotation={[0, 0.25, 0.08 + sag * 0.06]}><Duffel p={[0, 0, 0]} s={s} /></group></FaceGroup>
);
/** cash BRICK (1,000 stylised bills); BR = scene scale: 10 bricks stacked = 2.42 tall (~1.1 m against Remy h 2.5) */
const BR = 1.1, BR_H = 0.22 * BR;
const Brick: React.FC<{ p: V3; rot?: number; s?: number }> = ({ p, rot = 0, s = 1 }) => (
  <Glb name="cash_brick" p={p} rot={[0, rot, 0]} s={BR * s} line={1.5} fallback={<Box p={[p[0], p[1] + BR_H * s / 2, p[2]]} s={[0.36 * BR * s, BR_H * s, 0.155 * BR * s]} color={disp("#7fc47a")} line={1} />} />
);
/** cyan hologram "$" coin = the GAME money (weightless, spins, sparkles) */
const HoloCoin: React.FC<{ p: V3; o: number; f: number; s?: number }> = ({ p, o, f, s = 1 }) => o <= 0.01 ? null : (
  <group position={[p[0], p[1] + 0.1 * Math.sin(f * 0.1), p[2]]}>
    <Panel p={[0, 0, 0]} s={[1.6 * s, 1.6 * s]} px={[256, 256]} face additive o={o} dep={1} draw={(c, W, H) => {
      const g = c.createRadialGradient(W / 2, H / 2, W * 0.1, W / 2, H / 2, W * 0.5); g.addColorStop(0, "rgba(95,227,255,0.55)"); g.addColorStop(1, "rgba(95,227,255,0)");
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.strokeStyle = "#5fe3ff"; c.lineWidth = 14; c.beginPath(); c.arc(W / 2, H / 2, W * 0.36, 0, 7); c.stroke();
      c.fillStyle = "#bff4ff"; c.font = `900 ${Math.round(W * 0.5)}px CaptionSans, Arial, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("$", W / 2, H / 2 + W * 0.03);
    }} />
    <Halo p={[0, 0, -0.1]} r={1.2 * s} color={CYAN} o={0.4 * o} />
    {Array.from({ length: 6 }, (_, i) => { const yy = ((f * 0.03 + i / 6) % 1); return <Ball key={i} p={[Math.sin(i * 2.1) * 0.7 * s, -0.6 * s + yy * 1.4 * s, Math.cos(i * 2.1) * 0.3 * s]} r={0.05 * s * (1 - yy)} color={CYAN} ink={0} />; })}
  </group>
);
/** expanding ring (a jump / a thud): a flat torus that grows + fades */
const Ring: React.FC<{ p: V3; u: number; at: number; color?: string; s?: number; rot?: V3 }> = ({ p, u, at, color = "#fff3d0", s = 1, rot = [-Math.PI / 2, 0, 0] }) => {
  const q = (u - at) / 16; if (q < 0 || q > 1) return null;
  const r = s * (0.4 + 2.2 * Easing.out(Easing.cubic)(q));
  return <group position={p} rotation={rot}>
    <mesh><torusGeometry args={[r, 0.05 * s, 8, 48]} /><meshBasicMaterial color={color} transparent opacity={1 - q} toneMapped={false} depthWrite={false} /></mesh>
  </group>;
};
/** the scale's digital display: a Panel just in front of the model's display window */
const ScaleDisplay: React.FC<{ p: V3; w: number; h: number; text: string }> = ({ p, w, h, text }) => (
  <Panel p={p} s={[w, h]} px={[320, 80]} dep={text} draw={(c, W, H) => {
    c.fillStyle = "#16261f"; c.fillRect(0, 0, W, H);
    c.fillStyle = "#c8ffd2"; c.font = `900 ${Math.round(H * 0.72)}px CaptionSans, Arial, sans-serif`; c.textAlign = "right"; c.textBaseline = "middle"; c.fillText(text, W - 16, H / 2 + 3);
  }} />
);
/** the alarm clock (model) + its face drawn with ticks and hands (minutes `m` since start) */
const DeskClock: React.FC<{ p: V3; s: number; sec: number }> = ({ p, s, sec }) => (
  <group position={p}>
    <Glb name="desk_clock" s={s} line={2} fallback={<Cyl p={[0, 0.36 * s, 0]} rt={0.28 * s} h={0.14 * s} rot={[Math.PI / 2, 0, 0]} color={disp(CORAL)} line={2} />} />
    <Panel p={[0, 0.36 * s, 0.095 * s]} s={[0.44 * s, 0.44 * s]} px={[256, 256]} dep={Math.floor(sec * 4)} draw={(c, W) => {
      const R = W / 2; c.translate(R, R);
      c.strokeStyle = "#1c2032"; c.lineCap = "round";
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; c.lineWidth = i % 3 ? 5 : 10; c.beginPath(); c.moveTo(Math.sin(a) * R * 0.78, -Math.cos(a) * R * 0.78); c.lineTo(Math.sin(a) * R * 0.92, -Math.cos(a) * R * 0.92); c.stroke(); }
      const hand = (a: number, len: number, wdt: number, col: string) => { c.strokeStyle = col; c.lineWidth = wdt; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(a) * R * len, -Math.cos(a) * R * len); c.stroke(); };
      hand(((sec / 3600) % 12) / 12 * Math.PI * 2 + 0.35, 0.48, 14, "#1c2032");
      hand(((sec / 60) % 60) / 60 * Math.PI * 2, 0.7, 9, "#1c2032");
      hand((sec % 60) / 60 * Math.PI * 2, 0.8, 4, "#ff4d5e");
      c.fillStyle = "#f5b942"; c.beginPath(); c.arc(0, 0, 12, 0, 7); c.fill();
    }} />
  </group>
);

// ---------------------------------------------------------------- worlds
const Street: React.FC<{ z?: number; w?: number; len?: number }> = ({ z = 0, w = 6, len = 160 }) => (
  <group position={[0, 0, z]}>
    <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[len, w]} /><meshLambertMaterial color={disp(DAY.asphalt)} /></mesh>
    {Array.from({ length: 24 }, (_, i) => <mesh key={i} position={[-len / 2 + i * 6, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.4, 0.16]} /><meshBasicMaterial color={disp("#fff6d8")} /></mesh>)}
    {[-1, 1].map((s) => <mesh key={s} position={[0, 0.06, s * (w / 2 + 0.9)]} receiveShadow><boxGeometry args={[len, 0.12, 1.8]} /><meshLambertMaterial color={disp("#e6dccb")} /></mesh>)}
  </group>
);
/** sunny city PLAZA: paved square, a getaway sports car on the street behind, palms, the city skyline in the haze */
const PlazaWorld: React.FC<{ t: number; hero?: V3; warm?: number; car?: boolean }> = ({ t, hero = [0, 0, 0.6], warm = 0, car = true }) => (<>
  <DaySky fogNear={40} fogFar={190} warm={warm} />
  <SunRig target={hero} />
  <DayGround base={DAY.sand} speck="#c99a62" y={-0.05} z={-40} />
  <Surface lit p={[0, 0.01, 1]} s={[22, 12]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#efe2c8")} b={disp("#e4d4b4")} unit={2.0} />
  <Street z={-7} w={7} />
  {car && <Glb name="sports_car" p={[3.6, 0, -6.6]} rot={[0, -0.25, 0]} s={1.6} line={2} blob={1.6} />}
  <Palms at={[[-7, 0, -3], [7.5, 0, -2.5], [-11, 0, 3], [11, 0, 4], [-4, 0, -12], [6, 0, -13]]} s={1.3} />
  <CityBackdrop z={-85} spread={170} />
  <Clouds t={t} at={[[-30, 28, -100], [24, 34, -120], [50, 24, -90], [-60, 22, -70]]} s={5} />
</>);
/** bright KITCHEN: tiled floor, window wall to the sunny city, the counter along the back (top y 1.3) */
const KWALL = -3.3, KCNT: V3 = [0, 0, -2.75];
const KitchenWorld: React.FC<{ t: number; target?: V3 }> = ({ t, target = [0, 1, 0] }) => (<>
  <DaySky fogNear={30} fogFar={160} />
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
/** sunny PARK: lawn, paving, the picnic table (top y 1.05, at z -1.2), palms, city far away */
const TABLE_Z = -1.2, TOP = 1.06;
const ParkWorld: React.FC<{ t: number; hero?: V3; warm?: number }> = ({ t, hero = [0, 0, 0.6], warm = 0 }) => (<>
  <DaySky fogNear={40} fogFar={190} warm={warm} />
  <SunRig target={hero} />
  <DayGround base={DAY.grass} speck="#6fae52" y={-0.05} z={-40} />
  <Surface lit p={[0, 0.01, -1]} s={[16, 12]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#efe2c8")} b={disp("#e4d4b4")} unit={2.0} />
  <Glb name="picnic_table" p={[0, 0, TABLE_Z]} line={2} blob={1.6} fallback={<Box p={[0, 0.9, TABLE_Z]} s={[2.6, 0.12, 0.9]} color="#c98a4b" line={2} />} />
  <Palms at={[[-7, 0, -6], [7.5, 0, -7], [-11, 0, 3], [11, 0, 2], [-4, 0, -14], [5, 0, -16]]} s={1.3} />
  <CityBackdrop z={-80} spread={160} />
  <Clouds t={t} at={[[-30, 28, -100], [24, 34, -120], [50, 24, -90], [-60, 22, -70]]} s={5} />
</>);
/** bright BANK hall: marble floor, tall window wall, cream columns, the teller counter (top y 1.32) at z -1.8 */
const BWALL = -4.2, BCNT_Z = -1.8, BTOP = 1.33;
const BankWorld: React.FC<{ t: number; target?: V3 }> = ({ t, target = [0, 1, -1] }) => (<>
  <DaySky fogNear={30} fogFar={160} />
  <SunRig target={target} dir={[5, 10, 6]} />
  <DayGround base={DAY.grass} speck="#6fae52" y={-0.4} z={-60} />
  <CityBackdrop z={-50} spread={120} />
  <Clouds t={t} at={[[-20, 24, -90], [30, 28, -110]]} s={5} />
  <Surface lit p={[0, 0.01, 0]} s={[26, 20]} rot={[-Math.PI / 2, 0, 0]} kind="marble" a={disp("#f4eee4")} b={disp("#e6dccb")} unit={2.0} />
  <WindowWall z={BWALL} W={34} H={11} win={{ x: 0, y: 3.1, w: 9, h: 4.6 }} a="#efe6d6" kind="plain" />
  {[-6.5, -3.4, 3.4, 6.5].map((x) => <group key={x}>
    <Cyl p={[x, 3.6, BWALL + 0.5]} rt={0.42} h={7.2} color={disp("#fbf6ec")} line={2} />
    <Box p={[x, 0.15, BWALL + 0.5]} s={[1.1, 0.3, 1.1]} color={disp("#e6dccb")} line={2} />
  </group>)}
  <SunPatch p={[0, 0, -0.4]} s={[7, 3.5]} o={0.2} />
  <Glb name="bank_counter" p={[0, 0, BCNT_Z]} line={2} fallback={<Box p={[0, 0.66, BCNT_Z]} s={[5, 1.32, 0.8]} color={disp("#c8925e")} line={2} />} />
  <Glb name="side_table" p={[-4.6, 0, -0.6]} s={0.9} line={2} blob={0.7} />
</>);

// ---------------------------------------------------------------- shot builder
type View = { world: React.ReactNode; hud?: React.ReactNode };
const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number, sub: number, us: number, ls: number): View => {
  const t = f / FPS;
  switch (id) {
    case "hook": {
      // sub 0 = CRANE + LAND: drops from above the palms and lands level on Remy in the sunny plaza (WHAT IF draws on)
      // sub 1 = PUSH-IN: slow push into Remy grinning; the cyan GAME counter jumps from $0 to $1,000,000 in one frame
      // sub 2 = LOW HERO ANGLE: from the paving, looking up at Remy next to the real duffel bag of cash (he gulps)
      const MI = C("you're a millionaire.", 55), LS = C("Let's see what", 90);
      const R: V3 = [0, 0, 0.6];
      const world = <>
        <PlazaWorld t={t} hero={R} />
        {sub === 2 && <Duffel p={[1.05, 0, 0.2]} rot={[0, -0.3, 0]} s={1.0} blob={0.8} />}
        <Hero p={R} look={REMY} pose={{ mood: sub === 2 ? "gulp" : sub ? (u > MI ? "laugh" : "grin") : "smile", arms: sub === 1 && u > MI ? "up" : sub === 2 ? "point" : "down", armK: sub === 2 ? 0.6 : 1, lookX: sub === 2 ? 0.6 : 0 }} f={f} rimO={0.4} />
        {sub === 1 && <HoloCoin p={[-1.5, 3.3, 0.2]} o={k(u, MI - 4, MI + 6, 0, 0.9)} f={f} s={0.7} />}
        {sub === 2 ? <Move us={us} ls={ls} at={line({ pos: [0.45, 0.4, 8.6], look: [0.4, 2.2, 0.4], fov: 48 }, { pos: [0.5, 0.7, 7.7], look: [0.4, 2.1, 0.4], fov: 48 })} />
          : sub ? <Move us={us} ls={ls} at={line({ pos: [0.8, 2.5, 11.5], look: [0, 1.5, 0.6], fov: 44 }, { pos: [0.4, 2.1, 7.2], look: [0, 1.5, 0.6], fov: 44 })} />
            : <Move us={us} ls={ls} at={line({ pos: [0.4, 9.5, 15], look: [0, 1.0, 0.6], fov: 46 }, { pos: [0.6, 2.7, 10.2], look: [0, 1.6, 0.6], fov: 46 })} />}
      </>;
      const wp = k(u, 0, 34, 0.42, 1, EASE.arrive);
      const jumpAt = MI; // the counter runs on the scene clock u
      const hud = <>
        {!sub && <StrokeWord text="WHAT IF" x={540} y={565} h={125} p={wp} />}
        {!sub && <HudText f={u} x={540} y={415} size={56} color={AMBER} at={22}>#5</HudText>}
        {sub ? <GameCounter f={u} y={sub === 2 ? 400 : 560} sc={sub === 2 ? 0.75 : 1} value={u < jumpAt ? 0 : 1000000} at={sub === 1 ? u - us + 2 : -99} flash={jumpAt} /> : null}
      </>;
      return { world, hud };
    }
    case "test1": { // TRACKING / TRUCK: the camera trucks sideways with Remy hauling the heavy bag across the plaza; in the game a cyan coin pops and the counter jumps again
      const IG = C("In the game,", 30), AP = C("just appears", 55);
      const e = shotE(us, ls);
      const x = -3.6 + 3.6 * e, R: V3 = [x, 0, 1.6];
      const world = <>
        <PlazaWorld t={t} hero={[0, 0, 1]} />
        <Hero p={R} look={REMY} pose={{ mood: "tired", arms: "down", hunch: 0.7, tilt: 0.06, walk: u * 0.22, speed: e < 0.97 ? 0.5 : 0, sweat: 0.6 }} f={f} rimO={0.35} />
        <CarriedBag p={R} sag={1} />
        <HoloCoin p={[x - 1.7, 3.1, 1.0]} o={k(u, AP - 4, AP + 6, 0, 0.9)} f={f} s={0.8} />
        <Ring p={[x - 1.7, 3.1, 1.0]} u={u} at={AP} color={CYAN} s={0.4} rot={[0, 0, 0]} />
        <Move us={us} ls={ls} at={() => ({ pos: [x + 0.9, 2.7, R[2] + 8.6], look: [x - 0.3, 1.6, R[2]], fov: 46 })} />
      </>;
      const hud = <>
        <TestTracker f={u} at={4} active={0} out={len - 8} />
        <GameCounter f={u} y={590} value={u < AP ? 0 : 1000000} at={IG - 6} flash={AP} />
      </>;
      return { world, hud };
    }
    case "bill": { // PUSH-IN: from the kitchen toward ONE stylised bill on the digital kitchen scale; the display settles at 1 g
      const OG = C("one gram.", 50);
      const S = 1.6, SP: V3 = [0.1, 1.3, -2.55];
      const shown = u < 18 ? "0" : u < 26 ? "0.6" : "1.0";
      const land = k(u, 4, 18, 0.5, 0, Easing.out(Easing.cubic));
      const world = <>
        <KitchenWorld t={t} target={SP} />
        <Glb name="kitchen_scale" p={SP} s={S} line={2} fallback={<Box p={[SP[0], SP[1] + 0.06, SP[2]]} s={[0.8, 0.12, 0.66]} color="#f4f4f6" line={2} />} />
        <ScaleDisplay p={[SP[0], SP[1] + 0.036 * S, SP[2] + 0.226 * S]} w={0.25 * S} h={0.05 * S} text={shown} />
        <group position={[SP[0] + 0.02, SP[1] + 0.105 * S + 0.002 + land, SP[2] + 0.03]} rotation={[0, 0.18, land * 0.6]}>
          <Glb name="cash_bill" s={1.6} line={1.5} fallback={<Box p={[0, 0.005, 0]} s={[0.58, 0.01, 0.25]} color={disp("#7fc47a")} line={1} />} />
        </group>
        <Hero p={[-1.9, 0, -1.6]} look={REMY} pose={{ mood: "smile", arms: "point", armK: 0.7, lookX: 0.8 }} f={f} rimO={0.35} />
        <Move us={us} ls={ls} at={line({ pos: [0.9, 2.7, 2.6], look: [-0.3, 1.5, -2.4], fov: 44 }, { pos: [0.35, 2.3, -0.2], look: [0.1, 1.45, -2.55], fov: 42 })} />
      </>;
      const hud = <Readout f={u} y={470} at={OG + 2} icon="weight" value="~1 G" w={560} />;
      return { world, hud };
    }
    case "tenk": { // TOP-DOWN (lowering): straight down on the kitchen floor; cash bricks (1,000 bills each) land one after another until there are ten
      const HD = C("hundred dollar", 30), TT = C("ten thousand bills.", 70);
      const n = Math.floor(k(us, 4, Math.max(16, TT - (len - ls) + 14), 0, 10.99, Easing.linear));
      const world = <>
        <KitchenWorld t={t} target={[0, 0, 0.3]} />
        {Array.from({ length: 10 }, (_, i) => {
          if (i >= n) return null;
          const col = i % 5, row = Math.floor(i / 5), age = us - (4 + (i / 10.99) * (Math.max(16, TT - (len - ls) + 14) - 4));
          const drop = k(age, 0, 6, 0.6, 0, Easing.out(Easing.cubic));
          return <Brick key={i} p={[-1.1 + col * 0.55, drop, 0.05 + row * 0.42]} rot={(i % 3 - 1) * 0.05} />;
        })}
        <Hero p={[2.3, 0, 0.6]} look={REMY} pose={{ mood: "shock", arms: "chest" }} f={f} rimO={0.3} shadow={false} />
        <Move us={us} ls={ls} at={line({ pos: [0, 7.4, 1.2], look: [0, 0, 0.3], fov: 46 }, { pos: [0, 5.7, 1.0], look: [0, 0, 0.3], fov: 46 })} />
      </>;
      const bills = Math.min(10, n) * 1000;
      const hud = <>
        <g opacity={drawOn(u, HD - 4, 12)}>
          <Plate x={170} y={330} w={740} h={180} o={1} r={34} />
          <BillIcon x={330} y={420} s={1.25} />
          <HudText f={u} x={480} y={455} size={92} color={GOLD} at={HD} anchor="start" spacing={2}>{"× " + bills.toLocaleString("en-US")}</HudText>
        </g>
      </>;
      return { world, hud };
    }
    case "weight": { // ORBIT: a slow arc around the duffel full of cash on a big floor scale and the potato sack beside it; the display reads 10 kg
      const TK = C("ten kilograms.", 25), PO = C("bag of potatoes.", 70);
      const S = 2.6, SP: V3 = [-0.55, 0, 0.4];
      const shown = u < TK - 10 ? "0.0" : u < TK - 2 ? "6.3" : "10.0";
      const world = <>
        <KitchenWorld t={t} target={[0, 0.8, 0.4]} />
        <Glb name="kitchen_scale" p={SP} s={S} line={2} blob={1.0} fallback={<Box p={[SP[0], 0.15, SP[2]]} s={[1.3, 0.28, 1.1]} color="#f4f4f6" line={2} />} />
        <ScaleDisplay p={[SP[0], 0.036 * S, SP[2] + 0.226 * S]} w={0.25 * S} h={0.05 * S} text={shown} />
        <Duffel p={[SP[0], 0.105 * S, SP[2] + 0.02]} s={1.15} />
        <Glb name="potato_sack" p={[0.95, 0, 0.5]} s={1.45} rot={[0, -0.35, 0]} line={2} blob={0.8} fallback={<Ball p={[1.45, 0.6, 0.5]} r={0.55} color="#c9a26b" />} />
        <Hero p={[-2.4, 0, 0.0]} look={REMY} pose={{ mood: u > PO ? "grin" : "worry", arms: "point", armK: 0.8, lookX: 0.8 }} f={f} rimO={0.35} />
        <Move us={us} ls={ls} at={orbit([0.15, 0.9, 0.4], 7.2, 1.2, -0.38, 0.3, 44)} />
      </>;
      const hud = <Readout f={u} y={470} at={TK + 2} icon="weight" value="~10 KG" w={640} />;
      return { world, hud };
    }
    case "tower": { // CRANE UP (rise): the camera rises with the top of a cash tower that grows brick by brick next to Remy, until it stands about as tall as he is
      const MT = C("a meter tall.", 55);
      const n = Math.floor(k(u, 4, MT + 4, 1, 10.99, Easing.inOut(Easing.quad)));
      const TX = 0.55, R: V3 = [-0.75, 0, 0.6];
      const top = n * BR_H;
      const world = <>
        <KitchenWorld t={t} target={[0, 1.2, 0.6]} />
        {Array.from({ length: n }, (_, i) => <Brick key={i} p={[TX, i * BR_H, 0.6]} rot={(((i * 7) % 5) - 2) * 0.03} />)}
        <Halo p={[TX, top + 0.05, 0.7]} r={0.5} color={N3.gold} o={0.35} />
        {/* measuring tape beside the tower: ticks only (the HUD carries the number) */}
        <Panel p={[TX + 0.42, 1.21, 0.6]} s={[0.16, 2.42]} px={[48, 726]} dep={1} draw={(c, W, H) => {
          c.fillStyle = "#ffd76e"; c.fillRect(0, 0, W, H); c.fillStyle = "#1c2032";
          for (let i = 0; i <= 20; i++) { const y = H - (i / 20) * H; c.fillRect(0, Math.min(H - 4, y), i % 5 ? W * 0.4 : W * 0.8, 4); }
        }} />
        <Hero p={R} look={REMY} pose={{ mood: n >= 10 ? "shock" : "smile", arms: n >= 10 ? "head" : "point", armK: 0.8, lookX: 0.7 }} f={f} rimO={0.35} />
        <Move us={us} ls={ls} at={line({ pos: [0, 0.55, 7.6], look: [-0.1, 0.95, 0.6], fov: 44 }, { pos: [0, 2.4, 8.2], look: [-0.1, 1.5, 0.6], fov: 44 })} />
      </>;
      const hud = <>
        <Readout f={u} y={470} at={MT + 2} icon="ruler" value="~1 M" w={520} />
      </>;
      return { world, hud };
    }
    case "test2": { // PULL BACK (reveal): from Remy at the park picnic table back to the whole sunny park; in the game the cyan number simply jumps up
      const IG = C("In the game, the number", 30), GU = C("goes up.", 50);
      const R: V3 = [0, 0, -2.45];
      const world = <>
        <ParkWorld t={t} hero={[0, 1, -1.5]} />
        <Hero p={R} look={REMY} pose={{ mood: u > GU ? "grin" : "smile", arms: "down" }} f={f} rimO={0.35} shadow={false} />
        {[-0.6, -0.15].map((x, i) => <Brick key={i} p={[x, TOP, TABLE_Z + 0.1]} rot={0.1 * i} />)}
        <HoloCoin p={[1.4, 2.9, -1.0]} o={k(u, GU - 4, GU + 6, 0, 0.85)} f={f} s={0.6} />
        <Move us={us} ls={ls} at={line({ pos: [0.5, 2.3, 3.2], look: [0, 1.7, -1.8], fov: 46 }, { pos: [1.2, 3.6, 11.5], look: [0, 1.6, -1.8], fov: 46 })} />
      </>;
      const v = u < IG + 6 ? 0 : u < GU ? 250000 : 1000000;
      const hud = <>
        <TestTracker f={u} at={4} active={1} out={len - 8} />
        <GameCounter f={u} y={590} value={v} at={IG - 6} flash={u < GU ? IG + 6 : GU} />
      </>;
      return { world, hud };
    }
    case "count": {
      // sub 0 = TRUCK (lateral tracking): the camera slides slowly along the table while Remy moves one bill per second
      //         from the full pile to the counted pile; the clock's red hand ticks; the HUD timer runs in real time
      // sub 1 = DOLLY ZOOM (vertigo): on tired Remy; time-lapse - the clock hands spin, the counted pile grows, the timer
      //         races to 2:46:40 (10,000 s), then ~2.8 H and a sweating thumb
      const OB = C("one bill every", 30), TT = C("ten thousand bills take", 100), AT = C("almost three hours.", 125);
      const R: V3 = [0, 0, -2.45];
      const secs = sub ? k(us, 6, Math.max(20, AT - (len - ls) + 2), 30, 10000, Easing.in(Easing.quad)) : Math.max(0, (u - OB) / FPS);
      const prog = clamp(secs / 10000);
      const flick = sub ? 0 : ((u - OB) % FPS) / FPS;
      const tired = sub ? clamp(prog * 1.4) : 0;
      const left = sub ? Math.max(1, Math.round(4 - prog * 3)) : 4, right = sub ? Math.round(prog * 4) : 0;
      const world = <>
        <ParkWorld t={t} hero={[0, 1, -1.5]} warm={sub ? 0.35 * prog : 0} />
        <Hero p={R} look={REMY} pose={{ mood: sub ? (tired > 0.6 ? "tired" : "worry") : "smile", lids: tired * 0.55, bags: tired, arms: "hold", hunch: tired * 0.6, sweat: tired * 0.6 }} f={f} rimO={0.35} shadow={false} />
        {Array.from({ length: left }, (_, i) => <Brick key={"l" + i} p={[-0.95, TOP + i * BR_H, TABLE_Z + 0.05]} rot={0.04 * (i % 2)} />)}
        {Array.from({ length: right }, (_, i) => <Brick key={"r" + i} p={[0.75, TOP + i * BR_H, TABLE_Z + 0.05]} rot={-0.04 * (i % 2)} />)}
        {!sub && u > OB && <group position={[-0.95 + 1.7 * flick, TOP + 4 * BR_H * (1 - flick) + Math.sin(flick * Math.PI) * 0.35 + 0.02, TABLE_Z + 0.05]} rotation={[0, 0, -Math.sin(flick * Math.PI) * 0.5]}>
          <Glb name="cash_bill" s={BR} line={1.5} />
        </group>}
        <DeskClock p={[1.5, TOP, TABLE_Z + 0.05]} s={1.1} sec={sub ? secs : 600 + Math.max(0, (u - OB) / FPS)} />
        {sub ? <Move us={us} ls={ls} at={dollyZoom([0, 1.85, -2.0], [0.05, 0.12, 1], 11, 6.2, 28)} />
          : <Move us={us} ls={ls} at={line({ pos: [-1.2, 2.5, 5.6], look: [-0.15, 1.6, -1.6], fov: 44 }, { pos: [0.9, 2.5, 5.4], look: [0.2, 1.6, -1.6], fov: 44 })} />}
      </>;
      const hud = sub ? <>
        <g opacity={drawOn(us, 2, 10) * leaveO(u, AT - 2)}>
          <Plate x={250} y={330} w={580} h={170} o={1} r={34} />
          <g transform="translate(345 415)"><NeonPath d={ICON.clock} w={5} color={GOLD} hot /></g>
          <text x={440} y={450} fontFamily={WI_FONT} fontWeight={900} fontSize={88} fill={GOLD} stroke="#0b0d1a" strokeWidth={10} paintOrder="stroke" letterSpacing={2}>{hms(secs)}</text>
        </g>
        {u >= AT - 2 && <Readout f={u} y={415} at={AT} icon="clock" value="~2.8 H" w={560} />}
        <IconTile f={u} x={540} y={660} at={AT + 8} kind="thumb" sweat />
      </> : <>
        <g opacity={drawOn(u, OB - 4, 10)}>
          <Plate x={250} y={330} w={580} h={170} o={1} r={34} />
          <g transform="translate(345 415)"><NeonPath d={ICON.clock} w={5} color={GOLD} hot /></g>
          <text x={440} y={450} fontFamily={WI_FONT} fontWeight={900} fontSize={88} fill={GOLD} stroke="#0b0d1a" strokeWidth={10} paintOrder="stroke" letterSpacing={2}>{hms(Math.max(0, (u - OB) / FPS))}</text>
        </g>
      </>;
      return { world, hud };
    }
    case "test3": { // ORBIT: an arc around Remy hauling the duffel into the bright bank hall; in the game the deposit just lands, no questions
      const IG = C("In the game, nobody", 30), CF = C("came from.", 60);
      const R: V3 = [0.6, 0, 0.4];
      const world = <>
        <BankWorld t={t} target={[0.4, 1, -0.5]} />
        <Hero p={R} look={REMY} pose={{ mood: "smile", arms: "down", hunch: 0.5, tilt: 0.05 }} f={f} rimO={0.35} />
        <CarriedBag p={R} sag={0.8} />
        <HoloCoin p={[-1.4, 2.9, -0.4]} o={k(u, CF - 10, CF, 0, 0.85)} f={f} s={0.65} />
        <Move us={us} ls={ls} at={orbit([0.3, 1.5, -0.2], 8.4, 1.2, 0.42, -0.2, 44)} />
      </>;
      const hud = <>
        <TestTracker f={u} at={4} active={2} out={len - 8} />
        <GameCounter f={u} y={590} value={u < CF - 6 ? 0 : 1000000} at={IG - 6} flash={CF - 6} />
      </>;
      return { world, hud };
    }
    case "bank": { // PUSH-IN: toward the teller window where the bag sits on the counter; the HUD shows the report form for cash over $10,000 flying to the government
      const RE = C("have to report", 25), OT = C("over ten thousand", 50), GV = C("to the government.", 80);
      const world = <>
        <BankWorld t={t} target={[1.25, 1.4, BCNT_Z]} />
        <Duffel p={[1.25, BTOP, BCNT_Z + 0.2]} s={0.62} rot={[0, -0.2, 0]} />
        <Hero p={[-0.9, 0, -0.3]} look={REMY} pose={{ mood: u > GV ? "worry" : "smile", arms: "chest", lookX: 0.7 }} f={f} rimO={0.35} />
        <Halo p={[1.25, 2.55, BCNT_Z - 0.1]} r={0.8} color={N3.amber} o={0.35} />
        <Move us={us} ls={ls} at={line({ pos: [0.2, 2.6, 6.8], look: [0.8, 1.7, BCNT_Z], fov: 46 }, { pos: [0.7, 2.3, 3.8], look: [0.6, 1.7, BCNT_Z], fov: 44 })} />
      </>;
      const fly = k(u, GV, GV + 20, 0, 1, Easing.inOut(Easing.cubic));
      const hud = <>
        <g opacity={drawOn(u, RE, 12)}>
          <Plate x={110} y={320} w={860} h={330} o={1} r={34} />
          <g transform={`translate(${250 + fly * 540} ${430 - Math.sin(fly * Math.PI) * 50}) scale(${1.15 - fly * 0.35})`} opacity={1 - fly * 0.6}><NeonPath d={ICON.paper} w={5} color={GOLD} hot /></g>
          <g transform="translate(790 430)" opacity={drawOn(u, GV - 6, 12)}><NeonPath d={ICON.gov} w={5} color={AMBER} hot /></g>
          {fly > 0 && fly < 1 && <NeonPath d="M 330 430 Q 520 360 700 430" w={4} color={GOLD} p={fly} glow={0.4} />}
        </g>
        <HudText f={u} x={540} y={600} size={80} color={GOLD} at={OT + 4} spacing={2}>{"> $10,000"}</HudText>
      </>;
      return { world, hud };
    }
    case "split": { // TOP-DOWN (lowering): straight down on the counter; the pile of cash slides apart into small piles under $10,000, then a red X and a stamp
      const SM = C("smaller deposits", 20), DG = C("to dodge", 45), CR = C("a crime too.", 80);
      const sp = k(u, SM - 6, DG + 6, 0, 1, Easing.inOut(Easing.cubic));
      const world = <>
        <BankWorld t={t} target={[0, BTOP, BCNT_Z]} />
        {Array.from({ length: 10 }, (_, i) => {
          const pile = i % 5, lvl = Math.floor(i / 5);
          const x0 = (i % 2) * 0.42 - 0.21, z0 = BCNT_Z + 0.05, y0 = BTOP + Math.floor(i / 2) * BR_H;
          const x1 = -0.84 + pile * 0.42, y1 = BTOP + lvl * BR_H, z1 = BCNT_Z + 0.08;
          return <Brick key={i} p={[x0 + (x1 - x0) * sp, y0 + (y1 - y0) * sp + Math.sin(sp * Math.PI) * 0.25, z0 + (z1 - z0) * sp]} rot={(1 - sp) * 0.02 * i + sp * Math.PI / 2} />;
        })}
        <Move us={us} ls={ls} at={line({ pos: [0, 6.6, BCNT_Z + 1.2], look: [0, BTOP, BCNT_Z], fov: 46 }, { pos: [0, 5.0, BCNT_Z + 0.95], look: [0, BTOP, BCNT_Z], fov: 46 })} />
      </>;
      const xs = k(u, CR - 4, CR + 8, 0, 1, Easing.out(Easing.cubic));
      const st = arrive(u, CR + 6, 10);
      const hud = <>
        <g opacity={drawOn(u, SM + 4, 12) * (1 - 0.35 * xs)}>
          <Plate x={60} y={330} w={960} h={170} o={1} r={34} />
          {[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`translate(${160 + i * 190} 415)`}>
            <HudText f={u} x={0} y={30} size={62} color={GOLD} at={SM + 6 + i * 3}>$9K</HudText>
          </g>)}
        </g>
        {xs > 0 && <g transform="translate(540 760)">
          <NeonPath d="M -170 -170 L 170 170" w={16} color={RED} p={xs} hot />
          <NeonPath d="M 170 -170 L -170 170" w={16} color={RED} p={k(u, CR + 2, CR + 12, 0, 1, Easing.out(Easing.cubic))} hot />
        </g>}
        {st > 0 && <g transform={`translate(540 1040) rotate(-6) scale(${1.25 - 0.25 * st})`} opacity={st}>
          <rect x={-300} y={-70} width={600} height={140} rx={18} fill="#2a0a10" opacity={0.7} />
          <rect x={-300} y={-70} width={600} height={140} rx={18} fill="none" stroke={RED} strokeWidth={9} />
          <text x={0} y={30} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={84} fill={RED} letterSpacing={4}>ILLEGAL</text>
        </g>}
      </>;
      return { world, hud };
    }
    case "recap": {
      // sub 0 = PULL BACK (reveal): from Remy, hunched under the heavy bag, back to the whole sunny plaza (no getaway car)
      // sub 1 = TRACKING / TRUCK: the camera trucks with Remy dragging the bag along; three icons: heavy bag, tired thumb, paperwork
      const HB = C("a heavy bag,", 4), TT = C("a tired thumb,", 30), PW = C("lot of paperwork.", 60);
      const e = shotE(us, ls);
      const x = sub ? -2.4 + 2.4 * e : 0, R: V3 = [x, 0, 0.8];
      const world = <>
        <PlazaWorld t={t} hero={R} car={false} warm={0.15} />
        <Hero p={R} look={REMY} pose={{ mood: "tired", lids: 0.35, bags: 0.6, arms: "down", hunch: 0.8, tilt: 0.07, walk: sub ? u * 0.18 : undefined, speed: sub && e < 0.97 ? 0.4 : 0, sweat: 0.5 }} f={f} rimO={0.35} />
        <CarriedBag p={R} sag={1.2} />
        {sub ? <Move us={us} ls={ls} at={() => ({ pos: [x + 0.8, 2.5, R[2] + 8.0], look: [x - 0.1, 1.6, R[2]], fov: 46 })} />
          : <Move us={us} ls={ls} at={line({ pos: [0.4, 1.9, 5.2], look: [0.2, 1.4, 0.8], fov: 44 }, { pos: [0.9, 4.2, 14.5], look: [0, 1.9, 0.0], fov: 46 })} />}
      </>;
      const hud = sub ? <>
        <IconTile f={u} x={300} y={470} at={HB} kind="bag" />
        <IconTile f={u} x={540} y={470} at={TT} kind="thumb" sweat />
        <IconTile f={u} x={780} y={470} at={PW} kind="paper" />
      </> : <GameCounter f={u} y={470} value={1000000} at={4} sc={0.8} out={len - 10} />;
      return { world, hud };
    }
    case "outro": { // CRANE UP (rise): from Remy's height the camera rises over the plaza: the weightless cyan coin floats up, the real bag sits heavy on the floor scale
      const IR = C("In real life, it", 50), WS = C("weighs something.", 70);
      const R: V3 = [0, 0, 1.2];
      const S = 2.6, SP: V3 = [1.6, 0, 1.0];
      const world = <>
        <PlazaWorld t={t} hero={[0, 0, 0.6]} warm={0.3} />
        <HoloCoin p={[-1.7, 2.6 + k(u, 0, len, 0, 1.2, Easing.linear), 0.6]} o={0.9 * (1 - k(u, IR + 10, IR + 30, 0, 0.4))} f={f} s={0.9} />
        <Glb name="kitchen_scale" p={SP} s={S} line={2} blob={1.0} />
        <ScaleDisplay p={[SP[0], 0.036 * S, SP[2] + 0.226 * S]} w={0.25 * S} h={0.05 * S} text={u < IR ? "0.0" : "10.0"} />
        <Duffel p={[SP[0], 0.105 * S - (u > WS && u < WS + 6 ? 0.03 : 0), SP[2] + 0.02]} s={1.15} />
        <Ring p={[SP[0], 0.06, SP[2]]} u={u} at={WS} color="#fff3d0" s={0.6} />
        <Hero p={R} look={REMY} pose={{ mood: u > WS ? "grin" : "smile", arms: "chest" }} f={f} rimO={0.4} />
        <Move us={us} ls={ls} at={line({ pos: [0.4, 1.7, 8.8], look: [0, 1.6, 0.8], fov: 48 }, { pos: [0.4, 5.6, 13.2], look: [0, 1.8, -0.4], fov: 48 })} />
      </>;
      const hud = <>
        <GameCounter f={u} y={420} value={1000000} at={4} sc={0.85} />
        <Readout f={u} y={640} at={IR + 2} icon="weight" value="~10 KG" w={600} />
      </>;
      return { world, hud };
    }
    default: { // ask - CRANE + LAND: drops gently from above and lands level on Remy in the plaza with the bag at his feet; the question card (A-D)
      const R: V3 = [0, 0, 0.6];
      const world = <>
        <PlazaWorld t={t} hero={R} warm={0.4} />
        <Duffel p={[1.2, 0, 1.0]} rot={[0, -0.35, 0]} s={1.0} blob={0.8} />
        <Hero p={R} look={REMY} pose={{ mood: "grin", arms: u > 26 ? "point" : "up", armK: u > 26 ? 1 : 0.8 }} f={f} rimO={0.45} />
        <Move us={us} ls={ls} at={line({ pos: [0.8, 9.5, 15.5], look: [0, 1.2, 0.6], fov: 46 }, { pos: [0.4, 3.0, 13.8], look: [0, 2.0, 0.6], fov: 46 })} />
      </>;
      const hud = <>
        <HudText f={u} x={540} y={420} size={60} color={CREAM} at={4} out={len + 30}>COMMENT</HudText>
        <HudText f={u} x={540} y={505} size={76} color={GOLD} at={8} out={len + 30}>A, B, C OR D</HudText>
        <ChoiceCards f={u} y={720} at={12} cw={470} ch={130} cards={[{ letter: "A", text: "SAVE IT" }, { letter: "B", text: "A HOUSE" }, { letter: "C", text: "A CAR" }, { letter: "D", text: "SHARE IT" }]} />
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
  id: "wi-gta-money",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: N3.bg,
};
export default story;
