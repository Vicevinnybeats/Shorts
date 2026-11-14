// Library (2.5D): a night football stadium as depth layers (sky, stands + crowd, floodlights, pitch, goal, ball),
// a stadium clock (the channel's clock motif) and a chalk tactics board for the explain shots.
// Painted look: flat fills + one shade step + plum ink outlines, colours faded toward the haze with distance.
import React from "react";
import { INK } from "../characters25/person";

export const NIGHT = { sky0: "#060b24", sky1: "#1a2a63", haze: "#22336e", grass: "#2f9a4c", grass2: "#2a8a44", line: "#eef3e6" };

export const Sky: React.FC<{ f: number; top?: string; bottom?: string }> = ({ f, top = NIGHT.sky0, bottom = NIGHT.sky1 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient></defs>
    <rect width={1080} height={1920} fill="url(#sky)" />
    {Array.from({ length: 40 }, (_, i) => {
      const x = (i * 263) % 1080, y = (i * 137) % 700, tw = 0.5 + 0.5 * Math.sin(f * 0.1 + i);
      return <circle key={i} cx={x} cy={y} r={1.5 + (i % 3)} fill="#fff" opacity={0.25 + tw * 0.4} />;
    })}
  </svg>
);

/** Floodlight tower: a lattice pole with a bright lamp grid and a soft halo (halo is an overlay, no blur filter). */
export const Floodlight: React.FC<{ x: number; y: number; scale?: number; on?: number }> = ({ x, y, scale = 1, on = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle cx={0} cy={0} r={210} fill="url(#halo)" opacity={0.9 * on} />
    <path d="M -10 40 L -30 900 L 30 900 L 10 40 Z" fill="#1a2140" stroke={INK} strokeWidth={4} />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${-28 + i * 0} ${80 + i * 70} L ${26} ${115 + i * 70}`} stroke="#2c355e" strokeWidth={4} />)}
    <rect x={-95} y={-60} width={190} height={110} rx={10} fill="#2a3158" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 12 }, (_, i) => (
      <circle key={i} cx={-66 + (i % 4) * 44} cy={-32 + Math.floor(i / 4) * 32} r={15} fill={on > 0.5 ? "#fffbe8" : "#555a70"} stroke={INK} strokeWidth={3} />
    ))}
  </g>
);
export const HaloDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <radialGradient id="halo"><stop offset="0" stopColor="#fff6d8" stopOpacity="0.9" /><stop offset="0.35" stopColor="#ffe7a8" stopOpacity="0.35" /><stop offset="1" stopColor="#ffe7a8" stopOpacity="0" /></radialGradient>
      <radialGradient id="ballShade" cx="0.35" cy="0.3"><stop offset="0" stopColor="#ffffff" /><stop offset="0.7" stopColor="#e9e6dc" /><stop offset="1" stopColor="#b9b4a6" /></radialGradient>
    </defs>
  </svg>
);

/** Stands: tiers with a roof edge; the crowd is drawn on top by the caller. */
export const Stands: React.FC<{ y: number; h: number; color?: string }> = ({ y, h, color = "#141d40" }) => (
  <g>
    <rect x={-400} y={y} width={1880} height={h} fill={color} />
    {Array.from({ length: Math.floor(h / 70) }, (_, i) => <rect key={i} x={-400} y={y + i * 70 + 60} width={1880} height={6} fill="#0c1230" />)}
    <path d={`M -400 ${y - 40} L 1480 ${y - 40} L 1480 ${y + 8} L -400 ${y + 8} Z`} fill="#0b1026" stroke={INK} strokeWidth={6} />
    <rect x={-400} y={y + h - 26} width={1880} height={26} fill="#e8443a" />
    <text x={540} y={y + h - 5} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={22} fill="#fff" letterSpacing={12}>FINAL · FINAL · FINAL · FINAL</text>
  </g>
);

/** Grass in perspective from a camera behind the goal or behind the striker. horizonY = where the far touchline is. */
export const Pitch: React.FC<{ horizonY: number; bottomY?: number; stripes?: number; vanishX?: number }> = ({ horizonY, bottomY = 2100, stripes = 9, vanishX = 540 }) => {
  const rows: React.ReactElement[] = [];
  for (let i = 0; i < stripes; i++) {
    // stripes get taller toward the camera (perspective): position by 1/z
    const z0 = 1 + i * 0.9, z1 = 1 + (i + 1) * 0.9;
    const y0 = horizonY + (bottomY - horizonY) * (1 - 1 / z0) * 1.12, y1 = horizonY + (bottomY - horizonY) * (1 - 1 / z1) * 1.12;
    rows.push(<rect key={i} x={-600} y={y0} width={2280} height={y1 - y0 + 1} fill={i % 2 ? NIGHT.grass : NIGHT.grass2} />);
  }
  return (
    <g>
      <rect x={-600} y={horizonY} width={2280} height={bottomY - horizonY + 400} fill={NIGHT.grass2} />
      {rows}
      <path d={`M -600 ${horizonY} L 1680 ${horizonY}`} stroke={NIGHT.line} strokeWidth={4} opacity={0.6} />
      <path d={`M ${vanishX - 900} ${bottomY + 300} L ${vanishX - 160} ${horizonY} M ${vanishX + 900} ${bottomY + 300} L ${vanishX + 160} ${horizonY}`} stroke={NIGHT.line} strokeWidth={6} opacity={0.5} />
    </g>
  );
};

/** Goal seen from the front (camera behind the striker): posts, crossbar, net with perspective. w = mouth width. */
export const GoalFront: React.FC<{ cx: number; baseY: number; w: number; netShake?: number }> = ({ cx, baseY, w, netShake = 0 }) => {
  const h = w * (2.44 / 7.32), x0 = cx - w / 2, x1 = cx + w / 2, top = baseY - h, d = w * 0.12;
  const net: React.ReactElement[] = [];
  for (let i = 0; i <= 18; i++) { const x = x0 + d + (w - 2 * d) * (i / 18); net.push(<path key={"v" + i} d={`M ${x} ${top + d * 0.6} Q ${x + Math.sin(i + netShake) * netShake * 6} ${(top + baseY) / 2} ${x} ${baseY - 4}`} stroke="#d9dde6" strokeOpacity={0.5} strokeWidth={2} fill="none" />); }
  for (let j = 0; j <= 8; j++) { const y = top + d * 0.6 + (baseY - top - d * 0.6) * (j / 8); net.push(<path key={"h" + j} d={`M ${x0 + d} ${y} L ${x1 - d} ${y}`} stroke="#d9dde6" strokeOpacity={0.45} strokeWidth={2} />); }
  return (
    <g>
      <rect x={x0 + d} y={top + d * 0.6} width={w - 2 * d} height={baseY - top - d * 0.6} fill="#0e1636" opacity={0.55} />
      {net}
      <path d={`M ${x0} ${baseY} L ${x0} ${top} L ${x1} ${top} L ${x1} ${baseY}`} stroke={INK} strokeWidth={w * 0.024 + 8} fill="none" strokeLinejoin="round" />
      <path d={`M ${x0} ${baseY} L ${x0} ${top} L ${x1} ${top} L ${x1} ${baseY}`} stroke="#f7f7f2" strokeWidth={w * 0.024} fill="none" strokeLinejoin="round" />
    </g>
  );
};

export const Ball: React.FC<{ x: number; y: number; r: number; spin?: number; shadowY?: number }> = ({ x, y, r, spin = 0, shadowY }) => (
  <g>
    {shadowY !== undefined && <ellipse cx={x} cy={shadowY} rx={r * 0.9} ry={r * 0.22} fill="#05040c" opacity={0.35} />}
    <g transform={`translate(${x} ${y}) rotate(${spin})`}>
      <circle r={r} fill="url(#ballShade)" stroke={INK} strokeWidth={Math.max(3, r * 0.08)} />
      <path d={`M 0 ${-r * 0.32} L ${r * 0.3} ${-r * 0.1} L ${r * 0.19} ${r * 0.26} L ${-r * 0.19} ${r * 0.26} L ${-r * 0.3} ${-r * 0.1} Z`} fill={INK} />
      {[0, 72, 144, 216, 288].map((a) => <path key={a} transform={`rotate(${a})`} d={`M 0 ${-r * 0.32} L 0 ${-r * 0.75}`} stroke={INK} strokeWidth={r * 0.06} />)}
    </g>
  </g>
);

/** Stadium clock (the channel's clock motif): minutes:seconds in a lit box. */
export const StadiumClock: React.FC<{ x: number; y: number; seconds: number; scale?: number; glow?: number }> = ({ x, y, seconds, scale = 1, glow = 1 }) => {
  const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-250} y={-95} width={500} height={190} rx={18} fill="#0b0f1f" stroke={INK} strokeWidth={10} />
      <rect x={-232} y={-77} width={464} height={154} rx={10} fill="#141a33" />
      <text x={0} y={42} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={128} fill="#ffcf3a" opacity={0.25 + 0.75 * glow}>
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </text>
    </g>
  );
};

/** Chalk tactics board with a goal and dots for kicks (left / centre / right). */
export const TacticsBoard: React.FC<{ x: number; y: number; w: number; children?: React.ReactNode }> = ({ x, y, w, children }) => {
  const h = w * 1.25;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 - 22} y={-22} width={w + 44} height={h + 44} rx={20} fill="#8a5a33" stroke={INK} strokeWidth={10} />
      <rect x={-w / 2} y={0} width={w} height={h} rx={8} fill="#24443a" />
      {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-w / 2 + ((i * 97) % w)} ${(i * 53) % h} l ${30 + (i % 5) * 9} ${4}`} stroke="#ffffff" strokeOpacity={0.05} strokeWidth={6} />)}
      {children}
    </g>
  );
};
export const chalk = { stroke: "#f2f5ea", fill: "#f2f5ea" };
