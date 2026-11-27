// WHAT IF #7 (GTA 6 WHAT IF series) "What If It Snowed in Vice City?" - bright DAYLIGHT Stick3D look (as approved for
// What If 1-6: big 3D worlds with sky, clouds, sun, haze; Remy = REMY3D puppet + beanie; Golden Neon only for HUD).
// Central motif: sunny Vice City (palms, beach, pastel Art-Deco-style hotels) that turns grey and wintry - light
// flurries, a cool thermometer HUD - and warms back up. Charming, never harmful: stunned iguanas drop SOFTLY onto the
// grass and climb back when the sun returns; manatees huddle in a power plant's warm outflow; Remy's snowman is a
// puddle by lunch. Snow scenes are cool-toned but stay bright and readable.
// Facts (RESEARCH.md): 19 Jan 1977 flurries in South Florida (~8-9:30 am, a trace, the only snow ever reported around
// Miami); cold-stunned iguanas (~5-10 C) fall and usually recover; manatees need water warmer than 20 C and gather at
// power plant warm-water outflows. No game art, no real newspaper names, no brands.
// Every beat is cue-driven (C(phrase, fallback)) so the picture follows words.json. Real shots with hard cuts; every
// PLACE change = shape morph; one NAMED camera move per shot (comment on each case), never reversing.
// Layout: HUD y 300-1350; figures stay above y 1430 (captions own 1440-1640).
// NO DOUBLE TEXT: on-screen words never repeat what the caption says at that moment (numbers, units, icons instead).
import React, { useMemo } from "react";
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
import { NEON, NeonDefs, StrokeWord, ChoiceCards, NeonPath, WI_FONT, drawOn, rnd } from "../../library/whatif/kit";
import { Box, Ball, Surface } from "../../library/stick3d/toon";
import { Person, V3, clamp, Grade } from "../../library/stick3d/kit";
import { REMY3D } from "../../src/tests/Stick3DTest";
import { Cam, Key, FaceGroup } from "../../library/stick3d/extra";
import { Glb } from "../../library/stick3d/glb";
import { DaySky, SunRig, DayGround, CityBackdrop, Palms, Clouds, WindowWall, SunPatch, disp, DAY } from "../../library/stick3d/daylight";
import { WaterSurface, Ripples } from "../../library/stick3d/water";
import { drawPuppet, Look, Pose } from "../../library/stick3d/puppet";
import { N3, Halo, Panel } from "../../library/stick3d/neon";

// ---------------------------------------------------------------- cast
const REMY: Look = { ...REMY3D, beanie: "#2e3658", beanieBand: N3.gold, pom: N3.amber };
/** Remy in flip flops: bare feet (skin-coloured "shoes"); the 3D soles + straps are drawn under them (FlipFlops) */
const REMY_FF: Look = { ...REMY, shoe: "#f3d2b3" };
const NEIGHBOUR: Look = { skin: "#c98e6b", body: "#7fd6c8", outfit: "shirt", hair: "bob", hairColor: "#3a2717", shoe: "#0b0d1a" };
const { gold: GOLD, coral: CORAL, amber: AMBER, text: CREAM, cyan: CYAN } = NEON;
const ICE = "#9fe3ff";

// ---------------------------------------------------------------- shots
type ShotDef = { id: string; cue: string; parent: string; sub: number };
const DEFS: ShotDef[] = [
  { id: "hook", cue: "What if it", parent: "hook", sub: 0 },
  { id: "hookb", cue: "Palm trees,", parent: "hook", sub: 1 },
  { id: "hookc", cue: "It sounds impossible.", parent: "hook", sub: 2 },
  { id: "date", cue: "January nineteenth,", parent: "date", sub: 0 },
  { id: "dateb", cue: "People in South", parent: "date", sub: 1 },
  { id: "trace", cue: "It was only", parent: "trace", sub: 0 },
  { id: "traceb", cue: "But it's still", parent: "trace", sub: 1 },
  { id: "imagine", cue: "Now imagine it", parent: "imagine", sub: 0 },
  { id: "imagineb", cue: "Remy steps outside", parent: "imagine", sub: 1 },
  { id: "iguana", cue: "First, the iguanas.", parent: "iguana", sub: 0 },
  { id: "iguanab", cue: "When it gets", parent: "iguana", sub: 1 },
  { id: "stunned", cue: "They're not dead.", parent: "stunned", sub: 0 },
  { id: "stunnedb", cue: "When the sun", parent: "stunned", sub: 1 },
  { id: "manatee", cue: "Then the manatees.", parent: "manatee", sub: 0 },
  { id: "manateeb", cue: "So they crowd", parent: "manatee", sub: 1 },
  { id: "shovel", cue: "And the people?", parent: "shovel", sub: 0 },
  { id: "snowman", cue: "Remy builds the", parent: "snowman", sub: 0 },
  { id: "puddle", cue: "By lunch,", parent: "puddle", sub: 0 },
  { id: "rare", cue: "So could it", parent: "rare", sub: 0 },
  { id: "rareb", cue: "It's not impossible.", parent: "rare", sub: 1 },
  { id: "ask", cue: "Would you rather", parent: "ask", sub: 0 },
];
const DEF: Record<string, ShotDef> = Object.fromEntries(DEFS.map((d) => [d.id, d]));
const SHOTS = DEFS.map((d) => ({ id: d.id, cue: d.cue }));
const TR_FRAMES = 14;
/** place of each scene (parent): a PLACE change = shape-morph transition, everything else = hard cut */
const PLACE: Record<string, string> = {
  hook: "beach", date: "street", trace: "street", imagine: "street", iguana: "park", stunned: "park",
  manatee: "bay", shovel: "store", snowman: "beach", puddle: "beach", rare: "beach", ask: "beach",
};
/** background colour of each scene = the flood colour of the morph INTO it */
const BG: Record<string, string> = {
  hook: "#cfe9fb", date: "#e6ecf3", trace: "#e6ecf3", imagine: "#e6ecf3", iguana: "#e8eef4", stunned: "#e8eef4",
  manatee: "#dfeaf2", shovel: "#f4ead8", snowman: "#eef3f8", puddle: "#eef3f8", rare: "#cfe9fb", ask: "#cfe9fb",
};
/** key object of the OUTGOING shot that becomes the transition shape (screen rect, radius) */
const KEY_DEF = { cx: 540, cy: 900, w: 380, h: 380, r: 190 };
const KEY_OBJ: Record<string, typeof KEY_DEF> = {
  hookc: { cx: 540, cy: 470, w: 156, h: 156, r: 78 },                 // the snowflake tile
  imagineb: { cx: 540, cy: 430, w: 560, h: 170, r: 40 },              // the thermometer plate
  stunnedb: { cx: 540, cy: 470, w: 156, h: 156, r: 78 },              // the sun tile
  manateeb: { cx: 540, cy: 430, w: 560, h: 170, r: 40 },              // the thermometer plate
  shovel: { cx: 540, cy: 470, w: 156, h: 156, r: 78 },                // the shovel tile
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
/** hex colour mix (display colours) */
const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), q = clamp(t);
  const ch = (s: number) => Math.round(((pa >> s) & 255) + ((((pb >> s) & 255) - ((pa >> s) & 255)) * q));
  return "#" + [16, 8, 0].map((s) => ch(s).toString(16).padStart(2, "0")).join("");
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
/** a live number (changes every frame, so no word-by-word build): same ink-outlined style as HudText */
const LiveNum: React.FC<{ x: number; y: number; size: number; color?: string; children: string; anchor?: "start" | "middle" | "end" }> = ({ x, y, size, color = GOLD, children, anchor = "start" }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={WI_FONT} fontWeight={900} fontSize={size} fill={color} stroke="#0b0d1a" strokeWidth={size * 0.12} paintOrder="stroke" letterSpacing={2}>{children}</text>
);
const clockText = (mins: number) => { const m = Math.round(mins); const h = Math.floor(m / 60), mm = m % 60; return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, "0")}`; };

// ---------------------------------------------------------------- HUD pieces (icons, numbers - never caption words)
const flakePath = (R: number) => Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * Math.PI * 2, cx = Math.sin(a), cy = -Math.cos(a), b = 0.62 * R, v = 0.26 * R;
  const l = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  const side = (s: number) => { const aa = a + s * 0.75; return l(cx * b + Math.sin(aa) * v, cy * b - Math.cos(aa) * v); };
  return `M 0 0 L ${l(cx * R, cy * R)} M ${l(cx * b, cy * b)} L ${side(1)} M ${l(cx * b, cy * b)} L ${side(-1)}`;
}).join(" ");
const sunPath = "M 0 -18 A 18 18 0 1 1 -0.1 -18 Z " + Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `M ${(Math.sin(a) * 28).toFixed(1)} ${(-Math.cos(a) * 28).toFixed(1)} L ${(Math.sin(a) * 42).toFixed(1)} ${(-Math.cos(a) * 42).toFixed(1)}`; }).join(" ");
/** line icons (centred, ~90 px) */
const ICON: Record<string, string> = {
  flake: flakePath(42),
  sun: sunPath,
  clock: "M 0 -38 A 38 38 0 1 1 -0.1 -38 Z M 0 -22 L 0 0 L 16 10",
  heart: "M 0 32 C -54 0 -34 -40 0 -16 C 34 -40 54 0 0 32 Z",
  pulse: "M -44 2 L -18 2 L -10 -16 L 2 18 L 10 2 L 44 2",
  shovel: "M 0 -44 L 0 8 M -12 -44 L 12 -44 M -20 8 L 20 8 L 16 36 Q 0 46 -16 36 Z",
  star: "M 0 -42 L 12 -14 L 42 -12 L 18 8 L 26 38 L 0 22 L -26 38 L -18 8 L -42 -12 L -12 -14 Z",
  wave: "M -42 18 Q -31 8 -21 18 T 0 18 T 21 18 T 42 18 M -42 34 Q -31 24 -21 34 T 0 34 T 21 34 T 42 34 M -14 4 Q -20 -8 -14 -20 Q -8 -32 -14 -44 M 14 4 Q 8 -8 14 -20 Q 20 -32 14 -44",
};
/** round icon tile; `strike` draws a red line through it */
const IconTile: React.FC<{ f: number; x: number; y: number; at: number; kind: string; color?: string; r?: number; out?: number; spin?: number }> = ({ f, x, y, at, kind, color = GOLD, r = 78, out = Infinity, spin = 0 }) => {
  const p = drawOn(f, at, 12) * leaveO(f, out); if (p <= 0) return null;
  const cool = color === CYAN || color === ICE;
  return <g transform={`translate(${x} ${y - (1 - p) * 16})`} opacity={p}>
    <circle r={r} fill={cool ? "#0b3a46" : "#3a2a0c"} opacity={0.8} />
    <circle r={r} fill="none" stroke={color} strokeWidth={4} opacity={0.9} />
    <g transform={`scale(${r / 78}) rotate(${spin})`}><NeonPath d={ICON[kind]} w={5} color={color} hot /></g>
  </g>;
};
/** THE COLD MOTIF: thermometer readout - a glass tube with a fill that sinks/rises (cyan when cold, coral when warm),
 *  optional threshold mark (e.g. 20 C), big value on the right */
const Thermo: React.FC<{ f: number; y: number; at: number; value: number; label?: string; out?: number; mark?: number; markAt?: number; w?: number }> =
  ({ f, y, at, value, label, out = Infinity, mark, markAt = 0, w = 560 }) => {
    const o = drawOn(f, at, 12) * leaveO(f, out); if (o <= 0) return null;
    const x0 = 540 - w / 2, tx = x0 + 78, top = y - 64, bot = y + 40, lvl = (v: number) => bot - clamp((v + 5) / 40) * (bot - top);
    const col = mixHex(CYAN, CORAL, clamp((value - 8) / 16));
    return <g opacity={o}>
      <Plate x={x0} y={y - 85} w={w} h={170} o={1} r={40} />
      <rect x={tx - 11} y={top - 6} width={22} height={bot - top + 12} rx={11} fill="#0b0d1a" opacity={0.6} stroke={CREAM} strokeWidth={3} />
      <rect x={tx - 6} y={lvl(value)} width={12} height={Math.max(0, bot + 6 - lvl(value))} rx={6} fill={col} />
      <circle cx={tx} cy={bot + 22} r={20} fill={col} stroke={CREAM} strokeWidth={3} />
      {mark !== undefined && f >= markAt && <g opacity={drawOn(f, markAt, 10)}>
        <line x1={tx - 22} x2={tx + 22} y1={lvl(mark)} y2={lvl(mark)} stroke={GOLD} strokeWidth={5} />
      </g>}
      <LiveNum x={x0 + 150} y={y + 30} size={label && label.length > 6 ? 78 : 92} color={mixHex("#bfeeff", GOLD, clamp((value - 8) / 14))}>{label ?? `${Math.round(value)} °C`}</LiveNum>
    </g>;
  };
/** clock readout (icon + h:mm) */
const ClockRead: React.FC<{ f: number; y: number; at: number; mins: number; out?: number; sun?: boolean }> = ({ f, y, at, mins, out = Infinity, sun }) => {
  const o = drawOn(f, at, 12) * leaveO(f, out); if (o <= 0) return null;
  const a = ((mins % 720) / 720) * 360, m = ((mins % 60) / 60) * 360;
  return <g opacity={o}>
    <Plate x={250} y={y - 85} w={580} h={170} o={1} r={40} />
    <g transform={`translate(340 ${y})`}>
      <NeonPath d="M 0 -40 A 40 40 0 1 1 -0.1 -40 Z" w={5} color={GOLD} hot />
      <g transform={`rotate(${a})`}><NeonPath d="M 0 0 L 0 -22" w={6} color={GOLD} hot /></g>
      <g transform={`rotate(${m})`}><NeonPath d="M 0 0 L 0 -32" w={4} color={AMBER} /></g>
    </g>
    <LiveNum x={420} y={y + 32} size={92}>{clockText(mins)}</LiveNum>
    {sun && <g transform={`translate(760 ${y}) scale(0.8)`}><NeonPath d={ICON.sun} w={5} color={AMBER} hot /></g>}
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
const Hero: React.FC<{ p: V3; look: Look; pose: Omit<Pose, "t">; f: number; h?: number; shadow?: boolean; rimO?: number; shO?: number }> = ({ p, look, pose, f, h = 2.5, shadow = true, rimO = 0.3, shO = 0.55 }) => (<>
  <Halo p={[p[0], p[1] + h * 0.62, p[2] - 0.25]} r={h * 0.72} color="#ffffff" o={rimO * 0.6} />
  {shadow ? <DropShadow p={p} h={h} look={look} pose={pose} f={f} o={shO} /> : null}
  <Person p={p} h={h} look={look} pose={pose} f={f} shadow={shadow} sy={p[1]} />
</>);
/** coral flip-flop soles + gold toe straps under the puppet's bare feet (turn with the billboard) */
const FlipFlops: React.FC<{ p: V3; h?: number }> = ({ p, h = 2.5 }) => (
  <FaceGroup p={p}>
    {[-0.043, 0.077].map((x, i) => <group key={i} position={[x * h, 0, 0.05]}>
      <Box p={[0, 0.02, 0.04]} s={[0.24 * h / 2.5, 0.04, 0.4 * h / 2.5]} color={disp(CORAL)} line={1.5} />
      <Box p={[0, 0.07, 0.0]} s={[0.2 * h / 2.5, 0.03, 0.03]} color={disp(GOLD)} line={1} />
    </group>)}
  </FaceGroup>
);
/** white breath puffs from Remy's mouth (cycles every 1.4 s after `at`) */
const Breath: React.FC<{ p: V3; f: number; at: number; h?: number; side?: number }> = ({ p, f, at, h = 2.5, side = 1 }) => {
  if (f < at) return null;
  return <>{[0, 1, 2].map((i) => {
    const age = (f - at - i * 14 + 420) % 42; if (f - at < i * 14) return null;
    const q = age / 42, o = Math.sin(q * Math.PI) * 0.75;
    return <Halo key={i} p={[p[0] + side * (0.18 + q * 0.7), p[1] + h * 0.53 + q * 0.5, p[2] + 0.25]} r={0.18 + q * 0.42} color="#f4fbff" o={o} />;
  })}</>;
};
/** light FLURRIES: soft white flakes drifting down through a box around `c` (deterministic) */
let flakeT: THREE.CanvasTexture | null = null;
const flakeTex = () => {
  if (flakeT) return flakeT;
  const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 30); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.55, "rgba(255,255,255,1)"); r.addColorStop(0.72, "rgba(205,225,245,.9)"); r.addColorStop(1, "rgba(160,190,225,0)");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64); flakeT = new THREE.CanvasTexture(c); flakeT.colorSpace = THREE.SRGBColorSpace; return flakeT;
};
const Flurries: React.FC<{ t: number; c: V3; area: V3; n?: number; o?: number; size?: number }> = ({ t, c, area, n = 90, o = 1, size = 0.2 }) => {
  if (n <= 0 || o <= 0.01) return null;
  const tex = flakeTex();
  return <>{Array.from({ length: n }, (_, i) => {
    const r1 = rnd(i * 3 + 1), r2 = rnd(i * 3 + 2), r3 = rnd(i * 3 + 3);
    const q = (t * (0.09 + r3 * 0.07) + r1) % 1;
    const x = c[0] + (r2 - 0.5) * area[0] + Math.sin(t * 0.9 + i * 1.3) * 0.25;
    const z0 = c[2] - area[2] / 2, z1 = c[2] + Math.min(area[2] / 2, 2.5); // never right in front of the lens
    const z = z0 + rnd(i * 7 + 5) * (z1 - z0);
    const s = size * (0.6 + r3 * 0.8);
    return <sprite key={i} position={[x, c[1] + area[1] * (1 - q), z]} scale={[s, s, 1]}>
      <spriteMaterial map={tex} color="#ffffff" transparent opacity={o * Math.min(1, q * 8, (1 - q) * 8)} depthWrite={false} toneMapped={false} />
    </sprite>;
  })}</>;
};
/** patchy snow dusting on the ground (soft white blotches) */
let snowT: THREE.CanvasTexture | null = null;
const snowTex = () => {
  if (snowT) return snowT;
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d")!;
  for (let i = 0; i < 260; i++) {
    const x = rnd(i * 5 + 1) * 256, y = rnd(i * 5 + 2) * 256, r = 6 + rnd(i * 5 + 3) * 22;
    for (const dx of [-256, 0, 256]) for (const dy of [-256, 0, 256]) {
      const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r); gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
    }
  }
  snowT = new THREE.CanvasTexture(c); snowT.wrapS = snowT.wrapT = THREE.RepeatWrapping; snowT.colorSpace = THREE.SRGBColorSpace; return snowT;
};
const SnowCover: React.FC<{ p: V3; s: [number, number]; o: number; rep?: number }> = ({ p, s, o, rep = 6 }) => {
  const tex = useMemo(() => { const t = snowTex().clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }, []);
  tex.repeat.set(rep, rep * s[1] / s[0]);
  if (o <= 0.01) return null;
  return <>
    <mesh position={[p[0], p[1] + 0.02, p[2]]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={s} /><meshLambertMaterial color={disp("#ffffff")} transparent opacity={o * 0.35} depthWrite={false} /></mesh>
    <mesh position={[p[0], p[1] + 0.03, p[2]]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={s} /><meshLambertMaterial map={tex} color={disp("#ffffff")} transparent opacity={o} depthWrite={false} /></mesh>
  </>;
};
/** sparkle ring of frost around a point (stiffening iguanas) */
const Frost: React.FC<{ p: V3; o: number; f: number; r?: number }> = ({ p, o, f, r = 0.5 }) => o <= 0.01 ? null : <>
  {Array.from({ length: 6 }, (_, i) => { const a = i * 1.05 + f * 0.03; return <Halo key={i} p={[p[0] + Math.cos(a) * r, p[1] + 0.15 + Math.sin(a * 1.3) * 0.15, p[2] + Math.sin(a) * r * 0.6]} r={0.09 + 0.04 * Math.sin(f * 0.2 + i)} color={ICE} o={o * 0.9} />; })}
</>;

// ---------------------------------------------------------------- the cold (sky, sun, haze move from sunny to wintry)
const skyCol = (cold: number) => ({ top: mixHex(DAY.skyTop, "#8ea6c4", cold), horizon: mixHex(DAY.skyHorizon, "#e3eaf2", cold), haze: mixHex(DAY.haze, "#e1e8f0", cold) });
const ColdSky: React.FC<{ cold: number; fogNear?: number; fogFar?: number; target: V3; t: number; clouds?: V3[] }> = ({ cold, fogNear = 40, fogFar = 190, target, t, clouds }) => {
  const q = Math.round(clamp(cold) * 20) / 20, s = skyCol(q);
  const base: V3[] = clouds ?? [[-30, 28, -100], [24, 34, -120], [50, 24, -90], [-60, 22, -70]];
  const extra: V3[] = [[-12, 20, -80], [10, 18, -70], [36, 21, -95], [-44, 19, -95], [0, 23, -110]];
  return <>
    <DaySky top={s.top} horizon={s.horizon} haze={s.haze} fogNear={fogNear * (1 - 0.3 * q)} fogFar={fogFar * (1 - 0.25 * q)} />
    <SunRig target={target} k={1 - 0.38 * q} fill={1 + 0.08 * q} />
    <Clouds t={t} at={base} s={5} />
    {q > 0.2 && <Clouds t={t} at={extra.slice(0, Math.round(q * 5))} s={6} />}
  </>;
};
type WorldP = { t: number; cold: number; snow?: number; hero?: V3 };

/** sunny Vice City BEACH: sand, sea (z < -14) with a distant skyline across the bay, palms, umbrella, pastel hotels */
const BeachWorld: React.FC<WorldP & { umbrella?: boolean }> = ({ t, cold, snow = 0, hero = [0, 0, 0.6], umbrella = true }) => (<>
  <ColdSky cold={cold} target={hero} t={t} />
  <DayGround base={mixHex(DAY.sand, "#e9dccb", cold * 0.6)} speck="#c99a62" y={-0.05} z={-40} />
  <WaterSurface t={t} p={[0, 0.0, -64]} s={[400, 100]} color={mixHex("#3fb6d8", "#6fa3b8", cold)} o={0.9} />
  <mesh position={[0, 0.03, -14]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[400, 0.7]} /><meshBasicMaterial color={disp("#ffffff")} transparent opacity={0.55} depthWrite={false} /></mesh>
  <SnowCover p={[0, -0.05, -2]} s={[60, 24]} o={snow} rep={10} />
  <CityBackdrop z={-118} spread={200} />
  <Glb name="deco_hotel_pink" p={[-15, 0, 1]} rot={[0, Math.PI / 2, 0]} s={1.1} line={2} />
  <Glb name="deco_hotel_mint" p={[-15.5, 0, -9]} rot={[0, Math.PI / 2, 0]} s={1.0} line={2} />
  <Glb name="deco_hotel_mint" p={[15, 0, 2]} rot={[0, -Math.PI / 2, 0]} s={1.1} line={2} />
  <Glb name="deco_hotel_pink" p={[15.5, 0, -8]} rot={[0, -Math.PI / 2, 0]} s={1.0} line={2} />
  <Palms at={[[-6.5, 0, -4], [7.5, 0, -3], [-10, 0, 3], [10.5, 0, 4], [-3.5, 0, -10], [5, 0, -11]]} s={1.25} />
  {umbrella && <Glb name="beach_umbrella" p={[3.2, 0, -2.2]} s={1.3} line={2} blob={1.2} />}
</>);
/** Vice City STREET: sidewalk where Remy stands (z ~0), asphalt street at z -4.5, pastel Art-Deco-style hotels behind */
const StreetWorld: React.FC<WorldP & { car?: boolean; table?: boolean }> = ({ t, cold, snow = 0, hero = [0, 0, 0.6], car = true, table = false }) => (<>
  <ColdSky cold={cold} target={hero} t={t} />
  <DayGround base={DAY.grass} speck="#6fae52" y={-0.05} z={-40} />
  <Surface lit p={[0, 0.01, 0.5]} s={[40, 6]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp(mixHex("#efe2c8", "#f6f9fd", snow))} b={disp(mixHex("#e4d4b4", "#dfe8f2", snow))} unit={1.6} />
  <mesh position={[0, 0.012, -4.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[160, 7]} /><meshLambertMaterial color={disp(mixHex(DAY.asphalt, "#c3cad4", snow * 0.85))} /></mesh>
  {Array.from({ length: 24 }, (_, i) => <mesh key={i} position={[-70 + i * 6, 0.02, -4.5]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.4, 0.16]} /><meshBasicMaterial color={disp("#fff6d8")} /></mesh>)}
  <Surface lit p={[0, 0.02, -9.4]} s={[60, 2.8]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#efe2c8")} b={disp("#e4d4b4")} unit={1.6} />
  <SnowCover p={[0, 0.0, -3]} s={[40, 16]} o={snow} rep={8} />
  <Glb name="deco_hotel_pink" p={[-5, 0, -13.5]} line={2} />
  <Glb name="deco_hotel_mint" p={[5, 0, -13.5]} line={2} />
  <Glb name="deco_hotel_mint" p={[-14.5, 0, -14]} s={0.95} line={2} />
  <Glb name="deco_hotel_pink" p={[14.5, 0, -14]} s={0.95} line={2} />
  <CityBackdrop z={-70} spread={150} />
  <Palms at={[[-9.8, 0, -10], [0, 0, -10.2], [9.8, 0, -10], [-7, 0, 2.6], [7.5, 0, 2.8]]} s={1.15} />
  {car && <Glb name="sports_car" p={[3.4, 0, -4.4]} rot={[0, -0.15, 0]} s={1.6} line={2} blob={1.6} />}
  {table && <Glb name="picnic_table" p={[0, 0, -0.4]} line={2} blob={1.6} fallback={<Box p={[0, 0.9, -0.4]} s={[2.6, 0.12, 0.9]} color="#c98a4b" line={2} />} />}
</>);
/** PARK lawn with the hero palm at HP (crown at HP + (1.5, 6, 0)), more palms, a bench, the city in the haze */
const HP: V3 = [0, 0, -1.2];
const ParkWorld: React.FC<WorldP> = ({ t, cold, snow = 0, hero = [0, 0, 0.6] }) => (<>
  <ColdSky cold={cold} target={hero} t={t} />
  <DayGround base={mixHex(DAY.grass, "#a9c79b", cold * 0.5)} speck="#6fae52" y={-0.05} z={-40} />
  <SnowCover p={[0, -0.05, -3]} s={[50, 30]} o={snow} rep={10} />
  <Glb name="palm_tree_day" p={HP} s={1.0} line={2} blob={1.4} />
  <Palms at={[[-6, 0, -6], [7.5, 0, -7], [-10, 0, 1], [11, 0, 0], [-3, 0, -14], [5, 0, -16]]} s={1.25} />
  <Glb name="picnic_table" p={[-4.2, 0, -2.6]} rot={[0, 0.4, 0]} line={2} blob={1.4} />
  <CityBackdrop z={-80} spread={160} />
</>);
/** BAY: land with the power plant behind a seawall (z -9), water (y -0.3) in front, sandy seabed under it */
const PLANT: V3 = [0, 0, -14], WY = -0.3, OUT: V3 = [0, WY, -8.6];
const BayWorld: React.FC<WorldP & { warm?: number }> = ({ t, cold, hero = [0, 0, 0], warm = 0 }) => (<>
  <ColdSky cold={cold} target={hero} t={t} fogNear={50} fogFar={220} />
  <DayGround base="#d9c79c" speck="#c2ab7a" y={-2.2} z={0} />
  <mesh position={[0, -0.5, -39]} receiveShadow><boxGeometry args={[260, 1.0, 60]} /><meshLambertMaterial color={disp("#cfc8b8")} /></mesh>
  <mesh position={[0, 0.01, -40]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[260, 58]} /><meshLambertMaterial color={disp(mixHex(DAY.grass, "#a9c79b", cold * 0.5))} /></mesh>
  <WaterSurface t={t} p={[0, WY, 40]} s={[400, 97]} color={mixHex("#3fb6d8", "#4aa9cf", cold)} o={0.5} glint={warm > 0 ? 0.1 : 0.2} />
  <Glb name="power_plant" p={PLANT} line={2} fallback={<Box p={[PLANT[0], 2.4, PLANT[2]]} s={[9, 4.8, 5]} color={disp("#efe6d6")} line={2} />} />
  {/* warm-water plume at the outflow: coral/amber glow spreading on the water + steam puffs */}
  {warm > 0.01 && <WarmPlume t={t} o={warm} />}
  {/* steam from the stacks (always - the plant is running) */}
  {[-4.0, -1.2].map((x, j) => [0, 1, 2, 3].map((i) => { const q = ((t * 0.18 + i / 4 + j * 0.13) % 1); return <Halo key={j + "-" + i} p={[x + q * 3.5, 14.2 + q * 5, PLANT[2] - 3.6]} r={1.0 + q * 2.6} color="#ffffff" o={0.5 * Math.sin(q * Math.PI)} />; }))}
  <Palms at={[[-12, 0, -11], [11, 0, -11], [-20, 0, -13], [21, 0, -12]]} s={1.25} />
  <CityBackdrop z={-90} spread={180} />
</>);
let plumeT: THREE.CanvasTexture | null = null;
const plumeTex = () => {
  if (plumeT) return plumeT;
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 40, 4, 64, 64, 64); r.addColorStop(0, "rgba(255,180,110,1)"); r.addColorStop(0.5, "rgba(255,150,90,.45)"); r.addColorStop(1, "rgba(255,140,80,0)");
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); plumeT = new THREE.CanvasTexture(c); return plumeT;
};
const WarmPlume: React.FC<{ t: number; o: number }> = ({ t, o }) => (<>
  <mesh position={[OUT[0], WY + 0.05, OUT[2] + 5.4]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={5}><planeGeometry args={[12, 10.8]} /><meshBasicMaterial map={plumeTex()} color={disp("#ffb27a")} transparent opacity={0.7 * o} depthWrite={false} toneMapped={false} /></mesh>
  <Ripples p={[OUT[0], WY, OUT[2] + 0.8]} t={t} n={3} r={2.6} o={0.45 * o} period={2.2} />
  {Array.from({ length: 7 }, (_, i) => { const q = ((t * 0.22 + i / 7) % 1); return <Halo key={i} p={[OUT[0] + (rnd(i) - 0.5) * 5 + q * 0.6, WY + 0.2 + q * 1.8, OUT[2] + 1 + rnd(i + 9) * 4]} r={0.5 + q * 0.9} color="#ffffff" o={0.45 * o * Math.sin(q * Math.PI)} />; })}
</>);
/** cute MANATEE (Blender model) gently bobbing just under the water line */
const Manatee: React.FC<{ p: V3; f: number; rot?: number; s?: number; i?: number }> = ({ p, f, rot = 0, s = 1, i = 0 }) => (
  <Glb name="manatee" p={[p[0], p[1] + 0.06 * Math.sin(f * 0.05 + i * 1.7), p[2]]} rot={[0, rot, 0.04 * Math.sin(f * 0.04 + i)]} s={s} line={1.5}
    fallback={<Ball p={[p[0], p[1], p[2]]} r={0.55 * s} color={disp("#8f989c")} />} />
);
/** bright beach-store interior: tiles, window to the snowy street, the shelf (empty slot at the centre of row 2) */
const SHELF: V3 = [0, 0, -2.4];
const StoreWorld: React.FC<{ t: number; cold: number }> = ({ t, cold }) => (<>
  <ColdSky cold={cold} target={[0, 1.5, -1.5]} t={t} fogNear={30} fogFar={160} />
  <DayGround base={DAY.grass} speck="#6fae52" y={-0.4} z={-60} />
  <SnowCover p={[0, -0.38, -30]} s={[120, 50]} o={0.5} rep={12} />
  <Glb name="deco_hotel_mint" p={[-9, -0.4, -22]} line={2} />
  <CityBackdrop z={-60} spread={120} />
  <Flurries t={t} c={[-5, 0, -8]} area={[10, 6, 4]} n={50} size={0.16} />
  <Surface lit p={[0, 0.01, 0]} s={[24, 18]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#eef2f6")} b={disp("#e2e8ef")} unit={1.2} />
  <WindowWall z={-3.2} W={30} H={9} win={{ x: -5.6, y: 0.9, w: 4.6, h: 3.2 }} a="#f6efe2" kind="plain" />
  <SunPatch p={[-3, 0, 0]} s={[5, 3]} o={0.12} />
  <Glb name="store_shelf" p={SHELF} line={2} fallback={<Box p={[0, 1.25, SHELF[2]]} s={[4.4, 2.5, 0.8]} color={disp("#f4ead8")} line={2} />} />
  <Glb name="store_shelf" p={[5.2, 0, SHELF[2]]} line={2} />
</>);

// ---------------------------------------------------------------- props drawn in code
/** desk-pad calendar page on the table: JAN / 19 / 1977 (flat, faces up) + a folded newspaper (no name, only lines) */
const TABLE_TOP = 1.06;
const Calendar: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <Box p={[0, 0.025, 0]} s={[1.1, 0.05, 1.2]} color={disp("#c9a26b")} line={1.5} />
    <Panel p={[0, 0.056, 0]} s={[1.0, 1.1]} rot={[-Math.PI / 2, 0, 0]} px={[400, 440]} dep={1} draw={(c, W, H) => {
      c.fillStyle = "#fffaf0"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#ff5a4e"; c.fillRect(0, 0, W, H * 0.24);
      c.fillStyle = "#ffffff"; c.font = `900 ${Math.round(H * 0.17)}px CaptionSans, Arial, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("JAN", W / 2, H * 0.125);
      c.fillStyle = "#1c2032"; c.font = `900 ${Math.round(H * 0.42)}px CaptionSans, Arial, sans-serif`; c.fillText("19", W / 2, H * 0.54);
      c.fillStyle = "#5a6278"; c.font = `900 ${Math.round(H * 0.11)}px CaptionSans, Arial, sans-serif`; c.fillText("1977", W / 2, H * 0.86);
      c.strokeStyle = "#1c2032"; c.lineWidth = 6; c.strokeRect(3, 3, W - 6, H - 6);
      for (const x of [W * 0.25, W * 0.75]) { c.fillStyle = "#9aa0b8"; c.beginPath(); c.arc(x, 14, 9, 0, 7); c.fill(); }
    }} />
  </group>
);
const Newspaper: React.FC<{ p: V3; rot?: number }> = ({ p, rot = 0 }) => (
  <group position={p} rotation={[0, rot, 0]}>
    <Panel p={[0, 0.012, 0]} s={[0.9, 1.15]} rot={[-Math.PI / 2, 0, 0]} px={[300, 384]} dep={1} draw={(c, W, H) => {
      c.fillStyle = "#f1ece0"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#1c2032"; c.fillRect(W * 0.08, H * 0.06, W * 0.84, H * 0.07);
      c.fillStyle = "#8a90a6"; for (let i = 0; i < 18; i++) c.fillRect(W * (i % 2 ? 0.53 : 0.08), H * 0.2 + Math.floor(i / 2) * H * 0.075, W * 0.39, H * 0.03);
      // tiny snowflake doodle (picture box) - no masthead name
      c.strokeStyle = "#5fb7e6"; c.lineWidth = 5; c.strokeRect(W * 0.08, H * 0.2, W * 0.39, H * 0.22);
    }} />
  </group>
);
/** little mounds of flakes landing on a surface: each lands at its time and melts after `melt` frames */
const Landed: React.FC<{ base: V3; f: number; at: number; n?: number; spread?: [number, number]; melt?: number; every?: number }> = ({ base, f, at, n = 10, spread = [0.9, 0.5], melt = 9999, every = 5 }) => (<>
  {Array.from({ length: n }, (_, i) => {
    const t0 = at + i * every, age = f - t0; if (age < 0) return null;
    const m = clamp((age - melt) / 20), r = 0.045 * (1 - 0.55 * m);
    return <Ball key={i} p={[base[0] + (rnd(i * 2 + 31) - 0.5) * spread[0], base[1] + r * 0.6, base[2] + (rnd(i * 2 + 32) - 0.5) * spread[1]]} r={r} color={disp(m > 0.6 ? "#bfe9ff" : "#ffffff")} ink={0} />;
  })}
</>);
/** the cold-stunned IGUANA (Blender model); `upside` flips it belly-up (resting, eyes still friendly) */
const Iguana: React.FC<{ p: V3; rot?: V3; s?: number; upside?: number }> = ({ p, rot = [0, 0, 0], s = 0.9, upside = 0 }) => (
  <group position={[p[0], p[1] + upside * 0.36 * s, p[2]]} rotation={rot}>
    <group rotation={[upside * Math.PI, 0, 0]}>
      <Glb name="iguana" s={s} line={1.5} fallback={<Box p={[0, 0.17 * s, 0]} s={[1.2 * s, 0.25 * s, 0.34 * s]} color={disp("#5fb83f")} line={1.5} />} />
    </group>
  </group>
);
/** a puddle (translucent blue disc + glint) */
const Puddle: React.FC<{ p: V3; r: number; o: number }> = ({ p, r, o }) => o <= 0.01 ? null : <>
  <mesh position={[p[0], p[1] + 0.025, p[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.75, 1]}><circleGeometry args={[r, 40]} /><meshLambertMaterial color={disp("#8fd2f0")} transparent opacity={0.75 * o} depthWrite={false} /></mesh>
  <mesh position={[p[0] - r * 0.3, p[1] + 0.03, p[2] - r * 0.15]} rotation={[-Math.PI / 2, 0, 0.4]} scale={[1, 0.3, 1]}><circleGeometry args={[r * 0.35, 24]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.5 * o} depthWrite={false} /></mesh>
</>;

// ---------------------------------------------------------------- shot builder
type View = { world: React.ReactNode; hud?: React.ReactNode; cold: number };
const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number, sub: number, us: number, ls: number): View => {
  const t = f / FPS;
  switch (id) {
    case "hook": {
      // sub 0 = CRANE + LAND: drops from above the palms and lands level on Remy on the sunny Vice City beach (WHAT IF draws on)
      // sub 1 = PULL BACK (reveal): from Remy back to the whole beach - palms, pastel hotels, the skyline across the bay;
      //         at "suddenly, snow" the sky greys and the first flurries drift down
      // sub 2 = PUSH-IN: slow push into Remy squinting up at the flakes; at "happened once" a gold snowflake tile (x1)
      const SS = C("suddenly, snow.", 75), HO = C("happened once.", 150);
      const R: V3 = [0, 0, 0.6];
      const cold = sub === 0 ? 0 : sub === 1 ? k(u, SS - 6, SS + 24, 0, 0.6, Easing.inOut(Easing.cubic)) : 0.62;
      const world = <>
        <BeachWorld t={t} cold={cold} snow={sub === 2 ? 0.12 : 0} hero={R} />
        <Hero p={R} look={REMY} pose={{ mood: sub === 2 ? "worry" : sub === 1 && u > SS + 4 ? "shock" : "grin", arms: sub === 2 ? "shrug" : sub === 1 && u > SS + 4 ? "chest" : "down", lookX: 0, nerv: sub === 2 ? 0.25 : 0 }} f={f} rimO={0.4} />
        {cold > 0.05 && <Flurries t={t} c={[R[0], 0, R[2] - 2]} area={[16, 9, 12]} n={Math.round(110 * clamp(cold / 0.6))} />}
        {sub === 2 ? <Move us={us} ls={ls} at={line({ pos: [0.6, 2.6, 10.5], look: [0, 1.7, 0.6], fov: 44 }, { pos: [0.3, 2.3, 8.2], look: [0, 1.5, 0.6], fov: 44 })} />
          : sub ? <Move us={us} ls={ls} at={line({ pos: [0.3, 2.2, 6.8], look: [0, 1.6, 0.6], fov: 46 }, { pos: [1.0, 4.4, 16.5], look: [0, 2.2, -1.5], fov: 48 })} />
            : <Move us={us} ls={ls} at={line({ pos: [0.4, 10.5, 15.5], look: [0, 1.0, 0.6], fov: 46 }, { pos: [0.6, 2.7, 10.2], look: [0, 1.6, 0.6], fov: 46 })} />}
      </>;
      const wp = k(u, 0, 34, 0.42, 1, EASE.arrive);
      const hud = <>
        {!sub && <StrokeWord text="WHAT IF" x={540} y={565} h={125} p={wp} />}
        {!sub && <HudText f={u} x={540} y={415} size={56} color={AMBER} at={22}>#7</HudText>}
        {sub === 2 && <>
          <IconTile f={u} x={540} y={470} at={HO} kind="flake" color={ICE} spin={(u - HO) * 0.4} />
          <HudText f={u} x={540} y={640} size={84} color={GOLD} at={HO + 6} spacing={2}>× 1</HudText>
        </>}
      </>;
      return { world, hud, cold };
    }
    case "date": {
      // sub 0 = TOP-DOWN (lowering): straight down onto a café table on the sidewalk - a desk calendar page (JAN 19 1977)
      //         and a folded paper; flakes fall onto the page and stay a moment
      // sub 1 = ORBIT: an arc around Remy and a neighbour on the sidewalk, both looking up, catching flurries; clock ~8 AM
      const WU = C("woke up", 50);
      const cold = 0.7;
      if (!sub) {
        const CP: V3 = [0.05, TABLE_TOP, -0.35];
        const world = <>
          <StreetWorld t={t} cold={cold} snow={0.12} hero={[0, 1, -0.4]} table car={false} />
          <Calendar p={CP} />
          <Newspaper p={[-0.95, TABLE_TOP, -0.45]} rot={0.3} />
          <Glb name="soda_can" p={[0.95, TABLE_TOP, -0.25]} s={0.9} line={1.5} />
          <Landed base={[CP[0], CP[1] + 0.06, CP[2]]} f={u} at={10} n={12} spread={[0.9, 0.9]} every={6} />
          <Flurries t={t} c={[0, TABLE_TOP, -0.3]} area={[4, 1.8, 3]} n={45} size={0.08} />
          <Move us={us} ls={ls} at={line({ pos: [0.02, TABLE_TOP + 5.6, 0.25], look: [0.05, TABLE_TOP, -0.35], fov: 40 }, { pos: [0.02, TABLE_TOP + 3.4, 0.05], look: [0.05, TABLE_TOP, -0.35], fov: 40 })} />
        </>;
        return { world, cold };
      }
      const R: V3 = [-0.9, 0, 0.6], N: V3 = [1.0, 0, 0.4];
      const world = <>
        <StreetWorld t={t} cold={cold} snow={0.15} hero={[0, 0, 0.5]} />
        <Hero p={R} look={REMY} pose={{ mood: "shock", arms: "up", armK: 0.7, lookX: 0.2 }} f={f} rimO={0.35} />
        <Hero p={N} look={NEIGHBOUR} pose={{ mood: "laugh", arms: "hold", lookX: -0.3 }} f={f} rimO={0.35} />
        <Flurries t={t} c={[0, 0, 0]} area={[14, 8, 10]} n={110} />
        <Move us={us} ls={ls} at={orbit([0, 1.6, 0.5], 8.2, 1.0, -0.45, 0.25, 46)} />
      </>;
      const hud = <ClockRead f={u} y={430} at={WU} mins={8 * 60 + Math.max(0, (u - WU)) * 0.2} />;
      return { world, hud, cold };
    }
    case "trace": {
      // sub 0 = PUSH-IN: toward the parked car's hood: flakes land and melt into droplets; the clock runs 8:00 -> 9:30
      // sub 1 = CRANE UP (rise): from street level over the pastel hotels to the skyline as the sun comes back; a gold
      //         snowflake tile + 1977 (the only snow ever reported around Miami)
      const MM = C("mid morning.", 55), OS = C("only snow", 40);
      if (!sub) {
        const cold = k(u, 0, len, 0.65, 0.4, Easing.linear);
        const world = <>
          <StreetWorld t={t} cold={cold} snow={0.1 * (1 - k(u, MM - 10, MM + 10, 0, 1))} hero={[3.4, 1, -4.4]} />
          <group position={[3.4, 0, -4.4]} rotation={[0, -0.15, 0]}>
            <Landed base={[0.95 * 1.6, 0.86, 0]} f={u} at={4} n={12} spread={[0.9, 1.4]} every={4} melt={22} />
          </group>
          <Flurries t={t} c={[3.4, 0, -4.2]} area={[6, 5, 5]} n={Math.round(60 * (1 - k(u, MM - 20, MM + 6, 0, 1)))} size={0.09} />
          <Hero p={[2.0, 0, -1.4]} look={REMY} pose={{ mood: "smile", arms: "point", armK: 0.6, lookX: 0.7 }} f={f} rimO={0.3} />
          <Move us={us} ls={ls} at={line({ pos: [0.4, 3.0, 7.2], look: [2.2, 1.0, -3.0], fov: 44 }, { pos: [1.5, 2.6, 3.8], look: [3.2, 0.9, -3.8], fov: 44 })} />
        </>;
        const hud = <ClockRead f={u} y={430} at={2} mins={8 * 60 + 5 + clamp(u / Math.max(1, MM + 10)) * 85} />;
        return { world, hud, cold };
      }
      const cold = k(us, 0, ls, 0.4, 0.15, Easing.linear);
      const world = <>
        <StreetWorld t={t} cold={cold} hero={[0, 0, -4]} car={false} />
        <Move us={us} ls={ls} at={line({ pos: [0.3, 1.7, 5.0], look: [0, 2.6, -9], fov: 46 }, { pos: [0.3, 11.5, 13.5], look: [0, 4.5, -16], fov: 48 })} />
      </>;
      const hud = <>
        <IconTile f={u} x={540} y={470} at={OS} kind="flake" color={ICE} />
        <HudText f={u} x={540} y={640} size={84} color={GOLD} at={OS + 6} spacing={2}>1977</HudText>
      </>;
      return { world, hud, cold };
    }
    case "imagine": {
      // sub 0 = DOLLY ZOOM (vertigo): on Remy at the pink hotel's door while the world goes grey and the snow thickens;
      //         the thermometer sinks from 26 to 2 degrees
      // sub 1 = LOW HERO ANGLE: from the snowy sidewalk at flip-flop height up at Remy, shivering; his breath puffs white
      const BW = C("breath turns", 50);
      const R: V3 = [0, 0, 0.5];
      const cold = sub ? 0.9 : k(us, 4, ls - 4, 0.0, 0.9, Easing.inOut(Easing.cubic));
      const world = <>
        <StreetWorld t={t} cold={cold} snow={sub ? 0.75 : cold * 0.7} hero={R} car={!!sub} />
        {sub ? <>
          <Hero p={R} look={REMY_FF} pose={{ mood: u > BW ? "shock" : "worry", arms: "chest", nerv: 0.75, hunch: 0.3 }} f={f} rimO={0.35} />
          <FlipFlops p={R} />
          <Breath p={R} f={u} at={BW} />
        </> : <Hero p={R} look={REMY_FF} pose={{ mood: cold > 0.5 ? "worry" : "smile", arms: "down", nerv: cold * 0.4 }} f={f} rimO={0.35} />}
        {!sub && <FlipFlops p={R} />}
        {cold > 0.05 && <Flurries t={t} c={[0, 0, -1]} area={[14, 8, 12]} n={Math.round(120 * clamp(cold / 0.9))} />}
        {sub ? <Move us={us} ls={ls} at={line({ pos: [0.5, 0.35, 8.0], look: [0, 1.25, 0.5], fov: 50 }, { pos: [0.35, 0.4, 6.8], look: [0, 1.2, 0.5], fov: 50 })} />
          : <Move us={us} ls={ls} at={dollyZoom([0, 1.6, 0.5], [0.06, 0.08, 1], 12, 6.0, 26)} />}
      </>;
      const v = sub ? 2 : 26 - 24 * clamp((us - 6) / Math.max(1, ls - 12));
      const hud = <Thermo f={u} y={430} at={sub ? -99 : 4} value={v} />;
      return { world, hud, cold };
    }
    case "iguana": {
      // sub 0 = TRACKING UP (pedestal): the camera rises along the hero palm's trunk to the crown where three iguanas
      //         sit, frosty and stiff
      // sub 1 = SLOW PUSH-IN (wide, eye level): the whole palm from crown to lawn; at "freeze up" frost sparkles, at
      //         "drop right out" they let go one by one and land SOFTLY on the snowy grass (a little bounce, no harm)
      const FU = C("freeze up", 40), DR = C("drop right", 60);
      const cold = 0.88;
      const crown: V3 = [HP[0] + 1.5, HP[1] + 6.0, HP[2]];
      // iguanas lie along three fronds that face the camera (frond k: angle a = k/7 * 2pi, centre 1.2 out, slope 0.45)
      const seat: { p: V3; a: number; land: V3 }[] = [5, 6, 4].map((kk, i) => {
        const a = (kk / 7) * Math.PI * 2;
        return { p: [crown[0] + Math.cos(a) * 1.15, crown[1] - 0.2, crown[2] - Math.sin(a) * 1.15] as V3, a, land: ([[0.2, 0, 1.5], [2.7, 0, 1.1], [1.3, 0, 2.5]] as V3[])[i] };
      });
      const world = <>
        <ParkWorld t={t} cold={cold} snow={0.6} hero={[0.8, 3, -0.5]} />
        {seat.map((sp, i) => {
          if (!sub) return <group key={i}><Iguana p={sp.p} rot={[0, sp.a, -0.42]} s={0.85} /><Frost p={sp.p} o={0.6} f={f} /></group>;
          const t0 = DR + i * 9, q = clamp((u - t0) / 16);
          const fall = Easing.in(Easing.quad)(q), bounce = q >= 1 ? Math.max(0, Math.sin(clamp((u - t0 - 16) / 8) * Math.PI)) * 0.18 : 0;
          const p = lerp3(sp.p, sp.land, fall);
          const up = clamp((u - t0) / 14);
          return <group key={i}>
            <Iguana p={[p[0], p[1] + bounce, p[2]]} rot={[0, sp.a + up * 0.6, -0.42 * (1 - up)]} s={0.85} upside={up} />
            <Frost p={p} o={k(u, FU, FU + 10, 0, 0.9) * (1 - 0.6 * up)} f={f} />
            {q >= 1 && u < t0 + 30 && <Halo p={[sp.land[0], 0.15, sp.land[2]]} r={0.5 + (u - t0 - 16) * 0.04} color="#ffffff" o={0.6 * (1 - (u - t0 - 16) / 14)} />}
          </group>;
        })}
        <Flurries t={t} c={[0.8, 0, -1.5]} area={[12, 9, 9]} n={110} />
        {sub ? <Move us={us} ls={ls} at={line({ pos: [1.8, 3.2, 16.2], look: [1.1, 2.6, -0.8], fov: 50 }, { pos: [1.7, 3.1, 14.6], look: [1.1, 2.6, -0.8], fov: 50 })} />
          : <Move us={us} ls={ls} at={line({ pos: [0.9, 1.2, 4.6], look: [0.4, 1.4, -1.0], fov: 44 }, { pos: [2.0, 5.4, 6.4], look: [1.5, 5.6, -0.8], fov: 44 })} />}
      </>;
      const hud = sub ? <Thermo f={u} y={430} at={FU - 6} out={DR - 2} value={4} label="< 10 °C" /> : null;
      return { world, hud, cold };
    }
    case "stunned": {
      // sub 0 = PUSH-IN: on an iguana resting belly-up on the snowy grass, Remy crouched beside it; a gold heart + pulse
      // sub 1 = ORBIT: the sun breaks through, the snow fades; the iguanas flip over and climb back up the palm
      const ND = C("not dead.", 6), SU = C("sun warms", 20), CB = C("climb right", 55);
      if (!sub) {
        const cold = 0.85;
        const IG: V3 = [0.6, 0, 0.9];
        const world = <>
          <ParkWorld t={t} cold={cold} snow={0.6} hero={IG} />
          <Iguana p={IG} rot={[0, 0.5, 0]} s={0.9} upside={1} />
          <Iguana p={[-2.4, 0, -0.6]} rot={[0, 2.2, 0]} s={0.8} upside={1} />
          <Hero p={[-0.9, 0, 0.5]} look={REMY_FF} pose={{ mood: "worry", arms: "point", armK: 0.5, lookX: 0.8, hunch: 1, nerv: 0.4 }} f={f} rimO={0.35} />
          <FlipFlops p={[-0.9, 0, 0.5]} />
          <Breath p={[-0.9, 0, 0.5]} f={u} at={10} />
          <Flurries t={t} c={[0, 0, 0]} area={[10, 7, 8]} n={60} />
          <Move us={us} ls={ls} at={line({ pos: [0.2, 3.4, 9.6], look: [0, 0.9, 0.6], fov: 44 }, { pos: [0.25, 2.6, 6.6], look: [-0.1, 0.9, 0.6], fov: 44 })} />
        </>;
        const beat = Math.max(0, Math.sin(((u - ND) / 18) * Math.PI * 2)) ** 6;
        const hud = <g opacity={drawOn(u, ND, 12)}>
          <g transform={`translate(540 470) scale(${1 + 0.06 * beat})`}><IconTile f={u} x={0} y={0} at={ND} kind="heart" color={CORAL} /></g>
          <g transform="translate(540 620)"><NeonPath d={ICON.pulse} w={5} color={GOLD} p={clamp((u - ND - 6) / 20)} hot /></g>
        </g>;
        return { world, hud, cold };
      }
      const cold = k(u, SU - 4, SU + 30, 0.8, 0.12, Easing.inOut(Easing.cubic));
      const trunk = (y: number): V3 => { const i = (y - 0.5) / 0.95; return [HP[0] + 0.04 * Math.max(0, i) * (Math.max(0, i) + 1), y, HP[2] + 0.3]; };
      const world = <>
        <ParkWorld t={t} cold={cold} snow={0.6 * clamp(cold / 0.8)} hero={[0.6, 1.5, 0]} />
        {[0, 1].map((i) => {
          const t0 = CB - 18 + i * 14, q = clamp((u - t0) / 40);
          const flip = 1 - clamp((u - (SU + 4 + i * 6)) / 12);
          const start: V3 = i ? [-1.3, 0, 0.8] : [1.2, 0, 1.0];
          const onT = trunk(0.6 + q * (3.2 - i * 0.9));
          const toTrunk = clamp(q * 4);
          const pos = lerp3(start, onT, toTrunk);
          return <Iguana key={i} p={pos} rot={[0, 0, toTrunk * Math.PI * 0.42]} s={0.8} upside={flip} />;
        })}
        <Hero p={[-1.3, 0, 2.5]} look={REMY_FF} pose={{ mood: u > CB ? "grin" : "smile", arms: u > CB ? "up" : "chest", armK: 0.7, lookX: 0.6 }} f={f} rimO={0.35} />
        <FlipFlops p={[-1.3, 0, 2.5]} />
        {cold > 0.3 && <Flurries t={t} c={[0, 0, 0]} area={[10, 7, 8]} n={Math.round(60 * (cold - 0.3) / 0.5)} />}
        <Move us={us} ls={ls} at={orbit([0.5, 2.2, 0.4], 10.5, 1.2, 0.35, -0.25, 46)} />
      </>;
      const hud = <IconTile f={u} x={540} y={470} at={SU} kind="sun" color={AMBER} spin={(u - SU) * 0.5} />;
      return { world, hud, cold };
    }
    case "manatee": {
      // sub 0 = TOP-DOWN (lowering): straight down onto the cool bay, three manatees drifting toward the plant;
      //         thermometer: the water is too cold, the gold mark = 20 degrees
      // sub 1 = PULL BACK (reveal): from the manatees huddled in the glowing warm outflow back to the whole power plant,
      //         steam rising from the water and the stacks
      const TW = C("twenty degrees", 40);
      const cold = 0.75;
      if (!sub) {
        const world = <>
          <BayWorld t={t} cold={cold} />
          {[[-0.8, -0.72, 2.4, -0.25], [0.8, -0.74, 0.9, 0.2], [-0.25, -0.73, -0.7, -0.05]].map(([x, y, z, r], i) =>
            <Manatee key={i} p={[x, y, z - us * 0.01]} rot={r + Math.PI * 0.5} f={f} i={i} s={0.75} />)}
          <Move us={us} ls={ls} at={line({ pos: [0.1, 11.5, 2.4], look: [0, -0.6, 0.8], fov: 46 }, { pos: [0.1, 8.2, 2.0], look: [0, -0.6, 0.8], fov: 46 })} />
        </>;
        const hud = <Thermo f={u} y={430} at={TW - 8} value={15} mark={20} markAt={TW} />;
        return { world, hud, cold };
      }
      const world = <>
        <BayWorld t={t} cold={cold} warm={1} />
        {[[-1.2, -0.6, -6.9, 0.3], [0.9, -0.62, -6.6, -0.4], [0.0, -0.6, -5.4, 0.1], [-2.4, -0.62, -5.4, 0.7], [2.2, -0.62, -5.2, -0.8]].map(([x, y, z, r], i) =>
          <Manatee key={i} p={[x, y, z]} rot={Math.PI / 2 + r} f={f} i={i} s={0.8} />)}
        <Move us={us} ls={ls} at={line({ pos: [0.3, 3.6, -2.2], look: [0, -0.8, -6.2], fov: 44 }, { pos: [1.0, 6.5, 8.5], look: [0, 1.2, -8.5], fov: 48 })} />
      </>;
      const hud = <Thermo f={u} y={430} at={-99} value={24} label="> 20 °C" mark={20} markAt={-99} />;
      return { world, hud, cold };
    }
    case "shovel": {
      // PUSH-IN: across the beach store to the shelf full of flip flops, beach balls and sunscreen - and one EMPTY slot;
      // a dashed outline of the missing snow shovel draws in it; HUD: shovel tile x 0
      const NO = C("Nobody owns", 30), SH = C("snow shovel.", 50);
      const cold = 0.8;
      const world = <>
        <StoreWorld t={t} cold={cold} />
        <Panel p={[SHELF[0], 1.77, SHELF[2] + 0.1]} s={[1.25, 0.52]} px={[500, 208]} dep={Math.round(clamp((u - SH + 4) / 16) * 20)} draw={(c, W, H) => {
          const q = clamp((u - SH + 4) / 16); c.clearRect(0, 0, W, H); if (q <= 0) return;
          c.setLineDash([18, 12]); c.lineWidth = 8; c.strokeStyle = `rgba(95,200,255,${0.95 * q})`; c.lineCap = "round"; c.lineJoin = "round";
          c.beginPath(); c.moveTo(40, H / 2); c.lineTo(300, H / 2); c.moveTo(40, H / 2 - 30); c.lineTo(40, H / 2 + 30);
          c.moveTo(300, H / 2 - 60); c.lineTo(440, H / 2 - 50); c.quadraticCurveTo(470, H / 2, 440, H / 2 + 50); c.lineTo(300, H / 2 + 60); c.closePath(); c.stroke();
        }} />
        <Hero p={[1.6, 0, -1.3]} look={REMY_FF} pose={{ mood: u > SH ? "gulp" : "smile", arms: u > SH ? "shrug" : "point", armK: 0.7, lookX: -0.7 }} f={f} rimO={0.35} />
        <FlipFlops p={[1.6, 0, -1.3]} />
        <Move us={us} ls={ls} at={line({ pos: [1.2, 2.3, 8.2], look: [0.4, 1.5, -2.2], fov: 46 }, { pos: [0.7, 2.0, 4.8], look: [0.45, 1.5, -2.3], fov: 46 })} />
      </>;
      const hud = <>
        <IconTile f={u} x={540} y={470} at={NO} kind="shovel" color={ICE} />
        <HudText f={u} x={540} y={640} size={84} color={GOLD} at={NO + 6} spacing={2}>× 0</HudText>
      </>;
      return { world, hud, cold };
    }
    case "snowman": {
      // ORBIT: an arc around Remy patting the snowman into shape on the snowy beach; at "first snowman" a gold #1 star
      const FS = C("first snowman", 20);
      const cold = 0.82;
      const SM: V3 = [0.9, 0, 0.3], R: V3 = [-0.8, 0, 0.7];
      const grow = k(us, 0, Math.max(10, FS), 0.55, 1, Easing.out(Easing.cubic));
      const world = <>
        <BeachWorld t={t} cold={cold} snow={0.75} hero={[0, 0, 0.5]} umbrella={false} />
        <Glb name="snowman" p={SM} s={1.25 * grow} line={2} blob={0.9} fallback={<Ball p={[SM[0], 0.5, SM[2]]} r={0.5} color="#f4f8ff" />} />
        <Hero p={R} look={REMY_FF} pose={{ mood: u > FS ? "grin" : "smile", arms: u > FS ? "up" : "hold", armK: 0.8, lookX: 0.6, nerv: 0.3 }} f={f} rimO={0.35} />
        <FlipFlops p={R} />
        <Breath p={R} f={u} at={4} />
        <Flurries t={t} c={[0, 0, 0]} area={[12, 8, 10]} n={80} />
        <Move us={us} ls={ls} at={orbit([0.1, 1.3, 0.4], 7.2, 1.3, -0.5, 0.25, 44)} />
      </>;
      const hud = <>
        <IconTile f={u} x={540} y={470} at={FS} kind="star" color={GOLD} />
        <HudText f={u} x={540} y={640} size={84} color={GOLD} at={FS + 6} spacing={2}>#1</HudText>
      </>;
      return { world, hud, cold };
    }
    case "puddle": {
      // TRUCK (lateral tracking): the camera slides along the beach while the clock races from 9 to 12 and the sun comes
      // back; the snowman slumps and shrinks into a puddle - carrot, scarf and sunglasses left in it; Remy laughs
      const m = k(us, 4, Math.max(20, ls - 6), 0, 1, Easing.inOut(Easing.quad));
      const cold = 0.8 - 0.72 * m;
      const SM: V3 = [0.9, 0, 0.3], R: V3 = [-0.8, 0, 0.7];
      const sy = 1.25 * (1 - 0.94 * m), sx = 1.25 * (1 + 0.35 * m);
      const world = <>
        <BeachWorld t={t} cold={cold} snow={0.75 * (1 - m)} hero={[0, 0, 0.5]} umbrella={false} />
        <Puddle p={SM} r={0.35 + 0.75 * m} o={clamp(m * 3)} />
        {m < 0.97 && <Glb name="snowman" p={[SM[0], -0.02 * m, SM[2]]} s={[sx, Math.max(0.02, sy), sx]} line={2} />}
        {m > 0.85 && <group>
          <Box p={[SM[0] + 0.15, 0.04, SM[2] + 0.25]} s={[0.07, 0.07, 0.26]} rot={[0, 0.7, 0]} color={disp("#ff8a2a")} line={1} />
          <Box p={[SM[0] - 0.3, 0.035, SM[2] + 0.1]} s={[0.5, 0.05, 0.12]} rot={[0, -0.3, 0]} color={disp(CORAL)} line={1} />
          <Box p={[SM[0] + 0.45, 0.035, SM[2] - 0.15]} s={[0.24, 0.04, 0.08]} rot={[0, 0.2, 0]} color={disp("#1c2032")} line={1} />
        </group>}
        <Hero p={R} look={REMY_FF} pose={{ mood: m > 0.6 ? "laugh" : "worry", arms: m > 0.6 ? "shrug" : "chest", lookX: 0.6 }} f={f} rimO={0.35} />
        <FlipFlops p={R} />
        {cold > 0.3 && <Flurries t={t} c={[0, 0, 0]} area={[12, 8, 10]} n={Math.round(60 * (cold - 0.3) / 0.5)} />}
        <Move us={us} ls={ls} at={line({ pos: [-1.4, 2.8, 8.6], look: [0, 0.95, 0.5], fov: 44 }, { pos: [1.3, 2.8, 8.3], look: [0.2, 0.95, 0.5], fov: 44 })} />
      </>;
      const hud = <ClockRead f={u} y={430} at={2} mins={9 * 60 + 180 * m} sun />;
      return { world, hud, cold };
    }
    case "rare": {
      // sub 0 = CRANE UP (rise): from Remy (sunglasses-weather again) up over the sunny beach and the bay skyline
      // sub 1 = TRACKING (truck): beside Remy strolling the beach in flip flops; a gold timeline 1977 -> 2026 with ONE
      //         snowflake at 1977
      const VR = C("very rare.", 60);
      const cold = 0;
      if (!sub) {
        const R: V3 = [0, 0, 0.6];
        const world = <>
          <BeachWorld t={t} cold={cold} hero={R} />
          <Puddle p={[0.9, 0, 0.3]} r={0.8} o={0.7} />
          <Hero p={R} look={REMY_FF} pose={{ mood: "smile", arms: "down", lookX: 0.3 }} f={f} rimO={0.4} />
          <FlipFlops p={R} />
          <Move us={us} ls={ls} at={line({ pos: [0.4, 1.8, 7.0], look: [0, 1.5, 0.6], fov: 46 }, { pos: [0.6, 6.5, 12.5], look: [0, 0.6, -2], fov: 48 })} />
        </>;
        return { world, cold };
      }
      const e = shotE(us, ls);
      const x = -2.4 + 2.4 * e, R: V3 = [x, 0, 1.2];
      const world = <>
        <BeachWorld t={t} cold={cold} hero={R} />
        <Hero p={R} look={REMY_FF} pose={{ mood: "grin", arms: "down", walk: u * 0.2, speed: e < 0.97 ? 0.45 : 0 }} f={f} rimO={0.4} />
        <FlipFlops p={R} />
        <Move us={us} ls={ls} at={() => ({ pos: [x + 0.8, 2.4, R[2] + 7.8], look: [x - 0.1, 1.6, R[2]], fov: 46 })} />
      </>;
      const tl = drawOn(u, us > 0 ? u - us + 4 : 0, 18);
      const hud = <g opacity={tl}>
        <Plate x={110} y={360} w={860} h={240} o={1} r={36} />
        <NeonPath d="M 190 500 L 890 500" w={5} color={GOLD} p={tl} />
        {[1980, 1990, 2000, 2010, 2020].map((yy) => { const xx = 190 + ((yy - 1977) / (2026 - 1977)) * 700; return <line key={yy} x1={xx} x2={xx} y1={488} y2={512} stroke={AMBER} strokeWidth={4} opacity={tl} />; })}
        <HudText f={u} x={190} y={575} size={46} color={CREAM} at={u - us + 8}>1977</HudText>
        <HudText f={u} x={890} y={575} size={46} color={CREAM} at={u - us + 10}>2026</HudText>
        <g transform="translate(190 440) scale(0.6)" opacity={drawOn(u, VR - 4, 12)}><NeonPath d={ICON.flake} w={6} color={ICE} hot /></g>
        <circle cx={190} cy={500} r={11} fill={ICE} opacity={drawOn(u, VR - 4, 12)} />
      </g>;
      return { world, hud, cold };
    }
    default: { // ask - CRANE + LAND: drops gently from above and lands level on Remy on the beach - sun AND a few
      //          flakes at once; the question card (A-D)
      const R: V3 = [0, 0, 0.6];
      const cold = 0.25;
      const world = <>
        <BeachWorld t={t} cold={cold} snow={0.08} hero={R} />
        <Glb name="snowman" p={[1.5, 0, 0.6]} s={0.7} line={2} blob={0.5} />
        <Hero p={R} look={REMY_FF} pose={{ mood: "grin", arms: u > 26 ? "point" : "up", armK: u > 26 ? 1 : 0.8 }} f={f} rimO={0.45} />
        <FlipFlops p={R} />
        <Flurries t={t} c={[0, 0, 0]} area={[12, 8, 10]} n={35} />
        <Move us={us} ls={ls} at={line({ pos: [0.8, 9.5, 15.5], look: [0, 1.2, 0.6], fov: 46 }, { pos: [0.4, 3.0, 13.8], look: [0, 2.0, 0.6], fov: 46 })} />
      </>;
      const hud = <>
        <HudText f={u} x={540} y={420} size={60} color={CREAM} at={4} out={len + 30}>COMMENT</HudText>
        <HudText f={u} x={540} y={505} size={76} color={GOLD} at={8} out={len + 30}>A, B, C OR D</HudText>
        <ChoiceCards f={u} y={720} at={12} cw={470} ch={130} cards={[{ letter: "A", text: "SNOW IN MIAMI" }, { letter: "B", text: "SUN IN WINTER" }, { letter: "C", text: "BOTH" }, { letter: "D", text: "NEITHER" }]} />
      </>;
      return { world, hud, cold };
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
      <Grade t={f / FPS} shaft={v.cold < 0.45} tint={`rgba(150,190,255,${(0.12 * v.cold).toFixed(3)})`} />
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
  id: "wi-gta-snow",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: N3.bg,
};
export default story;
