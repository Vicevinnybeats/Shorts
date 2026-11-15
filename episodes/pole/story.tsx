// "Stop Looking at the Pole" - 2.5D. Mila learns to ride a bike in a sunny, empty town square and rides straight
// into its only lamp post. Facts (see RESEARCH.md): steering follows gaze - in a driving simulator, people told to
// look off to one side drifted that way while trying to drive straight; drivers' eyes reach each bend a second or two
// before the car; motorcycle trainers call the pull "target fixation". Rule: look at the gap, not the pole.
// Square layout (side view with fake depth): back row y 1240 (fountain, bench), pole row y 1330, riding lane y 1400
// (kept above the caption band in wide shots). The gap = the strip between the pole (front) and the bench (behind).
// Every explanation shot is its own picture; on-screen text stays between y 300 and y 1350 inside 60 px margins.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, ShotSpan, cueTime, FPS } from "../../src/engine/timeline";
import type { Word } from "../../src/captions/Captions";
import { Stage, Layer, Svg, Cam, drift, kickCam } from "../../src/engine25/stage";
import { Grade, Mood, Pool, Flash, SpeedLines } from "../../src/engine25/light";
import { Person, Look, INK, Expr, Pose, POSES, runPose } from "../../library/characters25/person";
import { CAST } from "../../library/style/channel";
import { Lab, T as LabT, LAB } from "../../library/environments25/lab";
import { SQUARE, SquareBackdrop, Paving, LampPost, bonkWobble, Bench, Fountain, Pigeon, Bicycle, BikeProps, bikePoints, rideOn,
  reachLimb, facepalmPose, FacepalmHand, Helmet, FlatCap, Beard, GazeLine, EyeCloseUp, SteeringWheel, TopRoad, topRoadPoint,
  PerspectiveRoad, perspectiveTangent, GazeCone, PathLine, BonkStars, KID_SCALE } from "../../library/environments25/square";
import scenes from "../../content/scripts/pole.json";

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
  sun: { grade: "#ffd27a", gradeOp: 0.05, vignette: 0.3, glow: "#fff4d0" },        // bright afternoon
  close: { grade: "#ffb060", gradeOp: 0.07, vignette: 0.46, glow: "#fff1c9" },
  tense: { grade: "#2c3f7a", gradeOp: 0.12, vignette: 0.6, glow: "#fff1c9" },      // the pull toward the pole
  freeze: { grade: "#1b2a6b", gradeOp: 0.5, vignette: 0.75 },                      // "Wait. Why?" - cold freeze-frame
  lab: { grade: "#0b1430", gradeOp: 0.04, vignette: 0.45 },
};

const ease = Easing.bezier(0.33, 0, 0.2, 1);
const k = (u: number, a: number, b: number, from: number, to: number, e = ease) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const rad = (d: number) => (d * Math.PI) / 180;
type Pt = { x: number; y: number };

// ---------------------------------------------------------------- cast + set geometry
const MILA: Look = CAST.mila, GRANDPA: Look = CAST.grandpa;
const { gold: GOLD, red: RED, green: GREEN, muted: MUTED, text: CREAM, orange: ORANGE } = LAB;

const GROUND = 1150;                              // backdrop ground line (house bases); paving below it
const BACK = 1240, PY = 1330, LANE = 1400, RY = 1285;   // back row, pole row, riding lane, the gap row (between pole and bench)
const PX = 960, PSC = 0.9;                        // the lamp post
const BS = 1;                                     // bike scale (kid bike; Mila drawn at KID_SCALE, Grandpa at GS)
const GS = 1.05;                                  // Grandpa
const BENCH = { x: 1085, y: BACK, s: 0.72 }, FOUNT = { x: 240, y: 1215, s: 0.6 };
const POLE_HIT = PX - 14 * PSC - (130 + 72) * KID_SCALE * BS;   // bike x where the front tyre touches the pole
const LANTERN = { x: PX, y: PY - 690 * PSC };
const POLE_MID = { x: PX, y: PY - 330 * PSC };

/** wheel angle (deg) for a kid bike that has rolled to x */
const wheelAt = (x: number, s = BS) => ((x / (72 * KID_SCALE * s)) * 180) / Math.PI;

/** world point of a spot on a Person's head (PersonPart head frame: chin origin, eye line y -56) */
type Body = { x: number; y: number; scale?: number; facing?: 1 | -1; pose: Pose; rot?: number };
const headPt = (p: Body, hx: number, hy: number): Pt => {
  const s = p.scale ?? 1, f = p.facing ?? 1, pose = p.pose;
  const crouch = (pose.crouch ?? 0) * 140, hipY = -150 + crouch, shY = -285 + crouch * 0.9;
  const t = rad((pose.headTilt ?? 0) * f);
  let x = hx, y = hy;
  [x, y] = [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)];
  x += f * 4; y += shY - 6;
  const A = rad((pose.lean ?? 0) * f + (p.rot ?? 0)), yy = y - hipY;
  [x, y] = [x * Math.cos(A) - yy * Math.sin(A), hipY + x * Math.sin(A) + yy * Math.cos(A)];
  return { x: p.x + x * s, y: p.y + y * s };
};
const eyeOf = (p: Body) => headPt(p, (p.facing ?? 1) * 18, -56);

// ---------------------------------------------------------------- riders
type RiderSpec = { bike: BikeProps; who: "mila" | "grandpa"; expr: Expr; f: number; riderScale?: number; lookX?: number; tilt?: number };
const riderOf = (r: RiderSpec) => {
  const ride = rideOn(r.bike, { riderScale: r.riderScale, lookX: r.lookX });
  const rider = { ...ride.rider, pose: { ...ride.rider.pose, headTilt: r.tilt ?? 0 } };
  return rider;
};
const Rider: React.FC<RiderSpec> = (r) => {
  const rider = riderOf(r);
  const look = r.who === "mila" ? MILA : GRANDPA;
  return (
    <g>
      <Bicycle {...r.bike} />
      <Person {...rider} look={look} expr={r.expr} blink={(r.f + (r.who === "mila" ? 0 : 37)) % 101 < 4} />
      {r.who === "mila" ? <Helmet {...rider} hair={MILA.hair} /> : <><Beard {...rider} expr={r.expr} /><FlatCap {...rider} /></>}
    </g>
  );
};
/** Grandpa on foot (any pose), with beard + cap */
const Gramps: React.FC<{ x: number; y: number; pose: Pose; expr: Expr; f: number; facing?: 1 | -1; s?: number; t?: number; palm?: 1 | -1 }> = ({ x, y, pose, expr, f, facing = 1, s = GS, t, palm }) => {
  const p = { x, y, scale: s, facing, pose };
  return <g><Person {...p} look={GRANDPA} expr={expr} t={t} blink={(f + 37) % 101 < 4} /><Beard {...p} expr={expr} /><FlatCap {...p} />
    {palm && <FacepalmHand {...p} skin={GRANDPA.skin} side={palm} />}</g>;
};
/** Mila on foot */
const MilaFoot: React.FC<{ x: number; y: number; pose: Pose; expr: Expr; f: number; facing?: 1 | -1; s?: number; t?: number }> = ({ x, y, pose, expr, f, facing = 1, s = KID_SCALE * BS, t }) => {
  const p = { x, y, scale: s, facing, pose };
  return <g><Person {...p} look={MILA} expr={expr} t={t} blink={f % 101 < 4} /><Helmet {...p} hair={MILA.hair} /></g>;
};

/** jogging alongside a bike, near hand on the back of the saddle */
const holdSaddle = (bike: BikeProps, x: number, y: number, s: number, ph: number, amt = 1): Pose => {
  const base = runPose(ph, amt);
  const pose: Pose = { ...base, crouch: Math.min(0.12, base.crouch ?? 0) };
  const r = reachLimb({ x, y, scale: s, facing: 1, pose }, "armR", bikePoints(bike).saddleBack, -1, true);
  // the whole rig rotates with the lean: swing the legs forward by the same amount so they stay under him
  const L = (r.lean ?? 0) * 0.85;
  return { ...r, legL: [r.legL[0] + L, r.legL[1]], legR: [r.legR[0] + L, r.legR[1]] };
};

// ---------------------------------------------------------------- pigeons
const BIRDS = [
  { x: 1010, y: 1372, f: 1 as const }, { x: 1065, y: 1394, f: -1 as const }, { x: 1135, y: 1366, f: -1 as const },
  { x: 892, y: 1390, f: 1 as const }, { x: 1180, y: 1398, f: 1 as const },
];
/** pigeons pecking, or scattering since `since` frames (each flies off on its own line) */
const Pigeons: React.FC<{ f: number; since?: number; circle?: boolean }> = ({ f, since = -1, circle = false }) => (
  <g>
    {BIRDS.map((b, i) => {
      if (circle) {                                              // after the bonk: a few circle above the square
        const a = f * 0.05 + i * 1.3, x = 760 + Math.cos(a) * (240 + i * 30), y = 560 + Math.sin(a) * 70 + i * 26;
        return <Pigeon key={i} x={x} y={y} scale={0.62} f={f + i * 5} flying facing={Math.sin(a) > 0 ? -1 : 1} seed={i} />;
      }
      const t = since - i * 1.5;
      if (t <= 0) return <Pigeon key={i} x={b.x} y={b.y} scale={0.75} f={f + i * 9} facing={b.f} seed={i} />;
      const dir = i % 2 ? 1 : -1, vx = dir * (9 + i * 2.2), x = b.x + vx * t, y = b.y - 40 - t * (14 + i * 2) + t * t * 0.05;
      return <Pigeon key={i} x={x} y={y} scale={0.75} f={f * 1.6 + i * 3} flying facing={dir > 0 ? 1 : -1} seed={i} />;
    })}
  </g>
);

// ---------------------------------------------------------------- the square
type Item = { y: number; el: React.ReactNode };
/** backdrop (p 0.6) + paving, fountain, bench and the lamp post; `items` are depth-sorted with them by ground y */
const Square: React.FC<{ f: number; items?: Item[]; wobble?: number; front?: React.ReactNode; over?: React.ReactNode; birds?: React.ReactNode }> = ({ f, items = [], wobble = 0, front, over, birds }) => {
  const all: Item[] = [
    { y: FOUNT.y, el: <Fountain x={FOUNT.x} y={FOUNT.y} scale={FOUNT.s} f={f} /> },
    { y: BENCH.y, el: <Bench x={BENCH.x} y={BENCH.y} scale={BENCH.s} /> },
    { y: PY, el: <LampPost x={PX} y={PY} scale={PSC} wobble={wobble} /> },
    ...items,
  ].sort((a, b) => a.y - b.y);
  return (
    <>
      <Layer p={0.6}><Svg>
        <rect x={-600} y={GROUND - 20} width={2300} height={1400} fill={SQUARE.curb} />
        <SquareBackdrop y={GROUND - 1300} h={1300} fountain={false} />
      </Svg></Layer>
      <Layer p={1}><Svg>
        <rect x={-700} y={GROUND} width={2500} height={1400} fill={SQUARE.mortar} />
        <Paving y={GROUND} h={900} />
        {all.map((it, i) => <React.Fragment key={i}>{it.el}</React.Fragment>)}
        {birds ?? <Pigeons f={f} />}
        {over}
      </Svg></Layer>
      {front && <Layer p={1.3}><Svg>{front}</Svg></Layer>}
    </>
  );
};

// ---------------------------------------------------------------- the ride (one continuous path learn -> bonk)
/** Mila's bike for the first ride at frame f, given the spans (learn .. drift); y drifts to the pole row in "drift" */
const rideAt = (spans: ShotSpan[], f: number) => {
  const sp = (id: string) => spans.find((s) => s.id === id)!;
  const L = sp("learn"), G = sp("letgo"), S = sp("spot"), D = sp("drift");
  const x = interpolate(f, [L.a, G.a, S.a, D.a, D.b], [60, 270, 470, 590, POLE_HIT], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pull = k(f, D.a, D.b, 0, 1, Easing.in(Easing.quad));
  const y = LANE - (LANE - PY) * pull;
  return { x, y, pull };
};

/** a ground tyre track from x0 to the bike, along the same curve */
const Track: React.FC<{ pts: Pt[]; o?: number }> = ({ pts, o = 0.95 }) => pts.length < 2 ? null : (
  <g opacity={o}><PathLine points={pts} color="#fff4de" dashed width={7} arrow={false} /></g>
);

// ---------------------------------------------------------------- lab props (local)
/** EyeCloseUp on a skin-coloured disc (its ink lines need a light ground on the navy lab) */
const LabEye: React.FC<React.ComponentProps<typeof EyeCloseUp>> = (p) => (
  <g>
    <ellipse cx={p.x} cy={p.y - 70 * p.s} rx={380 * p.s} ry={340 * p.s} fill={p.skin ?? MILA.skin} stroke={INK} strokeWidth={Math.max(4, 14 * p.s)} />
    <EyeCloseUp {...p} />
  </g>
);
/** top-view car, nose up, rotated by `rot` deg */
const TopCar: React.FC<{ x: number; y: number; rot?: number; s?: number; color?: string }> = ({ x, y, rot = 0, s = 1, color = ORANGE }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {[[-44, -46], [44, -46], [-44, 46], [44, 46]].map(([wx, wy], i) => <rect key={i} x={wx - 10} y={wy - 18} width={20} height={36} rx={6} fill={INK} />)}
    <rect x={-40} y={-80} width={80} height={160} rx={28} fill={color} stroke={INK} strokeWidth={7} />
    <path d="M -30 -38 Q 0 -52 30 -38 L 26 -14 L -26 -14 Z" fill="#cfe9f5" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -28 44 L 28 44 L 24 60 L -24 60 Z" fill="#cfe9f5" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-24} y={-8} width={48} height={46} rx={10} fill={color} stroke={INK} strokeWidth={4} opacity={0.9} />
    <circle cx={-24} cy={-76} r={6} fill="#fff4b0" /><circle cx={24} cy={-76} r={6} fill="#fff4b0" />
  </g>
);
/** top view of the lamp post (round base + lantern cap) and of the bench (slats) */
const PoleTop: React.FC<{ x: number; y: number; s?: number; glow?: string }> = ({ x, y, s = 1, glow }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow && <circle r={92} fill={glow} opacity={0.25} />}
    <circle r={56} fill={SQUARE.iron} stroke={INK} strokeWidth={8} />
    <rect x={-34} y={-34} width={68} height={68} rx={8} fill={SQUARE.glass} stroke={INK} strokeWidth={7} transform="rotate(45)" />
    <circle r={12} fill={SQUARE.iron2} stroke={INK} strokeWidth={5} />
  </g>
);
const BenchTop: React.FC<{ x: number; y: number; w: number; h?: number }> = ({ x, y, w, h = 96 }) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={12} fill={SQUARE.bench} stroke={INK} strokeWidth={7} />
    {[1, 2, 3].map((i) => <path key={i} d={`M ${x - w / 2 + 12} ${y - h / 2 + (h / 4) * i} L ${x + w / 2 - 12} ${y - h / 2 + (h / 4) * i}`} stroke={SQUARE.bench2} strokeWidth={5} />)}
  </g>
);
/** crash burst (no text) */
const Burst: React.FC<{ x: number; y: number; s?: number; o?: number; color?: string }> = ({ x, y, s = 1, o = 1, color = RED }) => {
  const d = Array.from({ length: 16 }, (_, j) => { const r = j % 2 ? 26 : 58, a = (j / 16) * Math.PI * 2; return `${j ? "L" : "M"} ${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`; }).join(" ") + " Z";
  return <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}><path d={d} fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" /></g>;
};
const Clock: React.FC<{ x: number; y: number; r: number; v: number; o?: number }> = ({ x, y, r, v, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <circle r={r} fill="#1a2448" stroke={CREAM} strokeWidth={8} />
    <path d={`M 0 0 L 0 ${-r} A ${r} ${r} 0 ${v > 0.5 ? 1 : 0} 1 ${Math.sin(v * Math.PI * 2) * r} ${-Math.cos(v * Math.PI * 2) * r} Z`} fill={GOLD} opacity={0.75} />
    <path d={`M 0 0 L ${Math.sin(v * Math.PI * 2) * r * 0.8} ${-Math.cos(v * Math.PI * 2) * r * 0.8}`} stroke={INK} strokeWidth={8} strokeLinecap="round" />
    <circle r={7} fill={INK} />
  </g>
);
const Check: React.FC<{ x: number; y: number; s?: number; ok: boolean; o?: number }> = ({ x, y, s = 1, ok, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle r={46} fill={ok ? GREEN : RED} stroke={INK} strokeWidth={7} />
    {ok ? <path d="M -22 2 L -6 18 L 24 -16" stroke="#fff" strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      : <path d="M -18 -18 L 18 18 M 18 -18 L -18 18" stroke="#fff" strokeWidth={11} strokeLinecap="round" />}
  </g>
);

// ---------------------------------------------------------------- shots
const ShotView: React.FC<{ span: ShotSpan; spans: ShotSpan[]; freezeAt?: number }> = ({ span, spans, freezeAt }) => {
  const f0 = useCurrentFrame();
  const f = freezeAt ?? f0;
  const words = React.useContext(Words);
  const u = f - span.a, len = span.b - span.a;
  let cam: Cam = { x: 0, y: 0, zoom: 1, rot: 0 };
  let mood = MOODS.sun;
  let body: React.ReactNode = null;
  let overlay: React.ReactNode = null;
  let bg: string = SQUARE.sky;
  const on = (p: Pt, zoom: number, rot = 0): Cam => ({ x: p.x - 540, y: p.y - 960, zoom, rot });

  switch (span.id) {
    case "hook": {   // wide, empty square; Mila wobbles toward the only pole; slow comedic push-in once "about to hit"
      const HIT = cueAt(words, "She's about to", span, Math.round(len * 0.45));
      const x = interpolate(u, [0, len], [190, 500]);
      const bike: BikeProps = { x, y: PY, scale: BS, facing: 1, size: "kid", wheelAngle: wheelAt(x), lean: Math.sin(u * 0.35) * 2.5 };
      const push = k(u, HIT - 4, len, 0, 1, Easing.inOut(Easing.cubic));
      cam = drift({ x: interpolate(push, [0, 1], [0, 165]), y: interpolate(push, [0, 1], [-10, 120]), zoom: interpolate(push, [0, 1], [1.0, 1.36]), rot: 0 }, f, 2);
      body = <Square f={f} items={[{ y: PY - 0.5, el: <Rider bike={bike} who="mila" expr={u < HIT ? "determined" : "focused"} f={f} lookX={1} /> }]} />;
      break;
    }
    case "learn": {  // tracking medium: Grandpa jogs behind holding the saddle; she wobbles harder on "wobbles"
      const WOB = cueAt(words, "She wobbles", span, Math.round(len * 0.7));
      const r = rideAt(spans, f);
      const amp = 1.5 + k(u, WOB - 4, WOB + 6, 0, 3.5);
      const bike: BikeProps = { x: r.x, y: LANE, scale: BS, facing: 1, size: "kid", wheelAngle: wheelAt(r.x), lean: Math.sin(u * 0.45) * amp };
      const gx = r.x - 215, ph = u * 0.32;
      const gp = holdSaddle(bike, gx, LANE, 1.0, ph, 0.6);
      cam = drift(on({ x: r.x - 60, y: 1150 }, k(u, 0, len, 1.4, 1.48)), f, 2.5);
      body = <Square f={f} items={[{ y: LANE, el: <g>
        <Rider bike={bike} who="mila" expr={u < WOB - 2 ? "determined" : "worried"} f={f} lookX={u < WOB ? 1 : 0.4} tilt={u < WOB ? 0 : Math.sin(u * 0.45) * 6} />
        <Gramps x={gx} y={LANE} pose={gp} expr={u < WOB ? "smile" : "worried"} f={f} s={1.0} />
      </g> }]} />;
      break;
    }
    case "letgo": {  // Grandpa opens his hand on "lets go", slows and throws his arms up; Mila: shock -> cheer on "riding alone"
      const LG = cueAt(words, "lets go", span, Math.round(len * 0.28)), AL = cueAt(words, "riding alone", span, Math.round(len * 0.6));
      const r = rideAt(spans, f);
      const bike: BikeProps = { x: r.x, y: LANE, scale: BS, facing: 1, size: "kid", wheelAngle: wheelAt(r.x), lean: Math.sin(u * 0.45) * (u < LG ? 2.5 : 1.2) };
      const held = u < LG;
      const relX = rideAt(spans, span.a + LG).x - 215;
      const slow = k(u, LG, LG + 18, 0, 1, Easing.out(Easing.quad));
      const gx = held ? r.x - 215 : relX + 50 * slow;
      const gp: Pose = held ? holdSaddle(bike, gx, LANE, 1.0, u * 0.32, 0.6)
        : u < LG + 16 ? { ...runPose(u * 0.3, 0.7 * (1 - slow)), armR: [70 - slow * 30, 10] }
          : { ...POSES.arms_up, headTilt: -4 };
      const mExpr: Expr = u < LG + 4 ? "focused" : u < AL ? "shock" : "cheer";
      cam = drift(on({ x: (gx + r.x) / 2 + 30, y: 1130 }, k(u, 0, len, 1.32, 1.26)), f, 2.5);
      body = <Square f={f} items={[{ y: LANE, el: <g>
        <Gramps x={gx} y={LANE} pose={gp} expr={held ? "smile" : u < AL ? "worried" : "cheer"} f={f} s={1.0} t={u >= LG + 16 ? f : undefined} />
        <Rider bike={bike} who="mila" expr={mExpr} f={f} lookX={1} />
      </g> }]} />;
      overlay = <SpeedLines amount={u >= AL ? 0.08 : 0} angle={0} seed={4} />;
      break;
    }
    case "spot": {   // extreme close-up on her eye: it wanders, then on "sees" it snaps onto the pole (pole in her iris);
      // on "pole" a hard cut to the pole itself with her dotted gaze line locking on
      const SEE = cueAt(words, "sees", span, Math.round(len * 0.4)), POLE = cueAt(words, "the pole", span, Math.round(len * 0.7)) + 2;
      if (u < POLE) {
        mood = MOODS.close;
        const lock = k(u, SEE, SEE + 5, 0, 1, Easing.out(Easing.cubic));
        const lookX = interpolate(lock, [0, 1], [Math.sin(u * 0.18) * 0.45 - 0.15, 0.95]);
        cam = drift({ x: 0, y: 0, zoom: k(u, 0, POLE, 1.0, 1.1) + lock * 0.08, rot: 0 }, f, 1.5);
        bg = MILA.skin;
        body = <Layer p={1}><Svg>
          <rect x={-200} y={-200} width={1480} height={2320} fill={MILA.skin} />
          <path d="M -200 -200 L 1280 -200 L 1280 120 Q 540 330 -200 120 Z" fill={SQUARE.helmet} stroke={INK} strokeWidth={16} />
          <path d="M -200 190 Q 540 380 1280 190" stroke={SQUARE.helmet2} strokeWidth={22} fill="none" />
          <EyeCloseUp x={540} y={980} s={1.4} lookX={lookX} lookY={-0.1 * lock} pupil={1 - 0.4 * lock} brow={lock * 0.9 - 0.2} lid={(f % 97) < 3 && lock < 0.5 ? 0.9 : 0.16 + lock * 0.08}
            skin={MILA.skin} iris="#5a3a22" reflection={lock > 0.5 ? "pole" : undefined} />
        </Svg></Layer>;
      } else {
        const r = rideAt(spans, f);
        const bike: BikeProps = { x: r.x, y: LANE, scale: BS, facing: 1, size: "kid", wheelAngle: wheelAt(r.x), lean: Math.sin(u * 0.45) * 1.2 };
        const rider = riderOf({ bike, who: "mila", expr: "shock", f, lookX: 1 });
        const eye = eyeOf(rider);
        cam = drift(on({ x: 760, y: 1060 }, k(u, POLE, len, 1.4, 1.46)), f, 2);
        body = <Square f={f} items={[{ y: LANE, el: <Rider bike={bike} who="mila" expr="shock" f={f} lookX={1} /> }]}
          over={<GazeLine x1={eye.x} y1={eye.y} x2={POLE_MID.x} y2={POLE_MID.y} progress={k(u, POLE, POLE + 10, 0, 1)} color={RED} />} />;
      }
      break;
    }
    case "drift": {  // the bike curves off its line toward the pole as if magnetised: locked gaze, pull chevrons, tyre track
      mood = MOODS.tense;
      const r = rideAt(spans, f);
      const bike: BikeProps = { x: r.x, y: r.y, scale: BS, facing: 1, size: "kid", wheelAngle: wheelAt(r.x), lean: Math.sin(u * 0.5) * 1.5 - r.pull * 2 };
      const rider = riderOf({ bike, who: "mila", expr: "shock", f, lookX: 1 });
      const eye = eyeOf(rider), bp = bikePoints(bike);
      const pts = Array.from({ length: 12 }, (_, i) => rideAt(spans, span.a - 30 + (u + 30) * (i / 11))).map((p) => ({ x: p.x - 60, y: p.y + 4 }));
      const MAG = cueAt(words, "like a magnet", span, Math.round(len * 0.6));
      cam = drift(on({ x: interpolate(u, [0, len], [740, 860]), y: interpolate(u, [0, len], [1120, 1090]) }, k(u, 0, len, 1.42, 1.72, Easing.in(Easing.quad))), f, 2);
      body = <Square f={f} items={[{ y: r.y, el: <Rider bike={bike} who="mila" expr={u < MAG ? "worried" : "shock"} f={f} lookX={1} /> }]}
        over={<>
          <Track pts={pts} />
          <GazeLine x1={eye.x} y1={eye.y} x2={POLE_MID.x} y2={POLE_MID.y} progress={1} color={RED} />
        </>} />;
      overlay = <SpeedLines amount={k(u, MAG, len, 0, 0.12)} angle={-6} seed={2} />;
      break;
    }
    case "bonk": {   // BONK on the word: kick + flash, the pole wobbles, stars circle, pigeons scatter on "Pigeons"
      mood = MOODS.close;
      const HIT = Math.max(1, cueAt(words, "Bonk", span, 3)), PIG = cueAt(words, "Pigeons", span, 20);
      const h = u - HIT;
      const recoil = h < 0 ? 0 : k(h, 0, 5, 0, -26, Easing.out(Easing.cubic));
      const x = (h < 0 ? POLE_HIT - (HIT - u) * 2.2 : POLE_HIT) + recoil;
      const bike: BikeProps = { x, y: PY, scale: BS, facing: 1, size: "kid", wheelAngle: wheelAt(x), lean: h < 0 ? 0 : -6 * Math.exp(-h / 6) * Math.cos(h * 0.9) };
      const rider = riderOf({ bike, who: "mila", expr: "shock", f, lookX: 1 });
      const head = headPt(rider, 0, -120);
      cam = kickCam(drift(on({ x: 850, y: 1080 }, k(u, 0, len, 1.9, 2.0)), f, 1.5), h, 24);
      body = <Square f={f} wobble={bonkWobble(h, 9)} birds={<Pigeons f={f} since={u - Math.min(PIG - 6, HIT + 8)} />}
        items={[{ y: PY + 0.5, el: <Rider bike={bike} who="mila" expr="shock" f={f} lookX={h < 0 ? 1 : 0} tilt={h < 0 ? 0 : -8} /> }]}
        over={<BonkStars x={head.x} y={head.y - 10} f={h - 2} r={62} />} />;
      overlay = <><Flash framesSince={h} len={4} /><SpeedLines amount={h >= 0 && h < 6 ? 0.3 * (1 - h / 6) : 0} angle={0} seed={7} /></>;
      break;
    }
    case "why": {    // "All that space": wide, Grandpa facepalms in the foreground; "Wait." -> the frame freezes, cool grade, push in
      const W = cueAt(words, "Wait", span, Math.round(len * 0.45)) - 2;
      const frozen = u >= W;
      const fu = frozen ? W : u;                                  // everything below animates on fu (stops at the freeze)
      const ff = span.a + fu;
      const bike: BikeProps = { x: POLE_HIT - 26, y: PY, scale: BS, facing: 1, size: "kid", wheelAngle: wheelAt(POLE_HIT - 26), lean: 0 };
      const rider = riderOf({ bike, who: "mila", expr: "shock", f: ff, lookX: 0 });
      const head = headPt(rider, 0, -120);
      const fp = facepalmPose({ armL: [14, -8], armR: [14, -8], legL: [7, 0], legR: [7, 0] }, "armL");
      mood = frozen ? MOODS.freeze : MOODS.sun;
      cam = frozen ? on({ x: k(u, W, len, 770, 790), y: k(u, W, len, 1140, 1150) }, k(u, W, len, 1.75, 1.95, Easing.out(Easing.cubic)))
        : drift({ x: 0, y: 10, zoom: k(u, 0, W, 1.0, 1.03), rot: 0 }, f, 1.5);
      body = <Square f={ff} birds={<Pigeons f={ff} circle />}
        items={[
          { y: PY + 0.5, el: <Rider bike={bike} who="mila" expr={frozen ? "shock" : "worried"} f={ff} lookX={0} tilt={-6} /> },
          { y: 1380, el: <Gramps x={250} y={1380} pose={fp} expr="worried" f={ff} s={1.12} palm={-1} /> },
        ]}
        over={<BonkStars x={head.x} y={head.y - 10} f={20 + (fu % 30)} r={62} />} />;
      overlay = frozen ? <Flash framesSince={u - W} len={3} /> : null;
      break;
    }
    case "eyes": {   // lab: (a) eye looks left/right -> steering wheel follows; (b) top-view simulator road: the driver looks
      // off to one side and the car drifts that way while it was meant to go straight
      mood = MOODS.lab;
      const B = cueAt(words, "In a driving", span, Math.round(len * 0.27)), LOOK = cueAt(words, "look off", span, Math.round(len * 0.53));
      const DR = cueAt(words, "drifted", span, Math.round(len * 0.7)), ST = cueAt(words, "while trying", span, Math.round(len * 0.8));
      const a = 1 - k(u, B - 6, B, 0, 1), b = k(u, B, B + 6, 0, 1);
      // (a) eye + wheel
      const lx = u < 14 ? 0 : u < B * 0.55 ? k(u, 14, 22, 0, -0.9) : k(u, B * 0.55, B * 0.55 + 8, -0.9, 0.9);
      const lagX = u < 22 ? 0 : u < B * 0.55 + 8 ? k(u, 22, 32, 0, -0.9) : k(u, B * 0.55 + 8, B * 0.55 + 18, -0.9, 0.9);
      // (b) the road
      const road = { x: 540, y: 1360, w: 230, h: 800, curve: 0 };
      const tt = k(u, B, len, 0.08, 0.62, Easing.linear);
      const off = -k(u, DR - 6, len, 0, 150, Easing.inOut(Easing.quad));
      const car = topRoadPoint(road, tt, off), carRot = -k(u, DR - 6, DR + 20, 0, 14) * (1 - k(u, len - 30, len, 0, 0.4));
      const pathPts = Array.from({ length: 10 }, (_, i) => { const s = 0.08 + (tt - 0.08) * (i / 9), uu = B + (u - B) * (i / 9); return topRoadPoint(road, s, -k(uu, DR - 6, len, 0, 150, Easing.inOut(Easing.quad))); });
      const gaze = k(u, LOOK - 2, LOOK + 6, 0, 1);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 1.5);
      body = <Lab>
        <T x={540} y={400} s={74} c={GOLD} o={k(u, 2, 8, 0, 1)}>HANDS FOLLOW EYES</T>
        {a > 0.01 && <g opacity={a}>
          <LabEye x={540} y={780} s={0.5} lookX={lx} lookY={0} skin={MILA.skin} lid={(f % 97) < 3 ? 0.9 : 0.16} />
          <path d={`M ${540 + lx * 60} 850 L ${540 + lagX * 120} 990`} stroke={MUTED} strokeWidth={7} strokeDasharray="4 18" strokeLinecap="round" />
          <SteeringWheel x={540} y={1150} r={150} angle={lagX * 70} />
        </g>}
        {b > 0.01 && <g opacity={b}>
          <TopRoad {...road} />
          <defs><linearGradient id="roadfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={LAB.bg} stopOpacity={1} /><stop offset="1" stopColor={LAB.bg} stopOpacity={0} /></linearGradient></defs>
          <rect x={405} y={530} width={270} height={190} fill="url(#roadfade)" />
          <path d={`M 540 ${car.y - 60} L 540 600`} stroke={CREAM} strokeWidth={8} strokeDasharray="6 22" strokeLinecap="round" opacity={0.5 + 0.5 * k(u, ST, ST + 6, 0, 1) * (0.6 + 0.4 * Math.sin(u * 0.4))} />
          <PathLine points={pathPts} color={RED} width={9} arrow={false} progress={u > DR ? 1 : 0} />
          {gaze > 0 && <GazeCone x={car.x} y={car.y - 20} angle={-62 + carRot} len={360 * gaze} spread={18} />}
          <TopCar x={car.x} y={car.y} rot={carRot} s={0.9} />
          <g transform="translate(880 1180)">
            <rect x={-118} y={-118} width={236} height={236} rx={30} fill="#1a2448" stroke={CREAM} strokeWidth={6} />
            <SteeringWheel x={0} y={0} r={80} angle={-k(u, DR - 10, DR + 6, 0, 40)} />
          </g>
        </g>}
      </Lab>;
      break;
    }
    case "drivers": { // lab, driver's-eye view of a twisty road: the gaze dot jumps to the bend first, the wheel turns later
      mood = MOODS.lab;
      const EY = cueAt(words, "eyes reach", span, Math.round(len * 0.47)), SEC = cueAt(words, "a second", span, Math.round(len * 0.7));
      const curve = k(u, 0, len, 220, 620, Easing.inOut(Easing.sin));
      const pr = { horizonY: 650, curve, bottomY: 1210, w: 1250 };
      const tp = perspectiveTangent(pr);
      const ahead = { x: 540 + curve * 0.02, y: 900 };
      const g = k(u, EY - 2, EY + 8, 0, 1, Easing.out(Easing.cubic));
      const dot = { x: interpolate(g, [0, 1], [ahead.x, tp.x]), y: interpolate(g, [0, 1], [ahead.y, tp.y]) };
      const turn = k(u, SEC + 6, SEC + 20, 0, 1, Easing.inOut(Easing.cubic));
      const wait = k(u, EY + 8, SEC + 6, 0, 1, Easing.linear);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.04), rot: turn * 2 }, f, 1.5);
      body = <Lab>
        <T x={540} y={400} s={70} c={GOLD} o={k(u, 2, 8, 0, 1)}>EYES LEAD THE WHEEL</T>
        <PerspectiveRoad {...pr} />
        <path d={`M 540 1150 L ${dot.x} ${dot.y}`} stroke={GOLD} strokeWidth={6} strokeDasharray="4 18" strokeLinecap="round" opacity={0.8} />
        <circle cx={dot.x} cy={dot.y} r={28} fill={GOLD} stroke={INK} strokeWidth={7} />
        {g >= 1 && <circle cx={dot.x} cy={dot.y} r={28 + ((u * 2) % 30)} fill="none" stroke={GOLD} strokeWidth={5} opacity={1 - ((u * 2) % 30) / 30} />}
        {g >= 1 && <Clock x={880} y={560} r={52} v={wait} o={k(u, EY + 6, EY + 12, 0, 1) * (1 - k(u, SEC + 20, SEC + 26, 0, 1))} />}
        <path d="M -200 1230 Q 540 1150 1280 1230 L 1280 2100 L -200 2100 Z" fill="#1a2448" stroke={CREAM} strokeWidth={8} />
        <SteeringWheel x={540} y={1300} r={125} angle={turn * 55} />
        {turn > 0.05 && <Check x={820} y={1290} ok s={k(u, SEC + 18, SEC + 24, 0, 1, Easing.out(Easing.back(2)))} />}
      </Lab>;
      break;
    }
    case "magnet": { // lab: target fixation - eyes locked on the danger, the bike's path bends into it like a magnet
      mood = MOODS.lab;
      const ST = cueAt(words, "Stare at", span, Math.round(len * 0.4)), DR = cueAt(words, "drift toward", span, Math.round(len * 0.8));
      const FL = 1290;
      const pole = { x: 860, y: 1130 };
      const path = (s: number): Pt => ({ x: 230 + s * (pole.x - 14 * 0.7 - 172 - 230), y: FL + 20 - (FL + 20 - pole.y) * Math.pow(s, 1.25) });
      const s = k(u, 6, len - 8, 0, 1, Easing.inOut(Easing.sin));
      const p = path(s);
      const bike: BikeProps = { x: p.x, y: p.y, scale: 1.15, facing: 1, size: "kid", wheelAngle: wheelAt(p.x, 1.15), lean: -s * 3 };
      const rider = riderOf({ bike, who: "mila", expr: s > 0.6 ? "shock" : "worried", f, lookX: 1 });
      const eye = eyeOf(rider);
      const lantern = { x: pole.x, y: pole.y - 330 * 0.7 - 60 };
      const fear = k(u, ST, ST + 8, 0, 1);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.06), rot: 0 }, f, 1.5);
      body = <Lab>
        <T x={540} y={400} s={76} c={ORANGE} o={k(u, 2, 8, 0, 1)}>TARGET FIXATION</T>
        <path d={`M 70 ${FL - 230} L 1010 ${FL - 230} L 1070 ${FL + 60} L 10 ${FL + 60} Z`} fill="#1a2448" stroke={MUTED} strokeWidth={5} />
        <path d={`M 230 ${FL + 20} L 1000 ${FL + 20}`} stroke={CREAM} strokeWidth={8} strokeDasharray="6 22" strokeLinecap="round" opacity={0.7} />
        <PathLine points={Array.from({ length: 12 }, (_, i) => path((i / 11) * Math.max(0.02, k(u, DR - 30, DR + 6, 0.05, 1))))} color={RED} dashed width={10} />
        {fear > 0 && <circle cx={pole.x} cy={pole.y - 260} r={160 + Math.sin(u * 0.35) * 14} fill={RED} opacity={0.18 * fear} />}
        <LampPost x={pole.x} y={pole.y} scale={0.7} />
        <Rider bike={bike} who="mila" expr={s > 0.6 ? "shock" : "worried"} f={f} lookX={1} />
        <GazeLine x1={eye.x} y1={eye.y} x2={lantern.x} y2={lantern.y + 60} progress={k(u, 4, 14, 0, 1)} color={GOLD} />
      </Lab>;
      break;
    }
    case "rule": {   // lab, top view: eyes on the gap -> green line through it; eyes on the pole -> red line into it.
      // then "Like a doorway": you watch the opening, not the frame
      mood = MOODS.lab;
      const GAP = cueAt(words, "look at the gap", span, 8), NOT = cueAt(words, "not the pole", span, Math.round(len * 0.27));
      const DOOR = cueAt(words, "Like a doorway", span, Math.round(len * 0.45)), FR = cueAt(words, "not the frame", span, Math.round(len * 0.85));
      const a = 1 - k(u, DOOR - 6, DOOR, 0, 1), b = k(u, DOOR, DOOR + 6, 0, 1);
      const pole = { x: 390, y: 860 }, bench = { x: 770, y: 860 }, gap = { x: 575, y: 860 };
      const gS = { x: 760, y: 1300 }, rS = { x: 300, y: 1300 };
      const gp = k(u, GAP, GAP + 26, 0, 1), rp = k(u, NOT, NOT + 22, 0, 1);
      const eyeIcon = (p: Pt, lx: number, ly: number) => <LabEye x={p.x} y={p.y + 70} s={0.14} lookX={lx} lookY={ly} skin={MILA.skin} />;
      body = <Lab>
        <T x={540} y={400} s={72} c={GREEN} o={k(u, GAP, GAP + 6, 0, 1)}>LOOK AT THE GAP</T>
        <T x={540} y={495} s={72} c={RED} o={k(u, NOT, NOT + 6, 0, 1)}>NOT THE POLE</T>
        {a > 0.01 && <g opacity={a}>
          <BenchTop x={bench.x + 60} y={bench.y} w={250} />
          <PoleTop x={pole.x} y={pole.y} glow={rp > 0 ? RED : undefined} />
          <circle cx={gap.x} cy={gap.y} r={40} fill="none" stroke={GREEN} strokeWidth={6} strokeDasharray="10 10" opacity={0.4 + 0.6 * gp} />
          <PathLine points={[gS, { x: 700, y: 1100 }, gap, { x: 560, y: 640 }]} color={GREEN} progress={gp} width={12} />
          <PathLine points={[rS, { x: 290, y: 1100 }, { x: pole.x - 10, y: pole.y + 70 }]} color={RED} dashed progress={rp} width={12} arrow={false} />
          {rp >= 1 && <Burst x={pole.x - 6} y={pole.y + 40} s={k(u, NOT + 22, NOT + 28, 0.2, 1, Easing.out(Easing.back(2)))} />}
          <g opacity={gp > 0 ? 1 : 0.4}><GazeLine x1={gS.x} y1={gS.y - 20} x2={gap.x} y2={gap.y} progress={gp * 1.2} color={GREEN} gap={34} />{eyeIcon(gS, -0.6, -0.8)}</g>
          <g opacity={rp > 0 ? 1 : 0.4}><GazeLine x1={rS.x} y1={rS.y - 20} x2={pole.x} y2={pole.y} progress={rp * 1.2} color={RED} gap={34} />{eyeIcon(rS, 0.3, -0.9)}</g>
          {gp >= 1 && <Check x={900} y={700} ok s={k(u, GAP + 26, GAP + 32, 0, 1, Easing.out(Easing.back(2)))} />}
        </g>}
        {b > 0.01 && <g opacity={b}>
          {/* a doorway, seen from the room: bright opening, the frame around it */}
          <rect x={360} y={650} width={360} height={620} fill="#fff1c9" opacity={0.9} />
          <rect x={360} y={650} width={360} height={620} fill="none" stroke={INK} strokeWidth={8} />
          <path d={`M 300 1290 L 300 600 L 780 600 L 780 1290 M 360 1290 L 360 650 L 720 650 L 720 1290`} fill="none" stroke={u >= FR ? RED : CREAM} strokeWidth={12} strokeLinejoin="round" opacity={u >= FR ? 0.6 + 0.4 * Math.sin(u * 0.6) : 1} />
          <rect x={300} y={600} width={60} height={690} fill="#2a3a6e" opacity={0.6} /><rect x={720} y={600} width={60} height={690} fill="#2a3a6e" opacity={0.6} /><rect x={300} y={600} width={480} height={50} fill="#2a3a6e" opacity={0.6} />
          <path d="M 120 1300 L 960 1300" stroke={MUTED} strokeWidth={6} />
          <GazeLine x1={180} y1={1180} x2={540} y2={960} progress={k(u, DOOR + 4, DOOR + 16, 0, 1)} color={GREEN} gap={34} />
          {eyeIcon({ x: 160, y: 1140 }, 0.8, -0.6)}
          {u >= FR && <g><path d={`M 900 1000 L 790 940`} stroke={RED} strokeWidth={8} strokeDasharray="4 16" strokeLinecap="round" /><Check x={920} y={1010} ok={false} s={k(u, FR, FR + 6, 0, 0.8, Easing.out(Easing.back(2)))} /></g>}
        </g>}
      </Lab>;
      break;
    }
    case "retry": {  // Mila tries again on the gap row: eyes on the gap (green gaze), she sails between pole and bench
      const EY = cueAt(words, "Eyes on the gap", span, Math.round(len * 0.33)), SA = cueAt(words, "sails through", span, Math.round(len * 0.72));
      const x = interpolate(u, [0, EY, SA - 4, SA + 2, len], [440, 620, 900, 1080, 1120]);
      const bike: BikeProps = { x, y: RY, scale: BS, facing: 1, size: "kid", wheelAngle: wheelAt(x), lean: Math.sin(u * 0.4) * 0.8 };
      const rider = riderOf({ bike, who: "mila", expr: "determined", f, lookX: 1 });
      const eye = eyeOf(rider);
      const gapPt = { x: PX + 110, y: RY - 6 };
      const through = x > PX - 40;
      const gz = through ? 0 : k(u, EY - 2, EY + 10, 0, 1);
      const cheer = u >= SA;
      cam = drift(on({ x: interpolate(x, [440, 1120], [660, 860], { extrapolateRight: "clamp" }), y: 1090 }, k(u, 0, len, 1.4, 1.36)), f, 2);
      body = <Square f={f}
        items={[
          { y: RY, el: <Rider bike={bike} who="mila" expr={cheer ? "cheer" : "determined"} f={f} lookX={1} /> },
        ]}
        over={gz > 0 && <GazeLine x1={eye.x} y1={eye.y} x2={gapPt.x} y2={gapPt.y} progress={gz} color={GREEN} />} />;
      overlay = <SpeedLines amount={u >= SA - 4 && u < SA + 16 ? 0.12 : 0} angle={0} seed={9} />;
      break;
    }
    case "twist": {  // Grandpa on Mila's little bike (knees up), Mila jogs behind; on "stares" push in: his gaze locks on the pole
      mood = MOODS.close;
      const STA = cueAt(words, "He stares", span, Math.round(len * 0.5));
      const x = interpolate(u, [0, len], [250, 640]);
      const pull = k(u, STA, len, 0, 1, Easing.in(Easing.quad));
      const y = LANE - (LANE - 1350) * pull;
      const bike: BikeProps = { x, y, scale: BS, facing: 1, size: "kid", wheelAngle: wheelAt(x), lean: Math.sin(u * 0.55) * 4 };
      const rider = riderOf({ bike, who: "grandpa", expr: "focused", f, riderScale: GS * 0.95, lookX: 1 });
      const eye = eyeOf(rider);
      const ms = KID_SCALE * BS, mx = x - 150;
      const held = u < STA + 4;
      const mp = held ? holdSaddle(bike, mx, y, ms, u * 0.4, 0.8) : { ...runPose(u * 0.4, 0.6), armR: [60, 30] as [number, number] };
      const push = k(u, STA - 2, STA + 14, 0, 1, Easing.inOut(Easing.cubic));
      const need = LANTERN.x - eye.x + 360, zc = Math.min(1.75, 1080 / need);
      cam = drift(on({ x: interpolate(push, [0, 1], [x - 40, (eye.x + LANTERN.x) / 2]), y: interpolate(push, [0, 1], [1150, (eye.y + LANTERN.y) / 2 + 130]) }, interpolate(push, [0, 1], [1.4, zc])), f, 2);
      body = <Square f={f}
        items={[{ y, el: <g>
          <Rider bike={bike} who="grandpa" expr={u < STA ? "smile" : "focused"} f={f} riderScale={GS * 0.95} lookX={1} />
          <MilaFoot x={held ? mx : mx - k(u, STA + 4, STA + 16, 0, 200)} y={y} pose={mp} expr={held ? "smile" : "worried"} f={f} />
        </g> }]}
        over={push > 0 && <GazeLine x1={eye.x} y1={eye.y} x2={LANTERN.x} y2={LANTERN.y + 40} progress={k(u, STA + 4, STA + 16, 0, 1)} color={RED} />} />;
      break;
    }
    default: {       // ask: BONK #2 - then pull out wide over the square: Grandpa at the pole, Mila laughing, pigeons up
      const HIT = 3, h = u - HIT;
      const x = h < 0 ? POLE_HIT - 10 + u * 3 : POLE_HIT;
      const bike: BikeProps = { x, y: PY, scale: BS, facing: 1, size: "kid", wheelAngle: wheelAt(x), lean: h < 0 ? 0 : -5 * Math.exp(-h / 6) * Math.cos(h * 0.9) };
      const rider = riderOf({ bike, who: "grandpa", expr: "shock", f, riderScale: GS * 0.95, lookX: 0 });
      const head = headPt(rider, 0, -120);
      const pull = k(u, 8, len, 0, 1, Easing.inOut(Easing.cubic));
      cam = kickCam({ x: interpolate(pull, [0, 1], [300, 0]), y: interpolate(pull, [0, 1], [90, 20]), zoom: interpolate(pull, [0, 1], [1.9, 1.0]), rot: interpolate(pull, [0, 1], [-1.5, 0]) }, h, 20);
      const lp: Pose = { armL: [40, -110], armR: [40, -110], legL: [8, 0], legR: [8, 0], headTilt: Math.sin(u * 0.5) * 5 };
      body = <Square f={f} wobble={bonkWobble(h, 8)} birds={<Pigeons f={f} since={h + 2} />}
        items={[
          { y: PY + 0.5, el: <Rider bike={bike} who="grandpa" expr="shock" f={f} riderScale={GS * 0.95} lookX={0} tilt={h < 0 ? 0 : -8} /> },
          { y: 1385, el: <MilaFoot x={470} y={1385} pose={lp} expr="laugh" f={f} t={f} s={KID_SCALE * 1.1} /> },
        ]}
        over={<BonkStars x={head.x} y={head.y - 10} f={Math.min(40, h - 2)} r={70} />} />;
      overlay = <Flash framesSince={h} len={4} />;
    }
  }

  const lab = mood === MOODS.lab;
  return (
    <AbsoluteFill>
      <Stage cam={cam} bg={lab ? LAB.bg : bg}>{body}</Stage>
      {!lab && span.id !== "spot" && <Pool x={820} y={420} rx={700} ry={760} color="#fff2c4" opacity={0.28} />}
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
  const fade = prev && u < XF && (PLACE[prev.id] ?? "square") !== (PLACE[span.id] ?? "square");
  return (
    <Words.Provider value={words}><AbsoluteFill>
      <NoText.Provider value={!!fade}><ShotView span={span} spans={spans} /></NoText.Provider>
      {fade && prev && <NoText.Provider value><AbsoluteFill style={{ opacity: 1 - (u + 1) / (XF + 1) }}><ShotView span={prev} spans={spans} freezeAt={prev.b - 1} /></AbsoluteFill></NoText.Provider>}
    </AbsoluteFill></Words.Provider>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "pole",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: SQUARE.sky,
};
export default story;
