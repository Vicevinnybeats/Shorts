// "GTA 6 Has a UFO. Your Eyes Can Make One Too" - 2.5D. Hook: players say a UFO shows up on a dark road after 2 AM in
// GTA 6 (our own generic saucer, never game art or logos; "GTA 6" only as plain words). Story: Kai and Nia camp at
// 2 a.m.; one light seems to drift, the phone shows it still. Science: the autokinetic effect (Adams 1912, Sherif 1935
// dark-room studies): a lone light with no reference seems to wander; a branch next to it stops it. AARO (Pentagon)
// 2024: 1945-2023 reviewed, no evidence of alien technology, mostly ordinary things. Twist: it's a planet.
// Camp layout (front view, drawn locally): sky p 0.15, treeline p 0.45, ground + people p 1; feet at y 1330 so nobody
// stands in the caption band in wide shots. Light, branch and path live on the p 1 layer.
// Motion rules (src/engine25/motion.tsx): arrivals EASE.arrive, exits EASE.exit, camera EASE.camera; every label enters
// and exits; nothing holds still for more than ~3 s. On-screen text is drawn in screen space inside SAFE_TEXT
// (y 300-1350, x 60-960) and hidden during crossfades.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, ShotSpan, cueTime, FPS } from "../../src/engine/timeline";
import type { Word } from "../../src/captions/Captions";
import { Stage, Layer, Svg, Cam, drift, kickCam, rnd } from "../../src/engine25/stage";
import { Grade, Mood, Pool, Flash } from "../../src/engine25/light";
import { EASE, arrive, leave, Label, stampScale, countValue } from "../../src/engine25/motion";
import { Person, Look, INK, Expr, Pose } from "../../library/characters25/person";
import { CAST } from "../../library/style/channel";
import { Lab, LAB } from "../../library/environments25/lab";
import { reachLimb, EyeCloseUp } from "../../library/environments25/square";
import scenes from "../../content/scripts/gta-ufo.json";

const SHOTS = scenes.shots.map((s) => ({ id: s.id, cue: s.cue }));

const NoText = React.createContext(false);
const Words = React.createContext<Word[]>([]);
const cueAt = (words: Word[], phrase: string, span: ShotSpan, fallback: number) => {
  try { return Math.round(cueTime(words, phrase, span.a / FPS - 0.3) * FPS) - span.a; } catch { return fallback; }
};

const MOODS: Record<string, Mood> = {
  night: { grade: "#1a2a6b", gradeOp: 0.12, vignette: 0.55, glow: "#ffd9a0" },
  road: { grade: "#16205a", gradeOp: 0.14, vignette: 0.6 },
  freeze: { grade: "#1b2a6b", gradeOp: 0.42, vignette: 0.72 },
  lab: { grade: "#0b1430", gradeOp: 0.04, vignette: 0.45 },
  dark: { grade: "#8a5a2a", gradeOp: 0.14, vignette: 0.7 },
};

const k = (u: number, a: number, b: number, from: number, to: number, e = EASE.camera) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
type Pt = { x: number; y: number };
const { gold: GOLD, red: RED, green: GREEN, text: CREAM, orange: ORANGE, muted: MUTED } = LAB;
const FONT = "CaptionSans, sans-serif";
const pop = (u: number, a: number, d = 9) => (u < a ? 0 : k(u, a, a + d, 0, 1, Easing.out(Easing.back(2.2))));
const blinkOf = (f: number, seed: number) => ((f + seed * 37) % 103) < 4;
const toS = (c: Cam, p: Pt): Pt => ({ x: (p.x - 540 - c.x) * c.zoom + 540, y: (p.y - 960 - c.y) * c.zoom + 960 });
const on = (p: Pt, zoom: number, rot = 0): Cam => ({ x: p.x - 540, y: p.y - 960, zoom, rot });

const KAI: Look = CAST.kai, NIA: Look = CAST.nia;
const VOL: Look = { skin: "#f2c39b", hair: "#3b2416", hairStyle: "short", jersey: "#d8c8a0", jersey2: "#b8a678", shorts: "#4a3a2e", socks: "#4a3a2e", boots: "#2a1c14" };
const FLOOR = 1330;
const SIT: Pose = { armL: [18, -40], armR: [18, -40], legL: [6, 0], legR: [6, 0], crouch: 0.6 };
const STAND: Pose = { armL: [12, -6], armR: [12, -6], legL: [6, 0], legR: [6, 0] };
const SKY = "#0b1230";
const LIGHT: Pt = { x: 720, y: 520 };
const FIRE: Pt = { x: 540, y: 1340 };

// ---------------------------------------------------------------- camp set (drawn locally)
const STARS = (() => { const r = rnd(11); return Array.from({ length: 90 }, () => ({ x: -300 + r() * 1680, y: -500 + r() * 1500, s: 2 + r() * 4, p: r() * 6 })); })();
const Stars: React.FC<{ f: number; n?: number }> = ({ f, n = 90 }) => (
  <g>{STARS.slice(0, n).map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff6dc" opacity={0.45 + 0.4 * Math.sin(f * 0.07 + s.p)} />)}</g>
);
const Pine: React.FC<{ x: number; y: number; h: number; c: string }> = ({ x, y, h, c }) => (
  <g>{[0, 1, 2].map((i) => { const w = h * (0.42 - i * 0.1), top = y - h + i * h * 0.12, base = y - i * h * 0.28;
    return <path key={i} d={`M ${x} ${top} L ${x + w} ${base} L ${x - w} ${base} Z`} fill={c} />; })}</g>
);
const Sky: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Layer p={0.15}><Svg><rect x={-900} y={-1200} width={2880} height={3600} fill={SKY} /><Stars f={f} /></Svg></Layer>
    <Layer p={0.45}><Svg>
      <rect x={-900} y={1080} width={2880} height={1400} fill="#0e1828" />
      {Array.from({ length: 22 }, (_, i) => <Pine key={i} x={-500 + i * 100 + ((i * 37) % 40)} y={1110} h={200 + ((i * 53) % 120)} c="#0e1828" />)}
    </Svg></Layer>
  </>
);
const Tent: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -190 0 L 0 -250 L 190 0 Z" fill="#e8743a" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d="M 0 -250 L 70 0 L -70 0 Z" fill="#a8461f" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 0 -250 L 0 0" stroke={INK} strokeWidth={6} />
  </g>
);
const Fire: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const fl = (i: number) => 1 + 0.16 * Math.sin(f * 0.5 + i * 2.1) + 0.08 * Math.sin(f * 1.3 + i);
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cy={-60} r={260} fill="#ff9a3a" opacity={0.1 + 0.03 * Math.sin(f * 0.4)} />
    <circle cy={-60} r={150} fill="#ffb24a" opacity={0.16} />
    <path d="M -90 -6 L 90 -34" stroke="#6b3e22" strokeWidth={30} strokeLinecap="round" />
    <path d="M -90 -34 L 90 -6" stroke="#7d4a2a" strokeWidth={30} strokeLinecap="round" />
    <path d={`M -60 -20 Q -70 ${-110 * fl(0)} 0 ${-170 * fl(1)} Q 70 ${-110 * fl(2)} 60 -20 Z`} fill="#ff7a2f" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d={`M -30 -22 Q -34 ${-80 * fl(3)} 0 ${-115 * fl(2)} Q 34 ${-80 * fl(1)} 30 -22 Z`} fill="#ffd93b" />
  </g>;
};
const Ground: React.FC = () => (
  <g>
    <rect x={-900} y={1150} width={2880} height={1400} fill="#16261e" />
    <ellipse cx={540} cy={1360} rx={620} ry={120} fill="#22382a" />
  </g>
);
const Log: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 250, h = 58 }) => (
  <g>
    <rect x={x - w / 2} y={y - h} width={w} height={h} rx={h / 2} fill="#7d4a2a" stroke={INK} strokeWidth={8} />
    <ellipse cx={x + w / 2 - h * 0.45} cy={y - h / 2} rx={h * 0.34} ry={h * 0.4} fill="#c98a5e" stroke={INK} strokeWidth={6} />
  </g>
);
/** the light in the sky (a glowing dot) */
const Light: React.FC<{ x: number; y: number; r?: number; f: number }> = ({ x, y, r = 12, f }) => (
  <g>
    <circle cx={x} cy={y} r={r * 4.5} fill="#fff1c0" opacity={0.12 + 0.03 * Math.sin(f * 0.2)} />
    <circle cx={x} cy={y} r={r * 2.2} fill="#fff1c0" opacity={0.3} />
    <circle cx={x} cy={y} r={r} fill="#fffaf0" />
  </g>
);
/** a pine branch reaching left; (x, y) = its tip */
const Branch: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 0 Q 160 30 520 10" stroke="#3a2618" strokeWidth={22} fill="none" strokeLinecap="round" />
    {Array.from({ length: 11 }, (_, i) => { const bx = 30 + i * 46, by = 6 + Math.sin(i) * 6;
      return <g key={i}>
        <path d={`M ${bx} ${by} l -26 -46 M ${bx} ${by} l -30 40 M ${bx + 16} ${by} l -14 -52 M ${bx + 16} ${by} l -16 48`} stroke="#1f3a2a" strokeWidth={12} strokeLinecap="round" />
      </g>; })}
  </g>
);
type Item = { y: number; el: React.ReactNode };
const Camp: React.FC<{ f: number; items?: Item[]; over?: React.ReactNode; tent?: boolean; fire?: boolean }> = ({ f, items = [], over, tent = true, fire = true }) => (
  <>
    <Sky f={f} />
    <Layer p={1}><Svg>
      <Ground />
      {tent && <Tent x={880} y={1290} s={0.9} />}
      {fire && <Fire x={FIRE.x} y={FIRE.y} f={f} s={0.8} />}
      {[...items].sort((a, b) => a.y - b.y).map((it, i) => <React.Fragment key={i}>{it.el}</React.Fragment>)}
      {over}
    </Svg></Layer>
  </>
);
const Sitter: React.FC<{ x: number; look: Look; f: number; seed: number; expr: Expr; pose?: Partial<Pose>; s?: number }> = ({ x, look, f, seed, expr, pose = {}, s = 0.95 }) => (
  <g>
    <Person x={x} y={FLOOR} scale={s} look={look} pose={{ ...SIT, ...pose }} expr={expr} blink={blinkOf(f, seed)} t={f} shadow={0} />
    <Log x={x} y={FLOOR + 14} h={96} />
  </g>
);

// ---------------------------------------------------------------- road (hook)
const Road: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Layer p={0.15}><Svg><rect x={-900} y={-1200} width={2880} height={3600} fill="#080c22" /><Stars f={f} n={60} /></Svg></Layer>
    <Layer p={0.5}><Svg>
      <rect x={-900} y={1040} width={2880} height={1600} fill="#101a24" />
      {Array.from({ length: 14 }, (_, i) => <Pine key={i} x={-400 + i * 140 + ((i * 29) % 50)} y={1060} h={150 + ((i * 41) % 90)} c="#0c1420" />)}
    </Svg></Layer>
    <Layer p={1}><Svg>
      <path d="M 500 1060 L 580 1060 L 1300 2300 L -220 2300 Z" fill="#262a36" />
      {Array.from({ length: 7 }, (_, i) => { const t0 = i / 7, t1 = t0 + 0.06, yy = (t: number) => 1060 + t * t * 1240, w = (t: number) => 2 + t * 14;
        return <path key={i} d={`M ${540 - w(t0)} ${yy(t0)} L ${540 + w(t0)} ${yy(t0)} L ${540 + w(t1)} ${yy(t1)} L ${540 - w(t1)} ${yy(t1)} Z`} fill="#e8d27a" opacity={0.85} />; })}
      {[[-1, 0.3], [-1, 0.7], [1, 0.3], [1, 0.7]].map(([sd, t], i) => { const y = 1060 + t * t * 1240, x = 540 + sd * (40 + t * 760) + sd * 40;
        return <rect key={i} x={x - 6 - t * 6} y={y - 80 - t * 120} width={12 + t * 12} height={80 + t * 120} fill="#5a4a3a" stroke={INK} strokeWidth={4} />; })}
    </Svg></Layer>
  </>
);
/** our own generic flying saucer (no game art) */
const Saucer: React.FC<{ x: number; y: number; s: number; f: number; beam?: number }> = ({ x, y, s, f, beam = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {beam > 0 && <g opacity={beam}>
      <path d="M -80 30 L 80 30 L 300 600 L -300 600 Z" fill="#bff6ff" opacity={0.22} />
      <ellipse cx={0} cy={600} rx={300} ry={50} fill="#bff6ff" opacity={0.3} />
    </g>}
    <path d="M -100 -10 C -100 -120 100 -120 100 -10 Z" fill="#9fe6ff" stroke={INK} strokeWidth={9} />
    <path d="M -60 -60 Q -40 -88 -6 -92" stroke="#ffffff" strokeWidth={10} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={0} rx={240} ry={58} fill="#b8bfd0" stroke={INK} strokeWidth={10} />
    <ellipse cx={0} cy={22} rx={170} ry={26} fill="#7d86a8" stroke={INK} strokeWidth={7} />
    {Array.from({ length: 7 }, (_, i) => { const a = -150 + i * 50; const on1 = ((Math.floor(f / 6) + i) % 2) === 0;
      return <circle key={i} cx={a} cy={-6 + Math.abs(a) * 0.04} r={13} fill={on1 ? GOLD : "#ff7a6a"} stroke={INK} strokeWidth={4} />; })}
  </g>
);

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
/** a small double-headed jitter arrow */
const Jit: React.FC<{ x: number; y: number; rot: number; f: number; i: number }> = ({ x, y, rot, f, i }) => {
  const d = 7 * Math.sin(f * 0.9 + i * 1.7);
  return <g transform={`translate(${x + d} ${y}) rotate(${rot})`}>
    <path d="M -46 0 L 46 0 M -30 -16 L -46 0 L -30 16 M 30 -16 L 46 0 L 30 16" stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M -46 0 L 46 0 M -30 -16 L -46 0 L -30 16 M 30 -16 L 46 0 L 30 16" stroke={ORANGE} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>;
};
const Brain: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -130 20 C -170 -60 -100 -140 -20 -120 C 30 -160 130 -130 130 -50 C 180 0 130 90 60 80 C 20 120 -80 120 -100 70 C -150 70 -150 40 -130 20 Z" fill="#ff9fb8" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <path d="M 0 -118 C -20 -60 30 -20 0 40 C -20 80 10 100 0 112 M -90 -40 Q -50 -20 -70 20 M 60 -80 Q 40 -40 80 -10 M 50 40 Q 80 30 90 60" stroke="#d96a8a" strokeWidth={9} fill="none" strokeLinecap="round" />
  </g>
);
/** ordinary-things icons for the AARO card */
const Icon: React.FC<{ kind: number; x: number; y: number; s: number }> = ({ kind, x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={78} fill="#1c2650" stroke={MUTED} strokeWidth={5} />
    {kind === 0 && <g><ellipse cx={0} cy={-14} rx={36} ry={44} fill={RED} stroke={INK} strokeWidth={6} /><path d="M 0 30 L 0 56" stroke={CREAM} strokeWidth={4} /><rect x={-10} y={54} width={20} height={14} fill="#c98a5e" stroke={INK} strokeWidth={4} /></g>}
    {kind === 1 && <g><path d="M -50 6 L 50 -6 M -6 -2 L -26 -40 M -6 -2 L -22 34 M 40 -5 L 46 -24" stroke={CREAM} strokeWidth={14} strokeLinecap="round" /><circle cx={50} cy={-6} r={6} fill={RED} /></g>}
    {kind === 2 && <g><path d="M -44 0 Q -22 -26 0 0 Q 22 -26 44 0" stroke={CREAM} strokeWidth={12} fill="none" strokeLinecap="round" /></g>}
    {kind === 3 && <g><circle r={34} fill="#ffe0a0" stroke={INK} strokeWidth={6} /><path d="M -30 -10 Q 0 0 30 -14 M -26 14 Q 0 20 28 10" stroke="#e8a85a" strokeWidth={6} fill="none" /></g>}
  </g>
);

// ---------------------------------------------------------------- shots
type View = { cam: Cam; mood: Mood; body: React.ReactNode; labels?: React.ReactNode; overlay?: React.ReactNode; bg?: string; cold?: number; fire?: Pt };

const ShotView: React.FC<{ span: ShotSpan; freezeAt?: number }> = ({ span, freezeAt }) => {
  const f0 = useCurrentFrame();
  const f = freezeAt ?? f0;
  const words = React.useContext(Words);
  const noText = React.useContext(NoText);
  const u = f - span.a, len = span.b - span.a;
  const C = (phrase: string, fb: number) => cueAt(words, phrase, span, fb);
  const v = build(span.id, f, u, len, C);
  const fs = v.fire ? toS(v.cam, v.fire) : null;
  return (
    <AbsoluteFill>
      <Stage cam={v.cam} bg={v.bg ?? SKY}>{v.body}</Stage>
      {fs && <Pool x={fs.x} y={fs.y - 120} rx={520 * v.cam.zoom} ry={420 * v.cam.zoom} color="#ffb060" opacity={0.18} />}
      <Grade mood={v.mood} />
      {v.cold ? <Grade mood={MOODS.freeze} strength={v.cold} /> : null}
      {v.overlay}
      {!noText && v.labels && <AbsoluteFill><svg width={1080} height={1920} viewBox="0 0 1080 1920">{v.labels}</svg></AbsoluteFill>}
    </AbsoluteFill>
  );
};

// the light's apparent drift in "point": left, then down
const drifted = (u: number, DL: number, TD: number): Pt => ({ x: LIGHT.x - 130 * k(u, DL, DL + 30, 0, 1), y: LIGHT.y + 80 + 100 * k(u, TD, TD + 26, 0, 1) });
// the wandering path seen in the dark room
const wander = (t: number): Pt => ({ x: 760 + 150 * Math.sin(t * 5.1) * t + 40 * Math.sin(t * 13), y: 640 + 120 * Math.sin(t * 3.3 + 1) * t + 30 * Math.cos(t * 11) });

const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number): View => {
  let cam: Cam = { x: 0, y: 0, zoom: 1, rot: 0 };
  let mood = MOODS.night;
  switch (id) {
    case "hook": {   // frame 0: a generic saucer hovers over a dark country road, the hook words already landed; on "dark road"
      // its beam switches on (flash + kick); slow push in
      mood = MOODS.road;
      const DR = C("dark road", 70), TM = C("two in the morning", 120);
      const beam = arrive(u, DR, 10);
      cam = kickCam(drift(on({ x: 540, y: k(u, 0, len, 960, 900) }, k(u, 0, len, 1.0, 1.12)), f, 1.2), u - DR, 10);
      const body = <><Road f={f} /><Layer p={1}><Svg>
        <Saucer x={540 + 30 * Math.sin(f * 0.05)} y={760 + 14 * Math.sin(f * 0.11)} s={0.95} f={f} beam={beam} />
      </Svg></Layer></>;
      const labels = <>
        <CardLabel f={u} x={510} y={400} size={60} color={CREAM} enter="present" enterAt={-20} exitAt={len - 7}>GTA 6 · PLAYERS SAY:</CardLabel>
        <CardLabel f={u} x={510} y={510} size={78} color={GOLD} enter="scale" enterAt={-20} exitAt={len - 7}>AFTER 2 AM</CardLabel>
        <CountCard f={u} x={510} y={1250} text="2:00 AM" startAt={TM} dur={4} exitAt={len - 7} color={CREAM} size={60} w={360} />
      </>;
      return { cam, mood, body, labels, overlay: <Flash framesSince={u - DR} len={3} />, bg: "#080c22" };
    }
    case "eyes": {   // the saucer flies off and shrinks into one dot of light; a big eye rises in below, looking up at it
      mood = MOODS.road;
      const MO = C("can make", 30);
      const sh = k(u, 0, 34, 0, 1, EASE.arrive);
      cam = drift(on({ x: 540, y: k(u, 0, len, 900, 860) }, k(u, 0, len, 1.12, 1.2)), f, 1.2);
      const sx = 540 + 250 * sh, sy = 760 - 220 * sh;
      const body = <><Road f={f} /><Layer p={1}><Svg>
        {sh < 0.85 && <g opacity={1 - k(sh, 0.6, 0.85, 0, 1, EASE.linear)}><Saucer x={sx} y={sy} s={0.95 * (1 - sh) + 0.05} f={f} beam={0} /></g>}
        {sh > 0.6 && <Light x={sx} y={sy} r={10} f={f} />}
      </Svg></Layer></>;
      const er = arrive(u, 6, 16);
      const overlay = <AbsoluteFill><svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(0 ${(1 - er) * 500})`} opacity={er}>
          <ellipse cx={540} cy={1170} rx={400} ry={250} fill="#c98a5e" stroke={INK} strokeWidth={10} />
          <EyeCloseUp x={540} y={1180} s={0.95} lookX={0.4} lookY={-0.8 + 0.05 * Math.sin(f * 0.3)} lid={0.08} skin="#c98a5e" iris="#4a3020" />
        </g>
      </svg></AbsoluteFill>;
      const labels = <CardLabel f={u} x={510} y={400} size={54} color={GOLD} enter="words" enterAt={MO - 4} exitAt={len - 7}>YOUR EYES CAN MAKE ONE</CardLabel>;
      return { cam, mood, body, labels, overlay, bg: "#080c22" };
    }
    case "camp": {   // wide campsite at 2 a.m.: Kai and Nia by the fire, tent, stars; "2:00 AM" rises in; on "Just stars" the
      // camera cranes up to the sky
      const JS = C("Just stars", 60);
      const up = k(u, JS - 4, len, 0, 1);
      cam = drift(on({ x: 540, y: 980 - 260 * up }, 1.0 + 0.1 * up), f, 1.2);
      const body = <Camp f={f} items={[
        { y: FLOOR, el: <Sitter x={330} look={KAI} f={f} seed={2} expr="calm" pose={{ lookX: 0.4 }} /> },
        { y: FLOOR, el: <Sitter x={750} look={NIA} f={f} seed={4} expr="smile" pose={{ lookX: -0.4 }} /> },
      ]} over={<Light x={LIGHT.x} y={LIGHT.y} r={9} f={f} />} />;
      const labels = <CardLabel f={u} x={510} y={400} size={70} color={GOLD} enter="rise" enterAt={4} exitAt={len - 7}>2:00 AM</CardLabel>;
      return { cam, mood, body, labels, fire: FIRE };
    }
    case "point": {  // medium: Nia points at the light; on "Kai stares" he looks up; on "drifts left" the light slides left, on
      // "Then down" it sinks, a dashed path trails behind it
      const KS = C("Kai stares", 50), DL = C("drifts left", 90), TD = C("Then down", 125);
      cam = drift(on({ x: 600, y: k(u, 0, len, 1015, 1010) }, k(u, 0, len, 1.1, 1.12)), f, 1);
      const lp = drifted(u, DL, TD);
      const arm = arrive(u, 0, 12);
      const nPose = reachLimb({ x: 750, y: FLOOR, scale: 0.95, pose: { ...SIT, lookX: 0.3, headTilt: -6 } }, "armR", lp, 1);
      const nP: Pose = { ...nPose, armR: [SIT.armR[0] + (nPose.armR[0] - SIT.armR[0]) * arm, SIT.armR[1] + (nPose.armR[1] - SIT.armR[1]) * arm] };
      const pts = Array.from({ length: 24 }, (_, i) => drifted(DL + ((u - DL) * i) / 23, DL, TD));
      const body = <Camp f={f} items={[
        { y: FLOOR, el: <Sitter x={330} look={KAI} f={f} seed={2} expr={u >= KS ? "focused" : "calm"} pose={{ lookX: u >= KS ? 0.7 : 0.4, headTilt: u >= KS ? -8 : 0 }} /> },
        { y: FLOOR, el: <Sitter x={750} look={NIA} f={f} seed={4} expr="shock" pose={nP} /> },
      ]} over={<g>
        {u > DL && <path d={`M ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")}`} stroke={GOLD} strokeWidth={6} strokeDasharray="10 16" fill="none" strokeLinecap="round" opacity={0.85} />}
        <Light x={lp.x} y={lp.y} r={10} f={f} />
      </g>} />;
      const labels = <CardLabel f={u} x={330} y={390} size={62} color={GOLD} enter="words" enterAt={DL} exitAt={len - 7}>IT DRIFTS</CardLabel>;
      return { cam, mood, body, labels, fire: FIRE };
    }
    case "phone": {  // Kai's phone rises into frame against the sky; the light on the screen sits dead still while the real light
      // behind keeps wandering; on "perfectly still" a crosshair locks onto it
      const PS = C("perfectly still", 70);
      cam = drift(on({ x: 640, y: 640 }, 1.25), f, 1);
      const real = { x: 600 + 60 * Math.sin(u * 0.05), y: 560 + 40 * Math.sin(u * 0.037 + 1) };
      const ph = arrive(u, 2, 16);
      const lock = k(u, PS, PS + 8, 1.7, 1, EASE.arrive);
      const body = <>
        <Camp f={f} tent={false} fire={false} over={<Light x={real.x} y={real.y} r={9} f={f} />} />
        <Layer p={0}><Svg><g transform={`translate(0 ${(1 - ph) * 1000})`}>
          <rect x={300} y={470} width={480} height={860} rx={64} fill="#1b1d26" stroke={INK} strokeWidth={12} />
          <rect x={326} y={520} width={428} height={760} rx={30} fill="#08102a" />
          {[[380, 600], [700, 620], [450, 1150], [690, 1080], [520, 700], [640, 1210]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#cfd8ff" opacity={0.6} />)}
          {[0, 1, 2].map((i) => <path key={i} d={`M ${326 + 107 * (i + 1)} 520 L ${326 + 107 * (i + 1)} 1280`} stroke="#22305a" strokeWidth={3} />)}
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M 326 ${520 + 152 * (i + 1)} L 754 ${520 + 152 * (i + 1)}`} stroke="#22305a" strokeWidth={3} />)}
          <Light x={540} y={900} r={10} f={f} />
          {u >= PS && <g transform={`translate(540 900) scale(${lock})`} opacity={k(u, PS, PS + 4, 0, 1)}>
            {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b], i) => <path key={i} d={`M ${a * 70} ${b * 30} L ${a * 70} ${b * 70} L ${a * 30} ${b * 70}`} stroke={GREEN} strokeWidth={9} fill="none" strokeLinecap="round" />)}
          </g>}
          <circle cx={370} cy={560} r={11} fill={RED} opacity={(Math.floor(f / 12) % 2) ? 1 : 0.3} />
          <rect x={250} y={1100} width={110} height={180} rx={50} fill={KAI.skin} stroke={INK} strokeWidth={9} />
          <rect x={720} y={1100} width={110} height={180} rx={50} fill={KAI.skin} stroke={INK} strokeWidth={9} />
          <path d="M 250 1270 L 230 1920 L 380 1920 L 360 1270 Z M 720 1270 L 700 1920 L 850 1920 L 830 1270 Z" fill={KAI.jersey} stroke={INK} strokeWidth={9} />
        </g></Svg></Layer>
      </>;
      const labels = <CardLabel f={u} x={510} y={390} size={56} color={GREEN} enter="scale" enterAt={PS + 2} exitAt={len - 7}>ON SCREEN: STILL</CardLabel>;
      return { cam, mood, body, labels };
    }
    case "wait": {   // cold freeze: close two-shot, Kai and Nia turn to each other, puzzled
      const DI = C("Did it", 12);
      cam = kickCam(drift(on({ x: 540, y: 1010 }, k(u, 0, len, 1.6, 1.7)), f, 0.8), u - DI, 10);
      const turn = arrive(u, 2, 10);
      const body = <Camp f={f} items={[
        { y: FLOOR, el: <Sitter x={380} look={KAI} f={f} seed={2} expr="worried" pose={{ lookX: 0.8 * turn, headTilt: 6 * turn, armL: [30, -60], armR: [50, -100] }} /> },
        { y: FLOOR, el: <Sitter x={700} look={NIA} f={f} seed={4} expr="shock" pose={{ lookX: -0.8 * turn, headTilt: -6 * turn }} /> },
      ]} />;
      const labels = <CardLabel f={u} x={510} y={400} size={70} color={CREAM} enter="scale" enterAt={DI} exitAt={len - 7}>DID IT MOVE?</CardLabel>;
      return { cam, mood, body, labels, cold: 0.8, fire: FIRE };
    }
    case "jitter": { // lab: a big eye that is never still (tiny jitter arrows); on "in the dark" the eye leaves, the lab goes dark
      // and one lone dot stays; on "nothing next to it" a search ring sweeps around it and NO REFERENCE words in
      mood = MOODS.lab;
      const ID = C("in the dark", 120), NN = C("nothing next to", 160);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, ID, 1.0, 1.06), rot: 0 }, f, 1);
      const gone = leave(u, ID - 6, 10);
      const dark = k(u, ID - 4, ID + 12, 0, 0.75);
      const jx = 0.07 * Math.sin(f * 1.7) + 0.05 * Math.sin(f * 3.3), jy = 0.06 * Math.sin(f * 2.3 + 1);
      const ring = arrive(u, NN, 12);
      const body = <Lab>
        {gone < 1 && <g opacity={1 - gone}>
          <EyeCloseUp x={540 + jx * 30} y={760 + jy * 20} s={0.95} lookX={jx} lookY={jy} lid={0.12} skin="#c98a5e" iris="#4a3020" />
          <Jit x={150} y={760} rot={0} f={f} i={0} /><Jit x={930} y={760} rot={0} f={f} i={1} />
          <Jit x={540} y={1080} rot={90} f={f} i={2} /><Jit x={290} y={1010} rot={45} f={f} i={3} /><Jit x={790} y={1010} rot={-45} f={f} i={4} />
        </g>}
        {dark > 0 && <rect x={-600} y={-600} width={2280} height={3200} fill="#02040c" opacity={dark} />}
        {u >= ID - 2 && <g opacity={arrive(u, ID - 2, 10)}>
          <Light x={540} y={760} r={14} f={f} />
          {ring > 0 && <g transform={`rotate(${u * 2} 540 760)`} opacity={ring}>
            <circle cx={540} cy={760} r={190} fill="none" stroke={MUTED} strokeWidth={6} strokeDasharray="18 22" />
          </g>}
        </g>}
      </Lab>;
      const labels = <CardLabel f={u} x={510} y={1120} size={64} color={GOLD} enter="words" enterAt={NN + 4} exitAt={len - 7}>NO REFERENCE</CardLabel>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "name": {   // lab: brain on the left, the dot wanders on the right; on "blames the light" a red arrow shoots from the brain to
      // the dot; on "It's called" they clear and AUTOKINETIC / EFFECT stamp in; "100+ YEARS" lands on "hundred years"
      mood = MOODS.lab;
      const BL = C("blames the light", 25), IC = C("It's called", 70), HY = C("hundred years", 160);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 1);
      const clr = leave(u, IC - 6, 10);
      const dot = { x: 790 + 50 * Math.sin(u * 0.09), y: 760 + 40 * Math.sin(u * 0.07 + 1) };
      const ar = k(u, BL, BL + 12, 0, 1, EASE.arrive);
      const body = <Lab>
        {clr < 1 && <g opacity={1 - clr}>
          <Brain x={280} y={760} s={1.0} />
          <Light x={dot.x} y={dot.y} r={14} f={f} />
          {ar > 0 && <g>
            <path d={`M 440 760 L ${440 + (dot.x - 90 - 440) * ar} ${760 + (dot.y - 760) * ar}`} stroke={INK} strokeWidth={26} strokeLinecap="round" />
            <path d={`M 440 760 L ${440 + (dot.x - 90 - 440) * ar} ${760 + (dot.y - 760) * ar}`} stroke={RED} strokeWidth={14} strokeLinecap="round" />
          </g>}
        </g>}
        {u >= IC && <g opacity={arrive(u, IC, 12)}>
          <circle cx={540} cy={1080} r={0} />
          {Array.from({ length: 5 }, (_, i) => { const t = ((u - IC) * 0.012 + i * 0.2) % 1; const p = wander(t);
            return <circle key={i} cx={p.x - 220} cy={p.y + 380} r={8} fill={GOLD} opacity={0.25 + 0.15 * i} />; })}
        </g>}
      </Lab>;
      const labels = <>
        <Label f={u} x={510} y={560} size={100} color={GOLD} enter="scale" enterAt={IC + 4} exitAt={len - 7}>AUTOKINETIC</Label>
        <Label f={u} x={510} y={680} size={100} color={CREAM} enter="scale" enterAt={IC + 10} exitAt={len - 7}>EFFECT</Label>
        <CountCard f={u} x={510} y={1250} text="100+ YEARS" startAt={HY} dur={4} exitAt={len - 7} size={64} w={480} />
      </>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "darkroom": { // 1930s dark room: start close on the seated volunteer, pull back to the one still dot; on "saw it wander"
      // a ghost dot travels a wandering dashed path while the real dot stays put
      mood = MOODS.dark;
      const OS = C("one still dot", 70), SW = C("saw it wander", 130);
      const pull = k(u, 10, OS + 10, 0, 1);
      cam = drift(on({ x: 330 + 210 * pull, y: 1000 - 40 * pull }, 1.55 - 0.55 * pull), f, 0.8);
      const wt = k(u, SW, len - 6, 0, 1, EASE.linear);
      const pts = Array.from({ length: 40 }, (_, i) => wander((wt * i) / 39));
      const g = wander(wt);
      const body = <>
        <Layer p={0.3}><Svg><rect x={-900} y={-1200} width={2880} height={3600} fill="#07060a" />
          <rect x={-900} y={1150} width={2880} height={1400} fill="#0d0a0e" /></Svg></Layer>
        <Layer p={1}><Svg>
          <ellipse cx={300} cy={1340} rx={240} ry={30} fill="#000" opacity={0.5} />
          <rect x={220} y={1150} width={160} height={24} rx={8} fill="#5a3a24" stroke={INK} strokeWidth={6} />
          <path d="M 236 1174 L 236 1330 M 364 1174 L 364 1330 M 364 1150 L 364 990" stroke="#5a3a24" strokeWidth={14} strokeLinecap="round" />
          <Person x={300} y={FLOOR} scale={1.0} look={VOL} pose={{ ...SIT, lookX: 0.8, headTilt: -4 }} expr={u >= SW ? "shock" : "focused"} blink={blinkOf(f, 6)} t={f} shadow={0} />
          {u >= SW && <path d={`M ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")}`} stroke="#e8c27a" strokeWidth={6} strokeDasharray="10 16" fill="none" strokeLinecap="round" opacity={0.8} />}
          {u >= SW && <circle cx={g.x} cy={g.y} r={12} fill="#ffe7b0" opacity={0.6} />}
          <Light x={760} y={640} r={11} f={f} />
        </Svg></Layer>
      </>;
      const labels = <CardLabel f={u} x={510} y={400} size={74} color={GOLD} enter="rise" enterAt={4} exitAt={len - 7}>1930s</CardLabel>;
      return { cam, mood, body, labels, bg: "#07060a" };
    }
    case "branch": { // close on the sky: the light wobbles (autokinetic); a pine branch slides in right next to it; on "it stops"
      // the light locks (ring pop) and REFERENCE = STILL scales in
      const PB = C("Put a branch", 2), ST = C("it stops", 70);
      cam = drift(on({ x: 720, y: 600 }, k(u, 0, len, 1.55, 1.65)), f, 0.8);
      const lock = k(u, ST - 2, ST + 6, 0, 1, EASE.arrive);
      const wob = 1 - lock;
      const lp = { x: LIGHT.x + wob * 40 * Math.sin(u * 0.11), y: LIGHT.y + wob * 30 * Math.sin(u * 0.08 + 1) };
      const bx = k(u, PB + 4, PB + 30, 1300, LIGHT.x + 46, EASE.arrive);
      const ring = u >= ST ? k(u, ST, ST + 14, 0, 1, EASE.arrive) : 0;
      const body = <Camp f={f} tent={false} fire={false} over={<g>
        <Branch x={bx} y={LIGHT.y + 40} s={0.9} />
        <Light x={lp.x} y={lp.y} r={10} f={f} />
        {ring > 0 && <circle cx={lp.x} cy={lp.y} r={26 + 30 * ring} fill="none" stroke={GREEN} strokeWidth={5} opacity={1 - ring * 0.6} />}
      </g>} />;
      const labels = <CardLabel f={u} x={510} y={400} size={62} color={GREEN} enter="scale" enterAt={ST + 2} exitAt={len - 7}>REFERENCE = STILL</CardLabel>;
      return { cam, mood, body, labels };
    }
    case "pentagon": { // lab: a report folder; the year counter runs 1945 -> 2023 on "almost eighty years"; NO ALIEN TECH FOUND
      // stamps on "No evidence"; on "Mostly ordinary things" the card words in and four ordinary icons pop in a row
      mood = MOODS.lab;
      const EY = C("eighty years", 30), NE = C("No evidence", 95), MO = C("Mostly ordinary", 145);
      cam = drift({ x: 0, y: k(u, 0, len, 10, -10), zoom: k(u, 0, len, 1.0, 1.04), rot: 0 }, f, 1);
      const fp = arrive(u, 0, 12);
      const year = countValue(u, EY - 6, 30, 1945, 2023);
      const body = <Lab>
        <g transform={`translate(540 ${640 + (1 - fp) * 60}) scale(${0.75 + 0.1 * fp})`} opacity={fp}>
          <path d="M -230 -150 L -80 -150 L -50 -120 L 230 -120 L 230 170 L -230 170 Z" fill="#c9a46a" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
          <rect x={-200} y={-100} width={400} height={250} rx={8} fill="#f6efe0" stroke={INK} strokeWidth={6} />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-170} y={-70 + i * 44} width={i % 2 ? 260 : 330} height={14} rx={7} fill="#c9ccd2" />)}
          <path d="M -230 -60 L 230 -60 L 230 170 L -230 170 Z" fill="#e0b878" stroke={INK} strokeWidth={10} strokeLinejoin="round" opacity={0.9 * (1 - k(u, 8, 26, 0, 1))} />
        </g>
        {[0, 1, 2, 3].map((i) => { const p = pop(u, MO + 8 + i * 6, 10); return p > 0 ? <Icon key={i} kind={i} x={210 + i * 220} y={1250} s={p} /> : null; })}
      </Lab>;
      const labels = <>
        <CountCard f={u} x={510} y={400} text={`1945-${u < EY - 6 ? 1945 : year}`} startAt={4} dur={EY + 24} exitAt={len - 7} size={70} w={520} />
        <Stamp f={u} x={520} y={900} text="NO ALIEN TECH FOUND" at={NE} exitAt={len - 7} size={50} rot={-4} />
        <CardLabel f={u} x={510} y={1090} size={54} color={CREAM} enter="words" enterAt={MO} exitAt={len - 7}>MOSTLY ORDINARY THINGS</CardLabel>
      </>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "twist": {  // next night, wide: Kai stands and lines the light up with a branch of a pine (dashed sight line); on "a planet"
      // the light swells into a small planet, PLANET words in; on "Nia isn't convinced" the camera eases to Nia, arms
      // folded, smirking
      const LU = C("lines the light", 20), PL = C("a planet", 85), NI = C("Nia isn't", 150);
      const toN = k(u, NI - 8, NI + 16, 0, 1);
      cam = drift(on({ x: 540 + 250 * toN, y: 900 + 120 * toN }, 1.0 + 0.55 * toN), f, 1);
      const LP: Pt = { x: 470, y: 470 };
      const pl = k(u, PL, PL + 14, 0, 1, EASE.arrive);
      const sight = k(u, LU, LU + 16, 0, 1, EASE.arrive);
      const eye: Pt = { x: 300, y: FLOOR - 400 * 0.95 };
      const kPose = reachLimb({ x: 300, y: FLOOR, scale: 0.95, pose: { ...STAND, lookX: 0.5, headTilt: -8 } }, "armR", LP, 1);
      const fold = arrive(u, NI, 10);
      const nPose: Pose = { ...STAND, armL: [12 - 40 * fold, -6 - 110 * fold], armR: [12 - 40 * fold, -6 - 110 * fold], lookX: u >= NI ? -0.2 : -0.5 };
      const body = <Camp f={f} tent={false} items={[
        { y: FLOOR, el: <Person x={300} y={FLOOR} scale={0.95} look={KAI} pose={kPose} expr={u >= PL ? "smile" : "focused"} blink={blinkOf(f, 2)} t={f} /> },
        { y: FLOOR, el: <Person x={820} y={FLOOR} scale={0.95} look={NIA} pose={nPose} expr={u >= NI ? "smirk" : "calm"} blink={blinkOf(f, 4)} t={f} /> },
        { y: FLOOR - 2, el: <g><rect x={626} y={760} width={28} height={570} fill="#3a2618" stroke={INK} strokeWidth={6} /><Pine x={640} y={1080} h={560} c="#1a3024" /></g> },
      ]} over={<g>
        {toN < 0.5 && <g opacity={1 - 2 * toN}><Branch x={LP.x + 40} y={LP.y + 36} s={0.4} /></g>}
        {sight > 0 && <path d={`M ${eye.x} ${eye.y} L ${eye.x + (LP.x - eye.x) * sight} ${eye.y + (LP.y - eye.y) * sight}`} stroke={GOLD} strokeWidth={6} strokeDasharray="12 14" opacity={0.8 * (1 - leave(u, NI - 10, 8))} />}
        {toN > 0.5 ? null : pl > 0 ? <g opacity={1 - 2 * toN} transform={`translate(${LP.x} ${LP.y}) scale(${0.3 + 0.7 * pl})`}>
          <circle r={110} fill="#fff1c0" opacity={0.15} />
          <circle r={52} fill="#ffe0a0" stroke={INK} strokeWidth={7} />
          <path d="M -46 -14 Q 0 0 46 -18 M -44 18 Q 0 26 46 12" stroke="#e8a85a" strokeWidth={8} fill="none" />
        </g> : <Light x={LP.x} y={LP.y} r={10} f={f} />}
      </g>} />;
      const labels = <CardLabel f={u} x={510} y={360} size={74} color={GOLD} enter="scale" enterAt={PL + 4} exitAt={NI - 10}>PLANET</CardLabel>;
      return { cam, mood, body, labels, fire: FIRE };
    }
    default: {       // ask: by the fire, Kai and Nia look up; the camera pulls out wide and cranes up to the starry sky; a shooting
      // star crosses on "seen in the sky"
      const SK = C("in the sky", 40);
      const pull = k(u, 0, len, 0, 1);
      cam = drift(on({ x: 540, y: 1100 - 260 * pull }, 1.45 - 0.45 * pull), f, 1);
      const ss = k(u, SK, SK + 18, 0, 1, EASE.linear);
      const body = <Camp f={f} items={[
        { y: FLOOR, el: <Sitter x={330} look={KAI} f={f} seed={2} expr="smile" pose={{ lookX: 0.2, headTilt: -10 }} /> },
        { y: FLOOR, el: <Sitter x={750} look={NIA} f={f} seed={4} expr="smirk" pose={{ lookX: -0.2, headTilt: 10 }} /> },
      ]} over={<g>
        <Light x={470} y={470} r={10} f={f} />
        {ss > 0 && ss < 1 && <path d={`M ${200 + 500 * ss} ${300 + 160 * ss} l -160 -50`} stroke="#fff6dc" strokeWidth={6} strokeLinecap="round" opacity={Math.sin(ss * Math.PI)} />}
      </g>} />;
      return { cam, mood, body, fire: FIRE };
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
  const fade = prev && u < XF && (PLACE[prev.id] ?? "camp") !== (PLACE[span.id] ?? "camp");
  return (
    <Words.Provider value={words}><AbsoluteFill>
      <NoText.Provider value={!!fade}><ShotView span={span} /></NoText.Provider>
      {fade && prev && <NoText.Provider value><AbsoluteFill style={{ opacity: 1 - (u + 1) / (XF + 1) }}><ShotView span={prev} freezeAt={prev.b - 1} /></AbsoluteFill></NoText.Provider>}
    </AbsoluteFill></Words.Provider>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "gta-ufo",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: SKY,
};
export default story;
