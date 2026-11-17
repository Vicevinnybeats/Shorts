// Library (2.5D): a busy neighbourhood pizzeria in the evening (episode "pizza"): cream plaster wall with exposed brick,
// red-and-white tiled wainscot, green trim, a green-mosaic wood-fired dome oven (flickering mouth: OvenGlow), a chalk
// menu board with three size circles (no text), shelves with plain flour sacks / tins / jars / oil bottles (no brands),
// green enamel hanging lamps, night windows onto a dark street; terracotta diamond floor. Props: a front-view counter
// (back/front layers so the pizzaiolo stands behind it; customers at its ends), pizza boxes (top/front view, opening lid,
// "medium" vs "large" = 12 vs 18 inch), top-view pizza, box stack, wooden peel. Wardrobe (PersonPart): ChefHat,
// ChefApron, Neckerchief for the pizzaiolo. Lab props: CircleCompare, PackCircles (area-true wedges), AreaCounter,
// Ruler (horizontal), EyeRuler (judging by width vs area), PricePerBite bars. No text anywhere unless passed as a prop.
import React from "react";
import { INK, Pose } from "../characters25/person";
import { CachedSvg } from "../../src/engine25/cached";
import { LAB } from "../style/channel";
import { PersonPart } from "./livingroom";
import { reachLimb } from "./square";

export const PIZZERIA = {
  wall: "#f0d9ae", wall2: "#e6cc9c", brick: "#b5523b", brick2: "#9a4230", mortar: "#e8c9a0",
  tileRed: "#d8402e", tileWhite: "#f8f1e4", grout: "#c9b8a2",
  green: "#2e8b57", green2: "#1f6a40", greenDark: "#1b4a33", mosaic: "#2f7d55", mosaic2: "#3f9a68", mosaic3: "#245f43",
  ovenMouth: "#2a120c", ember: "#ff7a2a", ember2: "#ffb347", flame: "#ffd257", flame2: "#ff9a3a", glow: "#ffb35a",
  stucco: "#e9d6b8", stucco2: "#d4bc98", log: "#8a5a34", log2: "#6b4426", logEnd: "#e0b07a",
  board: "#24433a", board2: "#1d362f", chalk: "#f4f1e8", chalk2: "#ffd36b", frame: "#8a5a34",
  shelf: "#2e8b57", plank: "#a8703f", sack: "#f6f0e2", sack2: "#e2d6bf", sackBand: "#3a7bd5",
  tin: "#d8402e", tin2: "#2e8b57", tinTop: "#c9d1d8", jar: "#e8443a", jarLid: "#f2c230", oil: "#9cb83a", oil2: "#c9a12a",
  lamp: "#2e8b57", lamp2: "#1f6a40", bulb: "#fff1b8",
  night: "#171c3d", night2: "#232a55", building: "#2b2f52", building2: "#353a63", lit: "#ffcf6a", streetLamp: "#ffe39a",
  floor: "#e0ad78", floor2: "#b65e3c", floorLine: "#8d4a30",
  counter: "#2e8b57", counter2: "#226b43", marble: "#f4efe7", marble2: "#d9d2c6", wood: "#c98f5a", wood2: "#a8703f",
  box: "#f7f0e2", box2: "#e6d9c0", boxIn: "#e9cf9e", boxIn2: "#d6b67e", print: "#d8402e", print2: "#2e8b57",
  crust: "#e4a457", crust2: "#c47e34", sauce: "#d8402e", cheese: "#f8d36a", cheese2: "#fbe39a", pepperoni: "#b8302a",
  pepperoni2: "#d4523f", basil: "#3a9a4e", olive: "#2a2230",
  peel: "#d9a466", peel2: "#b07e48",
  hat: "#fbfaf6", hat2: "#e3e0d8", apron: "#fbfaf6", apron2: "#e3e0d8", trim: "#2e8b57", kerchief: "#d8402e", kerchief2: "#a8302a",
  labDark: "#1b2650", labFill: "#2a3566",
} as const;

const SHADOW = "#05040c";
const FONT = "CaptionSans, sans-serif";
const r2 = (v: number) => Math.round(v * 10) / 10;
const rad = (d: number) => (d * Math.PI) / 180;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const rng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const hx = (h: string) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
/** flat colour mix (no blend modes): a -> b by t */
const mix = (a: string, b: string, t: number) => { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
/** expo-out-like ease for internal sub-steps */
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
/** font size that fits `text` into `w` px (CaptionSans 900 is ~0.68 em per glyph) */
const fit = (text: string, w: number, max: number) => Math.min(max, w / (Math.max(1, text.length) * 0.68));

// ---------------------------------------------------------------- layout of the room
/** Where things are on PizzeriaWall (design px) for a given wall y/h; B = floor line (y + h).
 *  oven: dome x 20..480 (centre 250), mouth bottom-centre (250, B-490) 180 wide x 160 tall; plinth top B-470.
 *  menu: chalk board x 560..1010, y B-1230..B-890. shelves at B-830 and B-690 (x 560..1010).
 *  windows: x -290..-40 and x 1090..1370 (only seen when the camera zooms out / pans). lamps hang at x -130, 520, 1230. */
export const pizzeriaSpots = (y = 0, h = 1500) => {
  const B = y + h;
  return {
    floor: B,
    ovenMouth: { x: 250, y: B - 490 },
    menu: { x0: 560, x1: 1010, y0: B - 1230, y1: B - 890 },
    shelves: [B - 830, B - 690] as const,
    lamps: [-130, 520, 1230] as const,
  };
};

const Lamp: React.FC<{ x: number; y0: number; y1: number }> = ({ x, y0, y1 }) => (
  <g>
    <circle cx={x} cy={y1 + 60} r={210} fill={PIZZERIA.glow} opacity={0.08} />
    <circle cx={x} cy={y1 + 50} r={110} fill={PIZZERIA.glow} opacity={0.12} />
    <path d={`M ${x} ${y0} L ${x} ${y1}`} stroke={INK} strokeWidth={6} />
    <path d={`M ${x - 18} ${y1} L ${x + 18} ${y1} L ${x + 26} ${y1 + 14} L ${x - 26} ${y1 + 14} Z`} fill={PIZZERIA.lamp2} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d={`M ${x - 26} ${y1 + 12} Q ${x - 90} ${y1 + 28} ${x - 96} ${y1 + 74} L ${x + 96} ${y1 + 74} Q ${x + 90} ${y1 + 28} ${x + 26} ${y1 + 12} Z`} fill={PIZZERIA.lamp} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d={`M ${x - 60} ${y1 + 40} Q ${x - 40} ${y1 + 26} ${x - 20} ${y1 + 22}`} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={7} fill="none" strokeLinecap="round" />
    <ellipse cx={x} cy={y1 + 76} rx={64} ry={10} fill={PIZZERIA.bulb} stroke={INK} strokeWidth={5} />
  </g>
);

const NightWindow: React.FC<{ x0: number; x1: number; y0: number; y1: number; seed: number }> = ({ x0, x1, y0, y1, seed }) => {
  const R = rng(seed), w = x1 - x0, G = y1 - 70;
  const blds: React.ReactElement[] = [];
  for (let bx = x0 - 20, i = 0; bx < x1; i++) {
    const bw = 70 + R() * 70, bh = 180 + R() * 200;
    blds.push(<g key={i}><rect x={r2(bx)} y={r2(G - bh)} width={r2(bw)} height={r2(bh)} fill={i % 2 ? PIZZERIA.building : PIZZERIA.building2} />
      {Array.from({ length: Math.floor(bh / 60) * 2 }, (_, k) => <rect key={k} x={r2(bx + 14 + (k % 2) * (bw / 2 - 4))} y={r2(G - bh + 22 + Math.floor(k / 2) * 60)} width={16} height={22}
        fill={PIZZERIA.lit} opacity={R() < 0.55 ? 0.85 : 0.15} />)}</g>);
    bx += bw + 8;
  }
  return (
    <g>
      <rect x={x0 - 24} y={y0 - 24} width={w + 48} height={y1 - y0 + 48} rx={8} fill={PIZZERIA.green} stroke={INK} strokeWidth={9} />
      <rect x={x0} y={y0} width={w} height={y1 - y0} fill={PIZZERIA.night} />
      {[[0.2, 50], [0.55, 90], [0.8, 40], [0.35, 150]].map(([u, sy], i) => <circle key={"s" + i} cx={r2(x0 + w * u)} cy={y0 + sy} r={3 + (i % 2) * 2} fill="#fff6d6" />)}
      {blds}
      {/* street: pavement, a lamp post with its glow, a parked scooter silhouette */}
      <rect x={x0} y={G} width={w} height={70} fill={PIZZERIA.night2} />
      <rect x={x0} y={G} width={w} height={10} fill="#3a4170" />
      <circle cx={r2(x0 + w * 0.7)} cy={G - 230} r={60} fill={PIZZERIA.streetLamp} opacity={0.18} />
      <path d={`M ${r2(x0 + w * 0.7)} ${G + 20} L ${r2(x0 + w * 0.7)} ${G - 220}`} stroke="#14172e" strokeWidth={10} />
      <circle cx={r2(x0 + w * 0.7)} cy={G - 228} r={14} fill={PIZZERIA.streetLamp} />
      <g transform={`translate(${r2(x0 + w * 0.3)} ${G + 40})`} fill="#14172e">
        <circle cx={-34} cy={0} r={16} /><circle cx={34} cy={0} r={16} />
        <path d="M -40 -6 Q -40 -40 -10 -40 L 20 -40 L 30 -70 L 40 -70 L 34 -36 Q 50 -24 46 -6 Z" />
      </g>
      {/* mullions + sill, plus a cool reflection streak */}
      <path d={`M ${r2((x0 + x1) / 2)} ${y0} L ${r2((x0 + x1) / 2)} ${y1}`} stroke={PIZZERIA.green2} strokeWidth={10} />
      <path d={`M ${x0 + 30} ${y0 + 40} L ${x0 + 80} ${y0 + 10} M ${x0 + 30} ${y0 + 100} L ${x0 + 130} ${y0 + 40}`} stroke="#ffffff" strokeOpacity={0.12} strokeWidth={12} strokeLinecap="round" />
      <rect x={x0 - 40} y={y1 + 20} width={w + 80} height={24} rx={6} fill={PIZZERIA.green} stroke={INK} strokeWidth={6} />
    </g>
  );
};

/** Back wall (cached). Covers x -300..1380, y..y+h; anchored to the floor line B = y+h (keep h >= 1400). See
 *  pizzeriaSpots for where the oven mouth, menu board, shelves, windows and lamps are. Draw <OvenGlow {...spots.ovenMouth}
 *  f={frame}/> on top to make the fire flicker. Put PizzeriaFloor below it (from y+h). Default framing for the counter
 *  shots: PizzeriaWall y={-260} h={1560} -> floor at 1300. */
export const PizzeriaWall: React.FC<{ y?: number; h?: number }> = ({ y = 0, h = 1500 }) => {
  const B = y + h, wain = B - 600;
  const tile = 60;
  const tiles: React.ReactElement[] = [];
  for (let j = 0; j * tile < 600 - 36; j++)
    for (let i = 0; i < 1680 / tile; i++)
      if ((i + j) % 2 === 0) tiles.push(<rect key={`${i}-${j}`} x={-300 + i * tile} y={wain + j * tile} width={tile} height={tile} fill={PIZZERIA.tileRed} />);
  const bricks = (bx: number, by: number, cols: number, rows: number, k: string) => Array.from({ length: cols * rows }, (_, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    if ((c === 0 || c === cols - 1) && (r + c) % 2 === 0) return null;
    return <rect key={k + i} x={bx + c * 64 + (r % 2) * 32} y={by + r * 30} width={58} height={24} rx={3} fill={(i * 7) % 5 ? PIZZERIA.brick : PIZZERIA.brick2} stroke={INK} strokeWidth={3.5} />;
  });
  // oven geometry
  const ox = 250, plTop = B - 470, domeTop = B - 1000, dw = 230;
  const domePath = `M ${ox - dw} ${plTop} C ${ox - dw} ${domeTop + 120} ${ox - 130} ${domeTop} ${ox} ${domeTop} C ${ox + 130} ${domeTop} ${ox + dw} ${domeTop + 120} ${ox + dw} ${plTop} Z`;
  const mosaic: React.ReactElement[] = [];
  const insideDome = (px: number, py: number) => {
    const nx = (px - ox) / (dw - 18), ny = (plTop - py) / (plTop - domeTop - 14);
    return py < plTop - 14 && nx * nx + ny * ny * 0.92 < 1;
  };
  for (let yy = domeTop + 20; yy < plTop - 10; yy += 26)
    for (let xx = ox - dw; xx < ox + dw; xx += 26) {
      const px = xx + (Math.floor((yy - domeTop) / 26) % 2) * 13;
      if (!insideDome(px, yy)) continue;
      const k = (Math.floor(px * 7 + yy * 3) >>> 0) % 7;
      if (k > 2) continue;
      mosaic.push(<rect key={`${px}-${yy}`} x={r2(px - 9)} y={r2(yy - 9)} width={18} height={18} rx={3} fill={k === 0 ? PIZZERIA.mosaic2 : k === 1 ? PIZZERIA.mosaic3 : "#e9c25a"} opacity={k === 2 ? 0.7 : 1} />);
    }
  const mw = 180, mh = 160, my = B - 490;
  const mouth = `M ${ox - mw / 2} ${my} L ${ox - mw / 2} ${my - mh * 0.45} Q ${ox - mw / 2} ${my - mh} ${ox} ${my - mh} Q ${ox + mw / 2} ${my - mh} ${ox + mw / 2} ${my - mh * 0.45} L ${ox + mw / 2} ${my} Z`;
  const arch = (k: number) => `M ${ox - mw / 2 - k} ${my} L ${ox - mw / 2 - k} ${my - mh * 0.45} Q ${ox - mw / 2 - k} ${my - mh - k} ${ox} ${my - mh - k} Q ${ox + mw / 2 + k} ${my - mh - k} ${ox + mw / 2 + k} ${my - mh * 0.45} L ${ox + mw / 2 + k} ${my} Z`;
  const { menu, shelves } = pizzeriaSpots(y, h);
  const [s1, s2] = shelves;
  const sack = (sx: number, base: number, k: string) => (
    <g key={k}>
      <path d={`M ${sx - 44} ${base} Q ${sx - 52} ${base - 70} ${sx - 34} ${base - 104} L ${sx - 40} ${base - 120} Q ${sx} ${base - 112} ${sx + 40} ${base - 120} L ${sx + 34} ${base - 104} Q ${sx + 52} ${base - 70} ${sx + 44} ${base} Z`}
        fill={PIZZERIA.sack} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${sx - 46} ${base - 58} Q ${sx} ${base - 50} ${sx + 46} ${base - 58} L ${sx + 46} ${base - 40} Q ${sx} ${base - 32} ${sx - 46} ${base - 40} Z`} fill={PIZZERIA.sackBand} />
      <path d={`M ${sx - 30} ${base - 110} L ${sx - 20} ${base - 98} M ${sx + 4} ${base - 112} L ${sx + 4} ${base - 98} M ${sx + 28} ${base - 110} L ${sx + 20} ${base - 98}`} stroke={PIZZERIA.sack2} strokeWidth={4} strokeLinecap="round" />
      <path d={`M ${sx - 30} ${base - 20} Q ${sx - 34} ${base - 60} ${sx - 22} ${base - 90}`} stroke={PIZZERIA.sack2} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
  const tin = (tx: number, base: number, col: string, k: string, th = 64) => (
    <g key={k}>
      <rect x={tx - 26} y={base - th} width={52} height={th} rx={4} fill={col} stroke={INK} strokeWidth={5} />
      <rect x={tx - 26} y={base - th * 0.68} width={52} height={th * 0.36} fill={PIZZERIA.tileWhite} />
      <circle cx={tx} cy={base - th * 0.5} r={th * 0.12} fill={col} />
      <ellipse cx={tx} cy={base - th} rx={26} ry={6} fill={PIZZERIA.tinTop} stroke={INK} strokeWidth={4} />
    </g>
  );
  const jar = (jx: number, base: number, k: string) => (
    <g key={k}>
      <path d={`M ${jx - 22} ${base} L ${jx - 24} ${base - 58} Q ${jx - 24} ${base - 66} ${jx - 16} ${base - 68} L ${jx + 16} ${base - 68} Q ${jx + 24} ${base - 66} ${jx + 24} ${base - 58} L ${jx + 22} ${base} Z`}
        fill={PIZZERIA.jar} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={jx - 18} y={base - 82} width={36} height={16} rx={4} fill={PIZZERIA.jarLid} stroke={INK} strokeWidth={4} />
      <path d={`M ${jx - 12} ${base - 54} L ${jx - 12} ${base - 14}`} stroke="#ffffff" strokeOpacity={0.4} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
  const bottle = (bx: number, base: number, col: string, k: string) => (
    <g key={k}>
      <path d={`M ${bx - 18} ${base} L ${bx - 18} ${base - 70} Q ${bx - 18} ${base - 86} ${bx - 7} ${base - 96} L ${bx - 7} ${base - 124} L ${bx + 7} ${base - 124} L ${bx + 7} ${base - 96} Q ${bx + 18} ${base - 86} ${bx + 18} ${base - 70} L ${bx + 18} ${base} Z`}
        fill={col} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={bx - 9} y={base - 134} width={18} height={12} rx={3} fill={PIZZERIA.greenDark} stroke={INK} strokeWidth={3.5} />
      <rect x={bx - 18} y={base - 56} width={36} height={26} fill={PIZZERIA.tileWhite} stroke={INK} strokeWidth={3} />
    </g>
  );
  const sizes = [[650, 40], [775, 54], [925, 72]] as const;
  const cy = menu.y0 + 140;
  return (
    <CachedSvg cacheKey={`pizzeria-wall-${y}-${h}`} x={-300} y={y} w={1680} h={h}>
      <rect x={-300} y={y} width={1680} height={h} fill={PIZZERIA.wall} />
      {Array.from({ length: 12 }, (_, i) => <rect key={"st" + i} x={-300 + i * 150 + 40} y={y} width={60} height={h} fill={PIZZERIA.wall2} opacity={0.6} />)}
      {/* exposed brick patches */}
      {bricks(560, B - 1500, 5, 5, "ba")}
      {bricks(-250, B - 1360, 4, 4, "bb")}
      {bricks(1120, B - 1440, 4, 4, "bc")}
      {/* tiled wainscot + green rail + skirting */}
      <rect x={-300} y={wain} width={1680} height={600} fill={PIZZERIA.tileWhite} />
      {tiles}
      {Array.from({ length: 29 }, (_, i) => <path key={"gv" + i} d={`M ${-300 + i * tile} ${wain} L ${-300 + i * tile} ${B}`} stroke={PIZZERIA.grout} strokeWidth={2} opacity={0.6} />)}
      {Array.from({ length: 10 }, (_, j) => <path key={"gh" + j} d={`M -300 ${wain + j * tile} L 1380 ${wain + j * tile}`} stroke={PIZZERIA.grout} strokeWidth={2} opacity={0.6} />)}
      <rect x={-300} y={wain - 26} width={1680} height={28} fill={PIZZERIA.green} stroke={INK} strokeWidth={6} />
      <rect x={-300} y={B - 40} width={1680} height={40} fill={PIZZERIA.greenDark} stroke={INK} strokeWidth={6} />
      {/* windows onto the dark street (edges: seen in wide / zoomed-out shots) */}
      <NightWindow x0={-290} x1={-40} y0={B - 1170} y1={B - 690} seed={11} />
      <NightWindow x0={1090} x1={1370} y0={B - 1170} y1={B - 690} seed={29} />
      {/* ---- the wood-fired oven: chimney, plinth with log niche, green mosaic dome, brick arch, mouth */}
      <rect x={ox - 38} y={y - 10} width={76} height={domeTop - y + 60} fill="#6b6f7d" stroke={INK} strokeWidth={7} />
      <rect x={ox - 50} y={domeTop - 40} width={100} height={30} rx={4} fill="#5a5d6a" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 6 }, (_, i) => <path key={"ch" + i} d={`M ${ox - 38} ${y + 80 + i * 110} L ${ox + 38} ${y + 80 + i * 110}`} stroke={INK} strokeWidth={4} opacity={0.35} />)}
      <rect x={ox - dw - 10} y={plTop} width={dw * 2 + 20} height={B - plTop} fill={PIZZERIA.stucco} stroke={INK} strokeWidth={8} />
      <rect x={ox - dw - 10} y={plTop} width={dw * 2 + 20} height={24} fill={PIZZERIA.stucco2} stroke={INK} strokeWidth={6} />
      <path d={`M ${ox - 150} ${B - 30} L ${ox - 150} ${B - 250} Q ${ox - 150} ${B - 360} ${ox} ${B - 360} Q ${ox + 150} ${B - 360} ${ox + 150} ${B - 250} L ${ox + 150} ${B - 30} Z`} fill="#4a2a1c" stroke={INK} strokeWidth={7} />
      {[[-90, 0], [0, 0], [90, 0], [-45, 1], [45, 1], [0, 2], [-110, 2], [110, 2], [-60, 3], [60, 3]].map(([dx, row], i) => {
        const cxl = ox + dx, cyl = B - 70 - row * 62;
        return <g key={"lg" + i}><rect x={cxl - 52} y={cyl - 28} width={104} height={56} rx={26} fill={i % 2 ? PIZZERIA.log : PIZZERIA.log2} stroke={INK} strokeWidth={5} />
          <ellipse cx={cxl + 40} cy={cyl} rx={14} ry={24} fill={PIZZERIA.logEnd} stroke={INK} strokeWidth={4} />
          <ellipse cx={cxl + 40} cy={cyl} rx={5} ry={9} fill="none" stroke={PIZZERIA.log2} strokeWidth={3} /></g>;
      })}
      <path d={domePath} fill={PIZZERIA.mosaic} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      {mosaic}
      <path d={`M ${ox - 150} ${domeTop + 110} Q ${ox - 100} ${domeTop + 40} ${ox - 30} ${domeTop + 30}`} stroke="#ffffff" strokeOpacity={0.25} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={arch(46)} fill={PIZZERIA.brick} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {Array.from({ length: 9 }, (_, i) => {
        const a = rad(180 - i * 22.5), rx0 = mw / 2, rx1 = mw / 2 + 46;
        const c0 = [ox + Math.cos(a) * rx0, my - mh * 0.45 - Math.sin(a) * (mh * 0.55)], c1 = [ox + Math.cos(a) * rx1, my - mh * 0.45 - Math.sin(a) * (mh * 0.55 + 46)];
        return <path key={"ab" + i} d={`M ${r2(c0[0])} ${r2(c0[1])} L ${r2(c1[0])} ${r2(c1[1])}`} stroke={INK} strokeWidth={4} />;
      })}
      <path d={mouth} fill={PIZZERIA.ovenMouth} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <rect x={ox - 150} y={my - 4} width={300} height={22} rx={4} fill={PIZZERIA.stucco2} stroke={INK} strokeWidth={6} />
      {/* ---- menu board: three size circles (S/M/L), chalk dashes as price placeholders, no text */}
      <rect x={menu.x0} y={menu.y0} width={menu.x1 - menu.x0} height={menu.y1 - menu.y0} rx={10} fill={PIZZERIA.frame} stroke={INK} strokeWidth={9} />
      <rect x={menu.x0 + 20} y={menu.y0 + 20} width={menu.x1 - menu.x0 - 40} height={menu.y1 - menu.y0 - 40} fill={PIZZERIA.board} />
      <path d={`M ${menu.x0 + 50} ${menu.y0 + 52} Q ${(menu.x0 + menu.x1) / 2} ${menu.y0 + 36} ${menu.x1 - 50} ${menu.y0 + 52}`} stroke={PIZZERIA.chalk2} strokeWidth={5} fill="none" strokeDasharray="14 10" strokeLinecap="round" />
      {sizes.map(([sx, r], i) => <g key={"sz" + i}>
        <circle cx={sx} cy={cy + 60 - r} r={r} fill="none" stroke={PIZZERIA.chalk} strokeWidth={5} />
        <circle cx={sx} cy={cy + 60 - r} r={r * 0.78} fill="none" stroke={PIZZERIA.chalk} strokeWidth={2.5} strokeDasharray="6 7" />
        {[[-0.35, -0.2], [0.3, -0.3], [0.1, 0.3], [-0.25, 0.35], [0.4, 0.15]].map(([dx, dy], k) => <circle key={k} cx={r2(sx + dx * r)} cy={r2(cy + 60 - r + dy * r)} r={r * 0.1} fill={PIZZERIA.chalk2} opacity={0.85} />)}
        <path d={`M ${sx - 36} ${cy + 100} L ${sx - 6} ${cy + 100} M ${sx + 6} ${cy + 100} L ${sx + 36} ${cy + 100}`} stroke={PIZZERIA.chalk} strokeWidth={6} strokeLinecap="round" />
        <path d={`M ${sx - 26} ${cy + 130} L ${sx + 26} ${cy + 130}`} stroke={PIZZERIA.chalk2} strokeWidth={6} strokeLinecap="round" />
      </g>)}
      <path d={`M ${menu.x0 + 50} ${menu.y1 - 50} L ${menu.x1 - 50} ${menu.y1 - 50}`} stroke={PIZZERIA.chalk} strokeOpacity={0.5} strokeWidth={4} strokeDasharray="22 14" />
      {/* ---- shelves with flour sacks, tins, jars, oil bottles (no brands) */}
      {[s1, s2].map((sy, i) => <g key={"sh" + i}>
        <rect x={menu.x0 - 10} y={sy} width={menu.x1 - menu.x0 + 20} height={18} rx={4} fill={PIZZERIA.plank} stroke={INK} strokeWidth={6} />
        {[menu.x0 + 30, menu.x1 - 30].map((bx) => <path key={bx} d={`M ${bx} ${sy + 18} L ${bx} ${sy + 56} L ${bx + (bx < 700 ? 30 : -30)} ${sy + 18}`} fill={PIZZERIA.green} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
      </g>)}
      {sack(620, s1, "k1")}{sack(716, s1, "k2")}
      {tin(800, s1, PIZZERIA.tin, "t1")}{tin(858, s1, PIZZERIA.tin, "t2")}{tin(916, s1, PIZZERIA.tin2, "t3")}{tin(858, s1 - 66, PIZZERIA.tin2, "t4", 56)}
      {tin(970, s1, PIZZERIA.tin, "t5", 80)}
      {jar(600, s2, "j1")}{jar(652, s2, "j2")}{jar(704, s2, "j3")}
      {bottle(770, s2, PIZZERIA.oil, "o1")}{bottle(812, s2, PIZZERIA.oil2, "o2")}
      {[0, 1, 2, 3].map((i) => <ellipse key={"pl" + i} cx={920} cy={s2 - 8 - i * 12} rx={70} ry={10} fill={i % 2 ? PIZZERIA.tileWhite : "#efe6d6"} stroke={INK} strokeWidth={4} />)}
      {/* ---- hanging lamps */}
      {pizzeriaSpots(y, h).lamps.map((lx) => <Lamp key={"lm" + lx} x={lx} y0={y} y1={B - 1330} />)}
      {/* evening: a little darker up top, warm oven haze low left */}
      <rect x={-300} y={y} width={1680} height={Math.max(0, B - 1300 - y)} fill={SHADOW} opacity={0.12} />
      <circle cx={ox} cy={my - 80} r={420} fill={PIZZERIA.glow} opacity={0.07} />
    </CachedSvg>
  );
};

/** Terracotta diamond-tile floor in fake perspective (cached), from y down (covers x -400..1480). */
export const PizzeriaFloor: React.FC<{ y: number; h?: number }> = ({ y, h = 700 }) => {
  const vx = 540, vy = y - 1200, yb = y + h;
  const zTop = (yb - vy) / (y - vy);
  const P = (u: number, z: number) => [vx + (u - vx) / z, vy + (yb - vy) / z] as const;
  const T = 220, D = 0.16;
  const quads: React.ReactElement[] = [];
  for (let j = -1; 1 + (j * D) / 2 - D / 2 < zTop + D; j++)
    for (let i = -30; i <= 30; i++) {
      if ((i + j) % 2 !== 0) continue;
      const U = vx + (i * T) / 2, Z = 1 + (j * D) / 2;
      if (Z - D / 2 <= 0.2) continue;
      const pts = [P(U - T / 2, Z), P(U, Z + D / 2), P(U + T / 2, Z), P(U, Z - D / 2)];
      if (pts.every((p) => p[0] < -420) || pts.every((p) => p[0] > 1500)) continue;
      const odd = ((i - j) / 2) % 2 !== 0;
      quads.push(<path key={`${i}_${j}`} d={"M" + pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join(" L") + " Z"} fill={odd ? PIZZERIA.floor2 : PIZZERIA.floor} stroke={PIZZERIA.floorLine} strokeWidth={2.5} />);
    }
  return (
    <CachedSvg cacheKey={`pizzeria-floor-${y}-${h}`} x={-400} y={y} w={1880} h={h}>
      <rect x={-400} y={y} width={1880} height={h} fill={PIZZERIA.floor} />
      {quads}
      <rect x={-400} y={y} width={1880} height={18} fill={SHADOW} opacity={0.14} />
    </CachedSvg>
  );
};

/** Flickering wood fire in the oven mouth + warm light spill. x, y = mouth bottom-centre (pizzeriaSpots().ovenMouth),
 *  f = frame (deterministic flicker), intensity 0..1 (default 1; 0 = embers only), scale for a close-up oven. */
export const OvenGlow: React.FC<{ x: number; y: number; f: number; intensity?: number; scale?: number }> = ({ x, y, f, intensity = 1, scale = 1 }) => {
  const fl = (k: number) => 0.5 + 0.5 * Math.sin(f * 0.37 + k * 1.7) * Math.cos(f * 0.23 + k * 0.9);
  const flick = 0.85 + 0.15 * Math.sin(f * 0.51) * Math.sin(f * 0.17 + 1);
  const I = clamp01(intensity);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle cx={0} cy={-70} r={330} fill={PIZZERIA.glow} opacity={r2(0.07 * I * flick * 100) / 100} />
      <circle cx={0} cy={-70} r={200} fill={PIZZERIA.glow} opacity={r2(0.1 * I * flick * 100) / 100} />
      <ellipse cx={0} cy={30} rx={190} ry={30} fill={PIZZERIA.ember2} opacity={r2(0.22 * I * flick * 100) / 100} />
      {/* back of the oven lit orange */}
      <path d="M -78 -6 L -78 -70 Q -78 -142 0 -142 Q 78 -142 78 -70 L 78 -6 Z" fill={PIZZERIA.ember} opacity={r2((0.25 + 0.35 * I * flick) * 100) / 100} />
      {/* flames at the back-left (wood is fired to one side) */}
      {[[-46, 1.0], [-20, 0.8], [6, 0.65], [28, 0.45], [-62, 0.55]].map(([dx, hk], i) => {
        const hgt = (34 + 70 * hk * (0.6 + 0.4 * fl(i))) * (0.3 + 0.7 * I), wob = Math.sin(f * 0.6 + i * 2.1) * 8;
        return <path key={i} d={`M ${dx - 18} -8 Q ${dx - 22} ${r2(-8 - hgt * 0.5)} ${r2(dx + wob)} ${r2(-8 - hgt)} Q ${dx + 22} ${r2(-8 - hgt * 0.5)} ${dx + 18} -8 Z`}
          fill={i % 2 ? PIZZERIA.flame2 : PIZZERIA.flame} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
      })}
      {/* embers bed */}
      <path d="M -80 -4 Q -40 -22 0 -12 Q 40 -20 80 -4 L 80 0 L -80 0 Z" fill={PIZZERIA.ember} stroke={INK} strokeWidth={3} />
      {[-60, -30, 0, 30, 58].map((dx, i) => <circle key={"e" + i} cx={dx} cy={-6} r={4} fill="#fff1b8" opacity={0.5 + 0.5 * fl(i + 7)} />)}
    </g>
  );
};

// ---------------------------------------------------------------- counter
/** Counter heights in Person-local units (multiply by the counter's scale): top front edge, visible top depth. */
export const COUNTER = { top: 230, depth: 36 } as const;
export type CounterProps = { x: number; y: number; w?: number; scale?: number; layer?: "back" | "front" | "all"; goods?: boolean };

/** Front-view pizzeria counter: green panelled front with a red-and-white tile band, wood edge, white marble top seen
 *  slightly from above. x = centre, y = floor line of its front, w = width (default 640), scale = the pizzaiolo's
 *  scale. Pizzaiolo BEHIND it: <Counter layer="back"/> -> <Person {...behindCounter(c)}/> + ChefApron/ChefHat ->
 *  <Counter layer="front"/> (the front hides him from the hips down). Put boxes / pizzas on counterTopY(c).
 *  Customers in front: customerAtCounter(c, side) (drawn AFTER the front layer). goods: a basil pot and an oil
 *  bottle at the ends (the middle stays free). */
export const Counter: React.FC<CounterProps> = ({ x, y, w = 640, scale = 1, layer = "all", goods = true }) => {
  const hw = w / 2, T = COUNTER.top, D = COUNTER.depth;
  const back = (
    <g key="back">
      <ellipse cx={0} cy={6} rx={hw + 60} ry={20} fill={SHADOW} opacity={0.18} />
    </g>
  );
  const panels = Math.max(2, Math.round(w / 200));
  const pw = (w - 40) / panels;
  const front = (
    <g key="front">
      {/* top: marble slab seen from above + thick wooden front edge */}
      <path d={`M ${-hw - 10} ${-T} L ${-hw + 6} ${-T - D} L ${hw - 6} ${-T - D} L ${hw + 10} ${-T} Z`} fill={PIZZERIA.marble} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${-hw * 0.6} ${-T - D * 0.6} Q ${-hw * 0.3} ${-T - D * 0.2} ${-hw * 0.05} ${-T - D * 0.55} M ${hw * 0.2} ${-T - D * 0.35} Q ${hw * 0.45} ${-T - D * 0.8} ${hw * 0.7} ${-T - D * 0.4}`}
        stroke={PIZZERIA.marble2} strokeWidth={3} fill="none" />
      <rect x={-hw - 12} y={-T} width={w + 24} height={22} rx={5} fill={PIZZERIA.wood} stroke={INK} strokeWidth={7} />
      {/* body */}
      <rect x={-hw} y={-T + 22} width={w} height={T - 22} fill={PIZZERIA.counter} stroke={INK} strokeWidth={7} />
      {/* tile band */}
      {Array.from({ length: Math.floor(w / 30) }, (_, i) => <rect key={"tb" + i} x={-hw + i * 30 + (w % 30) / 2} y={-T + 22} width={30} height={30} fill={i % 2 ? PIZZERIA.tileWhite : PIZZERIA.tileRed} />)}
      {Array.from({ length: Math.floor(w / 30) }, (_, i) => <rect key={"tc" + i} x={-hw + i * 30 + (w % 30) / 2} y={-T + 52} width={30} height={14} fill={i % 2 ? PIZZERIA.tileRed : PIZZERIA.tileWhite} />)}
      <path d={`M ${-hw} ${-T + 66} L ${hw} ${-T + 66}`} stroke={INK} strokeWidth={5} />
      {/* recessed panels */}
      {Array.from({ length: panels }, (_, i) => <rect key={"p" + i} x={r2(-hw + 20 + i * pw + 10)} y={-T + 84} width={r2(pw - 20)} height={T - 84 - 34} rx={8}
        fill={PIZZERIA.counter2} stroke={INK} strokeWidth={4} />)}
      {Array.from({ length: panels }, (_, i) => <path key={"ph" + i} d={`M ${r2(-hw + 20 + i * pw + 22)} ${-T + 96} L ${r2(-hw + 20 + i * pw + 22)} ${-48}`} stroke="#ffffff" strokeOpacity={0.15} strokeWidth={6} strokeLinecap="round" />)}
      {/* toe kick */}
      <rect x={-hw + 6} y={-24} width={w - 12} height={24} fill={PIZZERIA.greenDark} stroke={INK} strokeWidth={5} />
      {goods && <g>
        {/* basil pot (left end) */}
        <g transform={`translate(${-hw + 60} ${-T - D * 0.5})`}>
          <path d="M -30 0 L -24 -44 L 24 -44 L 30 0 Z" fill={PIZZERIA.brick} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <rect x={-32} y={-52} width={64} height={12} rx={4} fill={PIZZERIA.brick2} stroke={INK} strokeWidth={4} />
          {[[-26, -82], [0, -96], [24, -80], [-12, -66], [14, -64]].map(([dx, dy], i) => <ellipse key={i} cx={dx} cy={dy} rx={17} ry={11} transform={`rotate(${dx * 1.2} ${dx} ${dy})`}
            fill={i % 2 ? PIZZERIA.basil : PIZZERIA.green} stroke={INK} strokeWidth={4} />)}
        </g>
        {/* oil bottle + chilli jar (right end) */}
        <g transform={`translate(${hw - 50} ${-T - D * 0.5})`}>
          <path d="M -15 0 L -15 -56 Q -15 -70 -6 -78 L -6 -100 L 6 -100 L 6 -78 Q 15 -70 15 -56 L 15 0 Z" fill={PIZZERIA.oil} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <rect x={-8} y={-110} width={16} height={11} rx={3} fill={PIZZERIA.greenDark} stroke={INK} strokeWidth={3.5} />
          <rect x={-58} y={-44} width={30} height={44} rx={6} fill={PIZZERIA.tileWhite} stroke={INK} strokeWidth={4.5} />
          <rect x={-55} y={-26} width={24} height={23} rx={3} fill={PIZZERIA.sauce} />
          <rect x={-60} y={-52} width={34} height={10} rx={3} fill={PIZZERIA.tinTop} stroke={INK} strokeWidth={3.5} />
        </g>
      </g>}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {layer !== "front" && back}
      {layer !== "back" && front}
    </g>
  );
};

/** y of the counter's top surface (the middle of the visible marble): put PizzaBox / Pizza bottoms there. */
export const counterTopY = (c: { y: number; scale?: number }) => c.y - (COUNTER.top + COUNTER.depth * 0.45) * (c.scale ?? 1);
/** Person props (x, y, scale) for the pizzaiolo standing BEHIND the counter. dx = offset from the counter centre in
 *  counter units. Spread into <Person> + ChefHat/ChefApron/Neckerchief; add facing/pose yourself. */
export const behindCounter = (c: { x: number; y: number; scale?: number }, dx = 0) => {
  const k = c.scale ?? 1;
  return { x: c.x + dx * k, y: c.y - 56 * k, scale: k * 0.94 };
};
/** The pizzaiolo's pose with both hands resting ON the counter top (front view), `spread` = hand distance from his
 *  centre in his own units. Pass the same props as the Person (from behindCounter + facing + base pose). */
export const handsOnCounter = (p: { x: number; y: number; scale?: number; facing?: 1 | -1; pose: Pose }, c: { y: number; scale?: number }, spread = 110): Pose => {
  const k = p.scale ?? 1, ty = counterTopY(c) - 6 * k;
  const one = reachLimb({ ...p, pose: { ...p.pose, profile: false } }, "armL", { x: p.x - spread * k, y: ty }, 1);
  return reachLimb({ ...p, pose: one }, "armR", { x: p.x + spread * k, y: ty }, 1);
};
/** Person props for a customer standing at one END of the counter, in front of it (draw AFTER <Counter layer="front"/>):
 *  side -1 = left end, 1 = right end; facing points toward the counter middle. inset = how far (counter units) the
 *  customer stands in from the end (default 30: the body overlaps the counter corner, so they read as "at" it);
 *  k = size vs the counter scale (default 1.08: a step closer to the camera). */
export const customerAtCounter = (c: { x: number; y: number; w?: number; scale?: number }, side: -1 | 1, inset = 30, k = 1.08) => {
  const s = c.scale ?? 1, hw = (c.w ?? 640) / 2;
  return { x: c.x + side * (hw - inset) * s, y: c.y + 70 * s, scale: s * k, facing: (side > 0 ? -1 : 1) as 1 | -1 };
};
/** Hand target (world point) on the counter top in front of a customer from customerAtCounter (e.g. for reachLimb). */
export const counterPoint = (c: { x: number; y: number; scale?: number }, dx: number) => ({ x: c.x + dx * (c.scale ?? 1), y: counterTopY(c) });

// ---------------------------------------------------------------- pizza (top view)
export type Toppings = "pepperoni" | "margherita" | "plain";
/** Top-view pizza: crust ring, sauce edge, cheese, toppings, cut lines. x, y = centre, r = radius. slices = cut lines
 *  (default 8, 0 = uncut). tilt 0..1 squashes it vertically (1 = flat top view; ~0.42 = lying in a box seen from the
 *  front). eaten = number of slices removed (shows nothing there: put it on a plate/box). Topping count grows with
 *  the AREA, so a big pizza visibly carries more. */
export const Pizza: React.FC<{ x: number; y: number; r: number; slices?: number; toppings?: Toppings; tilt?: number; eaten?: number; rot?: number; seed?: number }> =
  ({ x, y, r, slices = 8, toppings = "pepperoni", tilt = 1, eaten = 0, rot = 0, seed = 3 }) => {
    const sw = Math.max(2.5, r * 0.05);
    const R = rng(seed + 17);
    const n = toppings === "plain" ? 0 : Math.max(3, Math.round((toppings === "pepperoni" ? 11 : 6) * (r / 110) * (r / 110)));
    const items: { px: number; py: number; s: number; a: number }[] = [];
    for (let i = 0, tries = 0; i < n && tries < n * 30; tries++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * r * 0.68, px = Math.cos(a) * d, py = Math.sin(a) * d;
      const s = r * (toppings === "pepperoni" ? 0.13 : 0.12);
      if (items.some((q) => Math.hypot(q.px - px, q.py - py) < s * 2.1)) continue;
      items.push({ px, py, s, a: R() * 360 }); i++;
    }
    const cuts = Math.max(0, Math.floor(slices));
    const gone = Math.min(cuts, Math.max(0, Math.floor(eaten)));
    const sliceAng = cuts ? 360 / cuts : 360;
    // wedge mask (no clip paths): draw the eaten wedges in the background colour is impossible, so draw the pizza as
    // remaining wedges when eaten > 0
    const wedge = (a0: number, a1: number, rr: number) => {
      const p0 = [Math.cos(rad(a0)) * rr, Math.sin(rad(a0)) * rr], p1 = [Math.cos(rad(a1)) * rr, Math.sin(rad(a1)) * rr];
      return `M 0 0 L ${r2(p0[0])} ${r2(p0[1])} A ${rr} ${rr} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${r2(p1[0])} ${r2(p1[1])} Z`;
    };
    const start = -90, keepFrom = start + gone * sliceAng, keepTo = start + 360;
    const disc = (rr: number, fill: string, k: string, stroke = true) => gone > 0
      ? <path key={k} d={wedge(keepFrom, keepTo - 0.001, rr)} fill={fill} stroke={stroke ? INK : "none"} strokeWidth={sw} strokeLinejoin="round" />
      : <circle key={k} cx={0} cy={0} r={rr} fill={fill} stroke={stroke ? INK : "none"} strokeWidth={sw} />;
    const angOk = (px: number, py: number) => {
      if (!gone) return true;
      let a = (Math.atan2(py, px) * 180) / Math.PI; while (a < keepFrom) a += 360; return a <= keepTo;
    };
    return (
      <g transform={`translate(${x} ${y}) scale(1 ${tilt}) rotate(${rot})`}>
        {disc(r, PIZZERIA.crust, "c")}
        <circle cx={0} cy={0} r={r * 0.86} fill="none" stroke={PIZZERIA.crust2} strokeWidth={sw * 0.8} opacity={gone ? 0 : 0.6} />
        {disc(r * 0.84, PIZZERIA.sauce, "s", false)}
        {disc(r * 0.78, PIZZERIA.cheese, "ch", false)}
        {[[-0.3, -0.25, 0.22], [0.28, 0.1, 0.2], [-0.05, 0.38, 0.18], [0.2, -0.42, 0.14]].filter(([dx, dy]) => angOk(dx * r, dy * r)).map(([dx, dy, s], i) =>
          <ellipse key={"m" + i} cx={r2(dx * r)} cy={r2(dy * r)} rx={r2(s * r)} ry={r2(s * r * 0.7)} fill={PIZZERIA.cheese2} />)}
        {items.filter((q) => angOk(q.px, q.py)).map((q, i) => toppings === "pepperoni"
          ? <g key={"t" + i}><circle cx={r2(q.px)} cy={r2(q.py)} r={r2(q.s)} fill={PIZZERIA.pepperoni} stroke={INK} strokeWidth={sw * 0.6} />
              <circle cx={r2(q.px - q.s * 0.3)} cy={r2(q.py - q.s * 0.3)} r={r2(q.s * 0.25)} fill={PIZZERIA.pepperoni2} /></g>
          : <g key={"t" + i}><circle cx={r2(q.px)} cy={r2(q.py)} r={r2(q.s)} fill="#fbf6ea" stroke={INK} strokeWidth={sw * 0.5} />
              <ellipse cx={r2(q.px + q.s * 1.1)} cy={r2(q.py - q.s * 0.6)} rx={r2(q.s * 0.7)} ry={r2(q.s * 0.38)} transform={`rotate(${r2(q.a)} ${r2(q.px + q.s * 1.1)} ${r2(q.py - q.s * 0.6)})`}
                fill={PIZZERIA.basil} stroke={INK} strokeWidth={sw * 0.4} /></g>)}
        {cuts > 1 && Array.from({ length: cuts }, (_, i) => {
          const a = start + i * sliceAng;
          if (gone && (i < gone && i !== 0)) return null;
          return <path key={"k" + i} d={`M 0 0 L ${r2(Math.cos(rad(a)) * r * 0.97)} ${r2(Math.sin(rad(a)) * r * 0.97)}`} stroke={mix(PIZZERIA.cheese, INK, 0.45)} strokeWidth={sw * 0.7} strokeLinecap="round" />;
        })}
        {gone > 0 && <path d={wedge(keepFrom, keepTo - 0.001, r)} fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />}
      </g>
    );
  };

// ---------------------------------------------------------------- pizza boxes
/** Box widths at scale 1 (design px): medium = 12-inch, large = 18-inch (exactly 1.5x wider). */
export const BOX_W = { medium: 300, large: 450 } as const;
export type BoxSize = keyof typeof BOX_W;
const BOX_FZ = 0.42, BOX_FV = 0.85;
/** Box dimensions in design px for a size + scale: w = width, hb = front face height, d = visible top depth. */
export const boxDims = (size: BoxSize, scale = 1) => {
  const w = BOX_W[size] * scale;
  return { w, hb: Math.max(30, w * 0.11), d: w * BOX_FZ };
};
/** height of a closed box on screen (front face + top face), for stacking */
export const boxStackStep = (size: BoxSize, scale = 1) => boxDims(size, scale).hb;

/** Pizza box seen from the front and a little above (sits on the counter). x = centre, y = bottom of its front face.
 *  size "medium" | "large" (1.5x wider; the pizza inside scales with it). open 0..1 swings the lid up from the back
 *  hinge (0 = closed: plain cream lid with a red-green slice print and a red-white checker band; ~0.55 = lid upright,
 *  you see its inside; 1 = flopped slightly back) revealing the pizza. steam 0..1 = three wisps when open. Box width
 *  is BOX_W[size] * scale; put two mediums side by side with ~20 px between them. */
export const PizzaBox: React.FC<{ x: number; y: number; size: BoxSize; open?: number; scale?: number; steam?: number; f?: number; toppings?: Toppings; seed?: number }> =
  ({ x, y, size, open = 0, scale = 1, steam = 0, f = 0, toppings = "pepperoni", seed }) => {
    const { w, hb, d } = boxDims(size, scale);
    const hw = w / 2, bw = hw * 0.95;              // back edge a touch narrower (perspective)
    const yTop = y - hb, yBack = yTop - d;
    const th = rad(clamp01(open) * 112);
    const D = w;
    const yF = yBack + D * BOX_FZ * Math.cos(th) - D * BOX_FV * Math.sin(th);
    const inside = yF < yBack - 1;
    const fw = hw + (bw - hw) * (1 - Math.cos(th)) * 0.5;   // free edge half-width
    const lipH = hb * 0.32 * Math.abs(Math.cos(th));
    const sw = Math.max(4, 6 * scale);
    const pr = w * 0.42;
    const checker = (x0: number, y0: number, ww: number, hh: number, k: string) => {
      const n = Math.max(6, Math.round(ww / (hh * 1.1)));
      return Array.from({ length: n }, (_, i) => i % 2 ? null : <rect key={k + i} x={r2(x0 + (i * ww) / n)} y={r2(y0)} width={r2(ww / n)} height={r2(hh)} fill={PIZZERIA.print} />);
    };
    return (
      <g>
        <ellipse cx={x} cy={y + 2} rx={hw + 12} ry={Math.max(6, 10 * scale)} fill={SHADOW} opacity={0.2} />
        {/* tray: inner floor + walls, then the pizza */}
        <path d={`M ${r2(x - hw)} ${r2(yTop)} L ${r2(x - bw)} ${r2(yBack)} L ${r2(x + bw)} ${r2(yBack)} L ${r2(x + hw)} ${r2(yTop)} Z`} fill={PIZZERIA.boxIn} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        <path d={`M ${r2(x - bw)} ${r2(yBack)} L ${r2(x + bw)} ${r2(yBack)} L ${r2(x + bw - 8 * scale)} ${r2(yBack + hb * 0.5)} L ${r2(x - bw + 8 * scale)} ${r2(yBack + hb * 0.5)} Z`} fill={PIZZERIA.boxIn2} />
        {open > 0.02 && <Pizza x={x} y={r2(yBack + d * 0.52 + hb * 0.15)} r={r2(pr)} tilt={BOX_FZ} toppings={toppings} seed={seed ?? (size === "large" ? 9 : 4)} />}
        {/* front face */}
        <rect x={r2(x - hw)} y={r2(yTop)} width={r2(w)} height={r2(hb)} fill={PIZZERIA.box} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        {checker(x - hw + sw / 2, yTop + hb * 0.36, w - sw, hb * 0.32, "fc")}
        {/* lid */}
        {open <= 0.001
          ? <g>
              <path d={`M ${r2(x - hw)} ${r2(yTop)} L ${r2(x - bw)} ${r2(yBack)} L ${r2(x + bw)} ${r2(yBack)} L ${r2(x + hw)} ${r2(yTop)} Z`} fill={PIZZERIA.box} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
              {/* print: a slice inside a ring (flattened), plus a green stripe */}
              <g transform={`translate(${r2(x)} ${r2(yTop - d * 0.5)}) scale(1 ${BOX_FZ})`}>
                <circle cx={0} cy={0} r={r2(w * 0.24)} fill="none" stroke={PIZZERIA.print} strokeWidth={r2(w * 0.035)} />
                <path d={`M ${r2(-w * 0.1)} ${r2(-w * 0.12)} L ${r2(w * 0.12)} ${r2(-w * 0.04)} L ${r2(-w * 0.06)} ${r2(w * 0.14)} Z`} fill={PIZZERIA.cheese} stroke={INK} strokeWidth={r2(w * 0.016)} strokeLinejoin="round" />
                <path d={`M ${r2(-w * 0.1)} ${r2(-w * 0.12)} L ${r2(w * 0.12)} ${r2(-w * 0.04)}`} stroke={PIZZERIA.crust2} strokeWidth={r2(w * 0.03)} strokeLinecap="round" />
                {[[-0.03, -0.04], [0.03, 0.02], [-0.04, 0.06]].map(([px, py], i) => <circle key={i} cx={r2(px * w)} cy={r2(py * w)} r={r2(w * 0.017)} fill={PIZZERIA.pepperoni} />)}
              </g>
              <path d={`M ${r2(x - hw * 0.92)} ${r2(yTop - d * 0.1)} L ${r2(x + hw * 0.92)} ${r2(yTop - d * 0.1)}`} stroke={PIZZERIA.print2} strokeWidth={r2(Math.max(3, w * 0.014))} />
              <path d={`M ${r2(x - hw)} ${r2(yTop)} L ${r2(x + hw)} ${r2(yTop)}`} stroke={INK} strokeWidth={sw} />
            </g>
          : <g>
              <path d={`M ${r2(x - bw)} ${r2(yBack)} L ${r2(x - fw)} ${r2(yF)} L ${r2(x + fw)} ${r2(yF)} L ${r2(x + bw)} ${r2(yBack)} Z`}
                fill={inside ? PIZZERIA.boxIn : PIZZERIA.box} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
              {inside && <path d={`M ${r2(x - bw + 14 * scale)} ${r2(yBack - 6 * scale)} L ${r2(x - fw + 14 * scale)} ${r2(yF + 10 * scale)} M ${r2(x + bw - 14 * scale)} ${r2(yBack - 6 * scale)} L ${r2(x + fw - 14 * scale)} ${r2(yF + 10 * scale)}`}
                stroke={PIZZERIA.boxIn2} strokeWidth={r2(5 * scale)} strokeLinecap="round" />}
              {inside && <ellipse cx={x} cy={r2((yBack + yF) / 2)} rx={r2(w * 0.3)} ry={r2(Math.abs(yBack - yF) * 0.28)} fill={PIZZERIA.boxIn2} opacity={0.55} />}
              {lipH > 2 && <rect x={r2(x - fw)} y={r2(inside ? yF - lipH : yF)} width={r2(fw * 2)} height={r2(lipH)} fill={PIZZERIA.box} stroke={INK} strokeWidth={sw * 0.8} />}
            </g>}
        {steam > 0 && open > 0.3 && [-0.25, 0, 0.25].map((u, i) => {
          const sx = x + u * w, sy = yBack + d * 0.3, wv = Math.sin(f * 0.15 + i * 2) * 10 * scale;
          return <path key={"st" + i} d={`M ${r2(sx)} ${r2(sy)} q ${r2(22 * scale + wv)} ${r2(-40 * scale)} 0 ${r2(-80 * scale)} q ${r2(-22 * scale - wv)} ${r2(-40 * scale)} 0 ${r2(-80 * scale)}`}
            stroke="#ffffff" strokeWidth={r2(8 * scale)} fill="none" strokeLinecap="round" opacity={r2(steam * (0.35 + 0.15 * i) * 100) / 100} />;
        })}
      </g>
    );
  };

/** A stack of closed boxes (bottom box first). x, y = bottom-front centre; count boxes of `size`; jitter offsets each
 *  box a few px (deterministic). The top box can be opened with topOpen 0..1. */
export const PizzaStack: React.FC<{ x: number; y: number; count: number; size?: BoxSize; scale?: number; topOpen?: number; jitter?: number }> =
  ({ x, y, count, size = "medium", scale = 1, topOpen = 0, jitter = 1 }) => {
    const step = boxStackStep(size, scale), R = rng(41 + count);
    return (
      <g>
        {Array.from({ length: Math.max(0, Math.floor(count)) }, (_, i) => {
          const dx = i === 0 ? 0 : (R() - 0.5) * 14 * scale * jitter;
          return <PizzaBox key={i} x={r2(x + dx)} y={r2(y - i * step)} size={size} scale={scale} open={i === count - 1 ? topOpen : 0} />;
        })}
      </g>
    );
  };

/** y of the bottom of box number i (0 = bottom) in a PizzaStack (put a hand / another prop there). */
export const stackTopY = (y: number, count: number, size: BoxSize = "medium", scale = 1) => y - count * boxStackStep(size, scale) - boxDims(size, scale).d;

// ---------------------------------------------------------------- peel
/** Wooden pizza peel (front view silhouette): x, y = the grip (end of the handle), rot = degrees (0 = blade to the
 *  right, -90 = blade straight up), len = handle length (default 300), pizza = draw a pizza on the blade. Use
 *  peelBlade() for the blade centre. */
export const Peel: React.FC<{ x: number; y: number; rot?: number; scale?: number; len?: number; pizza?: boolean | Toppings }> = ({ x, y, rot = 0, scale = 1, len = 300, pizza = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <rect x={-10} y={-11} width={len + 10} height={22} rx={11} fill={PIZZERIA.peel} stroke={INK} strokeWidth={6} />
    <path d={`M 0 -4 L ${len - 20} -4`} stroke="#ffffff" strokeOpacity={0.25} strokeWidth={5} strokeLinecap="round" />
    <path d={`M ${len - 10} -16 L ${len + 30} -60 L ${len + 200} -70 Q ${len + 240} -70 ${len + 240} -30 L ${len + 240} 30 Q ${len + 240} 70 ${len + 200} 70 L ${len + 30} 60 L ${len - 10} 16 Z`}
      fill={PIZZERIA.peel} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d={`M ${len + 50} -40 L ${len + 210} -46 M ${len + 50} 0 L ${len + 220} 0 M ${len + 50} 40 L ${len + 210} 46`} stroke={PIZZERIA.peel2} strokeWidth={4} strokeLinecap="round" />
    {pizza && <g transform={`rotate(${-rot} ${len + 140} 0)`}><Pizza x={len + 140} y={0} r={88} slices={0} toppings={pizza === true ? "margherita" : pizza} tilt={0.55} /></g>}
  </g>
);
/** world position of a Peel's blade centre */
export const peelBlade = (p: { x: number; y: number; rot?: number; scale?: number; len?: number }) => {
  const k = p.scale ?? 1, a = rad(p.rot ?? 0), d = ((p.len ?? 300) + 140) * k;
  return { x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d };
};

// ---------------------------------------------------------------- wardrobe (PersonPart, same props as the Person)
type Wear = { x: number; y: number; scale?: number; facing?: 1 | -1; pose?: Pose; rot?: number };

/** The pizzaiolo's tall pleated chef hat (toque). Draw AFTER the Person, same props. Hides the hair top. */
export const ChefHat: React.FC<Wear & { color?: string }> = ({ color = PIZZERIA.hat, ...p }) => (
  <PersonPart {...p} part="head">
    <path d="M -56 -96 C -96 -112 -92 -196 -40 -196 C -34 -246 34 -246 40 -196 C 92 -196 96 -112 56 -96 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -30 -150 Q -26 -120 -24 -104 M 0 -170 L 0 -104 M 30 -150 Q 26 -120 24 -104" stroke={PIZZERIA.hat2} strokeWidth={5} fill="none" strokeLinecap="round" />
    <path d="M -62 -78 Q -64 -100 -58 -108 Q 0 -118 58 -108 Q 64 -100 62 -78 Q 0 -90 -62 -78 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </PersonPart>
);

/** Long white bib apron with a green trim (pizzaiolo). Draw right AFTER the Person (and before ChefHat), same props.
 *  Front view; reads best with arms down or on the counter. */
export const ChefApron: React.FC<Wear & { color?: string; trim?: string }> = ({ color = PIZZERIA.apron, trim = PIZZERIA.trim, ...p }) => (
  <PersonPart {...p} part="body">
    <path d="M -24 -258 L -12 -292 M 24 -258 L 12 -292" stroke={INK} strokeWidth={9} strokeLinecap="round" />
    <path d="M -24 -258 L -12 -292 M 24 -258 L 12 -292" stroke={color} strokeWidth={4} strokeLinecap="round" />
    <path d="M -32 -264 L 32 -264 L 34 -190 L 50 -186 L 56 -40 Q 0 -30 -56 -40 L -50 -186 L -34 -190 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -54 -54 Q 0 -44 54 -54" stroke={trim} strokeWidth={8} fill="none" />
    <path d="M -50 -186 L 50 -186" stroke={trim} strokeWidth={6} />
    <rect x={-28} y={-150} width={56} height={40} rx={6} fill="none" stroke={PIZZERIA.apron2} strokeWidth={4} />
    <path d="M -20 -90 Q -16 -70 -24 -56 M 18 -110 Q 26 -84 16 -60" stroke={PIZZERIA.apron2} strokeWidth={4} fill="none" strokeLinecap="round" />
  </PersonPart>
);

/** Red neckerchief knotted at the throat (pizzaiolo). Draw after the Person (and after ChefApron), same props. */
export const Neckerchief: React.FC<Wear & { color?: string }> = ({ color = PIZZERIA.kerchief, ...p }) => (
  <PersonPart {...p} part="body">
    <path d="M -34 -292 Q 0 -278 34 -292 L 14 -246 Q 0 -238 -14 -246 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={0} cy={-284} r={9} fill={PIZZERIA.kerchief2} stroke={INK} strokeWidth={4} />
  </PersonPart>
);

// ---------------------------------------------------------------- lab props
const Arrowhead: React.FC<{ x: number; y: number; dir: 1 | -1; color: string; s?: number }> = ({ x, y, dir, color, s = 22 }) => (
  <path d={`M ${r2(x)} ${r2(y)} L ${r2(x - dir * s)} ${r2(y - s * 0.7)} L ${r2(x - dir * s)} ${r2(y + s * 0.7)} Z`} fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
);

/** Geometry of a CircleCompare (same props): the two centres, so labels / rulers can be placed exactly. */
export const circleCompareGeom = (p: { x: number; y: number; r1: number; r2: number; gap?: number }) => {
  const gap = p.gap ?? 90, total = 2 * p.r1 + gap + 2 * p.r2, left = p.x - total / 2;
  const base = p.y + p.r2;                                          // bottoms aligned
  return { c1: { x: left + p.r1, y: base - p.r1 }, c2: { x: left + 2 * p.r1 + gap + p.r2, y: base - p.r2 }, base };
};

/** Two circles side by side (small left, big right), bottoms aligned; x, y = centre of the pair (y = big circle's
 *  centre). showDiameter 0..1 draws a gold double-arrow across each diameter (left to right); showArea 0..1 fills each
 *  circle from the centre out (radius ~ sqrt, so the filled AREA grows linearly). diamLabels / labels: optional text
 *  above the diameter line / under each circle. colors: [small, big] fills. */
export const CircleCompare: React.FC<{ x: number; y: number; r1: number; r2: number; showDiameter?: number; showArea?: number; gap?: number;
  labels?: [string, string]; diamLabels?: [string, string]; colors?: [string, string] }> =
  ({ x, y, r1, r2: R2, showDiameter = 0, showArea = 0, gap = 90, labels, diamLabels, colors = [LAB.orange, LAB.gold] }) => {
    const g = circleCompareGeom({ x, y, r1, r2: R2, gap });
    const one = (c: { x: number; y: number }, r: number, col: string, i: number) => {
      const dp = clamp01(showDiameter), ap = clamp01(showArea);
      const x0 = c.x - r + 8, x1 = x0 + (2 * r - 16) * dp;
      return (
        <g key={i}>
          <circle cx={r2(c.x)} cy={r2(c.y)} r={r} fill={PIZZERIA.labFill} stroke={INK} strokeWidth={10} />
          {ap > 0 && <circle cx={r2(c.x)} cy={r2(c.y)} r={r2(r * Math.sqrt(ap))} fill={col} opacity={0.9} />}
          <circle cx={r2(c.x)} cy={r2(c.y)} r={r} fill="none" stroke={col} strokeWidth={8} />
          <circle cx={r2(c.x)} cy={r2(c.y)} r={r + 6} fill="none" stroke={INK} strokeWidth={4} />
          {dp > 0 && <g>
            <path d={`M ${r2(x0)} ${r2(c.y)} L ${r2(x1)} ${r2(c.y)}`} stroke={INK} strokeWidth={16} strokeLinecap="round" />
            <path d={`M ${r2(x0)} ${r2(c.y)} L ${r2(x1)} ${r2(c.y)}`} stroke={LAB.gold} strokeWidth={8} strokeLinecap="round" />
            <Arrowhead x={x0 - 4} y={c.y} dir={-1} color={LAB.gold} />
            {dp > 0.98 && <Arrowhead x={x1 + 4} y={c.y} dir={1} color={LAB.gold} />}
            {diamLabels && dp > 0.98 && <text x={r2(c.x)} y={r2(c.y - 26)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(diamLabels[i], r * 1.6, 64))}
              fill={LAB.text} stroke={INK} strokeWidth={8} paintOrder="stroke">{diamLabels[i]}</text>}
          </g>}
          {labels && <text x={r2(c.x)} y={r2(g.base + 74)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(labels[i], Math.max(2 * r, 220), 52))} fill={col}>{labels[i]}</text>}
        </g>
      );
    };
    return <g>{one(g.c1, r1, colors[0], 0)}{one(g.c2, R2, colors[1], 1)}</g>;
  };

const N_MORPH = 60;
/** boundary points of a circle (centre cx, cy, radius r) starting at angle a0 (deg), clockwise on screen */
const circlePts = (cx: number, cy: number, r: number, a0: number) =>
  Array.from({ length: N_MORPH }, (_, i) => { const a = rad(a0 + (i * 360) / N_MORPH); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const; });
/** boundary points of a sector (centre cx, cy, radius R, from a0 to a1 deg): radial edge out, arc, radial edge back */
const sectorPts = (cx: number, cy: number, R: number, a0: number, a1: number) => {
  const arcLen = R * rad(a1 - a0), tot = 2 * R + arcLen;
  return Array.from({ length: N_MORPH }, (_, i) => {
    const s = (i / N_MORPH) * tot;
    if (s < R) { const k = s / R; return [cx + Math.cos(rad(a0)) * R * k, cy + Math.sin(rad(a0)) * R * k] as const; }
    if (s < R + arcLen) { const a = a0 + ((s - R) / arcLen) * (a1 - a0); return [cx + Math.cos(rad(a)) * R, cy + Math.sin(rad(a)) * R] as const; }
    const k = 1 - (s - R - arcLen) / R; return [cx + Math.cos(rad(a1)) * R * k, cy + Math.sin(rad(a1)) * R * k] as const;
  });
};

/** Start positions PackCircles uses by default: a centred row under the big circle. */
export const packStarts = (x: number, y: number, R: number, r: number, count: number) =>
  Array.from({ length: count }, (_, i) => ({ x: x + (i - (count - 1) / 2) * (2 * r + 34), y: y + R + r + 70 }));

/** "How many small pizzas fit in a big one" by AREA (the honest picture: round circles cannot tile a circle). A big
 *  circle (x, y, R); `count` small circles (radius r) wait at `from` (default packStarts: a row under the big circle),
 *  then one after another fly in and melt into an equal-area wedge of the big circle (angle 360 * (r/R)^2), clockwise
 *  from 12 o'clock. progress 0..1 runs the whole sequence (each circle gets 1/count of it: first ~55 % flight, then
 *  the morph). R = 2r -> four quarters fill it exactly; 12" vs 18" -> two wedges leave an empty ~11 % gap. Wedges
 *  past 360 deg overlap. colors cycle per circle. */
export const PackCircles: React.FC<{ x: number; y: number; R: number; r: number; count: number; progress: number; from?: { x: number; y: number }[];
  colors?: string[]; bigColor?: string; pizza?: boolean }> =
  ({ x, y, R, r, count, progress, from, colors = [LAB.orange, "#ff7a5c", LAB.orange, "#ff7a5c"], bigColor = LAB.gold, pizza = false }) => {
    const starts = from ?? packStarts(x, y, R, r, count);
    const ang = 360 * (r / R) * (r / R);
    const seg = 1 / Math.max(1, count);
    return (
      <g>
        <circle cx={x} cy={y} r={R} fill={PIZZERIA.labDark} stroke={INK} strokeWidth={10} />
        {pizza && <g opacity={0.35}><Pizza x={x} y={y} r={R} slices={0} toppings="plain" /></g>}
        {Array.from({ length: count }, (_, i) => {
          const t = clamp01((progress - i * seg) / seg);
          const a0 = -90 + i * ang, a1 = a0 + ang, am = rad((a0 + a1) / 2);
          const half = rad(ang / 2);
          const cd = ang >= 359 ? 0 : (2 * R * Math.sin(half)) / (3 * half);
          const target = { x: x + Math.cos(am) * cd, y: y + Math.sin(am) * cd };
          const s0 = starts[i] ?? starts[starts.length - 1] ?? { x, y: y + R + r + 70 };
          const mv = easeOut(t / 0.55), mo = easeOut((t - 0.55) / 0.45);
          const col = colors[i % colors.length];
          const cx = s0.x + (target.x - s0.x) * mv, cy = s0.y + (target.y - s0.y) * mv;
          if (mo <= 0) return <g key={i}>
            <circle cx={r2(cx)} cy={r2(cy)} r={r} fill={col} stroke={INK} strokeWidth={8} />
            {pizza && <Pizza x={r2(cx)} y={r2(cy)} r={r * 0.92} slices={0} toppings="pepperoni" seed={i + 2} />}
          </g>;
          const A = circlePts(cx, cy, r, a0 + 180), Bp = sectorPts(x, y, R, a0, a1);
          const pts = A.map((p, k) => [p[0] + (Bp[k][0] - p[0]) * mo, p[1] + (Bp[k][1] - p[1]) * mo]);
          return <path key={i} d={"M" + pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join(" L") + " Z"} fill={col} stroke={INK} strokeWidth={8} strokeLinejoin="round" />;
        })}
        <circle cx={x} cy={y} r={R} fill="none" stroke={bigColor} strokeWidth={8} />
        <circle cx={x} cy={y} r={R + 6} fill="none" stroke={INK} strokeWidth={4} />
      </g>
    );
  };

/** A counter card: big value (number or ready string, e.g. countValue(...)) + optional unit after it and a label under
 *  it. x, y = card centre (card ~380 x 190 at scale 1). stamp = scale pop (stampScale(...)), color = value colour. */
export const AreaCounter: React.FC<{ x: number; y: number; value: number | string; label?: string; unit?: string; color?: string; scale?: number; stamp?: number }> =
  ({ x, y, value, label, unit, color = LAB.gold, scale = 1, stamp = 1 }) => {
    const v = String(value);
    const vs = fit(v + (unit ? "  " + unit : ""), 330, 96);
    return (
      <g transform={`translate(${x} ${y}) scale(${r2(scale * stamp * 1000) / 1000})`}>
        <rect x={-190} y={-95} width={380} height={190} rx={28} fill={PIZZERIA.labFill} stroke={INK} strokeWidth={8} />
        <rect x={-178} y={-83} width={356} height={166} rx={20} fill="none" stroke={color} strokeWidth={4} opacity={0.6} />
        <text x={0} y={label ? 18 : 34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(vs)} fill={color}>
          {v}{unit && <tspan fontSize={r2(vs * 0.45)} fill={LAB.text}>{" " + unit}</tspan>}
        </text>
        {label && <text x={0} y={68} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(label, 330, 40))} fill={LAB.muted}>{label}</text>}
      </g>
    );
  };

/** Horizontal yellow ruler. x = left end, y = its centre line, length in px; ticks = number of divisions (default 12:
 *  inches), every 3rd is long. progress 0..1 slides it out from the left end. label = text above the ruler's middle. */
export const Ruler: React.FC<{ x: number; y: number; length: number; label?: string; ticks?: number; progress?: number; color?: string }> =
  ({ x, y, length, label, ticks = 12, progress = 1, color = LAB.gold }) => {
    const L = length * clamp01(progress);
    if (L < 2) return null;
    const H = 58;
    return (
      <g>
        <rect x={x} y={y - H / 2} width={r2(L)} height={H} rx={8} fill={color} stroke={INK} strokeWidth={7} />
        {Array.from({ length: ticks + 1 }, (_, i) => {
          const tx = x + (i * length) / ticks;
          if (tx > x + L - 4 || i === 0 || i === ticks) return null;
          const long = i % 3 === 0;
          return <path key={i} d={`M ${r2(tx)} ${y - H / 2} L ${r2(tx)} ${r2(y - H / 2 + (long ? 30 : 16))}`} stroke={INK} strokeWidth={long ? 5 : 3.5} />;
        })}
        <path d={`M ${x + 10} ${y + H / 2 - 12} L ${r2(x + L - 10)} ${y + H / 2 - 12}`} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" />
        {label && progress >= 0.98 && <text x={r2(x + length / 2)} y={y - H / 2 - 22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(label, length, 60))} fill={LAB.text}>{label}</text>}
      </g>
    );
  };

/** "Judging by width": a big cartoon eye at (x, y) (size s = eye width, default 220) looks at a target circle (tx, ty,
 *  tr). width 0..1: two dashed sight lines run from the eye to the circle's left/right edges and a gold bracket spans
 *  the diameter (what we DO judge); area 0..1: the disc fills from the centre (what we SHOULD judge). blink 0..1 closes
 *  the lid. Pair it with marks / labels of your own. */
export const EyeRuler: React.FC<{ x: number; y: number; tx: number; ty: number; tr: number; s?: number; width?: number; area?: number; blink?: number;
  areaColor?: string; widthColor?: string }> =
  ({ x, y, tx, ty, tr, s = 220, width = 0, area = 0, blink = 0, areaColor = LAB.green, widthColor = LAB.gold }) => {
    const ang = Math.atan2(ty - y, tx - x);
    const ex = s / 2, ey = s * 0.32;
    const px = Math.cos(ang) * ex * 0.42, py = Math.sin(ang) * ey * 0.5;
    const w = clamp01(width), a = clamp01(area), lid = clamp01(blink);
    const eyeShape = `M ${-ex} 0 Q 0 ${-ey * 2} ${ex} 0 Q 0 ${ey * 2} ${-ex} 0 Z`;
    const L = { x: tx - tr, y: ty }, Rr = { x: tx + tr, y: ty };
    const line = (P: { x: number; y: number }, k: string) => {
      const ox = x + px, oy = y + py;
      return <path key={k} d={`M ${r2(ox)} ${r2(oy)} L ${r2(ox + (P.x - ox) * w)} ${r2(oy + (P.y - oy) * w)}`} stroke={widthColor} strokeWidth={7} strokeDasharray="18 14" strokeLinecap="round" />;
    };
    return (
      <g>
        <circle cx={tx} cy={ty} r={tr} fill={PIZZERIA.labFill} stroke={INK} strokeWidth={10} />
        {a > 0 && <circle cx={tx} cy={ty} r={r2(tr * Math.sqrt(a))} fill={areaColor} opacity={0.9} />}
        <circle cx={tx} cy={ty} r={tr} fill="none" stroke={a > 0 ? areaColor : LAB.muted} strokeWidth={7} />
        {w > 0 && <g>
          {line(L, "l")}{line(Rr, "r")}
          {w > 0.6 && (() => {
            const k = clamp01((w - 0.6) / 0.4), x0 = tx - tr * k, x1 = tx + tr * k, by = ty;
            return <g>
              <path d={`M ${r2(x0)} ${by} L ${r2(x1)} ${by}`} stroke={INK} strokeWidth={16} strokeLinecap="round" />
              <path d={`M ${r2(x0)} ${by} L ${r2(x1)} ${by}`} stroke={widthColor} strokeWidth={8} strokeLinecap="round" />
              <path d={`M ${r2(x0)} ${by - 26} L ${r2(x0)} ${by + 26} M ${r2(x1)} ${by - 26} L ${r2(x1)} ${by + 26}`} stroke={widthColor} strokeWidth={8} strokeLinecap="round" />
            </g>;
          })()}
        </g>}
        <g transform={`translate(${x} ${y})`}>
          <path d={eyeShape} fill="#fbf6ea" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
          <circle cx={r2(px)} cy={r2(py)} r={r2(ey * 0.85)} fill="#3a7bd5" stroke={INK} strokeWidth={6} />
          <circle cx={r2(px)} cy={r2(py)} r={r2(ey * 0.42)} fill={INK} />
          <circle cx={r2(px - ey * 0.3)} cy={r2(py - ey * 0.3)} r={r2(ey * 0.16)} fill="#ffffff" />
          {lid > 0 && <path d={`M ${-ex} 0 Q 0 ${r2(-ey * 2)} ${ex} 0 Q 0 ${r2(-ey * 2 + ey * 4 * lid)} ${-ex} 0 Z`} fill="#f2c39b" stroke={INK} strokeWidth={7} strokeLinejoin="round" />}
          <path d={`M ${r2(-ex * 0.8)} ${r2(-ey * 1.45)} Q 0 ${r2(-ey * 2.3)} ${r2(ex * 0.8)} ${r2(-ey * 1.45)}`} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
        </g>
      </g>
    );
  };

/** Vertical bars of price per bite (or per square inch). x = centre of the group, y = baseline, values = raw numbers
 *  (bars scale to the largest), labels under the bars, valueTexts above them (both optional, via props), w = total
 *  width (default 760), h = tallest bar (default 520), progress 0..1 grows the bars (staggered), best = index that gets
 *  a gold check badge once grown. */
export const PricePerBite: React.FC<{ x: number; y: number; values: number[]; labels?: string[]; valueTexts?: string[]; colors?: string[];
  w?: number; h?: number; progress?: number; best?: number }> =
  ({ x, y, values, labels, valueTexts, colors = [LAB.orange, LAB.green, LAB.red, LAB.gold], w = 760, h = 520, progress = 1, best }) => {
    const n = Math.max(1, values.length), max = Math.max(1e-9, ...values.map((v) => Math.abs(v)));
    const slot = w / n, bw = Math.min(220, slot * 0.62);
    return (
      <g>
        {values.map((v, i) => {
          const t = easeOut(clamp01((progress - i * 0.15) / Math.max(0.2, 1 - (n - 1) * 0.15)));
          const bh = (Math.abs(v) / max) * h * t, cx = x - w / 2 + slot * (i + 0.5), col = colors[i % colors.length];
          return (
            <g key={i}>
              <rect x={r2(cx - bw / 2)} y={y - h} width={r2(bw)} height={h} rx={14} fill="#ffffff" opacity={0.05} />
              {bh > 1 && <rect x={r2(cx - bw / 2)} y={r2(y - bh)} width={r2(bw)} height={r2(bh)} rx={r2(Math.min(14, bh / 2))} fill={col} stroke={INK} strokeWidth={7} />}
              {bh > 40 && <rect x={r2(cx - bw / 2 + 16)} y={r2(y - bh + 16)} width={12} height={r2(bh - 32)} rx={6} fill="#ffffff" opacity={0.3} />}
              {valueTexts?.[i] && t > 0.9 && <text x={r2(cx)} y={r2(y - bh - 24)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(valueTexts[i], slot - 10, 60))} fill={col}>{valueTexts[i]}</text>}
              {labels?.[i] && <text x={r2(cx)} y={y + 62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(labels[i], slot - 10, 44))} fill={LAB.text}>{labels[i]}</text>}
              {best === i && t > 0.98 && <g transform={`translate(${r2(cx + bw / 2 - 4)} ${r2(y - bh - 4)})`}>
                <circle cx={0} cy={0} r={34} fill={LAB.gold} stroke={INK} strokeWidth={6} />
                <path d="M -15 1 L -4 13 L 17 -12" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>}
            </g>
          );
        })}
        <path d={`M ${r2(x - w / 2 - 20)} ${y} L ${r2(x + w / 2 + 20)} ${y}`} stroke={LAB.muted} strokeWidth={6} strokeLinecap="round" />
      </g>
    );
  };
