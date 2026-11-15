// Library (2.5D): a sunny afternoon town square (episode "pole"): honey-stone paving, a row of low pastel town houses
// with terracotta roofs and teal shutters, round trees, a distant fountain and cafe umbrellas (no text). Props: the
// lone classic lamp post (with a bonk wobble), park bench, animated fountain, pigeons (standing / flying), a side-view
// bicycle (kid / adult) with spinning spokes and cranks + helpers that put a Person on it (rideOn) or make a limb
// reach a point (reachLimb, e.g. Grandpa holding the saddle while jogging). Wardrobe: kid Helmet, FlatCap, Beard.
// Lab props: gaze line, big eye close-up, pull arrows, steering wheel, top-view road, perspective road, tangent
// point, gaze cone, path line (safe vs crash), bonk stars.
import React from "react";
import { INK, Pose } from "../characters25/person";
import { CachedSvg } from "../../src/engine25/cached";
import { LAB } from "../style/channel";
import { PersonPart } from "./livingroom";

export const SQUARE = {
  sky: "#9ed6f2", sky2: "#c6e8f6", haze: "#ffe6bd", sun: "#ffd93b", cloud: "#fffaf0",
  hill: "#e7c9a4", hill2: "#d9b68e",
  stone: "#efcf9c", stone2: "#e2b97f", stone3: "#f6ddb2", mortar: "#c79a64", curb: "#f7e6c4", curb2: "#d8b17b",
  wallA: "#f2a07a", wallB: "#f6c75a", wallC: "#f7e3c0", wallD: "#e8806a", wallE: "#c9d9a0", roof: "#c4573f", roof2: "#9e4130",
  shutter: "#2f8f8a", shutter2: "#246f6b", window: "#cfe9f5", door: "#7a4a2e", trim: "#fff4de",
  leaf: "#5aa354", leaf2: "#3f8445", trunk: "#8a5a34",
  umbrella: "#e8443a", umbrella2: "#fff4de",
  iron: "#2f4a44", iron2: "#46695f", glass: "#ffe9a8", glow: "#fff6cc",
  bench: "#c27a3e", bench2: "#9a5a2a",
  fstone: "#e6dccb", fstone2: "#c9bba4", water: "#7cc8ef", water2: "#4ea6d6", foam: "#eaf7ff",
  pigeon: "#a3abbc", pigeon2: "#7f889a", neck: "#5f9e8f", neck2: "#8a6fb0", beak: "#e8a26a", feet: "#e86a5a",
  tyre: "#3a3340", rim: "#cfd6dd", spoke: "#9aa3ae", chain: "#5a5560", saddle: "#2d2630",
  bikeKid: "#2fb3c8", bikeAdult: "#c4573f", helmet: "#ff5d8f", helmet2: "#d63f72", cap: "#7a6a58", cap2: "#5e5042", beard: "#f1f1ee",
} as const;

const SHADOW = "#05040c";
const r2 = (v: number) => Math.round(v * 10) / 10;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const rng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

// ---------------------------------------------------------------- the square (cached backdrop)
type House = { x: number; w: number; h: number; wall: string; roof: "gable" | "flat" | "hip"; floors: number };
const HOUSES: House[] = [
  { x: -300, w: 230, h: 560, wall: SQUARE.wallC, roof: "gable", floors: 3 },
  { x: -70, w: 200, h: 470, wall: SQUARE.wallA, roof: "flat", floors: 2 },
  { x: 130, w: 250, h: 600, wall: SQUARE.wallB, roof: "hip", floors: 3 },
  { x: 380, w: 190, h: 480, wall: SQUARE.wallE, roof: "gable", floors: 2 },
  { x: 570, w: 240, h: 590, wall: SQUARE.wallD, roof: "flat", floors: 3 },
  { x: 810, w: 210, h: 500, wall: SQUARE.wallC, roof: "gable", floors: 2 },
  { x: 1020, w: 220, h: 610, wall: SQUARE.wallA, roof: "hip", floors: 3 },
  { x: 1240, w: 200, h: 480, wall: SQUARE.wallB, roof: "flat", floors: 2 },
];

const HouseShape: React.FC<{ hs: House; base: number; seed: number }> = ({ hs, base, seed }) => {
  const { x, w, h, wall, roof, floors } = hs, top = base - h, R = rng(seed);
  const floorH = (h - 40) / floors, cols = w > 215 ? 3 : 2;
  const els: React.ReactElement[] = [];
  for (let fl = 0; fl < floors; fl++) {
    const fy = base - (fl + 1) * floorH;
    for (let c = 0; c < cols; c++) {
      const cx = x + (w / cols) * (c + 0.5), ww = 44, wh = Math.min(74, floorH * 0.5);
      if (fl === 0 && c === Math.floor(cols / 2)) {                                       // door on the ground floor
        els.push(<g key={`d${fl}${c}`}><path d={`M ${cx - 30} ${base} L ${cx - 30} ${base - 110} Q ${cx} ${base - 140} ${cx + 30} ${base - 110} L ${cx + 30} ${base} Z`} fill={SQUARE.door} stroke={INK} strokeWidth={6} />
          <circle cx={cx + 16} cy={base - 52} r={4} fill={SQUARE.sun} /></g>);
        continue;
      }
      const wy = fy + floorH * 0.3;
      els.push(<g key={`w${fl}${c}`}>
        <rect x={cx - ww / 2 - 18} y={wy} width={16} height={wh} fill={SQUARE.shutter} stroke={INK} strokeWidth={4} />
        <rect x={cx + ww / 2 + 2} y={wy} width={16} height={wh} fill={SQUARE.shutter} stroke={INK} strokeWidth={4} />
        <rect x={cx - ww / 2} y={wy} width={ww} height={wh} rx={4} fill={SQUARE.window} stroke={INK} strokeWidth={5} />
        <path d={`M ${cx} ${wy} L ${cx} ${wy + wh} M ${cx - ww / 2} ${wy + wh * 0.45} L ${cx + ww / 2} ${wy + wh * 0.45}`} stroke={INK} strokeWidth={3} />
        {fl > 0 && R() < 0.5 && <g><rect x={cx - ww / 2 - 6} y={wy + wh} width={ww + 12} height={14} rx={4} fill={SQUARE.bench2} stroke={INK} strokeWidth={4} />
          {[-14, 0, 14].map((dx) => <circle key={dx} cx={cx + dx} cy={wy + wh - 4} r={8} fill={R() < 0.5 ? "#e85a8a" : "#ff7a2f"} stroke={INK} strokeWidth={3} />)}</g>}
      </g>);
    }
    if (fl > 0) els.push(<rect key={`c${fl}`} x={x} y={base - fl * floorH - 6} width={w} height={8} fill={SQUARE.trim} opacity={0.7} />);
  }
  const roofEl = roof === "gable"
    ? <path d={`M ${x - 14} ${top} L ${x + w / 2} ${top - 110} L ${x + w + 14} ${top} Z`} fill={SQUARE.roof} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    : roof === "hip"
      ? <path d={`M ${x - 14} ${top} L ${x + 40} ${top - 70} L ${x + w - 40} ${top - 70} L ${x + w + 14} ${top} Z`} fill={SQUARE.roof2} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      : <rect x={x - 10} y={top - 22} width={w + 20} height={26} rx={4} fill={SQUARE.trim} stroke={INK} strokeWidth={6} />;
  return (
    <g>
      {roof === "gable" && <rect x={x + w * 0.7} y={top - 100} width={26} height={60} fill={SQUARE.roof2} stroke={INK} strokeWidth={5} />}
      {roofEl}
      <rect x={x} y={top} width={w} height={h} fill={wall} stroke={INK} strokeWidth={7} />
      <rect x={x} y={top} width={14} height={h} fill={SHADOW} opacity={0.06} />
      {els}
    </g>
  );
};

const Tree: React.FC<{ x: number; base: number; s: number }> = ({ x, base, s }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={70} ry={10} fill={SHADOW} opacity={0.15} />
    <path d="M -12 0 L -9 -150 L 9 -150 L 12 0 Z" fill={SQUARE.trunk} stroke={INK} strokeWidth={6} />
    <path d="M -2 -120 L -40 -170 M 2 -130 L 36 -180" stroke={INK} strokeWidth={10} strokeLinecap="round" />
    <path d="M -2 -120 L -40 -170 M 2 -130 L 36 -180" stroke={SQUARE.trunk} strokeWidth={4} strokeLinecap="round" />
    {[[-60, -200, 70], [55, -210, 72], [0, -270, 88], [-30, -170, 60], [40, -165, 56]].map(([cx, cy, r], i) =>
      <circle key={"o" + i} cx={cx} cy={cy} r={r} fill={SQUARE.leaf} stroke={INK} strokeWidth={7} />)}
    {[[-60, -200, 70], [55, -210, 72], [0, -270, 88], [-30, -170, 60], [40, -165, 56]].map(([cx, cy, r], i) =>
      <circle key={"i" + i} cx={cx} cy={cy} r={r - 3.5} fill={SQUARE.leaf} />)}
    <path d="M -70 -190 Q -50 -150 -10 -160 M 20 -200 Q 50 -170 80 -190" stroke={SQUARE.leaf2} strokeWidth={8} fill="none" strokeLinecap="round" />
    <circle cx={-20} cy={-300} r={18} fill="#7cc06a" />
  </g>
);

const Umbrella: React.FC<{ x: number; base: number; s: number; col: string }> = ({ x, base, s, col }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}>
    <path d="M 0 0 L 0 -150" stroke={INK} strokeWidth={8} />
    <path d="M -95 -140 Q 0 -215 95 -140 Z" fill={col} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -32 -150 Q 0 -205 0 -205 Q 0 -205 32 -150 Z" fill={SQUARE.umbrella2} />
    <path d="M -95 -140 Q 0 -215 95 -140" fill="none" stroke={INK} strokeWidth={6} />
    {[-70, -35, 0, 35, 70].map((dx, i) => <path key={dx} d={`M ${dx - 17} -140 Q ${dx} ${-128 + (i % 2) * 2} ${dx + 17} -140`} fill={i % 2 ? SQUARE.umbrella2 : col} stroke={INK} strokeWidth={4} />)}
    <rect x={-40} y={-56} width={80} height={10} rx={5} fill={SQUARE.trim} stroke={INK} strokeWidth={4} />
    <path d="M 0 -46 L 0 0 M -18 0 L 18 0" stroke={INK} strokeWidth={6} />
    {[-1, 1].map((d) => <g key={d}><path d={`M ${d * 62} -40 L ${d * 62} 0 M ${d * 50} -40 L ${d * 74} -40`} stroke={INK} strokeWidth={6} strokeLinecap="round" /></g>)}
  </g>
);

/** A small static fountain far away, used inside the backdrop. */
const FarFountain: React.FC<{ x: number; base: number; s: number }> = ({ x, base, s }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}>
    <path d="M -150 -50 L 150 -50 L 140 0 L -140 0 Z" fill={SQUARE.fstone} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <ellipse cx={0} cy={-50} rx={150} ry={20} fill={SQUARE.water} stroke={INK} strokeWidth={7} />
    <rect x={-14} y={-150} width={28} height={100} fill={SQUARE.fstone} stroke={INK} strokeWidth={6} />
    <path d="M -60 -150 Q 0 -120 60 -150 Z" fill={SQUARE.fstone} stroke={INK} strokeWidth={6} />
    <path d="M 0 -160 Q -40 -210 -80 -60 M 0 -160 Q 40 -210 80 -60 M 0 -160 L 0 -200" stroke={SQUARE.water} strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);

/** Sky + far hills with a bell tower + a row of low town houses (terracotta roofs, teal shutters, window boxes),
 *  round trees, a small far fountain and cafe umbrellas, and a pale pavement strip. No text. Cached.
 *  Covers x -300..1380, y..y+h; the ground line (house bases) is y+h, so put Paving at y+h. Houses reach ~720 px
 *  above the ground line, so keep h >= 900. fountain=false hides the far fountain (when you place a big Fountain). */
export const SquareBackdrop: React.FC<{ y?: number; h?: number; fountain?: boolean }> = ({ y = 0, h = 1300, fountain = true }) => {
  const B = y + h, base = B - 30;
  return (
    <CachedSvg cacheKey={`square-back-${y}-${h}-${fountain}`} x={-300} y={y} w={1680} h={h}>
      <rect x={-300} y={y} width={1680} height={h} fill={SQUARE.sky} />
      <rect x={-300} y={B - 1000} width={1680} height={260} fill={SQUARE.sky2} />
      <rect x={-300} y={B - 740} width={1680} height={740} fill={SQUARE.haze} />
      {/* sun + clouds */}
      <circle cx={880} cy={B - 1030} r={70} fill={SQUARE.sun} stroke={INK} strokeWidth={6} />
      {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <path key={"r" + i} d={`M ${880 + Math.cos(a) * 92} ${B - 1030 + Math.sin(a) * 92} L ${880 + Math.cos(a) * 118} ${B - 1030 + Math.sin(a) * 118}`} stroke={SQUARE.sun} strokeWidth={10} strokeLinecap="round" />; })}
      {[[120, B - 1120, 1], [560, B - 960, 0.8], [1180, B - 900, 0.9]].map(([cx, cy, s], i) =>
        <path key={"cl" + i} transform={`translate(${cx} ${cy}) scale(${s})`} d="M -110 20 Q -120 -20 -70 -20 Q -60 -60 -10 -55 Q 30 -80 60 -40 Q 110 -45 110 0 Q 120 25 90 25 L -90 25 Q -115 25 -110 20 Z"
          fill={SQUARE.cloud} stroke={INK} strokeWidth={5} />)}
      {/* far hills + bell tower */}
      <path d={`M -300 ${B - 560} Q -100 ${B - 700} 160 ${B - 600} Q 420 ${B - 520} 700 ${B - 640} Q 1000 ${B - 760} 1380 ${B - 590} L 1380 ${B} L -300 ${B} Z`} fill={SQUARE.hill} />
      <path d={`M -300 ${B - 500} Q 200 ${B - 580} 600 ${B - 520} Q 1000 ${B - 470} 1380 ${B - 540} L 1380 ${B} L -300 ${B} Z`} fill={SQUARE.hill2} />
      <g fill={SQUARE.hill2} stroke={INK} strokeWidth={5} strokeOpacity={0.35}>
        <rect x={470} y={B - 860} width={70} height={300} />
        <path d={`M 460 ${B - 860} L 505 ${B - 950} L 550 ${B - 860} Z`} />
      </g>
      <path d={`M 490 ${B - 830} L 490 ${B - 790} Q 505 ${B - 810} 520 ${B - 790} L 520 ${B - 830} Z`} fill={SQUARE.hill} />
      {/* houses */}
      {HOUSES.map((hs, i) => <HouseShape key={i} hs={hs} base={base} seed={11 + i * 7} />)}
      {/* pavement strip in front of the houses */}
      <rect x={-300} y={base} width={1680} height={B - base} fill={SQUARE.curb} />
      <rect x={-300} y={base} width={1680} height={6} fill={SHADOW} opacity={0.12} />
      {/* cafe umbrellas (right), trees, far fountain */}
      <Umbrella x={980} base={B - 6} s={0.8} col={SQUARE.umbrella} />
      <Umbrella x={1180} base={B - 6} s={0.8} col={SQUARE.shutter} />
      <Umbrella x={1340} base={B - 6} s={0.8} col={SQUARE.umbrella} />
      <Umbrella x={-230} base={B - 6} s={0.7} col={SQUARE.shutter} />
      <Tree x={-40} base={B - 4} s={1.15} />
      <Tree x={340} base={B - 4} s={1.0} />
      <Tree x={790} base={B - 4} s={1.1} />
      {fountain && <FarFountain x={560} base={B - 2} s={0.75} />}
    </CachedSvg>
  );
};

/** Warm honey cobbles in fake perspective (vanishing point ~1500 px above y), from y down. Cached. */
export const Paving: React.FC<{ y: number; h?: number }> = ({ y, h = 700 }) => {
  const vx = 540, vy = y - 1500, yb = y + h;
  const rows: number[] = [];
  for (let j = 0, yy = y; yy < yb + 120; j++) { rows.push(yy); yy = y + 22 * (j + 1) + 2.2 * (j + 1) * (j + 1); }
  const colX = (X: number, yy: number) => vx + (X - vx) * (yy - vy) / (yb - vy);
  const R = rng(97);
  const cols = [SQUARE.stone, SQUARE.stone2, SQUARE.stone3, SQUARE.stone];
  const stones: React.ReactElement[] = [];
  for (let j = 0; j < rows.length - 1; j++) {
    const ya = rows[j], yb2 = rows[j + 1], gap = 2 + (yb2 - ya) * 0.08, sw = 110;
    for (let i = -16; i < 26; i++) {
      const X0 = vx + i * sw - sw / 2 + (j % 2) * sw * 0.5, X1 = X0 + sw;
      const ax = colX(X0, ya) + gap, bx = colX(X1, ya) - gap, cx = colX(X1, yb2) - gap, dx = colX(X0, yb2) + gap;
      if (bx < -420 || ax > 1500) { R(); continue; }
      const t = ya + gap * 0.6, bm = yb2 - gap * 0.6, rr = Math.min(10, (bm - t) * 0.3);
      stones.push(<path key={`${i}-${j}`} d={`M ${r2(ax + rr)} ${r2(t)} L ${r2(bx - rr)} ${r2(t)} Q ${r2(bx)} ${r2(t)} ${r2(bx)} ${r2(t + rr)} L ${r2(cx)} ${r2(bm - rr)} Q ${r2(cx)} ${r2(bm)} ${r2(cx - rr)} ${r2(bm)} L ${r2(dx + rr)} ${r2(bm)} Q ${r2(dx)} ${r2(bm)} ${r2(dx)} ${r2(bm - rr)} L ${r2(ax)} ${r2(t + rr)} Q ${r2(ax)} ${r2(t)} ${r2(ax + rr)} ${r2(t)} Z`}
        fill={cols[Math.floor(R() * cols.length)]} />);
    }
  }
  return (
    <CachedSvg cacheKey={`square-paving-${y}-${h}`} x={-400} y={y} w={1880} h={h}>
      <rect x={-400} y={y} width={1880} height={h} fill={SQUARE.mortar} />
      {stones}
      <rect x={-400} y={y} width={1880} height={12} fill={SQUARE.curb2} />
      <rect x={-400} y={y + 12} width={1880} height={10} fill={SHADOW} opacity={0.1} />
    </CachedSvg>
  );
};

// ---------------------------------------------------------------- props
/** Height of the LampPost at scale 1 (base to finial). The lantern centre is at y - 690*scale. */
export const LAMP_H = 760;
/** Classic lone cast-iron lamp post: stepped plinth, fluted shaft with collars, glowing four-pane lantern.
 *  x = centre, y = ground. wobble = degrees of sway around the base (use bonkWobble after a hit). glow 0..1 lights it. */
export const LampPost: React.FC<{ x: number; y: number; scale?: number; wobble?: number; glow?: number }> = ({ x, y, scale = 1, wobble = 0, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={4} rx={70} ry={13} fill={SHADOW} opacity={0.22} />
    <g transform={`rotate(${wobble} 0 0)`}>
      <path d="M -46 0 L -40 -36 L 40 -36 L 46 0 Z" fill={SQUARE.iron} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -34 -36 L -26 -96 L 26 -96 L 34 -36 Z" fill={SQUARE.iron} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <rect x={-34} y={-110} width={68} height={16} rx={6} fill={SQUARE.iron2} stroke={INK} strokeWidth={7} />
      <path d="M -16 -110 L -11 -600 L 11 -600 L 16 -110 Z" fill={SQUARE.iron} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -3 -120 L -2 -590" stroke={SQUARE.iron2} strokeWidth={5} />
      <rect x={-24} y={-300} width={48} height={14} rx={6} fill={SQUARE.iron2} stroke={INK} strokeWidth={6} />
      <rect x={-22} y={-612} width={44} height={16} rx={6} fill={SQUARE.iron2} stroke={INK} strokeWidth={6} />
      {/* scroll arms under the lantern */}
      <path d="M -12 -560 Q -50 -585 -40 -620 M 12 -560 Q 50 -585 40 -620" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M -12 -560 Q -50 -585 -40 -620 M 12 -560 Q 50 -585 40 -620" stroke={SQUARE.iron} strokeWidth={4} fill="none" strokeLinecap="round" />
      {glow > 0 && <circle cx={0} cy={-690} r={120} fill={SQUARE.glow} opacity={0.35 * glow} />}
      {/* lantern */}
      <path d="M -40 -620 L 40 -620 L 54 -740 L -54 -740 Z" fill={glow > 0 ? SQUARE.glow : SQUARE.glass} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M 0 -620 L 0 -740 M -47 -680 L 47 -680" stroke={INK} strokeWidth={5} />
      <path d="M -26 -632 L -34 -728" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
      <path d="M -66 -740 L 66 -740 L 30 -778 L -30 -778 Z" fill={SQUARE.iron} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <circle cx={0} cy={-790} r={12} fill={SQUARE.iron2} stroke={INK} strokeWidth={6} />
      <rect x={-46} y={-626} width={92} height={12} rx={4} fill={SQUARE.iron2} stroke={INK} strokeWidth={6} />
    </g>
  </g>
);

/** Damped sway for LampPost.wobble after a bonk; t = frames since the hit (< 0 -> 0). */
export const bonkWobble = (t: number, amp = 9) => (t < 0 ? 0 : amp * Math.exp(-t / 14) * Math.sin(t * 0.85));

/** Seat height of the Bench in Person-local units (multiply by scale): same as the cafe chairs, so cafe sitPose/sitY work. */
export const BENCH_SEAT = 100;
/** Classic park bench, front view: wooden slats, cast-iron ends with armrests. x = centre, y = ground, ~420 wide. */
export const Bench: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={4} rx={230} ry={16} fill={SHADOW} opacity={0.2} />
    {/* back legs + backrest */}
    {[-1, 1].map((d) => <path key={"bl" + d} d={`M ${d * 180} -100 L ${d * 186} -300`} stroke={INK} strokeWidth={20} strokeLinecap="round" />)}
    {[-1, 1].map((d) => <path key={"bl2" + d} d={`M ${d * 180} -100 L ${d * 186} -300`} stroke={SQUARE.iron} strokeWidth={10} strokeLinecap="round" />)}
    {[-290, -248, -206].map((sy) => <rect key={sy} x={-208} y={sy} width={416} height={30} rx={8} fill={SQUARE.bench} stroke={INK} strokeWidth={7} />)}
    {[-290, -248, -206].map((sy) => <path key={"g" + sy} d={`M -196 ${sy + 22} L 196 ${sy + 22}`} stroke={SQUARE.bench2} strokeWidth={4} />)}
    {/* seat */}
    <path d="M -214 -120 L 214 -120 L 222 -98 L -222 -98 Z" fill={SQUARE.bench2} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <rect x={-226} y={-104} width={452} height={22} rx={8} fill={SQUARE.bench} stroke={INK} strokeWidth={7} />
    {/* iron ends: front legs with a curl + armrests */}
    {[-1, 1].map((d) => <g key={"e" + d}>
      <path d={`M ${d * 196} -84 L ${d * 206} 0`} stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <path d={`M ${d * 196} -84 L ${d * 206} 0`} stroke={SQUARE.iron} strokeWidth={11} strokeLinecap="round" />
      <path d={`M ${d * 200} -40 q ${d * 26} -6 ${d * 22} 18 q ${-d * 4} 14 ${-d * 16} 6`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={`M ${d * 196} -104 L ${d * 214} -170 L ${d * 234} -170`} stroke={INK} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${d * 196} -104 L ${d * 214} -170 L ${d * 234} -170`} stroke={SQUARE.iron} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>)}
  </g>
);

/** Fountain (front view, animated): round stone basin with rippling water, pillar, upper bowl, jets and falling
 *  drops (f = frame). x = centre, y = ground; ~540 wide and ~400 tall at scale 1. */
export const Fountain: React.FC<{ x: number; y: number; scale?: number; f: number }> = ({ x, y, scale = 1, f }) => {
  const jets = [-1, 1].flatMap((d) => [
    { d: `M 0 -330 Q ${d * 70} -400 ${d * 104} -262`, s: d },
    { d: `M ${d * 108} -258 Q ${d * 180} -250 ${d * 200} -116`, s: d },
  ]);
  const drops = Array.from({ length: 10 }, (_, i) => {
    const t = ((f * 0.035 + i / 10) % 1), d = i % 2 ? 1 : -1, x0 = d * (110 + (i % 3) * 18);
    return { x: x0 + d * t * 70, y: -258 + t * t * 150, o: 1 - t * 0.6 };
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={6} rx={290} ry={30} fill={SHADOW} opacity={0.2} />
      {/* basin back rim, water, ripples */}
      <ellipse cx={0} cy={-110} rx={262} ry={52} fill={SQUARE.fstone2} stroke={INK} strokeWidth={8} />
      <ellipse cx={0} cy={-104} rx={236} ry={40} fill={SQUARE.water} />
      {[0, 1, 2].map((k) => { const t = ((f * 0.02 + k / 3) % 1); return <ellipse key={k} cx={0} cy={-102} rx={60 + t * 170} ry={10 + t * 28} fill="none" stroke={SQUARE.foam} strokeWidth={4} opacity={1 - t} />; })}
      {/* pillar + bowl */}
      <path d="M -26 -100 L -18 -250 L 18 -250 L 26 -100 Z" fill={SQUARE.fstone} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -116 -262 Q -110 -222 0 -218 Q 110 -222 116 -262 Z" fill={SQUARE.fstone} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <ellipse cx={0} cy={-262} rx={116} ry={18} fill={SQUARE.water} stroke={INK} strokeWidth={7} />
      <path d="M -10 -270 L -8 -330 L 8 -330 L 10 -270 Z" fill={SQUARE.fstone} stroke={INK} strokeWidth={6} />
      <circle cx={0} cy={-338} r={12} fill={SQUARE.fstone} stroke={INK} strokeWidth={6} />
      {/* jets: flowing dashes */}
      {jets.map((j, i) => <g key={i}>
        <path d={j.d} stroke={SQUARE.water2} strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d={j.d} stroke={SQUARE.foam} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="18 16" strokeDashoffset={-f * 4} />
      </g>)}
      <path d="M 0 -346 L 0 -380" stroke={SQUARE.water2} strokeWidth={10} strokeLinecap="round" />
      <path d="M 0 -346 L 0 -380" stroke={SQUARE.foam} strokeWidth={4} strokeLinecap="round" strokeDasharray="8 8" strokeDashoffset={-f * 3} />
      {drops.map((p, i) => <circle key={"d" + i} cx={r2(p.x)} cy={r2(p.y)} r={6} fill={SQUARE.foam} stroke={SQUARE.water2} strokeWidth={2} opacity={p.o} />)}
      {/* basin front wall */}
      <path d="M -262 -110 Q 0 -50 262 -110 L 252 -8 Q 0 40 -252 -8 Z" fill={SQUARE.fstone} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -255 -70 Q 0 -14 255 -70" stroke={SQUARE.fstone2} strokeWidth={6} fill="none" />
      {[-180, -90, 0, 90, 180].map((sx) => <path key={sx} d={`M ${sx} ${-60 + Math.abs(sx) * 0.15} L ${sx} ${0 - Math.abs(sx) * 0.03}`} stroke={SQUARE.fstone2} strokeWidth={5} />)}
    </g>
  );
};

/** Pigeon (side view), ~70 wide at scale 1, y = ground (standing) or body centre (flying). Standing: pecks and bobs
 *  with f. flying: wings flap with f (draw a few with different x/f offsets for a scatter). facing 1 = looks right. */
export const Pigeon: React.FC<{ x: number; y: number; scale?: number; f: number; flying?: boolean; facing?: 1 | -1; seed?: number }> = ({ x, y, scale = 1, f, flying = false, facing = 1, seed = 0 }) => {
  if (flying) {
    const flap = Math.sin(f * 0.9 + seed * 1.7), sy = r2(0.25 + 0.75 * flap);   // 1 = wings up, -0.5 = down stroke
    const wing = (back: boolean) => <g transform={`translate(${back ? -4 : 2} -6) scale(1 ${sy})`}>
      <path d="M -18 0 Q -36 -36 -30 -74 Q -20 -62 -12 -66 Q -8 -54 2 -58 Q 4 -46 12 -46 Q 20 -22 14 0 Z"
        fill={back ? SQUARE.pigeon2 : SQUARE.pigeon} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {!back && <path d="M -10 -6 Q -18 -30 -22 -54" stroke={SQUARE.pigeon2} strokeWidth={4} fill="none" strokeLinecap="round" />}
    </g>;
    return (
      <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale}) rotate(-14)`}>
        {wing(true)}
        <path d="M -26 0 L -62 -8 L -60 12 Z" fill={SQUARE.pigeon2} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <ellipse cx={0} cy={0} rx={34} ry={15} fill={SQUARE.pigeon} stroke={INK} strokeWidth={4.5} />
        <circle cx={30} cy={-8} r={12} fill={SQUARE.pigeon} stroke={INK} strokeWidth={4.5} />
        <path d="M 20 -2 Q 28 6 36 0" stroke={SQUARE.neck} strokeWidth={5} fill="none" />
        <path d="M 41 -10 L 51 -6 L 41 -3 Z" fill={SQUARE.beak} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
        <circle cx={33} cy={-11} r={2.6} fill={INK} />
        {wing(false)}
      </g>
    );
  }
  const ph = f * 0.22 + seed * 2.3, peck = Math.max(0, Math.sin(ph)) ** 3, bob = Math.sin(ph * 2) * 3;
  const hx = 26 + peck * 10 + bob, hy = -40 + peck * 26;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
      <ellipse cx={0} cy={2} rx={30} ry={5} fill={SHADOW} opacity={0.2} />
      <path d="M -4 -14 L -8 0 M 6 -14 L 8 0 M -14 0 L -2 0 M 2 0 L 14 0" stroke={SQUARE.feet} strokeWidth={4} strokeLinecap="round" />
      <path d="M -26 -26 L -48 -18 L -44 -10 Z" fill={SQUARE.pigeon2} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${hx - 10} ${hy + 4} L 12 -30`} stroke={INK} strokeWidth={18} strokeLinecap="round" />
      <path d={`M ${hx - 10} ${hy + 4} L 12 -30`} stroke={SQUARE.neck} strokeWidth={10} strokeLinecap="round" />
      <ellipse cx={0} cy={-26} rx={30} ry={18} fill={SQUARE.pigeon} stroke={INK} strokeWidth={4.5} />
      <path d="M -18 -32 Q 0 -20 16 -30" stroke={SQUARE.pigeon2} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={`M ${hx - 6} ${hy + 6} Q ${hx - 14} ${hy + 14} ${hx - 2} ${hy + 14}`} stroke={SQUARE.neck2} strokeWidth={4} fill="none" />
      <circle cx={hx} cy={hy} r={11} fill={SQUARE.pigeon} stroke={INK} strokeWidth={4.5} />
      <path d={`M ${hx + 9} ${hy - 1} L ${hx + 19} ${hy + 3} L ${hx + 9} ${hy + 5} Z`} fill={SQUARE.beak} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx={hx + 3} cy={hy - 3} r={2.6} fill={INK} />
    </g>
  );
};

// ---------------------------------------------------------------- bicycle + rider helpers
/** Kid riders are drawn at this fraction of an adult's scale (a kid bike is shrunk by the same factor). */
export const KID_SCALE = 0.74;
export type BikeProps = { x: number; y: number; scale?: number; facing?: 1 | -1; wheelAngle?: number; lean?: number; size?: "kid" | "adult"; color?: string };

// Bike geometry in "rider units" (the units of a Person drawn at the bike's natural rider scale), forward = +x,
// origin = ground point midway between the wheels. Wheel radius 72, wheelbase 260.
const G = {
  R: 72, rear: { x: -130, y: -72 }, front: { x: 130, y: -72 }, bb: { x: -20, y: -62 }, crank: 24,
  seatTop: { x: -60, y: -138 }, saddle: { x: -64, y: -152 }, headTop: { x: 96, y: -150 }, headBot: { x: 106, y: -110 },
  grip: { x: 66, y: -186 }, hipUp: 28,
};
/** crank angle (deg) for a wheel angle: the cranks turn 1/2.4 as fast as the wheels (gearing). */
const crankOf = (wheelAngle: number) => wheelAngle / 2.4;

type Pt = { x: number; y: number };
const bikeFrame = (b: BikeProps) => {
  const k = (b.scale ?? 1) * (b.size === "kid" ? KID_SCALE : 1), f = b.facing ?? 1, L = rad((b.lean ?? 0) * f);
  /** bike-local forward point -> world */
  const w = (p: Pt): Pt => {
    const lx = p.x * f * k, ly = p.y * k;
    return { x: b.x + lx * Math.cos(L) - ly * Math.sin(L), y: b.y + lx * Math.sin(L) + ly * Math.cos(L) };
  };
  return { k, f, w };
};

/** World positions of the bike's key points (for hands holding the saddle, gaze targets, dust, etc.).
 *  saddleBack = rear edge of the saddle (where Grandpa holds it), grip = handlebar grip, bb = crank axle. */
export const bikePoints = (b: BikeProps) => {
  const { w } = bikeFrame(b);
  return { saddle: w(G.saddle), saddleBack: w({ x: G.saddle.x - 30, y: G.saddle.y + 2 }), grip: w(G.grip), bb: w(G.bb),
    rearHub: w(G.rear), frontHub: w(G.front), front: w({ x: G.front.x + G.R, y: -G.R }), ground: w({ x: 0, y: 0 }) };
};

const Wheel: React.FC<{ c: Pt; angle: number; R: number }> = ({ c, angle, R }) => (
  <g transform={`translate(${c.x} ${c.y})`}>
    <circle r={R} fill="none" stroke={INK} strokeWidth={22} />
    <circle r={R} fill="none" stroke={SQUARE.tyre} strokeWidth={11} />
    <circle r={R - 13} fill="none" stroke={INK} strokeWidth={8} />
    <circle r={R - 13} fill="none" stroke={SQUARE.rim} strokeWidth={4} />
    <g transform={`rotate(${r2(angle)})`}>
      {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI; return <path key={i} d={`M ${r2(Math.cos(a) * (R - 15))} ${r2(Math.sin(a) * (R - 15))} L ${r2(-Math.cos(a) * (R - 15))} ${r2(-Math.sin(a) * (R - 15))}`} stroke={SQUARE.spoke} strokeWidth={3} />; })}
      <rect x={R - 24} y={-5} width={12} height={10} rx={3} fill={SQUARE.sun} stroke={INK} strokeWidth={3} />
    </g>
    <circle r={9} fill={SQUARE.rim} stroke={INK} strokeWidth={4} />
  </g>
);

const Tube: React.FC<{ d: string; col: string; w?: number }> = ({ d, col, w = 12 }) => (
  <g><path d={d} stroke={INK} strokeWidth={w + 9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={col} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
);

/** Side-view bicycle with spinning spokes (wheelAngle, degrees; wheels turn clockwise when riding right) and
 *  cranks turning at 1/2.4 of it. x, y = ground point midway between the wheels; facing 1 = rides right; lean =
 *  degrees of tilt around that ground point (positive pitches the nose down; use small values for wobbles).
 *  size "kid": step-through frame, riser bars, chain guard, bell, shrunk by KID_SCALE. Draw it BEFORE the rider. */
export const Bicycle: React.FC<BikeProps> = (b) => {
  const { k, f } = bikeFrame(b);
  const kid = b.size === "kid", col = b.color ?? (kid ? SQUARE.bikeKid : SQUARE.bikeAdult);
  const wa = b.wheelAngle ?? 0, ca = rad(crankOf(wa)), cr = G.crank;
  const pedal = (s: number): Pt => ({ x: G.bb.x + Math.cos(ca + (s > 0 ? 0 : Math.PI)) * cr, y: G.bb.y + Math.sin(ca + (s > 0 ? 0 : Math.PI)) * cr });
  const pN = pedal(1), pF = pedal(-1);
  const P = (p: Pt) => `${p.x} ${p.y}`;
  const crankArm = (p: Pt) => <g>
    <path d={`M ${P(G.bb)} L ${r2(p.x)} ${r2(p.y)}`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <path d={`M ${P(G.bb)} L ${r2(p.x)} ${r2(p.y)}`} stroke={SQUARE.rim} strokeWidth={6} strokeLinecap="round" />
    <rect x={r2(p.x - 14)} y={r2(p.y - 5)} width={28} height={10} rx={3} fill={SQUARE.saddle} stroke={INK} strokeWidth={4} />
  </g>;
  const topTube = kid ? `M -48 -112 Q 20 -96 104 -118` : `M ${P(G.seatTop)} L ${P(G.headTop)}`;
  return (
    <g transform={`translate(${b.x} ${b.y}) rotate(${(b.lean ?? 0) * f}) scale(${k * f} ${k})`}>
      <ellipse cx={0} cy={4} rx={200} ry={14} fill={SHADOW} opacity={0.22} />
      {crankArm(pF)}
      <Wheel c={G.rear} angle={wa} R={G.R} />
      <Wheel c={G.front} angle={wa} R={G.R} />
      {/* chain + rings */}
      <path d={`M ${G.bb.x} ${G.bb.y - 20} L ${G.rear.x} ${G.rear.y - 10} M ${G.bb.x} ${G.bb.y + 20} L ${G.rear.x} ${G.rear.y + 10}`} stroke={SQUARE.chain} strokeWidth={5} />
      <circle cx={G.rear.x} cy={G.rear.y} r={12} fill={SQUARE.chain} stroke={INK} strokeWidth={4} />
      {/* frame */}
      <Tube d={`M ${P(G.rear)} L ${P(G.bb)}`} col={col} w={9} />
      <Tube d={`M ${P(G.rear)} L ${P(G.seatTop)}`} col={col} w={9} />
      <Tube d={`M ${P(G.bb)} L ${P(G.seatTop)}`} col={col} />
      <Tube d={`M ${P(G.bb)} L ${P(G.headBot)}`} col={col} w={14} />
      <Tube d={topTube} col={col} />
      <Tube d={`M ${P(G.headBot)} Q 120 -96 ${P(G.front)}`} col={col} w={9} />
      <Tube d={`M ${P(G.headBot)} L ${P(G.headTop)}`} col={col} w={16} />
      {/* chainring (kid: chain guard) */}
      {kid ? <path d={`M ${G.bb.x + 4} ${G.bb.y - 22} L ${G.rear.x + 30} ${G.rear.y - 14} Q ${G.rear.x + 18} ${G.rear.y - 4} ${G.rear.x + 30} ${G.rear.y + 4} L ${G.bb.x + 4} ${G.bb.y - 2} Q ${G.bb.x + 18} ${G.bb.y - 12} ${G.bb.x + 4} ${G.bb.y - 22} Z`} fill={SQUARE.chain} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        : <circle cx={G.bb.x} cy={G.bb.y} r={22} fill={SQUARE.rim} stroke={INK} strokeWidth={5} />}
      <circle cx={G.bb.x} cy={G.bb.y} r={7} fill={SQUARE.chain} stroke={INK} strokeWidth={3} />
      {/* fenders (kid) */}
      {kid && <path d={`M ${G.rear.x - 78} ${G.rear.y + 10} A 82 82 0 0 1 ${G.rear.x + 36} ${G.rear.y - 72}`} stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" />}
      {kid && <path d={`M ${G.rear.x - 78} ${G.rear.y + 10} A 82 82 0 0 1 ${G.rear.x + 36} ${G.rear.y - 72}`} stroke={SQUARE.trim} strokeWidth={6} fill="none" strokeLinecap="round" />}
      {/* seat post + saddle */}
      <path d={`M ${P(G.seatTop)} L ${G.saddle.x} ${G.saddle.y + 4}`} stroke={INK} strokeWidth={13} strokeLinecap="round" />
      <path d={`M ${P(G.seatTop)} L ${G.saddle.x} ${G.saddle.y + 4}`} stroke={SQUARE.rim} strokeWidth={5} strokeLinecap="round" />
      <path d={`M ${G.saddle.x - 34} ${G.saddle.y - 2} Q ${G.saddle.x - 34} ${G.saddle.y - 14} ${G.saddle.x - 8} ${G.saddle.y - 12} L ${G.saddle.x + 34} ${G.saddle.y - 6} Q ${G.saddle.x + 36} ${G.saddle.y + 2} ${G.saddle.x + 22} ${G.saddle.y + 2} L ${G.saddle.x - 26} ${G.saddle.y + 6} Q ${G.saddle.x - 36} ${G.saddle.y + 6} ${G.saddle.x - 34} ${G.saddle.y - 2} Z`}
        fill={SQUARE.saddle} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* stem + handlebar */}
      <path d={`M ${P(G.headTop)} L ${G.headTop.x - 2} ${G.grip.y + 6} L ${G.grip.x} ${G.grip.y}`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${P(G.headTop)} L ${G.headTop.x - 2} ${G.grip.y + 6} L ${G.grip.x} ${G.grip.y}`} stroke={kid ? col : SQUARE.rim} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${G.grip.x - 6} ${G.grip.y + 1} L ${G.grip.x + 14} ${G.grip.y - 2}`} stroke={INK} strokeWidth={16} strokeLinecap="round" />
      <path d={`M ${G.grip.x - 6} ${G.grip.y + 1} L ${G.grip.x + 14} ${G.grip.y - 2}`} stroke={kid ? "#e85a8a" : SQUARE.saddle} strokeWidth={8} strokeLinecap="round" />
      {kid && <g><path d={`M ${G.grip.x - 4} ${G.grip.y + 2} q -16 10 -30 6 M ${G.grip.x - 4} ${G.grip.y + 2} q -12 16 -26 18`} stroke="#ffd93b" strokeWidth={5} fill="none" strokeLinecap="round" />
        <circle cx={G.headTop.x + 4} cy={G.grip.y + 14} r={8} fill={SQUARE.sun} stroke={INK} strokeWidth={4} /></g>}
      {crankArm(pN)}
    </g>
  );
};

/** limb lengths + root positions of the Person rig (see characters25/person.tsx) */
const RIG = { thigh: 82, shin: 78, upper: 70, fore: 64 };
type Limb = "armL" | "armR" | "legL" | "legR";
const limbRoot = (pose: Pose, limb: Limb): Pt => {
  const crouch = (pose.crouch ?? 0) * 140, hipY = -150 + crouch, shY = -285 + crouch * 0.9, hipX = pose.profile ? 10 : 22;
  return { armL: { x: -42, y: shY + 14 }, armR: { x: 42, y: shY + 14 }, legL: { x: -hipX, y: hipY }, legR: { x: hipX, y: hipY } }[limb];
};
const limbDir = (pose: Pose, limb: Limb, facing: number) => (pose.profile ? facing : limb.endsWith("L") ? -1 : 1);
const norm180 = (a: number) => ((a + 540) % 360) - 180;

/** Core IK in the Person's rotated (body) frame: returns [upper, lower] angles so the limb end reaches `q`.
 *  bend 1 = the joint bulges to the limb's positive-angle side (profile: forward = knees; front view: outward),
 *  bend -1 = the other side (profile arms: elbows down/back). Unreachable targets get a straight limb. */
const solveLimb = (pose: Pose, limb: Limb, q: Pt, facing: number, bend: 1 | -1): [number, number] => {
  const root = limbRoot(pose, limb), d = limbDir(pose, limb, facing);
  const [l1, l2] = limb.startsWith("arm") ? [RIG.upper, RIG.fore] : [RIG.thigh, RIG.shin];
  const ux = (q.x - root.x) * d, uy = q.y - root.y;
  const D = Math.max(Math.abs(l1 - l2) + 1, Math.min(l1 + l2 - 0.5, Math.hypot(ux, uy)));
  const phi = deg(Math.atan2(ux, uy));
  const alpha = deg(Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + D * D - l2 * l2) / (2 * l1 * D)))));
  const a = phi + bend * alpha;
  const kx = Math.sin(rad(a)) * l1, ky = Math.cos(rad(a)) * l1;
  const ex = Math.sin(rad(phi)) * D, ey = Math.cos(rad(phi)) * D;
  const c = deg(Math.atan2(ex - kx, ey - ky));
  return [r2(norm180(a)), r2(norm180(c - a))];
};
/** world point -> the Person's body frame (undo translate, scale and the lean+rot rotation about the hip) */
const toBody = (p: { x: number; y: number; scale?: number; facing?: 1 | -1; pose: Pose; rot?: number }, T: Pt): Pt => {
  const s = p.scale ?? 1, f = p.facing ?? 1, hipY = -150 + (p.pose.crouch ?? 0) * 140;
  const qx = (T.x - p.x) / s, qy = (T.y - p.y) / s - hipY, A = -rad((p.pose.lean ?? 0) * f + (p.rot ?? 0));
  return { x: qx * Math.cos(A) - qy * Math.sin(A), y: qx * Math.sin(A) + qy * Math.cos(A) + hipY };
};

/** Returns the Person's pose with one limb bent so its hand/foot reaches the world point `target` (e.g. Grandpa's
 *  near arm on bikePoints(bike).saddleBack while he jogs with runPose). Pass the SAME x, y, scale, facing, pose, rot
 *  as the Person. In profile the near arm is armR when facing 1 (armL when facing -1). bend: 1 = joint forward /
 *  outward, -1 = elbow down-back (arms). stoop: if the target is out of reach, lean the body forward (up to 60 deg)
 *  until it is (a tall Grandpa bending down to a kid's saddle); the returned pose carries the new lean. */
export const reachLimb = (p: { x: number; y: number; scale?: number; facing?: 1 | -1; pose: Pose; rot?: number }, limb: Limb, target: Pt, bend: 1 | -1 = -1, stoop = false): Pose => {
  let pose = p.pose;
  if (stoop) {
    const [l1, l2] = limb.startsWith("arm") ? [RIG.upper, RIG.fore] : [RIG.thigh, RIG.shin];
    for (let L = p.pose.lean ?? 0; L <= 60; L += 1) {
      const cand = { ...p.pose, lean: L }, q = toBody({ ...p, pose: cand }, target), r = limbRoot(cand, limb);
      pose = cand;
      if (Math.hypot(q.x - r.x, q.y - r.y) <= (l1 + l2) * 0.94) break;
    }
  }
  return { ...pose, [limb]: solveLimb(pose, limb, toBody({ ...p, pose }, target), p.facing ?? 1, bend) };
};

/** Front-view facepalm pose: the arm folds up so the hand sits under the chin (the rig draws the head over the hands,
 *  so add <FacepalmHand/> after the Person for the palm over the eyes). Pass the base pose (front view). */
export const facepalmPose = (base: Pose = { armL: [12, -6], armR: [12, -6], legL: [6, 0], legR: [6, 0] }, hand: "armL" | "armR" = "armR"): Pose => {
  const p: Pose = { ...base, headTilt: 10, profile: false };
  const shY = -285 + (p.crouch ?? 0) * 140 * 0.9;
  return { ...p, [hand]: solveLimb(p, hand, { x: hand === "armR" ? 26 : -26, y: shY + 2 }, 1, -1) };
};

export type RideOpts = { riderScale?: number; lean?: number; crouch?: number; lookX?: number };
export type Ride = { personX: number; personY: number; pose: Pose;
  /** spread into <Person {...ride.rider} look=... expr=.../> (and into Helmet / FlatCap / Beard) */
  rider: { x: number; y: number; scale: number; facing: 1 | -1; pose: Pose; rot: number; shadow: number } };

/** Puts a Person on a Bicycle: hips on the saddle, both hands on the grip, feet on the pedals (they follow the
 *  cranks as wheelAngle turns). Same props as the Bicycle. riderScale defaults to the bike's natural rider (kid bike
 *  -> scale*KID_SCALE); pass a bigger one for Grandpa on Mila's bike (knees come up, arms bend). lean (torso, deg)
 *  is chosen automatically so the near arm is comfortably bent; override for drama. Draw: Bicycle -> Person -> Helmet.
 *  The far arm comes from the back of the rig's torso, so its hand lands on the near forearm when the grip is out of
 *  reach (hidden behind it, reads as both hands on the bar in side view). */
export const rideOn = (b: BikeProps, o: RideOpts = {}): Ride => {
  const { k, f, w } = bikeFrame(b);
  const rs = o.riderScale ?? k, kk = rs / k;                      // rider units per bike unit
  const crouch = o.crouch ?? 0;
  const hipY = -150 + crouch * 140;
  const hipB: Pt = { x: G.saddle.x + 4, y: G.saddle.y - G.hipUp * kk };                    // hip, bike units
  const toLocal = (p: Pt, lean: number): Pt => {                                            // bike pt -> body frame (forward)
    const qx = (p.x - hipB.x) / kk, qy = (p.y - hipB.y) / kk, A = -rad(lean);
    return { x: qx * Math.cos(A) - qy * Math.sin(A), y: qx * Math.sin(A) + qy * Math.cos(A) + hipY };
  };
  const base: Pose = { armL: [0, 0], armR: [0, 0], legL: [0, 0], legR: [0, 0], crouch, profile: true, lookX: f * 0.8 };
  let lean = o.lean ?? 0;
  if (o.lean === undefined) {
    let best = 1e9;
    for (let L = 0; L <= 40; L += 1) {
      const q = toLocal(G.grip, L), r = limbRoot(base, "armR"), dd = Math.hypot(q.x - r.x, q.y - r.y) / (RIG.upper + RIG.fore);
      const err = Math.abs(dd - 0.8) + Math.abs(L - 16) * 0.004;
      if (err < best) { best = err; lean = L; }
    }
  }
  const pose: Pose = { ...base, lean, lookX: o.lookX ?? f * 0.8 };
  const ca = rad(crankOf(b.wheelAngle ?? 0));
  const pedal = (s: number): Pt => ({ x: G.bb.x + Math.cos(ca + (s > 0 ? 0 : Math.PI)) * G.crank, y: G.bb.y + Math.sin(ca + (s > 0 ? 0 : Math.PI)) * G.crank - 6 });
  // forward frame: near limbs are the +x (R) ones; Person swaps sides itself when facing -1
  const near = (l: "arm" | "leg") => (f > 0 ? `${l}R` : `${l}L`) as Limb, far = (l: "arm" | "leg") => (f > 0 ? `${l}L` : `${l}R`) as Limb;
  const fwd = { ...pose, profile: true };
  const nearArm = solveLimb(fwd, "armR", toLocal(G.grip, lean), 1, -1);
  // far arm: aim at the grip; if out of reach, slide the target back along the near forearm until reachable
  const rN = limbRoot(fwd, "armR"), rF = limbRoot(fwd, "armL");
  const elb: Pt = { x: rN.x + Math.sin(rad(nearArm[0])) * RIG.upper, y: rN.y + Math.cos(rad(nearArm[0])) * RIG.upper };
  const hand = toLocal(G.grip, lean);
  let tgt = hand;
  for (let t = 0; t <= 1; t += 0.05) {
    const c = { x: hand.x + (elb.x - hand.x) * t, y: hand.y + (elb.y - hand.y) * t };
    tgt = c;
    if (Math.hypot(c.x - rF.x, c.y - rF.y) < RIG.upper + RIG.fore - 3) break;
  }
  const farArm = solveLimb(fwd, "armL", tgt, 1, -1);
  const nearLeg = solveLimb(fwd, "legR", toLocal(pedal(1), lean), 1, 1);
  const farLeg = solveLimb(fwd, "legL", toLocal(pedal(-1), lean), 1, 1);
  const out: Pose = { ...pose, [near("arm")]: nearArm, [far("arm")]: farArm, [near("leg")]: nearLeg, [far("leg")]: farLeg };
  const hipW = w(hipB);
  const rot = (b.lean ?? 0) * f;
  // Person origin (feet) so that its hip (0, hipY) lands on hipW after its own rotation (rot is about the hip: no shift)
  const personX = r2(hipW.x), personY = r2(hipW.y - hipY * rs);
  return { personX, personY, pose: out, rider: { x: personX, y: personY, scale: rs, facing: f, pose: out, rot, shadow: 0 } };
};

// ---------------------------------------------------------------- wardrobe (PersonPart, same props as the Person)
type Wear = { x: number; y: number; scale?: number; facing?: 1 | -1; pose?: Pose; rot?: number };
/** Kid's bike helmet: an elongated vented shell with a small visor on the facing side. hair (e.g. CAST.mila.hair)
 *  draws curls poking out under the rim so the kid keeps her hair; omit for none. Hides the hair top. */
export const Helmet: React.FC<Wear & { color?: string; hair?: string }> = ({ color = SQUARE.helmet, hair, ...p }) => {
  const f = p.facing ?? 1;
  return (
    <PersonPart {...p} part="head">
      {hair && [-1, 1].map((d) => <g key={d}>
        {[[62, -66, 15], [66, -46, 13], [d === -f ? 70 : 60, d === -f ? -28 : -30, d === -f ? 13 : 0]].filter((c) => c[2] > 0).map(([cx, cy, r], i) =>
          <circle key={i} cx={d * cx} cy={cy} r={r} fill={hair} stroke={INK} strokeWidth={4} />)}
      </g>)}
      <path d={`M ${-f * 74} -62 C ${-f * 80} -118 ${-f * 30} -150 ${f * 14} -146 C ${f * 56} -142 ${f * 78} -110 ${f * 72} -70 Q ${f * 40} -80 0 -78 Q ${-f * 40} -76 ${-f * 74} -62 Z`}
        fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {[[-34, -128, -50, -92], [2, -138, -4, -100], [38, -126, 42, -96]].map(([a, b, c, d], i) =>
        <path key={i} d={`M ${f * a} ${b} L ${f * c} ${d}`} stroke={INK} strokeWidth={13} strokeLinecap="round" />)}
      {[[-34, -128, -50, -92], [2, -138, -4, -100], [38, -126, 42, -96]].map(([a, b, c, d], i) =>
        <path key={"v" + i} d={`M ${f * a} ${b} L ${f * c} ${d}`} stroke={SQUARE.helmet2} strokeWidth={5} strokeLinecap="round" />)}
      <path d={`M ${f * 40} -79 Q ${f * 76} -86 ${f * 88} -70 L ${f * 70} -66 Z`} fill={SQUARE.helmet2} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </PersonPart>
  );
};
/** Grandpa's flat cap (tweed, brim toward facing). Use with hairStyle "short" or "none"; grey hair shows at the sides. */
export const FlatCap: React.FC<Wear & { color?: string }> = ({ color = SQUARE.cap, ...p }) => {
  const f = p.facing ?? 1;
  return (
    <PersonPart {...p} part="head">
      <path d={`M ${-f * 64} -74 C ${-f * 70} -128 ${f * 40} -134 ${f * 66} -86 L ${f * 92} -76 Q ${f * 70} -64 ${f * 30} -70 Q ${-f * 20} -76 ${-f * 64} -74 Z`}
        fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${-f * 40} -102 Q 0 -122 ${f * 52} -98`} stroke={SQUARE.cap2} strokeWidth={5} fill="none" />
      <path d={`M ${f * 30} -71 Q ${f * 62} -70 ${f * 86} -77`} stroke={SQUARE.cap2} strokeWidth={4} fill="none" />
      <circle cx={-f * 6} cy={-118} r={5} fill={SQUARE.cap2} stroke={INK} strokeWidth={3} />
    </PersonPart>
  );
};
/** Grandpa's white beard + bushy moustache: one white mass that hides the rig mouth. Pass the Person's expr so an
 *  open mouth (laugh / cheer / shock) is drawn over it; moustache false shows the rig mouth above a chin beard. */
export const Beard: React.FC<Wear & { color?: string; moustache?: boolean; expr?: string }> = ({ color = SQUARE.beard, moustache = true, expr, ...p }) => (
  <PersonPart {...p} part="head">
    <path d={moustache ? "M -55 -46 Q -60 -8 -30 10 Q 0 28 30 10 Q 60 -8 55 -46 Q 46 -34 30 -32 Q 0 -30 -30 -32 Q -46 -34 -55 -46 Z"
      : "M -55 -46 Q -60 -8 -30 10 Q 0 28 30 10 Q 60 -8 55 -46 Q 44 -22 20 -18 Q 0 -14 -20 -18 Q -44 -22 -55 -46 Z"} fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -22 2 Q 0 10 22 2 M -40 -12 Q -34 -2 -24 0 M 40 -12 Q 34 -2 24 0" stroke={SQUARE.fstone2} strokeWidth={4} fill="none" strokeLinecap="round" />
    {moustache && <path d="M 0 -42 Q -14 -50 -28 -44 Q -42 -38 -44 -22 Q -32 -30 -18 -26 Q -6 -24 0 -30 Q 6 -24 18 -26 Q 32 -30 44 -22 Q 42 -38 28 -44 Q 14 -50 0 -42 Z"
      fill={color} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />}
    {moustache && (expr === "laugh" || expr === "cheer" || expr === "shock") &&
      <ellipse cx={0} cy={-12} rx={expr === "shock" ? 9 : 15} ry={expr === "shock" ? 11 : 9} fill="#5a1626" stroke={INK} strokeWidth={4} />}
  </PersonPart>
);

/** Facepalm overlay: a forearm + open palm over the eyes, drawn AFTER the Person (and Beard/FlatCap) with the same
 *  props; give the Person facepalmPose() so the rig arm folds up under the chin. side = which hand (screen side). */
export const FacepalmHand: React.FC<Wear & { skin: string; side?: 1 | -1 }> = ({ skin, side = 1, ...p }) => (
  <PersonPart {...p} part="head">
    <path d={`M ${side * 30} 34 Q ${side * 22} -10 ${side * 12} -40`} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
    <path d={`M ${side * 30} 34 Q ${side * 22} -10 ${side * 12} -40`} stroke={skin} strokeWidth={13} fill="none" strokeLinecap="round" />
    <path d={`M ${side * 26} -34 Q ${side * 40} -50 ${side * 34} -70 Q ${side * 10} -86 ${-side * 26} -74 Q ${-side * 36} -64 ${-side * 24} -54 Q ${-side * 6} -40 ${side * 26} -34 Z`}
      fill={skin} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d={`M ${-side * 22} -62 L ${side * 16} -58 M ${-side * 18} -70 L ${side * 20} -66`} stroke={INK} strokeWidth={3} opacity={0.5} strokeLinecap="round" />
  </PersonPart>
);

// ---------------------------------------------------------------- explain / lab props
/** Dotted gaze line from an eye (x1, y1) to a target (x2, y2), growing with progress 0..1; a target ring appears at 1. */
export const GazeLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; progress?: number; color?: string; gap?: number }> = ({ x1, y1, x2, y2, progress = 1, color = LAB.gold, gap = 30 }) => {
  const L = Math.hypot(x2 - x1, y2 - y1), n = Math.floor(L / gap), shown = Math.floor(n * Math.max(0, Math.min(1, progress)));
  return (
    <g>
      {Array.from({ length: shown }, (_, i) => { const t = (i + 0.5) / n; return <circle key={i} cx={r2(x1 + (x2 - x1) * t)} cy={r2(y1 + (y2 - y1) * t)} r={8} fill={color} stroke={INK} strokeWidth={4} />; })}
      {progress >= 1 && <g><circle cx={x2} cy={y2} r={34} fill="none" stroke={INK} strokeWidth={13} /><circle cx={x2} cy={y2} r={34} fill="none" stroke={color} strokeWidth={6} /></g>}
    </g>
  );
};

/** A big cartoon eye for an extreme close-up: almond white, iris + pupil + catch-lights, lid, lashes, brow. ~600*s
 *  wide. lookX / lookY in -1..1. lid 0 (open) .. 1 (closed); pupil = pupil size factor (0.6 = locked-on narrow);
 *  brow -1 (worried) .. 1 (determined); reflection "pole" draws a tiny lamp post in the iris. facing flips the shape. */
export const EyeCloseUp: React.FC<{ x: number; y: number; s: number; lookX: number; lookY: number; lid?: number; pupil?: number;
  brow?: number; iris?: string; skin?: string; facing?: 1 | -1; reflection?: "pole" }> =
  ({ x, y, s, lookX, lookY, lid = 0.18, pupil = 1, brow = 0, iris = "#6b4a2e", skin = "#f2c39b", facing = 1, reflection }) => {
    const id = `eye-${Math.round(x)}-${Math.round(y)}-${Math.round(s * 100)}`;
    const almond = "M -300 20 C -220 -190 220 -200 300 0 C 220 170 -220 180 -300 20 Z";
    const ix = lookX * 120, iy = lookY * 70, top = -200 + lid * 360;
    return (
      <g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`}>
        <defs><clipPath id={id}><path d={almond} /></clipPath></defs>
        <path d={almond} fill="#fffaf2" />
        <g clipPath={`url(#${id})`}>
          <circle cx={ix} cy={iy} r={130} fill={iris} stroke={INK} strokeWidth={10} />
          <circle cx={ix} cy={iy} r={100} fill="none" stroke="#000" strokeOpacity={0.15} strokeWidth={22} />
          <circle cx={ix} cy={iy} r={62 * pupil} fill={INK} />
          {reflection === "pole" && <g transform={`translate(${ix + 50} ${iy + 44}) scale(0.15)`} opacity={0.85}>
            <path d="M -14 0 L -10 -600 L 10 -600 L 14 0 Z M -44 -620 L 44 -620 L 56 -740 L -56 -740 Z" fill="#fffaf2" /></g>}
          <circle cx={ix - 46} cy={iy - 50} r={30} fill="#fff" />
          <circle cx={ix + 40} cy={iy + 40} r={13} fill="#fff" />
          <path d={`M -320 -260 L 320 -260 L 320 ${top} Q 0 ${top + 70} -320 ${top} Z`} fill={skin} />
          <path d={`M -320 ${top} Q 0 ${top + 70} 320 ${top}`} stroke={INK} strokeWidth={14} fill="none" />
        </g>
        <path d={almond} fill="none" stroke={INK} strokeWidth={20} strokeLinejoin="round" />
        {[[-150, -150, -180, -210], [0, -175, 0, -240], [150, -150, 180, -210], [240, -96, 290, -140]].map(([a, b, c, d], i) =>
          <path key={i} d={`M ${a} ${b + lid * 150} L ${c} ${d + lid * 150}`} stroke={INK} strokeWidth={16} strokeLinecap="round" />)}
        <path d={`M -250 ${-250 - brow * 20} Q 0 ${-320 + brow * 20} 250 ${-262 + brow * 46}`} stroke={INK} strokeWidth={44} fill="none" strokeLinecap="round" />
      </g>
    );
  };

/** "Pulled like a magnet": chevrons flowing from (x, y) toward (toX, toY) along a faint dashed track (f animates). */
export const PullArrows: React.FC<{ x: number; y: number; toX: number; toY: number; f?: number; color?: string; count?: number }> = ({ x, y, toX, toY, f = 0, color = LAB.orange, count = 4 }) => {
  const a = deg(Math.atan2(toY - y, toX - x)), L = Math.hypot(toX - x, toY - y);
  return (
    <g transform={`translate(${x} ${y}) rotate(${r2(a)})`}>
      <path d={`M 0 0 L ${r2(L)} 0`} stroke={color} strokeWidth={6} strokeDasharray="4 20" strokeLinecap="round" opacity={0.6} />
      {Array.from({ length: count }, (_, i) => {
        const t = ((i / count + f * 0.02) % 1), px = t * L, o = Math.sin(t * Math.PI);
        return <g key={i} transform={`translate(${r2(px)} 0)`} opacity={r2(o)}>
          <path d="M -22 -34 L 12 0 L -22 34" stroke={INK} strokeWidth={24} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M -22 -34 L 12 0 L -22 34" stroke={color} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>;
      })}
    </g>
  );
};

/** Steering wheel (front view): rim, three spokes, hub, gold top marker. angle in degrees (positive = right turn). */
export const SteeringWheel: React.FC<{ x: number; y: number; r: number; angle: number; color?: string }> = ({ x, y, r, angle, color = LAB.muted }) => (
  <g transform={`translate(${x} ${y}) rotate(${r2(angle)})`}>
    <circle r={r} fill="none" stroke={INK} strokeWidth={r * 0.2 + 12} />
    <circle r={r} fill="none" stroke={color} strokeWidth={r * 0.2} />
    {[0, 90, 180].map((a) => { const c = Math.cos(rad(a)), s = Math.sin(rad(a)); return <g key={a}>
      <path d={`M 0 0 L ${r2(c * r)} ${r2(s * r)}`} stroke={INK} strokeWidth={r * 0.12 + 10} strokeLinecap="round" />
      <path d={`M 0 0 L ${r2(c * r)} ${r2(s * r)}`} stroke={color} strokeWidth={r * 0.12} strokeLinecap="round" /></g>; })}
    <circle r={r * 0.24} fill={color} stroke={INK} strokeWidth={6} />
    <circle r={r * 0.1} fill={LAB.gold} />
    <rect x={-r * 0.08} y={-r - r * 0.12} width={r * 0.16} height={r * 0.24} rx={4} fill={LAB.gold} stroke={INK} strokeWidth={4} />
  </g>
);

/** Top-view road for lab shots: starts at (x, y) heading up, length h, width w; curve = sideways offset of the far
 *  end (positive bends right). Asphalt with cream edges and a gold dashed centre. Use topRoadPoint to place things. */
export type TopRoadProps = { x: number; y: number; w: number; h: number; curve: number };
const roadPts = ({ x, y, h, curve }: TopRoadProps): [Pt, Pt, Pt, Pt] => [{ x, y }, { x, y: y - h * 0.55 }, { x: x + curve * 0.25, y: y - h }, { x: x + curve, y: y - h }];
/** Point on the TopRoad centre line at t 0..1 (+ lateral offset `side` px, positive = right of travel) and the
 *  heading angle in degrees (0 = up, positive = turning right). */
export const topRoadPoint = (p: TopRoadProps, t: number, side = 0) => {
  const [a, b, c, d] = roadPts(p), u = 1 - t;
  const x = u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x;
  const y = u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y;
  const dx = 3 * u * u * (b.x - a.x) + 6 * u * t * (c.x - b.x) + 3 * t * t * (d.x - c.x);
  const dy = 3 * u * u * (b.y - a.y) + 6 * u * t * (c.y - b.y) + 3 * t * t * (d.y - c.y);
  const n = Math.hypot(dx, dy) || 1;
  return { x: x - (dy / n) * side, y: y + (dx / n) * side, angle: deg(Math.atan2(dx, -dy)) };
};
export const TopRoad: React.FC<TopRoadProps & { color?: string }> = ({ color = "#3a4266", ...p }) => {
  const [a, b, c, d] = roadPts(p), D = `M ${a.x} ${a.y} C ${b.x} ${b.y} ${c.x} ${c.y} ${d.x} ${d.y}`;
  return (
    <g>
      <path d={D} stroke={INK} strokeWidth={p.w + 18} fill="none" />
      <path d={D} stroke={color} strokeWidth={p.w} fill="none" />
      <path d={D} stroke={LAB.text} strokeWidth={p.w - 24} fill="none" />
      <path d={D} stroke={color} strokeWidth={p.w - 36} fill="none" />
      <path d={D} stroke={LAB.gold} strokeWidth={8} fill="none" strokeDasharray="36 30" />
    </g>
  );
};

/** Driver's-eye perspective road bending (curve > 0: right) toward a horizon at horizonY, for the tangent-point
 *  shot. Use perspectiveTangent(props) for the inner-edge apex (the tangent point). Lab colours. */
export type PerspRoadProps = { horizonY: number; curve: number; bottomY?: number; w?: number };
const persp = ({ horizonY, curve, bottomY = 1920, w = 1300 }: PerspRoadProps) => {
  // screen-space: t = 0 (at the driver) .. 1 (horizon); width shrinks with depth z, the centre swings by curve * t^2.4
  const edge = (side: -1 | 1) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30, z = 1 / (1 + t * 12), yy = horizonY + (bottomY - horizonY) * (z - 1 / 13) / (1 - 1 / 13);
      pts.push({ x: 540 + curve * Math.pow(t, 2.4) + side * (w / 2) * z, y: yy });
    }
    return pts;
  };
  return { L: edge(-1), R: edge(1) };
};
export const perspectiveTangent = (p: PerspRoadProps): Pt => {
  const { L, R } = persp(p), e = p.curve >= 0 ? R : L;
  let best = e[0];
  for (const q of e.slice(0, -2)) if (p.curve >= 0 ? q.x < best.x : q.x > best.x) best = q;
  return { x: r2(best.x), y: r2(best.y) };
};
export const PerspectiveRoad: React.FC<PerspRoadProps & { color?: string }> = ({ color = "#3a4266", ...p }) => {
  const { L, R } = persp(p), line = (pts: Pt[]) => pts.map((q, i) => `${i ? "L" : "M"} ${r2(q.x)} ${r2(q.y)}`).join(" ");
  const mid = L.map((q, i) => ({ x: (q.x + R[i].x) / 2, y: q.y }));
  return (
    <g>
      <path d={`${line(L)} ${line([...R].reverse()).replace("M", "L")} Z`} fill={color} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      <path d={line(L)} stroke={LAB.text} strokeWidth={10} fill="none" />
      <path d={line(R)} stroke={LAB.text} strokeWidth={10} fill="none" />
      <path d={line(mid)} stroke={LAB.gold} strokeWidth={8} fill="none" strokeDasharray="40 36" />
    </g>
  );
};

/** Tangent point marker: crosshair + pulsing ring (f animates) on a gold dot. */
export const TangentPoint: React.FC<{ x: number; y: number; f?: number; color?: string; r?: number }> = ({ x, y, f = 0, color = LAB.gold, r = 22 }) => {
  const t = (f * 0.03) % 1;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * (1.4 + t * 1.6)} fill="none" stroke={color} strokeWidth={5} opacity={r2(1 - t)} />
      <path d={`M ${-r * 2.2} 0 L ${-r * 1.2} 0 M ${r * 1.2} 0 L ${r * 2.2} 0 M 0 ${-r * 2.2} L 0 ${-r * 1.2} M 0 ${r * 1.2} L 0 ${r * 2.2}`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d={`M ${-r * 2.2} 0 L ${-r * 1.2} 0 M ${r * 1.2} 0 L ${r * 2.2} 0 M 0 ${-r * 2.2} L 0 ${-r * 1.2} M 0 ${r * 1.2} L 0 ${r * 2.2}`} stroke={color} strokeWidth={6} strokeLinecap="round" />
      <circle r={r} fill={color} stroke={INK} strokeWidth={6} />
      <circle r={r * 0.35} fill={INK} />
    </g>
  );
};

/** Gaze cone (top view or side view) from an eye at (x, y) pointing at `angle` degrees (0 = up, positive = right). */
export const GazeCone: React.FC<{ x: number; y: number; angle: number; len?: number; spread?: number; color?: string; opacity?: number }> = ({ x, y, angle, len = 420, spread = 22, color = LAB.gold, opacity = 0.35 }) => {
  const a1 = rad(angle - spread), a2 = rad(angle + spread);
  const P = (a: number) => `${r2(Math.sin(a) * len)} ${r2(-Math.cos(a) * len)}`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M 0 0 L ${P(a1)} A ${len} ${len} 0 0 1 ${P(a2)} Z`} fill={color} opacity={opacity} />
      <path d={`M ${P(a1)} L 0 0 L ${P(a2)}`} stroke={color} strokeWidth={5} fill="none" strokeDasharray="14 12" />
    </g>
  );
};

/** Smooth line through points (Catmull-Rom), ink-outlined; dashed option, draw-on with progress 0..1, arrowhead.
 *  Use green LAB.green for the safe line, LAB.red for the crash line. */
export const PathLine: React.FC<{ points: Pt[]; color: string; dashed?: boolean; progress?: number; width?: number; arrow?: boolean }> = ({ points, color, dashed = false, progress = 1, width = 12, arrow = true }) => {
  if (points.length < 2) return null;
  const S: Pt[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    for (let j = 0; j < 16; j++) {
      const t = j / 16, t2 = t * t, t3 = t2 * t;
      const c = (a: number, b: number, cc: number, d: number) => 0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
      S.push({ x: c(p0.x, p1.x, p2.x, p3.x), y: c(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  S.push(points[points.length - 1]);
  let total = 0; for (let i = 1; i < S.length; i++) total += Math.hypot(S[i].x - S[i - 1].x, S[i].y - S[i - 1].y);
  const want = total * Math.max(0, Math.min(1, progress)), out: Pt[] = [S[0]];
  for (let i = 1, acc = 0; i < S.length; i++) {
    const seg = Math.hypot(S[i].x - S[i - 1].x, S[i].y - S[i - 1].y);
    if (acc + seg >= want) { const k = seg ? (want - acc) / seg : 0; out.push({ x: S[i - 1].x + (S[i].x - S[i - 1].x) * k, y: S[i - 1].y + (S[i].y - S[i - 1].y) * k }); break; }
    acc += seg; out.push(S[i]);
  }
  if (out.length < 2 || want <= 0) return null;
  const d = out.map((q, i) => `${i ? "L" : "M"} ${r2(q.x)} ${r2(q.y)}`).join(" ");
  const e = out[out.length - 1], pe = out[Math.max(0, out.length - 3)], ang = deg(Math.atan2(e.y - pe.y, e.x - pe.x));
  const dash = dashed ? `${width * 2.2} ${width * 1.8}` : undefined;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={width + 10} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? `${width * 2.2 + 10} ${width * 1.8 - 10}` : undefined} strokeDashoffset={dashed ? 5 : undefined} />
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
      {arrow && <g transform={`translate(${r2(e.x)} ${r2(e.y)}) rotate(${r2(ang)})`}>
        <path d={`M ${-width * 2.6} ${-width * 2} L ${width * 0.8} 0 L ${-width * 2.6} ${width * 2} Z`} fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      </g>}
    </g>
  );
};

/** Cartoon impact stars circling a bump (no text): f = frames since the bonk; fades out after ~60 frames. */
export const BonkStars: React.FC<{ x: number; y: number; f: number; r?: number; color?: string }> = ({ x, y, f, r = 70, color = LAB.gold }) => {
  if (f < 0 || f > 60) return null;
  const o = f < 45 ? 1 : 1 - (f - 45) / 15;
  return (
    <g transform={`translate(${x} ${y})`} opacity={r2(o)}>
      {Array.from({ length: 4 }, (_, i) => {
        const a = f * 0.18 + (i / 4) * Math.PI * 2, px = Math.cos(a) * r, py = Math.sin(a) * r * 0.35;
        const star = Array.from({ length: 10 }, (_, j) => { const rr = j % 2 ? 9 : 22, aa = (j / 10) * Math.PI * 2 - Math.PI / 2; return `${j ? "L" : "M"} ${r2(Math.cos(aa) * rr)} ${r2(Math.sin(aa) * rr)}`; }).join(" ") + " Z";
        return <path key={i} transform={`translate(${r2(px)} ${r2(py)}) rotate(${r2(f * 6)})`} d={star} fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
      })}
    </g>
  );
};
