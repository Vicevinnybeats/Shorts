// WHAT IF style kit (series "WHAT IF", 2026-11-21): dark cinematic explainer look. Very dark navy stages with a soft
// spotlight pool, vignette, starfield/haze; occasional bright daylight scenes for contrast; HUD pieces (live counter,
// comparison bars, chapter screen, A/B/C/D choice cards, phone with notifications) with thin cyan + gold accents.
// All SVG <g> elements in the 1080x1920 design space; gradients only (no CSS filters/blur), so CPU renders stay fast.
// Animation is driven by the `f` (frame) props; `at` = the frame the element starts entering. Rules: brain/style-whatif.md.
import React from "react";
import { interpolate, Easing } from "remotion";
import { Toy, ToyLook, ToyExpr, TOY_LOOKS, TOY_INK, tint } from "./toy";

export const WI = {
  bg0: "#04060d", bg1: "#0a1024", bg2: "#121c3a", panel: "#0c142c", panel2: "#17244a", line: "#2a3c6c",
  cyan: "#5fe3ff", gold: "#ffc94a", coral: "#ff6b6b", green: "#5ee08a", red: "#ff4d5e", violet: "#a98bff",
  text: "#eef3ff", muted: "#8fa0c8", ink: TOY_INK,
} as const;
export const WI_FONT = "CaptionSans, sans-serif";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const inE = (f: number, a: number, d: number) => interpolate(f, [a, a + d], [0, 1], { ...cl, easing: Easing.bezier(0.16, 1, 0.3, 1) });
const back = (f: number, a: number, d: number) => interpolate(f, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.8)) });
const rand = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** soft round glow (radial gradient), e.g. a TV light or a lamp */
export const Glow: React.FC<{ x: number; y: number; r: number; color: string; o?: number; ry?: number }> = ({ x, y, r, color, o = 0.5, ry }) => {
  const id = "wiGlow" + color.replace("#", "");
  return <g>
    <defs><radialGradient id={id}><stop offset="0" stopColor={color} stopOpacity={1} /><stop offset="0.45" stopColor={color} stopOpacity={0.35} /><stop offset="1" stopColor={color} stopOpacity={0} /></radialGradient></defs>
    <ellipse cx={x} cy={y} rx={r} ry={ry ?? r} fill={`url(#${id})`} opacity={o} />
  </g>;
};

/** screen-space vignette (draw last, on top of the stage) */
export const Vignette: React.FC<{ o?: number }> = ({ o = 0.75 }) => (
  <g>
    <defs><radialGradient id="wiVig" cx="0.5" cy="0.46" r="0.75"><stop offset="0.45" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={1} /></radialGradient></defs>
    <rect x={0} y={0} width={1080} height={1920} fill="url(#wiVig)" opacity={o} />
  </g>
);

/**
 * The dark stage: near-black navy gradient, a soft spotlight pool (spot.x/y on the floor, cone from above), slow haze,
 * twinkling starfield. floorY draws a faint floor horizon. Draw it inside a camera Layer (it overscans the frame).
 */
export const Stage: React.FC<{ f: number; spot?: { x: number; y: number; r?: number; color?: string } | null; haze?: number; stars?: number;
  floorY?: number; top?: string; bottom?: string }> = ({ f, spot = { x: 540, y: 1330 }, haze = 0.5, stars = 1, floorY, top = WI.bg0, bottom = WI.bg2 }) => {
  const sc = spot?.color ?? "#cfe6ff";
  return <g>
    <defs>
      <linearGradient id={"wiSky" + top.slice(1) + bottom.slice(1)} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="0.65" stopColor={tint(top, bottom, 0.6)} /><stop offset="1" stopColor={bottom} /></linearGradient>
      <linearGradient id="wiCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sc} stopOpacity={0} /><stop offset="1" stopColor={sc} stopOpacity={0.16} /></linearGradient>
    </defs>
    <rect x={-500} y={-500} width={2080} height={2920} fill={`url(#wiSky${top.slice(1)}${bottom.slice(1)})`} />
    {stars > 0 && Array.from({ length: 70 }, (_, i) => {
      const x = rand(i) * 1500 - 210, y = rand(i + 99) * (floorY ?? 1400) * 0.9 - 150;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(f * 0.05 + i * 1.7));
      return <circle key={i} cx={x} cy={y} r={1.2 + rand(i + 7) * 2.4} fill={i % 9 ? "#cfe0ff" : WI.gold} opacity={stars * tw * 0.7} />;
    })}
    {haze > 0 && [0, 1, 2].map((i) => <Glow key={i} x={540 + 380 * Math.sin(f * 0.006 + i * 2.1)} y={500 + i * 420 + 40 * Math.cos(f * 0.008 + i)} r={520} ry={260} color={i === 1 ? "#3a4f9a" : "#24346e"} o={haze * 0.55} />)}
    {floorY !== undefined && <>
      <rect x={-500} y={floorY} width={2080} height={1500} fill={WI.bg0} opacity={0.55} />
      <path d={`M -500 ${floorY} L 1580 ${floorY}`} stroke={WI.line} strokeWidth={3} opacity={0.6} />
    </>}
    {spot && <>
      <path d={`M ${spot.x - 90} -300 L ${spot.x + 90} -300 L ${spot.x + (spot.r ?? 380)} ${spot.y} L ${spot.x - (spot.r ?? 380)} ${spot.y} Z`} fill="url(#wiCone)" />
      <Glow x={spot.x} y={spot.y} r={spot.r ?? 380} ry={(spot.r ?? 380) * 0.22} color={sc} o={0.45} />
    </>}
  </g>;
};

/** bright daylight contrast scene: "city" skyline or "beach" (sky, sun, drifting clouds) */
export const Daylight: React.FC<{ f: number; kind?: "city" | "beach"; horizon?: number }> = ({ f, kind = "city", horizon = 1180 }) => (
  <g>
    <defs>
      <linearGradient id="wiDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4fa8ff" /><stop offset="0.7" stopColor="#bfe4ff" /><stop offset="1" stopColor="#ffe9c7" /></linearGradient>
      <linearGradient id="wiSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2bb6d6" /><stop offset="1" stopColor="#1a7fae" /></linearGradient>
      <linearGradient id="wiSand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe2a8" /><stop offset="1" stopColor="#f0c27a" /></linearGradient>
    </defs>
    <rect x={-500} y={-500} width={2080} height={2920} fill="url(#wiDay)" />
    <Glow x={820} y={360} r={260} color="#fff4c2" o={0.9} />
    <circle cx={820} cy={360} r={90} fill="#fff7d6" />
    {[0, 1, 2].map((i) => { const x = ((i * 520 + f * (0.6 + i * 0.25)) % 1700) - 300;
      return <g key={i} transform={`translate(${x} ${260 + i * 150})`} opacity={0.9}>
        <ellipse cx={0} cy={0} rx={110} ry={40} fill="#ffffff" /><ellipse cx={60} cy={-22} rx={70} ry={42} fill="#ffffff" /><ellipse cx={-60} cy={-10} rx={60} ry={32} fill="#ffffff" />
      </g>; })}
    {kind === "city"
      ? <g>
          {Array.from({ length: 12 }, (_, i) => { const w = 110 + rand(i) * 80, h = 220 + rand(i + 3) * 380, x = -260 + i * 140;
            return <g key={i}>
              <rect x={x} y={horizon - h} width={w} height={h + 900} fill={i % 2 ? "#8fa6d6" : "#a9bce4"} />
              {Array.from({ length: Math.floor(h / 60) }, (_, r) => [0, 1, 2].map((c) => <rect key={r * 3 + c} x={x + 18 + c * (w - 36) / 3} y={horizon - h + 26 + r * 60} width={(w - 60) / 3} height={26} rx={4} fill="#e8f2ff" opacity={0.7} />))}
            </g>; })}
          <rect x={-500} y={horizon} width={2080} height={1400} fill="#6f7f9f" />
          <rect x={-500} y={horizon} width={2080} height={20} fill="#c9d3e6" />
        </g>
      : <g>
          <rect x={-500} y={horizon - 160} width={2080} height={200} fill="url(#wiSea)" />
          {[0, 1, 2].map((i) => <path key={i} d={`M -500 ${horizon - 120 + i * 40} Q ${-200 + (f * 2) % 300} ${horizon - 130 + i * 40} 200 ${horizon - 120 + i * 40} T 900 ${horizon - 120 + i * 40} T 1600 ${horizon - 120 + i * 40}`} stroke="#bff3ff" strokeWidth={5} fill="none" opacity={0.6} />)}
          <path d={`M -500 ${horizon + 20} Q 540 ${horizon - 30} 1580 ${horizon + 20} L 1580 ${horizon + 1400} L -500 ${horizon + 1400} Z`} fill="url(#wiSand)" />
        </g>}
  </g>
);

// ---------------------------------------------------------------- HUD
/** glowing thin frame (cyan by default) around a rounded rect */
const Frame: React.FC<{ x: number; y: number; w: number; h: number; rx?: number; c?: string; fill?: string; o?: number }> = ({ x, y, w, h, rx = 26, c = WI.cyan, fill = WI.panel, o = 0.9 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} opacity={o} />
    <rect x={x} y={y} width={w} height={h} rx={rx} fill="none" stroke={c} strokeWidth={12} opacity={0.14} />
    <rect x={x} y={y} width={w} height={h} rx={rx} fill="none" stroke={c} strokeWidth={2.5} opacity={0.85} />
  </g>
);

/** fixed-cell digits (reads as monospace whatever the font) */
export const Digits: React.FC<{ x: number; y: number; text: string; size: number; color: string; cell?: number; anchor?: "start" | "middle" }> =
  ({ x, y, text, size, color, cell = size * 0.64, anchor = "start" }) => {
    const x0 = anchor === "middle" ? x - (text.length * cell) / 2 : x;
    return <g>{text.split("").map((ch, i) =>
      <text key={i} x={x0 + i * cell + cell / 2} y={y} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={size} fill={color}>{ch}</text>)}</g>;
  };

/**
 * Corner "live counter" card: small caps label + live dot, big fixed-cell digits (+ unit), optional tag pill (e.g. DAY 1).
 * (x, y) = top-left corner. value: a number (zero-padded to `digits`) or any string. Ticks when the caller changes value.
 */
export const LiveCounter: React.FC<{ x: number; y: number; label: string; value: number | string; tag?: string; f: number; at?: number;
  digits?: number; unit?: string; w?: number; accent?: string; o?: number; pop?: number }> =
  ({ x, y, label, value, tag, f, at = -99, digits = 3, unit, w = 400, accent = WI.cyan, o = 1, pop = 0 }) => {
    const p = inE(f, at, 12);
    if (p <= 0 || o <= 0) return null;
    const txt = typeof value === "number" ? String(Math.max(0, Math.floor(value))).padStart(digits, "0") : value;
    const live = (f % 30) < 18;
    const tagW = tag ? tag.length * 18 + 36 : 0;
    const s = 1 + 0.08 * Math.sin(Math.min(1, Math.max(0, pop)) * Math.PI);
    return <g opacity={p * o} transform={`translate(${x + (1 - p) * -30} ${y}) scale(${s})`}>
      <Frame x={0} y={0} w={w} h={176} c={accent} />
      <text x={26} y={46} fontFamily={WI_FONT} fontWeight={900} fontSize={25} letterSpacing={4} fill={WI.muted}>{label}</text>
      <circle cx={w - 30} cy={38} r={8} fill={WI.red} opacity={live ? 1 : 0.25} />
      <Digits x={20} y={146} text={txt} size={96} color={WI.text} cell={62} />
      {unit && <text x={20 + txt.length * 62 + 12} y={146} fontFamily={WI_FONT} fontWeight={900} fontSize={44} fill={accent}>{unit}</text>}
      {tag && <g>
        <rect x={w - 20 - tagW} y={110} width={tagW} height={46} rx={23} fill={WI.gold} />
        <text x={w - 20 - tagW / 2} y={142} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={26} fill={WI.ink}>{tag}</text>
      </g>}
    </g>;
  };

export type BarRow = { label: string; fill: number; value: string; color?: string; at?: number };
/** Horizontal comparison bars: label above, rounded bar fill that grows from `at`, big number at the right end. */
export const CompareBars: React.FC<{ x: number; y: number; w?: number; rows: BarRow[]; f: number; at?: number; gap?: number; o?: number }> =
  ({ x, y, w = 880, rows, f, at = 0, gap = 190, o = 1 }) => (
    <g opacity={o}>
      <defs>{rows.map((r, i) => <linearGradient key={i} id={`wiBar${i}${(r.color ?? WI.cyan).slice(1)}`} x1="0" x2="1"><stop offset="0" stopColor={tint(r.color ?? WI.cyan, "#000000", 0.25)} /><stop offset="1" stopColor={tint(r.color ?? WI.cyan, "#ffffff", 0.2)} /></linearGradient>)}</defs>
      {rows.map((r, i) => {
        const a = r.at ?? at + i * 14;
        const lp = inE(f, a - 4, 10);
        if (lp <= 0) return null;
        const g = inE(f, a, 30);
        const bw = w - 230, yy = y + i * gap, c = r.color ?? WI.cyan;
        return <g key={i} opacity={lp}>
          <text x={x} y={yy} fontFamily={WI_FONT} fontWeight={900} fontSize={38} fill={WI.text}>{r.label}</text>
          <rect x={x} y={yy + 24} width={bw} height={64} rx={32} fill={WI.panel2} stroke={WI.line} strokeWidth={3} />
          {g > 0.01 && <rect x={x + 6} y={yy + 30} width={Math.max(52, (bw - 12) * r.fill * g)} height={52} rx={26} fill={`url(#wiBar${i}${c.slice(1)})`} />}
          {g > 0.01 && <rect x={x + 20} y={yy + 36} width={Math.max(20, (bw - 40) * r.fill * g)} height={10} rx={5} fill="#ffffff" opacity={0.28} />}
          <text x={x + w} y={yy + 78} textAnchor="end" fontFamily={WI_FONT} fontWeight={900} fontSize={60} fill={c} opacity={inE(f, a + 16, 10)}>{r.value}</text>
        </g>;
      })}
    </g>
  );

/**
 * Chapter screen: a glowing panel with a small caps line and huge numerals ("DAY" / "3").
 * crack 0..1 draws cracks across it; glitch 0..1 adds RGB-split copies and jittering slices.
 */
export const ChapterScreen: React.FC<{ x?: number; y?: number; big: string; small: string; f: number; at?: number; w?: number; h?: number;
  crack?: number; glitch?: number; o?: number; color?: string; bigSize?: number }> =
  ({ x = 540, y = 860, big, small, f, at = 0, w = 800, h = 640, crack = 0, glitch = 0, o = 1, color = WI.gold, bigSize = 330 }) => {
    const p = inE(f, at, 14);
    if (p <= 0 || o <= 0) return null;
    const s = 0.86 + 0.14 * p;
    const j = glitch > 0 ? (rand(Math.floor(f / 2)) - 0.5) * 40 * glitch : 0;
    const bigY = 150;
    return <g opacity={p * o} transform={`translate(${x} ${y}) scale(${s})`}>
      <defs><linearGradient id="wiChap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={WI.panel2} /><stop offset="1" stopColor={WI.panel} /></linearGradient></defs>
      <Glow x={0} y={0} r={w * 0.75} ry={h * 0.7} color={color} o={0.18} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={44} fill="url(#wiChap)" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={44} fill="none" stroke={WI.cyan} strokeWidth={22} opacity={0.12} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={44} fill="none" stroke={WI.cyan} strokeWidth={3} opacity={0.9} />
      <path d={`M ${-w / 2 + 60} ${-h / 2 + 150} L ${w / 2 - 60} ${-h / 2 + 150}`} stroke={WI.line} strokeWidth={3} />
      <text x={0} y={-h / 2 + 112} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={58} letterSpacing={14} fill={WI.cyan}>{small}</text>
      {glitch > 0 && <>
        <text x={j - 14 * glitch} y={bigY} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={bigSize} fill={WI.cyan} opacity={0.6}>{big}</text>
        <text x={-j + 14 * glitch} y={bigY + 6 * glitch} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={bigSize} fill={WI.coral} opacity={0.6}>{big}</text>
      </>}
      <text x={glitch > 0 ? j * 0.3 : 0} y={bigY} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={bigSize} fill="none" stroke={color} strokeWidth={26} opacity={0.16}>{big}</text>
      <text x={glitch > 0 ? j * 0.3 : 0} y={bigY} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={bigSize} fill={color}>{big}</text>
      {glitch > 0 && Array.from({ length: 5 }, (_, i) => { const yy = -h / 2 + 170 + rand(i + Math.floor(f / 3) * 7) * (h - 220);
        return <rect key={i} x={-w / 2 + 10} y={yy} width={w - 20} height={6 + rand(i + 3 + Math.floor(f / 3)) * 18} fill={WI.panel} opacity={0.85 * glitch} transform={`translate(${(rand(i * 5 + Math.floor(f / 2)) - 0.5) * 60 * glitch} 0)`} />; })}
      {crack > 0 && <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {[
          "M 90 20 L 40 -60 L 70 -150 L 20 -250 L 40 -320",
          "M 90 20 L 200 -20 L 260 -110 L 380 -150",
          "M 90 20 L 160 120 L 140 220 L 220 320",
          "M 90 20 L -40 80 L -150 60 L -260 150 L -390 170",
          "M 90 20 L 10 150 L -60 200 L -80 320",
          "M 40 -60 L -60 -90 L -150 -60", "M 160 120 L 280 140",
        ].map((d, i) => <g key={i}>
          <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.min(1, crack * 1.4 - i * 0.06)} stroke={WI.ink} strokeWidth={14} opacity={0.9} />
          <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.min(1, crack * 1.4 - i * 0.06)} stroke="#e8f6ff" strokeWidth={4} />
        </g>)}
      </g>}
    </g>;
  };

export type ChoiceCard = { letter: string; text: string; look?: ToyLook; expr?: ToyExpr; lids?: number };
/** 2x2 A/B/C/D choice cards (dark cards with a toy, a letter badge and a caption); pick = highlighted index (-1 none) */
export const ChoiceCards: React.FC<{ x?: number; y?: number; cards: ChoiceCard[]; pick?: number; f: number; at?: number; cw?: number; ch?: number; gap?: number; o?: number }> =
  ({ x = 540, y = 900, cards, pick = -1, f, at = 0, cw = 400, ch = 380, gap = 28, o = 1 }) => (
    <g opacity={o}>
      {cards.map((c, i) => {
        const p = back(f, at + i * 6, 14);
        if (p <= 0) return null;
        const cx = x + (i % 2 ? 1 : -1) * (cw / 2 + gap / 2), cy = y + (i < 2 ? -1 : 1) * (ch / 2 + gap / 2);
        const picked = pick === i, dim = pick >= 0 && !picked;
        const s = p * (picked ? 1.05 : 1);
        return <g key={i} transform={`translate(${cx} ${cy}) scale(${s})`} opacity={dim ? 0.45 : 1}>
          {picked && <Glow x={0} y={0} r={cw * 0.7} ry={ch * 0.7} color={WI.gold} o={0.35} />}
          <Frame x={-cw / 2} y={-ch / 2} w={cw} h={ch} rx={32} c={picked ? WI.gold : WI.line} fill={WI.panel} o={0.95} />
          <Glow x={0} y={60} r={150} ry={36} color={WI.cyan} o={0.25} />
          <Toy x={0} y={64} scale={0.5} look={c.look ?? TOY_LOOKS.remy} expr={c.expr ?? "neutral"} lids={c.lids ?? 0} f={f} seed={i * 3} shadow={0.7} />
          <circle cx={-cw / 2 + 52} cy={-ch / 2 + 52} r={34} fill={picked ? WI.gold : WI.panel2} stroke={picked ? WI.gold : WI.cyan} strokeWidth={3} />
          <text x={-cw / 2 + 52} y={-ch / 2 + 66} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={40} fill={picked ? WI.ink : WI.cyan}>{c.letter}</text>
          <text x={0} y={ch / 2 - 40} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={46} fill={picked ? WI.gold : WI.text}>{c.text}</text>
        </g>;
      })}
    </g>
  );

/** rounded dark phone; children are drawn in screen coordinates (0..400 x 0..800, origin top-left of the screen) */
export const Phone: React.FC<{ x: number; y: number; scale?: number; rot?: number; children?: React.ReactNode; screen?: string }> =
  ({ x, y, scale = 1, rot = 0, children, screen = "#0a1022" }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <defs><linearGradient id="wiPhone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a4260" /><stop offset="1" stopColor="#11141f" /></linearGradient></defs>
      <Glow x={0} y={0} r={360} ry={520} color={WI.cyan} o={0.12} />
      <rect x={-224} y={-440} width={448} height={880} rx={68} fill="url(#wiPhone)" stroke={TOY_INK} strokeWidth={6} />
      <rect x={-224} y={-440} width={448} height={880} rx={68} fill="none" stroke={WI.cyan} strokeWidth={2.5} opacity={0.6} />
      <rect x={-200} y={-400} width={400} height={800} rx={46} fill={screen} />
      <g transform="translate(-200 -400)">{children}</g>
      <rect x={-60} y={-388} width={120} height={30} rx={15} fill="#05070c" />
    </g>
  );

/** a notification pill for the Phone (screen coordinates); o/s for entering */
export const Notification: React.FC<{ x?: number; y: number; w?: number; title: string; body: string; icon?: string; o?: number; s?: number; time?: string }> =
  ({ x = 16, y, w = 368, title, body, icon = WI.cyan, o = 1, s = 1, time = "now" }) => (
    <g opacity={o} transform={`translate(${x + w / 2} ${y + 52}) scale(${s}) translate(${-w / 2} -52)`}>
      <rect x={0} y={0} width={w} height={104} rx={26} fill="#1b2442" stroke={WI.line} strokeWidth={2} />
      <rect x={16} y={20} width={64} height={64} rx={18} fill={icon} />
      <path d="M 34 44 L 62 44 M 34 58 L 54 58" stroke={WI.ink} strokeWidth={6} strokeLinecap="round" />
      <text x={96} y={46} fontFamily={WI_FONT} fontWeight={900} fontSize={26} fill={WI.text}>{title}</text>
      <text x={96} y={82} fontFamily={WI_FONT} fontWeight={700} fontSize={24} fill={WI.muted}>{body}</text>
      <text x={w - 18} y={42} textAnchor="end" fontFamily={WI_FONT} fontWeight={700} fontSize={20} fill={WI.muted}>{time}</text>
    </g>
  );

/** a followers/messages stat for the Phone (screen coordinates) */
export const PhoneStat: React.FC<{ x: number; y: number; label: string; value: string; color?: string }> = ({ x, y, label, value, color = WI.gold }) => (
  <g>
    <text x={x} y={y} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={64} fill={color}>{value}</text>
    <text x={x} y={y + 36} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={22} letterSpacing={4} fill={WI.muted}>{label}</text>
  </g>
);

// ---------------------------------------------------------------- props
/** heap of snacks (chip bags + cans); n items shown (fractional n pops the newest in) */
export const SnackPile: React.FC<{ x: number; y: number; scale?: number; n: number }> = ({ x, y, scale = 1, n }) => {
  const rows = [5, 4, 4, 3, 2, 1];
  const slots: { sx: number; sy: number; kind: number; c: string; r: number }[] = [];
  const cols = [WI.coral, WI.gold, WI.cyan, WI.green, WI.violet, "#ff9a4a"];
  rows.forEach((cnt, r) => { for (let i = 0; i < cnt; i++) {
    const k = slots.length;
    slots.push({ sx: (i - (cnt - 1) / 2) * 86 + (rand(k) - 0.5) * 20, sy: -40 - r * 62, kind: k % 3 === 2 ? 1 : 0, c: cols[k % cols.length], r: (rand(k + 9) - 0.5) * 30 });
  } });
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={4} rx={260} ry={26} fill="#000" opacity={0.35} />
    {slots.map((s, i) => {
      const p = Math.max(0, Math.min(1, n - i));
      if (p <= 0) return null;
      const sc = p < 1 ? 0.4 + 0.6 * p : 1;
      return <g key={i} transform={`translate(${s.sx} ${s.sy + (1 - p) * -60}) rotate(${s.r}) scale(${sc})`}>
        {s.kind === 0
          ? <g><path d="M -44 -48 L 44 -48 Q 50 0 44 44 L -44 44 Q -50 0 -44 -48 Z" fill={s.c} stroke={TOY_INK} strokeWidth={5} strokeLinejoin="round" />
              <path d="M -44 -48 L -34 -56 L -22 -48 L -10 -56 L 2 -48 L 14 -56 L 26 -48 L 38 -56 L 44 -48" stroke={TOY_INK} strokeWidth={4} fill={tint(s.c, "#ffffff", 0.3)} />
              <circle cx={0} cy={0} r={18} fill="#fff6dc" opacity={0.85} /><ellipse cx={-24} cy={-20} rx={8} ry={20} fill="#fff" opacity={0.3} /></g>
          : <g><rect x={-26} y={-46} width={52} height={90} rx={12} fill={s.c} stroke={TOY_INK} strokeWidth={5} />
              <rect x={-26} y={-46} width={52} height={14} rx={7} fill="#c9d0de" stroke={TOY_INK} strokeWidth={4} />
              <rect x={-16} y={-24} width={10} height={58} rx={5} fill="#fff" opacity={0.35} /></g>}
      </g>;
    })}
  </g>;
};

/** a TV (screen 560x320 at scale 1); children drawn in screen coordinates (0..560 x 0..320); glow spills from it */
export const TV: React.FC<{ x: number; y: number; scale?: number; glow?: string; children?: React.ReactNode; o?: number }> =
  ({ x, y, scale = 1, glow = WI.cyan, children, o = 1 }) => (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={o}>
      <Glow x={0} y={40} r={620} ry={460} color={glow} o={0.22} />
      <rect x={-300} y={-180} width={600} height={360} rx={22} fill="#0b0d14" stroke={TOY_INK} strokeWidth={6} />
      <rect x={-280} y={-160} width={560} height={320} rx={10} fill="#0d1a2e" />
      <svg x={-280} y={-160} width={560} height={320} viewBox="0 0 560 320" overflow="hidden">{children}</svg>
      <rect x={-280} y={-160} width={560} height={320} rx={10} fill="none" stroke={glow} strokeWidth={2} opacity={0.5} />
      <path d="M -60 180 L -90 240 M 60 180 L 90 240 M -120 240 L 120 240" stroke="#1a1d28" strokeWidth={14} strokeLinecap="round" />
    </g>
  );

/** a cosy bed (front-ish view); lump 0..1 = someone asleep under the blanket (breathing with f) */
export const Bed: React.FC<{ x: number; y: number; scale?: number; f?: number; lump?: number; blanket?: string }> = ({ x, y, scale = 1, f = 0, lump = 1, blanket = "#3d5aa8" }) => {
  const br = 1 + 0.03 * Math.sin(f * 0.08);
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={10} rx={420} ry={40} fill="#000" opacity={0.4} />
    <rect x={-400} y={-330} width={60} height={340} rx={20} fill="#6a4a3a" stroke={TOY_INK} strokeWidth={6} />
    <rect x={-380} y={-150} width={780} height={130} rx={30} fill="#e9e3f2" stroke={TOY_INK} strokeWidth={6} />
    <rect x={-330} y={-230} width={220} height={100} rx={44} fill="#f6f2fb" stroke={TOY_INK} strokeWidth={6} />
    <path d={`M -150 -150 Q -120 ${-210 - 50 * lump * br} 60 ${-200 - 40 * lump * br} Q 260 ${-190 - 20 * lump} 390 -150 L 390 -40 L -150 -40 Z`} fill={blanket} stroke={TOY_INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -100 -120 L 360 -120" stroke={tint(blanket, "#ffffff", 0.2)} strokeWidth={8} opacity={0.6} />
    {lump > 0 && <g transform={`translate(-210 ${-220 - 6 * lump})`}>
      <rect x={-70} y={-60} width={140} height={110} rx={46} fill={tint("#f3ebe0", "#8aa0d8", 0.25)} stroke={TOY_INK} strokeWidth={5} />
    </g>}
    <rect x={-20 + 400} y={-260} width={50} height={270} rx={18} fill="#6a4a3a" stroke={TOY_INK} strokeWidth={6} />
  </g>;
};

/** a plain person silhouette with a rim light (for real people: never a photo or likeness) */
export const Silhouette: React.FC<{ x: number; y: number; scale?: number; rim?: string; fill?: string }> = ({ x, y, scale = 1, rim = WI.cyan, fill = "#0e1428" }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -150 0 Q -150 -150 -60 -170 L 60 -170 Q 150 -150 150 0 Z" fill={fill} />
    <rect x={-34} y={-210} width={68} height={60} fill={fill} />
    <ellipse cx={0} cy={-290} rx={88} ry={104} fill={fill} />
    <path d="M 70 -350 Q 104 -290 70 -215 M 60 -168 Q 140 -150 148 -10" stroke={rim} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} />
  </g>
);

/** floating "Z" letters for sleep (x, y = where they rise from) */
export const Zzz: React.FC<{ x: number; y: number; f: number; color?: string; s?: number }> = ({ x, y, f, color = WI.cyan, s = 1 }) => (
  <g>{[0, 1, 2].map((i) => { const t = ((f / 60) + i / 3) % 1;
    return <text key={i} x={x + 60 * t + 10 * Math.sin(f * 0.1 + i)} y={y - 160 * t} fontFamily={WI_FONT} fontWeight={900} fontSize={(40 + 30 * t) * s} fill={color} opacity={Math.min(1, t * 4) * (1 - t)}>Z</text>; })}</g>
);

/** simple crescent moon with glow */
export const Moon: React.FC<{ x: number; y: number; r?: number; bg?: string }> = ({ x, y, r = 70, bg = WI.bg1 }) => (
  <g><Glow x={x} y={y} r={r * 3} color="#cfe0ff" o={0.35} /><circle cx={x} cy={y} r={r} fill="#f2f0dc" /><circle cx={x + r * 0.45} cy={y - r * 0.25} r={r * 0.85} fill={bg} /></g>
);

export { Toy, TOY_LOOKS, ToyHead, Controller, ContactShadow } from "./toy";
export type { ToyLook, ToyExpr, ToyPose } from "./toy";
