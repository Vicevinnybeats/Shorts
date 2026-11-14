// Library (2.5D): a bright supermarket seen side-on as stacked checkout lanes (reads well in 9:16): shelf wall with
// products (cached image), tiled floor, tills with conveyor + lane light + card terminal, carts, coupon, wall clock.
import React from "react";
import { INK } from "../characters25/person";
import { CachedSvg } from "../../src/engine25/cached";

export const SHOP = { wall: "#f4efe2", wall2: "#e8e0cc", floor: "#dfe6ea", floor2: "#cfd8de", shelf: "#9aa6b2", till: "#3b6fd6", tillTop: "#e9edf2", belt: "#2b2f3a" };
const PRODUCT = ["#e8443a", "#f2c230", "#2fbf71", "#2d6fd8", "#ff7a2f", "#7c4dd6", "#f6f1e7", "#d9467a", "#3fb8c9"];

/** Shelf wall with rows of product boxes. Static: drawn once into a cached image. */
export const ShelfWall: React.FC<{ y: number; h: number; seed?: number; x?: number; w?: number }> = ({ y, h, seed = 1, x = -300, w = 1680 }) => (
  <CachedSvg cacheKey={`shelf-${y}-${h}-${seed}-${x}-${w}`} x={x} y={y} w={w} h={h}>
    <rect x={x} y={y} width={w} height={h} fill={SHOP.wall} />
    {Array.from({ length: Math.floor(h / 110) }, (_, row) => {
      const ry = y + 30 + row * 110;
      let s = seed * 131 + row * 17;
      const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const items: React.ReactElement[] = [];
      for (let cx = x + 10; cx < x + w - 40;) {
        const bw = 26 + r() * 34, bh = 40 + r() * 38, c = PRODUCT[Math.floor(r() * PRODUCT.length)];
        items.push(<g key={cx}><rect x={cx} y={ry + 80 - bh} width={bw} height={bh} rx={4} fill={c} stroke={INK} strokeWidth={3} />
          <rect x={cx + 4} y={ry + 80 - bh * 0.7} width={bw - 8} height={bh * 0.25} fill="#ffffff" opacity={0.55} /></g>);
        cx += bw + 4 + r() * 6;
      }
      return <g key={row}>{items}<rect x={x} y={ry + 80} width={w} height={14} fill={SHOP.shelf} stroke={INK} strokeWidth={3} /></g>;
    })}
  </CachedSvg>
);

export const Floor: React.FC<{ y: number; h?: number }> = ({ y, h = 600 }) => (
  <g>
    <rect x={-400} y={y} width={1880} height={h} fill={SHOP.floor} />
    {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M ${-400 + i * 80} ${y} L ${-400 + i * 80 - 40} ${y + h}`} stroke={SHOP.floor2} strokeWidth={4} />)}
    {Array.from({ length: Math.ceil(h / 70) }, (_, j) => <path key={"h" + j} d={`M -400 ${y + j * 70 + 30} L 1480 ${y + j * 70 + 30}`} stroke={SHOP.floor2} strokeWidth={3} />)}
  </g>
);

/** Checkout till seen from the side: counter + moving belt + register + lane light pole. */
export const Till: React.FC<{ x: number; y: number; n: number; f: number; moving: boolean; light?: "on" | "blink" | "off"; scale?: number }> = ({ x, y, n, f, moving, light = "on", scale = 1 }) => {
  const lamp = light === "on" || (light === "blink" && Math.floor(f / 6) % 2 === 0);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-20} y={-410} width={14} height={300} fill="#8892a0" stroke={INK} strokeWidth={4} />
      <rect x={-62} y={-470} width={96} height={70} rx={14} fill={lamp ? (light === "blink" ? "#ff5a4a" : "#ffd84a") : "#6b6f7a"} stroke={INK} strokeWidth={6} />
      <text x={-14} y={-421} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={44} fill={INK}>{n}</text>
      <rect x={0} y={-150} width={330} height={150} fill={SHOP.till} stroke={INK} strokeWidth={6} />
      <rect x={0} y={-168} width={330} height={26} fill={SHOP.belt} stroke={INK} strokeWidth={5} />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={6 + ((i * 38 + (moving ? f * 4 : 0)) % 320)} y={-163} width={6} height={16} fill="#555b6a" />)}
      <rect x={-6} y={-262} width={96} height={100} rx={8} fill="#1f2433" stroke={INK} strokeWidth={6} />
      <rect x={6} y={-250} width={72} height={46} rx={4} fill="#7fe0b0" />
    </g>
  );
};

export const Cart: React.FC<{ x: number; y: number; scale?: number; seed?: number }> = ({ x, y, scale = 1, seed = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-70 + i * 22 + (seed % 3) * 4} y={-150 - ((i * seed) % 3) * 12} width={20} height={34} rx={3} fill={PRODUCT[(i + seed) % PRODUCT.length]} stroke={INK} strokeWidth={3} />)}
    <path d="M -80 -120 L 80 -120 L 66 -50 L -66 -50 Z" fill="#cfd6de" fillOpacity={0.55} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[-40, 0, 40].map((dx) => <path key={dx} d={`M ${dx} -120 L ${dx * 0.85} -50`} stroke={INK} strokeWidth={3} />)}
    <path d="M 80 -120 L 110 -150 M -66 -50 L -60 -18 L 66 -18 L 66 -50" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
    <circle cx={-48} cy={-8} r={11} fill={INK} /><circle cx={48} cy={-8} r={11} fill={INK} />
  </g>
);

export const Coupon: React.FC<{ x: number; y: number; scale?: number; rot?: number }> = ({ x, y, scale = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <rect x={-110} y={-60} width={220} height={120} rx={10} fill="#fff6cf" stroke={INK} strokeWidth={6} strokeDasharray="14 8" />
    <text x={0} y={18} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={54} fill="#e8443a">-10¢</text>
  </g>
);

export const Terminal: React.FC<{ x: number; y: number; scale?: number; declined: boolean }> = ({ x, y, scale = 1, declined }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-90} y={-160} width={180} height={300} rx={26} fill="#2a2f3d" stroke={INK} strokeWidth={8} />
    <rect x={-66} y={-130} width={132} height={96} rx={8} fill={declined ? "#ff5a4a" : "#7fe0b0"} />
    <text x={0} y={-72} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={26} fill="#fff">{declined ? "DECLINED" : "OK"}</text>
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-60 + (i % 3) * 44} y={-10 + Math.floor(i / 3) * 40} width={32} height={28} rx={6} fill="#4b5266" />)}
  </g>
);

/** Round wall clock (this episode's clock motif); `minutes` drives the hands. */
export const WallClock: React.FC<{ x: number; y: number; r: number; minutes: number }> = ({ x, y, r, minutes }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#ffffff" stroke={INK} strokeWidth={r * 0.1} />
    {Array.from({ length: 12 }, (_, i) => <path key={i} transform={`rotate(${i * 30})`} d={`M 0 ${-r * 0.82} L 0 ${-r * 0.68}`} stroke={INK} strokeWidth={r * 0.05} />)}
    <path transform={`rotate(${(minutes / 60) * 30})`} d={`M 0 0 L 0 ${-r * 0.48}`} stroke={INK} strokeWidth={r * 0.08} strokeLinecap="round" />
    <path transform={`rotate(${(minutes % 60) * 6})`} d={`M 0 0 L 0 ${-r * 0.72}`} stroke="#e8443a" strokeWidth={r * 0.05} strokeLinecap="round" />
    <circle r={r * 0.07} fill={INK} />
  </g>
);

/** Ceiling: strip lights (the store's key light). */
export const Ceiling: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <rect x={-400} y={y - 300} width={1880} height={300} fill="#e9e4d6" />
    {[60, 400, 740, 1080].map((x) => <g key={x}><rect x={x - 130} y={y - 40} width={260} height={26} rx={8} fill="#fffef4" stroke={INK} strokeWidth={4} /><rect x={x - 200} y={y - 14} width={400} height={60} fill="url(#stripGlow)" /></g>)}
  </g>
);
export const ShopDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs><linearGradient id="stripGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffbe0" stopOpacity="0.55" /><stop offset="1" stopColor="#fffbe0" stopOpacity="0" /></linearGradient></defs>
  </svg>
);
