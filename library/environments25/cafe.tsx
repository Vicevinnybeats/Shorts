// Library (2.5D): a bright breakfast cafe in the morning (episode "toast"): pale mint wall, deep-green wainscot, big
// window onto a sunny street with an awning, chalk menu board (shapes only), wooden counter with an espresso machine,
// cups and a cake dome, green pendant lights, plants, cream/terracotta checker floor in perspective. Props: bistro
// table, chairs (side + front view) and a seating helper, tall counter, plate, buttered toast, mug, coffee pot,
// butter splat, storm cloud. Lab props: paper card, rotation arrow, ruler, giant table, drop counter. Lena's apron.
import React from "react";
import { INK, Look, Pose } from "../characters25/person";
import { CachedSvg } from "../../src/engine25/cached";
import { LAB } from "../style/channel";
import { PersonPart } from "./livingroom";

export const CAFE = { wall: "#cfe8d6", wall2: "#bcdcc6", wainscot: "#2f6f62", wainscot2: "#285f54", rail: "#fbf3e4",
  floor: "#f4e8d0", floor2: "#cf8a66", wood: "#c98f5a", wood2: "#a8703f", marble: "#f6f1e8", marble2: "#ddd3c4",
  machine: "#e0503c", machine2: "#b83a2a", steel: "#c9d1d8", steel2: "#8f9aa6", sky: "#a7dcf7", sun: "#ffd93b",
  board: "#2b3532", chalk: "#f4f1e8", chalk2: "#ffd36b", lamp: "#ffe3a0", shade: "#2f6f62", leaf: "#4fa35e", leaf2: "#3a8048",
  pot: "#f6efe0", awning: "#e8604c", metal: "#3a3340", chair: "#8a5230", chair2: "#6b3e22", bread: "#f0c27a", crust: "#c97f3c",
  crust2: "#9a5a26", butter: "#ffe066", butter2: "#f2c230", plate: "#fdfcf8", plate2: "#d9dee3", mug: "#f6efe0",
  coffee: "#5a3420", glass: "#dff2ff", apron: "#2f6f62", cloud: "#5d6678", cloud2: "#4a5263", rain: "#8fc3ff" } as const;

const SAND = "#f6efe0";
const CUP_COLS = ["#f6efe0", "#e8604c", "#ffd36b", "#7fb8e0"];

// ---------------------------------------------------------------- the room
/** Back wall (cached). Covers x -300..1380, y..y+h; everything is anchored to the floor line y+h, so keep h >= 1400
 *  (window top ~1270 above the floor, menu board ~1270, pendants hang from y). Window x -230..510 (street + sun),
 *  pendant lamps at x 570 / 1300, potted plant x ~560, counter x 610..1380 (top 420 above the floor), menu board
 *  x 630..1230 above it. Put CafeFloor below it (from y+h). */
export const CafeWall: React.FC<{ y?: number; h?: number }> = ({ y = 0, h = 1500 }) => {
  const B = y + h;
  const wx0 = -200, wx1 = 480, wy0 = B - 1240, wy1 = B - 400, G = wy1 - 150;   // window inner box, street ground line
  const ct = B - 420;                                                          // counter top
  const win = (bx: number, by: number, k: string) => <rect key={k} x={bx} y={by} width={34} height={44} rx={4} fill="#d6eefa" stroke={INK} strokeWidth={4} />;
  return (
    <CachedSvg cacheKey={`cafe-wall-${y}-${h}`} x={-300} y={y} w={1680} h={h}>
      <rect x={-300} y={y} width={1680} height={h} fill={CAFE.wall} />
      {Array.from({ length: 17 }, (_, i) => <rect key={i} x={-300 + i * 100} y={y} width={8} height={h} fill={CAFE.wall2} />)}
      {/* ---- window: sky, sun, clouds, street across the road */}
      <rect x={wx0 - 30} y={wy0 - 30} width={wx1 - wx0 + 60} height={wy1 - wy0 + 60} rx={10} fill={CAFE.rail} stroke={INK} strokeWidth={10} />
      <rect x={wx0} y={wy0} width={wx1 - wx0} height={wy1 - wy0} fill={CAFE.sky} />
      <circle cx={385} cy={wy0 + 165} r={50} fill={CAFE.sun} stroke={INK} strokeWidth={5} />
      {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return <path key={"r" + i} d={`M ${385 + Math.cos(a) * 64} ${wy0 + 165 + Math.sin(a) * 64} L ${385 + Math.cos(a) * 84} ${wy0 + 165 + Math.sin(a) * 84}`} stroke={CAFE.sun} strokeWidth={9} strokeLinecap="round" />; })}
      {[[-110, wy0 + 140, 1], [170, wy0 + 110, 0.8]].map(([cx, cy, s], i) => <g key={"cl" + i} transform={`translate(${cx} ${cy}) scale(${s})`}>
        <path d="M -70 20 C -90 20 -90 -12 -62 -12 C -60 -40 -20 -46 -6 -24 C 6 -50 54 -44 52 -12 C 80 -12 82 20 60 20 Z" fill="#ffffff" stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>)}
      {/* buildings */}
      <rect x={wx0} y={wy0 + 330} width={210} height={G - wy0 - 330} fill="#f4c48e" stroke={INK} strokeWidth={6} />
      <rect x={wx0} y={wy0 + 330} width={210} height={22} fill="#d9a56e" stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((c) => [0, 1, 2].map((r) => win(wx0 + 30 + c * 62, wy0 + 380 + r * 92, `a${c}${r}`)))}
      <rect x={10} y={wy0 + 230} width={220} height={G - wy0 - 230} fill="#ef9f8a" stroke={INK} strokeWidth={6} />
      <rect x={10} y={wy0 + 230} width={220} height={22} fill="#d47e69" stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((c) => [0, 1].map((r) => win(36 + c * 66, wy0 + 290 + r * 92, `b${c}${r}`)))}
      {/* shop front with a striped awning */}
      <rect x={36} y={G - 120} width={168} height={120} fill="#d6eefa" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 6 }, (_, i) => <path key={"aw" + i} d={`M ${26 + i * 32} ${G - 172} L ${58 + i * 32} ${G - 172} L ${58 + i * 32} ${G - 132} Q ${42 + i * 32} ${G - 118} ${26 + i * 32} ${G - 132} Z`}
        fill={i % 2 ? SAND : CAFE.awning} stroke={INK} strokeWidth={4} strokeLinejoin="round" />)}
      <rect x={230} y={wy0 + 360} width={wx1 - 230} height={G - wy0 - 360} fill="#f7e0a8" stroke={INK} strokeWidth={6} />
      {[0, 1, 2].map((c) => [0, 1, 2].map((r) => win(256 + c * 70, wy0 + 410 + r * 90, `c${c}${r}`)))}
      {/* tree + street lamp */}
      <rect x={292} y={G - 150} width={18} height={150} fill="#7a5038" stroke={INK} strokeWidth={5} />
      {[[300, G - 210, 66], [250, G - 170, 48], [352, G - 170, 48]].map(([cx, cy, r], i) => <circle key={"t" + i} cx={cx} cy={cy} r={r} fill={CAFE.leaf} stroke={INK} strokeWidth={6} />)}
      {[[300, G - 210, 66], [250, G - 170, 48], [352, G - 170, 48]].map(([cx, cy, r], i) => <circle key={"ti" + i} cx={cx} cy={cy} r={r - 3} fill={CAFE.leaf} />)}
      <circle cx={280} cy={G - 232} r={18} fill="#7cc77a" />
      <rect x={-128} y={G - 300} width={12} height={300} fill={CAFE.metal} stroke={INK} strokeWidth={4} />
      <path d={`M -142 ${G - 300} L -102 ${G - 300} L -110 ${G - 336} L -134 ${G - 336} Z`} fill={CAFE.metal} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={-122} cy={G - 292} r={9} fill="#fff3c4" />
      {/* pavement + road */}
      <rect x={wx0} y={G} width={wx1 - wx0} height={52} fill="#e3dbcc" stroke={INK} strokeWidth={5} />
      <rect x={wx0} y={G + 52} width={wx1 - wx0} height={wy1 - G - 52} fill="#7d8593" />
      {Array.from({ length: 6 }, (_, i) => <rect key={"d" + i} x={wx0 + 20 + i * 120} y={G + 92} width={64} height={10} rx={5} fill={SAND} />)}
      {/* awning over the window (outside, top) */}
      {Array.from({ length: 12 }, (_, i) => { const sx = wx0 + i * ((wx1 - wx0) / 12), sw = (wx1 - wx0) / 12;
        return <path key={"wa" + i} d={`M ${sx} ${wy0} L ${sx + sw} ${wy0} L ${sx + sw} ${wy0 + 56} Q ${sx + sw / 2} ${wy0 + 78} ${sx} ${wy0 + 56} Z`}
          fill={i % 2 ? SAND : CAFE.awning} stroke={INK} strokeWidth={5} strokeLinejoin="round" />; })}
      {/* frame, mullions, inner outline */}
      <rect x={wx0} y={wy0} width={wx1 - wx0} height={wy1 - wy0} fill="none" stroke={INK} strokeWidth={8} />
      <rect x={131} y={wy0} width={18} height={wy1 - wy0} fill={CAFE.rail} stroke={INK} strokeWidth={5} />
      <rect x={wx0} y={wy0 + 291} width={wx1 - wx0} height={18} fill={CAFE.rail} stroke={INK} strokeWidth={5} />
      {/* sill with two little pots */}
      <rect x={wx0 - 56} y={wy1 + 26} width={wx1 - wx0 + 112} height={28} rx={6} fill={CAFE.rail} stroke={INK} strokeWidth={7} />
      {[-120, 400].map((px, i) => <g key={"sp" + i}>
        {[-26, 0, 26].map((dx, j) => <path key={j} d={`M ${px} ${wy1 - 20} Q ${px + dx * 1.6} ${wy1 - 70 - (j === 1 ? 22 : 0)} ${px + dx * 2} ${wy1 - 64 - (j === 1 ? 26 : 0)} Q ${px + dx * 0.6} ${wy1 - 40} ${px} ${wy1 - 20} Z`} fill={CAFE.leaf} stroke={INK} strokeWidth={4} strokeLinejoin="round" />)}
        <path d={`M ${px - 30} ${wy1 - 24} L ${px + 30} ${wy1 - 24} L ${px + 22} ${wy1 + 26} L ${px - 22} ${wy1 + 26} Z`} fill={i ? CAFE.awning : CAFE.chalk2} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      </g>)}
      {/* ---- menu board (chalk shapes only, no text) */}
      <rect x={630} y={B - 1270} width={600} height={410} rx={12} fill={CAFE.wood2} stroke={INK} strokeWidth={9} />
      <rect x={654} y={B - 1246} width={552} height={362} rx={6} fill={CAFE.board} />
      <g stroke={CAFE.chalk} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.92}>
        <path d={`M 896 ${B - 1210} L 896 ${B - 1170} Q 896 ${B - 1150} 916 ${B - 1150} L 944 ${B - 1150} Q 964 ${B - 1150} 964 ${B - 1170} L 964 ${B - 1210} Z M 964 ${B - 1198} Q 988 ${B - 1196} 982 ${B - 1176} Q 978 ${B - 1166} 964 ${B - 1168}`} strokeWidth={7} />
        <path d={`M 916 ${B - 1222} q 8 -12 0 -24 M 944 ${B - 1222} q 8 -12 0 -24`} strokeWidth={6} />
        {[0, 1].map((d) => <path key={d} d={`M ${d ? 1010 : 830} ${B - 1186} l 30 0`} strokeWidth={6} />)}
        {[0, 1, 2, 3].map((r) => { const ry = B - 1110 + r * 62, len = [190, 150, 210, 170][r];
          return <g key={"row" + r}>
            {r === 0 && <path d={`M 690 ${ry + 10} l 0 -22 q 0 -6 6 -6 l 26 0 q 6 0 6 6 l 0 22 Z`} strokeWidth={6} />}
            {r === 1 && <path d={`M 684 ${ry + 6} Q 712 ${ry - 34} 740 ${ry + 6} Q 712 ${ry - 4} 684 ${ry + 6} Z`} strokeWidth={6} />}
            {r === 2 && <circle cx={712} cy={ry - 4} r={16} strokeWidth={6} />}
            {r === 3 && <path d={`M 690 ${ry + 8} l 44 0 l -22 -32 Z`} strokeWidth={6} />}
            <path d={`M 768 ${ry - 4} l ${len} 0`} strokeWidth={14} />
            <path d={`M ${790 + len} ${ry - 2} L 1090 ${ry - 2}`} strokeWidth={5} strokeDasharray="2 14" />
            <circle cx={1124} cy={ry - 4} r={11} fill={CAFE.chalk2} stroke="none" />
            <circle cx={1156} cy={ry - 4} r={11} fill={CAFE.chalk2} stroke="none" />
          </g>; })}
      </g>
      {/* ---- tiled splashback behind the counter + shelf with cups and jars */}
      <rect x={610} y={B - 760} width={770} height={340} fill="#f4f6f2" />
      {Array.from({ length: 9 }, (_, j) => <g key={"tl" + j}>
        <path d={`M 610 ${B - 760 + j * 38} L 1380 ${B - 760 + j * 38}`} stroke="#d5dcd6" strokeWidth={3} />
        {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M ${610 + i * 80 + (j % 2) * 40} ${B - 760 + j * 38} l 0 38`} stroke="#d5dcd6" strokeWidth={3} />)}
      </g>)}
      <rect x={610} y={B - 760} width={770} height={340} fill="none" stroke={INK} strokeWidth={6} />
      <rect x={640} y={B - 812} width={620} height={18} rx={4} fill={CAFE.wood} stroke={INK} strokeWidth={6} />
      {[690, 1210].map((bx) => <path key={bx} d={`M ${bx} ${B - 794} L ${bx} ${B - 764} L ${bx + 24} ${B - 794} Z`} fill={CAFE.wood2} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
      {[0, 1, 2, 3].map((i) => { const cx = 690 + i * 62, c = CUP_COLS[i];
        return <path key={"cu" + i} d={`M ${cx - 22} ${B - 812} L ${cx - 18} ${B - 856} L ${cx + 18} ${B - 856} L ${cx + 22} ${B - 812} Z`} fill={c} stroke={INK} strokeWidth={5} strokeLinejoin="round" />; })}
      {[0, 1, 2].map((i) => { const cx = 960 + i * 64;
        return <g key={"jar" + i}><rect x={cx - 24} y={B - 868} width={48} height={56} rx={8} fill={CAFE.glass} stroke={INK} strokeWidth={5} />
          <rect x={cx - 20} y={B - 846} width={40} height={30} rx={4} fill={["#6b3e22", "#f0c27a", "#e8604c"][i]} />
          <rect x={cx - 26} y={B - 876} width={52} height={12} rx={4} fill={CAFE.wood2} stroke={INK} strokeWidth={4} /></g>; })}
      {[-22, 0, 22].map((dx, j) => <path key={"shp" + j} d={`M 1180 ${B - 836} Q ${1180 + dx * 1.8} ${B - 880 - (j === 1 ? 14 : 0)} ${1180 + dx * 2.2} ${B - 870 - (j === 1 ? 16 : 0)} Q ${1180 + dx * 0.5} ${B - 850} 1180 ${B - 836} Z`} fill={CAFE.leaf} stroke={INK} strokeWidth={4} />)}
      <path d={`M 1156 ${B - 840} L 1204 ${B - 840} L 1198 ${B - 812} L 1162 ${B - 812} Z`} fill={CAFE.awning} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* ---- wainscot + rail + skirting */}
      <rect x={-300} y={B - 330} width={1680} height={330} fill={CAFE.wainscot} />
      {Array.from({ length: 9 }, (_, i) => <rect key={"wp" + i} x={-280 + i * 190} y={B - 290} width={150} height={230} rx={6} fill="none" stroke={CAFE.wainscot2} strokeWidth={8} />)}
      <rect x={-300} y={B - 346} width={1680} height={22} rx={4} fill={CAFE.rail} stroke={INK} strokeWidth={6} />
      <rect x={-300} y={B - 34} width={1680} height={34} fill={CAFE.wainscot2} stroke={INK} strokeWidth={6} />
      {/* ---- counter (top 420 above the floor) */}
      <rect x={610} y={ct + 26} width={790} height={420 - 26} fill={CAFE.wood} stroke={INK} strokeWidth={9} />
      {Array.from({ length: 10 }, (_, i) => <path key={"sl" + i} d={`M ${650 + i * 76} ${ct + 70} L ${650 + i * 76} ${B - 50}`} stroke={CAFE.wood2} strokeWidth={6} />)}
      <rect x={610} y={B - 44} width={790} height={44} fill={CAFE.wood2} stroke={INK} strokeWidth={7} />
      <rect x={596} y={ct} width={800} height={30} rx={8} fill={CAFE.marble} stroke={INK} strokeWidth={8} />
      <path d={`M 620 ${ct + 10} L 1380 ${ct + 10}`} stroke={CAFE.marble2} strokeWidth={5} />
      {/* espresso machine */}
      <rect x={690} y={ct - 250} width={230} height={250} rx={18} fill={CAFE.machine} stroke={INK} strokeWidth={8} />
      <rect x={690} y={ct - 250} width={230} height={42} rx={14} fill={CAFE.machine2} stroke={INK} strokeWidth={6} />
      {[722, 772].map((cx, i) => <path key={"tc" + i} d={`M ${cx - 18} ${ct - 250} L ${cx - 14} ${ct - 284} L ${cx + 14} ${ct - 284} L ${cx + 18} ${ct - 250} Z`} fill={CUP_COLS[i]} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
      <rect x={712} y={ct - 196} width={186} height={70} rx={10} fill={CAFE.steel} stroke={INK} strokeWidth={6} />
      <circle cx={805} cy={ct - 161} r={24} fill={SAND} stroke={INK} strokeWidth={5} />
      <path d={`M 805 ${ct - 161} L 818 ${ct - 176}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      {[745, 865].map((gx) => <g key={"gh" + gx}><rect x={gx - 22} y={ct - 120} width={44} height={26} rx={6} fill={CAFE.steel2} stroke={INK} strokeWidth={5} />
        <path d={`M ${gx + 20} ${ct - 108} L ${gx + 62} ${ct - 112}`} stroke={INK} strokeWidth={10} strokeLinecap="round" /></g>)}
      {[745, 865].map((gx, i) => <path key={"gc" + gx} d={`M ${gx - 16} ${ct - 58} L ${gx - 12} ${ct - 22} L ${gx + 12} ${ct - 22} L ${gx + 16} ${ct - 58} Z`} fill={CUP_COLS[i + 2]} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
      <rect x={706} y={ct - 22} width={198} height={14} rx={4} fill={CAFE.steel2} stroke={INK} strokeWidth={5} />
      <path d={`M 912 ${ct - 150} Q 940 ${ct - 120} 930 ${ct - 60}`} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
      {/* stacked cups, cake dome, tip jar */}
      {[0, 1, 2, 3].map((i) => <path key={"st" + i} d={`M 948 ${ct - i * 26} L 952 ${ct - 30 - i * 26} L 1004 ${ct - 30 - i * 26} L 1008 ${ct - i * 26} Z`} fill={i % 2 ? SAND : "#7fb8e0"} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
      <rect x={1040} y={ct - 14} width={150} height={14} rx={6} fill={CAFE.steel} stroke={INK} strokeWidth={5} />
      <path d={`M 1072 ${ct - 14} L 1072 ${ct - 70} L 1150 ${ct - 44} L 1150 ${ct - 14} Z`} fill="#f2a0b0" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M 1072 ${ct - 70} L 1150 ${ct - 44} L 1150 ${ct - 54} L 1072 ${ct - 82} Z`} fill={SAND} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={1090} cy={ct - 84} r={9} fill={CAFE.machine} stroke={INK} strokeWidth={3} />
      <path d={`M 1048 ${ct - 14} C 1048 ${ct - 150} 1182 ${ct - 150} 1182 ${ct - 14} Z`} fill={CAFE.glass} fillOpacity={0.35} stroke={INK} strokeWidth={6} />
      <circle cx={1115} cy={ct - 128} r={9} fill={CAFE.steel} stroke={INK} strokeWidth={4} />
      <path d={`M 1078 ${ct - 108} Q 1092 ${ct - 126} 1112 ${ct - 128}`} stroke="#ffffff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} />
      <rect x={1240} y={ct - 80} width={66} height={80} rx={12} fill={CAFE.glass} fillOpacity={0.6} stroke={INK} strokeWidth={6} />
      <circle cx={1262} cy={ct - 22} r={10} fill={CAFE.chalk2} stroke={INK} strokeWidth={3} /><circle cx={1284} cy={ct - 30} r={10} fill={CAFE.chalk2} stroke={INK} strokeWidth={3} />
      {/* ---- tall plant in the corner between window and counter */}
      {[[-50, 230, -34], [-16, 300, -10], [24, 280, 14], [50, 210, 38], [6, 200, -2]].map(([dx, hh, ang], i) =>
        <g key={"pl" + i} transform={`translate(560 ${B - 130}) rotate(${ang})`}>
          <path d={`M 0 0 L 0 ${-hh + 50}`} stroke={CAFE.leaf2} strokeWidth={6} />
          <path d={`M 0 ${-hh + 60} C -38 ${-hh + 36} -32 ${-hh - 14} 0 ${-hh - 4} C 32 ${-hh - 14} 38 ${-hh + 36} 0 ${-hh + 60} Z`} fill={i % 2 ? CAFE.leaf : CAFE.leaf2} stroke={INK} strokeWidth={6} strokeLinejoin="round" transform={`translate(${dx * 0.2} 0)`} />
          <path d={`M 0 ${-hh + 64} L 0 ${-hh + 4}`} stroke={INK} strokeWidth={3} opacity={0.5} transform={`translate(${dx * 0.2} 0)`} />
        </g>)}
      <path d={`M 504 ${B - 150} L 616 ${B - 150} L 600 ${B} L 520 ${B} Z`} fill={CAFE.pot} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <rect x={496} y={B - 162} width={128} height={24} rx={6} fill={CAFE.pot} stroke={INK} strokeWidth={7} />
      {/* ---- hanging plant in front of the window */}
      <path d={`M 20 ${y} L 20 ${B - 1180} M 20 ${B - 1180} L -16 ${B - 1120} M 20 ${B - 1180} L 56 ${B - 1120}`} stroke="#c9a06a" strokeWidth={4} fill="none" />
      {[-30, -8, 16, 40].map((vx, i) => <g key={"vn" + i}>
        <path d={`M ${20 + vx * 0.5} ${B - 1110} Q ${20 + vx} ${B - 1040} ${20 + vx * 1.2} ${B - 970 + (i % 2) * 50}`} stroke={CAFE.leaf2} strokeWidth={5} fill="none" />
        {[0, 1, 2].map((k) => { const ly = B - 1080 + k * 40 + (i % 2) * 14; if (ly > B - 970 + (i % 2) * 50) return null;
          return <ellipse key={k} cx={20 + vx * (0.8 + k * 0.15) + (k % 2 ? 9 : -9)} cy={ly} rx={13} ry={8} fill={CAFE.leaf} stroke={INK} strokeWidth={3} transform={`rotate(${k % 2 ? 30 : -30} ${20 + vx * (0.8 + k * 0.15) + (k % 2 ? 9 : -9)} ${ly})`} />; })}
      </g>)}
      <path d={`M -22 ${B - 1124} L 62 ${B - 1124} L 52 ${B - 1080} L -12 ${B - 1080} Z`} fill={CAFE.pot} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {/* ---- pendant lamps (glow is a flat translucent disc, no blend modes) */}
      {[[570, B - 1010], [1300, B - 1040]].map(([lx, ly], i) => <g key={"pd" + i}>
        <path d={`M ${lx} ${y} L ${lx} ${ly - 60}`} stroke={INK} strokeWidth={5} />
        <circle cx={lx} cy={ly + 10} r={130} fill={CAFE.lamp} opacity={0.14} />
        <circle cx={lx} cy={ly + 10} r={74} fill={CAFE.lamp} opacity={0.2} />
        <rect x={lx - 10} y={ly - 76} width={20} height={18} rx={4} fill={CAFE.metal} stroke={INK} strokeWidth={4} />
        <path d={`M ${lx - 58} ${ly} Q ${lx - 54} ${ly - 60} ${lx} ${ly - 62} Q ${lx + 54} ${ly - 60} ${lx + 58} ${ly} Z`} fill={CAFE.shade} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <circle cx={lx} cy={ly + 10} r={16} fill="#fff6d0" stroke={INK} strokeWidth={4} />
        <path d={`M ${lx - 40} ${ly - 30} Q ${lx - 30} ${ly - 50} ${lx - 8} ${ly - 54}`} stroke="#ffffff" strokeWidth={5} fill="none" opacity={0.35} strokeLinecap="round" />
      </g>)}
    </CachedSvg>
  );
};

/** Cream + terracotta checker tiles in fake perspective (vanishing point 1100 px above y), from y down. Cached. */
export const CafeFloor: React.FC<{ y: number; h?: number }> = ({ y, h = 700 }) => {
  const vx = 540, vy = y - 1100, yb = y + h;
  const rows: number[] = [];
  for (let j = 0, yy = y; yy < yb + 200; j++) { rows.push(yy); yy = y + 34 * (j + 1) + 6 * (j + 1) * (j + 1); }
  const colX = (X: number, yy: number) => vx + (X - vx) * (yy - vy) / (yb - vy);
  const quads: React.ReactElement[] = [];
  for (let j = 0; j < rows.length - 1; j++) {
    for (let i = -18; i < 26; i++) {
      if ((i + j) % 2 === 0) continue;
      const X0 = vx + i * 170 - 85, X1 = X0 + 170, ya = rows[j], yb2 = rows[j + 1];
      quads.push(<path key={`${i}-${j}`} d={`M ${colX(X0, ya).toFixed(1)} ${ya} L ${colX(X1, ya).toFixed(1)} ${ya} L ${colX(X1, yb2).toFixed(1)} ${yb2} L ${colX(X0, yb2).toFixed(1)} ${yb2} Z`} fill={CAFE.floor2} />);
    }
  }
  return (
    <CachedSvg cacheKey={`cafe-floor-${y}-${h}`} x={-400} y={y} w={1880} h={h}>
      <rect x={-400} y={y} width={1880} height={h} fill={CAFE.floor} />
      {quads}
      <rect x={-400} y={y} width={1880} height={16} fill="#05040c" opacity={0.12} />
    </CachedSvg>
  );
};

// ---------------------------------------------------------------- furniture
/** Small bistro table seen side-on: marble top, one dark pedestal, flat foot. x = centre, y = floor.
 *  Top SURFACE at y - legH (put plates/mugs/toast there); top is w wide (default 320) and 24 thick. */
export const CafeTable: React.FC<{ x: number; y: number; w?: number; legH?: number }> = ({ x, y, w = 320, legH = 250 }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={2} rx={w * 0.42} ry={12} fill="#05040c" opacity={0.18} />
    <path d={`M ${-w * 0.3} 0 L ${-w * 0.26} -18 L ${w * 0.26} -18 L ${w * 0.3} 0 Z`} fill={CAFE.metal} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <rect x={-12} y={-legH + 24} width={24} height={legH - 40} fill={CAFE.metal} stroke={INK} strokeWidth={6} />
    <path d={`M -34 ${-legH + 22} L 34 ${-legH + 22} L 22 ${-legH + 48} L -22 ${-legH + 48} Z`} fill={CAFE.metal} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-w / 2} y={-legH} width={w} height={24} rx={12} fill={CAFE.marble} stroke={INK} strokeWidth={8} />
    <path d={`M ${-w / 2 + 16} ${-legH + 14} L ${w / 2 - 16} ${-legH + 14}`} stroke={CAFE.marble2} strokeWidth={5} strokeLinecap="round" />
  </g>
);

/** Seat height of every chair, in Person-local units (multiply by the Person/chair scale). */
export const SEAT_TOP = 100;

/** Bentwood cafe chair, x = centre, y = floor, scale = the sitter's scale. Seat top at y - 100*scale.
 *  facing 1 / -1 = side view, the sitter faces that way (backrest on the other side); 0 = front view (backrest
 *  behind the sitter: draw it BEFORE the Person, then SeatFront after). */
export const Chair: React.FC<{ x: number; y: number; scale?: number; facing?: 1 | -1 | 0 }> = ({ x, y, scale = 1, facing = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={2} rx={80} ry={10} fill="#05040c" opacity={0.18} />
    {facing === 0 ? (<>
      {[-1, 1].map((d) => <path key={"bl" + d} d={`M ${d * 58} -96 L ${d * 62} -8`} stroke={INK} strokeWidth={18} strokeLinecap="round" />)}
      {[-1, 1].map((d) => <path key={"bl2" + d} d={`M ${d * 58} -96 L ${d * 62} -8`} stroke={CAFE.chair2} strokeWidth={9} strokeLinecap="round" />)}
      {[-1, 1].map((d) => <path key={"up" + d} d={`M ${d * 80} -100 L ${d * 84} -300`} stroke={INK} strokeWidth={22} strokeLinecap="round" />)}
      {[-1, 1].map((d) => <path key={"up2" + d} d={`M ${d * 80} -100 L ${d * 84} -300`} stroke={CAFE.chair} strokeWidth={12} strokeLinecap="round" />)}
      <rect x={-92} y={-322} width={184} height={34} rx={17} fill={CAFE.chair} stroke={INK} strokeWidth={7} />
      <rect x={-84} y={-226} width={168} height={16} rx={8} fill={CAFE.chair} stroke={INK} strokeWidth={6} />
      <rect x={-84} y={-104} width={168} height={14} rx={6} fill={CAFE.chair2} stroke={INK} strokeWidth={6} />
      {[-1, 1].map((d) => <path key={"fl" + d} d={`M ${d * 74} -90 L ${d * 80} 0`} stroke={INK} strokeWidth={20} strokeLinecap="round" />)}
      {[-1, 1].map((d) => <path key={"fl2" + d} d={`M ${d * 74} -90 L ${d * 80} 0`} stroke={CAFE.chair} strokeWidth={11} strokeLinecap="round" />)}
      <rect x={-84} y={-100} width={168} height={18} rx={8} fill={CAFE.chair} stroke={INK} strokeWidth={7} />
    </>) : (
      <g transform={`scale(${facing} 1)`}>
        {[["M -50 -96 L -62 0", 20, 11], ["M 50 -96 L 60 0", 20, 11], ["M -50 -100 C -56 -170 -62 -240 -72 -310", 22, 12]].map(([d, a, b], i) => <g key={i}>
          <path d={d as string} stroke={INK} strokeWidth={a as number} fill="none" strokeLinecap="round" />
          <path d={d as string} stroke={CAFE.chair} strokeWidth={b as number} fill="none" strokeLinecap="round" /></g>)}
        <rect x={-84} y={-326} width={30} height={60} rx={12} fill={CAFE.chair} stroke={INK} strokeWidth={7} transform="rotate(-4 -70 -296)" />
        <ellipse cx={0} cy={-44} rx={54} ry={8} fill="none" stroke={INK} strokeWidth={10} />
        <ellipse cx={0} cy={-44} rx={54} ry={8} fill="none" stroke={CAFE.chair2} strokeWidth={4} />
        <rect x={-66} y={-100} width={132} height={18} rx={8} fill={CAFE.chair} stroke={INK} strokeWidth={7} />
      </g>
    )}
  </g>
);

const legDrop = (p: Pose) => {
  const r = (d: number) => (d * Math.PI) / 180;
  const one = ([a, b]: [number, number]) => 82 * Math.cos(r(a)) + 78 * Math.cos(r(a + b));
  return Math.max(one(p.legL), one(p.legR));
};

/** Seated poses (the rig has no sit pose). "front": thighs fold inward behind SeatFront's lap, shins hang straight
 *  to the floor. "side": profile, thighs forward on the seat, shins down. Pass your own arms (front-view or profile
 *  convention). Keep lean 0 and crouch 0 so the lap stays aligned. */
export const sitPose = (view: "front" | "side", arms?: { armL: [number, number]; armR: [number, number] }, extra?: Partial<Pose>): Pose =>
  view === "front"
    ? { armL: arms?.armL ?? [22, -40], armR: arms?.armR ?? [22, -40], legL: [-67, 67], legR: [-67, 67], ...extra }
    : { armL: arms?.armL ?? [55, -60], armR: arms?.armR ?? [70, -70], legL: [67, -67], legR: [67, -67], profile: true, ...extra };

/** The Person's y for a seated pose so the hips rest on a chair (SEAT_TOP) and the feet touch the floor. */
export const sitY = (floorY: number, scale: number, pose: Pose) => floorY - (-150 + (pose.crouch ?? 0) * 140 + legDrop(pose)) * scale;
/** Side view: the Person's x on a Chair at chairX (hips over the back half of the seat). */
export const sitX = (chairX: number, scale: number, facing: 1 | -1) => chairX - 18 * scale * facing;

/** Front-view seating, drawn AFTER the Person: chair seat edge + the lap (thighs coming at the camera, in the
 *  Person's shorts colour) over the folded legs. Same x, floor y, scale, look and pose as the Person.
 *  Order: <Chair facing={0}/> -> <Person y={sitY(...)} pose={sitPose("front")} shadow={0}/> -> <SeatFront/> -> (CafeTable). */
export const SeatFront: React.FC<{ x: number; y: number; scale?: number; look: Look; pose?: Pose }> = ({ x, y, scale = 1, look, pose }) => {
  const H = legDrop(pose ?? sitPose("front"));            // hip height above the floor (local)
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-84} y={-100} width={168} height={18} rx={8} fill={CAFE.chair} stroke={INK} strokeWidth={7} />
      <path d={`M -64 ${-H + 4} L 64 ${-H + 4} L 66 ${-H + 34} Q 64 ${-H + 50} 34 ${-H + 50} Q 6 ${-H + 50} 0 ${-H + 42} Q -6 ${-H + 50} -34 ${-H + 50} Q -64 ${-H + 50} -66 ${-H + 34} Z`}
        fill={look.shorts} stroke={INK} strokeWidth={4.2} strokeLinejoin="round" />
      <path d={`M 0 ${-H + 6} L 0 ${-H + 40}`} stroke={INK} strokeWidth={3} opacity={0.35} />
    </g>
  );
};

/** Bar-height counter for eating standing up: marble top, slatted wood body, brass foot rail. x = centre, y = floor,
 *  h = height of the top surface above the floor, w = width (default 320). */
export const TallCounter: React.FC<{ x: number; y: number; h: number; w?: number }> = ({ x, y, h, w = 320 }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={2} rx={w * 0.6} ry={14} fill="#05040c" opacity={0.2} />
    <rect x={-w / 2} y={-h + 26} width={w} height={h - 26} fill={CAFE.wood} stroke={INK} strokeWidth={8} />
    {Array.from({ length: Math.max(1, Math.floor(w / 60)) }, (_, i) => { const sx = -w / 2 + (i + 1) * (w / (Math.floor(w / 60) + 1));
      return <path key={i} d={`M ${sx} ${-h + 60} L ${sx} -40`} stroke={CAFE.wood2} strokeWidth={6} />; })}
    <rect x={-w / 2} y={-34} width={w} height={34} fill={CAFE.wood2} stroke={INK} strokeWidth={7} />
    <path d={`M ${-w / 2 - 14} -80 L ${w / 2 + 14} -80`} stroke={INK} strokeWidth={18} strokeLinecap="round" />
    <path d={`M ${-w / 2 - 14} -80 L ${w / 2 + 14} -80`} stroke="#e2b64a" strokeWidth={9} strokeLinecap="round" />
    <rect x={-w / 2 - 18} y={-h} width={w + 36} height={28} rx={8} fill={CAFE.marble} stroke={INK} strokeWidth={8} />
    <path d={`M ${-w / 2} ${-h + 10} L ${w / 2} ${-h + 10}`} stroke={CAFE.marble2} strokeWidth={5} />
  </g>
);

// ---------------------------------------------------------------- tableware + food
/** Side-on plate, 190 wide at scale 1. x,y = where it sits (table surface). Its top is at y - 20*scale (toast on it: y - 20*plateScale - 15*toastScale). */
export const Plate: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -46 0 L 46 0 L 54 -9 L -54 -9 Z" fill={CAFE.plate2} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -98 -22 Q -92 -9 -58 -9 L 58 -9 Q 92 -9 98 -22 Z" fill={CAFE.plate} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={-22} rx={98} ry={7} fill={CAFE.plate} stroke={INK} strokeWidth={5} />
    <path d="M -72 -14 L -34 -14" stroke={CAFE.plate2} strokeWidth={4} strokeLinecap="round" />
  </g>
);

/** A slice of toast seen edge-on, 130 x 30 at scale 1, centre x,y; rot in degrees about the centre. Butter (yellow
 *  layer + melting pat + drips) is on ONE face: up at rot 0, down at rot 180. Resting flat on a surface at Y
 *  (either face down): y = Y - 15*scale. */
export const Toast: React.FC<{ x: number; y: number; scale?: number; rot?: number }> = ({ x, y, scale = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <rect x={-65} y={-9} width={130} height={24} rx={10} fill={CAFE.crust} stroke={INK} strokeWidth={6} />
    <rect x={-54} y={-3} width={108} height={12} rx={5} fill={CAFE.bread} />
    {[-40, -16, 8, 30, 46].map((cx, i) => <circle key={i} cx={cx} cy={i % 2 ? 1 : 6} r={2.6} fill={CAFE.crust2} opacity={0.7} />)}
    <path d="M -60 -9 Q -66 -16 -56 -16 L 56 -16 Q 66 -16 60 -9 Q 40 -5 20 -8 Q 0 -4 -20 -8 Q -40 -4 -60 -9 Z" fill={CAFE.butter} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -62 -12 Q -70 -4 -66 6 Q -61 10 -60 2 Z M 62 -12 Q 72 -2 67 10 Q 61 14 60 4 Z" fill={CAFE.butter} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -18 -15 L -16 -32 Q -15 -36 -10 -36 L 14 -35 Q 19 -35 19 -30 L 20 -15 Z" fill={CAFE.butter2} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -10 -30 L 8 -30" stroke="#fff6c0" strokeWidth={4} strokeLinecap="round" />
  </g>
);

/** Side-on mug (64 wide, 78 tall at scale 1), x,y = base centre, handle on the right. `steam` = frame number for
 *  rising steam wisps (omit = no steam). */
export const Mug: React.FC<{ x: number; y: number; scale?: number; steam?: number; color?: string }> = ({ x, y, scale = 1, steam, color = CAFE.mug }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {steam !== undefined && [-14, 8].map((sx, i) => {
      const ph = steam * 0.12 + i * 2, rise = ((steam * 0.8 + i * 30) % 60);
      const o = 0.75 * (1 - rise / 60);
      return <path key={i} d={`M ${sx} ${-92 - rise * 0.5} q ${10 * Math.sin(ph)} -16 0 -32 q ${-10 * Math.sin(ph)} -16 0 -32`} stroke="#ffffff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={o} />;
    })}
    <path d="M 28 -60 Q 58 -60 56 -36 Q 54 -16 28 -18" stroke={INK} strokeWidth={17} fill="none" strokeLinecap="round" />
    <path d="M 28 -60 Q 58 -60 56 -36 Q 54 -16 28 -18" stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M -32 -78 L 32 -78 L 30 -10 Q 29 0 18 0 L -18 0 Q -29 0 -30 -10 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx={0} cy={-78} rx={32} ry={6} fill={CAFE.coffee} stroke={INK} strokeWidth={5} />
    <path d="M -22 -60 L -22 -24" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.5} />
  </g>
);

/** Glass coffee carafe, x,y = base centre (~110 wide, 200 tall at scale 1), handle on the `facing` side.
 *  A hand holds the handle at about (x + 72*scale*facing, y - 120*scale). rot tilts it (degrees) about the handle,
 *  positive = pour toward -facing. */
export const CoffeePot: React.FC<{ x: number; y: number; scale?: number; facing?: 1 | -1; rot?: number }> = ({ x, y, scale = 1, facing = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale}) rotate(${-rot} 72 -120)`}>
    <path d="M 40 -150 Q 84 -150 80 -110 Q 76 -78 44 -76" stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
    <path d="M 40 -150 Q 84 -150 80 -110 Q 76 -78 44 -76" stroke={CAFE.metal} strokeWidth={12} fill="none" strokeLinecap="round" />
    <path d="M -34 -150 C -60 -110 -66 -40 -48 -10 Q -40 0 -24 0 L 24 0 Q 40 0 48 -10 C 66 -40 60 -110 34 -150 Z" fill={CAFE.glass} fillOpacity={0.55} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -58 -70 C -60 -40 -56 -18 -46 -8 Q -38 0 -24 0 L 24 0 Q 38 0 46 -8 C 56 -18 60 -40 58 -70 Q 0 -60 -58 -70 Z" fill={CAFE.coffee} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -38 -150 L 38 -150 L 42 -176 L -42 -176 Z" fill={CAFE.metal} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -42 -176 L -62 -170 L -40 -160 Z" fill={CAFE.metal} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-30} y={-196} width={60} height={22} rx={8} fill={CAFE.metal} stroke={INK} strokeWidth={6} />
    <circle cx={0} cy={-202} r={8} fill={CAFE.metal} stroke={INK} strokeWidth={4} />
    <path d="M -34 -120 Q -44 -90 -38 -78" stroke="#ffffff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} />
  </g>
);

/** Butter smear on the floor where the toast landed: x,y = centre on the floor (~220 wide at scale 1). Draw the
 *  toast (rot 180) on top of it at y - 15*scale. */
export const ButterSplat: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -96 2 Q -110 -8 -84 -12 Q -70 -22 -40 -16 Q -20 -26 10 -18 Q 40 -26 66 -14 Q 106 -14 96 2 Q 112 14 74 14 Q 40 22 10 14 Q -30 22 -60 14 Q -104 16 -96 2 Z" fill={CAFE.butter} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -50 -4 Q 0 -12 50 -4" stroke="#fff6c0" strokeWidth={5} fill="none" strokeLinecap="round" />
    {[[-128, -6, 9], [122, -10, 8], [-112, 18, 6], [136, 12, 6], [-20, -38, 7], [40, -34, 5]].map(([dx, dy, r], i) => <circle key={i} cx={dx} cy={dy} r={r} fill={CAFE.butter} stroke={INK} strokeWidth={4} />)}
  </g>
);

/** Dark rain cloud (~320 wide at scale 1) centred at x,y with falling rain lines below (animated by frame f) and a
 *  short lightning flicker every 60 frames. */
export const StormCloud: React.FC<{ x: number; y: number; scale?: number; f: number }> = ({ x, y, scale = 1, f }) => {
  const puffs: [number, number, number][] = [[-110, 10, 52], [-55, -24, 66], [20, -40, 74], [90, -10, 58], [130, 18, 42], [0, 20, 60], [-70, 28, 46], [70, 28, 46]];
  const bolt = f % 60 < 5;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {Array.from({ length: 8 }, (_, i) => {
        const rx = -112 + i * 32 + (i % 2) * 8, d = (f * 12 + i * 47) % 180;
        return <path key={"r" + i} d={`M ${rx} ${70 + d} l -8 34`} stroke={CAFE.rain} strokeWidth={7} strokeLinecap="round" opacity={1 - d / 200} />;
      })}
      {bolt && <path d="M 10 50 L -22 120 L 6 118 L -16 190 L 46 100 L 16 102 L 38 50 Z" fill={CAFE.sun} stroke={INK} strokeWidth={6} strokeLinejoin="round" />}
      {puffs.map(([cx, cy, r], i) => <circle key={"o" + i} cx={cx} cy={cy} r={r + 7} fill={INK} />)}
      {puffs.map(([cx, cy, r], i) => <circle key={"f" + i} cx={cx} cy={cy} r={r} fill={CAFE.cloud} />)}
      <path d="M -150 40 Q 0 70 160 40 L 160 50 Q 0 86 -150 50 Z" fill={CAFE.cloud2} opacity={0.9} />
      <path d="M -60 -50 Q -30 -76 6 -70" stroke="#8a93a6" strokeWidth={8} fill="none" strokeLinecap="round" />
    </g>
  );
};

// ---------------------------------------------------------------- lab props
const wrap = (s: string, max: number, lines: number) => {
  const out: string[] = [];
  let cur = "";
  for (const w of s.split(/\s+/)) {
    if ((cur + " " + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out.slice(0, lines);
};

/** A science paper card (440 x 560 at scale 1), centre x,y: journal stripe, title (word-wrapped, up to 3 lines of
 *  ~14 characters), grey text lines, a tiny toast-arc sketch and the big year. Text comes only from the props. */
export const PaperCard: React.FC<{ x: number; y: number; title: string; year: string | number; scale?: number }> = ({ x, y, title, year, scale = 1 }) => {
  const lines = wrap(title, 14, 3);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-210} y={-266} width={440} height={560} rx={14} fill="#05040c" opacity={0.3} />
      <path d="M -220 -280 L 160 -280 L 220 -220 L 220 280 L -220 280 Z" fill="#fbf6ea" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M 160 -280 L 160 -220 L 220 -220 Z" fill="#e6dcc6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-180} y={-246} width={300} height={22} rx={6} fill={LAB.red} />
      {lines.map((l, i) => <text key={i} x={-180} y={-170 + i * 52} fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={46} fill={INK}>{l}</text>)}
      {[0, 1, 2].map((i) => <rect key={"tx" + i} x={-180} y={-170 + lines.length * 52 - 10 + i * 30} width={i === 2 ? 200 : 360} height={12} rx={6} fill="#cfc6b4" />)}
      <g transform="translate(-110 130) scale(0.85)">
        <path d="M -60 -50 L 30 -50" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <path d="M 30 -50 Q 70 -40 70 40" stroke={LAB.red} strokeWidth={5} fill="none" strokeDasharray="10 8" />
        <rect x={10} y={-62} width={40} height={10} rx={4} fill={CAFE.crust} stroke={INK} strokeWidth={3} transform="rotate(20 30 -57)" />
        <path d="M 40 50 L 100 50" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      </g>
      <text x={200} y={250} textAnchor="end" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={110} fill={LAB.red} stroke={INK} strokeWidth={3}>{String(year)}</text>
    </g>
  );
};

/** Circular arrow around (x, y), radius r, from angle `from` to `to` in degrees (0 = right, positive = clockwise on
 *  screen); the head sits at `to`. Gold by default. */
export const RotationArrow: React.FC<{ x: number; y: number; r: number; from: number; to: number; color?: string }> = ({ x, y, r, from, to, color = LAB.gold }) => {
  const span = Math.max(-359, Math.min(359, to - from)), dir = span >= 0 ? 1 : -1;
  const head = Math.min(46, r * 0.6), endA = to - dir * (head / r) * (180 / Math.PI);
  const rad = (d: number) => (d * Math.PI) / 180;
  const p = (a: number, rr = r) => [x + Math.cos(rad(a)) * rr, y + Math.sin(rad(a)) * rr];
  const [sx, sy] = p(from), [ex, ey] = p(endA);
  const large = Math.abs(endA - from) > 180 ? 1 : 0, sweep = dir > 0 ? 1 : 0;
  const d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${r} ${r} 0 ${large} ${sweep} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  const [tx, ty] = p(to), len = Math.hypot(tx - ex, ty - ey) || 1;          // head runs along the chord arc-end -> tip
  const ux = (tx - ex) / len, uy = (ty - ey) / len, bx = ex - ux * 6, by = ey - uy * 6, nx = -uy * head * 0.62, ny = ux * head * 0.62;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={26} fill="none" strokeLinecap="round" />
      <path d={d} stroke={color} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={`M ${tx.toFixed(1)} ${ty.toFixed(1)} L ${(bx + nx).toFixed(1)} ${(by + ny).toFixed(1)} L ${(bx - nx).toFixed(1)} ${(by - ny).toFixed(1)} Z`} fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

/** Vertical ruler standing on (x, y) = bottom centre, h tall, `ticks` intervals (long ticks; short half-ticks when
 *  ticks <= 12). Optional label to the right of the top (CaptionSans, cream). */
export const Ruler: React.FC<{ x: number; y: number; h: number; ticks: number; label?: string; side?: 1 | -1 }> = ({ x, y, h, ticks, label, side = 1 }) => {
  const n = Math.max(1, Math.round(ticks));
  return (
    <g>
      <rect x={x - 28} y={y - h} width={56} height={h} rx={6} fill="#f2c94c" stroke={INK} strokeWidth={6} />
      {Array.from({ length: n + 1 }, (_, i) => { const ty = y - (h * i) / n;
        return <path key={i} d={`M ${x - 28} ${ty} l 30 0`} stroke={INK} strokeWidth={5} strokeLinecap="round" />; })}
      {n <= 12 && Array.from({ length: n }, (_, i) => { const ty = y - (h * (i + 0.5)) / n;
        return <path key={"h" + i} d={`M ${x - 28} ${ty} l 16 0`} stroke={INK} strokeWidth={4} strokeLinecap="round" />; })}
      {label && <text x={x + side * 52} y={y - h + 18} textAnchor={side > 0 ? "start" : "end"} fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={52} fill={LAB.text}>{label}</text>}
    </g>
  );
};

/** A comically tall wooden table: x = centre, y = floor, h = height of the top surface (any size; 340 wide).
 *  Splayed legs with stretchers every ~360 px. */
export const GiantTable: React.FC<{ x: number; y: number; h: number }> = ({ x, y, h }) => {
  const n = Math.max(1, Math.floor((h - 120) / 360));
  const legX = (t: number) => 128 + t * 30;                                    // t = 0 at the top, 1 at the floor
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={2} rx={220} ry={14} fill="#05040c" opacity={0.25} />
      {Array.from({ length: n }, (_, i) => { const t = (i + 1) / (n + 1), sy = -h + 60 + t * (h - 60), lx = legX(t);
        return <rect key={i} x={-lx} y={sy - 9} width={lx * 2} height={18} rx={6} fill={CAFE.wood2} stroke={INK} strokeWidth={6} />; })}
      {[-1, 1].map((d) => <path key={d} d={`M ${d * 116} ${-h + 50} L ${d * 140} ${-h + 50} L ${d * 172} 0 L ${d * 146} 0 Z`} fill={CAFE.wood} stroke={INK} strokeWidth={7} strokeLinejoin="round" />)}
      <rect x={-150} y={-h + 26} width={300} height={34} fill={CAFE.wood2} stroke={INK} strokeWidth={7} />
      <rect x={-170} y={-h} width={340} height={30} rx={10} fill={CAFE.wood} stroke={INK} strokeWidth={8} />
      <path d={`M -150 ${-h + 10} L 150 ${-h + 10}`} stroke="#e0b07a" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

/** Flip-board counter, centre x,y: `digits` boxes (default 4, grows to fit) with thousands commas; leading unused
 *  boxes stay dark. Each box 92 x 132. */
export const DropCounter: React.FC<{ x: number; y: number; value: number; digits?: number }> = ({ x, y, value, digits = 4 }) => {
  const s = String(Math.max(0, Math.round(value)));
  const n = Math.max(digits, s.length);
  const chars = s.padStart(n, " ").split("");
  const BW = 92, BH = 132, GAP = 12, COMMA = 26;
  const commas = (i: number) => { let c = 0; for (let k = 0; k < i; k++) if ((n - k) % 3 === 1 && k < n - 1) c++; return c; };
  const total = n * BW + (n - 1) * GAP + commas(n) * COMMA;
  const cx0 = -total / 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={cx0 - 30} y={-BH / 2 - 30} width={total + 60} height={BH + 60} rx={22} fill="#1a2448" stroke={INK} strokeWidth={8} />
      {chars.map((ch, i) => {
        const bx = cx0 + i * (BW + GAP) + commas(i) * COMMA, blank = ch === " ";
        const showComma = (n - i) % 3 === 1 && i < n - 1 && !blank;
        return <g key={i}>
          <rect x={bx} y={-BH / 2} width={BW} height={BH} rx={12} fill={blank ? "#141b38" : "#24346a"} stroke={INK} strokeWidth={5} />
          <path d={`M ${bx + 4} 0 L ${bx + BW - 4} 0`} stroke="#141b38" strokeWidth={4} />
          {!blank && <text x={bx + BW / 2} y={38} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={104} fill={LAB.text}>{ch}</text>}
          {showComma && <path d={`M ${bx + BW + GAP / 2 + COMMA / 2 - 7} ${BH / 2 - 22} a 8 8 0 1 1 14 6 Q ${bx + BW + GAP / 2 + COMMA / 2 + 4} ${BH / 2 + 2} ${bx + BW + GAP / 2 + COMMA / 2 - 6} ${BH / 2 + 8} Q ${bx + BW + GAP / 2 + COMMA / 2} ${BH / 2 - 4} ${bx + BW + GAP / 2 + COMMA / 2 - 7} ${BH / 2 - 22} Z`} fill={LAB.gold} />}
        </g>;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- wardrobe
/** Waiter's apron (Lena). Draw right AFTER the Person with the same x, y, scale, facing, pose, rot (extra Person props
 *  are ignored, so you can spread the Person's props). Front view; arms held across the chest get covered. */
export const Apron: React.FC<{ x: number; y: number; scale?: number; facing?: 1 | -1; pose?: Pose; rot?: number; color?: string }> = ({ x, y, scale, facing, pose, rot, color = CAFE.apron }) => (
  <PersonPart x={x} y={y} scale={scale} facing={facing} pose={pose} rot={rot} part="body">
    <path d="M -24 -256 L -10 -288 M 24 -256 L 10 -288" stroke={INK} strokeWidth={9} strokeLinecap="round" />
    <path d="M -24 -256 L -10 -288 M 24 -256 L 10 -288" stroke={color} strokeWidth={4} strokeLinecap="round" />
    <path d="M -30 -262 L 30 -262 L 32 -186 L 46 -184 L 50 -84 Q 0 -76 -50 -84 L -46 -184 L -32 -186 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -46 -184 L 46 -184" stroke={INK} strokeWidth={4} />
    <rect x={-26} y={-150} width={52} height={36} rx={6} fill="none" stroke={CAFE.rail} strokeWidth={4} opacity={0.6} />
    <rect x={-14} y={-246} width={28} height={22} rx={4} fill="none" stroke={CAFE.rail} strokeWidth={4} opacity={0.6} />
  </PersonPart>
);
