// Library (2.5D): a school charity auction in the gym hall, early evening (episode "winner"): warm painted block wall,
// high windows with a dusk sky, honey-wood climbing bars, a blue wall-pad strip, basketball hoop, ceiling trusses with
// warm lamps, a small stage with red velvet curtains, a blank cloth banner and bunting; varnished wooden court floor
// with painted lines. Props: metal folding chair (+ front-view lap), rows of seated parents (from behind or from the
// front, cached; bidders raise numbered paddles live), lectern podium, gavel + sound block + bang helper, bidding
// paddle, big glass coin jar, coin pile / coin stack, paper-clothed folding table (+ standing-behind and hands-on-top
// helpers), SOLD stamp sign, flip-digit price board, hanging question tag, confetti burst. Wardrobe (PersonPart): the
// auctioneer's BowTie + Blazer (lapels, shirt front, pocket square). Lab props: guess dots on a number line (truth line,
// average, glowing max), three-bar chart, oil derrick + lease map patch, bid slider (estimate -> step back, bidders).
// No text anywhere unless passed as a prop (SoldSign defaults to "SOLD").
import React from "react";
import { INK, Look, Person, Pose } from "../characters25/person";
import { CachedSvg } from "../../src/engine25/cached";
import { LAB, SKIN, HAIR } from "../style/channel";
import { PersonPart } from "./livingroom";
import { Bunting } from "./market";
import { reachLimb } from "./square";
import { tableGeom, tablePoint, TableGeom, handPos } from "./gamenight";

export { PersonPart, Bunting, tableGeom, tablePoint, handPos };
export type { TableGeom };

export const AUCTION = {
  // hall
  wall: "#e6c48e", wall2: "#d4ad74", wallShade: "#c99c66", ceiling: "#3d2c48", ceiling2: "#2e2138", truss: "#5a4466",
  lamp: "#ffe1a0", glow: "#ffd98a", winFrame: "#efe4cf", dusk: "#3b3f7a", dusk2: "#ff9a6a", dusk3: "#7a5aa0", star: "#fff1c2",
  pad: "#2f5fa8", pad2: "#284f8c", bars: "#e0a35a", bars2: "#b07a3a",
  curtain: "#b8323a", curtain2: "#8f2230", curtain3: "#d9535c", prosc: "#5a2a2e", stageBack: "#4a2630", stageBack2: "#3a1e26",
  stageTop: "#b9773f", stageFront: "#7a4428", stageFront2: "#5e321e", banner: "#f6efe0", banner2: "#2f5fa8", bannerStar: "#f2c230",
  board: "#f6f6f2", hoop: "#e8643a", net: "#f6f1e7", door: "#8a9bb5", door2: "#6f7f99", exit: "#2fbf71",
  // floor
  floor: "#dba865", floor2: "#c99556", floorHi: "#f2cf94", line: "#f6efe0", lineRed: "#d8453a", key: "#2f5fa8",
  // furniture + props
  chair: "#6c7a92", chair2: "#4d5870", chairSeat: "#7f8da6",
  wood: "#9a5a32", wood2: "#7a4426", woodHi: "#c98a52", emblem: "#f2c230",
  paddle: "#fbf6ea", paddleRim: "#e8443a", handle: "#c98a52",
  gavel: "#7a4426", gavel2: "#5a3220", gavelBand: "#f2c230",
  glass: "#d6eef5", lid: "#d9b24a", lid2: "#a8822a",
  gold: "#f2c230", gold2: "#c99a12", silver: "#d3d7e0", silver2: "#9aa2b2", copper: "#d58a4e", copper2: "#a65e2c",
  tag: "#f3dfae", tag2: "#d9bf86", twine: "#b8894e",
  cloth: "#f6f1e7", cloth2: "#ddd3c2", tableLeg: "#4d5870",
  flipFrame: "#1d1a24", cell: "#2e2a39", cell2: "#25222f", digit: "#ffe9b0",
  sold: "#d8352b", soldPaper: "#fbf1d6",
  shirt: "#fbf8f0", pocket: "#f2c230", bow: "#f2c230", bow2: "#c99a12",
  oil: "#1d1a24", derrick: "#c9d3ee", derrick2: "#9fb0d8", land: "#8fb87a", land2: "#7aa566", river: "#5aa8e0", plot: "#f2c230",
  fog: "#4a3550",
} as const;

const SHADOW = "#05040c";
const FONT = "CaptionSans, sans-serif";
const r2 = (v: number) => Math.round(v * 10) / 10;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const rng = (seed: number) => { let s = Math.max(1, Math.floor(seed * 7919 + 17)) % 2147483647; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const hx = (h: string) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
/** flat colour mix (no blend modes): a -> b by t */
const mix = (a: string, b: string, t: number) => { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
/** font size that fits `text` into `w` px (CaptionSans 900 is ~0.68 em per glyph) */
const fit = (text: string, w: number, max: number) => Math.min(max, w / (Math.max(1, text.length) * 0.68));
const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeIn = (t: number) => Math.pow(clamp01(t), 3);
type Pt = { x: number; y: number };

// ================================================================ the hall
/** Key positions of a HallBackdrop drawn with the same y, h: ground = floor line, stageTop = stage boards (stand the
 *  podium / jar table there), stageX0..stageX1 = stage boards, curtainTop = under the valance, bannerY = banner centre. */
export const hallGeom = (y = 0, h = 1300) => {
  const B = y + h;
  return { ground: B, stageTop: B - 210, stageX0: 150, stageX1: 930, stageCx: 540, curtainTop: B - 860, bannerY: B - 790 };
};

const WallBars: React.FC<{ x0: number; bays: number; top: number; base: number }> = ({ x0, bays, top, base }) => {
  const bw = 110, out: React.ReactElement[] = [];
  for (let b = 0; b <= bays; b++) out.push(<rect key={"u" + b} x={x0 + b * bw - 9} y={top} width={18} height={base - top} rx={6} fill={AUCTION.bars2} stroke={INK} strokeWidth={5} />);
  for (let yy = top + 34; yy < base - 20; yy += 54) out.push(<g key={"r" + yy}>
    <rect x={x0} y={yy - 6} width={bays * bw} height={12} rx={6} fill={AUCTION.bars} stroke={INK} strokeWidth={4} />
    <path d={`M ${x0 + 6} ${yy - 2} L ${x0 + bays * bw - 6} ${yy - 2}`} stroke="#ffe0b0" strokeWidth={3} opacity={0.6} />
  </g>);
  return <g>{out}<rect x={x0 - 14} y={top - 10} width={bays * bw + 28} height={20} rx={8} fill={AUCTION.bars2} stroke={INK} strokeWidth={5} /></g>;
};

const Hoop: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -10 -40 L -10 -150 L 10 -150 L 10 -40" fill={AUCTION.chair2} stroke={INK} strokeWidth={6} />
    <rect x={-130} y={-120} width={260} height={170} rx={8} fill={AUCTION.board} stroke={INK} strokeWidth={8} />
    <rect x={-50} y={-30} width={100} height={70} fill="none" stroke={AUCTION.hoop} strokeWidth={8} />
    <rect x={-122} y={-112} width={244} height={154} rx={4} fill="none" stroke={AUCTION.hoop} strokeWidth={6} />
    <path d="M -8 50 L -8 66 L 8 66 L 8 50" fill={AUCTION.hoop} stroke={INK} strokeWidth={4} />
    <path d="M -56 74 L -40 160 L 40 160 L 56 74" fill="none" stroke={AUCTION.net} strokeWidth={4} />
    {[-36, -12, 12, 36].map((nx) => <path key={nx} d={`M ${nx * 1.3} 74 L ${nx} 160`} stroke={AUCTION.net} strokeWidth={4} />)}
    {[100, 130].map((ny) => <path key={ny} d={`M ${-56 + (ny - 74) * 0.18} ${ny} L ${56 - (ny - 74) * 0.18} ${ny}`} stroke={AUCTION.net} strokeWidth={3.5} />)}
    <ellipse cx={0} cy={72} rx={60} ry={10} fill="none" stroke={INK} strokeWidth={14} />
    <ellipse cx={0} cy={72} rx={60} ry={10} fill="none" stroke={AUCTION.hoop} strokeWidth={7} />
  </g>
);

const CeilingLamp: React.FC<{ x: number; y: number; len: number }> = ({ x, y, len }) => (
  <g>
    <path d={`M ${x} ${y} L ${x} ${y + len}`} stroke={INK} strokeWidth={5} />
    <circle cx={x} cy={y + len + 30} r={90} fill={AUCTION.glow} opacity={0.14} />
    <circle cx={x} cy={y + len + 30} r={52} fill={AUCTION.glow} opacity={0.2} />
    <path d={`M ${x - 46} ${y + len + 34} Q ${x - 40} ${y + len} ${x} ${y + len} Q ${x + 40} ${y + len} ${x + 46} ${y + len + 34} Z`} fill={AUCTION.chair2} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx={x} cy={y + len + 36} rx={30} ry={10} fill={AUCTION.lamp} stroke={INK} strokeWidth={4} />
  </g>
);

/** Curtain panel hanging from (x0..x1) at top `t` to bottom `b`, gathered toward `tie` side (-1 left, 1 right). */
const Curtain: React.FC<{ x0: number; x1: number; t: number; b: number; tie: -1 | 1 }> = ({ x0, x1, t, b, tie }) => {
  const w = x1 - x0, tx = tie < 0 ? x0 + w * 0.25 : x1 - w * 0.25, ty = t + (b - t) * 0.58;
  const inner = tie < 0 ? x1 : x0, outer = tie < 0 ? x0 : x1;
  const d = `M ${outer} ${t} L ${inner} ${t} Q ${inner - tie * 0} ${t + (ty - t) * 0.6} ${tx} ${ty} Q ${inner + tie * -10} ${ty + (b - ty) * 0.5} ${inner + tie * 20} ${b} L ${outer} ${b} Z`;
  const folds = [0.2, 0.42, 0.64, 0.84].map((k) => {
    const fx = outer + (inner - outer) * k * 0.8;
    return `M ${r2(fx)} ${t + 10} Q ${r2((fx + tx) / 2)} ${r2(ty - 40)} ${r2(tx + (fx - tx) * 0.25)} ${r2(ty)} Q ${r2(fx + (inner - fx) * 0.3)} ${r2(ty + 90)} ${r2(fx + (inner - fx) * 0.45)} ${b - 6}`;
  });
  return (
    <g>
      <path d={d} fill={AUCTION.curtain} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {folds.map((fd, i) => <path key={i} d={fd} stroke={i % 2 ? AUCTION.curtain2 : AUCTION.curtain3} strokeWidth={i % 2 ? 12 : 7} fill="none" strokeLinecap="round" opacity={i % 2 ? 0.9 : 0.6} />)}
      <path d={`M ${tx - 34} ${ty - 10} Q ${tx} ${ty + 14} ${tx + 34} ${ty - 10}`} stroke={INK} strokeWidth={18} fill="none" strokeLinecap="round" />
      <path d={`M ${tx - 34} ${ty - 10} Q ${tx} ${ty + 14} ${tx + 34} ${ty - 10}`} stroke={AUCTION.gold} strokeWidth={9} fill="none" strokeLinecap="round" />
      <circle cx={tx} cy={ty + 4} r={11} fill={AUCTION.gold} stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** The gym hall's end wall, cached. stage=true (default): the small stage with red curtains, blank banner, stage-light
 *  cones, bunting from the stage to the corners, wall bars (left), basketball hoop (right). stage=false: the reverse
 *  angle (the wall behind the audience): wall bars both sides, double exit doors (green sign, no text), hoop, bunting.
 *  Covers x -300..1380, y..y+h; ground line at y+h (put HallFloor there). Needs h >= 1150 (windows + ceiling sit
 *  ~1150-1300 px above the ground). Use hallGeom(y, h) for the stage boards (podium, jar table). */
export const HallBackdrop: React.FC<{ y?: number; h?: number; stage?: boolean }> = ({ y = 0, h = 1300, stage = true }) => {
  const B = y + h, G = hallGeom(y, h);
  const ceilB = B - 1150;
  const blocks: React.ReactElement[] = [];
  for (let yy = ceilB + 20, r = 0; yy < B - 200; yy += 44, r++) {
    blocks.push(<path key={"h" + yy} d={`M -300 ${yy} L 1380 ${yy}`} stroke={AUCTION.wall2} strokeWidth={3} />);
    for (let xx = -300 + (r % 2) * 50; xx < 1380; xx += 100) blocks.push(<path key={`v${yy}-${xx}`} d={`M ${xx} ${yy} L ${xx} ${Math.min(yy + 44, B - 200)}`} stroke={AUCTION.wall2} strokeWidth={3} />);
  }
  const wins = [-180, 90, 360, 630, 900, 1170];
  const wy0 = ceilB + 40, wy1 = ceilB + 210;
  return (
    <CachedSvg cacheKey={`hall-back-${y}-${h}-${stage}`} x={-300} y={y} w={1680} h={h}>
      <rect x={-300} y={y} width={1680} height={h} fill={AUCTION.wall} />
      {blocks}
      {/* warm light falloff near the top */}
      <rect x={-300} y={ceilB} width={1680} height={260} fill={AUCTION.wallShade} opacity={0.45} />
      {/* high windows: dusk sky, a few stars */}
      {wins.map((wx, i) => <g key={"w" + i}>
        <rect x={wx - 10} y={wy0 - 10} width={200} height={wy1 - wy0 + 20} rx={6} fill={AUCTION.winFrame} stroke={INK} strokeWidth={7} />
        <rect x={wx} y={wy0} width={180} height={wy1 - wy0} fill={AUCTION.dusk} />
        <rect x={wx} y={wy1 - 70} width={180} height={40} fill={AUCTION.dusk3} />
        <rect x={wx} y={wy1 - 30} width={180} height={30} fill={AUCTION.dusk2} />
        {[[30, 30], [120, 54], [70, 80]].map(([sx, sy], k) => <circle key={k} cx={wx + ((sx + i * 23) % 170)} cy={wy0 + sy} r={3 + (k % 2)} fill={AUCTION.star} />)}
        <path d={`M ${wx + 90} ${wy0} L ${wx + 90} ${wy1} M ${wx} ${(wy0 + wy1) / 2} L ${wx + 180} ${(wy0 + wy1) / 2}`} stroke={AUCTION.winFrame} strokeWidth={8} />
        <rect x={wx - 16} y={wy1 + 8} width={212} height={14} rx={4} fill={AUCTION.winFrame} stroke={INK} strokeWidth={5} />
      </g>)}
      {/* ceiling + trusses */}
      <rect x={-300} y={y} width={1680} height={ceilB - y} fill={AUCTION.ceiling} />
      <rect x={-300} y={ceilB - 30} width={1680} height={30} fill={AUCTION.ceiling2} stroke={INK} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => { const tx = -300 + i * 160; return <path key={"t" + i} d={`M ${tx} ${ceilB - 30} L ${tx + 80} ${ceilB - 110} L ${tx + 160} ${ceilB - 30}`} stroke={AUCTION.truss} strokeWidth={10} fill="none" />; })}
      <path d={`M -300 ${ceilB - 110} L 1380 ${ceilB - 110}`} stroke={AUCTION.truss} strokeWidth={14} />
      {/* blue wall pads along the bottom */}
      <rect x={-300} y={B - 200} width={1680} height={200} fill={AUCTION.pad} stroke={INK} strokeWidth={6} />
      {Array.from({ length: 15 }, (_, i) => <path key={"pd" + i} d={`M ${-300 + i * 120} ${B - 196} L ${-300 + i * 120} ${B - 4}`} stroke={AUCTION.pad2} strokeWidth={6} />)}
      <path d={`M -300 ${B - 186} L 1380 ${B - 186}`} stroke="#5f8ad0" strokeWidth={4} opacity={0.7} />
      {stage ? (<>
        {/* wall bars left, hoop right */}
        <WallBars x0={-280} bays={3} top={B - 860} base={B - 200} />
        <Hoop x={1130} y={B - 900} s={0.85} />
        {/* proscenium + stage interior */}
        <rect x={G.stageX0 - 40} y={G.curtainTop - 120} width={G.stageX1 - G.stageX0 + 80} height={G.stageTop - G.curtainTop + 120} fill={AUCTION.prosc} stroke={INK} strokeWidth={9} />
        <rect x={G.stageX0} y={G.curtainTop - 80} width={G.stageX1 - G.stageX0} height={G.stageTop - G.curtainTop + 80} fill={AUCTION.stageBack} />
        {Array.from({ length: 9 }, (_, i) => <path key={"bk" + i} d={`M ${G.stageX0 + 40 + i * 88} ${G.curtainTop - 80} L ${G.stageX0 + 40 + i * 88} ${G.stageTop}`} stroke={AUCTION.stageBack2} strokeWidth={22} />)}
        {/* spotlight pool on the back curtain + stage boards */}
        <ellipse cx={G.stageCx} cy={G.stageTop - 230} rx={250} ry={300} fill={AUCTION.glow} opacity={0.16} />
        {/* blank cloth banner hanging across */}
        <path d={`M ${G.stageX0 + 90} ${G.bannerY - 60} Q ${G.stageCx} ${G.bannerY - 40} ${G.stageX1 - 90} ${G.bannerY - 60} L ${G.stageX1 - 100} ${G.bannerY + 60} Q ${G.stageCx} ${G.bannerY + 80} ${G.stageX0 + 100} ${G.bannerY + 60} Z`}
          fill={AUCTION.banner} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <path d={`M ${G.stageX0 + 100} ${G.bannerY - 40} Q ${G.stageCx} ${G.bannerY - 20} ${G.stageX1 - 100} ${G.bannerY - 40} M ${G.stageX0 + 108} ${G.bannerY + 42} Q ${G.stageCx} ${G.bannerY + 62} ${G.stageX1 - 108} ${G.bannerY + 42}`} stroke={AUCTION.banner2} strokeWidth={8} fill="none" />
        {[-1, 1].map((d) => <path key={"bs" + d} transform={`translate(${G.stageCx + d * 290} ${G.bannerY + 8})`} d="M 0 -26 L 7 -8 L 26 -8 L 11 4 L 16 23 L 0 12 L -16 23 L -11 4 L -26 -8 L -7 -8 Z" fill={AUCTION.bannerStar} stroke={INK} strokeWidth={4} strokeLinejoin="round" />)}
        {[-1, 1].map((d) => <path key={"br" + d} d={`M ${G.stageCx + d * 270} ${G.curtainTop - 80} L ${G.stageCx + d * 280} ${G.bannerY - 56}`} stroke={INK} strokeWidth={4} />)}
        {/* curtains + valance */}
        <Curtain x0={G.stageX0 - 10} x1={G.stageX0 + 150} t={G.curtainTop - 90} b={G.stageTop} tie={-1} />
        <Curtain x0={G.stageX1 - 150} x1={G.stageX1 + 10} t={G.curtainTop - 90} b={G.stageTop} tie={1} />
        <path d={`M ${G.stageX0 - 30} ${G.curtainTop - 130} L ${G.stageX1 + 30} ${G.curtainTop - 130} L ${G.stageX1 + 30} ${G.curtainTop - 40} ` +
          Array.from({ length: 8 }, (_, i) => { const x1 = G.stageX1 + 30 - (i + 1) * ((G.stageX1 - G.stageX0 + 60) / 8); return `Q ${r2(x1 + (G.stageX1 - G.stageX0 + 60) / 16)} ${G.curtainTop + 10} ${r2(x1)} ${G.curtainTop - 40}`; }).join(" ") + " Z"}
          fill={AUCTION.curtain} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d={`M ${G.stageX0 - 30} ${G.curtainTop - 112} L ${G.stageX1 + 30} ${G.curtainTop - 112}`} stroke={AUCTION.gold} strokeWidth={8} />
        {/* stage boards + front */}
        <rect x={G.stageX0 - 50} y={G.stageTop - 14} width={G.stageX1 - G.stageX0 + 100} height={28} rx={6} fill={AUCTION.stageTop} stroke={INK} strokeWidth={7} />
        <rect x={G.stageX0 - 40} y={G.stageTop + 14} width={G.stageX1 - G.stageX0 + 80} height={B - G.stageTop - 14} fill={AUCTION.stageFront} stroke={INK} strokeWidth={7} />
        {Array.from({ length: 8 }, (_, i) => <path key={"sf" + i} d={`M ${G.stageX0 - 40 + (i + 1) * ((G.stageX1 - G.stageX0 + 80) / 9)} ${G.stageTop + 18} L ${G.stageX0 - 40 + (i + 1) * ((G.stageX1 - G.stageX0 + 80) / 9)} ${B - 4}`} stroke={AUCTION.stageFront2} strokeWidth={6} />)}
        {/* steps up to the stage (right) */}
        {[0, 1, 2].map((k) => <rect key={"st" + k} x={G.stageX1 + 40 + k * 0} y={G.stageTop + 14 + k * 62} width={110 - k * 0 + k * 40} height={62} fill={AUCTION.stageFront} stroke={INK} strokeWidth={6} />)}
        {/* stage-light cones from two ceiling lamps */}
        {[-1, 1].map((d) => <path key={"cone" + d} d={`M ${G.stageCx + d * 330} ${ceilB - 20} L ${G.stageCx + d * 60 - 170} ${G.stageTop} L ${G.stageCx + d * 60 + 170} ${G.stageTop} Z`} fill={AUCTION.lamp} opacity={0.1} />)}
        {[-1, 1].map((d) => <g key={"spot" + d} transform={`translate(${G.stageCx + d * 330} ${ceilB - 20}) rotate(${-d * 20})`}>
          <rect x={-26} y={-10} width={52} height={64} rx={10} fill={AUCTION.chair2} stroke={INK} strokeWidth={6} />
          <ellipse cx={0} cy={56} rx={24} ry={8} fill={AUCTION.lamp} stroke={INK} strokeWidth={4} />
        </g>)}
        {/* bunting from the proscenium top to the corners */}
        <Bunting x0={-300} y0={ceilB + 260} x1={G.stageX0 - 30} y1={G.curtainTop - 130} sag={80} n={9} size={44} seed={1} />
        <Bunting x0={G.stageX1 + 30} y0={G.curtainTop - 130} x1={1380} y1={ceilB + 260} sag={80} n={9} size={44} seed={3} />
        <Bunting x0={-300} y0={ceilB + 40} x1={1380} y1={ceilB + 40} sag={150} n={22} size={40} seed={5} />
      </>) : (<>
        <WallBars x0={-280} bays={3} top={B - 860} base={B - 200} />
        <WallBars x0={1030} bays={3} top={B - 860} base={B - 200} />
        <Hoop x={540} y={B - 960} s={0.85} />
        {/* double exit doors */}
        <rect x={330} y={B - 560} width={420} height={560} fill={AUCTION.chair2} stroke={INK} strokeWidth={9} />
        {[0, 1].map((k) => <g key={"d" + k}>
          <rect x={345 + k * 200} y={B - 545} width={190} height={545} fill={AUCTION.door} stroke={INK} strokeWidth={6} />
          <rect x={375 + k * 200} y={B - 510} width={130} height={150} rx={4} fill={AUCTION.dusk} stroke={INK} strokeWidth={5} />
          <rect x={375 + k * 200} y={B - 400} width={130} height={40} fill={AUCTION.dusk2} opacity={0.7} />
          <rect x={360 + k * 200} y={B - 300} width={160} height={18} rx={9} fill={AUCTION.silver} stroke={INK} strokeWidth={4} />
        </g>)}
        <rect x={480} y={B - 640} width={120} height={56} rx={6} fill={AUCTION.exit} stroke={INK} strokeWidth={6} />
        <path d={`M 505 ${B - 612} L 575 ${B - 612} M 555 ${B - 630} L 575 ${B - 612} L 555 ${B - 594}`} stroke="#ffffff" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Bunting x0={-300} y0={ceilB + 40} x1={1380} y1={ceilB + 40} sag={150} n={22} size={40} seed={5} />
        <Bunting x0={-300} y0={ceilB + 300} x1={1380} y1={ceilB + 300} sag={120} n={22} size={44} seed={2} />
      </>)}
      {/* ceiling lamps */}
      {[-120, 240, 840, 1200].map((lx) => <CeilingLamp key={"cl" + lx} x={lx} y={ceilB - 30} len={40} />)}
      <rect x={-300} y={y} width={1680} height={h} fill={AUCTION.glow} opacity={0.04} />
    </CachedSvg>
  );
};

/** Varnished wooden court floor in fake perspective (boards converge ~1500 px above y), painted court lines (white
 *  centre circle + sideline, red three-point arc, blue key) and warm reflections of the stage lights. Cached. */
export const HallFloor: React.FC<{ y: number; h?: number }> = ({ y, h = 700 }) => {
  const vx = 540, vy = y - 1500, yb = y + h;
  const colX = (X: number, yy: number) => vx + (X - vx) * (yy - vy) / (yb - vy);
  const ty = (u: number) => y + h * u;                           // u 0..1 down the floor (linear is fine here)
  const boards: React.ReactElement[] = [];
  for (let i = -18; i <= 18; i++) {
    const X = vx + i * 110;
    boards.push(<path key={"b" + i} d={`M ${r2(colX(X, y))} ${y} L ${r2(X)} ${yb}`} stroke={AUCTION.floor2} strokeWidth={3} />);
  }
  const R = rng(19), joints: React.ReactElement[] = [];
  for (let k = 0; k < 60; k++) {
    const u = R(), yy = ty(u * u), i = Math.floor(R() * 30) - 15, X0 = vx + i * 110;
    joints.push(<path key={"j" + k} d={`M ${r2(colX(X0, yy))} ${r2(yy)} L ${r2(colX(X0 + 110, yy))} ${r2(yy)}`} stroke={AUCTION.floor2} strokeWidth={2.5} />);
  }
  const ell = (cx: number, cy: number, rx: number, ry: number) => `M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 0 0 ${cx - rx} ${cy} Z`;
  return (
    <CachedSvg cacheKey={`hall-floor-${y}-${h}`} x={-300} y={y} w={1680} h={h}>
      <rect x={-300} y={y} width={1680} height={h} fill={AUCTION.floor} />
      {boards}{joints}
      {/* blue key (trapezoid toward the stage) */}
      <path d={`M ${r2(colX(380, y))} ${y} L ${r2(colX(700, y))} ${y} L ${r2(colX(700, ty(0.35)))} ${r2(ty(0.35))} L ${r2(colX(380, ty(0.35)))} ${r2(ty(0.35))} Z`} fill={AUCTION.key} opacity={0.55} />
      {/* red three-point arc */}
      <path d={`M ${r2(colX(-60, y))} ${y} Q ${r2(colX(540, ty(1.05)))} ${r2(ty(0.85))} ${r2(colX(1140, y))} ${y}`} stroke={AUCTION.lineRed} strokeWidth={10} fill="none" />
      {/* white lines */}
      <path d={`M -300 ${r2(ty(0.06))} L 1380 ${r2(ty(0.06))}`} stroke={AUCTION.line} strokeWidth={8} />
      <path d={ell(540, ty(0.35), 160, 34)} stroke={AUCTION.line} strokeWidth={8} fill="none" />
      <path d={`M ${r2(colX(-200, y))} ${y} L ${r2(colX(-200, yb))} ${yb}`} stroke={AUCTION.line} strokeWidth={9} />
      <path d={`M ${r2(colX(1280, y))} ${y} L ${r2(colX(1280, yb))} ${yb}`} stroke={AUCTION.line} strokeWidth={9} />
      {/* varnish reflections */}
      {[[540, 0.18, 260, 30], [180, 0.12, 120, 14], [900, 0.12, 120, 14]].map(([cx, u, rx, ry], i) => <ellipse key={"g" + i} cx={cx} cy={ty(u)} rx={rx} ry={ry} fill={AUCTION.floorHi} opacity={0.4} />)}
      <rect x={-300} y={y} width={1680} height={10} fill={SHADOW} opacity={0.18} />
    </CachedSvg>
  );
};

// ================================================================ furniture
/** Seat height of the FoldingChair in Person-local units (same as cafe SEAT_TOP, so cafe sitPose / sitY work). */
export const FOLD_SEAT = 100;

/** Metal folding chair, x = centre, y = floor, scale = the sitter's scale. Seat top at y - 100*scale.
 *  facing 1 / -1 = side view (sitter faces that way); 0 = front view (backrest behind the sitter: draw BEFORE the
 *  Person, then FoldingLap after); "back" = seen from behind (backrest in front of the sitter's back). */
export const FoldingChair: React.FC<{ x: number; y: number; scale?: number; facing?: 1 | -1 | 0 | "back"; color?: string }> = ({ x, y, scale = 1, facing = 0, color = AUCTION.chair }) => {
  const frame = mix(color, INK, 0.25), seat = mix(color, "#ffffff", 0.12);
  const tube = (d: string, w = 14) => <g><path d={d} stroke={INK} strokeWidth={w + 8} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={d} stroke={frame} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={84} ry={10} fill={SHADOW} opacity={0.2} />
      {facing === 0 || facing === "back" ? (<>
        {tube("M -66 -330 L -70 0")}{tube("M 66 -330 L 70 0")}
        {tube("M -50 -100 L -60 0", 11)}{tube("M 50 -100 L 60 0", 11)}
        {facing === 0 && <rect x={-70} y={-326} width={140} height={86} rx={14} fill={color} stroke={INK} strokeWidth={7} />}
        {facing === 0 && <rect x={-76} y={-108} width={152} height={20} rx={8} fill={seat} stroke={INK} strokeWidth={6} />}
        {facing === "back" && <>
          <rect x={-78} y={-112} width={156} height={16} rx={6} fill={seat} stroke={INK} strokeWidth={6} />
          <rect x={-70} y={-326} width={140} height={86} rx={14} fill={color} stroke={INK} strokeWidth={7} />
          <path d="M -54 -300 L 54 -300" stroke={mix(color, "#ffffff", 0.3)} strokeWidth={6} strokeLinecap="round" />
        </>}
      </>) : (
        <g transform={`scale(${facing} 1)`}>
          {tube("M -46 -330 L -40 -100 L 40 0")}{tube("M 46 -96 L -46 0")}
          <rect x={-74} y={-110} width={140} height={20} rx={8} fill={seat} stroke={INK} strokeWidth={6} />
          <rect x={-66} y={-332} width={34} height={92} rx={10} fill={color} stroke={INK} strokeWidth={7} />
        </g>
      )}
    </g>
  );
};

/** Front-view FoldingChair seat edge + the sitter's lap, drawn AFTER the Person (same x, floor y, scale, look as the
 *  Person; pose = cafe sitPose("front")). Order: FoldingChair facing 0 -> Person (y = cafe sitY) -> FoldingLap. */
export const FoldingLap: React.FC<{ x: number; y: number; scale?: number; look: Look; color?: string }> = ({ x, y, scale = 1, look, color = AUCTION.chair }) => {
  const H = 82 * Math.cos(rad(-67)) + 78 * Math.cos(rad(0)), seat = mix(color, "#ffffff", 0.12);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-76} y={-108} width={152} height={20} rx={8} fill={seat} stroke={INK} strokeWidth={6} />
      <path d={`M -64 ${-H + 4} L 64 ${-H + 4} L 66 ${-H + 34} Q 64 ${-H + 50} 34 ${-H + 50} Q 6 ${-H + 50} 0 ${-H + 42} Q -6 ${-H + 50} -34 ${-H + 50} Q -64 ${-H + 50} -66 ${-H + 34} Z`}
        fill={look.shorts} stroke={INK} strokeWidth={4.2} strokeLinejoin="round" />
    </g>
  );
};

export const HALL_TABLE_H = 250;
/** Folding table with a paper cloth seen from the front (top visible at a slight angle), x = centre, y = floor line
 *  under the front, w = front width (default 600). Cached. Geometry = gamenight tableGeom(x, y, w): front top edge at
 *  y - 250, back edge at y - 250 - 0.28w; place props with tablePoint(geom, u, v). The cloth skirt hides anything
 *  behind it down to the floor. For a standing Person behind it see behindTable + TableHands. */
export const HallTable: React.FC<{ x: number; y: number; w?: number; cloth?: string }> = ({ x, y, w = 600, cloth = AUCTION.cloth }) => {
  const g = tableGeom(x, y, w), c2 = mix(cloth, INK, 0.12);
  return (
    <CachedSvg cacheKey={`hall-table-${x}-${y}-${w}-${cloth}`} x={x - w / 2 - 30} y={g.topBack - 20} w={w + 60} h={y - g.topBack + 40}>
      <ellipse cx={x} cy={y + 4} rx={w * 0.56} ry={16} fill={SHADOW} opacity={0.25} />
      {[g.xf0 + 50, g.xf1 - 50].map((lx) => <path key={lx} d={`M ${lx} ${g.topFront + 40} L ${lx + (lx < x ? -10 : 10)} ${y}`} stroke={INK} strokeWidth={20} strokeLinecap="round" />)}
      {[g.xf0 + 50, g.xf1 - 50].map((lx) => <path key={"i" + lx} d={`M ${lx} ${g.topFront + 40} L ${lx + (lx < x ? -10 : 10)} ${y}`} stroke={AUCTION.tableLeg} strokeWidth={10} strokeLinecap="round" />)}
      <path d={`M ${g.xb0} ${g.topBack} L ${g.xb1} ${g.topBack} L ${g.xf1} ${g.topFront} L ${g.xf0} ${g.topFront} Z`} fill={cloth} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {[0.33, 0.66].map((v) => { const a = tablePoint(g, 0, v), b = tablePoint(g, 1, v); return <path key={v} d={`M ${r2(a[0] + 8)} ${r2(a[1])} L ${r2(b[0] - 8)} ${r2(b[1])}`} stroke={c2} strokeWidth={3} opacity={0.5} />; })}
      {/* skirt hanging in front */}
      <path d={`M ${g.xf0 - 6} ${g.topFront} L ${g.xf1 + 6} ${g.topFront} L ${g.xf1 + 12} ${y - 70} ` +
        Array.from({ length: 6 }, (_, i) => { const x1 = g.xf1 + 12 - (i + 1) * ((w + 24) / 6); return `Q ${r2(x1 + (w + 24) / 12)} ${y - 50} ${r2(x1)} ${y - 70}`; }).join(" ") + " Z"}
        fill={cloth} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {Array.from({ length: 5 }, (_, i) => { const fx = g.xf0 + (i + 1) * (w / 6); return <path key={"f" + i} d={`M ${r2(fx)} ${g.topFront + 14} L ${r2(fx + 4)} ${y - 66}`} stroke={c2} strokeWidth={5} opacity={0.6} />; })}
      <path d={`M ${g.xf0 + 4} ${g.topFront + 10} L ${g.xf1 - 4} ${g.topFront + 10}`} stroke={c2} strokeWidth={4} opacity={0.5} />
    </CachedSvg>
  );
};

/** Person props for someone standing BEHIND a HallTable (draw the Person before HallTable; the cloth hides the legs).
 *  u = 0..1 across the table, scale defaults to 1.35 (an adult at a table made at seated-table proportions). */
export const behindTable = (g: TableGeom, u = 0.5, scale = 1.35) => {
  const floorBack = g.y - (g.topFront - g.topBack);
  return { x: r2(g.xb0 + (g.xb1 - g.xb0) * u), y: r2(floorBack - 6), scale };
};

/** Forearms + hands of a Person standing behind a HallTable reaching onto the top (draw AFTER HallTable and the
 *  props). p = the Person's props (from behindTable), hands = world points for the left and right hand (e.g. from
 *  tablePoint). The arms start where the Person's body meets the table's back edge. Pose the Person's own arms down
 *  (e.g. armL/armR [14, -10]) so they disappear behind the table. sleeve = forearm colour (default skin). */
export const TableHands: React.FC<{ g: TableGeom; p: { x: number; scale?: number }; look: Look; hands: [Pt | null, Pt | null]; sleeve?: string; spread?: number }> =
  ({ g, p, look, hands, sleeve, spread = 58 }) => {
    const k = p.scale ?? 1, limbW = 13.2, ink = 4.2;
    return (
      <g>
        {hands.map((hnd, i) => {
          if (!hnd) return null;
          const d = i === 0 ? -1 : 1, sx = p.x + d * spread * k, sy = g.topBack - 4;
          const path = `M ${r2(sx)} ${r2(sy)} L ${r2(hnd.x)} ${r2(hnd.y)}`;
          return <g key={i}>
            <path d={path} stroke={INK} strokeWidth={(limbW + ink * 2) * k} strokeLinecap="round" />
            <path d={path} stroke={sleeve ?? look.skin} strokeWidth={limbW * k} strokeLinecap="round" />
            <circle cx={r2(hnd.x)} cy={r2(hnd.y)} r={limbW * 0.62 * k} fill={look.skin} stroke={INK} strokeWidth={ink * k} />
          </g>;
        })}
      </g>
    );
  };

// ================================================================ the audience
const PARENT_SHIRTS = ["#e8643a", "#3a7bd5", "#2fa89a", "#f2c230", "#8fb87a", "#b06ad9", "#e85a8a", "#5b86b8", "#c4573f", "#f6efe0", "#6f8a3c", "#3fb8c9"];
const SKINS = [SKIN.light, SKIN.fair, SKIN.tan, SKIN.warm, SKIN.brown, SKIN.deep, SKIN.dark];
const HAIRS = [HAIR.black, HAIR.brown, HAIR.blond, HAIR.grey, HAIR.black, HAIR.brown];

export type CrowdView = "back" | "front";
export type CrowdBid = { row: number; col: number; up: number; number?: string | number; side?: -1 | 1 };
export type CrowdRowsProps = { f: number; rows: number; y0: number; x0?: number; w?: number; rowH?: number; size?: number; view?: CrowdView;
  mood?: "idle" | "cheer"; seed?: number; fog?: number; fogColor?: string; chairs?: boolean; bids?: CrowdBid[]; gap?: number };

type Seated = { x: number; y: number; sc: number; shirt: string; skin: string; hair: string; style: number; ph: number; row: number; col: number; fade: number };

const crowdLayout = (p: CrowdRowsProps): Seated[] => {
  const { rows, y0, x0 = -80, w = 1240, rowH = 120, size = 58, seed = 3, fog = 0.35, gap = 1.75 } = p;
  const R = rng(seed + 101), out: Seated[] = [];
  for (let row = 0; row < rows; row++) {
    const near = rows > 1 ? row / (rows - 1) : 1;              // 0 = back row, 1 = front row
    const sc = size * (0.7 + 0.3 * near);
    const n = Math.max(1, Math.floor(w / (sc * gap)));
    const step = w / n;
    for (let col = 0; col < n; col++) {
      out.push({
        x: r2(x0 + (col + 0.5 + (row % 2 ? 0.25 : -0.25)) * step + (R() - 0.5) * sc * 0.25), y: r2(y0 + row * rowH), sc,
        shirt: PARENT_SHIRTS[Math.floor(R() * PARENT_SHIRTS.length)], skin: SKINS[Math.floor(R() * SKINS.length)], hair: HAIRS[Math.floor(R() * HAIRS.length)],
        style: Math.floor(R() * 4), ph: R() * 6.28, row, col, fade: fog * (1 - near),
      });
    }
  }
  return out;
};

/** Where a seated audience member sits: { x, y (= seat line), sc (= head width) } for row/col of a CrowdRows with the
 *  same props, or null. Use it to put a full Person (e.g. Ben) in a gap or to aim the camera at a bidder. */
export const crowdSeat = (p: CrowdRowsProps, row: number, col: number) => {
  const s = crowdLayout(p).find((q) => q.row === row && q.col === col);
  return s ? { x: s.x, y: s.y, sc: s.sc } : null;
};
/** number of seats in a row of a CrowdRows with these props */
export const crowdRowCount = (p: CrowdRowsProps, row: number) => crowdLayout(p).filter((q) => q.row === row).length;

/** One simplified seated parent (head width = sc), origin at the seat line under the hips. */
const SeatedFigure: React.FC<{ s: Seated; view: CrowdView; bob: number; armsUp: boolean; chairs: boolean; fogColor: string }> = ({ s, view, bob, armsUp, chairs, fogColor }) => {
  const sc = s.sc, c = (col: string) => mix(col, fogColor, s.fade), sw = sc * 0.07, so = 1 - s.fade * 0.5;
  const headY = -1.72 * sc + bob, chair = c(AUCTION.chair), chairD = c(AUCTION.chair2);
  const torso = `M ${-0.78 * sc} 0 L ${-0.72 * sc} ${-1.05 * sc} Q ${-0.7 * sc} ${-1.3 * sc + bob} ${-0.3 * sc} ${-1.32 * sc + bob} L ${0.3 * sc} ${-1.32 * sc + bob} Q ${0.7 * sc} ${-1.3 * sc + bob} ${0.72 * sc} ${-1.05 * sc} L ${0.78 * sc} 0 Z`;
  const hairBack = s.style === 0 ? `M ${-0.5 * sc} ${headY + 0.1 * sc} C ${-0.56 * sc} ${headY - 0.62 * sc} ${0.56 * sc} ${headY - 0.62 * sc} ${0.5 * sc} ${headY + 0.1 * sc} C ${0.3 * sc} ${headY + 0.28 * sc} ${-0.3 * sc} ${headY + 0.28 * sc} ${-0.5 * sc} ${headY + 0.1 * sc} Z`
    : s.style === 1 ? `M ${-0.52 * sc} ${headY + 0.2 * sc} C ${-0.6 * sc} ${headY - 0.66 * sc} ${0.6 * sc} ${headY - 0.66 * sc} ${0.52 * sc} ${headY + 0.2 * sc} L ${0.42 * sc} ${headY + 0.48 * sc} L ${-0.42 * sc} ${headY + 0.48 * sc} Z`
    : s.style === 2 ? `M ${-0.5 * sc} ${headY} C ${-0.54 * sc} ${headY - 0.6 * sc} ${0.54 * sc} ${headY - 0.6 * sc} ${0.5 * sc} ${headY} C ${0.4 * sc} ${headY - 0.2 * sc} ${-0.4 * sc} ${headY - 0.2 * sc} ${-0.5 * sc} ${headY} Z`
    : `M ${-0.5 * sc} ${headY + 0.06 * sc} C ${-0.56 * sc} ${headY - 0.62 * sc} ${0.56 * sc} ${headY - 0.62 * sc} ${0.5 * sc} ${headY + 0.06 * sc} C ${0.3 * sc} ${headY + 0.22 * sc} ${-0.3 * sc} ${headY + 0.22 * sc} ${-0.5 * sc} ${headY + 0.06 * sc} Z M ${-0.16 * sc} ${headY - 0.5 * sc} a ${0.17 * sc} ${0.16 * sc} 0 1 1 ${0.32 * sc} 0 a ${0.17 * sc} ${0.16 * sc} 0 1 1 ${-0.32 * sc} 0 Z`;
  const arm = (d: number) => armsUp
    ? `M ${d * 0.6 * sc} ${-1.15 * sc + bob} L ${d * 0.85 * sc} ${-2.0 * sc + bob} L ${d * 0.78 * sc} ${-2.65 * sc + bob}`
    : `M ${d * 0.66 * sc} ${-1.1 * sc + bob} L ${d * 0.74 * sc} ${-0.5 * sc} L ${d * 0.3 * sc} ${-0.1 * sc}`;
  return (
    <g transform={`translate(${s.x} ${s.y})`} strokeOpacity={so}>
      {/* chair back behind the sitter (front view) */}
      {chairs && view === "front" && <g>
        <path d={`M ${-0.8 * sc} ${-1.75 * sc} L ${-0.8 * sc} 0 M ${0.8 * sc} ${-1.75 * sc} L ${0.8 * sc} 0`} stroke={INK} strokeWidth={sc * 0.2} strokeLinecap="round" />
        <path d={`M ${-0.8 * sc} ${-1.75 * sc} L ${-0.8 * sc} 0 M ${0.8 * sc} ${-1.75 * sc} L ${0.8 * sc} 0`} stroke={chairD} strokeWidth={sc * 0.1} strokeLinecap="round" />
        <rect x={-0.86 * sc} y={-1.86 * sc} width={1.72 * sc} height={0.5 * sc} rx={0.12 * sc} fill={chair} stroke={INK} strokeWidth={sw} />
      </g>}
      {view === "front" && armsUp && [-1, 1].map((d) => <g key={"au" + d}>
        <path d={arm(d)} stroke={INK} strokeWidth={sc * 0.22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={arm(d)} stroke={c(s.skin)} strokeWidth={sc * 0.12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>)}
      {view === "back" && armsUp && [-1, 1].map((d) => <g key={"ab" + d}>
        <path d={arm(d)} stroke={INK} strokeWidth={sc * 0.22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={arm(d)} stroke={c(s.skin)} strokeWidth={sc * 0.12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>)}
      <path d={torso} fill={c(s.shirt)} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M ${-0.5 * sc} ${-1.1 * sc + bob} Q ${-0.56 * sc} ${-0.5 * sc} ${-0.46 * sc} ${-0.05 * sc}`} stroke={SHADOW} strokeOpacity={0.15} strokeWidth={sc * 0.14} fill="none" />
      {/* neck + head */}
      <rect x={-0.13 * sc} y={headY - 0.02 * sc} width={0.26 * sc} height={0.4 * sc} fill={c(s.skin)} stroke={INK} strokeWidth={sw * 0.8} />
      {view === "back" ? (<>
        {[-1, 1].map((d) => <ellipse key={"e" + d} cx={d * 0.49 * sc} cy={headY - 0.28 * sc} rx={0.08 * sc} ry={0.12 * sc} fill={c(s.skin)} stroke={INK} strokeWidth={sw * 0.8} />)}
        <ellipse cx={0} cy={headY - 0.32 * sc} rx={0.48 * sc} ry={0.46 * sc} fill={c(s.skin)} stroke={INK} strokeWidth={sw} />
        <path d={s.style === 2 ? `M ${-0.49 * sc} ${headY - 0.3 * sc} C ${-0.53 * sc} ${headY - 0.88 * sc} ${0.53 * sc} ${headY - 0.88 * sc} ${0.49 * sc} ${headY - 0.3 * sc} Q ${0.4 * sc} ${headY - 0.06 * sc} 0 ${headY - 0.02 * sc} Q ${-0.4 * sc} ${headY - 0.06 * sc} ${-0.49 * sc} ${headY - 0.3 * sc} Z`
          : `M ${-0.49 * sc} ${headY - 0.26 * sc} C ${-0.54 * sc} ${headY - 0.88 * sc} ${0.54 * sc} ${headY - 0.88 * sc} ${0.49 * sc} ${headY - 0.26 * sc} Q ${0.42 * sc} ${headY + (s.style === 1 ? 0.2 : 0.02) * sc} 0 ${headY + (s.style === 1 ? 0.24 : 0.06) * sc} Q ${-0.42 * sc} ${headY + (s.style === 1 ? 0.2 : 0.02) * sc} ${-0.49 * sc} ${headY - 0.26 * sc} Z`}
          fill={c(s.hair)} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        {s.style === 3 && <circle cx={0} cy={headY - 0.82 * sc} r={0.17 * sc} fill={c(s.hair)} stroke={INK} strokeWidth={sw} />}
      </>) : (<>
        <ellipse cx={0} cy={headY - 0.32 * sc} rx={0.48 * sc} ry={0.46 * sc} fill={c(s.skin)} stroke={INK} strokeWidth={sw} />
        <path d={hairBack} transform={`translate(0 ${-0.32 * sc})`} fill={c(s.hair)} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        <path d={`M ${-0.15 * sc} ${headY - 0.34 * sc} L ${-0.15 * sc} ${headY - 0.28 * sc} M ${0.15 * sc} ${headY - 0.34 * sc} L ${0.15 * sc} ${headY - 0.28 * sc}`} stroke={INK} strokeWidth={sc * 0.075} strokeLinecap="round" />
        <path d={armsUp ? `M ${-0.14 * sc} ${headY - 0.14 * sc} Q 0 ${headY + 0.02 * sc} ${0.14 * sc} ${headY - 0.14 * sc} Z` : `M ${-0.11 * sc} ${headY - 0.14 * sc} Q 0 ${headY - 0.06 * sc} ${0.11 * sc} ${headY - 0.14 * sc}`}
          fill={armsUp ? "#5a1626" : "none"} stroke={INK} strokeWidth={sc * 0.05} strokeLinecap="round" />
        {/* forearms on the lap */}
        {!armsUp && [-1, 1].map((d) => <g key={"fa" + d}>
          <path d={arm(d)} stroke={INK} strokeWidth={sc * 0.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={arm(d)} stroke={c(s.shirt)} strokeWidth={sc * 0.1} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>)}
      </>)}
      {/* chair back in front of the sitter (back view) */}
      {chairs && view === "back" && <g>
        <path d={`M ${-0.78 * sc} ${-0.9 * sc} L ${-0.8 * sc} ${0.9 * sc} M ${0.78 * sc} ${-0.9 * sc} L ${0.8 * sc} ${0.9 * sc}`} stroke={INK} strokeWidth={sc * 0.2} strokeLinecap="round" />
        <path d={`M ${-0.78 * sc} ${-0.9 * sc} L ${-0.8 * sc} ${0.9 * sc} M ${0.78 * sc} ${-0.9 * sc} L ${0.8 * sc} ${0.9 * sc}`} stroke={chairD} strokeWidth={sc * 0.1} strokeLinecap="round" />
        <rect x={-0.84 * sc} y={-1.0 * sc} width={1.68 * sc} height={0.52 * sc} rx={0.12 * sc} fill={chair} stroke={INK} strokeWidth={sw} />
        <path d={`M ${-0.66 * sc} ${-0.88 * sc} L ${0.66 * sc} ${-0.88 * sc}`} stroke={c("#ffffff")} strokeOpacity={0.35} strokeWidth={sc * 0.06} strokeLinecap="round" />
      </g>}
    </g>
  );
};

/** cached crowd pose index for a frame (idle: slow 4-pose sway; cheer: fast bounce) */
const crowdPose = (mood: "idle" | "cheer", f: number) => (mood === "cheer" ? Math.floor(f / 3) % 4 : Math.floor(f / 9) % 4);

/** Rows of seated parents on folding chairs (school-hall audience). view "back" = seen from behind (wide shots toward
 *  the stage; backrests in front of their backs), "front" = facing the camera (reverse shots from the stage).
 *  Row 0 is the far row at y0, each next row rowH lower and bigger; size = head width of the front row (default 58).
 *  y = seat line of each row (backs reach ~2.2*size above it, chair legs ~0.9*size below). The bodies are cached
 *  (4 idle sway poses, or 4 bounce poses with mood "cheer" where ~60 % throw their arms up); bids are drawn LIVE on
 *  top: each { row, col, up 0..1, number } raises that parent's arm with a numbered Paddle (up eases the arm from the
 *  lap to straight up; animate it with arrive()). Use crowdSeat to find a seat. Deterministic (seed). */
export const CrowdRows: React.FC<CrowdRowsProps> = (p) => {
  const { f, rows, y0, x0 = -80, w = 1240, rowH = 120, size = 58, view = "back", mood = "idle", fogColor = AUCTION.fog, chairs = true, bids = [] } = p;
  const pi = crowdPose(mood, f);
  const seats = crowdLayout(p);
  const top = y0 - size * 4.2, h = (rows - 1) * rowH + size * 5.4;
  const key = `crowd-${rows}-${y0}-${x0}-${w}-${rowH}-${size}-${view}-${mood}-${p.seed ?? 3}-${p.fog ?? 0.35}-${fogColor}-${chairs}-${p.gap ?? 1.75}-${pi}`;
  const bob = (s: Seated) => mood === "cheer" ? -Math.abs(Math.sin(pi * Math.PI / 4 + s.ph)) * s.sc * 0.22 : Math.sin(pi * Math.PI / 2 + s.ph) * s.sc * 0.035;
  const cheers = (s: Seated) => mood === "cheer" && (s.ph * 7) % 1 < 0.6;
  // a raised paddle: arm from the shoulder up, paddle above the hand (drawn over the cached crowd)
  const live = bids.map((b, i) => {
    const s = seats.find((q) => q.row === b.row && q.col === b.col);
    if (!s || b.up <= 0.02) return null;
    const u = clamp01(b.up), sc = s.sc, d = b.side ?? (b.col % 2 ? 1 : -1), bb = bob(s);
    const sh = { x: s.x + d * 0.58 * sc, y: s.y - 1.15 * sc + bb };
    const hand = { x: s.x + d * (0.9 - 0.25 * u) * sc, y: s.y + bb - (0.6 + 2.3 * u) * sc };
    const el = { x: (sh.x + hand.x) / 2 + d * 0.35 * sc * (1 - u * 0.6), y: (sh.y + hand.y) / 2 + 0.1 * sc };
    const path = `M ${r2(sh.x)} ${r2(sh.y)} L ${r2(el.x)} ${r2(el.y)} L ${r2(hand.x)} ${r2(hand.y)}`;
    return <g key={"bid" + i}>
      <path d={path} stroke={INK} strokeWidth={sc * 0.22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} stroke={mix(view === "back" ? s.shirt : s.skin, fogColor, s.fade)} strokeWidth={sc * 0.12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Paddle x={hand.x} y={hand.y + sc * 0.1} scale={sc / 120 * (0.6 + 0.4 * u)} number={b.number} rot={d * (1 - u) * 30} />
      <circle cx={r2(hand.x)} cy={r2(hand.y)} r={sc * 0.11} fill={mix(s.skin, fogColor, s.fade)} stroke={INK} strokeWidth={sc * 0.05} />
    </g>;
  });
  return (
    <g>
      <CachedSvg cacheKey={key} x={x0 - 120} y={top} w={w + 240} h={h}>
        {seats.map((s) => <SeatedFigure key={`${s.row}-${s.col}`} s={s} view={view} bob={bob(s)} armsUp={cheers(s)} chairs={chairs} fogColor={fogColor} />)}
      </CachedSvg>
      {live}
    </g>
  );
};

// ================================================================ auction props
/** Bidding paddle: x, y = the bottom of the handle (where it is held); the paddle face rises ~210 px above at scale 1.
 *  number = the bidder number printed on it (string or number; none = blank). rot tilts it about the grip.
 *  back = show the plain back (red rim, no number) - e.g. seen from behind. */
export const Paddle: React.FC<{ x: number; y: number; scale?: number; number?: string | number; rot?: number; color?: string; back?: boolean }> =
  ({ x, y, scale = 1, number, rot = 0, color = AUCTION.paddleRim, back = false }) => {
    const label = number === undefined ? "" : String(number);
    return (
      <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)}) scale(${r2(scale * 1000) / 1000})`}>
        <rect x={-11} y={-110} width={22} height={112} rx={10} fill={AUCTION.handle} stroke={INK} strokeWidth={6} />
        <ellipse cx={0} cy={-166} rx={70} ry={62} fill={back ? color : AUCTION.paddle} stroke={INK} strokeWidth={8} />
        <ellipse cx={0} cy={-166} rx={56} ry={48} fill="none" stroke={back ? mix(color, INK, 0.25) : color} strokeWidth={8} />
        {!back && label && <text x={0} y={r2(-166 + fit(label, 92, 64) * 0.36)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(label, 92, 64))} fill={INK}>{label}</text>}
        <path d="M -40 -196 Q -30 -214 -10 -220" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={7} fill="none" strokeLinecap="round" />
      </g>
    );
  };

export const PODIUM = { top: 202, w: 250 } as const;
/** Wooden lectern, x = centre, y = floor (on the stage: hallGeom().stageTop). Slanted top at y - 202*scale (just
 *  above the hips of a behindPodium Person), front panel with a gold crest (no text). Draw AFTER the auctioneer so it
 *  hides the lower body. */
export const Podium: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={3} rx={150} ry={14} fill={SHADOW} opacity={0.25} />
    <rect x={-120} y={-24} width={240} height={24} rx={6} fill={AUCTION.wood2} stroke={INK} strokeWidth={7} />
    <path d="M -100 -24 L -112 -182 L 112 -182 L 100 -24 Z" fill={AUCTION.wood} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -78 -44 L -86 -160 L 86 -160 L 78 -44 Z" fill="none" stroke={AUCTION.wood2} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -90 -54 L -98 -166" stroke={AUCTION.woodHi} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
    {/* crest */}
    <path d="M 0 -146 L 36 -135 L 32 -94 Q 25 -72 0 -62 Q -25 -72 -32 -94 L -36 -135 Z" fill={AUCTION.emblem} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 0 -130 L 8 -111 L 27 -111 L 12 -99 L 17 -80 L 0 -91 L -17 -80 L -12 -99 L -27 -111 L -8 -111 Z" fill={AUCTION.wood} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    {/* slanted top */}
    <path d="M -132 -184 L 132 -184 L 122 -212 L -122 -212 Z" fill={AUCTION.woodHi} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -132 -184 L 132 -184 L 132 -174 L -132 -174 Z" fill={AUCTION.wood2} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </g>
);
/** y of the podium's top surface (put the GavelBlock here) */
export const podiumTop = (pod: { y: number; scale?: number }) => pod.y - 202 * (pod.scale ?? 1);
/** Person props for the auctioneer standing behind a Podium (same floor, draw the Person before the Podium). The
 *  Person is 1.05x the podium scale; dx = sideways offset in podium px. */
export const behindPodium = (pod: { x: number; y: number; scale?: number }, dx = 0) => {
  const s = pod.scale ?? 1;
  return { x: r2(pod.x + dx * s), y: r2(pod.y - 8 * s), scale: r2(s * 1.05 * 1000) / 1000 };
};

/** Round sound block for the gavel, x = centre, y = the surface it sits on. */
export const GavelBlock: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -46 -8 L -46 0 A 46 10 0 0 0 46 0 L 46 -8 Z" fill={AUCTION.gavel2} stroke={INK} strokeWidth={5} />
    <path d="M -46 -20 L -46 -8 A 46 10 0 0 0 46 -8 L 46 -20 Z" fill={AUCTION.gavel} stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={-20} rx={46} ry={10} fill={AUCTION.woodHi} stroke={INK} strokeWidth={5} />
  </g>
);

export const GAVEL = { handle: 112, head: 124 } as const;
/** Gavel: x, y = the grip (end of the handle); the handle runs "up" (local -y) 112 px to the barrel head, which lies
 *  across it (96 x 46). rot (deg, clockwise) aims the handle; 0 = straight up. hand = a skin colour to draw a fist
 *  over the grip (when the arm is drawn under it). */
export const Gavel: React.FC<{ x: number; y: number; scale?: number; rot?: number; hand?: string }> = ({ x, y, scale = 1, rot = 0, hand }) => (
  <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)}) scale(${scale})`}>
    <rect x={-9} y={-GAVEL.handle} width={18} height={GAVEL.handle + 14} rx={9} fill={AUCTION.gavel} stroke={INK} strokeWidth={5} />
    <rect x={-48} y={-GAVEL.head - 23} width={96} height={46} rx={16} fill={AUCTION.gavel} stroke={INK} strokeWidth={6} />
    {[-1, 1].map((d) => <rect key={d} x={d * 30 - 5} y={-GAVEL.head - 24} width={10} height={48} fill={AUCTION.gavelBand} stroke={INK} strokeWidth={3} />)}
    <path d={`M -34 ${-GAVEL.head - 12} L 22 ${-GAVEL.head - 12}`} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" />
    {hand && <circle cx={0} cy={-6} r={15} fill={hand} stroke={INK} strokeWidth={5} />}
  </g>
);

/** Gavel bang timing. at = the frame the head hits. lift 0..1 (1 = raised high): rests low before the swing, winds up
 *  over 10 frames (arrival ease), slams down in 4 (accelerating), small rebound after. impact 0..1 = flash right
 *  after the hit (decays over 9 frames; use for BangLines, a camera kick, a sound cue). */
export const gavelBang = (f: number, at: number) => {
  const t = f - at;
  let lift: number;
  if (t < -14) lift = 0.25;
  else if (t < -4) lift = 0.25 + 0.75 * ease((t + 14) / 10);
  else if (t <= 0) lift = 1 - easeIn((t + 4) / 4);
  else lift = 0.18 * Math.exp(-(t) / 4) * Math.abs(Math.sin(t * 0.7));
  const impact = t < 0 || t > 9 ? 0 : 1 - t / 9;
  return { lift: clamp01(lift), impact };
};

type PersonP = { x: number; y: number; scale?: number; facing?: 1 | -1; pose: Pose; rot?: number };
const elbowPos = (p: PersonP, side: "L" | "R") => {
  const s = p.scale ?? 1, facing = p.facing ?? 1, pose = p.pose;
  const crouch = (pose.crouch ?? 0) * 140, hipY = -150 + crouch, shY = -285 + crouch * 0.9;
  const [a] = side === "L" ? pose.armL : pose.armR, d = pose.profile ? facing : side === "L" ? -1 : 1;
  const ex = (side === "L" ? -42 : 42) + Math.sin(rad(a)) * d * 70, ey = shY + 14 + Math.cos(rad(a)) * 70;
  const r = rad((pose.lean ?? 0) * facing + (p.rot ?? 0)), dy = ey - hipY;
  return { x: p.x + (ex * Math.cos(r) - dy * Math.sin(r)) * s, y: p.y + (hipY + ex * Math.sin(r) + dy * Math.cos(r)) * s };
};

/** The auctioneer's gavel arm for frame f: returns the Person pose (armR swings; pass it to the Person WITHOUT t so the
 *  idle sway doesn't move the hand) and the Gavel props (grip in the hand, head aimed at the block; at the hit frame the
 *  head lands on block). p = the auctioneer's props (behindPodium + facing + base pose), block = the GavelBlock's top
 *  centre (x, podiumTop - 20*scale). Draw: Person -> Podium -> GavelBlock -> <Gavel {...gavel} hand={look.skin}/>. */
export const auctioneerBang = (p: PersonP, block: Pt, f: number, at: number) => {
  const s = p.scale ?? 1, { lift, impact } = gavelBang(f, at);
  const L = (GAVEL.head + 23) * s * 0.92;
  const strike = { x: block.x + 18 * s, y: block.y - L };
  const raised = { x: p.x + 150 * s, y: p.y - 470 * s };
  const target = { x: strike.x + (raised.x - strike.x) * lift, y: strike.y + (raised.y - strike.y) * lift };
  const pose = reachLimb(p, "armR", target, 1);
  const hand = handPos({ ...p, pose }, "R"), elbow = elbowPos({ ...p, pose }, "R");
  const fd = { x: hand.x - elbow.x, y: hand.y - elbow.y }, fl = Math.hypot(fd.x, fd.y) || 1;
  const bd = { x: block.x - hand.x, y: block.y - hand.y }, bl = Math.hypot(bd.x, bd.y) || 1;
  const k = clamp01(lift * 1.4);
  const dir = { x: (bd.x / bl) * (1 - k) + (fd.x / fl) * k, y: (bd.y / bl) * (1 - k) + (fd.y / fl) * k };
  const rot = deg(Math.atan2(dir.x, -dir.y));
  return { pose, gavel: { x: r2(hand.x), y: r2(hand.y), rot: r2(rot), scale: s }, impact, lift };
};

/** Short impact lines bursting around (x, y) as impact goes 1 -> 0 (from gavelBang). */
export const BangLines: React.FC<{ x: number; y: number; impact: number; scale?: number; color?: string; n?: number }> = ({ x, y, impact, scale = 1, color = AUCTION.gold, n = 8 }) => {
  if (impact <= 0) return null;
  const grow = 1 - impact;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={r2(Math.min(1, impact * 1.6) * 100) / 100}>
      {Array.from({ length: n }, (_, i) => {
        const a = rad(-180 + (i + 0.5) * (180 / n)), r0 = 90 + grow * 70, r1 = r0 + 56 - grow * 24;
        const d = `M ${r2(Math.cos(a) * r0)} ${r2(Math.sin(a) * r0 * 0.8)} L ${r2(Math.cos(a) * r1)} ${r2(Math.sin(a) * r1 * 0.8)}`;
        return <g key={i}><path d={d} stroke={INK} strokeWidth={16} strokeLinecap="round" /><path d={d} stroke={color} strokeWidth={8} strokeLinecap="round" /></g>;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- coins + jar
const COIN_COLS: readonly (readonly [string, string])[] = [[AUCTION.gold, AUCTION.gold2], [AUCTION.silver, AUCTION.silver2], [AUCTION.copper, AUCTION.copper2], [AUCTION.gold, AUCTION.gold2]];
const coinFace = (cx: number, cy: number, rx: number, k: number, key: string, tilt = 0.32) => {
  const [c1, c2] = COIN_COLS[k % COIN_COLS.length], ry = rx * tilt, th = rx * 0.22;
  return <g key={key}>
    <path d={`M ${r2(cx - rx)} ${r2(cy)} L ${r2(cx - rx)} ${r2(cy + th)} A ${r2(rx)} ${r2(ry)} 0 0 0 ${r2(cx + rx)} ${r2(cy + th)} L ${r2(cx + rx)} ${r2(cy)} Z`} fill={c2} stroke={INK} strokeWidth={3} />
    <ellipse cx={r2(cx)} cy={r2(cy)} rx={r2(rx)} ry={r2(ry)} fill={c1} stroke={INK} strokeWidth={3} />
    <ellipse cx={r2(cx)} cy={r2(cy)} rx={r2(rx * 0.58)} ry={r2(ry * 0.58)} fill="none" stroke={c2} strokeWidth={2.5} />
  </g>;
};

/** A neat stack of coins, x = centre, y = bottom; count coins (each 9 px thick at scale 1, 48 wide). kind 0 gold,
 *  1 silver, 2 copper. */
export const CoinStack: React.FC<{ x: number; y: number; count: number; scale?: number; kind?: number }> = ({ x, y, count, scale = 1, kind = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {Array.from({ length: Math.max(0, Math.floor(count)) }, (_, i) => coinFace(((i * 7) % 5) - 2, -8 - i * 9, 24, kind, "c" + i, 0.3))}
  </g>
);

/** Loose heap of coins on a surface, x = centre, y = the surface; count coins (mixed gold/silver/copper), mound ~
 *  sqrt(count)*30 wide and ~sqrt(count)*6 high at scale 1. Deterministic per seed. */
export const CoinPile: React.FC<{ x: number; y: number; count: number; scale?: number; seed?: number }> = ({ x, y, count, scale = 1, seed = 1 }) => {
  const n = Math.max(0, Math.floor(count)), R = rng(seed + 31), W = Math.sqrt(n) * 15 + 20, Hm = Math.sqrt(n) * 6;
  const coins = Array.from({ length: n }, (_, i) => {
    const a = i * 2.39996 + R() * 0.4, rr = Math.sqrt((i + 0.5) / Math.max(1, n)) * W;
    const h = (1 - rr / W) * Hm;
    return { x: Math.cos(a) * rr, depth: Math.sin(a) * rr * 0.28, h, k: Math.floor(R() * 4), rx: 19 + R() * 5 };
  }).sort((a, b) => (a.h - b.h) || (a.depth - b.depth));
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={W + 22} ry={(W + 22) * 0.22} fill={SHADOW} opacity={0.18} />
      {coins.map((c, i) => coinFace(c.x, c.depth - c.h - 6, c.rx, c.k, "p" + i))}
    </g>
  );
};

export const JAR = { w: 300, h: 470 } as const;
/** Big glass jar of coins, x = centre, y = bottom; ~300 x 470 at scale 1 (lid at the top). fill 0..1 = how full
 *  (coins packed in jumbled layers, gold/silver/copper). Cached (key includes fill to 0.02 steps). Deterministic. */
export const CoinJar: React.FC<{ x: number; y: number; scale?: number; fill?: number; seed?: number }> = ({ x, y, scale = 1, fill = 0.85, seed = 1 }) => {
  const fl = Math.round(clamp01(fill) * 50) / 50, R = rng(seed + 7);
  const bodyTop = -400, inner = { x0: -132, x1: 132, y0: bodyTop + 14, y1: -14 };
  const level = inner.y1 - (inner.y1 - inner.y0 - 10) * fl;
  const coins: React.ReactElement[] = [];
  let k = 0;
  for (let yy = inner.y1 - 6; yy > level; yy -= 11) {
    const shift = R() * 30;
    for (let xx = inner.x0 - 10 + shift; xx < inner.x1 + 20; xx += 34 + R() * 10) {
      const edge = R() < 0.07, cx = xx + (R() - 0.5) * 8, cy = yy + (R() - 0.5) * 6, kind = Math.floor(R() * 4);
      if (edge) { const [c1] = COIN_COLS[kind]; coins.push(<ellipse key={"e" + k++} cx={r2(cx)} cy={r2(cy - 6)} rx={7} ry={18} fill={c1} stroke={INK} strokeWidth={3} transform={`rotate(${r2((R() - 0.5) * 50)} ${r2(cx)} ${r2(cy - 6)})`} />); }
      else coins.push(coinFace(cx, cy, 17 + R() * 4, kind, "j" + k++, 0.34));
    }
  }
  const id = `jar-clip-${seed}-${fl}`;
  const body = `M -110 ${bodyTop} L 110 ${bodyTop} Q 150 ${bodyTop} 150 ${bodyTop + 40} L 150 -36 Q 150 0 114 0 L -114 0 Q -150 0 -150 -36 L -150 ${bodyTop + 40} Q -150 ${bodyTop} -110 ${bodyTop} Z`;
  const box = { x: x - 170 * scale, y: y - (JAR.h + 20) * scale, w: 340 * scale, h: (JAR.h + 40) * scale };
  return (
    <CachedSvg cacheKey={`coin-jar-${x}-${y}-${scale}-${fl}-${seed}`} {...box}>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <ellipse cx={0} cy={4} rx={170} ry={18} fill={SHADOW} opacity={0.25} />
        <defs><clipPath id={id}><path d={body} /></clipPath></defs>
        <path d={body} fill={AUCTION.glass} opacity={0.35} />
        <g clipPath={`url(#${id})`}>
          {coins}
          {fl > 0 && <path d={`M -160 ${r2(level + 4)} Q -60 ${r2(level - 10)} 0 ${r2(level + 2)} Q 70 ${r2(level + 12)} 160 ${r2(level - 4)}`} stroke={AUCTION.gold2} strokeWidth={4} fill="none" opacity={0.6} />}
        </g>
        {/* glass: highlights + outline */}
        <path d={`M -120 ${bodyTop + 50} L -120 -60`} stroke="#ffffff" strokeOpacity={0.65} strokeWidth={16} strokeLinecap="round" />
        <path d={`M -92 ${bodyTop + 60} L -92 ${bodyTop + 170}`} stroke="#ffffff" strokeOpacity={0.5} strokeWidth={8} strokeLinecap="round" />
        <path d={`M 122 ${bodyTop + 80} L 122 -90`} stroke="#ffffff" strokeOpacity={0.3} strokeWidth={8} strokeLinecap="round" />
        <path d={body} fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        {/* neck + lid */}
        <path d={`M -100 ${bodyTop} L -100 ${bodyTop - 26} L 100 ${bodyTop - 26} L 100 ${bodyTop}`} fill={AUCTION.glass} fillOpacity={0.5} stroke={INK} strokeWidth={7} />
        <rect x={-116} y={bodyTop - 70} width={232} height={48} rx={10} fill={AUCTION.lid} stroke={INK} strokeWidth={7} />
        {Array.from({ length: 9 }, (_, i) => <path key={"r" + i} d={`M ${-96 + i * 24} ${bodyTop - 62} L ${-96 + i * 24} ${bodyTop - 30}`} stroke={AUCTION.lid2} strokeWidth={5} />)}
        <path d={`M -104 ${bodyTop - 60} L 104 ${bodyTop - 60}`} stroke="#fff3c0" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
        {/* coin slot in the lid */}
        <ellipse cx={0} cy={bodyTop - 70} rx={112} ry={14} fill={AUCTION.lid} stroke={INK} strokeWidth={6} />
        <rect x={-34} y={bodyTop - 76} width={68} height={12} rx={6} fill={INK} />
      </g>
    </CachedSvg>
  );
};

// ---------------------------------------------------------------- signs + board + tag
/** "SOLD" stamp sign: a cream card with a red double border and red letters, tilted. stamp 0..1 = progress of the
 *  slam (0 hidden, scales 1.8 -> 1 and fades in; at 1 it rests with a faint ring). x, y = centre, ~560 x 230 at
 *  scale 1. text defaults to "SOLD". */
export const SoldSign: React.FC<{ x: number; y: number; scale?: number; stamp?: number; text?: string; rot?: number }> = ({ x, y, scale = 1, stamp = 1, text = "SOLD", rot = -8 }) => {
  const p = clamp01(stamp);
  if (p <= 0) return null;
  const k = 1 + 0.8 * (1 - ease(p)), o = Math.min(1, p * 2.2);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r2(scale * k * 1000) / 1000})`} opacity={r2(o * 100) / 100}>
      {p >= 1 && <rect x={-300} y={-135} width={600} height={270} rx={28} fill="none" stroke={AUCTION.sold} strokeWidth={4} opacity={0.3} />}
      <rect x={-280} y={-115} width={560} height={230} rx={22} fill={AUCTION.soldPaper} stroke={INK} strokeWidth={8} />
      <rect x={-258} y={-93} width={516} height={186} rx={14} fill="none" stroke={AUCTION.sold} strokeWidth={12} />
      <rect x={-240} y={-75} width={480} height={150} rx={8} fill="none" stroke={AUCTION.sold} strokeWidth={5} />
      <text x={0} y={r2(fit(text, 420, 140) * 0.36)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(text, 420, 140))} fill={AUCTION.sold} letterSpacing={6}>{text}</text>
    </g>
  );
};

/** Flip-digit price board (split-flap): one dark cell per character of `value` (e.g. "$10.50"), cream characters,
 *  brass frame with two bulbs, optional `label` above the cells (via prop). Animate a change with prev + flip 0..1:
 *  characters that differ flip (top flap falls over the first half, bottom flap lands over the second half).
 *  x, y = centre of the cells; cells 86 x 124 at scale 1. Shorter strings are right-aligned to the longer one. */
export const PriceBoard: React.FC<{ x: number; y: number; value: string; prev?: string; flip?: number; scale?: number; label?: string }> =
  ({ x, y, value, prev, flip = 1, scale = 1, label }) => {
    const n = Math.max(value.length, prev?.length ?? 0), cur = value.padStart(n, " "), old = (prev ?? value).padStart(n, " ");
    const CW = 86, CH = 124, gap = 12, W = n * CW + (n - 1) * gap, t = clamp01(flip);
    const idBase = `pb-${Math.round(x)}-${Math.round(y)}`;
    const glyph = (ch: string, k: string) => ch.trim() ? <text key={k} x={0} y={CH * 0.33} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={AUCTION.digit}>{ch}</text> : null;
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <defs>
          <clipPath id={`${idBase}-t`}><rect x={-CW / 2} y={-CH / 2} width={CW} height={CH / 2} /></clipPath>
          <clipPath id={`${idBase}-b`}><rect x={-CW / 2} y={0} width={CW} height={CH / 2} /></clipPath>
        </defs>
        <rect x={-W / 2 - 34} y={-CH / 2 - (label ? 92 : 30)} width={W + 68} height={CH + (label ? 122 : 60)} rx={20} fill={AUCTION.flipFrame} stroke={INK} strokeWidth={8} />
        <rect x={-W / 2 - 24} y={-CH / 2 - (label ? 82 : 20)} width={W + 48} height={CH + (label ? 102 : 40)} rx={14} fill="none" stroke={AUCTION.lid} strokeWidth={5} />
        {[-1, 1].map((d) => <circle key={d} cx={d * (W / 2 + 4)} cy={-CH / 2 - (label ? 62 : 6)} r={9} fill={AUCTION.lamp} stroke={INK} strokeWidth={3} />)}
        {label && <text x={0} y={-CH / 2 - 36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(label, W - 40, 44))} fill={AUCTION.lid}>{label}</text>}
        {Array.from({ length: n }, (_, i) => {
          const cx = -W / 2 + CW / 2 + i * (CW + gap), a = old[i], b = cur[i], changing = a !== b && t < 1;
          const half = (ch: string, part: "t" | "b", k: string, sy = 1, flap = false) => (
            <g key={k} clipPath={`url(#${idBase}-${part})`}>
              <g transform={`scale(1 ${r2(sy * 1000) / 1000})`}>
                <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} rx={10} fill={mix(part === "t" ? AUCTION.cell : AUCTION.cell2, "#ffffff", flap ? 0.14 : 0)} stroke={flap ? INK : "none"} strokeWidth={4} />
                {glyph(ch, k + "g")}
              </g>
            </g>
          );
          return <g key={i} transform={`translate(${cx} 0)`}>
            <rect x={-CW / 2 - 3} y={-CH / 2 - 3} width={CW + 6} height={CH + 6} rx={12} fill={INK} />
            {!changing ? <>{half(b, "t", "st")}{half(b, "b", "sb")}</> : t < 0.5 ? <>
              {half(b, "t", "nt")}{half(a, "b", "ob")}{half(a, "t", "ft", Math.cos(t * Math.PI), true)}
            </> : <>
              {half(b, "t", "nt")}{half(a, "b", "ob")}{half(b, "b", "fb", -Math.cos(t * Math.PI), true)}
            </>}
            <path d={`M ${-CW / 2} 0 L ${CW / 2} 0`} stroke={INK} strokeWidth={4} />
            {[-1, 1].map((d) => <circle key={d} cx={d * (CW / 2 - 4)} cy={0} r={4} fill={AUCTION.silver2} />)}
          </g>;
        })}
      </g>
    );
  };

/** Hanging manila luggage tag with a big "?" badge and `text` (e.g. "HOW MUCH?"). (x, y) = where the string is tied;
 *  the tag hangs below-right on a twine. rot swings it about the tie point. ~440 x 150 at scale 1 (text auto-fits, ~12 characters read best). */
export const QuestionTag: React.FC<{ x: number; y: number; text: string; scale?: number; rot?: number; twine?: number; mark?: boolean }> =
  ({ x, y, text, scale = 1, rot = 0, twine = 80, mark = true }) => {
    const W = 440, H = 150, tx = 0, ty = twine, bx = tx + 96, t0 = mark ? bx + 50 : tx + 64, tw = W - 24 - t0;
    const shape = `M ${tx} ${ty + 30} L ${tx + 40} ${ty} L ${tx + W} ${ty} L ${tx + W} ${ty + H} L ${tx + 40} ${ty + H} L ${tx} ${ty + H - 30} Z`;
    const fs = fit(text, tw, 56);
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
        <path d={`M 0 0 Q -10 ${ty * 0.5} ${tx + 30} ${ty + H / 2}`} stroke={AUCTION.twine} strokeWidth={5} fill="none" />
        <circle cx={0} cy={0} r={6} fill={AUCTION.twine} stroke={INK} strokeWidth={3} />
        <path d={shape} fill={AUCTION.tag} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <path d={`M ${tx + 14} ${ty + H - 18} L ${tx + W - 14} ${ty + H - 18}`} stroke={AUCTION.tag2} strokeWidth={5} strokeLinecap="round" />
        <circle cx={tx + 30} cy={ty + H / 2} r={11} fill={AUCTION.tag2} stroke={INK} strokeWidth={4} />
        {mark && <g>
          <circle cx={bx} cy={ty + H / 2} r={38} fill={AUCTION.sold} stroke={INK} strokeWidth={6} />
          <text x={bx} y={ty + H / 2 + 20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill="#ffffff">?</text>
        </g>}
        <text x={r2(t0 + tw / 2)} y={r2(ty + H / 2 + fs * 0.36)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fs)} fill={INK}>{text}</text>
      </g>
    );
  };

/** Deterministic confetti burst from (x, y). f = frames since the burst (< 0: nothing). Pieces fly up in a cone
 *  (spread px wide-ish), slow down with air drag, then flutter down (spin + sway). count default 60. */
export const Confetti: React.FC<{ x: number; y: number; f: number; count?: number; spread?: number; power?: number; seed?: number; colors?: readonly string[]; scale?: number }> =
  ({ x, y, f, count = 60, spread = 1, power = 1, seed = 1, colors = [LAB.gold, LAB.red, "#2d6fd8", LAB.green, "#e85a8a", "#3fb8c9", "#ffffff"], scale = 1 }) => {
    if (f < 0) return null;
    const R = rng(seed + 211), k = 0.075, g = 0.85;
    return (
      <g>
        {Array.from({ length: count }, (_, i) => {
          const a = rad(-90 + (R() - 0.5) * 110 * spread), v = (16 + R() * 22) * power, vx = Math.cos(a) * v, vy = Math.sin(a) * v;
          const e = (1 - Math.exp(-k * f)) / k;
          const px = x + vx * e + Math.sin(f * 0.15 + i) * 14 * Math.min(1, f / 20);
          const py = y + (vy + g / k) * e - (g / k) * f;
          const spin = f * (0.2 + R() * 0.25) + R() * 6, col = colors[Math.floor(R() * colors.length)], shape = R();
          const sx = Math.cos(spin);
          return <g key={i} transform={`translate(${r2(px)} ${r2(py)}) rotate(${r2(deg(spin * 0.6) % 360)}) scale(${r2(Math.max(0.12, Math.abs(sx)) * scale * 100) / 100} ${scale})`}>
            {shape < 0.7 ? <rect x={-8} y={-13} width={16} height={26} rx={3} fill={col} stroke={INK} strokeWidth={3} /> : <circle cx={0} cy={0} r={9} fill={col} stroke={INK} strokeWidth={3} />}
          </g>;
        })}
      </g>
    );
  };

// ================================================================ wardrobe (PersonPart, same props as the Person)
type Wear = { x: number; y: number; scale?: number; facing?: 1 | -1; pose?: Pose; rot?: number };

/** Auctioneer's bow tie at the collar (front-view poses; in profile it shows edge-on at the throat). */
export const BowTie: React.FC<Wear & { color?: string; color2?: string }> = ({ color = AUCTION.bow, color2 = AUCTION.bow2, ...p }) => {
  const side = !!p.pose?.profile, f = p.facing ?? 1;
  const crouch = (p.pose?.crouch ?? 0) * 140, shY = -285 + crouch * 0.9, yy = shY - 2 - crouch;
  return (
    <PersonPart {...p} part="body">
      {side
        ? <g transform={`translate(${f * 22} ${yy})`}><path d="M -8 -14 L 8 -6 L 8 6 L -8 14 Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" /></g>
        : <g transform={`translate(${f * 4} ${yy})`}>
          <path d="M 0 0 L -34 -18 Q -40 0 -34 18 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 0 0 L 34 -18 Q 40 0 34 18 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -26 -8 L -12 -2 M 26 -8 L 12 -2" stroke={color2} strokeWidth={4} strokeLinecap="round" />
          <rect x={-9} y={-10} width={18} height={20} rx={6} fill={color2} stroke={INK} strokeWidth={4} />
        </g>}
    </PersonPart>
  );
};

/** Auctioneer's blazer details over the jersey (make the Look's jersey the blazer colour): white shirt V with
 *  lapels, gold pocket square, two buttons. Front-view poses; in profile a single lapel edge + pocket square. */
export const Blazer: React.FC<Wear & { color: string; shirt?: string; pocket?: string }> = ({ color, shirt = AUCTION.shirt, pocket = AUCTION.pocket, ...p }) => {
  const side = !!p.pose?.profile, f = p.facing ?? 1;
  const crouch = (p.pose?.crouch ?? 0) * 140, shY = -285 + crouch * 0.9 - crouch, hipY = -150 + crouch - crouch;
  const lap = mix(color, INK, 0.25);
  return (
    <PersonPart {...p} part="body">
      {side ? <g>
        <path d={`M ${f * 18} ${shY + 4} L ${f * 34} ${shY + 70} L ${f * 20} ${hipY - 10}`} stroke={lap} strokeWidth={8} fill="none" strokeLinejoin="round" />
        <path d={`M ${f * 2} ${shY + 64} L ${f * 18} ${shY + 64} L ${f * 16} ${shY + 74} L ${f * 4} ${shY + 74} Z`} fill={pocket} stroke={INK} strokeWidth={3} />
      </g> : <g transform={`translate(${f * 0} 0)`}>
        <path d={`M -26 ${shY - 6} L 26 ${shY - 6} L 0 ${shY + 78} Z`} fill={shirt} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M -28 ${shY - 6} L -6 ${shY + 80} L -20 ${shY + 40} L -40 ${shY + 30} Z`} fill={lap} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M 28 ${shY - 6} L 6 ${shY + 80} L 20 ${shY + 40} L 40 ${shY + 30} Z`} fill={lap} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M 0 ${shY + 80} L 0 ${hipY + 4}`} stroke={INK} strokeWidth={3.5} opacity={0.55} />
        {[shY + 98, shY + 122].map((by) => <circle key={by} cx={6} cy={by} r={5} fill={AUCTION.lid} stroke={INK} strokeWidth={2.5} />)}
        <path d={`M -42 ${shY + 50} L -18 ${shY + 50} L -21 ${shY + 62} L -40 ${shY + 62} Z`} fill={lap} stroke={INK} strokeWidth={3} />
        <path d={`M -38 ${shY + 50} L -33 ${shY + 38} L -28 ${shY + 48} L -23 ${shY + 40} L -21 ${shY + 50} Z`} fill={pocket} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      </g>}
    </PersonPart>
  );
};

/** Convenience: the auctioneer (Person + Blazer + BowTie) in one element. Same props as the Person. */
export const Auctioneer: React.FC<Wear & { look: Look; pose: Pose; expr?: React.ComponentProps<typeof Person>["expr"]; blink?: boolean; t?: number; shadow?: number }> =
  ({ look, pose, expr = "smile", blink, t, shadow, ...w }) => (
    <g>
      <Person {...w} look={look} pose={pose} expr={expr} blink={blink} t={t} shadow={shadow} />
      <Blazer {...w} pose={pose} color={look.jersey} />
      <BowTie {...w} pose={pose} />
    </g>
  );

// ================================================================ lab props
/** Guesses on a number line: x = left end, y = the axis line, w = width. Each value is a dot (values in the same
 *  bin stack upward, beeswarm). truth = a green vertical line (truthLabel above it), the average = gold triangle +
 *  dashed line (avgLabel), highlightMax = the highest guess turns red, bigger, with a glow ring (maxLabel).
 *  reveal 0..1 pops the dots in (in array order), showTruth / showAvg / glow 0..1 fade those parts in.
 *  domain = [min, max] of the axis (default: the data +- 8 %). ends = optional end labels under the axis.
 *  Dots are 34 px; stacks rise ~36 px per dot (keep about <= 8 per bin). */
export const GuessDots: React.FC<{ x: number; y: number; w: number; values: number[]; truth: number; highlightMax?: boolean; reveal?: number;
  showTruth?: number; showAvg?: number; glow?: number; domain?: [number, number]; ends?: [string, string]; truthLabel?: string; avgLabel?: string; maxLabel?: string;
  height?: number; dot?: number }> =
  ({ x, y, w, values, truth, highlightMax = false, reveal = 1, showTruth = 1, showAvg = 0, glow = 1, domain, ends, truthLabel, avgLabel, maxLabel, height = 360, dot = 34 }) => {
    const all = [...values, truth], lo0 = Math.min(...all), hi0 = Math.max(...all), pad = (hi0 - lo0 || 1) * 0.08;
    const [lo, hi] = domain ?? [lo0 - pad, hi0 + pad];
    const X = (v: number) => x + ((v - lo) / (hi - lo || 1)) * w;
    const bin = dot * 1.05, counts = new Map<number, number>();
    let maxI = 0;
    values.forEach((v, i) => { if (v > values[maxI]) maxI = i; });
    const dots = values.map((v, i) => {
      const b = Math.round((X(v) - x) / bin), k = counts.get(b) ?? 0;
      counts.set(b, k + 1);
      return { cx: x + b * bin, cy: y - dot * 0.75 - k * dot * 1.06, i };
    });
    const avg = values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
    const n = values.length, shown = reveal * n;
    const tX = X(truth), aX = X(avg), m = dots[maxI];
    const fs = 44;
    return (
      <g>
        {/* axis */}
        <path d={`M ${x - 20} ${y} L ${x + w + 20} ${y}`} stroke={INK} strokeWidth={18} strokeLinecap="round" />
        <path d={`M ${x - 20} ${y} L ${x + w + 20} ${y}`} stroke={LAB.text} strokeWidth={8} strokeLinecap="round" />
        {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M ${r2(x + (w * i) / 10)} ${y + 10} L ${r2(x + (w * i) / 10)} ${y + (i % 5 ? 26 : 40)}`} stroke={LAB.muted} strokeWidth={i % 5 ? 4 : 6} strokeLinecap="round" />)}
        {ends && <text x={x} y={y + 92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={LAB.muted}>{ends[0]}</text>}
        {ends && <text x={x + w} y={y + 92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={LAB.muted}>{ends[1]}</text>}
        {/* truth line */}
        {showTruth > 0 && <g opacity={r2(clamp01(showTruth) * 100) / 100}>
          <path d={`M ${r2(tX)} ${y + 8} L ${r2(tX)} ${y - height}`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
          <path d={`M ${r2(tX)} ${y + 8} L ${r2(tX)} ${y - height}`} stroke={LAB.green} strokeWidth={7} strokeLinecap="round" />
          {truthLabel && <text x={r2(tX)} y={y - height - 22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(truthLabel, 340, fs))} fill={LAB.green}>{truthLabel}</text>}
        </g>}
        {/* glow behind the max */}
        {highlightMax && shown > maxI && glow > 0 && <g opacity={r2(clamp01(glow) * 100) / 100}>
          <circle cx={r2(m.cx)} cy={r2(m.cy)} r={dot * 1.6} fill={LAB.red} opacity={0.18} />
          <circle cx={r2(m.cx)} cy={r2(m.cy)} r={dot * 1.1} fill={LAB.red} opacity={0.28} />
        </g>}
        {dots.map((d) => {
          const p = clamp01(shown - d.i);
          if (p <= 0) return null;
          const isMax = highlightMax && d.i === maxI, s = (0.4 + 0.6 * ease(p)) * (isMax ? 1 + 0.35 * clamp01(glow) : 1);
          const col = isMax ? mix(LAB.orange, LAB.red, clamp01(glow)) : LAB.orange;
          return <circle key={d.i} cx={r2(d.cx)} cy={r2(d.cy)} r={r2((dot / 2) * s)} fill={col} stroke={INK} strokeWidth={5} opacity={r2(Math.min(1, p * 2) * 100) / 100} />;
        })}
        {highlightMax && maxLabel && shown > maxI && glow > 0 && <text x={r2(Math.min(x + w, m.cx))} y={r2(m.cy - dot * 1.4)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(maxLabel, 320, fs))} fill={LAB.red} opacity={r2(clamp01(glow) * 100) / 100}>{maxLabel}</text>}
        {/* average */}
        {showAvg > 0 && <g opacity={r2(clamp01(showAvg) * 100) / 100}>
          <path d={`M ${r2(aX)} ${y - 6} L ${r2(aX)} ${y - height * 0.72}`} stroke={LAB.gold} strokeWidth={6} strokeDasharray="14 12" strokeLinecap="round" />
          <path d={`M ${r2(aX)} ${y + 14} L ${r2(aX - 22)} ${y + 52} L ${r2(aX + 22)} ${y + 52} Z`} fill={LAB.gold} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          {avgLabel && <text x={r2(aX)} y={y + 120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(avgLabel, 320, fs))} fill={LAB.gold}>{avgLabel}</text>}
        </g>}
      </g>
    );
  };
/** x of a value on a GuessDots with the same props (e.g. to point an arrow at the truth) */
export const guessX = (p: { x: number; w: number; values: number[]; truth: number; domain?: [number, number] }, v: number) => {
  const all = [...p.values, p.truth], lo0 = Math.min(...all), hi0 = Math.max(...all), pad = (hi0 - lo0 || 1) * 0.08;
  const [lo, hi] = p.domain ?? [lo0 - pad, hi0 + pad];
  return p.x + ((v - lo) / (hi - lo || 1)) * p.w;
};

/** Three bars: [truth, average bid, winning bid] in green / gold / red, x = centre, y = baseline, h = height of the
 *  max value (default 600), barW (default 200), gap (default 70). grow 0..1 (one number for all, or one per bar) grows
 *  them up. labels under the baseline, valueTexts above the bars (both via props). truthLine draws a dashed green
 *  line across at the truth height so "winning > truth" reads at a glance. */
export const BarTrio: React.FC<{ x: number; y: number; values: [number, number, number]; labels: [string, string, string]; valueTexts?: [string, string, string];
  grow?: number | [number, number, number]; h?: number; barW?: number; gap?: number; max?: number; truthLine?: boolean; colors?: [string, string, string] }> =
  ({ x, y, values, labels, valueTexts, grow = 1, h = 600, barW = 200, gap = 70, max, truthLine = true, colors = [LAB.green, LAB.gold, LAB.red] }) => {
    const M = max ?? Math.max(...values), W = barW * 3 + gap * 2, gs = Array.isArray(grow) ? grow : [grow, grow, grow];
    const th = (values[0] / M) * h;
    return (
      <g>
        {values.map((v, i) => {
          const cx = x - W / 2 + barW / 2 + i * (barW + gap), bh = (v / M) * h * ease(clamp01(gs[i]));
          return <g key={i}>
            <rect x={cx - barW / 2} y={y - h} width={barW} height={h} rx={14} fill="#ffffff" opacity={0.05} />
            {bh > 1 && <rect x={cx - barW / 2} y={r2(y - bh)} width={barW} height={r2(bh)} rx={Math.min(14, bh / 2)} fill={colors[i]} stroke={INK} strokeWidth={8} />}
            {bh > 40 && <rect x={cx - barW / 2 + 16} y={r2(y - bh + 16)} width={14} height={r2(bh - 32)} rx={7} fill="#ffffff" opacity={0.3} />}
            <text x={cx} y={y + 70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(labels[i], barW + gap - 10, 44))} fill={LAB.text}>{labels[i]}</text>
            {valueTexts && gs[i] > 0.6 && <text x={cx} y={r2(y - bh - 24)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(valueTexts[i], barW + 20, 66))} fill={colors[i]} opacity={r2(clamp01((gs[i] - 0.6) / 0.3) * 100) / 100}>{valueTexts[i]}</text>}
          </g>;
        })}
        {truthLine && gs[0] >= 1 && <path d={`M ${x - W / 2 - 20} ${r2(y - th)} L ${x + W / 2 + 20} ${r2(y - th)}`} stroke={LAB.green} strokeWidth={6} strokeDasharray="18 14" strokeLinecap="round" />}
        <path d={`M ${x - W / 2 - 30} ${y} L ${x + W / 2 + 30} ${y}`} stroke={LAB.muted} strokeWidth={7} strokeLinecap="round" />
      </g>
    );
  };

/** Lattice oil derrick (lab colours), x = centre, y = ground; ~540 tall at scale 1. gush 0..1 = a black oil plume
 *  rising from the top (0 = none). */
export const OilDerrick: React.FC<{ x: number; y: number; scale?: number; gush?: number; color?: string }> = ({ x, y, scale = 1, gush = 0, color = AUCTION.derrick }) => {
  const H = 520, B = 130, T = 26, lvl = 6, c2 = AUCTION.derrick2;
  const at = (k: number) => ({ y: -H * (k / lvl), hw: B - (B - T) * (k / lvl) });
  const beams: string[] = [];
  for (let k = 0; k < lvl; k++) { const a = at(k), b = at(k + 1); beams.push(`M ${-a.hw} ${a.y} L ${b.hw} ${b.y} M ${a.hw} ${a.y} L ${-b.hw} ${b.y} M ${-b.hw} ${b.y} L ${b.hw} ${b.y}`); }
  const g = clamp01(gush);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {g > 0 && <g>
        <path d={`M -10 ${-H} Q ${-30 - 60 * g} ${-H - 200 * g} ${-80 * g} ${-H - 320 * g} Q 0 ${-H - 380 * g} ${80 * g} ${-H - 320 * g} Q ${30 + 60 * g} ${-H - 200 * g} 10 ${-H} Z`} fill={AUCTION.oil} stroke={LAB.muted} strokeWidth={6} />
        <path d={`M -4 ${-H - 20} Q ${-30 * g} ${-H - 180 * g} ${-50 * g} ${-H - 290 * g}`} stroke="#5a6690" strokeWidth={8} fill="none" strokeLinecap="round" />
        {[-1, 1].map((d) => <circle key={d} cx={d * 100 * g} cy={-H - 250 * g} r={16 * g} fill={AUCTION.oil} stroke={LAB.muted} strokeWidth={4} />)}
      </g>}
      <rect x={-170} y={-16} width={340} height={22} rx={8} fill={c2} stroke={INK} strokeWidth={6} />
      <path d={beams.join(" ")} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={beams.join(" ")} stroke={c2} strokeWidth={6} fill="none" strokeLinecap="round" />
      {[-1, 1].map((d) => <g key={d}>
        <path d={`M ${d * B} 0 L ${d * T} ${-H}`} stroke={INK} strokeWidth={24} strokeLinecap="round" />
        <path d={`M ${d * B} 0 L ${d * T} ${-H}`} stroke={color} strokeWidth={13} strokeLinecap="round" />
      </g>)}
      <rect x={-50} y={-H - 40} width={100} height={44} rx={8} fill={color} stroke={INK} strokeWidth={7} />
      <path d={`M 0 ${-H + 4} L 0 -90`} stroke={INK} strokeWidth={4} />
      <rect x={-18} y={-110} width={36} height={30} rx={6} fill={LAB.gold} stroke={INK} strokeWidth={5} />
      <path d={`M -150 -150 L 150 -150`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d={`M -150 -150 L 150 -150`} stroke={color} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};

/** A simple top-down land map (lease plots): green land with a winding river, a grid of plots (cols x rows),
 *  some highlighted in gold (highlight = plot indices, row-major; hl 0..1 fades them in) and small well dots.
 *  x, y = centre, w x h. Deterministic (seed). */
export const MapPatch: React.FC<{ x: number; y: number; w: number; h: number; cols?: number; rows?: number; highlight?: number[]; hl?: number; seed?: number }> =
  ({ x, y, w, h, cols = 5, rows = 4, highlight = [], hl = 1, seed = 1 }) => {
    const R = rng(seed + 5), x0 = x - w / 2, y0 = y - h / 2, cw = w / cols, ch = h / rows;
    const id = `map-clip-${Math.round(x)}-${Math.round(y)}-${seed}`;
    return (
      <g>
        <defs><clipPath id={id}><rect x={x0} y={y0} width={w} height={h} rx={26} /></clipPath></defs>
        <rect x={x0 + 10} y={y0 + 14} width={w} height={h} rx={26} fill={SHADOW} opacity={0.35} />
        <g clipPath={`url(#${id})`}>
          <rect x={x0} y={y0} width={w} height={h} fill={AUCTION.land} />
          {Array.from({ length: cols * rows }, (_, i) => (i + Math.floor(i / cols)) % 2 ? <rect key={"pl" + i} x={x0 + (i % cols) * cw} y={y0 + Math.floor(i / cols) * ch} width={cw} height={ch} fill={AUCTION.land2} /> : null)}
          {highlight.map((i) => <rect key={"hl" + i} x={x0 + (i % cols) * cw + 6} y={y0 + Math.floor(i / cols) * ch + 6} width={cw - 12} height={ch - 12} rx={8} fill={AUCTION.plot} opacity={r2(clamp01(hl) * 0.75 * 100) / 100} />)}
          <path d={`M ${x0 - 20} ${y0 + h * 0.2} C ${x0 + w * 0.3} ${y0 + h * 0.1} ${x0 + w * 0.25} ${y0 + h * 0.7} ${x0 + w * 0.55} ${y0 + h * 0.65} S ${x0 + w * 0.85} ${y0 + h * 0.95} ${x0 + w + 20} ${y0 + h * 0.85}`} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" />
          <path d={`M ${x0 - 20} ${y0 + h * 0.2} C ${x0 + w * 0.3} ${y0 + h * 0.1} ${x0 + w * 0.25} ${y0 + h * 0.7} ${x0 + w * 0.55} ${y0 + h * 0.65} S ${x0 + w * 0.85} ${y0 + h * 0.95} ${x0 + w + 20} ${y0 + h * 0.85}`} stroke={AUCTION.river} strokeWidth={22} fill="none" strokeLinecap="round" />
          {Array.from({ length: cols - 1 }, (_, i) => <path key={"gc" + i} d={`M ${r2(x0 + (i + 1) * cw)} ${y0} L ${r2(x0 + (i + 1) * cw)} ${y0 + h}`} stroke={LAB.text} strokeWidth={4} strokeDasharray="14 10" opacity={0.75} />)}
          {Array.from({ length: rows - 1 }, (_, i) => <path key={"gr" + i} d={`M ${x0} ${r2(y0 + (i + 1) * ch)} L ${x0 + w} ${r2(y0 + (i + 1) * ch)}`} stroke={LAB.text} strokeWidth={4} strokeDasharray="14 10" opacity={0.75} />)}
          {Array.from({ length: Math.round(cols * rows * 0.4) }, (_, i) => { const px = x0 + R() * w, py = y0 + R() * h; return <g key={"wd" + i}><circle cx={r2(px)} cy={r2(py)} r={9} fill={AUCTION.oil} stroke={LAB.text} strokeWidth={3} /></g>; })}
        </g>
        <rect x={x0} y={y0} width={w} height={h} rx={26} fill="none" stroke={INK} strokeWidth={9} />
      </g>
    );
  };

/** Bid slider: x = left end, y = track, w. estimate and bid are positions 0..1 on the track. A gold pin marks the
 *  estimate (estimateLabel above), the knob sits at the bid (bidLabel below), and a red arrow shows the step back
 *  from estimate to bid (step 0..1 draws it). bidders = how many little rival heads stand above the track (0 = none;
 *  animate 2 -> 8 while the bid slides left: "more bidders -> step back further"). ends = optional end labels. */
export const BidSlider: React.FC<{ x: number; y: number; w: number; estimate: number; bid: number; bidders?: number; step?: number;
  estimateLabel?: string; bidLabel?: string; ends?: [string, string] }> =
  ({ x, y, w, estimate, bid, bidders = 0, step = 1, estimateLabel, bidLabel, ends }) => {
    const ex = x + w * clamp01(estimate), bx = x + w * clamp01(bid), s = clamp01(step);
    const ax = ex + (bx - ex) * ease(s), nb = Math.max(0, Math.floor(bidders));
    const headCols = [LAB.orange, "#3fb8c9", "#e85a8a", LAB.green, "#b06ad9", LAB.gold, "#5b86b8", LAB.red];
    const per = Math.min(90, (w - 20) / Math.max(1, nb));
    return (
      <g>
        {/* rivals */}
        {Array.from({ length: nb }, (_, i) => {
          const hx2 = x + 30 + i * per + per / 2, hy = y - 300, col = headCols[i % headCols.length];
          return <g key={"b" + i} transform={`translate(${r2(hx2)} ${hy})`}>
            <path d="M -30 54 C -30 14 30 14 30 54 Z" fill={col} stroke={INK} strokeWidth={5} />
            <circle cx={0} cy={0} r={22} fill={SKINS[(i * 3) % SKINS.length]} stroke={INK} strokeWidth={5} />
            <Paddle x={26} y={10} scale={0.28} back />
          </g>;
        })}
        <rect x={x - 16} y={y - 16} width={w + 32} height={32} rx={16} fill="#2a3566" stroke={INK} strokeWidth={6} />
        <rect x={x - 8} y={y - 8} width={r2(Math.max(0, bx - x + 8))} height={16} rx={8} fill={LAB.green} />
        {/* estimate pin */}
        <path d={`M ${r2(ex)} ${y - 16} L ${r2(ex)} ${y - 150}`} stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <path d={`M ${r2(ex)} ${y - 16} L ${r2(ex)} ${y - 150}`} stroke={LAB.gold} strokeWidth={6} strokeLinecap="round" />
        <path d={`M ${r2(ex)} ${y - 150} L ${r2(ex + 70)} ${y - 128} L ${r2(ex)} ${y - 106} Z`} fill={LAB.gold} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {estimateLabel && <text x={r2(ex)} y={y - 176} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(estimateLabel, 360, 42))} fill={LAB.gold}>{estimateLabel}</text>}
        {/* step-back arrow */}
        {s > 0 && Math.abs(bx - ex) > 4 && <g>
          <path d={`M ${r2(ex)} ${y - 70} L ${r2(ax)} ${y - 70}`} stroke={INK} strokeWidth={18} strokeLinecap="round" />
          <path d={`M ${r2(ex)} ${y - 70} L ${r2(ax)} ${y - 70}`} stroke={LAB.red} strokeWidth={9} strokeLinecap="round" />
          <path d={`M ${r2(ax - 6 * Math.sign(bx - ex))} ${y - 92} L ${r2(ax - 34 * Math.sign(ex - bx))} ${y - 70} L ${r2(ax - 6 * Math.sign(bx - ex))} ${y - 48} Z`} transform={`translate(${r2(-8 * Math.sign(ex - bx))} 0)`} fill={LAB.red} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </g>}
        {/* knob */}
        <circle cx={r2(bx)} cy={y} r={40} fill={AUCTION.paddle} stroke={INK} strokeWidth={8} />
        <circle cx={r2(bx)} cy={y} r={18} fill={LAB.green} stroke={INK} strokeWidth={4} />
        {bidLabel && <text x={r2(bx)} y={y + 100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(bidLabel, 320, 42))} fill={LAB.green}>{bidLabel}</text>}
        {ends && <text x={x} y={y + 170} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={LAB.muted}>{ends[0]}</text>}
        {ends && <text x={x + w} y={y + 170} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={LAB.muted}>{ends[1]}</text>}
      </g>
    );
  };
