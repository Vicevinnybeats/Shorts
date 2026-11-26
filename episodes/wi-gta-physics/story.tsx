// WHAT IF #3 "What If GTA Physics Worked in Real Life?" - bright DAYLIGHT Stick3D look (as approved for What If 1:
// big 3D worlds with sky, clouds, sun, haze; Remy = REMY3D puppet + beanie; Golden Neon only for HUD/counters/titles;
// cyan only for the "game logic" ghosts). Remy tests three GTA moves against real physics (RESEARCH.md):
// skydiver terminal velocity ~200 km/h after ~12 s; a 50 km/h crash ~ falling from the 3rd floor; double speed -> 4x
// crash energy; seat belts spread the stop over hips + chest; pedestrians hit at 30 km/h: >95% survive, at 50: ~85%;
// 30 zones near schools. Friendly: crash-test dummy + abstract impact rings only, nobody is ever shown hurt.
// "GTA" only as words: no game footage, art, maps or logos.
// Every beat is cue-driven (C(phrase, fallback)) so the picture follows words.json. Real shots with hard cuts; every
// PLACE change = shape morph; one NAMED camera move per shot (comment on each case), never reversing.
// Layout: HUD text y 300-1350 (counter card 316-556); figures stay above y 1430 (captions own 1440-1640).
// NO DOUBLE TEXT: on-screen words never repeat what the caption says at that moment (icons/numbers instead).
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
import { NEON, NeonDefs, StrokeWord, LiveCounter, CompareBars, ChoiceCards, NeonPath, WI_FONT, Digits, RepeatIcon, drawOn } from "../../library/whatif/kit";
import { Box, Cyl, Ball, Surface } from "../../library/stick3d/toon";
import { Person, V3, clamp, Grade } from "../../library/stick3d/kit";
import { REMY3D } from "../../src/tests/Stick3DTest";
import { Cam, Key, Barrier } from "../../library/stick3d/extra";
import { Glb } from "../../library/stick3d/glb";
import { DaySky, SunRig, DayGround, CityBackdrop, Palms, Clouds, WindowWall, SunPatch, disp, DAY } from "../../library/stick3d/daylight";
import { drawPuppet, Look, Pose } from "../../library/stick3d/puppet";
import { N3, Halo, FloorPool, NeonBar, Motes, Panel } from "../../library/stick3d/neon";

// ---------------------------------------------------------------- cast
const REMY: Look = { ...REMY3D, beanie: "#2e3658", beanieBand: N3.gold, pom: N3.amber };
const SKY: Look = { skin: "#efcfae", body: "#ff7a59", outfit: "shirt", hair: "short", hairColor: "#3a2a1a", glasses: true, shoe: "#2b2f3a" };
const KID1: Look = { skin: "#c98d5f", body: "#4f86b8", outfit: "hoodie", hair: "short", hairColor: "#1b1b2a", shoe: "#2b2f3a" };
const KID2: Look = { skin: "#f0d2b4", body: "#6fae52", outfit: "shirt", hair: "bob", hairColor: "#8a4a22", shoe: "#2b2f3a" };
const { gold: GOLD, coral: CORAL, amber: AMBER, text: CREAM, cyan: CYAN, dim: DIM } = NEON;

// ---------------------------------------------------------------- shots
type ShotDef = { id: string; cue: string; parent: string; sub: number };
const DEFS: ShotDef[] = [
  { id: "hook", cue: "What if GTA", parent: "hook", sub: 0 },
  { id: "hookb", cue: "Jump off a", parent: "hook", sub: 1 },
  { id: "test1", cue: "Test one. Remy", parent: "test1", sub: 0 },
  { id: "gravity", cue: "In real life, gravity", parent: "gravity", sub: 0 },
  { id: "fall", cue: "After about twelve", parent: "fall", sub: 0 },
  { id: "fallb", cue: "That's terminal velocity", parent: "fall", sub: 1 },
  { id: "chute", cue: "Parachutes exist for", parent: "chute", sub: 0 },
  { id: "stairs", cue: "Remy takes the", parent: "stairs", sub: 0 },
  { id: "test2", cue: "Test two. A", parent: "test2", sub: 0 },
  { id: "math", cue: "Here's the real", parent: "math", sub: 0 },
  { id: "energy", cue: "Double the speed", parent: "energy", sub: 0 },
  { id: "energyb", cue: "Speed doesn't add", parent: "energy", sub: 1 },
  { id: "belt", cue: "That's why seat", parent: "belt", sub: 0 },
  { id: "test3", cue: "Test three. Walking", parent: "test3", sub: 0 },
  { id: "survive", cue: "In real life, more", parent: "survive", sub: 0 },
  { id: "zone", cue: "That's why many", parent: "zone", sub: 0 },
  { id: "respawn", cue: "So, game rules", parent: "respawn", sub: 0 },
  { id: "ask", cue: "Which GTA move", parent: "ask", sub: 0 },
];
const DEF: Record<string, ShotDef> = Object.fromEntries(DEFS.map((d) => [d.id, d]));
const SHOTS = DEFS.map((d) => ({ id: d.id, cue: d.cue }));
const TR_FRAMES = 14;
/** place of each scene (parent): a PLACE change = shape-morph transition, everything else = hard cut */
const PLACE: Record<string, string> = {
  hook: "roof", test1: "roof", gravity: "roof", fall: "sky", chute: "sky", stairs: "stairs", test2: "street", math: "street",
  energy: "track", belt: "lab", test3: "school", survive: "school", zone: "school", respawn: "plaza", ask: "roof",
};
/** background colour of each scene = the flood colour of the morph INTO it */
const BG: Record<string, string> = {
  hook: "#cfe9fb", test1: "#cfe9fb", gravity: "#cfe9fb", fall: "#9cc8ee", chute: "#9cc8ee", stairs: "#f4e8d4", test2: "#e9dcc6",
  math: "#e9dcc6", energy: "#dfe8d2", belt: "#eef3f8", test3: "#f3dcc0", survive: "#f3dcc0", zone: "#f3dcc0", respawn: "#f6efe2", ask: "#cfe9fb",
};
/** key object of the OUTGOING shot that becomes the transition shape (screen rect, radius) */
const KEY_DEF = { cx: 540, cy: 900, w: 380, h: 380, r: 190 };
const KEY_OBJ: Record<string, typeof KEY_DEF> = {
  gravity: { cx: 540, cy: 960, w: 340, h: 340, r: 170 },              // Remy's spot at the edge
  chute: { cx: 540, cy: 640, w: 520, h: 300, r: 150 },                // the canopy
  stairs: { cx: 540, cy: 900, w: 360, h: 300, r: 30 },                // the stairwell window light
  math: { cx: 860, cy: 470, w: 230, h: 230, r: 115 },                 // the speedometer gauge
  energyb: { cx: 540, cy: 900, w: 300, h: 300, r: 40 },               // the x sign
  belt: { cx: 540, cy: 880, w: 340, h: 340, r: 170 },                 // the impact ring
  zone: { cx: 540, cy: 800, w: 300, h: 300, r: 150 },                 // the round 30 sign
  respawn: { cx: 790, cy: 470, w: 280, h: 300, r: 26 },               // the save card
};

// ---------------------------------------------------------------- helpers
const k = (u: number, a: number, b: number, from: number, to: number, e = EASE.camera) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const lerp3 = (a: V3, b: V3, e: number): V3 => [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
/** shot clock -> 0..1 with the house camera ease: FAST first, then slow for longer (cubic ease-out), never reversing */
const shotE = (us: number, ls: number) => { const x = clamp(us / Math.max(1, ls)); return 1 - Math.pow(1 - x, 3); };
type CamPose = { pos: V3; look: V3; fov?: number; roll?: number };
/** one named camera move per shot: `at(e)` gives the camera for progress e (0..1, eased) */
const Move: React.FC<{ us: number; ls: number; at: (e: number) => CamPose; impacts?: [number, number][] }> = ({ us, ls, at, impacts = [] }) => {
  const c = at(shotE(us, ls));
  const key: Key = { t: 0, pos: c.pos, look: c.look, fov: c.fov ?? 46, roll: c.roll ?? 0 };
  return <Cam t={us / FPS} keys={[key]} impacts={impacts.map(([p, q]) => [p / FPS, q] as [number, number])} />;
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
const Plate: React.FC<{ x: number; y: number; w: number; h: number; o: number; r?: number }> = ({ x, y, w, h, o, r = 22 }) => o <= 0 ? null : <rect x={x} y={y} width={w} height={h} rx={r} fill="#0b0d1a" opacity={0.52 * o} />;

// ---------------------------------------------------------------- HUD pieces (icons/numbers, never caption words)
const ICON: Record<string, string> = {
  fall: "M -6 -30 a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0 M 3 -21 L 3 4 M -14 -12 L 20 -12 M 3 4 L -8 24 M 3 4 L 14 24 M -26 -10 L -26 22 M -33 13 L -26 22 L -19 13",
  car: "M -38 10 L -38 -4 L -24 -7 L -14 -21 L 16 -21 L 26 -7 L 38 -4 L 38 10 Z M -30 12 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0 M 14 12 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0",
  walk: "M -3 -32 a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0 M 4 -22 L -2 4 M -2 4 L -14 26 M -2 4 L 12 26 M 2 -14 L -16 -2 M 2 -14 L 18 -4",
};
/** three test tiles (fall / car / walk); the current test lights gold, done ones get a tick */
const TestTracker: React.FC<{ f: number; at: number; active: number; out?: number; y?: number }> = ({ f, at, active, out = Infinity, y = 420 }) => {
  const o = leaveO(f, out); if (f < at - 2 || o <= 0) return null;
  return <g opacity={o}>{["fall", "car", "walk"].map((ic, i) => {
    const x = 540 + (i - 1) * 156, p = drawOn(f, at + i * 3, 12), on = i === active, done = i < active;
    const col = on ? GOLD : done ? AMBER : DIM;
    return <g key={ic} transform={`translate(${x} ${y - (1 - p) * 14})`} opacity={p}>
      <rect x={-62} y={-62} width={124} height={124} rx={24} fill={on ? "#3a2a0c" : "#0b0d1a"} opacity={on ? 0.8 : 0.55} />
      <NeonPath d="M -38 -62 L 38 -62 Q 62 -62 62 -38 L 62 38 Q 62 62 38 62 L -38 62 Q -62 62 -62 38 L -62 -38 Q -62 -62 -38 -62 Z" w={on ? 4.5 : 2.5} color={col} glow={on ? 1 : 0.3} />
      <NeonPath d={ICON[ic]} w={on ? 5 : 3.5} color={col} glow={on ? 0.8 : 0.2} hot={on} />
      {done && <NeonPath d="M 30 -50 l 10 10 l 20 -24" w={5} color={GOLD} />}
    </g>;
  })}</g>;
};
/** speedometer: half-dial, ticks every 10 (0..100 km/h), needle to v */
const Gauge: React.FC<{ f: number; x: number; y: number; r: number; v: number; at: number; out?: number }> = ({ f, x, y, r, v, at, out = Infinity }) => {
  const p = drawOn(f, at, 14), o = leaveO(f, out); if (p <= 0 || o <= 0) return null;
  const ang = (val: number) => Math.PI - (val / 100) * Math.PI, pt = (a: number, rr: number) => `${x + rr * Math.cos(a)} ${y - rr * Math.sin(a)}`;
  const a = ang(v);
  return <g opacity={o}>
    <path d={`M ${x - r - 24} ${y + 26} L ${x - r - 24} ${y} A ${r + 24} ${r + 24} 0 0 1 ${x + r + 24} ${y} L ${x + r + 24} ${y + 26} Z`} fill="#0b0d1a" opacity={0.55 * p} />
    <NeonPath d={`M ${pt(Math.PI, r)} A ${r} ${r} 0 0 1 ${pt(0, r)}`} p={p} w={4} color={DIM} glow={0.3} />
    <NeonPath d={`M ${pt(Math.PI, r)} A ${r} ${r} 0 0 1 ${pt(a, r)}`} p={p} w={7} color={AMBER} hot />
    {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M ${pt(ang(i * 10), r - 8)} L ${pt(ang(i * 10), r - (i % 5 ? 20 : 32))}`} stroke={i * 10 <= v ? GOLD : DIM} strokeWidth={i % 5 ? 3 : 5} strokeLinecap="round" opacity={p} />)}
    <NeonPath d={`M ${x} ${y} L ${pt(a, r - 30)}`} w={6} color={CORAL} hot />
    <circle cx={x} cy={y} r={10} fill={CORAL} opacity={p} />
  </g>;
};
/** vertical force arrow (screen px): from (x, y0) pointing to y1 */
const VArrow: React.FC<{ x: number; y0: number; y1: number; color: string; p?: number; w?: number }> = ({ x, y0, y1, color, p = 1, w = 9 }) => {
  if (p <= 0 || Math.abs(y1 - y0) < 4) return null;
  const s = Math.sign(y1 - y0);
  return <g opacity={Math.min(1, p * 2)}>
    <NeonPath d={`M ${x} ${y0} L ${x} ${y1}`} w={w} color={color} hot />
    <NeonPath d={`M ${x - 26} ${y1 - s * 30} L ${x} ${y1} L ${x + 26} ${y1 - s * 30}`} w={w} color={color} hot />
  </g>;
};
/** "+" that turns into "x": the plus dims, then rotates 45 degrees on the spot into a gold multiply sign */
const PlusTimes: React.FC<{ f: number; x: number; y: number; at: number; turn: number }> = ({ f, x, y, at, turn }) => {
  const p = drawOn(f, at, 12); if (p <= 0) return null;
  const q = k(f, turn, turn + 18, 0, 1, Easing.inOut(Easing.cubic)), s = 1 + 0.12 * Math.sin(q * Math.PI);
  const col = q > 0.5 ? GOLD : CREAM;
  return <g transform={`translate(${x} ${y}) rotate(${45 * q}) scale(${s})`} opacity={p}>
    <rect x={-150} y={-150} width={300} height={300} rx={40} fill="#0b0d1a" opacity={0.5} transform={`rotate(${-45 * q})`} />
    <NeonPath d="M 0 -96 L 0 96 M -96 0 L 96 0" w={30} color={col} hot={q > 0.5} glow={0.6 + q * 0.6} />
  </g>;
};
/** respawn icon (game, cyan): loop arrows around a little figure */
const RespawnIcon: React.FC<{ f: number; x: number; y: number; at: number; out?: number }> = ({ f, x, y, at, out = Infinity }) => {
  const p = drawOn(f, at, 16), o = leaveO(f, out); if (p <= 0 || o <= 0) return null;
  return <g opacity={o}>
    <rect x={x - 140} y={y - 150} width={280} height={300} rx={26} fill="#0b0d1a" opacity={0.55 * p} />
    <g transform={`rotate(${(f - at) * 2.2} ${x} ${y})`}><RepeatIcon x={x} y={y} s={1.5} p={p} color={CYAN} /></g>
    <NeonPath d={`M ${x - 9} ${y - 34} a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0 M ${x} ${y - 25} L ${x} ${y + 6} M ${x - 16} ${y - 12} L ${x + 16} ${y - 12} M ${x} ${y + 6} L ${x - 10} ${y + 28} M ${x} ${y + 6} L ${x + 10} ${y + 28}`} w={5} color={CYAN} p={p} />
  </g>;
};
/** the one save file (real life, gold): a save-disk icon + a big "1" */
const SaveCard: React.FC<{ f: number; x: number; y: number; at: number; out?: number }> = ({ f, x, y, at, out = Infinity }) => {
  const p = drawOn(f, at, 16), o = leaveO(f, out); if (p <= 0 || o <= 0) return null;
  const glow = 0.5 + 0.5 * Math.sin((f - at) * 0.12);
  return <g opacity={o}>
    <rect x={x - 140} y={y - 150} width={280} height={300} rx={26} fill="#3a2a0c" opacity={0.75 * p} />
    <NeonPath d={`M ${x - 114} ${y - 124} L ${x + 114} ${y - 124} L ${x + 114} ${y + 124} L ${x - 114} ${y + 124} Z`} p={p} w={4} color={GOLD} glow={0.6 + glow * 0.4} />
    <NeonPath d={`M ${x - 64} ${y - 96} L ${x + 44} ${y - 96} L ${x + 64} ${y - 76} L ${x + 64} ${y - 6} L ${x - 64} ${y - 6} Z M ${x - 40} ${y - 96} L ${x - 40} ${y - 60} L ${x + 30} ${y - 60} L ${x + 30} ${y - 96}`} p={p} w={4} color={AMBER} />
    {p > 0.5 && <Digits x={x} y={y + 108} text="1" size={110} color={GOLD} anchor="middle" />}
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
/** cyan hologram puppet = the GAME version (respawns, bounces back): silhouette + bright rim, translucent */
const Ghost: React.FC<{ p: V3; h?: number; o?: number; f: number; pose?: Omit<Pose, "t">; lie?: number }> = ({ p, h = 2.5, o = 0.7, f, pose = { mood: "grin", arms: "up" }, lie = 0 }) => o <= 0.01 ? null : (
  <group position={p} rotation={[0, 0, lie * Math.PI / 2]}>
    <Panel p={[0, h * 0.5, 0]} s={[h * 512 / 768, h]} px={[256, 384]} face additive o={o} dep={Math.floor(f / 2)} draw={(c, W, H) => {
      drawPuppet(c, W, H, REMY, { ...pose, t: f });
      c.globalCompositeOperation = "source-in"; c.fillStyle = "rgba(95,227,255,0.85)"; c.fillRect(0, 0, W, H); c.globalCompositeOperation = "source-over";
    }} />
    <Halo p={[0, h * 0.55, -0.1]} r={h * 0.6} color={CYAN} o={0.35 * o} />
  </group>
);
/** cyan dotted "game logic" path (dots along pts, revealed with p) */
const GameArc: React.FC<{ pts: (s: number) => V3; p: number; n?: number; r?: number; f: number }> = ({ pts, p, n = 36, r = 0.32, f }) => (<>
  {Array.from({ length: n }, (_, i) => {
    const s = i / (n - 1); if (s > p) return null;
    const q = pts(s), tw = 0.75 + 0.25 * Math.sin(f * 0.25 - i * 0.6);
    return <group key={i}><Ball p={q} r={r * tw} color={CYAN} ink={0.0} />{i % 4 === 0 && <Halo p={q} r={r * 4} color={CYAN} o={0.45} />}</group>;
  })}
</>);
/** expanding impact ring (abstract, friendly): a flat torus that grows + fades */
const ImpactRing: React.FC<{ p: V3; u: number; at: number; color?: string; s?: number; rot?: V3 }> = ({ p, u, at, color = "#fff3d0", s = 1, rot = [0, 0, 0] }) => {
  const q = (u - at) / 16; if (q < 0 || q > 1) return null;
  const r = s * (0.4 + 2.2 * Easing.out(Easing.cubic)(q));
  return <group position={p} rotation={rot}>
    <mesh><torusGeometry args={[r, 0.06 * s, 8, 48]} /><meshBasicMaterial color={color} transparent opacity={1 - q} toneMapped={false} depthWrite={false} /></mesh>
    <Halo p={[0, 0, 0]} r={r * 1.2} color={color} o={0.55 * (1 - q)} />
  </group>;
};
/** belt-force arrows: small gold cones pointing into the seat (spread along a belt) */
const Cone: React.FC<{ p: V3; s: number; color: string }> = ({ p, s, color }) => s <= 0.01 ? null : (
  <mesh position={p} rotation={[-Math.PI / 2, 0, 0]} scale={[s, s, s]}><coneGeometry args={[0.09, 0.26, 12]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
);

// ---------------------------------------------------------------- worlds
const Street: React.FC<{ z?: number; w?: number; len?: number; y?: number; dash?: number; along?: "x" | "z" }> = ({ z = 0, w = 6, len = 160, y = 0, dash = 0, along = "x" }) => {
  return <group position={[along === "x" ? 0 : z, y, along === "x" ? z : 0]} rotation={[0, along === "x" ? 0 : Math.PI / 2, 0]}>
    <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[len, w]} /><meshLambertMaterial color={disp(DAY.asphalt)} /></mesh>
    {Array.from({ length: 24 }, (_, i) => <mesh key={i} position={[-len / 2 + ((i * 6 + dash) % len), 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.4, 0.16]} /><meshBasicMaterial color={disp("#fff6d8")} /></mesh>)}
    {[-1, 1].map((s) => <mesh key={s} position={[0, 0.06, s * (w / 2 + 0.9)]} receiveShadow><boxGeometry args={[len, 0.12, 1.8]} /><meshLambertMaterial color={disp("#e6dccb")} /></mesh>)}
  </group>;
};
/** the skyscraper roof above a sunny city (deck top y 0, street y -70) */
const ROOF_Y = -70;
const RoofWorld: React.FC<{ t: number; hero?: V3; warm?: number }> = ({ t, hero = [0, 0, 4.5], warm = 0 }) => (<>
  <DaySky fogNear={45} fogFar={200} warm={warm} sun={[70, 60, -150]} />
  <SunRig target={hero} />
  <Glb name="skyscraper_roof" line={2} />
  <DayGround base={DAY.grass} speck="#6fae52" y={ROOF_Y - 0.05} z={-60} />
  <Street y={ROOF_Y} z={12} w={9} len={240} />
  <Street y={ROOF_Y} z={-14} w={9} len={240} along="z" />
  {[[-26, 10, 2.4, 0.3], [26, -6, 2.8, 1.4], [-24, 40, 2.2, 2.2], [30, 34, 2.6, 0.9], [-40, -30, 3.2, 1.8], [44, -36, 3.0, 2.7], [-10, -60, 3.6, 0.5], [18, -70, 3.4, 1.1]].map(([x, z, s, r], i) =>
    <Glb key={i} name="city_block" p={[x, ROOF_Y, z]} rot={[0, r, 0]} s={s} line={2} />)}
  <Palms at={[[-8, ROOF_Y, 18], [9, ROOF_Y, 19], [16, ROOF_Y, 7], [-15, ROOF_Y, 6]]} s={1.4} />
  {[[-4, ROOF_Y, 12.2], [7, ROOF_Y, 11.2]].map(([x, y, z], i) => <Glb key={i} name="sports_car" p={[x + (i ? -1 : 1) * t * 1.5, y, z]} rot={[0, i ? Math.PI : 0, 0]} s={1.6} line={2} />)}
  <Clouds t={t} at={[[-40, 18, -90], [30, 26, -110], [60, 12, -60], [-70, 22, -40], [10, 30, -150]]} s={5} />
</>);
/** open sky high above the city (free fall / parachute); clouds stream upward past the jumper */
const SkyWorld: React.FC<{ t: number; rise: number }> = ({ t, rise }) => (<>
  <DaySky fogNear={60} fogFar={240} top="#3a86dc" horizon="#d4ecfb" sun={[60, 50, -150]} />
  <SunRig target={[0, 0, 0]} k={0.95} />
  <DayGround base={DAY.grass} speck="#6fae52" y={-120} z={-40} />
  {[-3, -2, -1, 0, 1, 2, 3].map((i) => <Glb key={i} name="city_block" p={[i * 26, -118, -40 - Math.abs(i) * 14]} rot={[0, i * 0.7, 0]} s={2.4} line={0} />)}
  {[[-14, -10, -18], [12, -4, -26], [-6, -16, -40], [18, -22, -12], [-20, -30, -8], [6, -36, -30], [24, -6, -50], [-28, 4, -46]].map(([x, y, z], i) => {
    const yy = ((y + rise + 60) % 70) - 45;
    return <Glb key={i} name="cloud_puff" p={[x, yy, z]} rot={[0, i, 0]} s={2.6 + (i % 3) * 0.8} line={0} />;
  })}
  {Array.from({ length: 16 }, (_, i) => { const yy = ((i * 2.3 + rise * 3) % 16) - 8; return <NeonBar key={i} p={[Math.sin(i * 7.1) * 5, yy, Math.cos(i * 3.3) * 3 - 2]} s={[0.03, 1.6, 0.03]} color="#ffffff" glow={0} o={0.55} />; })}
  {void t}
</>);

// ---------------------------------------------------------------- shot builder
type View = { world: React.ReactNode; hud?: React.ReactNode };
const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number, sub: number, us: number, ls: number): View => {
  const t = f / FPS;
  switch (id) {
    case "hook": {
      // sub 0 = CRANE + LAND: rises up past the parapet and settles on Remy at the roof edge (WHAT IF draws on)
      // sub 1 = PUSH-IN: from a wide side view of the whole tower (cyan game jump arc: roll + walk away) into Remy
      const JO = C("Jump off a", 70), RO = C("roll, and", 100), WA = C("walk away", 120), LT = C("Let's test that", 150);
      const R: V3 = [0, 0, 5.2];
      const arc = (s: number): V3 => [-s * 16, 1.3 + 5 * s - 76.3 * s * s, 5.6 + s * 10];
      const arcP = k(u, JO - 4, RO + 4, 0, 1, Easing.inOut(Easing.quad));
      const ghostO = k(u, WA - 6, WA + 6, 0, 1);
      const world = <>
        <RoofWorld t={t} hero={R} />
        <Hero p={R} look={REMY} pose={{ mood: u >= LT ? "grin" : sub ? "worry" : "smile", arms: u >= LT ? "point" : sub ? "chest" : "down", lookX: sub ? 0.5 : 0 }} f={f} rimO={0.4} />
        {sub ? <>
          <GameArc pts={arc} p={arcP} f={f} n={44} r={0.45} />
          {u > RO && <ImpactRing p={[-16, ROOF_Y + 0.3, 15.6]} u={u} at={RO + 4} color={CYAN} s={2.2} rot={[-Math.PI / 2, 0, 0]} />}
          <Ghost p={[-16 - k(u, WA, WA + 40, 0, 4), ROOF_Y, 15.6]} h={4.5} o={ghostO * 0.9} f={f} pose={{ mood: "grin", arms: "up", walk: u * 0.3, speed: 1 }} />
        </> : null}
        {sub ? <Move us={us} ls={ls} at={line({ pos: [36, -12, 92], look: [2, -26, 14], fov: 48 }, { pos: [9, 5.2, 24], look: [0, 1.3, 5.2], fov: 40 })} />
          : <Move us={us} ls={ls} at={line({ pos: [1.4, -1.6, 15.5], look: [0, 0.2, 5.2], fov: 44 }, { pos: [0.6, 3.0, 13.2], look: [0, 1.55, 5.2], fov: 44 })} />}
      </>;
      const wp = k(u, 0, 34, 0.42, 1, EASE.arrive);
      const hud = <>
        {!sub && <StrokeWord text="WHAT IF" x={540} y={565} h={125} p={wp} />}
        {!sub && <HudText f={u} x={540} y={415} size={56} color={AMBER} at={22}>#3</HudText>}
        {sub ? <TestTracker f={u} at={LT} active={-1} /> : null}
      </>;
      return { world, hud };
    }
    case "test1": { // TRACKING / TRUCK: the camera trucks sideways with Remy as he steps out of the stair hut and walks to the edge; cyan "shortcut" marker
      const IG = C("In the game,", 60);
      const e = shotE(us, ls);
      const x = -3.6 + 3.9 * e, z = -1.6 + 6.6 * e, R: V3 = [x, 0, z];
      const mk = k(u, IG - 2, IG + 12, 0, 1);
      const world = <>
        <RoofWorld t={t} hero={[0, 0, 2]} />
        <Hero p={R} look={REMY} pose={{ mood: "smile", arms: "down", walk: u * 0.32, speed: e < 0.97 ? 1 : 0 }} f={f} rimO={0.35} />
        {mk > 0 && <group position={[1.9, 0, 5.6]}>
          <Panel p={[0, 2.0 + 0.2 * Math.sin(f * 0.15), 0]} s={[1.6, 1.6]} px={[256, 256]} face o={mk} dep={Math.floor(f / 2)} draw={(c, W) => {
            c.clearRect(0, 0, W, W); c.strokeStyle = "#0b4a5c"; c.lineWidth = 30; c.lineCap = "round"; c.lineJoin = "round";
            for (let i = 0; i < 3; i++) { const yy = 50 + i * 60 + ((f * 2) % 60); c.globalAlpha = 1 - i * 0.25; c.beginPath(); c.moveTo(W * 0.25, yy); c.lineTo(W * 0.5, yy + 50); c.lineTo(W * 0.75, yy); c.stroke(); }
            c.strokeStyle = CYAN; c.lineWidth = 16;
            for (let i = 0; i < 3; i++) { const yy = 50 + i * 60 + ((f * 2) % 60); c.globalAlpha = 1 - i * 0.25; c.beginPath(); c.moveTo(W * 0.25, yy); c.lineTo(W * 0.5, yy + 50); c.lineTo(W * 0.75, yy); c.stroke(); }
          }} />
          <FloorPool p={[0, 0.02, 0]} r={1.2} color={CYAN} o={0.6 * mk} />
        </group>}
        <Move us={us} ls={ls} at={() => ({ pos: [x + 5.2, 3.0, z + 9.5], look: [x + 0.4, 1.5, z], fov: 46 })} />
      </>;
      const hud = <TestTracker f={u} at={4} active={0} out={len - 8} />;
      return { world, hud };
    }
    case "gravity": { // DOLLY ZOOM (vertigo): over Remy's shoulder down the facade to the street; the camera dollies in as the FOV widens
      const ES = C("every second", 40);
      const R: V3 = [0, 0, 5.3];
      const sec = Math.max(0, Math.floor((u - 6) / 22));
      const world = <>
        <RoofWorld t={t} hero={R} />
        <Hero p={R} look={REMY} pose={{ mood: "gulp", arms: "chest", nerv: 0.7, sweat: 0.4, lookX: 0.3 }} f={f} rimO={0.4} />
        <Move us={us} ls={ls} at={dollyZoom([0, 1.3, 5.6], [0.25, 0.72, -0.62], 15, 5.2, 26)} />
      </>;
      // a speed arrow beside Remy that gets longer with every second of falling (no numbers: the caption says it)
      const hud = <g>
        <Plate x={850} y={560} w={160} h={600} o={drawOn(u, 4, 10)} />
        {Array.from({ length: Math.min(5, sec + 1) }, (_, i) => <VArrow key={i} x={930} y0={600} y1={640 + (i + 1) * 95} color={i === Math.min(4, sec) ? GOLD : DIM} p={drawOn(u, 6 + i * 22, 8)} w={i === Math.min(4, sec) ? 10 : 5} />)}
        {void ES}
      </g>;
      return { world, hud };
    }
    case "fall": {
      // sub 0 = ORBIT: a slow arc around the belly-to-earth skydiver while clouds stream up; speed + seconds counters
      // sub 1 = LOW ANGLE (looking up): from below the jumper; gravity arrow vs air arrow grow equal -> terminal velocity
      const SD = C("a skydiver reaches", 70), TW = C("Around two hundred", 120), HA = C("as hard as", 70);
      const end = TW + 22;
      const spd = interpolate(u, [0, end], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
      const secs = interpolate(u, [0, end], [0, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const air = sub ? k(us, 4, Math.max(12, HA - (len - ls)), 0.35, 1, Easing.out(Easing.cubic)) : 0;
      const world = <>
        <SkyWorld t={t} rise={t * (1.5 + spd / 30)} />
        <group position={[0, 0.15 * Math.sin(f * 0.2), 0]}>
          <Panel p={[0, 0, 0]} s={[2.6 * 512 / 768, 2.6]} rot={[0, 0, Math.PI / 2]} px={[512, 768]} draw={(c, W, H) => drawPuppet(c, W, H, SKY, { mood: "grin", arms: "up", t: f })} />
          <Halo p={[0, 0, -0.4]} r={2.2} color="#ffffff" o={0.3} />
        </group>
        {sub ? <Move us={us} ls={ls} at={line({ pos: [0.5, -7.5, 6.5], look: [0, 0.2, 0], fov: 50 }, { pos: [-0.3, -6.2, 5.4], look: [0, 0.4, 0], fov: 50 })} />
          : <Move us={us} ls={ls} at={orbit([0, 0, 0], 8.2, 1.6, -0.45, 0.35, 44)} />}
      </>;
      const hud = <>
        <LiveCounter f={u} label="FALL SPEED" from={0} to={200} at={4} dur={end - 4} unit="KM/H" display={String(Math.round(spd)).padStart(3, "0")} />
        <LiveCounter f={u} x={722} label="SECONDS" from={0} to={12} at={4} dur={end - 4} digits={2} s={0.75} display={String(Math.floor(secs)).padStart(2, "0")} />
        {void SD}
        {sub ? <>
          <VArrow x={300} y0={860} y1={860 + 300} color={GOLD} p={drawOn(us, 2, 10)} w={11} />
          <VArrow x={780} y0={1160} y1={1160 - 300 * air} color={CREAM} p={drawOn(us, 4, 10)} w={11} />
          <HudText f={u} x={540} y={720} size={66} color={GOLD} at={HA + 4} spacing={2}>TERMINAL VELOCITY</HudText>
        </> : null}
      </>;
      return { world, hud };
    }
    case "chute": { // PULL BACK (reveal): from the jumper's harness back + down until the whole open canopy fills the top of frame
      const open = k(u, 0, 18, 0.15, 1, Easing.out(Easing.back(1.4)));
      const world = <>
        <SkyWorld t={t} rise={t * 1.2} />
        <group position={[0, -2.2, 0]} rotation={[0, 0, 0.04 * Math.sin(f * 0.07)]}>
          <group scale={[open, 0.4 + 0.6 * open, open]}><Glb name="parachute" line={2} /></group>
          <Person p={[0, 0, 0]} h={2.6} look={SKY} pose={{ mood: "smile", arms: "up", armK: 0.9 }} f={f} shadow={false} />
        </group>
        <Move us={us} ls={ls} at={line({ pos: [0.6, -0.4, 5.2], look: [0, -0.8, 0], fov: 46 }, { pos: [1.4, -3.2, 17.5], look: [0, 0.6, 0], fov: 44 })} />
      </>;
      const hud = <LiveCounter f={u} label="FALL SPEED" from={200} to={200} at={0} out={2} unit="KM/H" display="200" />;
      return { world, hud };
    }
    case "stairs": { // TRACKING / TRUCK: the camera trucks along the flight as Remy walks down the stairs, step by step
      const e = shotE(us, ls);
      const x = -4.6 + 6.6 * e;
      const stepH = (xx: number) => clamp(Math.ceil((3.0 - xx) / 0.6) / 12) * 3.0;
      const R: V3 = [x, x < -4.2 ? 3.0 : stepH(x), 0.1];
      const world = <>
        <SunRig target={[0, 1, 0]} />
        <DaySky fogNear={25} fogFar={120} />
        <Glb name="stairwell" line={2} />
        <SunPatch p={[-0.6, 3.0, 0.2]} s={[3, 2]} o={0.2} />
        <Hero p={R} look={REMY} pose={{ mood: "grin", arms: "down", walk: u * 0.35, speed: e < 0.98 ? 1 : 0, flip: true }} f={f} rimO={0.3} shadow={false} />
        <Move us={us} ls={ls} at={() => ({ pos: [x + 0.6, R[1] + 2.4, 9.5], look: [x + 0.3, R[1] + 1.3, 0], fov: 44 })} />
      </>;
      return { world };
    }
    case "test2": { // LOW HERO ANGLE: camera near the asphalt as the gold test car rolls toward the foam barrier; cyan game bounce arc
      const IG = C("In the game,", 40), CO = C("climb out,", 80);
      const cx = -14 + 11 * shotE(us, ls);
      const arcP = k(u, IG, CO, 0, 1, Easing.inOut(Easing.quad));
      const world = <>
        <DaySky fogNear={40} fogFar={190} />
        <SunRig target={[0, 0, 0]} />
        <DayGround base={DAY.grass} speck="#6fae52" y={-0.05} />
        <Street z={0} w={7} />
        <CityBackdrop z={-70} spread={140} />
        <Palms at={[[-12, 0, -8], [6, 0, -9], [16, 0, -7], [-20, 0, 7]]} s={1.3} />
        <Clouds t={t} at={[[-30, 26, -100], [20, 32, -120], [50, 22, -90]]} s={5} />
        {[0, 1, 2].map((i) => <Box key={i} p={[3.6, 0.6 + i * 1.2, 0]} s={[1.2, 1.15, 5.4]} color={i % 2 ? "#fff1dc" : CORAL} line={2} />)}
        <Glb name="sports_car" p={[cx, 0, 0.4]} s={1.5} line={2} blob={2} />
        <Hero p={[0.2, 0.12, -4.6]} look={REMY} pose={{ mood: "smile", arms: "chest" }} f={f} rimO={0.3} />
        <GameArc pts={(s) => [2.2 + s * 10, 1.4 + 8 * s - 7.8 * s * s, 0.4]} p={arcP} f={f} r={0.22} />
        <Move us={us} ls={ls} at={(e) => ({ pos: [cx - 3.5 + 1.5 * e, 0.6, 14 - 1.5 * e], look: [cx, 1.5, 0], fov: 48 })} />
      </>;
      const hud = <TestTracker f={u} at={4} active={1} out={len - 8} />;
      return { world, hud };
    }
    case "math": { // CRANE UP: the camera rises with the test car as it is lifted up the apartment facade to the 3rd-floor mark (= same hit)
      const FK = C("fifty kilometers an", 50), LF = C("like falling from", 100), TF = C("third floor", 130);
      const v = k(u, FK - 10, FK + 18, 0, 50, Easing.out(Easing.cubic));
      const FH = 4.3, lineO = k(u, TF - 4, TF + 8, 0, 1);
      const carY = k(u, LF - 2, LF + 22, 0, 3 * FH, Easing.inOut(Easing.cubic));
      const world = <>
        <DaySky fogNear={40} fogFar={190} />
        <SunRig target={[0, 3, 0]} />
        <DayGround base={DAY.grass} speck="#6fae52" y={-0.05} />
        <Street z={4} w={7} />
        <CityBackdrop z={-70} spread={150} />
        <Clouds t={t} at={[[-30, 30, -100], [26, 34, -120]]} s={5} />
        <group position={[0, 0, -3]}>
          <Box p={[0, 9, 0]} s={[9, 18, 5]} color="#f2c9a0" line={3} />
          {[1, 2, 3, 4].map((n) => <Box key={n} p={[0, n * FH, 2.56]} s={[9.1, 0.14, 0.1]} color={n === 3 ? GOLD : "#e2b58a"} line={1} />)}
          {[0, 1, 2, 3].map((r) => [-3, -1, 1, 3].map((cx) => <Box key={`${r}${cx}`} p={[cx, r * FH + 2.3, 2.52]} s={[1.3, 1.9, 0.06]} color="#4f86b8" line={1} />))}
          <Box p={[0, 1.1, 2.55]} s={[1.6, 2.2, 0.06]} color={CORAL} line={2} />
          {lineO > 0 && <NeonBar p={[0, 3 * FH, 2.7]} s={[9.6, 0.08, 0.08]} color={GOLD} glow={0.6} o={lineO} />}
          <Panel p={[-3.0, 3 * FH + 1.2, 2.8]} s={[1.4, 1.4]} px={[160, 160]} face o={lineO} dep={lineO > 0 ? 1 : 0} draw={(c, W) => {
            c.fillStyle = "#0b0d1a"; c.beginPath(); c.arc(W / 2, W / 2, W * 0.46, 0, 7); c.fill(); c.strokeStyle = GOLD; c.lineWidth = 8; c.stroke();
            c.fillStyle = GOLD; c.font = `900 96px ${WI_FONT}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("3", W / 2, W / 2 + 6);
          }} />
        </group>
        <group position={[0.8, carY, 4.2]}>
          <Glb name="sports_car" s={1.3} line={2} blob={carY < 0.3 ? 1.6 : 0} />
          {carY > 0.2 && <Cyl p={[0, 30, 0]} rt={0.04} h={58} color="#3a2a1a" line={1} />}
        </group>
        {carY > 0.5 && Array.from({ length: Math.floor(carY / 0.9) }, (_, i) => <Ball key={i} p={[0.8, 0.3 + i * 0.9, 4.2]} r={0.09} color={GOLD} ink={0} />)}
        <Move us={us} ls={ls} at={(e) => ({ pos: [0.8 - 1.2 * e, 2.4 + carY * 1.02, 15 + 6 * e], look: [0.6, 1.4 + carY, 3.6], fov: 46 })} />
      </>;
      const hud = <>
        <LiveCounter f={u} label="IMPACT SPEED" from={0} to={50} at={FK - 10} dur={28} unit="KM/H" display={String(Math.round(v)).padStart(3, "0")} />
        <Gauge f={u} x={860} y={500} r={96} v={v} at={FK - 12} />
      </>;
      return { world, hud };
    }
    case "energy": {
      // sub 0 = TOP-DOWN: straight down on two test lanes; the gold car runs twice as fast as the coral one; bars x2 -> x4
      // sub 1 = PUSH-IN (top-down, lowering): toward the "+" that turns on the spot into a gold "x"
      const FT = C("four times bigger", 120), IM = C("It multiplies it", 80);
      const e = clamp(u / Math.max(1, len));
      const zA = 6 - 10 * e, zB = 6 - 20 * e;
      const world = <>
        <DaySky fogNear={40} fogFar={190} />
        <SunRig target={[0, 0, 0]} dir={[6, 12, 3]} />
        <DayGround base={DAY.grass} speck="#6fae52" y={-0.05} z={0} />
        <Street z={0} w={9} len={120} along="z" />
        {[-14, 14].map((x) => <Palms key={x} at={[[x, 0, -10], [x, 0, 2], [x, 0, 14]]} s={1.2} />)}
        <group position={[-2.2, 0, zA]} rotation={[0, Math.PI / 2, 0]}><Glb name="toy_car" s={2.2} line={2} /></group>
        <group position={[2.2, 0, zB]} rotation={[0, Math.PI / 2, 0]}><Glb name="sports_car" s={1.1} line={2} /></group>
        {Array.from({ length: 5 }, (_, i) => <NeonBar key={i} p={[2.2 + (i - 2) * 0.35, 0.1, zB + 2.4 + i % 2 * 0.6]} s={[0.06, 0.04, 2.4]} color="#ffffff" glow={0} o={0.7} />)}
        <NeonBar p={[-2.2, 0.1, zA + 2.2]} s={[0.06, 0.04, 1.0]} color="#ffffff" glow={0} o={0.6} />
        {sub ? <Move us={us} ls={ls} at={line({ pos: [0, 30, 0.6], look: [0, 0, -2], fov: 50 }, { pos: [0, 22, 0.5], look: [0, 0, -3], fov: 50 })} />
          : <Move us={us} ls={ls} at={line({ pos: [0, 34, 0.6], look: [0, 0, 0], fov: 50 }, { pos: [0, 31, 0.6], look: [0, 0, -1.5], fov: 50 })} />}
      </>;
      const bo = sub ? 1 - clamp(us / 8) : arrive(u, 2, 12);
      const hud = <>
        {bo > 0 && <g opacity={bo}>
          <Plate x={50} y={330} w={980} h={470} o={1} />
          <CompareBars f={u} y={420} gap={200} bh={66} labelSize={44} valueSize={60} rows={[
            { label: "SPEED", fill: 0.5, value: "x2", at: 6 },
            { label: "CRASH ENERGY", fill: 1.0, value: "x4", color: CORAL, at: FT },
          ]} />
          {[420, 620].map((yy) => <path key={yy} d={`M ${70 + 880 * 0.25} ${yy - 8} L ${70 + 880 * 0.25} ${yy + 74}`} stroke={CREAM} strokeWidth={4} strokeDasharray="8 8" opacity={0.8} />)}
        </g>}
        {sub ? <PlusTimes f={us} x={540} y={760} at={2} turn={Math.max(6, IM - (len - ls))} /> : null}
      </>;
      return { world, hud };
    }
    case "belt": { // ORBIT: an arc around the crash-test sled (front three-quarter); it stops hard (abstract impact ring), the belt takes the stop (gold arrows spread)
      const TS = C("They spread the", 40), HC = C("hips and chest", 80), WS = C("the windshield", 110);
      const sz = k(u, 4, TS + 2, -2.2, 0, Easing.in(Easing.quad));
      const lean = u > TS ? 0.16 * Math.exp(-(u - TS) / 10) * Math.sin(((u - TS) / 14) * Math.PI) : 0;
      const spread = k(u, HC - 10, HC + 14, 0, 1, Easing.out(Easing.back(1.3)));
      const glow = 0.4 + 0.6 * spread;
      const world = <>
        <SunRig target={[0, 1, 0]} />
        <DaySky fogNear={30} fogFar={140} />
        <DayGround base={DAY.grass} speck="#6fae52" y={-0.06} />
        <Surface lit p={[0, 0, 4]} s={[30, 26]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#e4eaf1")} b={disp("#d6dee8")} unit={2.2} />
        <WindowWall z={-6} win={{ x: 0, y: 1.6, w: 11, h: 4.8 }} a="#eef3f8" kind="plain" />
        <CityBackdrop z={-90} spread={170} />
        {[-1, 1].map((s) => <Box key={s} p={[s * 1.3, 0.03, 0.8]} s={[0.16, 0.06, 9]} color={GOLD} line={1} />)}
        <group position={[0, 0, sz]}>
          <Glb name="car_seat" line={2} />
          <group position={[0, 0.62, 0.05]} rotation={[lean, 0, 0]}>
            <Glb name="crash_dummy" line={2} />
            <Box p={[0, 0.3, 0.33]} s={[0.84, 0.14, 0.05]} color="#2b3350" line={1} />
            <Box p={[-0.03, 0.72, 0.33]} s={[1.08, 0.14, 0.05]} rot={[0, 0, -0.85]} color="#2b3350" line={1} />
            <Halo p={[0, 0.3, 0.45]} r={0.7 * glow} color={GOLD} o={0.55 * spread} />
            <Halo p={[0, 0.85, 0.45]} r={0.8 * glow} color={GOLD} o={0.55 * spread} />
            {[-0.32, -0.16, 0, 0.16, 0.32].map((x, i) => <Cone key={`l${i}`} p={[x, 0.3, 0.66]} s={spread * 1.1} color={GOLD} />)}
            {[0, 1, 2, 3, 4].map((i) => <Cone key={`c${i}`} p={[-0.36 + i * 0.17, 1.12 - i * 0.2, 0.64]} s={spread * 1.1} color={GOLD} />)}
          </group>
          <group position={[0, 1.45, 1.75]} rotation={[-0.55, 0, 0]}>
            <mesh><planeGeometry args={[1.7, 0.9]} /><meshBasicMaterial color={disp("#bfe3f7")} transparent opacity={0.35} depthWrite={false} side={THREE.DoubleSide} /></mesh>
          </group>
        </group>
        <ImpactRing p={[0, 0.9, 2.1]} u={u} at={TS} s={0.8} />
        <Hero p={[3.0, 0.02, -2.2]} look={REMY} pose={{ mood: u > WS ? "grin" : "worry", arms: u > WS ? "up" : "chest" }} f={f} rimO={0.3} />
        <Move us={us} ls={ls} at={orbit([0, 1.3, 0.4], 8.0, 2.2, 0.95, 0.45, 40)} />
      </>;
      return { world };
    }
    case "test3":
    case "survive":
    case "zone": {
      // test3   = TRACKING: the camera walks with Remy along the school sidewalk; the cyan game ghost pops right back up
      // survive = PULL BACK (reveal): from Remy out to the whole street + school; survival bars (data, not caption words)
      // zone    = LOW ANGLE PUSH-IN: up at the round 30 sign while two kids cross on the zebra and the car waits
      const SZ = -15;
      const e = shotE(us, ls);
      const rx = id === "test3" ? -6 + 6 * e : 0;
      const IG = id === "test3" ? C("In the game,", 40) : 0, GB = id === "test3" ? C("get right back", 80) : 0;
      const AT = id === "survive" ? C("at thirty kilometers", 80) : 0, AF = id === "survive" ? C("At fifty, about", 150) : 0;
      const ghostLie = id === "test3" ? 1 - k(u, GB - 4, GB + 14, 0, 1, Easing.out(Easing.back(1.6))) : 0;
      const carX = id === "zone" ? -7 : id === "survive" ? -14 + 6 * e : 14 - 6 * e;
      const world = <>
        <DaySky fogNear={40} fogFar={190} />
        <SunRig target={[0, 0, -2]} />
        <DayGround base={DAY.grass} speck="#6fae52" y={-0.05} />
        <Glb name="school_building" p={[0, 0, SZ]} line={2} />
        <Street z={-4.6} w={6} />
        {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[3.4, 0.025, -6.9 + i * 0.95]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.6, 0.5]} /><meshBasicMaterial color={disp("#fffaf0")} /></mesh>)}
        <Glb name="speed_sign_30" p={[1.6, 0.12, -0.6]} line={2} blob={0.4} />
        <Palms at={[[-12, 0, -11], [12, 0, -10.5], [-18, 0, 2], [19, 0, 3]]} s={1.3} />
        <CityBackdrop z={-80} spread={160} />
        <Clouds t={t} at={[[-30, 28, -100], [24, 34, -120], [50, 24, -90]]} s={5} />
        <group position={[carX, 0, -3.2]}><Glb name="toy_car" s={2.0} line={2} blob={1.2} /></group>
        {id !== "zone" && <Hero p={[rx, 0.12, 0.6]} look={REMY} pose={{ mood: "smile", arms: id === "survive" ? "chest" : "down", walk: id === "test3" ? u * 0.32 : undefined, speed: id === "test3" && e < 0.97 ? 1 : 0 }} f={f} rimO={0.3} />}
        {id === "test3" && u > IG - 4 && <Ghost p={[rx - 2.6, 0.12, -0.6]} f={f} o={k(u, IG - 4, IG + 6, 0, 0.85)} lie={ghostLie} pose={{ mood: "grin", arms: ghostLie > 0.5 ? "down" : "up" }} />}
        {id === "zone" && [0, 1].map((i) => { const z = -8 + k(u, 6 + i * 10, len, 0, 6.5, Easing.linear); return <Hero key={i} p={[3.0 + i * 0.8, 0.12, z]} h={1.8} look={i ? KID2 : KID1} pose={{ mood: "grin", arms: "down", walk: u * 0.4 + i, speed: 1 }} f={f + i * 9} rimO={0.2} />; })}
        {id === "test3" && <Move us={us} ls={ls} at={() => ({ pos: [rx + 1.2, 2.8, 10.5], look: [rx - 1.0, 1.6, -1], fov: 46 })} />}
        {id === "survive" && <Move us={us} ls={ls} at={line({ pos: [0.6, 2.4, 6.2], look: [0, 1.6, 0.4], fov: 46 }, { pos: [1.0, 5.2, 19.5], look: [0, 3.4, -5], fov: 46 })} />}
        {id === "zone" && <Move us={us} ls={ls} at={line({ pos: [2.6, 0.5, 10.5], look: [2.2, 1.3, -0.6], fov: 50 }, { pos: [2.3, 0.8, 6.4], look: [2.1, 1.55, -0.6], fov: 50 })} />}
      </>;
      const hud = id === "test3" ? <TestTracker f={u} at={4} active={2} out={len - 8} />
        : id === "survive" ? <>
          <Plate x={50} y={330} w={980} h={480} o={arrive(u, AT - 8, 12)} />
          <CompareBars f={u} y={430} gap={210} bh={70} labelSize={44} valueSize={60} rows={[
            { label: "AT 30 KM/H", fill: 0.96, value: ">95%", at: AT },
            { label: "AT 50 KM/H", fill: 0.85, value: "~85%", color: CORAL, at: AF },
          ]} />
        </> : null;
      return { world, hud };
    }
    case "respawn": { // PUSH-IN: slow push toward Remy on the plaza; cyan ghost copies keep respawning beside him, the one save file glows gold
      const RS = C("you respawn", 70), OH = C("Out here,", 100);
      const world = <>
        <DaySky fogNear={30} fogFar={170} />
        <SunRig target={[0, 0, 0]} />
        <Surface lit p={[0, 0, -2]} s={[44, 44]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#ecdcc0")} b={disp("#e0cfb0")} unit={2.2} />
        <DayGround base={DAY.grass} speck="#6fae52" y={-0.05} />
        <CityBackdrop z={-130} spread={200} />
        <Palms at={[[-9, 0, -8], [9, 0, -10], [-14, 0, 2], [14, 0, 0]]} s={1.3} />
        <Clouds t={t} at={[[-30, 30, -110], [25, 34, -130]]} s={5} />
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.5, 0.05, 8, 96, Math.PI * 2 * drawOn(u, 0, 24)]} /><meshBasicMaterial color={N3.gold} toneMapped={false} /></mesh>
        <FloorPool p={[0, 0, 0]} r={2} color={N3.gold} o={0.12} />
        {[0, 1, 2].map((i) => { const ph = ((u - RS + i * 14) / 42) % 1; return u > RS - 6 ? <Ghost key={i} p={[-1.9 - i * 1.0, 0.02, -0.8 - i * 0.7]} f={f + i * 5} o={0.8 * Math.sin(clamp(ph) * Math.PI)} /> : null; })}
        <Hero p={[0, 0.02, 0]} look={REMY} pose={{ mood: u > OH ? "smile" : "deadpan", arms: u > OH ? "chest" : "down" }} f={f} rimO={0.4} />
        <Motes t={t} c={[0, 0.3, 0]} area={[4, 4, 3]} />
        <Move us={us} ls={ls} at={line({ pos: [1.2, 3.4, 13.5], look: [-0.6, 1.6, -0.5], fov: 46 }, { pos: [0.6, 3.0, 10.2], look: [-0.6, 1.55, -0.5], fov: 46 })} />
      </>;
      const hud = <>
        <RespawnIcon f={u} x={290} y={470} at={RS - 2} />
        <SaveCard f={u} x={790} y={470} at={OH + 2} />
      </>;
      return { world, hud };
    }
    default: { // ask - CRANE + LAND: drops gently from above and lands level on Remy at the roof edge; the question card (A/B/C)
      const R: V3 = [0, 0, 4.6];
      const world = <>
        <RoofWorld t={t} hero={R} warm={0.4} />
        <Hero p={R} look={REMY} pose={{ mood: "grin", arms: u > 26 ? "point" : "up", armK: u > 26 ? 1 : 0.8 }} f={f} rimO={0.45} />
        <Move us={us} ls={ls} at={line({ pos: [0.8, 9.5, 15.5], look: [0, 1.2, 4.6], fov: 46 }, { pos: [0.4, 3.0, 13.8], look: [0, 2.0, 4.6], fov: 46 })} />
      </>;
      const hud = <>
        <HudText f={u} x={540} y={420} size={60} color={CREAM} at={4} out={len + 30}>COMMENT</HudText>
        <HudText f={u} x={540} y={505} size={76} color={GOLD} at={8} out={len + 30}>A, B, C OR D</HudText>
        <ChoiceCards f={u} y={720} at={12} cw={440} ch={130} cards={[{ letter: "A", text: "ROOF JUMP" }, { letter: "B", text: "CAR CRASH" }, { letter: "C", text: "CAR BUMP" }, { letter: "D", text: "ALL OF THEM" }]} />
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
  id: "wi-gta-physics",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: N3.bg,
};
export default story;
