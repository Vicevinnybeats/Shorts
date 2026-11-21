// WHAT IF #2 "What If You Moved to the Real Leonida?" - Golden Neon look (library/whatif, brain/style-whatif.md).
// Remy (fictional, neon silhouette: hoodie + beanie tuft) moves to the real "Leonida" (GTA 6's made-up Florida).
// Facts (RESEARCH.md): FWC ~1.3 million alligators in all 67 counties, serious injuries rare; Florida has the highest
// lightning density of any US state and leads in lightning deaths; ~40% of US hurricane landfalls are in Florida;
// NWS slogan "When thunder roars, go indoors". "GTA 6" only as plain words: no game art, logos or the game's map
// (the outline is a hand-drawn Florida-like peninsula). Every beat is cue-driven (C(phrase, fallback)).
// Motion fixes 2026-11-21 applied: labels finish typing in <= 10 f, choice cards only in the last shot (built in
// 0.6 s), figures above y 1430, big HUD, no counter during the chapter screen, dip-through-black place changes
// (makeWhatIfScene), short on-screen text.
import React from "react";
import { interpolate } from "remotion";
import type { Story } from "../../src/engine/EpisodeShort";
import { EASE, arrive, leave } from "../../src/engine25/motion";
import {
  NEON, NeonPath, NeonText, HudText, StrokeWord, Plane, WCam, camDrift, camKick, Spotlight, Particles, LiveCounter, CompareBars,
  ChapterScreen, ChoiceCards, Stamp, TV, Clock, NeonFigure, FloorGlow, LOOKS, Digits, drawOn, rnd, makeWhatIfScene, WiView,
} from "../../library/whatif/kit";
import scenes from "../../content/scripts/wi-gta-leonida.json";

const SHOTS = scenes.shots.map((s) => ({ id: s.id, cue: s.cue }));
const k = (u: number, a: number, b: number, from: number, to: number, e = EASE.camera) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const blinkOf = (f: number, seed = 0) => ((f + seed * 37) % 97) < 4;
const REMY = LOOKS.remy;
const { gold: GOLD, coral: CORAL, amber: AMBER, text: CREAM, muted: MUTED, dim: DIM, faint: FAINT, cyan: CYAN } = NEON;
const at = (x: number, y: number, zoom: number, rot = 0): WCam => ({ x: x - 540, y: y - 960, zoom, rot });

// ---------------------------------------------------------------- episode props (line art)
type Pt = [number, number];
/** smooth closed/open path through points (quadratic curves via midpoints) */
const smooth = (pts: Pt[], closed = true) => {
  const n = pts.length, mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (!closed) return `M ${pts[0][0]} ${pts[0][1]} ` + pts.slice(1, -1).map((p, i) => { const m = mid(p, pts[i + 2]); return `Q ${p[0]} ${p[1]} ${m[0]} ${m[1]}`; }).join(" ") + ` L ${pts[n - 1][0]} ${pts[n - 1][1]}`;
  const m0 = mid(pts[n - 1], pts[0]);
  return `M ${m0[0]} ${m0[1]} ` + pts.map((p, i) => { const m = mid(p, pts[(i + 1) % n]); return `Q ${p[0]} ${p[1]} ${m[0]} ${m[1]}`; }).join(" ") + " Z";
};
/** a Florida-like peninsula (hand-drawn from rough coastline landmarks, local box 0..795 x 0..716); the real state,
 *  never the game's map */
const FL: Pt[] = [[0, 0], [273, 0], [588, 40], [640, 30], [651, 85], [661, 133], [693, 217], [735, 314], [756, 411], [795, 519], [790, 600], [782, 640],
  [756, 700], [720, 716], [683, 706], [640, 660], [609, 592], [588, 531], [560, 470], [515, 398], [504, 338], [483, 229], [420, 145], [347, 121],
  [300, 140], [273, 169], [240, 130], [200, 109], [116, 72], [32, 85], [0, 85]];
const FCX = 398, FCY = 358;
const FL_D = smooth(FL);
const inside = (x: number, y: number) => { let c = false; for (let i = 0, j = FL.length - 1; i < FL.length; j = i++) { const [xi, yi] = FL[i], [xj, yj] = FL[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
/** 67 county dots spread inside the outline (deterministic) */
const COUNTY: Pt[] = (() => {
  const out: Pt[] = [];
  for (let i = 0; out.length < 67 && i < 5000; i++) {
    const x = 10 + rnd(i * 1.7) * 780, y = 10 + rnd(i * 2.9 + 4) * 700;
    if (!inside(x, y) || !inside(x + 14, y) || !inside(x - 14, y) || !inside(x, y + 14) || !inside(x, y - 14)) continue;
    if (out.some(([a, b]) => (a - x) ** 2 + (b - y) ** 2 < 36 ** 2)) continue;
    out.push([x, y]);
  }
  return out.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
})();
const MIAMI: Pt = [768, 628];
/** map centred on (x, y); p = draw-on; dots = lit county dots; dash/color for the "made up" look */
const FloridaMap: React.FC<{ x: number; y: number; s: number; p?: number; color?: string; dash?: string; f?: number; dots?: number; glow?: number }> =
  ({ x, y, s, p = 1, color = GOLD, dash, f = 0, dots = 0, glow = 1 }) => (
    <g transform={`translate(${x - FCX * s} ${y - FCY * s}) scale(${s})`}>
      {p >= 1 && <path d={FL_D} fill={color} opacity={0.05} />}
      <NeonPath d={FL_D} w={5 / Math.sqrt(s)} p={dash ? 1 : p} color={color} dash={dash} travel={dash ? -f * 1.5 : 0} hot={!dash} glow={glow} />
      {COUNTY.slice(0, Math.round(dots)).map(([cx, cy], i) => <g key={i}>
        <circle cx={cx} cy={cy} r={22} fill={AMBER} opacity={0.15} />
        <circle cx={cx} cy={cy} r={9} fill={i % 9 === 4 ? CORAL : AMBER} />
      </g>)}
    </g>
  );
const mapPt = (x: number, y: number, s: number, q: Pt): Pt => [x - FCX * s + q[0] * s, y - FCY * s + q[1] * s];

/** palm tree: curved trunk + 5 fronds; (x, y) = base, h = height */
const Palm: React.FC<{ x: number; y: number; h: number; p?: number; f?: number; flip?: boolean; color?: string }> = ({ x, y, h, p = 1, f = 0, flip, color = GOLD }) => {
  const sx = flip ? -1 : 1, sw = Math.sin(f * 0.05) * 6;
  const tx = 40 * sx, ty = -h;
  return <g transform={`translate(${x} ${y})`}>
    <NeonPath d={`M 0 0 Q ${10 * sx} ${-h * 0.55} ${tx} ${ty}`} w={5} p={p} color={color} />
    <NeonPath d={`M 4 -40 L ${16 * sx} -48 M 8 ${-h * 0.35} L ${22 * sx} ${-h * 0.35 - 8} M 14 ${-h * 0.62} L ${30 * sx} ${-h * 0.62 - 8}`} w={2.5} p={p} color={DIM} glow={0.3} />
    {[[-150, 50], [-80, -40], [10, -70], [100, -30], [160, 60]].map(([fx, fy], i) =>
      <NeonPath key={i} d={`M ${tx} ${ty} Q ${tx + fx * 0.5} ${ty + fy - 60 + sw} ${tx + fx} ${ty + fy + 20 + sw * (i % 2 ? 1 : -1)}`} w={4} p={p} color={i % 2 ? AMBER : GOLD} />)}
  </g>;
};
/** alligator side view (~600 long at s 1, belly on y, facing right); eyes 0 = it reads as a log; dir -1 faces left */
const Gator: React.FC<{ x: number; y: number; s?: number; eyes?: number; f?: number; dir?: number; p?: number; color?: string }> = ({ x, y, s = 1, eyes = 1, f = 0, dir = 1, p = 1, color = GOLD }) => {
  const t = Math.sin(f * 0.08) * 8 * (eyes > 0.5 ? 1 : 0.2);
  const body = `M -300 ${-10 + t} Q -200 -30 -120 -50 Q -40 -76 60 -72 Q 140 -68 182 -56 L 300 -40 Q 322 -28 300 -16 L 190 -8 Q 120 0 40 0 L -120 0 Q -220 -2 -300 ${-10 + t} Z`;
  const ridge = Array.from({ length: 9 }, (_, i) => { const bx = -150 + i * 30, by = -58 - 10 * Math.sin((i / 8) * Math.PI); return `M ${bx} ${by + 6} L ${bx + 10} ${by - 10} L ${bx + 20} ${by + 6}`; }).join(" ");
  return <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
    <path d={body} fill="#030202" />
    <NeonPath d={body} w={4.5} p={p} color={color} />
    <NeonPath d={ridge} w={3} p={p} color={eyes > 0.5 ? AMBER : DIM} glow={0.4} />
    <NeonPath d="M -60 0 L -84 20 M 90 -2 L 112 18 M 210 -24 L 290 -26" w={3.5} p={p} color={DIM} glow={0.3} />
    {/* eye bump + eye that opens */}
    <NeonPath d="M 150 -66 Q 166 -88 182 -66" w={4} p={p} color={color} />
    {eyes > 0.02 && <>
      <circle cx={166} cy={-72} r={22} fill={CORAL} opacity={0.18 * eyes} />
      <ellipse cx={166} cy={-72} rx={9} ry={Math.max(0.5, 7 * eyes)} fill={NEON.hot} />
      <ellipse cx={166} cy={-72} rx={2.5} ry={Math.max(0.5, 6 * eyes)} fill={CORAL} />
    </>}
    {eyes <= 0.02 && <NeonPath d="M 154 -71 L 178 -71" w={3} color={DIM} glow={0} />}
  </g>;
};
const CLOUD_D = "M -200 60 Q -250 60 -250 10 Q -250 -40 -190 -44 Q -180 -110 -100 -104 Q -60 -160 20 -140 Q 90 -170 130 -100 Q 210 -110 220 -40 Q 270 -30 260 20 Q 255 60 200 60 Z";
const Cloud: React.FC<{ x: number; y: number; s?: number; p?: number; color?: string; o?: number }> = ({ x, y, s = 1, p = 1, color = GOLD, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {p >= 1 && <path d={CLOUD_D} fill="#040303" />}
    <NeonPath d={CLOUD_D} w={4 / Math.sqrt(s)} p={p} color={color} />
    <NeonPath d="M -160 30 Q -40 50 120 26" w={2} p={p} color={DIM} glow={0} dash="0 14" />
  </g>
);
/** lightning bolt from (x, y) down `len`; seed varies the zigzag; o = flash */
const Bolt: React.FC<{ x: number; y: number; len: number; seed?: number; o?: number; w?: number; color?: string }> = ({ x, y, len, seed = 0, o = 1, w = 6, color = AMBER }) => {
  if (o <= 0.01) return null;
  const n = 6, pts = Array.from({ length: n + 1 }, (_, i) => [x + (i === 0 || i === n ? 0 : (rnd(seed * 7 + i) - 0.5) * 70), y + (len * i) / n]);
  const d = pts.map((q, i) => `${i ? "L" : "M"} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ");
  return <g opacity={o}><NeonPath d={d} w={w} color={color} hot join="miter" />
    <circle cx={x} cy={y + len} r={30} fill={AMBER} opacity={0.3} /><circle cx={x} cy={y + len} r={10} fill={NEON.hot} /></g>;
};
/** periodic bolt flash 0..1 (strike every `per` frames, lasting 6) */
const flash = (u: number, per: number, off = 0) => { const t = (u + off) % per; return t < 6 ? [1, 0.4, 1, 0.7, 0.35, 0.1][t] : 0; };
const Rain: React.FC<{ f: number; x: number; y: number; w: number; h: number; n?: number; o?: number }> = ({ f, x, y, w, h, n = 40, o = 1 }) => (
  <g opacity={o}>{Array.from({ length: n }, (_, i) => {
    const px = x + rnd(i * 3.1) * w, py = y + ((rnd(i * 5.3) * h + f * (22 + 8 * rnd(i))) % h);
    return <path key={i} d={`M ${px} ${py} l -8 30`} stroke={DIM} strokeWidth={3} strokeLinecap="round" opacity={0.7} />;
  })}</g>
);
const Sun: React.FC<{ x: number; y: number; r?: number; f?: number; p?: number; o?: number }> = ({ x, y, r = 70, f = 0, p = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <circle r={r * 1.8} fill={AMBER} opacity={0.08} />
    <NeonPath d={`M 0 ${-r} a ${r} ${r} 0 1 1 -0.01 0`} w={5} p={p} color={AMBER} hot />
    <g transform={`rotate(${f * 0.6})`}>{Array.from({ length: 10 }, (_, i) => <g key={i} transform={`rotate(${i * 36})`}><NeonPath d={`M 0 ${-r - 22} L 0 ${-r - 48}`} w={4} p={p} color={GOLD} glow={0.5} /></g>)}</g>
  </g>
);
const Suitcase: React.FC<{ x: number; y: number; s?: number; p?: number }> = ({ x, y, s = 1, p = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-60} y={-130} width={120} height={130} rx={14} fill="#000" />
    <NeonPath d="M -46 -130 L 46 -130 Q 60 -130 60 -116 L 60 -14 Q 60 0 46 0 L -46 0 Q -60 0 -60 -14 L -60 -116 Q -60 -130 -46 -130 Z" w={4} p={p} color={CORAL} />
    <NeonPath d="M -22 -130 L -22 -158 L 22 -158 L 22 -130 M -60 -66 L 60 -66" w={3.5} p={p} color={GOLD} />
  </g>
);
const PlaneIcon: React.FC<{ x: number; y: number; rot: number; s?: number }> = ({ x, y, rot, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <NeonPath d="M -40 0 L 40 0 M 4 0 L -14 -36 M 4 0 L -14 36 M -34 0 L -44 -14 M -34 0 L -44 14" w={5} color={NEON.hot} />
  </g>
);
/** hurricane symbol: eye + two curled arms, spins */
const Spiral: React.FC<{ x: number; y: number; s?: number; f?: number; color?: string; o?: number }> = ({ x, y, s = 1, f = 0, color = CORAL, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${-f * 6}) scale(${s})`} opacity={o}>
    <NeonPath d="M 0 -16 a 16 16 0 1 1 -0.01 0" w={4} color={color} />
    <NeonPath d="M 0 -16 Q 30 -40 10 -56 M 0 16 Q -30 40 -10 56" w={4} color={color} />
  </g>
);
const Frame: React.FC<{ x: number; y: number; w: number; h: number; p?: number; color?: string; dash?: string; f?: number }> = ({ x, y, w, h, p = 1, color = DIM, dash, f = 0 }) => {
  const r = 22, d = `M ${x - w / 2 + r} ${y - h / 2} L ${x + w / 2 - r} ${y - h / 2} Q ${x + w / 2} ${y - h / 2} ${x + w / 2} ${y - h / 2 + r} L ${x + w / 2} ${y + h / 2 - r} Q ${x + w / 2} ${y + h / 2} ${x + w / 2 - r} ${y + h / 2} L ${x - w / 2 + r} ${y + h / 2} Q ${x - w / 2} ${y + h / 2} ${x - w / 2} ${y + h / 2 - r} L ${x - w / 2} ${y - h / 2 + r} Q ${x - w / 2} ${y - h / 2} ${x - w / 2 + r} ${y - h / 2} Z`;
  return <g><path d={d} fill="#000" opacity={0.55 * Math.min(1, p)} /><NeonPath d={d} w={3} p={dash ? 1 : p} color={color} dash={dash} travel={dash ? -f : 0} glow={0.5} /></g>;
};
const Check: React.FC<{ x: number; y: number; p: number; s?: number }> = ({ x, y, p, s = 1 }) => p <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`}><circle r={30} fill="#000" /><NeonPath d="M -30 0 a 30 30 0 1 1 0.01 0" w={3} p={p} color={CORAL} />
    <NeonPath d="M -14 0 L -3 12 L 16 -12" w={5} p={p} color={CORAL} hot /></g>
);
/** wishlist icons (centre x, y; ~200 box) */
const SwampIcon: React.FC<{ x: number; y: number; p: number; f: number }> = ({ x, y, p, f }) => (
  <g transform={`translate(${x} ${y})`}>
    {[-60, -20, 30, 70].map((rx, i) => <NeonPath key={i} d={`M ${rx} 50 Q ${rx + 6 * Math.sin(f * 0.06 + i)} -10 ${rx + 10} ${-60 + i * 12}`} w={3.5} p={p} color={i % 2 ? AMBER : GOLD} />)}
    {[-46, 46].map((rx, i) => <ellipse key={i} cx={rx} cy={-40 + i * 20} rx={7} ry={20} fill={GOLD} opacity={0.6 * p} />)}
    <NeonPath d="M -90 54 Q -60 44 -30 54 T 30 54 T 90 54" w={3} p={p} color={DIM} dash="0 12" travel={-f} />
    <NeonPath d="M -80 78 Q -50 68 -20 78 T 40 78 T 90 78" w={2.5} p={p} color={FAINT} glow={0} />
  </g>
);
const BeachIcon: React.FC<{ x: number; y: number; p: number; f: number }> = ({ x, y, p, f }) => (
  <g transform={`translate(${x} ${y})`}>
    <Sun x={50} y={-46} r={22} f={f} p={p} />
    <NeonPath d="M -70 -10 Q -30 -60 10 -10 Z M -30 -36 L -30 60" w={4} p={p} color={CORAL} />
    <NeonPath d={`M -90 ${56 + 4 * Math.sin(f * 0.1)} Q -45 ${40 + 4 * Math.sin(f * 0.1)} 0 56 T 90 56`} w={3.5} p={p} color={GOLD} />
    <NeonPath d="M -90 80 Q -45 66 0 80 T 90 80" w={2.5} p={p} color={DIM} dash="0 12" travel={-f} />
  </g>
);
const CarIcon: React.FC<{ x: number; y: number; p: number; f: number; s?: number }> = ({ x, y, p, f, s = 1 }) => {
  const car = "M -90 30 L -90 0 Q -86 -10 -60 -14 L -30 -40 L 40 -40 L 70 -12 Q 96 -8 96 10 L 96 30 Z";
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={car} fill="#000" /><NeonPath d={car} w={4} p={p} color={GOLD} />
    <NeonPath d="M -24 -34 L 34 -34 L 56 -14 L -46 -14 Z" w={2.5} p={p} color={DIM} glow={0.3} />
    {[-50, 56].map((wx, i) => <g key={i}><circle cx={wx} cy={32} r={18} fill="#000" /><NeonPath d={`M ${wx} 14 a 18 18 0 1 1 -0.01 0`} w={4} p={p} color={AMBER} /></g>)}
    {[0, 1, 2].map((i) => { const t = ((f * 0.06 + i / 3) % 1); return <NeonPath key={i} d={`M ${-110 - 60 * t} ${-20 + i * 18} l -40 0`} w={3} p={p} color={CORAL} o={1 - t} glow={0.4} />; })}
  </g>;
};
const House: React.FC<{ x: number; y: number; p?: number; door?: number }> = ({ x, y, p = 1, door = 0 }) => {
  const d = "M -130 0 L -130 -170 L 0 -280 L 130 -170 L 130 0 Z";
  return <g transform={`translate(${x} ${y})`}>
    <path d={d} fill="#040303" />
    <NeonPath d={d} w={4} p={p} color={GOLD} />
    <rect x={-34} y={-120} width={68} height={120} fill={AMBER} opacity={0.18 + 0.3 * door} />
    <NeonPath d="M -34 0 L -34 -120 L 34 -120 L 34 0" w={3.5} p={p} color={AMBER} />
    <NeonPath d="M 60 -130 L 104 -130 L 104 -86 L 60 -86 Z" w={3} p={p} color={DIM} />
    <rect x={62} y={-128} width={40} height={40} fill={AMBER} opacity={0.25 * p} />
  </g>;
};
/** two-pole respawn arrows (cyan = game, not real) */
const RespawnIcon: React.FC<{ x: number; y: number; s?: number; p?: number; f?: number }> = ({ x, y, s = 1, p = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${f * 3}) scale(${s})`}>
    <NeonPath d="M -60 10 A 60 60 0 0 1 50 -30 M 50 -30 L 56 -64 M 50 -30 L 18 -40" w={6} p={p} color={CYAN} />
    <NeonPath d="M 60 -10 A 60 60 0 0 1 -50 30 M -50 30 L -56 64 M -50 30 L -18 40" w={6} p={p} color={CYAN} />
  </g>
);
const fmt = (v: number) => Math.round(v).toLocaleString("en-US");
const Ground: React.FC<{ y?: number; f: number }> = ({ y = 1330, f }) => <>
  <NeonPath d={`M -300 ${y} L 1380 ${y}`} w={3} color={DIM} />
  <NeonPath d={`M -300 ${y + 60} L 1380 ${y + 60}`} w={1.5} color={FAINT} glow={0} dash="0 18" travel={-f * 0.6} />
</>;

// ---------------------------------------------------------------- shots
const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number, hide: boolean): WiView => {
  switch (id) {
    case "hook": { // frame 0 = hook: WHAT IF already mid-draw, the peninsula outline drawing on; MOVE TO THE REAL LEONIDA?
      // "made up" -> outline dashed cyan (MADE-UP FLORIDA) + DAY 001 counter; "pack a bag" -> outline solid gold, suitcase, flight path
      const MU = C("made up", 149), PK = C("So let's pack", 188);
      const wp = k(u, 0, 34, 0.42, 1, EASE.arrive);
      const mp = k(u, 0, 40, 0.35, 1, EASE.arrive);
      const real = u >= PK;
      const cam = camDrift(at(540, 980, k(u, 0, len, 1.0, 1.05)), f, 3);
      const mx = 500, my = 1030, ms = 0.66;
      const [miX, miY] = mapPt(mx, my, ms, MIAMI);
      const fp = drawOn(u, PK + 6, 40);
      const fx = (t: number) => { const a: Pt = [0, 800], c: Pt = [380, 720], b: Pt = [miX, miY]; return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]; };
      const [px, py] = fx(fp), [qx, qy] = fx(Math.min(1, fp + 0.02));
      const world = <>
        <Plane p={1}>
          <Spotlight x={500} floor={1330} f={f} w={760} o={0.55} />
          <FloridaMap x={mx} y={my} s={ms} p={mp} f={f} color={real ? GOLD : u >= MU ? CYAN : GOLD} dash={u >= MU && !real ? "0 16" : undefined} glow={real ? 1 : 0.7} />
          {real && <g opacity={arrive(u, PK, 10)}><circle cx={miX} cy={miY} r={22 + 10 * Math.abs(Math.sin(f * 0.12))} fill={CORAL} opacity={0.25} /><circle cx={miX} cy={miY} r={10} fill={CORAL} /></g>}
          {fp > 0 && fp < 1 && <><NeonPath d={`M 0 800 Q 380 720 ${miX} ${miY}`} w={3} p={fp} color={NEON.hot} dash={undefined} glow={0.5} />
            <PlaneIcon x={px} y={py} rot={(Math.atan2(qy - py, qx - px) * 180) / Math.PI} s={1.1} /></>}
          <NeonFigure x={930} y={1330} scale={0.55} look={REMY} pose={real ? "wave" : "stand"} expr={real ? "happy" : "neutral"} f={f} blink={blinkOf(f)} />
          <FloorGlow x={930} y={1330} w={140} />
          {real && <g transform={`translate(0 ${(1 - arrive(u, PK, 10)) * -40})`} opacity={arrive(u, PK, 8)}><Suitcase x={830} y={1330} s={0.62} /></g>}
        </Plane>
        <Particles f={f} y={300} h={1100} n={28} />
      </>;
      const hud = !hide && <>
        <g opacity={1 - leave(u, MU - 8)}><StrokeWord text="WHAT IF" x={540} y={340} h={140} p={wp} /></g>
        <HudText f={u} x={540} y={580} size={58} color={CREAM} enter="rise" at={12} out={MU - 8}>MOVE TO THE</HudText>
        <HudText f={u} x={540} y={672} size={78} color={CORAL} enter="scale" at={20} out={MU - 8}>REAL LEONIDA?</HudText>
        <LiveCounter f={u} label="DAY" from={0} to={1} at={MU} dur={14} />
        <HudText f={u} x={540} y={672} size={64} color={CYAN} enter="rise" at={MU + 2} out={PK - 6}>MADE-UP FLORIDA</HudText>
        <HudText f={u} x={540} y={672} size={70} color={GOLD} enter="scale" at={PK + 2} out={len - 6}>PACK A BAG</HudText>
      </>;
      return { cam, world, hud };
    }
    case "miami": { // neon skyline + palms, heat shimmer; Remy arrives with the suitcase; HUMIDITY meter fills to coral
      const LI = C("lands in", 43), TA = C("The air", 82);
      const cam = camDrift(at(540, 1000, k(u, 0, len, 1.0, 1.05)), f, 3);
      const sp = k(u, 0, 26, 0.3, 1, EASE.arrive);
      const hum = k(u, 14, TA + 30, 0.25, 0.96, EASE.arrive);
      const sweat = u >= TA;
      const world = <>
        <Plane p={0.5}>
          {Array.from({ length: 8 }, (_, i) => {
            const w = 100 + rnd(i + 21) * 70, h = 150 + rnd(i * 2.3 + 9) * 230, x = -120 + i * 165;
            return <g key={i}><NeonPath d={`M ${x} 1300 L ${x} ${1300 - h} L ${x + w} ${1300 - h} L ${x + w} 1300`} w={2} p={sp} color={DIM} dash={sp >= 1 ? "0 12" : undefined} glow={0.5} />
              {Array.from({ length: Math.floor(h / 60) }, (_, r) => <path key={r} d={`M ${x + 18} ${1300 - h + 34 + r * 60} L ${x + w - 18} ${1300 - h + 34 + r * 60}`} stroke={AMBER} strokeWidth={4} strokeDasharray="6 20" opacity={0.25 * sp * (rnd(i * 9 + r) > 0.4 ? 1 : 0.2)} />)}</g>;
          })}
          <Sun x={300} y={960} r={56} f={f} p={sp} o={0.8} />
        </Plane>
        <Plane p={1}>
          {Array.from({ length: 6 }, (_, i) => {
            const t = ((f * 0.008 + i / 6) % 1), yy = 1260 - 320 * t, xx = 140 + i * 160;
            return <NeonPath key={i} d={`M ${xx - 60} ${yy} q 15 -14 30 0 t 30 0 t 30 0 t 30 0`} w={3} color={CORAL} o={Math.sin(t * Math.PI) * 0.7} glow={0.5} />;
          })}
          <Ground f={f} />
          <Palm x={120} y={1330} h={400} f={f} p={sp} />
          <Palm x={985} y={1330} h={380} f={f + 20} p={sp} flip />
          <Spotlight x={540} floor={1330} f={f} w={520} o={0.7} />
          <NeonFigure x={520} y={1330} scale={0.8} look={REMY} pose={sweat ? "slump" : "wave"} expr={sweat ? "tired" : "happy"} f={f} blink={blinkOf(f, 2)} />
          {sweat && [0, 1].map((i) => { const t = ((u - TA) / 24 + i * 0.5) % 1; return <ellipse key={i} cx={470 + i * 100} cy={1000 + 60 * t} rx={6} ry={10} fill={CYAN} opacity={(1 - t) * 0.8} />; })}
          <Suitcase x={680} y={1330} s={0.75} />
          <FloorGlow x={560} y={1330} w={240} color={sweat ? CORAL : GOLD} />
        </Plane>
        <Particles f={f} n={18} color={CORAL} seed={2} />
      </>;
      const hud = !hide && <>
        <LiveCounter f={u} label="DAY" from={1} to={1} at={0} dur={6} />
        <HudText f={u} x={540} y={690} size={110} color={GOLD} enter="scale" at={LI} out={TA - 6} tube spacing={8}>MIAMI</HudText>
        <HudText f={u} x={540} y={690} size={84} color={CORAL} enter="scale" at={TA + 4} out={len - 6}>WET TOWEL</HudText>
        <g opacity={arrive(u, 12, 10) * (1 - leave(u, len - 6))}>
          <text x={70} y={790} fontFamily="CaptionSans" fontWeight={800} fontSize={40} letterSpacing={4} fill={MUTED}>HUMIDITY</text>
          <NeonPath d="M 340 760 L 950 760 L 950 808 L 340 808 Z" w={2.5} color={DIM} glow={0.4} p={drawOn(u, 12, 12)} />
          <rect x={346} y={766} width={598 * hum} height={36} fill={hum > 0.8 ? CORAL : GOLD} opacity={0.35} />
          <NeonPath d={`M 346 784 L ${346 + 598 * hum} 784`} w={6} color={hum > 0.8 ? CORAL : GOLD} hot />
        </g>
      </>;
      return { cam, world, hud };
    }
    case "wish": { // Remy's wishlist: three dotted frames fill with SWAMP / BEACH / FAST CAR icons, each ticked on its cue
      const SW = C("Swamps.", 74), BE = C("Beaches.", 92), FC = C("Fast cars.", 110);
      const cam = camDrift(at(540, 980, k(u, 0, len, 1.04, 1.0)), f, 2);
      const cols = [{ x: 220, c: SW, t: "SWAMPS" }, { x: 520, c: BE, t: "BEACHES" }, { x: 820, c: FC, t: "FAST CARS" }];
      const world = <>
        <Plane p={1}>
          <Ground f={f} />
          <Spotlight x={540} floor={1330} f={f} w={560} />
          {cols.map((c, i) => <g key={i}>
            <Frame x={c.x} y={670} w={250} h={240} p={drawOn(u, 6 + i * 5, 14)} color={u >= c.c ? GOLD : DIM} dash={u < c.c ? "0 14" : undefined} f={f} />
            {i === 0 && <SwampIcon x={c.x} y={670} p={drawOn(u, c.c, 16)} f={f} />}
            {i === 1 && <BeachIcon x={c.x} y={670} p={drawOn(u, c.c, 16)} f={f} />}
            {i === 2 && <CarIcon x={c.x + 10} y={680} p={drawOn(u, c.c, 16)} f={f} s={0.95} />}
            <Check x={c.x + 118} y={556} p={drawOn(u, c.c + 8, 10)} />
          </g>)}
          {[0, 1, 2].map((i) => <circle key={i} cx={600 + i * 34} cy={1000 - i * 26} r={7 + i * 4} fill="none" stroke={GOLD} strokeWidth={3} opacity={arrive(u, 10 + i * 4, 8)} />)}
          <NeonFigure x={540} y={1330} scale={0.78} look={REMY} pose={u >= SW ? "point" : "wave"} expr="happy" f={f} blink={blinkOf(f, 4)} />
          <FloorGlow x={540} y={1330} w={220} />
        </Plane>
        <Particles f={f} n={20} />
      </>;
      const hud = !hide && <>
        <HudText f={u} x={540} y={450} size={74} color={GOLD} enter="scale" at={4} out={len - 6} spacing={6}>WISHLIST</HudText>
        {cols.map((c, i) => <HudText key={i} f={u} x={c.x} y={870} size={44} color={CREAM} enter="rise" at={c.c + 2} out={len - 6}>{c.t}</HudText>)}
      </>;
      return { cam, world, hud };
    }
    case "golf": { // golf course: hills, flag, pond; a "log" by the water opens its eyes on "It's not a log"
      const AG = C("A golf", 32), IN = C("It's not", 153);
      const cam = camKick(camDrift(at(k(u, 0, len, 540, 580), k(u, 0, len, 1000, 1060), k(u, 0, len, 1.0, 1.1)), f, 2), u - IN, 12);
      const hp = k(u, 0, 30, 0.3, 1, EASE.arrive);
      const eyes = k(u, IN - 4, IN + 6, 0, 1, EASE.arrive);
      const world = <>
        <Plane p={0.6}>
          <NeonPath d="M -300 1080 Q 100 1000 400 1060 T 1000 1040 T 1500 1060" w={2.5} p={hp} color={DIM} glow={0.4} />
          <NeonPath d="M -300 1140 Q 200 1100 600 1130 T 1400 1120" w={2} p={hp} color={FAINT} glow={0} dash="0 16" />
        </Plane>
        <Plane p={1}>
          <Ground f={f} />
          <NeonPath d="M 860 1130 L 860 900" w={4} p={hp} color={CREAM} />
          <NeonPath d={`M 860 900 L ${940 + 6 * Math.sin(f * 0.15)} 922 L 860 946`} w={4} p={hp} color={CORAL} hot fill={CORAL} />
          <ellipse cx={860} cy={1132} rx={30} ry={8} fill="none" stroke={DIM} strokeWidth={3} opacity={hp} />
          <ellipse cx={600} cy={1250} rx={300} ry={66} fill={NEON.cyan} opacity={0.05} />
          <NeonPath d="M 270 1250 Q 270 1184 600 1184 Q 930 1184 930 1250 Q 930 1316 600 1316 Q 270 1316 270 1250 Z" w={3.5} p={hp} color={GOLD} />
          {[0, 1, 2].map((i) => <NeonPath key={i} d={`M ${400 + i * 60} ${1230 + i * 22} q 25 -10 50 0 t 50 0 t 50 0`} w={2.5} color={DIM} dash="0 12" travel={-f * (1 + i * 0.3)} glow={0.3} />)}
          <Gator x={610} y={1212} s={0.62} eyes={eyes} f={f} dir={-1} color={eyes > 0.3 ? GOLD : DIM} />
          <NeonFigure x={170} y={1330} scale={0.7} look={REMY} pose="stand" expr={u >= IN ? "shocked" : "neutral"} f={f} blink={u < IN && blinkOf(f, 1)} tilt={u >= IN ? 6 : 0} />
          <NeonPath d="M 222 1150 L 282 1318 L 306 1312" w={3.5} color={CREAM} />
          <FloorGlow x={170} y={1330} w={160} />
        </Plane>
        <Particles f={f} n={16} />
      </>;
      const hud = !hide && <>
        <LiveCounter f={u} label="DAY" from={1} to={3} at={2} dur={16} />
        <HudText f={u} x={540} y={700} size={68} color={CREAM} enter="rise" at={AG} out={IN - 6}>GOLF COURSE</HudText>
        <Stamp f={u} x={540} y={720} text="NOT A LOG" at={IN} out={len - 6} size={70} />
      </>;
      return { cam, world, hud };
    }
    case "gators": { // big counter ~1,300,000 ALLIGATORS; the outline fills with 67 county dots
      const OP = C("one point", 35), WO = C("Wildlife officials", 95), SS = C("sixty seven", 169);
      const cam = camDrift(at(540, 960, k(u, 0, len, 1.0, 1.04)), f, 2);
      const v = k(u, OP, OP + 34, 0, 1300000, EASE.arrive);
      const st = u > OP + 34 && u < OP + 42 ? 1 + 0.08 * Math.sin(((u - OP - 34) / 8) * Math.PI) : 1;
      const dots = k(u, WO, SS + 8, 0, 67, EASE.linear);
      const world = <>
        <Plane p={1}>
          <Spotlight x={540} floor={1290} f={f} w={640} o={0.6} />
          <FloridaMap x={540} y={1000} s={0.75} p={k(u, 0, 30, 0.2, 1, EASE.arrive)} f={f} dots={dots} />
          {u >= SS && <circle cx={540} cy={1000} r={80 + (u - SS) * 18} fill="none" stroke={AMBER} strokeWidth={4} opacity={Math.max(0, 1 - (u - SS) / 20)} />}
        </Plane>
        <Particles f={f} n={18} />
      </>;
      const hud = !hide && <>
        <g opacity={arrive(u, OP, 8) * (1 - leave(u, len - 6))} transform={`translate(540 520) scale(${st}) translate(-540 -520)`}>
          <Digits x={540} y={530} text={"~" + fmt(v)} size={118} color={AMBER} anchor="middle" />
        </g>
        <HudText f={u} x={540} y={640} size={64} color={GOLD} enter="rise" at={OP + 8} out={len - 6} spacing={4}>ALLIGATORS</HudText>
        <HudText f={u} x={540} y={1340} size={54} color={CORAL} enter="scale" at={SS} out={len - 6}>ALL 67 COUNTIES</HudText>
      </>;
      return { cam, world, hud };
    }
    case "twist": { // SCARED? -> SERIOUS INJURIES: RARE stamp; the gator turns away from Remy and walks off
      const HT = C("Here's the", 22), SA = C("Serious alligator", 61), MG = C("Most gators", 121);
      const cam = camDrift(at(540, 1000, k(u, 0, len, 1.04, 1.0)), f, 2);
      const turn = k(u, MG, MG + 10, -1, 1, EASE.arrive);
      const gx = 650 + (u > MG + 8 ? (u - MG - 8) * 6 : 0);
      const world = <>
        <Plane p={1}>
          <Ground f={f} />
          {[0, 1, 2, 3].map((i) => <NeonPath key={i} d={`M ${900 + i * 40} 1330 Q ${905 + i * 40 + 6 * Math.sin(f * 0.05 + i)} 1240 ${915 + i * 40} ${1150 + (i % 2) * 40}`} w={3} color={DIM} glow={0.4} />)}
          <Spotlight x={gx} floor={1330} f={f} w={520} o={0.6} />
          <Gator x={gx} y={1322} s={0.72} eyes={1} f={f} dir={Math.abs(turn) < 0.15 ? 0.15 * Math.sign(turn || 1) : turn} />
          <NeonFigure x={200} y={1330} scale={0.72} look={REMY} pose={u >= MG ? "shrug" : "stand"} expr={u < SA ? "shocked" : "happy"} f={f} blink={u >= SA && blinkOf(f, 6)} />
          <FloorGlow x={200} y={1330} w={160} />
        </Plane>
        <Particles f={f} n={16} />
      </>;
      const hud = !hide && <>
        <HudText f={u} x={540} y={470} size={80} color={CREAM} enter="scale" at={2} out={len - 6}>SCARED?</HudText>
        {u >= HT && u < SA && <HudText f={u} x={540} y={620} size={56} color={GOLD} enter="rise" at={HT} out={SA - 6}>THE TWIST</HudText>}
        <Stamp f={u} x={540} y={650} text="SERIOUS INJURIES: RARE" at={SA} out={len - 6} size={48} rot={-3} color={AMBER} />
        <HudText f={u} x={540} y={800} size={58} color={CORAL} enter="rise" at={MG} out={len - 6}>MOST AVOID PEOPLE</HudText>
      </>;
      return { cam, world, hud };
    }
    case "above": { // camera tilts up: a giant storm cloud draws on above Remy, flickering inside; LOOK UP
      const cam = camDrift(at(540, k(u, 0, len, 1020, 900), k(u, 0, len, 1.06, 1.0)), f, 2);
      const cp = drawOn(u, 0, 26);
      const fl = flash(u, 23, 8);
      const world = <>
        <Plane p={1}>
          <Ground f={f} />
          <Cloud x={540} y={780} s={1.5} p={Math.max(0.3, cp)} color={fl > 0.5 ? AMBER : GOLD} />
          {cp >= 1 && <ellipse cx={540} cy={760} rx={300} ry={120} fill={AMBER} opacity={0.12 * fl} />}
          <Rain f={f} x={260} y={880} w={560} h={420} n={30} o={cp} />
          <NeonPath d="M 860 1180 L 860 960 M 830 1000 L 860 960 L 890 1000" w={5} p={drawOn(u, 14, 14)} color={CORAL} hot />
          <NeonFigure x={540} y={1330} scale={0.7} look={REMY} expr="shocked" f={f} tilt={-8} />
          <FloorGlow x={540} y={1330} w={180} />
        </Plane>
        <Particles f={f} n={14} />
      </>;
      const hud = !hide && <HudText f={u} x={540} y={430} size={88} color={CORAL} enter="scale" at={8} out={len - 6} spacing={6}>LOOK UP</HudText>;
      return { cam, world, hud };
    }
    case "sky": { // chapter DAY 10 (counter hidden while it is up), then the sun climbs to noon and the storm rolls in by 4 pm
      const EA = C("Every afternoon", 32), SN = C("Sunshine at", 95), TB = C("Thunder by", 134);
      const CH = Math.max(26, EA);
      const cam = camDrift(at(540, 980, k(u, 0, len, 1.0, 1.05)), f, 2);
      const sa = k(u, 0, SN + 4, 0, 1, EASE.camera);
      const sx = 160 + 380 * sa, sy = 1180 - 300 * Math.sin(sa * Math.PI * 0.5);
      const storm = k(u, TB - 8, TB + 14, 0, 1, EASE.arrive);
      const hrs = k(u, SN + 6, TB + 12, 12, 16, EASE.camera);
      const world = <>
        <Plane p={0.6}>
          <NeonPath d="M -300 1250 L 1380 1250" w={2.5} color={DIM} />
          <Palm x={120} y={1250} h={300} f={f} color={DIM} />
          <Palm x={960} y={1250} h={340} f={f + 30} flip color={DIM} />
        </Plane>
        <Plane p={1}>
          <Sun x={sx} y={sy} r={70} f={f} o={1 - 0.8 * storm} />
          {storm > 0 && <>
            <Cloud x={380} y={900} s={1.0} p={storm} color={GOLD} />
            <Cloud x={720} y={940} s={1.1} p={storm} color={AMBER} />
            <Rain f={f} x={180} y={1000} w={760} h={320} n={40} o={storm} />
            <Bolt x={560} y={990} len={250} seed={Math.floor(u / 23)} o={u > TB + 4 ? flash(u, 23, 4) : 0} />
          </>}
        </Plane>
        <Particles f={f} n={14} />
      </>;
      const hud = !hide && <>
        <ChapterScreen f={u} id="d10" big="DAY 10" small="SAME SKY" y={720} size={200} at={0} out={CH - 6} />
        {u >= CH && <>
          <LiveCounter f={u} label="DAY" from={3} to={10} at={CH + 2} dur={14} />
          <g opacity={arrive(u, CH + 4, 10) * (1 - leave(u, len - 6))}><Clock x={830} y={436} r={96} hours={hrs} p={drawOn(u, CH + 4, 14)} /></g>
        </>}
        <HudText f={u} x={540} y={720} size={90} color={AMBER} enter="scale" at={SN} out={TB - 6} spacing={6}>NOON</HudText>
        <HudText f={u} x={540} y={720} size={90} color={CORAL} enter="scale" at={TB} out={len - 6} spacing={6}>4 PM</HudText>
      </>;
      return { cam, world, hud };
    }
    case "strikes": { // bolts keep striking the outline; compare bars LIGHTNING PER KM2: FLORIDA #1 vs OTHER STATES
      const LP = C("lightning per", 36), TA = C("than any", 78);
      const cam = camDrift(at(540, 960, k(u, 0, len, 1.0, 1.03)), f, 2);
      const mx = 770, my = 560, ms = 0.42;
      const hits = [[300, 200], [520, 420], [640, 640], [180, 120], [600, 300], [700, 760]] as Pt[];
      const world = <>
        <Plane p={1}>
          <FloridaMap x={mx} y={my} s={ms} f={f} p={k(u, 0, 20, 0.3, 1, EASE.arrive)} />
          {[0, 1, 2].map((j) => { const per = 17 + j * 6, n = Math.floor((u + j * 5) / per), h = hits[(n * 3 + j) % hits.length]; const [bx, by] = mapPt(mx, my, ms, h);
            return <Bolt key={j} x={bx} y={by - 150} len={150} seed={n * 3 + j} o={flash(u, per, j * 5)} w={4} />; })}
        </Plane>
        <Particles f={f} n={16} />
      </>;
      const hud = !hide && <>
        <HudText f={u} x={70} y={450} size={68} color={CREAM} enter="rise" at={2} out={len - 6} anchor="start">LIGHTNING</HudText>
        <HudText f={u} x={70} y={535} size={68} color={GOLD} enter="rise" at={6} out={len - 6} anchor="start">PER KM²</HudText>
        <CompareBars f={u} y={830} out={len - 6} rows={[
          { label: "FLORIDA", fill: 0.97, value: "#1", color: CORAL, at: LP },
          { label: "OTHER STATES", fill: 0.48, value: "LESS", color: GOLD, at: TA },
        ]} />
      </>;
      return { cam, world, hud };
    }
    case "deaths": { // podium: blocks rise, the outline lands on #1; LIGHTNING DEATHS -> #1 STATE stamp, bolts strike it
      const LD = C("lightning deaths", 78);
      const cam = camDrift(at(540, k(u, 0, len, 1000, 960), k(u, 0, len, 1.05, 1.0)), f, 2);
      const blocks = [{ x: 540, top: 960, n: "1", a: 8 }, { x: 250, top: 1110, n: "2", a: 14 }, { x: 830, top: 1170, n: "3", a: 20 }];
      const land = k(u, 30, 44, -300, 0, EASE.arrive);
      const world = <>
        <Plane p={1}>
          <Ground f={f} />
          <Spotlight x={540} floor={1330} f={f} w={420} o={0.7} />
          {blocks.map((b, i) => { const g = k(u, b.a, b.a + 16, 0, 1, EASE.arrive), top = 1330 - (1330 - b.top) * g;
            return g > 0 && <g key={i}><path d={`M ${b.x - 125} 1330 L ${b.x - 125} ${top} L ${b.x + 125} ${top} L ${b.x + 125} 1330`} fill="#000" />
              <NeonPath d={`M ${b.x - 125} 1330 L ${b.x - 125} ${top} L ${b.x + 125} ${top} L ${b.x + 125} 1330`} w={4} color={i ? DIM : GOLD} />
              {g > 0.8 && <NeonText x={b.x} y={top + 120} size={96} color={i ? DIM : AMBER}>{b.n}</NeonText>}</g>; })}
          {u >= 30 && <g transform={`translate(0 ${land})`}><FloridaMap x={540} y={858} s={0.26} f={f} /></g>}
          {u >= 46 && [0, 1].map((j) => <Bolt key={j} x={500 + j * 80} y={700} len={130 - j * 20} seed={Math.floor(u / 19) * 2 + j} o={flash(u, 19, j * 7)} w={4} />)}
        </Plane>
        <Particles f={f} n={16} />
      </>;
      const hud = !hide && <>
        <HudText f={u} x={540} y={440} size={72} color={CREAM} enter="rise" at={4} out={len - 6}>LIGHTNING DEATHS</HudText>
        <Stamp f={u} x={540} y={590} text="#1 STATE" at={LD} out={len - 6} size={72} />
      </>;
      return { cam, world, hud };
    }
    case "tv": { // a TV shows the outline; on "A cone appears" the hurricane cone grows toward it; two more TVs light up; stamp
      const AC = C("A cone", 32), HS = C("Hurricane season", 102);
      const cam = camDrift(at(540, 980, k(u, 0, len, 1.0, 1.04)), f, 2);
      const cone = drawOn(u, AC, 26);
      const screen = (big: boolean, ff: number) => <g>
        <FloridaMap x={70} y={14} s={0.2} f={ff} glow={big ? 1 : 0.5} />
        {cone > 0 && <>
          <path d={`M -160 -70 L ${-160 + 210 * cone} ${-70 + 40 * cone - 70 * cone} L ${-160 + 210 * cone} ${-70 + 40 * cone + 70 * cone} Z`} fill={CORAL} opacity={0.22} />
          <NeonPath d={`M -160 -70 L ${-160 + 210 * cone} ${-70 - 30 * cone} M -160 -70 L ${-160 + 210 * cone} ${-70 + 110 * cone}`} w={3} color={CORAL} glow={0.6} />
          <NeonPath d={`M -160 -70 L ${-160 + 210 * cone} ${-70 + 40 * cone}`} w={2.5} color={NEON.hot} dash="0 10" travel={-ff} glow={0} />
          <Spiral x={-160 + 120 * cone} y={-70 + 23 * cone} s={0.6} f={ff} />
        </>}
      </g>;
      const small = drawOn(u, AC + 14, 14);
      const world = <>
        <Plane p={1}>
          <TV x={540} y={806} s={1.3} f={f} on={1}>{screen(true, f)}</TV>
          {small > 0 && <><TV x={230} y={1240} s={0.5} f={f + 7} p={small} on={small}>{small >= 1 && screen(false, f)}</TV>
            <TV x={850} y={1240} s={0.5} f={f + 13} p={small} on={small}>{small >= 1 && screen(false, f)}</TV></>}
        </Plane>
        <Particles f={f} n={14} />
      </>;
      const hud = !hide && <>
        <LiveCounter f={u} label="DAY" from={10} to={30} at={2} dur={18} />
        <Stamp f={u} x={540} y={1108} text="HURRICANE SEASON" at={HS} out={len - 6} size={52} color={CORAL} rot={-2} />
      </>;
      return { cam, world, hud };
    }
    case "landfall": { // donut: ~40% of US hurricane landfalls; hurricane symbols orbit, the 4 in Florida's share glow coral
      const OA = C("of all", 35), ML = C("make landfall", 120);
      const cam = camDrift(at(540, 940, k(u, 0, len, 1.04, 1.0)), f, 2);
      const tp = drawOn(u, 0, 18), share = k(u, 10, 42, 0, 0.4, EASE.arrive);
      const cx = 540, cy = 900, R = 240;
      const arc = (a: number) => { const t = -Math.PI / 2 + a * Math.PI * 2; return `${cx + R * Math.cos(t)} ${cy + R * Math.sin(t)}`; };
      const world = <>
        <Plane p={1}>
          <NeonPath d={`M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - 0.1} ${cy - R}`} w={26} p={tp} color={FAINT} glow={0} />
          {share > 0.005 && <NeonPath d={`M ${cx} ${cy - R} A ${R} ${R} 0 ${share > 0.5 ? 1 : 0} 1 ${arc(share)}`} w={30} color={CORAL} hot />}
          {Array.from({ length: 10 }, (_, i) => { const t = -Math.PI / 2 + ((i + 0.5) / 10) * Math.PI * 2 + u * 0.002; const fl = i < 4 && share >= 0.38;
            return <Spiral key={i} x={cx + 330 * Math.cos(t)} y={cy + 330 * Math.sin(t)} s={0.7} f={f + i * 9} color={fl ? CORAL : DIM} o={arrive(u, 4 + i * 2, 10)} />; })}
          {u >= ML && <circle cx={cx} cy={cy} r={R + (u - ML) * 14} fill="none" stroke={CORAL} strokeWidth={4} opacity={Math.max(0, 1 - (u - ML) / 18)} />}
        </Plane>
        <Particles f={f} n={16} />
      </>;
      const hud = !hide && <>
        <HudText f={u} x={540} y={470} size={80} color={GOLD} enter="scale" at={ML} out={len - 6} spacing={6}>FLORIDA</HudText>
        <g opacity={arrive(u, 10, 8) * (1 - leave(u, len - 6))}><NeonText x={540} y={950} size={140} color={AMBER}>{"~" + Math.round(share * 100) + "%"}</NeonText></g>
        <HudText f={u} x={540} y={1300} size={44} color={CREAM} enter="rise" at={OA} out={len - 6}>OF US HURRICANE LANDFALLS</HudText>
      </>;
      return { cam, world, hud };
    }
    case "rules": { // REAL RULES card: WATCH THE SKY, WHEN THUNDER ROARS / GO INDOORS; Remy walks into a house as a cloud rolls in
      const WS = C("Watch the", 74), WT = C("When thunder", 158), GI = C("go indoors", 193);
      const cam = camDrift(at(540, 960, k(u, 0, len, 1.02, 1.0)), f, 2);
      const walk = k(u, WT, GI + 14, 0, 1, EASE.camera);
      const rx = 260 + 520 * walk, inHouse = k(u, GI + 10, GI + 18, 1, 0);
      const cl = drawOn(u, WT - 10, 20);
      const world = <>
        <Plane p={1}>
          <Ground f={f} />
          <Frame x={510} y={640} w={880} h={560} p={drawOn(u, 0, 18)} color={GOLD} />
          {cl > 0 && <Cloud x={300 + 40 * k(u, WT, len, 0, 1)} y={1010} s={0.55} p={cl} color={DIM} />}
          {u > WT + 10 && <Bolt x={330} y={1040} len={150} seed={Math.floor(u / 21)} o={flash(u, 21, 3)} w={4} />}
          <NeonFigure x={rx} y={1330} scale={0.66} look={REMY} pose="stand" expr={u >= WS && u < WT ? "focused" : u >= WT ? "shocked" : "neutral"} f={f}
            tilt={u >= WS && u < WT ? -8 : 0} glow={inHouse} color={inHouse < 1 ? AMBER : undefined} />
          <House x={810} y={1330} p={drawOn(u, 10, 20)} door={u >= GI ? 1 : 0} />
          <FloorGlow x={rx} y={1330} w={150} o={inHouse} />
        </Plane>
        <Particles f={f} n={14} />
      </>;
      const ci = (y: number, a: number, col: string) => <g>
        <NeonPath d={`M 110 ${y - 42} L 158 ${y - 42} L 158 ${y + 6} L 110 ${y + 6} Z`} w={3} p={drawOn(u, a - 6, 10)} color={DIM} />
        <NeonPath d={`M 118 ${y - 18} L 132 ${y - 2} L 156 ${y - 48}`} w={5} p={drawOn(u, a + 4, 8)} color={col} hot />
      </g>;
      const hud = !hide && <>
        <HudText f={u} x={510} y={460} size={72} color={GOLD} enter="scale" at={6} out={len - 6} spacing={6}>REAL RULES</HudText>
        {u >= WS - 6 && ci(620, WS, CORAL)}
        <HudText f={u} x={190} y={620} size={56} color={CREAM} enter="rise" at={WS} out={len - 6} anchor="start">WATCH THE SKY</HudText>
        {u >= WT - 6 && ci(760, WT, CORAL)}
        <HudText f={u} x={190} y={760} size={50} color={CREAM} enter="rise" at={WT} out={len - 6} anchor="start">WHEN THUNDER ROARS,</HudText>
        <HudText f={u} x={190} y={850} size={66} color={CORAL} enter="scale" at={GI} out={len - 6} anchor="start">GO INDOORS</HudText>
      </>;
      return { cam, world, hud };
    }
    case "respawn": { // split: IN GAME (cyan ghost Remy respawns, RESPAWN?) vs REAL LIFE (storm cloud, bolt); NO RESPAWN stamp
      const YR = C("you respawn", 38), IR = C("In real", 66), TW = C("the weather", 101);
      const cam = camDrift(at(540, 960, k(u, 0, len, 1.0, 1.03)), f, 2);
      const ghost = 0.35 + 0.65 * Math.abs(Math.sin(u * 0.25));
      const real = arrive(u, IR, 12);
      const world = <>
        <Plane p={1}>
          <NeonPath d="M 540 380 L 540 1100" w={2} color={DIM} dash="0 14" travel={-f} glow={0.3} />
          <RespawnIcon x={290} y={640} s={0.9} p={drawOn(u, 4, 18)} f={u >= YR ? u - YR : 0} />
          <g opacity={u >= YR ? ghost : 0.3}><NeonFigure x={290} y={1060} scale={0.5} look={REMY} expr="happy" f={f} color={CYAN} glow={0.8} /></g>
          <g opacity={0.35 + 0.65 * real}>
            <Cloud x={790} y={650} s={0.85} p={drawOn(u, 6, 20)} color={u >= IR ? GOLD : DIM} />
            <Rain f={f} x={640} y={720} w={300} h={330} n={18} o={real} />
            {u >= IR && <Bolt x={790} y={720} len={300} seed={Math.floor(u / 22)} o={flash(u, 22, 2)} />}
          </g>
        </Plane>
        <Particles f={f} n={14} />
      </>;
      const hud = !hide && <>
        <HudText f={u} x={290} y={450} size={54} color={CYAN} enter="rise" at={2} out={len - 6}>IN GAME</HudText>
        <HudText f={u} x={790} y={450} size={54} color={GOLD} enter="rise" at={8} out={len - 6}>REAL LIFE</HudText>
        <HudText f={u} x={290} y={1150} size={56} color={CYAN} enter="scale" at={YR} out={len - 6}>RESPAWN?</HudText>
        <Stamp f={u} x={540} y={1290} text="NO RESPAWN" at={TW} out={len - 6} size={66} color={CORAL} />
      </>;
      return { cam, world, hud };
    }
    default: { // ask (the ONLY choice cards of the episode): STILL MOVE? cards build in 0.6 s, each lights on its letter
      const A = C("A, for", 74), B = C("B, for", 127), Cc = C("C, never", 179), D = C("D, I", 211);
      const cam = camDrift(at(540, 1000 + 30 * k(u, 0, len, 0, 1), k(u, 0, len, 1.06, 1.0)), f, 2);
      const cues = [A, B, Cc, D];
      const pick = cues.reduce((acc, c, i) => (u >= c ? i : acc), -1);
      const world = <>
        <Plane p={0.5}>
          <NeonPath d="M -300 1330 L 1380 1330" w={2.5} color={DIM} />
          <Palm x={70} y={1330} h={230} f={f} color={DIM} />
          <Palm x={1010} y={1330} h={210} f={f + 40} flip color={DIM} />
        </Plane>
        <Plane p={1}>
          <Spotlight x={540} floor={1330} f={f} w={560} />
          <NeonFigure x={540} y={1330} scale={0.64} look={REMY} pose={pick >= 0 ? "point" : "shrug"} expr="happy" f={f} blink={blinkOf(f, 3)} />
          <FloorGlow x={540} y={1330} w={220} />
        </Plane>
        <Particles f={f} n={22} />
      </>;
      const hud = !hide && <>
        <HudText f={u} x={540} y={440} size={82} color={CORAL} enter="scale" at={4} out={len + 30}>STILL MOVE?</HudText>
        <ChoiceCards f={u} y={716} at={16} cw={430} pick={pick} pickAt={pick >= 0 ? cues[pick] : Infinity} out={len + 30}
          cards={[{ letter: "A", text: "BEACHES" }, { letter: "B", text: "GATORS" }, { letter: "C", text: "NEVER" }, { letter: "D", text: "I LIVE THERE" }]} />
      </>;
      return { cam, world, hud };
    }
  }
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "wi-gta-leonida",
  shots: SHOTS,
  Scene: makeWhatIfScene(scenes.shots, build),
  flat: true,
  hookFlash: 0,
  background: NEON.bg,
};
export default story;
