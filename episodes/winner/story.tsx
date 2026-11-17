// "The Winner Paid the Most and Lost" - 2.5D. A school charity auction night in the gym hall: Ben outbids everyone for a
// giant jar of coins ($25) and finds $18 inside. Facts (see RESEARCH.md): the winner's curse - in an auction for an item
// of unknown value the winner tends to be the one who overestimated it most (Capen, Clapp & Campbell 1971, offshore oil
// leases); classroom coin-jar auctions: jar worth $8, average guess ~$5 (below the value), winning bid ~$10 (above it)
// (Bazerman & Samuelson 1983). Fix: bid below your own estimate, further below with more bidders.
// Hall layout (stage view): HallBackdrop y -160 -> floor line 1140, stage boards 930. Podium + auctioneer on the stage
// left (x 300), the jar on a small table on the stage right (x 700). Seated parents (seen from behind) in three rows
// y 1200-1330 (chair legs end ~1380, above the caption band); Ben stands in the right aisle (x 955, feet 1330).
// Reverse view (bidding): the wall behind the audience (doors), parents facing the camera, Ben in front on a chair.
// Motion rules (src/engine25/motion.tsx): arrivals EASE.arrive, exits shorter EASE.exit, camera EASE.camera; every
// label enters and exits (Label), numbers count, stop and stamp; nothing holds still for more than ~3 s.
// On-screen text is drawn in screen space (overlay) inside SAFE_TEXT (y 300-1350, x 60-960) and hidden in crossfades,
// in-scene text (paddle numbers, price board, tag, sign) too.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, ShotSpan, cueTime, FPS } from "../../src/engine/timeline";
import type { Word } from "../../src/captions/Captions";
import { Stage, Layer, Svg, Cam, drift, kickCam } from "../../src/engine25/stage";
import { Grade, Mood, Pool, Flash } from "../../src/engine25/light";
import { EASE, arrive, leave, camMove, Label, countValue, stampScale } from "../../src/engine25/motion";
import { Person, Look, INK, Expr, Pose } from "../../library/characters25/person";
import { CAST, EXTRAS } from "../../library/style/channel";
import { Lab, LAB } from "../../library/environments25/lab";
import { sitPose, sitY } from "../../library/environments25/cafe";
import { AUCTION, hallGeom, HallBackdrop, HallFloor, FoldingChair, FoldingLap, HallTable, behindTable, TableHands, tableGeom, tablePoint,
  handPos, CrowdRows, CrowdRowsProps, CrowdBid, Paddle, Podium, podiumTop, behindPodium, GavelBlock, Gavel, auctioneerBang, BangLines,
  CoinPile, CoinStack, CoinJar, SoldSign, PriceBoard, QuestionTag, Confetti, Auctioneer, GuessDots, guessX, BarTrio, OilDerrick, MapPatch,
  BidSlider } from "../../library/environments25/auction";
import scenes from "../../content/scripts/winner.json";

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
  hall: { grade: "#ff9a4a", gradeOp: 0.06, vignette: 0.4, glow: "#ffe2a8" },       // warm school-hall evening
  close: { grade: "#ff8a3a", gradeOp: 0.08, vignette: 0.5, glow: "#ffe2a8" },
  freeze: { grade: "#1b2a6b", gradeOp: 0.42, vignette: 0.72 },                    // "Wait." - cold freeze-frame
  lab: { grade: "#0b1430", gradeOp: 0.04, vignette: 0.45 },
};

const k = (u: number, a: number, b: number, from: number, to: number, e = EASE.camera) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
type Pt = { x: number; y: number };
const { gold: GOLD, red: RED, green: GREEN, muted: MUTED, text: CREAM, orange: ORANGE } = LAB;
const FONT = "CaptionSans, sans-serif";
const pop = (u: number, a: number, d = 9) => (u < a ? 0 : k(u, a, a + d, 0, 1, Easing.out(Easing.back(2.2))));
const blinkOf = (f: number, seed: number) => ((f + seed * 37) % 103) < 4;

/** false while a crossfade runs: then in-scene text (paddle numbers, board, tag, sign) is blanked too. Set by ShotView
 *  right before it builds the shot (rendering is synchronous), read by the helpers below. */
let SCENE_TEXT = true;
const txt = <V,>(v: V, blank: V): V => (SCENE_TEXT ? v : blank);

// ---------------------------------------------------------------- cast + set geometry
const BEN: Look = CAST.ben, AUC: Look = CAST.auctioneer, PARENT: Look = CAST.parent1;
const HY = -160, HH = 1300;                                  // hall backdrop (stage view)
const G = hallGeom(HY, HH);                                  // ground 1140, stageTop 930
const POD = { x: 300, y: G.stageTop, scale: 0.8 };
const AUCP = behindPodium(POD, -6);
const BLOCK = { x: POD.x + 64, y: podiumTop(POD) - 2 };
const JT = tableGeom(700, G.stageTop, 320);                  // jar table on the stage
const JAR_AT = (() => { const [x, y] = tablePoint(JT, 0.5, 0.5); return { x, y: y + 4 }; })();
const CROWD: CrowdRowsProps = { f: 0, rows: 3, y0: 1200, rowH: 65, size: 54, x0: -60, w: 920, view: "back", seed: 4 };
const BEN_AISLE = { x: 955, y: 1330, s: 0.78 };
const STAND: Pose = { armL: [12, -6], armR: [12, -6], legL: [6, 0], legR: [6, 0] };
const walkLegs = (ph: number): Pose => ({ ...STAND, legL: [Math.sin(ph) * 14, 0], legR: [-Math.sin(ph) * 14, 0] });

/** world (subject plane, p = 1) -> screen, for overlays that must stay in the safe text box */
const toS = (c: Cam, p: Pt): Pt => ({ x: (p.x - 540 - c.x) * c.zoom + 540, y: (p.y - 960 - c.y) * c.zoom + 960 });
const on = (p: Pt, zoom: number, rot = 0): Cam => ({ x: p.x - 540, y: p.y - 960, zoom, rot });

// ---------------------------------------------------------------- hall pieces
/** the stage-view hall: backdrop + floor (+ podium, auctioneer, jar table) and items sorted by depth */
type Item = { y: number; el: React.ReactNode };
const Hall: React.FC<{ f: number; stage?: React.ReactNode; items?: Item[]; crowd?: Partial<CrowdRowsProps> | null; over?: React.ReactNode }> =
  ({ f, stage, items = [], crowd = {}, over }) => (
    <>
      <Layer p={0.6}><Svg><HallBackdrop y={HY} h={HH} /></Svg></Layer>
      <Layer p={1}><Svg>
        <HallFloor y={G.ground} h={900} />
        {stage}
        {crowd && <CrowdRows {...CROWD} {...crowd} f={f} />}
        {[...items].sort((a, b) => a.y - b.y).map((it, i) => <React.Fragment key={i}>{it.el}</React.Fragment>)}
        {over}
      </Svg></Layer>
    </>
  );

/** the stage: auctioneer behind the podium (gavel resting or banging at `bangAt`), jar on its table */
const StageSet: React.FC<{ f: number; u: number; bangAt?: number; jar?: boolean; jarFill?: number; expr?: Expr; point?: number; table?: boolean }> =
  ({ f, u, bangAt, jar = true, jarFill = 0.85, expr = "smile", point = 0, table = true }) => {
    const base: Pose = { ...STAND, armL: [14 + 70 * point, -10 - 20 * point] };
    const bang = auctioneerBang({ ...AUCP, facing: 1, pose: base }, BLOCK, u, bangAt ?? -1000);
    return (
      <g>
        <Auctioneer {...AUCP} look={AUC} pose={{ ...bang.pose, lookX: 0.4 }} expr={expr} blink={blinkOf(f, 7)} />
        <Podium {...POD} />
        <GavelBlock x={BLOCK.x} y={BLOCK.y + 2} scale={POD.scale} />
        <Gavel {...bang.gavel} hand={AUC.skin} />
        <BangLines x={BLOCK.x} y={BLOCK.y - 10} impact={bang.impact} scale={0.8} />
        {table && <HallTable x={JT.x} y={JT.y} w={JT.w} />}
        {table && jar && <CoinJar x={JAR_AT.x} y={JAR_AT.y} scale={0.5} fill={jarFill} />}
      </g>
    );
  };

/** a standing person holding a paddle in the right hand (up 0..1 raises it overhead) */
const PaddlePerson: React.FC<{ x: number; y: number; s: number; look: Look; up: number; num?: string | number; expr: Expr; f: number; seed: number;
  t?: number; lookX?: number; headTilt?: number; jump?: number; other?: [number, number]; back?: boolean }> =
  ({ x, y, s, look, up, num, expr, f, seed, t, lookX = 0, headTilt = 0, jump = 0, other = [12, -6], back }) => {
    const pose: Pose = { ...STAND, armL: other, armR: [12 + 148 * up, -6 + 14 * up], lookX, headTilt };
    const yy = y - jump;
    const h = handPos({ x, y: yy, scale: s, facing: 1, pose, t }, "R");
    return <g>
      <Person x={x} y={yy} scale={s} look={look} pose={pose} expr={expr} blink={blinkOf(f, seed)} t={t} shadow={jump > 4 ? 0.15 : 0.35} />
      <Paddle x={h.x} y={h.y + 14 * s} scale={0.62 * s} number={txt(num, undefined)} rot={(1 - up) * 70} back={back} />
      <circle cx={h.x} cy={h.y} r={8 * s} fill={look.skin} stroke={INK} strokeWidth={4.2 * s} />
    </g>;
  };

// ---------------------------------------------------------------- overlay helpers (screen space)
/** a two-part label with a drawn arrow between (the font's arrow glyph is not trusted) */
const ArrowLabel: React.FC<{ f: number; y: number; left: string; right: string; color: string; enterAt: number; exitAt: number; ax?: number; size?: number }> =
  ({ f, y, left, right, color, enterAt, exitAt, ax = 560, size = 54 }) => {
    if (f < enterAt) return null;
    const out = Number.isFinite(exitAt) ? leave(f, exitAt) : 0;
    if (out >= 1) return null;
    const p1 = arrive(f, enterAt, 12), p2 = arrive(f, enterAt + 4, 12), p3 = arrive(f, enterAt + 8, 12);
    const common = { fontFamily: FONT, fontWeight: 900, fontSize: size };
    return <g opacity={1 - out} transform={`translate(0 ${-out * 20})`}>
      <text x={ax - 24} y={y + (1 - p1) * 34} textAnchor="end" {...common} fill={CREAM} opacity={p1}>{left}</text>
      <g opacity={p2} transform={`translate(${ax} ${y - size * 0.36})`}>
        <path d={`M 0 0 L ${56 * p2} 0`} stroke={color} strokeWidth={12} strokeLinecap="round" />
        <path d={`M ${56 * p2 - 20} -18 L ${56 * p2 + 4} 0 L ${56 * p2 - 20} 18`} stroke={color} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x={ax + 88} y={y + (1 - p3) * 34} textAnchor="start" {...common} fill={color} opacity={p3}>{right}</text>
    </g>;
  };
/** a Label on a dark card (for hall shots, so text never sits straight on the busy set) */
const CardLabel: React.FC<React.ComponentProps<typeof Label>> = (p) => {
  if (p.hidden || p.f < p.enterAt) return null;
  const o = arrive(p.f, p.enterAt, 10) * (Number.isFinite(p.exitAt) ? 1 - leave(p.f, p.exitAt) : 1);
  if (o <= 0) return null;
  const w = p.children.length * p.size * 0.68 + 70;
  return <g>
    <rect x={p.x - w / 2} y={p.y - p.size * 0.98} width={w} height={p.size * 1.34} rx={24} fill={INK} opacity={0.8 * o} />
    <Label {...p} />
  </g>;
};
/** a counter label (gold card) that counts, stops and is stamped */
const CountCard: React.FC<{ f: number; x: number; y: number; prefix: string; n: number; startAt: number; dur: number; exitAt: number; color?: string; size?: number; w?: number }> =
  ({ f, x, y, prefix, n, startAt, dur, exitAt, color = GOLD, size = 76, w = 560 }) => {
    if (f < startAt) return null;
    const out = leave(f, exitAt);
    if (out >= 1) return null;
    const p = arrive(f, startAt, 10), sc = stampScale(f, startAt, dur) * (0.8 + 0.2 * p);
    return <g opacity={p * (1 - out)} transform={`translate(${x} ${y - out * 20}) scale(${sc})`}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.32} rx={26} fill={INK} opacity={0.82} stroke={color} strokeWidth={7} />
      <text x={0} y={size * 0.12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color}>{prefix}{n}</text>
    </g>;
  };

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
      <Stage cam={v.cam} bg={v.bg ?? (lab ? LAB.bg : AUCTION.ceiling)}>{v.body}</Stage>
      {!lab && <Pool x={540} y={620} rx={760} ry={760} color="#fff2c4" opacity={0.2} />}
      <Grade mood={v.mood} />
      {v.cold ? <Grade mood={MOODS.freeze} strength={v.cold} /> : null}
      {v.overlay}
      {!noText && v.labels && <AbsoluteFill><svg width={1080} height={1920} viewBox="0 0 1080 1920">{v.labels}</svg></AbsoluteFill>}
    </AbsoluteFill>
  );
};

// guesses for the lab shots: average ~5.6 sits below the true value 8, the highest guess (13) far above it
const TRUTH = 8;
const GUESSES = [5, 9, 3, 6, 4, 13, 5.5, 2, 7, 4.5, 6.5, 3, 10, 5, 2.5, 6, 4, 7.5, 3.5, 5];
const GD = { x: 120, y: 1250, w: 840, values: GUESSES, truth: TRUTH, domain: [0, 14] as [number, number], dot: 46 };
const AVG = GUESSES.reduce((a, b) => a + b, 0) / GUESSES.length;

const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number): View => {
  let cam: Cam = { x: 0, y: 0, zoom: 1, rot: 0 };
  let mood = MOODS.hall;
  switch (id) {
    case "hook": {   // close on Ben on the hall floor in front of the stage: arms up, paddle high, confetti raining, the jar on
      // the stage table beside him; on "lost money" his arms sink, the smile goes, the grade turns cold and we push in
      mood = MOODS.close;
      const LM = C("lost money", 70);
      const drop = k(u, LM - 2, LM + 14, 0, 1, EASE.arrive);
      const bx = 520, by = 1250, s = 1.0;
      const bounce = drop > 0 ? 0 : Math.abs(Math.sin(u * 0.22)) * 22;
      const pose: Pose = { ...STAND, armL: [160 - 140 * drop, 8 - 14 * drop], armR: [160 - 140 * drop, 8 - 14 * drop], lookX: drop * 0.5, headTilt: drop * 6 };
      const h = handPos({ x: bx, y: by - bounce, scale: s, facing: 1, pose }, "R");
      const push = k(u, LM, len, 0, 1);
      cam = drift(on({ x: interpolate(push, [0, 1], [590, 540]), y: interpolate(push, [0, 1], [880, 860]) }, interpolate(push, [0, 1], [1.6, 1.95])), f, 1.4);
      const body = <Hall f={f} crowd={null}
        stage={<StageSet f={f} u={u} jarFill={0.85} expr="laugh" />}
        items={[{ y: by, el: <g>
          <Person x={bx} y={by - bounce} scale={s} look={BEN} pose={pose} expr={drop > 0.3 ? "worried" : "cheer"} blink={blinkOf(f, 1)} shadow={bounce > 6 ? 0.15 : 0.35} />
          <Paddle x={h.x} y={h.y + 14} scale={0.62} number={txt(7, undefined)} rot={-10 + 60 * drop} />
          <circle cx={h.x} cy={h.y} r={8} fill={BEN.skin} stroke={INK} strokeWidth={4.2} />
        </g> }]}
        over={<g opacity={1 - 0.6 * drop}>
          <Confetti x={380} y={760} f={u + 12} count={50} spread={1.5} power={0.75} seed={2} />
          <Confetti x={700} y={740} f={u + 6} count={50} spread={1.5} power={0.75} seed={5} />
        </g>} />;
      return { cam, mood, body, cold: 0.85 * drop };
    }
    case "wide": {   // wide hall: stage + bunting, the auctioneer at the podium, parents on folding chairs (from behind), Ben in
      // the aisle; on "paddles" two parents lift paddles, on "jar of coins" the camera drifts over to the jar
      const PD = C("paddles", 40), JC = C("jar of coins", 90);
      const bids: CrowdBid[] = [
        { row: 1, col: 3, up: arrive(u, PD, 10) * (1 - k(u, PD + 40, PD + 50, 0, 1, EASE.exit)) },
        { row: 2, col: 6, up: arrive(u, PD + 5, 10) * (1 - k(u, PD + 46, PD + 56, 0, 1, EASE.exit)), side: 1 },
      ];
      cam = drift({ x: k(u, JC - 10, len, -10, 30), y: k(u, 0, len, 30, 10), zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 2);
      const body = <Hall f={f} crowd={{ bids }}
        stage={<StageSet f={f} u={u} point={k(u, JC - 6, JC + 8, 0, 1, EASE.arrive)} />}
        items={[{ y: BEN_AISLE.y, el: <PaddlePerson {...BEN_AISLE} look={BEN} up={0} num={7} expr="smile" f={f} seed={1} t={f} lookX={-0.6} /> }]} />;
      return { cam, mood, body };
    }
    case "jar": {    // close on the jar on the stage table; the "HOW MUCH?" tag drops in on "Nobody knows" and swings; a slow push
      mood = MOODS.close;
      const NK = C("Nobody knows", 2), EG = C("Everyone guesses", 40);
      cam = drift(on({ x: k(u, 0, len, 690, 700), y: k(u, 0, len, 560, 545) }, k(u, 0, len, 2.2, 2.55)), f, 1);
      const drop = arrive(u, NK + 4, 14), h = u - (NK + 4);
      const swing = h < 0 ? 0 : Math.sin(h * 0.25) * 14 * Math.exp(-h / 26) + Math.sin(u * 0.08) * 2;
      const shake = u >= EG && u < EG + 14 ? Math.sin((u - EG) * 1.4) * 6 * (1 - (u - EG) / 14) : 0;
      const body = <Hall f={f} crowd={null}
        stage={<g>
          <StageSet f={f} u={u} jar={false} />
          <g transform={`rotate(${shake} ${JAR_AT.x} ${JAR_AT.y})`}><CoinJar x={JAR_AT.x} y={JAR_AT.y} scale={0.5} fill={0.85} /></g>
        </g>} />;
      const labels = drop > 0 ? <g opacity={Math.min(1, drop * 2) * (1 - leave(u, len - 7))} transform={`translate(0 ${(1 - drop) * -200})`}>
        <QuestionTag x={150} y={340} text="HOW MUCH?" scale={1.45} rot={swing + 4} twine={50} />
      </g> : null;
      return { cam, mood, body, labels };
    }
    case "bidding": { // reverse angle: parents face us, the price board hangs over the doors; paddles shoot up on "Ten", "Fifteen",
      // "Twenty" and the board flips $10 -> $15 -> $20; Ben (front, on a folding chair) keeps his paddle up, determined
      const T10 = C("Ten dollars", 2), T15 = C("Fifteen", 28), T20 = C("Twenty", 50), KP = C("keeps his", 80);
      const RY = -260, RG = RY + 1300;                                   // ground 1040
      const crowd: CrowdRowsProps = { f, rows: 3, y0: 1050, rowH: 70, size: 52, view: "front", seed: 9, x0: -80, w: 1240 };
      const upA = arrive(u, T10, 9) * (1 - k(u, T15 + 4, T15 + 12, 0, 1, EASE.exit));
      const upC = arrive(u, T20, 9) * (1 - k(u, KP - 4, KP + 4, 0, 1, EASE.exit));
      const bids: CrowdBid[] = [
        { row: 1, col: 4, up: upA, number: txt(12, undefined), side: 1 },
        { row: 0, col: 8, up: upC, number: txt(31, undefined), side: -1 },
      ];
      const benUp = arrive(u, T15, 8);
      const val = u >= T20 ? "$20" : u >= T15 ? "$15" : "$10", prev = u >= T20 ? "$15" : u >= T15 ? "$10" : "$10";
      const at = u >= T20 ? T20 : T15;
      const flip = u >= T15 ? k(u, at, at + 8, 0, 1, EASE.linear) : 1;
      const bp = { x: 710, s: 1.05 }, floor = 1330;
      const bpose: Pose = sitPose("front", { armL: [22, -40], armR: [22 + 140 * benUp, -40 + 50 * benUp] }, { lookX: -0.5 + 0.5 * benUp });
      const bY = sitY(floor, bp.s, bpose);
      const bh = handPos({ x: bp.x, y: bY, scale: bp.s, facing: 1, pose: bpose }, "R");
      cam = drift(on({ x: k(u, 0, len, 570, 600), y: k(u, 0, len, 975, 985) }, k(u, 0, len, 1.38, 1.46)), f, 1.4);
      const bsc = stampScale(u, at, 8);
      const body = <>
        <Layer p={0.6}><Svg><HallBackdrop y={RY} h={1300} stage={false} /></Svg></Layer>
        <Layer p={1}><Svg>
          <HallFloor y={RG} h={900} />
          <g transform={`translate(540 600) scale(${bsc}) translate(-540 -600)`}>
            {SCENE_TEXT ? <PriceBoard x={540} y={600} value={val} prev={prev} flip={flip} scale={0.8} /> : <PriceBoard x={540} y={600} value="   " scale={0.8} />}
          </g>
          <CrowdRows {...crowd} bids={bids} />
          <FoldingChair x={bp.x} y={floor} scale={bp.s} facing={0} />
          <Person x={bp.x} y={bY} scale={bp.s} look={BEN} pose={bpose} expr={u >= KP ? "determined" : benUp > 0.5 ? "focused" : "calm"} blink={blinkOf(f, 1)} shadow={0} />
          <FoldingLap x={bp.x} y={floor} scale={bp.s} look={BEN} />
          {benUp > 0.02 && <><Paddle x={bh.x} y={bh.y + 14 * bp.s} scale={0.6 * bp.s} number={txt(7, undefined)} rot={(1 - benUp) * 60} />
            <circle cx={bh.x} cy={bh.y} r={8 * bp.s} fill={BEN.skin} stroke={INK} strokeWidth={4.2 * bp.s} /></>}
        </Svg></Layer>
      </>;
      return { cam, mood, body };
    }
    case "win": {    // medium on the podium: the gavel slams on "Sold", camera kick, the SOLD! $25 sign stamps in over the stage
      const SD = Math.max(8, C("Sold", 2) + 8);
      cam = kickCam(drift(on({ x: 330, y: 690 }, k(u, 0, len, 1.75, 1.85)), f, 1), u - SD, 16);
      const body = <Hall f={f} crowd={null} stage={<StageSet f={f} u={u} bangAt={SD} jar={false} table={false} expr={u >= SD ? "laugh" : "focused"} />} />;
      const st = k(u, SD + 1, SD + 9, 0, 1, EASE.linear);
      const labels = <g opacity={1 - leave(u, len - 7)}><SoldSign x={520} y={450} scale={1.15} stamp={st} text="SOLD! $25" /></g>;
      return { cam, mood, body, labels, overlay: <Flash framesSince={u - SD} len={4} /> };
    }
    case "count": {  // Ben at a cloth table on the hall floor tips the jar out and counts: the pile grows, INSIDE counts up to $18,
      // stops and stamps under PAID $25; on "smile drops" his face falls
      mood = MOODS.close;
      const CT = C("counts the", 2), E18 = C("Eighteen dollars", 40), SM = C("smile drops", 80);
      const g = tableGeom(540, 1250, 640);
      const bp = behindTable(g, 0.5, 1.3);
      const jp = tablePoint(g, 0.2, 0.5), pp = tablePoint(g, 0.62, 0.55);
      const prog = k(u, CT + 4, E18, 0, 1, EASE.linear);
      const reachP = (Math.sin(u * 0.45) * 0.5 + 0.5);
      const hR = { x: pp[0] - 30 + 40 * reachP, y: pp[1] - 10 };
      const hL = { x: jp[0] + 70, y: jp[1] - 30 };
      cam = drift(on({ x: 540, y: k(u, 0, len, 840, 870) }, k(u, 0, len, 1.32, 1.42)), f, 1);
      const body = <Hall f={f} crowd={null}
        stage={<StageSet f={f} u={u} jar={false} expr="smile" />}
        items={[{ y: 1250, el: <g>
          <Person x={bp.x} y={bp.y} scale={bp.scale} look={BEN} pose={{ ...STAND, armL: [14, -10], armR: [14, -10], lookX: u >= SM ? 0 : 0.3, headTilt: u >= SM ? 5 : 0 }}
            expr={u >= SM ? "worried" : u >= E18 ? "focused" : "smile"} blink={blinkOf(f, 1)} t={f} />
          <HallTable x={g.x} y={g.y} w={g.w} />
          <CoinJar x={jp[0]} y={jp[1]} scale={0.42} fill={0.85 - 0.75 * prog} />
          <CoinPile x={pp[0]} y={pp[1]} count={Math.round(4 + 34 * prog)} scale={1.1} seed={3} />
          <TableHands g={g} p={bp} look={BEN} hands={[hL, hR]} sleeve={BEN.jersey} />
        </g> }]} />;
      const n = countValue(u, CT + 4, Math.max(10, E18 - CT - 4), 1, 18);
      const labels = <>
        <CardLabel f={u} x={540} y={400} size={80} color={RED} enter="rise" enterAt={4} exitAt={len - 8}>PAID $25</CardLabel>
        <CountCard f={u} x={540} y={540} prefix="INSIDE $" n={n} startAt={CT + 4} dur={Math.max(10, E18 - CT - 4)} exitAt={len - 8} />
      </>;
      return { cam, mood, body, labels };
    }
    case "why": {    // "Wait." - cold freeze: close on Ben hugging the near-empty jar, paddle tucked under his arm; the question words
      // in; on "why does winning" the camera pushes to his face and he looks at us
      mood = MOODS.close;
      const WD = C("why does", Math.round(len * 0.45));
      const bx = 540, by = 1330, s = 1.12;
      const pose: Pose = { ...STAND, armL: [20, -125], armR: [20, -125], lookX: u >= WD ? 0 : -0.6, headTilt: u >= WD ? -5 * k(u, WD, WD + 8, 0, 1) : 4 };
      const hl = handPos({ x: bx, y: by, scale: s, facing: 1, pose }, "L"), hr = handPos({ x: bx, y: by, scale: s, facing: 1, pose }, "R");
      const jarBottom = (hl.y + hr.y) / 2 + 80;
      const push = k(u, WD, len, 0, 1);
      cam = on({ x: 540, y: interpolate(push, [0, 1], [930, 900]) }, interpolate(push, [0, 1], [1.7, 2.05]) + k(u, 0, WD, 0, 0.05));
      const body = <Hall f={f - u} crowd={{ y0: 1180 }}
        stage={<StageSet f={f - u} u={0} jar={false} />}
        items={[{ y: by, el: <g>
          <Person x={bx} y={by} scale={s} look={BEN} pose={pose} expr="worried" blink={false} />
          <CoinJar x={bx} y={jarBottom} scale={0.3} fill={0.2} />
          <circle cx={hl.x} cy={hl.y} r={8 * s} fill={BEN.skin} stroke={INK} strokeWidth={4.2 * s} />
          <circle cx={hr.x} cy={hr.y} r={8 * s} fill={BEN.skin} stroke={INK} strokeWidth={4.2 * s} />
        </g> }]} />;
      const labels = <CardLabel f={u} x={520} y={430} size={84} color={CREAM} enter="words" enterAt={6} exitAt={len - 8}>WON... AND LOST?</CardLabel>;
      return { cam, mood, body, labels, cold: 1 };
    }
    case "guesses": { // lab: a crowd of guesses pops in on a number line under a jar ("crowd guessing"); on "Some guess low" the low
      // side lights blue, on "some guess high" the high side lights orange; the TRUE VALUE line stands at $8 and the gold
      // AVERAGE mark settles a little below it
      mood = MOODS.lab;
      const CG = C("crowd guessing", 18), LO = C("Some guess low", Math.round(len * 0.55)), HI = C("some guess high", Math.round(len * 0.75));
      const reveal = k(u, CG, CG + 40, 0, 1, EASE.linear);
      const truthP = arrive(u, CG + 30, 12), avgP = arrive(u, HI + 14, 12);
      cam = drift({ x: 0, y: k(u, 0, len, 0, 20), zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 1.2);
      const tx = guessX(GD, TRUTH), ax = guessX(GD, AVG), xlo = guessX(GD, 4), xhi = guessX(GD, 10);
      const loP = arrive(u, LO, 10), hiP = arrive(u, HI, 10);
      const body = <Lab>
        <g transform={`translate(0 ${(1 - arrive(u, 0, 14)) * 40})`}><CoinJar x={540} y={610} scale={0.62} fill={0.8} seed={4} /></g>
        <rect x={GD.x - 30} y={GD.y - 460} width={xlo - GD.x + 30} height={480} rx={24} fill="#3a7bd5" opacity={0.22 * loP} />
        <rect x={xhi} y={GD.y - 460} width={GD.x + GD.w + 30 - xhi} height={480} rx={24} fill={ORANGE} opacity={0.22 * hiP} />
        <GuessDots {...GD} reveal={reveal} showTruth={truthP} showAvg={avgP} height={460} />
      </Lab>;
      const ts = toS(cam, { x: tx, y: GD.y - 460 }), as = toS(cam, { x: ax, y: GD.y }), ls = toS(cam, { x: (GD.x + xlo) / 2, y: GD.y });
      const hs = toS(cam, { x: (xhi + GD.x + GD.w) / 2, y: GD.y });
      const labels = <>
        <Label f={u} x={Math.min(760, ts.x + 20)} y={ts.y - 30} size={58} color={GREEN} enter="rise" enterAt={CG + 34} exitAt={len - 8}>TRUE VALUE $8</Label>
        <Label f={u} x={ls.x} y={ls.y + 100} size={64} color={"#7fb2ff"} enter="scale" enterAt={LO + 2} exitAt={len - 8}>LOW</Label>
        <Label f={u} x={hs.x} y={hs.y + 100} size={64} color={ORANGE} enter="scale" enterAt={HI + 2} exitAt={len - 8}>HIGH</Label>
        <Label f={u} x={as.x} y={as.y + 160} size={56} color={GOLD} enter="rise" enterAt={HI + 18} exitAt={len - 8}>AVERAGE</Label>
      </>;
      return { cam, mood, body, labels };
    }
    case "highest": { // lab: five bidders in a row hold up their guesses ($4 ... $13); on "highest guess" the others dim and the $13
      // bidder lights up and cheers (spotlight ring); on "biggest overestimate" a green WORTH $8 bar shows how far over it is
      mood = MOODS.lab;
      const WA = C("wins an auction", 20), HG = C("highest guess", Math.round(len * 0.35)), BO = C("biggest overestimate", Math.round(len * 0.7));
      const vals = [4, 5, 6, 9, 13];
      const xs = [170, 345, 520, 695, 870], fy = 1250, s = 1.0;
      const win = arrive(u, HG, 12);
      cam = drift({ x: k(u, HG, HG + 30, 0, 90), y: k(u, HG, HG + 30, 0, -30), zoom: k(u, HG, HG + 30, 1.0, 1.12), rot: 0 }, f, 1.2);
      const body = <Lab>
        {win > 0 && <g opacity={win}>
          <ellipse cx={xs[4]} cy={fy - 2} rx={150} ry={36} fill={GOLD} opacity={0.35} />
          <path d={`M ${xs[4] - 70} 300 L ${xs[4] - 170} ${fy} L ${xs[4] + 170} ${fy} L ${xs[4] + 70} 300 Z`} fill="#fff4c0" opacity={0.12} />
        </g>}
        {xs.map((x, i) => {
          const upAt = WA - 18 + i * 4, up = arrive(u, upAt, 10), dim = i < 4 ? 1 - 0.55 * win : 1;
          const isW = i === 4;
          return <g key={i} opacity={dim}>
            <PaddlePerson x={x} y={fy - (isW ? 18 * Math.abs(Math.sin((u - HG) * 0.25)) * win : 0)} s={s} look={EXTRAS[i]} up={up} num={`$${vals[i]}`}
              expr={isW && win > 0.5 ? "cheer" : u >= HG && !isW ? "worried" : "focused"} f={f} seed={i + 3} t={isW && win > 0 ? undefined : f} other={[14, -10]} />
          </g>;
        })}
      </Lab>;
      const labels = <>
        <Label f={u} x={510} y={400} size={74} color={GOLD} enter="words" enterAt={HG} exitAt={len - 8}>HIGHEST GUESS WINS</Label>
        <Label f={u} x={510} y={510} size={64} color={RED} enter="rise" enterAt={BO} exitAt={len - 8}>PAYS $13 - WORTH $8</Label>
      </>;
      return { cam, mood, body, labels };
    }
    case "study": {  // lab2: a classroom coin-jar test as three bars, one per beat: JAR WORTH $8 (green) on "worth eight", WINNING
      // BID ~$10 (red, above the dashed truth line) on "about ten", AVERAGE GUESS ~$5 (gold, below it) on "about five"
      mood = MOODS.lab;
      const W8 = C("worth eight", 40), A10 = C("about ten", 90), A5 = C("about five", 160);
      const g0 = k(u, W8, W8 + 18, 0, 1, EASE.linear), g2 = k(u, A10, A10 + 18, 0, 1, EASE.linear), g1 = k(u, A5, A5 + 18, 0, 1, EASE.linear);
      cam = drift({ x: 0, y: k(u, 0, len, 20, 0), zoom: k(u, 0, len, 1.0, 1.06), rot: 0 }, f, 1.2);
      const BY = 1180, BH = 560;
      const body = <Lab>
        <g opacity={arrive(u, 0, 12) * (1 - k(u, W8 - 6, W8 + 4, 0, 1, EASE.exit))} transform={`translate(0 ${(1 - arrive(u, 0, 14)) * 40})`}>
          <CoinJar x={540} y={1000} scale={0.9} fill={0.6} seed={6} />
        </g>
        <BarTrio x={540} y={BY} values={[8, 5, 10]} labels={["", "", ""]} valueTexts={txt<[string, string, string] | undefined>(["$8", "~$5", "~$10"], undefined)}
          grow={[g0, g1, g2]} h={BH} max={10} truthLine={g0 >= 1} />
      </Lab>;
      const bx = (i: number) => toS(cam, { x: 540 - 370 + 100 + i * 270, y: BY + 66 });
      const labels = <>
        <Label f={u} x={510} y={400} size={70} color={CREAM} enter="rise" enterAt={4} exitAt={W8 - 6}>IN A CLASSROOM TEST</Label>
        <Label f={u} x={510} y={400} size={70} color={GREEN} enter="words" enterAt={W8} exitAt={A10 - 6}>JAR WORTH $8</Label>
        <Label f={u} x={510} y={400} size={70} color={RED} enter="words" enterAt={A10} exitAt={A5 - 6}>WINNING BID ~$10</Label>
        <Label f={u} x={510} y={400} size={70} color={GOLD} enter="words" enterAt={A5} exitAt={len - 8}>AVERAGE GUESS ~$5</Label>
        <Label f={u} x={bx(0).x} y={bx(0).y} size={50} color={CREAM} enter="rise" enterAt={W8 + 4} exitAt={len - 8}>WORTH</Label>
        <Label f={u} x={bx(1).x} y={bx(1).y} size={50} color={CREAM} enter="rise" enterAt={A5 + 4} exitAt={len - 8}>AVG GUESS</Label>
        <Label f={u} x={bx(2).x} y={bx(2).y} size={50} color={CREAM} enter="rise" enterAt={A10 + 4} exitAt={len - 8}>WIN BID</Label>
      </>;
      return { cam, mood, body, labels };
    }
    case "oil": {    // lab3: a lease map; on "overpay" gold leases light up and coin stacks pile onto them; on "The winner's curse"
      // the camera pulls back, a derrick rises over the map and spits only a puff, and the name stamps in
      mood = MOODS.lab;
      const OE = C("Oil engineers", 2), OP = C("overpay", Math.round(len * 0.35)), WC = C("winner's curse", Math.round(len * 0.75));
      const hl = k(u, OP - 4, OP + 10, 0, 1, EASE.arrive);
      const plots = [1, 7, 8, 13, 17];
      const MX = 540, MY = 900, MW = 820, MH = 600, cols = 5, rows = 4;
      const rise = arrive(u, WC - 4, 16);
      cam = drift({ x: 0, y: 40, zoom: k(u, 0, WC - 8, 1.08, 1.14) - k(u, WC - 8, WC + 16, 0, 0.16), rot: 0 }, f, 1.2);
      const pc = (i: number) => ({ x: MX - MW / 2 + (i % cols + 0.5) * (MW / cols), y: MY - MH / 2 + (Math.floor(i / cols) + 0.5) * (MH / rows) });
      const body = <Lab>
        <g transform={`translate(0 ${(1 - arrive(u, 0, 14)) * 40})`}>
          <MapPatch x={MX} y={MY} w={MW} h={MH} cols={cols} rows={rows} highlight={plots} hl={hl} seed={2} />
        </g>
        {plots.map((p, i) => { const c = pc(p), n = Math.round(k(u, OP + i * 3, OP + 14 + i * 3, 0, 4 + (i % 3), EASE.arrive)); return n > 0 ? <CoinStack key={p} x={c.x} y={c.y + 34} count={n} scale={1.1} kind={i % 2} /> : null; })}
        {rise > 0 && <g opacity={Math.min(1, rise * 2)}><OilDerrick x={pc(8).x} y={pc(8).y + 40} scale={0.55 * (0.5 + 0.5 * rise)} gush={u >= WC + 8 ? 0.35 * Math.exp(-(u - WC - 8) / 14) : 0} /></g>}
      </Lab>;
      const labels = <>
        <Label f={u} x={510} y={400} size={64} color={CREAM} enter="rise" enterAt={OE + 4} exitAt={WC - 8}>OFFSHORE OIL LEASES</Label>
        <Label f={u} x={510} y={380} size={80} color={RED} enter="scale" enterAt={WC + 2} exitAt={len - 8}>THE WINNER'S CURSE</Label>
      </>;
      return { cam, mood, body, labels };
    }
    case "fix": {    // lab3: a bid slider: the gold pin is YOUR GUESS; on "Bid below" the knob steps back; on "More bidders" rival
      // heads fill the row and the knob steps back further (red arrow grows)
      mood = MOODS.lab;
      const BB = C("Bid below", 14), MB = C("More bidders", Math.round(len * 0.5)), SB = C("Step back", Math.round(len * 0.7));
      const step1 = arrive(u, BB + 4, 16), step2 = arrive(u, SB - 2, 18);
      const bid = 0.74 - 0.18 * step1 - 0.22 * step2;
      const bidders = 2 + Math.round(k(u, MB, MB + 14, 0, 6, EASE.linear));
      cam = drift({ x: 0, y: -40, zoom: k(u, 0, len, 1.2, 1.26), rot: 0 }, f, 1.2);
      const enter = arrive(u, 0, 14);
      const body = <Lab>
        <g opacity={enter} transform={`translate(0 ${(1 - enter) * 40})`}>
          <BidSlider x={170} y={1020} w={740} estimate={0.74} bid={bid} bidders={u >= MB ? bidders : 2} step={u >= BB + 4 ? 1 : 0}
            estimateLabel={txt<string | undefined>("YOUR GUESS", undefined)} bidLabel={txt<string | undefined>(u >= BB + 4 ? "YOUR BID" : undefined, undefined)} />
        </g>
      </Lab>;
      const labels = <>
        <Label f={u} x={510} y={420} size={66} color={GREEN} enter="words" enterAt={BB} exitAt={MB - 6}>BID BELOW YOUR GUESS</Label>
        <ArrowLabel f={u} y={420} left="MORE BIDDERS" right="STEP BACK" color={RED} enterAt={MB} exitAt={len - 8} ax={540} size={54} />
      </>;
      return { cam, mood, body, labels };
    }
    case "twist": {  // next year, two-shot on the hall floor: Ben lifts his paddle once, low and calm, and lowers it; an excited parent
      // jumps up waving hers on "outbids him"; on "just smiles" Ben smirks at us
      const BL = C("bids low", 10), OB = C("outbids him", Math.round(len * 0.45)), JS = C("just smiles", Math.round(len * 0.75));
      const benUp = arrive(u, BL, 10) * (1 - k(u, OB - 2, OB + 8, 0, 1, EASE.exit)) * 0.55;
      const pUp = arrive(u, OB - 4, 8);
      const jump = u >= OB ? Math.abs(Math.sin((u - OB) * 0.28)) * 40 : 0;
      cam = drift(on({ x: k(u, 0, len, 560, 590), y: 1000 }, k(u, 0, len, 1.32, 1.4)), f, 1.2);
      const body = <Hall f={f} crowd={null}
        stage={<StageSet f={f} u={u} table={false} />}
        items={[
          { y: 1300, el: <PaddlePerson x={400} y={1300} s={0.98} look={BEN} up={benUp} num={7} expr={u >= JS ? "smirk" : "calm"} f={f} seed={1} t={f}
            lookX={u >= JS ? 0 : 0.6} headTilt={u >= JS ? -5 : 0} /> },
          { y: 1310, el: <PaddlePerson x={760} y={1310} s={0.98} look={PARENT} up={pUp} num={22} expr={u >= OB ? "cheer" : "focused"} f={f} seed={8}
            t={u >= OB ? undefined : f} jump={jump} lookX={-0.4} other={u >= OB ? [150, 10] : [14, -10]} /> },
        ]} />;
      const labels = <CardLabel f={u} x={600} y={420} size={86} color={GOLD} enter="scale" enterAt={2} exitAt={Math.max(30, OB - 6)}>NEXT YEAR</CardLabel>;
      return { cam, mood, body, labels };
    }
    default: {       // ask: pull out from Ben in the aisle to the whole hall; on stage the excited parent hugs the jar, parents cheer
      const RP = C("raise your", Math.round(len * 0.4));
      const pull = k(u, 0, len, 0, 1);
      cam = drift({ x: interpolate(pull, [0, 1], [415, 0]), y: interpolate(pull, [0, 1], [190, -30]), zoom: interpolate(pull, [0, 1], [1.7, 0.96]), rot: 0 }, f, 1.5);
      const pPose: Pose = { ...STAND, armL: [20, -125], armR: [20, -125] };
      const px = 560, py = G.stageTop, ps = 0.82;
      const hl = handPos({ x: px, y: py, scale: ps, facing: 1, pose: pPose }, "L"), hr = handPos({ x: px, y: py, scale: ps, facing: 1, pose: pPose }, "R");
      const body = <Hall f={f} crowd={{ mood: u >= RP ? "cheer" : "idle" }}
        stage={<g>
          <StageSet f={f} u={u} jar={false} expr="laugh" />
          <Person x={px} y={py} scale={ps} look={PARENT} pose={pPose} expr="cheer" blink={blinkOf(f, 8)} />
          <CoinJar x={px} y={(hl.y + hr.y) / 2 + 66} scale={0.26} fill={0.6} seed={2} />
          <circle cx={hl.x} cy={hl.y} r={8 * ps} fill={PARENT.skin} stroke={INK} strokeWidth={4.2 * ps} />
          <circle cx={hr.x} cy={hr.y} r={8 * ps} fill={PARENT.skin} stroke={INK} strokeWidth={4.2 * ps} />
        </g>}
        items={[{ y: BEN_AISLE.y, el: <PaddlePerson {...BEN_AISLE} look={BEN} up={0} num={7} expr="smirk" f={f} seed={1} t={f} lookX={-0.3} /> }]}
        over={<Confetti x={560} y={700} f={u - RP} count={60} spread={1.6} power={1.1} seed={7} />} />;
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
  const fade = prev && u < XF && (PLACE[prev.id] ?? "hall") !== (PLACE[span.id] ?? "hall");
  return (
    <Words.Provider value={words}><AbsoluteFill>
      <NoText.Provider value={!!fade}><ShotView span={span} spans={spans} /></NoText.Provider>
      {fade && prev && <NoText.Provider value><AbsoluteFill style={{ opacity: 1 - (u + 1) / (XF + 1) }}><ShotView span={prev} spans={spans} freezeAt={prev.b - 1} /></AbsoluteFill></NoText.Provider>}
    </AbsoluteFill></Words.Provider>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "winner",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: AUCTION.ceiling,
};
export default story;
