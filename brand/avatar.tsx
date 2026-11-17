import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Person, INK } from "/home/user/shorts/library/characters25/person";
import { LAB, SKIN, HAIR } from "/home/user/shorts/library/style/channel";
import type { Look } from "/home/user/shorts/library/characters25/person";

const S = 1024;
const MASCOT: Look = { skin: SKIN.tan, hair: HAIR.black, hairStyle: "curly", jersey: "#f2c230", jersey2: "#c99a12", shorts: "#2d3a5a", socks: "#2d3a5a" };

const Bulb: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 8 }, (_, i) => <path key={i} transform={`rotate(${i * 45})`} d="M 0 -150 L 0 -190" stroke="#ffe27a" strokeWidth={14} strokeLinecap="round" />)}
    <path d="M -70 0 C -70 -90 70 -90 70 0 C 70 40 40 55 35 90 L -35 90 C -40 55 -70 40 -70 0 Z" fill="#ffd84a" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <path d="M -30 0 Q 0 -30 30 0" stroke="#fff6c8" strokeWidth={10} fill="none" strokeLinecap="round" />
    <rect x={-38} y={90} width={76} height={20} rx={6} fill="#9aa6b2" stroke={INK} strokeWidth={8} />
    <rect x={-32} y={110} width={64} height={18} rx={6} fill="#9aa6b2" stroke={INK} strokeWidth={8} />
  </g>
);

const AvatarA: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
    <defs><radialGradient id="g" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#24346b" /><stop offset="1" stopColor={LAB.bg} /></radialGradient></defs>
    <rect width={S} height={S} fill="url(#g)" />
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M ${i * 80} 0 L ${i * 80} ${S} M 0 ${i * 80} L ${S} ${i * 80}`} stroke={LAB.grid} strokeWidth={3} />)}
    <circle cx={S / 2} cy={S / 2} r={470} fill="none" stroke={LAB.gold} strokeWidth={18} />
    <Person x={330} y={1500} scale={3.1} facing={1} look={MASCOT} pose={{ armL: [14, -8], armR: [150, -40], legL: [6, 0], legR: [6, 0], headTilt: 6 }} expr="smirk" shadow={0} />
    <Bulb x={745} y={300} s={0.82} />
  </svg>
);

const AvatarB: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
    <rect width={S} height={S} fill={LAB.gold} />
    <circle cx={S / 2} cy={S / 2} r={430} fill={LAB.bg} stroke={INK} strokeWidth={16} />
    <Bulb x={S / 2} y={430} s={1.6} />
    <text x={S / 2} y={830} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={150} fill="#f6efe0" letterSpacing={4}>TLE</text>
  </svg>
);

for (const [name, C] of [["avatarA", AvatarA], ["avatarB", AvatarB]] as const) {
  // eslint-disable-next-line
  (globalThis as any).__out = (globalThis as any).__out || {};
  (globalThis as any).__out[name] = renderToStaticMarkup(<C />);
}
console.log(JSON.stringify((globalThis as any).__out));
