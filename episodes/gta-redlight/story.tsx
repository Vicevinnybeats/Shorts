// "He Can Do Anything in GTA 6. He Still Stops at Red Lights" - 2.5D. Hook: Kai can do anything in GTA 6 and still
// stops at every red light (our own simple drawn road, car and traffic light on the TV; never game art or logos;
// "GTA 6" only as plain words). A PC Gamer writer posted "Help: I can't stop obeying traffic laws in GTA 6" (headline
// quoted on a plain card, no logo). Science: Wood, Quinn & Kashy (2002) hourly diary studies: ~43% of actions were
// habits in one study (done almost daily, same place, mind elsewhere). Habit = cue -> action. Twist: Nia moves the
// cereal, Kai opens the old cupboard three times.
// Sets: livingroom.tsx (sofa, wall, floor) with a locally drawn TV, lab.tsx for explainers, kitchen.tsx wall with two
// locally drawn upper cupboards. Sofa at y 1300 (scale 0.8) so nobody stands in the caption band in wide shots.
// Motion rules (src/engine25/motion.tsx): arrivals EASE.arrive, exits EASE.exit, camera EASE.camera; every label enters
// and exits; nothing holds still for more than ~3 s. On-screen text is drawn in screen space inside SAFE_TEXT
// (y 300-1350, x 60-960) and hidden during crossfades.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, ShotSpan, cueTime, FPS } from "../../src/engine/timeline";
import type { Word } from "../../src/captions/Captions";
import { Stage, Layer, Svg, Cam, drift, kickCam } from "../../src/engine25/stage";
import { Grade, Mood, Pool } from "../../src/engine25/light";
import { EASE, arrive, leave, Label, stampScale, countValue } from "../../src/engine25/motion";
import { Person, Look, INK, Expr, Pose } from "../../library/characters25/person";
import { CAST } from "../../library/style/channel";
import { Lab, LAB } from "../../library/environments25/lab";
import { LIVING, LivingWall, LivingFloor, Sofa, Rug } from "../../library/environments25/livingroom";
import { KITCHEN, KitchenWall } from "../../library/environments25/kitchen";
import { handPos, SweatDrop } from "../../library/environments25/gamenight";
import { reachLimb } from "../../library/environments25/square";
import scenes from "../../content/scripts/gta-redlight.json";

const SHOTS = scenes.shots.map((s) => ({ id: s.id, cue: s.cue }));

const NoText = React.createContext(false);
const Words = React.createContext<Word[]>([]);
const cueAt = (words: Word[], phrase: string, span: ShotSpan, fallback: number) => {
  try { return Math.round(cueTime(words, phrase, span.a / FPS - 0.3) * FPS) - span.a; } catch { return fallback; }
};

const MOODS: Record<string, Mood> = {
  home: { grade: "#3a2a6b", gradeOp: 0.1, vignette: 0.5, glow: "#ffd9a0" },
  tv: { grade: "#1a2a6b", gradeOp: 0.06, vignette: 0.45 },
  lab: { grade: "#0b1430", gradeOp: 0.04, vignette: 0.45 },
  morning: { grade: "#ffd9a0", gradeOp: 0.06, vignette: 0.35 },
};

const k = (u: number, a: number, b: number, from: number, to: number, e = EASE.camera) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
type Pt = { x: number; y: number };
const { gold: GOLD, red: RED, green: GREEN, text: CREAM, muted: MUTED } = LAB;
const FONT = "CaptionSans, sans-serif";
const pop = (u: number, a: number, d = 9) => (u < a ? 0 : k(u, a, a + d, 0, 1, Easing.out(Easing.back(2.2))));
const blinkOf = (f: number, seed: number) => ((f + seed * 37) % 103) < 4;
const toS = (c: Cam, p: Pt): Pt => ({ x: (p.x - 540 - c.x) * c.zoom + 540, y: (p.y - 960 - c.y) * c.zoom + 960 });
const on = (p: Pt, zoom: number, rot = 0): Cam => ({ x: p.x - 540, y: p.y - 960, zoom, rot });

const KAI: Look = CAST.kai, NIA: Look = CAST.nia;
const LRED = "#ff3b30", LGREEN = "#2fdc6a";

// ---------------------------------------------------------------- the TV and our own drawn road (no game art)
type RoadState = { light: "red" | "green"; drive?: number; speed?: number; cross?: number; brake?: number };
const RoadScreen: React.FC<{ f: number; s: RoadState; id: string }> = ({ f, s, id }) => {
  const { light, drive = 0, speed = 0, cross = -1, brake = 1 } = s;
  const off = (f * speed * 0.03) % 1;
  const cy = 140 - 165 * drive, cs = 1 - 0.78 * drive;
  return <g>
    <defs><clipPath id={id}><rect x={-380} y={-215} width={760} height={430} rx={8} /></clipPath></defs>
    <g clipPath={`url(#${id})`}>
      <rect x={-380} y={-215} width={760} height={180} fill="#8cc4f0" />
      <circle cx={-250} cy={-150} r={34} fill="#fff1c2" />
      {[[-380, 90, 110], [-290, 70, 150], [-215, 80, 95], [140, 70, 130], [215, 90, 160], [310, 70, 105]].map(([x, w, h], i) =>
        <g key={i}><rect x={x} y={-40 - h} width={w} height={h} fill={i % 2 ? "#6f7fa8" : "#5a6890"} stroke={INK} strokeWidth={3} />
          {Array.from({ length: Math.floor(h / 34) }, (_, j) => <rect key={j} x={x + 14} y={-30 - h + 14 + j * 34} width={w - 28} height={12} fill="#c9d6ff" opacity={0.5} />)}</g>)}
      <rect x={-380} y={-40} width={760} height={255} fill="#6aa04e" />
      <path d="M -24 -40 L 24 -40 L 330 215 L -330 215 Z" fill="#3c4150" />
      <rect x={-380} y={8} width={760} height={50} fill="#3c4150" />
      {Array.from({ length: 7 }, (_, i) => { const t = (i / 7 + off) % 1, y = -40 + t * t * 255, w = 2 + t * 7, h = 6 + t * 22;
        return y > 8 && y < 58 ? null : <rect key={i} x={-w} y={y} width={w * 2} height={h} fill="#f2d36b" />; })}
      <rect x={-160} y={70} width={320} height={9} fill="#ffffff" />
      {cross >= 0 && cross <= 1 && <g transform={`translate(${-520 + 1040 * cross} 34)`}>
        <rect x={-80} y={-30} width={160} height={42} rx={14} fill="#3a6fd0" stroke={INK} strokeWidth={5} />
        <path d="M -44 -30 L -28 -54 L 34 -54 L 50 -30 Z" fill="#9fd3f0" stroke={INK} strokeWidth={5} />
        <circle cx={-48} cy={14} r={14} fill={INK} /><circle cx={48} cy={14} r={14} fill={INK} />
        {[1, 2, 3].map((j) => <path key={j} d={`M ${-100 - j * 26} ${-18 + j * 8} l -40 0`} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.8} />)}
      </g>}
      <g transform={`translate(0 ${cy}) scale(${cs})`}>
        <ellipse cx={0} cy={44} rx={92} ry={12} fill="#000" opacity={0.3} />
        <rect x={-74} y={20} width={30} height={30} rx={6} fill={INK} /><rect x={44} y={20} width={30} height={30} rx={6} fill={INK} />
        <path d="M -58 -30 L -44 -70 L 44 -70 L 58 -30 Z" fill="#9fd3f0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <rect x={-84} y={-34} width={168} height={66} rx={18} fill="#e8443a" stroke={INK} strokeWidth={6} />
        <rect x={-30} y={4} width={60} height={18} rx={4} fill="#f6efe0" stroke={INK} strokeWidth={3} />
        {[-62, 62].map((x) => <g key={x}><circle cx={x} cy={-10} r={22} fill={LRED} opacity={0.25 * brake} /><rect x={x - 14} y={-18} width={28} height={16} rx={5} fill={brake > 0.5 ? "#ff6a5a" : "#9a2a22"} stroke={INK} strokeWidth={3} /></g>)}
      </g>
      <rect x={226} y={-150} width={10} height={250} fill="#2a2e38" />
      <g transform="translate(231 -150)">
        <rect x={-30} y={-84} width={60} height={168} rx={12} fill="#1b1d26" stroke={INK} strokeWidth={5} />
        <circle cy={-52} r={20} fill={light === "red" ? LRED : "#4a2020"} />
        <circle cy={0} r={20} fill="#4a3c18" />
        <circle cy={52} r={20} fill={light === "green" ? LGREEN : "#183a22"} />
        <circle cy={light === "red" ? -52 : 52} r={34 + 3 * Math.sin(f * 0.3)} fill={light === "red" ? LRED : LGREEN} opacity={0.28} />
      </g>
    </g>
  </g>;
};
/** our TV on a low cabinet; (x, y) = screen centre; cabinet bottom at y + 540*s */
const GameTV: React.FC<{ x: number; y: number; s?: number; f: number; road: RoadState; id: string }> = ({ x, y, s = 1, f, road, id }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={560} ry={380} fill={road.light === "red" ? LRED : "#7fc8ff"} opacity={0.08} />
    <rect x={-330} y={300} width={660} height={220} rx={12} fill={LIVING.wood} stroke={INK} strokeWidth={8} />
    <path d="M 0 310 L 0 500" stroke={INK} strokeWidth={6} />
    <circle cx={-30} cy={410} r={9} fill="#e8c46a" stroke={INK} strokeWidth={3} /><circle cx={30} cy={410} r={9} fill="#e8c46a" stroke={INK} strokeWidth={3} />
    {[-290, 290].map((lx) => <rect key={lx} x={lx - 10} y={516} width={20} height={24} fill={LIVING.wood2} stroke={INK} strokeWidth={5} />)}
    <rect x={-50} y={240} width={100} height={62} fill="#2a2e38" stroke={INK} strokeWidth={6} />
    <rect x={-402} y={-237} width={804} height={474} rx={18} fill={LIVING.tv} stroke={INK} strokeWidth={9} />
    <RoadScreen f={f} s={road} id={id} />
  </g>
);
const TVRoom: React.FC<{ f: number; road: RoadState; id: string }> = ({ f, road, id }) => (
  <>
    <Layer p={0.6}><Svg><LivingWall y={-300} h={1600} /></Svg></Layer>
    <Layer p={1}><Svg>
      <LivingFloor y={1300} h={900} />
      <GameTV x={540} y={760} f={f} road={road} id={id} />
    </Svg></Layer>
  </>
);

// ---------------------------------------------------------------- living room (sofa view)
const SY = 1300, SS = 0.8, PS = 1.05, PY = SY - 104, KX = 348, NX = 732;
const SIT: Pose = { armL: [22, -40], armR: [22, -40], legL: [6, 0], legR: [6, 0], crouch: 0.6 };
const HOLD: Pose = { armL: [28, -100], armR: [28, -100], legL: [6, 0], legR: [6, 0], crouch: 0.6 };
const Pad: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -70 -22 Q -60 -40 -30 -36 L 30 -36 Q 60 -40 70 -22 L 86 30 Q 90 52 66 50 L 40 26 L -40 26 L -66 50 Q -90 52 -86 30 Z" fill="#2a2e38" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={-36} cy={-10} r={10} fill="#5a6070" /><circle cx={36} cy={-14} r={6} fill={GOLD} /><circle cx={48} cy={-2} r={6} fill={RED} />
  </g>
);
const Bowl: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-30, -8, 16, 34].map((cx, i) => <circle key={i} cx={cx} cy={-14 - (i % 2) * 6} r={11} fill="#e8b45a" stroke={INK} strokeWidth={3} />)}
    <path d="M -60 -12 L 60 -12 Q 56 40 0 44 Q -56 40 -60 -12 Z" fill="#f6efe0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 20 -20 L 70 -70" stroke="#c9ccd2" strokeWidth={8} strokeLinecap="round" />
  </g>
);
type Sit = { look: Look; x: number; pose: Pose; expr: Expr; seed: number; extra?: React.ReactNode };
const Room: React.FC<{ f: number; people: Sit[]; over?: React.ReactNode }> = ({ f, people, over }) => (
  <>
    <Layer p={0.6}><Svg><LivingWall y={-300} h={1600} /></Svg></Layer>
    <Layer p={1}><Svg>
      <LivingFloor y={1300} h={900} />
      <Rug x={540} y={1420} w={760} />
      <Sofa x={540} y={SY} scale={SS} />
      {people.map((p, i) => <Person key={i} x={p.x} y={PY} scale={PS} look={p.look} pose={p.pose} expr={p.expr} blink={blinkOf(f, p.seed)} t={f} shadow={0} />)}
      <Sofa x={540} y={SY} scale={SS} front />
      {people.map((p, i) => <React.Fragment key={"x" + i}>{p.extra}</React.Fragment>)}
      {over}
    </Svg></Layer>
  </>
);
const padAt = (x: number, pose: Pose, f: number): Pt => {
  const a = handPos({ x, y: PY, scale: PS, pose, t: f }, "L"), b = handPos({ x, y: PY, scale: PS, pose, t: f }, "R");
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
};

// ---------------------------------------------------------------- overlay helpers (screen space)
const CardLabel: React.FC<React.ComponentProps<typeof Label>> = (p) => {
  if (p.hidden || p.f < p.enterAt) return null;
  const o = arrive(p.f, p.enterAt, 10) * (Number.isFinite(p.exitAt) ? 1 - leave(p.f, p.exitAt) : 1);
  if (o <= 0) return null;
  const w = p.children.length * p.size * 0.66 + 70;
  return <g>
    <rect x={p.x - w / 2} y={p.y - p.size * 0.98} width={w} height={p.size * 1.34} rx={24} fill={INK} opacity={0.8 * o} />
    <Label {...p} />
  </g>;
};
const CountCard: React.FC<{ f: number; x: number; y: number; text: string; startAt: number; dur: number; exitAt: number; color?: string; size?: number; w?: number }> =
  ({ f, x, y, text, startAt, dur, exitAt, color = GOLD, size = 76, w = 560 }) => {
    if (f < startAt) return null;
    const out = leave(f, exitAt);
    if (out >= 1) return null;
    const p = arrive(f, startAt, 10), sc = stampScale(f, startAt, dur) * (0.8 + 0.2 * p);
    return <g opacity={p * (1 - out)} transform={`translate(${x} ${y - out * 20}) scale(${sc})`}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.32} rx={26} fill={INK} opacity={0.82} stroke={color} strokeWidth={7} />
      <text x={0} y={size * 0.12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color}>{text}</text>
    </g>;
  };
const Stamp: React.FC<{ f: number; x: number; y: number; text: string; at: number; exitAt: number; color?: string; size?: number; rot?: number }> =
  ({ f, x, y, text, at, exitAt, color = RED, size = 70, rot = -8 }) => {
    if (f < at) return null;
    const out = leave(f, exitAt);
    if (out >= 1) return null;
    const p = k(f, at, at + 7, 0, 1, EASE.arrive), s = 1.6 - 0.6 * p;
    const w = text.length * size * 0.68 + 60;
    return <g opacity={Math.min(1, p * 1.6) * (1 - out)} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-w / 2} y={-size * 0.9} width={w} height={size * 1.25} rx={14} fill={INK} fillOpacity={0.55} stroke={color} strokeWidth={10} />
      <text x={0} y={size * 0.12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} letterSpacing={3}>{text}</text>
    </g>;
  };

// ---------------------------------------------------------------- lab props
const TLight: React.FC<{ x: number; y: number; s: number; red: number }> = ({ x, y, s, red }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-40} y={-110} width={80} height={220} rx={16} fill="#1b1d26" stroke={CREAM} strokeWidth={6} />
    <circle cy={-66} r={28} fill={red > 0.5 ? LRED : "#4a2020"} /><circle cy={0} r={28} fill="#4a3c18" /><circle cy={66} r={28} fill="#183a22" />
    {red > 0 && <circle cy={-66} r={48} fill={LRED} opacity={0.3 * red} />}
  </g>
);
const Pedal: React.FC<{ x: number; y: number; s: number; press: number }> = ({ x, y, s, press }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -10 -110 L -10 40" stroke="#5a6070" strokeWidth={14} />
    <g transform={`rotate(${-18 + 16 * press} -10 40)`}><rect x={-60} y={10} width={120} height={50} rx={10} fill="#2a2e38" stroke={CREAM} strokeWidth={6} />
      {[0, 1, 2].map((i) => <path key={i} d={`M -40 ${22 + i * 13} L 40 ${22 + i * 13}`} stroke="#5a6070" strokeWidth={4} />)}</g>
    <g transform={`translate(${-20} ${-70 + 50 * press}) rotate(${-20 + 14 * press})`}>
      <path d="M -40 -110 L 20 -110 L 30 0 Q 110 0 110 40 L 110 60 L -40 60 Z" fill="#e8443a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <rect x={-46} y={50} width={162} height={20} rx={8} fill="#f6efe0" stroke={INK} strokeWidth={5} />
    </g>
  </g>
);
const IconCal: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={70} fill="#1c2650" stroke={MUTED} strokeWidth={5} />
    <rect x={-40} y={-34} width={80} height={72} rx={8} fill="#f6efe0" stroke={INK} strokeWidth={5} />
    <rect x={-40} y={-34} width={80} height={20} fill={RED} stroke={INK} strokeWidth={5} />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${-26 + (i % 3) * 26} ${-2 + Math.floor(i / 3) * 22} l 8 8 l 12 -14`} stroke={GREEN} strokeWidth={5} fill="none" strokeLinecap="round" />)}
  </g>
);
const IconPin: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={70} fill="#1c2650" stroke={MUTED} strokeWidth={5} />
    <path d="M 0 46 C -40 0 -36 -40 0 -40 C 36 -40 40 0 0 46 Z" fill={RED} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <circle cy={-12} r={13} fill="#f6efe0" stroke={INK} strokeWidth={4} />
  </g>
);
const IconCloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={70} fill="#1c2650" stroke={MUTED} strokeWidth={5} />
    <path d="M -36 12 C -56 12 -56 -18 -34 -20 C -32 -42 0 -46 8 -28 C 26 -40 50 -26 40 -6 C 58 0 50 22 32 20 Z" fill="#f6efe0" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={-30} cy={34} r={8} fill="#f6efe0" stroke={INK} strokeWidth={4} /><circle cx={-44} cy={50} r={5} fill="#f6efe0" stroke={INK} strokeWidth={3} />
  </g>
);
/** a hand seen from above, fingers up; x = palm centre */
const TopHand: React.FC<{ x: number; y: number; tap: number[]; skin: string; sleeve: string; flip?: boolean }> = ({ x, y, tap, skin, sleeve, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <rect x={-80} y={70} width={150} height={120} rx={30} fill={sleeve} stroke={INK} strokeWidth={8} />
    <path d="M -70 -10 Q -72 90 0 92 Q 70 90 66 -10 Z" fill={skin} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {[-52, -18, 16, 48].map((fx, i) => <rect key={i} x={fx - 15} y={-110 + (i === 0 || i === 3 ? 20 : 0) + 18 * (tap[i] ?? 0)} width={30} height={120} rx={15} fill={skin} stroke={INK} strokeWidth={7} />)}
    <rect x={56} y={-10} width={28} height={80} rx={14} fill={skin} stroke={INK} strokeWidth={7} transform="rotate(-30 70 40)" />
  </g>
);
/** an upper cupboard: hinge on the left (dir 1) or right (dir -1); open 0..1 */
const Cupboard: React.FC<{ x: number; y: number; w: number; h: number; open: number; dir: 1 | -1; box?: boolean }> = ({ x, y, w, h, open, dir, box }) => {
  const dw = w * (1 - 0.82 * open), hx = dir === 1 ? x : x + w;
  return <g>
    <rect x={x} y={y} width={w} height={h} rx={8} fill="#2a1a12" stroke={INK} strokeWidth={7} />
    <path d={`M ${x + 8} ${y + h * 0.55} L ${x + w - 8} ${y + h * 0.55}`} stroke="#6b4636" strokeWidth={10} />
    {box && <g><rect x={x + w / 2 - 40} y={y + h * 0.55 - 120} width={80} height={120} rx={6} fill="#ffb02e" stroke={INK} strokeWidth={5} />
      <circle cx={x + w / 2} cy={y + h * 0.55 - 70} r={20} fill="#e8443a" stroke={INK} strokeWidth={4} /></g>}
    <rect x={dir === 1 ? hx - (w - dw) * 0.15 : hx - dw + (w - dw) * 0.15} y={y - 6 * open} width={dw} height={h + 12 * open} rx={8} fill={open > 0.3 ? KITCHEN.cab2 : KITCHEN.cab} stroke={INK} strokeWidth={7} />
    <circle cx={dir === 1 ? hx + dw - 24 : hx - dw + 24} cy={y + h - 40} r={10} fill="#e8c46a" stroke={INK} strokeWidth={3} />
  </g>;
};
const CB_A = { x: 300, y: 430, w: 210, h: 330 }, CB_B = { x: 570, y: 430, w: 210, h: 330 };
const Cereal: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-40} y={-120} width={80} height={120} rx={6} fill="#ffb02e" stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={-70} r={20} fill="#e8443a" stroke={INK} strokeWidth={4} />
  </g>
);

// ---------------------------------------------------------------- shots
type View = { cam: Cam; mood: Mood; body: React.ReactNode; labels?: React.ReactNode; overlay?: React.ReactNode; bg?: string; glow?: { p: Pt; c: string; o: number } };

const ShotView: React.FC<{ span: ShotSpan; freezeAt?: number }> = ({ span, freezeAt }) => {
  const f0 = useCurrentFrame();
  const f = freezeAt ?? f0;
  const words = React.useContext(Words);
  const noText = React.useContext(NoText);
  const u = f - span.a, len = span.b - span.a;
  const C = (phrase: string, fb: number) => cueAt(words, phrase, span, fb);
  const v = build(span.id, f, u, len, C);
  const gs = v.glow ? toS(v.cam, v.glow.p) : null;
  return (
    <AbsoluteFill>
      <Stage cam={v.cam} bg={v.bg ?? "#2a2030"}>{v.body}</Stage>
      {gs && v.glow && <Pool x={gs.x} y={gs.y} rx={420 * v.cam.zoom} ry={360 * v.cam.zoom} color={v.glow.c} opacity={v.glow.o} />}
      <Grade mood={v.mood} />
      {v.overlay}
      {!noText && v.labels && <AbsoluteFill><svg width={1080} height={1920} viewBox="0 0 1080 1920">{v.labels}</svg></AbsoluteFill>}
    </AbsoluteFill>
  );
};

const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number): View => {
  let cam: Cam = { x: 0, y: 0, zoom: 1, rot: 0 };
  let mood = MOODS.home;
  switch (id) {
    case "hook": {   // frame 0: close on the TV: red light, our car stopped at the line, both labels landed; on "anything" a
      // blue car blasts through the crossing (anything goes); on "still stops" a push in on the red light
      mood = MOODS.tv;
      const AN = C("anything in", 12), SS2 = C("still stops", 90);
      const cross = k(u, AN + 4, AN + 30, 0, 1, EASE.linear);
      cam = kickCam(drift(on({ x: 540 + 60 * k(u, SS2 - 4, len, 0, 1), y: 760 - 40 * k(u, SS2 - 4, len, 0, 1) }, k(u, 0, SS2 - 4, 1.3, 1.36) + 0.14 * k(u, SS2 - 4, len, 0, 1)), f, 0.8), u - SS2, 8);
      const body = <TVRoom f={f} id="tv-hook" road={{ light: "red", cross: u < AN + 4 ? -1 : cross, brake: 1 }} />;
      const labels = <>
        <CardLabel f={u} x={510} y={400} size={62} color={CREAM} enter="present" enterAt={-20} exitAt={len - 7}>GTA 6: ANYTHING GOES</CardLabel>
        <CardLabel f={u} x={510} y={520} size={72} color={RED} enter="present" enterAt={-20} exitAt={len - 7}>HE STILL STOPS</CardLabel>
      </>;
      return { cam, mood, body, labels, bg: LIVING.wall };
    }
    case "launch": { // A wide sofa: Nia hands Kai the controller ("LAUNCH WEEK"); B on "Fast car" cut to the TV: the car
      // speeds down the empty road; C on "Red light" cut to a medium on Kai, red glow, he brakes, "HE STOPS"
      const GC = C("gets the controller", 30), FC = C("Fast car", 80), RL = C("Red light", 140), HS = C("He stops", 165);
      if (u < FC - 2) {
        cam = drift(on({ x: 540, y: k(u, 0, FC, 980, 960) }, k(u, 0, FC, 1.0, 1.06)), f, 1);
        const give = k(u, GC - 6, GC + 12, 0, 1, EASE.arrive);
        const kPose: Pose = { ...SIT, armL: [22 + 6 * give, -40 - 60 * give], armR: [22 + 6 * give, -40 - 60 * give], lookX: 0.4 * (1 - give) };
        const pad0 = { x: NX - 120, y: PY - 200 }, pad1 = padAt(KX, kPose, f);
        const pp = { x: pad0.x + (pad1.x - pad0.x) * give, y: pad0.y + (pad1.y - pad0.y) * give };
        const nBase: Pose = { ...SIT, lookX: -0.5 };
        const nPose = give < 1 ? reachLimb({ x: NX, y: PY, scale: PS, pose: nBase }, "armL", pp, 1) : nBase;
        const body = <Room f={f} people={[
          { look: KAI, x: KX, pose: kPose, expr: give > 0.5 ? "cheer" : "smile", seed: 2 },
          { look: NIA, x: NX, pose: nPose, expr: "smile", seed: 4 },
        ]} over={<Pad x={pp.x} y={pp.y} s={0.6} />} />;
        const labels = <CardLabel f={u} x={510} y={400} size={70} color={GOLD} enter="rise" enterAt={2} exitAt={FC - 9}>LAUNCH WEEK</CardLabel>;
        return { cam, mood, body, labels, glow: { p: { x: 540, y: 900 }, c: "#7fc8ff", o: 0.12 } };
      }
      if (u < RL - 2) {
        mood = MOODS.tv;
        cam = drift(on({ x: 540, y: 800 }, k(u, FC, RL, 1.05, 1.15)), f, 1.2);
        const body = <TVRoom f={f} id="tv-launch" road={{ light: "green", speed: 3, brake: 0 }} />;
        return { cam, mood, body, bg: LIVING.wall };
      }
      cam = kickCam(drift(on({ x: 400, y: k(u, RL, len, 940, 920) }, k(u, RL, len, 1.7, 1.8)), f, 0.8), u - HS, 10);
      const brake = arrive(u, HS - 2, 6);
      const kPose: Pose = { ...HOLD, lean: -3 * brake, headTilt: -4 * brake };
      const pp = padAt(KX, kPose, f);
      const body = <Room f={f} people={[
        { look: KAI, x: KX, pose: kPose, expr: brake > 0.5 ? "focused" : "determined", seed: 2 },
      ]} over={<Pad x={pp.x} y={pp.y + 4 * brake} s={0.6} />} />;
      const labels = <CardLabel f={u} x={510} y={400} size={70} color={RED} enter="scale" enterAt={HS} exitAt={len - 7}>HE STOPS</CardLabel>;
      return { cam, mood, body, labels, glow: { p: { x: 400, y: 860 }, c: LRED, o: 0.32 } };
    }
    case "go": {     // medium two-shot: Nia turns and stares; "Nobody's chasing you" shrug; on "Go!" both arms up and a GO!
      // bubble; Kai stays frozen in the red glow
      const NC = C("Nobody's chasing", 20), GO = C("Go!", 60);
      cam = kickCam(drift(on({ x: 540, y: 930 }, k(u, 0, len, 1.35, 1.42)), f, 0.8), u - GO, 12);
      const sh = arrive(u, NC, 10) * (1 - arrive(u, GO - 2, 6)), up = arrive(u, GO - 2, 7);
      const nPose: Pose = { ...SIT, armL: [22 + 30 * sh + 130 * up, -40 - 70 * sh + 30 * up], armR: [22 + 30 * sh + 130 * up, -40 - 70 * sh + 30 * up], lookX: -0.7, headTilt: -6 * up };
      const kPose: Pose = { ...HOLD };
      const pp = padAt(KX, kPose, f);
      const body = <Room f={f} people={[
        { look: KAI, x: KX, pose: kPose, expr: "focused", seed: 2 },
        { look: NIA, x: NX, pose: nPose, expr: up > 0.3 ? "cheer" : u < NC ? "shock" : "worried", seed: 4 },
      ]} over={<Pad x={pp.x} y={pp.y} s={0.6} />} />;
      const b = pop(u, GO, 9);
      const labels = b > 0 ? <g transform={`translate(800 560) scale(${b})`} opacity={1 - leave(u, len - 7)}>
        <path d="M -40 70 L -70 130 L 10 70 Z" fill="#f6efe0" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <rect x={-130} y={-80} width={260} height={160} rx={50} fill="#f6efe0" stroke={INK} strokeWidth={8} />
        <path d="M -44 72 L 6 72" stroke="#f6efe0" strokeWidth={12} />
        <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={GREEN} stroke={INK} strokeWidth={3}>GO!</text>
      </g> : null;
      return { cam, mood, body, labels, glow: { p: { x: KX, y: 860 }, c: LRED, o: 0.26 } };
    }
    case "green": {  // close on the TV light: still red... it turns green, and only then the car rolls away
      mood = MOODS.tv;
      const GR = 18;
      const g = u >= GR;
      cam = drift(on({ x: 650, y: 740 }, k(u, 0, len, 2.0, 2.1)), f, 0.8);
      const body = <TVRoom f={f} id="tv-green" road={{ light: g ? "green" : "red", drive: k(u, GR + 10, len, 0, 0.55, EASE.arrive), brake: g ? 0 : 1 }} />;
      const labels = <CardLabel f={u} x={510} y={400} size={62} color={GREEN} enter="words" enterAt={GR + 2} exitAt={len - 7}>WAITS FOR GREEN</CardLabel>;
      return { cam, mood, body, labels, bg: LIVING.wall };
    }
    case "headline": { // lab: "NOT ALONE" (a crowd of tiny stopped cars); on "PC Gamer" a plain headline card slides up,
      // the quote words in line by line; "IN GTA 6" lands last
      mood = MOODS.lab;
      const PC = C("PC Gamer", 45), HL = C("Help, I", 90), TL = C("traffic laws", 140), GT = C("in GTA", 170);
      cam = drift({ x: 0, y: k(u, 0, len, 10, -10), zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 1);
      const cars = 1 - leave(u, PC - 4, 10);
      const card = arrive(u, PC, 14);
      const body = <Lab>
        {cars > 0 && <g opacity={cars}>{Array.from({ length: 9 }, (_, i) => { const p = pop(u, 4 + i * 4, 10), x = 240 + (i % 3) * 300, y = 640 + Math.floor(i / 3) * 210;
          return p > 0 ? <g key={i} transform={`translate(${x} ${y}) scale(${0.55 * p})`}>
            <rect x={-84} y={-34} width={168} height={66} rx={18} fill={["#e8443a", "#3a6fd0", "#f2c230"][i % 3]} stroke={INK} strokeWidth={6} />
            <path d="M -58 -30 L -44 -70 L 44 -70 L 58 -30 Z" fill="#9fd3f0" stroke={INK} strokeWidth={6} />
            {[-62, 62].map((x2) => <rect key={x2} x={x2 - 14} y={-18} width={28} height={16} rx={5} fill="#ff6a5a" stroke={INK} strokeWidth={3} />)}
            <circle cx={120} cy={-60} r={18} fill={LRED} stroke={INK} strokeWidth={4} />
          </g> : null; })}</g>}
        {card > 0 && <g transform={`translate(0 ${(1 - card) * 120})`} opacity={card}>
          <rect x={120} y={560} width={840} height={600} rx={20} fill="#f6efe0" stroke={INK} strokeWidth={9} />
          <rect x={120} y={560} width={840} height={70} rx={20} fill="#d8d0c4" stroke={INK} strokeWidth={9} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={180} y={1040 + i * 26} width={i % 2 ? 560 : 700} height={12} rx={6} fill="#c9ccd2" />)}
        </g>}
      </Lab>;
      const labels = <>
        <CardLabel f={u} x={510} y={420} size={70} color={GOLD} enter="rise" enterAt={2} exitAt={PC - 6}>NOT ALONE</CardLabel>
        <Label f={u} x={540} y={420} size={52} color={CREAM} enter="rise" enterAt={PC + 4} exitAt={len - 7}>ONE WRITER POSTED:</Label>
        <Label f={u} x={540} y={610} size={36} color={INK} enter="present" enterAt={PC + 8} exitAt={len - 7}>PC GAMER · NOV 19, 2026</Label>
        <Label f={u} x={540} y={760} size={74} color={INK} enter="words" enterAt={HL} exitAt={len - 7}>"HELP: I CAN'T</Label>
        <Label f={u} x={540} y={850} size={74} color={INK} enter="words" enterAt={HL + 12} exitAt={len - 7}>STOP OBEYING</Label>
        <Label f={u} x={540} y={940} size={74} color={RED} enter="words" enterAt={TL - 2} exitAt={len - 7}>TRAFFIC LAWS"</Label>
        <Stamp f={u} x={540} y={1260} text="IN GTA 6" at={GT} exitAt={len - 7} size={52} rot={-4} color={GOLD} />
      </>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "rules": {  // close on Kai's hands on the controller in the red glow: the finger creeps to the gas, hovers, shakes and
      // pulls back; "IT'S A GAME" on "game"; a sweat drop on "break the rules"
      const IG = C("a game", 12), BR = C("break the rules", 100);
      cam = drift(on({ x: 540, y: 900 }, k(u, 0, len, 1.0, 1.08)), f, 0.8);
      const reach = k(u, 10, IG + 30, 0, 1) * (1 - k(u, BR + 6, BR + 18, 0, 1, EASE.arrive));
      const shake = u > BR - 6 && u < BR + 8 ? 5 * Math.sin(u * 2.4) : 0;
      const body = <>
        <Layer p={0.3}><Svg><rect x={-900} y={-1200} width={2880} height={3600} fill={LIVING.sofa2} />
          {[-240, 0, 240, 480, 720, 960, 1200].map((x) => <rect key={x} x={x} y={300} width={220} height={900} rx={60} fill={LIVING.sofa} opacity={0.6} />)}</Svg></Layer>
        <Layer p={1}><Svg>
          <rect x={120} y={1380} width={180} height={300} rx={40} fill={KAI.jersey} stroke={INK} strokeWidth={9} transform="rotate(20 210 1380)" />
          <rect x={780} y={1380} width={180} height={300} rx={40} fill={KAI.jersey} stroke={INK} strokeWidth={9} transform="rotate(-20 870 1380)" />
          <g transform="translate(540 980) scale(4.2)"><Pad x={0} y={0} /></g>
          <rect x={780} y={790} width={110} height={44} rx={16} fill={u > IG && reach > 0.8 ? GOLD : "#5a6070"} stroke={INK} strokeWidth={7} />
          <ellipse cx={230} cy={1150} rx={110} ry={130} fill={KAI.skin} stroke={INK} strokeWidth={9} />
          <ellipse cx={850} cy={1150} rx={110} ry={130} fill={KAI.skin} stroke={INK} strokeWidth={9} />
          <rect x={360} y={880} width={64} height={150} rx={32} fill={KAI.skin} stroke={INK} strokeWidth={8} transform="rotate(-50 390 1030)" />
          <g transform={`translate(${shake} ${-90 * reach})`}><rect x={808} y={870 - 20 * reach} width={60} height={190} rx={30} fill={KAI.skin} stroke={INK} strokeWidth={8} /></g>
          {u >= BR && <SweatDrop x={700 + 0} y={760 + k(u, BR, BR + 30, 0, 50)} scale={2.2} />}
        </Svg></Layer>
      </>;
      const labels = <CardLabel f={u} x={510} y={400} size={72} color={GOLD} enter="scale" enterAt={IG} exitAt={len - 7}>IT'S A GAME</CardLabel>;
      return { cam, mood, body, labels, glow: { p: { x: 540, y: 700 }, c: LRED, o: 0.3 } };
    }
    case "habit": {  // lab: a fork in the road with a "?" (CHOICE?); on "isn't a choice" the fork greys out and a red X lands; on
      // "It's a habit" one worn groove glows gold straight through and HABIT stamps in
      mood = MOODS.lab;
      const NC = C("isn't a choice", 50), IH = C("It's a habit", 110);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 1);
      const grey = k(u, NC, NC + 12, 0, 1), x = pop(u, NC + 6, 10), gr = k(u, IH, IH + 16, 0, 1, EASE.arrive);
      const body = <Lab>
        <g opacity={1 - 0.6 * grey}>
          <path d="M 540 1250 L 540 950 Q 540 850 330 700 L 300 640" stroke={grey > 0.5 ? MUTED : CREAM} strokeWidth={40} fill="none" strokeLinecap="round" />
          <path d="M 540 950 Q 540 850 750 700 L 780 640" stroke={grey > 0.5 ? MUTED : CREAM} strokeWidth={40} fill="none" strokeLinecap="round" />
          <circle cx={540} cy={860} r={60 * (1 - grey) + 1} fill={GOLD} opacity={1 - grey} />
          <text x={540} y={888} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill={INK} opacity={1 - grey}>?</text>
        </g>
        {x > 0 && <g transform={`translate(540 860) scale(${x * (1 - gr * 0.4)})`} opacity={1 - gr}>
          <path d="M -90 -90 L 90 90 M 90 -90 L -90 90" stroke={RED} strokeWidth={30} strokeLinecap="round" />
        </g>}
        {gr > 0 && <path d={`M 540 1250 L 540 ${1250 - 640 * gr}`} stroke={GOLD} strokeWidth={56} strokeLinecap="round" opacity={0.9} />}
        {gr > 0 && <circle cx={540} cy={1250 - 640 * gr} r={22} fill={CREAM} />}
      </Lab>;
      const labels = <>
        <CardLabel f={u} x={510} y={420} size={70} color={CREAM} enter="rise" enterAt={NC - 14} exitAt={IH - 6}>CHOICE?</CardLabel>
        <Stamp f={u} x={540} y={430} text="HABIT" at={IH + 2} exitAt={len - 7} color={GOLD} size={84} rot={-5} />
      </>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "diary": {  // lab: an hourly diary card; a pencil fills one hour row after another; HOUR BY HOUR words in
      mood = MOODS.lab;
      const WD = C("write down", 25), HH = C("hour by hour", 100);
      cam = drift({ x: 0, y: k(u, 0, len, -10, 10), zoom: k(u, 0, len, 1.04, 1.0), rot: 0 }, f, 1);
      const cd = arrive(u, 0, 12);
      const HRS = ["9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00", "4:00"];
      const rowP = (i: number) => k(u, WD - 6 + i * 12, WD + 8 + i * 12, 0, 1, EASE.linear);
      let pen: Pt = { x: 380, y: 560 };
      HRS.forEach((_, i) => { const p = rowP(i); if (p > 0) pen = { x: 380 + 440 * p, y: 560 + i * 82 }; });
      const body = <Lab>
        <g opacity={cd} transform={`translate(0 ${(1 - cd) * 60})`}>
          <rect x={170} y={480} width={740} height={720} rx={20} fill="#f6efe0" stroke={INK} strokeWidth={9} />
          {HRS.map((h, i) => { const p = rowP(i), y = 560 + i * 82;
            return <g key={i}>
              <path d={`M 200 ${y + 30} L 880 ${y + 30}`} stroke="#c9ccd2" strokeWidth={4} />
              <text x={210} y={y + 14} fontFamily={FONT} fontWeight={900} fontSize={34} fill={MUTED}>{h}</text>
              {p > 0 && <path d={`M 380 ${y} ${Array.from({ length: Math.max(1, Math.round(22 * p)) }, (_, j) => `L ${380 + (j + 1) * 20 * (440 / 440)} ${y + (j % 2 ? -10 : 8)}`).join(" ")}`} stroke="#3a6fd0" strokeWidth={6} fill="none" strokeLinejoin="round" />}
            </g>; })}
        </g>
        <g transform={`translate(${pen.x} ${pen.y}) rotate(35)`} opacity={cd}>
          <rect x={-14} y={-150} width={28} height={130} fill={GOLD} stroke={INK} strokeWidth={5} />
          <path d="M -14 -20 L 0 14 L 14 -20 Z" fill="#f2d3a8" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </g>
      </Lab>;
      const labels = <CardLabel f={u} x={510} y={400} size={66} color={GOLD} enter="words" enterAt={HH - 2} exitAt={len - 7}>HOUR BY HOUR</CardLabel>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "study": {  // lab: a 10x10 grid fills 43 gold cells while the counter runs to 43%; on "Done almost" the grid clears and
      // three rows pop in on their words: calendar (ALMOST DAILY), pin (SAME PLACE), thought cloud (MIND ELSEWHERE)
      mood = MOODS.lab;
      const FT = C("forty three", 20), DA = C("almost every day", 120), SP = C("same place", 170), TS = C("thinking about", 210);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.04), rot: 0 }, f, 1);
      const n = countValue(u, FT, 22, 1, 43);
      const gridOut = leave(u, DA - 12, 10);
      const rows = [{ at: DA, y: 700, I: IconCal, t: "ALMOST DAILY" }, { at: SP, y: 930, I: IconPin, t: "SAME PLACE" }, { at: TS, y: 1160, I: IconCloud, t: "MIND ELSEWHERE" }];
      const body = <Lab>
        {gridOut < 1 && <g opacity={(1 - gridOut) * arrive(u, 0, 10)}>
          {Array.from({ length: 100 }, (_, i) => { const x = 290 + (i % 10) * 50, y = 620 + Math.floor(i / 10) * 50, filled = u >= FT && i < n;
            return <rect key={i} x={x} y={y} width={42} height={42} rx={8} fill={filled ? GOLD : "#1c2650"} stroke={filled ? INK : MUTED} strokeWidth={3} />; })}
        </g>}
        {rows.map((r, i) => { const p = pop(u, r.at, 10); return p > 0 ? <r.I key={i} x={190} y={r.y - 20} s={p} /> : null; })}
      </Lab>;
      const labels = <>
        <CountCard f={u} x={510} y={410} text={`${u < FT ? 1 : n}% HABITS`} startAt={FT} dur={22} exitAt={len - 7} size={66} w={600} />
        <Label f={u} x={510} y={530} size={44} color={CREAM} enter="rise" enterAt={FT + 24} exitAt={len - 7}>(ONE STUDY)</Label>
        {rows.map((r, i) => <CardLabel key={i} f={u} x={600} y={r.y} size={54} color={i === 2 ? GOLD : CREAM} enter="words" enterAt={r.at + 4} exitAt={len - 7}>{r.t}</CardLabel>)}
      </>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "loop": {   // lab: a long winding path and a gold shortcut ("shortcut"); then CUE box pops (red light), arrow runs to
      // ACTION box (brake pedal); on "Red light" the lamp turns red, on "foot on the brake" the foot presses
      mood = MOODS.lab;
      const SC = C("a shortcut", 20), CA = C("cue appears", 60), AF = C("action follows", 100), RL = C("Red light", 140), FB = C("foot on", 165);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 1);
      const sOut = leave(u, CA - 8, 10), sc = k(u, SC, SC + 16, 0, 1, EASE.arrive);
      const cb = pop(u, CA, 10), ab = pop(u, AF + 4, 10), ar = k(u, AF - 2, AF + 10, 0, 1, EASE.arrive);
      const body = <Lab>
        {sOut < 1 && <g opacity={(1 - sOut) * arrive(u, 0, 10)}>
          <path d="M 200 1100 C 200 700 500 1200 540 850 C 580 500 880 1000 880 640" stroke={MUTED} strokeWidth={24} fill="none" strokeLinecap="round" strokeDasharray="30 22" />
          <circle cx={200} cy={1100} r={30} fill={CREAM} /><circle cx={880} cy={640} r={30} fill={CREAM} />
          {sc > 0 && <path d={`M 200 1100 L ${200 + 680 * sc} ${1100 - 460 * sc}`} stroke={GOLD} strokeWidth={30} strokeLinecap="round" />}
        </g>}
        {cb > 0 && <g transform={`translate(280 860) scale(${cb})`}>
          <rect x={-180} y={-220} width={360} height={440} rx={30} fill="#1c2650" stroke={RED} strokeWidth={8} />
          <TLight x={0} y={0} s={1.3} red={k(u, RL, RL + 6, 0, 1, EASE.linear)} />
        </g>}
        {ar > 0 && <g>
          <path d={`M 480 860 L ${480 + 110 * ar} 860`} stroke={GOLD} strokeWidth={22} strokeLinecap="round" />
          {ar > 0.9 && <path d="M 560 820 L 610 860 L 560 900" stroke={GOLD} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        </g>}
        {ab > 0 && <g transform={`translate(810 860) scale(${ab})`}>
          <rect x={-180} y={-220} width={360} height={440} rx={30} fill="#1c2650" stroke={GREEN} strokeWidth={8} />
          <Pedal x={10} y={40} s={1.1} press={k(u, FB, FB + 8, 0, 1, EASE.arrive)} />
        </g>}
      </Lab>;
      const labels = <>
        <CardLabel f={u} x={510} y={420} size={66} color={GOLD} enter="words" enterAt={SC} exitAt={CA - 8}>SHORTCUT</CardLabel>
        <Label f={u} x={280} y={560} size={64} color={RED} enter="rise" enterAt={CA + 2} exitAt={len - 7}>CUE</Label>
        <Label f={u} x={810} y={560} size={64} color={GREEN} enter="rise" enterAt={AF + 6} exitAt={len - 7}>ACTION</Label>
        <CardLabel f={u} x={510} y={1280} size={48} color={CREAM} enter="words" enterAt={RL} exitAt={len - 7}>RED LIGHT → BRAKE</CardLabel>
      </>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "password": { // keyboard close: two hands type on their own, the password field fills with dots; on "fingers know it" a
      // green check + FINGERS: KNOW IT; on "You don't" the label swaps to YOU: ?
      mood = MOODS.lab;
      const FK = C("fingers know", 70), YD = C("You don't", 120);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.06, 1.0), rot: 0 }, f, 0.8);
      const typing = u < FK + 8;
      const tp = (i: number, s: number) => typing ? Math.max(0, Math.sin(f * 0.9 + i * 1.9 + s)) : 0;
      const dots = Math.min(10, Math.floor(Math.max(0, u - 4) / 6));
      const ck = pop(u, FK, 10);
      const body = <Lab>
        <rect x={190} y={540} width={700} height={110} rx={24} fill="#f6efe0" stroke={INK} strokeWidth={8} />
        {Array.from({ length: dots }, (_, i) => <circle key={i} cx={250 + i * 54} cy={595} r={16} fill={INK} />)}
        {ck > 0 && <g transform={`translate(830 595) scale(${ck})`}><circle r={40} fill={GREEN} stroke={INK} strokeWidth={6} /><path d="M -18 0 L -4 14 L 20 -14" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" /></g>}
        <rect x={120} y={740} width={840} height={400} rx={30} fill="#2a2e38" stroke={INK} strokeWidth={9} />
        {Array.from({ length: 4 * 11 }, (_, i) => { const c = i % 11, r = Math.floor(i / 11), hit = typing && ((Math.floor(f / 4) * 7 + i * 3) % 23) === 0;
          return <rect key={i} x={150 + c * 72 + (r % 2) * 18} y={770 + r * 84} width={60} height={68} rx={10} fill={hit ? GOLD : "#4a505e"} stroke={INK} strokeWidth={4} />; })}
        <TopHand x={360} y={1090} tap={[tp(0, 0), tp(1, 0), tp(2, 0), tp(3, 0)]} skin={KAI.skin} sleeve={KAI.jersey} />
        <TopHand x={720} y={1090} tap={[tp(0, 2), tp(1, 2), tp(2, 2), tp(3, 2)]} skin={KAI.skin} sleeve={KAI.jersey} flip />
      </Lab>;
      const labels = <>
        <CardLabel f={u} x={510} y={420} size={64} color={GREEN} enter="words" enterAt={FK} exitAt={YD - 6}>FINGERS: KNOW IT</CardLabel>
        <CardLabel f={u} x={510} y={420} size={72} color={GOLD} enter="scale" enterAt={YD + 2} exitAt={len - 7}>YOU: ?</CardLabel>
      </>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "cereal": { // morning kitchen, wide: Nia carries the cereal box from the old cupboard (left) to the new one (right); on
      // "Kai opens" the camera eases to Kai at the old cupboard: it opens empty three times, counter 1, 2, 3
      mood = MOODS.morning;
      const MV = C("moves the cereal", 30), KO = C("Kai opens", 95), TT = C("Three times", 150);
      const push = k(u, KO - 10, KO + 14, 0, 1);
      cam = drift(on({ x: 540 - 60 * push, y: 960 + 11 * push }, 1.0 + 0.15 * push), f, 1);
      const carry = k(u, MV, MV + 30, 0, 1, EASE.camera);
      const opens = [KO + 4, TT - 4, TT + 14];
      const openAmt = (o: number) => k(u, o, o + 5, 0, 1, EASE.arrive) * (1 - k(u, o + 11, o + 15, 0, 1, EASE.exit));
      const aOpen = u < MV + 34 ? k(u, 0, 8, 0.0, 1) : Math.max(...opens.map(openAmt));
      const bOpen = u < MV + 34 ? k(u, MV - 6, MV + 2, 0, 1) * (1 - k(u, MV + 34, MV + 40, 0, 1)) : 0;
      const count = opens.filter((o) => u >= o).length;
      const box: Pt = { x: CB_A.x + 105 + (CB_B.x - CB_A.x) * carry, y: 680 - 40 * Math.sin(carry * Math.PI) };
      const PSK = 1.7, FL = 1380;
      const nBase: Pose = { armL: [12, -6], armR: [12, -6], legL: [6, 0], legR: [6, 0], lookX: -0.3 };
      const nPose = carry < 1 ? reachLimb({ x: 640, y: FL, scale: PSK, pose: nBase }, "armR", { x: box.x, y: box.y - 40 }, 1) : { ...nBase, armR: [20, -10] as [number, number], lookX: -0.6 };
      const kBase: Pose = { armL: [12, -6], armR: [12, -6], legL: [6, 0], legR: [6, 0], lookX: 0.4 };
      const kPose = u >= KO - 4 ? reachLimb({ x: 250, y: FL, scale: PSK, pose: kBase }, "armR", { x: CB_A.x + CB_A.w - 30, y: CB_A.y + CB_A.h - 40 + 10 * aOpen }, 1) : kBase;
      const body = <>
        <Layer p={1}><Svg>
          <KitchenWall y={0} h={1500} />
          <rect x={270} y={240} width={540} height={480} fill={KITCHEN.wall} />
          <Cupboard {...CB_A} open={aOpen} dir={1} />
          <Cupboard {...CB_B} open={bOpen} dir={-1} box={carry >= 1} />
          {carry < 1 && <Cereal x={box.x} y={box.y} s={0.9} />}
          <rect x={-300} y={1480} width={1680} height={500} fill={KITCHEN.floor} />
          <Person x={250} y={FL} scale={PSK} look={KAI} pose={kPose} expr={count >= 3 ? "worried" : u >= KO ? "calm" : "neutral"} blink={blinkOf(f, 2) || u < KO} t={f} />
          <Person x={640} y={FL} scale={PSK} look={NIA} pose={nPose} expr={count >= 2 ? "smirk" : "smile"} blink={blinkOf(f, 4)} t={f} />
        </Svg></Layer>
      </>;
      const labels = <>
        <CardLabel f={u} x={510} y={360} size={60} color={GOLD} enter="rise" enterAt={2} exitAt={KO - 12}>NEXT MORNING</CardLabel>
        {count > 0 && <CountCard f={u} x={200} y={520} text={`${count}`} startAt={opens[0]} dur={opens[2] - opens[0]} exitAt={len - 7} size={64} w={150} />}
      </>;
      return { cam, mood, body, labels, bg: KITCHEN.wall };
    }
    default: {       // ask: Kai on the sofa with the cereal bowl looks to camera; the camera pulls out to the room
      const WD = C("on autopilot", 30);
      const pull = k(u, 0, len, 0, 1);
      cam = drift(on({ x: 440 + 100 * pull, y: 900 + 40 * pull }, 1.75 - 0.6 * pull), f, 1);
      const kPose: Pose = { ...HOLD, headTilt: 6 * arrive(u, WD, 10), lookX: 0 };
      const pp = padAt(KX, kPose, f);
      const body = <Room f={f} people={[
        { look: KAI, x: KX, pose: kPose, expr: u >= WD ? "smirk" : "smile", seed: 2 },
        { look: NIA, x: NX, pose: { ...SIT, lookX: -0.6 }, expr: "smirk", seed: 4 },
      ]} over={<Bowl x={pp.x} y={pp.y} s={0.8} />} />;
      return { cam, mood, body, glow: { p: { x: 540, y: 900 }, c: "#7fc8ff", o: 0.12 } };
    }
  }
};

const PLACE: Record<string, string> = Object.fromEntries(scenes.shots.map((s) => [s.id, s.place]));
const XF = 5;

const Scene: React.FC<SceneProps> = ({ spans, words }) => {
  const f = useCurrentFrame();
  const span = shotAt(spans, f);
  const prev = span.i > 0 ? spans[span.i - 1] : null;
  const u = f - span.a;
  const fade = prev && u < XF && (PLACE[prev.id] ?? "living") !== (PLACE[span.id] ?? "living");
  return (
    <Words.Provider value={words}><AbsoluteFill>
      <NoText.Provider value={!!fade}><ShotView span={span} /></NoText.Provider>
      {fade && prev && <NoText.Provider value><AbsoluteFill style={{ opacity: 1 - (u + 1) / (XF + 1) }}><ShotView span={prev} freezeAt={prev.b - 1} /></AbsoluteFill></NoText.Provider>}
    </AbsoluteFill></Words.Provider>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "gta-redlight",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: LIVING.wall,
};
export default story;
