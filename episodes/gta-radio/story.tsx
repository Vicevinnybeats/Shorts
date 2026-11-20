// "You'll Love the GTA 6 Song You Hate. Here's Why" - 2.5D. Hook: Kai hated the song on Monday, by Friday he sings it
// (our own drawn car dashboard at night, a radio display "TRACK 1" and music notes; never game art, logos, real song
// titles or artists; "GTA 6" and "Kotaku" only as plain words). Kotaku counted 150 songs on the pop and classic rock
// stations (attributed). One track keeps coming back (PLAYED: 1, 2, 3). Nia catches him humming. Science: Zajonc
// (1968) mere exposure: strange words/symbols shown 0, 1, 2, 5, 10 or 25 times, liking rises with exposure. Music:
// later studies found an inverted U (too many plays -> liking falls). Joke meter: 2nd funny, 10th annoying. Twist:
// week 3, Kai turns the dial to another station.
// Sets (all new framings vs gta-redlight, no sofa/TV): car interior from the dashboard (hook), side view on an evening
// road (drive), front view through the windshield at night (again), radio close-up with Kai's hand (week3), kitchen
// behind a foreground island counter (day5/what/ask) so nobody stands in the caption band, and the LAB.
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
import { KITCHEN, KitchenWall } from "../../library/environments25/kitchen";
import scenes from "../../content/scripts/gta-radio.json";

const SHOTS = scenes.shots.map((s) => ({ id: s.id, cue: s.cue }));

const NoText = React.createContext(false);
const Words = React.createContext<Word[]>([]);
const cueAt = (words: Word[], phrase: string, span: ShotSpan, fallback: number) => {
  try { return Math.round(cueTime(words, phrase, span.a / FPS - 0.3) * FPS) - span.a; } catch { return fallback; }
};

const MOODS: Record<string, Mood> = {
  night: { grade: "#1a2a6b", gradeOp: 0.1, vignette: 0.5, glow: "#9dff9a" },
  evening: { grade: "#ff8a5a", gradeOp: 0.06, vignette: 0.4 },
  lab: { grade: "#0b1430", gradeOp: 0.04, vignette: 0.45 },
  kitchen: { grade: "#ffd9a0", gradeOp: 0.06, vignette: 0.4 },
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
const LCD = "#9dff9a", CARRED = "#e8443a", BLUE = "#7fc8ff";

// ---------------------------------------------------------------- music notes + radio (our own drawings)
const Note: React.FC<{ x: number; y: number; s?: number; c: string; o?: number; rot?: number }> = ({ x, y, s = 1, c, o = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <path d="M 6 16 L 6 -52 Q 34 -42 32 -14" stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" />
    <path d="M 6 16 L 6 -52 Q 34 -42 32 -14" stroke={c} strokeWidth={6} fill="none" strokeLinecap="round" />
    <ellipse cx={-8} cy={18} rx={19} ry={14} transform="rotate(-22 -8 18)" fill={c} stroke={INK} strokeWidth={5} />
  </g>
);
/** a stream of notes rising from (ox, oy) by (dx, dy); loops forever */
const notes = (f: number, ox: number, oy: number, dx: number, dy: number, n: number, c: string, s = 1, seed = 0) =>
  Array.from({ length: n }, (_, i) => {
    const t = (f / 70 + i / n + seed) % 1;
    const o = Math.min(1, t * 5) * Math.min(1, (1 - t) * 4);
    return <Note key={i} x={ox + dx * t + 18 * Math.sin((f + i * 40) * 0.08)} y={oy + dy * t} s={s * (0.75 + 0.35 * t)} c={c} o={o} rot={10 * Math.sin(f * 0.1 + i)} />;
  });

/** car radio: display (text or static), equaliser bars, speaker grille, a big tuning knob (rot in degrees) */
const Radio: React.FC<{ x: number; y: number; s: number; f: number; text: string; knob?: number; statik?: boolean; eqColor?: string }> =
  ({ x, y, s, f, text, knob = 0, statik = false, eqColor = LCD }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-184} y={-104} width={368} height={208} rx={24} fill="#1b1d26" stroke={INK} strokeWidth={7} />
      <rect x={-164} y={-84} width={218} height={96} rx={10} fill="#0f2a1a" stroke="#3a5a40" strokeWidth={4} />
      {statik
        ? Array.from({ length: 14 }, (_, i) => <rect key={i} x={-158 + ((i * 37 + f * 13) % 200)} y={-78 + ((i * 23 + f * 7) % 80)} width={18 + (i % 3) * 8} height={4} fill={LCD} opacity={0.7} />)
        : <text x={-55} y={-32} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={eqColor}>{text}</text>}
      {!statik && Array.from({ length: 8 }, (_, i) => { const h = 4 + 16 * Math.abs(Math.sin(f * 0.35 + i * 1.3)); return <rect key={i} x={-150 + i * 24} y={2 - h} width={16} height={h} fill={eqColor} opacity={0.85} />; })}
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={-150 + (i % 6) * 36} cy={46 + Math.floor(i / 6) * 28} r={8} fill="#0d0e14" />)}
      <g transform={`translate(112 -24) rotate(${knob})`}>
        <circle r={48} fill="#3a3f4c" stroke={INK} strokeWidth={6} />
        <circle r={32} fill="#4a505e" />
        <path d="M 0 -6 L 0 -40" stroke={GOLD} strokeWidth={8} strokeLinecap="round" />
      </g>
      <circle cx={112} cy={62} r={24} fill="#3a3f4c" stroke={INK} strokeWidth={5} />
    </g>
  );

// ---------------------------------------------------------------- hook: car interior seen from the dashboard (night)
const Interior: React.FC<{ f: number; expr: Expr; tilt: number; sing: number }> = ({ f, expr, tilt, sing }) => {
  const kPose: Pose = { armL: [38, -30], armR: [38, -30], legL: [6, 0], legR: [6, 0], headTilt: tilt };
  return <>
    <Layer p={0.4}><Svg>
      <rect x={-400} y={-400} width={1880} height={2800} fill="#121633" />
      <path d="M 40 300 Q 540 220 1040 300 L 1000 720 L 80 720 Z" fill="#1d2552" stroke="#0a0c1c" strokeWidth={14} />
      {Array.from({ length: 4 }, (_, i) => { const x = 1100 - ((f * 9 + i * 330) % 1320); return <g key={i}><circle cx={x} cy={420} r={26} fill="#ffd98a" opacity={0.85} /><circle cx={x} cy={420} r={70} fill="#ffd98a" opacity={0.15} /></g>; })}
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={((i * 190 - f * 3) % 1140 + 1140) % 1140 - 60} y={560 + (i % 3) * 30} width={120} height={160} fill="#0e1230" />)}
    </Svg></Layer>
    <Layer p={1}><Svg>
      <rect x={250} y={600} width={340} height={300} rx={80} fill="#2c2536" stroke={INK} strokeWidth={8} />
      <rect x={200} y={860} width={440} height={700} rx={60} fill="#2c2536" stroke={INK} strokeWidth={8} />
      <Person x={420} y={1580} scale={2.2} look={KAI} pose={kPose} expr={expr} blink={blinkOf(f, 2) && sing < 0.5} t={f} shadow={0} />
      <g transform={`translate(420 1150)`}>
        <circle r={230} fill="none" stroke={INK} strokeWidth={62} />
        <circle r={230} fill="none" stroke="#1b1d26" strokeWidth={46} />
        <path d="M -230 0 L 230 0" stroke="#1b1d26" strokeWidth={34} />
      </g>
      <path d="M -200 1220 Q 540 1110 1280 1220 L 1280 2100 L -200 2100 Z" fill="#2a2e38" stroke={INK} strokeWidth={9} />
      <path d="M -200 1300 Q 540 1200 1280 1300" stroke="#3a3f4c" strokeWidth={10} fill="none" />
      <circle cx={420} cy={1360} r={60} fill="#1b1d26" stroke={INK} strokeWidth={8} />
      <Radio x={760} y={1300} s={0.95} f={f} text="TRACK 1" />
      {notes(f, 700, 1180, -40 - 120 * sing, -360, 5, sing > 0.5 ? GOLD : MUTED, 0.9 + 0.3 * sing)}
    </Svg></Layer>
  </>;
};

// ---------------------------------------------------------------- drive: side view on an evening road
const SideCar: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => {
  const b = 3 * Math.sin(f * 0.5);
  const spin = f * 14;
  return <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={4} rx={300} ry={18} fill="#000" opacity={0.3} />
    <g transform={`translate(0 ${b})`}>
      <path d="M -150 -150 L -90 -250 L 110 -250 L 180 -150 Z" fill="#9fd3f0" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <circle cx={80} cy={-185} r={40} fill={KAI.skin} stroke={INK} strokeWidth={6} />
      <path d="M 42 -196 Q 50 -236 92 -228 Q 120 -222 118 -196 Q 90 -214 42 -196 Z" fill={KAI.hair} stroke={INK} strokeWidth={5} />
      <circle cx={102} cy={-188} r={5} fill={INK} /><path d="M 104 -166 Q 112 -164 116 -170" stroke={INK} strokeWidth={4} fill="none" />
      <path d="M 10 -250 L 10 -150" stroke={INK} strokeWidth={14} />
      <path d="M -280 -40 L -280 -120 Q -270 -150 -230 -150 L 250 -150 Q 285 -145 285 -100 L 285 -40 Z" fill={CARRED} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -260 -100 L 260 -100" stroke="#b8322a" strokeWidth={6} />
      <rect x={250} y={-130} width={30} height={22} rx={6} fill="#fff6c2" stroke={INK} strokeWidth={4} />
      <rect x={-280} y={-130} width={22} height={22} rx={6} fill="#ff6a5a" stroke={INK} strokeWidth={4} />
    </g>
    {[-170, 170].map((wx) => <g key={wx} transform={`translate(${wx} -40) rotate(${spin})`}>
      <circle r={58} fill={INK} /><circle r={26} fill="#8a8f9c" />
      {[0, 120, 240].map((a) => <path key={a} d="M 0 0 L 0 -24" stroke={INK} strokeWidth={6} transform={`rotate(${a})`} />)}
    </g>)}
  </g>;
};
const Palm: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 0 Q 10 -150 -10 -300" stroke="#5a3a2c" strokeWidth={22} fill="none" strokeLinecap="round" />
    {[-60, -20, 20, 60, 100].map((a) => <path key={a} d="M -10 -300 Q 50 -340 110 -300" stroke="#2f6b3c" strokeWidth={18} fill="none" strokeLinecap="round" transform={`rotate(${a} -10 -300)`} />)}
  </g>
);
const RoadSide: React.FC<{ f: number; waves: number }> = ({ f, waves }) => {
  const wrap = (v: number, w: number) => ((v % w) + w) % w;
  return <>
    <Layer p={0}><Svg>
      <rect x={-400} y={-400} width={1880} height={900} fill="#5a3a7a" />
      <rect x={-400} y={480} width={1880} height={260} fill="#c85a7a" />
      <rect x={-400} y={720} width={1880} height={400} fill="#ff9a6a" />
      <circle cx={760} cy={980} r={110} fill="#ffd98a" />
    </Svg></Layer>
    <Layer p={0.3}><Svg>
      {Array.from({ length: 9 }, (_, i) => { const w = 110 + (i % 3) * 40, h = 180 + ((i * 53) % 160), x = wrap(i * 170 - f * 1.5, 1530) - 250;
        return <rect key={i} x={x} y={1120 - h} width={w} height={h} fill={i % 2 ? "#3a2a55" : "#4a3366"} />; })}
    </Svg></Layer>
    <Layer p={0.6}><Svg>
      <rect x={-400} y={1110} width={1880} height={60} fill="#2f6b3c" />
      {Array.from({ length: 4 }, (_, i) => <Palm key={i} x={wrap(i * 380 - f * 5, 1520) - 220} y={1130} s={0.9} />)}
    </Svg></Layer>
    <Layer p={1}><Svg>
      <rect x={-400} y={1160} width={1880} height={260} fill="#3c4150" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={wrap(i * 220 - f * 22, 1760) - 340} y={1284} width={120} height={14} fill="#f2d36b" />)}
      <rect x={-400} y={1420} width={1880} height={600} fill="#6aa04e" />
      <rect x={-400} y={1410} width={1880} height={20} fill="#c9ccd2" />
      {waves > 0 && [0, 1, 2].map((i) => { const t = ((f / 40) + i / 3) % 1;
        return <path key={i} d={`M ${540 - 90 - 220 * t} ${1010 - 160 * t} Q 540 ${930 - 330 * t} ${540 + 90 + 220 * t} ${1010 - 160 * t}`} stroke={GOLD} strokeWidth={10} fill="none" strokeLinecap="round" opacity={waves * (1 - t)} />; })}
      {notes(f, 380, 1040, -260, -220, 4, GOLD, 0.9, 0.3)}
      <SideCar x={540} y={1300} f={f} />
    </Svg></Layer>
  </>;
};

// ---------------------------------------------------------------- again: front view through the windshield (night)
const FrontCar: React.FC<{ f: number; expr: Expr; tilt: number }> = ({ f, expr, tilt }) => {
  const wrap = (v: number, w: number) => ((v % w) + w) % w;
  const kPose: Pose = { armL: [30, -40], armR: [30, -40], legL: [6, 0], legR: [6, 0], headTilt: tilt };
  return <>
    <Layer p={0.3}><Svg>
      <rect x={-400} y={-400} width={1880} height={1300} fill="#10163a" />
      {Array.from({ length: 10 }, (_, i) => { const w = 120 + (i % 3) * 30, h = 200 + ((i * 71) % 220), x = -260 + i * 165;
        return <g key={i}><rect x={x} y={840 - h} width={w} height={h} fill="#1a2150" />
          {Array.from({ length: 6 }, (_, j) => <rect key={j} x={x + 18 + (j % 2) * (w / 2 - 6)} y={860 - h + Math.floor(j / 2) * 54} width={24} height={20} fill="#ffd98a" opacity={(i + j) % 3 ? 0.55 : 0.15} />)}</g>; })}
    </Svg></Layer>
    <Layer p={1}><Svg>
      <path d="M 500 830 L 580 830 L 1400 2000 L -320 2000 Z" fill="#2a2e3c" />
      <rect x={-400} y={820} width={1880} height={12} fill="#20243a" />
      {Array.from({ length: 5 }, (_, i) => { const t = wrap(f / 30 + i / 5, 1), y = 840 + 1100 * t * t, w = 4 + 26 * t;
        return <rect key={i} x={540 - w / 2} y={y} width={w} height={20 + 120 * t} fill="#f2d36b" opacity={0.8} />; })}
      {[-1, 1].map((side) => Array.from({ length: 3 }, (_, i) => { const t = wrap(f / 45 + i / 3, 1), x = 540 + side * (60 + 900 * t * t), y = 820 - 40 - 500 * t * t, s = 0.3 + 1.6 * t * t;
        return <g key={`${side}${i}`} transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, (1 - t) * 6)}>
          <rect x={-6} y={0} width={12} height={260} fill="#3a3f4c" /><circle cx={0} cy={0} r={22} fill="#ffd98a" /><circle r={60} fill="#ffd98a" opacity={0.2} /></g>; }))}
      {[270, 810].map((hx) => <path key={hx} d={`M ${hx - 60} 1180 L ${hx + 60} 1180 L ${hx + 320 * Math.sign(hx - 540)} 2000 L ${hx - 140 * Math.sign(hx - 540) - 200} 2000 Z`} fill="#fff6c2" opacity={0.12} />)}
      <path d="M 330 690 L 750 690 L 840 1060 L 240 1060 Z" fill="#1b2140" />
      <Person x={540} y={1340} scale={1.45} look={KAI} pose={kPose} expr={expr} blink={blinkOf(f, 2)} t={f} shadow={0} />
      <ellipse cx={540} cy={1050} rx={160} ry={56} fill="none" stroke="#111" strokeWidth={26} />
      <path d="M 300 760 L 420 700 L 300 1000 Z" fill="#ffffff" opacity={0.08} />
      <path d="M 310 700 Q 540 630 770 700 L 760 712 L 320 712 Z" fill={CARRED} stroke={INK} strokeWidth={7} />
      <path d="M 325 700 L 235 1062" stroke={CARRED} strokeWidth={30} strokeLinecap="round" />
      <path d="M 755 700 L 845 1062" stroke={CARRED} strokeWidth={30} strokeLinecap="round" />
      <ellipse cx={180} cy={990} rx={46} ry={32} fill={CARRED} stroke={INK} strokeWidth={6} />
      <ellipse cx={900} cy={990} rx={46} ry={32} fill={CARRED} stroke={INK} strokeWidth={6} />
      <path d="M 200 1060 L 880 1060 Q 920 1070 920 1120 L 920 1330 Q 920 1350 900 1350 L 180 1350 Q 160 1350 160 1330 L 160 1120 Q 160 1070 200 1060 Z" fill={CARRED} stroke={INK} strokeWidth={8} />
      <path d="M 220 1090 Q 540 1070 860 1090" stroke="#b8322a" strokeWidth={8} fill="none" />
      {[270, 810].map((hx) => <g key={hx}><ellipse cx={hx} cy={1170} rx={110} ry={70} fill="#fff6c2" opacity={0.25} /><ellipse cx={hx} cy={1170} rx={68} ry={40} fill="#fff6c2" stroke={INK} strokeWidth={6} /></g>)}
      <rect x={420} y={1195} width={240} height={70} rx={14} fill="#1b1d26" stroke={INK} strokeWidth={6} />
      {[0, 1, 2].map((i) => <path key={i} d={`M 436 ${1212 + i * 18} L 644 ${1212 + i * 18}`} stroke="#3a3f4c" strokeWidth={6} />)}
      <rect x={170} y={1300} width={740} height={50} rx={14} fill="#c9ccd2" stroke={INK} strokeWidth={6} />
      <rect x={200} y={1350} width={90} height={70} rx={12} fill={INK} /><rect x={790} y={1350} width={90} height={70} rx={12} fill={INK} />
      {notes(f, 880, 820, 50, -230, 4, GOLD, 0.85, 0.1)}
    </Svg></Layer>
  </>;
};

// ---------------------------------------------------------------- kitchen with a foreground island counter
const Kitchen: React.FC<{ f: number; people: { look: Look; x: number; pose: Pose; expr: Expr; seed: number; closed?: boolean }[]; extra?: React.ReactNode; radio?: boolean }> = ({ f, people, extra, radio }) => (
  <>
    <Layer p={0.6}><Svg><KitchenWall y={-60} h={1600} /></Svg></Layer>
    <Layer p={1}><Svg>
      {people.map((p, i) => <Person key={i} x={p.x} y={1450} scale={1.7} look={p.look} pose={p.pose} expr={p.expr} blink={p.closed || blinkOf(f, p.seed)} t={f} shadow={0} />)}
      <rect x={-300} y={1150} width={1680} height={60} fill={KITCHEN.counter} stroke={INK} strokeWidth={8} />
      <rect x={-300} y={1210} width={1680} height={900} fill={KITCHEN.cab2} stroke={INK} strokeWidth={8} />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-280 + i * 220} y={1240} width={200} height={600} rx={10} fill={KITCHEN.cab} stroke={INK} strokeWidth={6} />)}
      {radio && <Radio x={830} y={1080} s={0.38} f={f} text="ST 2" eqColor={BLUE} />}
      {extra}
    </Svg></Layer>
  </>
);
const Mug: React.FC<{ x: number; y: number; s?: number; steam?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1].map((i) => <path key={i} d={`M ${-14 + i * 26} -70 q 12 -20 0 -40 q -12 -20 0 -40`} stroke="#ffffff" strokeWidth={6} fill="none" opacity={0.4 + 0.2 * Math.sin(f * 0.1 + i)} />)}
    <rect x={-40} y={-60} width={80} height={70} rx={12} fill="#3fb8c9" stroke={INK} strokeWidth={6} />
    <path d="M 40 -44 q 30 0 30 20 q 0 20 -30 20" stroke={INK} strokeWidth={8} fill="none" />
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
const Bubble: React.FC<{ f: number; x: number; y: number; text: string; at: number; exitAt: number; color?: string }> = ({ f, x, y, text, at, exitAt, color = RED }) => {
  const b = pop(f, at, 9);
  if (b <= 0) return null;
  const o = 1 - leave(f, exitAt);
  if (o <= 0) return null;
  return <g transform={`translate(${x} ${y}) scale(${b})`} opacity={o}>
    <path d="M 40 50 L 110 130 L 90 50 Z" fill="#f6efe0" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-150} y={-66} width={300} height={124} rx={44} fill="#f6efe0" stroke={INK} strokeWidth={8} />
    <path d="M 46 52 L 86 52" stroke="#f6efe0" strokeWidth={12} />
    <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill={color}>{text}</text>
  </g>;
};

// ---------------------------------------------------------------- lab props
const GLYPHS = [
  "M -30 -40 L 30 -40 M 0 -40 L 0 40 M -30 10 L 30 30",
  "M -35 -35 L 35 35 M -35 35 L 0 0 M 10 -40 Q 40 -20 20 0",
  "M -30 -40 Q 30 -40 0 0 Q -30 40 30 40 M -40 0 L 40 0",
  "M -35 -30 L -35 35 L 35 35 M 0 -40 L 0 10 M 20 -30 L 40 -10",
  "M -40 -10 Q 0 -60 40 -10 M -20 0 L -20 40 M 20 0 L 20 40 M -40 40 L 40 40",
  "M 0 -40 L 35 30 L -35 30 Z M 0 -10 L 0 15",
];
const COUNTS = [0, 1, 2, 5, 10, 25];
const Glyph: React.FC<{ x: number; y: number; s: number; i: number; c?: string }> = ({ x, y, s, i, c = CREAM }) => (
  <path d={GLYPHS[i]} transform={`translate(${x} ${y}) scale(${s})`} stroke={c} strokeWidth={10 / s} fill="none" strokeLinecap="round" strokeLinejoin="round" />
);
const Eye: React.FC<{ x: number; y: number; s: number; open: number }> = ({ x, y, s, open }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={90} fill="#1c2650" stroke={MUTED} strokeWidth={5} />
    <path d={`M -62 0 Q 0 ${-50 * open} 62 0 Q 0 ${50 * open} -62 0 Z`} fill="#f6efe0" stroke={INK} strokeWidth={6} />
    {open > 0.3 && <circle r={22 * open} fill="#3a6fd0" stroke={INK} strokeWidth={4} />}
  </g>
);
const Shield: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={90} fill="#1c2650" stroke={MUTED} strokeWidth={5} />
    <path d="M 0 -54 L 46 -36 Q 46 30 0 58 Q -46 30 -46 -36 Z" fill={GREEN} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -18 2 L -4 16 L 20 -12" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);
const Heart: React.FC<{ x: number; y: number; s: number; c?: string; ring?: boolean }> = ({ x, y, s, c = RED, ring = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {ring && <circle r={90} fill="#1c2650" stroke={MUTED} strokeWidth={5} />}
    <path d="M 0 46 C -60 0 -50 -50 -18 -46 C -6 -44 0 -34 0 -26 C 0 -34 6 -44 18 -46 C 50 -50 60 0 0 46 Z" fill={c} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </g>
);
const Gauge: React.FC<{ x: number; y: number; val: number; face: "laugh" | "annoyed" | "flat" }> = ({ x, y, val, face }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -180 0 A 180 180 0 0 1 -90 -156" stroke={RED} strokeWidth={34} fill="none" />
    <path d="M -90 -156 A 180 180 0 0 1 90 -156" stroke={GOLD} strokeWidth={34} fill="none" />
    <path d="M 90 -156 A 180 180 0 0 1 180 0" stroke={GREEN} strokeWidth={34} fill="none" />
    <g transform={`rotate(${val})`}><path d="M -10 0 L 0 -150 L 10 0 Z" fill={CREAM} stroke={INK} strokeWidth={4} /></g>
    <circle r={22} fill={CREAM} stroke={INK} strokeWidth={5} />
    <g transform="translate(0 120)">
      <circle r={56} fill={face === "annoyed" ? "#ff8a6a" : GOLD} stroke={INK} strokeWidth={6} />
      {face === "annoyed"
        ? <><path d="M -30 -22 L -10 -14 M 30 -22 L 10 -14" stroke={INK} strokeWidth={6} strokeLinecap="round" /><circle cx={-18} cy={-4} r={6} fill={INK} /><circle cx={18} cy={-4} r={6} fill={INK} /><path d="M -22 28 Q 0 14 22 28" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" /></>
        : face === "laugh"
          ? <><path d="M -28 -12 Q -18 -24 -8 -12 M 8 -12 Q 18 -24 28 -12" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" /><path d="M -28 8 Q 0 46 28 8 Z" fill={INK} /></>
          : <><circle cx={-18} cy={-8} r={6} fill={INK} /><circle cx={18} cy={-8} r={6} fill={INK} /><path d="M -20 22 L 20 22" stroke={INK} strokeWidth={6} strokeLinecap="round" /></>}
    </g>
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
  let mood = MOODS.night;
  switch (id) {
    case "hook": {   // frame 0: close on Kai behind the wheel from the dashboard, radio "TRACK 1" in front, grey notes; he
      // groans (MONDAY: HATES IT); on "By Friday" a kick, gold notes, he sings along with a head bob (FRIDAY: SINGS IT)
      const BF = C("By Friday", 68), SI = C("singing it", 110);
      const sing = k(u, BF, BF + 10, 0, 1, EASE.arrive);
      cam = kickCam(drift(on({ x: 560, y: 990 - 20 * sing }, k(u, 0, BF, 1.08, 1.12) + 0.08 * k(u, BF, len, 0, 1)), f, 0.8), u - BF, 10);
      const tilt = sing > 0.5 ? 8 * Math.sin(f * 0.35) : -4;
      const body = <Interior f={f} expr={sing > 0.5 ? (u >= SI ? "cheer" : "laugh") : "worried"} tilt={tilt} sing={sing} />;
      const labels = <>
        <CardLabel f={u} x={510} y={380} size={64} color={MUTED} enter="present" enterAt={-20} exitAt={len - 7}>MONDAY: HATES IT</CardLabel>
        <CardLabel f={u} x={510} y={500} size={70} color={GOLD} enter="scale" enterAt={BF} exitAt={len - 7}>FRIDAY: SINGS IT</CardLabel>
      </>;
      return { cam, mood, body, labels, bg: "#121633", glow: { p: { x: 760, y: 1260 }, c: LCD, o: 0.18 } };
    }
    case "drive": {  // side view: Kai's red car cruises an evening road past palms and a skyline; on "radio on" gold radio waves
      mood = MOODS.evening;
      const RO = C("radio on", 70);
      cam = drift(on({ x: 540, y: k(u, 0, len, 1000, 980) }, k(u, 0, len, 1.0, 1.06)), f, 1);
      const body = <RoadSide f={f} waves={arrive(u, RO - 4, 10)} />;
      const labels = <>
        <CardLabel f={u} x={510} y={380} size={62} color={CREAM} enter="rise" enterAt={2} exitAt={len - 7}>GTA 6 LAUNCH WEEK</CardLabel>
        <CardLabel f={u} x={510} y={500} size={62} color={GOLD} enter="words" enterAt={RO} exitAt={len - 7}>RADIO: ALWAYS ON</CardLabel>
      </>;
      return { cam, mood, body, labels, bg: "#5a3a7a" };
    }
    case "count": {  // lab: KOTAKU COUNTED; on "a hundred and fifty" a 15x10 grid of song tiles fills while the counter runs to
      // 150 and stamps; on "pop and classic rock" two station dials pop under the grid
      mood = MOODS.lab;
      const HF = C("a hundred and", 8), PC = C("pop and classic", 90);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.04), rot: 0 }, f, 1);
      const n = countValue(u, HF, 34, 1, 150);
      const st = pop(u, PC, 10);
      const body = <Lab>
        <g opacity={arrive(u, 0, 10)}>{Array.from({ length: 150 }, (_, i) => { const x = 192 + (i % 15) * 46, y = 640 + Math.floor(i / 15) * 46, on2 = u >= HF && i < n;
          return <g key={i}><rect x={x} y={y} width={38} height={38} rx={8} fill={on2 ? (Math.floor(i / 15) < 5 ? GOLD : "#ff8a6a") : "#1c2650"} stroke={on2 ? INK : MUTED} strokeWidth={3} />
            {on2 && <path d={`M ${x + 22} ${y + 26} L ${x + 22} ${y + 8} L ${x + 30} ${y + 12}`} stroke={INK} strokeWidth={4} fill="none" />}</g>; })}</g>
        {st > 0 && [300, 780].map((x, i) => <g key={i} transform={`translate(${x} 1200) scale(${st})`}>
          <circle r={56} fill="#1c2650" stroke={i ? "#ff8a6a" : GOLD} strokeWidth={8} />
          <g transform={`rotate(${-40 + 80 * k(u, PC, PC + 20, 0, 1) + i * 30})`}><path d="M 0 0 L 0 -40" stroke={CREAM} strokeWidth={8} strokeLinecap="round" /></g>
        </g>)}
      </Lab>;
      const labels = <>
        <CardLabel f={u} x={510} y={360} size={50} color={CREAM} enter="rise" enterAt={2} exitAt={len - 7}>KOTAKU COUNTED</CardLabel>
        <CountCard f={u} x={510} y={500} text={`${u < HF ? 1 : n} SONGS`} startAt={HF} dur={34} exitAt={len - 7} size={74} w={520} />
        <Label f={u} x={300} y={1310} size={44} color={GOLD} enter="words" enterAt={PC + 4} exitAt={len - 7}>POP</Label>
        <Label f={u} x={780} y={1310} size={44} color={"#ff8a6a"} enter="words" enterAt={PC + 10} exitAt={len - 7}>CLASSIC ROCK</Label>
      </>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "again": {  // front view through the windshield at night: PLAYED 1, 2, 3 as the track keeps coming back; on "groans"
      // a kick and AGAIN?; on "doesn't switch it off" his face softens and STAYS ON
      const KC = C("keeps coming back", 10), GR = C("Kai groans", 50), AG = C("Again?", 80), DS = C("doesn't switch", 110);
      cam = kickCam(drift(on({ x: 540, y: k(u, 0, len, 960, 900) }, k(u, 0, len, 1.0, 1.12)), f, 0.8), u - GR, 10);
      const plays = [KC, KC + 12, KC + 24];
      const n = plays.filter((p) => u >= p).length;
      const expr: Expr = u >= DS + 8 ? "calm" : u >= GR ? "worried" : "neutral";
      const body = <FrontCar f={f} expr={expr} tilt={u >= GR && u < DS ? -7 : 0} />;
      const labels = <>
        {n > 0 && <CountCard f={u} x={510} y={380} text={`PLAYED: ${n}`} startAt={plays[0]} dur={plays[2] - plays[0]} exitAt={len - 7} size={62} w={480} />}
        <Bubble f={u} x={290} y={560} text="AGAIN?" at={AG - 2} exitAt={DS - 6} />
        <CardLabel f={u} x={510} y={540} size={62} color={GREEN} enter="scale" enterAt={DS + 6} exitAt={len - 7}>STAYS ON</CardLabel>
      </>;
      return { cam, mood, body, labels, bg: "#10163a", glow: { p: { x: 540, y: 860 }, c: LCD, o: 0.1 } };
    }
    case "day5": {   // kitchen behind the island: Kai hums with eyes closed (notes float up), Nia steps in on the right and stops
      mood = MOODS.kitchen;
      const NC = C("Nia catches", 14), HU = C("humming it", 50);
      cam = drift(on({ x: 540, y: 960 }, k(u, 0, len, 1.0, 1.06)), f, 1);
      const step = k(u, NC - 4, NC + 18, 0, 1, EASE.arrive);
      const sway = 6 * Math.sin(f * 0.25);
      const body = <Kitchen f={f} people={[
        { look: KAI, x: 330, pose: { armL: [14, -10], armR: [14, -10], legL: [6, 0], legR: [6, 0], headTilt: sway }, expr: "smile", seed: 2, closed: true },
        { look: NIA, x: 960 - 170 * step, pose: { armL: [12, -6], armR: [12, -6], legL: [6, 0], legR: [6, 0], lookX: -0.6, lean: -4 * step }, expr: u >= HU ? "shock" : "neutral", seed: 4 },
      ]} extra={<>{notes(f, 420, 820, 120, -200, 4, GOLD, 0.8)}<Mug x={460} y={1150} f={f} /></>} />;
      const labels = <>
        <CardLabel f={u} x={510} y={380} size={64} color={GOLD} enter="rise" enterAt={2} exitAt={len - 7}>DAY 5</CardLabel>
        <CardLabel f={u} x={510} y={500} size={60} color={CREAM} enter="words" enterAt={HU} exitAt={len - 7}>HUMMING IT</CardLabel>
      </>;
      return { cam, mood, body, labels, bg: KITCHEN.wall };
    }
    case "what": {   // close on Nia: shock -> puzzled, Kai's notes drift in from the left; HE HATED IT, then WHAT CHANGED? and "?"
      mood = MOODS.kitchen;
      const HH = C("He hated", 12), WC = C("What changed", 60);
      cam = drift(on({ x: 790, y: k(u, 0, len, 930, 910) }, k(u, 0, len, 1.75, 1.85)), f, 0.8);
      const body = <Kitchen f={f} people={[
        { look: KAI, x: 330, pose: { armL: [14, -10], armR: [14, -10], legL: [6, 0], legR: [6, 0], headTilt: 6 * Math.sin(f * 0.25) }, expr: "smile", seed: 2, closed: true },
        { look: NIA, x: 790, pose: { armL: [12, -6], armR: u >= WC ? [60, -120] : [12, -6], legL: [6, 0], legR: [6, 0], lookX: -0.5, headTilt: u >= WC ? 8 : 0 }, expr: u >= WC ? "worried" : "shock", seed: 4 },
      ]} extra={notes(f, 480, 860, 160, -150, 4, GOLD, 0.8)} />;
      const q = pop(u, WC + 4, 10);
      const labels = <>
        <CardLabel f={u} x={510} y={400} size={64} color={CREAM} enter="rise" enterAt={HH} exitAt={WC - 6}>HE HATED IT</CardLabel>
        <CardLabel f={u} x={510} y={400} size={70} color={GOLD} enter="scale" enterAt={WC} exitAt={len - 7}>WHAT CHANGED?</CardLabel>
        {q > 0 && <text x={830} y={700} fontFamily={FONT} fontWeight={900} fontSize={110} fill={GOLD} stroke={INK} strokeWidth={4} transform={`rotate(12 830 700)`} opacity={q * (1 - leave(u, len - 7))}>?</text>}
      </>;
      return { cam, mood, body, labels, bg: KITCHEN.wall };
    }
    case "notsong": { // lab: the song card on the left (SAME SONG, a gold "="); on "how often" a play button with tally marks
      // filling fast on the right (HOW OFTEN)
      mood = MOODS.lab;
      const HO = C("how often", 40);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 1);
      const card = arrive(u, 0, 10), pb = pop(u, HO, 10);
      const tallies = Math.max(0, Math.min(20, Math.floor((u - HO - 4) / 2)));
      const body = <Lab>
        <g opacity={card} transform={`translate(300 ${820 + (1 - card) * 40})`}>
          <rect x={-170} y={-150} width={340} height={300} rx={26} fill="#f6efe0" stroke={INK} strokeWidth={8} />
          <Note x={10} y={20} s={2.4} c={GOLD} />
        </g>
        {pb > 0 && <g transform={`translate(780 720) scale(${pb})`}>
          <circle r={90} fill="#1c2650" stroke={GOLD} strokeWidth={8} />
          <path d="M -26 -40 L 44 0 L -26 40 Z" fill={GOLD} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </g>}
        {Array.from({ length: tallies }, (_, i) => { const g = Math.floor(i / 5), j = i % 5, gx = 640 + (g % 2) * 160, gy = 880 + Math.floor(g / 2) * 130;
          return j < 4 ? <path key={i} d={`M ${gx + j * 26} ${gy} L ${gx + j * 26} ${gy + 90}`} stroke={CREAM} strokeWidth={10} strokeLinecap="round" />
            : <path key={i} d={`M ${gx - 14} ${gy + 76} L ${gx + 92} ${gy + 14}`} stroke={GOLD} strokeWidth={10} strokeLinecap="round" />; })}
      </Lab>;
      const labels = <>
        <CardLabel f={u} x={510} y={400} size={66} color={CREAM} enter="rise" enterAt={2} exitAt={len - 7}>NOT THE SONG</CardLabel>
        <Label f={u} x={300} y={1040} size={46} color={GOLD} enter="words" enterAt={8} exitAt={len - 7}>SAME SONG</Label>
        <CardLabel f={u} x={510} y={1280} size={66} color={GOLD} enter="scale" enterAt={HO + 6} exitAt={len - 7}>HOW OFTEN</CardLabel>
      </>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "zajonc": { // lab: a 1968 index card (ROBERT ZAJONC, 1968) with a magnifier sweep; on "strange words" it leaves and six
      // strange-symbol tiles pop in; from "some once" their exposure counts x0..x25 stamp in turn, brighter the more shown
      mood = MOODS.lab;
      const SW = C("strange words", 80), SO = C("some once", 140), TF = C("twenty five", 190);
      cam = drift({ x: 0, y: k(u, 0, len, -10, 10), zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 1);
      const cd = arrive(u, 0, 12) * (1 - leave(u, SW - 8, 8));
      const badgeAt = (i: number) => (i === 0 ? SO - 6 : SO + ((TF - SO) * (i - 1)) / 4);
      const body = <Lab>
        {cd > 0 && <g opacity={cd} transform={`translate(540 ${800 + (1 - cd) * 50}) rotate(${-3 + 2 * Math.sin(f * 0.05)})`}>
          <rect x={-330} y={-200} width={660} height={400} rx={18} fill="#f6efe0" stroke={INK} strokeWidth={9} />
          <rect x={-330} y={-200} width={660} height={60} rx={18} fill="#d8d0c4" stroke={INK} strokeWidth={9} />
          {[0, 1, 2].map((i) => <path key={i} d={`M -280 ${110 + i * 26} L ${i === 2 ? 60 : 280} ${110 + i * 26}`} stroke="#c9ccd2" strokeWidth={8} strokeLinecap="round" />)}
          <g transform={`translate(${-120 + 240 * Math.sin(u * 0.04)} 40)`}><circle r={46} fill="#7fc8ff" opacity={0.25} stroke={INK} strokeWidth={8} /><path d="M 32 32 L 72 72" stroke={INK} strokeWidth={14} strokeLinecap="round" /></g>
        </g>}
        {GLYPHS.map((_, i) => { const p = pop(u, SW + i * 4, 10); if (p <= 0) return null;
          const x = 250 + (i % 3) * 290, y = 720 + Math.floor(i / 3) * 330, lit = u >= badgeAt(i) ? 0.25 + 0.75 * (COUNTS[i] / 25) : 0;
          const flash = u >= badgeAt(i) && u < badgeAt(i) + 8 ? 1 : 0;
          return <g key={i} transform={`translate(${x} ${y}) scale(${p})`}>
            <rect x={-110} y={-110} width={220} height={220} rx={24} fill="#1c2650" stroke={flash ? CREAM : lit > 0 ? GOLD : MUTED} strokeWidth={6 + 6 * lit} />
            <Glyph x={0} y={0} s={1.5} i={i} c={lit > 0 ? CREAM : MUTED} />
          </g>; })}
      </Lab>;
      const labels = <>
        {cd > 0 && <Label f={u} x={540} y={720} size={54} color={INK} enter="present" enterAt={2} exitAt={SW - 8}>ROBERT ZAJONC</Label>}
        {cd > 0 && <Label f={u} x={540} y={800} size={60} color={RED} enter="rise" enterAt={6} exitAt={SW - 8}>1968</Label>}
        <CardLabel f={u} x={510} y={380} size={62} color={GOLD} enter="rise" enterAt={SW - 4} exitAt={len - 7}>ZAJONC 1968</CardLabel>
        <Label f={u} x={510} y={490} size={44} color={CREAM} enter="words" enterAt={SW + 2} exitAt={len - 7}>STRANGE WORDS + SYMBOLS</Label>
        {COUNTS.map((c, i) => <Label key={i} f={u} x={250 + (i % 3) * 290} y={720 + Math.floor(i / 3) * 330 + 168} size={46} color={i === 5 ? GOLD : CREAM} enter="scale" enterAt={badgeAt(i)} exitAt={len - 7}>{`x${c}`}</Label>)}
      </>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "liking": { // lab: six bars (one per exposure count) rise left to right, a heart rides each bar; LIKING, then on "the
      // more they tended" MORE SEEN = MORE LIKED
      mood = MOODS.lab;
      const MT = C("the more they", 50);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.04, 1.0), rot: 0 }, f, 1);
      const H = [70, 130, 190, 260, 330, 400];
      const body = <Lab>
        <path d="M 150 1160 L 930 1160" stroke={CREAM} strokeWidth={8} strokeLinecap="round" />
        {H.map((h, i) => { const g = k(u, 6 + i * 9, 22 + i * 9, 0, 1, EASE.arrive), x = 220 + i * 128, top = 1160 - h * g;
          return <g key={i}>
            <rect x={x - 45} y={top} width={90} height={h * g} rx={10} fill={i === 5 ? GOLD : "#ff8a6a"} stroke={INK} strokeWidth={5} />
            {g > 0.05 && <Heart x={x} y={top - 50} s={0.55} ring={false} />}
            <Glyph x={x} y={1290} s={0.5} i={i} c={MUTED} />
          </g>; })}
      </Lab>;
      const labels = <>
        <CardLabel f={u} x={510} y={400} size={66} color={RED} enter="rise" enterAt={2} exitAt={MT - 6}>LIKING</CardLabel>
        <CardLabel f={u} x={510} y={400} size={58} color={GOLD} enter="words" enterAt={MT} exitAt={len - 7}>MORE SEEN = MORE LIKED</CardLabel>
        {COUNTS.map((c, i) => <Label key={i} f={u} x={220 + i * 128} y={1225} size={40} color={CREAM} enter="rise" enterAt={4 + i * 4} exitAt={len - 7}>{`x${c}`}</Label>)}
      </>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "effect": { // lab: a big blinking eye with MERE EXPOSURE / EFFECT stamped; on "Familiar" the eye moves left and a row
      // builds: eye = shield = heart (FAMILIAR = SAFE = GOOD), each on its word
      mood = MOODS.lab;
      const FA = C("Familiar feels", 60), SA = C("safe, and", 85), GO = C("feels good", 110);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 1);
      const mv = k(u, FA - 4, FA + 12, 0, 1);
      const blink = ((u + 20) % 50) < 4 ? 0.1 : 1;
      const body = <Lab>
        <Eye x={540 - 320 * mv} y={820 + 180 * mv} s={(1.6 - 0.6 * mv) * arrive(u, 0, 10)} open={blink} />
        {pop(u, SA, 10) > 0 && <Shield x={540} y={1000} s={pop(u, SA, 10)} />}
        {pop(u, GO, 10) > 0 && <Heart x={860} y={1000} s={pop(u, GO, 10)} />}
      </Lab>;
      const labels = <>
        <CardLabel f={u} x={510} y={380} size={66} color={CREAM} enter="rise" enterAt={2} exitAt={len - 7}>MERE EXPOSURE</CardLabel>
        <Stamp f={u} x={510} y={510} text="EFFECT" at={10} exitAt={len - 7} color={GOLD} size={66} rot={-4} />
        <Label f={u} x={220} y={1170} size={44} color={CREAM} enter="rise" enterAt={FA + 8} exitAt={len - 7}>FAMILIAR</Label>
        <Label f={u} x={380} y={1020} size={64} color={GOLD} enter="scale" enterAt={SA - 4} exitAt={len - 7}>=</Label>
        <Label f={u} x={540} y={1170} size={44} color={GREEN} enter="rise" enterAt={SA + 2} exitAt={len - 7}>SAFE</Label>
        <Label f={u} x={700} y={1020} size={64} color={GOLD} enter="scale" enterAt={GO - 4} exitAt={len - 7}>=</Label>
        <Label f={u} x={860} y={1170} size={44} color={RED} enter="rise" enterAt={GO + 2} exitAt={len - 7}>GOOD</Label>
      </>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "curve": {  // lab: a radio with notes (MUSIC TOO); on "Up to a point" axes and the curve draw up to the peak with a
      // shining note riding it (UP TO A POINT); on "too many times" it falls on the right, red, the shine fades
      mood = MOODS.lab;
      const UP = C("Up to a", 40), LS = C("later studies", 80), TM = C("too many times", 130), LO = C("lose their shine", 180);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.04), rot: 0 }, f, 1);
      const rOut = leave(u, UP - 8, 8);
      const ax = arrive(u, UP - 2, 10);
      const p = k(u, UP, UP + 26, 0, 0.5, EASE.arrive) + k(u, TM - 4, LO + 10, 0, 0.5, EASE.camera);
      const X = (t: number) => 190 + 700 * t, Y = (t: number) => 1150 - 480 * 4 * t * (1 - t);
      const seg = (a: number, b: number) => Array.from({ length: 25 }, (_, i) => { const t = a + ((b - a) * i) / 24; return `${i ? "L" : "M"} ${X(t)} ${Y(t)}`; }).join(" ");
      const shine = p <= 0.5 ? 1 : 1 - (p - 0.5) * 2;
      const body = <Lab>
        {rOut < 1 && <g opacity={(1 - rOut) * arrive(u, 0, 10)}>
          <Radio x={540} y={900} s={1.4} f={f} text="MUSIC" eqColor={GOLD} />
          {notes(f, 520, 720, 60, -100, 4, GOLD, 1)}
        </g>}
        {ax > 0 && <g opacity={ax}>
          <path d="M 190 620 L 190 1150 L 920 1150" stroke={CREAM} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {p > 0 && <path d={seg(0, Math.min(p, 0.5))} stroke={GOLD} strokeWidth={14} fill="none" strokeLinecap="round" />}
          {p > 0.5 && <path d={seg(0.5, p)} stroke={RED} strokeWidth={14} fill="none" strokeLinecap="round" />}
          {p > 0 && <g>
            {shine > 0.05 && [0, 60, 120, 180, 240, 300].map((a) => <path key={a} d="M 0 -60 L 0 -84" stroke={GOLD} strokeWidth={6} strokeLinecap="round" opacity={shine} transform={`translate(${X(p)} ${Y(p) - 30}) rotate(${a + f * 2} 0 0)`} />)}
            <Note x={X(p)} y={Y(p) - 30} s={1.1} c={shine > 0.5 ? GOLD : MUTED} />
          </g>}
        </g>}
      </Lab>;
      const labels = <>
        <CardLabel f={u} x={510} y={400} size={66} color={CREAM} enter="rise" enterAt={2} exitAt={UP - 8}>MUSIC TOO</CardLabel>
        <CardLabel f={u} x={510} y={400} size={66} color={GOLD} enter="scale" enterAt={UP + 2} exitAt={len - 7}>UP TO A POINT</CardLabel>
        <Label f={u} x={510} y={510} size={40} color={MUTED} enter="words" enterAt={LS} exitAt={len - 7}>LATER STUDIES</Label>
        <Label f={u} x={250} y={590} size={36} color={CREAM} enter="rise" enterAt={UP + 4} exitAt={len - 7}>LIKING</Label>
        <Label f={u} x={830} y={1205} size={36} color={CREAM} enter="rise" enterAt={UP + 6} exitAt={len - 7}>PLAYS</Label>
        <CardLabel f={u} x={510} y={1290} size={56} color={RED} enter="words" enterAt={TM} exitAt={len - 7}>TOO MANY PLAYS</CardLabel>
      </>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "joke": {   // lab: a LAUGH-O-METER pair; on "second time" the left needle swings to green, laughing face; on "tenth" the
      // right needle drops to red with a shake, annoyed face
      mood = MOODS.lab;
      const ST = C("second time", 40), TE = C("the tenth", 85);
      cam = kickCam(drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 1), u - TE, 8);
      const g = arrive(u, 0, 10);
      const l = -80 + 150 * k(u, ST, ST + 12, 0, 1, Easing.out(Easing.back(1.6)));
      const r = -10 - 65 * k(u, TE, TE + 10, 0, 1, EASE.arrive) + (u > TE && u < TE + 14 ? 4 * Math.sin(u * 2) : 0);
      const body = <Lab>
        <g opacity={g}>
          <Gauge x={300} y={900} val={l} face={u >= ST ? "laugh" : "flat"} />
          <Gauge x={780} y={900} val={r} face={u >= TE ? "annoyed" : "flat"} />
        </g>
      </Lab>;
      const labels = <>
        <CardLabel f={u} x={510} y={380} size={62} color={GOLD} enter="rise" enterAt={2} exitAt={len - 7}>LAUGH-O-METER</CardLabel>
        <Label f={u} x={300} y={640} size={54} color={CREAM} enter="rise" enterAt={ST - 4} exitAt={len - 7}>2ND</Label>
        <Label f={u} x={300} y={1150} size={50} color={GREEN} enter="words" enterAt={ST + 4} exitAt={len - 7}>FUNNY</Label>
        <Label f={u} x={780} y={640} size={54} color={CREAM} enter="rise" enterAt={TE - 6} exitAt={len - 7}>10TH</Label>
        <Label f={u} x={780} y={1150} size={50} color={RED} enter="words" enterAt={TE + 4} exitAt={len - 7}>ANNOYING</Label>
      </>;
      return { cam, mood, body, labels, bg: LAB.bg };
    }
    case "week3": {  // radio close-up: TRACK 1 plays (WEEK 3, PLAYED: TOO MANY); on "changes the station" Kai's hand turns the
      // dial: static, then ST 2 in blue (NEW STATION)
      const SC = C("song comes on", 25), CS = C("changes the station", 75);
      const turn = k(u, CS - 4, CS + 10, 0, 1, EASE.arrive);
      const reach = k(u, SC + 10, CS - 4, 0, 1, EASE.arrive);
      const statik = u >= CS + 4 && u < CS + 14;
      const after = u >= CS + 14;
      cam = kickCam(drift(on({ x: 540, y: 900 }, k(u, 0, len, 1.0, 1.08)), f, 0.8), u - CS - 4, 8);
      const KX = 520 + 112 * 2.3, KY = 860 - 24 * 2.3;
      const hx = 1180 - (1180 - KX - 70) * reach, hy = 1500 - (1500 - KY) * reach;
      const body = <>
        <Layer p={0.4}><Svg>
          <rect x={-400} y={-400} width={1880} height={900} fill="#121633" />
          {Array.from({ length: 3 }, (_, i) => { const x = 1100 - ((f * 7 + i * 450) % 1350); return <circle key={i} cx={x} cy={300} r={30} fill="#ffd98a" opacity={0.7} />; })}
        </Svg></Layer>
        <Layer p={1}><Svg>
          <path d="M -300 520 Q 540 440 1380 520 L 1380 2200 L -300 2200 Z" fill="#2a2e38" stroke={INK} strokeWidth={9} />
          {[150, 930].map((vx) => <g key={vx}><rect x={vx - 70} y={600} width={140} height={90} rx={16} fill="#1b1d26" stroke={INK} strokeWidth={6} />
            {[0, 1, 2].map((i) => <path key={i} d={`M ${vx - 56} ${622 + i * 24} L ${vx + 56} ${622 + i * 24}`} stroke="#3a3f4c" strokeWidth={6} />)}</g>)}
          <Radio x={520} y={860} s={2.3} f={f} text={after ? "ST 2" : "TRACK 1"} knob={90 * turn} statik={statik} eqColor={after ? BLUE : LCD} />
          {reach > 0 && <g>
            <path d={`M 1300 1700 L ${hx + 60} ${hy + 40}`} stroke={INK} strokeWidth={150} strokeLinecap="round" />
            <path d={`M 1300 1700 L ${hx + 60} ${hy + 40}`} stroke={KAI.jersey} strokeWidth={134} strokeLinecap="round" />
            <g transform={`translate(${hx} ${hy}) rotate(${-20 + 40 * turn})`}>
              <ellipse cx={30} cy={10} rx={70} ry={60} fill={KAI.skin} stroke={INK} strokeWidth={8} />
              <rect x={-60} y={-30} width={80} height={30} rx={15} fill={KAI.skin} stroke={INK} strokeWidth={7} />
              <rect x={-50} y={20} width={70} height={28} rx={14} fill={KAI.skin} stroke={INK} strokeWidth={7} />
            </g>
          </g>}
        </Svg></Layer>
      </>;
      const labels = <>
        <CardLabel f={u} x={510} y={380} size={64} color={GOLD} enter="rise" enterAt={2} exitAt={CS - 8}>WEEK 3</CardLabel>
        <CardLabel f={u} x={510} y={500} size={58} color={RED} enter="words" enterAt={SC} exitAt={CS - 8}>PLAYED: TOO MANY</CardLabel>
        <CardLabel f={u} x={510} y={440} size={66} color={BLUE} enter="scale" enterAt={CS + 14} exitAt={len - 7}>NEW STATION</CardLabel>
      </>;
      return { cam, mood, body, labels, bg: "#121633", glow: { p: { x: 400, y: 800 }, c: after ? BLUE : LCD, o: 0.16 } };
    }
    default: {       // ask: kitchen, Kai alone behind the island with his mug, the small radio now plays blue notes; he smirks to
      // camera as the camera pulls back; HATE -> LOVE?
      mood = MOODS.kitchen;
      const HL = C("hate, then", 30);
      const pull = k(u, 0, len, 0, 1);
      cam = drift(on({ x: 540, y: 880 + 80 * pull }, 1.5 - 0.35 * pull), f, 1);
      const body = <Kitchen f={f} radio people={[
        { look: KAI, x: 540, pose: { armL: [14, -10], armR: [14, -10], legL: [6, 0], legR: [6, 0], headTilt: 6 * arrive(u, HL, 10), lookX: 0 }, expr: u >= HL ? "smirk" : "smile", seed: 2 },
      ]} extra={<>{notes(f, 800, 1020, 40, -200, 3, BLUE, 0.7)}<Mug x={420} y={1150} f={f} /></>} />;
      const labels = <CardLabel f={u} x={510} y={400} size={66} color={GOLD} enter="scale" enterAt={HL} exitAt={len + 30}>HATE → LOVE?</CardLabel>;
      return { cam, mood, body, labels, bg: KITCHEN.wall };
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
  const fade = prev && u < XF && (PLACE[prev.id] ?? "lab") !== (PLACE[span.id] ?? "lab");
  return (
    <Words.Provider value={words}><AbsoluteFill>
      <NoText.Provider value={!!fade}><ShotView span={span} /></NoText.Provider>
      {fade && prev && <NoText.Provider value><AbsoluteFill style={{ opacity: 1 - (u + 1) / (XF + 1) }}><ShotView span={prev} freezeAt={prev.b - 1} /></AbsoluteFill></NoText.Provider>}
    </AbsoluteFill></Words.Provider>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "gta-radio",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: "#121633",
};
export default story;
