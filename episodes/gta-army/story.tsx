// "43 Soldiers Re-Enlisted. The Headline Was GTA 6" - 2.5D. A generic army career-counselor office (NO insignia, flags,
// logos; "GTA 6" only ever appears as plain words): soldiers who re-enlisted by Nov 14 got a special 4 day pass timed to
// the game's launch. Facts (see RESEARCH.md): Fort Stewart, Georgia; a career counselor's idea; 43 of 130 eligible
// soldiers took it; the usual re-enlistment bonuses still applied (one soldier got over $60,000). Science: temptation
// bundling (Milkman, Minson & Volpp 2014): gym-only access to gripping audiobooks -> 51 % more gym visits at first,
// fading over time. Kai pairs his favourite podcast with runs: week 1 every day, week 4 he needs a new podcast.
// Office layout (front view, CounselorOffice): floor line 1250, desk at y 1330 (feet), people's feet at y 1330 so they
// stay above the caption band in wide shots. The static wall calendar (575, 560) is erased (WallFix) in every office
// shot except "offer", where it is the subject, so no label ever sits on its numbers.
// Motion rules (src/engine25/motion.tsx): arrivals EASE.arrive, exits shorter EASE.exit, camera EASE.camera; every
// label enters and exits (Label), numbers count, stop and stamp; nothing holds still for more than ~3 s.
// On-screen text is drawn in screen space (overlay) inside SAFE_TEXT (y 300-1350, x 60-960) and hidden in crossfades,
// in-scene text (pass card, contract, calendar, chart, cards) too.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, ShotSpan, cueTime, FPS } from "../../src/engine/timeline";
import type { Word } from "../../src/captions/Captions";
import { Stage, Layer, Svg, Cam, drift, kickCam } from "../../src/engine25/stage";
import { Grade, Mood, Pool, Flash } from "../../src/engine25/light";
import { EASE, arrive, leave, Label, stampScale } from "../../src/engine25/motion";
import { Person, Look, INK, Expr, Pose, runPose } from "../../library/characters25/person";
import { CAST, EXTRAS } from "../../library/style/channel";
import { Lab, LAB } from "../../library/environments25/lab";
import { handPos } from "../../library/environments25/gamenight";
import { reachLimb } from "../../library/environments25/square";
import { LivingWall, LivingFloor, Sofa, FloorLamp, Rug, PersonPart } from "../../library/environments25/livingroom";
import { ARMY, CounselorOffice, Desk, DESK_TOP, Contract, contractSignPoint, Pen, PassCard, Calendar, CamoShirt, PatrolCap, Headphones,
  ParkPath, Gym, Treadmill, TREADMILL_DECK, Audiobook } from "../../library/environments25/army";
import scenes from "../../content/scripts/gta-army.json";

const SHOTS = scenes.shots.map((s) => ({ id: s.id, cue: s.cue }));

/** inside a crossfade every on-screen label is dropped, so text never lies over another picture */
const NoText = React.createContext(false);
/** the narration words (real voice or estimate), so a beat inside a shot can sit exactly on a spoken cue */
const Words = React.createContext<Word[]>([]);
/** frame (relative to the shot start) where `phrase` is spoken inside this shot; fallback if not found */
const cueAt = (words: Word[], phrase: string, span: ShotSpan, fallback: number) => {
  try { return Math.round(cueTime(words, phrase, span.a / FPS - 0.3) * FPS) - span.a; } catch { return fallback; }
};

const MOODS: Record<string, Mood> = {
  office: { grade: "#ffd9a0", gradeOp: 0.05, vignette: 0.36, glow: "#fff4d8" },     // daylight office
  close: { grade: "#ffb870", gradeOp: 0.07, vignette: 0.46, glow: "#fff1c9" },
  freeze: { grade: "#1b2a6b", gradeOp: 0.42, vignette: 0.72 },                    // "Wait." / "why" - cold freeze
  gym: { grade: "#cfe6ff", gradeOp: 0.05, vignette: 0.36, glow: "#ffffff" },
  park: { grade: "#ffb060", gradeOp: 0.06, vignette: 0.34, glow: "#fff0c2" },     // sunrise run
  home: { grade: "#ff9a4a", gradeOp: 0.08, vignette: 0.48, glow: "#ffe2a8" },     // evening living room
  lab: { grade: "#0b1430", gradeOp: 0.04, vignette: 0.45 },
};

const k = (u: number, a: number, b: number, from: number, to: number, e = EASE.camera) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
type Pt = { x: number; y: number };
const { gold: GOLD, red: RED, green: GREEN, muted: MUTED, text: CREAM, orange: ORANGE } = LAB;
const FONT = "CaptionSans, sans-serif";
const pop = (u: number, a: number, d = 9) => (u < a ? 0 : k(u, a, a + d, 0, 1, Easing.out(Easing.back(2.2))));
const blinkOf = (f: number, seed: number) => ((f + seed * 37) % 103) < 4;

/** false while a crossfade runs: then in-scene text is blanked too. Set by ShotView right before it builds the shot
 *  (rendering is synchronous), read by the helpers below. */
let SCENE_TEXT = true;

// ---------------------------------------------------------------- cast + set geometry
const SOL: Look = CAST.soldier1, SOL2: Look = CAST.soldier2, COU: Look = CAST.counselor;
const KAI: Look = { ...CAST.kai, shorts: "#2d3a5a", socks: "#2d3a5a", boots: "#f2f2ee" };   // Kai in running shorts
const FLOOR = 1330;
const STAND: Pose = { armL: [12, -6], armR: [12, -6], legL: [6, 0], legR: [6, 0] };
const SEAT: Pose = { armL: [18, -40], armR: [18, -40], legL: [6, 0], legR: [6, 0], crouch: 0.6 };

/** world (subject plane, p = 1) -> screen, for overlays that must stay in the safe text box */
const toS = (c: Cam, p: Pt): Pt => ({ x: (p.x - 540 - c.x) * c.zoom + 540, y: (p.y - 960 - c.y) * c.zoom + 960 });
const on = (p: Pt, zoom: number, rot = 0): Cam => ({ x: p.x - 540, y: p.y - 960, zoom, rot });

// ---------------------------------------------------------------- office pieces
/** covers the static wall calendar with plain wall (+ its two wallpaper seams) and hangs a small landscape print */
const WallFix: React.FC = () => (
  <g>
    <rect x={428} y={360} width={300} height={390} fill={ARMY.wall} />
    {[480, 610].map((x) => <rect key={x} x={x} y={360} width={6} height={390} fill={ARMY.wall2} />)}
    <g transform="translate(575 600)">
      <rect x={-112} y={-82} width={224} height={164} rx={6} fill={ARMY.frame} stroke={INK} strokeWidth={7} />
      <rect x={-94} y={-64} width={188} height={128} fill={ARMY.sky} />
      <path d="M -94 40 L -40 -20 L 0 14 L 40 -34 L 94 30 L 94 64 L -94 64 Z" fill={ARMY.hillMid} />
      <path d="M -94 52 Q 0 30 94 52 L 94 64 L -94 64 Z" fill={ARMY.grass} />
      <circle cx={52} cy={-36} r={14} fill={ARMY.sun} />
    </g>
  </g>
);

type Item = { y: number; el: React.ReactNode };
/** the office: backdrop (+ WallFix unless the calendar is wanted) and items sorted by depth */
const Office: React.FC<{ f: number; calendar?: boolean; items?: Item[]; over?: React.ReactNode }> = ({ f, calendar = false, items = [], over }) => (
  <>
    <Layer p={1}><Svg>
      <CounselorOffice f={f} />
      {!calendar && <WallFix />}
      {[...items].sort((a, b) => a.y - b.y).map((it, i) => <React.Fragment key={i}>{it.el}</React.Fragment>)}
      {over}
    </Svg></Layer>
  </>
);

/** a uniformed Person (camo blobs, optional patrol cap) */
const Soldier: React.FC<{ x: number; y: number; s: number; look: Look; pose: Pose; expr: Expr; f: number; seed: number; t?: number; cap?: boolean;
  facing?: 1 | -1; shadow?: number }> = ({ x, y, s, look, pose, expr, f, seed, t, cap, facing = 1, shadow }) => (
  <g>
    <Person x={x} y={y} scale={s} look={look} pose={pose} expr={expr} blink={blinkOf(f, seed)} t={t} facing={facing} shadow={shadow} />
    <CamoShirt x={x} y={y} scale={s} pose={pose} facing={facing} />
    {cap && <PatrolCap x={x} y={y} scale={s} pose={pose} facing={facing} />}
  </g>
);

/** the counselor seated behind the desk (desk front hides the legs) */
const DeskSet: React.FC<{ f: number; x?: number; s?: number; expr?: Expr; pose?: Partial<Pose> }> = ({ f, x = 420, s = 0.95, expr = "smile", pose = {} }) => {
  const p: Pose = { ...SEAT, ...pose };
  return <g>
    <Soldier x={x} y={FLOOR} s={s} look={COU} pose={p} expr={expr} f={f} seed={5} t={f} shadow={0} />
    <Desk x={x} y={FLOOR} scale={s} />
  </g>;
};

/** a blank gold card (the pass with its words hidden, during crossfades) */
const BlankPass: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-300} y={-160} width={600} height={320} rx={26} fill={ARMY.gold} stroke={INK} strokeWidth={9} />
  </g>
);
const Pass: React.FC<{ x: number; y: number; scale: number; pop?: number }> = (p) =>
  !React.useContext(NoText) ? <PassCard {...p} /> : <BlankPass x={p.x} y={p.y} scale={p.scale * Math.min(1, Math.max(0, p.pop ?? 1))} />;

/** a glowing idea bulb (pops in, rays pulse once) */
const Bulb: React.FC<{ x: number; y: number; s: number; p: number; u: number }> = ({ x, y, s, p, u }) => {
  if (p <= 0) return null;
  const ray = 0.6 + 0.4 * Math.sin(u * 0.25);
  return <g transform={`translate(${x} ${y}) scale(${s * p})`}>
    <circle r={110} fill="#fff3b0" opacity={0.35 * ray} />
    {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return <path key={i} d={`M ${Math.cos(a) * 78} ${Math.sin(a) * 78 - 10} L ${Math.cos(a) * (100 + 14 * ray)} ${Math.sin(a) * (100 + 14 * ray) - 10}`}
      stroke={GOLD} strokeWidth={9} strokeLinecap="round" />; })}
    <path d="M -46 -16 C -46 -76 46 -76 46 -16 C 46 14 24 26 22 50 L -22 50 C -24 26 -46 14 -46 -16 Z" fill="#ffe27a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -16 -10 Q 0 18 16 -10" stroke={ARMY.gold2} strokeWidth={5} fill="none" />
    <rect x={-24} y={50} width={48} height={30} rx={6} fill="#c9ccd2" stroke={INK} strokeWidth={6} />
    <path d="M -24 64 L 24 64" stroke={INK} strokeWidth={4} />
  </g>;
};

/** a soldier holding the contract on a clipboard at the chest and signing it (signed 0..1) */
const Signer: React.FC<{ x: number; s: number; f: number; signed: number; expr: Expr; lookX?: number; t?: number }> = ({ x, s, f, signed, expr, lookX = -0.3, t }) => {
  const showText = !React.useContext(NoText);
  const base: Pose = { ...STAND, lookX };
  const cs = 0.45 * s / 1.1, cx = x, cy = FLOOR - 170 * s / 1.1 * 1.0 - 0;
  const sp = contractSignPoint(signed);
  const tip = { x: cx + sp.x * cs, y: cy + sp.y * cs };
  const grip = { x: tip.x + Math.sin(Math.PI / 6) * 110 * 0.6, y: tip.y - Math.cos(Math.PI / 6) * 110 * 0.6 };
  const wrist = { x: cx + 250 * cs, y: grip.y + 70 * cs };
  const holdL = { x: cx - 220 * cs + 4, y: cy - 10 };
  let pose = reachLimb({ x, y: FLOOR, scale: s, pose: base }, "armR", grip, 1);
  pose = reachLimb({ x, y: FLOOR, scale: s, pose }, "armL", holdL, 1);
  return <g>
    <Soldier x={x} y={FLOOR} s={s} look={SOL} pose={pose} expr={expr} f={f} seed={1} t={t} />
    <rect x={cx - 230 * cs} y={cy - 310 * cs} width={460 * cs} height={620 * cs} rx={10} fill="#a8693e" stroke={INK} strokeWidth={6} />
    <rect x={cx - 60 * cs} y={cy - 326 * cs} width={120 * cs} height={40 * cs} rx={6} fill="#c9ccd2" stroke={INK} strokeWidth={5} />
    {showText ? <Contract x={cx} y={cy} scale={cs} signed={signed} label="RE-ENLIST" /> :
      <rect x={cx - 220 * cs} y={cy - 290 * cs} width={440 * cs} height={580 * cs} fill={ARMY.paper} stroke={INK} strokeWidth={8 * cs} />}
    <path d={`M ${wrist.x + 40} ${wrist.y + 40} L ${wrist.x} ${wrist.y} L ${grip.x} ${grip.y}`} stroke={INK} strokeWidth={22 * s} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={`M ${wrist.x + 40} ${wrist.y + 40} L ${wrist.x} ${wrist.y}`} stroke={SOL.jersey} strokeWidth={13 * s} fill="none" strokeLinecap="round" />
    <path d={`M ${wrist.x} ${wrist.y} L ${grip.x} ${grip.y}`} stroke={SOL.skin} strokeWidth={13 * s} fill="none" strokeLinecap="round" />
    <Pen x={tip.x} y={tip.y} rot={30} scale={0.6} />
    <circle cx={grip.x} cy={grip.y} r={12 * s} fill={SOL.skin} stroke={INK} strokeWidth={4.2 * s} />
    <circle cx={holdL.x} cy={holdL.y} r={11 * s} fill={SOL.skin} stroke={INK} strokeWidth={4.2 * s} />
  </g>;
};

// ---------------------------------------------------------------- overlay helpers (screen space)
/** a Label on a dark card (for set shots, so text never sits straight on the busy set) */
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
/** a counter label (gold card) that counts, stops and is stamped */
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
/** a rotated rubber stamp (scales down onto the page) */
const Stamp: React.FC<{ f: number; x: number; y: number; text: string; at: number; exitAt: number; color?: string; size?: number; rot?: number }> =
  ({ f, x, y, text, at, exitAt, color = RED, size = 70, rot = -8 }) => {
    if (f < at) return null;
    const out = leave(f, exitAt);
    if (out >= 1) return null;
    const p = k(f, at, at + 7, 0, 1, EASE.arrive), s = 1.6 - 0.6 * p;
    const w = text.length * size * 0.68 + 60;
    return <g opacity={Math.min(1, p * 1.6) * (1 - out)} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-w / 2} y={-size * 0.9} width={w} height={size * 1.25} rx={14} fill="none" stroke={color} strokeWidth={10} />
      <text x={0} y={size * 0.12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} letterSpacing={3}>{text}</text>
    </g>;
  };

// ---------------------------------------------------------------- lab props
/** mini soldier for the 43-of-130 grid (simplified Person at small scale) */
const MiniSoldier: React.FC<{ x: number; y: number; lit: number; f: number; i: number }> = ({ x, y, lit, f, i }) => {
  const up = lit;
  const pose: Pose = { ...STAND, armL: [12 + 148 * up, -6 + 14 * up], armR: [12 + 148 * up, -6 + 14 * up] };
  const look: Look = lit > 0.5 ? { ...SOL, jersey: "#8a9a4e" } : { ...SOL, skin: "#7d86a8", hair: "#4a5378", jersey: "#4a5378", jersey2: "#3a4266", shorts: "#3a4266", socks: "#3a4266", boots: "#2a3050" };
  return <g>
    {lit > 0 && <circle cx={x} cy={y - 34} r={36 * lit} fill={GOLD} opacity={0.35} />}
    <Person x={x} y={y - up * 6 * Math.abs(Math.sin((f + i * 7) * 0.2))} scale={0.15} look={look} pose={pose} expr={lit > 0.5 ? "cheer" : "neutral"} shadow={0} />
  </g>;
};

/** a banded stack of cash bundles (count bundles, bottom at y) */
const CashStack: React.FC<{ x: number; y: number; n: number; w?: number }> = ({ x, y, n, w = 230 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const by = y - (i + 1) * 34, dx = ((i * 37) % 13) - 6;
      return <g key={i} transform={`translate(${x + dx} ${by})`}>
        <rect x={-w / 2} y={0} width={w} height={34} rx={6} fill="#5fbf6a" stroke={INK} strokeWidth={5} />
        <rect x={-w / 2 + 10} y={6} width={w - 20} height={22} rx={4} fill="none" stroke="#3f9a4f" strokeWidth={3} />
        <rect x={-18} y={0} width={36} height={34} fill="#f2e6c4" stroke={INK} strokeWidth={4} />
        <circle cx={-w / 2 + 34} cy={17} r={8} fill="#3f9a4f" /><circle cx={w / 2 - 34} cy={17} r={8} fill="#3f9a4f" />
      </g>;
    })}
  </g>
);

/** the see-saw: plank rotates around the fulcrum (deg > 0 = right end down) */
const SeeSaw: React.FC<{ x: number; y: number; ang: number; want: number; wantY: number; glow: number }> = ({ x, y, ang, want, wantY, glow }) => {
  const L = 380, showText = !React.useContext(NoText);
  return <g>
    <path d={`M ${x} ${y} L ${x - 90} ${y + 190} L ${x + 90} ${y + 190} Z`} fill="#3a4266" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <rect x={x - 400} y={y + 186} width={800} height={18} rx={9} fill="#2a3256" />
    <g transform={`rotate(${ang} ${x} ${y})`}>
      <rect x={x - L - 20} y={y - 26} width={2 * L + 40} height={32} rx={14} fill="#c98a5e" stroke={INK} strokeWidth={8} />
      {/* SHOULD: heavy crate on the right end */}
      <g transform={`translate(${x + L - 110} ${y - 26})`}>
        <rect x={-110} y={-200} width={220} height={200} rx={10} fill="#7d86a8" stroke={INK} strokeWidth={8} />
        <path d="M -110 -150 L 110 -150 M -110 -50 L 110 -50" stroke="#5a6488" strokeWidth={8} />
        <rect x={-30} y={-232} width={60} height={34} rx={10} fill="none" stroke={INK} strokeWidth={9} />
        {showText && <text x={0} y={-82} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={CREAM} stroke={INK} strokeWidth={2}>SHOULD</text>}
      </g>
      {/* WANT: glowing orb that lands on the left end */}
      {want > 0 && <g transform={`translate(${x - L + 110} ${y - 26 - 120 - wantY})`} opacity={Math.min(1, want * 2)}>
        <circle r={190} fill={GOLD} opacity={0.18 * glow} />
        <circle r={150} fill={GOLD} opacity={0.22 * glow} />
        <circle r={120} fill="#ffd25a" stroke={INK} strokeWidth={9} />
        <path d="M -70 -50 Q -50 -86 -10 -92" stroke="#fff6c8" strokeWidth={12} fill="none" strokeLinecap="round" />
        {showText && <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={INK}>WANT</text>}
      </g>}
    </g>
  </g>;
};

/** checkmark tick drawn on (p 0..1) */
const Tick: React.FC<{ x: number; y: number; s: number; p: number; color?: string }> = ({ x, y, s, p, color = GREEN }) => p <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -30 0 L -8 24 L 34 -28" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M -30 0 L -8 24 L 34 -28" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} stroke={color} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/** headphones resting round the neck (band under the chin, cups on the collar) - same props as the Person */
const NeckPhones: React.FC<{ x: number; y: number; scale: number; pose: Pose }> = (p) => (
  <PersonPart {...p} part="head">
    <path d="M -54 6 C -50 44 50 44 54 6" stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" />
    <path d="M -54 6 C -50 44 50 44 54 6" stroke={ARMY.machine} strokeWidth={7} fill="none" strokeLinecap="round" />
    {[-1, 1].map((d) => <rect key={d} x={d * 52 - 18} y={-8} width={36} height={50} rx={15} fill={RED} stroke={INK} strokeWidth={6} />)}
  </PersonPart>
);

/** simple icons for the bundling cards */
const DumbbellIcon: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-10} width={140} height={20} rx={8} fill="#c9ccd2" stroke={INK} strokeWidth={6} />
    {[-1, 1].map((d) => <g key={d}><rect x={d * 70 - 18} y={-48} width={36} height={96} rx={10} fill="#3a3f4a" stroke={INK} strokeWidth={7} />
      <rect x={d * 98 - 12} y={-34} width={24} height={68} rx={8} fill="#3a3f4a" stroke={INK} strokeWidth={6} /></g>)}
  </g>
);
const PhonesIcon: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -66 20 C -72 -90 72 -90 66 20" stroke={INK} strokeWidth={24} fill="none" strokeLinecap="round" />
    <path d="M -66 20 C -72 -90 72 -90 66 20" stroke="#3a3f4a" strokeWidth={10} fill="none" strokeLinecap="round" />
    {[-1, 1].map((d) => <rect key={d} x={d * 66 - 24} y={-6} width={48} height={74} rx={20} fill={RED} stroke={INK} strokeWidth={7} />)}
  </g>
);

// ---------------------------------------------------------------- shots
type View = { cam: Cam; mood: Mood; body: React.ReactNode; labels?: React.ReactNode; overlay?: React.ReactNode; bg?: string; cold?: number };

const ShotView: React.FC<{ span: ShotSpan; spans: ShotSpan[]; freezeAt?: number }> = ({ span, freezeAt }) => {
  const f0 = useCurrentFrame();
  const f = freezeAt ?? f0;
  const words = React.useContext(Words);
  const noText = React.useContext(NoText);
  const u = f - span.a, len = span.b - span.a;
  const C = (phrase: string, fb: number) => cueAt(words, phrase, span, fb);
  SCENE_TEXT = !noText;
  const v = build(span.id, f, u, len, C);
  SCENE_TEXT = true;
  const lab = v.mood === MOODS.lab;
  return (
    <AbsoluteFill>
      <Stage cam={v.cam} bg={v.bg ?? (lab ? LAB.bg : ARMY.wall)}>{v.body}</Stage>
      {!lab && <Pool x={540} y={700} rx={760} ry={760} color="#fff2c4" opacity={0.16} />}
      <Grade mood={v.mood} />
      {v.cold ? <Grade mood={MOODS.freeze} strength={v.cold} /> : null}
      {v.overlay}
      {!noText && v.labels && <AbsoluteFill><svg width={1080} height={1920} viewBox="0 0 1080 1920">{v.labels}</svg></AbsoluteFill>}
    </AbsoluteFill>
  );
};

// 43 of the 130 eligible soldiers took the pass: a fixed, scattered choice of grid cells, lit in this order
const GRID = { cols: 13, rows: 10, x0: 156, dx: 64, y0: 560, dy: 76 };
const LIT: number[] = (() => {
  const idx = Array.from({ length: 130 }, (_, i) => i);
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx.slice(0, 43);
})();

const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number): View => {
  let cam: Cam = { x: 0, y: 0, zoom: 1, rot: 0 };
  let mood = MOODS.office;
  switch (id) {
    case "hook": {   // medium-close: a soldier stands at the counselor's desk signing the RE-ENLIST contract on a clipboard; the
      // signature runs from "signed up" to "years"; "2+ MORE YEARS" lands on "two more years"; slow push
      mood = MOODS.close;
      const SU = C("signed up", 30), TY = C("two more years", 62), AR = C("army", 110);
      const signed = k(u, Math.min(4, SU - 26), AR, 0.08, 1, EASE.linear);
      cam = drift(on({ x: k(u, 0, len, 640, 660), y: k(u, 0, len, 1040, 1030) }, k(u, 0, len, 1.5, 1.66)), f, 1.2);
      const body = <Office f={f} items={[
        { y: FLOOR - 1, el: <DeskSet f={f} expr={u >= AR ? "laugh" : "smile"} pose={{ lookX: 0.6 }} /> },
        { y: FLOOR, el: <Signer x={760} s={1.1} f={f} signed={signed} expr={u >= AR ? "smile" : "focused"} t={f} /> },
      ]} />;
      const labels = <CardLabel f={u} x={510} y={420} size={74} color={GOLD} enter="scale" enterAt={TY} exitAt={len - 7}>2+ MORE YEARS</CardLabel>;
      return { cam, mood, body, labels };
    }
    case "headline": { // close-up on the soldier's face (contract done); on "four days" the golden 4 DAY PASS pops over his head,
      // camera kick, he cheers; "4 DAYS OF GAMING" words in above it
      mood = MOODS.close;
      const FD = C("four days", 64), VG = C("video games", 96);
      const pp = arrive(u, FD, 14);
      cam = kickCam(drift(on({ x: 740, y: k(u, 0, FD, 960, 900) }, k(u, 0, FD, 1.75, 2.05) + k(u, FD, len, 0, 0.06)), f, 1), u - FD, 12);
      const cheer = arrive(u, FD + 2, 10);
      const pose: Pose = { ...STAND, armL: [12 + 150 * cheer, -6 + 20 * cheer], armR: [20, -110 + 100 * cheer], lookX: u >= FD ? 0 : -0.4, headTilt: u >= FD ? -4 : 0 };
      const passAt = { x: 740, y: 735 };
      const body = <Office f={f} items={[
        { y: FLOOR - 1, el: <DeskSet f={f} expr="smile" pose={{ lookX: 0.7 }} /> },
        { y: FLOOR, el: <Soldier x={760} y={FLOOR} s={1.1} look={SOL} pose={pose} expr={u >= FD ? "cheer" : "smile"} f={f} seed={1} t={f} /> },
      ]} over={pp > 0 ? <Pass x={passAt.x} y={passAt.y - (1 - pp) * 40} scale={0.44} pop={pp} /> : null} />;
      const labels = <CardLabel f={u} x={510} y={380} size={62} color={GOLD} enter="words" enterAt={VG - 10} exitAt={len - 7}>4 DAYS OF GAMING</CardLabel>;
      return { cam, mood, body, labels, overlay: <Flash framesSince={u - FD} len={3} /> };
    }
    case "fort": {   // wide establishing: the whole office; the place name rises in; on "career counselor" the counselor looks up,
      // on "had an idea" a bulb pops over his head and he lifts a finger; slow pan
      const CC = C("career counselor", 50), ID = C("had an idea", 95);
      cam = drift({ x: k(u, 0, len, -30, 20), y: k(u, 0, len, -10, 0), zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 1.5);
      const idea = arrive(u, ID, 10);
      const bp = pop(u, ID, 12);
      const body = <Office f={f} items={[
        { y: FLOOR - 1, el: <DeskSet f={f} x={540} s={1.0} expr={u >= ID ? "laugh" : u >= CC ? "focused" : "calm"}
          pose={{ armR: [18 + 140 * idea, -40 + 30 * idea], lookX: u >= CC ? 0 : -0.5, headTilt: u >= CC ? 0 : 6 }} /> },
      ]} over={<Bulb x={540} y={880} s={0.8} p={bp} u={u - ID} />} />;
      const labels = <>
        <CardLabel f={u} x={510} y={400} size={66} color={CREAM} enter="rise" enterAt={4} exitAt={len - 7}>FORT STEWART,</CardLabel>
        <CardLabel f={u} x={510} y={490} size={66} color={GOLD} enter="rise" enterAt={12} exitAt={len - 7}>GEORGIA</CardLabel>
      </>;
      return { cam, mood, body, labels };
    }
    case "offer": {  // close on the wall calendar: the red ring draws around NOV 14 on "November fourteenth"; on "four day pass" the
      // camera eases back and the pass pins on under it; on "GTA 6" the camera tilts down to the pass and the words rise in
      mood = MOODS.close;
      const NF = C("November fourteenth", 20), FP = C("four day pass", 90), GT = C("GTA 6", 150);
      const ring = k(u, NF + 2, NF + 26, 0, 1, EASE.linear);
      const pinP = arrive(u, FP - 4, 14);
      const camA = { x: 575, y: 560, z: 2.1 }, camB = { x: 575, y: 720, z: 1.6 }, camC = { x: 575, y: 1000, z: 2.0 };
      const tB = k(u, FP - 10, FP + 14, 0, 1), tC = k(u, GT - 16, GT + 4, 0, 1);
      const lerp = (a: number, b: number, c: number) => a + (b - a) * tB + (c - b) * tC;
      cam = drift(on({ x: 575, y: lerp(camA.y, camB.y, camC.y) }, lerp(camA.z, camB.z, camC.z) + k(u, 0, FP - 10, 0, 0.06)), f, 0.8);
      const body = <Office f={f} calendar over={<g>
        {SCENE_TEXT ? <Calendar x={575} y={560} scale={0.6} circled={ring} month="NOV" day={14} /> : <rect x={437} y={386} width={276} height={348} fill={ARMY.paper} />}
        {pinP > 0 && <g transform={`translate(0 ${(1 - pinP) * -60})`} opacity={Math.min(1, pinP * 2)}>
          <Pass x={575} y={880} scale={0.42} pop={1} />
          <circle cx={575} cy={824} r={12} fill={ARMY.pinR} stroke={INK} strokeWidth={5} />
        </g>}
      </g>} />;
      const labels = <>
        <CardLabel f={u} x={510} y={420} size={58} color={CREAM} enter="rise" enterAt={NF - 4} exitAt={FP - 12}>RE-ENLIST BY NOV 14</CardLabel>
        <CardLabel f={u} x={510} y={Math.min(1300, toS(cam, { x: 575, y: 880 + 0.42 * 160 }).y + 150)} size={58} color={GOLD} enter="words" enterAt={GT + 4} exitAt={len - 7}>WHEN GTA 6 COMES OUT</CardLabel>
      </>;
      return { cam, mood, body, labels };
    }
    case "count": {  // lab: 130 eligible soldiers fill a grid row by row on "hundred and thirty"; from "who could take it" 43 of them
      // light up gold and throw their arms up one by one; the counter climbs to 43 OF 130, stops and stamps on "took it"
      mood = MOODS.lab;
      const HT = C("hundred and thirty", 40), WC = C("who could", 88), TK = C("took it", 130);
      cam = drift({ x: 0, y: k(u, 0, len, 10, -10), zoom: k(u, 0, len, 1.0, 1.04), rot: 0 }, f, 1.2);
      const fill = k(u, 0, HT + 16, 0, 1, EASE.linear);
      const litDur = Math.max(20, TK - WC);
      const body = <Lab>
        {Array.from({ length: 130 }, (_, i) => {
          const r = Math.floor(i / GRID.cols), c = i % GRID.cols;
          if (fill * GRID.rows < r + 0.01) return null;
          const li = LIT.indexOf(i);
          const lit = li < 0 ? 0 : arrive(u, WC + (li / 43) * litDur, 8);
          const appear = arrive(u, (r / GRID.rows) * (HT + 16), 8);
          return <g key={i} opacity={appear} transform={`translate(0 ${(1 - appear) * 20})`}>
            <MiniSoldier x={GRID.x0 + c * GRID.dx} y={GRID.y0 + r * GRID.dy} lit={lit} f={f} i={i} />
          </g>;
        })}
      </Lab>;
      const n = u < WC ? 0 : Math.min(43, Math.round(((u - WC) / litDur) * 43) + 1);
      const labels = <>
        <CardLabel f={u} x={510} y={390} size={60} color={MUTED} enter="rise" enterAt={HT} exitAt={WC - 6}>130 COULD TAKE IT</CardLabel>
        <CountCard f={u} x={510} y={390} text={`${n} OF 130`} startAt={WC} dur={litDur} exitAt={len - 7} size={70} w={520} />
      </>;
      return { cam, mood, body, labels };
    }
    case "bonus": {  // "Wait." - cold beat on the lone pass; on "usual re-enlistment bonuses" it shrinks to the left and cash bundles
      // stack into a tower on the right; on "sixty thousand" the tower tops out, $60,000+ stamps and a soldier cheers beside it
      mood = MOODS.lab;
      const UB = C("usual re-enlistment", 26), SX = C("sixty thousand", 110);
      const shrink = k(u, UB - 6, UB + 12, 0, 1, EASE.camera);
      const n = Math.round(k(u, UB, SX + 6, 0, 18, EASE.linear));
      cam = drift({ x: 0, y: k(u, 0, len, 0, -20), zoom: k(u, 0, len, 1.02, 1.07), rot: 0 }, f, 1.2);
      const px = interpolate(shrink, [0, 1], [540, 250]), py = interpolate(shrink, [0, 1], [820, 1160]), ps = interpolate(shrink, [0, 1], [0.7, 0.3]);
      const ch = arrive(u, SX + 6, 10);
      const pose: Pose = { ...STAND, armL: [12 + 150 * ch, -6 + 14 * ch], armR: [12 + 150 * ch, -6 + 14 * ch], lookX: -0.5 };
      const body = <Lab>
        <ellipse cx={600} cy={1222} rx={200} ry={22} fill="#05040c" opacity={0.4} />
        <CashStack x={600} y={1220} n={n} />
        <g transform={`translate(${px} ${py})`}><Pass x={0} y={0} scale={ps} /></g>
        {u >= UB - 4 && <g opacity={arrive(u, UB - 4, 10)}>
          <Soldier x={860} y={1222 - (u >= SX + 6 ? 16 * Math.abs(Math.sin((u - SX) * 0.25)) : 0)} s={0.62} look={SOL2} pose={pose} expr={u >= SX + 6 ? "cheer" : "smile"} f={f} seed={3} t={u >= SX + 6 ? undefined : f} />
        </g>}
      </Lab>;
      const labels = <>
        <CardLabel f={u} x={510} y={400} size={62} color={CREAM} enter="rise" enterAt={UB} exitAt={SX - 6}>USUAL BONUSES TOO</CardLabel>
        <CountCard f={u} x={510} y={400} text={`$${Math.round(k(u, SX - 4, SX + 14, 10, 60, EASE.arrive))},000+`} startAt={SX - 4} dur={18} exitAt={len - 7} color={GREEN} size={76} w={480} />
      </>;
      return { cam, mood, body, labels, cold: 0.9 * (1 - k(u, 10, 26, 0, 1)) };
    }
    case "why": {    // cold freeze: close on the soldier hugging the little pass to his chest, office behind; the question words in;
      // on "steal the show" the camera pushes to his face and he looks at us
      mood = MOODS.close;
      const ST = C("steal the show", Math.round(len * 0.6));
      const x = 560, s = 1.1;
      const pose: Pose = { ...STAND, armL: [20, -125], armR: [20, -125], lookX: u >= ST ? 0 : -0.6, headTilt: u >= ST ? -5 * k(u, ST, ST + 8, 0, 1) : 5 };
      const hl = handPos({ x, y: FLOOR, scale: s, pose }, "L"), hr = handPos({ x, y: FLOOR, scale: s, pose }, "R");
      const push = k(u, ST - 4, len, 0, 1);
      cam = on({ x: 560, y: interpolate(push, [0, 1], [1000, 960]) }, interpolate(push, [0, 1], [1.75, 2.05]) + k(u, 0, ST, 0, 0.05));
      const body = <Office f={f - u} items={[
        { y: FLOOR, el: <g>
          <Soldier x={x} y={FLOOR} s={s} look={SOL} pose={pose} expr={u >= ST ? "smirk" : "worried"} f={0} seed={1} />
          <Pass x={(hl.x + hr.x) / 2} y={(hl.y + hr.y) / 2 + 8} scale={0.26} />
          <circle cx={hl.x} cy={hl.y} r={8 * s} fill={SOL.skin} stroke={INK} strokeWidth={4.2 * s} />
          <circle cx={hr.x} cy={hr.y} r={8 * s} fill={SOL.skin} stroke={INK} strokeWidth={4.2 * s} />
        </g> },
      ]} />;
      const labels = <CardLabel f={u} x={510} y={420} size={70} color={CREAM} enter="words" enterAt={6} exitAt={len - 7}>WHY THE PASS?</CardLabel>;
      return { cam, mood, body, labels, cold: 1 };
    }
    case "carry": {  // lab: a see-saw with a heavy SHOULD crate pinning the right end down; on "want" a glowing WANT orb drops onto the
      // left end, the plank tips and lifts the crate; on "carry" it settles high
      mood = MOODS.lab;
      const WT = C("want", 10), CR = C("carry", 34);
      const drop = k(u, WT - 2, WT + 10, 0, 1, Easing.in(Easing.quad));
      const land = WT + 10;
      const tip = k(u, land, land + 18, 0, 1, Easing.out(Easing.back(1.4)));
      const ang = interpolate(tip, [0, 1], [12, -13]) + (u > land && u < land + 10 ? Math.sin((u - land) * 1.2) * 1.2 : 0);
      cam = kickCam(drift({ x: 0, y: k(u, 0, len, 30, 0), zoom: k(u, 0, len, 1.0, 1.08), rot: 0 }, f, 1.2), u - land, 10);
      const body = <Lab><SeeSaw x={540} y={1020} ang={ang} want={u >= WT - 2 ? 1 : 0} wantY={(1 - drop) * 700} glow={0.6 + 0.4 * Math.sin(u * 0.3)} /></Lab>;
      const labels = <Label f={u} x={510} y={420} size={64} color={GOLD} enter="words" enterAt={CR - 4} exitAt={len - 7}>A WANT CAN CARRY</Label>;
      return { cam, mood, body, labels };
    }
    case "gym": {    // university gym: two members run on treadmills with headphones (camera starts close and pulls back); on
      // "gripping audiobooks" an audio player pops in above them; on "The catch?" a padlock snaps over it; "GYM ONLY" on "at the gym"
      mood = MOODS.gym;
      const GA = C("gripping audiobooks", 70), CT = C("The catch", 100), AG = C("at the gym", 160);
      const ap = pop(u, GA, 12), lock = k(u, CT + 2, CT + 14, 0, 1, EASE.linear);
      cam = drift({ x: k(u, 0, GA, 20, 0), y: k(u, 0, GA, 160, 0), zoom: k(u, 0, GA, 1.3, 1.0), rot: 0 }, f, 1.2);
      const TY = 1360, ts = 0.75, ps = 0.78;
      const runner = (tx: number, look: Look, ph: number, k2: string) => {
        const pose = runPose(u * 0.42 + ph, 0.85);
        const px = tx - 40, py = TY - TREADMILL_DECK * ts - Math.abs(Math.sin(u * 0.42 + ph)) * 6;
        return <g key={k2}>
          <Treadmill x={tx} y={TY} scale={ts} f={f} />
          <Person x={px} y={py} scale={ps} look={look} pose={pose} expr="focused" blink={blinkOf(f, ph * 3)} />
          <Headphones x={px} y={py} scale={ps} pose={pose} color={k2 === "a" ? RED : "#3a7bd5"} />
        </g>;
      };
      const body = <>
        <Layer p={1}><Svg>
          <Gym f={f} />
          {runner(300, EXTRAS[3], 0, "a")}
          {runner(790, EXTRAS[0], 1.7, "b")}
          {ap > 0 && <g transform={`translate(760 640) scale(${ap}) translate(-760 -640)`}><Audiobook x={760} y={640} scale={0.66} locked={lock} /></g>}
        </Svg></Layer>
      </>;
      const labels = <>
        <CardLabel f={u} x={300} y={600} size={50} color={CREAM} enter="rise" enterAt={GA + 6} exitAt={len - 7}>AUDIOBOOKS:</CardLabel>
        <CardLabel f={u} x={300} y={690} size={60} color={GOLD} enter="scale" enterAt={AG - 4} exitAt={len - 7}>GYM ONLY</CardLabel>
      </>;
      return { cam, mood, body, labels };
    }
    case "result": { // lab bar chart: USUAL vs AUDIOBOOK gym visits; the bundled bar grows on "fifty one percent", the +51% counter
      // stops and stamps; on "At first." the bundled bar sinks back toward the usual one and AT FIRST stamps over the gap
      mood = MOODS.lab;
      const FO = C("fifty one", 60), AF = C("At first", 125);
      const BY = 1220, BH = 440;
      const g0 = arrive(u, 4, 16), g1 = k(u, FO - 8, FO + 16, 0, 1, EASE.arrive);
      const fade = k(u, AF, AF + 20, 0, 1);
      const h0 = BH * g0, h1 = BH * (1 + 0.51 * g1) * (u < FO - 8 ? g0 : 1) - BH * 0.26 * fade;
      cam = drift({ x: 0, y: k(u, 0, len, 20, 0), zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 1.2);
      const x0 = 330, x1 = 730, bw = 260;
      const body = <Lab>
        <path d={`M 140 ${BY} L 940 ${BY}`} stroke={MUTED} strokeWidth={8} strokeLinecap="round" />
        <rect x={x0 - bw / 2} y={BY - h0} width={bw} height={h0} rx={14} fill="#7d86a8" stroke={INK} strokeWidth={8} />
        <rect x={x1 - bw / 2} y={BY - h1} width={bw} height={h1} rx={14} fill={GOLD} stroke={INK} strokeWidth={8} />
        {g1 > 0.2 && <path d={`M 160 ${BY - BH} L 920 ${BY - BH}`} stroke={CREAM} strokeWidth={5} strokeDasharray="18 14" opacity={0.6 * g0} />}
        {SCENE_TEXT && <>
          <text x={x0} y={BY + 70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={CREAM} opacity={g0}>USUAL</text>
          <text x={x1} y={BY + 70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={GOLD} opacity={g0}>GYM-ONLY</text>
          <text x={x1} y={BY + 118} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={GOLD} opacity={g0}>BOOKS</text>
        </>}
        <g transform={`translate(${x0} ${BY - h0 - 70})`} opacity={g0}><DumbbellIcon x={0} y={0} s={0.5} /></g>
        <g transform={`translate(${x1} ${BY - h1 - 70})`} opacity={g0}><PhonesIcon x={0} y={0} s={0.55} /></g>
      </Lab>;
      const n = Math.round(k(u, FO - 8, FO + 16, 1, 51, EASE.arrive));
      const labels = <>
        <Label f={u} x={510} y={400} size={64} color={CREAM} enter="rise" enterAt={2} exitAt={FO - 10}>GYM VISITS</Label>
        <CountCard f={u} x={510} y={400} text={`+${n}% GYM VISITS`} startAt={FO - 8} dur={24} exitAt={len - 7} size={64} w={680} />
        <Stamp f={u} x={320} y={570} text="AT FIRST" at={AF + 6} exitAt={len - 7} />
      </>;
      return { cam, mood, body, labels };
    }
    case "name": {   // lab title card: TEMPTATION / BUNDLING stamps in on "temptation bundling"; on "the thing you avoid" an AVOID card
      // (dumbbell) slides in from the left, on "the thing you crave" a CRAVE card (headphones) from the right, a gold ribbon ties them
      mood = MOODS.lab;
      const TB = C("temptation bundling", 6), AV = C("you avoid", 70), CV = C("you crave", 120);
      const a = arrive(u, AV - 4, 14), c = arrive(u, CV - 4, 14), tie = k(u, CV + 10, CV + 26, 0, 1, EASE.linear);
      cam = drift({ x: 0, y: k(u, 0, len, 10, -10), zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 1.2);
      const card = (x: number, head: string, col: string, icon: React.ReactNode, p: number, dx: number) => p <= 0 ? null :
        <g opacity={Math.min(1, p * 1.5)} transform={`translate(${(1 - p) * dx} 0)`}>
          <rect x={x - 160} y={720} width={320} height={420} rx={28} fill="#1e2a52" stroke={INK} strokeWidth={9} />
          <rect x={x - 160} y={720} width={320} height={110} rx={28} fill={col} stroke={INK} strokeWidth={9} />
          {SCENE_TEXT && <text x={x} y={800} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={INK}>{head}</text>}
          {icon}
        </g>;
      const body = <Lab>
        {card(300, "AVOID", RED, <DumbbellIcon x={300} y={980} s={1.1} />, a, -500)}
        {card(760, "CRAVE", GOLD, <PhonesIcon x={760} y={990} s={1.2} />, c, 500)}
        {c > 0.5 && <g opacity={arrive(u, CV + 4, 8)}>
          <circle cx={530} cy={930} r={44} fill={INK} /><path d="M 508 930 L 552 930 M 530 908 L 530 952" stroke={CREAM} strokeWidth={12} strokeLinecap="round" />
        </g>}
        {tie > 0 && <g>
          <path d={`M 130 1110 L ${130 + 800 * tie} 1110`} stroke={INK} strokeWidth={40} strokeLinecap="round" />
          <path d={`M 130 1110 L ${130 + 800 * tie} 1110`} stroke={GOLD} strokeWidth={26} strokeLinecap="round" />
          {tie >= 1 && <g transform="translate(530 1110)">
            <path d="M 0 0 C -60 -70 -120 -30 -100 10 C -80 50 -30 20 0 0 C 30 20 80 50 100 10 C 120 -30 60 -70 0 0 Z" fill={GOLD} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
            <circle r={20} fill={ARMY.gold2} stroke={INK} strokeWidth={6} />
          </g>}
        </g>}
      </Lab>;
      const labels = <>
        <Label f={u} x={510} y={420} size={86} color={GOLD} enter="scale" enterAt={TB + 2} exitAt={len - 7}>TEMPTATION</Label>
        <Label f={u} x={510} y={530} size={86} color={CREAM} enter="scale" enterAt={TB + 8} exitAt={len - 7}>BUNDLING</Label>
      </>;
      return { cam, mood, body, labels };
    }
    case "kai": {    // park at sunrise, the world scrolls past, Kai centred: a slow, miserable jog on "hates running"; on "favorite podcast"
      // the headphones pop on, he smiles and speeds up; "PODCAST = RUNS ONLY" on "runs only"
      mood = MOODS.park;
      const FP = C("favorite podcast", 50), RO = C("runs only", 110);
      const hp = pop(u, FP, 10);
      const speed = k(u, FP, FP + 20, 0.22, 0.42, EASE.linear);
      const ph = u < FP ? u * 0.22 : FP * 0.22 + (u - FP) * 0.42 - (Math.min(20, u - FP) * 0.1);
      const scroll = u < FP ? u * 6 : FP * 6 + (u - FP) * 6 + Math.max(0, u - FP) * 8 * Math.min(1, (u - FP) / 20);
      const pose = runPose(ph, u < FP ? 0.55 : 0.95);
      const x = 540, s = 1.1, y = FLOOR - Math.abs(Math.sin(ph)) * (u < FP ? 4 : 10);
      cam = drift(on({ x: 540, y: 1040 }, k(u, 0, len, 1.22, 1.3)), f, 1);
      const body = <Layer p={1}><Svg>
        <ParkPath f={f} scroll={scroll} />
        <Person x={x} y={y} scale={s} look={KAI} pose={{ ...pose, lean: (pose.lean ?? 0) * (u < FP ? 0.6 : 1) }} expr={u >= FP ? "smile" : "worried"} blink={blinkOf(f, 2)} />
        {hp > 0 && <g transform={`translate(${x} ${y - 380 * s}) scale(${hp}) translate(${-x} ${-(y - 380 * s)})`}>
          <Headphones x={x} y={y} scale={s} pose={{ ...pose, lean: (pose.lean ?? 0) * (u < FP ? 0.6 : 1) }} color={RED} /></g>}
      </Svg></Layer>;
      void speed;
      const labels = <CardLabel f={u} x={510} y={420} size={62} color={GOLD} enter="words" enterAt={RO - 6} exitAt={len - 7}>PODCAST = RUNS ONLY</CardLabel>;
      return { cam, mood, body, labels, bg: ARMY.grass };
    }
    case "weeks": {  // wide park, Kai small on the left: a WEEK 1 strip ticks off all seven days on "runs every day"; on "Week four" the
      // strip flips to WEEK 4, the ticks stop after one day, Kai slows to a walk and tugs the headphones off; "NEW PODCAST?"
      mood = MOODS.park;
      const W4 = C("Week four", 78), NP = C("new podcast", 120);
      const wk4 = u >= W4;
      const walk = k(u, W4, W4 + 16, 0, 1);
      const ph = u < W4 ? u * 0.4 : W4 * 0.4 + (u - W4) * 0.4 * (1 - 0.6 * walk);
      const pose: Pose = runPose(ph, 0.9 - 0.55 * walk);
      const x = 300, s = 0.85, y = FLOOR - Math.abs(Math.sin(ph)) * 8 * (1 - walk);
      const scroll = u < W4 ? u * 13 : W4 * 13 + (u - W4) * (13 - 9 * walk);
      cam = drift(on({ x: 540, y: 960 }, k(u, 0, len, 1.0, 1.03)), f, 1);
      const body = <Layer p={1}><Svg>
        <ParkPath f={f} scroll={scroll + 2400} />
        <Person x={x} y={y} scale={s} look={KAI} pose={pose} expr={wk4 ? "worried" : "smile"} blink={blinkOf(f, 2)} />
        {(!wk4 || walk < 0.5) && <Headphones x={x} y={y} scale={s} pose={pose} color={RED} />}
      </Svg></Layer>;
      const flip = wk4 ? k(u, W4, W4 + 8, 0, 1, EASE.linear) : 1;
      const strip = (w: number, ticks: number, op: number) => <g opacity={op}>
        <rect x={100} y={340} width={880} height={330} rx={26} fill={INK} opacity={0.82} />
        {Array.from({ length: 7 }, (_, i) => <g key={i}>
          <rect x={130 + i * 116} y={510} width={100} height={130} rx={16} fill="#f6efe0" stroke={GOLD} strokeWidth={5} />
          <Tick x={180 + i * 116} y={576} s={1} p={k(u - (w === 4 ? W4 : 0), (w === 4 ? 10 : 12) + i * 7, (w === 4 ? 10 : 12) + i * 7 + 6, 0, 1, EASE.linear) * (i < ticks ? 1 : 0)} />
        </g>)}
      </g>;
      const labels = <>
        {!wk4 && strip(1, 7, arrive(u, 4, 10) * (1 - leave(u, W4 - 6, 6)))}
        {wk4 && strip(4, 1, flip)}
        <Label f={u} x={510} y={420} size={70} color={GOLD} enter="scale" enterAt={2} exitAt={W4 - 6}>WEEK 1</Label>
        <Label f={u} x={510} y={420} size={70} color={RED} enter="scale" enterAt={W4} exitAt={len - 7}>WEEK 4</Label>
        <CardLabel f={u} x={510} y={800} size={60} color={CREAM} enter="words" enterAt={NP - 2} exitAt={len - 7}>NEW PODCAST?</CardLabel>
      </>;
      return { cam, mood, body, labels, bg: ARMY.grass };
    }
    default: {       // ask: home in the evening, Kai on the sofa with the headphones round his neck turns to us and shrugs, palms up,
      // a small smile; the camera eases out from his face to the room
      mood = MOODS.home;
      const WY = C("what would", 10);
      const pull = k(u, 0, len, 0, 1);
      const sh = arrive(u, WY + 6, 12);
      cam = drift(on({ x: interpolate(pull, [0, 1], [540, 540]), y: interpolate(pull, [0, 1], [900, 960]) }, interpolate(pull, [0, 1], [1.7, 1.25])), f, 1.2);
      const SS = 0.8, PS = 1.05, SY = 1300, px = 540, py = SY - 104;
      const pose: Pose = { armL: [22 + 30 * sh, -40 - 70 * sh], armR: [22 + 30 * sh, -40 - 70 * sh], legL: [6, 0], legR: [6, 0], crouch: 0.6, headTilt: 6 * sh, lookX: 0 };
      const body = <>
        <Layer p={0.6}><Svg><LivingWall y={-300} h={1600} /></Svg></Layer>
        <Layer p={1}><Svg>
          <LivingFloor y={1300} h={900} />
          <Rug x={540} y={1420} w={760} />
          <FloorLamp x={930} y={1300} scale={0.85} />
          <Sofa x={540} y={SY} scale={SS} />
          <Person x={px} y={py} scale={PS} look={KAI} pose={pose} expr={u >= WY + 6 ? "smirk" : "smile"} blink={blinkOf(f, 2)} t={f} shadow={0} />
          <NeckPhones x={px} y={py} scale={PS} pose={pose} />
          <Sofa x={540} y={SY} scale={SS} front />
        </Svg></Layer>
      </>;
      return { cam, mood, body, bg: "#2a2030" };
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
  const fade = prev && u < XF && (PLACE[prev.id] ?? "office") !== (PLACE[span.id] ?? "office");
  return (
    <Words.Provider value={words}><AbsoluteFill>
      <NoText.Provider value={!!fade}><ShotView span={span} spans={spans} /></NoText.Provider>
      {fade && prev && <NoText.Provider value><AbsoluteFill style={{ opacity: 1 - (u + 1) / (XF + 1) }}><ShotView span={prev} spans={spans} freezeAt={prev.b - 1} /></AbsoluteFill></NoText.Provider>}
    </AbsoluteFill></Words.Provider>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "gta-army",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: ARMY.wall,
};
export default story;
