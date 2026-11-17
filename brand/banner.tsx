import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Person, INK, POSES } from "/home/user/shorts/library/characters25/person";
import type { Look, Pose } from "/home/user/shorts/library/characters25/person";
import { LAB, SKIN, HAIR, CAST } from "/home/user/shorts/library/style/channel";
import { Coin } from "/home/user/shorts/library/environments25/kitchen";
import { Toast } from "/home/user/shorts/library/environments25/cafe";
import { Feather } from "/home/user/shorts/library/environments25/livingroom";
import { Paddle } from "/home/user/shorts/library/environments25/auction";

const W = 2560, H = 1440;
const MASCOT: Look = { skin: SKIN.tan, hair: HAIR.black, hairStyle: "curly", jersey: "#f2c230", jersey2: "#c99a12", shorts: "#2d3a5a", socks: "#2d3a5a" };
const UP: Pose = { armL: [150, -20], armR: [150, -20], legL: [10, 0], legR: [10, 0] };
const WAVE: Pose = { armL: [14, -8], armR: [150, -40], legL: [6, 0], legR: [6, 0] };

const Bulb: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 8 }, (_, i) => <path key={i} transform={`rotate(${i * 45})`} d="M 0 -150 L 0 -190" stroke="#ffe27a" strokeWidth={14} strokeLinecap="round" />)}
    <path d="M -70 0 C -70 -90 70 -90 70 0 C 70 40 40 55 35 90 L -35 90 C -40 55 -70 40 -70 0 Z" fill="#ffd84a" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <path d="M -30 0 Q 0 -30 30 0" stroke="#fff6c8" strokeWidth={10} fill="none" strokeLinecap="round" />
    <rect x={-38} y={90} width={76} height={20} rx={6} fill="#9aa6b2" stroke={INK} strokeWidth={8} />
    <rect x={-32} y={110} width={64} height={18} rx={6} fill="#9aa6b2" stroke={INK} strokeWidth={8} />
  </g>
);

const GROUND = 1440;
const Banner: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <radialGradient id="spot" cx="50%" cy="50%" r="55%"><stop offset="0" stopColor="#2a3d7a" /><stop offset="1" stopColor={LAB.bg} /></radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#spot)" />
    {Array.from({ length: 33 }, (_, i) => <path key={"v" + i} d={`M ${i * 80} 0 L ${i * 80} ${H}`} stroke={LAB.grid} strokeWidth={3} />)}
    {Array.from({ length: 19 }, (_, i) => <path key={"h" + i} d={`M 0 ${i * 80} L ${W} ${i * 80}`} stroke={LAB.grid} strokeWidth={3} />)}
    {/* wide-screen extras (outside the mobile safe area): cast from the episodes with their props */}
    <Person x={170} y={1230} scale={1.25} facing={1} look={CAST.zoe} pose={UP} expr="laugh" shadow={0} />
    <Coin x={170} y={500} r={70} spin={30} tilt={-15} />
    <Person x={380} y={1300} scale={1.1} facing={1} look={CAST.omar} pose={WAVE} expr="shock" shadow={0} />
    <g transform="rotate(-20 470 640)"><Toast x={470} y={640} scale={1.4} rot={150} /></g>
    <Person x={2190} y={1300} scale={1.1} facing={-1} look={CAST.ben} pose={WAVE} expr="smile" shadow={0} />
    <Paddle x={2290} y={760} scale={1.1} number="7" />
    <Person x={2400} y={1230} scale={1.25} facing={-1} look={CAST.mila} pose={UP} expr="cheer" shadow={0} />
    <Feather x={2300} y={480} scale={0.75} rot={-30} />
    {/* mobile-safe area 1546 x 423 centred: x 507-2053, y 508-931 */}
    <g>
      <Person x={640} y={925} scale={0.85} facing={1} look={MASCOT} pose={WAVE} expr="smirk" shadow={0} />
      <Bulb x={756} y={572} s={0.42} />
      <text x={1530} y={705} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={126} fill="#f6efe0">The<tspan fill={LAB.gold}>Little</tspan>Epic</text>
      <text x={1530} y={782} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={31} fill={LAB.muted}>Everyday moments, decided by surprising science</text>
      <rect x={1220} y={815} width={620} height={76} rx={38} fill={LAB.gold} stroke={INK} strokeWidth={6} />
      <text x={1530} y={866} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={38} fill={INK}>NEW SHORT EVERY DAY</text>
    </g>
  </svg>
);
console.log(JSON.stringify({ banner: renderToStaticMarkup(<Banner />) }));
