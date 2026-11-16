// Library (2.5D): a cosy board-game night in the evening (episode "silent"): deep aubergine striped wallpaper, dark
// wainscot, warm fairy-light garland, night window with mustard curtains, bookshelf full of board-game boxes (shapes
// only), tall plant, warm wood floor with a round rug. A wooden game table seen from the front at seated height with a
// generic trading board on top (coloured squares round the edge, no text), seating for 4 (two behind the table facing
// the camera, two in profile at the ends) with clip-based occlusion, hands-on-table overlay, cards, card stacks, dice,
// snacks, glass, pendant lamp. Lab props: clock bubble, silence bar, lightbulb, growing pie, awkward meter, speech
// bubble, negotiator icons, sweat drop. No text anywhere unless passed as a prop.
import React from "react";
import { INK, Expr, Look, Person, Pose } from "../characters25/person";
import { CachedSvg } from "../../src/engine25/cached";
import { LAB } from "../style/channel";
import { Chair, SEAT_TOP, SeatFront, sitPose, sitX, sitY, Mug } from "./cafe";
import { PersonPart } from "./livingroom";

// seating + tableware re-used from the cafe (same rig maths, same chairs)
export { Chair, SEAT_TOP, SeatFront, sitPose, sitX, sitY, Mug, PersonPart };

export const GAME = { wall: "#4a2a4e", wall2: "#432548", motif: "#5e3862", wainscot: "#2f1a34", wainscot2: "#28152c", rail: "#e9c98f",
  floor: "#9a6a44", floor2: "#7e5434", rug: "#2f6f8a", rug2: "#e0a33a", rug3: "#25596f", night: "#1b2348", night2: "#2a335c",
  curtain: "#e0a33a", curtain2: "#b8821f", shelf: "#6b4636", shelf2: "#553628", leaf: "#4fa35e", leaf2: "#3a8048", pot: "#c4573f",
  wood: "#b07a48", wood2: "#8a5a32", top: "#c48a52", top2: "#a8703f", board: "#f3ead2", board2: "#d9cdb0", boardMid: "#cfe3c4",
  boardEdge: "#2f6f62", bulbA: "#ffd66b", bulbB: "#ff9a6b", bulbC: "#ffe9a8", bulbD: "#9fe0c8", glow: "#ffd98a", wire: "#1a0f1c",
  card: "#fbf6ea", card2: "#e6dcc6", cardBack: "#7a3b7e", cardBack2: "#a35aa6", popcorn: "#fff4d6", popcorn2: "#f2c94c",
  bowl: "#e8443a", bowl2: "#f6efe0", crisp: "#f2c230", crisp2: "#d99a1a", glass: "#dff2ff", juice: "#ff9a3a", dice: "#fbf6ea",
  lamp: "#2f6f62", lamp2: "#24564c", sweat: "#8fd3ff" } as const;

const SAND = "#f6efe0";
/** property colour groups used on the board and as default card bands */
export const PROPERTY_COLORS = ["#8a5a32", "#7fc8ff", "#e85a8a", "#ff9a3a", "#e8443a", "#f2c230", "#2fbf71", "#2d6fd8"] as const;

// ---------------------------------------------------------------- fairy lights
const garland = (x0: number, y0: number, x1: number, y1: number, sag: number, n: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + sag * 4 * t * (1 - t)]); }
  return pts;
};
const BULBS = [GAME.bulbA, GAME.bulbB, GAME.bulbC, GAME.bulbD];
/** A sagging string of warm bulbs from (x0,y0) to (x1,y1). `f` = frame for a gentle per-bulb twinkle (omit = steady).
 *  The wall already draws one garland (see GameRoomWall); this is for extra / foreground strings or a twinkle overlay. */
export const FairyLights: React.FC<{ x0: number; y0: number; x1: number; y1: number; sag?: number; n?: number; f?: number; glow?: number }> =
  ({ x0, y0, x1, y1, sag = 120, n = 14, f, glow = 1 }) => {
    const pts = garland(x0, y0, x1, y1, sag, 64);
    const bulbs = garland(x0, y0, x1, y1, sag, n).slice(1, -1);
    return (
      <g>
        <path d={"M " + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L ")} stroke={GAME.wire} strokeWidth={5} fill="none" />
        {bulbs.map(([bx, by], i) => {
          const tw = f === undefined ? 1 : 0.65 + 0.35 * Math.sin(f * 0.13 + i * 1.7);
          const c = BULBS[i % 4];
          return <g key={i}>
            {glow > 0 && <circle cx={bx} cy={by + 16} r={34} fill={c} opacity={0.16 * tw * glow} />}
            {glow > 0 && <circle cx={bx} cy={by + 16} r={20} fill={c} opacity={0.22 * tw * glow} />}
            <rect x={bx - 5} y={by - 2} width={10} height={9} fill={GAME.wire} />
            <ellipse cx={bx} cy={by + 17} rx={9} ry={13} fill={c} stroke={INK} strokeWidth={3.5} />
            <ellipse cx={bx - 3} cy={by + 12} rx={2.5} ry={4} fill="#ffffff" opacity={0.7} />
          </g>;
        })}
      </g>
    );
  };

// ---------------------------------------------------------------- the room
/** The garland the wall draws (pass to <FairyLights {...wallLights(y, h)} f={frame} /> to twinkle it on top). */
export const wallLights = (y = 0, h = 1500) => ({ x0: -300, y0: y + h - 1240, x1: 1380, y1: y + h - 1260, sag: 130, n: 22 });

/** Back wall (cached). Covers x -300..1380, y..y+h; anchored to the floor line y+h (keep h >= 1400). Night window
 *  x -170..330 (top ~1180 above the floor), bookshelf x 720..1180 (top 1080 above the floor), framed picture x 390..590
 *  (900..660 above the floor), tall plants at x ~-60 and ~1260, wainscot up to 360, fairy-light garland ~1250..1120 above the floor. Put GameFloor
 *  below it (from y+h). Default framing for the table: GameRoomWall y={-300} h={1560} -> floor at 1260. */
export const GameRoomWall: React.FC<{ y?: number; h?: number }> = ({ y = 0, h = 1500 }) => {
  const B = y + h, wy0 = B - 1180, wy1 = B - 560, wx0 = -170, wx1 = 330;
  const sx0 = 720, sx1 = 1180, sTop = B - 1080;
  const shelves = [sTop + 30, sTop + 290, sTop + 550, sTop + 810];
  // board-game boxes: stacks lying flat (w, h, colour) and standing books
  const stack = (x: number, yb: number, items: [number, number, string][], k: string) => {
    let yy = yb;
    return items.map(([w, hh, c], i) => { yy -= hh; return <g key={k + i}>
      <rect x={x - w / 2 + (i % 2 ? 6 : -4)} y={yy} width={w} height={hh} rx={4} fill={c} stroke={INK} strokeWidth={5} />
      <rect x={x - w / 2 + (i % 2 ? 6 : -4) + 10} y={yy + hh * 0.3} width={w * 0.34} height={hh * 0.4} rx={3} fill={SAND} opacity={0.8} />
      <rect x={x + w / 2 + (i % 2 ? 6 : -4) - 22} y={yy + 4} width={12} height={hh - 8} fill="#000" opacity={0.15} />
    </g>; });
  };
  const books = (x: number, yb: number, cols: string[], k: string) => cols.map((c, i) => {
    const bh = 150 + ((i * 37) % 50), bw = 26 + ((i * 13) % 12);
    const bx = x + cols.slice(0, i).reduce((a, _, j) => a + 26 + ((j * 13) % 12) + 4, 0);
    return <g key={k + i}><rect x={bx} y={yb - bh} width={bw} height={bh} rx={3} fill={c} stroke={INK} strokeWidth={4.5} />
      <rect x={bx + 5} y={yb - bh + 20} width={bw - 10} height={8} fill={SAND} opacity={0.6} /></g>;
  });
  return (
    <CachedSvg cacheKey={`game-wall-${y}-${h}`} x={-300} y={y} w={1680} h={h}>
      <rect x={-300} y={y} width={1680} height={h} fill={GAME.wall} />
      {Array.from({ length: 22 }, (_, i) => <rect key={i} x={-300 + i * 80} y={y} width={30} height={h} fill={GAME.wall2} />)}
      {Array.from({ length: 22 * Math.ceil(h / 140) }, (_, i) => {
        const cx = -300 + (i % 22) * 80 + 55, cy = y + 60 + Math.floor(i / 22) * 140 + (i % 2) * 70;
        return <circle key={"m" + i} cx={cx} cy={cy} r={6} fill={GAME.motif} />;
      })}
      {/* wainscot + rail */}
      <rect x={-300} y={B - 360} width={1680} height={360} fill={GAME.wainscot} />
      {Array.from({ length: 12 }, (_, i) => <rect key={"p" + i} x={-270 + i * 150} y={B - 320} width={110} height={260} rx={6} fill="none" stroke={GAME.wainscot2} strokeWidth={10} />)}
      <rect x={-300} y={B - 378} width={1680} height={24} fill={GAME.rail} stroke={INK} strokeWidth={6} />
      <rect x={-300} y={B - 40} width={1680} height={40} fill={GAME.wainscot2} stroke={INK} strokeWidth={6} />
      {/* night window */}
      <rect x={wx0 - 26} y={wy0 - 26} width={wx1 - wx0 + 52} height={wy1 - wy0 + 52} rx={10} fill={GAME.rail} stroke={INK} strokeWidth={10} />
      <rect x={wx0} y={wy0} width={wx1 - wx0} height={wy1 - wy0} fill={GAME.night} />
      {[[-120, 70], [-30, 150], [120, 60], [260, 120], [-80, 260], [210, 230], [40, 330]].map(([sx, sy], i) => <circle key={"s" + i} cx={sx} cy={wy0 + sy} r={4 + (i % 3)} fill="#fff6d6" />)}
      <circle cx={210} cy={wy0 + 130} r={54} fill="#fff1c2" /><circle cx={236} cy={wy0 + 112} r={50} fill={GAME.night} />
      {[[-170, 120, 260], [-60, 90, 200], [40, 110, 300], [160, 80, 230], [250, 90, 270]].map(([bx, bw, bh], i) =>
        <g key={"b" + i}><rect x={bx} y={wy1 - bh} width={bw} height={bh} fill={GAME.night2} />
          {[0, 1, 2].map((r) => <rect key={r} x={bx + 18 + (r % 2) * 40} y={wy1 - bh + 30 + r * 70} width={16} height={20} fill={GAME.glow} opacity={(i + r) % 3 ? 0.85 : 0.25} />)}</g>)}
      <path d={`M ${(wx0 + wx1) / 2} ${wy0} L ${(wx0 + wx1) / 2} ${wy1} M ${wx0} ${(wy0 + wy1) / 2 - 40} L ${wx1} ${(wy0 + wy1) / 2 - 40}`} stroke={INK} strokeWidth={9} />
      <rect x={wx0 - 50} y={wy1 + 20} width={wx1 - wx0 + 100} height={26} rx={6} fill={GAME.rail} stroke={INK} strokeWidth={6} />
      {/* curtains + rail */}
      <rect x={wx0 - 90} y={wy0 - 70} width={wx1 - wx0 + 180} height={20} rx={10} fill={GAME.shelf} stroke={INK} strokeWidth={6} />
      {[[wx0 - 100, wx0 + 10], [wx1 - 10, wx1 + 100]].map(([a, b], i) => <path key={"c" + i} d={`M ${a} ${wy0 - 56} L ${b} ${wy0 - 56} L ${b + (i ? 14 : -14)} ${wy1 + 90} Q ${(a + b) / 2} ${wy1 + 110} ${a + (i ? -10 : 10)} ${wy1 + 90} Z`}
        fill={GAME.curtain} stroke={INK} strokeWidth={7} strokeLinejoin="round" />)}
      {[wx0 - 70, wx0 - 35, wx1 + 30, wx1 + 65].map((cx) => <path key={"f" + cx} d={`M ${cx} ${wy0 - 40} L ${cx + 4} ${wy1 + 80}`} stroke={GAME.curtain2} strokeWidth={5} />)}
      {/* bookshelf with board games */}
      <rect x={sx0 - 20} y={sTop - 30} width={sx1 - sx0 + 40} height={B - 40 - sTop + 30} fill={GAME.shelf} stroke={INK} strokeWidth={9} />
      <rect x={sx0} y={sTop} width={sx1 - sx0} height={B - 60 - sTop} fill={GAME.shelf2} />
      {shelves.slice(1).map((sy) => <rect key={"sh" + sy} x={sx0 - 20} y={sy - 14} width={sx1 - sx0 + 40} height={22} fill={GAME.shelf} stroke={INK} strokeWidth={6} />)}
      {stack(830, shelves[1] - 14, [[200, 46, "#e8443a"], [180, 40, "#2d6fd8"], [210, 52, "#f2c230"], [170, 38, "#2fbf71"]], "s1")}
      {books(960, shelves[1] - 14, ["#3fb8c9", "#e85a8a", "#f6efe0", "#8cc63f", "#ff9a3a"], "b1")}
      {books(740, shelves[2] - 14, ["#7c4dd6", "#f2c230", "#e8443a"], "b2")}
      {stack(1030, shelves[2] - 14, [[220, 60, "#2fa89a"], [190, 44, "#ff7a2f"], [200, 50, "#f6efe0"], [160, 40, "#7c4dd6"]], "s2")}
      {stack(860, shelves[3] - 14, [[230, 56, "#2d6fd8"], [200, 48, "#e85a8a"], [220, 40, "#8cc63f"]], "s3")}
      {books(1010, shelves[3] - 14, ["#e8443a", "#3a7bd5", "#f2c230", "#5d6678"], "b3")}
      {stack(950, B - 74, [[300, 70, "#c4573f"], [260, 56, "#3fb8c9"], [280, 60, "#f2c230"]], "s4")}
      {/* small pot plant on top of the shelf */}
      <path d={`M 790 ${sTop - 30} L 800 ${sTop - 100} L 860 ${sTop - 100} L 870 ${sTop - 30} Z`} fill={GAME.pot} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {[[-40, -60], [-10, -90], [25, -70], [50, -40], [-55, -20]].map(([dx, dy], i) => <path key={"pl" + i} d={`M 830 ${sTop - 100} Q ${830 + dx * 0.4} ${sTop - 100 + dy * 0.8} ${830 + dx} ${sTop - 100 + dy}`} stroke={GAME.leaf} strokeWidth={14} fill="none" strokeLinecap="round" />)}
      {[[-40, -60], [-10, -90], [25, -70], [50, -40], [-55, -20]].map(([dx, dy], i) => <circle key={"pc" + i} cx={830 + dx} cy={sTop - 100 + dy} r={14} fill={GAME.leaf} stroke={INK} strokeWidth={4} />)}
      {/* framed picture (abstract) */}
      <g transform={`translate(-40 ${B - 900 - (B - 1120)})`}><rect x={430} y={B - 1120} width={200} height={240} rx={6} fill={GAME.shelf} stroke={INK} strokeWidth={8} />
      <rect x={450} y={B - 1100} width={160} height={200} fill="#f4e3c4" />
      <circle cx={505} cy={B - 1030} r={34} fill="#e8443a" /><rect x={530} y={B - 990} width={60} height={70} fill="#2d6fd8" /><path d={`M 455 ${B - 905} L 500 ${B - 970} L 545 ${B - 905} Z`} fill="#f2c230" /></g>
      {/* tall plants on the floor at both ends */}
      {[-60, 1270].map((px, k) => <g key={"tp" + k}>
        {[[-70, -380], [-20, -470], [40, -420], [80, -330], [-90, -260], [10, -300]].map(([dx, dy], i) =>
          <path key={i} d={`M ${px} ${B - 110} Q ${px + dx * 0.2} ${B - 110 + dy * 0.6} ${px + dx} ${B - 110 + dy}`} stroke={INK} strokeWidth={10} fill="none" />)}
        {[[-70, -380], [-20, -470], [40, -420], [80, -330], [-90, -260], [10, -300]].map(([dx, dy], i) =>
          <ellipse key={"l" + i} cx={px + dx} cy={B - 110 + dy} rx={46} ry={24} transform={`rotate(${dx > 0 ? -30 : 30} ${px + dx} ${B - 110 + dy})`} fill={i % 2 ? GAME.leaf : GAME.leaf2} stroke={INK} strokeWidth={6} />)}
        <path d={`M ${px - 70} ${B - 130} L ${px + 70} ${B - 130} L ${px + 54} ${B} L ${px - 54} ${B} Z`} fill={GAME.pot} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <rect x={px - 80} y={B - 150} width={160} height={28} rx={8} fill={GAME.pot} stroke={INK} strokeWidth={7} />
      </g>)}
      {/* the garland */}
      <FairyLights {...wallLights(y, h)} />
      {/* warm haze from the lights */}
      <rect x={-300} y={y} width={1680} height={h * 0.45} fill={GAME.glow} opacity={0.05} />
    </CachedSvg>
  );
};

/** Warm wood floor in fake perspective with a round rug centred at rugX (cached), from y down. */
export const GameFloor: React.FC<{ y: number; h?: number; rugX?: number }> = ({ y, h = 700, rugX = 540 }) => {
  const vx = 540, vy = y - 1300;
  const rows: number[] = [];
  for (let j = 0, yy = y; yy < y + h + 100; j++) { rows.push(yy); yy = y + 30 * (j + 1) + 5 * (j + 1) * (j + 1); }
  const col = (X: number, yy: number) => vx + (X - vx) * (yy - vy) / (y + h - vy);
  return (
    <CachedSvg cacheKey={`game-floor-${y}-${h}-${rugX}`} x={-400} y={y} w={1880} h={h}>
      <rect x={-400} y={y} width={1880} height={h} fill={GAME.floor} />
      {Array.from({ length: 26 }, (_, i) => { const X = -900 + i * 110; return <path key={i} d={`M ${col(X, y)} ${y} L ${col(X, y + h)} ${y + h}`} stroke={GAME.floor2} strokeWidth={4} />; })}
      {rows.map((ry, j) => <path key={"r" + j} d={`M -400 ${ry} L 1480 ${ry}`} stroke={GAME.floor2} strokeWidth={3} opacity={0.6} />)}
      <ellipse cx={rugX} cy={y + h * 0.42} rx={760} ry={h * 0.3} fill={GAME.rug} stroke={INK} strokeWidth={8} />
      <ellipse cx={rugX} cy={y + h * 0.42} rx={660} ry={h * 0.24} fill="none" stroke={GAME.rug2} strokeWidth={12} />
      <ellipse cx={rugX} cy={y + h * 0.42} rx={560} ry={h * 0.18} fill={GAME.rug3} />
      <rect x={-400} y={y} width={1880} height={16} fill="#05040c" opacity={0.15} />
    </CachedSvg>
  );
};

/** Pendant lamp hanging from y (top of the cord) down `len` px over the table; glow 0..1 adds a warm cone. */
export const PendantLamp: React.FC<{ x: number; y: number; len?: number; glow?: number; sway?: number }> = ({ x, y, len = 300, glow = 1, sway = 0 }) => (
  <g transform={`rotate(${sway} ${x} ${y})`}>
    {glow > 0 && <><path d={`M ${x - 70} ${y + len + 60} L ${x - 380} ${y + len + 820} L ${x + 380} ${y + len + 820} L ${x + 70} ${y + len + 60} Z`} fill={GAME.glow} opacity={0.07 * glow} />
      <circle cx={x} cy={y + len + 70} r={180} fill={GAME.glow} opacity={0.12 * glow} /></>}
    <path d={`M ${x} ${y} L ${x} ${y + len}`} stroke={INK} strokeWidth={6} />
    <path d={`M ${x - 26} ${y + len} L ${x + 26} ${y + len} L ${x + 100} ${y + len + 70} L ${x - 100} ${y + len + 70} Z`} fill={GAME.lamp} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d={`M ${x - 60} ${y + len + 40} L ${x + 60} ${y + len + 40}`} stroke={GAME.lamp2} strokeWidth={6} />
    <ellipse cx={x} cy={y + len + 72} rx={94} ry={12} fill={glow > 0 ? "#fff6d0" : "#d8c49a"} stroke={INK} strokeWidth={5} />
  </g>
);

// ---------------------------------------------------------------- the game table
/** height of the table's front top edge above its floor line, and the visible depth of the top (fraction of w) */
export const TABLE_H = 250;
const DEPTH = 0.28, INSET = 0.07;
export type TableGeom = { x: number; y: number; w: number; topFront: number; topBack: number; xf0: number; xf1: number; xb0: number; xb1: number };
/** Geometry of a GameTable: top front edge y (topFront), back edge y (topBack), corner x's. */
export const tableGeom = (x: number, y: number, w = 700): TableGeom => {
  const topFront = y - TABLE_H, topBack = topFront - w * DEPTH;
  return { x, y, w, topFront, topBack, xf0: x - w / 2, xf1: x + w / 2, xb0: x - w / 2 + w * INSET, xb1: x + w / 2 - w * INSET };
};
/** A point on the table top: u 0..1 left->right, v 0..1 back->front (perspective-correct depth). */
export const tablePoint = (g: TableGeom, u: number, v: number): [number, number] => {
  const wb = g.xb1 - g.xb0, wf = g.xf1 - g.xf0;
  const s = (v * wb) / ((1 - v) * wf + v * wb);
  const yy = g.topBack + (g.topFront - g.topBack) * s;
  const xl = g.xb0 + (g.xf0 - g.xb0) * s, xr = g.xb1 + (g.xf1 - g.xb1) * s;
  return [xl + (xr - xl) * u, yy];
};
const quad = (P: (u: number, v: number) => [number, number], u0: number, v0: number, u1: number, v1: number) =>
  [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)].map(([a, b], i) => `${i ? "L" : "M"} ${a.toFixed(1)} ${b.toFixed(1)}`).join(" ") + " Z";

/** The trading board (cached with the table): 9 squares per side + corners, colour bands toward the centre, no text. */
const Board: React.FC<{ g: TableGeom }> = ({ g }) => {
  const U0 = 0.14, U1 = 0.86, V0 = 0.06, V1 = 0.94;
  const B = (u: number, v: number) => tablePoint(g, U0 + (U1 - U0) * u, V0 + (V1 - V0) * v);
  const T = 12.4, c = 1.7 / T, sq = 1 / T;                        // corners 1.7 units, squares 1 unit
  const out: React.ReactElement[] = [];
  const iconCol = ["#5d6678", "#e8443a", "#2d6fd8", "#f2c230"];
  // edges: side 0 bottom (front, v=1), 1 left, 2 top (back), 3 right. a = position along the edge
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < 9; i++) {
      const a0 = c + i * sq, a1 = a0 + sq, prop = (i + side) % 5 !== 2 && i !== 4;
      const grp = PROPERTY_COLORS[side * 2 + (i < 4 ? 0 : 1)];
      let cell: [number, number, number, number], band: [number, number, number, number];
      const bw = c * 0.32;
      if (side === 0) { cell = [1 - a1, 1 - c, 1 - a0, 1]; band = [1 - a1, 1 - c, 1 - a0, 1 - c + bw]; }
      else if (side === 1) { cell = [0, 1 - a1, c, 1 - a0]; band = [c - bw, 1 - a1, c, 1 - a0]; }
      else if (side === 2) { cell = [a0, 0, a1, c]; band = [a0, c - bw, a1, c]; }
      else { cell = [1 - c, a0, 1, a1]; band = [1 - c, a0, 1 - c + bw, a1]; }
      out.push(<path key={`c${side}-${i}`} d={quad(B, ...cell)} fill={GAME.board} stroke={INK} strokeWidth={2.5} />);
      if (prop) out.push(<path key={`b${side}-${i}`} d={quad(B, ...band)} fill={grp} stroke={INK} strokeWidth={2.5} />);
      else {
        const [cx, cy] = B((cell[0] + cell[2]) / 2, (cell[1] + cell[3]) / 2);
        out.push(<circle key={`i${side}-${i}`} cx={cx} cy={cy} r={4.5} fill={iconCol[(i + side) % 4]} />);
      }
    }
  }
  const corners: [number, number, string][] = [[0, 0, "#e8443a"], [1 - c, 0, "#2d6fd8"], [0, 1 - c, "#2fbf71"], [1 - c, 1 - c, "#f2c230"]];
  return (
    <g>
      {/* board thickness at the front + soft shadow */}
      <path d={`M ${B(0, 1)[0] - 4} ${B(0, 1)[1] + 6} L ${B(1, 1)[0] + 4} ${B(1, 1)[1] + 6} L ${B(1, 0)[0] + 4} ${B(1, 0)[1] + 4} L ${B(0, 0)[0] - 4} ${B(0, 0)[1] + 4} Z`} fill="#05040c" opacity={0.18} />
      <path d={`M ${B(0, 1)[0]} ${B(0, 1)[1]} L ${B(1, 1)[0]} ${B(1, 1)[1]} L ${B(1, 1)[0]} ${B(1, 1)[1] + 9} L ${B(0, 1)[0]} ${B(0, 1)[1] + 9} Z`} fill={GAME.boardEdge} stroke={INK} strokeWidth={4} />
      <path d={quad(B, 0, 0, 1, 1)} fill={GAME.board2} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={quad(B, c, c, 1 - c, 1 - c)} fill={GAME.boardMid} stroke={INK} strokeWidth={3} />
      {out}
      {corners.map(([u, v, col], i) => <g key={"k" + i}><path d={quad(B, u, v, u + c, v + c)} fill={GAME.board} stroke={INK} strokeWidth={3} />
        <path d={quad(B, u + c * 0.3, v + c * 0.3, u + c * 0.7, v + c * 0.7)} fill={col} stroke={INK} strokeWidth={2.5} /></g>)}
      {/* centre decoration: diagonal band + two card spots */}
      <path d={`M ${B(c + 0.05, 1 - c - 0.05).join(" ")} L ${B(c + 0.13, 1 - c - 0.05).join(" ")} L ${B(1 - c - 0.05, c + 0.13).join(" ")} L ${B(1 - c - 0.05, c + 0.05).join(" ")} Z`} fill={GAME.boardEdge} opacity={0.5} />
      <path d={quad(B, c + 0.06, c + 0.06, c + 0.22, c + 0.18)} fill="#ff9a3a" stroke={INK} strokeWidth={3} />
      <path d={quad(B, 1 - c - 0.22, 1 - c - 0.18, 1 - c - 0.06, 1 - c - 0.06)} fill="#3fb8c9" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** Wooden game table seen from the front at seated height, top visible at a slight angle, with the trading board on
 *  it (cached). x = centre, y = floor line under the front legs, w = front width (default 700). Front top edge at
 *  y - 250, back edge at y - 250 - 0.28w (see tableGeom / tablePoint to place things on the top). board=false: bare. */
export const GameTable: React.FC<{ x: number; y: number; w?: number; board?: boolean }> = ({ x, y, w = 700, board = true }) => {
  const g = tableGeom(x, y, w);
  const leg = (lx: number) => <rect x={lx - 20} y={g.topFront + 40} width={40} height={TABLE_H - 40} rx={8} fill={GAME.wood2} stroke={INK} strokeWidth={7} />;
  return (
    <CachedSvg cacheKey={`game-table-${x}-${y}-${w}-${board}`} x={x - w / 2 - 20} y={g.topBack - 20} w={w + 40} h={y - g.topBack + 40}>
      <ellipse cx={x} cy={y + 2} rx={w * 0.55} ry={18} fill="#05040c" opacity={0.25} />
      {leg(g.xf0 + 40)}{leg(g.xf1 - 40)}
      <path d={`M ${g.xb0} ${g.topBack} L ${g.xb1} ${g.topBack} L ${g.xf1} ${g.topFront} L ${g.xf0} ${g.topFront} Z`} fill={GAME.top} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {[0.25, 0.5, 0.75].map((u) => { const a = tablePoint(g, u, 0), b = tablePoint(g, u, 1); return <path key={u} d={`M ${a[0]} ${a[1] + 4} L ${b[0]} ${b[1] - 4}`} stroke={GAME.top2} strokeWidth={3} opacity={0.6} />; })}
      {board && <Board g={g} />}
      <rect x={g.xf0 - 8} y={g.topFront - 4} width={w + 16} height={30} rx={8} fill={GAME.wood} stroke={INK} strokeWidth={8} />
      <rect x={g.xf0 + 14} y={g.topFront + 24} width={w - 28} height={30} fill={GAME.wood2} stroke={INK} strokeWidth={6} />
      <path d={`M ${g.xf0 + 10} ${g.topFront + 8} L ${g.xf1 - 10} ${g.topFront + 8}`} stroke="#d9a06a" strokeWidth={4} strokeLinecap="round" />
    </CachedSvg>
  );
};

// ---------------------------------------------------------------- seating for 4
export type SeatName = "backL" | "backR" | "left" | "right";
export type Seat = { x: number; floor: number; scale: number; view: "front" | "side"; facing: 1 | -1 };
export type TableLayout = { table: { x: number; y: number; w: number }; geom: TableGeom; cut: number; seats: Record<SeatName, Seat> };

/** Positions for 4 players round a GameTable (x = cx, y = floorY, w). backL/backR sit behind it facing the camera
 *  (bodies hidden below the table's back edge `cut`), left/right sit at the ends in profile facing the middle (their
 *  legs go under the table). Default framing: tableLayout(540, 1400, 700) with GameRoomWall y -300 h 1560 + GameFloor
 *  y 1260: everything stays above the caption band (feet at ~1370). */
export const tableLayout = (cx = 540, floorY = 1400, w = 700, backScale = 1.22, sideScale = 1.3): TableLayout => {
  const geom = tableGeom(cx, floorY, w);
  const cut = geom.topBack + 2;
  const bf = geom.topBack + 185 * backScale;                 // back players' floor: the edge crosses mid-torso
  return {
    table: { x: cx, y: floorY, w }, geom, cut,
    seats: {
      backL: { x: cx - w * 0.21, floor: bf, scale: backScale, view: "front", facing: 1 },
      backR: { x: cx + w * 0.21, floor: bf, scale: backScale, view: "front", facing: -1 },
      left: { x: cx - w / 2 - 50, floor: floorY - 30, scale: sideScale, view: "side", facing: 1 },
      right: { x: cx + w / 2 + 50, floor: floorY - 30, scale: sideScale, view: "side", facing: -1 },
    },
  };
};

/** Ready-made seated poses. Front view (back seats): rest (arms down, add HandsOnTable), hold (cards in front of the
 *  chest), talk (big gesture, hands up and out), shrug, cross (arms folded, smug), point (right hand forward-up).
 *  Profile (side seats, arms + = toward the table): rest (forearm on the table), hold (cards up in front of the face),
 *  offer (arm stretched over the table, card out), talk (hand up), lean (lean in). */
export const SEAT_POSES = {
  front: {
    rest: sitPose("front", { armL: [10, 0], armR: [10, 0] }),
    hold: sitPose("front", { armL: [22, -118], armR: [22, -118] }),
    talk: sitPose("front", { armL: [105, 45], armR: [105, 45] }),
    shrug: sitPose("front", { armL: [55, 45], armR: [55, 45] }, { headTilt: 8 }),
    cross: sitPose("front", { armL: [14, -150], armR: [14, -150] }),
    point: sitPose("front", { armL: [10, 0], armR: [95, -40] }),
  },
  side: {
    rest: sitPose("side", { armL: [40, -50], armR: [55, -40] }),
    hold: sitPose("side", { armL: [55, -95], armR: [65, -95] }),
    offer: sitPose("side", { armL: [40, -50], armR: [88, -4] }),
    talk: sitPose("side", { armL: [40, -50], armR: [150, -40] }),
    lean: sitPose("side", { armL: [60, -60], armR: [70, -60] }, { lean: 8 }),
  },
} as const;

/** Person props (x, y, scale, facing, pose) for a seat: spread into <Person>, PersonPart wear, handPos. */
export const playerAt = (L: TableLayout, seat: SeatName, pose?: Pose) => {
  const s = L.seats[seat];
  const p = pose ?? (s.view === "front" ? SEAT_POSES.front.rest : SEAT_POSES.side.rest);
  const x = s.view === "front" ? s.x : sitX(s.x, s.scale, s.facing);
  return { x, y: sitY(s.floor, s.scale, p), scale: s.scale, facing: s.facing, pose: p };
};

/** Where a Person's hand ends up (design px). Same props as the Person (+ t if you pass t to the Person). */
export const handPos = (p: { x: number; y: number; scale?: number; facing?: 1 | -1; pose: Pose; rot?: number; t?: number }, side: "L" | "R") => {
  const s = p.scale ?? 1, facing = p.facing ?? 1, pose = p.pose, rad = (d: number) => (d * Math.PI) / 180;
  const on = p.t !== undefined && !pose.profile;
  const sway = on ? Math.sin(p.t! * 0.07) * 4 : 0, br = on ? Math.sin(p.t! * 0.11) : 0;
  const crouch = ((pose.crouch ?? 0) + br * 0.012) * 140, hipY = -150 + crouch, shY = -285 + crouch * 0.9;
  const [a0, b] = side === "L" ? pose.armL : pose.armR, a = a0 + (side === "L" ? sway : -sway);
  const d = pose.profile ? facing : side === "L" ? -1 : 1;
  const hx = (side === "L" ? -42 : 42) + Math.sin(rad(a)) * d * 70 + Math.sin(rad(a + b)) * d * 64;
  const hy = shY + 14 + Math.cos(rad(a)) * 70 + Math.cos(rad(a + b)) * 64;
  const r = rad((pose.lean ?? 0) * facing + (p.rot ?? 0)), dx = hx, dy = hy - hipY;
  return { x: p.x + (dx * Math.cos(r) - dy * Math.sin(r)) * s, y: p.y + (hipY + dx * Math.sin(r) + dy * Math.cos(r)) * s };
};

/** A seated player with chair. Back seats: draw BEFORE GameTable (clipped at the table's back edge). Side seats:
 *  draw AFTER GameTable (the table's front face/legs region is cut out, so knees go under the table and arms show
 *  over the top). Order: wall, floor, backL, backR, GameTable, table props, HandsOnTable/Cards of the back players,
 *  left, right, their Cards, overlays. pose: see SEAT_POSES (front poses for back seats, side poses for side seats). */
export const PlayerAtTable: React.FC<{ layout: TableLayout; seat: SeatName; look: Look; pose?: Pose; expr?: Expr; t?: number; blink?: boolean;
  rot?: number; chair?: boolean; children?: React.ReactNode }> = ({ layout: L, seat, look, pose, expr = "neutral", t, blink, rot, chair = true, children }) => {
  const s = L.seats[seat], P = playerAt(L, seat, pose), g = L.geom;
  const id = `gn-clip-${seat}-${Math.round(s.x)}-${Math.round(L.cut)}`;
  const clip = s.view === "front"
    ? `M -2000 -3000 L 4000 -3000 L 4000 ${L.cut} L -2000 ${L.cut} Z`
    : `M -2000 -3000 L 4000 -3000 L 4000 5000 L -2000 5000 Z M ${g.xf0 - 8} ${g.topFront - 6} L ${g.xf1 + 8} ${g.topFront - 6} L ${g.xf1 + 8} ${g.y + 40} L ${g.xf0 - 8} ${g.y + 40} Z`;
  return (
    <g>
      <defs><clipPath id={id}><path d={clip} clipRule="evenodd" /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        {chair && <Chair x={s.x} y={s.floor} scale={s.scale} facing={s.view === "front" ? 0 : s.facing} />}
        <Person {...P} rot={rot} look={look} expr={expr} t={t} blink={blink} shadow={0} />
        {children}
      </g>
    </g>
  );
};

/** Forearms + hands resting on the table top for a BACK-seat player in SEAT_POSES.front.rest (draw after GameTable).
 *  spread = hand distance from the player's centre line (local px, default 40), reach = how far onto the table (px
 *  at scale 1, default 60). sleeve = forearm colour (default the skin; the rig's arms are bare). */
export const HandsOnTable: React.FC<{ layout: TableLayout; seat: "backL" | "backR"; look: Look; spread?: number; reach?: number; sleeve?: string; hold?: React.ReactNode }> =
  ({ layout: L, seat, look, spread = 40, reach = 60, sleeve }) => {
    const s = L.seats[seat], k = s.scale, limbW = 13.2, ink = 4.2;
    const arm = (d: number) => {
      const p = `M ${s.x + d * 58 * k} ${L.cut - 6} L ${s.x + d * spread * k} ${L.cut + reach * k}`;
      return <g key={d}>
        <path d={p} stroke={INK} strokeWidth={(limbW + ink * 2) * k} strokeLinecap="round" />
        <path d={p} stroke={sleeve ?? look.skin} strokeWidth={limbW * k} strokeLinecap="round" />
        <circle cx={s.x + d * spread * k} cy={L.cut + reach * k} r={limbW * 0.6 * k} fill={look.skin} stroke={INK} strokeWidth={ink * k} />
      </g>;
    };
    return <g>{arm(-1)}{arm(1)}</g>;
  };

// ---------------------------------------------------------------- cards, dice, snacks
const CW = 70, CH = 100;
const Card: React.FC<{ faceUp: boolean; color: string }> = ({ faceUp, color }) => faceUp ? (
  <g>
    <rect x={-CW / 2} y={-CH} width={CW} height={CH} rx={7} fill={GAME.card} stroke={INK} strokeWidth={4.5} />
    <rect x={-CW / 2 + 7} y={-CH + 7} width={CW - 14} height={24} rx={3} fill={color} stroke={INK} strokeWidth={3} />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-CW / 2 + 12} ${-CH + 44 + i * 13} L ${CW / 2 - 12 - (i % 2) * 14} ${-CH + 44 + i * 13}`} stroke={GAME.card2} strokeWidth={4} strokeLinecap="round" />)}
  </g>
) : (
  <g>
    <rect x={-CW / 2} y={-CH} width={CW} height={CH} rx={7} fill={GAME.cardBack} stroke={INK} strokeWidth={4.5} />
    <rect x={-CW / 2 + 7} y={-CH + 7} width={CW - 14} height={CH - 14} rx={4} fill="none" stroke={GAME.cardBack2} strokeWidth={3} />
    <path d={`M 0 ${-CH + 22} L 18 ${-CH / 2} L 0 -22 L -18 ${-CH / 2} Z`} fill={GAME.cardBack2} stroke={INK} strokeWidth={3} />
  </g>
);

/** A hand of property cards (colour band + blank lines, no text), 70x100 each at scale 1. x,y = the grip point (bottom
 *  centre of the fan, where the hand holds it). fan = total spread in degrees (0 = neat stack, default 50), rot tilts
 *  the whole hand, faceUp shows the fronts (default true; false = plum backs, i.e. the holder's view from behind).
 *  colors cycle over the cards (default PROPERTY_COLORS). */
export const Cards: React.FC<{ x: number; y: number; n: number; fan?: number; scale?: number; rot?: number; faceUp?: boolean; colors?: readonly string[] }> =
  ({ x, y, n, fan = 50, scale = 1, rot = 0, faceUp = true, colors = PROPERTY_COLORS }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      {Array.from({ length: n }, (_, i) => {
        const a = n > 1 ? -fan / 2 + (fan * i) / (n - 1) : 0;
        return <g key={i} transform={`rotate(${a} 0 0) translate(0 ${-6})`}><Card faceUp={faceUp} color={colors[i % colors.length]} /></g>;
      })}
    </g>
  );

/** A pile of cards lying on the table (seen at the table's slight angle), x,y = bottom centre on the surface.
 *  count = how many (thickness 2.5 px each); top card faceUp shows its colour band (color). */
export const CardStack: React.FC<{ x: number; y: number; count: number; scale?: number; faceUp?: boolean; color?: string }> = ({ x, y, count, scale = 1, faceUp = false, color = PROPERTY_COLORS[4] }) => {
  const th = Math.max(1, count) * 2.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={58} ry={9} fill="#05040c" opacity={0.2} />
      <path d={`M -50 0 L 50 0 L 50 ${-th} L -50 ${-th} Z`} fill={GAME.card2} stroke={INK} strokeWidth={4} />
      {Array.from({ length: Math.min(6, Math.floor(th / 5)) }, (_, i) => <path key={i} d={`M -48 ${-4 - i * 5} L 48 ${-4 - i * 5}`} stroke={GAME.card} strokeWidth={1.5} />)}
      <path d={`M -50 ${-th} L 50 ${-th} L 40 ${-th - 34} L -40 ${-th - 34} Z`} fill={faceUp ? GAME.card : GAME.cardBack} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      {faceUp ? <path d={`M -42 ${-th - 26} L 42 ${-th - 26} L 39 ${-th - 32} L -39 ${-th - 32} Z`} fill={color} />
        : <path d={`M 0 ${-th - 28} L 16 ${-th - 17} L 0 ${-th - 6} L -16 ${-th - 17} Z`} fill={GAME.cardBack2} stroke={INK} strokeWidth={2.5} />}
    </g>
  );
};

const PIPS: Record<number, [number, number][]> = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
/** A die (front face shows `value` 1..6, top + side faces visible), ~56 px at scale 1, x,y = bottom centre. rot degrees. */
export const Dice: React.FC<{ x: number; y: number; scale?: number; value: number; rot?: number; color?: string }> = ({ x, y, scale = 1, value, rot = 0, color = GAME.dice }) => {
  const v = Math.min(6, Math.max(1, Math.round(value))), top = (v % 6) + 1, S = 48;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <ellipse cx={4} cy={2} rx={34} ry={7} fill="#05040c" opacity={0.2} />
      <path d={`M ${-S / 2} ${-S} L ${-S / 2 + 12} ${-S - 12} L ${S / 2 + 12} ${-S - 12} L ${S / 2} ${-S} Z`} fill={color} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <path d={`M ${S / 2} ${-S} L ${S / 2 + 12} ${-S - 12} L ${S / 2 + 12} -12 L ${S / 2} 0 Z`} fill="#d9cdb0" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <rect x={-S / 2} y={-S} width={S} height={S} rx={7} fill={color} stroke={INK} strokeWidth={5} />
      {PIPS[v].map(([px, py], i) => <circle key={i} cx={px * 13} cy={-S / 2 + py * 13} r={5} fill={v === 1 ? "#e8443a" : INK} />)}
      {PIPS[top].slice(0, 3).map(([px], i) => <ellipse key={"t" + i} cx={6 + px * 12 + (i - 1) * 4} cy={-S - 6} rx={3.5} ry={2} fill={INK} />)}
    </g>
  );
};

/** Bowl of snacks seen side-on, ~170 wide at scale 1, x,y = base centre. kind popcorn (default) or crisps. */
export const Snacks: React.FC<{ x: number; y: number; scale?: number; kind?: "popcorn" | "crisps" }> = ({ x, y, scale = 1, kind = "popcorn" }) => {
  let s = 11;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const bits = Array.from({ length: 16 }, () => [(r() - 0.5) * 140 * (0.6 + r() * 0.4), -50 - r() * 46, 0.7 + r() * 0.5] as const)
    .sort((a, b) => a[1] - b[1]);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={80} ry={10} fill="#05040c" opacity={0.2} />
      {bits.map(([bx, by, k], i) => kind === "popcorn"
        ? <g key={i} transform={`translate(${bx} ${by}) scale(${k})`}>
          {[[-7, 0], [7, -2], [0, -9], [0, 6]].map(([cx, cy], j) => <circle key={j} cx={cx} cy={cy} r={10} fill={GAME.popcorn} stroke={INK} strokeWidth={3.5} />)}
          {[[-7, 0], [7, -2], [0, -9], [0, 6]].map(([cx, cy], j) => <circle key={"f" + j} cx={cx} cy={cy} r={7} fill={j === 3 ? GAME.popcorn2 : GAME.popcorn} />)}
        </g>
        : <ellipse key={i} cx={bx} cy={by} rx={18 * k} ry={11 * k} transform={`rotate(${(i * 47) % 70 - 35} ${bx} ${by})`} fill={i % 3 ? GAME.crisp : GAME.crisp2} stroke={INK} strokeWidth={3.5} />)}
      <path d="M -88 -52 Q -84 0 -36 0 L 36 0 Q 84 0 88 -52 Z" fill={GAME.bowl} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -82 -34 Q 0 -24 82 -34" stroke={GAME.bowl2} strokeWidth={8} fill="none" />
      <ellipse cx={0} cy={-52} rx={88} ry={9} fill="none" stroke={INK} strokeWidth={6} />
    </g>
  );
};

/** Tumbler with juice and a straw, ~56 wide x 96 tall at scale 1, x,y = base centre. fill 0..1 level. */
export const Glass: React.FC<{ x: number; y: number; scale?: number; fill?: number; color?: string }> = ({ x, y, scale = 1, fill = 0.7, color = GAME.juice }) => {
  const top = -96, lvl = -6 + (top + 12) * fill;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={30} ry={6} fill="#05040c" opacity={0.2} />
      <path d="M 8 -130 L 18 -60" stroke={INK} strokeWidth={11} strokeLinecap="round" />
      <path d="M 8 -130 L 18 -60" stroke="#e85a8a" strokeWidth={5} strokeLinecap="round" />
      <path d={`M -24 ${lvl} L 24 ${lvl} L 22 -6 Q 21 0 14 0 L -14 0 Q -21 0 -22 -6 Z`} fill={color} />
      <path d={`M -28 ${top} L 28 ${top} L 22 -6 Q 21 0 14 0 L -14 0 Q -21 0 -22 -6 Z`} fill={GAME.glass} fillOpacity={0.35} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -16 -84 L -14 -20" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.6} />
    </g>
  );
};

/** Little drop of nervous sweat (teardrop pointing up), ~30x44 at scale 1, centred at x,y. */
export const SweatDrop: React.FC<{ x: number; y: number; scale?: number; rot?: number }> = ({ x, y, scale = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <path d="M 0 -24 C 8 -10 16 0 16 8 C 16 18 8 22 0 22 C -8 22 -16 18 -16 8 C -16 0 -8 -10 0 -24 Z" fill={GAME.sweat} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <ellipse cx={-5} cy={8} rx={3.5} ry={6} fill="#ffffff" opacity={0.8} />
  </g>
);

// ---------------------------------------------------------------- explanation props (LAB look)
/** The pause clock: a round speech bubble (tail to the lower left, or tail "right") with a clock face inside; a red
 *  wedge sweeps from 12 o'clock as progress goes 0..1 and the hand follows it. r = bubble radius. */
export const ClockBubble: React.FC<{ x: number; y: number; r: number; progress: number; tail?: "left" | "right" | "none"; color?: string }> =
  ({ x, y, r, progress, tail = "left", color = LAB.red }) => {
    const p = Math.max(0, Math.min(1, progress)), cr = r * 0.72, a = p * Math.PI * 2 - Math.PI / 2;
    const ex = Math.cos(a) * cr, ey = Math.sin(a) * cr;
    const td = tail === "right" ? 1 : -1;
    return (
      <g transform={`translate(${x} ${y})`}>
        {tail !== "none" && <path d={`M ${td * r * 0.25} ${r * 0.9} L ${td * r * 0.95} ${r * 1.35} L ${td * r * 0.65} ${r * 0.6} Z`} fill={SAND} stroke={INK} strokeWidth={r * 0.07} strokeLinejoin="round" />}
        <circle r={r} fill={SAND} stroke={INK} strokeWidth={r * 0.07} />
        {tail !== "none" && <path d={`M ${td * r * 0.3} ${r * 0.86} L ${td * r * 0.62} ${r * 0.64}`} stroke={SAND} strokeWidth={r * 0.09} />}
        <circle r={cr} fill="#ffffff" stroke={INK} strokeWidth={r * 0.05} />
        {p > 0 && p < 1 && <path d={`M 0 0 L 0 ${-cr} A ${cr} ${cr} 0 ${p > 0.5 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)} Z`} fill={color} opacity={0.35} />}
        {p >= 1 && <circle r={cr} fill={color} opacity={0.35} />}
        {Array.from({ length: 12 }, (_, i) => { const b = (i / 12) * Math.PI * 2; const r0 = cr * (i % 3 ? 0.84 : 0.76);
          return <path key={i} d={`M ${Math.cos(b) * r0} ${Math.sin(b) * r0} L ${Math.cos(b) * cr * 0.93} ${Math.sin(b) * cr * 0.93}`} stroke={INK} strokeWidth={r * (i % 3 ? 0.03 : 0.05)} strokeLinecap="round" />; })}
        <path d={`M 0 0 L ${Math.cos(a) * cr * 0.78} ${Math.sin(a) * cr * 0.78}`} stroke={INK} strokeWidth={r * 0.06} strokeLinecap="round" />
        <circle r={r * 0.07} fill={color} stroke={INK} strokeWidth={r * 0.03} />
        <rect x={-r * 0.12} y={-r * 1.16} width={r * 0.24} height={r * 0.14} rx={r * 0.04} fill={color} stroke={INK} strokeWidth={r * 0.04} />
      </g>
    );
  };

/** "3 seconds of silence" bar: a rounded track from x to x+w (centre line y, 60 tall), filling left->right with
 *  progress 0..1, split into `segments` (default 3) with tick marks. label (optional) is drawn above the bar. */
export const SilenceBar: React.FC<{ x: number; y: number; w: number; progress: number; label?: string; segments?: number; color?: string }> =
  ({ x, y, w, progress, label, segments = 3, color = LAB.gold }) => {
    const p = Math.max(0, Math.min(1, progress)), H = 60;
    return (
      <g>
        <rect x={x} y={y - H / 2} width={w} height={H} rx={H / 2} fill="#1a2448" stroke={INK} strokeWidth={8} />
        {p > 0 && <rect x={x + 8} y={y - H / 2 + 8} width={Math.max(H - 16, (w - 16) * p)} height={H - 16} rx={(H - 16) / 2} fill={color} />}
        {Array.from({ length: segments - 1 }, (_, i) => { const tx = x + (w * (i + 1)) / segments;
          return <path key={i} d={`M ${tx} ${y - H / 2 + 6} L ${tx} ${y + H / 2 - 6}`} stroke={INK} strokeWidth={6} opacity={0.6} />; })}
        {Array.from({ length: segments + 1 }, (_, i) => <circle key={"d" + i} cx={x + (w * i) / segments} cy={y + H / 2 + 26} r={8} fill={p * segments >= i ? color : LAB.muted} />)}
        {label && <text x={x + w / 2} y={y - H / 2 - 30} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={60} fill={LAB.text}>{label}</text>}
      </g>
    );
  };

/** Lightbulb (~120 wide, 190 tall at scale 1), x,y = centre of the glass. on 0..1 = off (grey) -> lit with rays. */
export const Lightbulb: React.FC<{ x: number; y: number; scale?: number; on: number }> = ({ x, y, scale = 1, on }) => {
  const o = Math.max(0, Math.min(1, on));
  const glass = o > 0.05 ? "#ffe36a" : "#cfd6e6";
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {o > 0 && <><circle r={120} fill="#ffe36a" opacity={0.18 * o} /><circle r={88} fill="#ffe36a" opacity={0.22 * o} />
        {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 - Math.PI / 2; if (Math.sin(a) > 0.6) return null;
          return <path key={i} d={`M ${Math.cos(a) * 82} ${Math.sin(a) * 82} L ${Math.cos(a) * (82 + 40 * o)} ${Math.sin(a) * (82 + 40 * o)}`} stroke={LAB.gold} strokeWidth={10} strokeLinecap="round" opacity={o} />; })}</>}
      <path d="M -24 50 C -28 30 -60 14 -60 -14 C -60 -48 -32 -66 0 -66 C 32 -66 60 -48 60 -14 C 60 14 28 30 24 50 Z" fill={glass} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -12 48 L -12 14 L 0 26 L 12 14 L 12 48" stroke={o > 0.05 ? "#e0861a" : "#8f9aa6"} strokeWidth={5} fill="none" strokeLinejoin="round" />
      <path d="M -38 -24 Q -36 -46 -14 -52" stroke="#ffffff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.7} />
      {[0, 1, 2].map((i) => <rect key={i} x={-28 + i * 2} y={50 + i * 16} width={56 - i * 4} height={16} rx={6} fill="#9aa6b2" stroke={INK} strokeWidth={5} />)}
      <path d="M -14 98 Q 0 112 14 98 Z" fill={INK} />
    </g>
  );
};

/** A pie that can grow: radius r*size, split = share of the first colour (0..1, default 0.5), the two slices pull
 *  apart slightly. colors = [first, second]. x,y = centre. */
export const Pie: React.FC<{ x: number; y: number; r: number; size: number; split?: number; colors: readonly [string, string] | readonly string[] }> =
  ({ x, y, r, size, split = 0.5, colors }) => {
    const R = Math.max(0, r * size), sp = Math.max(0.001, Math.min(0.999, split));
    if (R <= 0) return null;
    const a0 = -Math.PI / 2, a1 = a0 + sp * Math.PI * 2, gap = R * 0.04;
    const slice = (s: number, e: number, col: string, k: string) => {
      const m = (s + e) / 2, ox = Math.cos(m) * gap, oy = Math.sin(m) * gap, large = e - s > Math.PI ? 1 : 0;
      return <path key={k} transform={`translate(${ox} ${oy})`} d={`M 0 0 L ${(Math.cos(s) * R).toFixed(2)} ${(Math.sin(s) * R).toFixed(2)} A ${R} ${R} 0 ${large} 1 ${(Math.cos(e) * R).toFixed(2)} ${(Math.sin(e) * R).toFixed(2)} Z`}
        fill={col} stroke={INK} strokeWidth={Math.max(4, R * 0.04)} strokeLinejoin="round" />;
    };
    return (
      <g transform={`translate(${x} ${y})`}>
        <ellipse cx={0} cy={R * 0.12} rx={R * 1.02} ry={R * 1.02} fill="#05040c" opacity={0.25} />
        {slice(a0, a1, colors[0], "a")}{slice(a1, a0 + Math.PI * 2, colors[1], "b")}
      </g>
    );
  };

/** Awkward-silence gauge: half dial centred at x,y (radius 170), needle at value 0..1 (calm green -> red). A sweat
 *  drop appears near the top above 0.75. label (optional) under the dial. */
export const AwkwardMeter: React.FC<{ x: number; y: number; value: number; label?: string; scale?: number }> = ({ x, y, value, label, scale = 1 }) => {
  const R = 170, v = Math.max(0, Math.min(1, value)), cols = [LAB.green, "#9ad13a", LAB.gold, LAB.orange, LAB.red];
  const arc = (t0: number, t1: number, r: number) => `M ${Math.cos(Math.PI + t0 * Math.PI) * r} ${Math.sin(Math.PI + t0 * Math.PI) * r} A ${r} ${r} 0 0 1 ${Math.cos(Math.PI + t1 * Math.PI) * r} ${Math.sin(Math.PI + t1 * Math.PI) * r}`;
  const na = Math.PI + v * Math.PI;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={`${arc(0, 1, R + 24)} L ${R + 24} 26 L ${-R - 24} 26 Z`} fill="#1a2448" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {cols.map((c, i) => <path key={i} d={arc(i / 5 + 0.006, (i + 1) / 5 - 0.006, R - 14)} stroke={c} strokeWidth={36} fill="none" />)}
      {/* faces at both ends: calm / grimace */}
      <g transform={`translate(${-R + 14} 0)`}><circle r={18} fill={LAB.green} stroke={INK} strokeWidth={4} /><path d="M -7 4 Q 0 10 7 4" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" /></g>
      <g transform={`translate(${R - 14} 0)`}><circle r={18} fill={LAB.red} stroke={INK} strokeWidth={4} /><path d="M -8 5 L 8 5 M -4 2 L -4 8 M 0 2 L 0 8 M 4 2 L 4 8" stroke={INK} strokeWidth={2.5} strokeLinecap="round" /></g>
      <path d={`M 0 0 L ${Math.cos(na) * (R - 34)} ${Math.sin(na) * (R - 34)}`} stroke={SAND} strokeWidth={14} strokeLinecap="round" />
      <circle r={22} fill={SAND} stroke={INK} strokeWidth={6} />
      {v > 0.75 && <SweatDrop x={R + 30} y={-R - 10} scale={1.9 * Math.min(1, (v - 0.75) * 6)} />}
      {label && <text y={100} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={52} fill={LAB.text}>{label}</text>}
    </g>
  );
};

/** Speech bubble for blurting: rounded box centred at x,y (w x h) with a tail to the point `tail` ([x, y] absolute;
 *  default below-left; null = no tail). children are drawn on top in absolute coordinates (labels via props). */
export const SpeechBubble: React.FC<{ x: number; y: number; w: number; h: number; tail?: [number, number] | null; fill?: string; children?: React.ReactNode }> =
  ({ x, y, w, h, tail, fill = SAND, children }) => {
    const tp = tail === undefined ? [x - w * 0.3, y + h / 2 + h * 0.5] : tail;
    const bx = Math.max(x - w / 2 + 40, Math.min(x + w / 2 - 40, tp ? tp[0] : x));
    const by = tp && tp[1] < y ? y - h / 2 : y + h / 2;
    const k = Math.min(w, h) * 0.18;
    return (
      <g>
        {tp && <path d={`M ${bx - k} ${by} L ${tp[0]} ${tp[1]} L ${bx + k} ${by} Z`} fill={fill} stroke={INK} strokeWidth={8} strokeLinejoin="round" />}
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={Math.min(w, h) * 0.3} fill={fill} stroke={INK} strokeWidth={8} />
        {tp && <path d={`M ${bx - k + 6} ${by} L ${bx + k - 6} ${by}`} stroke={fill} strokeWidth={10} />}
        {children}
      </g>
    );
  };

/** Two simple negotiator icons (bust: head + shoulders) facing each other across a gap, for the lab. x = centre
 *  between them, y = bottom of the busts, gap = distance between their centres (default 560). colors = shirts. */
export const Negotiators: React.FC<{ x: number; y: number; gap?: number; scale?: number; colors?: readonly [string, string]; skins?: readonly [string, string];
  exprs?: readonly ["calm" | "talk" | "worried", "calm" | "talk" | "worried"] }> =
  ({ x, y, gap = 560, scale = 1, colors = ["#2fbf71", "#e8443a"], skins = ["#f2c39b", "#ffe2c8"], exprs = ["calm", "calm"] }) => {
    const bust = (d: 1 | -1, i: 0 | 1) => {
      const e = exprs[i];
      return <g key={i} transform={`translate(${x - (d * gap) / 2} ${y}) scale(${d * scale} ${scale})`}>
        <path d="M -110 0 C -110 -110 -60 -140 0 -140 C 60 -140 110 -110 110 0 Z" fill={colors[i]} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <rect x={-18} y={-162} width={36} height={30} fill={skins[i]} stroke={INK} strokeWidth={6} />
        <ellipse cx={6} cy={-230} rx={70} ry={74} fill={skins[i]} stroke={INK} strokeWidth={8} />
        <ellipse cx={40} cy={-238} rx={7} ry={10} fill={INK} />
        <path d={`M 26 ${-262 + (e === "worried" ? 4 : 0)} L 52 ${-266 - (e === "worried" ? 4 : 0)}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        {e === "talk" ? <ellipse cx={52} cy={-200} rx={12} ry={10} fill="#5a1626" stroke={INK} strokeWidth={4} />
          : e === "worried" ? <path d="M 32 -198 Q 44 -206 58 -196" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
            : <path d="M 32 -202 Q 46 -194 60 -204" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />}
      </g>;
    };
    return <g>{bust(1, 0)}{bust(-1, 1)}</g>;
  };
