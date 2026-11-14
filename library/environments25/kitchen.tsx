// Library (2.5D): a cosy kitchen at night (warm pendant lamp, dark window, fridge, cabinets), a wooden table seen
// side-on, an open pizza box with the last slice, a flipping coin and a close-up hand. Warm, unlike the bright shop.
import React from "react";
import { INK } from "../characters25/person";
import { CachedSvg } from "../../src/engine25/cached";

export const KITCHEN = { wall: "#e7b98a", wall2: "#d9a576", tile: "#f4e6cf", cab: "#6b4636", cab2: "#5a3a2c", counter: "#d8d0c4",
  wood: "#a8693e", wood2: "#8a5230", night: "#1b2348", lamp: "#ffd98a", floor: "#7a5240" };

/** Back wall: window with night sky + moon, upper/lower cabinets, tiled splashback, fridge. Static -> cached image. */
export const KitchenWall: React.FC<{ y?: number; h?: number }> = ({ y = 0, h = 1500 }) => (
  <CachedSvg cacheKey={`kitchen-wall-${y}-${h}`} x={-300} y={y} w={1680} h={h}>
    <rect x={-300} y={y} width={1680} height={h} fill={KITCHEN.wall} />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M -300 ${y + 120 + i * 150} L 1380 ${y + 120 + i * 150}`} stroke={KITCHEN.wall2} strokeWidth={3} opacity={0.5} />)}
    {/* window */}
    <rect x={300} y={y + 260} width={480} height={420} rx={10} fill={KITCHEN.night} stroke={INK} strokeWidth={10} />
    {[[360, 330], [470, 300], [700, 360], [640, 450], [400, 470], [560, 560]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={y + sy} r={4 + (i % 3)} fill="#fff6d6" />)}
    <circle cx={660} cy={y + 360} r={56} fill="#fff1c2" /><circle cx={684} cy={y + 344} r={52} fill={KITCHEN.night} />
    <path d={`M 540 ${y + 260} L 540 ${y + 680} M 300 ${y + 470} L 780 ${y + 470}`} stroke={INK} strokeWidth={8} />
    <rect x={280} y={y + 670} width={520} height={26} rx={6} fill="#efe6d8" stroke={INK} strokeWidth={6} />
    {/* upper cabinets */}
    {[-260, -60, 860, 1060].map((cx) => <g key={cx}><rect x={cx} y={y + 120} width={190} height={300} rx={8} fill={KITCHEN.cab} stroke={INK} strokeWidth={7} />
      <circle cx={cx + (cx < 540 ? 160 : 30)} cy={y + 380} r={9} fill="#e8c46a" stroke={INK} strokeWidth={3} /></g>)}
    {/* splashback tiles + counter + lower cabinets */}
    <rect x={-300} y={y + 760} width={1680} height={190} fill={KITCHEN.tile} />
    {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M ${-300 + i * 80} ${y + 760} L ${-300 + i * 80} ${y + 950}`} stroke="#e1cfb0" strokeWidth={3} />)}
    <path d={`M -300 ${y + 855} L 1380 ${y + 855}`} stroke="#e1cfb0" strokeWidth={3} />
    <rect x={-300} y={y + 940} width={1680} height={40} fill={KITCHEN.counter} stroke={INK} strokeWidth={7} />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-300 + i * 220} y={y + 980} width={210} height={h - 980} fill={i % 2 ? KITCHEN.cab : KITCHEN.cab2} stroke={INK} strokeWidth={6} />)}
    {/* fridge (right) with magnets */}
    <rect x={1000} y={y + 80} width={330} height={h - 80} rx={24} fill="#eef1f4" stroke={INK} strokeWidth={8} />
    <path d={`M 1000 ${y + 520} L 1330 ${y + 520}`} stroke={INK} strokeWidth={6} />
    <rect x={1030} y={y + 400} width={14} height={90} rx={6} fill="#9aa6b2" /><rect x={1030} y={y + 560} width={14} height={120} rx={6} fill="#9aa6b2" />
    {[["#e8443a", 1120, 220], ["#2fbf71", 1200, 280], ["#f2c230", 1150, 640]].map(([c, mx, my], i) => <circle key={i} cx={mx as number} cy={y + (my as number)} r={18} fill={c as string} stroke={INK} strokeWidth={4} />)}
    <rect x={1180} y={y + 600} width={90} height={110} fill="#fff" stroke={INK} strokeWidth={4} transform={`rotate(6 1225 ${y + 655})`} />
  </CachedSvg>
);

/** Pendant lamp hanging over the table (the key light). `sway` in degrees. */
export const Pendant: React.FC<{ x: number; y: number; sway?: number }> = ({ x, y, sway = 0 }) => (
  <g transform={`rotate(${sway} ${x} -200)`}>
    <path d={`M ${x} -200 L ${x} ${y - 90}`} stroke={INK} strokeWidth={6} />
    <path d={`M ${x - 150} ${y} Q ${x} ${y - 190} ${x + 150} ${y} Z`} fill="#2f6f5e" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <ellipse cx={x} cy={y} rx={60} ry={22} fill="#fff4c8" />
  </g>
);

/** Table seen from the front: top edge at `y`, apron and legs below. */
export const Table: React.FC<{ y: number; x?: number; w?: number }> = ({ y, x = -200, w = 1480 }) => (
  <g>
    <rect x={x} y={y} width={w} height={46} rx={10} fill={KITCHEN.wood} stroke={INK} strokeWidth={8} />
    <rect x={x + 30} y={y + 46} width={w - 60} height={110} fill={KITCHEN.wood2} stroke={INK} strokeWidth={7} />
    {[x + 60, x + w - 120].map((lx) => <rect key={lx} x={lx} y={y + 150} width={60} height={600} fill={KITCHEN.wood2} stroke={INK} strokeWidth={7} />)}
    <path d={`M ${x + 20} ${y + 14} L ${x + w - 20} ${y + 14}`} stroke="#c98a58" strokeWidth={6} opacity={0.7} />
  </g>
);

/** One pizza slice (point toward +x). `bite` 0..1 removes the tip. */
export const Slice: React.FC<{ x: number; y: number; scale?: number; rot?: number }> = ({ x, y, scale = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <path d="M -110 -70 Q -130 0 -110 70 L 130 0 Z" fill="#f6c85a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -110 -70 Q -135 0 -110 70 Q -150 0 -110 -70 Z" fill="#c9823c" stroke={INK} strokeWidth={6} />
    <path d="M -128 -62 Q -150 0 -128 62" stroke="#c9823c" strokeWidth={26} fill="none" strokeLinecap="round" />
    {[[-50, -22], [10, 18], [-60, 34], [50, -4]].map(([px, py], i) => <circle key={i} cx={px} cy={py} r={17} fill="#d8433a" stroke={INK} strokeWidth={4} />)}
  </g>
);

/** Open pizza box seen from the front-top: lid standing behind, base tray with crumbs and the last slice. */
export const PizzaBox: React.FC<{ x: number; y: number; scale?: number; slice?: boolean; steam?: number }> = ({ x, y, scale = 1, slice = true, steam = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -230 -40 L -200 -330 L 200 -330 L 230 -40 Z" fill="#e7cfa2" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <circle cx={0} cy={-190} r={70} fill="none" stroke="#c0392b" strokeWidth={10} />
    <path d="M -30 -190 L 30 -190 M 0 -220 L 0 -160" stroke="#c0392b" strokeWidth={10} strokeLinecap="round" />
    <path d="M -260 -40 L 260 -40 L 240 30 L -240 30 Z" fill="#f1dcb3" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <ellipse cx={0} cy={-6} rx={210} ry={26} fill="#d9b98a" opacity={0.6} />
    {[[-150, -10], [-90, 4], [120, -8], [160, 6], [60, 10]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={6} fill="#c9823c" />)}
    {slice && <Slice x={0} y={-14} scale={0.62} rot={-8} />}
    {steam > 0 && [-40, 10, 60].map((sx, i) => <path key={i} d={`M ${sx} -60 q 22 -40 0 -80 q -22 -40 0 -80`} stroke="#ffffff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={steam * (0.35 + 0.2 * i)} />)}
  </g>
);

/** A coin. `spin` = flip angle in degrees (0 = heads facing the viewer / up), `tilt` = rotation of the coin in the image
 *  plane (the wobble), r = radius. Heads shows a profile head, tails a big "1". */
export const Coin: React.FC<{ x: number; y: number; r: number; spin?: number; tilt?: number; glow?: number }> = ({ x, y, r, spin = 0, tilt = 0, glow = 0 }) => {
  const c = Math.cos((spin * Math.PI) / 180);
  const ry = Math.max(0.06, Math.abs(c)) * r;
  const heads = c >= 0, th = r * 0.14;
  const face = heads ? "#f2c230" : "#e0b020";
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      {glow > 0 && <circle r={r * 1.6} fill="#fff1b0" opacity={glow * 0.35} />}
      <ellipse cy={th * 0.6} rx={r} ry={ry} fill="#b07d10" stroke={INK} strokeWidth={r * 0.06} />
      <rect x={-r} y={0} width={r * 2} height={th * 0.6} fill="#b07d10" />
      <ellipse rx={r} ry={ry} fill={face} stroke={INK} strokeWidth={r * 0.06} />
      <ellipse rx={r * 0.8} ry={ry * 0.8} fill="none" stroke="#c99a12" strokeWidth={r * 0.05} />
      <g transform={`scale(1 ${Math.max(0.06, Math.abs(c))})`}>
        {heads ? (
          <path d={`M ${-r * 0.1} ${r * 0.5} L ${-r * 0.12} ${r * 0.22} C ${-r * 0.4} ${r * 0.1} ${-r * 0.38} ${-r * 0.4} ${-r * 0.02} ${-r * 0.48} C ${r * 0.3} ${-r * 0.5} ${r * 0.36} ${-r * 0.18} ${r * 0.24} ${-r * 0.06} L ${r * 0.34} ${r * 0.06} L ${r * 0.2} ${r * 0.12} C ${r * 0.22} ${r * 0.3} ${r * 0.12} ${r * 0.34} ${r * 0.08} ${r * 0.5} Z`} fill="#c99a12" stroke="#8a6a0a" strokeWidth={r * 0.03} />
        ) : (
          <text y={r * 0.34} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={r * 1.0} fill="#b8890e">1</text>
        )}
      </g>
      <ellipse cx={-r * 0.35} cy={-ry * 0.45} rx={r * 0.22} ry={ry * 0.12} fill="#fff6c8" opacity={0.7} />
    </g>
  );
};

/** Close-up hand (a fist, thumb on top) holding a coin flat on the curled index finger, or an open palm. */
export const Hand: React.FC<{ x: number; y: number; scale?: number; skin: string; open?: boolean; flip?: boolean; children?: React.ReactNode }> = ({ x, y, scale = 1, skin, open = false, flip = false, children }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * scale} ${scale})`}>
    <path d="M -420 120 L -160 40 L -150 210 L -420 260 Z" fill="#3b6fd6" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    {open ? (<>
      <path d="M -170 40 C -40 -10 120 -10 210 30 C 250 60 240 110 200 120 L -160 200 Z" fill={skin} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${120 + i * 10} ${10 + i * 34} C ${250 + i * 6} ${0 + i * 34} ${290} ${40 + i * 34} ${200} ${54 + i * 34}`} fill={skin} stroke={INK} strokeWidth={9} />)}
    </>) : (<>
      <path d="M -170 40 C -60 -40 110 -30 170 20 C 200 60 190 170 140 200 L -160 210 Z" fill={skin} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${60 + i * 30} ${70 + i * 42} C ${150} ${60 + i * 42} ${180} ${100 + i * 42} ${100} ${112 + i * 42}`} fill="none" stroke={INK} strokeWidth={7} />)}
      <path d="M -40 10 C 20 -40 120 -60 170 -40 C 200 -28 190 4 160 6 C 110 8 40 30 -10 50 Z" fill={skin} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    </>)}
    {children}
  </g>
);
