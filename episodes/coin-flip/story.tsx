// "This Coin Flip Isn't 50/50" - 2.5D. Zoe and Leo flip a coin for the last slice of pizza; Zoe calls the side facing up.
// Facts (Bartos et al., 350,757 flips): a caught coin lands on its starting side ~50.8% of the time (wobble/precession,
// Diaconis model); no heads-vs-tails bias; big differences between flippers. Warm night kitchen look (new setting);
// every explanation shot has its own visual (no repeated diagrams), and all on-screen text stays above the captions.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, ShotSpan } from "../../src/engine/timeline";
import { Stage, Layer, Svg, Cam, drift, kickCam } from "../../src/engine25/stage";
import { Grade, Mood, Pool, Flash, SpeedLines } from "../../src/engine25/light";
import { Person, POSES, Look, INK, Expr, Pose } from "../../library/characters25/person";
import { KitchenWall, Pendant, Table, PizzaBox, Slice, Coin, Hand, KITCHEN } from "../../library/environments25/kitchen";

const SHOTS = [
  { id: "hook", cue: "Last slice of" },
  { id: "coin", cue: "One coin." },
  { id: "knows", cue: "Zoe knows something" },
  { id: "wide", cue: "Friday night." },
  { id: "reach", cue: "Zoe and Leo" },
  { id: "callit", cue: "Leo pulls out" },
  { id: "thumb", cue: "Zoe watches his" },
  { id: "heads", cue: "Heads, she says." },
  { id: "grin", cue: "Leo grins." },
  { id: "notquite", cue: "Not quite." },
  { id: "study", cue: "Scientists filmed" },
  { id: "count", cue: "Three hundred and" },
  { id: "same", cue: "The coin landed" },
  { id: "why", cue: "Why? A flipped" },
  { id: "wobble", cue: "It wobbles." },
  { id: "flight", cue: "So it spends" },
  { id: "nodiff", cue: "And heads or" },
  { id: "edge", cue: "It's a tiny" },
  { id: "bets", cue: "But over a" },
  { id: "spins", cue: "The coin spins." },
  { id: "catch", cue: "Leo catches it." },
  { id: "reveal", cue: "Heads. Zoe takes" },
  { id: "slice", cue: "Zoe takes the" },
  { id: "best", cue: "Leo looks at" },
  { id: "ask", cue: "Would you call" },
];

const MOODS: Record<string, Mood> = {
  home: { grade: "#ff9d3c", gradeOp: 0.08, vignette: 0.45, glow: "#ffd9a0" },     // warm lamp-lit kitchen
  close: { grade: "#ff8a3c", gradeOp: 0.1, vignette: 0.6, glow: "#ffe2b0" },
  freeze: { grade: "#1b2a6b", gradeOp: 0.35, vignette: 0.7 },                     // "Not quite." - cold freeze-frame
  lab: { grade: "#0b1430", gradeOp: 0.04, vignette: 0.45 },                       // the science shots
};

const ease = Easing.bezier(0.33, 0, 0.2, 1);
const k = (u: number, a: number, b: number, from: number, to: number, e = ease) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

// ---------------------------------------------------------------- cast
const ZOE: Look = { skin: "#c98a5e", hair: "#1e1410", hairStyle: "bun", jersey: "#2fa89a", jersey2: "#1f7a70", shorts: "#2d3a5a", socks: "#2d3a5a" };
const LEO: Look = { skin: "#c98a5e", hair: "#1e1410", hairStyle: "curly", jersey: "#e8643a", jersey2: "#b8462a", shorts: "#2d3a5a", socks: "#2d3a5a" };
const SKIN = "#c98a5e";
const REACH_R: Pose = { armL: [12, -6], armR: [78, -12], legL: [6, 0], legR: [6, 0], lean: 4 };     // Zoe (left) reaches right
const REACH_L: Pose = { armL: [78, -12], armR: [12, -6], legL: [6, 0], legR: [6, 0], lean: -4 };    // Leo (right) reaches left
const HOLD_UP: Pose = { armL: [12, -6], armR: [40, -120], legL: [6, 0], legR: [6, 0] };            // coin held up near the face
const SLICE_UP: Pose = { armL: [12, -6], armR: [30, -130], legL: [6, 0], legR: [6, 0] };            // Zoe lifts the slice

const ZX = 210, LX = 870, FEET = 1500, SC = 1.7, TABLE_Y = 1250;
const headOf = (x: number) => ({ x, y: FEET - 360 * SC });

/** the kitchen set: wall, lamp, the two siblings behind the table, the pizza box on it */
const Kitchen: React.FC<{ f: number; zoe?: [Pose, Expr]; leo?: [Pose, Expr]; slice?: boolean; steam?: number; extra?: React.ReactNode; front?: React.ReactNode }> = ({ f, zoe = [POSES.stand, "neutral"], leo = [POSES.stand, "neutral"], slice = true, steam = 0.6, extra, front }) => (
  <>
    <Layer p={0.25}><Svg><KitchenWall y={-120} h={1700} /></Svg></Layer>
    <Layer p={0.5}><Svg><Pendant x={540} y={330} sway={Math.sin(f * 0.05) * 2} /></Svg></Layer>
    <Layer p={0.85}><Svg>
      <Person x={ZX} y={FEET} scale={SC} facing={1} look={ZOE} pose={zoe[0]} expr={zoe[1]} t={f} blink={f % 113 < 4} />
      <Person x={LX} y={FEET} scale={SC} facing={-1} look={LEO} pose={leo[0]} expr={leo[1]} t={f + 30} blink={(f + 50) % 127 < 4} />
      {extra}
    </Svg></Layer>
    <Layer p={1}><Svg><Table y={TABLE_Y} /><PizzaBox x={540} y={TABLE_Y + 10} scale={0.6} slice={slice} steam={steam * (0.6 + 0.4 * Math.sin(f * 0.1))} />{front}</Svg></Layer>
  </>
);

/** dark "lab" backdrop for the science shots: faint grid + a soft spotlight */
const Lab: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Layer p={0}><AbsoluteFill style={{ background: "#121a36" }} /></Layer>
    <Layer p={0.3}><Svg>{Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-400 + i * 80} -400 L ${-400 + i * 80} 2400 M -400 ${-400 + i * 100} L 1500 ${-400 + i * 100}`} stroke="#1e2a52" strokeWidth={3} />)}</Svg></Layer>
    <Layer p={0}><AbsoluteFill style={{ background: "radial-gradient(60% 40% at 50% 42%, rgba(255,214,120,0.16) 0%, transparent 70%)" }} /></Layer>
    <Layer p={1}><Svg>{children}</Svg></Layer>
  </>
);
const T = (p: { x: number; y: number; s: number; c?: string; o?: number; children: React.ReactNode }) => (
  <text x={p.x} y={p.y} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={p.s} fill={p.c ?? "#f6efe0"} opacity={p.o ?? 1}>{p.children}</text>
);
const GOLD = "#f2c230", SILVER = "#b9c2cf";

// ---------------------------------------------------------------- shots
const ShotView: React.FC<{ span: ShotSpan }> = ({ span }) => {
  const f = useCurrentFrame();
  const u = f - span.a, len = span.b - span.a;
  let cam: Cam = { x: 0, y: 0, zoom: 1, rot: 0 };
  let mood = MOODS.home;
  let body: React.ReactNode = null;
  let overlay: React.ReactNode = null;
  const zH = headOf(ZX), lH = headOf(LX);
  const on = (p: { x: number; y: number }, zoom: number, rot = 0): Cam => ({ x: p.x - 540, y: p.y - 960, zoom, rot });

  switch (span.id) {
    case "hook": {   // push in on the last slice, steam rising
      mood = MOODS.close;
      cam = drift(on({ x: 540, y: TABLE_Y - 60 }, k(u, 0, len, 2.1, 2.7)), f, 3);
      body = <Kitchen f={f} steam={1} />;
      break;
    }
    case "coin": {   // a big coin pops up in front of the table, spinning
      mood = MOODS.close;
      cam = drift(on({ x: 540, y: 1000 }, 1.25), f, 2);
      const pop = k(u, 0, 8, 0, 1, Easing.out(Easing.back(2)));
      body = <Kitchen f={f} front={<g transform={`translate(540 ${k(u, 0, 10, 1300, 880, Easing.out(Easing.cubic))}) scale(${pop})`}><Coin x={0} y={0} r={190} spin={u * 14} glow={1} /></g>} />;
      overlay = <Flash framesSince={u} len={4} />;
      break;
    }
    case "knows": {  // Zoe, sly smile, slow push
      mood = MOODS.close;
      cam = drift(on({ x: zH.x + 40, y: zH.y + 60 }, k(u, 0, len, 2.0, 2.35)), f, 2);
      body = <Kitchen f={f} zoe={[POSES.stand, "smirk"]} leo={[POSES.stand, "neutral"]} />;
      break;
    }
    case "wide": {   // establishing: the kitchen at night, the box between them
      cam = { x: k(u, 0, len, -60, 0), y: k(u, 0, len, -160, -40), zoom: k(u, 0, len, 1.15, 1.05), rot: 0 };
      body = <Kitchen f={f} zoe={[POSES.stand, "calm"]} leo={[POSES.stand, "calm"]} />;
      break;
    }
    case "reach": {  // both reach for the slice at the same moment
      const hit = 10;
      cam = kickCam(drift(on({ x: 540, y: 1080 }, k(u, 0, hit, 1.15, 1.45, Easing.out(Easing.cubic))), f, 2), u - hit, 14);
      const r = k(u, 2, hit, 0, 1);
      const mixPose = (p: Pose): Pose => ({ ...p, armL: [12 + (p.armL[0] - 12) * r, -6 + (p.armL[1] + 6) * r], armR: [12 + (p.armR[0] - 12) * r, -6 + (p.armR[1] + 6) * r] });
      body = <Kitchen f={f} zoe={[mixPose(REACH_R), u > hit ? "shock" : "determined"]} leo={[mixPose(REACH_L), u > hit ? "shock" : "determined"]} />;
      overlay = <SpeedLines amount={k(u, 4, hit, 0, 0.4) * k(u, hit, hit + 8, 1, 0)} angle={90} />;
      break;
    }
    case "callit": { // Leo holds up a coin: "You call it."
      cam = drift(on({ x: LX - 120, y: lH.y + 120 }, k(u, 0, len, 1.6, 1.8)), f, 2);
      const hand = { x: LX + 75 * SC, y: FEET - 285 * SC + 20 };
      body = <Kitchen f={f} zoe={[POSES.stand, "focused"]} leo={[HOLD_UP, "smirk"]} extra={<Coin x={hand.x} y={hand.y - 40 - Math.abs(Math.sin(u * 0.15)) * 10} r={30} spin={60} />} />;
      break;
    }
    case "thumb": {  // extreme close-up: the coin resting on his thumb, heads facing up
      mood = MOODS.close;
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.15), rot: 0 }, f, 3);
      body = (<><Layer p={0.2}><AbsoluteFill style={{ background: "radial-gradient(70% 50% at 50% 45%, #f0b878 0%, #6b4636 100%)" }} /></Layer>
        <Layer p={0.4}><Svg><circle cx={170} cy={360} r={90} fill="#fff4c8" opacity={0.25} /><circle cx={880} cy={1400} r={140} fill="#2f6f5e" opacity={0.25} /></Svg></Layer>
        <Layer p={1}><Svg><Hand x={560} y={1080} scale={1.6} skin={SKIN}><Coin x={110} y={-75} r={110} spin={68} glow={k(u, 6, 16, 0, 1)} /></Hand></Svg></Layer></>);
      break;
    }
    case "heads": {  // Zoe calls it, pointing
      mood = MOODS.close;
      cam = kickCam(drift(on({ x: zH.x + 60, y: zH.y + 80 }, 2.1), f, 2), u - 4, 10);
      body = <Kitchen f={f} zoe={[{ ...POSES.point, armR: [70, -20] }, "determined"]} />;
      break;
    }
    case "grin": {   // Leo grins and shrugs: fifty-fifty, right?
      mood = MOODS.close;
      cam = drift(on({ x: lH.x - 30, y: lH.y + 80 }, k(u, 0, len, 2.0, 2.2)), f, 2);
      body = <Kitchen f={f} leo={[POSES.shrug, "laugh"]} zoe={[POSES.stand, "smirk"]} />;
      break;
    }
    case "notquite": { // freeze-frame: the coin hangs in the air, "50/50" gets crossed out
      mood = MOODS.freeze;
      cam = { x: 0, y: -60, zoom: k(u, 0, 6, 1.2, 1.1, Easing.out(Easing.cubic)), rot: k(u, 0, 6, -2, 0) };
      const strike = k(u, 8, 16, 0, 1);
      body = <Kitchen f={span.a} zoe={[POSES.stand, "smirk"]} leo={[POSES.shrug, "laugh"]} extra={<>
        <Coin x={540} y={720} r={110} spin={50} tilt={-8} />
        <T x={540} y={520} s={150} c="#ffffff">50/50</T>
        <path d={`M 330 470 L ${330 + 420 * strike} ${470 - 60 * strike}`} stroke="#e8443a" strokeWidth={22} strokeLinecap="round" />
      </>} />;
      overlay = <Flash framesSince={u} len={3} />;
      break;
    }
    case "study": {  // 48 flippers, all filmed: a wall of little people flicking coins, REC light blinking
      mood = MOODS.lab;
      cam = { x: 0, y: k(u, 0, len, 40, 0), zoom: k(u, 0, len, 1.08, 1.0), rot: 0 };
      const cols = 6, rows = 8;
      const cells = Array.from({ length: cols * rows }, (_, i) => {
        const cx = 140 + (i % cols) * 160, cy = 320 + Math.floor(i / cols) * 118;
        const show = k(u, (i % 13) * 0.8, (i % 13) * 0.8 + 6, 0, 1);
        const ph = ((f + i * 7) % 24) / 24, hop = Math.sin(ph * Math.PI) * 46;
        const shirt = ["#2fa89a", "#e8643a", "#7c4dd6", "#2d6fd8", "#f2c230", "#e8443a"][i % 6];
        return <g key={i} opacity={show} transform={`translate(${cx} ${cy})`}>
          <path d="M -30 50 Q -30 10 0 10 Q 30 10 30 50 Z" fill={shirt} stroke={INK} strokeWidth={4} />
          <circle cy={-6} r={20} fill={["#c98a5e", "#ffd9b8", "#7a4a2e", "#f2c39b"][i % 4]} stroke={INK} strokeWidth={4} />
          <Coin x={26} y={-26 - hop} r={9} spin={ph * 720} />
        </g>;
      });
      body = <Lab>{cells}
        <g transform="translate(540 190)"><rect x={-120} y={-44} width={240} height={88} rx={20} fill="#1e2a52" stroke="#f6efe0" strokeWidth={5} />
          <circle cx={-62} cy={0} r={18} fill="#e8443a" opacity={Math.floor(f / 10) % 2 ? 1 : 0.3} /><T x={30} y={16} s={46}>REC</T></g>
        <T x={540} y={1300} s={84} c={GOLD} o={k(u, 14, 22, 0, 1)}>48 PEOPLE</T>
      </Lab>;
      break;
    }
    case "count": {  // the flip counter rolls up to 350,757 while coins pile up
      mood = MOODS.lab;
      cam = drift({ x: 0, y: 0, zoom: 1.0, rot: 0 }, f, 2);
      const n = Math.round(k(u, 0, Math.min(len - 6, 50), 0, 350757, Easing.out(Easing.cubic)));
      const piles = [0, 1, 2, 3, 4, 5, 6].map((i) => {
        const h = Math.floor(k(u, i * 3, Math.min(len - 6, 50), 0, 9 + ((i * 5) % 6)));
        const px = 180 + i * 120;
        return <g key={i}>{Array.from({ length: h }, (_, j) => <Coin key={j} x={px} y={1290 - j * 30} r={48} spin={78} />)}</g>;
      });
      body = <Lab>
        <T x={540} y={430} s={66} c="#9fb0d8">FLIPS</T>
        <T x={540} y={600} s={150} c={GOLD}>{n.toLocaleString("en-US")}</T>
        {piles}
      </Lab>;
      break;
    }
    case "same": {   // a see-saw tips (slightly) toward "same side"
      mood = MOODS.lab;
      cam = { x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.06), rot: 0 };
      const tip = k(u, 6, 22, 0, -5, Easing.out(Easing.back(1.6)));
      const pans = [{ x: -330, lbl: "SAME SIDE", pct: "50.8%", c: GOLD, n: 6 }, { x: 330, lbl: "OTHER SIDE", pct: "49.2%", c: SILVER, n: 5 }];
      body = <Lab>
        <g transform="translate(540 1080)">
          <path d="M -70 160 L 0 0 L 70 160 Z" fill="#6b7a9e" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <g transform={`rotate(${tip})`}>
            <rect x={-440} y={-22} width={880} height={30} rx={10} fill="#d8d0c4" stroke={INK} strokeWidth={7} />
            {pans.map((p) => <g key={p.x}>
              {Array.from({ length: p.n }, (_, j) => <Coin key={j} x={p.x} y={-40 - j * 26} r={60} spin={78} />)}
              <T x={p.x} y={-260} s={64} c={p.c} o={k(u, 10, 18, 0, 1)}>{p.pct}</T>
              <T x={p.x} y={-330} s={42} o={k(u, 4, 12, 0, 1)}>{p.lbl}</T>
            </g>)}
          </g>
        </g>
      </Lab>;
      break;
    }
    case "why": {    // slow motion: the coin's flight arc from the thumb, up and back down
      mood = MOODS.lab;
      cam = { x: 0, y: 0, zoom: 1, rot: 0 };
      const t = k(u, 0, len, 0.05, 0.95, Easing.linear);
      const px = (s: number) => 220 + s * 640, py = (s: number) => 1250 - Math.sin(s * Math.PI) * 820;
      body = <Lab>
        <path d={Array.from({ length: 41 }, (_, i) => `${i ? "L" : "M"} ${px(i / 40)} ${py(i / 40)}`).join(" ")} stroke="#9fb0d8" strokeWidth={6} strokeDasharray="18 16" fill="none" />
        <Hand x={170} y={1350} scale={0.8} skin={SKIN} />
        <Hand x={910} y={1350} scale={0.8} skin={SKIN} open flip />
        {[0.2, 0.35, 0.5, 0.65, 0.8].filter((s) => s < t).map((s) => <g key={s} opacity={0.25}><Coin x={px(s)} y={py(s)} r={55} spin={s * 1800} /></g>)}
        <Coin x={px(t)} y={py(t)} r={70} spin={t * 1800} />
      </Lab>;
      break;
    }
    case "wobble": { // close-up of the spinning coin: its axis wobbles around a cone (precession)
      mood = MOODS.lab;
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.1, 1.25), rot: 0 }, f, 2);
      const a = Math.sin(u * 0.22) * 24;
      body = <Lab>
        <ellipse cx={540} cy={440} rx={230} ry={56} fill="none" stroke="#9fb0d8" strokeWidth={6} strokeDasharray="14 12" />
        <path d={`M 540 760 L ${540 + Math.sin((a * Math.PI) / 90) * 230} ${440 + Math.cos(u * 0.22) * 40}`} stroke={GOLD} strokeWidth={10} strokeLinecap="round" />
        <circle cx={540 + Math.sin((a * Math.PI) / 90) * 230} cy={440 + Math.cos(u * 0.22) * 40} r={16} fill={GOLD} stroke={INK} strokeWidth={4} />
        <Coin x={540} y={760} r={200} spin={50 + Math.sin(u * 0.13) * 18} tilt={a} />
      </Lab>;
      break;
    }
    case "flight": { // the flight as a strip: the starting side faces up a little more of the time
      mood = MOODS.lab;
      cam = { x: 0, y: 0, zoom: 1, rot: 0 };
      const N = 9;
      body = <Lab>
        {Array.from({ length: N }, (_, i) => {
          const show = k(u, i * 2, i * 2 + 5, 0, 1);
          const up = i % 2 === 0;
          return <g key={i} opacity={show}><Coin x={140 + i * 100} y={560 - Math.sin((i / (N - 1)) * Math.PI) * 180} r={42} spin={up ? 20 : 160} />
            <rect x={110 + i * 100} y={700} width={60} height={30} rx={6} fill={up ? GOLD : SILVER} stroke={INK} strokeWidth={4} /></g>;
        })}
        <T x={540} y={880} s={50} o={k(u, 18, 26, 0, 1)}>STARTING SIDE UP</T>
        <rect x={140} y={920} width={k(u, 20, 40, 0, 820)} height={70} rx={14} fill={GOLD} stroke={INK} strokeWidth={6} />
        <T x={540} y={1090} s={50} o={k(u, 26, 34, 0, 1)}>OTHER SIDE UP</T>
        <rect x={140} y={1130} width={k(u, 28, 48, 0, 770)} height={70} rx={14} fill={SILVER} stroke={INK} strokeWidth={6} />
      </Lab>;
      break;
    }
    case "nodiff": { // heads vs tails alone: perfectly level
      mood = MOODS.lab;
      cam = drift({ x: 0, y: 0, zoom: 1.05, rot: 0 }, f, 2);
      const b = (o: number) => Math.abs(Math.sin((u + o) * 0.12)) * 30;
      body = <Lab>
        <Coin x={270} y={760 - b(0)} r={170} spin={0} />
        <T x={540} y={810} s={170} c="#ffffff" o={k(u, 6, 12, 0, 1)}>=</T>
        <Coin x={810} y={760 - b(13)} r={170} spin={180} />
        <T x={270} y={1040} s={58}>HEADS</T>
        <T x={810} y={1040} s={58}>TAILS</T>
      </Lab>;
      break;
    }
    case "edge": {   // a tiny edge: a magnifier finds the sliver past the halfway line
      mood = MOODS.lab;
      cam = { x: 0, y: 0, zoom: 1, rot: 0 };
      const mx = k(u, 0, 18, 200, 548, Easing.inOut(Easing.cubic));
      body = <Lab>
        <rect x={140} y={700} width={800} height={110} rx={18} fill={SILVER} stroke={INK} strokeWidth={7} />
        <rect x={140} y={700} width={406} height={110} rx={18} fill={GOLD} stroke={INK} strokeWidth={7} />
        <path d="M 540 660 L 540 850" stroke="#ffffff" strokeWidth={6} strokeDasharray="12 10" />
        <T x={540} y={620} s={46} c="#9fb0d8">HALFWAY</T>
        <g transform={`translate(${mx} 755)`}>
          <circle r={150} fill="#ffffff" opacity={0.12} stroke="#f6efe0" strokeWidth={14} />
          <path d="M 105 105 L 230 230" stroke="#f6efe0" strokeWidth={34} strokeLinecap="round" />
        </g>
        <T x={540} y={1080} s={80} c={GOLD} o={k(u, 18, 26, 0, 1)}>+0.8%</T>
      </Lab>;
      break;
    }
    case "bets": {   // over a thousand bets: the gold line slowly climbs above zero; other flippers hover around it
      mood = MOODS.lab;
      cam = { x: 0, y: 0, zoom: 1, rot: 0 };
      const prog = k(u, 0, len - 6, 0, 1, Easing.linear);
      const pts = (fn: (i: number) => number) => Array.from({ length: Math.max(2, Math.round(prog * 60)) }, (_, i) => `${i ? "L" : "M"} ${160 + i * 13} ${fn(i)}`).join(" ");
      const noise = (i: number, s: number) => Math.sin(i * 1.7 + s) * 26 + Math.sin(i * 0.53 + s * 2) * 18;
      body = <Lab>
        <path d="M 150 500 L 150 1200 M 150 900 L 960 900" stroke="#6b7a9e" strokeWidth={6} />
        <T x={190} y={480} s={44} c="#9fb0d8">WINS</T>
        <T x={820} y={1270} s={44} c="#9fb0d8">1,000 BETS</T>
        {[1, 3, 5].map((s) => <path key={s} d={pts((i) => 900 + noise(i, s))} stroke={SILVER} strokeWidth={6} fill="none" opacity={0.5} />)}
        <path d={pts((i) => 900 - i * 5 + noise(i, 9) * 0.6)} stroke={GOLD} strokeWidth={12} fill="none" strokeLinecap="round" />
      </Lab>;
      break;
    }
    case "spins": {  // back home: the coin flies up into the lamp light, camera tilts up with it
      const t = k(u, 0, len, 0, 1, Easing.linear);
      const cy = 1100 - Math.sin(t * Math.PI) * 780;
      cam = { x: 120, y: k(u, 0, len * 0.5, 0, -260) + k(u, len * 0.5, len, 0, 260), zoom: 1.25, rot: 0 };
      body = <Kitchen f={f} zoe={[POSES.stand, "focused"]} leo={[HOLD_UP, "focused"]} extra={<Coin x={LX - 40 - t * 120} y={cy} r={46} spin={u * 32} tilt={Math.sin(u * 0.3) * 18} />} />;
      overlay = <SpeedLines amount={0.25} angle={90} />;
      break;
    }
    case "catch": {  // slap: Leo catches it, hand closed
      cam = kickCam(drift(on({ x: LX - 140, y: lH.y + 160 }, 1.7), f, 2), u - 2, 16);
      body = <Kitchen f={f} zoe={[POSES.stand, "focused"]} leo={[POSES.hug, "determined"]} />;
      break;
    }
    case "reveal": { // the hand opens: heads
      mood = MOODS.close;
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.05, 1.2), rot: 0 }, f, 2);
      const open = u > 5;
      body = (<><Layer p={0.2}><AbsoluteFill style={{ background: "radial-gradient(70% 50% at 50% 45%, #f0b878 0%, #6b4636 100%)" }} /></Layer>
        <Layer p={1}><Svg><Hand x={540} y={1100} scale={1.6} skin={SKIN} open={open}>{open && <Coin x={40} y={-30} r={120} spin={55} glow={k(u, 5, 12, 1, 0.4)} />}</Hand></Svg></Layer></>);
      overlay = <Flash framesSince={u - 5} len={5} />;
      break;
    }
    case "slice": {  // Zoe lifts the slice, cheese stretching
      mood = MOODS.close;
      cam = drift(on({ x: zH.x + 120, y: zH.y + 200 }, k(u, 0, len, 1.6, 1.8)), f, 2);
      const lift = k(u, 2, 14, 0, 1);
      const sx = 540 + (ZX + 110 - 540) * lift, sy = TABLE_Y - 10 + (zH.y + 150 - TABLE_Y + 10) * lift;
      body = <Kitchen f={f} slice={false} zoe={[{ ...SLICE_UP, armR: [12 + 18 * lift, -6 - 124 * lift] }, lift > 0.5 ? "laugh" : "smile"]} leo={[POSES.stand, "worried"]}
        front={<><path d={`M ${sx + 60} ${sy + 10} Q ${(sx + 540) / 2} ${sy + 120} 540 ${TABLE_Y - 4}`} stroke="#f6c85a" strokeWidth={10 * (1 - lift * 0.6)} fill="none" opacity={lift < 0.95 ? 1 : 0} />
          <Slice x={sx} y={sy} scale={0.5 + 0.2 * lift} rot={-8 - 150 * lift} /></>} />;
      break;
    }
    case "best": {   // Leo stares at the coin: "Best of three?"
      mood = MOODS.close;
      cam = drift(on({ x: lH.x - 60, y: lH.y + 70 }, k(u, 0, len, 2.0, 2.2)), f, 2);
      const hand = { x: LX + 75 * SC, y: FEET - 285 * SC + 20 };
      body = <Kitchen f={f} slice={false} leo={[HOLD_UP, "worried"]} zoe={[POSES.stand, "laugh"]} extra={<Coin x={hand.x} y={hand.y - 46} r={34} spin={20} />} />;
      break;
    }
    default: {       // ask: pull out to the whole kitchen, coin spinning on the table
      cam = { x: 0, y: k(u, 0, len, 40, -120), zoom: k(u, 0, len, 1.6, 1.0, Easing.inOut(Easing.cubic)), rot: k(u, 0, len, 2, 0) };
      body = <Kitchen f={f} slice={false} zoe={[SLICE_UP, "smile"]} leo={[POSES.shrug, "smirk"]} front={<Coin x={760} y={TABLE_Y - 20} r={36} spin={u * 12} />} />;
    }
  }

  return (
    <AbsoluteFill>
      <Stage cam={cam} bg={mood === MOODS.lab ? "#121a36" : KITCHEN.wall}>{body}</Stage>
      {mood !== MOODS.lab && <Pool x={540} y={760} rx={620} ry={760} color="#ffe2a8" opacity={0.28} />}
      <Grade mood={mood} />
      {overlay}
    </AbsoluteFill>
  );
};

const PLACE: Record<string, string> = { thumb: "hand", reveal: "hand", study: "lab", count: "lab", same: "lab", why: "lab", wobble: "lab", flight: "lab", nodiff: "lab", edge: "lab", bets: "lab" };
const XF = 7;

const Scene: React.FC<SceneProps> = ({ spans }) => {
  const f = useCurrentFrame();
  const span = shotAt(spans, f);
  const prev = span.i > 0 ? spans[span.i - 1] : null;
  const u = f - span.a;
  const fade = prev && u < XF && (PLACE[prev.id] ?? "kitchen") !== (PLACE[span.id] ?? "kitchen");
  return (
    <AbsoluteFill>
      <ShotView span={span} />
      {fade && prev && <AbsoluteFill style={{ opacity: 1 - u / XF }}><ShotView span={prev} /></AbsoluteFill>}
    </AbsoluteFill>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "coin-flip",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: KITCHEN.wall,
};
export default story;
