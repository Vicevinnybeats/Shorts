// Preview sheets for the WHAT IF kit (library/whatif). Rebuild: node library/previews/whatif/build.mjs
// -> library/previews/whatif/kit.png + characters.png
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WI, Stage, Vignette, LiveCounter, CompareBars, ChapterScreen, ChoiceCards, Phone, Notification, PhoneStat,
  SnackPile, TV, Bed, Silhouette, Daylight, Zzz, Moon, Glow } from "../../whatif/kit";
import { Toy, TOY_LOOKS, ToyExpr, ToyPose, Controller } from "../../whatif/toy";

const f = 40;
const Panel: React.FC<{ x: number; y: number; children: React.ReactNode; label: string }> = ({ x, y, children, label }) => (
  <g transform={`translate(${x} ${y})`}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" overflow="hidden">{children}</svg>
    <rect width={1080} height={1920} fill="none" stroke="#33415f" strokeWidth={6} />
    <text x={540} y={1990} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={44} fill="#eef3ff">{label}</text>
  </g>
);
const Kit: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={4440} height={2080} viewBox="0 0 4440 2080">
    <rect width={4440} height={2080} fill="#05070d" />
    <Panel x={30} y={20} label="Stage, LiveCounter, CompareBars">
      <Stage f={f} spot={{ x: 540, y: 1380 }} floorY={1380} />
      <Toy x={540} y={1380} scale={0.9} look={TOY_LOOKS.remy} pose="play" expr="tired" f={f} />
      <LiveCounter x={60} y={300} label="HOURS AWAKE" value={17} tag="DAY 1" f={f} unit="H" />
      <CompareBars x={80} y={620} w={860} f={200} rows={[{ label: "17-19 H AWAKE", fill: 0.8, value: "17 H", color: WI.cyan }, { label: "OVER THE LIMIT (0.05%)", fill: 0.8, value: "0.05%", color: WI.coral }]} />
      <Vignette />
    </Panel>
    <Panel x={1140} y={20} label="ChapterScreen (plain / crack + glitch)">
      <Stage f={f} spot={null} />
      <ChapterScreen y={620} big="3" small="DAY" f={f} />
      <ChapterScreen y={1300} big="30" small="DAY" f={f} crack={0.8} glitch={0.6} color={WI.coral} w={700} h={560} bigSize={280} />
      <Vignette />
    </Panel>
    <Panel x={2250} y={20} label="ChoiceCards + Phone">
      <Stage f={f} spot={null} haze={0.3} />
      <ChoiceCards y={620} f={f} pick={2} cw={380} ch={340} cards={[{ letter: "A", text: "HOUR 17", expr: "tired" }, { letter: "B", text: "DAY 2", expr: "sleepy", look: TOY_LOOKS.mo },
        { letter: "C", text: "DAY 3", expr: "dizzy", look: TOY_LOOKS.june }, { letter: "D", text: "NEVER", expr: "happy", look: TOY_LOOKS.kit }]} />
      <Phone x={540} y={1450} scale={0.72}>
        <PhoneStat x={200} y={120} label="FOLLOWERS" value="1,204" />
        <Notification y={200} title="Mo" body="u still playing??" />
        <Notification y={320} title="June" body="it's 4 am" icon={WI.coral} />
        <Notification y={440} title="Mom" body="call me" icon={WI.gold} />
      </Phone>
    </Panel>
    <Panel x={3360} y={20} label="Props + Daylight">
      <Daylight f={f} kind="city" horizon={760} />
      <rect x={0} y={760} width={1080} height={1160} fill={WI.bg1} />
      <SnackPile x={280} y={1180} scale={0.8} n={14} />
      <TV x={760} y={1000} scale={0.5}><rect width={560} height={320} fill="#123" /><path d="M 200 320 L 260 0 L 300 0 L 360 320 Z" fill="#3a4766" /></TV>
      <Controller x={760} y={1250} scale={1.4} />
      <Bed x={560} y={1640} scale={0.8} f={f} />
      <Zzz x={420} y={1440} f={f} />
      <Moon x={900} y={880} r={40} />
      <Silhouette x={180} y={1860} scale={0.6} />
      <Glow x={180} y={1700} r={100} color={WI.gold} o={0.2} />
    </Panel>
  </svg>
);
const EXPRS: ToyExpr[] = ["neutral", "happy", "tired", "shocked", "sleepy", "dizzy"];
const POSES: ToyPose[] = ["stand", "wave", "point", "sit", "play", "slump"];
const looks = Object.keys(TOY_LOOKS);
const Chars: React.FC = () => {
  const W = 6 * 360 + 60, H = 3 * 560 + 120;
  return <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <rect width={W} height={H} fill={WI.bg1} />
    {EXPRS.map((e, i) => <g key={e}><Glow x={210 + i * 360} y={500} r={150} ry={30} color="#cfe6ff" o={0.4} />
      <Toy x={210 + i * 360} y={500} scale={0.95} look={TOY_LOOKS.remy} expr={e} f={f} blink={false} />
      <text x={210 + i * 360} y={550} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={34} fill="#eef3ff">{e}</text></g>)}
    {POSES.map((p, i) => <g key={p}><Glow x={210 + i * 360} y={1080} r={150} ry={30} color="#cfe6ff" o={0.4} />
      <Toy x={210 + i * 360} y={1080} scale={0.95} look={TOY_LOOKS.remy} pose={p} expr={p === "slump" ? "sleepy" : p === "wave" ? "happy" : "neutral"} f={f} blink={false} />
      <text x={210 + i * 360} y={1130} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={34} fill="#eef3ff">{p}</text></g>)}
    {looks.map((k, i) => <g key={k}><Glow x={210 + i * 360} y={1660} r={150} ry={30} color="#cfe6ff" o={0.4} />
      <Toy x={210 + i * 360} y={1660} scale={0.95} look={TOY_LOOKS[k]} expr={i % 2 ? "happy" : "neutral"} pose={i === 3 ? "wave" : "stand"} f={f} blink={false} />
      <text x={210 + i * 360} y={1710} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={34} fill="#eef3ff">{k}</text></g>)}
  </svg>;
};
console.log(JSON.stringify({ kit: renderToStaticMarkup(<Kit />), characters: renderToStaticMarkup(<Chars />) }));
