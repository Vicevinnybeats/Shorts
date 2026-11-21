// Preview sheets for the WHAT IF "Golden Neon" kit (library/whatif). Rebuild: CHROME_PATH=... node library/previews/whatif/build.mjs
// -> library/previews/whatif/kit.png + characters.png
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NEON, NeonDefs, NeonPath, NeonText, StrokeWord, Spotlight, Particles, LiveCounter, CompareBars, ChapterScreen, ChoiceCards, Phone, Notification,
  Stamp, Controller, TV, Couch, SnackPile, Bed, Blanket, Clock, CarBack, Road, MissionMarker, Bubble, RoomLines, Skyline, Calendar30, Zzz, RepeatIcon,
  MoonIcon, NeonFigure, FloorGlow, LOOKS, FigExpr, FigPose } from "../../whatif/kit";

const f = 200;
const Panel: React.FC<{ x: number; y: number; children: React.ReactNode; label: string }> = ({ x, y, children, label }) => (
  <g transform={`translate(${x} ${y})`}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" overflow="hidden"><rect width={1080} height={1920} fill={NEON.bg} />{children}</svg>
    <rect width={1080} height={1920} fill="none" stroke="#3a2c14" strokeWidth={6} />
    <text x={540} y={1990} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={44} fill={NEON.text}>{label}</text>
  </g>
);
const Kit: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={4440} height={2080} viewBox="0 0 4440 2080">
    <NeonDefs /><rect width={4440} height={2080} fill="#000" />
    <Panel x={30} y={20} label="sting: StrokeWord, Spotlight, Couch, TV glow, LiveCounter">
      <RoomLines /><Spotlight x={540} floor={1380} f={f} /><Particles f={f} />
      <StrokeWord text="WHAT IF" x={540} y={420} h={150} p={0.8} />
      <NeonText x={540} y={720} size={64} color={NEON.text}>30 DAYS OF GTA 6?</NeonText>
      <Couch x={540} y={1380} part="back" />
      <NeonFigure x={540} y={1300} scale={0.95} look={LOOKS.remy} pose="play" expr="focused" f={f} prop={<Controller s={0.7} />} />
      <Couch x={540} y={1380} part="front" /><FloorGlow x={540} y={1380} w={380} />
      <LiveCounter f={f} from={0} to={17} at={10} tag="DAY 1" />
    </Panel>
    <Panel x={1140} y={20} label="CompareBars, ChapterScreen, Stamp, Calendar30">
      <CompareBars f={f} y={420} rows={[{ label: "17-19 H AWAKE", fill: 0.72, value: "SOME TESTS", at: 10 }, { label: "OVER THE LIMIT (0.05%)", fill: 0.72, color: NEON.coral, value: "0.05% BAC", at: 20 }]} />
      <ChapterScreen f={f} id="k1" big="DAY 3" small="HOURS AWAKE 060" y={1000} size={200} />
      <ChapterScreen f={f} id="k2" big="DAY 30" y={1330} size={150} glitch={0.6} />
      <Stamp f={f} x={540} y={1500} text="UNREACHABLE" at={0} size={56} />
      <g transform="translate(250 1560) scale(0.5)"><Calendar30 x={0} y={0} lit={11} cross={11} f={f} /></g>
    </Panel>
    <Panel x={2250} y={20} label="ChoiceCards, Phone + Notification, Bubble">
      <ChoiceCards f={f} y={560} pick={1} pickAt={10} cards={[{ letter: "A", text: "HOUR 17" }, { letter: "B", text: "DAY 2" }, { letter: "C", text: "DAY 3" }, { letter: "D", text: "NEVER" }]} />
      <Phone x={330} y={1250} scale={0.95}><Notification y={-120} title="SILENT MODE" body="ON" /><Notification y={0} title="MOM" body="dinner?" muted /><Notification y={120} title="SQUAD" body="u up??" muted /></Phone>
      <Bubble x={790} y={1000} w={330} h={150} />
      <NeonText x={790} y={1018} size={50} color={NEON.text}>SMIPLE</NeonText>
      <MissionMarker x={790} y={1330} f={f} s={0.9} />
    </Panel>
    <Panel x={3360} y={20} label="props: TV, snacks, bed, clock, car + road, icons">
      <Skyline base={700} />
      <TV x={300} y={520} s={0.7} f={f}><Controller s={0.8} /></TV>
      <SnackPile x={780} y={640} s={0.9} />
      <Bed x={540} y={1080} s={0.9} /><NeonFigure x={330} y={980} scale={0.55} look={LOOKS.randy} expr="sleep" f={f} /><Blanket x={540} y={1080} s={0.9} f={f} />
      <Zzz x={250} y={760} f={f} /><Clock x={880} y={830} hours={14} />
      <Road f={f} vy={1180} bottom={1900} bend={-120} /><CarBack x={480} y={1720} s={0.9} rot={-6} f={f} />
      <RepeatIcon x={150} y={1260} s={0.8} /><MoonIcon x={930} y={1260} s={0.8} />
    </Panel>
  </svg>
);
const POSES: FigPose[] = ["stand", "play", "slump", "wave", "point", "shrug"];
const EXPRS: FigExpr[] = ["neutral", "happy", "focused", "tired", "dizzy", "shocked", "sick", "sleep"];
const Chars: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={2400} height={1500} viewBox="0 0 2400 1500">
    <rect width={2400} height={1500} fill={NEON.bg} />
    {Object.entries(LOOKS).map(([k, l], i) => <g key={k}>
      <NeonFigure x={180 + i * 260} y={520} scale={0.95} look={l} expr={i === 0 ? "happy" : "neutral"} f={f} /><FloorGlow x={180 + i * 260} y={520} w={160} color={l.color} />
      <text x={180 + i * 260} y={590} textAnchor="middle" fontFamily="CaptionSans" fontWeight={900} fontSize={34} fill={l.color}>{l.name}</text></g>)}
    {POSES.map((p, i) => <g key={p}>
      <NeonFigure x={1500 + (i % 3) * 300} y={300 + Math.floor(i / 3) * 360} scale={0.6} look={LOOKS.remy} pose={p} expr="neutral" f={f} prop={p === "play" ? <Controller s={0.7} /> : undefined} />
      <text x={1500 + (i % 3) * 300} y={340 + Math.floor(i / 3) * 360} textAnchor="middle" fontFamily="CaptionSans" fontWeight={800} fontSize={28} fill={NEON.muted}>{p}</text></g>)}
    {EXPRS.map((e, i) => <g key={e}>
      <g transform={`translate(${150 + i * 290} 1180) scale(1.9) translate(0 345)`}><NeonFigure x={0} y={0} look={LOOKS.remy} expr={e} f={f} /></g>
      <text x={150 + i * 290} y={1440} textAnchor="middle" fontFamily="CaptionSans" fontWeight={800} fontSize={34} fill={NEON.muted}>{e}</text></g>)}
    <rect x={0} y={1000} width={2400} height={0} />
  </svg>
);
process.stdout.write(JSON.stringify({ kit: renderToStaticMarkup(<Kit />), characters: renderToStaticMarkup(<Chars />) }));
