// Library (2.5D): a cosy living room in the evening (episode "tickle"): teal wallpaper, framed family photos, night
// window with curtains, wooden floor, mustard sofa, floor lamp, TV with flickering glow, rug, cushions, a feather.
// Lab props for the explanation: cartoon brain (front/side, glowing cerebellum), forecast bubble, sine waves, feeling
// meter, robot arm with foam tip, lever, delay stopwatch, cardboard tickle contraption, small icons. Dad's glasses.
import React from "react";
import { INK, Pose } from "../characters25/person";
import { CachedSvg } from "../../src/engine25/cached";
import { LAB } from "../style/channel";

export const LIVING = { wall: "#3f6f6c", wall2: "#376461", motif: "#5d8f86", skirting: "#efe6d8", floor: "#8a5a3c", floor2: "#74482f",
  sofa: "#e0a33a", sofa2: "#c4872a", rug: "#b8463a", rug2: "#e6c07a", night: "#1b2348", lamp: "#ffd98a", frame: "#6b4636",
  wood: "#a8693e", wood2: "#8a5230", tv: "#22252e", screen: "#7fc8ff", card: "#c9a06a", card2: "#a97f4c" } as const;

const SAND = "#f6efe0";

// ---------------------------------------------------------------- attach things to a Person
/** Draws `children` in a Person's own frame so accessories follow lean/crouch/headTilt. Pass the SAME x, y, scale,
 *  facing, pose and rot as the Person. part "head": origin = chin, head top at y -112, eye line at y -56, head width
 *  120 (x -60..60). part "body": origin = feet, shoulders y -285, hips y -150, torso x -48..48 (upright pose). */
export const PersonPart: React.FC<{ x: number; y: number; scale?: number; facing?: 1 | -1; pose?: Pose; rot?: number; part: "head" | "body"; children: React.ReactNode }> =
  ({ x, y, scale = 1, facing = 1, pose, rot = 0, part, children }) => {
    const crouch = (pose?.crouch ?? 0) * 140, hipY = -150 + crouch, shY = -285 + crouch * 0.9;
    const lean = (pose?.lean ?? 0) * facing;
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <g transform={`rotate(${lean + rot} 0 ${hipY})`}>
          {part === "head"
            ? <g transform={`translate(${facing * 4} ${shY - 6}) rotate(${(pose?.headTilt ?? 0) * facing}) translate(0 -6)`}>{children}</g>
            : <g transform={`translate(0 ${crouch})`}>{children}</g>}
        </g>
      </g>
    );
  };

/** Dad's glasses, drawn on a Person's head (same props as that Person). */
export const Glasses: React.FC<{ x: number; y: number; scale?: number; facing?: 1 | -1; pose?: Pose; rot?: number; color?: string }> = ({ color = "#2a1e2c", ...p }) => (
  <PersonPart {...p} part="head">
    <g fill="#dff2ff" fillOpacity={0.25} stroke={color} strokeWidth={5}>
      <rect x={-34} y={-70} width={30} height={24} rx={8} />
      <rect x={4} y={-70} width={30} height={24} rx={8} />
    </g>
    <path d="M -4 -62 Q 0 -66 4 -62 M -34 -62 L -52 -66 M 34 -62 L 52 -66" stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />
  </PersonPart>
);

// ---------------------------------------------------------------- the room
/** Back wall: wallpaper, night window with curtains, three framed photos (shapes only), skirting. Cached.
 *  Covers x -300..1380, y..y+h. Put LivingFloor below it (from y+h). */
export const LivingWall: React.FC<{ y?: number; h?: number }> = ({ y = 0, h = 1500 }) => {
  const sk = y + h - 60;
  return (
    <CachedSvg cacheKey={`living-wall-${y}-${h}`} x={-300} y={y} w={1680} h={h}>
      <rect x={-300} y={y} width={1680} height={h} fill={LIVING.wall} />
      {Array.from({ length: 22 }, (_, i) => <rect key={i} x={-300 + i * 80} y={y} width={36} height={h} fill={LIVING.wall2} />)}
      {Array.from({ length: 22 * Math.ceil(h / 160) }, (_, i) => {
        const cx = -282 + (i % 22) * 80 + 58, cy = y + 80 + Math.floor(i / 22) * 160 + ((i % 2) * 80);
        return <path key={"m" + i} d={`M ${cx} ${cy - 14} L ${cx + 10} ${cy} L ${cx} ${cy + 14} L ${cx - 10} ${cy} Z`} fill={LIVING.motif} opacity={0.6} />;
      })}
      {/* window at night */}
      <rect x={-40} y={y + 280} width={460} height={560} rx={10} fill={LIVING.night} stroke={INK} strokeWidth={10} />
      {[[30, 360], [140, 330], [330, 400], [250, 520], [60, 560], [370, 640], [170, 700]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={y + sy} r={4 + (i % 3)} fill="#fff6d6" />)}
      <circle cx={300} cy={y + 420} r={52} fill="#fff1c2" /><circle cx={324} cy={y + 404} r={48} fill={LIVING.night} />
      {[[-30, 640, 90, 200], [70, 690, 70, 150], [150, 610, 100, 230], [260, 670, 80, 170], [345, 640, 70, 200]].map(([bx, by, bw, bh], i) =>
        <g key={"b" + i}><rect x={bx} y={y + by + 200 - bh} width={bw} height={bh + 30} fill="#2a335c" />
          <rect x={bx + 16} y={y + by + 230 - bh} width={14} height={16} fill="#ffd98a" opacity={0.8} /></g>)}
      <path d={`M 190 ${y + 280} L 190 ${y + 840} M -40 ${y + 560} L 420 ${y + 560}`} stroke={INK} strokeWidth={8} />
      <rect x={-60} y={y + 830} width={500} height={26} rx={6} fill={LIVING.skirting} stroke={INK} strokeWidth={6} />
      {/* curtains + rail */}
      <rect x={-100} y={y + 240} width={580} height={20} rx={10} fill={LIVING.wood2} stroke={INK} strokeWidth={6} />
      {[[-110, -10], [380, 480]].map(([a, b], i) => <path key={"c" + i} d={`M ${a} ${y + 255} L ${b} ${y + 255} L ${b + (i ? 10 : -10)} ${y + 900} Q ${(a + b) / 2} ${y + 920} ${a + (i ? -10 : 10)} ${y + 900} Z`}
        fill="#c4573f" stroke={INK} strokeWidth={7} strokeLinejoin="round" />)}
      {[-80, -40, 410, 450].map((cx) => <path key={"f" + cx} d={`M ${cx} ${y + 270} L ${cx + 4} ${y + 890}`} stroke="#9e4130" strokeWidth={5} />)}
      {/* framed photos: family (big), landscape, heart */}
      <rect x={620} y={y + 300} width={340} height={260} rx={6} fill={LIVING.frame} stroke={INK} strokeWidth={8} />
      <rect x={644} y={y + 324} width={292} height={212} fill="#f4e3c4" />
      {[[700, 1.0, "#e85a8a"], [790, 1.25, "#6f8a3c"], [880, 0.8, "#ffb02e"]].map(([px, s, c], i) => {
        const base = y + 536, sc = s as number;
        return <g key={"p" + i}><path d={`M ${(px as number) - 30 * sc} ${base} Q ${px} ${base - 90 * sc} ${(px as number) + 30 * sc} ${base} Z`} fill={c as string} stroke={INK} strokeWidth={4} />
          <circle cx={px as number} cy={base - 100 * sc} r={24 * sc} fill="#a8673f" stroke={INK} strokeWidth={4} /></g>;
      })}
      <rect x={1010} y={y + 340} width={200} height={160} rx={6} fill={LIVING.frame} stroke={INK} strokeWidth={8} />
      <rect x={1030} y={y + 360} width={160} height={120} fill="#9fd3f0" />
      <path d={`M 1030 ${y + 480} L 1080 ${y + 410} L 1120 ${y + 450} L 1150 ${y + 420} L 1190 ${y + 480} Z`} fill="#4f9a5a" />
      <circle cx={1160} cy={y + 385} r={14} fill="#ffd93b" />
      <rect x={700} y={y + 620} width={170} height={200} rx={6} fill={LIVING.frame} stroke={INK} strokeWidth={8} />
      <rect x={720} y={y + 640} width={130} height={160} fill="#f6efe0" />
      <path d={`M 785 ${y + 760} C 735 ${y + 720} 740 ${y + 670} 785 ${y + 700} C 830 ${y + 670} 835 ${y + 720} 785 ${y + 760} Z`} fill="#e8443a" stroke={INK} strokeWidth={4} />
      <rect x={960} y={y + 600} width={150} height={150} rx={75} fill={LIVING.frame} stroke={INK} strokeWidth={8} />
      <circle cx={1035} cy={y + 675} r={52} fill="#ffe2c8" /><circle cx={1035} cy={y + 665} r={20} fill="#8d5a3b" /><path d={`M 1000 ${y + 715} Q 1035 ${y + 680} 1070 ${y + 715}`} fill="#3a6fd0" />
      {/* skirting */}
      <rect x={-300} y={sk} width={1680} height={60} fill={LIVING.skirting} stroke={INK} strokeWidth={6} />
    </CachedSvg>
  );
};

/** Wooden floorboards from y down (cached). */
export const LivingFloor: React.FC<{ y: number; h?: number }> = ({ y, h = 700 }) => (
  <CachedSvg cacheKey={`living-floor-${y}-${h}`} x={-400} y={y} w={1880} h={h}>
    <rect x={-400} y={y} width={1880} height={h} fill={LIVING.floor} />
    {Array.from({ length: Math.ceil(h / 60) }, (_, j) => <g key={j}>
      <path d={`M -400 ${y + j * 60} L 1480 ${y + j * 60}`} stroke={LIVING.floor2} strokeWidth={4} />
      {Array.from({ length: 6 }, (_, i) => { const bx = -400 + ((i * 360 + j * 170) % 1880); return <path key={i} d={`M ${bx} ${y + j * 60} L ${bx} ${y + j * 60 + 60}`} stroke={LIVING.floor2} strokeWidth={4} />; })}
    </g>)}
  </CachedSvg>
);

/** Three-seat sofa seen from the front; x = centre, y = floor. 820 wide at scale 1; seat top at y - 250*scale,
 *  backrest top at y - 470*scale. To SIT someone: draw <Sofa>, then the Person at y = sofaY - 150*scale (person
 *  scale ~= sofa scale, pose crouch 0.6, shadow 0), then <Sofa front> on top (seat cushions + base + arms hide the
 *  legs). Seat centres at x - 240*scale, x, x + 240*scale. */
export const Sofa: React.FC<{ x: number; y: number; scale?: number; front?: boolean }> = ({ x, y, scale = 1, front = false }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {!front && <>
      <rect x={-360} y={-470} width={720} height={260} rx={50} fill={LIVING.sofa2} stroke={INK} strokeWidth={9} />
      {[-240, 0, 240].map((cx) => <rect key={cx} x={cx - 112} y={-440} width={224} height={200} rx={36} fill={LIVING.sofa} stroke={INK} strokeWidth={7} />)}
    </>}
    {[-240, 0, 240].map((cx) => <rect key={"s" + cx} x={cx - 118} y={-260} width={236} height={90} rx={24} fill={LIVING.sofa} stroke={INK} strokeWidth={7} />)}
    <rect x={-370} y={-180} width={740} height={140} rx={20} fill={LIVING.sofa2} stroke={INK} strokeWidth={9} />
    {[-1, 1].map((d) => <rect key={d} x={d > 0 ? 330 : -410} y={-340} width={80} height={300} rx={36} fill={LIVING.sofa} stroke={INK} strokeWidth={9} />)}
    {[-340, 340].map((lx) => <path key={lx} d={`M ${lx - 14} -40 L ${lx - 8} 0 L ${lx + 8} 0 L ${lx + 14} -40 Z`} fill={LIVING.wood2} stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
  </g>
);

/** Floor lamp; x = pole, y = floor. ~900 tall at scale 1. `on` adds the warm glow. */
export const FloorLamp: React.FC<{ x: number; y: number; scale?: number; on?: boolean }> = ({ x, y, scale = 1, on = true }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {on && <><circle cx={0} cy={-760} r={300} fill={LIVING.lamp} opacity={0.12} /><circle cx={0} cy={-760} r={180} fill={LIVING.lamp} opacity={0.16} />
      <path d="M -110 -730 L -260 0 L 260 0 L 110 -730 Z" fill={LIVING.lamp} opacity={0.08} /></>}
    <ellipse cx={0} cy={-6} rx={90} ry={18} fill="#2a1e2c" stroke={INK} strokeWidth={6} />
    <rect x={-8} y={-760} width={16} height={754} fill="#3a2e3c" stroke={INK} strokeWidth={4} />
    <path d="M -80 -900 L 80 -900 L 130 -730 L -130 -730 Z" fill={on ? "#ffe9b0" : "#d8c49a"} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {on && <ellipse cx={0} cy={-730} rx={124} ry={14} fill="#fff6d0" />}
  </g>
);

/** TV on a low cabinet; x = centre, y = floor. Screen flickers with frame f (cool blue glow on the wall). */
export const TV: React.FC<{ x: number; y: number; scale?: number; f: number }> = ({ x, y, scale = 1, f }) => {
  const v = 0.55 + 0.25 * Math.sin(f * 0.9) + 0.2 * Math.sin(f * 2.3 + 1);
  const shift = Math.floor(f / 40) % 3;
  const scr = ["#7fc8ff", "#9be3c0", "#ffc98a"][shift];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={-470} rx={420} ry={260} fill={scr} opacity={0.1 + 0.08 * v} />
      <rect x={-300} y={-220} width={600} height={200} rx={12} fill={LIVING.wood} stroke={INK} strokeWidth={8} />
      <path d="M 0 -210 L 0 -30" stroke={INK} strokeWidth={6} />
      <circle cx={-30} cy={-120} r={9} fill="#e8c46a" stroke={INK} strokeWidth={3} /><circle cx={30} cy={-120} r={9} fill="#e8c46a" stroke={INK} strokeWidth={3} />
      {[-260, 260].map((lx) => <rect key={lx} x={lx - 10} y={-24} width={20} height={24} fill={LIVING.wood2} stroke={INK} strokeWidth={5} />)}
      <rect x={-40} y={-260} width={80} height={44} fill="#2a2e38" stroke={INK} strokeWidth={6} />
      <rect x={-270} y={-640} width={540} height={390} rx={16} fill={LIVING.tv} stroke={INK} strokeWidth={9} />
      <rect x={-244} y={-614} width={488} height={338} rx={8} fill={scr} />
      <rect x={-244} y={-614} width={488} height={338} rx={8} fill="#ffffff" opacity={0.22 * v} />
      {shift === 0 && <><circle cx={-60} cy={-470} r={70} fill="#ffd93b" stroke={INK} strokeWidth={5} /><path d="M -244 -330 Q 0 -420 244 -330 L 244 -276 L -244 -276 Z" fill="#2fbf71" /></>}
      {shift === 1 && <><rect x={-150} y={-540} width={120} height={180} rx={20} fill="#e8443a" stroke={INK} strokeWidth={5} /><rect x={40} y={-500} width={120} height={140} rx={20} fill="#3a6fd0" stroke={INK} strokeWidth={5} /></>}
      {shift === 2 && <><path d="M -244 -380 L -100 -520 L 20 -400 L 120 -480 L 244 -360 L 244 -276 L -244 -276 Z" fill="#8a5ad6" /><circle cx={140} cy={-560} r={30} fill="#fff6d0" /></>}
      <path d="M -220 -600 L -150 -600" stroke="#ffffff" strokeWidth={8} opacity={0.5} strokeLinecap="round" />
    </g>
  );
};

/** Oval rug lying on the floor; x = centre, y = centre, w = width. */
export const Rug: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <g>
    <ellipse cx={x} cy={y} rx={w / 2} ry={w * 0.12} fill={LIVING.rug} stroke={INK} strokeWidth={7} />
    <ellipse cx={x} cy={y} rx={w * 0.42} ry={w * 0.095} fill="none" stroke={LIVING.rug2} strokeWidth={10} />
    <ellipse cx={x} cy={y} rx={w * 0.28} ry={w * 0.06} fill="none" stroke={LIVING.rug2} strokeWidth={6} strokeDasharray="18 14" />
  </g>
);

/** Square throw cushion (~170 px), centre at x,y. */
export const Cushion: React.FC<{ x: number; y: number; rot?: number; scale?: number; color?: string }> = ({ x, y, rot = 0, scale = 1, color = "#3fb8c9" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <path d="M -86 -80 Q 0 -60 86 -80 Q 66 0 86 80 Q 0 60 -86 80 Q -66 0 -86 -80 Z" fill={color} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -50 -48 Q 0 -36 50 -48 Q 38 0 50 48 Q 0 36 -50 48 Q -38 0 -50 -48 Z" fill="none" stroke="#ffffff" strokeWidth={5} opacity={0.45} strokeDasharray="10 8" />
    <circle r={9} fill="#ffffff" stroke={INK} strokeWidth={4} />
  </g>
);

/** Long feather (~280 px), quill end at x,y pointing down-left at rot 0; tip toward the upper right. */
export const Feather: React.FC<{ x: number; y: number; scale?: number; rot?: number; color?: string }> = ({ x, y, scale = 1, rot = 0, color = "#f2e6ff" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <path d="M 20 -30 C 40 -140 140 -240 250 -270 C 240 -170 160 -60 40 -20 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[0.25, 0.4, 0.55, 0.7, 0.85].map((t, i) => { const px = 20 + 230 * t, py = -30 - 240 * t;
      return <path key={i} d={`M ${px} ${py} l ${i % 2 ? 26 : -24} ${i % 2 ? 22 : -14}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />; })}
    <path d="M 0 0 L 245 -265" stroke={INK} strokeWidth={6} strokeLinecap="round" />
  </g>
);

// ---------------------------------------------------------------- lab props
const BRAIN = { pink: "#f4a6b8", pink2: "#e07f98", stem: "#e8b49a" };

/** Cartoon brain, radius r, centre x,y. side = profile facing right (cerebellum at back-bottom left); front = two
 *  hemispheres with the cerebellum peeking below. cerebellumGlow 0..1 turns it gold with a halo. */
export const Brain: React.FC<{ x: number; y: number; r: number; cerebellumGlow?: number; side?: boolean }> = ({ x, y, r, cerebellumGlow = 0, side = false }) => {
  const g = Math.max(0, Math.min(1, cerebellumGlow));
  const cer = g > 0 ? "#f2c230" : BRAIN.pink2;
  const s = r / 100;
  const sw = 7 / s;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {side ? (<>
        <path d="M 6 60 C 10 90 0 120 -6 140 L 18 140 C 22 118 30 90 34 62 Z" fill={BRAIN.stem} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        {g > 0 && <ellipse cx={-50} cy={62} rx={70 + 20 * g} ry={50 + 16 * g} fill="#ffe36a" opacity={0.3 * g} />}
        <path d="M -90 50 C -100 90 -40 108 -10 86 C 10 70 -10 40 -40 40 Z" fill={cer} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        {[0, 1, 2].map((i) => <path key={i} d={`M ${-84 + i * 6} ${58 + i * 12} Q ${-50} ${50 + i * 14} ${-16 + i * 2} ${62 + i * 10}`} stroke={g > 0 ? "#b8890e" : INK} strokeWidth={sw * 0.6} fill="none" />)}
        <path d="M -110 10 C -130 -60 -70 -110 0 -105 C 80 -100 125 -50 112 10 C 104 50 70 66 30 62 C 0 60 -20 46 -40 46 C -70 46 -100 40 -110 10 Z" fill={BRAIN.pink} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        {["M -80 -40 Q -50 -70 -20 -50 Q 0 -80 30 -60", "M -90 0 Q -60 -20 -40 0 Q -10 -30 20 -10 Q 50 -40 80 -20", "M -60 30 Q -30 10 0 30 Q 30 10 60 30 Q 80 20 95 0",
          "M 40 -80 Q 70 -60 90 -30", "M 0 -60 L 10 20"].map((d, i) => <path key={i} d={d} stroke={BRAIN.pink2} strokeWidth={sw * 0.8} fill="none" strokeLinecap="round" />)}
      </>) : (<>
        {g > 0 && <ellipse cx={0} cy={90} rx={90 + 20 * g} ry={40 + 14 * g} fill="#ffe36a" opacity={0.3 * g} />}
        <path d="M -8 80 L -10 140 L 10 140 L 8 80 Z" fill={BRAIN.stem} stroke={INK} strokeWidth={sw} />
        {[-1, 1].map((d) => <ellipse key={"c" + d} cx={d * 38} cy={92} rx={42} ry={24} fill={cer} stroke={INK} strokeWidth={sw} />)}
        {[-1, 1].map((d) => <path key={d} transform={`scale(${d} 1)`} d="M 2 -100 C 60 -110 112 -60 108 0 C 104 60 70 92 30 90 C 12 90 4 80 2 70 Z" fill={BRAIN.pink} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />)}
        {[-1, 1].map((d) => <g key={"g" + d} transform={`scale(${d} 1)`}>
          {["M 20 -70 Q 50 -90 80 -60", "M 18 -30 Q 50 -50 70 -20 Q 85 -10 96 -24", "M 20 10 Q 50 -10 80 20", "M 24 50 Q 50 36 76 56"].map((p, i) =>
            <path key={i} d={p} stroke={BRAIN.pink2} strokeWidth={sw * 0.8} fill="none" strokeLinecap="round" />)}
        </g>)}
      </>)}
    </g>
  );
};

/** Thought/forecast cloud centred at x,y (w x h) with a tail of dots to the lower left. children are drawn on top
 *  in absolute design coordinates. */
export const ForecastBubble: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode }> = ({ x, y, w, h, children }) => {
  const n = 12, rx = w / 2, ry = h / 2;
  const bumps = Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [x + Math.cos(a) * rx * 0.86, y + Math.sin(a) * ry * 0.82] as const; });
  const br = Math.min(rx, ry) * 0.36;
  return (
    <g>
      {[0.95, 1.12, 1.26].map((k, i) => <circle key={"t" + i} cx={x - rx * k * 0.9} cy={y + ry * k * 0.95} r={br * (0.42 - i * 0.12)} fill="#24346a" stroke={LAB.muted} strokeWidth={6} />)}
      {bumps.map(([bx, by], i) => <circle key={"o" + i} cx={bx} cy={by} r={br + 6} fill={LAB.muted} />)}
      <ellipse cx={x} cy={y} rx={rx * 0.86 + 6} ry={ry * 0.82 + 6} fill={LAB.muted} />
      {bumps.map(([bx, by], i) => <circle key={"i" + i} cx={bx} cy={by} r={br} fill="#24346a" />)}
      <ellipse cx={x} cy={y} rx={rx * 0.86} ry={ry * 0.82} fill="#24346a" />
      {children}
    </g>
  );
};

/** A sine line from (x, y) to (x + w, y). amp in px, phase in radians, `cycles` across the width (default 2). */
export const Wave: React.FC<{ x: number; y: number; w: number; amp: number; phase: number; color: string; width?: number; cycles?: number }> =
  ({ x, y, w, amp, phase, color, width = 10, cycles = 2 }) => {
    const pts = Array.from({ length: 81 }, (_, i) => { const t = i / 80; return `${(x + t * w).toFixed(1)} ${(y - Math.sin(t * cycles * Math.PI * 2 + phase) * amp).toFixed(1)}`; });
    return <path d={"M " + pts.join(" L ")} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  };

/** Feeling gauge: half dial, centre of the dial at x,y (radius 170), needle at value 0..1 (green -> red). */
export const Meter: React.FC<{ x: number; y: number; value: number; label?: string }> = ({ x, y, value, label }) => {
  const R = 170, v = Math.max(0, Math.min(1, value));
  const cols = [LAB.green, "#9ad13a", LAB.gold, LAB.orange, LAB.red];
  const arc = (a0: number, a1: number, r: number) => {
    const p = (a: number) => [Math.cos(Math.PI + a * Math.PI) * r, Math.sin(Math.PI + a * Math.PI) * r];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const na = Math.PI + v * Math.PI;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`${arc(0, 1, R + 22)} L ${R + 22} 20 L ${-R - 22} 20 Z`} fill="#1a2448" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {cols.map((c, i) => <path key={i} d={arc(i / 5 + 0.005, (i + 1) / 5 - 0.005, R - 14)} stroke={c} strokeWidth={34} fill="none" />)}
      <path d={`M 0 0 L ${Math.cos(na) * (R - 30)} ${Math.sin(na) * (R - 30)}`} stroke={SAND} strokeWidth={14} strokeLinecap="round" />
      <circle r={22} fill={SAND} stroke={INK} strokeWidth={6} />
      {label && <text y={90} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={52} fill={LAB.text}>{label}</text>}
    </g>
  );
};

/** Robot arm on a base (x = base centre, y = floor), reaching right. reach 0..1 (folded -> stretched).
 *  The tip ends about (x + (180 + 300*reach)*scale, y - (430 - 170*reach)*scale). tip "foam" = soft yellow ball. */
export const RobotArm: React.FC<{ x: number; y: number; scale?: number; reach: number; tip?: "foam" }> = ({ x, y, scale = 1, reach, tip }) => {
  const r = Math.max(0, Math.min(1, reach));
  const a1 = -60 + 40 * r;             // shoulder angle (deg from +x)
  const a2 = 40 + 10 * r - (1 - r) * 70; // elbow
  const L1 = 260, L2 = 240;
  const sx = 0, sy = -260;
  const ex = sx + Math.cos((a1 * Math.PI) / 180) * L1, ey = sy + Math.sin((a1 * Math.PI) / 180) * L1;
  const tx = ex + Math.cos((a2 * Math.PI) / 180) * L2, ty = ey + Math.sin((a2 * Math.PI) / 180) * L2;
  const seg = (x0: number, y0: number, x1: number, y1: number, k: string) => <g key={k}>
    <path d={`M ${x0} ${y0} L ${x1} ${y1}`} stroke={INK} strokeWidth={62} strokeLinecap="round" />
    <path d={`M ${x0} ${y0} L ${x1} ${y1}`} stroke="#c9d1d8" strokeWidth={48} strokeLinecap="round" />
    <path d={`M ${x0} ${y0} L ${x1} ${y1}`} stroke="#ff9a3a" strokeWidth={10} strokeLinecap="round" opacity={0.9} />
  </g>;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-110} y={-90} width={220} height={90} rx={14} fill="#3a4258" stroke={INK} strokeWidth={8} />
      <rect x={-46} y={-270} width={92} height={190} rx={18} fill="#8f9aa6" stroke={INK} strokeWidth={8} />
      {seg(sx, sy, ex, ey, "a")}
      {seg(ex, ey, tx, ty, "b")}
      <circle cx={sx} cy={sy} r={34} fill="#3a4258" stroke={INK} strokeWidth={7} />
      <circle cx={ex} cy={ey} r={30} fill="#3a4258" stroke={INK} strokeWidth={7} />
      {tip === "foam" ? <circle cx={tx} cy={ty} r={40} fill="#ffe36a" stroke={INK} strokeWidth={7} /> : <circle cx={tx} cy={ty} r={20} fill="#3a4258" stroke={INK} strokeWidth={6} />}
      {tip === "foam" && [[-12, -10], [10, 6], [-4, 16], [14, -14]].map(([dx, dy], i) => <circle key={i} cx={tx + dx} cy={ty + dy} r={5} fill="#e0b820" />)}
    </g>
  );
};

/** Control lever: base block at x,y (bottom centre), stick rotated `angle` degrees from vertical (+ = right). */
export const Lever: React.FC<{ x: number; y: number; angle: number }> = ({ x, y, angle }) => (
  <g transform={`translate(${x} ${y})`}>
    <g transform={`rotate(${angle} 0 -60)`}>
      <path d="M 0 -60 L 0 -250" stroke={INK} strokeWidth={30} strokeLinecap="round" />
      <path d="M 0 -60 L 0 -250" stroke="#c9d1d8" strokeWidth={18} strokeLinecap="round" />
      <circle cx={0} cy={-260} r={38} fill={LAB.red} stroke={INK} strokeWidth={8} />
      <ellipse cx={-12} cy={-272} rx={12} ry={8} fill="#ffffff" opacity={0.6} />
    </g>
    <path d="M -110 0 L -90 -80 L 90 -80 L 110 0 Z" fill="#3a4258" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-50} y={-92} width={100} height={20} rx={8} fill="#1f2433" stroke={INK} strokeWidth={5} />
  </g>
);

/** Stopwatch (the 0.2 s delay): centre x,y, radius r; value 0..1 sweeps the orange wedge and the hand. */
export const DelayClock: React.FC<{ x: number; y: number; r: number; value: number }> = ({ x, y, r, value }) => {
  const v = Math.max(0, Math.min(0.9999, value));
  const a = v * Math.PI * 2 - Math.PI / 2;
  const R = r * 0.8;
  const wedge = v > 0.001 ? `M 0 0 L 0 ${-R} A ${R} ${R} 0 ${v > 0.5 ? 1 : 0} 1 ${Math.cos(a) * R} ${Math.sin(a) * R} Z` : "";
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-r * 0.14} y={-r * 1.32} width={r * 0.28} height={r * 0.26} rx={r * 0.05} fill="#c9d1d8" stroke={INK} strokeWidth={r * 0.05} />
      <rect x={-r * 0.28} y={-r * 1.42} width={r * 0.56} height={r * 0.14} rx={r * 0.06} fill={LAB.red} stroke={INK} strokeWidth={r * 0.05} />
      <circle r={r} fill={SAND} stroke={INK} strokeWidth={r * 0.08} />
      {wedge && <path d={wedge} fill={LAB.orange} opacity={0.85} />}
      {Array.from({ length: 12 }, (_, i) => <path key={i} transform={`rotate(${i * 30})`} d={`M 0 ${-r * 0.9} L 0 ${-r * (i % 3 ? 0.82 : 0.74)}`} stroke={INK} strokeWidth={r * 0.04} strokeLinecap="round" />)}
      <path d={`M 0 0 L ${Math.cos(a) * r * 0.78} ${Math.sin(a) * r * 0.78}`} stroke={INK} strokeWidth={r * 0.07} strokeLinecap="round" />
      <circle r={r * 0.08} fill={INK} />
    </g>
  );
};

/** Home-made tickle machine: cardboard box (x = centre, y = floor), crank on the right side, a stick with a string
 *  and a feather that swings as `crank` (degrees) turns. ~400 wide; the feather hangs from x - 195*scale down to about y - 60*scale. */
export const Contraption: React.FC<{ x: number; y: number; scale?: number; crank: number }> = ({ x, y, scale = 1, crank }) => {
  const c = (crank * Math.PI) / 180;
  const swing = Math.sin(c) * 22;
  const hx = Math.cos(c) * 50, hy = Math.sin(c) * 50;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M 40 -260 L -200 -330" stroke={LIVING.wood2} strokeWidth={14} strokeLinecap="round" />
      <path d="M 40 -260 L -200 -330" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
      <g transform={`rotate(${swing} -195 -330)`}>
        <path d="M -195 -330 L -195 -170" stroke={SAND} strokeWidth={4} />
        <Feather x={-195} y={-170} scale={0.4} rot={137} />
      </g>
      <rect x={-150} y={-240} width={300} height={240} fill={LIVING.card} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -150 -240 L -110 -290 L 190 -290 L 150 -240 Z" fill={LIVING.card2} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M 150 -240 L 190 -290 L 190 -50 L 150 0 Z" fill={LIVING.card2} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -100 -170 L 60 -170 M -100 -140 L 20 -140" stroke="#8a6436" strokeWidth={6} strokeLinecap="round" />
      <rect x={-30} y={-80} width={60} height={30} fill="#d8c49a" stroke={INK} strokeWidth={4} transform="rotate(-8)" />
      <circle cx={170} cy={-150} r={14} fill="#8f9aa6" stroke={INK} strokeWidth={5} />
      <path d={`M 170 -150 L ${170 + hx} ${-150 + hy}`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d={`M 170 -150 L ${170 + hx} ${-150 + hy}`} stroke="#c9d1d8" strokeWidth={8} strokeLinecap="round" />
      <rect x={170 + hx - 10} y={-150 + hy - 26} width={20} height={36} rx={8} fill={LAB.red} stroke={INK} strokeWidth={5} />
    </g>
  );
};

/** Icon badge helper: round badge size ~200*s at x,y; dim greys it out. */
const Badge: React.FC<{ x: number; y: number; s: number; dim?: boolean; children: React.ReactNode }> = ({ x, y, s, dim, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={dim ? 0.35 : 1}>
    {!dim && <circle r={130} fill={LAB.gold} opacity={0.18} />}
    <circle r={100} fill={dim ? "#3a4566" : "#24346a"} stroke={dim ? "#5a6688" : LAB.text} strokeWidth={8} />
    {children}
  </g>
);

/** Footsteps icon (two shoe prints). */
export const Footsteps: React.FC<{ x: number; y: number; s: number; dim?: boolean }> = ({ x, y, s, dim }) => {
  const c = dim ? "#9fb0d8" : LAB.text;
  const print = (dx: number, dy: number, r: number) => <g transform={`translate(${dx} ${dy}) rotate(${r})`}>
    <ellipse cx={0} cy={-12} rx={18} ry={28} fill={c} /><ellipse cx={0} cy={30} rx={14} ry={14} fill={c} /></g>;
  return <Badge x={x} y={y} s={s} dim={dim}>{print(-26, 16, -12)}{print(26, -22, 12)}</Badge>;
};

/** Own-voice icon (mouth + sound waves). */
export const VoiceIcon: React.FC<{ x: number; y: number; s: number; dim?: boolean }> = ({ x, y, s, dim }) => {
  const c = dim ? "#9fb0d8" : LAB.text;
  return <Badge x={x} y={y} s={s} dim={dim}>
    <path d="M -50 -40 C -10 -50 10 -20 0 0 C 10 20 -10 50 -50 40 L -40 0 Z" fill={c} />
    <path d="M -46 -10 Q -20 0 -46 10" stroke={dim ? "#3a4566" : "#24346a"} strokeWidth={8} fill="none" />
    {[22, 44].map((r, i) => <path key={i} d={`M ${10 + r * 0.5} ${-r} Q ${10 + r * 1.2} 0 ${10 + r * 0.5} ${r}`} stroke={c} strokeWidth={9} fill="none" strokeLinecap="round" />)}
  </Badge>;
};

/** Doorbell icon (bell with ring lines). */
export const Doorbell: React.FC<{ x: number; y: number; s: number; dim?: boolean }> = ({ x, y, s, dim }) => {
  const c = dim ? "#9fb0d8" : LAB.gold;
  return <Badge x={x} y={y} s={s} dim={dim}>
    <path d="M -40 30 C -40 -10 -36 -50 0 -52 C 36 -50 40 -10 40 30 L 52 42 L -52 42 Z" fill={c} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={0} cy={54} r={12} fill={c} stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={-58} r={8} fill={c} stroke={INK} strokeWidth={4} />
    {!dim && [-1, 1].map((d) => <path key={d} d={`M ${d * 62} -30 Q ${d * 76} 0 ${d * 62} 30`} stroke={c} strokeWidth={8} fill="none" strokeLinecap="round" />)}
  </Badge>;
};
