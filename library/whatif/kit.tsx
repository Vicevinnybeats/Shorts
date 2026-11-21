// WHAT IF style kit - "Golden Neon" (series "WHAT IF", owner look 2026-11-21). Rules: brain/style-whatif.md.
// Pure black stages; everything is thin glowing line-art in warm gold/amber with coral accents (cyan only for HUD
// details). Glow is FAKED with 2-3 stacked strokes of decreasing opacity / increasing width (no CSS blur, no filters).
// Lines DRAW ON (pathLength=1 + strokeDasharray, see drawOn), dotted lines travel (dashoffset), HUD pieces punch in.
// All components are SVG <g> in the 1080x1920 design space; `f` = frame (shot-relative), `at` = start frame.
// Static scenery: wrap in <Bake done={p >= 1}> so it is drawn ONCE into a cached image (CachedSvg) after its draw-on.
import React from "react";
import { interpolate, Easing } from "remotion";
import { CachedSvg } from "../../src/engine25/cached";
import { EASE, arrive, leave, stampScale } from "../../src/engine25/motion";
export { NeonFigure, FloorGlow, LOOKS, FACE } from "./figure";
export type { FigLook, FigPose, FigExpr } from "./figure";

export const NEON = {
  bg: "#020203", bg2: "#0a0705", gold: "#f5b942", amber: "#ffcf6e", hot: "#fff3d0", coral: "#ff7a59",
  red: "#ff4d5e", cyan: "#5fe3ff", dim: "#8a6a2e", faint: "#3a2c14", text: "#fff1d6", muted: "#b89a66",
} as const;
export const WI_FONT = "CaptionSans, sans-serif";
export const MONO = "DejaVu Sans Mono, Menlo, Consolas, monospace";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const backE = (f: number, a: number, d: number, s = 1.8) => interpolate(f, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(s)) });
export const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** 0..1 draw-on progress (EASE.arrive) starting at frame `at` over `d` frames */
export const drawOn = (f: number, at: number, d = 18) => interpolate(f, [at, at + d], [0, 1], { ...cl, easing: EASE.arrive });

// ---------------------------------------------------------------- primitives
/**
 * One glowing line. d = SVG path; p = draw-on progress 0..1 (uses pathLength 1); dash = e.g. "0 16" for a dotted
 * light line (round caps make dots) and travel = dash offset (animate with f to make the dots run).
 * glow 0..1 scales the halo strokes; hot adds a white-gold core.
 */
export const NeonPath: React.FC<{ d: string; color?: string; w?: number; p?: number; glow?: number; o?: number; dash?: string; travel?: number;
  hot?: boolean; fill?: string; join?: "round" | "miter" }> = ({ d, color = NEON.gold, w = 4, p = 1, glow = 1, o = 1, dash, travel = 0, hot, fill = "none", join = "round" }) => {
  if (p <= 0.001 || o <= 0) return null;
  const draw = p < 1 && !dash ? { pathLength: 1, strokeDasharray: `${p} 2` } : dash ? { strokeDasharray: dash, strokeDashoffset: travel } : {};
  const common = { d, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: join, ...draw };
  return (
    <g opacity={o}>
      {fill !== "none" && <path d={d} fill={fill} />}
      {glow > 0 && <path {...common} stroke={color} strokeWidth={w * 5} opacity={0.07 * glow} />}
      {glow > 0 && <path {...common} stroke={color} strokeWidth={w * 2.4} opacity={0.2 * glow} />}
      <path {...common} stroke={color} strokeWidth={w} />
      {hot && <path {...common} stroke={NEON.hot} strokeWidth={w * 0.4} opacity={0.9} />}
    </g>
  );
};

/** Neon text: glow strokes + fill (tube = outline only, for huge chapter words). Never use for text < 30 px. */
export const NeonText: React.FC<{ x: number; y: number; size: number; color?: string; children: React.ReactNode; anchor?: "start" | "middle" | "end";
  o?: number; tube?: boolean; spacing?: number; font?: string; weight?: number }> =
  ({ x, y, size, color = NEON.gold, children, anchor = "middle", o = 1, tube = false, spacing = 0, font = WI_FONT, weight = 900 }) => {
    if (o <= 0) return null;
    const c = { x, y, textAnchor: anchor, fontFamily: font, fontWeight: weight, fontSize: size, letterSpacing: spacing };
    return (
      <g opacity={o}>
        <text {...c} fill="none" stroke={color} strokeWidth={size * 0.16} opacity={0.08} strokeLinejoin="round">{children}</text>
        <text {...c} fill="none" stroke={color} strokeWidth={size * 0.07} opacity={0.22} strokeLinejoin="round">{children}</text>
        {tube ? <text {...c} fill="#000" fillOpacity={0.6} stroke={color} strokeWidth={Math.max(3, size * 0.03)} strokeLinejoin="round">{children}</text>
          : <text {...c} fill={color}>{children}</text>}
        {tube && <text {...c} fill="none" stroke={NEON.hot} strokeWidth={Math.max(1.2, size * 0.01)} opacity={0.7}>{children}</text>}
      </g>
    );
  };

type Enter = "rise" | "scale" | "words" | "type" | "present";
/** A HUD label with a deliberate entrance AND exit (motion rules). f/at/out in shot frames; hidden during crossfades. */
export const HudText: React.FC<{ f: number; x: number; y: number; size: number; color?: string; enter?: Enter; at: number; out?: number; children: string;
  hidden?: boolean; tube?: boolean; anchor?: "start" | "middle" | "end"; spacing?: number }> =
  ({ f, x, y, size, color = NEON.gold, enter = "rise", at, out = Infinity, children, hidden, tube, anchor = "middle", spacing }) => {
    if (hidden || f < at) return null;
    const ex = Number.isFinite(out) ? leave(f, out) : 0;
    if (ex >= 1) return null;
    let txt = children, p = arrive(f, at, 12), s = 1, dy = 0;
    if (enter === "type") { const n = Math.ceil(children.length * Math.min(1, (f - at + 1) / Math.max(6, children.length * 1.2))); txt = children.slice(0, n); p = 1; }
    if (enter === "words") { const ws = children.split(" "); const n = Math.min(ws.length, 1 + Math.floor((f - at) / 3)); txt = ws.slice(0, n).join(" "); p = arrive(f, at, 8); }
    if (enter === "scale") s = 1.25 - 0.25 * backE(f, at, 12);
    if (enter === "rise") dy = (1 - p) * 30;
    if (enter === "present") p = 1;
    return <g transform={`translate(${x} ${y + dy - ex * 18}) scale(${s})`}>
      <NeonText x={0} y={0} size={size} color={color} o={p * (1 - ex)} tube={tube} anchor={anchor} spacing={spacing}>{txt}</NeonText>
    </g>;
  };

/** Draws static (or finished) line art once into a cached image. Children must not use text or url(#gradients). */
export const Bake: React.FC<{ id: string; done: boolean; children: React.ReactNode; x?: number; y?: number; w?: number; h?: number }> =
  ({ id, done, children, x = -400, y = -400, w = 1880, h = 2720 }) => done ? <CachedSvg cacheKey={"wi-" + id} x={x} y={y} w={w} h={h}>{children}</CachedSvg> : <g>{children}</g>;

/** gradients used by Spotlight/Pool/TV glow - put once inside the stage <svg> */
export const NeonDefs: React.FC = () => (
  <defs>
    <linearGradient id="wiCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={NEON.amber} stopOpacity={0.28} /><stop offset="1" stopColor={NEON.gold} stopOpacity={0.02} /></linearGradient>
    <radialGradient id="wiPool"><stop offset="0" stopColor={NEON.gold} stopOpacity={0.35} /><stop offset="1" stopColor={NEON.gold} stopOpacity={0} /></radialGradient>
    <radialGradient id="wiTvGlow"><stop offset="0" stopColor="#ffd9a0" stopOpacity={0.4} /><stop offset="1" stopColor="#ff9a5a" stopOpacity={0} /></radialGradient>
    <radialGradient id="wiVig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.85} /></radialGradient>
  </defs>
);

// ---------------------------------------------------------------- stage + camera
export type WCam = { x: number; y: number; zoom: number; rot?: number };
const CamCtx = React.createContext<WCam>({ x: 0, y: 0, zoom: 1, rot: 0 });
/** Full-frame black stage <svg>. Children: <Plane p> layers (parallax by depth p), then screen-space HUD via `hud`. */
export const Stage: React.FC<{ cam: WCam; children: React.ReactNode; hud?: React.ReactNode; bg?: string; vignette?: number }> = ({ cam, children, hud, bg = NEON.bg, vignette = 1 }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <NeonDefs />
    <rect x={0} y={0} width={1080} height={1920} fill={bg} />
    <CamCtx.Provider value={cam}>{children}</CamCtx.Provider>
    {vignette > 0 && <rect x={0} y={0} width={1080} height={1920} fill="url(#wiVig)" opacity={vignette} />}
    {hud}
  </svg>
);
/** depth layer: p 0 = fixed backdrop, 1 = subject plane, > 1 foreground */
export const Plane: React.FC<{ p: number; children: React.ReactNode }> = ({ p, children }) => {
  const c = React.useContext(CamCtx);
  const s = 1 + (c.zoom - 1) * p;
  return <g transform={`translate(540 960) rotate(${(c.rot ?? 0) * Math.min(1, p + 0.2)}) scale(${s}) translate(${-c.x * p - 540} ${-c.y * p - 960})`}>{children}</g>;
};
/** handheld drift + optional impact kick */
export const camDrift = (c: WCam, f: number, amp = 4): WCam => ({ ...c, x: c.x + Math.sin(f * 0.045) * amp, y: c.y + Math.cos(f * 0.038) * amp * 0.7, rot: (c.rot ?? 0) + Math.sin(f * 0.03) * amp * 0.04 });
export const camKick = (c: WCam, since: number, amp = 16): WCam => {
  if (since < 0 || since > 8) return c;
  const k = amp * (since % 2 ? -1 : 1) * (1 - since / 9);
  return { ...c, x: c.x + k, y: c.y - k * 0.6 };
};

// ---------------------------------------------------------------- light
/** soft spotlight cone from above (stacked gradient trapezoids) + floor pool */
export const Spotlight: React.FC<{ x: number; top?: number; floor: number; w?: number; f?: number; o?: number }> = ({ x, top = -200, floor, w = 620, f = 0, o = 1 }) => {
  const fl = 0.92 + 0.08 * Math.sin(f * 0.21) * Math.sin(f * 0.07);
  return <g opacity={o * fl}>
    {[1, 0.7, 0.42].map((k, i) => <path key={i} d={`M ${x - 40 * k} ${top} L ${x + 40 * k} ${top} L ${x + (w / 2) * k} ${floor} L ${x - (w / 2) * k} ${floor} Z`} fill="url(#wiCone)" opacity={0.55} />)}
    <ellipse cx={x} cy={floor} rx={w * 0.62} ry={w * 0.09} fill="url(#wiPool)" />
  </g>;
};
/** floating dust: n drifting motes inside a box */
export const Particles: React.FC<{ f: number; n?: number; x?: number; y?: number; w?: number; h?: number; color?: string; seed?: number }> =
  ({ f, n = 26, x = 0, y = 200, w = 1080, h = 1300, color = NEON.amber, seed = 0 }) => (
    <g>{Array.from({ length: n }, (_, i) => {
      const r = rnd(i + seed * 31), q = rnd(i * 3.7 + seed + 1);
      const px = x + ((r * w + Math.sin(f * 0.02 + i) * 30) % w), py = y + (((q * h - f * (0.4 + r * 0.8)) % h) + h) % h;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(f * 0.05 + i * 1.7));
      return <circle key={i} cx={px} cy={py} r={1.4 + 2.4 * q} fill={color} opacity={0.5 * tw} />;
    })}</g>
  );

// ---------------------------------------------------------------- stroke letters for the "WHAT IF" sting (draw-on)
const LETTERS: Record<string, { d: string; w: number }> = {
  W: { d: "M 0 0 L 24 140 L 50 46 L 76 140 L 100 0", w: 100 }, H: { d: "M 0 0 L 0 140 M 86 0 L 86 140 M 0 70 L 86 70", w: 86 },
  A: { d: "M 0 140 L 46 0 L 92 140 M 18 88 L 74 88", w: 92 }, T: { d: "M 0 0 L 90 0 M 45 0 L 45 140", w: 90 },
  I: { d: "M 0 0 L 0 140", w: 0 }, F: { d: "M 78 0 L 0 0 L 0 140 M 0 66 L 62 66", w: 78 }, " ": { d: "", w: 26 },
};
/** stroke-font word that draws on letter by letter (p 0..1). x = centre, y = top, h = letter height. */
export const StrokeWord: React.FC<{ text: string; x: number; y: number; h: number; p: number; color?: string; w?: number }> = ({ text, x, y, h, p, color = NEON.gold, w = 9 }) => {
  const s = h / 140, gap = 34;
  const chars = text.split("");
  const total = chars.reduce((a, c) => a + (LETTERS[c]?.w ?? 60) + gap, -gap) * s;
  let cx = x - total / 2;
  const n = chars.filter((c) => c !== " ").length;
  let k = 0;
  return <g>{chars.map((c, i) => {
    const L = LETTERS[c] ?? LETTERS[" "];
    const ox = cx; cx += (L.w + gap) * s;
    if (!L.d) return null;
    const lp = Math.max(0, Math.min(1, p * (n + 1.5) - k * 1.0)); k++;
    return <g key={i} transform={`translate(${ox} ${y}) scale(${s})`}><NeonPath d={L.d} p={lp} w={w / s} color={color} hot /></g>;
  })}</g>;
};

// ---------------------------------------------------------------- HUD
const pad = (v: number, n: number) => String(Math.max(0, Math.round(v))).padStart(n, "0");
/** fixed-cell digits (monospace look with the channel font) */
export const Digits: React.FC<{ x: number; y: number; text: string; size: number; color?: string; anchor?: "start" | "middle" }> = ({ x, y, text, size, color = NEON.gold, anchor = "start" }) => {
  const cell = size * 0.68, x0 = anchor === "middle" ? x - (text.length * cell) / 2 : x;
  return <g>{text.split("").map((ch, i) => <NeonText key={i} x={x0 + cell * (i + 0.5)} y={y} size={size} color={color}>{ch}</NeonText>)}</g>;
};
/** Corner LIVE COUNTER card: small caps label, big ticking digits (from -> to over dur), DAY tag, blinking live dot.
 *  Default box 380x150 at (x, y) = top-left; keep it inside y 300-1350, x 60-960. */
export const LiveCounter: React.FC<{ f: number; x?: number; y?: number; label?: string; from: number; to: number; at?: number; dur?: number; tag?: string;
  out?: number; hidden?: boolean; digits?: number; unit?: string; display?: string }> =
  ({ f, x = 70, y = 316, label = "HOURS AWAKE", from, to, at = 0, dur = 18, tag, out = Infinity, hidden, digits = 3, unit, display }) => {
    if (hidden) return null;
    const ex = Number.isFinite(out) ? leave(f, out) : 0;
    if (ex >= 1) return null;
    const p = drawOn(f, at - 6, 14);
    const v = interpolate(f, [at, at + dur], [from, to], { ...cl, easing: EASE.arrive });
    const st = stampScale(f, at, dur);
    const W = 380, Hh = 150;
    const br = (d: string) => <NeonPath d={d} w={3.5} p={p} color={NEON.gold} />;
    return <g opacity={1 - ex} transform={`translate(${x} ${y - ex * 14})`}>
      <rect x={0} y={0} width={W} height={Hh} rx={14} fill="#000" opacity={0.55 * p} />
      <NeonPath d={`M 0 0 L ${W} 0 L ${W} ${Hh} L 0 ${Hh} Z`} w={1.5} glow={0} o={0.35} p={p} />
      {br(`M 0 34 L 0 0 L 34 0`)}{br(`M ${W - 34} 0 L ${W} 0 L ${W} 34`)}{br(`M 0 ${Hh - 34} L 0 ${Hh} L 34 ${Hh}`)}{br(`M ${W - 34} ${Hh} L ${W} ${Hh} L ${W} ${Hh - 34}`)}
      {p > 0.5 && <>
        <circle cx={26} cy={36} r={7} fill={NEON.coral} opacity={Math.floor(f / 15) % 2 ? 0.35 : 1} />
        <text x={44} y={45} fontFamily={WI_FONT} fontWeight={800} fontSize={26} letterSpacing={3} fill={NEON.muted}>{label}</text>
        <g transform={`translate(28 ${Hh - 22}) scale(${st}) translate(-28 ${-(Hh - 22)})`}><Digits x={24} y={Hh - 22} text={display ?? pad(v, digits)} size={86} color={NEON.amber} /></g>
        {unit && <NeonText x={24 + digits * 86 * 0.68 + 10} y={Hh - 26} size={40} color={NEON.gold} anchor="start">{unit}</NeonText>}
        {tag && <g transform={`translate(${W - 104} ${Hh - 86})`}>
          <NeonPath d="M 0 0 L 84 0 L 84 50 L 0 50 Z" w={2.5} color={NEON.coral} />
          <text x={42} y={36} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={28} fill={NEON.coral}>{tag}</text>
        </g>}
      </>}
    </g>;
  };

export type BarRow = { label: string; fill: number; value?: string; color?: string; at: number; sub?: string };
/** horizontal comparison bars: outlined tracks, fills grow with overshoot, labels above each bar */
export const CompareBars: React.FC<{ f: number; x?: number; y: number; w?: number; rows: BarRow[]; gap?: number; out?: number; hidden?: boolean }> =
  ({ f, x = 90, y, w = 820, rows, gap = 190, out = Infinity, hidden }) => {
    const ex = Number.isFinite(out) ? leave(f, out) : 0;
    if (ex >= 1) return null;
    return <g opacity={1 - ex}>{rows.map((r, i) => {
      const yy = y + i * gap, c = r.color ?? NEON.gold;
      const tp = drawOn(f, r.at - 8, 14);
      const g = interpolate(f, [r.at, r.at + 22], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.6)) });
      const fw = Math.max(0, w * r.fill * g);
      return <g key={i}>
        {!hidden && <HudText f={f} x={x} y={yy - 22} size={40} color={c} enter="rise" at={r.at - 6} anchor="start">{r.label}</HudText>}
        <NeonPath d={`M ${x} ${yy} L ${x + w} ${yy} L ${x + w} ${yy + 70} L ${x} ${yy + 70} Z`} w={2.5} p={tp} color={NEON.dim} glow={0.4} />
        {fw > 2 && <>
          <rect x={x + 6} y={yy + 6} width={Math.max(0, fw - 12)} height={58} fill={c} opacity={0.22} />
          {Array.from({ length: Math.floor((fw - 12) / 22) }, (_, k) => <path key={k} d={`M ${x + 14 + k * 22} ${yy + 60} L ${x + 30 + k * 22} ${yy + 10}`} stroke={c} strokeWidth={3} opacity={0.35} />)}
          <NeonPath d={`M ${x + 6} ${yy + 6} L ${x + fw - 6} ${yy + 6} L ${x + fw - 6} ${yy + 64} L ${x + 6} ${yy + 64} Z`} w={3.5} color={c} hot />
        </>}
        {!hidden && r.value && <HudText f={f} x={x + w} y={yy + 128} size={36} color={NEON.muted} enter="type" at={r.at + 14} anchor="end">{r.value}</HudText>}
      </g>;
    })}</g>;
  };

/** huge CHAPTER screen ("DAY 3"): brackets draw on, the word punches in (scale 1.4 -> 1 with back ease) and a light
 *  sweep crosses it; glitch 0..1 slices it into offset coral/cyan bands. Centre (x, y) = text baseline centre. */
export const ChapterScreen: React.FC<{ f: number; id: string; big: string; small?: string; at?: number; out?: number; x?: number; y?: number; size?: number;
  glitch?: number; hidden?: boolean; color?: string }> =
  ({ f, id, big, small, at = 0, out = Infinity, x = 540, y = 720, size = 230, glitch = 0, hidden, color = NEON.gold }) => {
    if (hidden || f < at - 4) return null;
    const ex = Number.isFinite(out) ? leave(f, out, 8) : 0;
    if (ex >= 1) return null;
    const pin = backE(f, at, 14, 2.2), s = 1.4 - 0.4 * pin;
    const bw = big.length * size * 0.36 + 120, top = y - size * 0.95, bot = y + size * 0.25;
    const bp = drawOn(f, at - 4, 16);
    const sw = interpolate(f, [at + 6, at + 22], [-0.3, 1.3], cl);
    const textEl = (fill: string, dx = 0) => <NeonText x={x + dx} y={y} size={size} color={fill} tube>{big}</NeonText>;
    const bands = glitch > 0 ? Array.from({ length: 6 }, (_, i) => ({ y0: top + ((bot - top) / 6) * i, dx: (rnd(i + Math.floor(f / 2) * 7) - 0.5) * 90 * glitch })) : [];
    return <g opacity={1 - ex}>
      {[`M ${x - bw / 2} ${top + 60} L ${x - bw / 2} ${top} L ${x - bw / 2 + 60} ${top}`, `M ${x + bw / 2 - 60} ${top} L ${x + bw / 2} ${top} L ${x + bw / 2} ${top + 60}`,
        `M ${x - bw / 2} ${bot - 60} L ${x - bw / 2} ${bot} L ${x - bw / 2 + 60} ${bot}`, `M ${x + bw / 2 - 60} ${bot} L ${x + bw / 2} ${bot} L ${x + bw / 2} ${bot - 60}`]
        .map((d, i) => <NeonPath key={i} d={d} p={bp} w={4} color={NEON.coral} />)}
      <g transform={`translate(${x} ${y - size * 0.35}) scale(${s}) translate(${-x} ${-(y - size * 0.35)})`} opacity={Math.min(1, pin * 2)}>
        {glitch > 0 ? <>
          <defs>{bands.map((b, i) => <clipPath key={i} id={`${id}-b${i}`}><rect x={0} y={b.y0} width={1080} height={(bot - top) / 6 + 1} /></clipPath>)}</defs>
          {bands.map((b, i) => <g key={i} clipPath={`url(#${id}-b${i})`}>{i % 3 === 1 ? textEl(NEON.cyan, b.dx * 1.3) : null}{textEl(i % 2 ? NEON.coral : color, b.dx)}</g>)}
        </> : textEl(color)}
        {sw > -0.3 && sw < 1.3 && <>
          <defs><clipPath id={`${id}-clip`}><text x={x} y={y} textAnchor="middle" fontFamily={WI_FONT} fontWeight={900} fontSize={size}>{big}</text></clipPath></defs>
          <g clipPath={`url(#${id}-clip)`}><path d={`M ${x - bw / 2 + bw * sw} ${top - 40} l 70 0 l -140 ${bot - top + 80} l -70 0 Z`} fill={NEON.hot} opacity={0.75} /></g>
        </>}
      </g>
      {small && <HudText f={f} x={x} y={y + 110} size={52} color={NEON.muted} enter="type" at={at + 10} spacing={6}>{small}</HudText>}
    </g>;
  };

export type Choice = { letter: string; text: string };
/** A/B/C/D CHOICE CARDS in a 2x2 grid centred at (x, y); borders draw on in sequence; pick highlights one in coral */
export const ChoiceCards: React.FC<{ f: number; cards: Choice[]; x?: number; y: number; at?: number; pick?: number; pickAt?: number; cw?: number; ch?: number; out?: number; hidden?: boolean }> =
  ({ f, cards, x = 510, y, at = 0, pick = -1, pickAt = Infinity, cw = 400, ch = 190, out = Infinity, hidden }) => {
    const ex = Number.isFinite(out) ? leave(f, out) : 0;
    if (ex >= 1) return null;
    return <g opacity={1 - ex}>{cards.map((c, i) => {
      const cx = x + (i % 2 ? 1 : -1) * (cw / 2 + 14), cy = y + (i < 2 ? -1 : 1) * (ch / 2 + 14);
      const a = at + i * 5, p = drawOn(f, a, 14);
      if (p <= 0) return null;
      const hi = i === pick && f >= pickAt;
      const col = hi ? NEON.coral : NEON.gold;
      const s = hi ? 1 + 0.06 * backE(f, pickAt, 10) : 1;
      return <g key={i} transform={`translate(${cx} ${cy}) scale(${s})`}>
        <rect x={-cw / 2} y={-ch / 2} width={cw} height={ch} rx={22} fill={hi ? NEON.coral : "#000"} opacity={hi ? 0.14 : 0.6} />
        <NeonPath d={`M ${-cw / 2 + 22} ${-ch / 2} L ${cw / 2 - 22} ${-ch / 2} Q ${cw / 2} ${-ch / 2} ${cw / 2} ${-ch / 2 + 22} L ${cw / 2} ${ch / 2 - 22} Q ${cw / 2} ${ch / 2} ${cw / 2 - 22} ${ch / 2} L ${-cw / 2 + 22} ${ch / 2} Q ${-cw / 2} ${ch / 2} ${-cw / 2} ${ch / 2 - 22} L ${-cw / 2} ${-ch / 2 + 22} Q ${-cw / 2} ${-ch / 2} ${-cw / 2 + 22} ${-ch / 2} Z`}
          p={p} w={3.5} color={col} />
        {!hidden && p > 0.4 && <>
          <circle cx={-cw / 2 + 62} cy={0} r={38} fill="none" stroke={col} strokeWidth={4} />
          <NeonText x={-cw / 2 + 62} y={20} size={52} color={col}>{c.letter}</NeonText>
          <NeonText x={-cw / 2 + 120} y={18} size={50} color={NEON.text} anchor="start" o={arrive(f, a + 6, 10)}>{c.text}</NeonText>
        </>}
      </g>;
    })}</g>;
  };

/** line-art PHONE (300x600 at scale 1, centred); children are drawn in phone-local coords (0,0 = screen centre) */
export const Phone: React.FC<{ x: number; y: number; scale?: number; rot?: number; p?: number; children?: React.ReactNode }> = ({ x, y, scale = 1, rot = 0, p = 1, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <rect x={-150} y={-300} width={300} height={600} rx={40} fill="#000" />
    <NeonPath d="M -110 -300 L 110 -300 Q 150 -300 150 -260 L 150 260 Q 150 300 110 300 L -110 300 Q -150 300 -150 260 L -150 -260 Q -150 -300 -110 -300 Z" p={p} w={4} />
    <NeonPath d="M -36 -278 L 36 -278" p={p} w={6} color={NEON.dim} glow={0} />
    {p >= 1 && children}
  </g>
);
/** a notification card (phone-local coords): icon ring, title, body; o/s for entrance */
export const Notification: React.FC<{ y: number; title: string; body: string; o?: number; s?: number; color?: string; muted?: boolean }> =
  ({ y, title, body, o = 1, s = 1, color = NEON.gold, muted }) => o <= 0 ? null : (
    <g opacity={o * (muted ? 0.45 : 1)} transform={`translate(0 ${y}) scale(${s})`}>
      <rect x={-130} y={-46} width={260} height={92} rx={18} fill="#000" />
      <NeonPath d="M -112 -46 L 112 -46 Q 130 -46 130 -28 L 130 28 Q 130 46 112 46 L -112 46 Q -130 46 -130 28 L -130 -28 Q -130 -46 -112 -46 Z" w={2.5} color={color} glow={0.5} />
      <circle cx={-92} cy={0} r={20} fill="none" stroke={color} strokeWidth={3} />
      <text x={-60} y={-6} fontFamily={WI_FONT} fontWeight={900} fontSize={24} fill={color}>{title}</text>
      <text x={-60} y={26} fontFamily={WI_FONT} fontWeight={700} fontSize={20} fill={NEON.muted}>{body}</text>
    </g>
  );

/** stamp: neon box text that slams in (scale 1.5 -> 1) */
export const Stamp: React.FC<{ f: number; x: number; y: number; text: string; at: number; out?: number; color?: string; size?: number; rot?: number; hidden?: boolean }> =
  ({ f, x, y, text, at, out = Infinity, color = NEON.coral, size = 64, rot = -5, hidden }) => {
    if (hidden || f < at) return null;
    const ex = Number.isFinite(out) ? leave(f, out) : 0;
    if (ex >= 1) return null;
    const p = drawOn(f, at, 8), s = 1.5 - 0.5 * p, w = text.length * size * 0.66 + 60;
    return <g opacity={Math.min(1, p * 1.8) * (1 - ex)} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-w / 2} y={-size * 0.92} width={w} height={size * 1.3} rx={12} fill="#000" opacity={0.6} />
      <NeonPath d={`M ${-w / 2} ${-size * 0.92} L ${w / 2} ${-size * 0.92} L ${w / 2} ${size * 0.38} L ${-w / 2} ${size * 0.38} Z`} w={5} color={color} />
      <NeonText x={0} y={size * 0.12} size={size} color={color} spacing={2}>{text}</NeonText>
    </g>;
  };

// ---------------------------------------------------------------- props (line art; p = draw-on progress)
export const Controller: React.FC<{ x?: number; y?: number; s?: number; rot?: number; p?: number; color?: string }> = ({ x = 0, y = 0, s = 1, rot = 0, p = 1, color = NEON.amber }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -70 -26 Q -84 -30 -92 -10 Q -108 34 -88 46 Q -70 54 -52 24 L 52 24 Q 70 54 88 46 Q 108 34 92 -10 Q 84 -30 70 -26 Q 0 -36 -70 -26 Z" fill="#000" />
    <NeonPath d="M -70 -26 Q -84 -30 -92 -10 Q -108 34 -88 46 Q -70 54 -52 24 L 52 24 Q 70 54 88 46 Q 108 34 92 -10 Q 84 -30 70 -26 Q 0 -36 -70 -26 Z" w={4} p={p} color={color} />
    <NeonPath d="M -62 -4 L -38 -4 M -50 -16 L -50 8" w={4} p={p} color={color} glow={0.4} />
    {[[46, -14], [60, -2], [32, -2], [46, 10]].map(([bx, by], i) => <circle key={i} cx={bx} cy={by} r={5} fill="none" stroke={i === 0 ? NEON.coral : color} strokeWidth={3} opacity={p} />)}
  </g>
);
/** TV seen from the front: outline frame + stand; `on` 0..1 lights the screen (flicker), children drawn in the screen */
export const TV: React.FC<{ x: number; y: number; s?: number; p?: number; on?: number; f?: number; children?: React.ReactNode }> = ({ x, y, s = 1, p = 1, on = 1, f = 0, children }) => {
  const fl = on * (0.75 + 0.25 * Math.abs(Math.sin(f * 0.37) * Math.cos(f * 0.11)));
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={420} ry={300} fill="url(#wiTvGlow)" opacity={fl} />
    <rect x={-200} y={-120} width={400} height={240} rx={10} fill="#000" />
    <rect x={-186} y={-106} width={372} height={212} fill={NEON.amber} opacity={0.12 * fl} />
    {children}
    <NeonPath d="M -200 -120 L 200 -120 L 200 120 L -200 120 Z" w={4} p={p} />
    <NeonPath d="M -40 120 L -70 170 L 70 170 L 40 120" w={3} p={p} color={NEON.dim} />
  </g>;
};
/** couch outline (front view, 760 wide); seat top at y - 120 */
export const Couch: React.FC<{ x: number; y: number; s?: number; p?: number; part?: "back" | "front" | "all" }> = ({ x, y, s = 1, p = 1, part = "all" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {part !== "front" && <><path d="M -330 -120 L -330 -300 Q -330 -330 -300 -330 L 300 -330 Q 330 -330 330 -300 L 330 -120 Z" fill="#000" />
      <NeonPath d="M -330 -120 L -330 -300 Q -330 -330 -300 -330 L 300 -330 Q 330 -330 330 -300 L 330 -120" w={3.5} p={p} color={NEON.dim} />
      <NeonPath d="M 0 -320 L 0 -130" w={2} p={p} color={NEON.dim} glow={0} dash="0 14" /></>}
    {part !== "back" && <><path d="M -380 -170 Q -380 -200 -350 -200 L -310 -200 Q -290 -200 -290 -170 L -290 -40 L 290 -40 L 290 -170 Q 290 -200 310 -200 L 350 -200 Q 380 -200 380 -170 L 380 0 L -380 0 Z" fill="#000" />
      <NeonPath d="M -380 0 L -380 -170 Q -380 -200 -350 -200 L -310 -200 Q -290 -200 -290 -170 L -290 -40 L 290 -40 L 290 -170 Q 290 -200 310 -200 L 350 -200 Q 380 -200 380 -170 L 380 0 Z" w={4} p={p} />
      <NeonPath d="M -350 0 L -350 30 M 350 0 L 350 30" w={4} p={p} color={NEON.dim} /></>}
  </g>
);
/** snack pile: chips bags, cans, pizza box, cup; n = how many items are visible (they pop in by index) */
export const SnackPile: React.FC<{ x: number; y: number; s?: number; n?: number; f?: number; at?: number }> = ({ x, y, s = 1, n = 8, f = 999, at = -999 }) => {
  const items: [string, number, number][] = [
    ["M -150 0 L -150 -40 L 70 -40 L 70 0 Z M -150 -40 L -120 -56 L 100 -56 L 70 -40", 0, 0],                         // pizza box
    ["M -50 -40 L -50 -130 Q -30 -140 -10 -130 L -10 -40 Z M -50 -120 L -10 -120", 0, 0],                               // can
    ["M 10 -40 Q 0 -100 14 -160 Q 60 -150 100 -160 Q 112 -100 102 -40 Z M 18 -150 L 96 -150", 0, 0],                    // chips bag
    ["M -140 -56 Q -150 -110 -134 -150 Q -100 -142 -66 -150 Q -54 -110 -66 -56 Z", 0, 0],                               // chips bag 2
    ["M 120 0 L 112 -110 L 168 -110 L 160 0 Z M 108 -110 L 172 -110 M 146 -110 L 160 -150", 0, 0],                      // cup + straw
    ["M -110 -150 L -110 -230 Q -92 -238 -74 -230 L -74 -150 Z", 0, 0],                                                 // can on top
    ["M 30 -160 Q 20 -210 34 -250 Q 66 -242 96 -250 Q 106 -210 96 -160 Z", 0, 0],                                       // bag on top
    ["M -60 -150 L -40 -200 L 20 -200 L 0 -150 Z", 0, 0],                                                                // candy box
  ];
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {items.slice(0, n).map(([d], i) => {
      const k = backE(f, at + i * 4, 10, 2.4);
      if (k <= 0) return null;
      return <g key={i} transform={`translate(0 ${(1 - k) * -60})`} opacity={Math.min(1, k * 2)}>
        <path d={d} fill="#000" /><NeonPath d={d} w={3.5} color={i % 3 === 1 ? NEON.coral : NEON.gold} glow={0.8} />
      </g>;
    })}
  </g>;
};
/** bed (side view, 700 wide, legs on y): headboard left, pillow, mattress, blanket wave */
export const Bed: React.FC<{ x: number; y: number; s?: number; p?: number }> = ({ x, y, s = 1, p = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <NeonPath d="M -350 0 L -350 -320 Q -350 -340 -330 -340 L -300 -340 Q -280 -340 -280 -320 L -280 -120 L 350 -120 L 350 0" w={4} p={p} />
    <NeonPath d="M -280 -120 L -280 -190 L 350 -190 L 350 -120" w={3} p={p} color={NEON.dim} />
    <NeonPath d="M -270 -190 Q -270 -250 -200 -250 Q -140 -250 -140 -200 L -140 -190" w={3.5} p={p} color={NEON.amber} />
  </g>
);
/** blanket over a lying figure (draw after the figure) */
export const Blanket: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => {
  const b = 4 * Math.sin(f * 0.07);
  const d = `M -150 -190 Q -60 ${-262 - b} 60 ${-252 - b} Q 200 ${-250 - b} 330 -210 L 350 -190 L 350 -120 L -150 -120 Z`;
  return <g transform={`translate(${x} ${y}) scale(${s})`}><path d={d} fill="#000" /><NeonPath d={d} w={4} color={NEON.gold} />
    <NeonPath d={`M -100 -200 Q 40 ${-236 - b} 300 -200`} w={2} color={NEON.dim} glow={0} dash="0 12" /></g>;
};
/** wall clock: r, hour hand angle from `hours` (float), minute hand follows */
export const Clock: React.FC<{ x: number; y: number; r?: number; hours: number; p?: number }> = ({ x, y, r = 80, hours, p = 1 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#000" />
    <NeonPath d={`M 0 ${-r} a ${r} ${r} 0 1 1 -0.01 0`} w={4} p={p} />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M 0 ${-r + 10} L 0 ${-r + 22}`} transform={`rotate(${i * 30})`} stroke={NEON.dim} strokeWidth={4} strokeLinecap="round" opacity={p} />)}
    <g transform={`rotate(${hours * 30})`}><NeonPath d={`M 0 8 L 0 ${-r * 0.5}`} w={6} color={NEON.amber} /></g>
    <g transform={`rotate(${hours * 360})`}><NeonPath d={`M 0 10 L 0 ${-r * 0.78}`} w={4} color={NEON.coral} /></g>
  </g>
);
/** car seen from behind (line art, ~340 wide at s 1, wheels on y) */
export const CarBack: React.FC<{ x: number; y: number; s?: number; rot?: number; f?: number }> = ({ x, y, s = 1, rot = 0, f = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -170 -40 L -170 -120 L -120 -130 L -90 -210 L 90 -210 L 120 -130 L 170 -120 L 170 -40 Z" fill="#000" />
    <NeonPath d="M -170 -40 L -170 -120 L -120 -130 L -90 -210 L 90 -210 L 120 -130 L 170 -120 L 170 -40 Z" w={4} />
    <NeonPath d="M -100 -135 L -76 -195 L 76 -195 L 100 -135 Z" w={2.5} color={NEON.dim} glow={0.3} />
    {[-1, 1].map((sd) => <g key={sd}><rect x={sd > 0 ? 112 : -162} y={-112} width={50} height={22} fill={NEON.coral} opacity={0.6 + 0.4 * Math.abs(Math.sin(f * 0.2))} />
      <NeonPath d={`M ${sd * 112} -112 L ${sd * 162} -112 L ${sd * 162} -90 L ${sd * 112} -90 Z`} w={3} color={NEON.coral} />
      <NeonPath d={`M ${sd * 150} -40 L ${sd * 150} 0 L ${sd * 104} 0 L ${sd * 104} -40`} w={4} /></g>)}
    <NeonPath d="M -50 -70 L 50 -70" w={3} color={NEON.dim} />
  </g>
);
/** perspective neon road to a vanishing point (vx, vy); centre dashes travel with f; `bend` shifts the far end */
export const Road: React.FC<{ f: number; vx?: number; vy?: number; bottom?: number; bend?: number; speed?: number }> = ({ f, vx = 540, vy = 760, bottom = 1460, bend = 0, speed = 1 }) => {
  const far = vx + bend;
  return <g>
    <NeonPath d={`M ${far - 14} ${vy} Q ${vx - 140 + bend * 0.3} ${(vy + bottom) / 2} -200 ${bottom}`} w={4} />
    <NeonPath d={`M ${far + 14} ${vy} Q ${vx + 140 + bend * 0.3} ${(vy + bottom) / 2} 1280 ${bottom}`} w={4} />
    {Array.from({ length: 7 }, (_, i) => {
      const t = (((f * 0.02 * speed + i / 7) % 1) + 1) % 1, tt = t * t;
      const yy = vy + (bottom - vy) * tt, xx = far + (540 - far) * tt + bend * 0.15 * (1 - tt), h = 8 + 90 * tt;
      return <NeonPath key={i} d={`M ${xx} ${yy} L ${xx} ${yy + h}`} w={2 + 8 * tt} color={NEON.amber} o={Math.min(1, (1 - t) * 4)} glow={0.6} />;
    })}
    {[-1, 1].map((sd) => Array.from({ length: 5 }, (_, i) => {
      const t = (((f * 0.015 * speed + i / 5) % 1) + 1) % 1, tt = t * t;
      const yy = vy + (bottom - vy) * tt, xx = far + sd * (30 + 760 * tt);
      return <g key={`${sd}${i}`} opacity={Math.min(1, (1 - t) * 4)}><NeonPath d={`M ${xx} ${yy} L ${xx} ${yy - 30 - 260 * tt}`} w={1.5 + 3 * tt} color={NEON.dim} dash={`0 ${6 + 12 * tt}`} glow={0.3} />
        <circle cx={xx} cy={yy - 30 - 260 * tt} r={3 + 9 * tt} fill={NEON.amber} opacity={0.8} /></g>;
    }))}
  </g>;
};
/** mission marker (diamond pin with pulse rings); o fades it, broken 0..1 dissolves it into dots */
export const MissionMarker: React.FC<{ x: number; y: number; s?: number; f: number; o?: number; broken?: number }> = ({ x, y, s = 1, f, o = 1, broken = 0 }) => {
  const bob = 8 * Math.sin(f * 0.12);
  return <g transform={`translate(${x} ${y + bob}) scale(${s})`} opacity={o}>
    {[0, 1].map((i) => { const t = ((f / 40 + i / 2) % 1); return <ellipse key={i} cx={0} cy={150} rx={40 + 80 * t} ry={(40 + 80 * t) * 0.3} fill="none" stroke={NEON.coral} strokeWidth={3} opacity={(1 - t) * (1 - broken)} />; })}
    <NeonPath d="M 0 -80 L 56 0 L 0 110 L -56 0 Z" w={5} color={NEON.coral} dash={broken > 0 ? `${Math.max(0.5, 30 * (1 - broken))} ${6 + 30 * broken}` : undefined} hot />
    <NeonPath d="M 0 -30 L 20 0 L 0 34 L -20 0 Z" w={3} color={NEON.amber} o={1 - broken} />
  </g>;
};
/** word bubble outline (w x h centred, tail toward (tx, ty) relative) */
export const Bubble: React.FC<{ x: number; y: number; w: number; h: number; tx?: number; ty?: number; p?: number; color?: string }> = ({ x, y, w, h, tx = -40, ty = 110, p = 1, color = NEON.gold }) => {
  const d = `M ${-w / 2 + 30} ${-h / 2} L ${w / 2 - 30} ${-h / 2} Q ${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 30} L ${w / 2} ${h / 2 - 30} Q ${w / 2} ${h / 2} ${w / 2 - 30} ${h / 2} L ${tx + 30} ${h / 2} L ${tx} ${ty} L ${tx - 6} ${h / 2} L ${-w / 2 + 30} ${h / 2} Q ${-w / 2} ${h / 2} ${-w / 2} ${h / 2 - 30} L ${-w / 2} ${-h / 2 + 30} Q ${-w / 2} ${-h / 2} ${-w / 2 + 30} ${-h / 2} Z`;
  return <g transform={`translate(${x} ${y})`}><path d={d} fill="#000" opacity={0.7 * p} /><NeonPath d={d} p={p} w={3.5} color={color} /></g>;
};

// ---------------------------------------------------------------- set dressing (static: wrap in <Bake>)
/** dark room in line art: floor line, wall corner perspective lines, dotted window with city lights, shelf, poster */
export const RoomLines: React.FC<{ p?: number; floor?: number; windowX?: number; bare?: boolean }> = ({ p = 1, floor = 1380, windowX = 760, bare = false }) => (
  <g>
    <NeonPath d={`M -400 ${floor} L 1480 ${floor}`} w={3} p={p} color={NEON.dim} glow={0.6} />
    <NeonPath d={`M -400 ${floor + 90} L 1480 ${floor + 90}`} w={1.5} p={p} color={NEON.faint} glow={0} dash="0 18" />
    <NeonPath d={`M 120 ${floor} L -60 ${floor + 300} M 960 ${floor} L 1140 ${floor + 300}`} w={2} p={p} color={NEON.faint} glow={0} />
    {!bare && <>
    <NeonPath d={`M ${windowX - 150} 420 L ${windowX + 150} 420 L ${windowX + 150} 780 L ${windowX - 150} 780 Z`} w={2.5} p={p} color={NEON.dim} dash="0 14" glow={0.5} />
    <NeonPath d={`M ${windowX} 420 L ${windowX} 780 M ${windowX - 150} 600 L ${windowX + 150} 600`} w={2} p={p} color={NEON.faint} glow={0} />
    {Array.from({ length: 5 }, (_, i) => <NeonPath key={i} d={`M ${windowX - 130 + i * 58} 780 L ${windowX - 130 + i * 58} ${700 - ((i * 37) % 4) * 40}`} w={2} p={p} color={NEON.dim} glow={0.4} />)}
    <NeonPath d={`M -60 560 L 260 560`} w={2.5} p={p} color={NEON.dim} />
    <NeonPath d={`M 0 560 L 0 500 L 40 500 L 40 560 M 60 560 L 60 480 L 92 480 L 92 560 M 150 560 Q 170 520 200 540 Q 210 560 190 560`} w={2} p={p} color={NEON.faint} glow={0.3} />
    </>}
  </g>
);
/** skyline of dotted building outlines with window dots (for backgrounds); base = ground y */
export const Skyline: React.FC<{ base: number; p?: number; seed?: number; color?: string }> = ({ base, p = 1, seed = 0, color = NEON.dim }) => (
  <g>{Array.from({ length: 9 }, (_, i) => {
    const w = 120 + rnd(i + seed) * 90, h = 200 + rnd(i * 2.3 + seed) * 420, x = -200 + i * 170;
    return <g key={i}>
      <NeonPath d={`M ${x} ${base} L ${x} ${base - h} L ${x + w} ${base - h} L ${x + w} ${base}`} w={2} p={p} color={color} dash="0 12" glow={0.5} />
      {Array.from({ length: Math.floor(h / 70) }, (_, r) => <path key={r} d={`M ${x + 22} ${base - h + 40 + r * 70} L ${x + w - 22} ${base - h + 40 + r * 70}`} stroke={NEON.amber} strokeWidth={4} strokeDasharray="6 22" opacity={0.25 * p * (rnd(i * 9 + r) > 0.4 ? 1 : 0.2)} />)}
    </g>;
  })}</g>
);
/** a 6x5 day calendar: `lit` days lit gold, the rest dim; `cross` from day index on shows faint x's */
export const Calendar30: React.FC<{ x: number; y: number; lit: number; f: number; cell?: number; cross?: number }> = ({ x, y, lit, f, cell = 120, cross = 99 }) => (
  <g>{Array.from({ length: 30 }, (_, i) => {
    const cx = x + (i % 6) * cell, cy = y + Math.floor(i / 6) * cell, on = i < lit;
    const d = `M ${cx + 8} ${cy + 8} L ${cx + cell - 8} ${cy + 8} L ${cx + cell - 8} ${cy + cell - 8} L ${cx + 8} ${cy + cell - 8} Z`;
    return <g key={i}>
      {on && <rect x={cx + 10} y={cy + 10} width={cell - 20} height={cell - 20} fill={NEON.gold} opacity={0.16} />}
      <NeonPath d={d} w={on ? 3 : 1.5} color={on ? NEON.gold : NEON.faint} glow={on ? 0.6 : 0} />
      <text x={cx + cell / 2} y={cy + cell / 2 + 14} textAnchor="middle" fontFamily={WI_FONT} fontWeight={800} fontSize={36} fill={on ? NEON.amber : NEON.faint}>{i + 1}</text>
      {i >= cross && <path d={`M ${cx + 26} ${cy + 26} L ${cx + cell - 26} ${cy + cell - 26} M ${cx + cell - 26} ${cy + 26} L ${cx + 26} ${cy + cell - 26}`} stroke={NEON.red} strokeWidth={3} opacity={0.35 + 0.15 * Math.sin(f * 0.3 + i)} />}
    </g>;
  })}</g>
);
/** Z z z rising */
export const Zzz: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g>{[0, 1, 2].map((i) => { const t = ((f / 60 + i / 3) % 1); return <g key={i} transform={`translate(${x + 40 * t + i * 10} ${y - 160 * t}) scale(${s * (0.6 + 0.6 * t)})`} opacity={Math.min(1, (1 - t) * 3) * Math.min(1, t * 6)}>
    <NeonPath d="M -18 -18 L 18 -18 L -18 18 L 18 18" w={4} color={NEON.amber} /></g>; })}</g>
);
/** loop arrow (repeat) icon */
export const RepeatIcon: React.FC<{ x: number; y: number; s?: number; p?: number; color?: string }> = ({ x, y, s = 1, p = 1, color = NEON.gold }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <NeonPath d="M -60 10 A 60 60 0 0 1 50 -30 M 50 -30 L 56 -64 M 50 -30 L 18 -40" w={6} p={p} color={color} />
    <NeonPath d="M 60 -10 A 60 60 0 0 1 -50 30 M -50 30 L -56 64 M -50 30 L -18 40" w={6} p={p} color={color} />
  </g>
);
export const MoonIcon: React.FC<{ x: number; y: number; s?: number; p?: number; color?: string }> = ({ x, y, s = 1, p = 1, color = NEON.gold }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><NeonPath d="M 20 -62 A 64 64 0 1 0 60 26 A 50 50 0 1 1 20 -62 Z" w={6} p={p} color={color} /></g>
);
