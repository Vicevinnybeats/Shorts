// "Why You Always Pick the Slow Queue" - 2.5D. Maya picks the shortest of three checkout lines and loses to her brother.
// Facts: with three lines yours is fastest 1 time in 3; one slow customer blocks only one line; a single "snake" line
// feeding every till spreads the delay. Bright supermarket look (deliberately unlike the night stadium of episode 1).
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, cueTime, FPS, ShotSpan } from "../../src/engine/timeline";
import { Stage, Layer, Svg, Cam, drift, kickCam } from "../../src/engine25/stage";
import { Grade, Mood, Pool, Flash, SpeedLines } from "../../src/engine25/light";
import { Person, POSES, runPose, blinkAt, Look, INK, Expr, Pose } from "../../library/characters25/person";
import { ShelfWall, Floor, Till, Cart, Coupon, Terminal, WallClock, Ceiling, ShopDefs, SHOP } from "../../library/environments25/supermarket";
import { TacticsBoard, chalk } from "../../library/environments25/stadium";

const SHOTS = [
  { id: "hook", cue: "Maya picked the" },
  { id: "lost", cue: "She still lost." },
  { id: "wide", cue: "Saturday." },
  { id: "count", cue: "Maya counts the" },
  { id: "smile", cue: "and smiles at" },
  { id: "trouble", cue: "Then it happens." },
  { id: "flows", cue: "Sam's line flows." },
  { id: "curse", cue: "It feels like" },
  { id: "math", cue: "It is just math." },
  { id: "odds", cue: "With three lines," },
  { id: "twoof3", cue: "Two times out" },
  { id: "more", cue: "Add more checkouts," },
  { id: "slow", cue: "And one slow customer" },
  { id: "snake", cue: "That is why" },
  { id: "fair", cue: "Nobody gets unlucky." },
  { id: "sam", cue: "Sam reaches the" },
  { id: "switch", cue: "Maya switches lines." },
  { id: "ask", cue: "Have you ever" },
];

const MOODS: Record<string, Mood> = {
  store: { grade: "#3a6a7a", gradeOp: 0.06, vignette: 0.3, glow: "#fffbe6" },       // bright fluorescent store
  tense: { grade: "#3a4a6a", gradeOp: 0.16, vignette: 0.5 },
  curse: { grade: "#2a3350", gradeOp: 0.32, vignette: 0.65 },
  explain: { grade: "#24304f", gradeOp: 0.05, vignette: 0.3 },
  warm: { grade: "#ff9d3c", gradeOp: 0.08, vignette: 0.35, glow: "#ffe2b0" },
};

const ease = Easing.bezier(0.33, 0, 0.2, 1);
const k = (u: number, a: number, b: number, from: number, to: number, e = ease) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

// ---------------------------------------------------------------- cast
const MAYA: Look = { skin: "#d99c6c", hair: "#2a1a14", hairStyle: "bun", jersey: "#7c4dd6", jersey2: "#5a32a8", shorts: "#2d3a5a", socks: "#2d3a5a", boots: "#f2f2ee" };
const SAM: Look = { skin: "#d99c6c", hair: "#2a1a14", hairStyle: "buzz", jersey: "#f2c230", jersey2: "#c99a12", shorts: "#2d6fd8", socks: "#2d6fd8", boots: "#f2f2ee" };
const COUPON_LADY: Look = { skin: "#ffd9b8", hair: "#cfd2d8", hairStyle: "curly", jersey: "#d9467a", shorts: "#5a4a6a", socks: "#5a4a6a" };
const SHOPPERS: Look[] = [
  { skin: "#a8673f", hair: "#151014", hairStyle: "short", jersey: "#2fbf71", shorts: "#2a2f3d", socks: "#2a2f3d" },
  { skin: "#ffe2c8", hair: "#c9862e", hairStyle: "short", jersey: "#3fb8c9", shorts: "#6a5a4a", socks: "#6a5a4a" },
  { skin: "#7a4a2e", hair: "#120c0a", hairStyle: "curly", jersey: "#ff7a2f", shorts: "#2d3a5a", socks: "#2d3a5a" },
  { skin: "#f2c39b", hair: "#3b2416", hairStyle: "bun", jersey: "#e8443a", shorts: "#2a2f3d", socks: "#2a2f3d" },
  { skin: "#d99c6c", hair: "#2a1a14", hairStyle: "none", jersey: "#9aa6b2", shorts: "#3b3f52", socks: "#3b3f52" },
  { skin: "#ffd9b8", hair: "#e6c07a", hairStyle: "short", jersey: "#2d6fd8", shorts: "#2a2f3d", socks: "#2a2f3d" },
];
const FACEPALM: Pose = { armL: [12, -6], armR: [70, -150], legL: [8, 0], legR: [8, 0], headTilt: -10 };
const CROSSED: Pose = { armL: [25, -120], armR: [25, -120], legL: [8, 0], legR: [8, 0] };
const WAVE = (f: number): Pose => ({ armL: [12, -6], armR: [150 + Math.sin(f * 0.5) * 18, -20], legL: [8, 0], legR: [8, 0] });

// ---------------------------------------------------------------- the three lanes (side view, stacked by depth)
const LANES = [{ y: 960, s: 0.62 }, { y: 1330, s: 0.8 }, { y: 1760, s: 1.0 }];   // 1 back, 2 middle (Maya), 3 front (Sam)
const TILL_X = 90, SLOT = 190;

type Timing = { trouble: number; sam: number; switchF: number; end: number };
/** customers served by frame f in each lane (floats: fractional = the front customer walking off) */
const served = (lane: number, f: number, T: Timing) => {
  const s = f / FPS;
  const samRate = Math.max(2, T.sam / FPS / 5);           // seconds per customer so the 5 ahead of Sam are done on cue
  if (lane === 0) return s / (samRate * 1.25);
  if (lane === 2) return s / samRate;
  // Maya's lane: normal until the trouble, frozen while Maya is in it, then (cruelly) fast once she switches away
  const tA = T.trouble / FPS, tB = T.switchF / FPS;
  if (s < tA) return s / 6.5;
  if (s < tB + 0.4) return tA / 6.5;
  return tA / 6.5 + (s - tB - 0.4) / 1.6;
};

const Lane: React.FC<{ lane: number; f: number; T: Timing; people: Look[]; names?: Record<number, "maya" | "sam" | "lady">; mayaLeft?: boolean; exprs?: Record<string, Expr>; poses?: Record<string, Pose> }> = ({ lane, f, T, people, names = {}, mayaLeft, exprs = {}, poses = {} }) => {
  const { y, s } = LANES[lane];
  const sv = served(lane, f, T);
  const moving = Math.abs(served(lane, f + 1, T) - sv) > 0.001;
  return (
    <g>
      <Till x={TILL_X * s + 40} y={y} n={lane + 1} f={f} moving={moving} light={lane === 1 && f > T.trouble && f < T.switchF ? "blink" : "on"} scale={s} />
      {people.map((lk, i) => {
        const who = names[i];
        if (who === "maya" && mayaLeft) return null;
        const slot = i - sv;
        const leaving = slot < 0;
        const x = TILL_X * s + 40 + (330 + 60 + Math.max(slot, -1.6) * SLOT) * s + (leaving ? slot * 60 * s : 0);
        if (slot < -1.6) return null;
        const walking = Math.abs(served(lane, f + 1, T) - sv) > 0.001 && !leaving ? true : leaving;
        const key = who ?? "x";
        const pose = poses[key] ?? (walking ? runPose(f * 0.35 + i, 0.35) : POSES.stand);
        return (
          <g key={i} opacity={leaving ? Math.max(0, 1 + slot / 1.6) : 1}>
            {who !== "maya" && who !== "sam" && i % 2 === 0 && <Cart x={x + 95 * s} y={y} scale={s * 0.95} seed={i + lane} />}
            <Person x={x} y={y} scale={s * 0.95} facing={-1} look={lk} pose={pose} expr={exprs[key] ?? "neutral"} blink={blinkAt(f, i + lane * 3)} t={f + i * 9} />
          </g>
        );
      })}
    </g>
  );
};

/** whole shop: ceiling, shelf wall (cached), floor, three lanes, wall clock (clock motif) */
const Shop: React.FC<{ f: number; T: Timing; laneProps: (lane: number) => Partial<React.ComponentProps<typeof Lane>> }> = ({ f, T, laneProps }) => {
  const lanes = [0, 1, 2].map((l) => ({ ...LANE_PEOPLE(T)[l], ...laneProps(l) }));
  return (
    <>
      <Layer p={0.2}><Svg><Ceiling y={260} /><ShelfWall y={250} h={520} /><WallClock x={880} y={160} r={70} minutes={10 * 60 + f / FPS * 4} /></Svg></Layer>
      <Layer p={0.6}><Svg><Floor y={760} h={1400} /></Svg></Layer>
      {lanes.map((lp, l) => <Layer key={l} p={0.75 + l * 0.15}><Svg><Lane {...(lp as React.ComponentProps<typeof Lane>)} lane={l} f={f} T={T} /></Svg></Layer>)}
    </>
  );
};

/** who stands in which lane (Sam is placed so he reaches the till exactly on his cue) */
const LANE_PEOPLE = (T: Timing) => {
  const samIdx = 5;
  const lane3: Look[] = Array.from({ length: samIdx + 2 }, (_, i) => (i === samIdx ? SAM : SHOPPERS[(i + 2) % SHOPPERS.length]));
  return [
    { people: [SHOPPERS[0], SHOPPERS[1], SHOPPERS[2], SHOPPERS[3], SHOPPERS[4], SHOPPERS[5], SHOPPERS[0], SHOPPERS[2], SHOPPERS[1], SHOPPERS[3]] },
    { people: [SHOPPERS[4], COUPON_LADY, SHOPPERS[5], MAYA, SHOPPERS[1], SHOPPERS[0]], names: { 1: "lady", 3: "maya" } as Record<number, "maya" | "sam" | "lady"> },
    { people: lane3, names: { [samIdx]: "sam" } as Record<number, "maya" | "sam" | "lady"> },
  ];
};

/** where a lane member is on screen (design coordinates), for camera targeting */
const posOf = (lane: number, idx: number, f: number, T: Timing) => {
  const { y, s } = LANES[lane];
  const slot = idx - served(lane, f, T);
  return { x: TILL_X * s + 40 + (390 + Math.max(slot, -1.6) * SLOT) * s, y: y - 260 * s };
};
const camOn = (p: { x: number; y: number }, zoom: number, rot = 0): Cam => ({ x: p.x - 540, y: p.y - 960, zoom, rot });

// ---------------------------------------------------------------- explain boards
const LaneRace: React.FC<{ n: number; u: number; seed: number; y: number; w: number; mine: number; label?: string }> = ({ n, u, seed, y, w, mine, label }) => {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const speeds = Array.from({ length: n }, () => 0.6 + r() * 0.8);
  const winner = speeds.indexOf(Math.max(...speeds));
  const h = Math.min(90, 420 / n);
  return (
    <g transform={`translate(0 ${y})`}>
      {speeds.map((sp, i) => {
        const len = Math.min(1, (u / 40) * sp) * w;
        return (
          <g key={i} transform={`translate(${-w / 2} ${i * (h + 14)})`}>
            <rect width={w} height={h} rx={10} fill="#ffffff" opacity={0.08} />
            <rect width={len} height={h} rx={10} fill={i === mine ? "#b58cff" : i === winner && u > 40 / sp ? "#ffcf3a" : "#f2f5ea"} opacity={i === mine ? 0.95 : 0.7} />
            {i === mine && <text x={12} y={h * 0.72} fontFamily="CaptionSans" fontWeight={900} fontSize={h * 0.55} fill={INK}>YOU</text>}
          </g>
        );
      })}
      {label && <text x={0} y={n * (h + 14) + 80} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={110} fill="#ffcf3a" opacity={Math.min(1, u / 20)}>{label}</text>}
    </g>
  );
};

/** top-down: lanes of heads (circles) moving to tills; one red slow customer */
const TopDown: React.FC<{ f: number; snake: boolean }> = ({ f, snake }) => {
  const tills = [-280, 0, 280];
  const items: React.ReactElement[] = [];
  tills.forEach((tx, i) => items.push(<g key={"t" + i}><rect x={tx - 70} y={-520} width={140} height={90} rx={12} fill={SHOP.till} stroke={INK} strokeWidth={6} /><text x={tx} y={-458} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={44} fill="#fff">{i + 1}</text></g>));
  if (!snake) {
    tills.forEach((tx, i) => {
      const blocked = i === 1, speed = blocked ? 0 : 0.9;
      for (let j = 0; j < 7; j++) {
        const yy = -380 + j * 95 - ((f * speed) % 95);
        items.push(<circle key={`${i}-${j}`} cx={tx} cy={yy} r={30} fill={blocked && j === 0 ? "#ff5a4a" : "#f2f5ea"} stroke={INK} strokeWidth={5} />);
      }
    });
  } else {
    // one serpentine line (back and forth) feeding whichever till frees up; the red one only blocks till 2
    const path: [number, number][] = [];
    for (let row = 0; row < 5; row++) for (let c = 0; c <= 10; c++) path.push([(row % 2 ? 1 : -1) * (-300 + c * 60), 520 - row * 110]);
    const n = path.length, step = (f * 0.18) % 1;
    for (let j = 0; j < 40; j++) {
      const pi = Math.min(n - 1, Math.floor(j * 1.3 + step * 1.3));
      const [px, py] = path[n - 1 - pi];
      items.push(<circle key={"s" + j} cx={px} cy={py - 60} r={24} fill="#f2f5ea" stroke={INK} strokeWidth={4} />);
    }
    [0, 2].forEach((ti) => { const yy = -300 + ((f * 3) % 120); items.push(<circle key={"go" + ti} cx={tills[ti]} cy={-yy - 80} r={26} fill="#7fe0b0" stroke={INK} strokeWidth={4} />); });
    items.push(<circle key="red" cx={0} cy={-380} r={30} fill="#ff5a4a" stroke={INK} strokeWidth={5} />);
    items.push(<path key="rope" d="M -340 420 L 340 420 M -340 300 L 340 300 M -340 190 L 340 190 M -340 80 L 340 80" stroke="#c9b48a" strokeWidth={6} strokeDasharray="20 12" opacity={0.7} />);
  }
  return <g>{items}</g>;
};

// ---------------------------------------------------------------- shots
const ShotView: React.FC<{ span: ShotSpan; words: SceneProps["words"]; T: Timing }> = ({ span, words, T }) => {
  const f = useCurrentFrame();
  const u = f - span.a, len = span.b - span.a;
  const cueF = (p: string) => Math.round(cueTime(words, p) * FPS);
  let cam: Cam = { x: 0, y: 0, zoom: 1, rot: 0 };
  let mood = MOODS.store;
  let body: React.ReactNode = null;
  let overlay: React.ReactNode = null;
  const mayaP = posOf(1, 3, f, T), samIdx = 5;
  const samP = posOf(2, samIdx, f, T);
  const shop = (lp: (l: number) => object = () => ({})) => <Shop f={f} T={T} laneProps={lp as never} />;

  switch (span.id) {
    case "hook": {   // snap zoom on Maya, arms crossed, in the frozen middle line
      cam = drift(camOn(mayaP, k(u, 0, 8, 1.2, 2.3, Easing.out(Easing.cubic))), f, 3);
      mood = MOODS.tense;
      body = shop((l) => (l === 1 ? { exprs: { maya: "worried" }, poses: { maya: CROSSED } } : {}));
      overlay = <Flash framesSince={u} len={4} />;
      break;
    }
    case "lost": {   // pan down to Sam, smirking as his line moves
      cam = camOn({ x: k(u, 0, 10, mayaP.x, samP.x), y: k(u, 0, 10, mayaP.y, samP.y) }, 2.0, k(u, 0, 10, 0, 3));
      body = shop((l) => (l === 2 ? { exprs: { sam: "smirk" } } : l === 1 ? { exprs: { maya: "worried" }, poses: { maya: CROSSED } } : {}));
      overlay = <SpeedLines amount={k(u, 0, 8, 0.5, 0)} angle={90} />;
      break;
    }
    case "wide": {   // establishing: three checkouts, slow push
      cam = { x: 0, y: k(u, 0, len, 40, -20), zoom: k(u, 0, len, 1.0, 1.1), rot: 0 };
      body = shop();
      break;
    }
    case "count": {  // Maya counts: numbers pop over each line
      cam = { x: 0, y: 40, zoom: 1.05, rot: 0 };
      const counts = [7, 3, 5];
      body = (<>{shop((l) => (l === 1 ? { exprs: { maya: "focused" }, poses: { maya: POSES.point } } : {}))}
        <Layer p={1}><Svg>{counts.map((c, l) => {
          const pop = k(u, 6 + l * 8, 12 + l * 8, 0, 1, Easing.out(Easing.back(2.5)));
          const lx = LANES[l], best = l === 1;
          return <g key={l} transform={`translate(${780} ${lx.y - 330 * lx.s}) scale(${pop})`}><circle r={70} fill={best ? "#ffcf3a" : "#ffffff"} stroke={INK} strokeWidth={8} /><text y={26} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={74} fill={INK}>{c}</text></g>;
        })}</Svg></Layer></>);
      break;
    }
    case "smile": {  // two-shot: Maya smiles down at Sam
      cam = camOn({ x: (mayaP.x + samP.x) / 2, y: (mayaP.y + samP.y) / 2 }, 1.45, -2);
      body = shop((l) => (l === 1 ? { exprs: { maya: "smile" } } : l === 2 ? { exprs: { sam: "neutral" } } : {}));
      break;
    }
    case "trouble": { // the front of Maya's lane: coupon, price check (red light), card declined - three beats
      mood = MOODS.tense;
      const c1 = cueF("A coupon.") - span.a, c2 = cueF("A price check.") - span.a, c3 = cueF("A card that") - span.a;
      const ladyP = posOf(1, 1, f, T);
      cam = kickCam(camOn({ x: ladyP.x - 120, y: ladyP.y - 40 }, 2.1), u - c3, 16);
      body = shop((l) => (l === 1 ? { exprs: { lady: u > c3 ? "shock" : "calm", maya: "worried" } } : {}));
      const insert = (from: number, node: React.ReactNode) => u >= from ? <g transform={`translate(540 760) scale(${k(u, from, from + 6, 0.3, 1, Easing.out(Easing.back(2)))})`}>{node}</g> : null;
      overlay = (<AbsoluteFill><svg width={1080} height={1920}>
        {u < c2 && insert(c1, <Coupon x={0} y={0} scale={2.2} rot={-8} />)}
        {u >= c2 && u < c3 && insert(c2, <g><rect x={-300} y={-90} width={600} height={180} rx={20} fill="#ff5a4a" stroke={INK} strokeWidth={10} opacity={Math.floor(u / 5) % 2 ? 1 : 0.6} /><text y={34} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={88} fill="#fff">PRICE CHECK</text></g>)}
        {u >= c3 && insert(c3, <Terminal x={0} y={0} scale={1.8} declined />)}
      </svg><Flash framesSince={u - c3} len={4} /></AbsoluteFill>);
      break;
    }
    case "flows": {  // Sam's lane moves, Maya's is frozen; the wall clock races
      cam = { x: 120, y: 220, zoom: 1.25, rot: 0 };
      body = shop((l) => (l === 1 ? { exprs: { maya: "worried" }, poses: { maya: CROSSED } } : l === 2 ? { exprs: { sam: "smile" } } : {}));
      overlay = <SpeedLines amount={0.25} />;
      break;
    }
    case "curse": {  // Maya under her own rain cloud (cold mood)
      mood = MOODS.curse;
      cam = drift(camOn(mayaP, k(u, 0, len, 2.2, 2.5)), f, 2);
      body = (<>{shop((l) => (l === 1 ? { exprs: { maya: "worried" }, poses: { maya: CROSSED } } : {}))}
        <Layer p={0.9}><Svg><g transform={`translate(${mayaP.x} ${mayaP.y - 210})`}>
          <path d="M -120 0 C -150 -60 -60 -100 -20 -70 C 0 -120 90 -110 100 -60 C 160 -60 160 10 110 10 Z" fill="#6b7590" stroke={INK} strokeWidth={8} />
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${-90 + i * 30} ${30 + ((f * 9 + i * 23) % 110)} l -6 22`} stroke="#9cc4ff" strokeWidth={6} strokeLinecap="round" />)}
        </g></Svg></Layer></>);
      break;
    }
    case "math": case "odds": case "twoof3": case "more": {
      mood = MOODS.explain;
      cam = { x: 0, y: 0, zoom: k(u, 0, len, 1.04, 1.1), rot: 0 };
      const content = span.id === "math" ? (<>
          <text x={0} y={160} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={84} fill={chalk.fill}>NOT A CURSE.</text>
          <text x={0} y={300} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={120} fill="#ffcf3a" opacity={k(u, 8, 16, 0, 1)}>MATH.</text>
          <g transform="translate(0 420)"><LaneRace n={3} u={u} seed={5} y={0} w={640} mine={1} /></g></>)
        : span.id === "odds" ? (<g transform="translate(0 330)"><LaneRace n={3} u={u} seed={11} y={0} w={700} mine={1} label="1 IN 3" /></g>)
        : span.id === "twoof3" ? (<>{[0, 1, 2].map((race) => <g key={race} transform={`translate(0 ${90 + race * 290})`} opacity={k(u, race * 10, race * 10 + 6, 0, 1)}><LaneRace n={3} u={u - race * 10} seed={[3, 21, 8][race]} y={0} w={600} mine={race === 2 ? 0 : 1} /></g>)}
            <text x={0} y={1000} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={64} fill="#ffcf3a" opacity={k(u, 34, 42, 0, 1)}>2 OUT OF 3: ANOTHER LINE WINS</text></>)
        : (<g transform="translate(0 260)"><LaneRace n={5} u={u} seed={17} y={0} w={700} mine={2} label="1 IN 5" /></g>);
      body = (<><Layer p={0}><AbsoluteFill style={{ background: "#2a2018" }} /></Layer>
        <Layer p={1}><Svg><TacticsBoard x={540} y={330} w={860}>{content}</TacticsBoard></Svg></Layer></>);
      break;
    }
    case "slow": case "snake": case "fair": {   // top-down diagrams
      mood = MOODS.explain;
      cam = { x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.08), rot: 0 };
      body = (<><Layer p={0}><AbsoluteFill style={{ background: SHOP.floor }} /></Layer>
        <Layer p={1}><Svg>
          <g transform="translate(540 780)"><TopDown f={f} snake={span.id !== "slow"} /></g>
          {span.id === "fair" && <text x={540} y={1300} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={60} fill={INK} opacity={k(u, 6, 14, 0, 1)}><tspan x={540}>EVERYONE WAITS</tspan><tspan x={540} dy={70}>ABOUT THE SAME</tspan></text>}
          {span.id === "slow" && <text x={540} y={1300} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={60} fill="#e8443a" opacity={k(u, 10, 18, 0, 1)}><tspan x={540}>ONE SLOW CUSTOMER</tspan><tspan x={540} dy={70}>= ONE FROZEN LINE</tspan></text>}
        </Svg></Layer></>);
      break;
    }
    case "sam": {    // Sam at the till, waving; Maya glaring behind
      mood = MOODS.warm;
      cam = drift(camOn({ x: samP.x - 60, y: samP.y + 20 }, k(u, 0, len, 1.7, 1.95)), f, 3);
      body = shop((l) => (l === 2 ? { exprs: { sam: "laugh" }, poses: { sam: WAVE(f) } } : l === 1 ? { exprs: { maya: "determined" }, poses: { maya: CROSSED } } : {}));
      break;
    }
    case "switch": { // Maya leaves; her old line instantly starts moving
      const leaveF = 10;
      const gone = u > leaveF + 14;
      const mp = posOf(1, 3, f, T);
      cam = camOn({ x: mp.x - 80, y: mp.y + 40 }, k(u, 0, len, 1.5, 1.25));
      body = (<>{shop((l) => (l === 1 ? { mayaLeft: u > leaveF } : {}))}
        {!gone && <Layer p={0.9}><Svg><Person x={mp.x + k(u, leaveF, leaveF + 14, 0, 260)} y={LANES[1].y - k(u, leaveF, leaveF + 14, 0, 380)} scale={LANES[1].s * 0.95} facing={1} look={MAYA} pose={u > leaveF ? runPose(f * 0.5, 0.6) : POSES.stand} expr="determined" t={f} /></Svg></Layer>}
        {gone && <Layer p={0.78}><Svg><Person x={posOf(0, 10, f, T).x} y={LANES[0].y} scale={LANES[0].s * 0.95} facing={-1} look={MAYA} pose={POSES.stand} expr={u > leaveF + 26 ? "shock" : "smile"} t={f} /></Svg></Layer>}
      </>);
      overlay = <SpeedLines amount={u > leaveF + 20 ? 0.35 : 0} />;
      break;
    }
    default: {       // ask: pull out wide, Maya facepalms in the long back line
      mood = MOODS.store;
      cam = { x: k(u, 0, len, -200, 0), y: k(u, 0, len, -260, 0), zoom: k(u, 0, len, 2.0, 1.0, Easing.inOut(Easing.cubic)), rot: k(u, 0, len, 2, 0) };
      body = (<>{shop((l) => (l === 1 ? { mayaLeft: true } : {}))}
        <Layer p={0.78}><Svg><Person x={posOf(0, 10, f, T).x} y={LANES[0].y} scale={LANES[0].s * 0.95} facing={-1} look={MAYA} pose={FACEPALM} expr="worried" t={f} /></Svg></Layer></>);
    }
  }

  return (
    <AbsoluteFill>
      <ShopDefs />
      <Stage cam={cam} bg={SHOP.wall}>{body}</Stage>
      {mood !== MOODS.explain && <Pool x={540} y={700} rx={700} ry={900} color="#fffbe6" opacity={0.18} />}
      {mood !== MOODS.explain && ["hook", "count", "smile", "curse", "switch"].includes(span.id) && <Pool x={540} y={900} rx={300} ry={420} color="#fff4c8" opacity={0.3} />}
      <Grade mood={mood} />
      {overlay}
    </AbsoluteFill>
  );
};

const PLACE: Record<string, string> = { math: "board", odds: "board", twoof3: "board", more: "board", slow: "top", snake: "top", fair: "top" };
const XF = 7;

const Scene: React.FC<SceneProps> = ({ words, spans }) => {
  const f = useCurrentFrame();
  const T: Timing = {
    trouble: Math.round(cueTime(words, "Then it happens.") * FPS),
    sam: Math.round(cueTime(words, "Sam reaches the") * FPS),
    switchF: Math.round(cueTime(words, "Maya switches lines.") * FPS) + 24,
    end: spans[spans.length - 1].b,
  };
  const span = shotAt(spans, f);
  const prev = span.i > 0 ? spans[span.i - 1] : null;
  const u = f - span.a;
  const fade = prev && u < XF && (PLACE[prev.id] ?? "shop") !== (PLACE[span.id] ?? "shop");
  return (
    <AbsoluteFill>
      <ShotView span={span} words={words} T={T} />
      {fade && prev && <AbsoluteFill style={{ opacity: 1 - u / XF }}><ShotView span={prev} words={words} T={T} /></AbsoluteFill>}
    </AbsoluteFill>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "slow-queue",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: SHOP.wall,
};
export default story;
