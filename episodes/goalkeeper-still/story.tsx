// "The Goalkeeper Who Did Nothing and Won" - 2.5D. Leo stays in the middle on the last penalty of a final.
// Facts: Bar-Eli et al. 2007 (286 kicks, keepers dived ~94 %, staying central was optimal; action bias).
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, getInputProps } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, cueTime, FPS, ShotSpan } from "../../src/engine/timeline";
import { Stage, Layer, Svg, Cam, drift, kickCam } from "../../src/engine25/stage";
import { Grade, MOODS, Beams, Pool, Flash, SpeedLines } from "../../src/engine25/light";
import { Person, POSES, runPose, DIVE, KEEPER, STRIKER, CrowdMood, blinkAt, Look, INK, Expr } from "../../library/characters25/person";
import { CrowdImg as Crowd } from "../../library/characters25/crowdimg";
import { Sky, Floodlight, HaloDefs, Stands, Pitch, GoalFront, Ball, StadiumClock, TacticsBoard, chalk, NIGHT } from "../../library/environments25/stadium";

const SHOTS = [
  { id: "hook", cue: "Leo saved the" },
  { id: "froze", cue: "Everyone thought he" },
  { id: "clock", cue: "Final minute." },
  { id: "spot", cue: "Last kick." },
  { id: "runup", cue: "The striker runs up," },
  { id: "dive3", cue: "every goalkeeper on Earth" },
  { id: "study", cue: "Researchers studied" },
  { id: "stay", cue: "Leo doesn't." },
  { id: "shot", cue: "The ball comes" },
  { id: "laugh", cue: "The crowd laughs." },
  { id: "best", cue: "But the study found" },
  { id: "why", cue: "So why does" },
  { id: "split", cue: "Because a goal" },
  { id: "bias", cue: "Psychologists call it" },
  { id: "catch", cue: "There is a catch," },
  { id: "ask", cue: "Would you have" },
];

const ease = Easing.bezier(0.33, 0, 0.2, 1);                    // smooth glide, fast start (skill: ease-out bursts)
const k = (u: number, a: number, b: number, from: number, to: number, e = ease) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const LAMPS = [{ x: 90, y: 300 }, { x: 990, y: 280 }];

/** The stadium behind everything: sky, floodlights, stands + crowd, pitch. */
const Stadium: React.FC<{ f: number; crowd: CrowdMood; horizon?: number; lampsOn?: number }> = ({ f, crowd, horizon = 1060, lampsOn = 1 }) => (
  <>
    <Layer p={0}><Sky f={f} /></Layer>
    <Layer p={0.15}><Svg><Floodlight x={90} y={300} scale={0.8} on={lampsOn} /><Floodlight x={990} y={280} scale={0.8} on={lampsOn} /></Svg></Layer>
    <Layer p={0.3}>
      <Svg>
        <Stands y={horizon - 520} h={500} />
        <Crowd f={f} rows={6} width={1500} y0={horizon - 440} rowH={78} size={52} mood={crowd} fogColor={NIGHT.haze} fog={0.55} />
      </Svg>
    </Layer>
    <Layer p={0.6}><Svg><Pitch horizonY={horizon} /></Svg></Layer>
  </>
);

const Leo: React.FC<{ x: number; y: number; s: number; f: number; pose?: keyof typeof POSES; expr?: Expr; facing?: 1 | -1; squash?: number }> = ({ x, y, s, f, pose = "ready", expr = "calm", facing = 1, squash = 0 }) => (
  <Person x={x} y={y} scale={s} facing={facing} look={KEEPER} pose={POSES[pose]} expr={expr} blink={blinkAt(f, 1)} rim="#fff1c9" t={f} squash={squash} />
);

/** grass + dust burst where a diving keeper lands */
const Burst: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  if (t <= 0 || t > 1) return null;
  return (<g opacity={1 - t}>
    {Array.from({ length: 9 }, (_, i) => {
      const a = (-160 + i * 17) * Math.PI / 180, d = 30 + t * 140 * (0.6 + (i % 3) * 0.25);
      return <path key={i} d={`M ${x + Math.cos(a) * d} ${y + Math.sin(a) * d * 0.6} l ${Math.cos(a) * 18} ${Math.sin(a) * 10}`} stroke={i % 2 ? "#5fcf6f" : "#c9b48a"} strokeWidth={8} strokeLinecap="round" />;
    })}
    <ellipse cx={x} cy={y} rx={60 + t * 120} ry={14 + t * 20} fill="#d9cdb0" opacity={0.35} />
  </g>);
};

/** a keeper diving along an arc, with two fading trail copies behind (motion without blur) */
const Diver: React.FC<{ look: Look; x0: number; y0: number; dir: 1 | -1; p: number; scale: number }> = ({ look, x0, y0, dir, p, scale }) => {
  const at = (q: number) => ({ x: x0 + dir * q * 300, y: y0 - Math.sin(q * Math.PI) * 140 - q * 40, r: dir * q * 28 });
  const pose = p > 0.15 ? DIVE : POSES.ready;
  return (<g>
    {p > 0.15 && p < 0.95 && [0.16, 0.08].map((back, i) => { const g = at(Math.max(0, p - back)); return <Person key={i} x={g.x} y={g.y} scale={scale} facing={dir} look={look} pose={pose} rot={g.r} shadow={0} ghost={0.18 + i * 0.12} />; })}
    {(() => { const g = at(p); return <Person x={g.x} y={g.y} scale={scale} facing={dir} look={look} pose={pose} expr={p > 0.15 ? "determined" : "focused"} rot={g.r} />; })()}
    <Burst x={x0 + dir * 300} y={y0} t={(p - 0.9) * 6} />
  </g>);
};

const OTHER_KEEPERS: Look[] = [
  { ...KEEPER, jersey: "#f2c230", jersey2: "#9c7a0c", socks: "#f2c230", skin: "#ffd9b8", hair: "#c9862e", number: "1" },
  { ...KEEPER, jersey: "#7c4dd6", jersey2: "#4a2a91", socks: "#7c4dd6", skin: "#7a4a2e", hair: "#120c0a", hairStyle: "buzz", number: "13" },
  { ...KEEPER, jersey: "#ff7a2f", jersey2: "#b24c12", socks: "#ff7a2f", skin: "#d99c6c", hair: "#3b2416", hairStyle: "bun", number: "23" },
];

const ShotView: React.FC<{ span: ShotSpan; words: SceneProps["words"] }> = ({ span, words }) => {
  const f = useCurrentFrame();
  const u = f - span.a, len = span.b - span.a, t = u / FPS;
  const savedF = Math.round(cueTime(words, "Saved.") * FPS);
  let cam: Cam = { x: 0, y: 0, zoom: 1, rot: 0 };
  let mood = MOODS.floodlit;
  let body: React.ReactNode = null;
  let overlay: React.ReactNode = null;

  switch (span.id) {
    case "hook": {   // snap zoom on Leo holding the ball, laughing crowd behind
      cam = drift({ x: 0, y: -60, zoom: k(u, 0, 9, 0.82, 1.28, Easing.out(Easing.cubic)), rot: -2 }, f, 4);
      body = (<>
        <Stadium f={f} crowd="laugh" />
        <Layer p={0.8}><Svg><GoalFront cx={540} baseY={1260} w={980} /></Svg></Layer>
        <Layer p={1}><Svg><Leo x={540} y={1300} s={1.35} f={f} pose="hug" expr="calm" /><Ball x={548} y={980} r={46} /></Svg><Pool x={540} y={1000} /></Layer>
      </>);
      overlay = <Flash framesSince={u} len={4} />;
      break;
    }
    case "froze": {  // parallax pan along the laughing stands
      cam = { x: k(u, 0, len, -260, 220), y: -380, zoom: 1.55, rot: 1.5 };
      body = (<>
        <Stadium f={f} crowd="laugh" />
        <Layer p={1.5}><Svg><Leo x={240} y={1500} s={0.9} f={f} pose="hug" expr="neutral" /><Ball x={246} y={1295} r={30} /></Svg></Layer>
      </>);
      break;
    }
    case "clock": {  // the clock motif: 89:59 -> 90:00, slow push
      mood = MOODS.tension;
      const sec = 89 * 60 + 59 + (u > len * 0.45 ? 1 : 0);
      cam = { x: 0, y: k(u, 0, len, 40, -20), zoom: k(u, 0, len, 1.0, 1.18), rot: 0 };
      body = (<>
        <Layer p={0}><Sky f={f} /></Layer>
        <Layer p={0.25}><Svg><Floodlight x={180} y={250} scale={1.1} /><Floodlight x={900} y={230} scale={1.1} /></Svg></Layer>
        <Layer p={1}><Svg><StadiumClock x={540} y={760} seconds={sec} scale={1.5} glow={0.85 + 0.15 * Math.sin(f * 0.5)} /></Svg></Layer>
      </>);
      overlay = <Beams from={LAMPS.map((l) => ({ x: l.x + 90, y: l.y }))} opacity={0.18} />;
      break;
    }
    case "spot": {   // ball on the spot, goal and Leo far behind: low angle, slow push
      mood = MOODS.tension;
      cam = { x: k(u, 0, len, -30, 0), y: 120, zoom: k(u, 0, len, 1.0, 1.15), rot: -3 };
      body = (<>
        <Stadium f={f} crowd="tense" horizon={980} />
        <Layer p={0.75}><Svg><GoalFront cx={540} baseY={1130} w={560} /><Leo x={540} y={1150} s={0.62} f={f} pose="ready" expr="focused" /></Svg></Layer>
        <Layer p={1.6}><Svg><path d="M -200 1700 L 1280 1700" stroke={NIGHT.line} strokeWidth={10} opacity={0.6} /><Ball x={560} y={1580} r={92} shadowY={1668} /></Svg></Layer>
      </>);
      break;
    }
    case "runup": {  // tracking the striker's run-up, parallax crowd rushing behind
      mood = MOODS.tension;
      const kickAt = len - 12;                                     // last ~0.4 s: plant and strike
      const sx = k(u, 0, kickAt, 1250, 560, Easing.linear);
      const kicking = u >= kickAt, kp = k(u, kickAt, kickAt + 6, 0, 1, Easing.out(Easing.cubic));
      const ballX = kicking ? 470 - kp * 900 : 470;
      cam = drift({ x: (sx - 540) * 0.6, y: -40, zoom: 1.1 + kp * 0.1, rot: -kp * 3 }, f, 5, 1.6);
      body = (<>
        <Stadium f={f} crowd="tense" horizon={1000} />
        <Layer p={1}><Svg>
          <Ball x={ballX} y={1330 - kp * 120} r={36} shadowY={1366} spin={kp * 400} />
          <Person x={sx} y={1360 - (kicking ? 0 : Math.abs(Math.sin(f * 0.55)) * 14)} scale={1.05} facing={-1} look={STRIKER}
            pose={kicking ? { ...POSES.kick, legR: [75 * kp - 20 * (1 - kp), -15], lean: -10 * kp } : runPose(f * 0.55)} expr="determined" blink={blinkAt(f, 2)} />
        </Svg></Layer>
      </>);
      overlay = <SpeedLines amount={kicking ? 0.7 * (1 - kp) + 0.3 : 0.35} />;
      break;
    }
    case "dive3": {  // three keepers, three guesses: panels slide in with the dives
      mood = MOODS.tension;
      body = (<>
        <Layer p={0}><Sky f={f} top="#0b1430" bottom="#22336e" /></Layer>
        {OTHER_KEEPERS.map((lk, i) => {
          const a = i * 9, slide = k(u, a, a + 8, 1, 0, Easing.out(Easing.cubic));
          const dir = (i % 2 ? -1 : 1) as 1 | -1, dive = k(u, a + 4, a + 18, 0, 1, Easing.out(Easing.quad));
          return (
            <AbsoluteFill key={i} style={{ top: i * 640, height: 640, transform: `translateX(${slide * 1100 * dir}px)`, overflow: "hidden", borderBottom: `10px solid ${INK}` }}>
              <svg width={1080} height={640} style={{ background: `linear-gradient(${NIGHT.sky1}, ${NIGHT.grass2} 70%)` }}>
                <GoalFront cx={540} baseY={560} w={760} />
                <Diver look={lk} x0={540 - dir * 60} y0={560} dir={dir} p={dive} scale={0.95} />
              </svg>
            </AbsoluteFill>
          );
        })}
      </>);
      overlay = <SpeedLines amount={0.25} />;
      break;
    }
    case "study": {  // chalk board: 286 kicks, 94 of 100 dived
      mood = MOODS.explain;
      const n = Math.round(k(u, 6, len * 0.55, 0, 286, Easing.out(Easing.quad)));
      const arrows = k(u, len * 0.55, len * 0.75, 0, 1);
      cam = { x: 0, y: k(u, 0, len, 20, -20), zoom: k(u, 0, len, 1.0, 1.08), rot: 0 };
      body = (<>
        <Layer p={0}><AbsoluteFill style={{ background: "#2a2018" }} /></Layer>
        <Layer p={1}><Svg>
          <TacticsBoard x={540} y={330} w={860}>
            <text x={0} y={140} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={150} fill={chalk.fill}>{n}</text>
            <text x={0} y={215} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={46} fill={chalk.fill} opacity={0.85}>PENALTY KICKS</text>
            {Array.from({ length: n }, (_, i) => <circle key={i} cx={-380 + (i % 22) * 36} cy={290 + Math.floor(i / 22) * 36} r={11} fill="none" stroke={chalk.stroke} strokeWidth={4} opacity={0.8} />)}
            <g opacity={arrows}>
              <path d="M -60 820 L -330 820 M -300 790 L -335 820 L -300 850" stroke="#ffcf3a" strokeWidth={14} fill="none" strokeLinecap="round" />
              <path d="M 60 820 L 330 820 M 300 790 L 335 820 L 300 850" stroke="#ffcf3a" strokeWidth={14} fill="none" strokeLinecap="round" />
              <text x={0} y={960} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={120} fill="#ffcf3a">94%</text>
              <text x={0} y={1020} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={40} fill={chalk.fill}>DIVED LEFT OR RIGHT</text>
            </g>
          </TacticsBoard>
        </Svg></Layer>
      </>);
      break;
    }
    case "stay": {   // Leo plants his feet: push in, key light pool, crowd blurred by distance
      cam = drift({ x: 0, y: k(u, 0, len, -120, -260), zoom: k(u, 0, len, 1.25, 1.75), rot: 0 }, f, 3);
      body = (<>
        <Stadium f={f} crowd="tense" />
        <Layer p={0.8}><Svg><GoalFront cx={540} baseY={1260} w={980} /></Svg></Layer>
        <Layer p={1}><Svg><Leo x={540} y={1300} s={1.35} f={f} pose={t > 0.6 ? "stand" : "ready"} expr="determined" /></Svg><Pool x={540} y={980} opacity={0.45} /></Layer>
      </>);
      break;
    }
    case "shot": {   // the ball flies at the lens, Leo catches it: impact shake + flash
      const fs = f - savedF;
      const fly = k(u, 0, Math.max(6, savedF - span.a), 0, 1, Easing.in(Easing.quad));
      cam = kickCam({ x: 0, y: -80, zoom: 1.2, rot: 0 }, fs, 22);
      const caught = fs >= 0;
      body = (<>
        <Stadium f={f} crowd={caught ? "cheer" : "tense"} />
        <Layer p={0.8}><Svg><GoalFront cx={540} baseY={1260} w={980} netShake={caught ? 0 : 0} /></Svg></Layer>
        <Layer p={1}><Svg>
          <Leo x={540} y={1300} s={1.35} f={f} pose={caught ? "hug" : "stand"} expr={caught ? "determined" : "focused"} squash={caught ? Math.max(0, 0.12 - fs * 0.02) : 0} />
          <Ball x={caught ? 548 : 540 + (1 - fly) * 120} y={caught ? 980 : 1500 - fly * 520} r={caught ? 46 : 20 + fly * 120} spin={f * 25} />
        </Svg></Layer>
      </>);
      overlay = <><SpeedLines amount={caught ? 0 : 0.5 * fly} angle={90} /><Flash framesSince={fs} len={5} /></>;
      break;
    }
    case "laugh": {  // the crowd laughs: wide, Leo small and calm
      cam = { x: k(u, 0, len, 140, -140), y: -200, zoom: 1.25, rot: -2 };
      body = (<>
        <Stadium f={f} crowd="laugh" />
        <Layer p={0.8}><Svg><GoalFront cx={540} baseY={1260} w={980} /></Svg></Layer>
        <Layer p={1}><Svg><Leo x={540} y={1300} s={1.0} f={f} pose="shrug" expr="smile" /></Svg></Layer>
      </>);
      break;
    }
    case "best": {   // board: goal mouth, where kicks go, STAY in the middle lights up
      mood = MOODS.explain;
      const glow = k(u, len * 0.35, len * 0.6, 0, 1);
      cam = { x: 0, y: 0, zoom: k(u, 0, len, 1.05, 1.15), rot: 0 };
      body = (<>
        <Layer p={0}><AbsoluteFill style={{ background: "#2a2018" }} /></Layer>
        <Layer p={1}><Svg>
          <TacticsBoard x={540} y={330} w={860}>
            <path d="M -360 520 L -360 220 L 360 220 L 360 520" stroke={chalk.stroke} strokeWidth={12} fill="none" />
            {[-240, 0, 240].map((x, i) => <rect key={i} x={x - 110} y={240} width={220} height={270} rx={10} fill={i === 1 ? "#ffcf3a" : "#ffffff"} opacity={i === 1 ? 0.15 + glow * 0.55 : 0.08} />)}
            <Person x={0} y={500} scale={0.55} look={KEEPER} pose={POSES.stand} expr="calm" shadow={0} />
            <text x={0} y={680} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={96} fill="#ffcf3a" opacity={glow}>STAY</text>
            <text x={0} y={760} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={40} fill={chalk.fill} opacity={glow}>THE BEST BET IN THE STUDY</text>
          </TacticsBoard>
        </Svg></Layer>
      </>);
      break;
    }
    case "why": {    // Leo alone in the goal, lights dim, slow dolly out (cold)
      mood = MOODS.tension;
      cam = { x: 0, y: -40, zoom: k(u, 0, len, 1.4, 1.05), rot: 0 };
      body = (<>
        <Stadium f={f} crowd="idle" lampsOn={0.6} />
        <Layer p={0.8}><Svg><GoalFront cx={540} baseY={1260} w={980} /></Svg></Layer>
        <Layer p={1}><Svg><Leo x={540} y={1300} s={1.35} f={f} pose="stand" expr="worried" /></Svg></Layer>
      </>);
      break;
    }
    case "split": {  // left: dive + goal = "bad luck" (shrugs). right: stand + goal = "your fault" (pointing, angry)
      mood = MOODS.tension;
      const go = k(u, 8, 22, 0, 1, Easing.in(Easing.quad));
      const panel = (left: boolean) => {
        const lk = left ? OTHER_KEEPERS[0] : KEEPER;
        const dived = left && go > 0.2;
        return (
          <svg width={1080} height={960}>
            <rect width={1080} height={960} fill={left ? "#1a2a63" : "#3a1424"} />
            <Crowd f={f} rows={3} width={1080} y0={150} rowH={70} size={48} mood={left ? "idle" : "tense"} fog={0.2} fogColor={left ? "#1a2a63" : "#3a1424"} seed={left ? 3 : 9} />
            <rect y={420} width={1080} height={540} fill={NIGHT.grass2} />
            <GoalFront cx={540} baseY={860} w={700} netShake={go > 0.9 ? f : 0} />
            {left ? <Diver look={lk} x0={540} y0={870} dir={1} p={go} scale={0.85} /> : <Person x={540} y={870} scale={0.85} facing={1} look={lk} pose={POSES.stand} expr="shock" t={f} />}
            <Ball x={540 - go * 280} y={760 - go * 80} r={24} />
            <text x={540} y={110} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={64} fill={left ? "#9cc4ff" : "#ff8a8a"} opacity={k(u, 22, 30, 0, 1)}>{left ? "BAD LUCK" : "YOUR FAULT!"}</text>
          </svg>
        );
      };
      body = (<>
        <AbsoluteFill style={{ height: 960, overflow: "hidden" }}>{panel(true)}</AbsoluteFill>
        <AbsoluteFill style={{ top: 960, height: 960, overflow: "hidden", borderTop: `12px solid ${INK}` }}>{panel(false)}</AbsoluteFill>
      </>);
      break;
    }
    case "bias": {   // the name lands: stamp on the board
      mood = MOODS.explain;
      const stamp = k(u, 4, 10, 2.2, 1, Easing.out(Easing.back(2)));
      cam = kickCam({ x: 0, y: 0, zoom: 1.05, rot: 0 }, u - 10, 10);
      body = (<>
        <Layer p={0}><AbsoluteFill style={{ background: "#2a2018" }} /></Layer>
        <Layer p={1}><Svg>
          <TacticsBoard x={540} y={330} w={860}>
            <Person x={-200} y={760} scale={0.8} look={OTHER_KEEPERS[1]} pose={DIVE} expr="determined" shadow={0} rot={30} />
            <Person x={220} y={760} scale={0.8} look={KEEPER} pose={POSES.stand} expr="calm" shadow={0} />
            <g transform={`translate(0 260) scale(${stamp}) rotate(-6)`} opacity={u > 3 ? 1 : 0}>
              <rect x={-360} y={-95} width={720} height={170} rx={18} fill="none" stroke="#ff5a4a" strokeWidth={14} />
              <text x={0} y={30} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={104} fill="#ff5a4a">ACTION BIAS</text>
            </g>
          </TacticsBoard>
        </Svg></Layer>
      </>);
      break;
    }
    case "catch": {  // whip pan to the striker: he smirks at the middle of the goal
      const whip = k(u, 0, 7, 1, 0, Easing.out(Easing.cubic));
      cam = { x: whip * -700, y: -120, zoom: 1.45, rot: whip * 6 };
      body = (<>
        <Stadium f={f} crowd="tense" />
        <Layer p={1}><Svg><Person x={540} y={1380} scale={1.3} facing={-1} look={STRIKER} pose={{ ...POSES.stand, lookX: -1 }} expr="smirk" blink={blinkAt(f, 3)} /><Ball x={420} y={1380} r={40} shadowY={1420} /></Svg></Layer>
      </>);
      overlay = <SpeedLines amount={whip} />;
      break;
    }
    default: {       // ask: pull out and up - the whole stadium, Leo tiny in the middle, warm payoff + clock 90:00
      mood = MOODS.warm;
      cam = { x: 0, y: k(u, 0, len, -100, 60), zoom: k(u, 0, len, 1.5, 0.92, Easing.inOut(Easing.cubic)), rot: k(u, 0, len, 2, 0) };
      body = (<>
        <Stadium f={f} crowd="cheer" />
        <Layer p={0.35}><Svg><StadiumClock x={540} y={360} seconds={90 * 60} scale={0.7} /></Svg></Layer>
        <Layer p={0.8}><Svg><GoalFront cx={540} baseY={1260} w={980} /></Svg></Layer>
        <Layer p={1}><Svg><Leo x={540} y={1300} s={1.35} f={f} pose="arms_up" expr="cheer" /></Svg><Pool x={540} y={1000} color="#ffd9a0" /></Layer>
      </>);
    }
  }

  return (
    <AbsoluteFill>
      <HaloDefs />
      <Stage cam={cam} bg={NIGHT.sky0}>{body}</Stage>
      {!(getInputProps() as { noLight?: boolean }).noLight && <>
        {mood !== MOODS.explain && span.id !== "split" && span.id !== "dive3" && <Beams from={LAMPS} opacity={0.12} />}
        <Grade mood={mood} />
      </>}
      {overlay}
    </AbsoluteFill>
  );
};

// places: a crossfade (the skill's 6-8 frame dissolve) only where the place changes; same-place shots hard cut
const PLACE: Record<string, string> = { clock: "clock", dive3: "panels", study: "board", best: "board", bias: "board", split: "panels" };
const XF = 7;

const Scene: React.FC<SceneProps> = ({ words, spans }) => {
  const f = useCurrentFrame();
  const span = shotAt(spans, f);
  const prev = span.i > 0 ? spans[span.i - 1] : null;
  const u = f - span.a;
  const fade = prev && u < XF && (PLACE[prev.id] ?? "stadium") !== (PLACE[span.id] ?? "stadium");
  return (
    <AbsoluteFill>
      <ShotView span={span} words={words} />
      {fade && prev && <AbsoluteFill style={{ opacity: 1 - u / XF }}><ShotView span={prev} words={words} /></AbsoluteFill>}
    </AbsoluteFill>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "goalkeeper-still",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: NIGHT.sky0,
};
export default story;
