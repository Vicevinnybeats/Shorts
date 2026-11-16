// Library (2.5D): a sunny Saturday flea market on a park lawn, late morning (episode "first-offer"): warm sky, a far
// tree line, rows of distant gazebo stalls with striped awnings, bunting strings, muted shopper silhouettes (no text,
// no brands); a mown lawn ground. Props: a front-view trestle stall (back/front layers so a seller stands behind it),
// record crate, old sunburst acoustic guitar + stand, hanging paper price tag that flips blank -> price, coins and
// banknotes, foreground bunting. Wardrobe (PersonPart): Kai's Cap, Rosa's ToteBag + Sunglasses. Lab props: rule card
// with a red stamp, negotiation table (2 chairs + seat helper), sliding offer card, ship anchor, price line with a
// haggling-range bracket that bends toward the anchor, wheel of fortune, guess bars, price slider, handshake close-up.
// No text anywhere unless passed as a prop. Prices: pass a number (gets the `currency` prefix, default "$") or a
// ready string such as "£120".
import React from "react";
import { INK, Pose } from "../characters25/person";
import { CachedSvg } from "../../src/engine25/cached";
import { LAB } from "../style/channel";
import { PersonPart } from "./livingroom";
import { Chair, sitPose, sitX, sitY } from "./cafe";
import { reachLimb } from "./square";

export const MARKET = {
  sky: "#8fd0f0", sky2: "#b6e2f4", haze: "#fff0cf", sun: "#ffd93b", cloud: "#fffaf0",
  treeFar: "#9ccc7a", treeFar2: "#86bb6c", leaf: "#5fa85a", leaf2: "#468f4c", trunk: "#8a5a34",
  lawn: "#8fd062", lawn2: "#7fc155", lawnFar: "#a9d97c", lawnEdge: "#6aa848", tuft: "#5c9e45", daisy: "#fffaf0", daisy2: "#ffd93b",
  canvas: "#fbf3e2", canvas2: "#e6d8bd", pole: "#e8e4da", pole2: "#a8a296",
  stripeRed: "#e8443a", stripeBlue: "#2f86d8", stripeGold: "#f2b23a", stripeGreen: "#2fa86a", stripePink: "#e85a8a", stripeTeal: "#2fa89a",
  table: "#c48a52", table2: "#9a6a3e", cloth: "#2f6f8a", cloth2: "#25596f",
  crate: "#d9a466", crate2: "#b07e48", vinyl: "#1d1a24",
  burst0: "#4a2010", burst1: "#a8441a", burst2: "#e2862a", burst3: "#ffc96a", neck: "#8a5a34", board: "#3b2416", head: "#2a1a14",
  guard: "#2a1612", string: "#efe6cf", peg: "#d9d2c0", sticker: "#3fb8c9", sticker2: "#ffd93b", scratch: "#ffe6b0",
  stand: "#2d2a33", rubber: "#5a5560",
  tag: "#fbf1d6", tag2: "#ead9ae", twine: "#b8894e",
  card: "#fbf6ea", card2: "#e6dcc6", tape: "#f2e3a0", stamp: "#d8352b",
  anchor: "#6a7a8c", anchor2: "#4d5b6c", chain: "#8a96a6",
  note: "#a9d8a2", note2: "#6fae74", coin: "#f2c230", coin2: "#c99a12",
  cap: "#e8443a", cap2: "#b8302a", tote: "#f3e6c8", tote2: "#e8643a", shades: "#1d1a24", shadesFrame: "#2f8f8a",
  ltable: "#c9d3ee", ltable2: "#9fb0d8",
} as const;

const SHADOW = "#05040c";
const r2 = (v: number) => Math.round(v * 10) / 10;
const rad = (d: number) => (d * Math.PI) / 180;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const rng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const hx = (h: string) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
/** flat colour mix (no blend modes): a -> b by t */
const mix = (a: string, b: string, t: number) => { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };

/** A price for display: numbers get the currency prefix, strings are shown as they are. */
export const fmtPrice = (v: string | number, currency = "$") => (typeof v === "number" ? `${currency}${v}` : v);
/** font size that fits `text` into `w` px (CaptionSans 900 is ~0.68 em per glyph) */
const fit = (text: string, w: number, max: number) => Math.min(max, w / (Math.max(1, text.length) * 0.68));
const FONT = "CaptionSans, sans-serif";

/** awning stripe pairs (pass one as Stall `awning`) */
export const AWNINGS: readonly (readonly [string, string])[] = [
  [MARKET.stripeRed, MARKET.canvas], [MARKET.stripeBlue, MARKET.canvas], [MARKET.stripeGreen, MARKET.canvas],
  [MARKET.stripeGold, MARKET.canvas], [MARKET.stripePink, MARKET.canvas], [MARKET.stripeTeal, MARKET.canvas],
];
const BUNTING = [MARKET.stripeRed, MARKET.stripeGold, MARKET.stripeBlue, MARKET.stripeGreen, MARKET.stripePink, MARKET.canvas];

// ---------------------------------------------------------------- bunting
const sagPts = (x0: number, y0: number, x1: number, y1: number, sag: number, n: number) =>
  Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + sag * 4 * t * (1 - t)] as [number, number]; });

/** A sagging string of triangle flags from (x0,y0) to (x1,y1). f = frame for a gentle flutter (omit = still).
 *  size = flag height (default 56). fade 0..1 mixes the colours toward the sky haze (distant strings). */
export const Bunting: React.FC<{ x0: number; y0: number; x1: number; y1: number; sag?: number; n?: number; f?: number; size?: number; fade?: number; seed?: number }> =
  ({ x0, y0, x1, y1, sag = 90, n = 14, f, size = 56, fade = 0, seed = 0 }) => {
    const pts = sagPts(x0, y0, x1, y1, sag, n * 2);
    const sw = Math.max(2, size * 0.09);
    const line = "M" + pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join(" L");
    return (
      <g>
        <path d={line} stroke={INK} strokeWidth={sw} fill="none" strokeOpacity={1 - fade * 0.6} />
        {Array.from({ length: n }, (_, i) => {
          const a = pts[i * 2], c = pts[i * 2 + 1], b = pts[i * 2 + 2];
          const fl = f === undefined ? 0 : Math.sin(f * 0.12 + i * 1.3 + seed) * size * 0.12;
          const col = mix(BUNTING[(i + seed) % BUNTING.length], MARKET.haze, fade);
          const tip: [number, number] = [c[0] + fl, c[1] + size];
          return <path key={i} d={`M ${r2(a[0] + 2)} ${r2(a[1])} L ${r2(b[0] - 2)} ${r2(b[1])} L ${r2(tip[0])} ${r2(tip[1])} Z`}
            fill={col} stroke={INK} strokeWidth={sw} strokeOpacity={1 - fade * 0.6} strokeLinejoin="round" />;
        })}
      </g>
    );
  };

// ---------------------------------------------------------------- backdrop pieces
const RoundTree: React.FC<{ x: number; base: number; s: number; col?: string; col2?: string }> = ({ x, base, s, col = MARKET.leaf, col2 = MARKET.leaf2 }) => {
  const blobs = [[-62, -200, 72], [58, -214, 74], [0, -280, 92], [-34, -160, 62], [42, -164, 58]];
  return (
    <g transform={`translate(${x} ${base}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={80} ry={12} fill={SHADOW} opacity={0.14} />
      <path d="M -13 0 L -9 -160 L 9 -160 L 13 0 Z" fill={MARKET.trunk} stroke={INK} strokeWidth={6} />
      {blobs.map(([cx, cy, r], i) => <circle key={"o" + i} cx={cx} cy={cy} r={r} fill={col} stroke={INK} strokeWidth={7} />)}
      {blobs.map(([cx, cy, r], i) => <circle key={"i" + i} cx={cx} cy={cy} r={r - 3.5} fill={col} />)}
      <path d="M -74 -190 Q -52 -150 -12 -160 M 22 -206 Q 52 -172 84 -194 M -20 -300 Q 6 -266 40 -284" stroke={col2} strokeWidth={9} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** A distant gazebo stall (simplified), colours faded toward the haze by `fade`. */
const FarStall: React.FC<{ x: number; base: number; s: number; stripe: string; fade: number; seed: number }> = ({ x, base, s, stripe, fade, seed }) => {
  const c = (col: string) => mix(col, MARKET.haze, fade), R = rng(seed + 3);
  const so = 1 - fade * 0.55;
  const goods = [MARKET.stripeGold, MARKET.stripeBlue, MARKET.stripeRed, MARKET.canvas2, MARKET.stripeGreen, MARKET.crate];
  return (
    <g transform={`translate(${x} ${base}) scale(${s})`} strokeOpacity={so}>
      {[-1, 1].map((d) => <rect key={d} x={d * 160 - 7} y={-330} width={14} height={330} fill={c(MARKET.pole)} stroke={INK} strokeWidth={6} />)}
      <path d="M -200 -330 L 0 -420 L 200 -330 Z" fill={c(MARKET.canvas)} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -100 -375 L 0 -420 L 100 -375 L 50 -330 L -50 -330 Z" fill={c(stripe)} />
      <path d="M -200 -330 L 0 -420 L 200 -330" fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {Array.from({ length: 8 }, (_, i) => {
        const x0 = -200 + i * 50;
        return <path key={i} d={`M ${x0} -330 L ${x0 + 50} -330 L ${x0 + 50} -290 Q ${x0 + 25} -270 ${x0} -290 Z`} fill={c(i % 2 ? MARKET.canvas : stripe)} stroke={INK} strokeWidth={5} />;
      })}
      {/* goods + table */}
      {Array.from({ length: 5 }, (_, i) => {
        const gx = -130 + i * 62 + R() * 10, gh = 26 + R() * 34;
        return <rect key={"g" + i} x={gx} y={-120 - gh} width={40 + R() * 14} height={gh} rx={6} fill={c(goods[Math.floor(R() * goods.length)])} stroke={INK} strokeWidth={5} />;
      })}
      <rect x={-170} y={-124} width={340} height={20} rx={4} fill={c(MARKET.table)} stroke={INK} strokeWidth={6} />
      <path d="M -165 -106 L 165 -106 L 160 -30 Q 120 -18 80 -30 Q 40 -18 0 -30 Q -40 -18 -80 -30 Q -120 -18 -160 -30 Z" fill={c(stripe === MARKET.stripeBlue ? MARKET.stripeGold : MARKET.cloth)} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

/** muted shopper silhouette (no face), feet at (x, base); bag = carries a bag */
const Shopper: React.FC<{ x: number; base: number; s: number; col: string; bag?: boolean; tall?: number; facing?: 1 | -1 }> = ({ x, base, s, col, bag, tall = 1, facing = 1 }) => (
  <g transform={`translate(${x} ${base}) scale(${s * facing} ${s * tall})`} fill={col}>
    <path d="M -16 0 L -10 -120 L 10 -120 L 16 0 L 6 0 L 0 -70 L -6 0 Z" />
    <path d="M -34 -110 C -40 -170 -30 -210 0 -212 C 30 -210 40 -170 34 -110 Z" />
    <ellipse cx={2} cy={-246} rx={30} ry={32} />
    {bag && <g><path d="M 34 -170 L 44 -100" stroke={col} strokeWidth={8} /><rect x={30} y={-104} width={36} height={40} rx={5} /></g>}
  </g>
);

/** Sky with sun + clouds, a far tree line, two rows of distant striped-awning gazebo stalls with shopper silhouettes,
 *  bunting strings across, two big round trees at the sides, and a pale lawn strip. No text. Cached.
 *  Covers x -300..1380, y..y+h; the ground line is y+h, so put MarketGround at y+h. Stalls + bunting reach ~760 px
 *  above the ground line (keep h >= 900). */
export const MarketBackdrop: React.FC<{ y?: number; h?: number }> = ({ y = 0, h = 1300 }) => {
  const B = y + h;
  const R = rng(41);
  const backStalls = [-260, 70, 400, 730, 1060, 1360];
  const frontStalls = [-140, 240, 840, 1220];
  return (
    <CachedSvg cacheKey={`market-back-${y}-${h}`} x={-300} y={y} w={1680} h={h}>
      <rect x={-300} y={y} width={1680} height={h} fill={MARKET.sky} />
      <rect x={-300} y={B - 1020} width={1680} height={300} fill={MARKET.sky2} />
      <rect x={-300} y={B - 720} width={1680} height={720} fill={MARKET.haze} />
      {/* late-morning sun (left, high) + clouds */}
      <circle cx={150} cy={B - 1080} r={72} fill={MARKET.sun} stroke={INK} strokeWidth={6} />
      {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <path key={"r" + i} d={`M ${r2(150 + Math.cos(a) * 94)} ${r2(B - 1080 + Math.sin(a) * 94)} L ${r2(150 + Math.cos(a) * 120)} ${r2(B - 1080 + Math.sin(a) * 120)}`} stroke={MARKET.sun} strokeWidth={10} strokeLinecap="round" />; })}
      {[[520, B - 1160, 0.9], [980, B - 1010, 1], [-180, B - 900, 0.7]].map(([cx, cy, s], i) =>
        <path key={"cl" + i} transform={`translate(${cx} ${cy}) scale(${s})`} d="M -110 20 Q -120 -20 -70 -20 Q -60 -60 -10 -55 Q 30 -80 60 -40 Q 110 -45 110 0 Q 120 25 90 25 L -90 25 Q -115 25 -110 20 Z"
          fill={MARKET.cloud} stroke={INK} strokeWidth={5} />)}
      {/* far tree line: merged blobs */}
      {(() => {
        const blobs: [number, number, number][] = [];
        for (let x = -320; x < 1420; x += 70) blobs.push([x + R() * 30, B - 330 - R() * 120, 70 + R() * 40]);
        return <g>
          {blobs.map(([cx, cy, r], i) => <circle key={"to" + i} cx={r2(cx)} cy={r2(cy)} r={r2(r)} fill={MARKET.treeFar} stroke={INK} strokeWidth={5} strokeOpacity={0.4} />)}
          {blobs.map(([cx, cy, r], i) => <circle key={"ti" + i} cx={r2(cx)} cy={r2(cy)} r={r2(r - 2.5)} fill={i % 3 ? MARKET.treeFar : MARKET.treeFar2} />)}
        </g>;
      })()}
      <rect x={-300} y={B - 300} width={1680} height={300} fill={MARKET.lawnFar} />
      <rect x={-300} y={B - 300} width={1680} height={8} fill={SHADOW} opacity={0.08} />
      {/* far bunting between the back stalls */}
      <Bunting x0={-300} y0={B - 560} x1={700} y1={B - 600} sag={70} n={16} size={34} fade={0.45} seed={2} />
      <Bunting x0={600} y0={B - 590} x1={1380} y1={B - 560} sag={60} n={13} size={34} fade={0.45} seed={4} />
      {/* back row of stalls + shoppers */}
      {backStalls.map((sx, i) => <FarStall key={"bs" + i} x={sx} base={B - 190} s={0.5} stripe={AWNINGS[(i * 2) % AWNINGS.length][0]} fade={0.5} seed={i * 5} />)}
      {Array.from({ length: 14 }, (_, i) => <Shopper key={"sb" + i} x={-260 + i * 120 + R() * 50} base={B - 180 + R() * 10} s={0.4} tall={0.9 + R() * 0.2}
        col={mix("#9a8aa0", MARKET.haze, 0.45)} bag={R() < 0.4} facing={R() < 0.5 ? 1 : -1} />)}
      {/* big trees between the rows */}
      <RoundTree x={-60} base={B - 70} s={1.1} />
      <RoundTree x={1160} base={B - 80} s={1.05} />
      {/* front row of stalls + shoppers */}
      {frontStalls.map((sx, i) => <FarStall key={"fs" + i} x={sx} base={B - 40} s={0.72} stripe={AWNINGS[(i * 2 + 1) % AWNINGS.length][0]} fade={0.25} seed={20 + i * 7} />)}
      {Array.from({ length: 9 }, (_, i) => <Shopper key={"sf" + i} x={-200 + i * 180 + R() * 60} base={B - 24 + R() * 10} s={0.58} tall={0.9 + R() * 0.2}
        col={mix("#7d6b86", MARKET.haze, 0.3)} bag={R() < 0.5} facing={R() < 0.5 ? 1 : -1} />)}
      {/* near bunting high across the frame */}
      <Bunting x0={-300} y0={B - 780} x1={1380} y1={B - 740} sag={130} n={22} size={50} fade={0.1} seed={0} />
    </CachedSvg>
  );
};

/** Mown park lawn in fake perspective (stripes converge on a vanishing point ~1400 px above y), with a few tufts and
 *  daisies, from y down. Cached. */
export const MarketGround: React.FC<{ y: number; h?: number }> = ({ y, h = 700 }) => {
  const vx = 540, vy = y - 1400, yb = y + h;
  const colX = (X: number, yy: number) => vx + (X - vx) * (yy - vy) / (yb - vy);
  const bands: React.ReactElement[] = [];
  for (let i = -14; i < 16; i++) {
    const X0 = vx + i * 260 - 130, X1 = X0 + 260;
    if (i % 2) bands.push(<path key={i} d={`M ${r2(colX(X0, y))} ${y} L ${r2(colX(X1, y))} ${y} L ${r2(X1)} ${yb} L ${r2(X0)} ${yb} Z`} fill={MARKET.lawn2} />);
  }
  const R = rng(73);
  const bits: React.ReactElement[] = [];
  for (let i = 0; i < 46; i++) {
    const t = R(), yy = y + 30 + t * t * (h - 40), x = -360 + R() * 1800, k = 0.5 + ((yy - y) / h) * 1.1;
    if (R() < 0.55) bits.push(<path key={"t" + i} d={`M ${r2(x - 14 * k)} ${r2(yy)} L ${r2(x - 6 * k)} ${r2(yy - 22 * k)} L ${r2(x)} ${r2(yy)} L ${r2(x + 6 * k)} ${r2(yy - 26 * k)} L ${r2(x + 14 * k)} ${r2(yy)}`}
      stroke={MARKET.tuft} strokeWidth={r2(4 * k)} fill="none" strokeLinecap="round" strokeLinejoin="round" />);
    else bits.push(<g key={"d" + i}>{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={r2(x + Math.cos(rad(a)) * 7 * k)} cy={r2(yy + Math.sin(rad(a)) * 5 * k)} r={r2(5 * k)} fill={MARKET.daisy} />)}
      <circle cx={r2(x)} cy={r2(yy)} r={r2(4 * k)} fill={MARKET.daisy2} /></g>);
  }
  return (
    <CachedSvg cacheKey={`market-ground-${y}-${h}`} x={-400} y={y} w={1880} h={h}>
      <rect x={-400} y={y} width={1880} height={h} fill={MARKET.lawn} />
      {bands}
      {bits}
      <rect x={-400} y={y} width={1880} height={10} fill={MARKET.lawnEdge} />
      <rect x={-400} y={y + 10} width={1880} height={10} fill={SHADOW} opacity={0.08} />
    </CachedSvg>
  );
};

// ---------------------------------------------------------------- the stall
/** Stall heights in Person-local units (multiply by the stall's scale): table top surface + awning valance bottom. */
export const STALL = { top: 180, valance: 560, roof: 700 } as const;
export type StallProps = { x: number; y: number; w?: number; scale?: number; awning?: readonly [string, string]; cloth?: string;
  layer?: "back" | "front" | "all"; goods?: boolean };

/** Front-view flea-market stall: a trestle table with a draped cloth (hem a little above the ground) under a gazebo
 *  with a striped scalloped awning. x = centre, y = ground, w = table width (default 600), scale = the seller's scale.
 *  A seller BEHIND it: <Stall layer="back"/> -> <Person {...behindStall(stall)}/> -> <Stall layer="front"/> (the cloth
 *  hides his legs; his hands can rest at stallTopY). goods: a few bric-a-brac items at the table ends (middle is free
 *  for crates / tags / hands). Poles stand at x +- (w/2 + 40) * scale. */
export const Stall: React.FC<StallProps> = ({ x, y, w = 600, scale = 1, awning = AWNINGS[0], cloth = MARKET.cloth, layer = "all", goods = true }) => {
  const hw = w / 2, px = hw + 40, T = STALL.top, V = STALL.valance, RF = STALL.roof;
  const stripes = 12, sw = (px * 2 + 40) / stripes;
  const back = (
    <g key="back">
      {/* back canopy sheet seen through (shade) */}
      <path d={`M ${-px} ${-V} L ${px} ${-V} L ${px} ${-V + 44} L ${-px} ${-V + 44} Z`} fill={mix(awning[0], awning[1], 0.6)} />
      {[-1, 1].map((d) => <g key={d}>
        <rect x={d * px - 9} y={-V} width={18} height={V} fill={MARKET.pole} stroke={INK} strokeWidth={6} />
        <rect x={d * px - 16} y={-10} width={32} height={12} rx={3} fill={MARKET.pole2} stroke={INK} strokeWidth={5} />
      </g>)}
      {/* roof (seen from slightly below) */}
      <path d={`M ${-px - 20} ${-V - 60} L 0 ${-RF} L ${px + 20} ${-V - 60} Z`} fill={awning[1]} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d={`M ${-px * 0.5} ${-RF + 70} L 0 ${-RF} L ${px * 0.5} ${-RF + 70} L ${px * 0.25} ${-V - 60} L ${-px * 0.25} ${-V - 60} Z`} fill={awning[0]} />
      <path d={`M ${-px - 20} ${-V - 60} L 0 ${-RF} L ${px + 20} ${-V - 60}`} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <circle cx={0} cy={-RF - 8} r={12} fill={awning[0]} stroke={INK} strokeWidth={5} />
      {/* striped valance with scallops */}
      {Array.from({ length: stripes }, (_, i) => {
        const x0 = -px - 20 + i * sw;
        return <path key={i} d={`M ${r2(x0)} ${-V - 62} L ${r2(x0 + sw)} ${-V - 62} L ${r2(x0 + sw)} ${-V} Q ${r2(x0 + sw / 2)} ${-V + 30} ${r2(x0)} ${-V} Z`}
          fill={i % 2 ? awning[1] : awning[0]} stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
      })}
      <rect x={-px - 24} y={-V - 70} width={px * 2 + 48} height={14} rx={6} fill={awning[0]} stroke={INK} strokeWidth={6} />
    </g>
  );
  const items = goods && (
    <g key="goods">
      {/* left: stack of books + teapot; right: vase + blank picture frame */}
      <g transform={`translate(${-hw + 70} ${-T})`}>
        {[[0, 70, MARKET.stripeRed], [6, 62, MARKET.stripeGreen], [-4, 66, MARKET.stripeGold]].map(([dx, bw, col], i) =>
          <rect key={i} x={(dx as number) - (bw as number) / 2} y={-22 * (i + 1)} width={bw as number} height={22} rx={3} fill={col as string} stroke={INK} strokeWidth={5} />)}
        <g transform="translate(92 0)">
          <path d="M -34 0 C -44 -40 -30 -62 0 -62 C 30 -62 44 -40 34 0 Z" fill={MARKET.stripeTeal} stroke={INK} strokeWidth={6} />
          <path d="M 34 -36 Q 58 -40 62 -60" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d="M 34 -36 Q 58 -40 62 -60" stroke={MARKET.stripeTeal} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M -36 -30 Q -56 -34 -50 -10" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
          <rect x={-18} y={-72} width={36} height={12} rx={5} fill={MARKET.stripeTeal} stroke={INK} strokeWidth={5} />
          <circle cx={0} cy={-78} r={7} fill={MARKET.canvas} stroke={INK} strokeWidth={4} />
        </g>
      </g>
      <g transform={`translate(${hw - 70} ${-T})`}>
        <path d="M -16 0 Q -30 -40 -12 -70 L -12 -90 L 12 -90 L 12 -70 Q 30 -40 16 0 Z" fill={MARKET.stripePink} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <g transform="translate(-86 0) rotate(-6)">
          <rect x={-38} y={-100} width={76} height={98} rx={4} fill={MARKET.crate2} stroke={INK} strokeWidth={6} />
          <rect x={-26} y={-88} width={52} height={74} fill={MARKET.sky2} stroke={INK} strokeWidth={4} />
          <path d="M -26 -30 L -8 -52 L 6 -38 L 14 -46 L 26 -30 Z" fill={MARKET.leaf} />
        </g>
      </g>
    </g>
  );
  const front = (
    <g key="front">
      {/* trestle legs below the cloth */}
      {[-1, 1].map((d) => <path key={d} d={`M ${d * (hw - 60)} ${-T + 20} L ${d * (hw - 90)} 0 M ${d * (hw - 60)} ${-T + 20} L ${d * (hw - 30)} 0`} stroke={INK} strokeWidth={16} strokeLinecap="round" />)}
      {[-1, 1].map((d) => <path key={"i" + d} d={`M ${d * (hw - 60)} ${-T + 20} L ${d * (hw - 90)} 0 M ${d * (hw - 60)} ${-T + 20} L ${d * (hw - 30)} 0`} stroke={MARKET.table2} strokeWidth={7} strokeLinecap="round" />)}
      {items}
      {/* top + cloth */}
      <rect x={-hw - 10} y={-T} width={w + 20} height={18} rx={5} fill={MARKET.table} stroke={INK} strokeWidth={7} />
      <path d={`M ${-hw - 14} ${-T + 10} L ${hw + 14} ${-T + 10} L ${hw + 20} ${-44} ` +
        Array.from({ length: 6 }, (_, i) => { const xa = hw + 20 - ((i + 1) * (w + 40)) / 6, xm = xa + (w + 40) / 12; return `Q ${r2(xm)} ${-26} ${r2(xa)} ${-44}`; }).join(" ") + " Z"}
        fill={cloth} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {[-0.66, -0.33, 0, 0.33, 0.66].map((k) => <path key={k} d={`M ${r2(k * hw)} ${-T + 26} Q ${r2(k * hw + 8)} ${-T * 0.55} ${r2(k * hw + (w + 40) / 12 * (k >= 0 ? 0.4 : -0.4))} ${-40}`} stroke={mix(cloth, SHADOW, 0.22)} strokeWidth={6} fill="none" strokeLinecap="round" />)}
      <path d={`M ${-hw - 14} ${-T + 28} L ${hw + 14} ${-T + 28}`} stroke={mix(cloth, "#ffffff", 0.25)} strokeWidth={5} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {layer !== "front" && <ellipse cx={0} cy={4} rx={px + 40} ry={18} fill={SHADOW} opacity={0.16} />}
      {layer !== "front" && back}
      {layer !== "back" && front}
    </g>
  );
};

/** y of a stall's table-top surface (put Crate / goods / hands there) */
export const stallTopY = (s: { y: number; scale?: number }) => s.y - STALL.top * (s.scale ?? 1);
/** a point on the bottom edge of a stall's awning valance (u = -1 left pole .. 1 right pole): hang PriceTags there */
export const stallHook = (s: { x: number; y: number; w?: number; scale?: number }, u = 0) => {
  const k = s.scale ?? 1, px = (s.w ?? 600) / 2 + 40;
  return { x: s.x + u * px * k, y: s.y - (STALL.valance - 14) * k };
};
/** Person props (x, y, scale) for a seller standing BEHIND the stall (feet a little behind the cloth). dx = offset
 *  from the stall centre in stall units. Spread into <Person> + Cap; add facing/pose yourself. */
export const behindStall = (s: { x: number; y: number; scale?: number }, dx = 0) => {
  const k = s.scale ?? 1;
  return { x: s.x + dx * k, y: s.y - 40 * k, scale: k * 0.96 };
};

/** The seller's pose with both hands resting ON the stall top (front view; elbows out), `spread` = hand distance from
 *  his centre in his own units. Pass the same props as the Person (from behindStall + facing + base pose). */
export const handsOnStall = (p: { x: number; y: number; scale?: number; facing?: 1 | -1; pose: Pose }, s: { y: number; scale?: number }, spread = 110): Pose => {
  const k = p.scale ?? 1, ty = stallTopY(s) - 9 * k;
  const one = reachLimb({ ...p, pose: { ...p.pose, profile: false } }, "armL", { x: p.x - spread * k, y: ty }, 1);
  return reachLimb({ ...p, pose: one }, "armR", { x: p.x + spread * k, y: ty }, 1);
};

// ---------------------------------------------------------------- props
/** Wooden crate of records (sleeves standing up, colourful, no text). x = centre, y = bottom. ~150 x 110 at scale 1. */
export const Crate: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => {
  const cols = [MARKET.stripeRed, MARKET.stripeGold, MARKET.stripeBlue, MARKET.canvas, MARKET.stripeGreen, MARKET.stripePink, MARKET.stripeTeal];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={84} ry={8} fill={SHADOW} opacity={0.16} />
      {Array.from({ length: 6 }, (_, i) => {
        const sx = -62 + i * 22, tilt = (i - 2.5) * 3, top = -112 - (i % 2) * 8;
        return <g key={i} transform={`rotate(${tilt} ${sx + 20} -40)`}>
          <rect x={sx} y={top} width={44} height={80} rx={3} fill={cols[i % cols.length]} stroke={INK} strokeWidth={5} />
          {i === 3 && <g><circle cx={sx + 22} cy={top + 14} r={18} fill={MARKET.vinyl} stroke={INK} strokeWidth={3} /><circle cx={sx + 22} cy={top + 14} r={6} fill={MARKET.stripeRed} /></g>}
          {i !== 3 && <circle cx={sx + 22} cy={top + 30} r={10} fill={mix(cols[i % cols.length], SHADOW, 0.25)} />}
        </g>;
      })}
      <path d="M -78 -66 L 78 -66 L 74 0 L -74 0 Z" fill={MARKET.crate} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -76 -34 L 76 -34" stroke={INK} strokeWidth={5} />
      <path d="M -58 -50 L -50 -50 M 50 -50 L 58 -50 M -40 -18 L 40 -18" stroke={MARKET.crate2} strokeWidth={6} strokeLinecap="round" />
      <rect x={-22} y={-60} width={44} height={14} rx={7} fill={MARKET.crate2} stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** Guitar size in Person-local units (a Person at the same scale is ~410 tall): total length + key points. */
export const GUITAR = { len: 256, bodyTop: 124, nut: 214 } as const;
const GUITAR_BODY = "M 0 0 C 28 0 50 -12 50 -36 C 50 -58 33 -64 32 -76 C 31 -86 41 -92 41 -104 C 41 -118 24 -124 0 -124 C -24 -124 -41 -118 -41 -104 C -41 -92 -31 -86 -32 -76 C -33 -64 -50 -58 -50 -36 C -50 -12 -28 0 0 0 Z";

/** Old acoustic guitar, front view, upright: sunburst top (flat colour steps), sound hole + rosette, dark pickguard,
 *  bridge, 6 strings, headstock with pegs, a round teal sticker with a star and a few worn scratches.
 *  x, y = the bottom of the body (end pin); rot = degrees about that point (90 = lying, neck to the right). */
export const Guitar: React.FC<{ x: number; y: number; scale?: number; rot?: number }> = ({ x, y, scale = 1, rot = 0 }) => {
  const inset = (k: number, fill: string) => <path d={GUITAR_BODY} transform={`translate(0 -58) scale(${k}) translate(0 58)`} fill={fill} />;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      {/* neck + headstock */}
      <path d={`M -11 -118 L -10 ${-GUITAR.nut} L 10 ${-GUITAR.nut} L 11 -118 Z`} fill={MARKET.board} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {[-140, -158, -174, -188, -200].map((fy) => <path key={fy} d={`M -10 ${fy} L 10 ${fy}`} stroke={MARKET.peg} strokeWidth={2} />)}
      <path d={`M -10 ${-GUITAR.nut} L -15 -250 Q 0 -260 15 -250 L 10 ${-GUITAR.nut} Z`} fill={MARKET.head} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {[-224, -234, -244].map((py) => <g key={py}>
        <path d={`M -13 ${py} L -22 ${py}`} stroke={INK} strokeWidth={4} /><circle cx={-24} cy={py} r={4.5} fill={MARKET.peg} stroke={INK} strokeWidth={3} />
        <path d={`M 13 ${py} L 22 ${py}`} stroke={INK} strokeWidth={4} /><circle cx={24} cy={py} r={4.5} fill={MARKET.peg} stroke={INK} strokeWidth={3} />
      </g>)}
      <rect x={-9} y={-GUITAR.nut - 2} width={18} height={4} fill={MARKET.peg} />
      {/* body: sunburst in flat steps */}
      <path d={GUITAR_BODY} fill={MARKET.burst0} />
      {inset(0.9, MARKET.burst1)}
      {inset(0.76, MARKET.burst2)}
      {inset(0.56, MARKET.burst3)}
      <path d={GUITAR_BODY} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {/* pickguard, sound hole, bridge */}
      <path d="M 14 -74 C 34 -74 38 -96 30 -106 C 22 -112 12 -104 14 -92 Z" fill={MARKET.guard} stroke={INK} strokeWidth={3} />
      <circle cx={0} cy={-90} r={17} fill={MARKET.board} stroke={MARKET.burst0} strokeWidth={4} />
      <circle cx={0} cy={-90} r={21} fill="none" stroke={MARKET.burst0} strokeWidth={2} />
      <rect x={-20} y={-38} width={40} height={9} rx={3} fill={MARKET.head} stroke={INK} strokeWidth={3} />
      {Array.from({ length: 6 }, (_, i) => { const t = (i - 2.5) / 2.5; return <path key={i} d={`M ${r2(t * 13)} -34 L ${r2(t * 6)} ${-GUITAR.nut}`} stroke={MARKET.string} strokeWidth={1.4} />; })}
      {/* sticker + scratches (the "old" in old guitar) */}
      <g transform="translate(-26 -30) rotate(-14)">
        <circle cx={0} cy={0} r={12} fill={MARKET.sticker} stroke={INK} strokeWidth={3} />
        <path d="M 0 -7 L 2 -2 L 7 -2 L 3 1.5 L 4.5 7 L 0 3.6 L -4.5 7 L -3 1.5 L -7 -2 L -2 -2 Z" fill={MARKET.sticker2} />
      </g>
      <path d="M 22 -20 L 36 -30 M 26 -14 L 34 -19 M -36 -64 L -28 -72" stroke={MARKET.scratch} strokeWidth={2.2} strokeLinecap="round" />
    </g>
  );
};

/** A point on the Guitar in world px (for hands): "neck" (mid neck), "head", "body" (upper bout edge), "bottom". */
export const guitarPoint = (g: { x: number; y: number; scale?: number; rot?: number }, which: "neck" | "head" | "body" | "bottom") => {
  const s = g.scale ?? 1, a = rad(g.rot ?? 0);
  const [lx, ly] = { neck: [0, -170], head: [0, -236], body: [42, -100], bottom: [0, 0] }[which];
  return { x: g.x + (lx * Math.cos(a) - ly * Math.sin(a)) * s, y: g.y + (lx * Math.sin(a) + ly * Math.cos(a)) * s };
};

/** Guitar stand (front view): splayed tripod legs, a padded lower cradle and a yoke for the neck. Draw it BEFORE the
 *  Guitar and place the guitar with guitarOnStand (same x, y, scale). */
export const GuitarStand: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={2} rx={70} ry={8} fill={SHADOW} opacity={0.18} />
    {["M 0 -40 L 0 -196", "M 0 -40 L -54 0", "M 0 -40 L 54 0", "M 0 -40 L 0 -6"].map((d, i) => <g key={i}>
      <path d={d} stroke={INK} strokeWidth={12} strokeLinecap="round" /><path d={d} stroke={MARKET.stand} strokeWidth={5} strokeLinecap="round" /></g>)}
    <path d="M -16 -200 Q 0 -186 16 -200" stroke={INK} strokeWidth={12} fill="none" strokeLinecap="round" />
    <path d="M -16 -200 Q 0 -186 16 -200" stroke={MARKET.rubber} strokeWidth={5} fill="none" strokeLinecap="round" />
    <path d="M -46 -40 Q -46 -18 -30 -16 L 30 -16 Q 46 -18 46 -40" stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" />
    <path d="M -46 -40 Q -46 -18 -30 -16 L 30 -16 Q 46 -18 46 -40" stroke={MARKET.rubber} strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);
/** Guitar props that sit it in a GuitarStand at (x, y, scale). */
export const guitarOnStand = (x: number, y: number, scale = 1) => ({ x, y: y - 18 * scale, scale, rot: 0 });

/** Hanging paper price tag. (x, y) = where the twine is tied (it hangs below); rot swings it about that point.
 *  flip 0..1 turns the tag over: < 0.5 shows the front (blank, or `front` text), > 0.5 the back with `text`.
 *  text: number -> currency + number, string -> as is. ~200 x 120 tag at scale 1, twine 60 long. */
export const PriceTag: React.FC<{ x: number; y: number; text: string | number; scale?: number; rot?: number; flip?: number; currency?: string; front?: string; twine?: number }> =
  ({ x, y, text, scale = 1, rot = 0, flip = 1, currency = "$", front, twine = 60 }) => {
    const c = Math.cos(Math.PI * clamp01(flip)), back = flip > 0.5, sx = Math.max(0.03, Math.abs(c));
    const label = back ? fmtPrice(text, currency) : front ?? "";
    const W = 200, H = 120, top = twine;
    const shape = `M ${-W / 2 + 26} ${top} L ${W / 2 - 26} ${top} L ${W / 2} ${top + 26} L ${W / 2} ${top + H} L ${-W / 2} ${top + H} L ${-W / 2} ${top + 26} Z`;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
        <path d={`M 0 0 Q ${r2(4 - c * 4)} ${top / 2} 0 ${top + 18}`} stroke={MARKET.twine} strokeWidth={4} fill="none" />
        <circle cx={0} cy={0} r={5} fill={MARKET.twine} stroke={INK} strokeWidth={3} />
        <g transform={`translate(0 0) scale(${r2(sx * 100) / 100} 1)`}>
          <path d={shape} fill={back ? MARKET.tag : mix(MARKET.tag, MARKET.tag2, 0.4)} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M ${-W / 2 + 12} ${top + H - 14} L ${W / 2 - 12} ${top + H - 14}`} stroke={MARKET.tag2} strokeWidth={5} strokeLinecap="round" />
          <circle cx={0} cy={top + 18} r={9} fill={MARKET.tag2} stroke={INK} strokeWidth={4} />
          {label && <text x={0} y={top + 88} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(label, W - 30, 62))} fill={INK}>{label}</text>}
        </g>
      </g>
    );
  };

/** A small stack of coins. x = centre, y = bottom. */
export const Coins: React.FC<{ x: number; y: number; scale?: number; count?: number }> = ({ x, y, scale = 1, count = 4 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {Array.from({ length: count }, (_, i) => <g key={i} transform={`translate(${(i % 2) * 3 - 1} ${-i * 9})`}>
      <path d="M -24 -6 L -24 0 A 24 8 0 0 0 24 0 L 24 -6 Z" fill={MARKET.coin2} stroke={INK} strokeWidth={4} />
      <ellipse cx={0} cy={-6} rx={24} ry={8} fill={MARKET.coin} stroke={INK} strokeWidth={4} />
      {i === count - 1 && <ellipse cx={0} cy={-6} rx={13} ry={4} fill="none" stroke={MARKET.coin2} strokeWidth={3} />}
    </g>)}
  </g>
);

/** Banknotes (generic: green paper, border and a round emblem, no text), fanned. x, y = where they are held. */
export const Notes: React.FC<{ x: number; y: number; scale?: number; count?: number; fan?: number; rot?: number }> = ({ x, y, scale = 1, count = 3, fan = 24, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    {Array.from({ length: count }, (_, i) => {
      const a = count > 1 ? -fan / 2 + (fan * i) / (count - 1) : 0;
      return <g key={i} transform={`rotate(${a} -40 20)`}>
        <rect x={-70} y={-34} width={140} height={68} rx={5} fill={MARKET.note} stroke={INK} strokeWidth={5} />
        <rect x={-60} y={-25} width={120} height={50} rx={3} fill="none" stroke={MARKET.note2} strokeWidth={3} />
        <circle cx={20} cy={0} r={15} fill={MARKET.note2} stroke={INK} strokeWidth={3} />
        <path d="M -48 -10 L -14 -10 M -48 2 L -24 2" stroke={MARKET.note2} strokeWidth={5} strokeLinecap="round" />
      </g>;
    })}
  </g>
);

// ---------------------------------------------------------------- wardrobe (PersonPart, same props as the Person)
type Wear = { x: number; y: number; scale?: number; facing?: 1 | -1; pose?: Pose; rot?: number };

/** Kai's red baseball cap (worn forward). Front-view poses: a dome with a curved brim across the forehead; profile
 *  poses: the brim points toward `facing`. Use with hairStyle "short" / "buzz" / "none". */
export const Cap: React.FC<Wear & { color?: string; color2?: string }> = ({ color = MARKET.cap, color2 = MARKET.cap2, ...p }) => {
  const f = p.facing ?? 1, side = !!p.pose?.profile;
  return (
    <PersonPart {...p} part="head">
      <path d="M -62 -76 C -66 -118 -34 -132 0 -132 C 34 -132 66 -118 62 -76 Q 0 -90 -62 -76 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -26 -116 Q -6 -122 14 -116 L 10 -100 Q -6 -104 -22 -100 Z" fill={color2} opacity={0.9} />
      <circle cx={0} cy={-133} r={6} fill={color} stroke={INK} strokeWidth={4} />
      {side
        ? <path d={`M ${f * 26} -82 Q ${f * 74} -90 ${f * 112} -76 Q ${f * 96} -64 ${f * 30} -70 Z`} fill={color2} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        : <path d={`M -66 -80 Q 0 -98 66 -80 Q ${74 + f * 6} -66 ${58 + f * 6} -60 Q 0 -74 ${-58 + f * 6} -60 Q ${-74 + f * 6} -66 -66 -80 Z`} fill={color2} stroke={INK} strokeWidth={5} strokeLinejoin="round" />}
    </PersonPart>
  );
};

/** Rosa's sunglasses: on the eyes, or (onHead) pushed up into the hair. */
export const Sunglasses: React.FC<Wear & { onHead?: boolean; frame?: string }> = ({ onHead = false, frame = MARKET.shadesFrame, ...p }) => (
  <PersonPart {...p} part="head">
    <g transform={onHead ? "translate(0 -42) scale(0.92)" : undefined}>
      <path d="M -4 -64 Q 0 -68 4 -64" stroke={frame} strokeWidth={6} fill="none" />
      <path d="M -36 -66 L -54 -70 M 36 -66 L 54 -70" stroke={frame} strokeWidth={6} strokeLinecap="round" />
      {[-1, 1].map((d) => <path key={d} d={`M ${d * 4} -70 L ${d * 38} -70 Q ${d * 40} -48 ${d * 22} -46 Q ${d * 4} -46 ${d * 4} -60 Z`}
        fill={MARKET.shades} stroke={frame} strokeWidth={5} strokeLinejoin="round" />)}
      <path d="M -30 -64 L -22 -56 M 12 -64 L 20 -56" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={4} strokeLinecap="round" />
    </g>
  </PersonPart>
);

/** Rosa's canvas tote bag on her shoulder (strap over the torso), hanging at the hip on `side` (1 = her +x side on
 *  screen). Draw AFTER the Person. Front-view poses read best; in profile use the near side. */
export const ToteBag: React.FC<Wear & { side?: 1 | -1; color?: string; band?: string }> = ({ side = 1, color = MARKET.tote, band = MARKET.tote2, ...p }) => {
  const d = side;
  return (
    <PersonPart {...p} part="body">
      <path d={`M ${d * 30} -282 Q ${d * 56} -230 ${d * 58} -176 M ${d * 46} -284 Q ${d * 84} -230 ${d * 98} -176`} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d={`M ${d * 30} -282 Q ${d * 56} -230 ${d * 58} -176 M ${d * 46} -284 Q ${d * 84} -230 ${d * 98} -176`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={`M ${d * 46} -180 L ${d * 110} -180 L ${d * 118} -70 L ${d * 40} -70 Z`} fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${d * 44} -136 L ${d * 114} -136 L ${d * 115} -118 L ${d * 43} -118 Z`} fill={band} />
      <path d={`M ${d * 46} -180 L ${d * 110} -180 L ${d * 118} -70 L ${d * 40} -70 Z`} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${d * 64} -184 Q ${d * 70} -200 ${d * 80} -196`} stroke={MARKET.leaf} strokeWidth={9} fill="none" strokeLinecap="round" />
    </PersonPart>
  );
};

// ---------------------------------------------------------------- lab props
/** A pinned paper rule card (text via prop: "\n" splits lines, otherwise wraps at ~maxChars) with a red rubber
 *  stamp slamming onto its corner. stamp 0..1 = progress of the slam (0 = none, scale 1.8 -> 1). mark: the stamp's
 *  sign ("!" default, "cross", "check") or pass stampText to print a word in it. x, y = card centre. */
export const RuleCard: React.FC<{ x: number; y: number; text: string; stamp?: number; scale?: number; rot?: number; mark?: "!" | "cross" | "check"; stampText?: string; maxChars?: number; size?: number }> =
  ({ x, y, text, stamp = 0, scale = 1, rot = -3, mark = "!", stampText, maxChars = 14, size = 76 }) => {
    const lines = text.includes("\n") ? text.split("\n") : text.split(" ").reduce<string[]>((acc, w) => {
      const last = acc[acc.length - 1];
      if (last !== undefined && (last + " " + w).length <= maxChars) acc[acc.length - 1] = last + " " + w; else acc.push(w);
      return acc;
    }, []);
    const W = 760, lh = size * 1.12, H = lines.length * lh + 120;
    const fs = Math.min(size, ...lines.map((l) => fit(l, W - 90, size)));
    const p = clamp01(stamp), sScale = 1.8 - 0.8 * p;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
        <rect x={-W / 2 + 14} y={-H / 2 + 16} width={W} height={H} rx={14} fill={SHADOW} opacity={0.25} />
        <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={14} fill={MARKET.card} stroke={INK} strokeWidth={8} />
        {Array.from({ length: lines.length + 1 }, (_, i) => <path key={i} d={`M ${-W / 2 + 40} ${r2(-H / 2 + 60 + i * lh + 12)} L ${W / 2 - 40} ${r2(-H / 2 + 60 + i * lh + 12)}`} stroke={MARKET.card2} strokeWidth={4} />)}
        {[-1, 1].map((d) => <rect key={d} x={d * (W / 2 - 40) - 50} y={-H / 2 - 22} width={100} height={40} fill={MARKET.tape} opacity={0.85} transform={`rotate(${d * 8} ${d * (W / 2 - 40)} ${-H / 2})`} />)}
        {lines.map((l, i) => <text key={i} x={0} y={r2(-H / 2 + 60 + i * lh + fs * 0.78)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fs)} fill={INK}>{l}</text>)}
        {p > 0 && <g transform={`translate(${W / 2 - 50} ${H / 2 + 6}) rotate(-14) scale(${r2(sScale)})`} opacity={r2(Math.min(1, p * 3))}>
          <circle cx={0} cy={0} r={96} fill="none" stroke={MARKET.stamp} strokeWidth={14} />
          <circle cx={0} cy={0} r={78} fill="none" stroke={MARKET.stamp} strokeWidth={5} />
          {stampText ? <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(stampText, 140, 50))} fill={MARKET.stamp}>{stampText}</text>
            : mark === "cross" ? <path d="M -40 -40 L 40 40 M 40 -40 L -40 40" stroke={MARKET.stamp} strokeWidth={22} strokeLinecap="round" />
              : mark === "check" ? <path d="M -44 0 L -12 32 L 46 -34" stroke={MARKET.stamp} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                : <g><path d="M 0 -50 L 0 14" stroke={MARKET.stamp} strokeWidth={24} strokeLinecap="round" /><circle cx={0} cy={44} r={13} fill={MARKET.stamp} /></g>}
          {/* worn rubber: paper-coloured specks */}
          {[[-60, -50, 5], [52, -62, 4], [70, 30, 6], [-74, 22, 4], [-20, 80, 5], [30, 76, 3], [84, -10, 4]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={MARKET.card} />)}
        </g>}
      </g>
    );
  };

/** Negotiation table geometry: table top height (Person-local units) and the chair offset from the centre. */
export const NEGOTIATION = { top: 230, w: 460, chairDx: 300 } as const;

/** Simple lab table (front view: slab top + two legs) with two cafe chairs in profile at its ends, facing in.
 *  x = centre, y = floor, scale = the sitters' scale. Order: <NegotiationTable/> -> both <Person {...negotiationSeats(..).left}/>
 *  (they sit at the ends; the near arm reaches the table top) -> OfferCard etc. on the top (y = negotiationTopY). */
export const NegotiationTable: React.FC<{ x: number; y: number; scale?: number; chairs?: boolean }> = ({ x, y, scale = 1, chairs = true }) => {
  const { top, w, chairDx } = NEGOTIATION;
  return (
    <g>
      {chairs && <Chair x={x - chairDx * scale} y={y} scale={scale} facing={1} />}
      {chairs && <Chair x={x + chairDx * scale} y={y} scale={scale} facing={-1} />}
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <ellipse cx={0} cy={4} rx={w * 0.5} ry={14} fill={SHADOW} opacity={0.3} />
        {[-1, 1].map((d) => <rect key={d} x={d * (w / 2 - 40) - 11} y={-top + 10} width={22} height={top - 10} fill={MARKET.ltable2} stroke={INK} strokeWidth={6} />)}
        <rect x={-w / 2 + 30} y={-top + 40} width={w - 60} height={14} fill={MARKET.ltable2} stroke={INK} strokeWidth={5} />
        <rect x={-w / 2} y={-top} width={w} height={26} rx={8} fill={MARKET.ltable} stroke={INK} strokeWidth={7} />
        <path d={`M ${-w / 2 + 18} ${-top + 9} L ${w / 2 - 18} ${-top + 9}`} stroke="#ffffff" strokeOpacity={0.6} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};
/** y of the negotiation table's top surface */
export const negotiationTopY = (y: number, scale = 1) => y - NEGOTIATION.top * scale;
/** Person props for the two sitters (left faces right, right faces left), seated on the chairs with the near arm
 *  resting on the table top. `talk` raises that side's near forearm a little (gesturing). Spread into <Person>. */
export const negotiationSeats = (x: number, y: number, scale = 1, talk: { left?: boolean; right?: boolean } = {}) => {
  const seat = (facing: 1 | -1, gesture: boolean) => {
    const base = sitPose("side", { armL: [20, -30], armR: [20, -30] });
    const cx = x - facing * NEGOTIATION.chairDx * scale;
    const P = { x: sitX(cx, scale, facing), y: sitY(y, scale, base), scale, facing, pose: base };
    const edge = x - facing * (NEGOTIATION.w / 2 - 60) * scale;
    const target = { x: edge, y: negotiationTopY(y, scale) - (gesture ? 80 : 4) * scale };
    const near = facing > 0 ? "armR" : "armL";
    return { ...P, pose: reachLimb(P, near, target, -1) };
  };
  return { left: seat(1, !!talk.left), right: seat(-1, !!talk.right) };
};

/** An offer card (price via prop) that slides across a table: slide 0..1 (pass an eased progress, e.g. arrive())
 *  moves it from x + from to x; speed lines while moving. x, y = final centre of the card's bottom edge. */
export const OfferCard: React.FC<{ x: number; y: number; text: string | number; scale?: number; slide?: number; from?: number; currency?: string; title?: string }> =
  ({ x, y, text, scale = 1, slide = 1, from = -360, currency = "$", title }) => {
    const p = clamp01(slide), dx = from * (1 - p), moving = p > 0.02 && p < 0.97, dir = from < 0 ? 1 : -1;
    const label = fmtPrice(text, currency), W = 240, H = title ? 160 : 130;
    return (
      <g transform={`translate(${r2(x + dx)} ${y}) scale(${scale})`}>
        {moving && [-30, 0, 30].map((oy, i) => <path key={i} d={`M ${-dir * (W / 2 + 20)} ${-H / 2 + oy} L ${-dir * (W / 2 + 20 + 60 + i * 20)} ${-H / 2 + oy}`} stroke={LAB.text} strokeWidth={8} strokeLinecap="round" opacity={0.7} />)}
        <g transform={`rotate(${r2(moving ? -dir * 4 : -2)} 0 0)`}>
          <rect x={-W / 2 + 8} y={-H + 8} width={W} height={H} rx={12} fill={SHADOW} opacity={0.3} />
          <rect x={-W / 2} y={-H} width={W} height={H} rx={12} fill={MARKET.card} stroke={INK} strokeWidth={7} />
          <rect x={-W / 2 + 12} y={-H + 12} width={W - 24} height={H - 24} rx={6} fill="none" stroke={LAB.gold} strokeWidth={5} />
          {title && <text x={0} y={-H + 52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(title, W - 60, 30))} fill={MARKET.anchor2}>{title}</text>}
          <text x={0} y={-36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(label, W - 50, 64))} fill={INK}>{label}</text>
        </g>
      </g>
    );
  };

/** Ship's anchor (ring, stock, shank, curved arms with flukes). x, y = the crown (bottom tip, where it lands);
 *  ~300 tall at scale 1. chain = length of chain going up from the ring (0 = none). */
export const Anchor: React.FC<{ x: number; y: number; scale?: number; rot?: number; chain?: number }> = ({ x, y, scale = 1, rot = 0, chain = 0 }) => {
  const links = Math.floor(chain / 34);
  const stroke2 = (d: string, w: number, c: string) => <g><path d={d} stroke={INK} strokeWidth={w + 12} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      {Array.from({ length: links }, (_, i) => <ellipse key={i} cx={0} cy={-300 - 18 - i * 34} rx={i % 2 ? 6 : 13} ry={20} fill="none" stroke={INK} strokeWidth={i % 2 ? 10 : 12} />)}
      {Array.from({ length: links }, (_, i) => <ellipse key={"c" + i} cx={0} cy={-300 - 18 - i * 34} rx={i % 2 ? 6 : 13} ry={20} fill="none" stroke={MARKET.chain} strokeWidth={i % 2 ? 4 : 5} />)}
      {stroke2("M 0 -250 L 0 -10", 26, MARKET.anchor)}
      {stroke2("M -120 -112 Q -110 -10 0 -6 Q 110 -10 120 -112", 22, MARKET.anchor)}
      {[-1, 1].map((d) => <path key={d} d={`M ${d * 120} -150 L ${d * 150} -96 L ${d * 98} -104 Z`} fill={MARKET.anchor} stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
      <rect x={-80} y={-240} width={160} height={24} rx={12} fill={MARKET.anchor2} stroke={INK} strokeWidth={6} />
      <circle cx={0} cy={-276} r={26} fill="none" stroke={INK} strokeWidth={24} />
      <circle cx={0} cy={-276} r={26} fill="none" stroke={MARKET.anchor} strokeWidth={12} />
      <path d="M -6 -230 L -6 -30" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};

export type PriceLineProps = { x: number; y: number; w: number; anchorAt: number; rangeBend: number; low?: string | number; high?: string | number;
  currency?: string; rangeW?: number; ticks?: number; color?: string };
/** centre (0..1) of the haggling range for a PriceLine (drifts from 0.5 toward anchorAt as rangeBend -> 1) */
export const priceRangeCenter = (p: Pick<PriceLineProps, "w" | "anchorAt" | "rangeBend" | "rangeW">) => {
  const half = (p.rangeW ?? 0.34) / 2, target = Math.max(half, Math.min(1 - half, p.anchorAt));
  return 0.5 + (target - 0.5) * clamp01(p.rangeBend) * 0.85;
};
/** world x of position u (0..1) on a PriceLine */
export const priceLineX = (p: { x: number; w: number }, u: number) => p.x + p.w * u;

/** Horizontal price scale (x = left end, y = line, w = width) with ticks, low/high end labels and a gold anchor
 *  marker at anchorAt. Above it a haggling-range bracket (width rangeW of the line, default 0.34): at rangeBend 0
 *  it is centred; as rangeBend -> 1 it drifts toward the anchor and its top bows over toward it. Drop the Anchor
 *  at (priceLineX(p, anchorAt), y). */
export const PriceLine: React.FC<PriceLineProps> = (p) => {
  const { x, y, w, anchorAt, rangeBend, low, high, currency = "$", rangeW = 0.34, ticks = 10, color = LAB.green } = p;
  const c = priceRangeCenter(p), L = x + w * (c - rangeW / 2), R = x + w * (c + rangeW / 2), ax = x + w * anchorAt;
  const dir = ax >= (L + R) / 2 ? 1 : -1, b = clamp01(rangeBend), top = y - 90;
  const cx = (L + R) / 2 + dir * b * (R - L) * 0.45, cy = top - 70 * b;
  return (
    <g>
      {/* range band + bracket */}
      <path d={`M ${r2(L)} ${y - 12} L ${r2(L)} ${top} Q ${r2(cx)} ${r2(cy)} ${r2(R)} ${top} L ${r2(R)} ${y - 12} Z`} fill={color} opacity={0.22} />
      <path d={`M ${r2(L)} ${y - 12} L ${r2(L)} ${top} Q ${r2(cx)} ${r2(cy)} ${r2(R)} ${top} L ${r2(R)} ${y - 12}`} stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${r2(L)} ${y - 12} L ${r2(L)} ${top} Q ${r2(cx)} ${r2(cy)} ${r2(R)} ${top} L ${r2(R)} ${y - 12}`} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* the scale */}
      <path d={`M ${x} ${y} L ${x + w} ${y}`} stroke={INK} strokeWidth={20} strokeLinecap="round" />
      <path d={`M ${x} ${y} L ${x + w} ${y}`} stroke={LAB.text} strokeWidth={10} strokeLinecap="round" />
      {Array.from({ length: ticks + 1 }, (_, i) => { const tx = x + (w * i) / ticks, big = i === 0 || i === ticks || i === ticks / 2;
        return <path key={i} d={`M ${r2(tx)} ${y + 10} L ${r2(tx)} ${y + (big ? 42 : 28)}`} stroke={LAB.muted} strokeWidth={big ? 7 : 5} strokeLinecap="round" />; })}
      <path d={`M ${r2(ax)} ${y + 14} L ${r2(ax - 18)} ${y + 46} L ${r2(ax + 18)} ${y + 46} Z`} fill={LAB.gold} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {low !== undefined && <text x={x} y={y + 100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={LAB.muted}>{fmtPrice(low, currency)}</text>}
      {high !== undefined && <text x={x + w} y={y + 100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={LAB.muted}>{fmtPrice(high, currency)}</text>}
    </g>
  );
};

const WHEEL_COLS = [LAB.red, LAB.gold, "#2d6fd8", LAB.green, LAB.orange, "#e85a8a"];
/** Wheel of fortune with a fixed gold pointer at the top. labels = one per segment (e.g. numbers as strings);
 *  angle = wheel rotation in degrees (clockwise). Segment i is under the pointer at angle = wheelAngleFor(n, i, turns).
 *  x, y = hub; stand draws a post + foot below (to y + r + 150). */
export const Wheel: React.FC<{ x: number; y: number; r: number; angle: number; labels: string[]; stand?: boolean; highlight?: number }> =
  ({ x, y, r, angle, labels, stand = true, highlight }) => {
    const n = Math.max(1, labels.length), seg = 360 / n;
    const pt = (a: number, rr: number) => `${r2(Math.sin(rad(a)) * rr)} ${r2(-Math.cos(rad(a)) * rr)}`;
    const fs = Math.min(r * 0.17, (2 * Math.PI * r * 0.72) / n * 0.75);
    return (
      <g transform={`translate(${x} ${y})`}>
        {stand && <g>
          <path d={`M -28 0 L -40 ${r + 150} L 40 ${r + 150} L 28 0 Z`} fill={MARKET.anchor2} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <rect x={-r * 0.6} y={r + 136} width={r * 1.2} height={30} rx={12} fill={MARKET.anchor} stroke={INK} strokeWidth={8} />
        </g>}
        <circle cx={0} cy={0} r={r + 26} fill={MARKET.anchor2} stroke={INK} strokeWidth={10} />
        <g transform={`rotate(${r2(angle)})`}>
          {labels.map((l, i) => {
            const a0 = i * seg - seg / 2, a1 = a0 + seg;
            const col = WHEEL_COLS[i % WHEEL_COLS.length], hi = highlight === i;
            return <g key={i}>
              <path d={`M 0 0 L ${pt(a0, r)} A ${r} ${r} 0 0 1 ${pt(a1, r)} Z`} fill={hi ? "#fff4c2" : col} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
              <g transform={`rotate(${r2(i * seg)})`}>
                <text x={0} y={r2(-r * 0.72 + fs * 0.36)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fs)} fill={hi ? INK : "#ffffff"} stroke={INK} strokeWidth={hi ? 0 : r2(fs * 0.06)}>{l}</text>
              </g>
            </g>;
          })}
          {labels.map((_, i) => { const [px, py] = pt(i * seg - seg / 2, r + 12).split(" ").map(Number); return <circle key={"p" + i} cx={px} cy={py} r={8} fill={MARKET.peg} stroke={INK} strokeWidth={4} />; })}
        </g>
        <circle cx={0} cy={0} r={r * 0.16} fill={MARKET.anchor} stroke={INK} strokeWidth={8} />
        <circle cx={0} cy={0} r={r * 0.06} fill={LAB.gold} />
        <path d={`M -30 ${-r - 52} L 30 ${-r - 52} L 0 ${-r + 26} Z`} fill={LAB.gold} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      </g>
    );
  };
/** wheel angle (deg) that stops segment i under the top pointer after `turns` full clockwise spins */
export const wheelAngleFor = (n: number, i: number, turns = 3) => turns * 360 - (i * 360) / n;

/** Vertical bar that grows up from the baseline: x = centre, y = baseline, w = width, h = full height, value 0..1.
 *  label under the baseline, valueText above the bar top (both optional, via props). */
export const GuessBar: React.FC<{ x: number; y: number; w: number; h: number; value: number; colour: string; label?: string; valueText?: string }> =
  ({ x, y, w, h, value, colour, label, valueText }) => {
    const bh = h * clamp01(value);
    return (
      <g>
        <rect x={x - w / 2} y={y - h} width={w} height={h} rx={12} fill="#ffffff" opacity={0.06} />
        {bh > 1 && <rect x={x - w / 2} y={r2(y - bh)} width={w} height={r2(bh)} rx={Math.min(12, bh / 2)} fill={colour} stroke={INK} strokeWidth={7} />}
        {bh > 30 && <rect x={x - w / 2 + 14} y={r2(y - bh + 14)} width={12} height={r2(Math.max(0, bh - 28))} rx={6} fill="#ffffff" opacity={0.3} />}
        <path d={`M ${x - w / 2 - 30} ${y} L ${x + w / 2 + 30} ${y}`} stroke={LAB.muted} strokeWidth={6} strokeLinecap="round" />
        {label && <text x={x} y={y + 64} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(label, w + 80, 46))} fill={LAB.text}>{label}</text>}
        {valueText && bh > 0 && <text x={x} y={r2(y - bh - 22)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r2(fit(valueText, w + 60, 64))} fill={colour}>{valueText}</text>}
      </g>
    );
  };

/** Horizontal slider: x = left end, y, w; a big dot at value 0..1 (the track fills up to it). ends = optional end
 *  labels; markAt = optional small gold anchor tick on the track (0..1). */
export const PriceSlider: React.FC<{ x: number; y: number; w: number; value: number; ends?: [string, string]; markAt?: number; color?: string }> =
  ({ x, y, w, value, ends, markAt, color = LAB.gold }) => {
    const dx = x + w * clamp01(value);
    return (
      <g>
        <rect x={x - 14} y={y - 14} width={w + 28} height={28} rx={14} fill="#2a3566" stroke={INK} strokeWidth={6} />
        <rect x={x - 8} y={y - 8} width={r2(Math.max(0, dx - x + 8))} height={16} rx={8} fill={color} />
        {markAt !== undefined && <path d={`M ${r2(x + w * markAt)} ${y - 24} L ${r2(x + w * markAt)} ${y + 24}`} stroke={LAB.gold} strokeWidth={8} strokeLinecap="round" />}
        <circle cx={r2(dx)} cy={y} r={38} fill={MARKET.card} stroke={INK} strokeWidth={8} />
        <circle cx={r2(dx)} cy={y} r={18} fill={color} stroke={INK} strokeWidth={4} />
        {ends && <text x={x} y={y + 90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={LAB.muted}>{ends[0]}</text>}
        {ends && <text x={x + w} y={y + 90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={LAB.muted}>{ends[1]}</text>}
      </g>
    );
  };

/** Handshake close-up: A's arm comes from the left, B's from the right (sleeves at the frame edges, ~1100 px wide at
 *  scale 1, centred on x, y). grip 0..1: hands approach (open, thumbs up) and clasp at >= 0.9; shake = vertical
 *  offset of the clasp in px (animate with a sine). sleeveA/B = shirt colours (e.g. CAST.kai.jersey). */
export const Handshake: React.FC<{ x: number; y: number; scale?: number; skinA: string; skinB: string; sleeveA?: string; sleeveB?: string; grip?: number; shake?: number }> =
  ({ x, y, scale = 1, skinA, skinB, sleeveA = MARKET.stripeBlue, sleeveB = MARKET.stripeRed, grip = 1, shake = 0 }) => {
    const g = clamp01(grip), clasped = g >= 0.9, gap = clasped ? 0 : (1 - g / 0.9) * 300;
    const hy = shake;
    const arm = (d: 1 | -1, skin: string, sleeve: string, hx: number) => {
      const sx = d * 600, sy = 90;
      const ex = hx + d * 70, ey = hy + 4;
      return <g>
        <path d={`M ${sx} ${sy} Q ${r2((sx + ex) / 2)} ${r2((sy + ey) / 2 + 16)} ${r2(ex)} ${r2(ey)}`} stroke={INK} strokeWidth={122} fill="none" strokeLinecap="round" />
        <path d={`M ${sx} ${sy} Q ${r2((sx + ex) / 2)} ${r2((sy + ey) / 2 + 16)} ${r2(ex)} ${r2(ey)}`} stroke={skin} strokeWidth={106} fill="none" strokeLinecap="round" />
        {/* cuff */}
        <path d={`M ${d * 640} ${sy - 100} L ${d * 360} ${sy - 66} L ${d * 340} ${sy + 76} L ${d * 640} ${sy + 120} Z`} fill={sleeve} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d={`M ${d * 372} ${sy - 62} L ${d * 352} ${sy + 74}`} stroke={mix(sleeve, SHADOW, 0.3)} strokeWidth={12} />
      </g>;
    };
    /** open hand, blade toward the other person, thumb up (d = side it comes from: -1 left) */
    const openHand = (d: 1 | -1, skin: string, hx: number) => (
      <g transform={`translate(${r2(hx)} ${r2(hy)}) scale(${-d} 1)`}>
        <path d="M -70 -40 Q -20 -52 40 -44 Q 78 -40 80 -20 Q 80 0 40 4 L 52 8 Q 74 14 72 30 Q 68 46 30 44 L -70 46 Z" fill={skin} /><path d="M -70 -40 Q -20 -52 40 -44 Q 78 -40 80 -20 Q 80 0 40 4 L 52 8 Q 74 14 72 30 Q 68 46 30 44 L -70 46" fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d="M -30 -42 Q -10 -96 16 -90 Q 30 -84 18 -60 L 6 -40" fill={skin} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d="M 20 -20 L 60 -22 M 24 22 L 56 26" stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.45} />
      </g>
    );
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        {arm(1, skinB, sleeveB, gap + (clasped ? 60 : 80))}
        {arm(-1, skinA, sleeveA, -gap - (clasped ? 60 : 80))}
        {!clasped && openHand(1, skinB, gap + 80)}
        {!clasped && openHand(-1, skinA, -gap - 80)}
        {clasped && <g transform={`translate(0 ${r2(hy)})`}>
          {/* B's hand (behind), from the right: only its top edge and the strip under A's hand show */}
          <path d="M 160 -50 C 90 -64 20 -62 -30 -44 C -64 -30 -66 46 -30 62 C 20 78 100 76 160 66 Z" fill={skinB} /><path d="M 160 -50 C 90 -64 20 -62 -30 -44 C -64 -30 -66 46 -30 62 C 20 78 100 76 160 66" fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          {/* A's hand, back toward us, from the left; its fingers wrap round B's hand out of view */}
          <path d="M -160 -52 C -96 -68 -12 -68 40 -56 C 82 -46 96 -12 88 18 C 80 46 52 58 10 60 C -50 64 -110 62 -160 60 Z" fill={skinA} /><path d="M -160 -52 C -96 -68 -12 -68 40 -56 C 82 -46 96 -12 88 18 C 80 46 52 58 10 60 C -50 64 -110 62 -160 60" fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <path d="M 44 -44 Q 66 -8 52 38 M 74 -30 Q 88 -22 86 -6 M 80 12 Q 88 22 80 34" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.45} />
          <path d="M -120 -30 Q -60 -40 0 -34" stroke={mix(skinA, "#ffffff", 0.35)} strokeWidth={8} fill="none" strokeLinecap="round" />
          {/* B's fingers curling up over the bottom edge of A's hand */}
          {[0, 1, 2, 3].map((i) => { const cx = -98 + i * 27, tip = 26 + Math.abs(i - 1.5) * 6;
            return <path key={i} d={`M ${cx - 13} 72 Q ${cx - 15} ${tip + 4} ${cx} ${tip} Q ${cx + 15} ${tip + 4} ${cx + 13} 72 Z`} fill={skinB} stroke={INK} strokeWidth={6} strokeLinejoin="round" />; })}
          {/* A's thumb lying over the top of B's hand */}
          <path d="M -44 -56 C 0 -98 82 -94 118 -70 C 132 -60 124 -44 106 -46 C 70 -52 20 -50 -14 -40 Z" fill={skinA} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <path d="M 100 -70 Q 116 -66 114 -54" stroke={INK} strokeWidth={4} fill="none" opacity={0.5} strokeLinecap="round" />
        </g>}
      </g>
    );
  };
