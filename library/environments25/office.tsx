// Library (2.5D): a glass-and-stone office lobby in the morning with a lift seen head-on (sliding doors, floor display,
// button panel), a big close-door button, a pointing finger, a crosswalk push-button on a city street, and props
// (crutches, firefighter helmet, key). Cool morning palette, unlike the warm kitchen and the bright shop.
import React from "react";
import { INK } from "../characters25/person";
import { CachedSvg } from "../../src/engine25/cached";

export const OFFICE = { wall: "#dfe5ea", stone: "#c9d1d8", stone2: "#b7c1ca", steel: "#aeb8c2", steel2: "#8f9aa6", carInside: "#c6a77a",
  carWall: "#b0915f", floor: "#6c7a88", sky: "#bfe3f5", glow: "#7fe0ff", red: "#e8443a", green: "#2fbf71" };

/** lobby back wall: stone panels, tall windows with a morning skyline, a plant and a wall clock. Static -> cached. */
export const LobbyWall: React.FC = () => (
  <CachedSvg cacheKey="lobby-wall" x={-400} y={-300} w={1880} h={2400}>
    <rect x={-400} y={-300} width={1880} height={2400} fill={OFFICE.wall} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-400 + i * 160} y={-300} width={156} height={1750} fill={i % 2 ? OFFICE.stone : OFFICE.stone2} opacity={0.55} />)}
    {[-340, 1180].map((wx) => <g key={wx}>
      <rect x={wx} y={120} width={260} height={900} fill={OFFICE.sky} stroke={INK} strokeWidth={8} />
      {[[20, 520, 70], [100, 380, 60], [170, 600, 70]].map(([bx, by, bw], i) => <rect key={i} x={wx + bx} y={by} width={bw} height={1020 - by} fill="#8fb4cc" stroke="#6f93ab" strokeWidth={3} />)}
      <path d={`M ${wx + 130} 120 L ${wx + 130} 1020`} stroke={INK} strokeWidth={6} />
    </g>)}
    <rect x={-400} y={1440} width={1880} height={660} fill={OFFICE.floor} />
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M ${-400 + i * 140} 1440 L ${-640 + i * 180} 2100`} stroke="#5d6a77" strokeWidth={4} />)}
  </CachedSvg>
);

/** A lift seen head-on. `open` 0..1 slides the doors apart; `floor` shows in the display; `inside` draws the people. */
export const Lift: React.FC<{ x: number; y: number; open: number; floor: string; children?: React.ReactNode; arrow?: "up" | "down" | null }> = ({ x, y, open, floor, children, arrow = "up" }) => {
  const W = 600, H = 960, half = W / 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* frame */}
      <rect x={-half - 60} y={-H - 170} width={W + 120} height={H + 170} rx={10} fill={OFFICE.steel} stroke={INK} strokeWidth={9} />
      <rect x={-130} y={-H - 150} width={260} height={110} rx={14} fill="#1b2133" stroke={INK} strokeWidth={7} />
      <text x={-30} y={-H - 70} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={76} fill="#ff9a3a">{floor}</text>
      {arrow && <path d={arrow === "up" ? "M 50 -1060 L 80 -1100 L 110 -1060 Z" : "M 50 -1100 L 80 -1060 L 110 -1100 Z"} fill="#ff9a3a" />}
      {/* car interior */}
      <rect x={-half} y={-H} width={W} height={H} fill={OFFICE.carInside} />
      <rect x={-half} y={-H} width={W} height={60} fill="#fff7dc" opacity={0.85} />
      {[-180, 0, 180].map((hx) => <path key={hx} d={`M ${hx} ${-H + 60} L ${hx} 0`} stroke={OFFICE.carWall} strokeWidth={5} />)}
      <rect x={-half} y={-H * 0.45} width={W} height={14} fill={OFFICE.steel2} />
      <rect x={-half} y={-40} width={W} height={40} fill="#5b4a36" />
      {/* the in-car button panel on the right */}
      <g transform={`translate(${half - 70} ${-H * 0.52})`}>
        <rect x={-38} y={-150} width={76} height={300} rx={10} fill={OFFICE.steel} stroke={INK} strokeWidth={5} />
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={0} cy={-110 + i * 50} r={16} fill="#eef1f4" stroke={INK} strokeWidth={4} />)}
        <circle cx={0} cy={100} r={18} fill={OFFICE.glow} stroke={INK} strokeWidth={4} />
      </g>
      {children}
      {/* doors */}
      <rect x={-half} y={-H} width={half * (1 - open)} height={H} fill={OFFICE.steel} stroke={INK} strokeWidth={7} />
      <rect x={half - half * (1 - open)} y={-H} width={half * (1 - open)} height={H} fill={OFFICE.steel} stroke={INK} strokeWidth={7} />
      {open < 0.98 && <rect x={-half + half * (1 - open) - 40} y={-H} width={30} height={H} fill="#ffffff" opacity={0.25} />}
      <rect x={-half - 60} y={0} width={W + 120} height={22} fill={OFFICE.steel2} stroke={INK} strokeWidth={6} />
    </g>
  );
};

/** the close-door symbol: two triangles pointing at a centre line */
export const CloseIcon: React.FC<{ s: number; color?: string }> = ({ s, color = INK }) => (
  <g fill={color}>
    <path d={`M ${-s} ${-s * 0.6} L ${-s * 0.15} 0 L ${-s} ${s * 0.6} Z`} />
    <path d={`M ${s} ${-s * 0.6} L ${s * 0.15} 0 L ${s} ${s * 0.6} Z`} />
    <rect x={-s * 0.06} y={-s * 0.7} width={s * 0.12} height={s * 1.4} />
  </g>
);

/** a big round lift button in close-up; `press` 0..1 pushes it in; `lit` makes it glow */
export const BigButton: React.FC<{ x: number; y: number; r: number; press?: number; lit?: number }> = ({ x, y, r, press = 0, lit = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-r * 1.6} y={-r * 1.9} width={r * 3.2} height={r * 3.8} rx={r * 0.3} fill={OFFICE.steel} stroke={INK} strokeWidth={r * 0.06} />
    <circle r={r * 1.18} fill={OFFICE.steel2} stroke={INK} strokeWidth={r * 0.05} />
    {lit > 0 && <circle r={r * 1.5} fill={OFFICE.glow} opacity={lit * 0.35} />}
    <circle r={r * (1 - press * 0.06)} cy={press * r * 0.05} fill={lit > 0 ? "#dffaff" : "#f2f4f6"} stroke={INK} strokeWidth={r * 0.06} />
    <g transform={`translate(0 ${press * r * 0.05})`}><CloseIcon s={r * 0.55} color={lit > 0 ? "#1d8fb0" : INK} /></g>
  </g>
);

/** a hand pointing its index finger up-left at (x, y) = fingertip; `skin`, sleeve colour `sleeve` */
export const Finger: React.FC<{ x: number; y: number; scale?: number; skin: string; sleeve: string; rot?: number }> = ({ x, y, scale = 1, skin, sleeve, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <path d="M 300 420 L 560 640 L 470 760 L 220 540 Z" fill={sleeve} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <path d="M 120 250 C 170 200 280 230 330 300 L 320 420 C 300 470 240 500 200 470 L 120 380 Z" fill={skin} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <path d="M 0 0 C -20 -20 30 -40 50 -20 L 175 245 L 120 275 Z" fill={skin} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <path d="M 140 300 C 180 300 230 320 240 350 M 150 350 C 190 350 230 370 236 400" stroke={INK} strokeWidth={7} fill="none" />
    <path d="M 8 2 C 2 -14 30 -26 40 -12" stroke="#ffffff" strokeWidth={6} fill="none" opacity={0.6} />
  </g>
);

/** crutches leaning in the arm pits of someone standing at (x, y) feet, scale s */
export const Crutches: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={8} strokeLinecap="round">
    {[-1, 1].map((d) => <g key={d}><path d={`M ${d * 95} -250 L ${d * 110} 0`} stroke="#9aa6b2" strokeWidth={14} /><path d={`M ${d * 70} -255 L ${d * 120} -255`} stroke={INK} strokeWidth={16} /></g>)}
  </g>
);

/** firefighter helmet drawn over a Person's head (head centre ~ (x, y)) */
export const Helmet: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -95 10 Q -80 -95 0 -100 Q 80 -95 95 10 Z" fill="#d8332b" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -130 10 L 150 10 Q 160 30 140 34 L -120 34 Q -140 30 -130 10 Z" fill="#b8241e" stroke={INK} strokeWidth={8} />
    <rect x={-26} y={-78} width={52} height={60} rx={8} fill="#f2c230" stroke={INK} strokeWidth={6} />
  </g>
);

/** the firefighters' key */
export const Key: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle cx={-90} r={50} fill="#f2c230" stroke={INK} strokeWidth={8} /><circle cx={-90} r={18} fill="#1b2133" />
    <path d="M -45 -14 L 110 -14 L 110 14 L 90 14 L 90 34 L 70 34 L 70 14 L 40 14 L 40 30 L 20 30 L 20 14 L -45 14 Z" fill="#f2c230" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
  </g>
);

/** city street at a crossing: buildings, road with zebra stripes, a signal pole with a push-button box */
export const Street: React.FC = () => (
  <CachedSvg cacheKey="street" x={-400} y={-300} w={1880} h={2400}>
    <rect x={-400} y={-300} width={1880} height={2400} fill="#cfe9f7" />
    {[[-380, 200, 300, "#c98a6a"], [-60, 60, 260, "#8fa3b8"], [220, 260, 240, "#d9b77a"], [480, 0, 300, "#a3896a"], [800, 160, 280, "#7f93a8"], [1100, 80, 300, "#c98a6a"]].map(([bx, by, bw, c], i) => <g key={i}>
      <rect x={bx as number} y={by as number} width={bw as number} height={1300 - (by as number)} fill={c as string} stroke={INK} strokeWidth={7} />
      {Array.from({ length: Math.floor((1240 - (by as number)) / 110) }, (_, r) => [0, 1, 2].map((cc) => <rect key={`${r}-${cc}`} x={(bx as number) + 30 + cc * ((bw as number) - 60) / 3} y={(by as number) + 40 + r * 110} width={((bw as number) - 120) / 3} height={60} fill="#e9f6ff" stroke={INK} strokeWidth={4} />))}
    </g>)}
    <rect x={-400} y={1300} width={1880} height={120} fill="#c9c3b8" stroke={INK} strokeWidth={6} />
    <rect x={-400} y={1420} width={1880} height={700} fill="#4a4f5a" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-380 + i * 160} y={1470} width={90} height={500} fill="#f2f2ee" opacity={0.9} />)}
  </CachedSvg>
);

/** crosswalk signal pole with a push-button box; `walk` lights the walking man */
export const PushPole: React.FC<{ x: number; y: number; walk?: boolean; press?: number }> = ({ x, y, walk = false, press = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-16} y={-1100} width={32} height={1100} fill="#5a6270" stroke={INK} strokeWidth={6} />
    <rect x={-80} y={-1100} width={160} height={200} rx={14} fill="#2a2f3a" stroke={INK} strokeWidth={7} />
    <circle cx={0} cy={-1000} r={60} fill={walk ? "#f2f2ee" : "#e8443a"} opacity={0.9} />
    <rect x={-70} y={-640} width={140} height={190} rx={16} fill="#f2c230" stroke={INK} strokeWidth={7} />
    <circle cx={0} cy={-545 + press * 4} r={42} fill="#c9ccd2" stroke={INK} strokeWidth={6} />
    <path d="M -30 -600 L 30 -600" stroke={INK} strokeWidth={6} />
  </g>
);
