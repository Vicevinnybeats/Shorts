// "Why the Silent Player Took Everything" - 2.5D. Board-game night: Max talks nonstop, June says nothing - and wins.
// Facts (see RESEARCH.md): Curhan et al. 2022 (Journal of Applied Psychology, "Silence is golden"): in negotiation
// experiments, pauses of three seconds or more went with better deals for both sides (more value created); people
// told to pause shifted from fighting to thinking and grew the pie. Silence feels awkward fast (a few seconds), so
// people rush to fill it - often by giving things away.
// Table layout: tableLayout(540, 1400, 700): Max backL, June backR (both facing the camera), friend1 left, friend2
// right (profile). Back players' arms below the table's back edge are drawn as forearms over the table (TableArm).
// Every explanation shot is its own picture; on-screen text stays between y 300 and y 1350 inside 60 px margins.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, ShotSpan, cueTime, FPS } from "../../src/engine/timeline";
import type { Word } from "../../src/captions/Captions";
import { Stage, Layer, Svg, Cam, drift, kickCam } from "../../src/engine25/stage";
import { Grade, Mood, Pool, Flash } from "../../src/engine25/light";
import { Person, Look, INK, Expr, Pose } from "../../library/characters25/person";
import { CAST, EXTRAS } from "../../library/style/channel";
import { Lab, T as LabT, LAB } from "../../library/environments25/lab";
import { GAME, GameRoomWall, GameFloor, FairyLights, wallLights, PendantLamp, GameTable, tableLayout, tablePoint, SEAT_POSES, playerAt,
  PlayerAtTable, HandsOnTable, Cards, CardStack, Dice, Snacks, Glass, SweatDrop, ClockBubble, Lightbulb, AwkwardMeter,
  SpeechBubble, SeatName, sitPose } from "../../library/environments25/gamenight";
import scenes from "../../content/scripts/silent.json";

const SHOTS = scenes.shots.map((s) => ({ id: s.id, cue: s.cue }));

/** inside a crossfade every on-screen label is dropped, so text never lies over another picture */
const NoText = React.createContext(false);
/** the narration words (real voice or estimate), so a beat inside a shot can sit exactly on a spoken cue */
const Words = React.createContext<Word[]>([]);
/** frame (relative to the shot start) where `phrase` is spoken inside this shot; fallback if not found */
const cueAt = (words: Word[], phrase: string, span: ShotSpan, fallback: number) => {
  try { return Math.round(cueTime(words, phrase, span.a / FPS - 0.3) * FPS) - span.a; } catch { return fallback; }
};
const T: React.FC<React.ComponentProps<typeof LabT>> = (p) => (React.useContext(NoText) ? null : <LabT {...p} />);

const MOODS: Record<string, Mood> = {
  night: { grade: "#ff9a4a", gradeOp: 0.06, vignette: 0.42, glow: "#ffe2a8" },     // cosy evening, warm bulbs
  close: { grade: "#ff8a3a", gradeOp: 0.08, vignette: 0.5, glow: "#ffe2a8" },
  tense: { grade: "#2c3f7a", gradeOp: 0.18, vignette: 0.62, glow: "#e8f0ff" },     // the silence
  freeze: { grade: "#1b2a6b", gradeOp: 0.2, vignette: 0.5 },                     // "Wait. Why?" - cold freeze-frame
  lab: { grade: "#0b1430", gradeOp: 0.04, vignette: 0.45 },
};

const ease = Easing.bezier(0.33, 0, 0.2, 1);
const k = (u: number, a: number, b: number, from: number, to: number, e = ease) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const rad = (d: number) => (d * Math.PI) / 180;
type Pt = { x: number; y: number };

// ---------------------------------------------------------------- cast + set
const JUNE: Look = CAST.june, MAX: Look = CAST.max, F1: Look = CAST.friend1, F2: Look = CAST.friend2;
const { gold: GOLD, red: RED, green: GREEN, text: CREAM, muted: MUTED } = LAB;
const BLUE = "#2d6fd8", REDC = "#e8443a";
const L = tableLayout(540, 1400, 700);
const G = L.geom;
const SEAT: Record<"max" | "june" | "f1" | "f2", SeatName> = { max: "backL", june: "backR", f1: "left", f2: "right" };
const LOOK = { max: MAX, june: JUNE, f1: F1, f2: F2 } as const;
type Who = keyof typeof SEAT;

// ---------------------------------------------------------------- arms: forward + inverse kinematics on the Person rig
type Rig = { x: number; y: number; s: number; facing: 1 | -1; pose: Pose; t?: number };
const frameOf = (r: Rig) => {
  const br = r.t === undefined || r.pose.profile ? 0 : Math.sin(r.t * 0.11);
  const sway = r.t === undefined || r.pose.profile ? 0 : Math.sin(r.t * 0.07) * 4;
  const crouch = ((r.pose.crouch ?? 0) + br * 0.012) * 140;
  return { sway, shY: -285 + crouch * 0.9, hipY: -150 + crouch, lean: (r.pose.lean ?? 0) * r.facing };
};
const dirOf = (r: Rig, side: "L" | "R") => (r.pose.profile ? r.facing : side === "L" ? -1 : 1);
const handAt = (r: Rig, side: "L" | "R") => {
  const { sway, shY, hipY, lean } = frameOf(r), d = dirOf(r, side);
  const [a0, b] = side === "L" ? r.pose.armL : r.pose.armR, a = a0 + (side === "L" ? sway : -sway);
  const lx = (side === "L" ? -42 : 42) + Math.sin(rad(a)) * d * 70 + Math.sin(rad(a + b)) * d * 64;
  const ly = shY + 14 + Math.cos(rad(a)) * 70 + Math.cos(rad(a + b)) * 64;
  const c = Math.cos(rad(lean)), s = Math.sin(rad(lean)), yy = ly - hipY;
  return { x: r.x + (lx * c - yy * s) * r.s, y: r.y + (hipY + lx * s + yy * c) * r.s };
};
/** arm angles that put a hand at (tx, ty) (two-bone IK); bend -1/1 picks the elbow side */
const reach = (r: Rig, side: "L" | "R", tx: number, ty: number, bend = -1): [number, number] => {
  const { sway, shY, hipY, lean } = frameOf(r), d = dirOf(r, side);
  const wx = (tx - r.x) / r.s, wy = (ty - r.y) / r.s - hipY;
  const c = Math.cos(rad(-lean)), s = Math.sin(rad(-lean));
  const lx = wx * c - wy * s, ly = hipY + wx * s + wy * c;
  const dx = (lx - (side === "L" ? -42 : 42)) * d, dy = ly - (shY + 14);
  const D = Math.max(12, Math.min(133.5, Math.hypot(dx, dy)));
  const b = bend * Math.acos(Math.max(-1, Math.min(1, (D * D - 70 * 70 - 64 * 64) / (2 * 70 * 64))));
  const a = Math.atan2(dx, dy) - Math.atan2(64 * Math.sin(b), 70 + 64 * Math.cos(b));
  return [(a * 180) / Math.PI - (side === "L" ? sway : -sway), (b * 180) / Math.PI];
};
const rigOf = (who: Who, pose: Pose, t?: number): Rig => {
  const p = playerAt(L, SEAT[who], pose);
  return { x: p.x, y: p.y, s: p.scale, facing: p.facing, pose, t };
};
/** head centre of a seated player (front or profile), for camera framing and bubbles */
const headOf = (who: Who, pose?: Pose): Pt => {
  const p = playerAt(L, SEAT[who], pose);
  return { x: p.x + 4 * p.facing * p.scale, y: p.y - 350 * p.scale };
};
/** a back player's head is framed by the camera: this is its centre with the default rest pose */
const H = { max: headOf("max"), june: headOf("june"), f1: headOf("f1"), f2: headOf("f2") };

// ---------------------------------------------------------------- local props
const FRONT = SEAT_POSES.front, SIDE = SEAT_POSES.side;
const TP = (u: number, v: number): Pt => { const [x, y] = tablePoint(G, u, v); return { x, y }; };

/** forearm + hand of a BACK player lying over the table (drawn after GameTable): from under the shoulder to `to` */
const TableArm: React.FC<{ who: "max" | "june"; side: -1 | 1; to: Pt; look: Look }> = ({ who, side, to, look }) => {
  const s = L.seats[SEAT[who]], kk = s.scale, limbW = 13.2, ink = 4.2;
  const p = `M ${s.x + side * 56 * kk} ${L.cut - 8} L ${to.x} ${to.y}`;
  return <g>
    <path d={p} stroke={INK} strokeWidth={(limbW + ink * 2) * kk} strokeLinecap="round" />
    <path d={p} stroke={look.skin} strokeWidth={limbW * kk} strokeLinecap="round" />
    <circle cx={to.x} cy={to.y} r={limbW * 0.6 * kk} fill={look.skin} stroke={INK} strokeWidth={ink * kk} />
  </g>;
};
/** squiggle "words" (no letters) inside a bubble */
const Squiggles: React.FC<{ x: number; y: number; w: number; lines?: number; s?: number; c?: string }> = ({ x, y, w, lines = 2, s = 1, c = INK }) => (
  <g>{Array.from({ length: lines }, (_, i) => {
    const yy = y + (i - (lines - 1) / 2) * 34 * s, ww = w * (i % 2 ? 0.7 : 1), n = 7;
    const d = Array.from({ length: n + 1 }, (_, j) => `${j ? "L" : "M"} ${x - ww / 2 + (ww * j) / n} ${yy + (j % 2 ? -9 : 9) * s}`).join(" ");
    return <path key={i} d={d} stroke={c} strokeWidth={7 * s} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  })}</g>
);
/** jagged shout burst (loud talk) with squiggles; x,y centre, r size, o pop 0..1 */
const Shout: React.FC<{ x: number; y: number; r: number; o?: number; rot?: number; fill?: string }> = ({ x, y, r, o = 1, rot = 0, fill = "#fff4d6" }) => {
  if (o <= 0.01) return null;
  const n = 14, pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * 0.78 : r * (1 + ((i * 7) % 5) * 0.03);
    return `${i ? "L" : "M"} ${(Math.cos(a) * rr * 1.25).toFixed(1)} ${(Math.sin(a) * rr * 0.85).toFixed(1)}`;
  }).join(" ") + " Z";
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.4 + 0.6 * o})`} opacity={Math.min(1, o * 1.5)}>
    <path d={pts} fill={fill} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <Squiggles x={0} y={0} w={r * 1.3} lines={2} s={r / 90} />
  </g>;
};
/** thought bubble (cloud + trailing dots toward `to`) */
const Thought: React.FC<{ x: number; y: number; w: number; h: number; to?: Pt; o?: number; children?: React.ReactNode }> = ({ x, y, w, h, to, o = 1, children }) => {
  if (o <= 0.01) return null;
  const n = 10, puffs = Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return { cx: x + Math.cos(a) * w * 0.42, cy: y + Math.sin(a) * h * 0.38, r: Math.min(w, h) * 0.2 }; });
  return <g opacity={o}>
    {to && [0.35, 0.62, 0.84].map((t, i) => <circle key={i} cx={to.x + (x - to.x) * t * 0.85} cy={to.y + (y + h * 0.4 - to.y) * t * 0.85} r={8 + i * 6} fill="#fff4d6" stroke={INK} strokeWidth={5} />)}
    {puffs.map((p, i) => <circle key={i} {...p} fill="#fff4d6" stroke={INK} strokeWidth={8} />)}
    <ellipse cx={x} cy={y} rx={w * 0.44} ry={h * 0.38} fill="#fff4d6" />
    {children}
  </g>;
};
/** little red bridge (Max's plan) built from red pieces; x,y = centre of the deck, s scale, built 0..1 */
const Bridge: React.FC<{ x: number; y: number; s?: number; built?: number }> = ({ x, y, s = 1, built = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -150 50 L 150 50" stroke="#3fb8c9" strokeWidth={22} strokeLinecap="round" opacity={0.8} />
    <path d="M -110 50 Q 0 -60 110 50" stroke={INK} strokeWidth={20} fill="none" />
    <path d="M -110 50 Q 0 -60 110 50" stroke={REDC} strokeWidth={10} fill="none" />
    {[-140, -70, 0, 70].map((bx, i) => (i + 1) / 4 <= built + 0.01
      ? <rect key={i} x={bx} y={-14} width={70} height={22} fill={REDC} stroke={INK} strokeWidth={6} /> : <rect key={i} x={bx} y={-14} width={70} height={22} fill="none" stroke={MUTED} strokeWidth={5} strokeDasharray="10 8" />)}
    {[-80, 0, 80].map((px) => <path key={px} d={`M ${px} 8 L ${px} ${50 - Math.abs(px) * 0.4}`} stroke={INK} strokeWidth={8} />)}
  </g>
);
const Check: React.FC<{ x: number; y: number; s?: number; ok?: boolean }> = ({ x, y, s = 1, ok = true }) => (s <= 0.01 ? null :
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={46} fill={ok ? GREEN : RED} stroke={INK} strokeWidth={7} />
    {ok ? <path d="M -22 2 L -6 18 L 24 -16" stroke="#fff" strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      : <path d="M -18 -18 L 18 18 M 18 -18 L -18 18" stroke="#fff" strokeWidth={11} strokeLinecap="round" />}
  </g>
);
/** pause icon (two bars) on a round badge */
const PauseIcon: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = GOLD }) => (s <= 0.01 ? null :
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-40} y={-55} width={28} height={110} rx={10} fill={c} stroke={INK} strokeWidth={7} />
    <rect x={12} y={-55} width={28} height={110} rx={10} fill={c} stroke={INK} strokeWidth={7} />
  </g>
);
/** pizza seen from above: crust, sauce, cheese, pepperoni, n slices; half = which halves are tugged apart (gap px) */
const Pizza: React.FC<{ x: number; y: number; r: number; gap?: number; wob?: number }> = ({ x, y, r, gap = 0, wob = 0 }) => {
  const half = (d: -1 | 1) => {
    const arc = (rr: number) => `M 0 ${(-rr).toFixed(1)} A ${rr} ${rr} 0 0 ${d < 0 ? 0 : 1} 0 ${rr.toFixed(1)} Z`;
    const pep = [[0.45, -0.5], [0.62, 0.15], [0.3, 0.55], [0.25, -0.05], [0.72, -0.25]].map(([px, py]) => ({ cx: d * px * r, cy: py * r }));
    return <g key={d} transform={`translate(${d * gap} 0) rotate(${d * wob})`}>
      <path d={arc(r)} fill="#e0a33a" stroke={INK} strokeWidth={Math.max(5, r * 0.035)} strokeLinejoin="round" />
      <path d={arc(r * 0.86)} fill="#e8643a" />
      <path d={arc(r * 0.8)} fill="#ffd66b" />
      {pep.map((p, i) => <circle key={i} {...p} r={r * 0.1} fill="#c4342b" stroke={INK} strokeWidth={Math.max(3, r * 0.018)} />)}
      {[30, 60].map((deg) => { const a = rad(deg) * d; return <path key={deg} d={`M 0 0 L ${Math.sin(a) * r * 0.86} ${-Math.cos(a) * r * 0.86 * (deg === 30 ? 1 : -1)}`} stroke="#d99a1a" strokeWidth={Math.max(3, r * 0.02)} />; })}
    </g>;
  };
  return <g transform={`translate(${x} ${y})`}><ellipse cx={0} cy={r * 0.1} rx={r * 1.03} ry={r * 1.03} fill="#05040c" opacity={0.25} />{half(-1)}{half(1)}</g>;
};

/** a trading card that reads at phone size: solid colour face with a white border and a white diamond; x,y = bottom centre */
const ColorCard: React.FC<{ x: number; y: number; s?: number; rot?: number; c: string }> = ({ x, y, s = 1, rot = 0, c }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-45} y={-128} width={90} height={128} rx={10} fill="#fbf6ea" stroke={INK} strokeWidth={6} />
    <rect x={-36} y={-119} width={72} height={110} rx={6} fill={c} stroke={INK} strokeWidth={3} />
    <path d="M 0 -94 L 18 -64 L 0 -34 L -18 -64 Z" fill="#fbf6ea" stroke={INK} strokeWidth={3} />
  </g>
);
/** the three-second bar, thick: 3 segments filling left to right, a numbered tick 1-2-3 above each segment end */
const BigBar: React.FC<{ x: number; y: number; w: number; progress: number }> = ({ x, y, w, progress }) => {
  const p = Math.max(0, Math.min(1, progress)), Hh = 96;
  return <g>
    <rect x={x} y={y - Hh / 2} width={w} height={Hh} rx={Hh / 2} fill="#1a2448" stroke={INK} strokeWidth={9} />
    {p > 0 && <rect x={x + 10} y={y - Hh / 2 + 10} width={Math.max(Hh - 20, (w - 20) * p)} height={Hh - 20} rx={(Hh - 20) / 2} fill={GOLD} />}
    {[1, 2].map((i) => <path key={i} d={`M ${x + (w * i) / 3} ${y - Hh / 2 + 6} L ${x + (w * i) / 3} ${y + Hh / 2 - 6}`} stroke={INK} strokeWidth={7} opacity={0.7} />)}
    {[1, 2, 3].map((i) => <text key={i} x={x + (w * i) / 3 - w / 6} y={y - Hh / 2 - 22} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={54}
      fill={p * 3 >= i - 0.02 ? GOLD : MUTED}>{i}</text>)}
  </g>;
};

// ---------------------------------------------------------------- the game room
type Seat = { pose: Pose; expr: Expr; rot?: number; t?: number; hide?: boolean; blink?: boolean };
type RoomProps = { f: number; max?: Seat; june?: Seat; f1?: Seat; f2?: Seat; props?: React.ReactNode; backFront?: React.ReactNode; over?: React.ReactNode; lamp?: number };
const blinkOf = (f: number, seed: number) => ((f + seed * 37) % 103) < 4;
const Room: React.FC<RoomProps> = ({ f, max, june, f1, f2, props, backFront, over, lamp = 1 }) => {
  const seat = (who: Who, s: Seat | undefined, seed: number) => s && !s.hide
    ? <PlayerAtTable layout={L} seat={SEAT[who]} look={LOOK[who]} pose={s.pose} expr={s.expr} t={s.t ?? f + seed * 13} rot={s.rot} blink={s.blink ?? blinkOf(f, seed)} /> : null;
  return (
    <>
      <Layer p={0.6}><Svg><GameRoomWall y={-300} h={1560} /><FairyLights {...wallLights(-300, 1560)} f={f} glow={0} /></Svg></Layer>
      <Layer p={1}><Svg>
        <GameFloor y={1260} h={760} />
        {seat("max", max, 1)}{seat("june", june, 2)}
        <GameTable x={L.table.x} y={L.table.y} w={L.table.w} />
        {props}
        {backFront}
        {seat("f1", f1, 3)}{seat("f2", f2, 4)}
        {over}
      </Svg></Layer>
      <Layer p={1.1}><Svg><PendantLamp x={540} y={-330} len={420} glow={lamp} /></Svg></Layer>
    </>
  );
};
/** the usual table-top props (stack of cards, dice, glasses, snack bowl unless moved) */
const tableProps = (opts: { snack?: Pt | null; dice?: number | null } = {}) => {
  const s = opts.snack === undefined ? TP(0.24, 0.3) : opts.snack;
  return <>
    <CardStack x={TP(0.5, 0.42).x} y={TP(0.5, 0.42).y} count={14} scale={0.8} />
    {opts.dice !== null && <Dice x={TP(0.62, 0.62).x} y={TP(0.62, 0.62).y} value={opts.dice ?? 5} scale={0.62} rot={-8} />}
    <Glass x={TP(0.08, 0.8).x} y={TP(0.08, 0.8).y} scale={0.8} />
    <Glass x={TP(0.93, 0.78).x} y={TP(0.93, 0.78).y} scale={0.8} color="#7fc8ff" fill={0.5} />
    {s && <Snacks x={s.x} y={s.y} scale={0.62} />}
  </>;
};
/** June's hand of cards held over the table edge (backs to the camera), with her two forearms */
const JUNE_GRIP: Pt = { x: H.june.x - 6, y: L.cut + 40 };
const JuneHand: React.FC<{ lift?: number; n?: number; grip?: Pt; fan?: number }> = ({ lift = 0, n = 5, grip = JUNE_GRIP, fan = 56 }) => (
  <g>
    <TableArm who="june" side={-1} to={{ x: grip.x - 22, y: grip.y + 6 }} look={JUNE} />
    {lift > 0.01 && <g transform={`translate(${grip.x + lift * 55} ${grip.y - lift * 45}) rotate(${lift * 16})`}>
      <rect x={-46} y={-140} width={92} height={130} rx={10} fill="none" stroke={GOLD} strokeWidth={10} opacity={lift} />
      <Cards x={0} y={0} n={1} scale={1.25} faceUp={false} /></g>}
    <Cards x={grip.x} y={grip.y} n={n} fan={fan} scale={1.25} faceUp={false} />
    <TableArm who="june" side={1} to={{ x: grip.x + 22, y: grip.y + 6 }} look={JUNE} />
  </g>
);
const at = (p: Pt, zoom: number): Cam => ({ x: p.x - 540, y: p.y - 960, zoom, rot: 0 });

// ---------------------------------------------------------------- shots
const ShotView: React.FC<{ span: ShotSpan }> = ({ span }) => {
  const f = useCurrentFrame();
  const words = React.useContext(Words);
  const noText = React.useContext(NoText);
  const u = f - span.a, len = span.b - span.a;
  let cam: Cam = { x: 0, y: 0, zoom: 1, rot: 0 };
  let mood = MOODS.night;
  let body: React.ReactNode = null;
  let overlay: React.ReactNode = null;
  const C = (phrase: string, fb: number) => cueAt(words, phrase, span, fb);
  const restMax: Seat = { pose: FRONT.rest, expr: "smile" };
  const hands = (who: "max" | "june") => <HandsOnTable layout={L} seat={who === "max" ? "backL" : "backR"} look={LOOK[who]} />;

  switch (span.id) {
    case "hook": {   // close on June's calm face behind her card fan; the others' loud shouts burst in from both sides
      mood = MOODS.close;
      const TK = C("take everything", Math.round(len * 0.8));
      cam = drift(at({ x: H.june.x, y: H.june.y + 110 }, k(u, 0, len, 2.15, 2.4)), f, 1.5);
      body = <Room f={f} max={{ ...restMax, hide: true }} june={{ pose: FRONT.rest, expr: u >= TK ? "smirk" : "calm", t: f, blink: u > 50 && u < 54 }}
        f1={{ pose: SIDE.talk, expr: "laugh", hide: true }} f2={{ pose: SIDE.talk, expr: "laugh", hide: true }} props={tableProps()} backFront={<JuneHand />} />;
      const pop = (t0: number) => (u >= t0 ? k(u, t0, t0 + 5, 0, 1, Easing.out(Easing.back(2))) * (1 - k(u, t0 + 26, t0 + 32, 0, 1)) : 0);
      overlay = <AbsoluteFill><svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <Shout x={190} y={470} r={110} o={pop(4)} rot={-8} />
        <Shout x={890} y={560} r={100} o={pop(22)} rot={7} fill="#ffe0d6" />
        <Shout x={200} y={1260} r={95} o={pop(44)} rot={6} fill="#dff5ff" />
        <Shout x={880} y={430} r={105} o={pop(66)} rot={-6} />
        <Shout x={170} y={640} r={90} o={pop(88)} rot={4} fill="#ffe0d6" />
      </svg></AbsoluteFill>;
      break;
    }
    case "wide": {   // wide game night: Max gestures nonstop, the friends laugh on "jokes", he slides a card over on "trades"
      const JK = C("jokes", 50), BL = C("bluffs", 75), TR = C("trades", 100);
      const g = Math.sin(u * 0.32);
      const mPose: Pose = u < BL ? sitPose("front", { armL: [100 + g * 25, -60], armR: [110 - g * 25, -55] }) : u < TR ? FRONT.cross : sitPose("front", { armL: [100, -50], armR: [20, -10] });
      const laugh = u >= JK && u < JK + 30;
      const fly = k(u, TR, TR + 12, 0, 1, Easing.inOut(Easing.quad));
      const from = TP(0.3, 0.2), to = TP(0.06, 0.55);
      const card = { x: from.x + (to.x - from.x) * fly, y: from.y + (to.y - from.y) * fly - Math.sin(fly * Math.PI) * 90 };
      cam = drift({ x: k(u, 0, len, -12, 10), y: 30, zoom: k(u, 0, len, 1.0, 1.04), rot: 0 }, f, 2);
      body = <Room f={f}
        max={{ pose: mPose, expr: u < BL ? (laugh ? "laugh" : "cheer") : u < TR ? "smirk" : "smile", rot: Math.sin(u * 0.2) * 2 }}
        june={{ pose: FRONT.rest, expr: "calm" }}
        f1={{ pose: laugh ? { ...SIDE.rest, lean: -6 } : SIDE.rest, expr: laugh ? "laugh" : "smile" }}
        f2={{ pose: laugh ? { ...SIDE.hold, lean: -5 } : SIDE.hold, expr: laugh ? "laugh" : "smile" }}
        props={tableProps()}
        backFront={<>{u >= TR && <TableArm who="max" side={1} to={{ x: card.x + 10, y: Math.max(card.y, L.cut + 20) }} look={MAX} />}
          {u >= TR && <Cards x={card.x} y={card.y} n={1} scale={0.8} rot={-70 + fly * 50} colors={["#8cc63f"]} />}
          {u >= TR && fly >= 1 && <CardStack x={to.x} y={to.y} count={1} scale={0.6} faceUp color="#8cc63f" />}
          <JuneHand /></>}
        over={<>
          <Shout x={H.max.x - 130} y={H.max.y - 230} r={80} o={k(u, 2, 7, 0, 1) * (u < TR + 6 ? 1 : 0)} rot={-6} />
          {u >= JK && u < JK + 30 && <Shout x={H.f1.x + 10} y={H.f1.y - 230} r={62} o={k(u, JK, JK + 5, 0, 1)} rot={5} fill="#dff5ff" />}
        </>} />;
      break;
    }
    case "offer": {  // two-shot close: Max holds a blue card out toward June ("My blue for your red?"); her red card lifts on "red"
      mood = MOODS.close;
      const HO = C("holds out", 12), RD = C("red", 100);
      const out = k(u, HO, HO + 12, 0, 1, Easing.out(Easing.cubic));
      const mRig = rigOf("max", FRONT.rest, f + 13);
      const tgt = { x: interpolate(out, [0, 1], [H.max.x + 70, 548]), y: interpolate(out, [0, 1], [L.cut - 20, 870]) };
      const mPose: Pose = { ...FRONT.rest, armR: reach(mRig, "R", tgt.x, tgt.y, 1), armL: [14, -6] };
      const hd = handAt({ ...mRig, pose: mPose }, "R");
      cam = drift(at({ x: 545, y: 880 }, k(u, 0, len, 1.95, 2.08)), f, 1.5);
      body = <Room f={f} max={{ pose: mPose, expr: u < HO ? "smile" : "smirk", t: f + 13 }} june={{ pose: FRONT.rest, expr: u >= RD ? "focused" : "calm" }}
        f1={{ pose: SIDE.rest, expr: "smile", hide: true }} f2={{ pose: SIDE.rest, expr: "smile", hide: true }} props={tableProps()}
        backFront={<JuneHand lift={k(u, RD, RD + 6, 0, 1)} />}
        over={<ColorCard x={hd.x} y={hd.y + 8} s={1.05} rot={12} c={BLUE} />} />;
      break;
    }
    case "pause": {  // June says nothing: everybody freezes, a big clock bubble ticks one third per spoken count
      mood = MOODS.tense;
      const c1 = C("One", 43), c2 = C("Two", 71), c3 = C("Three", 89);
      const step = (c: number) => k(u, c, c + 4, 0, 1 / 3, Easing.out(Easing.back(2)));
      const prog = step(c1) + step(c2) + step(c3);
      const tick = [c1, c2, c3].reduce((a, c) => a + (u >= c && u < c + 6 ? (1 - (u - c) / 6) * 0.06 : 0), 0);
      const t0 = span.a;
      const mRig = rigOf("max", FRONT.rest, t0 + 13);
      const mPose: Pose = { ...FRONT.rest, armR: reach(mRig, "R", 548, 870, 1), armL: [14, -6] };
      const hd = handAt({ ...mRig, pose: mPose }, "R");
      cam = { x: 0, y: k(u, 0, len, 20, 0), zoom: k(u, 0, len, 1.0, 1.05), rot: 0 };
      body = <Room f={t0} lamp={0.6}
        max={{ pose: mPose, expr: "smile", t: t0 + 13, blink: false }} june={{ pose: FRONT.rest, expr: "calm", t: t0, blink: false }}
        f1={{ pose: SIDE.hold, expr: "worried", t: t0, blink: false }} f2={{ pose: SIDE.rest, expr: "worried", t: t0, blink: false }}
        props={tableProps()} backFront={<JuneHand />}
        over={<>
          <ColorCard x={hd.x} y={hd.y + 8} s={0.9} rot={12} c={BLUE} />
          <g transform={`translate(540 470) scale(${k(u, 2, 10, 0, 1, Easing.out(Easing.back(1.6))) * (1 + tick)}) translate(-540 -470)`}>
            <ClockBubble x={540} y={470} r={150} progress={prog} tail="right" />
          </g></>} />;
      break;
    }
    case "cave": {   // close on Max: he squirms, sweats, explains (bubbles pile up); on "bridge" he dreams of his red bridge
      mood = MOODS.close;
      const SQ = C("squirms", 14), EX = C("starts explaining", 35), BR = C("bridge", 116), RE = C("needs red", 74);
      const squirm = u >= SQ ? Math.sin(u * 0.5) * 4 : 0;
      const flail = Math.sin(u * 0.45);
      const mPose: Pose = u < EX ? FRONT.shrug : sitPose("front", { armL: [95 + flail * 30, -70], armR: [95 - flail * 30, -70] });
      cam = drift(at({ x: H.max.x + 6, y: H.max.y + 70 }, k(u, 0, len, 2.75, 2.9)), f, 1.2);
      body = <Room f={f} max={{ pose: mPose, expr: "worried", rot: squirm }} june={{ pose: FRONT.rest, expr: "calm", hide: true }}
        f1={{ pose: SIDE.rest, expr: "smile", hide: true }} f2={{ pose: SIDE.rest, expr: "smile", hide: true }} props={tableProps()}
        over={<>
          {u >= SQ + 4 && <SweatDrop x={H.max.x + 70} y={H.max.y - 40 + ((u - SQ) % 24) * 2} scale={0.9} />}
          {u >= SQ + 16 && <SweatDrop x={H.max.x - 74} y={H.max.y - 20 + ((u - SQ + 9) % 24) * 2} scale={0.75} rot={-10} />}
        </>} />;
      const bub = (t0: number) => (u >= t0 ? k(u, t0, t0 + 5, 0, 1, Easing.out(Easing.back(2))) * (1 - k(u, RE, RE + 5, 0, 1)) : 0);
      const th = k(u, RE + 2, RE + 9, 0, 1, Easing.out(Easing.back(1.5)));
      overlay = <AbsoluteFill><svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {[[EX, 190, 420, -6], [EX + 12, 880, 470, 6], [EX + 24, 170, 690, 4], [EX + 36, 900, 720, -5]].map(([t0, x, y, r], i) => {
          const o = bub(t0);
          return o > 0.01 ? <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${o})`}><SpeechBubble x={0} y={0} w={230} h={130} tail={null}><Squiggles x={0} y={0} w={150} lines={2} /></SpeechBubble></g> : null;
        })}
        <Thought x={540} y={420} w={680} h={300} o={th} to={{ x: 560, y: 620 }}>
          <Bridge x={540} y={420} s={1.35 * th} built={k(u, BR - 6, BR + 10, 0.25, 1)} />
        </Thought>
      </svg></AbsoluteFill>;
      break;
    }
    case "why": {    // "Wait." the frame freezes, cold grade, a spotlight finds the quiet one
      mood = MOODS.freeze;
      const t0 = span.a;
      cam = at({ x: k(u, 0, len, 640, 665), y: k(u, 0, len, 850, 830) }, k(u, 0, len, 1.3, 1.42, Easing.out(Easing.cubic)));
      body = <Room f={t0} lamp={0.6}
        max={{ pose: sitPose("front", { armL: [110, -60], armR: [80, -80] }), expr: "worried", t: t0, blink: false, rot: 3 }}
        june={{ pose: FRONT.rest, expr: "smirk", t: t0, blink: false }}
        f1={{ pose: SIDE.lean, expr: "shock", t: t0, blink: false, hide: true }} f2={{ pose: SIDE.lean, expr: "shock", t: t0, blink: false, hide: true }}
        props={tableProps()} backFront={<JuneHand />}
        over={<SweatDrop x={H.max.x + 70} y={H.max.y - 30} scale={0.9} />} />;
      const sx = 540 + (H.june.x - 540 - cam.x) * cam.zoom, sy = 960 + (H.june.y + 60 - 960 - cam.y) * cam.zoom;
      overlay = <>
        <AbsoluteFill style={{ background: `radial-gradient(260px 330px at ${sx}px ${sy}px, transparent 55%, rgba(5,6,24,${k(u, 2, 10, 0, 0.36)}) 100%)` }} />
      </>;
      break;
    }
    case "study": {  // lab: two negotiators; a three-second silence bar fills between them; then a handshake, BETTER DEALS for both
      mood = MOODS.lab;
      const PA = C("pauses", 49), BD = C("better deals", 133);
      const fill = k(u, PA - 4, Math.min(BD - 2, PA + 86), 0, 1, Easing.linear);
      const shake = k(u, BD - 2, BD + 10, 0, 1, Easing.inOut(Easing.sin));
      const A: Rig = { x: 300, y: 1250, s: 1.4, facing: 1, pose: { armL: [12, -6], armR: [14, -10], legL: [6, 0], legR: [6, 0], lookX: 1 }, t: f };
      const B: Rig = { x: 780, y: 1250, s: 1.4, facing: -1, pose: { armL: [14, -10], armR: [12, -6], legL: [6, 0], legR: [6, 0], lookX: -1 }, t: f + 40 };
      const hs = { x: 540, y: 960 + Math.sin(u * 0.5) * 8 * (shake > 0.9 ? 1 : 0) };
      const restA = handAt(A, "R"), restB = handAt(B, "L");
      const ta = { x: restA.x + (hs.x - 6 - restA.x) * shake, y: restA.y + (hs.y - restA.y) * shake };
      const tb = { x: restB.x + (hs.x + 6 - restB.x) * shake, y: restB.y + (hs.y - restB.y) * shake };
      const pA: Pose = { ...A.pose, armR: shake > 0 ? reach(A, "R", ta.x, ta.y, 1) : A.pose.armR };
      const pB: Pose = { ...B.pose, armL: shake > 0 ? reach(B, "L", tb.x, tb.y, -1) : B.pose.armL };
      const deal = u >= BD;
      cam = drift({ x: 0, y: 0, zoom: 1.0, rot: 0 }, f, 1.0);
      const barO = 1 - k(u, BD - 2, BD + 4, 0, 1);
      body = <Lab>
        <T x={540} y={420} s={64} c={GOLD} o={k(u, PA - 4, PA + 2, 0, 1)}>THREE-SECOND PAUSE</T>
        {barO > 0.01 && !noText && <g opacity={barO * k(u, PA - 4, PA + 2, 0, 1)}><BigBar x={250} y={600} w={580} progress={fill} /></g>}
        <path d="M 120 1252 L 960 1252" stroke={CREAM} strokeWidth={8} strokeLinecap="round" opacity={0.6} />
        <Person x={A.x} y={A.y} scale={A.s} facing={1} look={EXTRAS[1]} pose={pA} expr={deal ? "smile" : u >= PA ? "focused" : "calm"} t={f} blink={blinkOf(f, 5)} />
        <Person x={B.x} y={B.y} scale={B.s} facing={-1} look={EXTRAS[5]} pose={pB} expr={deal ? "smile" : u >= PA ? "focused" : "calm"} t={f + 40} blink={blinkOf(f, 6)} />
        <Check x={300} y={590} s={k(u, BD + 4, BD + 10, 0, 1.1, Easing.out(Easing.back(2)))} />
        <Check x={780} y={590} s={k(u, BD + 8, BD + 14, 0, 1.1, Easing.out(Easing.back(2)))} />
        <T x={540} y={1320} s={72} c={GREEN} o={k(u, BD, BD + 6, 0, 1)}>BETTER DEALS</T>
      </Lab>;
      break;
    }
    case "think": {  // lab: fists up (threat) relax into a thinker's pose; a pause bubble pops into lightbulbs (ideas)
      mood = MOODS.lab;
      const TH = C("isn't a threat", 21), TT = C("thinking time", 64), HU = C("hunting", 155), ID = C("ideas", 176);
      const relax = k(u, TH, TH + 10, 0, 1, Easing.inOut(Easing.sin));
      const P0: Rig = { x: 470, y: 1300, s: 1.55, facing: 1, pose: { armL: [12, -6], armR: [12, -6], legL: [8, 0], legR: [8, 0] }, t: f };
      const chin = { x: P0.x + 6 * P0.s, y: P0.y - 290 * P0.s };
      const guard: Pose = { ...P0.pose, armL: [60, -195], armR: [60, -195] };
      const think: Pose = { ...P0.pose, armL: [26, -120], armR: reach(P0, "R", chin.x + 10, chin.y + 8, 1), headTilt: 6, lookX: 1 };
      const pose: Pose = relax < 1 && relax > 0 ? (relax < 0.5 ? guard : think) : relax >= 1 ? think : guard;
      const bubbleO = k(u, TH + 8, TH + 16, 0, 1, Easing.out(Easing.back(1.5))) * (1 - k(u, HU, HU + 6, 0, 1));
      const bulb = (i: number) => k(u, HU + i * 7, HU + i * 7 + 8, 0, 1, Easing.out(Easing.back(1.6)));
      const lit = (i: number) => k(u, HU + 8 + i * 7, HU + 12 + i * 7, 0, 1) * (u >= ID ? 1 : 1);
      const BUL = [{ x: 200, y: 640 }, { x: 720, y: 560 }, { x: 880, y: 820 }];
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.03, 1.0), rot: 0 }, f, 1.5);
      body = <Lab>
        <T x={540} y={400} s={84} c={GOLD} o={k(u, TT, TT + 6, 0, 1)}>THINKING TIME</T>
        <path d="M 160 1302 L 920 1302" stroke={CREAM} strokeWidth={8} strokeLinecap="round" opacity={0.6} />
        {relax < 0.5 && <>{[-1, 1].map((d) => <path key={d} d={`M ${P0.x + d * 150} ${760} l ${d * 30} -20 M ${P0.x + d * 155} ${800} l ${d * 36} 0`} stroke={RED} strokeWidth={9} strokeLinecap="round" opacity={1 - relax * 2} />)}</>}
        <Person x={P0.x} y={P0.y} scale={P0.s} facing={1} look={EXTRAS[2]} pose={pose} expr={relax < 0.5 ? "determined" : u >= HU ? "smile" : "focused"} t={f} blink={blinkOf(f, 7)} />
        <Thought x={720} y={580} w={300} h={240} o={bubbleO} to={{ x: 590, y: 720 }}><PauseIcon x={720} y={580} s={0.9} /></Thought>
        {BUL.map((b, i) => <g key={i} transform={`translate(${b.x} ${b.y}) scale(${bulb(i)}) translate(${-b.x} ${-b.y})`}><Lightbulb x={b.x} y={b.y} scale={0.8} on={lit(i)} /></g>)}
      </Lab>;
      break;
    }
    case "pie": {    // lab: two people tug a small pizza apart; a bigger pizza outline appears; after a pause the pizza grows for both
      mood = MOODS.lab;
      const FI = C("Fight", 42), OR = C("order a bigger one", 88), PE = C("People told", 137), GR = C("grew", 179);
      const grow = k(u, GR - 2, GR + 14, 0, 1, Easing.out(Easing.back(1.3)));
      const R = 165 + 85 * grow, CY = 680;
      const fight = u >= FI && u < PE;
      const tug = fight ? 18 + Math.sin(u * 0.6) * 8 : k(u, PE, PE + 8, 18, 0) * (u >= PE ? 1 : 0);
      const A: Rig = { x: 240, y: 1240, s: 1.2, facing: 1, pose: { armL: [12, -6], armR: [12, -6], legL: [8, 0], legR: [8, 0], lookX: 1 }, t: f };
      const B: Rig = { x: 840, y: 1240, s: 1.2, facing: -1, pose: { armL: [12, -6], armR: [12, -6], legL: [8, 0], legR: [8, 0], lookX: -1 }, t: f + 30 };
      const ea = { x: 540 - R * 0.66 - tug, y: CY + R * 0.75 }, eb = { x: 540 + R * 0.66 + tug, y: CY + R * 0.75 };
      const grab = u >= FI - 6;
      const pA: Pose = grab ? { ...A.pose, armR: reach(A, "R", ea.x, ea.y, 1), armL: reach(A, "L", ea.x - 10, ea.y + 30, 1), lean: fight ? -6 : 0 } : A.pose;
      const pB: Pose = grab ? { ...B.pose, armL: reach(B, "L", eb.x, eb.y, -1), armR: reach(B, "R", eb.x + 10, eb.y + 30, -1), lean: fight ? -6 : 0 } : B.pose;
      const ghost = k(u, OR, OR + 8, 0, 1) * (1 - k(u, GR, GR + 10, 0, 1));
      const ex: Expr = u >= GR ? "cheer" : u >= PE ? "focused" : fight ? "determined" : "smile";
      cam = drift({ x: 0, y: 0, zoom: 1.0, rot: 0 }, f, 1.0);
      body = <Lab>
        {ghost > 0.01 && <circle cx={540} cy={CY} r={250} fill="none" stroke={GOLD} strokeWidth={8} strokeDasharray="22 16" opacity={ghost} />}
        <Pizza x={540} y={CY} r={R} gap={tug} wob={fight ? Math.sin(u * 0.6) * 3 : 0} />
        {u >= PE && u < GR + 4 && <g opacity={k(u, PE, PE + 5, 0, 1) * (1 - k(u, GR, GR + 4, 0, 1))}><circle cx={540} cy={CY} r={78} fill={LAB.bg} stroke={INK} strokeWidth={7} opacity={0.9} /><PauseIcon x={540} y={CY} s={0.85} /></g>}
        <path d="M 60 1242 L 1020 1242" stroke={CREAM} strokeWidth={8} strokeLinecap="round" opacity={0.6} />
        <Person x={A.x} y={A.y} scale={A.s} facing={1} look={EXTRAS[0]} pose={pA} expr={ex} t={f} blink={blinkOf(f, 8)} />
        <Person x={B.x} y={B.y} scale={B.s} facing={-1} look={EXTRAS[3]} pose={pB} expr={ex} t={f + 30} blink={blinkOf(f, 9)} />
        <T x={540} y={395} s={76} c={GOLD} o={k(u, GR, GR + 6, 0, 1)}>BIGGER PIE</T>
        <T x={540} y={1320} s={70} c={GREEN} o={k(u, GR + 8, GR + 14, 0, 1)}>FOR BOTH SIDES</T>
      </Lab>;
      break;
    }
    case "fill": {   // lab: the awkward meter climbs through four seconds of quiet; a speech bubble rushes in and it drops
      mood = MOODS.lab;
      const EV = C("Even four seconds", 50), UN = C("uneasy", 137), FL = C("fill it", 173);
      const rush = k(u, FL - 10, FL + 2, 0, 1, Easing.out(Easing.cubic));
      const val = k(u, EV - 4, Math.min(FL - 12, EV + 116), 0.05, 0.92, Easing.inOut(Easing.quad)) - k(u, FL, FL + 12, 0, 0.75);
      const P: Rig = { x: 360, y: 1320, s: 1.25, facing: 1, pose: { armL: [14, -10], armR: [14, -10], legL: [7, 0], legR: [7, 0], lookX: 1 }, t: f };
      const uneasy = u >= UN && u < FL;
      const fid = uneasy ? Math.sin(u * 0.6) * 3 : 0;
      const head = { x: P.x + 5, y: P.y - 350 * P.s };
      const mouth = { x: P.x + 40, y: P.y - 300 * P.s };
      const bx = interpolate(rush, [0, 1], [1300, 770]);
      cam = drift({ x: 0, y: 0, zoom: 1.0, rot: 0 }, f, 1.5);
      body = <Lab>
        <AwkwardMeter x={540} y={630} value={val} scale={1.1} label={noText ? undefined : "AWKWARD METER"} />
        <path d="M 120 1322 L 960 1322" stroke={CREAM} strokeWidth={8} strokeLinecap="round" opacity={0.6} />
        <Person x={P.x} y={P.y} scale={P.s} facing={1} look={EXTRAS[4]} pose={uneasy ? { ...P.pose, armL: [30, -120], armR: [30, -120] } : P.pose} rot={fid}
          expr={u >= FL ? "laugh" : uneasy ? "worried" : u >= EV + 30 ? "neutral" : "calm"} t={f} blink={blinkOf(f, 10)} />
        {uneasy && <SweatDrop x={head.x + 85} y={head.y - 30 + ((u - UN) % 20) * 2} scale={1.0} />}
        {rush > 0.01 && <SpeechBubble x={bx} y={1010} w={380} h={190} tail={rush > 0.9 ? [mouth.x + 40, mouth.y] : null}><Squiggles x={bx} y={1010} w={270} lines={3} s={0.9} /></SpeechBubble>}
        {rush > 0.01 && rush < 0.95 && [0, 1, 2].map((i) => <path key={i} d={`M ${bx + 210 + i * 10} ${950 + i * 50} L ${bx + 330 + i * 30} ${950 + i * 50}`} stroke={CREAM} strokeWidth={8} strokeLinecap="round" opacity={0.7} />)}
      </Lab>;
      break;
    }
    case "win": {    // June finds a trade that helps both: a lightbulb over her, red and blue cards swap, both smile, checks pop
      const FD = C("finds", 10), TR = C("trade", 35), HB = C("helps them both", 56);
      const sw = k(u, TR + 2, TR + 16, 0, 1, Easing.inOut(Easing.cubic));
      const mRig = rigOf("max", FRONT.rest, f + 13), jRig = rigOf("june", FRONT.rest, f + 26);
      const mid = { x: 540, y: 880 };
      const outM = k(u, TR - 6, TR + 2, 0, 1), outJ = outM;
      const mT = { x: interpolate(outM, [0, 1], [H.max.x + 70, mid.x - 30]), y: interpolate(outM, [0, 1], [L.cut - 20, mid.y]) };
      const jT = { x: interpolate(outJ, [0, 1], [H.june.x - 70, mid.x + 30]), y: interpolate(outJ, [0, 1], [L.cut - 20, mid.y]) };
      const mPose: Pose = u >= HB + 8 ? sitPose("front", { armL: [140, -30], armR: [140, -30] }) : { ...FRONT.rest, armR: reach(mRig, "R", mT.x, mT.y, 1) };
      const jPose: Pose = { ...FRONT.rest, armL: reach(jRig, "L", jT.x, jT.y, -1) };
      const hm = handAt({ ...mRig, pose: mPose }, "R"), hj = handAt({ ...jRig, pose: jPose }, "L");
      const arc = (a: Pt, b: Pt, t: number) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - Math.sin(t * Math.PI) * 110 });
      const blueAt = sw <= 0 ? hm : arc(hm, hj, sw), redAt = sw <= 0 ? hj : arc(hj, hm, sw);
      const done = u >= HB;
      cam = drift(at({ x: 540, y: 905 }, k(u, 0, len, 1.6, 1.7)), f, 1.5);
      body = <Room f={f}
        max={{ pose: mPose, expr: done ? "cheer" : u >= TR ? "smile" : "worried", t: f + 13 }}
        june={{ pose: jPose, expr: done ? "smile" : u >= FD ? "focused" : "calm", t: f + 26 }}
        f1={{ pose: SIDE.rest, expr: "smile", hide: true }} f2={{ pose: SIDE.rest, expr: "smile", hide: true }} props={tableProps()}
        backFront={<JuneHand n={4} />}
        over={<>
          {!(u >= HB + 8) && <ColorCard x={blueAt.x} y={blueAt.y + 8} s={1.15} rot={sw * 24 - 12} c={BLUE} />}
          {u >= HB + 8 && <ColorCard x={hm.x} y={hm.y + 8} s={1.15} rot={-10} c={REDC} />}
          <ColorCard x={redAt.x} y={redAt.y + 8} s={1.15} rot={-12 + sw * 24} c={sw >= 1 && u < HB + 8 ? REDC : sw >= 1 ? BLUE : REDC} />
          <g opacity={1 - k(u, TR + 4, TR + 10, 0, 1)}><Lightbulb x={H.june.x + 120} y={H.june.y - 150} scale={k(u, FD, FD + 6, 0, 0.7, Easing.out(Easing.back(2)))} on={k(u, FD + 4, FD + 8, 0, 1)} /></g>
          <Check x={H.max.x - 110} y={H.max.y - 140} s={k(u, HB + 2, HB + 8, 0, 0.9, Easing.out(Easing.back(2)))} />
          <Check x={H.june.x + 110} y={H.june.y - 140} s={k(u, HB + 6, HB + 12, 0, 0.9, Easing.out(Easing.back(2)))} />
        </>} />;
      break;
    }
    case "twist": {  // next round: dice roll; Max tries silence (arms folded, the clock fills one third) and blurts: shoves the snacks to June
      const NR = C("Next round", 3), TS = C("tries silence", 38), OS = C("one second", 78), FN = C("Fine", 116);
      const dice = u < TS - 2, blurt = u >= FN;
      if (dice) {
        mood = MOODS.close;
        const r = k(u, NR, NR + 22, 0, 1, Easing.out(Easing.cubic));
        const d1 = { x: interpolate(r, [0, 1], [330, 500]), y: TP(0.5, 0.55).y - Math.abs(Math.sin(r * Math.PI * 3)) * 70 * (1 - r) };
        const d2 = { x: interpolate(r, [0, 1], [360, 590]), y: TP(0.5, 0.62).y - Math.abs(Math.sin(r * Math.PI * 3 + 1)) * 60 * (1 - r) };
        cam = drift(at({ x: 540, y: 935 }, k(u, 0, TS, 2.0, 2.1)), f, 1.2);
        body = <Room f={f} max={{ pose: sitPose("front", { armL: [100, -60], armR: [110, -60] }), expr: "cheer" }} june={{ pose: FRONT.rest, expr: "calm" }}
          f1={{ pose: SIDE.rest, expr: "smile", hide: true }} f2={{ pose: SIDE.rest, expr: "smile", hide: true }}
          props={tableProps({ dice: null })}
          backFront={<>
            <Dice x={d1.x} y={d1.y} value={r < 1 ? 1 + (Math.floor(u / 2) % 6) : 6} rot={(1 - r) * 280} scale={0.8} />
            <Dice x={d2.x} y={d2.y} value={r < 1 ? 1 + (Math.floor(u / 2 + 3) % 6) : 6} rot={(1 - r) * -220} scale={0.8} />
            {hands("june")}</>} />;
      } else if (!blurt) {
        mood = MOODS.tense;
        const prog = k(u, TS, OS + 12, 0, 1 / 3, Easing.linear);
        const strain = k(u, TS, FN, 0, 1);
        cam = drift(at({ x: H.max.x + 6, y: H.max.y + 80 }, k(u, TS, FN, 2.6, 2.85)), f, 1);
        body = <Room f={f} max={{ pose: FRONT.cross, expr: strain > 0.6 ? "worried" : "neutral", rot: strain > 0.6 ? Math.sin(u * 0.9) * 2 * strain : 0 }}
          june={{ pose: FRONT.rest, expr: "calm", hide: true }} f1={{ pose: SIDE.rest, expr: "smile", hide: true }} f2={{ pose: SIDE.rest, expr: "smile", hide: true }}
          props={tableProps()}
          over={<>{strain > 0.55 && <SweatDrop x={H.max.x + 72} y={H.max.y - 40 + ((u % 22) * 1.8)} scale={0.85} />}
            <ClockBubble x={H.max.x + 100} y={H.max.y - 170} r={62} progress={prog} tail="left" /></>} />;
      } else {
        // "Fine, take the snacks too!": hard cut to the two-shot, he shoves the bowl over to June
        const sh = k(u, FN + 4, FN + 22, 0, 1, Easing.out(Easing.cubic));
        const bowl = { x: interpolate(sh, [0, 1], [TP(0.3, 0.22).x, TP(0.66, 0.22).x]), y: TP(0.5, 0.22).y };
        cam = kickCam(drift(at({ x: 540, y: 900 }, k(u, FN, len, 1.75, 1.8)), f, 1.5), u - FN, 14);
        body = <Room f={f} max={{ pose: sitPose("front", { armL: [150, -20], armR: [10, 0] }), expr: "shock", rot: -3 }}
          june={{ pose: FRONT.rest, expr: u >= FN + 22 ? "smirk" : "calm" }}
          f1={{ pose: SIDE.rest, expr: "smile", hide: true }} f2={{ pose: SIDE.rest, expr: "smile", hide: true }}
          props={tableProps({ snack: null })}
          backFront={<>
            <Snacks x={bowl.x} y={bowl.y} scale={0.62} />
            <TableArm who="max" side={1} to={{ x: bowl.x - 60, y: bowl.y - 30 }} look={MAX} />
            {sh > 0.1 && sh < 0.95 && [0, 1].map((i) => <path key={i} d={`M ${bowl.x - 120 - i * 20} ${bowl.y - 60 + i * 26} L ${bowl.x - 190 - i * 20} ${bowl.y - 60 + i * 26}`} stroke="#fff4d6" strokeWidth={7} strokeLinecap="round" />)}
            {hands("june")}</>}
          over={<Shout x={H.max.x + 40} y={H.max.y - 225} r={92} o={k(u, FN, FN + 5, 0, 1)} rot={-5} fill="#ffe0d6" />} />;
        overlay = <Flash framesSince={u - FN} len={3} />;
      }
      break;
    }
    default: {       // ask: pull out wide over game night - everyone laughing, June calm with the snack bowl
      const pull = k(u, 0, len, 0, 1, Easing.inOut(Easing.cubic));
      cam = { x: 0, y: interpolate(pull, [0, 1], [70, 0]), zoom: interpolate(pull, [0, 1], [1.06, 0.97]), rot: interpolate(pull, [0, 1], [-1, 0]) };
      body = <Room f={f}
        max={{ pose: sitPose("front", { armL: [120, -60], armR: [120, -60] }), expr: "laugh" }}
        june={{ pose: FRONT.rest, expr: "smile" }}
        f1={{ pose: { ...SIDE.rest, lean: -5 }, expr: "laugh" }} f2={{ pose: SIDE.hold, expr: "laugh" }}
        props={tableProps({ snack: TP(0.7, 0.22) })} backFront={<>{hands("june")}</>} />;
    }
  }

  const lab = mood === MOODS.lab;
  return (
    <AbsoluteFill>
      <Stage cam={cam} bg={lab ? LAB.bg : GAME.wainscot2}>{body}</Stage>
      {!lab && <Pool x={540} y={820} rx={640} ry={720} color="#ffe2a8" opacity={0.22} />}
      <Grade mood={mood} />
      {overlay}
    </AbsoluteFill>
  );
};

const PLACE: Record<string, string> = Object.fromEntries(scenes.shots.map((s) => [s.id, s.place]));
const XF = 5;

const Scene: React.FC<SceneProps> = ({ spans, words }) => {
  const f = useCurrentFrame();
  const span = shotAt(spans, f);
  const prev = span.i > 0 ? spans[span.i - 1] : null;
  const u = f - span.a;
  const fade = prev && u < XF && (PLACE[prev.id] ?? "table") !== (PLACE[span.id] ?? "table");
  return (
    <Words.Provider value={words}><AbsoluteFill>
      <NoText.Provider value={!!fade}><ShotView span={span} /></NoText.Provider>
      {fade && prev && <NoText.Provider value><AbsoluteFill style={{ opacity: 1 - (u + 1) / (XF + 1) }}><ShotView span={prev} /></AbsoluteFill></NoText.Provider>}
    </AbsoluteFill></Words.Provider>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "silent",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: GAME.wainscot2,
};
export default story;
