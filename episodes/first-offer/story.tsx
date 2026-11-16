// "He Said the Price First and Still Won" - 2.5D. A sunny Saturday flea market: Kai sells his old guitar, Rosa wants
// it. Kai breaks the "never name the price first" rule ($200), Rosa counters ($100), they meet at $160 - near his
// anchor. Facts (see RESEARCH.md): in negotiation experiments the first offer tended to win the better deal and to
// predict the final price (Galinsky & Mussweiler 2001); anchoring with a random wheel: saw 10 -> guessed 25 %, saw 65
// -> guessed 45 % (Tversky & Kahneman 1974). Caveat: know the real value - an absurd anchor makes buyers walk.
// Market layout (front view): Kai's stall centred at x 540 (ground y 1300, table top 1120), Kai behind it; his guitar
// on a stand on the table's right end; Rosa stands in front of the stall at (760, 1400) - above the caption band.
// Motion rules (src/engine25/motion.tsx): arrivals EASE.arrive, exits shorter EASE.exit, camera EASE.camera; every
// label enters and exits (Label), numbers count, stop and stamp; nothing holds still for more than ~3 s.
// On-screen text is drawn in screen space (overlay) inside SAFE_TEXT (y 300-1350, x 60-960) and hidden in crossfades.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, ShotSpan, cueTime, FPS } from "../../src/engine/timeline";
import type { Word } from "../../src/captions/Captions";
import { Stage, Layer, Svg, Cam, drift, kickCam } from "../../src/engine25/stage";
import { Grade, Mood, Pool, Flash, SpeedLines } from "../../src/engine25/light";
import { EASE, arrive, leave, camMove, Label, countValue, stampScale } from "../../src/engine25/motion";
import { Person, Look, INK, Expr, Pose, runPose } from "../../library/characters25/person";
import { CAST, EXTRAS } from "../../library/style/channel";
import { Lab, LAB } from "../../library/environments25/lab";
import { MARKET, AWNINGS, Bunting, MarketBackdrop, MarketGround, Stall, stallTopY, behindStall, Crate, Guitar, guitarPoint, GuitarStand,
  guitarOnStand, handsOnStall, PriceTag, Coins, Notes, Cap, Sunglasses, ToteBag, RuleCard, NegotiationTable, negotiationTopY, negotiationSeats, OfferCard,
  Anchor, PriceLine, priceLineX, Wheel, wheelAngleFor, GuessBar, PriceSlider, Handshake } from "../../library/environments25/market";
import scenes from "../../content/scripts/first-offer.json";

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
  sun: { grade: "#ffd27a", gradeOp: 0.05, vignette: 0.3, glow: "#fff4d0" },        // late-morning market
  close: { grade: "#ffb060", gradeOp: 0.07, vignette: 0.44, glow: "#fff1c9" },
  freeze: { grade: "#1b2a6b", gradeOp: 0.42, vignette: 0.72 },                     // "Wait." - cold freeze-frame
  lab: { grade: "#0b1430", gradeOp: 0.04, vignette: 0.45 },
};

const k = (u: number, a: number, b: number, from: number, to: number, e = EASE.camera) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const rad = (d: number) => (d * Math.PI) / 180;
type Pt = { x: number; y: number };
const { gold: GOLD, red: RED, green: GREEN, muted: MUTED, text: CREAM, orange: ORANGE } = LAB;
const FONT = "CaptionSans, sans-serif";

// ---------------------------------------------------------------- cast + set geometry
const KAI: Look = CAST.kai, ROSA: Look = CAST.rosa;
const GROUND = 1150;                                   // backdrop ground line; lawn below it
const KS = { x: 540, y: 1300, scale: 1 };              // Kai's stall
const TOP = stallTopY(KS);                             // 1120: table top
const KB = behindStall(KS);                            // Kai behind the stall
const RS = 1.05, RX = 760, RY = 1400;                  // Rosa in front of the stall
const GSC = 1.05;                                      // guitar scale
const STAND = { x: 690, y: TOP };                      // guitar stand on the table's right end
type GuitarPos = { x: number; y: number; scale: number; rot: number };
const ON_STAND: GuitarPos = guitarOnStand(STAND.x, STAND.y, GSC);
const HELD: GuitarPos = { x: 800, y: 1290, scale: GSC, rot: -40 };   // in Rosa's arms, neck up toward Kai
const BACK = 90;                                       // Rosa's recoil (gasp/advice): she steps back from the price
const HELD2: GuitarPos = { ...HELD, x: HELD.x + BACK };
const lerpG = (a: GuitarPos, b: GuitarPos, t: number): GuitarPos => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, scale: a.scale, rot: a.rot + (b.rot - a.rot) * t });
/** world point on the guitar in local units (end pin origin, y up negative) */
const gPt = (g: GuitarPos, lx: number, ly: number): Pt => {
  const a = rad(g.rot), s = g.scale;
  return { x: g.x + (lx * Math.cos(a) - ly * Math.sin(a)) * s, y: g.y + (lx * Math.sin(a) + ly * Math.cos(a)) * s };
};

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
/** a hand dot drawn over a held prop (the rig draws hands under props drawn after it) */
const HandDot: React.FC<{ p: Pt; s: number; skin: string }> = ({ p, s, skin }) =>
  <circle cx={p.x} cy={p.y} r={7.9 * s} fill={skin} stroke={INK} strokeWidth={4.2 * s} />;

const STAND_POSE: Pose = { armL: [12, -6], armR: [12, -6], legL: [6, 0], legR: [6, 0] };
const walkPose = (ph: number): Pose => ({ ...runPose(ph, 0.42), lean: 3, crouch: 0.03 });
const blinkOf = (f: number, seed: number) => ((f + seed * 37) % 103) < 4;
/** Kai's rest pose: both hands on his table */
const KREST: Pose = handsOnStall({ ...KB, facing: 1, pose: STAND_POSE }, KS);

/** Kai (Cap) */
const KaiP: React.FC<{ x: number; y: number; s?: number; pose: Pose; expr: Expr; f: number; facing?: 1 | -1; t?: number; rot?: number }> = ({ x, y, s = KB.scale, pose, expr, f, facing = 1, t, rot }) => {
  const p = { x, y, scale: s, facing, pose, rot };
  return <g><Person {...p} look={KAI} expr={expr} t={t} blink={blinkOf(f, 1)} /><Cap {...p} /></g>;
};
/** Rosa (sunglasses + tote) */
const RosaP: React.FC<{ x: number; y: number; s?: number; pose: Pose; expr: Expr; f: number; facing?: 1 | -1; t?: number; shades?: boolean; tote?: boolean; rot?: number }> = ({ x, y, s = RS, pose, expr, f, facing = 1, t, shades = false, tote = true, rot }) => {
  const p = { x, y, scale: s, facing, pose, rot };
  return <g><Person {...p} look={ROSA} expr={expr} t={t} blink={blinkOf(f, 2)} />{tote && <ToteBag {...p} side={1} />}<Sunglasses {...p} onHead={!shades} /></g>;
};

/** Rosa holding the guitar (pose g): arms by IK on the neck and the body, hand dots over the guitar */
const rosaWithGuitar = (g: GuitarPos, f: number, x = RX, y = RY, base: Pose = STAND_POSE, t?: number) => {
  const rig: Rig = { x, y, s: RS, facing: 1, pose: base, t };
  const neck = gPt(g, 0, -150), body = gPt(g, 44, -64);
  const pose: Pose = { ...base, armL: reach(rig, "L", neck.x, neck.y, 1), armR: reach(rig, "R", body.x, body.y, -1) };
  const r2: Rig = { ...rig, pose };
  return { pose, hL: handAt(r2, "L"), hR: handAt(r2, "R") };
};

// ---------------------------------------------------------------- the market
type Item = { y: number; el: React.ReactNode };
type StallSpec = { x: number; y: number; scale: number; awning: readonly [string, string]; cloth?: string };
const KAI_STALL: StallSpec = { ...KS, awning: AWNINGS[0] };
const ROSA_STALL: StallSpec = { x: 600, y: 1300, scale: 1, awning: AWNINGS[2], cloth: MARKET.stripeGold };

/** shoppers strolling behind the stall row (depth y 1225), wrapping across the frame */
const Strollers: React.FC<{ f: number; n?: number; speed?: number }> = ({ f, n = 4, speed = 1 }) => (
  <g>{Array.from({ length: n }, (_, i) => {
    const v = (1.6 + (i % 3) * 0.4) * speed, span = 560, ph = ((i * 211 + f * v) % (2 * span) + 2 * span) % (2 * span);
    const dir: 1 | -1 = ph < span ? 1 : -1, x = 250 + (ph < span ? ph : 2 * span - ph);
    return <Person key={i} x={x} y={1222 - (i % 2) * 8} scale={0.74} facing={dir} look={EXTRAS[(i + 1) % EXTRAS.length]}
      pose={walkPose(f * 0.22 * speed + i)} expr={i % 2 ? "smile" : "calm"} blink={blinkOf(f, i + 5)} />;
  })}</g>
);

const Market: React.FC<{ f: number; stall?: StallSpec; seller?: React.ReactNode; onTable?: React.ReactNode; items?: Item[]; over?: React.ReactNode;
  strollers?: number; bunting?: boolean }> = ({ f, stall = KAI_STALL, seller, onTable, items = [], over, strollers = 0, bunting = true }) => (
  <>
    <Layer p={0.6}><Svg>
      <rect x={-600} y={GROUND - 30} width={2300} height={1400} fill={MARKET.lawnFar} />
      <MarketBackdrop y={GROUND - 1300} h={1300} />
    </Svg></Layer>
    <Layer p={1}><Svg>
      <MarketGround y={GROUND} h={900} />
      {strollers > 0 && <Strollers f={f} n={strollers} />}
      <Stall {...stall} layer="back" goods={false} />
      {seller}
      <Stall {...stall} layer="front" goods={false} />
      {onTable}
      {[...items].sort((a, b) => a.y - b.y).map((it, i) => <React.Fragment key={i}>{it.el}</React.Fragment>)}
      {over}
    </Svg></Layer>
    {bunting && <Layer p={1.25}><Svg><Bunting x0={-420} y0={170} x1={1500} y1={150} sag={150} n={18} size={70} f={f} seed={3} /></Svg></Layer>}
  </>
);
/** Kai's table: record crate (left), guitar stand (+ guitar if still on it, + its tag) */
const KaiTable: React.FC<{ guitar?: GuitarPos | null; tag?: React.ReactNode }> = ({ guitar, tag }) => (
  <g>
    <Crate x={400} y={TOP} scale={0.95} />
    <Coins x={300} y={TOP} scale={0.8} count={3} />
    <GuitarStand x={STAND.x} y={STAND.y} scale={GSC} />
    {guitar && <Guitar {...guitar} />}
    {tag}
  </g>
);
/** the guitar's price tag hanging from its headstock */
const tagOn = (g: GuitarPos, text: string | number, flip: number, rot = 0, scale = 0.52) => {
  const h = guitarPoint(g, "head");
  return <PriceTag x={h.x} y={h.y + 4} text={text} flip={flip} rot={rot} scale={scale} />;
};

/** world (subject plane, p = 1) -> screen, for overlays that must stay in the safe text box */
const toS = (c: Cam, p: Pt): Pt => ({ x: (p.x - 540 - c.x) * c.zoom + 540, y: (p.y - 960 - c.y) * c.zoom + 960 });
const on = (p: Pt, zoom: number, rot = 0): Cam => ({ x: p.x - 540, y: p.y - 960, zoom, rot });

// ---------------------------------------------------------------- overlay pieces (screen space)
/** speech bubble with a price: p = entrance 0..1 (scale pop), out = exit 0..1; tail points at `to` */
const Bubble: React.FC<{ x: number; y: number; text: string; p: number; out?: number; to?: Pt; fill?: string; color?: string; s?: number; w?: number }> =
  ({ x, y, text, p, out = 0, to, fill = "#fffaf0", color = INK, s = 1, w = 250 }) => {
    if (p <= 0.001 || out >= 1) return null;
    const sc = (0.6 + 0.4 * p) * s, h = 130;
    return <g opacity={Math.min(1, p * 1.6) * (1 - out)} transform={`translate(${x} ${y - out * 24}) scale(${sc})`}>
      {to && <path d={`M -26 ${h / 2 - 8} L ${(to.x - x) / sc * 0.45} ${(to.y - y) / sc * 0.45} L 26 ${h / 2 - 8} Z`} fill={fill} stroke={INK} strokeWidth={8} strokeLinejoin="round" />}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={44} fill={fill} stroke={INK} strokeWidth={8} />
      {to && <path d={`M -20 ${h / 2 - 4} L 20 ${h / 2 - 4}`} stroke={fill} strokeWidth={10} />}
      <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={color}>{text}</text>
    </g>;
  };
/** "SAW 10 -> GUESSED 25%" with a drawn arrow (the font has no arrow glyph we trust); enters rising, exits up */
const ArrowLabel: React.FC<{ f: number; y: number; left: string; right: string; color: string; enterAt: number; exitAt: number; ax?: number; size?: number }> =
  ({ f, y, left, right, color, enterAt, exitAt, ax = 372, size = 56 }) => {
    if (f < enterAt) return null;
    const out = Number.isFinite(exitAt) ? leave(f, exitAt) : 0;
    if (out >= 1) return null;
    const p1 = arrive(f, enterAt, 12), p2 = arrive(f, enterAt + 4, 12), p3 = arrive(f, enterAt + 8, 12);
    const common = { fontFamily: FONT, fontWeight: 900, fontSize: size };
    return <g opacity={1 - out} transform={`translate(0 ${-out * 20})`}>
      <text x={ax - 24} y={y + (1 - p1) * 34} textAnchor="end" {...common} fill={CREAM} opacity={p1}>{left}</text>
      <g opacity={p2} transform={`translate(${ax} ${y - size * 0.36})`}>
        <path d={`M 0 0 L ${64 * p2} 0`} stroke={color} strokeWidth={12} strokeLinecap="round" />
        <path d={`M ${64 * p2 - 22} -20 L ${64 * p2 + 4} 0 L ${64 * p2 - 22} 20`} stroke={color} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x={ax + 96} y={y + (1 - p3) * 34} textAnchor="start" {...common} fill={color} opacity={p3}>{right}</text>
    </g>;
  };
const Check: React.FC<{ x: number; y: number; s?: number; ok?: boolean }> = ({ x, y, s = 1, ok = true }) => (s <= 0.01 ? null :
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={46} fill={ok ? GREEN : RED} stroke={INK} strokeWidth={7} />
    {ok ? <path d="M -22 2 L -6 18 L 24 -16" stroke="#fff" strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      : <path d="M -18 -18 L 18 18 M 18 -18 L -18 18" stroke="#fff" strokeWidth={11} strokeLinecap="round" />}
  </g>
);
const pop = (u: number, a: number, d = 9) => (u < a ? 0 : k(u, a, a + d, 0, 1, Easing.out(Easing.back(2.2))));

// ---------------------------------------------------------------- shots
type View = { cam: Cam; mood: Mood; body: React.ReactNode; labels?: React.ReactNode; overlay?: React.ReactNode; bg?: string };

const ShotView: React.FC<{ span: ShotSpan; spans: ShotSpan[]; freezeAt?: number }> = ({ span, freezeAt }) => {
  const f0 = useCurrentFrame();
  const f = freezeAt ?? f0;
  const words = React.useContext(Words);
  const noText = React.useContext(NoText);
  const u = f - span.a, len = span.b - span.a;
  const C = (phrase: string, fb: number) => cueAt(words, phrase, span, fb);
  const v = build(span.id, f, u, len, C);
  const lab = v.mood === MOODS.lab;
  return (
    <AbsoluteFill>
      <Stage cam={v.cam} bg={v.bg ?? (lab ? LAB.bg : MARKET.sky)}>{v.body}</Stage>
      {!lab && <Pool x={300} y={300} rx={760} ry={720} color="#fff2c4" opacity={0.26} />}
      <Grade mood={v.mood} />
      {v.overlay}
      {!noText && v.labels && <AbsoluteFill><svg width={1080} height={1920} viewBox="0 0 1080 1920">{v.labels}</svg></AbsoluteFill>}
    </AbsoluteFill>
  );
};

const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number): View => {
  let cam: Cam = { x: 0, y: 0, zoom: 1, rot: 0 };
  let mood = MOODS.sun;
  switch (id) {
    case "hook": {   // close on Kai behind his stall, calm smile, guitar + blank tag beside him; he flicks the tag on
      // "golden rule" (it spins), and on "about to win" he looks at us and smirks while the camera pushes in
      mood = MOODS.close;
      const GR = C("golden rule", 30), WIN = C("about to win", 90);
      const tagC = { x: STAND.x - 4, y: guitarPoint(ON_STAND, "head").y + 4 + 120 * 0.52 };
      const rest: Pose = KREST;
      const rig: Rig = { x: KB.x, y: KB.y, s: KB.scale, facing: 1, pose: rest, t: f };
      const tap = k(u, GR - 10, GR, 0, 1, EASE.arrive) * (1 - k(u, GR + 8, GR + 18, 0, 1, EASE.exit));
      const restHand = handAt(rig, "R");
      const tgt = { x: restHand.x + (tagC.x - 22 - restHand.x) * tap, y: restHand.y + (tagC.y - restHand.y) * tap };
      const pose: Pose = tap > 0.01 ? { ...rest, armR: reach(rig, "R", tgt.x, tgt.y, 1) } : rest;
      const h = u - GR, spin = h < 0 ? 0 : Math.exp(-h / 26);
      const flip = h < 0 ? 0 : Math.abs(Math.sin(h * 0.32)) * spin;
      const swing = h < 0 ? Math.sin(u * 0.08) * 2 : Math.sin(h * 0.3) * 16 * spin;
      const push = k(u, WIN - 6, len, 0, 1);
      cam = drift(on({ x: interpolate(push, [0, 1], [610, 590]), y: interpolate(push, [0, 1], [975, 950]) }, interpolate(push, [0, 1], [1.8, 2.15])), f, 1.5);
      const body = <Market f={f}
        seller={<KaiP x={KB.x} y={KB.y} pose={{ ...pose, headTilt: u >= WIN ? -6 : 0, lookX: u >= WIN ? 0 : 0.6 }} expr={u >= WIN ? "smirk" : "calm"} f={f} t={f} />}
        onTable={<KaiTable guitar={ON_STAND} tag={tagOn(ON_STAND, "", flip, swing)} />} />;
      return { cam, mood, body };
    }
    case "wide": {   // wide market: shoppers stroll; Kai waits behind his stall; Rosa walks in from the left with her tote
      const EW = C("Everyone wants", 40);
      const walkEnd = Math.round(len * 0.8);
      const rx = k(u, 0, walkEnd, -130, 330, Easing.out(Easing.quad));
      const walking = u < walkEnd;
      cam = drift({ x: k(u, 0, len, -20, 20), y: k(u, 0, len, 40, 10), zoom: k(u, 0, len, 1.0, 1.06), rot: 0 }, f, 2);
      const body = <Market f={f} strollers={3}
        seller={<KaiP x={KB.x} y={KB.y} pose={{ ...KREST }} expr={u >= EW ? "smile" : "calm"} f={f} t={f} />}
        onTable={<KaiTable guitar={ON_STAND} tag={tagOn(ON_STAND, "", 0, Math.sin(u * 0.08) * 3)} />}
        items={[
          { y: RY, el: <RosaP x={rx} y={RY} pose={walking ? walkPose(u * 0.3) : STAND_POSE} facing={1} expr="smile" f={f} t={walking ? undefined : f} /> },
        ]} />;
      return { cam, mood, body };
    }
    case "guitar": { // Rosa eyes the guitar; on "blank tag" the camera pushes in on the guitar and its blank tag; on "picks it up"
      // she lifts it off the stand and the camera eases back
      const BT = C("blank tag", 30), PK = C("Rosa picks", Math.round(len * 0.55));
      const step = k(u, PK - 18, PK - 7, 0, 1, EASE.arrive);          // she steps in from the right, straight to it
      const rx = 1180 + (RX - 1180) * step, walking = u >= PK - 18 && u < PK - 9;
      const lift = k(u, PK + 2, PK + 24, 0, 1, EASE.arrive);
      const grab = k(u, PK - 6, PK + 2, 0, 1, EASE.arrive);
      const g = lerpG(ON_STAND, HELD, lift);
      const rig: Rig = { x: rx, y: RY, s: RS, facing: 1, pose: STAND_POSE };
      let pose: Pose = walking ? walkPose(u * 0.3) : STAND_POSE;
      let hands: React.ReactNode = null;
      if (!walking && u >= PK - 6) {
        const neck = gPt(g, 0, lift > 0.5 ? -150 : -142), body = gPt(g, 44, -64);
        const rest = { L: handAt(rig, "L"), R: handAt(rig, "R") };
        const tL = { x: rest.L.x + (neck.x - rest.L.x) * grab, y: rest.L.y + (neck.y - rest.L.y) * grab };
        const tR = { x: rest.R.x + (body.x - rest.R.x) * grab, y: rest.R.y + (body.y - rest.R.y) * grab };
        pose = { ...STAND_POSE, armL: reach(rig, "L", tL.x, tL.y, 1), armR: reach(rig, "R", tR.x, tR.y, -1) };
        const r2: Rig = { ...rig, pose };
        hands = lift > 0.4 ? <><HandDot p={handAt(r2, "L")} s={RS} skin={ROSA.skin} /><HandDot p={handAt(r2, "R")} s={RS} skin={ROSA.skin} /></> : null;
      }
      const swing = Math.sin(u * 0.09) * 3 + (lift > 0 && lift < 1 ? Math.sin(u * 0.5) * 10 * (1 - lift) : 0);
      const front = lift > 0.4;
      const pull = k(u, PK - 6, PK + 26, 0, 1);
      const pin = camMove(u, BT - 4, BT + 22, 0, 1);
      cam = drift(on({ x: 690 + 10 * pin - 0 * pull, y: interpolate(pull, [0, 1], [1000 - 40 * pin, 1080]) }, interpolate(pull, [0, 1], [1.72 + 0.38 * pin, 1.85])), f, 1.5);
      const body = <Market f={f}
        seller={<KaiP x={KB.x} y={KB.y} pose={{ ...KREST, lookX: 0.8 }} expr={u >= PK ? "smirk" : "calm"} f={f} t={f} />}
        onTable={<KaiTable guitar={front ? null : g} tag={front ? null : tagOn(g, "", 0, swing)} />}
        items={[{ y: RY, el: <g>
          <RosaP x={rx} y={RY} pose={pose} facing={walking ? -1 : 1} expr={u >= PK ? "smile" : "focused"} f={f} t={walking ? undefined : undefined} />
          {front && <><Guitar {...g} />{tagOn(g, "", 0, swing)}{hands}</>}
        </g> }]} />;
      return { cam, mood, body };
    }
    case "offer": {  // two-shot: Kai opens a hand toward the tag and names his price; the tag flips to $200 on "Two hundred"
      mood = MOODS.close;
      const SP = C("speaks first", 6), TH = C("Two hundred", 34);
      const hold = rosaWithGuitar(HELD, f, RX, RY, STAND_POSE, undefined);
      const flip = k(u, TH, TH + 10, 0, 1, EASE.arrive);
      const rig: Rig = { x: KB.x, y: KB.y, s: KB.scale, facing: 1, pose: STAND_POSE, t: f };
      const gest = k(u, SP, SP + 12, 0, 1, EASE.arrive);
      const head = guitarPoint(HELD, "head");
      const kPose: Pose = { ...KREST, armR: reach(rig, "R", interpolate(gest, [0, 1], [KB.x + 70, head.x - 40]), interpolate(gest, [0, 1], [1110, 1060]), 1) };
      cam = drift(on({ x: k(u, 0, len, 610, 600), y: 1062 }, k(u, 0, len, 1.82, 1.92)), f, 1.5);
      const sc = stampScale(u, TH, 10);
      const body = <Market f={f}
        seller={<KaiP x={KB.x} y={KB.y} pose={{ ...kPose, lookX: 0.7 }} expr={u >= TH ? "smile" : "calm"} f={f} t={f} />}
        onTable={<KaiTable guitar={null} />}
        items={[{ y: RY, el: <g>
          <RosaP x={RX} y={RY} pose={hold.pose} expr={u >= TH ? "worried" : "smile"} f={f} />
          <Guitar {...HELD} />
          <g transform={`translate(${head.x} ${head.y}) scale(${sc}) translate(${-head.x} ${-head.y})`}>{tagOn(HELD, 200, flip, Math.sin(u * 0.1) * 2, 0.78)}</g>
          <HandDot p={hold.hL} s={RS} skin={ROSA.skin} /><HandDot p={hold.hR} s={RS} skin={ROSA.skin} />
        </g> }]} />;
      return { cam, mood, body };
    }
    case "gasp": {   // Rosa's face: shock, kick on "drops", the guitar slips and she catches it; shades drop on "Two hundred?"
      mood = MOODS.close;
      const DR = Math.max(2, C("nearly drops", 3)), TH = C("Two hundred", 45);
      const h = u - DR;
      const slip = h < 0 ? 0 : Math.sin(Math.min(1, h / 16) * Math.PI) * Math.exp(-Math.max(0, h - 8) / 10);
      const g: GuitarPos = { ...HELD2, y: HELD.y + 60 * slip, rot: HELD.rot - 22 * slip };
      const lean = h < 0 ? 0 : -6 * Math.min(1, h / 4);
      const base: Pose = { ...STAND_POSE, lean };
      const hold = rosaWithGuitar(g, f, RX + BACK, RY, base);
      cam = kickCam(drift(on({ x: 862, y: 1060 }, k(u, 0, len, 2.2, 2.32)), f, 1.2), h, 22);
      const body = <Market f={f}
        seller={<KaiP x={KB.x} y={KB.y} pose={{ ...KREST, lookX: 0.8 }} expr="calm" f={f} t={f} />}
        onTable={<KaiTable guitar={null} />}
        items={[{ y: RY, el: <g>
          <RosaP x={RX + BACK} y={RY} pose={hold.pose} expr="shock" f={f} shades={u >= TH + 2} />
          <Guitar {...g} />
          {tagOn(g, 200, 1, Math.sin(u * 0.4) * 10 * (h < 0 ? 0.2 : Math.exp(-h / 20)), 0.78)}
          <HandDot p={hold.hL} s={RS} skin={ROSA.skin} /><HandDot p={hold.hR} s={RS} skin={ROSA.skin} />
        </g> }]} />;
      return { cam, mood, body, overlay: <SpeedLines amount={h >= 0 && h < 6 ? 0.22 * (1 - h / 6) : 0} angle={90} seed={5} /> };
    }
    case "advice": { // "Wait." - the scene freezes cold; the rule card slaps on and gets stamped on "never name"; on "Why did
      // it work?" the card leaves and Kai alone un-freezes, turns to us and smirks while the camera pushes to him
      const NV = C("never name", 30), WHY = C("Why did", Math.round(len * 0.65));
      mood = MOODS.freeze;
      const hold = rosaWithGuitar(HELD2, f, RX + BACK, RY, { ...STAND_POSE, lean: -6 });
      const alive = u >= WHY;
      const fk = alive ? f : f - u;
      const push = k(u, WHY, len, 0, 1);
      cam = on({ x: interpolate(push, [0, 1], [690, 660]), y: interpolate(push, [0, 1], [1050, 1010]) }, interpolate(push, [0, 1], [1.42, 1.62]) + k(u, 0, WHY, 0, 0.04));
      const body = <Market f={f - u}
        seller={<KaiP x={KB.x} y={KB.y} pose={{ ...KREST, headTilt: alive ? -7 * k(u, WHY, WHY + 8, 0, 1) : 0, lookX: alive ? 0 : 0.8 }}
          expr={alive ? "smirk" : "calm"} f={fk} t={alive ? f : undefined} />}
        onTable={<KaiTable guitar={null} />}
        items={[{ y: RY, el: <g>
          <RosaP x={RX + BACK} y={RY} pose={hold.pose} expr="shock" f={f - u} shades />
          <Guitar {...HELD2} />{tagOn(HELD2, 200, 1, 0, 0.78)}
          <HandDot p={hold.hL} s={RS} skin={ROSA.skin} /><HandDot p={hold.hR} s={RS} skin={ROSA.skin} />
        </g> }]} />;
      const IN = 4, inP = arrive(u, IN, 14), out = leave(u, WHY - 2, 8);
      const card = out < 1 && u >= IN ? <g opacity={Math.min(1, inP * 2) * (1 - out)} transform={`translate(0 ${(1 - inP) * -140 - out * 40})`}>
        <RuleCard x={540} y={480} text={"NEVER GO\nFIRST?"} scale={0.9} rot={-3 + (1 - inP) * -6} stamp={k(u, NV, NV + 8, 0, 1, EASE.arrive)} mark="cross" size={84} />
      </g> : null;
      return { cam, mood, body, labels: card };
    }
    case "study": {  // lab: two negotiators at a table; the left one slides the first-offer card across on "first offer";
      // on "better deal" coins stack up on her side, she cheers, the other shrugs
      mood = MOODS.lab;
      const FO = C("first offer", 40), BD = C("usually got", 95);
      const T0 = 1250, S = 1.15;
      const seats = negotiationSeats(540, T0, S, { left: u >= FO - 6 && u < FO + 12, right: false });
      const topY = negotiationTopY(T0, S);
      const slide = arrive(u, FO, 16);
      const win = u >= BD;
      const coins = Math.round(k(u, BD, BD + 14, 0, 5, EASE.arrive));
      cam = drift({ x: k(u, 0, len, -10, 10), y: 40, zoom: k(u, 0, len, 1.0, 1.07), rot: 0 }, f, 1.5);
      const lp = win ? { ...seats.left.pose, armL: [150, 10] as [number, number] } : seats.left.pose;
      const body = <Lab>
        <NegotiationTable x={540} y={T0} scale={S} />
        <Person {...seats.left} shadow={0} pose={lp} look={EXTRAS[1]} expr={win ? "cheer" : u >= FO ? "smirk" : "calm"} t={f} blink={blinkOf(f, 3)} />
        <Person {...seats.right} shadow={0} look={EXTRAS[0]} expr={win ? "worried" : u >= FO + 10 ? "focused" : "calm"} t={f} blink={blinkOf(f, 4)} />
        {u >= FO - 3 && <g opacity={k(u, FO - 3, FO + 1, 0, 1)}><OfferCard x={600} y={topY + 4} text={"$"} slide={slide} from={-200} scale={0.9} title="OFFER" /></g>}
        {coins > 0 && <Coins x={380} y={topY + 2} scale={1.0} count={coins} />}
        {win && <Check x={seats.left.x - 10} y={seats.left.y - 470 * S} s={pop(u, BD + 4)} />}
      </Lab>;
      const labels = <>
        <Label f={u} x={540} y={420} size={92} color={GOLD} enter="rise" enterAt={FO} exitAt={len - 9}>FIRST OFFER</Label>
        <Label f={u} x={540} y={540} size={92} color={GREEN} enter="words" enterAt={BD} exitAt={len - 9}>BETTER DEAL</Label>
      </>;
      return { cam, mood, body, labels };
    }
    case "anchor": { // lab: an anchor drops onto the gold first-number mark of a price line; on "dragged toward it" the haggling
      // range bends over toward it and the counteroffer chips slide after it
      mood = MOODS.lab;
      const AN = C("an anchor", 30), CO = C("Every counteroffer", 75), DG = C("dragged toward", 95);
      const PL = { x: 215, y: 1100, w: 650 }, AT = 0.86;
      const ax = priceLineX(PL, AT);
      const drop = k(u, AN - 12, AN, 0, 1, Easing.in(Easing.quad));
      const h = u - AN;
      const bend = k(u, DG - 4, DG + 30, 0, 1, EASE.arrive);
      const mark = 1, FN = C("first number", 4), fn = pop(u, FN, 10);
      cam = kickCam(drift({ x: 0, y: 60, zoom: k(u, 0, len, 1.28, 1.34), rot: 0 }, f, 1.2), h, 14);
      const chips = [0.12, 0.24, 0.36].map((c0, i) => {
        const p = k(u, CO + i * 5, DG + 34 + i * 5, 0, 1, EASE.arrive);
        return { x: priceLineX(PL, c0 + (0.56 + i * 0.07 - c0) * p), o: k(u, CO + i * 5, CO + i * 5 + 6, 0, 1) };
      });
      const body = <Lab>
        <g opacity={mark}><PriceLine {...PL} anchorAt={AT} rangeBend={bend} rangeW={0.32} /></g>
        {chips.map((c, i) => c.o > 0 && <g key={i} opacity={c.o}><circle cx={c.x} cy={PL.y - 44} r={24} fill={RED} stroke={INK} strokeWidth={6} />
          {bend > 0.05 && bend < 0.95 && <path d={`M ${c.x - 40} ${PL.y - 44} L ${c.x - 90} ${PL.y - 44}`} stroke={CREAM} strokeWidth={6} strokeLinecap="round" opacity={0.6} />}</g>)}
        {fn > 0 && drop < 1 && <circle cx={ax} cy={PL.y - 30} r={30 * fn} fill={GOLD} stroke={INK} strokeWidth={7} />}
        {drop > 0 && <Anchor x={ax} y={interpolate(drop, [0, 1], [-200, PL.y - 6])} scale={0.72} rot={h < 0 ? 0 : Math.sin(h * 0.6) * 6 * Math.exp(-h / 8)} />}
        {h >= 0 && h < 14 && <ellipse cx={ax} cy={PL.y} rx={60 + h * 9} ry={14 + h * 2} fill="none" stroke={GOLD} strokeWidth={6} opacity={1 - h / 14} />}
      </Lab>;
      const labels = <Label f={u} x={540} y={430} size={110} color={GOLD} enter="scale" enterAt={AN + 6} exitAt={len - 8}>ANCHOR</Label>;
      return { cam, mood, body, labels };
    }
    case "wheel": {  // lab: a wheel of fortune idles, spins and stops on 10 -> the first guess bar grows to 25 %; then spins to 65
      // -> the second bar grows to 45 % (two beats)
      mood = MOODS.lab;
      const LBL = ["10", "35", "65", "20", "80", "50"];
      const S10 = C("saw ten", Math.round(len * 0.4)), G25 = C("guessed twenty", Math.round(len * 0.5));
      const S65 = C("Those who saw", Math.round(len * 0.66)), G45 = C("guessed forty", Math.round(len * 0.85));
      const a10 = wheelAngleFor(6, 0, 3), a65 = a10 + wheelAngleFor(6, 2, 3) - (wheelAngleFor(6, 0, 0));
      const idle = u * 1.2;
      const spinA = k(u, S10 - 34, S10 + 2, 0, 1, EASE.arrive);
      const spinB = k(u, S65 - 4, S65 + 34, 0, 1, EASE.arrive);
      const angle = idle * (1 - spinA) + (spinA * a10) + spinB * (a65 - a10);
      const stopA = u >= S10 + 2 && u < S65 - 4, stopB = u >= S65 + 34;
      const BY = 1130, BH = 560, BW = 150, XA = 680, XB = 880;
      const vA = k(u, G25, G25 + 22, 0, 0.5, EASE.arrive), vB = k(u, G45, G45 + 22, 0, 0.9, EASE.arrive);
      const nA = countValue(u, G25, 22, 0, 25), nB = countValue(u, G45, 22, 0, 45);
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 1.5);
      const vt = (x: number, val: number, n: number, at: number, col: string) => val <= 0 ? null : (() => {
        const ty = BY - BH * val - 26, sc = stampScale(u, at, 22);
        return <g transform={`translate(${x} ${ty}) scale(${sc})`}><text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={col}>{n}%</text></g>;
      })();
      const body = <Lab>
        <Wheel x={285} y={770} r={205} angle={angle} labels={LBL} highlight={stopA ? 0 : stopB ? 2 : undefined} />
        <GuessBar x={XA} y={BY} w={BW} h={BH} value={vA} colour={"#2d6fd8"} />
        <GuessBar x={XB} y={BY} w={BW} h={BH} value={vB} colour={ORANGE} />
        {[[XA, "10", "#7fb2ff"], [XB, "65", ORANGE]].map(([x, n, c]) => <g key={n}>
          <text x={x} y={BY + 48} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={MUTED}>SAW</text>
          <text x={x} y={BY + 112} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={c as string}>{n}</text>
        </g>)}
        {vt(XA, vA, nA, G25, "#7fb2ff")}
        {vt(XB, vB, nB, G45, ORANGE)}
      </Lab>;
      const labels = <>
        <ArrowLabel f={u} y={420} left="SAW 10" right="GUESSED 25%" color="#7fb2ff" enterAt={G25} exitAt={S65 - 6} />
        <ArrowLabel f={u} y={420} left="SAW 65" right="GUESSED 45%" color={ORANGE} enterAt={G45} exitAt={len - 8} />
      </>;
      return { cam, mood, body, labels };
    }
    case "pull": {   // lab: the final-price dot slides toward the anchor mark; "know the real value" lights a green zone;
      // "go too wild": the anchor leaps off the end, the dot turns red, and the buyer turns and walks away
      mood = MOODS.lab;
      const KV = C("know the real", Math.round(len * 0.35)), GW = C("Go too wild", Math.round(len * 0.68)), BW = C("buyers walk", Math.round(len * 0.85));
      const SL = { x: 200, y: 780, w: 640 };
      const wild = k(u, GW, GW + 14, 0, 1, EASE.arrive);
      const markAt = 0.72 + 0.26 * wild;
      const val = k(u, 4, 40, 0.18, 0.66, EASE.arrive) + 0.3 * k(u, GW + 4, GW + 20, 0, 1, EASE.arrive);
      const zone = k(u, KV, KV + 10, 0, 1, EASE.arrive) * (1 - 0.6 * wild);
      const walkT = u - Math.min(BW - 8, GW + 18);
      const bx = walkT < 0 ? 760 : 760 + walkT * 14;
      const walking = walkT >= 0;
      const bExpr: Expr = u >= GW + 6 ? (walking ? "worried" : "shock") : u >= KV ? "smile" : "calm";
      const ax = SL.x + SL.w * markAt;
      const tooFar = wild > 0.5;
      cam = drift({ x: 0, y: 40, zoom: k(u, 0, len, 1.22, 1.28), rot: 0 }, f, 1.2);
      const body = <Lab>
        <rect x={SL.x + SL.w * 0.5} y={SL.y - 40} width={SL.w * 0.3} height={80} rx={18} fill={GREEN} opacity={0.32 * zone} />
        <PriceSlider {...SL} value={val} markAt={markAt} color={tooFar ? RED : GOLD} />
        <Anchor x={ax} y={SL.y - 34} scale={0.26} rot={wild > 0 && wild < 1 ? Math.sin(u) * 8 : 0} />
        {zone > 0.01 && <Check x={SL.x + SL.w * 0.65} y={SL.y + 110} s={pop(u, KV + 6) * (1 - wild)} />}
        {tooFar && <Check x={SL.x + SL.w * 0.98} y={SL.y + 110} s={pop(u, GW + 14)} ok={false} />}
        {bx < 1300 && <Person x={bx} y={1250} scale={1.0} facing={walking ? 1 : -1} look={EXTRAS[5]} pose={walking ? walkPose(walkT * 0.32) : STAND_POSE}
          expr={bExpr} t={walking ? undefined : f} blink={blinkOf(f, 6)} />}
        {walking && bx < 1250 && <Notes x={bx - 30} y={1100} scale={0.6} count={2} rot={-10} />}
      </Lab>;
      const labels = <Label f={u} x={510} y={430} size={78} color={GREEN} enter="words" enterAt={KV} exitAt={len - 8}>KNOW THE VALUE</Label>;
      return { cam, mood, body, labels };
    }
    case "counter": { // market two-shot: Rosa counters "$100" (bubble), Kai's "$200" bubble is there; on "meet at" the bubbles
      // slide toward each other (closer to Kai's side) and give way to one gold "$160" tag that counts up and stamps
      const OH = C("one hundred", 22), MT = C("meet at", 60), OS = C("one sixty", 80);
      const hold = rosaWithGuitar(HELD, f, RX, RY, STAND_POSE);
      cam = drift(on({ x: k(u, 0, len, 640, 660), y: 1010 }, k(u, 0, len, 1.3, 1.36)), f, 1.6);
      const body = <Market f={f}
        seller={<KaiP x={KB.x} y={KB.y} pose={{ ...KREST, lookX: 0.8 }} expr={u >= OS ? "smile" : "focused"} f={f} t={f} />}
        onTable={<KaiTable guitar={null} />}
        items={[{ y: RY, el: <g>
          <RosaP x={RX} y={RY} pose={hold.pose} expr={u >= OS ? "smile" : "determined"} f={f} />
          <Guitar {...HELD} />{tagOn(HELD, 200, 1, Math.sin(u * 0.1) * 2, 0.78)}
          <HandDot p={hold.hL} s={RS} skin={ROSA.skin} /><HandDot p={hold.hR} s={RS} skin={ROSA.skin} />
        </g> }]} />;
      const kh = toS(cam, { x: KB.x, y: 860 }), rh = toS(cam, { x: RX, y: 960 });
      const meet = k(u, MT, MT + 10, 0, 1, EASE.exit), gone = leave(u, MT + 2, 8);
      const mx = kh.x + (rh.x - kh.x) * 0.4;
      const kb = { x: kh.x + (mx - kh.x) * meet * 0.6, y: 600 }, rb = { x: rh.x + (mx - rh.x) * meet * 0.6, y: 600 };
      const n = countValue(u, OS - 6, 14, 100, 160);
      const labels = <>
        <Bubble x={kb.x} y={kb.y} text="$200" p={arrive(u, 2, 12)} out={gone} to={{ x: kh.x, y: kh.y - 40 }} s={0.9} />
        <Bubble x={rb.x} y={rb.y} text="$100" p={arrive(u, OH, 12)} out={gone} to={{ x: rh.x, y: rh.y - 40 }} fill="#ffe8e2" s={0.9} />
        {u >= MT + 10 && <g transform={`translate(${mx} 600) scale(${stampScale(u, OS - 6, 14) * (0.7 + 0.3 * arrive(u, MT + 10, 12))})`} opacity={arrive(u, MT + 10, 8) * (1 - leave(u, len - 7))}>
          <rect x={-150} y={-74} width={300} height={140} rx={30} fill={GOLD} stroke={INK} strokeWidth={9} />
          <text x={0} y={32} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={92} fill={INK}>${n}</text>
        </g>}
      </>;
      return { cam, mood, body, labels };
    }
    case "deal": {   // "Deal": handshake close-up over the table; then "Rosa still thinks she won": Rosa hugs the guitar,
      // beaming, while Kai counts the notes behind her with a smirk
      const RW = C("Rosa still", Math.round(len * 0.45));
      if (u < RW) {
        mood = MOODS.close;
        cam = drift(on({ x: 540, y: 1060 }, 2.4), f, 1);
        const grip = k(u, 0, 10, 0.3, 1, EASE.arrive), shake = u > 10 ? Math.sin((u - 10) * 0.7) * 22 * Math.exp(-(u - 10) / 30) : 0;
        const body = <>
          <Market f={f} onTable={<KaiTable guitar={null} />} bunting={false} />
          <Layer p={1}><AbsoluteFill style={{ background: "rgba(255,240,210,0.35)" }} /></Layer>
          <Layer p={0}><Svg><Handshake x={540} y={960} scale={0.95} skinA={KAI.skin} skinB={ROSA.skin} sleeveA={KAI.jersey} sleeveB={ROSA.jersey} grip={grip} shake={shake} /></Svg></Layer>
        </>;
        return { cam, mood, body };
      }
      const w = u - RW;
      const g: GuitarPos = { x: RX + 60, y: 1335, scale: GSC, rot: -42 };
      const hold = rosaWithGuitar(g, f, RX, RY, { ...STAND_POSE, headTilt: 6 });
      cam = drift(on({ x: 700, y: 1040 }, k(w, 0, len - RW, 1.95, 2.05)), f, 1.2);
      const kr: Rig = { x: KB.x, y: KB.y, s: KB.scale, facing: 1, pose: STAND_POSE, t: f };
      const kPose: Pose = { ...STAND_POSE, armL: reach(kr, "L", KB.x - 20, 1080, -1), armR: reach(kr, "R", KB.x + 20, 1080, 1) };
      const body = <Market f={f}
        seller={<g><KaiP x={KB.x} y={KB.y} pose={{ ...kPose, lookX: -0.4 }} expr="smirk" f={f} t={f} /><Notes x={KB.x} y={1074} scale={0.6} count={3} fan={20 + Math.sin(w * 0.5) * 8} /></g>}
        onTable={<KaiTable guitar={null} />}
        items={[{ y: RY, el: <g>
          <RosaP x={RX} y={RY} pose={hold.pose} expr="cheer" f={f} t={f} />
          <Guitar {...g} />
          <HandDot p={hold.hL} s={RS} skin={ROSA.skin} /><HandDot p={hold.hR} s={RS} skin={ROSA.skin} />
        </g> }]} />;
      return { cam, mood, body };
    }
    case "twist": {  // next Saturday: Rosa behind her own stall (green awning) with a record crate; Kai strolls up as a shopper;
      // on "names her price first" she taps the crate tag, it flips to $40, she smirks - Kai's jaw drops
      const OW = C("runs her own", 24), NP = C("names her price", Math.round(len * 0.55));
      const RB = behindStall(ROSA_STALL);
      const kx = k(u, 0, OW + 14, 150, 270, EASE.arrive), kWalk = u < OW + 8;
      const tie = { x: 770, y: 1018 };
      const rig: Rig = { x: RB.x, y: RB.y, s: RB.scale, facing: 1, pose: STAND_POSE, t: f };
      const tap = k(u, NP - 8, NP, 0, 1, EASE.arrive) * (1 - k(u, NP + 10, NP + 18, 0, 1, EASE.exit));
      const rest = handAt(rig, "R");
      const rPose: Pose = { ...STAND_POSE, armL: [18, -30], armR: tap > 0.01 ? reach(rig, "R", rest.x + (tie.x - 20 - rest.x) * tap, rest.y + (tie.y + 70 - rest.y) * tap, 1) : [18, -30] };
      const flip = k(u, NP, NP + 10, 0, 1, EASE.arrive);
      cam = drift(on({ x: k(u, 0, len, 520, 545), y: 1100 }, k(u, 0, len, 1.42, 1.5)), f, 1.5);
      const body = <Market f={f} stall={ROSA_STALL}
        seller={<RosaP x={RB.x} y={RB.y} s={RB.scale} pose={rPose} expr={u >= NP ? "smirk" : "smile"} f={f} t={f} tote={false} />}
        onTable={<g>
          <Crate x={tie.x - 60} y={stallTopY(ROSA_STALL)} scale={0.9} />
          <Crate x={430} y={stallTopY(ROSA_STALL)} scale={0.9} />
          <PriceTag x={tie.x} y={tie.y} text={40} flip={flip} rot={Math.sin(u * 0.12) * 3} scale={0.72} />
        </g>}
        items={[{ y: RY, el: <KaiP x={kx} y={RY} s={1.03} facing={1} pose={kWalk ? walkPose(u * 0.3) : { ...STAND_POSE, lookX: 0.6 }}
          expr={u >= NP + 4 ? "shock" : "smile"} f={f} t={kWalk ? undefined : f} /> }]} />;
      return { cam, mood, body };
    }
    default: {       // ask: pull out wide over the market from Rosa's stall; Kai pays for a record, shoppers stroll, bunting flutters
      const pull = k(u, 0, len, 0, 1);
      cam = drift({ x: interpolate(pull, [0, 1], [-10, 0]), y: interpolate(pull, [0, 1], [110, -40]), zoom: interpolate(pull, [0, 1], [1.5, 1.0]), rot: 0 }, f, 1.5);
      const RB = behindStall(ROSA_STALL);
      const kr: Rig = { x: 290, y: RY, s: 1.03, facing: 1, pose: STAND_POSE, t: f };
      const give = k(u, 10, 30, 0, 1, EASE.arrive);
      const kPose: Pose = { ...STAND_POSE, armR: reach(kr, "R", 290 + 60 + 70 * give, 1180 - 40 * give, 1), lookX: 0.6 };
      const kh = handAt({ ...kr, pose: kPose }, "R");
      const body = <Market f={f} stall={ROSA_STALL} strollers={2}
        seller={<RosaP x={RB.x} y={RB.y} s={RB.scale} pose={{ ...STAND_POSE, armL: [18, -30], armR: [18, -30] }} expr="smirk" f={f} t={f} tote={false} />}
        onTable={<g>
          <Crate x={710} y={stallTopY(ROSA_STALL)} scale={0.9} />
          <Crate x={430} y={stallTopY(ROSA_STALL)} scale={0.9} />
          <PriceTag x={770} y={1018} text={40} flip={1} rot={Math.sin(u * 0.12) * 3} scale={0.72} />
        </g>}
        items={[
          { y: RY, el: <g><KaiP x={290} y={RY} s={1.03} pose={kPose} expr="worried" f={f} t={f} /><Notes x={kh.x + 10} y={kh.y - 6} scale={0.5} count={2} rot={-20} /></g> },
        ]} />;
      return { cam, mood, body };
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
  const fade = prev && u < XF && (PLACE[prev.id] ?? "market") !== (PLACE[span.id] ?? "market");
  return (
    <Words.Provider value={words}><AbsoluteFill>
      <NoText.Provider value={!!fade}><ShotView span={span} spans={spans} /></NoText.Provider>
      {fade && prev && <NoText.Provider value><AbsoluteFill style={{ opacity: 1 - (u + 1) / (XF + 1) }}><ShotView span={prev} spans={spans} freezeAt={prev.b - 1} /></AbsoluteFill></NoText.Provider>}
    </AbsoluteFill></Words.Provider>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "first-offer",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: MARKET.sky,
};
export default story;
