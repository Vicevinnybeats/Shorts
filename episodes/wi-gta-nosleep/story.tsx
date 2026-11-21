// WHAT IF #1 "What If You Played GTA 6 for 30 Days Straight?" - Golden Neon look (library/whatif, brain/style-whatif.md).
// Remy (fictional, neon silhouette: hoodie + beanie tuft) tries 30 days of GTA 6 without sleep; real science: one study
// (Williamson & Feyer 2000): 17-19 h awake ~ as bad on some tests as over the 0.05% limit; Randy Gardner (1964, 17,
// San Diego) 264 h = 11 days, Guinness stopped accepting attempts; microsleeps; Randy slept ~14 h. "GTA 6" only as
// plain words, no game art or logos. Every beat is cue-driven (C(phrase, fallback)); fallbacks = estimated timing.
// Layout rules: text only y 300-1350, x 60-960, never over animation or other text; nobody in the caption band
// (y 1440-1640) in wide/medium shots; HUD text is hidden during the 5-frame crossfades between places.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, ShotSpan, cueTime, FPS } from "../../src/engine/timeline";
import type { Word } from "../../src/captions/Captions";
import { EASE, arrive, leave } from "../../src/engine25/motion";
import {
  NEON, NeonPath, NeonText, HudText, StrokeWord, Bake, Stage, Plane, WCam, camDrift, camKick, Spotlight, Particles, LiveCounter, CompareBars,
  ChapterScreen, ChoiceCards, Phone, Notification, Stamp, Controller, Couch, SnackPile, Bed, Blanket, Clock, CarBack, Road, MissionMarker, Bubble,
  RoomLines, Skyline, Calendar30, Zzz, RepeatIcon, MoonIcon, NeonFigure, FloorGlow, LOOKS, Digits, drawOn, rnd,
} from "../../library/whatif/kit";
import scenes from "../../content/scripts/wi-gta-nosleep.json";

const SHOTS = scenes.shots.map((s) => ({ id: s.id, cue: s.cue }));
const Words = React.createContext<Word[]>([]);
const cueAt = (words: Word[], phrase: string, span: ShotSpan, fallback: number) => {
  try { return Math.round(cueTime(words, phrase, span.a / FPS - 0.3) * FPS) - span.a; } catch { return fallback; }
};
const k = (u: number, a: number, b: number, from: number, to: number, e = EASE.camera) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const blinkOf = (f: number, seed = 0) => ((f + seed * 37) % 97) < 4;
const REMY = LOOKS.remy, RANDY = LOOKS.randy;
const { gold: GOLD, coral: CORAL, amber: AMBER, text: CREAM, muted: MUTED, dim: DIM } = NEON;
const C0: WCam = { x: 0, y: 0, zoom: 1, rot: 0 };
const at = (x: number, y: number, zoom: number, rot = 0): WCam => ({ x: x - 540, y: y - 960, zoom, rot });

/** traveling dotted grid (lab/HUD backdrop) */
const Grid: React.FC<{ f: number; o?: number }> = ({ f, o = 1 }) => (
  <g opacity={o}>
    {Array.from({ length: 9 }, (_, i) => <NeonPath key={`v${i}`} d={`M ${60 + i * 120} 260 L ${60 + i * 120} 1420`} w={1.5} color={NEON.faint} glow={0} dash="0 16" travel={-f * 0.8} />)}
    {Array.from({ length: 10 }, (_, i) => <NeonPath key={`h${i}`} d={`M 0 ${300 + i * 120} L 1080 ${300 + i * 120}`} w={1.5} color={NEON.faint} glow={0} dash="0 16" travel={f * 0.8} />)}
  </g>
);
/** scrambles letters (keeps the first/last) every 5 frames while `on` */
const scramble = (w: string, f: number, on: boolean) => {
  if (!on || w.length < 4) return w;
  const mid = w.slice(1, -1).split("");
  const seed = Math.floor(f / 5);
  for (let i = mid.length - 1; i > 0; i--) { const j = Math.floor(rnd(seed * 13 + i) * (i + 1)); [mid[i], mid[j]] = [mid[j], mid[i]]; }
  return w[0] + mid.join("") + w[w.length - 1];
};
/** huge eye for the microsleep close-up: open 0..1 */
const BigEye: React.FC<{ x: number; y: number; open: number; f: number }> = ({ x, y, open, f }) => {
  const h = 110 * open, look = 14 * Math.sin(f * 0.05);
  return <g transform={`translate(${x} ${y})`}>
    <NeonPath d={`M -170 0 Q 0 ${-h - 30} 170 0 Q 0 ${h + 30} -170 0 Z`} w={6} color={GOLD} fill="#000" />
    {open > 0.25 && <><circle cx={look} cy={8} r={54 * Math.min(1, open * 1.3)} fill="none" stroke={AMBER} strokeWidth={5} /><circle cx={look} cy={8} r={20 * open} fill={NEON.hot} opacity={0.85} /></>}
    <NeonPath d={`M -170 0 Q 0 ${-h - 30} 170 0`} w={9} color={GOLD} hot />
    <NeonPath d={`M -150 ${-h - 70} Q 0 ${-h - 120} 150 ${-h - 80}`} w={5} color={DIM} />
    <NeonPath d={`M -120 ${h + 56} Q 0 ${h + 80} 120 ${h + 56}`} w={3} color={NEON.faint} dash="0 12" />
  </g>;
};

type View = { cam: WCam; world: React.ReactNode; hud?: React.ReactNode; black?: number };

const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number, hide: boolean): View => {
  switch (id) {
    case "hook": { // title sting = hook: WHAT IF draws on (already mid-draw at frame 0) over the dark room; Remy on the couch
      // with a controller, lit by the TV glow (TV is at the camera); counter HOURS AWAKE 000 / DAY 1; 30 DAYS OF GTA 6?
      const NS = C("No sleep", 117), NB = C("No breaks", 150);
      const wp = k(u, 0, 34, 0.42, 1, EASE.arrive);
      const rp = k(u, 0, 28, 0.45, 1, EASE.arrive);
      const tv = 0.7 + 0.3 * Math.abs(Math.sin(f * 0.31) * Math.cos(f * 0.13));
      const cam = camKick(camDrift(at(540, 960 + 20 * k(u, 0, len, 0, 1), k(u, 0, len, 1.0, 1.07)), f, 3), u - NS, 10);
      const world = <>
        <Plane p={0.5}><Bake id="room-hook" done={rp >= 1}><RoomLines p={rp} floor={1400} bare /></Bake></Plane>
        <Plane p={1}>
          <Spotlight x={540} floor={1400} f={f} w={700} />
          <Couch x={540} y={1400} part="back" />
          <ellipse cx={540} cy={1120} rx={300} ry={220} fill="url(#wiTvGlow)" opacity={tv} />
          <NeonFigure x={540} y={1330} scale={0.95} look={REMY} pose="play" expr={u > NS ? "focused" : "happy"} f={f} blink={blinkOf(f)} prop={<Controller s={0.7} />} />
          <Couch x={540} y={1400} part="front" />
          <FloorGlow x={540} y={1400} w={420} />
        </Plane>
        <Particles f={f} y={300} h={1100} />
      </>;
      const hud = !hide && <>
        <StrokeWord text="WHAT IF" x={540} y={520} h={150} p={wp} />
        <LiveCounter f={u} from={0} to={0} at={8} tag="DAY 1" />
        <HudText f={u} x={540} y={770} size={62} color={CREAM} enter="type" at={16} out={len - 6}>30 DAYS OF GTA 6?</HudText>
        <Stamp f={u} x={540} y={872} text="NO SLEEP" at={NS} out={NB - 4} size={56} />
        <Stamp f={u} x={540} y={872} text="NO BREAKS" at={NB} out={len - 6} size={56} rot={4} />
      </>;
      return { cam, world, hud };
    }
    case "crash": { // A/B/C/D choice cards: where do you crash first? a selector runs over the cards
      const cam = camDrift(at(540, 960, k(u, 0, len, 1.0, 1.03)), f, 2);
      const pick = u < 26 ? -1 : Math.floor((u - 26) / 10) % 4;
      const world = <><Plane p={0.3}><Grid f={f} /></Plane><Particles f={f} n={18} /></>;
      const hud = !hide && <>
        <HudText f={u} x={540} y={430} size={64} color={CREAM} enter="words" at={0} out={len - 6}>WHERE DO YOU</HudText>
        <HudText f={u} x={540} y={515} size={76} color={GOLD} enter="scale" at={6} out={len - 6}>CRASH FIRST?</HudText>
        <ChoiceCards f={u} y={830} at={8} pick={pick} pickAt={26} out={len - 6}
          cards={[{ letter: "A", text: "HOUR 17" }, { letter: "B", text: "DAY 2" }, { letter: "C", text: "DAY 3" }, { letter: "D", text: "NEVER" }]} />
      </>;
      return { cam, world, hud };
    }
    case "hour0": { // chapter HOUR 0 punches in; snacks stack on "Snacks stacked"; the phone goes silent; Remy waves "READY."
      const SS = C("Snacks stacked", 61), PS = C("Phone on", 89), YR = C("You're ready", 128);
      const cam = camDrift(at(540, 1000 - 30 * k(u, 0, len, 0, 1), k(u, 0, len, 1.04, 1.0)), f, 3);
      const silent = u >= PS + 4;
      const world = <>
        <Plane p={0.6}><Bake id="table-sky" done><Skyline base={1330} p={1} seed={3} color={NEON.faint} /></Bake></Plane>
        <Plane p={1}>
          <NeonPath d="M -300 1330 L 1380 1330" w={3} color={DIM} />
          <Spotlight x={560} floor={1330} f={f} w={560} o={0.8} />
          <SnackPile x={260} y={1330} s={1.05} n={8} f={u} at={SS - 2} />
          <NeonFigure x={570} y={1330} scale={0.8} look={REMY} pose={u >= YR ? "wave" : "stand"} expr={u >= YR ? "happy" : "neutral"} f={f} blink={blinkOf(f, 1)} />
          <FloorGlow x={570} y={1330} w={200} />
          <Phone x={880} y={1080} scale={0.55} rot={4 * Math.sin(u < PS ? f * 1.3 : 0)} p={drawOn(u, 4, 16)}>
            <Notification y={-150} title={silent ? "SILENT" : "SQUAD"} body={silent ? "ON" : "u up??"} color={silent ? CORAL : GOLD} />
            <Notification y={-30} title="MOM" body="dinner?" muted={silent} />
            <Notification y={90} title="GROUP" body="12 new" muted={silent} />
          </Phone>
        </Plane>
        <Particles f={f} n={16} />
      </>;
      const hud = !hide && <>
        <LiveCounter f={u} from={0} to={0} at={0} tag="DAY 1" />
        <ChapterScreen f={u} id="h0" big="HOUR 0" small="LAUNCH NIGHT" y={760} size={190} at={0} out={SS - 10} />
        <HudText f={u} x={540} y={600} size={58} color={GOLD} enter="rise" at={SS} out={len - 6}>SNACKS: STACKED</HudText>
        <HudText f={u} x={540} y={690} size={58} color={CORAL} enter="rise" at={PS} out={len - 6}>PHONE: SILENT</HudText>
        <Stamp f={u} x={540} y={810} text="READY." at={YR} out={len - 6} color={AMBER} size={60} rot={-3} />
      </>;
      return { cam, world, hud };
    }
    case "hour17": { // close-up on Remy's face: HOURS AWAKE ticks to 017; "YOU FEEL FINE" -> "YOU'RE NOT." heavy lids
      const YN = C("You're not", 71);
      const cam = camKick(camDrift(at(540, 1080, k(u, 0, len, 1.0, 1.1)), f, 2), u - YN, 8);
      const world = <Plane p={1}>
        <ellipse cx={540} cy={1110} rx={460} ry={380} fill="url(#wiTvGlow)" opacity={0.6 + 0.3 * Math.abs(Math.sin(f * 0.27))} />
        <NeonFigure x={540} y={1110 + 894} scale={2.6} look={REMY} expr={u >= YN ? "tired" : "focused"} f={f} blink={u < YN && blinkOf(f, 3)} tilt={u >= YN ? -6 * arrive(u, YN, 14) : 0} />
        <Particles f={f} n={14} y={400} h={900} />
      </Plane>;
      const hud = !hide && <>
        <LiveCounter f={u} from={0} to={17} at={2} dur={22} tag="DAY 1" />
        <HudText f={u} x={540} y={560} size={60} color={CREAM} enter="rise" at={10} out={len - 6}>YOU FEEL FINE</HudText>
        <HudText f={u} x={540} y={650} size={70} color={CORAL} enter="scale" at={YN} out={len - 6}>{"YOU'RE NOT."}</HudText>
      </>;
      return { cam, world, hud };
    }
    case "study": { // comparison bars: 17-19 H AWAKE vs OVER THE LIMIT (0.05%) fill to the same level on "as badly"
      const AS = C("as badly", 126), DD = C("drink drive", 221);
      const cam = camDrift(at(540, 960, k(u, 0, len, 1.0, 1.04)), f, 2);
      const world = <><Plane p={0.3}><Grid f={f} /></Plane><Particles f={f} n={14} /></>;
      const hud = !hide && <>
        <HudText f={u} x={540} y={560} size={62} color={CREAM} enter="type" at={2} out={len - 6}>ONE STUDY (2000)</HudText>
        <CompareBars f={u} y={760} out={len - 6} rows={[
          { label: "17-19 H AWAKE", fill: 0.74, value: "SOME TESTS", at: 30 },
          { label: "OVER THE LIMIT (0.05%)", fill: 0.74, color: CORAL, at: AS },
        ]} />
        <Stamp f={u} x={540} y={1190} text="AS BAD ON SOME TESTS" at={AS + 26} out={len - 6} color={GOLD} size={50} rot={-2} />
        <HudText f={u} x={540} y={1300} size={40} color={MUTED} enter="type" at={DD} out={len - 6}>LIMIT IN MANY COUNTRIES</HudText>
      </>;
      return { cam, world, hud };
    }
    case "hour24": { // a line-art car drifts on a neon road; on "in your head" a giant head outline draws around the road
      const IG = C("In the game", 124), IH = C("in your head", 170);
      const sway = Math.sin(u * 0.06) * (0.6 + 0.4 * k(u, 0, len, 0, 1));
      const hp = drawOn(u, IH - 2, 22);
      const cam = camDrift({ ...at(540, 1040, k(u, IH - 4, IH + 20, 1.0, 0.95)), rot: 2.5 * sway * (u > IH ? 1 : 0.4) }, f, 2);
      const world = <>
        <Plane p={1}>
          <Road f={u} vy={860} bottom={1440} bend={-120 * sway} speed={1.4} />
          <CarBack x={540 + 190 * sway} y={1320} s={1.15} rot={-9 * Math.cos(u * 0.06)} f={f} />
          {hp > 0 && <><NeonPath d="M 540 790 A 350 350 0 1 1 539.9 790" w={5} p={hp} color={CORAL} hot />
            <NeonPath d="M 360 1480 L 330 1560 M 720 1480 L 750 1560" w={4} p={hp} color={CORAL} /></>}
        </Plane>
        <Particles f={f} n={14} />
      </>;
      const hud = !hide && <>
        <LiveCounter f={u} from={17} to={24} at={2} dur={18} tag="DAY 2" />
        <HudText f={u} x={540} y={580} size={64} color={CREAM} enter="words" at={14} out={IG - 6}>DRIFTING...</HudText>
        <HudText f={u} x={540} y={580} size={62} color={GOLD} enter="rise" at={IG} out={len - 6}>IN THE GAME</HudText>
        <HudText f={u} x={540} y={665} size={62} color={CORAL} enter="scale" at={IH} out={len - 6}>AND IN YOUR HEAD</HudText>
      </>;
      return { cam, world, hud };
    }
    case "day2": { // chapter DAY 2, then Remy's word bubbles scramble (SIMPLE -> SMIPLE)
      const BS = 30;
      const cam = camDrift(at(540, 980, k(u, 0, len, 1.06, 1.0)), f, 3);
      const b1 = drawOn(u, BS, 12), b2 = drawOn(u, BS + 8, 12);
      const world = <Plane p={1}>
        <NeonPath d="M -300 1330 L 1380 1330" w={3} color={DIM} />
        <Spotlight x={330} floor={1330} f={f} w={480} o={0.8} />
        {u >= BS - 4 && <><NeonFigure x={330} y={1330} scale={0.85} look={REMY} pose="shrug" expr="dizzy" f={f} />
          <FloorGlow x={330} y={1330} w={200} /></>}
        {b1 > 0 && <Bubble x={700} y={820} w={360} h={150} tx={-150} ty={120} p={b1} />}
        {b2 > 0 && <Bubble x={730} y={1060} w={360} h={150} tx={-190} ty={40} p={b2} color={CORAL} />}
      </Plane>;
      const hud = !hide && <>
        <ChapterScreen f={u} id="d2" big="DAY 2" small="HOURS AWAKE 036" y={720} size={210} at={0} out={BS - 8} />
        {b1 > 0.5 && <NeonText x={700} y={840} size={58} color={CREAM}>{scramble("SIMPLE", u, u > BS + 16)}</NeonText>}
        {b2 > 0.5 && <NeonText x={730} y={1080} size={58} color={CREAM}>{scramble("WORDS", u + 2, u > BS + 22)}</NeonText>}
      </>;
      return { cam, world, hud };
    }
    case "day3": { // high wide shot: Remy slumped on the floor among wrappers; the mission marker fades/dissolves; queasy sway
      const FM = C("You forget", 22), FS = C("You feel sick", 114);
      const q = k(u, FS - 6, FS + 20, 0, 1);
      const cam = camDrift({ ...at(540, 1040 + 20 * Math.sin(u * 0.08) * q, 1.02 + 0.03 * Math.sin(u * 0.05) * q), rot: 3 * Math.sin(u * 0.07) * (0.3 + q) }, f, 3);
      const broken = k(u, FM + 20, FM + 60, 0, 1);
      const world = <>
        <Plane p={0.7}><Bake id="floor-d3" done>
          {Array.from({ length: 9 }, (_, i) => <NeonPath key={i} d={`M ${-200 + i * 185} 1500 L ${540 + (i - 4) * 60} 900`} w={1.5} color={NEON.faint} glow={0} dash="0 16" />)}
          <NeonPath d="M -300 900 L 1380 900" w={2} color={NEON.faint} glow={0} />
        </Bake></Plane>
        <Plane p={1}>
          <Spotlight x={540} floor={1300} f={f} w={520} o={0.7} />
          <MissionMarker x={540} y={810} s={0.9} f={f} o={1 - 0.7 * broken} broken={broken} />
          <SnackPile x={300} y={1300} s={0.55} n={5} />
          <g transform="translate(790 1300) rotate(-12) scale(0.5)"><SnackPile x={0} y={0} n={4} /></g>
          <NeonFigure x={540} y={1300} scale={0.75} look={REMY} pose="slump" expr={u >= FS ? "sick" : "tired"} f={f} prop={<Controller s={0.7} rot={20} />} />
          <FloorGlow x={540} y={1300} w={220} color={u >= FS ? CORAL : GOLD} />
        </Plane>
        <Particles f={f} n={16} />
      </>;
      const hud = !hide && <>
        <LiveCounter f={u} from={36} to={60} at={2} dur={20} tag="DAY 3" />
        <HudText f={u} x={540} y={590} size={58} color={CORAL} enter="type" at={FM} out={len - 6}>{u >= FM + 30 ? "MISSION ???" : "MISSION: ..."}</HudText>
        <HudText f={u} x={540} y={675} size={62} color={AMBER} enter="scale" at={FS} out={len - 6}>YOU FEEL SICK</HudText>
      </>;
      return { cam, world, hud };
    }
    case "real": { // NOT A GUESS -> 1964 (year rolls back) -> neon ID card: Randy Gardner, 17, San Diego -> NO GAMES. JUST AWAKE.
      const Y64 = C("In nineteen", 45), SY = C("seventeen year", 100), RG = C("Randy Gardner", 183), NG = C("No games", 264);
      const cam = camDrift(at(540, 960, k(u, 0, len, 1.0, 1.05)), f, 2);
      const year = Math.round(k(u, Y64, Y64 + 26, 2026, 1964, EASE.arrive));
      const cp = drawOn(u, RG - 4, 22);
      const world = <>
        <Plane p={0.3}><Grid f={f} o={0.7} /></Plane>
        <Plane p={1}>
          {cp > 0 && <>
            <rect x={240} y={720} width={600} height={540} rx={24} fill="#000" opacity={0.7} />
            <NeonPath d="M 264 720 L 816 720 Q 840 720 840 744 L 840 1236 Q 840 1260 816 1260 L 264 1260 Q 240 1260 240 1236 L 240 744 Q 240 720 264 720 Z" w={4} p={cp} />
            <NeonPath d="M 270 1180 L 810 1180" w={2} p={cp} color={NEON.faint} dash="0 14" travel={-f} glow={0} />
            {cp > 0.6 && <g opacity={arrive(u, RG + 8, 12)}>
              <defs><clipPath id="wi-card"><rect x={244} y={724} width={592} height={454} /></clipPath></defs>
              <g clipPath="url(#wi-card)"><NeonFigure x={540} y={1460} scale={1.25} look={RANDY} expr={u >= NG ? "focused" : "neutral"} f={f} blink={blinkOf(f, 5)} /></g>
            </g>}
          </>}
        </Plane>
        <Particles f={f} n={14} />
      </>;
      const hud = !hide && <>
        <Stamp f={u} x={540} y={700} text="NOT A GUESS" at={2} out={Y64 - 8} size={66} />
        {u >= Y64 && u < RG && <ChapterScreen f={u} id="y64" big={String(year)} y={760} size={230} at={Y64} out={RG - 10} />}
        <HudText f={u} x={540} y={900} size={50} color={MUTED} enter="type" at={SY} out={RG - 10} spacing={4}>AGE 17 · SAN DIEGO</HudText>
        <HudText f={u} x={540} y={560} size={60} color={CREAM} enter="rise" at={RG} out={len - 6}>RANDY GARDNER, 17</HudText>
        <HudText f={u} x={540} y={640} size={44} color={GOLD} enter="type" at={RG + 8} out={len - 6} spacing={3}>SAN DIEGO · 1964</HudText>
        <HudText f={u} x={540} y={1330} size={50} color={CORAL} enter="words" at={NG} out={len - 6}>NO GAMES. JUST AWAKE.</HudText>
      </>;
      return { cam, world, hud };
    }
    case "symptoms": { // checklist WHAT SLIPPED: MEMORY / MOOD / SEES THINGS (REPORTED); Randy below reacts, dotted ghosts appear
      const MO = C("his mood", 39), SR = C("some reports", 95), ST = C("saw things", 137);
      const cam = camDrift(at(540, 980, k(u, 0, len, 1.03, 1.0)), f, 2);
      const items = [{ t: "MEMORY", a: 6 }, { t: "MOOD", a: MO }, { t: "SEES THINGS (REPORTED)", a: SR }];
      const gp = drawOn(u, ST - 4, 20);
      const world = <>
        <Plane p={1}>
          <Spotlight x={540} floor={1330} f={f} w={460} o={0.7} />
          <NeonFigure x={540} y={1330} scale={0.78} look={RANDY} expr={u >= ST ? "shocked" : u >= MO ? "sick" : "tired"} f={f} blink={u < MO && blinkOf(f, 2)} />
          <FloorGlow x={540} y={1330} w={200} color={RANDY.color} />
          {gp > 0 && [[250, 1080], [830, 1050], [780, 1250]].map(([gx, gy], i) => (
            <g key={i} transform={`translate(${gx} ${gy + 10 * Math.sin(f * 0.08 + i)})`} opacity={0.75}>
              <NeonPath d="M -50 60 L -50 -10 Q -50 -60 0 -60 Q 50 -60 50 -10 L 50 60 L 30 44 L 10 60 L -10 44 L -30 60 Z" w={3} p={gp} color={NEON.cyan} dash="0 10" travel={-f} />
              <circle cx={-16} cy={-14} r={6} fill={NEON.cyan} opacity={gp} /><circle cx={16} cy={-14} r={6} fill={NEON.cyan} opacity={gp} />
            </g>))}
        </Plane>
      </>;
      const hud = !hide && <>
        <HudText f={u} x={540} y={460} size={62} color={GOLD} enter="rise" at={0} out={len - 6}>WHAT SLIPPED</HudText>
        {items.map((it, i) => {
          const y = 600 + i * 110, cp = drawOn(u, it.a, 12);
          return <g key={i}>
            {cp > 0 && <NeonPath d={`M 110 ${y - 44} L 160 ${y - 44} L 160 ${y + 6} L 110 ${y + 6} Z`} w={3} p={cp} color={DIM} />}
            {cp > 0.5 && <NeonPath d={`M 118 ${y - 20} L 132 ${y - 4} L 158 ${y - 50}`} w={5} p={drawOn(u, it.a + 6, 10)} color={i === 2 ? NEON.cyan : CORAL} hot />}
            <HudText f={u} x={190} y={y} size={i === 2 ? 46 : 54} color={i === 2 ? NEON.cyan : CREAM} enter="type" at={it.a + 4} out={len - 6} anchor="start">{it.t}</HudText>
          </g>;
        })}
      </>;
      return { cam, world, hud };
    }
    case "record": { // big counter ticks to 264 H; = 11 DAYS with 11 day boxes; GUINNESS: NO MORE ATTEMPTS; TOO DANGEROUS
      const ED = C("Eleven days", 96), GU = C("Guinness later", 124), TD = C("too dangerous", 229);
      const cam = camKick(camDrift(at(540, 960, k(u, 0, len, 1.0, 1.04)), f, 2), u - (GU + 30), 10);
      const v = Math.round(k(u, 6, 56, 0, 264, EASE.arrive));
      const st = u > 56 && u < 64 ? 1 + 0.1 * Math.sin(((u - 56) / 8) * Math.PI) : 1;
      const world = <><Plane p={0.3}><Grid f={f} o={0.6} /></Plane><Particles f={f} n={12} /></>;
      const hud = !hide && <>
        <HudText f={u} x={540} y={470} size={46} color={MUTED} enter="type" at={0} out={len - 6} spacing={6}>HOURS AWAKE</HudText>
        <g opacity={arrive(u, 2, 10) * (1 - leave(u, len - 6))} transform={`translate(540 700) scale(${st}) translate(-540 -700)`}>
          <Digits x={480} y={700} text={String(v).padStart(3, "0")} size={200} color={AMBER} anchor="middle" />
          <NeonText x={760} y={700} size={110} color={GOLD} anchor="start">H</NeonText>
        </g>
        <HudText f={u} x={540} y={850} size={72} color={GOLD} enter="scale" at={ED} out={len - 6}>= 11 DAYS</HudText>
        {Array.from({ length: 11 }, (_, i) => {
          const p = drawOn(u, ED + 4 + i * 2, 10);
          const x = 155 + i * 70;
          return p > 0 && <g key={i} opacity={1 - leave(u, len - 6)}><rect x={x} y={910} width={56} height={56} fill={GOLD} opacity={0.18 * p} />
            <NeonPath d={`M ${x} 910 L ${x + 56} 910 L ${x + 56} 966 L ${x} 966 Z`} w={3} p={p} /></g>;
        })}
        <HudText f={u} x={540} y={1080} size={50} color={CREAM} enter="rise" at={GU} out={len - 6}>GUINNESS:</HudText>
        <Stamp f={u} x={540} y={1185} text="NO MORE ATTEMPTS" at={GU + 30} out={len - 6} size={58} />
        <HudText f={u} x={540} y={1320} size={50} color={CORAL} enter="type" at={TD} out={len - 6}>TOO DANGEROUS</HudText>
      </>;
      return { cam, world, hud };
    }
    case "day30": { // chapter DAY 30 glitches; UNREACHABLE; a 30-day calendar lights to 11 and stops, the rest crossed out
      const YN = C("You never", 43);
      const cam = camKick(camDrift(at(540, 960, 1.0), f, 2), u - YN, 12);
      const lit = Math.round(k(u, 6, 40, 0, 11, EASE.arrive));
      const world = <Plane p={1}><g transform="translate(270 880) scale(0.75)"><Calendar30 x={0} y={0} lit={lit} cross={u >= YN ? 11 : 99} f={f} /></g></Plane>;
      const hud = !hide && <>
        <ChapterScreen f={u} id="d30" big="DAY 30" y={640} size={200} at={0} glitch={k(u, 16, YN, 0.2, 1) * (0.6 + 0.4 * Math.abs(Math.sin(u * 0.9)))} />
        <Stamp f={u} x={540} y={800} text="UNREACHABLE" at={YN} out={len - 6} size={58} color={NEON.red} />
      </>;
      return { cam, world, hud };
    }
    case "micro": { // extreme close on Remy's eyes: lids droop, the screen blinks BLACK (microsleeps), snaps back with a jolt
      const TN = C("tiny naps", 46), WY = C("whether you", 104);
      const B = [[TN + 4, 9], [WY + 2, 12], [len - 30, 7]];
      const inB = B.find(([s, d]) => u >= s && u < s + d);
      const since = Math.min(...B.map(([s, d]) => (u >= s + d ? u - (s + d) : 999)));
      const droop = Math.min(...B.map(([s]) => (u < s ? Math.max(0, (s - u) / 24) : 1)));
      const open = since < 6 ? 1 : 0.25 + 0.75 * Math.min(1, droop);
      const cam = camKick(camDrift(at(540, 1000, k(u, 0, len, 1.0, 1.08)), f, 2), since, 14);
      const world = <Plane p={1}>
        <NeonPath d="M -100 760 Q 540 700 1180 760" w={6} color={GOLD} />
        <NeonPath d="M -100 790 Q 540 730 1180 790" w={3} color={DIM} />
        <BigEye x={300} y={1020} open={open} f={f} /><BigEye x={780} y={1020} open={open} f={f + 3} />
        <NeonPath d="M -40 900 Q -60 1300 120 1500 M 1120 900 Q 1140 1300 960 1500" w={5} color={GOLD} />
      </Plane>;
      const hud = !hide && !inB && <>
        <HudText f={u} x={540} y={520} size={96} color={GOLD} enter="scale" at={TN + 14} out={len - 6} tube spacing={4}>MICROSLEEP</HudText>
        <HudText f={u} x={540} y={620} size={52} color={CREAM} enter="type" at={TN + 30} out={len - 6}>JUST SECONDS</HudText>
      </>;
      return { cam, world, hud, black: inB ? 1 : 0 };
    }
    case "slept": { // Randy asleep in bed (side view), Zzz, the wall clock spins 14 hours; SLEPT 14 H
      const FH = C("fourteen hours", 77);
      const cam = camDrift(at(540, 1040, k(u, 0, len, 1.06, 1.0)), f, 2);
      const hrs = k(u, 0, len, 0, 14, EASE.camera);
      const world = <>
        <Plane p={1}>
          <Spotlight x={540} floor={1300} f={f} w={760} o={0.6} />
          <Bed x={540} y={1300} s={1.1} />
          <g transform="translate(650 1030) rotate(-90)"><NeonFigure x={0} y={0} scale={0.9} look={RANDY} expr="sleep" f={f} /></g>
          <Blanket x={540} y={1300} s={1.1} f={f} />
          <Zzz x={330} y={900} f={f} s={1.1} />
          <Clock x={820} y={720} r={90} hours={hrs} />
          <FloorGlow x={540} y={1300} w={420} />
        </Plane>
      </>;
      const hud = !hide && <>
        <HudText f={u} x={420} y={560} size={56} color={CREAM} enter="rise" at={4} out={len - 6}>FINALLY ASLEEP</HudText>
        <Stamp f={u} x={420} y={680} text="SLEPT 14 H" at={FH} out={len - 6} color={AMBER} size={62} rot={-3} />
      </>;
      return { cam, world, hud };
    }
    case "speedrun": { // THE REAL SPEEDRUN: a dotted loop with PLAY / SLEEP / REPEAT icons, a light dot runs the loop
      const PL = C("Play. Sleep", 64), SL = C("Sleep. Repeat", 82), RP = C("Repeat.", 100);
      const cam = camDrift(at(540, 1000, k(u, 0, len, 1.05, 1.0)), f, 2);
      const R = 240, cx = 540, cy = 1040;
      const lp = drawOn(u, 2, 30);
      const dotA = -90 + k(u, 0, PL, -120, 0) + k(u, PL, SL, 0, 120) + k(u, SL, RP, 0, 120) + (u > RP ? (u - RP) * 6 : 0);
      const ic = (a: number) => ({ x: cx + R * Math.cos((a * Math.PI) / 180), y: cy + R * Math.sin((a * Math.PI) / 180) });
      const P1 = ic(-90), P2 = ic(30), P3 = ic(150), D = ic(dotA);
      const hot = (c: number) => (u >= c ? 1 : 0.45);
      const word = u >= RP ? "REPEAT" : u >= SL ? "SLEEP" : u >= PL ? "PLAY" : "";
      const world = <Plane p={1}>
        <NeonPath d={`M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - 0.1} ${cy - R}`} w={3} p={lp} color={DIM} />
        {lp >= 1 && <NeonPath d={`M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - 0.1} ${cy - R}`} w={4} color={GOLD} dash="0 22" travel={-u * 2} />}
        <circle cx={D.x} cy={D.y} r={14} fill={NEON.hot} /><circle cx={D.x} cy={D.y} r={34} fill={AMBER} opacity={0.25} />
        {[[P1, PL], [P2, SL], [P3, RP]].map(([p, c], i) => <g key={i} opacity={hot(c as number)}>
          <circle cx={(p as { x: number }).x} cy={(p as { y: number }).y} r={88} fill="#000" />
          <NeonPath d={`M ${(p as { x: number }).x} ${(p as { y: number }).y - 88} a 88 88 0 1 1 -0.1 0`} w={3} p={drawOn(u, 6 + i * 6, 14)} color={u >= (c as number) ? CORAL : DIM} />
        </g>)}
        <g opacity={hot(PL)}><Controller x={P1.x} y={P1.y} s={0.75} p={drawOn(u, 8, 14)} /></g>
        <g opacity={hot(SL)}><MoonIcon x={P2.x} y={P2.y} s={0.8} p={drawOn(u, 14, 14)} /></g>
        <g opacity={hot(RP)}><RepeatIcon x={P3.x} y={P3.y} s={0.8} p={drawOn(u, 20, 14)} /></g>
      </Plane>;
      const hud = !hide && <>
        <HudText f={u} x={540} y={600} size={62} color={GOLD} enter="words" at={4} out={len - 6}>THE REAL SPEEDRUN</HudText>
        {word && <g key={word}><HudText f={u} x={540} y={1064} size={64} color={CREAM} enter="scale" at={word === "PLAY" ? PL : word === "SLEEP" ? SL : RP}>{word}</HudText></g>}
      </>;
      return { cam, world, hud };
    }
    default: { // ask: Remy rested, under the spotlight, waves; YOUR RECORD ??? H; LONGEST YOU'VE STAYED AWAKE?
      const cam = camDrift(at(540, 1000 + 40 * k(u, 0, len, 0, 1), k(u, 0, len, 1.08, 0.98)), f, 2);
      const world = <>
        <Plane p={0.4}><Bake id="ask-sky" done><Skyline base={1330} seed={7} color={NEON.faint} /></Bake></Plane>
        <Plane p={1}>
          <NeonPath d="M -300 1330 L 1380 1330" w={3} color={DIM} />
          <Spotlight x={540} floor={1330} f={f} w={600} />
          <NeonFigure x={540} y={1330} scale={0.95} look={REMY} pose={u > 20 ? "point" : "wave"} expr="happy" f={f} />
          <FloorGlow x={540} y={1330} w={260} />
        </Plane>
        <Particles f={f} n={22} />
      </>;
      const roll = Array.from({ length: 3 }, (_, i) => String(Math.floor(rnd(Math.floor(u / 3) * 5 + i) * 10))).join("");
      const hud = !hide && <>
        <LiveCounter f={u} label="YOUR RECORD" from={0} to={0} at={0} display={u < 40 ? roll : "???"} unit="H" />
        <HudText f={u} x={540} y={560} size={46} color={GOLD} enter="type" at={2} out={len + 30} spacing={3}>PLAY · SLEEP · REPEAT</HudText>
        <HudText f={u} x={540} y={680} size={68} color={CREAM} enter="rise" at={10} out={len + 30}>{"LONGEST YOU'VE"}</HudText>
        <HudText f={u} x={540} y={770} size={74} color={CORAL} enter="scale" at={18} out={len + 30}>STAYED AWAKE?</HudText>
      </>;
      return { cam, world, hud };
    }
  }
};

const ShotView: React.FC<{ span: ShotSpan; freezeAt?: number; noText?: boolean }> = ({ span, freezeAt, noText }) => {
  const f0 = useCurrentFrame();
  const f = freezeAt ?? f0;
  const words = React.useContext(Words);
  const u = f - span.a, len = span.b - span.a;
  const C = (phrase: string, fb: number) => cueAt(words, phrase, span, fb);
  const v = build(span.id, f, u, len, C, !!noText);
  return (
    <AbsoluteFill>
      <Stage cam={v.cam} hud={v.hud || null}>{v.world}</Stage>
      {v.black ? <AbsoluteFill style={{ background: "#000", opacity: v.black }} /> : null}
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
  const fade = !!prev && u < XF && PLACE[prev.id] !== PLACE[span.id];
  return (
    <Words.Provider value={words}><AbsoluteFill style={{ background: NEON.bg }}>
      <ShotView span={span} noText={fade} />
      {fade && prev && <AbsoluteFill style={{ opacity: 1 - (u + 1) / (XF + 1) }}><ShotView span={prev} freezeAt={prev.b - 1} noText /></AbsoluteFill>}
    </AbsoluteFill></Words.Provider>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "wi-gta-nosleep",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: NEON.bg,
};
export default story;
