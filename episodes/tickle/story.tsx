// "You Can't Tickle Yourself. Here's Why" - 2.5D. Theo, the family's tickle champion, can't tickle himself.
// Facts: the brain forecasts the feeling of its own movements and turns it down (Blakemore, Wolpert & Frith 1998;
// cerebellum); with a robot between hand and skin, a ~0.2 s delay made self-touch more ticklish (Blakemore, Frith &
// Wolpert 1999); someone else's touch can't be forecast, so it tickles. Cosy evening living room (new setting).
// Every explanation shot is its own picture; on-screen text stays between y 300 and y 1350 inside 60 px margins.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, ShotSpan } from "../../src/engine/timeline";
import { Stage, Layer, Svg, Cam, drift, kickCam } from "../../src/engine25/stage";
import { Grade, Mood, Pool, Flash, SpeedLines } from "../../src/engine25/light";
import { Person, POSES, Look, INK, Expr, Pose } from "../../library/characters25/person";
import { CAST, EXTRAS } from "../../library/style/channel";
import { Lab, T as LabT, LAB } from "../../library/environments25/lab";
import { LIVING, LivingWall, LivingFloor, Sofa, FloorLamp, Rug, Cushion, Feather, Glasses, Brain, ForecastBubble, Wave, Meter, RobotArm, Lever, DelayClock, Contraption, Footsteps, VoiceIcon, Doorbell } from "../../library/environments25/livingroom";
import scenes from "../../content/scripts/tickle.json";

const SHOTS = scenes.shots.map((s) => ({ id: s.id, cue: s.cue }));

/** inside the outgoing half of a crossfade every on-screen label is dropped, so text never lies over another picture */
const NoText = React.createContext(false);
const T: React.FC<React.ComponentProps<typeof LabT>> = (p) => (React.useContext(NoText) ? null : <LabT {...p} />);

const MOODS: Record<string, Mood> = {
  home: { grade: "#ff9d3c", gradeOp: 0.07, vignette: 0.42, glow: "#ffd9a0" },      // lamp-lit evening
  close: { grade: "#ff8a3c", gradeOp: 0.09, vignette: 0.56, glow: "#ffe2b0" },
  freeze: { grade: "#1b2a6b", gradeOp: 0.38, vignette: 0.72 },                     // "Wait. Why?" - cold freeze-frame
  lab: { grade: "#0b1430", gradeOp: 0.04, vignette: 0.45 },
};

const ease = Easing.bezier(0.33, 0, 0.2, 1);
const k = (u: number, a: number, b: number, from: number, to: number, e = ease) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

// ---------------------------------------------------------------- cast + set geometry
const THEO: Look = CAST.theo, NIA: Look = CAST.nia, DAD: Look = CAST.dad, VOL: Look = EXTRAS[1];
const { gold: GOLD, red: RED, muted: MUTED, text: CREAM, orange: ORANGE } = LAB;

const FLOOR = 1400, SOFA_S = 1.15, SEAT_TOP = FLOOR - 250 * SOFA_S;   // sofa stands on the floor line
const NX = 540 - 240 * SOFA_S, DX = 540 + 240 * SOFA_S;               // Nia on the left seat, Dad on the right
const NS = 1.42, DS = 1.62, TS = 1.2;                                 // Theo ~0.75x the adults
const SIT_Y = (s: number) => SEAT_TOP + 150 * s - 14;                 // hips just above the seat (legs hidden by the sofa front)
const TX = 540, TFEET = 1405;                                         // Theo stands in front of the middle seat
const tHead = { x: TX, y: TFEET - 360 * TS };

const SIT: Pose = { armL: [22, -40], armR: [22, -40], legL: [6, 0], legR: [6, 0] };
const SQUIRM = (u: number, o = 0): Pose => ({ armL: [62 + Math.sin(u * 0.6 + o) * 16, -118], armR: [62 + Math.cos(u * 0.6 + o) * 16, -118], legL: [6, 0], legR: [6, 0],
  lean: Math.sin(u * 0.5 + o) * 7, headTilt: Math.sin(u * 0.4 + o) * 9 });
const BEG: Pose = { armL: [28, -150], armR: [28, -150], legL: [6, 0], legR: [6, 0], headTilt: -6 };
const TICKLE = (u: number): Pose => ({ armL: [92 + Math.sin(u * 0.9) * 6, -40 + Math.sin(u * 1.3) * 14], armR: [92 + Math.cos(u * 0.9) * 6, -40 + Math.cos(u * 1.3) * 14], legL: [16, -10], legR: [16, -10], crouch: 0.07 });
const HOOK = (u: number): Pose => ({ armL: [150 + Math.sin(u * 0.9) * 5, -130 + Math.sin(u * 1.4) * 12], armR: [150 + Math.cos(u * 0.9) * 5, -130 + Math.cos(u * 1.4) * 12], legL: [8, 0], legR: [8, 0], headTilt: Math.sin(u * 0.2) * 4 });
const SELF = (u: number): Pose => ({ armL: [30 + Math.sin(u * 1.2) * 5, -108 + Math.sin(u * 1.9) * 12], armR: [30 + Math.cos(u * 1.2) * 5, -108 + Math.cos(u * 1.9) * 12], legL: [8, 0], legR: [8, 0] });
const FEATHER = (u: number, amp: number): Pose => ({ armL: [150, 10], armR: [22 + Math.sin(u * 1.3) * 8 * amp, -150 + Math.cos(u * 1.3) * 10 * amp], legL: [8, 0], legR: [8, 0], headTilt: -5 });
const MACHINE = (u: number): Pose => ({ armL: [20, -24], armR: [68 + Math.sin(u * 0.5) * 6, -10], legL: [8, 0], legR: [8, 0] });
const TX2 = 420, CX = 680, CS = 1.0;                                   // machine scenes: Theo steps left, the box stands on his right, its feather at his hip
/** Theo's machine plus the pull-string from his right hand to the crank handle */
const Machine: React.FC<{ u: number; pose: Pose }> = ({ u, pose }) => {
  const c = ((u * 9) * Math.PI) / 180, h = handAt(TX2, TFEET, TS, pose, "R");
  const hx = CX + CS * (170 + Math.cos(c) * 50), hy = TFEET + CS * (-150 + Math.sin(c) * 50);
  return <>
    <Contraption x={CX} y={TFEET + 4} scale={CS} crank={u * 9} />
    <path d={`M ${h.x} ${h.y} Q ${(h.x + hx) / 2} ${Math.max(h.y, hy) + 40} ${hx} ${hy}`} stroke="#f6efe0" strokeWidth={5} fill="none" />
  </>;
};

/** where a front-view Person's hand is (ignores lean/sway; good enough to put props in hands) */
const handAt = (x: number, y: number, s: number, pose: Pose, side: "L" | "R") => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const crouch = (pose.crouch ?? 0) * 140, sy = -285 + crouch * 0.9 + 14;
  const [a, b] = side === "L" ? pose.armL : pose.armR, d = side === "L" ? -1 : 1;
  const hx = d * 42 + Math.sin(rad(a)) * d * 70 + Math.sin(rad(a + b)) * d * 64, hy = sy + Math.cos(rad(a)) * 70 + Math.cos(rad(a + b)) * 64;
  return { x: x + hx * s, y: y + hy * s };
};

/** wiggling-finger marks around a point (the tickle motion) */
const Wiggle: React.FC<{ x: number; y: number; f: number; s?: number; o?: number; c?: string }> = ({ x, y, f, s = 1, o = 1, c = "#fff4d6" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {[0, 1, 2, 3].map((i) => {
      const a = ((-80 + i * 53 + Math.sin(f * 0.9 + i) * 10) * Math.PI) / 180, r0 = 36 + Math.sin(f * 1.1 + i) * 5;
      return <path key={i} d={`M ${Math.sin(a) * r0} ${-Math.cos(a) * r0} L ${Math.sin(a) * (r0 + 24)} ${-Math.cos(a) * (r0 + 24)}`} stroke={c} strokeWidth={8} strokeLinecap="round" />;
    })}
  </g>
);

type Act = [Pose, Expr];
/** the living room: wall, lamp, sofa with Nia + Dad, Theo standing in front of it */
const Living: React.FC<{ f: number; theo?: Act | null; nia?: Act | null; dad?: Act; extra?: React.ReactNode; front?: React.ReactNode; cushions?: boolean;
  tx?: number; ty?: number; family?: boolean }> =
  ({ f, theo = [POSES.stand, "smile"], nia = [SIT, "neutral"], dad = [SIT, "calm"], extra, front, cushions = true, tx = TX, ty = TFEET, family = true }) => {
  const dadPose: Pose = { ...dad[0] };
  return (
    <>
      <Layer p={0.55}><Svg><LivingWall y={-420} h={2150} /></Svg></Layer>
      <Layer p={1}><Svg>
        <LivingFloor y={1290} h={900} />
        <rect x={-400} y={1270} width={1880} height={34} fill={LIVING.skirting} stroke={INK} strokeWidth={6} />
        <FloorLamp x={10} y={1330} scale={0.95} />
        <Rug x={540} y={1470} w={1100} />
        <Sofa x={540} y={FLOOR} scale={SOFA_S} />
        {family && <>{nia && <Person x={NX} y={SIT_Y(NS)} scale={NS} facing={1} look={NIA} pose={nia[0]} expr={nia[1]} t={f + 11} blink={(f + 40) % 113 < 4} shadow={0} />}
        <Person x={DX} y={SIT_Y(DS)} scale={DS} facing={-1} look={DAD} pose={dadPose} expr={dad[1]} t={f + 29} blink={(f + 70) % 127 < 4} shadow={0} />
        <Glasses x={DX} y={SIT_Y(DS)} scale={DS} facing={-1} pose={dadPose} /></>}
        <Sofa x={540} y={FLOOR} scale={SOFA_S} front />
        {cushions && <><Cushion x={150} y={1150} rot={-12} scale={0.8} /><Cushion x={930} y={1150} rot={10} scale={0.8} color="#e85a8a" /></>}
        {theo && <Person x={tx} y={ty} scale={TS} facing={1} look={THEO} pose={theo[0]} expr={theo[1]} t={f} blink={f % 97 < 4} />}
        {extra}
      </Svg></Layer>
      {front && <Layer p={1.3}><Svg>{front}</Svg></Layer>}
    </>
  );
};

/** arrow with a pulse travelling along it */
const Signal: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; prog: number; u: number; dash?: boolean }> = ({ x1, y1, x2, y2, c, prog, u, dash }) => {
  if (prog <= 0) return null;
  const ex = x1 + (x2 - x1) * prog, ey = y1 + (y2 - y1) * prog, a = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const p = (u * 0.05) % 1;
  return <g>
    <path d={`M ${x1} ${y1} L ${ex} ${ey}`} stroke={c} strokeWidth={14} strokeLinecap="round" strokeDasharray={dash ? "26 20" : undefined} />
    <path d="M -6 -28 L 36 0 L -6 28 Z" fill={c} stroke={INK} strokeWidth={4} strokeLinejoin="round" transform={`translate(${ex} ${ey}) rotate(${a})`} />
    {prog > 0.98 && <circle cx={x1 + (x2 - x1) * p} cy={y1 + (y2 - y1) * p} r={15} fill="#ffffff" opacity={0.85} />}
  </g>;
};

/** clear cartoon hand: wrist at (x, y), fingers up at rot 0. `point` curls all but the index finger; `poke` pushes it out. */
const OpenHand: React.FC<{ x: number; y: number; s?: number; skin: string; sleeve: string; rot?: number; point?: boolean; poke?: number }> = ({ x, y, s = 1, skin, sleeve, rot = 0, point = false, poke = 0 }) => {
  const fingers = [[-43, 96], [-15, 116], [13, 110], [41, 88]] as const;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-64} y={-6} width={128} height={190} rx={28} fill={sleeve} stroke={INK} strokeWidth={8} />
      <rect x={-14} y={-76} width={28} height={84} rx={14} fill={skin} stroke={INK} strokeWidth={7} transform="translate(-58 -36) rotate(-48)" />
      {fingers.map(([fx, L], i) => { const len = point ? (i === 0 ? 124 + poke * 30 : 36) : L;
        return <rect key={i} x={fx - 14} y={-130 - len} width={28} height={len + 30} rx={14} fill={skin} stroke={INK} strokeWidth={7} />; })}
      <path d="M -60 4 L -60 -104 Q -60 -138 -28 -138 L 28 -138 Q 60 -138 60 -104 L 60 4 Z" fill={skin} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -30 -40 Q 0 -24 30 -44" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.5} />
    </g>
  );
};

// ---------------------------------------------------------------- shots
const ShotView: React.FC<{ span: ShotSpan }> = ({ span }) => {
  const f = useCurrentFrame();
  const u = f - span.a, len = span.b - span.a;
  let cam: Cam = { x: 0, y: 0, zoom: 1, rot: 0 };
  let mood = MOODS.home;
  let body: React.ReactNode = null;
  let overlay: React.ReactNode = null;
  const on = (p: { x: number; y: number }, zoom: number, rot = 0): Cam => ({ x: p.x - 540, y: p.y - 960, zoom, rot });

  switch (span.id) {
    case "hook": {   // snap zoom to a tight close-up: smug grin, fingers wiggling by his face
      mood = MOODS.close;
      const pose = HOOK(u);
      cam = drift(on({ x: 540, y: 1010 }, k(u, 0, 7, 1.4, 3.3, Easing.out(Easing.cubic))), f, 3);
      const hl = handAt(TX, TFEET, TS, pose, "L"), hr = handAt(TX, TFEET, TS, pose, "R");
      body = <Living f={f} family={false} theo={[pose, "smirk"]} extra={<><Wiggle x={hl.x} y={hl.y} f={f} s={0.5} /><Wiggle x={hr.x} y={hr.y} f={f + 5} s={0.5} /></>} />;
      overlay = <Flash framesSince={u - 6} len={4} />;
      break;
    }
    case "champion": { // wide: Theo attacks the sofa from the middle seat, Nia shrieks, Dad begs, cushions fly
      cam = drift({ x: k(u, 0, len, -30, 20), y: k(u, 0, len, 40, 10), zoom: k(u, 0, len, 1.1, 1.03), rot: 0 }, f, 3);
      const pose = TICKLE(u), ty = SEAT_TOP + 22;
      const hl = handAt(TX, ty, TS, pose, "L"), hr = handAt(TX, ty, TS, pose, "R");
      const pop = (i: number) => { const t = ((u + i * 17) % 34) / 34;
        return { x: (i ? 992 : 88) + Math.sin(t * Math.PI) * (i ? -10 : 10), y: 1130 - Math.sin(t * Math.PI) * 560, r: t * 420 * (i ? 1 : -1) }; };
      const begging = u > len * 0.55;
      body = <Living f={f} cushions={false} ty={ty} theo={[pose, "laugh"]} nia={[SQUIRM(u), u % 30 < 15 ? "laugh" : "shock"]} dad={[begging ? { ...BEG, lean: Math.sin(u * 0.5) * 4 } : SQUIRM(u, 2), begging ? "worried" : "laugh"]}
        extra={<><Wiggle x={hl.x} y={hl.y} f={f} /><Wiggle x={hr.x} y={hr.y} f={f + 5} />
          {[0, 1].map((i) => { const c = pop(i); return <Cushion key={i} x={c.x} y={c.y} rot={c.r} scale={0.95} color={i ? "#e85a8a" : "#3fb8c9"} />; })}</>} />;
      overlay = <SpeedLines amount={0.12} angle={-70} seed={u % 4} />;
      break;
    }
    case "self": {   // Theo tickles his own ribs: blank face, nothing
      const pose = SELF(u);
      cam = drift(on({ x: tHead.x + 10, y: k(u, 4, len * 0.7, 1190, 1020, Easing.inOut(Easing.cubic)) }, 2.3, k(u, 0, len, 6, 3)), f, 2);
      const hl = handAt(TX, TFEET, TS, pose, "L"), hr = handAt(TX, TFEET, TS, pose, "R");
      body = <Living f={f} family={false} theo={[pose, u > 14 ? "neutral" : "smirk"]}
        extra={<><Wiggle x={hl.x} y={hl.y} f={f} s={0.6} o={0.7} /><Wiggle x={hr.x} y={hr.y} f={f + 4} s={0.6} o={0.7} /></>} />;
      break;
    }
    case "harder": { // a feather, harder: frowning; the camera pushes in
      mood = MOODS.close;
      const amp = k(u, 0, len, 0.5, 2.2);
      const pose = FEATHER(u, amp);
      const h = handAt(TX, TFEET, TS, pose, "R");
      cam = drift(on({ x: 515, y: 1080 }, k(u, 0, len, 2.9, 3.4, Easing.inOut(Easing.cubic))), f, 2 + amp);
      body = <Living f={f} family={false} theo={[pose, u > len * 0.45 ? "determined" : "focused"]}
        extra={<Feather x={h.x} y={h.y} scale={0.42} rot={-118 + Math.sin(u * 1.3) * 14 * amp} />} />;
      overlay = <SpeedLines amount={k(u, len * 0.4, len, 0, 0.2)} angle={-25} />;
      break;
    }
    case "why": {    // freeze-frame: the whole family frozen, tilted, drained of colour, a big question mark
      mood = MOODS.freeze;
      const pose = { ...FEATHER(0, 0), headTilt: 12 };
      const h = handAt(TX, TFEET, TS, pose, "R");
      cam = { ...on({ x: 540, y: 1010 }, k(u, 0, 6, 1.55, 1.38, Easing.out(Easing.cubic))), rot: k(u, 0, 6, -1, -5) };
      const pop = k(u, 4, 10, 0, 1, Easing.out(Easing.back(2.2)));
      body = <Living f={span.a} theo={[pose, "worried"]} nia={[SIT, "smirk"]} dad={[SIT, "neutral"]} extra={<>
        <Feather x={h.x} y={h.y} scale={0.42} rot={-118} />
        <g transform={`translate(650 880) scale(${pop})`}><T x={0} y={0} s={200} c="#ffffff">?</T></g>
      </>} />;
      overlay = <><AbsoluteFill style={{ background: "#7d8597", opacity: 0.3 }} /><Flash framesSince={u} len={3} /></>;
      break;
    }
    case "brain": {  // the brain sends the order to the hand AND a copy to a forecast bubble
      mood = MOODS.lab;
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 2);
      const a1 = k(u, 3, 14, 0, 1), a2 = k(u, len * 0.45, len * 0.45 + 12, 0, 1);
      const wig = a1 >= 1 ? Math.sin(u * 0.8) * 6 : 0;
      body = <Lab>
        <Brain x={540} y={540} r={190} />
        <Signal x1={420} y1={760} x2={300} y2={880} c={GOLD} prog={a1} u={u} />
        <T x={190} y={800} s={64} c={GOLD} o={a1}>MOVE!</T>
        <OpenHand x={250} y={1190} s={1.1} skin={THEO.skin} sleeve={THEO.jersey} rot={-8 + wig} />
        <Signal x1={660} y1={760} x2={770} y2={930} c={MUTED} prog={a2} u={u} dash />
        <T x={900} y={830} s={64} c={MUTED} o={a2}>COPY</T>
        <g opacity={k(u, len * 0.45 + 10, len * 0.45 + 18, 0, 1)}><ForecastBubble x={800} y={1110} w={380} h={240}>
          <OpenHand x={800} y={1160} s={0.36} skin={THEO.skin} sleeve={THEO.jersey} rot={-8 + wig} />
        </ForecastBubble></g>
      </Lab>;
      break;
    }
    case "forecast": { // forecast wave + real touch wave line up and cancel out; the feeling meter stays low
      mood = MOODS.lab;
      cam = drift({ x: 0, y: 0, zoom: 1.0, rot: 0 }, f, 2);
      const meet = k(u, len * 0.3, len * 0.5, 0, 1), cancel = k(u, len * 0.5, len * 0.65, 0, 1);
      const yF = 600, yR = 900 - 300 * meet, amp = 80 * (1 - cancel);
      body = <Lab>
        <T x={540} y={440} s={70} c={GOLD} o={k(u, 2, 8, 0, 1)}>FORECAST</T>
        <g opacity={k(u, 0, 6, 0, 1)}><Wave x={140} y={yF} w={800} amp={amp} phase={u * 0.18} color={GOLD} width={14} /></g>
        <g opacity={k(u, 8, 14, 0, 1)}><Wave x={140} y={yR} w={800} amp={amp} phase={u * 0.18} color={CREAM} width={8} /></g>
        <T x={540} y={yR + 150} s={70} c={CREAM} o={k(u, 10, 16, 0, 1) * (1 - k(u, len * 0.28, len * 0.36, 0, 1))}>REAL TOUCH</T>
        <Meter x={540} y={1250} value={0.5 - 0.42 * cancel + Math.sin(u * 0.3) * 0.015} />
      </Lab>;
      break;
    }
    case "other": {  // someone else's finger: the bubble is empty, the touch wave spikes, the meter jumps
      mood = MOODS.lab;
      const per = 16, ph = u % per, poke = ph < 4 ? ph / 4 : Math.max(0, 1 - (ph - 4) / 6);
      cam = kickCam(drift({ x: 0, y: 0, zoom: 1.03, rot: 0 }, f, 2), ph - 4, 7);
      const spikes = Array.from({ length: 61 }, (_, i) => { const t = i / 60, x = 140 + t * 800, d = Math.abs(t - 0.72);
        return `${i ? "L" : "M"} ${x} ${930 - (d < 0.12 ? (1 - d / 0.12) * 200 * poke : 0) - Math.sin(t * 40 + u) * 10 * poke}`; }).join(" ");
      body = <Lab>
        <ForecastBubble x={330} y={520} w={420} h={260}>
          <path d="M 270 460 L 390 580 M 390 460 L 270 580" stroke={RED} strokeWidth={20} strokeLinecap="round" />
        </ForecastBubble>
        <T x={330} y={790} s={64} c={RED}>NO FORECAST</T>
        <OpenHand x={790} y={440} s={1.15} skin={NIA.skin} sleeve={NIA.jersey} rot={200} point poke={poke} />
        <path d={spikes} stroke={RED} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Meter x={540} y={1270} value={0.45 + poke * 0.5} />
      </Lab>;
      break;
    }
    case "cerebellum": { // side view: the cerebellum at the back of the head glows; one label
      mood = MOODS.lab;
      cam = { x: k(u, 0, len, 0, -40), y: k(u, 0, len, 0, 40), zoom: k(u, 0, len, 1.0, 1.12, Easing.inOut(Easing.cubic)), rot: 0 };
      const glow = k(u, 6, 16, 0, 1) * (0.75 + 0.25 * Math.sin(u * 0.25));
      body = <Lab>
        <path d="M 250 560 C 250 320 470 250 640 280 C 830 310 900 470 860 640 C 900 700 920 760 860 780 C 870 860 830 880 790 900 C 780 990 700 1010 620 1000 L 610 1140 L 300 1140 C 320 1020 250 930 250 800 Z"
          fill="#1e2a52" stroke={MUTED} strokeWidth={8} strokeDasharray="20 14" strokeLinejoin="round" />
        <Brain x={560} y={600} r={230} side cerebellumGlow={glow} />
        <path d="M 400 800 C 380 900 360 980 380 1080" stroke={GOLD} strokeWidth={8} fill="none" opacity={k(u, 14, 20, 0, 1)} strokeLinecap="round" />
        <T x={420} y={1220} s={76} c={GOLD} o={k(u, 14, 20, 0, 1)}>CEREBELLUM</T>
      </Lab>;
      break;
    }
    case "robot": {  // a volunteer moves a lever; a robot arm strokes their palm with a foam tip
      mood = MOODS.lab;
      cam = drift({ x: 0, y: 60, zoom: k(u, 0, len, 1.04, 1.0), rot: 0 }, f, 1.5);
      const a = Math.sin(u * 0.16);
      const vol: Pose = { armL: [40 + a * 12, -46], armR: [70, -12], legL: [6, 0], legR: [6, 0] };
      const PX = 390, LX = 210, RS = 0.75;
      const palm = handAt(PX, 1330, 1.25, vol, "R"), grip = handAt(PX, 1330, 1.25, vol, "L");
      const lever = (Math.asin(Math.max(-0.9, Math.min(0.9, (grip.x - LX) / 200))) * 180) / Math.PI;
      const r = 0.6, bx = palm.x + 14 + Math.sin(u * 0.16 + 0.6) * 18 + (180 + 300 * r) * RS;   // the foam tip strokes the palm, lagging the lever
      body = <Lab>
        <T x={540} y={760} s={66} c={GOLD} o={k(u, 2, 8, 0, 1)}>1999 TICKLE ROBOT</T>
        <path d={`M ${LX} 1340 C 400 1385 ${bx - 200} 1385 ${bx} 1312`} stroke={ORANGE} strokeWidth={8} fill="none" strokeDasharray="18 14" strokeDashoffset={-u * 3} />
        <Lever x={LX} y={1340} angle={lever} />
        <Person x={PX} y={1330} scale={1.25} facing={1} look={VOL} pose={vol} expr={a > 0.6 ? "smile" : "focused"} t={f} blink={f % 101 < 4} />
        <g transform={`translate(${bx} 0) scale(-1 1) translate(${-bx} 0)`}>
          <RobotArm x={bx} y={1312} scale={RS} reach={r} tip="foam" />
        </g>
      </Lab>;
      break;
    }
    case "delay": {  // a fifth-of-a-second stopwatch: with the delay the volunteer finally giggles
      mood = MOODS.lab;
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.05), rot: 0 }, f, 2);
      const d = k(u, 2, 18, 0, 0.2, Easing.linear), laugh = k(u, 20, 26, 0, 1);
      const shake = laugh * Math.sin(u * 1.4) * 4;
      body = <Lab>
        <DelayClock x={290} y={560} r={190} value={d} />
        <T x={740} y={590} s={66} c={ORANGE} o={k(u, 14, 20, 0, 1)}>+0.2 s DELAY</T>
        <Person x={520} y={1360} scale={1.45} facing={1} look={VOL} pose={laugh > 0.5 ? { armL: [30, -120], armR: [30, -120], legL: [8, 0], legR: [8, 0], lean: shake } : POSES.stand} expr={laugh > 0.5 ? "laugh" : "neutral"} t={f} blink={f % 101 < 4} />
        {laugh > 0.5 && <><Wiggle x={520 - 150} y={1360 - 420} f={f} s={1.3} c={GOLD} /><Wiggle x={520 + 150} y={1360 - 420} f={f + 6} s={1.3} c={GOLD} /></>}
        <g transform="translate(880 1330)">
          <rect x={-46} y={-420} width={92} height={420} rx={20} fill="#1a2448" stroke={INK} strokeWidth={8} />
          <rect x={-30} y={-404 + 388 * (1 - (0.15 + 0.8 * laugh))} width={60} height={388 * (0.15 + 0.8 * laugh)} rx={12} fill={laugh > 0.5 ? RED : GOLD} />
        </g>
      </Lab>;
      break;
    }
    case "useful": { // your own footsteps and voice go quiet; the doorbell rings loud and clear
      mood = MOODS.lab;
      cam = drift({ x: 0, y: 0, zoom: 1.0, rot: 0 }, f, 1.5);
      const dimmed = u > 12;
      const ring = Math.sin(u * 0.9) * k(u, 16, 22, 0, 1);
      body = <Lab>
        <g opacity={k(u, 0, 6, 0, 1)}><Footsteps x={300} y={520} s={1.45} dim={dimmed} /><VoiceIcon x={780} y={520} s={1.45} dim={dimmed} /></g>
        <T x={540} y={830} s={70} c={MUTED} o={k(u, 10, 16, 0, 1)}>YOU: QUIET</T>
        <g transform={`rotate(${ring * 9} 540 1060)`} opacity={k(u, 14, 20, 0, 1)}><Doorbell x={540} y={1065} s={1.5} /></g>
        <T x={540} y={1335} s={70} c={GOLD} o={k(u, 20, 26, 0, 1)}>THE WORLD: LOUD</T>
      </Lab>;
      break;
    }
    case "plan": {   // close on the new machine: box, string, feather, crank - Theo pulls the string, Dad watches
      const pose = MACHINE(u);
      cam = drift(on({ x: 640, y: 1150 }, k(u, 0, len, 1.55, 1.65)), f, 2);
      body = <Living f={f} tx={TX2} theo={[pose, "determined"]} nia={null} dad={[SIT, "calm"]}
        extra={<Machine u={u} pose={pose} />} />;
      break;
    }
    case "giggle": { // it works: Theo's face in a giggle close-up, then Nia's eye-roll beside him
      mood = MOODS.close;
      const pose = { ...MACHINE(u), lean: Math.sin(u * 0.8) * 4 };
      const cut = Math.round(len * 0.55), second = u >= cut;
      const tH2 = { x: TX2, y: TFEET - 360 * TS };
      cam = second ? drift(on({ x: 340, y: 950 }, k(u, cut, len, 2.0, 2.1)), f, 2)
        : drift(on({ x: TX2 + 10, y: tH2.y + 40 }, k(u, 0, cut, 2.6, 2.75)), f, 2);
      body = <Living f={f} tx={TX2} family={second} theo={[pose, "laugh"]} nia={[{ ...SIT, headTilt: -14, lookX: 1, armL: [30, -130], armR: [30, -130] }, "smirk"]} dad={[SIT, "smile"]}
        extra={<><Machine u={u} pose={pose} />
          <Wiggle x={tH2.x + 75} y={tH2.y - 40} f={f} s={0.8} c={GOLD} />
          {second && <path d={`M ${NX - 40} ${SIT_Y(NS) - 420 * NS} a 40 26 0 1 1 80 0`} stroke="#fff4d6" strokeWidth={7} fill="none" strokeLinecap="round" opacity={k(u, cut + 4, cut + 8, 0, 1)} />}
        </>} />;
      break;
    }
    default: {       // ask: pull out wide over the family on the sofa
      cam = { x: 0, y: k(u, 0, len, 60, 30), zoom: k(u, 0, len, 1.55, 1.0, Easing.inOut(Easing.cubic)), rot: k(u, 0, len, 2, 0) };
      const pose = MACHINE(u);
      body = <Living f={f} tx={TX2} theo={[pose, "smile"]} nia={[SIT, "smirk"]} dad={[SIT, "laugh"]}
        extra={<Machine u={u} pose={pose} />} />;
    }
  }

  const tv = 0.1 + 0.05 * Math.sin(f * 0.9) + 0.03 * Math.sin(f * 2.3);
  return (
    <AbsoluteFill>
      <Stage cam={cam} bg={mood === MOODS.lab ? LAB.bg : LIVING.wall}>{body}</Stage>
      {mood !== MOODS.lab && <>
        <Pool x={300} y={700} rx={600} ry={760} color="#ffe2a8" opacity={0.24} />
        <Pool x={1000} y={1100} rx={420} ry={700} color="#7fc8ff" opacity={tv} />
      </>}
      <Grade mood={mood} />
      {overlay}
    </AbsoluteFill>
  );
};

const PLACE: Record<string, string> = Object.fromEntries(scenes.shots.map((s) => [s.id, s.place]));
const XF = 5;

const Scene: React.FC<SceneProps> = ({ spans }) => {
  const f = useCurrentFrame();
  const span = shotAt(spans, f);
  const prev = span.i > 0 ? spans[span.i - 1] : null;
  const u = f - span.a;
  const fade = prev && u < XF && (PLACE[prev.id] ?? "home") !== (PLACE[span.id] ?? "home");
  return (
    <AbsoluteFill>
      <NoText.Provider value={!!fade}><ShotView span={span} /></NoText.Provider>
      {fade && prev && <NoText.Provider value><AbsoluteFill style={{ opacity: 1 - (u + 1) / (XF + 1) }}><ShotView span={prev} /></AbsoluteFill></NoText.Provider>}
    </AbsoluteFill>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "tickle",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: LIVING.wall,
};
export default story;
