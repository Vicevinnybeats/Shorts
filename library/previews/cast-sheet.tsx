import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Person } from "../characters25/person";
import { LAB, CAST } from "../style/channel";
const keys = Object.keys(CAST);
const COLS = 8, CW = 320, RH = 560, W = COLS * CW, H = Math.ceil(keys.length / COLS) * RH + 40;
const Sheet: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <rect width={W} height={H} fill={LAB.bg} />
    {keys.map((k, i) => { const x = (i % COLS) * CW + CW / 2, y = Math.floor(i / COLS) * RH + 470;
      return <g key={k}><Person x={x} y={y} scale={0.62} facing={1} look={CAST[k]} pose={{ armL: [14, -6], armR: [14, -6], legL: [6, 0], legR: [6, 0] }} expr="smile" shadow={0} />
        <text x={x} y={y + 60} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#f6efe0">{k}</text></g>; })}
  </svg>);
console.log(JSON.stringify({ cast: renderToStaticMarkup(<Sheet />) }));
