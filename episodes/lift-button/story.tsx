// "The Lift Button That Was Never Connected" - 2.5D. Ava, late for an interview, hammers the lift's close-door button.
// Facts: many US lift close buttons do nothing in normal service (doors must stay open long enough under the 1990
// disability law); firefighters' key mode still uses it (ASME A17.1 Phase II); 2004: >2,500 of NYC's 3,250 crosswalk
// buttons did nothing; "illusion of control" (Langer). Cool morning office look. Every explanation shot is a different
// picture, and all on-screen text stays above the captions.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, ShotSpan } from "../../src/engine/timeline";
import { Stage, Layer, Svg, Cam, drift, kickCam } from "../../src/engine25/stage";
import { Grade, Mood, Pool, Flash, SpeedLines } from "../../src/engine25/light";
import { Person, POSES, runPose, Look, INK, Expr, Pose } from "../../library/characters25/person";
import { LobbyWall, Lift, BigButton, Finger, Crutches, Helmet, Key, Street, PushPole, CloseIcon, OFFICE } from "../../library/environments25/office";

const SHOTS = [
  { id: "hook", cue: "Ava is late" },
  { id: "press", cue: "She presses the" },
  { id: "again", cue: "Again. And again." },
  { id: "wide", cue: "Monday morning." },
  { id: "jab", cue: "Ava jabs the" },
  { id: "secret", cue: "Here's the secret." },
  { id: "nothing", cue: "In many lifts, that" },
  { id: "law", cue: "In the United States," },
  { id: "crutches", cue: "long enough for" },
  { id: "switched", cue: "So in many" },
  { id: "fire", cue: "Firefighters can still" },
  { id: "notjust", cue: "And it's not" },
  { id: "nyc", cue: "In 2004, New" },
  { id: "why", cue: "So why keep" },
  { id: "illusion", cue: "Psychologists call it" },
  { id: "close", cue: "The doors close" },
  { id: "smile", cue: "Ava smiles." },
  { id: "ordid", cue: "Or did it?" },
  { id: "ask", cue: "How many times" },
];

const MOODS: Record<string, Mood> = {
  lobby: { grade: "#3a6a8a", gradeOp: 0.06, vignette: 0.35, glow: "#fff6dc" },     // cool morning light
  tense: { grade: "#2a3a5a", gradeOp: 0.18, vignette: 0.55 },
  secret: { grade: "#0b1430", gradeOp: 0.35, vignette: 0.75 },
  lab: { grade: "#0b1430", gradeOp: 0.04, vignette: 0.45 },
  warm: { grade: "#ff9d3c", gradeOp: 0.08, vignette: 0.35, glow: "#ffe2b0" },
};

const ease = Easing.bezier(0.33, 0, 0.2, 1);
const k = (u: number, a: number, b: number, from: number, to: number, e = ease) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

// ---------------------------------------------------------------- cast
const AVA: Look = { skin: "#8d5a3b", hair: "#1a1010", hairStyle: "bun", jersey: "#2d3a5a", jersey2: "#1f2a44", shorts: "#2d3a5a", socks: "#2d3a5a" };
const FIRE: Look = { skin: "#f2c39b", hair: "#3b2416", hairStyle: "short", jersey: "#3a3f4a", jersey2: "#f2c230", shorts: "#3a3f4a", socks: "#3a3f4a" };
const PASSERS: Look[] = [
  { skin: "#ffe2c8", hair: "#c9862e", hairStyle: "short", jersey: "#3fb8c9", shorts: "#3b3f52", socks: "#3b3f52" },
  { skin: "#7a4a2e", hair: "#120c0a", hairStyle: "curly", jersey: "#e8643a", shorts: "#2d3a5a", socks: "#2d3a5a" },
  { skin: "#f2c39b", hair: "#3b2416", hairStyle: "bun", jersey: "#7c4dd6", shorts: "#2a2f3d", socks: "#2a2f3d" },
  { skin: "#d99c6c", hair: "#2a1a14", hairStyle: "buzz", jersey: "#2fbf71", shorts: "#2a2f3d", socks: "#2a2f3d" },
];
const JAB = (a: number): Pose => ({ armL: [12, -6], armR: [55 + a * 25, -40 + a * 30], legL: [6, 0], legR: [6, 0], lean: 3 });
const FOLDER: Pose = { armL: [20, -110], armR: [12, -6], legL: [6, 0], legR: [6, 0] };

const LIFT_X = 540, LIFT_Y = 1400, AVA_X = 430, AVA_FEET = 1370, AVA_S = 1.6;
const avaHead = { x: AVA_X, y: AVA_FEET - 360 * AVA_S };
const PANEL = { x: LIFT_X + 300 - 70, y: LIFT_Y - 960 * 0.52 };

/** the lobby with the lift (Ava inside), optional extras inside the car and in front */
const LobbySet: React.FC<{ f: number; open?: number; ava?: [Pose, Expr]; inside?: React.ReactNode; front?: React.ReactNode; floor?: string; passers?: boolean; avaIn?: boolean }> =
  ({ f, open = 1, ava = [FOLDER, "worried"], inside, front, floor = "G", passers = false, avaIn = true }) => (
  <>
    <Layer p={0.3}><Svg><LobbyWall /></Svg></Layer>
    <Layer p={1}><Svg>
      <Lift x={LIFT_X} y={LIFT_Y} open={open} floor={floor}>
        {avaIn && <Person x={AVA_X - LIFT_X} y={AVA_FEET - LIFT_Y} scale={AVA_S} facing={1} look={AVA} pose={ava[0]} expr={ava[1]} t={f} blink={f % 109 < 4} />}
        {inside}
      </Lift>
      {front}
    </Svg></Layer>
    {passers && <Layer p={1.25}><Svg>{[0, 1].map((i) => { const x = ((f * (i ? -5 : 6) + i * 900) % 1700 + 1700) % 1700 - 300;
      return <Person key={i} x={x} y={1500} scale={1.25} facing={i ? -1 : 1} look={PASSERS[i]} pose={runPose(f * 0.3 + i, 0.3)} expr="neutral" t={f} />; })}</Svg></Layer>}
  </>
);

/** dark backdrop with a faint grid for the explanation shots */
const Lab: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Layer p={0}><AbsoluteFill style={{ background: "#121a36" }} /></Layer>
    <Layer p={0.3}><Svg>{Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-400 + i * 80} -400 L ${-400 + i * 80} 2400 M -400 ${-400 + i * 100} L 1500 ${-400 + i * 100}`} stroke="#1e2a52" strokeWidth={3} />)}</Svg></Layer>
    <Layer p={0}><AbsoluteFill style={{ background: "radial-gradient(60% 40% at 50% 45%, rgba(127,224,255,0.14) 0%, transparent 70%)" }} /></Layer>
    <Layer p={1}><Svg>{children}</Svg></Layer>
  </>
);
const T = (p: { x: number; y: number; s: number; c?: string; o?: number; children: React.ReactNode }) => (
  <text x={p.x} y={p.y} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={p.s} fill={p.c ?? "#f6efe0"} opacity={p.o ?? 1}>{p.children}</text>
);
const GOLD = "#f2c230";

// ---------------------------------------------------------------- shots
const ShotView: React.FC<{ span: ShotSpan }> = ({ span }) => {
  const f = useCurrentFrame();
  const u = f - span.a, len = span.b - span.a;
  let cam: Cam = { x: 0, y: 0, zoom: 1, rot: 0 };
  let mood = MOODS.lobby;
  let body: React.ReactNode = null;
  let overlay: React.ReactNode = null;
  const on = (p: { x: number; y: number }, zoom: number, rot = 0): Cam => ({ x: p.x - 540, y: p.y - 960, zoom, rot });
  const pressAt = (period: number, off = 0) => { const ph = ((u - off) % period + period) % period; return ph < 3 ? ph / 3 : ph < 6 ? 1 - (ph - 3) / 3 : 0; };

  switch (span.id) {
    case "hook": {   // Ava in the lift, sweating, snap zoom
      mood = MOODS.tense;
      cam = drift(on({ x: avaHead.x + 60, y: avaHead.y + 120 }, k(u, 0, 8, 1.4, 2.3, Easing.out(Easing.cubic))), f, 3);
      body = <LobbySet f={f} ava={[FOLDER, "worried"]} inside={<g opacity={0.8}><path d={`M ${AVA_X - LIFT_X + 60} ${AVA_FEET - LIFT_Y - 560 + (u % 20) * 2} q 6 14 0 20 q -6 -6 0 -20`} fill="#bfe8ff" /></g>} />;
      break;
    }
    case "press": {  // close-up: the finger comes in and presses the close button
      mood = MOODS.tense;
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.12), rot: 0 }, f, 2);
      const inF = k(u, 0, 8, 1, 0, Easing.out(Easing.cubic)), p = k(u, 8, 11, 0, 1) * k(u, 14, 18, 1, 0.3);
      body = <><Layer p={0.2}><AbsoluteFill style={{ background: OFFICE.carInside }} /></Layer>
        <Layer p={1}><Svg><BigButton x={540} y={820} r={210} press={p} />
          <Finger x={600 + inF * 400 + p * -6} y={860 + inF * 500 + p * -14} scale={1.25} skin={AVA.skin} sleeve={AVA.jersey} /></Svg></Layer></>;
      overlay = <Flash framesSince={u - 9} len={3} />;
      break;
    }
    case "again": {  // again... and again: fast presses, camera kicks each time
      mood = MOODS.tense;
      const period = 9, p = pressAt(period);
      cam = kickCam(drift({ x: 0, y: 0, zoom: 1.12 + Math.floor(u / period) * 0.04, rot: 0 }, f, 2), u % period - 2, 12);
      body = <><Layer p={0.2}><AbsoluteFill style={{ background: OFFICE.carInside }} /></Layer>
        <Layer p={1}><Svg><BigButton x={540} y={820} r={210} press={p} />
          <Finger x={600 - p * 6 + (1 - p) * 40} y={860 - p * 14 + (1 - p) * 70} scale={1.25} skin={AVA.skin} sleeve={AVA.jersey} /></Svg></Layer></>;
      overlay = <SpeedLines amount={p * 0.3} angle={-35} />;
      break;
    }
    case "wide": {   // establishing: the morning lobby, doors open, people passing
      cam = { x: k(u, 0, len, 0, 0), y: k(u, 0, len, -140, -60), zoom: k(u, 0, len, 1.12, 1.02), rot: 0 };
      body = <LobbySet f={f} passers ava={[FOLDER, "worried"]} />;
      break;
    }
    case "jab": {    // Ava jabs the in-car panel, furious
      mood = MOODS.tense;
      const period = 8, p = pressAt(period);
      cam = kickCam(drift(on({ x: (avaHead.x + PANEL.x) / 2, y: avaHead.y + 220 }, 1.7), f, 2), u % period - 2, 8);
      body = <LobbySet f={f} ava={[JAB(p), "determined"]} inside={<circle cx={PANEL.x - LIFT_X} cy={PANEL.y - LIFT_Y + 100} r={30} fill={OFFICE.glow} opacity={p} />} />;
      overlay = <SpeedLines amount={p * 0.25} angle={0} />;
      break;
    }
    case "secret": { // the world dims; the camera pushes into the button panel
      mood = MOODS.secret;
      cam = { ...on({ x: PANEL.x, y: PANEL.y + 60 }, k(u, 0, len, 1.6, 3.2, Easing.inOut(Easing.cubic))), rot: k(u, 0, len, 0, -3) };
      body = <LobbySet f={f} ava={[FOLDER, "neutral"]} />;
      break;
    }
    case "nothing": { // cut-away: behind the button, its wire ends in a loose plug
      mood = MOODS.lab;
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.08), rot: 0 }, f, 2);
      const sway = Math.sin(u * 0.12) * 14, d = k(u, 4, 20, 0, 0.65);
      body = <Lab>
        <BigButton x={540} y={560} r={150} />
        <path d={`M 540 780 C 540 ${900} ${620} ${980} ${600 + sway} ${1000 + 220 * d}`} stroke="#ff9a3a" strokeWidth={14} fill="none" strokeLinecap="round" />
        <g transform={`translate(${600 + sway} ${1000 + 220 * d}) rotate(${sway})`}><rect x={-30} y={0} width={60} height={70} rx={10} fill="#2a2f3a" stroke={INK} strokeWidth={6} />
          <path d="M -14 70 L -14 100 M 14 70 L 14 100" stroke="#c9ccd2" strokeWidth={10} /></g>
        <T x={540} y={1340} s={64} c="#ff9a3a" o={k(u, 10, 18, 0, 1)}>NOT CONNECTED</T>
      </Lab>;
      break;
    }
    case "law": {    // a 1990 law: a stamped page drops onto the desk
      mood = MOODS.lab;
      cam = drift({ x: 0, y: 0, zoom: 1.0, rot: 0 }, f, 2);
      const drop = k(u, 0, 10, -600, 0, Easing.out(Easing.back(1.4))), stamp = k(u, 12, 16, 2.2, 1, Easing.out(Easing.cubic));
      body = <Lab>
        <g transform={`translate(540 ${760 + drop}) rotate(-4)`}>
          <rect x={-300} y={-380} width={600} height={760} rx={16} fill="#f6efe0" stroke={INK} strokeWidth={8} />
          <T x={0} y={-250} s={56} c={INK}>DISABILITY LAW</T>
          <T x={0} y={-90} s={150} c="#1d4f8a">1990</T>
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-220} y={20 + i * 52} width={i === 4 ? 260 : 440} height={18} rx={8} fill="#c9c3b8" />)}
          {u > 12 && <g transform={`translate(150 260) rotate(-14) scale(${stamp})`} opacity={k(u, 12, 14, 0, 0.9)}>
            <circle r={90} fill="none" stroke={OFFICE.red} strokeWidth={12} /><circle r={70} fill="none" stroke={OFFICE.red} strokeWidth={5} />
            <text y={16} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={42} fill={OFFICE.red}>U.S.</text></g>}
        </g>
      </Lab>;
      break;
    }
    case "crutches": { // the doors wait: a man on crutches walks in while a hold timer ticks
      const walk = k(u, 0, len, 0, 1, Easing.linear), ring = k(u, 0, len, 0, 1, Easing.linear);
      cam = drift({ x: 0, y: -30, zoom: 1.08, rot: 0 }, f, 2);
      const mx = 980 - walk * 420;
      body = <LobbySet f={f} ava={[FOLDER, "neutral"]} front={<>
        <g transform={`translate(${mx} 0)`}><Crutches x={0} y={1520} s={1.7} />
          <Person x={0} y={1520} scale={1.7} facing={-1} look={PASSERS[3]} pose={{ armL: [40, -40], armR: [40, -40], legL: [Math.sin(u * 0.2) * 12, -6], legR: [-Math.sin(u * 0.2) * 12, -6] }} expr="calm" t={f} /></g>
        <g transform="translate(540 220)"><circle r={82} fill="#1b2133" stroke={INK} strokeWidth={7} />
          <path d={`M 0 -62 A 62 62 0 ${ring > 0.5 ? 1 : 0} 1 ${62 * Math.sin(ring * 2 * Math.PI)} ${-62 * Math.cos(ring * 2 * Math.PI)}`} stroke={OFFICE.green} strokeWidth={16} fill="none" strokeLinecap="round" />
          <circle r={10} fill="#f6efe0" /></g>
      </>} />;
      break;
    }
    case "switched": { // a maintenance switch flips the close button to OFF
      mood = MOODS.lab;
      cam = drift({ x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.1), rot: 0 }, f, 2);
      const flip = k(u, 8, 13, 0, 1, Easing.out(Easing.back(2)));
      body = <Lab>
        <rect x={240} y={420} width={600} height={760} rx={30} fill={OFFICE.steel} stroke={INK} strokeWidth={10} />
        <g transform="translate(540 560)"><CloseIcon s={80} /></g>
        <rect x={470} y={700} width={140} height={300} rx={20} fill="#1b2133" stroke={INK} strokeWidth={8} />
        <g transform={`translate(540 850) rotate(${-30 + 60 * flip})`}><rect x={-22} y={-150} width={44} height={150} rx={20} fill="#e9edf2" stroke={INK} strokeWidth={7} /></g>
        <circle cx={540} cy={850} r={26} fill={OFFICE.steel2} stroke={INK} strokeWidth={6} />
        <T x={540} y={1100} s={64} c={flip > 0.5 ? OFFICE.red : OFFICE.green}>{flip > 0.5 ? "OFF" : "ON"}</T>
      </Lab>;
      break;
    }
    case "fire": {   // a firefighter turns the key; now the button really closes the doors
      cam = drift(on({ x: 560, y: 900 }, 1.45), f, 2);
      const turn = k(u, 6, 12, 0, 90), lit = k(u, 12, 16, 0, 1);
      body = <LobbySet f={f} avaIn={false} inside={<>
        <Person x={-40} y={-30} scale={1.6} facing={1} look={FIRE} pose={JAB(0.6)} expr="focused" t={f} />
        <Helmet x={-40} y={-30 - 360 * 1.6 - 30} s={1.15} />
        <circle cx={PANEL.x - LIFT_X} cy={PANEL.y - LIFT_Y + 100} r={34} fill={OFFICE.glow} opacity={lit} />
      </>} front={<Key x={PANEL.x + 10} y={PANEL.y + 40} s={0.45} rot={turn} />} />;
      break;
    }
    case "notjust": { // a city crossing: a man presses the walk button again and again
      mood = MOODS.lobby;
      const p = pressAt(10);
      cam = drift({ x: k(u, 0, len, -40, 40), y: 0, zoom: 1.05, rot: 0 }, f, 2);
      body = <><Layer p={0.3}><Svg><Street /></Svg></Layer>
        <Layer p={1}><Svg><PushPole x={700} y={1420} press={p} />
          <Person x={470} y={1420} scale={1.7} facing={1} look={PASSERS[1]} pose={JAB(p)} expr="determined" t={f} /></Svg></Layer></>;
      break;
    }
    case "nyc": {    // 50 button icons, about 3 in 4 go grey: "2,500+ of 3,250"
      mood = MOODS.lab;
      cam = { x: 0, y: 0, zoom: 1, rot: 0 };
      const dead = new Set([0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 30, 31, 32, 33, 35, 36, 37, 38, 40, 41, 43, 44, 46]);
      body = <Lab>
        <T x={540} y={330} s={70} c={GOLD} o={k(u, 2, 8, 0, 1)}>NEW YORK, 2004</T>
        {Array.from({ length: 50 }, (_, i) => {
          const cx = 190 + (i % 5) * 175, cy = 450 + Math.floor(i / 5) * 72, off = dead.has(i) && u > 14 + (i % 7) * 2;
          return <g key={i} transform={`translate(${cx} ${cy})`} opacity={k(u, i * 0.25, i * 0.25 + 4, 0, 1)}>
            <rect x={-60} y={-28} width={120} height={56} rx={10} fill={off ? "#3a4258" : GOLD} stroke={INK} strokeWidth={4} />
            <circle r={16} fill={off ? "#59627a" : "#c9ccd2"} stroke={INK} strokeWidth={3} />
            {off && <path d="M -22 -20 L 22 20 M 22 -20 L -22 20" stroke={OFFICE.red} strokeWidth={6} strokeLinecap="round" />}</g>;
        })}
        <T x={540} y={1265} s={60} o={k(u, 24, 32, 0, 1)}>2,500+ OF 3,250</T><T x={540} y={1335} s={60} c={OFFICE.red} o={k(u, 28, 36, 0, 1)}>DID NOTHING</T>
      </Lab>;
      break;
    }
    case "why": {    // the feeling: press -> satisfying rings of "something happened"
      mood = MOODS.lab;
      cam = drift({ x: 0, y: 0, zoom: 1.05, rot: 0 }, f, 2);
      const period = 16, p = pressAt(period), ph = u % period;
      body = <Lab>
        {[0, 1, 2].map((i) => { const r = 230 + ((ph + i * 5) % period) * 22; return <circle key={i} cx={540} cy={800} r={r} fill="none" stroke={OFFICE.glow} strokeWidth={8} opacity={0.5 * (1 - ((ph + i * 5) % period) / period)} />; })}
        <BigButton x={540} y={800} r={200} press={p} lit={p > 0.2 ? 1 : 0.4} />
        <Finger x={600 - p * 6 + (1 - p) * 40} y={840 - p * 14 + (1 - p) * 70} scale={1.15} skin={AVA.skin} sleeve={AVA.jersey} />
      </Lab>;
      break;
    }
    case "illusion": { // the control meter rises with every press - but the wire goes nowhere
      mood = MOODS.lab;
      cam = { x: 0, y: 0, zoom: 1, rot: 0 };
      const presses = Math.min(5, Math.floor(u / 8)), needle = -70 + presses * 28;
      body = <Lab>
        <T x={540} y={300} s={60} c={GOLD} o={k(u, 4, 10, 0, 1)}>ILLUSION OF CONTROL</T>
        <g transform="translate(540 700)">
          <path d="M -260 0 A 260 260 0 0 1 260 0" fill="none" stroke="#3a4258" strokeWidth={46} />
          <path d={`M -260 0 A 260 260 0 0 1 ${260 * Math.cos(Math.PI - ((needle + 90) / 180) * Math.PI)} ${-260 * Math.sin(Math.PI - ((needle + 90) / 180) * Math.PI)}`} fill="none" stroke={OFFICE.green} strokeWidth={46} />
          <g transform={`rotate(${needle})`}><path d="M -10 0 L 0 -230 L 10 0 Z" fill="#f6efe0" stroke={INK} strokeWidth={4} /></g>
          <circle r={26} fill="#f6efe0" stroke={INK} strokeWidth={6} />
        </g>
        <g transform="translate(540 1050)"><circle r={70} fill="#f2f4f6" stroke={INK} strokeWidth={6} /><CloseIcon s={36} /></g>
        <path d="M 610 1050 C 760 1050 820 1180 900 1190" stroke="#ff9a3a" strokeWidth={10} fill="none" strokeDasharray="20 14" />
        <T x={940} y={1210} s={70} c="#ff9a3a">?</T>
      </Lab>;
      break;
    }
    case "close": {  // the doors slide shut on their own, right on time
      cam = { x: 0, y: -40, zoom: k(u, 0, len, 1.05, 1.15), rot: 0 };
      body = <LobbySet f={f} open={k(u, 4, len - 4, 1, 0, Easing.inOut(Easing.cubic))} ava={[FOLDER, "worried"]} />;
      break;
    }
    case "smile": {  // inside, Ava smiles: "it worked"
      mood = MOODS.warm;
      cam = drift(on({ x: avaHead.x + 40, y: avaHead.y + 120 }, k(u, 0, len, 2.1, 2.3)), f, 2);
      body = <LobbySet f={f} ava={[FOLDER, "smile"]} floor="4" />;
      break;
    }
    case "ordid": {  // "Or did it?": the button again, in the dark, its loose wire swinging behind it
      mood = MOODS.secret;
      cam = { x: 0, y: 0, zoom: k(u, 0, len, 1.0, 1.35, Easing.inOut(Easing.cubic)), rot: k(u, 0, len, 0, 3) };
      const sway = Math.sin(u * 0.15) * 18;
      body = <Lab>
        <path d={`M 540 960 C 540 1100 620 1150 ${620 + sway} 1240`} stroke="#ff9a3a" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.8} />
        <g transform={`translate(${620 + sway} 1240) rotate(${sway})`}><rect x={-30} y={0} width={60} height={70} rx={10} fill="#2a2f3a" stroke={INK} strokeWidth={6} /></g>
        <BigButton x={540} y={780} r={180} lit={0.6} />
      </Lab>;
      break;
    }
    default: {       // ask: pull out wide - the whole lobby, people pressing buttons everywhere
      cam = { x: 0, y: k(u, 0, len, 0, -80), zoom: k(u, 0, len, 1.5, 0.92, Easing.inOut(Easing.cubic)), rot: 0 };
      const p = pressAt(9);
      body = <LobbySet f={f} open={0.15} ava={[FOLDER, "smile"]} front={<>
        <Person x={110} y={1420} scale={1.2} facing={1} look={PASSERS[0]} pose={JAB(p)} expr="determined" t={f} />
        <Person x={970} y={1420} scale={1.2} facing={-1} look={PASSERS[2]} pose={JAB(pressAt(11, 4))} expr="worried" t={f} />
      </>} />;
    }
  }

  return (
    <AbsoluteFill>
      <Stage cam={cam} bg={mood === MOODS.lab ? "#121a36" : OFFICE.wall}>{body}</Stage>
      {mood !== MOODS.lab && mood !== MOODS.secret && <Pool x={540} y={760} rx={640} ry={800} color="#fff6dc" opacity={0.22} />}
      <Grade mood={mood} />
      {overlay}
    </AbsoluteFill>
  );
};

const PLACE: Record<string, string> = { press: "btn", again: "btn", nothing: "lab", law: "lab", switched: "lab", nyc: "lab", why: "lab", illusion: "lab", ordid: "lab", notjust: "street" };
const XF = 7;

const Scene: React.FC<SceneProps> = ({ spans }) => {
  const f = useCurrentFrame();
  const span = shotAt(spans, f);
  const prev = span.i > 0 ? spans[span.i - 1] : null;
  const u = f - span.a;
  const fade = prev && u < XF && (PLACE[prev.id] ?? "lobby") !== (PLACE[span.id] ?? "lobby");
  return (
    <AbsoluteFill>
      <ShotView span={span} />
      {fade && prev && <AbsoluteFill style={{ opacity: 1 - u / XF }}><ShotView span={prev} /></AbsoluteFill>}
    </AbsoluteFill>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "lift-button",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: OFFICE.wall,
};
export default story;
