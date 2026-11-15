// "Your Toast Isn't Unlucky, Your Table Is" - 2.5D. Omar knocks his toast off a cafe table; it lands butter side down.
// Facts (see RESEARCH.md): Robert Matthews (1995, European Journal of Physics): toast tipping off a table edge picks
// up a spin and only has time for about half a turn before the floor; a table ~3 m tall would allow a full turn;
// a 2001 UK school experiment (~10,000 drops): ~62 % butter down; his fix: swipe it forward so it barely spins.
// Physics on screen: the toast pivots on the edge, then falls with constant spin (rotation linear in time) and
// constant gravity (drop ~ t^2): normal table -> ~180 deg at the floor; 4x the height -> 2x the time -> ~360 deg.
// Every explanation shot is its own picture; on-screen text stays between y 300 and y 1350 inside 60 px margins.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, ShotSpan, cueTime, FPS } from "../../src/engine/timeline";
import type { Word } from "../../src/captions/Captions";
import { Stage, Layer, Svg, Cam, drift, kickCam } from "../../src/engine25/stage";
import { Grade, Mood, Pool, Flash, SpeedLines } from "../../src/engine25/light";
import { Person, Look, INK, Expr, Pose } from "../../library/characters25/person";
import { CAST } from "../../library/style/channel";
import { Lab, T as LabT, LAB } from "../../library/environments25/lab";
import { CAFE, CafeWall, CafeFloor, CafeTable, Chair, sitPose, sitY, sitX, TallCounter, Plate, Toast, Mug, CoffeePot, ButterSplat,
  StormCloud, PaperCard, RotationArrow, Ruler, GiantTable, DropCounter, Apron } from "../../library/environments25/cafe";
import scenes from "../../content/scripts/toast.json";

const SHOTS = scenes.shots.map((s) => ({ id: s.id, cue: s.cue }));

/** inside the outgoing half of a crossfade every on-screen label is dropped, so text never lies over another picture */
const NoText = React.createContext(false);
/** the narration words (real voice or estimate), so a beat inside a shot can sit exactly on a spoken cue */
const Words = React.createContext<Word[]>([]);
/** frame (relative to the shot start) where `phrase` is spoken inside this shot; fallback if not found */
const cueAt = (words: Word[], phrase: string, span: ShotSpan, fallback: number) => {
  try { return Math.round(cueTime(words, phrase, span.a / FPS - 0.3) * FPS) - span.a; } catch { return fallback; }
};
const T: React.FC<React.ComponentProps<typeof LabT>> = (p) => (React.useContext(NoText) ? null : <LabT {...p} />);
/** hides a prop that carries text (counter digits, paper title) while a crossfade is running */
const Gate: React.FC<{ children: React.ReactNode }> = ({ children }) => (React.useContext(NoText) ? null : <>{children}</>);
/** screen-space label on a dark rounded plate (cafe shots), only over static wall; x,y = centre of the first line */
const Badge: React.FC<{ x: number; y: number; lines: string[]; s?: number; c?: string; o?: number }> = ({ x, y, lines, s = 70, c = LAB.gold, o = 1 }) => {
  if (React.useContext(NoText) || o <= 0.01) return null;
  const w = Math.max(...lines.map((l) => l.length)) * s * 0.64 + 70, h = lines.length * s * 1.1 + 40;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }} opacity={o}>
        <rect x={x - w / 2} y={y - s * 0.95 - 16} width={w} height={h} rx={26} fill={LAB.bg} opacity={0.88} stroke={INK} strokeWidth={6} />
        {lines.map((l, i) => <text key={i} x={x} y={y + i * s * 1.1} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={s} fill={c}>{l}</text>)}
      </svg>
    </AbsoluteFill>
  );
};

const MOODS: Record<string, Mood> = {
  cafe: { grade: "#ffd9a0", gradeOp: 0.05, vignette: 0.3, glow: "#fff4d0" },      // bright morning
  close: { grade: "#ffb060", gradeOp: 0.07, vignette: 0.48, glow: "#fff1c9" },
  slow: { grade: "#2c3f7a", gradeOp: 0.14, vignette: 0.62, glow: "#e8f0ff" },     // slow-motion: cooler, darker edges
  gloom: { grade: "#1b2a6b", gradeOp: 0.3, vignette: 0.66 },                     // Murphy's Law storm
  lab: { grade: "#0b1430", gradeOp: 0.04, vignette: 0.45 },
};

const ease = Easing.bezier(0.33, 0, 0.2, 1);
const k = (u: number, a: number, b: number, from: number, to: number, e = ease) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const rad = (d: number) => (d * Math.PI) / 180;

// ---------------------------------------------------------------- cast + set geometry
const OMAR: Look = CAST.omar, LENA: Look = CAST.lena;
const { gold: GOLD, red: RED, green: GREEN, muted: MUTED, text: CREAM } = LAB;

const FLOOR = 1400, OS = 1.5, LS = 1.55;                 // Omar sits (scale 1.5), Lena a touch taller
const CHX = 380, OX = sitX(CHX, OS, 1);                  // side-view chair, Omar faces right toward the table
const TBX = 620, TW = 300, TLEG = 255, TT = FLOOR - TLEG, EX = TBX + TW / 2;   // table top 1145, right edge 770
const TS = 0.85, PS = 0.8;                               // toast + plate scale
const PLATE0 = 590, MUGX = 520, JARX = 672;              // plate (before the nudge), Omar's mug, sugar jar (further back)
const REST = TT - 15 * TS, ON_PLATE = TT - 20 * PS - 15 * TS, LAND = FLOOR - 15 * TS;

// ---------------------------------------------------------------- arms: forward + inverse kinematics on the Person rig
type Rig = { x: number; y: number; s: number; facing: 1 | -1; pose: Pose; t?: number };
const frameOf = (r: Rig) => {
  const br = r.t === undefined || r.pose.profile ? 0 : Math.sin(r.t * 0.11);
  const sway = r.t === undefined || r.pose.profile ? 0 : Math.sin(r.t * 0.07) * 4;
  const crouch = ((r.pose.crouch ?? 0) + br * 0.012) * 140;
  return { sway, shY: -285 + crouch * 0.9, hipY: -150 + crouch, lean: (r.pose.lean ?? 0) * r.facing };
};
const dirOf = (r: Rig, side: "L" | "R") => (r.pose.profile ? r.facing : side === "L" ? -1 : 1);
/** world position of a hand (matches Person, incl. breathing, sway and lean) */
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

// ---------------------------------------------------------------- toast physics
const TIP = 34;
type TS_ = { x: number; y: number; rot: number };
/** pivoting on an edge at (ex, top): rot a, centre c px beyond the edge along the slice */
const tipState = (ex: number, top: number, sc: number, a: number, c: number): TS_ => {
  const h = 15 * sc;
  return { x: ex + c * Math.cos(rad(a)) + h * Math.sin(rad(a)), y: top + c * Math.sin(rad(a)) - h * Math.cos(rad(a)), rot: a };
};
/** free fall after the tip: s = time fraction (0 edge .. 1 floor); drop ~ s^2, spin linear in s */
const fallState = (ex: number, top: number, floor: number, sc: number, s: number, end = 180, vx = 70): TS_ => {
  const o = tipState(ex, top, sc, TIP, 30 * sc), land = floor - 15 * sc;
  return { x: o.x + vx * s, y: o.y + (land - o.y) * s * s, rot: TIP + (end - TIP) * s };
};
/** the cafe toast for one continuous action: slide (sl 0..1 from the plate to the edge), tip (0..1), fall (0..1) */
const cafeToast = (sl: number, tip: number, fall: number, plateX: number): TS_ => {
  if (fall > 0) return fallState(EX, TT, FLOOR, TS, fall);
  if (tip > 0) return tipState(EX, TT, TS, TIP * tip, (4 + 26 * tip) * TS);
  const x = interpolate(sl, [0, 1], [plateX + 10, EX + 4 * TS]);
  const onPlate = x < plateX + 72;
  return { x, y: onPlate ? ON_PLATE : REST, rot: 0 };
};

// ---------------------------------------------------------------- local props
const SugarJar: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -28 0 L -30 -74 L 30 -74 L 28 0 Z" fill={CAFE.glass} fillOpacity={0.7} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -26 -4 L -27 -46 L 27 -46 L 26 -4 Z" fill="#ffffff" />
    <path d="M -32 -74 Q 0 -104 32 -74 Z" fill={CAFE.steel} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 8 -92 L 22 -112" stroke={INK} strokeWidth={9} strokeLinecap="round" />
    <path d="M -18 -40 L -18 -14" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
  </g>
);
const Drip: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 7 }) => <circle cx={x} cy={y} r={r} fill={CAFE.butter} stroke={INK} strokeWidth={3} />;
const Check: React.FC<{ x: number; y: number; s?: number; ok: boolean; o?: number }> = ({ x, y, s = 1, ok, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle r={46} fill={ok ? GREEN : RED} stroke={INK} strokeWidth={7} />
    {ok ? <path d="M -22 2 L -6 18 L 24 -16" stroke="#fff" strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      : <path d="M -18 -18 L 18 18 M 18 -18 L -18 18" stroke="#fff" strokeWidth={11} strokeLinecap="round" />}
  </g>
);

type Who = { pose: Pose; expr: Expr; x?: number; y?: number; t?: number };
const omarRig = (pose: Pose, t?: number, x = OX): Rig => ({ x, y: sitY(FLOOR, OS, pose) + Math.sin((t ?? 0) * 0.11) * 2.5, s: OS, facing: 1, pose, t: undefined });
/** Omar's seated pose with the right (near) arm reaching to (tx, ty) or resting on the table */
const omarPose = (lean: number, tx?: number, ty?: number, extra?: Partial<Pose>): Pose => {
  const p = sitPose("side", { armL: [62, -78], armR: [70, -72] }, { lean, ...extra });
  if (tx === undefined || ty === undefined) return p;
  return { ...p, armR: reach(omarRig(p), "R", tx, ty, -1) };
};

/** the cafe: wall, floor, Omar on a chair at the bistro table, optional Lena, the plate/mug/jar and the toast */
const Cafe: React.FC<{ f: number; omar?: Who | null; lena?: (Who & { pot?: { rot: number }; potHand?: "L" | "R" }) | null; plateX?: number;
  toast?: TS_ | null; splat?: number; extra?: React.ReactNode; front?: React.ReactNode; table?: boolean; tall?: React.ReactNode }> =
  ({ f, omar, lena, plateX = PLATE0, toast, splat = 0, extra, front, table = true, tall }) => {
  const oPose = omar?.pose ?? omarPose(0);
  const oRig = omarRig(oPose, f);
  const lRig: Rig | null = lena ? { x: lena.x ?? 950, y: lena.y ?? FLOOR, s: LS, facing: 1, pose: lena.pose, t: lena.t ?? f + 23 } : null;
  const potHand = lena?.pot && lRig ? handAt(lRig, lena.potHand ?? "L") : null;
  const PSC = 0.7;
  return (
    <>
      <Layer p={0.55}><Svg><CafeWall y={-420} h={1820} /></Svg></Layer>
      <Layer p={1}><Svg>
        <CafeFloor y={FLOOR} h={900} />
        {tall}
        {lena && lRig && <>
          <Person x={lRig.x} y={lRig.y} scale={LS} facing={1} look={LENA} pose={lena.pose} expr={lena.expr} t={lRig.t} blink={(f + 31) % 109 < 4} />
          <Apron x={lRig.x} y={lRig.y} scale={LS} facing={1} pose={lena.pose} />
        </>}
        {table && <>
          <Chair x={CHX} y={FLOOR} scale={OS} facing={1} />
          {omar !== null && <Person x={oRig.x} y={oRig.y} scale={OS} facing={1} look={OMAR} pose={oPose} expr={omar?.expr ?? "calm"} t={f} blink={f % 97 < 4} shadow={0} />}
          <CafeTable x={TBX} y={FLOOR} w={TW} legH={TLEG} />
          <SugarJar x={JARX} y={TT - 2} s={0.82} />
          <Mug x={MUGX} y={TT} scale={0.8} steam={f} />
          <Plate x={plateX} y={TT} scale={PS} />
        </>}
        {splat > 0 && <ButterSplat x={toast ? toast.x : EX + 70} y={FLOOR + 4} scale={0.85 * splat} />}
        {toast && <Toast x={toast.x} y={toast.y} scale={TS} rot={toast.rot} />}
        {potHand && lena?.pot && <CoffeePot x={potHand.x - 72 * PSC} y={potHand.y + 120 * PSC} scale={PSC} facing={1} rot={lena.pot.rot} />}
        {extra}
      </Svg></Layer>
      {front && <Layer p={1.3}><Svg>{front}</Svg></Layer>}
    </>
  );
};
/** where the coffee pot's spout is (pot held in a hand at h, scale 0.7, tilted rot) */
const spoutOf = (h: { x: number; y: number }, rot: number) => {
  const vx = (-62 - 72) * 0.7, vy = (-170 + 120) * 0.7, a = rad(-rot);
  return { x: h.x + vx * Math.cos(a) - vy * Math.sin(a), y: h.y + vx * Math.sin(a) + vy * Math.cos(a) };
};

/** Lab table: navy block with a cream outline; top surface at y `top`, right edge at x `edge`, legs to `floor` */
const LabTable: React.FC<{ edge: number; top: number; floor: number; w?: number; thick?: number }> = ({ edge, top, floor, w = 600, thick = 40 }) => (
  <g>
    <rect x={edge - w} y={top} width={w} height={thick} rx={10} fill="#2a3a6e" stroke={CREAM} strokeWidth={7} />
    <rect x={edge - 70} y={top + thick} width={34} height={floor - top - thick} fill="#24346a" stroke={CREAM} strokeWidth={6} />
    <rect x={edge - w + 36} y={top + thick} width={34} height={floor - top - thick} fill="#24346a" stroke={CREAM} strokeWidth={6} />
  </g>
);

// ---------------------------------------------------------------- shots
const ShotView: React.FC<{ span: ShotSpan }> = ({ span }) => {
  const f = useCurrentFrame();
  const words = React.useContext(Words);
  const u = f - span.a, len = span.b - span.a;
  let cam: Cam = { x: 0, y: 0, zoom: 1, rot: 0 };
  let mood = MOODS.cafe;
  let body: React.ReactNode = null;
  let overlay: React.ReactNode = null;
  const on = (p: { x: number; y: number }, zoom: number, rot = 0): Cam => ({ x: p.x - 540, y: p.y - 960, zoom, rot });
  const PLATE1 = PLATE0 + 40;                                       // plate after the nudge
  const restArm = omarPose(0, JARX - 30, TT - 70);                  // Omar's hand left by the sugar jar

  switch (span.id) {
    case "hook": {   // flash-forward, slow motion: snap zoom onto the table edge as the buttered toast tips over it
      mood = MOODS.slow;
      const tip = k(u, 6, len * 0.72, 0, 1, Easing.inOut(Easing.sin)), fall = k(u, len * 0.72, len, 0, 0.42, Easing.linear);
      const t = cafeToast(1, tip, fall, PLATE1);
      cam = drift(on({ x: EX + 30, y: TT + 10 + Math.max(0, t.y - REST) * 0.85 }, k(u, 0, 7, 1.6, 3.2, Easing.out(Easing.cubic)) + k(u, 7, len, 0, 0.25)), f, 1.5);
      body = <Cafe f={f} plateX={PLATE1} omar={{ pose: restArm, expr: "calm" }} toast={t}
        extra={<>{fall > 0 && <Drip x={t.x - 30} y={t.y + 20 + fall * 30} r={5} />}{tip > 0.5 && <Drip x={EX + 8} y={TT + 14 + (tip - 0.5) * 60} r={5} />}</>} />;
      overlay = <Flash framesSince={u - 6} len={4} />;
      break;
    }
    case "wide": {   // wide morning cafe: Lena pours Omar's coffee, then walks off; Omar reaches for the sugar
      const pour = k(u, 4, 12, 0, 30) * (1 - k(u, len * 0.42, len * 0.5, 0, 1));
      const walk = k(u, len * 0.48, len * 0.8, 0, 1, Easing.inOut(Easing.sin));
      const lx = 790 + walk * 170, bob = Math.abs(Math.sin(walk * Math.PI * 4)) * -8;
      const target = { x: MUGX + 100, y: TT - 150 };
      const lp0: Pose = { armL: [30, -20], armR: [16, -8], legL: [6, 0], legR: [6, 0] };
      const lRig: Rig = { x: lx, y: FLOOR + bob, s: LS, facing: 1, pose: lp0, t: f + 23 };
      const handTo = walk > 0 ? { x: lx - 120, y: FLOOR - 470 } : target;
      const lPose: Pose = { ...lp0, armL: reach(lRig, "L", handTo.x, handTo.y, 1), legL: [6 + Math.sin(walk * Math.PI * 8) * 14 * Math.min(1, walk * 6), 0], legR: [6 - Math.sin(walk * Math.PI * 8) * 14 * Math.min(1, walk * 6), 0] };
      const h = handAt({ ...lRig, pose: lPose }, "L"), sp = spoutOf(h, pour);
      const r = k(u, len * 0.55, len, 0, 0.55);
      const oPose = omarPose(k(u, len * 0.55, len, 0, 12), interpolate(r, [0, 1], [OX + 130, JARX - 10]), interpolate(r, [0, 1], [TT - 40, TT - 80]));
      cam = drift({ x: k(u, 0, len, -16, 12), y: 12, zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 3);
      body = <Cafe f={f} omar={{ pose: oPose, expr: u < len * 0.5 ? "smile" : "focused" }} lena={{ pose: lPose, expr: pour > 5 ? "focused" : "smile", x: lx, y: FLOOR + bob, pot: { rot: pour } }}
        toast={cafeToast(0, 0, 0, PLATE0)}
        extra={pour > 12 && <path d={`M ${sp.x} ${sp.y} Q ${sp.x - 6} ${(sp.y + TT - 64) / 2} ${MUGX + 2} ${TT - 64}`} stroke={CAFE.coffee} strokeWidth={9} fill="none" strokeLinecap="round" />} />;
      break;
    }
    case "slide": {  // medium: his elbow knocks the plate, the toast keeps sliding to the edge
      mood = MOODS.close;
      const r = k(u, 0, len * 0.4, 0.55, 1);
      const nudge = k(u, len * 0.3, len * 0.38, 0, 1, Easing.out(Easing.cubic)), px = PLATE0 + nudge * 40;
      const rattle = nudge > 0 && nudge < 1 ? Math.sin(u * 3) * 3 : 0;
      const sl = k(u, len * 0.32, len * 0.95, 0, 1, Easing.inOut(Easing.quad));
      const oPose = omarPose(k(u, 0, len * 0.4, 6, 14), interpolate(r, [0, 1], [OX + 130, JARX - 10]), interpolate(r, [0, 1], [TT - 40, TT - 80]));
      cam = kickCam(drift(on({ x: 575, y: 1050 }, k(u, 0, len, 1.68, 1.8)), f, 2), u - Math.round(len * 0.32), 8);
      const t = cafeToast(sl, 0, 0, px);
      body = <Cafe f={f} omar={{ pose: oPose, expr: u < len * 0.45 ? "focused" : "smile" }} plateX={px + rattle} toast={{ ...t, y: t.y + (sl > 0 && sl < 1 ? Math.sin(u * 2.2) * 1 : 0) }}
        extra={<>{nudge > 0 && nudge < 1 && <path d={`M ${px - 110} ${TT - 40} l -26 -14 M ${px - 112} ${TT - 18} l -30 0`} stroke={INK} strokeWidth={6} strokeLinecap="round" />}</>} />;
      overlay = <SpeedLines amount={sl > 0.1 && sl < 0.9 ? 0.08 : 0} angle={0} seed={3} />;
      break;
    }
    case "fall": {   // slow motion: it tips over the edge, then falls spinning, speed lines, butter drips
      mood = MOODS.slow;
      const tip = k(u, 0, len * 0.38, 0, 1, Easing.in(Easing.sin)), fall = k(u, len * 0.38, len, 0, 0.9, Easing.linear);
      const t = cafeToast(1, tip, fall, PLATE1);
      const ghosts = [0.12, 0.24].map((d) => (fall > d ? fallState(EX, TT, FLOOR, TS, fall - d) : null));
      cam = drift(on({ x: EX + 40, y: k(u, 0, len, TT + 60, FLOOR - 120) }, k(u, 0, len, 2.15, 2.35)), f, 1.5);
      body = <Cafe f={f} omar={{ pose: restArm, expr: "shock" }} plateX={PLATE1} toast={t}
        extra={<>
          {ghosts.map((g, i) => g && <g key={i} opacity={0.18 + i * 0.07}><Toast x={g.x} y={g.y} scale={TS} rot={g.rot} /></g>)}
          {fall > 0.1 && <><Drip x={t.x - 20} y={t.y - 30 - fall * 20} r={6} /><Drip x={t.x + 30} y={t.y - 60 - fall * 30} r={4} /></>}
        </>} />;
      overlay = <SpeedLines amount={k(u, len * 0.38, len * 0.55, 0, 0.32)} angle={90} seed={u % 3} />;
      break;
    }
    case "splat": {  // SPLAT on the floor (kick + flash), then a hard cut to Omar's face
      const cut = Math.round(len * 0.48), second = u >= cut;
      const fall = k(u, 0, 2, 0.9, 1, Easing.linear), hit = u - 2;
      const t = cafeToast(1, 1, fall, PLATE1);
      const sq = hit >= 0 ? Math.max(0, 1 - hit / 6) : 0;
      const splat = hit >= 0 ? k(hit, 0, 4, 0.2, 1, Easing.out(Easing.back(2))) : 0;
      mood = second ? MOODS.close : MOODS.cafe;
      if (!second) cam = kickCam(on({ x: t.x, y: FLOOR - 70 }, k(u, 0, cut, 2.7, 2.85)), hit, 26);
      else {
        const head = { x: OX + 10, y: sitY(FLOOR, OS, restArm) - 345 * OS };
        cam = kickCam(drift(on({ x: head.x + 60, y: head.y + 80 }, k(u, cut, len, 2.35, 2.55, Easing.out(Easing.cubic))), f, 2), u - cut, 10);
      }
      body = <Cafe f={f} omar={{ pose: { ...restArm, headTilt: second ? 14 : 0, lookX: 1 }, expr: "shock" }} plateX={PLATE1} toast={{ ...t, y: t.y + sq * 3 }} splat={splat}
        extra={hit >= 0 && hit < 8 && !second && [0, 1, 2, 3, 4].map((i) => {
          const a = rad(-160 + i * 35), d = 40 + hit * 22;
          return <Drip key={i} x={t.x + Math.cos(a) * d * 1.6} y={FLOOR - 10 + Math.sin(a) * d - (hit * hit) * -1.5} r={7 - i % 2 * 2} />;
        })} />;
      overlay = <>{!second && <Flash framesSince={hit} len={4} />}{!second && <SpeedLines amount={hit >= 0 && hit < 6 ? 0.3 * (1 - hit / 6) : 0} angle={0} seed={7} />}</>;
      break;
    }
    case "curse": {  // a storm cloud rains on Omar: MURPHY'S LAW; then the question - why the butter side?
      mood = MOODS.gloom;
      const why = u > len * 0.48;
      const slump: Pose = { ...omarPose(0), armL: [20, -10], armR: [26, -16], headTilt: why ? 16 : -4, lookX: why ? 1 : 0 };
      const head = { x: OX + 10, y: sitY(FLOOR, OS, slump) - 345 * OS };
      cam = drift(on({ x: 450, y: why ? k(u, len * 0.48, len, 930, 990) : 920 }, why ? k(u, len * 0.48, len, 1.72, 1.85) : k(u, 0, len * 0.48, 1.62, 1.7)), f, 2);
      const drop = k(u, 0, 9, -260, 0, Easing.out(Easing.back(1.4)));
      body = <Cafe f={f} omar={{ pose: slump, expr: why ? "focused" : "worried" }} plateX={PLATE1} toast={fallState(EX, TT, FLOOR, TS, 1)} splat={1}
        extra={<StormCloud x={head.x - 30} y={head.y - 240 + drop} scale={0.82} f={f} />} />;
      overlay = <Badge x={800} y={k(u, 4, 10, 740, 700)} lines={["MURPHY'S", "LAW"]} s={62} c={CREAM} o={k(u, 4, 10, 0, 1)} />;
      break;
    }
    case "physicist": { // the 1995 paper drops in
      mood = MOODS.lab;
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.06), rot: 0 }, f, 2);
      const dy = k(u, 6, 18, -1300, 0, Easing.out(Easing.back(1.3))), rot = k(u, 6, 20, -14, -3);
      body = <Lab>
        <T x={540} y={410} s={70} c={GOLD} o={k(u, 14, 20, 0, 1)}>1995 PHYSICS PAPER</T>
        <Gate><g transform={`rotate(${rot} 540 920)`}><PaperCard x={540} y={920 + dy} title="TUMBLING TOAST, MURPHY'S LAW" year={1995} scale={1.12} /></g></Gate>
      </Lab>;
      break;
    }
    case "tip": {    // close diagram: the toast pivots on the edge like a diver rolling off a boat, the spin begins
      mood = MOODS.lab;
      const S = 2.4, E = 560, TOP = 900;
      const sl = k(u, 2, len * 0.25, 0, 1), tip = k(u, len * 0.25, len * 0.72, 0, 1, Easing.in(Easing.sin)), fall = k(u, len * 0.72, len, 0, 0.55, Easing.linear);
      const st = fall > 0 ? fallState(E, TOP, TOP + 900, S, fall, 260, 120) : tip > 0 ? tipState(E, TOP, S, TIP * tip, (4 + 26 * tip) * S)
        : { x: E - 120 * S * (1 - sl) * 0.5 + 4 * S * sl, y: TOP - 15 * S, rot: 0 };
      const cm = { x: st.x, y: st.y };
      cam = drift({ x: 30, y: 0, zoom: k(u, 0, len, 1.0, 1.06), rot: 0 }, f, 2);
      body = <Lab>
        <T x={540} y={420} s={72} c={GOLD} o={k(u, 3, 9, 0, 1)}>PIVOT ON THE EDGE</T>
        <Toast x={st.x} y={st.y} scale={S} rot={st.rot} />
        <LabTable edge={E} top={TOP} floor={1500} w={900} />
        {(tip > 0 || fall > 0) && <RotationArrow x={E} y={TOP} r={250} from={-20} to={-20 + Math.min(130, st.rot * 1.4 + 10)} />}
        <circle cx={E} cy={TOP} r={16} fill={GOLD} stroke={INK} strokeWidth={5} />
        <circle cx={cm.x} cy={cm.y} r={13} fill={RED} stroke={INK} strokeWidth={4} />
        {tip > 0.05 && fall < 0.2 && <g opacity={k(u, len * 0.25, len * 0.3, 0, 1)}>
          <path d={`M ${cm.x} ${cm.y + 20} L ${cm.x} ${cm.y + 150}`} stroke={RED} strokeWidth={12} strokeLinecap="round" />
          <path d={`M ${cm.x - 22} ${cm.y + 132} L ${cm.x} ${cm.y + 170} L ${cm.x + 22} ${cm.y + 132} Z`} fill={RED} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>}
      </Lab>;
      break;
    }
    case "half": {   // fall path with snapshots: only half a turn before the floor
      mood = MOODS.lab;
      const E = 330, TOP = 700, FL = 1250, S = 1.25;
      const marks = [0, 0.42, 0.68, 0.86, 1];
      const live = k(u, 6, len * 0.75, 0, 1, Easing.linear);
      const at = (s: number) => (s === 0 ? tipState(E, TOP, S, TIP, 30 * S) : fallState(E, TOP, FL, S, s, 180, 290));
      const cur = at(live);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.04, 1.0), rot: 0 }, f, 1.5);
      const pts = Array.from({ length: 21 }, (_, i) => at(i / 20)).map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
      body = <Lab>
        <T x={540} y={420} s={72} c={GOLD} o={k(u, 3, 9, 0, 1)}>ONLY HALF A TURN</T>
        <LabTable edge={E} top={TOP} floor={FL} w={500} />
        <path d={`M 80 ${FL} L 1000 ${FL}`} stroke={CREAM} strokeWidth={8} strokeLinecap="round" />
        <path d={pts} stroke={MUTED} strokeWidth={6} fill="none" strokeDasharray="16 14" opacity={k(u, 0, 6, 0, 0.9)} />
        {marks.slice(0, -1).map((m, i) => live > m + 0.04 ? <g key={i} opacity={0.45}><Toast {...at(m)} scale={S} /></g> : null)}
        {live < 1 && <Toast {...cur} scale={S} />}
        {live >= 1 && <><ButterSplat x={at(1).x} y={FL + 2} scale={1.1} /><Toast {...at(1)} scale={S} /></>}
        <RotationArrow x={830} y={880} r={110} from={-90} to={-90 + Math.max(4, cur.rot - 0)} color={live >= 1 ? RED : GOLD} />
        <circle cx={830} cy={880} r={12} fill={CREAM} />
        {live >= 1 && <Check x={at(1).x + 170} y={FL - 90} ok={false} s={k(u, len * 0.75, len * 0.75 + 6, 0, 1, Easing.out(Easing.back(2)))} />}
      </Lab>;
      break;
    }
    case "height": { // normal table vs a 3 m table: half a turn vs a full turn (fall time doubles with 4x the height)
      mood = MOODS.lab;
      const FL = 1300, NX = 300, NH = 220, GX = 660, GH = 880, S = 0.95;
      const nE = NX + 100, gE = GX + 170;
      const tipN = k(u, 2, 10, 0, 1), tipG = tipN;
      const T1 = Math.max(14, len * 0.3);
      const sN = k(u, 10, 10 + T1, 0, 1, Easing.linear), sG = k(u, 10, 10 + 2 * T1, 0, 1, Easing.linear);
      const st = (e: number, top: number, tip: number, s: number, end: number) => (s > 0 ? fallState(e, top, FL, S, s, end, 50) : tipState(e, top, S, TIP * tip, (4 + 26 * tip) * S));
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.03), rot: 0 }, f, 1.5);
      body = <Lab>
        <path d={`M 70 ${FL} L 1010 ${FL}`} stroke={CREAM} strokeWidth={8} strokeLinecap="round" />
        <g transform={`translate(${NX} ${FL})`}><LabTable edge={100} top={-NH} floor={0} w={200} thick={30} /></g>
        <GiantTable x={GX} y={FL} h={GH} />
        <Ruler x={130} y={FL} h={NH} ticks={3} />
        <Ruler x={970} y={FL} h={GH} ticks={4} />
        <T x={150} y={FL - NH - 30} s={50} c={CREAM}>75 cm</T>
        <T x={968} y={FL - GH - 30} s={52} c={CREAM}>3 m</T>
        {sN >= 1 && <ButterSplat x={st(nE, FL - NH, 1, 1, 180).x} y={FL + 2} scale={0.7} />}
        <Toast {...st(nE, FL - NH, tipN, sN, 180)} scale={S} />
        <Toast {...st(gE, FL - GH, tipG, sG, 360)} scale={S} />
        {sN >= 1 && <Check x={st(nE, FL - NH, 1, 1, 180).x} y={FL - 130} ok={false} s={k(u, 10 + T1, 16 + T1, 0, 1, Easing.out(Easing.back(2)))} />}
        {sG >= 1 && <Check x={st(gE, FL - GH, 1, 1, 360).x - 10} y={FL - 130} ok s={k(u, 10 + 2 * T1, 16 + 2 * T1, 0, 1, Easing.out(Easing.back(2)))} />}
      </Lab>;
      break;
    }
    case "test": {   // ~10,000 school drops: counter, toasts piling into two bins, 62 % butter-down bar
      mood = MOODS.lab;
      cam = drift({ x: 0, y: 0, zoom: 1.0, rot: 0 }, f, 1.5);
      const n = k(u, 6, len * 0.45, 0, 10000, Easing.out(Easing.quad));
      const bar = k(u, len * 0.5, len * 0.72, 0, 0.62, Easing.out(Easing.cubic));
      const pile = k(u, 2, len * 0.6, 0, 1);
      body = <Lab>
        <Gate><g transform={`translate(540 520) scale(${k(u, 6, 12, 0, 1, Easing.out(Easing.back(1.6)))})`}><DropCounter x={0} y={0} value={n} digits={5} /></g></Gate>
        <T x={540} y={725} s={68} c={CREAM} o={k(u, 4, 10, 0, 1)}>~10,000 DROPS</T>
        {[0, 1].map((b) => <rect key={b} x={b ? 590 : 150} y={985} width={340} height={95} rx={14} fill="#1a2448" stroke={b ? GREEN : RED} strokeWidth={8} />)}
        {Array.from({ length: Math.floor(pile * 13) }, (_, i) => <Toast key={"d" + i} x={190 + (i % 5) * 65} y={1060 - Math.floor(i / 5) * 18} scale={0.42} rot={180} />)}
        {Array.from({ length: Math.floor(pile * 8) }, (_, i) => <Toast key={"u" + i} x={630 + (i % 5) * 65} y={1060 - Math.floor(i / 5) * 18} scale={0.42} rot={0} />)}
        {u < len * 0.6 && Array.from({ length: 6 }, (_, i) => {
          const ph = ((u + i * 7) % 18) / 18, down = i % 8 < 5 ? (i % 3 !== 2) : false;
          return <Toast key={"f" + i} x={(down ? 230 : 670) + (i % 3) * 90} y={790 + ph * 190} scale={0.42} rot={(down ? 180 : 360) * ph} />;
        })}
        <rect x={150} y={1150} width={780} height={70} rx={20} fill={GREEN} stroke={INK} strokeWidth={7} opacity={k(u, len * 0.5, len * 0.55, 0, 1)} />
        <rect x={150} y={1150} width={780 * bar} height={70} rx={20} fill={RED} stroke={INK} strokeWidth={7} />
        <T x={540} y={1318} s={64} c={GOLD} o={k(u, len * 0.6, len * 0.68, 0, 1)}>62% BUTTER DOWN</T>
      </Lab>;
      break;
    }
    case "fix": {    // Lena swipes the toast forward off the edge: it barely spins and lands butter up
      // timed to the voice: wind-up on "Lena tries it", the toast lands (and the check pops) on "Butter up."
      const LT = cueAt(words, "Lena tries it", span, Math.round(len * 0.55)), BU = cueAt(words, "Butter up", span, Math.round(len * 0.75));
      const SW = Math.max(LT + 4, BU - 18), rel = SW + 5, FT = Math.max(6, BU - rel);
      const lx = 700;
      const lp0: Pose = { armL: [22, -30], armR: [30, -30], legL: [8, 0], legR: [8, 0] };
      const lRig: Rig = { x: lx, y: FLOOR, s: LS, facing: 1, pose: lp0, t: f + 23 };
      const sw = k(u, SW, rel, 0, 1, Easing.in(Easing.quad)), wind = k(u, LT, SW, 0, 1, Easing.inOut(Easing.sin));
      const handT = u < SW ? { x: EX - 150 - wind * 40 + Math.sin(u * 0.2) * 4 * (1 - wind), y: TT - 30 - wind * 10 }
        : { x: EX - 190 + sw * 270 + k(u, rel, rel + 8, 0, 60), y: TT - 40 - k(u, rel, rel + 10, 0, 80) };
      const lPose: Pose = { ...lp0, armR: reach(lRig, "R", handT.x, handT.y, 1) };
      const tf = (u - rel) / FT;
      let t: TS_;
      if (u < SW) t = { x: EX - 50, y: REST, rot: 0 };
      else if (u < rel) t = { x: EX - 50 + sw * 70, y: REST, rot: sw * 6 };
      else if (tf < 1) t = { x: EX + 20 + tf * 130, y: REST + (LAND - REST) * tf * tf, rot: 6 + tf * 22 };
      else { const sF = k(u - rel - FT, 0, 4, 0, 1, Easing.out(Easing.cubic)); t = { x: EX + 150 + sF * 8, y: LAND - 8 * Math.sin(sF * Math.PI), rot: 28 * (1 - sF) }; }
      const arrowO = k(u, 6, 12, 0, 1) * (1 - k(u, SW - 4, SW, 0, 1));
      const landed = u >= rel + FT;
      cam = drift(on({ x: 640, y: 1110 }, k(u, 0, len, 1.2, 1.26)), f, 2);
      body = <Cafe f={f} omar={{ pose: omarPose(0, MUGX + 20, TT - 40), expr: landed ? "shock" : "focused" }} plateX={PLATE0}
        lena={{ pose: lPose, expr: landed ? "cheer" : u >= LT ? "determined" : "smile", x: lx }} toast={t}
        extra={<>{arrowO > 0.01 && <g opacity={arrowO}><path d={`M ${EX - 120} ${TT - 80} L ${EX + 110} ${TT - 80}`} stroke={GOLD} strokeWidth={10} strokeDasharray="22 14" strokeDashoffset={-u * 3} strokeLinecap="round" />
            <path d={`M ${EX + 104} ${TT - 104} L ${EX + 146} ${TT - 80} L ${EX + 104} ${TT - 56} Z`} fill={GOLD} stroke={INK} strokeWidth={4} strokeLinejoin="round" /></g>}
          {u >= SW && u < rel + 4 && <path d={`M ${EX - 200} ${TT - 60} Q ${EX - 60} ${TT - 90} ${EX + 40} ${TT - 70}`} stroke="#ffffff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} />}
          {landed && <Check x={EX + 158} y={LAND - 120} ok s={k(u, rel + FT + 2, rel + FT + 8, 0, 1, Easing.out(Easing.back(2)))} />}</>} />;
      overlay = <><Badge x={540} y={k(u, 0, 6, 410, 385)} lines={["SWIPE FORWARD"]} s={66} o={k(u, 0, 6, 0, 1)} />
        <SpeedLines amount={u >= SW && u < rel + 6 ? 0.18 : 0} angle={0} seed={5} /></>;
      break;
    }
    case "twist": {  // Omar now eats standing at the tallest counter, smug, toast in hand
      mood = MOODS.close;
      const CX2 = 900, CH = 330, ox = 880;
      const op0: Pose = { armL: [30, -40], armR: [20, -40], legL: [6, 0], legR: [6, 0] };
      const oRig: Rig = { x: ox, y: FLOOR, s: OS, facing: 1, pose: op0, t: f };
      const bite = Math.sin(u * 0.16) > 0.6;
      const mouth = { x: ox + 50, y: FLOOR - 335 * OS + (bite ? 0 : 20) };
      const oPose: Pose = { ...op0, armR: reach(oRig, "R", mouth.x + 40, mouth.y + 20, -1), armL: reach(oRig, "L", ox - 90, FLOOR - CH - 10, -1), headTilt: -4 };
      const h = handAt({ ...oRig, pose: oPose }, "R");
      cam = drift(on({ x: 820, y: k(u, 0, len, 1040, 1000) }, k(u, 0, len, 1.45, 1.75, Easing.inOut(Easing.cubic))), f, 2);
      body = <Cafe f={f} table={false}
        tall={<>
          <Person x={ox} y={FLOOR} scale={OS} facing={1} look={OMAR} pose={oPose} expr={bite ? "smile" : "smirk"} t={f} blink={f % 97 < 4} />
          <TallCounter x={CX2} y={FLOOR} h={CH} w={340} />
          <Plate x={CX2 - 90} y={FLOOR - CH} scale={0.75} />
          <Mug x={CX2 + 110} y={FLOOR - CH} scale={0.75} steam={f} />
          <Toast x={h.x + 30} y={h.y - 30} scale={0.75} rot={-62} />
        </>} />;
      break;
    }
    default: {       // ask: pull out wide over the cafe - Lena at the low table, Omar up at his tall counter
      const pull = k(u, 0, len, 0, 1, Easing.inOut(Easing.cubic));
      const CX2 = 900, CH = 330, ox = 880;
      const op: Pose = { armL: [30, -40], armR: [44, -120], legL: [6, 0], legR: [6, 0] };
      cam = { x: interpolate(pull, [0, 1], [280, 0]), y: interpolate(pull, [0, 1], [55, 10]), zoom: interpolate(pull, [0, 1], [1.2, 1.0]), rot: interpolate(pull, [0, 1], [-1.5, 0]) };
      const lp: Pose = { armL: [18, -20], armR: [40, -100], legL: [6, 0], legR: [6, 0] };
      body = <Cafe f={f} omar={null} lena={{ pose: lp, expr: "laugh", x: 520 }} plateX={PLATE0} toast={{ x: EX + 140, y: LAND, rot: 0 }}
        tall={<>
          <Person x={ox} y={FLOOR} scale={OS} facing={1} look={OMAR} pose={op} expr="smile" t={f} blink={f % 97 < 4} />
          <TallCounter x={CX2} y={FLOOR} h={CH} w={340} />
          <Plate x={CX2 - 90} y={FLOOR - CH} scale={0.75} />
          <Mug x={CX2 + 110} y={FLOOR - CH} scale={0.75} steam={f} />
        </>} />;
    }
  }

  const lab = mood === MOODS.lab;
  return (
    <AbsoluteFill>
      <Stage cam={cam} bg={lab ? LAB.bg : CAFE.wall}>{body}</Stage>
      {!lab && <Pool x={220} y={760} rx={620} ry={820} color="#fff2c4" opacity={0.3} />}
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
  const fade = prev && u < XF && (PLACE[prev.id] ?? "cafe") !== (PLACE[span.id] ?? "cafe");
  return (
    <Words.Provider value={words}><AbsoluteFill>
      <NoText.Provider value={!!fade}><ShotView span={span} /></NoText.Provider>
      {fade && prev && <NoText.Provider value><AbsoluteFill style={{ opacity: 1 - (u + 1) / (XF + 1) }}><ShotView span={prev} /></AbsoluteFill></NoText.Provider>}
    </AbsoluteFill></Words.Provider>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "toast",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: CAFE.wall,
};
export default story;
