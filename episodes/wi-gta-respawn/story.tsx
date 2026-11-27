// WHAT IF #9 "What If You Respawned at a Random Spot on Earth?" - bright DAYLIGHT Stick3D look (as approved for
// What If 1-6: big 3D worlds with sky, clouds, sun, haze; Remy = REMY3D puppet + beanie; Golden Neon only for HUD).
// Central motif: a big stylised 3D GLOBE floating in a bright sky (approximate continents painted on a canvas, no
// real map data) and a glowing cyan RANDOM SPAWN PIN that spins over it and drops. Every respawn = the pin drops on
// the globe, then a SHAPE MORPH of the landing pulse into the place: open ocean (Remy bobbing safely in a swim ring),
// desert dunes with heat shimmer, a generic ice sheet (no animals), a tiny city cluster seen from high above.
// An ODDS BAR (ocean cyan | desert amber | ice cream | city coral | other land gold) builds up shot by shot.
// Facts (RESEARCH.md): ~71% water / ~29% land; deserts ~1/3 of land; glaciers + ice sheets ~1/10 of land (mostly
// Antarctica + Greenland); urban land ~1-3% of land ("a few percent"); 0.29 x 0.03 = 0.009 -> under 1% of the surface.
// SAFETY: Remy is always safe and comic (floats in a swim ring, no drowning, no danger). No game footage/art/logos.
// Every beat is cue-driven (C(phrase, fallback)) so the picture follows words.json. Real shots with hard cuts; every
// PLACE change = shape morph; one NAMED camera move per shot (comment on each case), never reversing.
// Layout: HUD y 300-1350; figures stay above y 1430 (captions own 1440-1640).
// NO DOUBLE TEXT: on-screen words never repeat the caption: numbers (71%, 29%, ~1/3, ~1/10, 1-3%, < 1%) + icons only.
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
import { Box, Ball, INK } from "../../library/stick3d/toon";
import { Person, V3, clamp, Grade } from "../../library/stick3d/kit";
import { REMY3D } from "../../src/tests/Stick3DTest";
import { Cam, Key, Dice } from "../../library/stick3d/extra";
import { Glb } from "../../library/stick3d/glb";
import { DaySky, SunRig, DayGround, CityBackdrop, Palms, Clouds, disp, DAY } from "../../library/stick3d/daylight";
import { WaterSurface, Ripples } from "../../library/stick3d/water";
import { drawPuppet, Look, Pose } from "../../library/stick3d/puppet";
import { N3, Halo, Motes, Panel } from "../../library/stick3d/neon";

// ---------------------------------------------------------------- cast
const REMY: Look = { ...REMY3D, beanie: "#2e3658", beanieBand: N3.gold, pom: N3.amber };
const { gold: GOLD, coral: CORAL, amber: AMBER, text: CREAM, cyan: CYAN, dim: DIM } = NEON;

// ---------------------------------------------------------------- shots
type ShotDef = { id: string; cue: string; parent: string; sub: number };
const DEFS: ShotDef[] = [
  { id: "hook", cue: "What if you", parent: "hook", sub: 0 },
  { id: "hookb", cue: "No hospital,", parent: "hook", sub: 1 },
  { id: "r1", cue: "Let's spin.", parent: "r1", sub: 0 },
  { id: "ocean", cue: "Splash.", parent: "ocean", sub: 0 },
  { id: "oceanb", cue: "About seventy one", parent: "ocean", sub: 1 },
  { id: "far", cue: "So most of", parent: "far", sub: 0 },
  { id: "farb", cue: "Far from any", parent: "far", sub: 1 },
  { id: "r2", cue: "Respawn two.", parent: "r2", sub: 0 },
  { id: "desert", cue: "And about a third", parent: "desert", sub: 0 },
  { id: "desertb", cue: "Sand, rocks, and", parent: "desert", sub: 1 },
  { id: "r3", cue: "Respawn three.", parent: "r3", sub: 0 },
  { id: "ice", cue: "Roughly a tenth", parent: "ice", sub: 0 },
  { id: "iceb", cue: "mostly in Antarctica", parent: "ice", sub: 1 },
  { id: "r4", cue: "Respawn four.", parent: "r4", sub: 0 },
  { id: "city", cue: "Cities and towns", parent: "city", sub: 0 },
  { id: "total", cue: "Put it together,", parent: "total", sub: 0 },
  { id: "game", cue: "That's why in", parent: "game", sub: 0 },
  { id: "sea", cue: "On the real", parent: "sea", sub: 0 },
  { id: "ask", cue: "Where do you", parent: "ask", sub: 0 },
];
const DEF: Record<string, ShotDef> = Object.fromEntries(DEFS.map((d) => [d.id, d]));
const SHOTS = DEFS.map((d) => ({ id: d.id, cue: d.cue }));
const TR_FRAMES = 14;
/** place of each scene (parent): a PLACE change = shape-morph transition, everything else = hard cut */
const PLACE: Record<string, string> = {
  hook: "globe", r1: "globe", ocean: "ocean", far: "ocean", r2: "globe", desert: "desert", r3: "globe", ice: "ice",
  r4: "globe", city: "city", total: "globe", game: "beach", sea: "globe", ask: "ocean",
};
/** background colour of each scene = the flood colour of the morph INTO it */
const BG: Record<string, string> = {
  hook: "#bfe3fb", r1: "#bfe3fb", ocean: "#2a9fd6", far: "#2a9fd6", r2: "#bfe3fb", desert: "#f0cf98", r3: "#bfe3fb",
  ice: "#e9f6fc", r4: "#bfe3fb", city: "#9fcf7a", total: "#bfe3fb", game: "#5fe3ff", sea: "#bfe3fb", ask: "#2a9fd6",
};
/** key object of the OUTGOING shot that becomes the transition shape (screen rect, radius) */
const KEY_DEF = { cx: 540, cy: 920, w: 220, h: 220, r: 110 };   // the landing pulse of the pin on the globe
const KEY_OBJ: Record<string, typeof KEY_DEF> = {
  farb: { cx: 540, cy: 1000, w: 240, h: 240, r: 120 },              // the swim ring seen from above
  desertb: { cx: 540, cy: 470, w: 260, h: 260, r: 130 },            // the sun icon
  iceb: { cx: 540, cy: 520, w: 260, h: 260, r: 130 },               // the mini globe icon
  city: { cx: 540, cy: 960, w: 260, h: 260, r: 40 },                // the city block (top-down)
  total: { cx: 540, cy: 1110, w: 300, h: 300, r: 150 },             // the globe centre
  game: { cx: 540, cy: 1000, w: 220, h: 400, r: 110 },              // the cyan respawn beam
  sea: { cx: 540, cy: 1060, w: 300, h: 300, r: 150 },               // the globe (blue)
};

// ---------------------------------------------------------------- helpers
const k = (u: number, a: number, b: number, from: number, to: number, e = EASE.camera) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const lerp3 = (a: V3, b: V3, e: number): V3 => [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
/** shot clock -> 0..1 with the house camera ease: FAST first, then slow for longer (cubic ease-out), never reversing */
const shotE = (us: number, ls: number) => { const x = clamp(us / Math.max(1, ls)); return 1 - Math.pow(1 - x, 3); };
type CamPose = { pos: V3; look: V3; fov?: number; roll?: number };
const Move: React.FC<{ us: number; ls: number; at: (e: number) => CamPose }> = ({ us, ls, at }) => {
  const c = at(shotE(us, ls));
  const key: Key = { t: 0, pos: c.pos, look: c.look, fov: c.fov ?? 46, roll: c.roll ?? 0 };
  return <Cam t={us / FPS} keys={[key]} />;
};
const line = (a: CamPose, b: CamPose) => (e: number): CamPose => ({ pos: lerp3(a.pos, b.pos, e), look: lerp3(a.look, b.look, e), fov: (a.fov ?? 46) + ((b.fov ?? 46) - (a.fov ?? 46)) * e, roll: (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * e });
const orbit = (c: V3, r: number, h: number, a0: number, a1: number, fov = 44) => (e: number): CamPose => {
  const a = a0 + (a1 - a0) * e; return { pos: [c[0] + r * Math.sin(a), c[1] + h, c[2] + r * Math.cos(a)], look: c, fov };
};
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
/** HUD text: word by word, each word fades up from soft (blurred halo) to sharp with a small rise, 0.08 s stagger */
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
const Plate: React.FC<{ x: number; y: number; w: number; h: number; o: number; r?: number; fill?: string }> = ({ x, y, w, h, o, r = 22, fill = "#0b0d1a" }) => o <= 0 ? null : <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} opacity={0.52 * o} />;

// ---------------------------------------------------------------- HUD icons (line art, Golden Neon)
const ICON: Record<string, string> = {
  pin: "M 0 38 C -6 22 -26 6 -26 -12 A 26 26 0 1 1 26 -12 C 26 6 6 22 0 38 Z M 0 -21 A 9 9 0 1 1 -0.1 -21 Z",
  wave: "M -40 -8 Q -30 -20 -20 -8 Q -10 4 0 -8 Q 10 -20 20 -8 Q 30 4 40 -8 M -40 14 Q -30 2 -20 14 Q -10 26 0 14 Q 10 2 20 14 Q 30 26 40 14",
  dune: "M -44 26 Q -22 -18 4 12 Q 22 -12 44 26 Z",
  sun: "M 0 -15 A 15 15 0 1 1 -0.1 -15 Z M 0 -38 L 0 -26 M 0 26 L 0 38 M -38 0 L -26 0 M 26 0 L 38 0 M -27 -27 L -19 -19 M 27 27 L 19 19 M -27 27 L -19 19 M 27 -27 L 19 -19",
  rock: "M -38 24 L -28 -6 L -8 -20 L 16 -16 L 36 8 L 32 24 Z M -8 -20 L 0 6 L 32 24",
  snow: "M 0 -38 L 0 38 M -33 -19 L 33 19 M -33 19 L 33 -19 M -9 -30 L 0 -22 L 9 -30 M -9 30 L 0 22 L 9 30 M -30 -6 L -22 -12 M 30 6 L 22 12 M -30 6 L -22 12 M 30 -6 L 22 -12",
  city: "M -40 32 L 40 32 M -34 32 L -34 -4 L -16 -4 L -16 32 M -16 32 L -16 -34 L 6 -34 L 6 32 M 6 32 L 6 -14 L 28 -14 L 28 32 M -9 -24 L -1 -24 M -9 -12 L -1 -12 M -9 0 L -1 0 M 13 -4 L 21 -4 M 13 8 L 21 8",
  hospital: "M -34 32 L -34 -22 L 34 -22 L 34 32 Z M 0 -12 L 0 18 M -15 3 L 15 3",
  house: "M -32 32 L -32 -4 L 0 -32 L 32 -4 L 32 32 Z M -10 32 L -10 8 L 10 8 L 10 32",
  land: "M -38 8 C -32 -22 -8 -30 8 -16 C 28 -28 42 -2 32 16 C 16 32 -24 30 -38 8 Z",
  check: "M -26 2 L -8 20 L 28 -20",
  heat: "M -24 30 C -34 14 -14 4 -24 -12 C -32 -26 -18 -32 -22 -38 M 0 30 C -10 14 10 4 0 -12 C -8 -26 6 -32 2 -38 M 24 30 C 14 14 34 4 24 -12 C 16 -26 30 -32 26 -38",
};
/** round icon tile (optional coral strike) */
const IconTile: React.FC<{ f: number; x: number; y: number; at: number; icon: string; strike?: number; color?: string; r?: number; out?: number }> =
  ({ f, x, y, at, icon, strike = 0, color = GOLD, r = 78, out = Infinity }) => {
    const p = drawOn(f, at, 12) * leaveO(f, out); if (p <= 0) return null;
    const s = r / 78;
    return <g transform={`translate(${x} ${y - (1 - p) * 16})`} opacity={p}>
      <circle r={r} fill={color === CYAN ? "#0b3a46" : "#3a2a0c"} opacity={0.82} />
      <circle r={r} fill="none" stroke={color} strokeWidth={4} opacity={0.9} />
      <g transform={`scale(${s})`}>
        <NeonPath d={ICON[icon]} w={5} color={color} hot />
        {strike > 0 && <><circle r={56} fill="none" stroke={CORAL} strokeWidth={8} opacity={strike} /><NeonPath d="M -40 -40 L 40 40" w={8} color={CORAL} p={strike} hot /></>}
      </g>
    </g>;
  };
/** the four respawn tiles (pins): the current one lights cyan, done ones keep a small icon of where they landed */
const SPAWN_ICON = ["wave", "dune", "snow", "city"];
const SpawnTracker: React.FC<{ f: number; at: number; active: number; out?: number; y?: number }> = ({ f, at, active, out = Infinity, y = 350 }) => {
  const o = leaveO(f, out); if (f < at - 2 || o <= 0) return null;
  return <g opacity={o}>{[0, 1, 2, 3].map((i) => {
    const x = 540 + (i - 1.5) * 140, p = drawOn(f, at + i * 3, 12), on = i === active, done = i < active;
    const col = on ? CYAN : done ? GOLD : DIM;
    return <g key={i} transform={`translate(${x} ${y - (1 - p) * 14})`} opacity={p}>
      <rect x={-56} y={-56} width={112} height={112} rx={22} fill={on ? "#0b3a46" : "#0b0d1a"} opacity={on ? 0.82 : 0.55} />
      <NeonPath d="M -34 -56 L 34 -56 Q 56 -56 56 -34 L 56 34 Q 56 56 34 56 L -34 56 Q -56 56 -56 34 L -56 -34 Q -56 -56 -34 -56 Z" w={on ? 4.5 : 2.5} color={col} glow={on ? 1 : 0.3} />
      <g transform="scale(0.72)"><NeonPath d={done ? ICON[SPAWN_ICON[i]] : ICON.pin} w={on ? 6 : 4.5} color={col} glow={on ? 0.8 : 0.2} hot={on} /></g>
    </g>;
  })}</g>;
};
/** ODDS BAR = share of Earth's SURFACE: ocean (cyan) | desert (amber) | ice (cream) | city (coral) | other land (gold).
 *  Each part grows from 0 when its `at` frame comes (-999 = already there); icons sit under the parts. */
const PART = { ocean: 0.71, desert: 0.29 / 3, ice: 0.029, city: 0.009 };
type Odds = { ocean: number; land: number; desert: number; ice: number; city: number };
const OddsBar: React.FC<{ f: number; y: number; at: Odds; out?: number; glow?: "ocean" | "city"; w?: number; icons?: boolean }> = ({ f, y, at, out = Infinity, glow, w = 900, icons = true }) => {
  const o = leaveO(f, out) * drawOn(f, Math.min(at.ocean, at.land) - 4, 10); if (o <= 0) return null;
  const x0 = 540 - w / 2 + 14, tw = w - 28, h = 56;
  const g = (a: number) => drawOn(f, a, 16);
  const ocean = PART.ocean * g(at.ocean), land = (1 - PART.ocean) * g(at.land);
  const L0 = x0 + tw * PART.ocean;
  const segs: [number, number, string, number][] = [
    [x0, tw * ocean, CYAN, 0.92],
    [L0, tw * land, GOLD, 0.9],
    [L0, tw * PART.desert * g(at.desert), AMBER, 1],
    [L0 + tw * PART.desert, tw * PART.ice * g(at.ice), CREAM, 1],
    [L0 + tw * (PART.desert + PART.ice), Math.max(tw * PART.city * g(at.city), g(at.city) > 0 ? 7 : 0), CORAL, 1],
  ];
  const fl = glow ? 0.5 + 0.5 * Math.sin(f * 0.25) : 0;
  return <g opacity={o}>
    <rect x={540 - w / 2} y={y - 16} width={w} height={h + 32} rx={(h + 32) / 2} fill="#0b0d1a" opacity={0.6} />
    <rect x={x0} y={y} width={tw} height={h} rx={12} fill="#141a2c" stroke={DIM} strokeWidth={2.5} />
    {segs.map(([x, sw, c, op], i) => sw > 1 ? <rect key={i} x={x} y={y + 4} width={sw} height={h - 8} rx={i === 0 ? 9 : 3} fill={c} opacity={op} /> : null)}
    <rect x={x0 + 4} y={y + 8} width={Math.max(0, tw * (ocean + land) - 8)} height={(h - 16) * 0.3} rx={5} fill="#ffffff" opacity={0.35} />
    {glow === "ocean" && <rect x={x0} y={y - 6} width={tw * PART.ocean} height={h + 12} rx={14} fill="none" stroke="#ffffff" strokeWidth={6} opacity={fl} />}
    {glow === "city" && <circle cx={L0 + tw * (PART.desert + PART.ice) + 4} cy={y + h / 2} r={30} fill="none" stroke={CORAL} strokeWidth={6} opacity={0.5 + 0.5 * fl} />}
    {icons && ([["wave", x0 + tw * PART.ocean / 2, x0 + tw * PART.ocean / 2, at.ocean, CYAN], ["dune", L0 + 30, L0 + tw * PART.desert / 2, at.desert, AMBER], ["snow", L0 + 98, L0 + tw * (PART.desert + PART.ice / 2), at.ice, CREAM], ["city", L0 + 166, L0 + tw * (PART.desert + PART.ice + PART.city / 2), at.city, CORAL], ["land", L0 + 234, L0 + tw * 0.2, at.land, GOLD]] as const).map(([ic, x, sx, a, c]) => {
      const p = drawOn(f, a + 6, 12); if (p <= 0) return null;
      return <g key={ic} opacity={p}>
        <path d={`M ${sx} ${y + h + 2} L ${sx} ${y + h + 12} L ${x} ${y + h + 20}`} stroke={c} strokeWidth={3} fill="none" opacity={0.8} />
        <g transform={`translate(${x} ${y + h + 52}) scale(0.58)`}><circle r={54} fill="#0b0d1a" opacity={0.6} /><NeonPath d={ICON[ic]} w={6} color={c} hot /></g>
      </g>;
    })}
  </g>;
};
/** LAND DISC: a gold disc (= all land) with a sector in `color` that sweeps to `frac`; the value under it */
const LandDisc: React.FC<{ f: number; x: number; y: number; at: number; frac: number; color: string; value: string; valueAt: number; r?: number; icon?: string; out?: number }> =
  ({ f, x, y, at, frac, color, value, valueAt, r = 110, icon, out = Infinity }) => {
    const p = drawOn(f, at, 12) * leaveO(f, out); if (p <= 0) return null;
    const sw = frac * k(f, at + 6, at + 30, 0, 1, Easing.out(Easing.cubic));
    const a1 = -Math.PI / 2 + sw * Math.PI * 2;
    const large = sw > 0.5 ? 1 : 0;
    const d = sw > 0.001 ? `M 0 0 L 0 ${-r} A ${r} ${r} 0 ${large} 1 ${Math.cos(a1) * r} ${Math.sin(a1) * r} Z` : "";
    return <g opacity={p} transform={`translate(0 ${(1 - p) * 14})`}>
      <Plate x={x - r - 40} y={y - r - 40} w={2 * r + 80 + 300} h={2 * r + 80} o={1} r={36} />
      <g transform={`translate(${x} ${y})`}>
        <circle r={r} fill={GOLD} opacity={0.35} />
        <circle r={r} fill="none" stroke={GOLD} strokeWidth={5} />
        {d && <path d={d} fill={color} stroke="#0b0d1a" strokeWidth={4} strokeLinejoin="round" />}
        {icon && <g transform="scale(0.8)"><NeonPath d={ICON[icon]} w={6} color="#0b0d1a" /></g>}
      </g>
      <HudText f={f} x={x + r + 170} y={y + 40} size={110} color={color} at={valueAt} spacing={2}>{value}</HudText>
    </g>;
  };

// ---------------------------------------------------------------- the GLOBE (stylised, approximate continents)
type LL = [number, number];
const CONT: LL[][] = [
  // North America
  [[-168, 66], [-160, 71], [-140, 70], [-120, 72], [-95, 72], [-80, 68], [-65, 60], [-55, 52], [-66, 45], [-75, 38], [-80, 30], [-81, 25], [-90, 29], [-97, 26], [-97, 20], [-90, 16], [-83, 10], [-78, 8], [-85, 13], [-95, 16], [-105, 20], [-112, 28], [-118, 33], [-124, 40], [-125, 48], [-135, 58], [-150, 60], [-165, 60]],
  // South America
  [[-78, 8], [-72, 12], [-62, 10], [-52, 4], [-35, -6], [-38, -14], [-48, -26], [-58, -36], [-66, -46], [-70, -54], [-74, -50], [-72, -38], [-71, -28], [-70, -18], [-76, -14], [-81, -5], [-80, 2]],
  // Europe
  [[-10, 36], [-9, 44], [-2, 44], [-5, 48], [0, 50], [5, 54], [8, 57], [5, 61], [12, 65], [20, 70], [30, 71], [40, 68], [45, 60], [50, 55], [40, 45], [30, 42], [26, 38], [22, 37], [15, 38], [12, 44], [6, 43], [0, 38]],
  // Africa
  [[-17, 15], [-17, 21], [-10, 30], [-5, 36], [10, 37], [20, 32], [32, 31], [35, 27], [43, 12], [51, 12], [42, -2], [40, -12], [35, -24], [28, -33], [20, -35], [15, -26], [12, -16], [13, -5], [9, 4], [-5, 5], [-12, 7]],
  // Asia
  [[26, 38], [36, 36], [35, 30], [44, 13], [52, 16], [58, 23], [62, 25], [67, 24], [72, 20], [77, 8], [80, 15], [88, 22], [92, 21], [98, 15], [100, 5], [104, 1], [106, 10], [109, 15], [106, 20], [110, 21], [118, 24], [122, 31], [120, 38], [125, 40], [129, 35], [130, 43], [141, 48], [140, 55], [155, 58], [163, 62], [180, 66], [180, 71], [150, 72], [130, 72], [110, 77], [90, 76], [75, 72], [60, 69], [50, 68], [45, 60], [50, 55], [40, 45], [30, 42]],
  // Australia
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [140, -38], [132, -32], [124, -34], [115, -34], [113, -26]],
  // islands: UK, Japan, Madagascar, Borneo, Sumatra, New Guinea, New Zealand, Iceland
  [[-5, 50], [2, 52], [-2, 58], [-6, 57]], [[130, 31], [136, 34], [141, 37], [142, 44], [139, 41]], [[44, -13], [50, -15], [47, -25], [43, -22]],
  [[109, 1], [118, 6], [118, -1], [111, -3]], [[95, 5], [106, -6], [104, -5], [96, 2]], [[131, -1], [141, -3], [150, -9], [141, -9]],
  [[167, -46], [174, -36], [178, -38], [171, -45]], [[-24, 64], [-14, 66], [-14, 64], [-22, 63]],
];
const ICECAPS: LL[][] = [[[-73, 78], [-60, 82], [-30, 83], [-20, 76], [-22, 70], [-42, 60], [-50, 64], [-55, 70], [-70, 76]]]; // Greenland
const DESERTS: LL[][] = [
  [[-15, 18], [-12, 28], [-5, 31], [10, 32], [25, 30], [33, 27], [35, 20], [28, 16], [15, 15], [0, 15]],  // Sahara
  [[36, 30], [44, 28], [56, 24], [55, 17], [45, 14], [38, 20]],                                          // Arabia
  [[120, -20], [135, -18], [142, -24], [138, -31], [124, -30]],                                          // Australia
  [[88, 44], [105, 46], [112, 42], [100, 38], [86, 40]], [[52, 40], [65, 44], [70, 38], [60, 35]],           // Gobi, central Asia
  [[-116, 37], [-106, 36], [-104, 30], [-112, 29]], [[-71, -18], [-69, -16], [-68, -26], [-71, -27]], [[16, -20], [24, -20], [25, -27], [18, -28]],
];
const FORESTS: LL[][] = [[[-75, 0], [-55, 2], [-48, -6], [-58, -12], [-72, -10]], [[12, 3], [28, 4], [30, -4], [16, -6]], [[60, 62], [100, 64], [125, 60], [110, 55], [70, 56]], [[-120, 56], [-90, 58], [-75, 50], [-100, 50]]];
const CITIES: LL[] = [[-74, 40.7], [2.3, 48.8], [139.7, 35.7], [-0.1, 51.5], [77.2, 28.6], [-46.6, -23.5], [121.5, 31.2], [-118.2, 34], [31.2, 30], [3.4, 6.5], [-99.1, 19.4], [151.2, -33.9], [37.6, 55.7], [103.8, 1.3], [72.8, 19], [116.4, 39.9]];
const TW = 2048, TH = 1024;
const llxy = ([lon, lat]: LL): [number, number] => [((lon + 180) / 360) * TW, ((90 - lat) / 180) * TH];
const blob = (g: CanvasRenderingContext2D, pts: LL[]) => {
  const xy = pts.map(llxy); g.beginPath();
  const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(xy[xy.length - 1], xy[0]); g.moveTo(m0[0], m0[1]);
  xy.forEach((p, i) => { const m = mid(p, xy[(i + 1) % xy.length]); g.quadraticCurveTo(p[0], p[1], m[0], m[1]); });
  g.closePath();
};
let globeT: THREE.CanvasTexture | null = null;
const globeTex = () => {
  if (globeT) return globeT;
  const c = document.createElement("canvas"); c.width = TW; c.height = TH; const g = c.getContext("2d")!;
  const sea = g.createLinearGradient(0, 0, 0, TH); sea.addColorStop(0, disp("#3aa6e6")); sea.addColorStop(0.5, disp("#1f86d6")); sea.addColorStop(1, disp("#3aa6e6"));
  g.fillStyle = sea; g.fillRect(0, 0, TW, TH);
  // shallow shelf glow around land
  g.lineJoin = "round";
  for (const p of CONT) { blob(g, p); g.strokeStyle = disp("#7fd3f2"); g.lineWidth = 22; g.stroke(); }
  for (const p of CONT) { blob(g, p); g.fillStyle = disp("#7cc35a"); g.fill(); }
  for (const p of FORESTS) { blob(g, p); g.fillStyle = disp("#55a648"); g.fill(); }
  for (const p of DESERTS) { blob(g, p); g.fillStyle = disp("#ecc77e"); g.fill(); }
  for (const p of ICECAPS) { blob(g, p); g.fillStyle = disp("#f6fbff"); g.fill(); }
  // Antarctica (wavy band) + Arctic sea ice
  g.fillStyle = disp("#f6fbff"); g.beginPath(); g.moveTo(0, TH);
  for (let x = 0; x <= TW; x += 16) g.lineTo(x, TH * (0.87 + 0.018 * Math.sin(x * 0.011) + 0.012 * Math.sin(x * 0.031)));
  g.lineTo(TW, TH); g.closePath(); g.fill();
  g.fillStyle = disp("#e8f4fb"); g.beginPath(); g.moveTo(0, 0);
  for (let x = 0; x <= TW; x += 16) g.lineTo(x, TH * (0.045 + 0.012 * Math.sin(x * 0.013)));
  g.lineTo(TW, 0); g.closePath(); g.fill();
  // ink coastlines
  for (const p of [...CONT, ...ICECAPS]) { blob(g, p); g.strokeStyle = disp("#16324a"); g.lineWidth = 3.5; g.stroke(); }
  // tiny city lights (coral dots)
  for (const cc of CITIES) { const [x, y] = llxy(cc); g.fillStyle = disp("#ff7a59"); g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); }
  // faint grid
  g.strokeStyle = "rgba(255,255,255,.10)"; g.lineWidth = 2;
  for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0, (i * TH) / 6); g.lineTo(TW, (i * TH) / 6); g.stroke(); }
  for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo((i * TW) / 12, 0); g.lineTo((i * TW) / 12, TH); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; globeT = t; return t;
};
const GR = 6;
/** unit normal of a lon/lat point in the globe's local space (matches three's SphereGeometry UV layout) */
const llDir = ([lon, lat]: LL): THREE.Vector3 => {
  const phi = ((lon + 180) / 360) * Math.PI * 2, th = ((90 - lat) / 180) * Math.PI;
  return new THREE.Vector3(-Math.cos(phi) * Math.sin(th), Math.cos(th), Math.sin(phi) * Math.sin(th));
};
/** globe rotation [x, y] that brings lon/lat to the front (+z), lifted ~0.55 rad up the face so the pin reads side-on;
 *  `tk` = how much of the latitude tilt to apply, `el` = how far up (rad, + = up) the target ends on the face */
const faceRot = (ll: LL, tk = 0.75, el = 0.35): [number, number] => {
  const d = llDir(ll); const beta = Math.atan2(d.x, d.z);
  return [((ll[1] * Math.PI) / 180) * tk - el, -beta];
};
/** the RANDOM SPAWN PIN: cyan glowing teardrop on the globe surface at lon/lat; `lift` = height above the surface,
 *  `spin` = turn about its own axis; a cyan ring pulse spreads on the surface once it has landed (`land` frames ago) */
const Pin: React.FC<{ ll: LL; lift: number; spin: number; s?: number; land?: number; color?: string }> = ({ ll, lift, spin, s = 0.9, land = -1, color = CYAN }) => {
  const n = llDir(ll);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
  const pulse = land >= 0 ? clamp(land / 24) : -1;
  const sq = land >= 0 && land < 8 ? Math.sin((land / 8) * Math.PI) * 0.18 : 0;
  return <group position={[n.x * GR, n.y * GR, n.z * GR]} quaternion={q}>
    <group position={[0, lift, 0]} rotation={[0, spin, 0]} scale={[s * (1 + sq * 0.6), s * (1 - sq), s * (1 + sq * 0.6)]}>
      <Glb name="map_pin" line={2} fallback={<>
        <mesh position={[0, 0.62, 0]}><coneGeometry args={[0.45, 1.25, 20]} /><meshBasicMaterial color={disp(color)} toneMapped={false} /></mesh>
        <mesh position={[0, 1.45, 0]}><sphereGeometry args={[0.5, 20, 14]} /><meshBasicMaterial color={disp(color)} toneMapped={false} /></mesh>
      </>} />
      <Halo p={[0, 1.4, 0]} r={1.6} color={color} o={0.45} />
    </group>
    {pulse >= 0 && pulse < 1 && <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.3 + 2.2 * pulse, 0.45 + 2.3 * pulse, 40]} /><meshBasicMaterial color={disp(color)} transparent opacity={0.9 * (1 - pulse)} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} /></mesh>}
    {land >= 0 && <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.32, 24]} /><meshBasicMaterial color={disp(color)} transparent opacity={0.8} depthWrite={false} toneMapped={false} /></mesh>}
  </group>;
};
/** the globe itself, at the origin, radius GR: toon-lit texture + ink rim + soft atmosphere halo */
const Earth: React.FC<{ rot: [number, number]; children?: React.ReactNode }> = ({ rot, children }) => (<>
  <Halo p={[0, 0, -1]} r={GR * 1.5} color="#e6f7ff" o={0.55} />
  <group rotation={[rot[0], rot[1], 0]}>
    <mesh><sphereGeometry args={[GR, 72, 48]} /><meshLambertMaterial map={globeTex()} /></mesh>
    {children}
  </group>
  <mesh><sphereGeometry args={[GR + 0.09, 48, 32]} /><meshBasicMaterial color={INK} side={THREE.BackSide} /></mesh>
</>);
/** bright sky around the floating globe (clouds drift below and behind it) */
const SkyWorld: React.FC<{ t: number }> = ({ t }) => (<>
  <DaySky top="#2f86e2" horizon="#cfeafc" fogNear={60} fogFar={240} sun={[50, 60, -150]} />
  <ambientLight intensity={0.5} />
  <hemisphereLight args={["#d8ecff", "#bcd6ee", 1.1]} />
  <directionalLight position={[9, 8, 12]} intensity={2.2} color="#fff1d8" />
  <Clouds t={t} at={[[-24, -13, -45], [22, -15, -55], [-36, 3, -75], [34, 7, -85], [2, -20, -65]]} s={4} />
</>);
/** a full respawn on the globe: the pin hovers + spins while the globe spins to bring the target to the front, then
 *  the pin DROPS at `drop` (gravity ease-in) and lands with a squash + ring pulse */
const spawnRot = (u: number, ll: LL, until: number, turns: number, tk = 0.75, el = 0.35): [number, number] => {
  const [rx, ry] = faceRot(ll, tk, el), e = Easing.out(Easing.cubic)(clamp(u / Math.max(1, until)));
  return [rx * e, ry - turns * Math.PI * 2 * (1 - e)];
};
const pinLift = (u: number, drop: number) => (u < drop ? 5 + 0.25 * Math.sin(u * 0.2) : Math.max(0, 5 * (1 - Math.pow(clamp((u - drop) / 12), 2))));

// ---------------------------------------------------------------- other 3D helpers
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
const Hero: React.FC<{ p: V3; look: Look; pose: Omit<Pose, "t">; f: number; h?: number; shadow?: boolean; rimO?: number }> = ({ p, look, pose, f, h = 2.5, shadow = true, rimO = 0.3 }) => (<>
  <Halo p={[p[0], p[1] + h * 0.62, p[2] - 0.25]} r={h * 0.72} color="#ffffff" o={rimO * 0.6} />
  {shadow ? <DropShadow p={p} h={h} look={look} pose={pose} f={f} /> : null}
  <Person p={p} h={h} look={look} pose={pose} f={f} shadow={shadow} sy={p[1]} />
</>);
/** Remy bobbing SAFELY in his swim ring (water level y 0): puppet waist at the waterline, ring around him */
const Floater: React.FC<{ p: V3; f: number; t: number; pose: Omit<Pose, "t">; rise?: number }> = ({ p, f, t, pose, rise = 1 }) => {
  const bob = Math.sin(t * 2.1) * 0.07, y = p[1] + bob - 1.2 * (1 - rise);
  return <group>
    <Person p={[p[0], y - 0.8, p[2]]} look={REMY} pose={pose} f={f} shadow={false} />
    <group position={[p[0], y + 0.12, p[2]]} rotation={[0.08 * Math.sin(t * 1.3), 0, 0.06 * Math.sin(t * 1.7)]}>
      <Glb name="swim_ring" line={2} fallback={<mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.62, 0.2, 10, 32]} /><meshLambertMaterial color={disp(CORAL)} /></mesh>} />
    </group>
    <Ripples p={[p[0], 0, p[2]]} t={t} r={2.2} o={0.5} />
  </group>;
};
/** splash: white droplets flying out + a flash ring (friendly) */
const Splash: React.FC<{ p: V3; u: number; at: number; s?: number }> = ({ p, u, at, s = 1 }) => {
  const q = (u - at) / 20; if (q < 0 || q > 1) return null;
  return <group position={p}>
    {Array.from({ length: 12 }, (_, i) => { const a = i * 0.53, r = q * 1.4 * s; return <Ball key={i} p={[Math.cos(a) * r, Math.sin(q * Math.PI) * (0.8 + (i % 3) * 0.35) * s, Math.sin(a) * r * 0.6]} r={0.08 * s * (1 - q * 0.6)} color="#f4fdff" ink={0} />; })}
    <Halo p={[0, 0.3, 0]} r={1.6 * s} color="#ffffff" o={0.6 * (1 - q)} />
  </group>;
};
/** HEAT SHIMMER: wavy translucent bands rising in front of the dunes (additive, subtle) */
let heatT: THREE.CanvasTexture | null = null;
const heatTex = () => {
  if (heatT) return heatT;
  const c = document.createElement("canvas"); c.width = 256; c.height = 256; const g = c.getContext("2d")!;
  g.fillStyle = "#000"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "rgba(255,240,210,0.9)"; g.lineWidth = 3;
  for (let k2 = 0; k2 < 9; k2++) { g.beginPath(); for (let x = 0; x <= 256; x += 8) { const y = k2 * 28.4 + 6 * Math.sin((x / 256) * Math.PI * 6 + k2); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; heatT = t; return t;
};
const HeatShimmer: React.FC<{ t: number; p: V3; s: [number, number]; o?: number }> = ({ t, p, s, o = 0.1 }) => {
  const tex = React.useMemo(() => { const x = heatTex().clone(); x.needsUpdate = true; x.wrapS = x.wrapT = THREE.RepeatWrapping; return x; }, []);
  tex.repeat.set(s[0] / 6, s[1] / 6); tex.offset.set(0, (-t * 0.25) % 1);
  return <mesh position={p}><planeGeometry args={s} /><meshBasicMaterial map={tex} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>;
};
/** glow of the city (coral) / safe spawn beam (cyan): additive vertical cylinder that fades upward */
const Beam: React.FC<{ p: V3; h: number; r: number; o: number; color?: string }> = ({ p, h, r, o, color = CYAN }) => o <= 0.01 ? null : (
  <group position={p}>
    {[1, 0.55].map((sc, i) => <mesh key={i} position={[0, h / 2, 0]}><cylinderGeometry args={[r * sc, r * sc * 1.1, h, 24, 1, true]} /><meshBasicMaterial color={disp(color)} transparent opacity={o * (i ? 0.5 : 0.22)} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} /></mesh>)}
    <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[r * 0.8, r * 1.05, 40]} /><meshBasicMaterial color={disp(color)} transparent opacity={o * 0.9} depthWrite={false} toneMapped={false} /></mesh>
  </group>
);
/** cyan hologram Remy = the GAME respawn (materialises in the beam) */
const Ghost: React.FC<{ p: V3; h?: number; o?: number; f: number; pose?: Omit<Pose, "t"> }> = ({ p, h = 2.5, o = 0.7, f, pose = { mood: "grin", arms: "up" } }) => o <= 0.01 ? null : (
  <group position={p}>
    <Panel p={[0, h * 0.5, 0]} s={[h * 512 / 768, h]} px={[256, 384]} face additive o={o} dep={Math.floor(f / 2)} draw={(c, W, H) => {
      drawPuppet(c, W, H, REMY, { ...pose, t: f });
      c.globalCompositeOperation = "source-in"; c.fillStyle = "rgba(95,227,255,0.85)"; c.fillRect(0, 0, W, H); c.globalCompositeOperation = "source-over";
    }} />
  </group>
);

// ---------------------------------------------------------------- worlds
/** open OCEAN to the horizon: deep blue under a translucent glinting sea, no land anywhere, clouds */
const OceanWorld: React.FC<{ t: number; target?: V3 }> = ({ t, target = [0, 0, 0] }) => (<>
  <DaySky fogNear={40} fogFar={190} />
  <SunRig target={target} dir={[6, 10, 5]} />
  <mesh position={[0, -0.06, -60]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[500, 500]} /><meshLambertMaterial color={disp("#1d86c4")} /></mesh>
  <WaterSurface t={t} p={[0, 0, -40]} s={[420, 420]} color="#2a9fd6" o={0.86} glint={0.34} rep={80} />
  {[[-14, -30, 9], [20, -48, 12], [-36, -70, 14], [44, -90, 16], [4, -110, 18]].map(([x, z, r], i) => <mesh key={i} position={[x, 0.03, z]} rotation={[-Math.PI / 2, 0, i]}><ringGeometry args={[r, r + 0.5, 48, 1, 0, 2.2]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.25} depthWrite={false} toneMapped={false} /></mesh>)}
  <Clouds t={t} at={[[-30, 26, -120], [24, 32, -140], [55, 22, -100], [-60, 20, -90], [0, 30, -170]]} s={5} />
</>);
/** DESERT: endless sand dunes, a red mesa far away, saguaros, rocks, heat shimmer, hot sun */
const DUNES: [number, number, number, number, number][] = [[-22, -18, 14, 0.22, 0], [16, -26, 18, 0.2, 1], [-6, -46, 22, 0.24, 0], [34, -60, 26, 0.2, 1], [-40, -70, 28, 0.22, 0], [8, -90, 34, 0.2, 1], [-14, 6, 9, 0.12, 1], [18, 2, 10, 0.12, 0]];
const DesertWorld: React.FC<{ t: number; target?: V3 }> = ({ t, target = [0, 0, 0] }) => (<>
  <DaySky top="#4f9be6" horizon="#f6e7c8" haze="#f3e1bf" fogNear={30} fogFar={170} warm={0.6} sun={[40, 50, -140]} />
  <SunRig target={target} dir={[5, 11, 4]} k={1.15} />
  <DayGround base="#ecc887" speck="#d7a965" />
  {DUNES.map(([x, z, r, sy, c], i) => <Ball key={i} p={[x, -r * sy * 0.35, z]} r={r} s={[1.6, sy, 1]} color={disp(c ? "#efcd8f" : "#e6bd7c")} ink={0.02} />)}
  <Glb name="desert_mesa" p={[-30, 0, -110]} s={[1.6, 1.2, 1.2]} line={2} />
  <Glb name="desert_mesa" p={[40, 0, -130]} s={[1.2, 0.9, 1]} rot={[0, 1.2, 0]} line={2} />
  <Glb name="cactus" p={[-5.5, 0, -6]} s={0.9} line={2} blob={0.6} />
  <Glb name="cactus" p={[7, 0, -14]} s={1.1} rot={[0, 1, 0]} line={2} blob={0.6} />
  {[[3.2, 0, 1.4, 0.45], [-2.8, 0, 2.6, 0.3], [5.5, 0, -2, 0.7], [-7, 0, -1, 0.55]].map(([x, y, z, r], i) => <Ball key={i} p={[x, y + r * 0.3, z]} r={r} s={[1.3, 0.75, 1]} color={disp(i % 2 ? "#b6774a" : "#a5653d")} />)}
  <HeatShimmer t={t} p={[0, 1.6, -8]} s={[60, 5]} o={0.09} />
  <HeatShimmer t={t + 3} p={[0, 2.4, -22]} s={[90, 7]} o={0.08} />
  <Clouds t={t} at={[[-50, 30, -140], [40, 36, -160]]} s={4} />
</>);
/** ICE SHEET: flat white ice to the horizon, pale-blue ridges and blocks, crisp sky, drifting snow (no animals) */
const IceWorld: React.FC<{ t: number; target?: V3 }> = ({ t, target = [0, 0, 0] }) => (<>
  <DaySky top="#5aa7e6" horizon="#e8f5fc" haze="#e3f1f9" fogNear={30} fogFar={170} />
  <SunRig target={target} dir={[-6, 9, 6]} k={0.95} fill={1.15} />
  <DayGround base="#eef7fc" speck="#cfe6f3" seed={7} />
  {[[-9, -10, 1.3, 0.3], [11, -16, 1.6, 2.2], [-20, -34, 2.6, 1], [26, -44, 3.2, 4], [-4, -60, 4, 0.5], [-44, -80, 5, 2], [46, -95, 6, 5]].map(([x, z, s, r], i) => <Glb key={i} name="ice_floe" p={[x, 0, z]} s={[s, s * (0.7 + (i % 3) * 0.3), s]} rot={[0, r, 0]} line={2} fallback={<Box p={[x, s * 0.6, z]} s={[s * 5, s * 1.2, s * 4]} color={disp("#bfe3f3")} />} />)}
  {[[-60, -150, 30], [10, -170, 40], [80, -160, 34]].map(([x, z, r], i) => <Ball key={i} p={[x, -r * 0.55, z]} r={r} s={[1.8, 0.6, 1]} color={disp("#f4fbff")} ink={0.01} />)}
  <Motes t={t} c={[0, 2, 0]} area={[10, 3, 6]} n={30} color="#ffffff" size={0.05} o={0.75} />
  <Clouds t={t} at={[[-40, 28, -130], [30, 34, -150], [70, 24, -120]]} s={5} />
</>);
/** CITY seen from above: a tiny cluster of towers + roads in a huge patchwork of fields, forest, a lake and sand */
const FIELDS: [number, number, number, number, string][] = [
  [-60, -40, 60, 50, "#9fcf7a"], [10, -70, 70, 40, "#b7d97f"], [70, -20, 50, 70, "#8cc46b"], [-80, 40, 50, 60, "#c9d98a"], [40, 60, 80, 50, "#9fcf7a"],
  [-20, 80, 60, 40, "#e2c98a"], [100, 70, 60, 60, "#7fb85e"], [-110, -90, 70, 60, "#e9c48e"], [90, -110, 80, 60, "#b7d97f"],
];
const CityWorld: React.FC<{ t: number; target?: V3 }> = ({ t, target = [0, 0, 0] }) => (<>
  <DaySky fogNear={220} fogFar={700} />
  <SunRig target={target} dir={[6, 12, 5]} />
  <DayGround base={DAY.grass} speck="#6fae52" size={1400} z={0} />
  {FIELDS.map(([x, z, w, d, c], i) => <mesh key={i} position={[x, 0.02 + i * 0.002, z]} rotation={[-Math.PI / 2, 0, (i % 3) * 0.12]}><planeGeometry args={[w, d]} /><meshLambertMaterial color={disp(c)} /></mesh>)}
  <mesh position={[-70, 0.05, 10]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[18, 40]} /><meshLambertMaterial color={disp("#2a9fd6")} /></mesh>
  {Array.from({ length: 26 }, (_, i) => <Ball key={i} p={[60 + (i % 6) * 5 + Math.sin(i) * 2, 1.5, 20 + Math.floor(i / 6) * 5]} r={2.4} color={disp(i % 2 ? "#4e9a43" : "#5aa64a")} ink={0.02} />)}
  {/* roads out of town */}
  {[[0, 0, 4, 600, 0], [0, 0, 4, 600, Math.PI / 2], [0, 0, 3, 500, 0.7]].map(([x, z, w, l, r], i) => <mesh key={i} position={[x, 0.06 + i * 0.002, z]} rotation={[-Math.PI / 2, 0, r]}><planeGeometry args={[w, l]} /><meshLambertMaterial color={disp("#8f939b")} /></mesh>)}
  <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[30, 28]} /><meshLambertMaterial color={disp("#d8d2c4")} /></mesh>
  {[[-9, -8, 0.55, 0], [9, -9, 0.6, 1.2], [-10, 9, 0.5, 2.4], [10, 8, 0.62, 3.1], [0, -12, 0.45, 0.6], [-13, 0, 0.4, 1.8], [13, 0, 0.45, 2.7]].map(([x, z, s, r], i) => <Glb key={i} name="city_block" p={[x, 0.08, z]} s={s * 1.5} rot={[0, r, 0]} line={2} />)}
  <Clouds t={t} at={[[-40, 60, -60], [50, 70, 40], [10, 80, -120]]} s={6} />
</>);
/** GAME safe respawn spot: sunny beach with umbrella + palms (the game always puts you somewhere safe) */
const BeachWorld: React.FC<{ t: number; target?: V3 }> = ({ t, target = [0, 0, 0] }) => (<>
  <DaySky fogNear={40} fogFar={200} />
  <SunRig target={target} />
  <DayGround base={DAY.sand} speck="#d9b27a" />
  <WaterSurface t={t} p={[0, 0.03, -70]} s={[400, 100]} color="#3cb8e0" o={0.9} glint={0.3} rep={60} />
  <Glb name="beach_umbrella" p={[2.6, 0, -1.2]} s={1.3} line={2} blob={1.2} />
  <Palms at={[[-6, 0, -6], [7, 0, -9], [-12, 0, -14], [14, 0, -18]]} s={1.2} />
  <CityBackdrop z={-120} spread={180} />
  <Clouds t={t} at={[[-30, 28, -120], [24, 34, -140], [55, 24, -110]]} s={5} />
</>);

// ---------------------------------------------------------------- odds states (what the bar already shows)
const NOW = -999, LATER = 99999;
const ODDS0: Odds = { ocean: LATER, land: LATER, desert: LATER, ice: LATER, city: LATER };

// ---------------------------------------------------------------- shot builder
type View = { world: React.ReactNode; hud?: React.ReactNode };
const OCEAN_LL: LL = [-150, -12], SAHARA_LL: LL = [14, 22], ANT_LL: LL = [70, -80], CITY_LL: LL = [2.3, 48.8];
/** default globe camera: the globe sits low in frame, HUD room on top */
const GCAM = (z = 40, y = 4.0, ly = 2.0, fov = 44): CamPose => ({ pos: [0, y, z], look: [0, ly, 0], fov });
const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number, sub: number, us: number, ls: number): View => {
  const t = f / FPS;
  switch (id) {
    case "hook": {
      // sub 0 = PULL BACK (reveal): from Remy standing on top of a big toy-like globe, back to the whole planet in the sky
      // sub 1 = ORBIT: a slow arc round the globe; hospital + safe house icons get struck out; the cyan pin appears
      const NH = C("No hospital,", 70), NS = C("no safe house.", 95), JR = C("Just a random", 120);
      const R: V3 = [0, GR - 0.05, 0.4];
      const world = <>
        <SkyWorld t={t} />
        <Earth rot={[0.12, -0.6 - t * 0.12]} />
        <Halo p={[0, GR + 1.2, 0.2]} r={2.4} color="#ffffff" o={0.35} />
        <Person p={R} look={REMY} pose={{ mood: sub ? "worry" : "grin", arms: sub ? "shrug" : "down", lookX: 0.2 }} f={f} shadow={false} />
        {sub === 1 && u > JR - 4 ? <group position={[3.4, GR + 1.6 + 0.3 * Math.sin(u * 0.15), 2.5]} rotation={[0, u * 0.25, 0]} scale={1.5 * k(u, JR - 4, JR + 6, 0.2, 1)}>
          <Glb name="map_pin" line={2} fallback={<mesh position={[0, 1, 0]}><sphereGeometry args={[0.5, 16, 12]} /><meshBasicMaterial color={disp(CYAN)} toneMapped={false} /></mesh>} />
          <Halo p={[0, 1.4, 0]} r={1.7} color={CYAN} o={0.45} />
        </group> : null}
        {!sub ? <Move us={us} ls={ls} at={line({ pos: [0.6, GR + 2.6, 7.2], look: [0, GR + 1.3, 0.4], fov: 46 }, { pos: [0, 7.0, 40], look: [0, 4.4, 0], fov: 44 })} />
          : <Move us={us} ls={ls} at={orbit([0, 3.4, 0], 40, 3.0, -0.32, 0.22, 44)} />}
      </>;
      if (!sub) {
        const wp = k(u, 0, 34, 0.42, 1, EASE.arrive);
        return { world, hud: <><StrokeWord text="WHAT IF" x={540} y={565} h={125} p={wp} /><HudText f={u} x={540} y={415} size={56} color={AMBER} at={22}>#9</HudText></> };
      }
      return { world, hud: <>
        <IconTile f={u} x={380} y={470} at={NH - 4} icon="hospital" strike={k(u, NH + 4, NH + 16, 0, 1)} />
        <IconTile f={u} x={700} y={470} at={NS - 4} icon="house" strike={k(u, NS + 4, NS + 16, 0, 1)} />
      </> };
    }
    case "r1": { // CRANE UP (rise + tilt down): the cyan dice tumbles over the globe, the globe spins, the camera rises to look down on the Pacific as the pin drops into it on "Respawn one."
      const R1 = C("Respawn one.", 30);
      const drop = Math.max(10, Math.min(len - 22, R1 + 4));
      const rot = spawnRot(u, OCEAN_LL, drop - 2, 2.2);
      const land = u >= drop + 12 ? u - drop - 12 : -1;
      const dq = clamp(u / 30), dice: V3 = [-6 + 11 * dq, GR + 1.5 + 3.6 * Math.sin(dq * Math.PI), 5];
      const world = <>
        <SkyWorld t={t} />
        <Earth rot={rot}><Pin ll={OCEAN_LL} lift={pinLift(u, drop)} spin={u * 0.35} land={land} /></Earth>
        {dq < 1 && <><Dice p={dice} rot={[u * 0.3, u * 0.42, u * 0.2]} s={0.9} /><Halo p={dice} r={1.6} color={CYAN} o={0.5} /></>}
        <Move us={us} ls={ls} at={line(GCAM(40, 6, 2.6), { pos: [2.5, 11, 27], look: [0, 2.0, 3.6], fov: 44 })} />
      </>;
      return { world, hud: <SpawnTracker f={u} at={u < R1 ? 4 : NOW} active={u < R1 - 6 ? -1 : 0} /> };
    }
    case "ocean": {
      // sub 0 = LOW ANGLE (waterline push): Remy pops up in his swim ring with a splash, grinning, open ocean behind
      // sub 1 = ORBIT: a slow arc round Remy bobbing in the ring; the 71% value + the ocean part of the odds bar
      const SO = C("About seventy one", 70), PC = C("percent of Earth's", 90);
      const R: V3 = [0, 0, 0];
      const world = <>
        <OceanWorld t={t} target={R} />
        <Floater p={R} f={f} t={t} rise={sub ? 1 : k(u, 0, 12, 0, 1, Easing.out(Easing.back(1.4)))} pose={{ mood: sub ? "grin" : "laugh", arms: sub ? "down" : "up", armK: 0.7 }} />
        {!sub && <Splash p={[0, 0.1, 0]} u={u} at={2} s={1.5} />}
        {!sub ? <Move us={us} ls={ls} at={line({ pos: [0.8, 0.55, 8.6], look: [0, 1.4, 0], fov: 46 }, { pos: [0.5, 0.65, 6.8], look: [0, 1.5, 0], fov: 46 })} />
          : <Move us={us} ls={ls} at={orbit([0, 0.9, 0], 8.2, 1.6, -0.45, 0.3, 44)} />}
      </>;
      const hud = sub ? <>
        <OddsBar f={u} y={360} at={{ ...ODDS0, ocean: PC - 4 }} />
        <Plate x={300} y={530} w={480} h={190} o={arrive(u, SO, 10)} r={30} />
        <HudText f={u} x={540} y={675} size={150} color={CYAN} at={SO + 6} spacing={4}>71%</HudText>
      </> : null;
      return { world, hud };
    }
    case "far": {
      // sub 0 = CRANE UP (rising reveal): from Remy in his ring up and back until he is small in an ocean that runs to the horizon
      // sub 1 = TOP-DOWN (lowering): straight down on Remy in his ring, a dashed range circle spreads round him: no land in it
      const FA = C("Far from any", 110);
      const R: V3 = [0, 0, 0];
      const world = <>
        <OceanWorld t={t} target={R} />
        <Floater p={R} f={f} t={t} pose={sub ? { mood: "worry", arms: "shrug" } : { mood: "deadpan", arms: "down", lookX: -0.4 }} />
        {sub ? <Move us={us} ls={ls} at={line({ pos: [0, 34, 1.2], look: [0, 0, 0], fov: 46 }, { pos: [0, 22, 0.9], look: [0, 0, 0], fov: 46 })} />
          : <Move us={us} ls={ls} at={line({ pos: [0.4, 2.6, 7.5], look: [0, 1.0, 0], fov: 46 }, { pos: [0, 15, 21], look: [0, 0, -12], fov: 46 })} />}
      </>;
      const rr = k(u, FA, FA + 30, 60, 360, Easing.out(Easing.cubic));
      const hud = sub ? <>
        <circle cx={540} cy={1000} r={rr} fill="none" stroke={CREAM} strokeWidth={5} strokeDasharray="18 16" opacity={0.8 * drawOn(u, FA, 8)} />
        <IconTile f={u} x={540} y={470} at={FA + 6} icon="land" strike={k(u, FA + 14, FA + 26, 0, 1)} />
      </> : <OddsBar f={u} y={360} at={{ ...ODDS0, ocean: NOW }} glow="ocean" />;
      return { world, hud };
    }
    case "r2": { // ORBIT: a slow arc round the globe as it spins Africa to the front; the pin drops on land (Sahara); the gold land part fills
      const TN = C("twenty nine", 60), FL = C("land. But", 40);
      const drop = Math.max(12, FL - 12);
      const rot = spawnRot(u, SAHARA_LL, drop - 2, 1.1, 0.6);
      const land = u >= drop + 12 ? u - drop - 12 : -1;
      const world = <>
        <SkyWorld t={t} />
        <Earth rot={rot}><Pin ll={SAHARA_LL} lift={pinLift(u, drop)} spin={u * 0.35} land={land} /></Earth>
        <Move us={us} ls={ls} at={orbit([0, 1.6, 0], 40, 2.2, 0.3, -0.2, 44)} />
      </>;
      const hud = <>
        <SpawnTracker f={u} at={NOW} active={1} />
        <OddsBar f={u} y={440} at={{ ...ODDS0, ocean: NOW, land: TN - 4 }} />
        <HudText f={u} x={540} y={720} size={120} color={GOLD} at={TN + 4} spacing={4}>29%</HudText>
      </>;
      return { world, hud };
    }
    case "desert": {
      // sub 0 = CRANE + LAND: from high over the dunes the camera descends and lands level on Remy in the hot sand
      // sub 1 = DOLLY ZOOM (vertigo): toward the sweating Remy while the dunes stretch away; sand, rocks, heat icons
      const AT = C("And about a third", 0), SD = C("Sand, rocks, and", 120), RK = C("rocks, and heat.", 128), HT = C("heat.", 140);
      const R: V3 = [0, 0, 0];
      const world = <>
        <DesertWorld t={t} target={R} />
        <Hero p={R} look={REMY} pose={sub ? { mood: "tired", arms: "head", sweat: 1, nerv: 0.4 } : { mood: "shock", arms: "shrug", sweat: 0.6 }} f={f} rimO={0.35} />
        {!sub ? <Move us={us} ls={ls} at={line({ pos: [1.5, 14, 18], look: [0, 0.5, -4], fov: 46 }, { pos: [0.6, 2.6, 9.4], look: [0, 1.9, 0], fov: 46 })} />
          : <Move us={us} ls={ls} at={dollyZoom([0, 1.6, 0], [0.08, 0.12, 1], 10, 4.2, 30)} />}
      </>;
      const hud = !sub ? <LandDisc f={u} x={330} y={540} at={AT + 8} frac={1 / 3} color={AMBER} icon="dune" value="~1/3" valueAt={AT + 16} />
        : <>
          <IconTile f={u} x={300} y={470} at={SD - 2} icon="dune" color={AMBER} />
          <IconTile f={u} x={540} y={470} at={RK} icon="rock" color={AMBER} />
          <IconTile f={u} x={780} y={470} at={HT - 2} icon="sun" color={AMBER} />
        </>;
      return { world, hud };
    }
    case "r3": { // CRANE DOWN (under): the camera sinks below the globe as it tips Antarctica toward us; the pin drops on the white ice
      const drop = Math.min(len - 24, 20);
      const rot = spawnRot(u, ANT_LL, drop - 2, 0.9, 1, -0.4);
      const land = u >= drop + 12 ? u - drop - 12 : -1;
      const world = <>
        <SkyWorld t={t} />
        <Earth rot={rot}><Pin ll={ANT_LL} lift={pinLift(u, drop)} spin={u * 0.35} land={land} /></Earth>
        <Move us={us} ls={ls} at={line(GCAM(40, 6, 1.8), { pos: [0, -4, 34], look: [0, 1.2, 0], fov: 44 })} />
      </>;
      return { world, hud: <><SpawnTracker f={u} at={NOW} active={2} /><OddsBar f={u} y={440} at={{ ...ODDS0, ocean: NOW, land: NOW, desert: NOW }} /></> };
    }
    case "ice": {
      // sub 0 = TRACKING (truck): the camera trucks sideways with Remy sliding across the flat ice sheet, arms out
      // sub 1 = PUSH-IN: on Remy shivering next to an ice block; a mini globe icon with its two ice caps lit
      const RT = C("Roughly a tenth", 0), MA = C("mostly in Antarctica", 120);
      const e = shotE(us, ls);
      const x = sub ? 0 : -4 + 6 * e;
      const R: V3 = [x, 0, 0];
      const world = <>
        <IceWorld t={t} target={R} />
        {sub && <Glb name="ice_floe" p={[2.6, 0, -2.4]} s={[0.55, 0.8, 0.55]} rot={[0, 0.6, 0]} line={2} />}
        <Hero p={R} look={REMY} pose={sub ? { mood: "worry", arms: "chest", nerv: 1 } : { mood: "shock", arms: "up", armK: 0.6, tilt: 0.12 }} f={f} rimO={0.35} />
        {!sub && <mesh position={[x - 1.4, 0.05, 0.1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3, 0.25]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.6} depthWrite={false} /></mesh>}
        {sub ? <Move us={us} ls={ls} at={line({ pos: [0.6, 2.6, 11.5], look: [0.3, 1.8, -0.5], fov: 46 }, { pos: [0.3, 2.3, 7.6], look: [0.2, 1.9, -0.4], fov: 46 })} />
          : <Move us={us} ls={ls} at={() => ({ pos: [x + 1.0, 2.7, 10.2], look: [x + 0.6, 1.7, 0], fov: 46 })} />}
      </>;
      const hud = !sub ? <LandDisc f={u} x={330} y={540} at={RT + 8} frac={0.1} color={CREAM} icon="snow" value="~1/10" valueAt={RT + 16} />
        : (() => {
          const p = drawOn(u, MA - 4, 12); if (p <= 0) return null;
          const caps = drawOn(u, MA + 4, 12);
          return <g opacity={p} transform={`translate(540 ${520 - (1 - p) * 14})`}>
            <circle r={118} fill="#0b0d1a" opacity={0.55} />
            <circle r={96} fill={CYAN} opacity={0.35} /><circle r={96} fill="none" stroke={GOLD} strokeWidth={5} />
            <path d="M -40 -40 C -20 -70 30 -60 40 -30 C 50 0 10 10 -10 0 C -40 -10 -50 -20 -40 -40 Z M 10 20 C 40 10 60 30 40 60 C 20 70 0 50 10 20 Z" fill={GOLD} opacity={0.55} />
            <ellipse cx={0} cy={86} rx={60 * caps} ry={12} fill={CREAM} stroke="#0b0d1a" strokeWidth={3} />
            <ellipse cx={-34} cy={-78} rx={22 * caps} ry={12 * caps} fill={CREAM} stroke="#0b0d1a" strokeWidth={3} />
          </g>;
        })();
      return { world, hud };
    }
    case "r4": { // PUSH-IN: slow push toward Europe as the pin wobbles down on one tiny coral city light
      const drop = Math.min(len - 30, 34);
      const rot = spawnRot(u, CITY_LL, drop - 2, 0.8, 0.7);
      const land = u >= drop + 12 ? u - drop - 12 : -1;
      const world = <>
        <SkyWorld t={t} />
        <Earth rot={rot}>
          <Pin ll={CITY_LL} lift={pinLift(u, drop)} spin={u * 0.35} land={land} s={0.75} color={CYAN} />
        </Earth>
        <Move us={us} ls={ls} at={line(GCAM(40, 4.5, 1.8), { pos: [0, 5.5, 29], look: [0, 2.4, 2.5], fov: 44 })} />
      </>;
      return { world, hud: <><SpawnTracker f={u} at={NOW} active={3} /><OddsBar f={u} y={440} at={{ ...ODDS0, ocean: NOW, land: NOW, desert: NOW, ice: NOW }} /></> };
    }
    case "city": { // CRANE UP (top-down reveal): from Remy waving on a small plaza straight up until the whole town is a tiny grey patch in a huge countryside
      const CT = C("Cities and towns", 0), FP = C("a few percent", 70);
      const R: V3 = [0.5, 0.08, 4];
      const world = <>
        <CityWorld t={t} target={R} />
        <Hero p={R} look={REMY} pose={{ mood: "grin", arms: "up", armK: 0.8 + 0.2 * Math.sin(u * 0.3) }} f={f} rimO={0.4} />
        <Move us={us} ls={ls} at={line({ pos: [1.6, 4.5, 13], look: [0.5, 1.8, 3.5], fov: 46 }, { pos: [0.5, 175, 6.5], look: [0.5, 0, 3.0], fov: 46 })} />
      </>;
      const hud = <>
        <OddsBar f={u} y={360} at={{ ...ODDS0, ocean: NOW, land: NOW, desert: NOW, ice: NOW, city: FP - 4 }} />
        <HudText f={u} x={540} y={640} size={130} color={CORAL} at={Math.max(CT + 30, FP + 2)} spacing={4}>1-3%</HudText>
      </>;
      return { world, hud };
    }
    case "total": { // DOLLY ZOOM (vertigo): on the globe while the odds bar grows big; the city sliver is circled; the 0.29 x 0.03 math and < 1%
      const LC = C("landing in a", 40), LO = C("less than one", 70);
      const world = <>
        <SkyWorld t={t} />
        <Earth rot={[0.25, -1.9 - t * 0.12]} />
        <Move us={us} ls={ls} at={dollyZoom([0, 3.2, 0], [0, 0.06, 1], 62, 30, 30)} />
      </>;
      const hud = <>
        <OddsBar f={u} y={360} at={{ ocean: NOW, land: NOW, desert: NOW, ice: NOW, city: NOW }} glow={u > LC ? "city" : undefined} />
        <Plate x={210} y={540} w={660} h={270} o={arrive(u, LC - 6, 10)} r={34} />
        <HudText f={u} x={540} y={625} size={60} color={CREAM} at={LC - 2} spacing={1}>0.29 × 0.03</HudText>
        <HudText f={u} x={540} y={770} size={130} color={CORAL} at={LO + 4} spacing={4}>{"< 1%"}</HudText>
      </>;
      return { world, hud };
    }
    case "game": { // LOW HERO ANGLE: from the sand up at Remy appearing in a cyan respawn beam under a beach umbrella, the game's safe spot
      const R: V3 = [0, 0, 1];
      const ap = k(u, 6, 30, 0, 1, Easing.out(Easing.cubic));
      const world = <>
        <BeachWorld t={t} target={R} />
        <Beam p={R} h={9} r={1.1} o={1 - 0.6 * ap} />
        <Ghost p={R} f={f} o={0.85 * (1 - ap)} />
        {ap > 0.05 && <Hero p={R} look={REMY} pose={{ mood: "grin", arms: "up", armK: 0.7 }} f={f} rimO={0.45 * ap} />}
        <Move us={us} ls={ls} at={line({ pos: [0.6, 0.5, 10.5], look: [0.3, 1.9, 0], fov: 48 }, { pos: [0.4, 0.6, 9.0], look: [0.3, 1.9, 0], fov: 48 })} />
      </>;
      return { world, hud: <IconTile f={u} x={540} y={470} at={18} icon="check" color={CYAN} /> };
    }
    case "sea": { // PULL BACK: from close on the globe back to the full planet while pin after pin keeps landing in the blue
      const DROPS: [LL, number][] = [[[-150, 10], 4], [[-170, -25], 12], [[-130, -10], 19], [[170, 15], 26], [[-140, 35], 32], [[-175, 2], 38], [[-120, -35], 44], [[160, -20], 50], [[-155, -45], 56], [[-125, 18], 62]];
      const world = <>
        <SkyWorld t={t} />
        <Earth rot={[faceRot([-150, 0])[0] + 0.3, faceRot([-150, 0])[1] + 0.5 - k(us, 0, ls, 0, 0.8, Easing.linear)]}>
          {DROPS.map(([ll, at], i) => u >= at ? <Pin key={i} ll={ll} lift={Math.max(0, 4 * (1 - Math.pow(clamp((u - at) / 10), 2)))} spin={u * 0.3} land={u - at - 10} s={0.6} /> : null)}
        </Earth>
        <Move us={us} ls={ls} at={line({ pos: [0, 4.0, 24], look: [0, 2.2, 0], fov: 44 }, GCAM(42, 4.5, 2.0))} />
      </>;
      const ocean = DROPS.filter(([, at]) => u >= at + 10).length;
      const hud = <>
        <OddsBar f={u} y={360} at={{ ocean: NOW, land: NOW, desert: NOW, ice: NOW, city: NOW }} glow="ocean" />
        <g opacity={drawOn(u, 6, 10)}>
          <Plate x={370} y={540} w={340} h={130} o={1} r={30} />
          <g transform="translate(440 605) scale(0.75)"><NeonPath d={ICON.pin} w={6} color={CYAN} hot /></g>
          <text x={520} y={636} fontFamily={WI_FONT} fontWeight={900} fontSize={84} fill={CYAN} stroke="#0b0d1a" strokeWidth={10} paintOrder="stroke" style={{ fontVariantNumeric: "tabular-nums" }}>{`× ${ocean}`}</text>
        </g>
      </>;
      return { world, hud };
    }
    default: { // ask - PUSH-IN: a gentle push on Remy waving from his swim ring in the sunny ocean; the question card (A-D)
      const R: V3 = [0, 0, 0];
      const world = <>
        <OceanWorld t={t} target={R} />
        <Floater p={R} f={f} t={t} pose={{ mood: "grin", arms: "up", armK: 0.6 }} />
        <Move us={us} ls={ls} at={line({ pos: [0.8, 1.6, 11.5], look: [0, 1.2, 0], fov: 46 }, { pos: [0.5, 1.4, 9.0], look: [0, 1.3, 0], fov: 46 })} />
      </>;
      const hud = <>
        <HudText f={u} x={540} y={420} size={60} color={CREAM} at={4} out={len + 30}>COMMENT</HudText>
        <HudText f={u} x={540} y={505} size={76} color={GOLD} at={8} out={len + 30}>A, B, C OR D</HudText>
        <ChoiceCards f={u} y={720} at={12} cw={470} ch={130} cards={[{ letter: "A", text: "OCEAN" }, { letter: "B", text: "DESERT" }, { letter: "C", text: "ICE" }, { letter: "D", text: "CITY" }]} />
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
  id: "wi-gta-respawn",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: N3.bg,
};
export default story;
