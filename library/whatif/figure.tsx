// WHAT IF characters ("Golden Neon"): ORIGINAL black silhouette figures with a glowing outline, simple round head,
// minimal neon eye/mouth lines. Never a visor, never a puffer vest (that is the reference channel's robot).
// The outline is the UNION of all body parts: every part is stroked 3x wide in the look colour (glow), then filled
// black on top, so only the outer rim glows. Details (drawstrings, cuff, face) are thin neon lines drawn last.
// Coordinates: feet at (0, 0), ~430 units tall at scale 1, facing the camera.
import React from "react";

export type FigLook = { name: string; color: string; hat: "beanie" | "cap" | "bun" | "spiky" | "flattop" | "none"; hood?: boolean; collar?: boolean };
export type FigPose = "stand" | "sit" | "play" | "slump" | "wave" | "point" | "shrug";
export type FigExpr = "neutral" | "happy" | "focused" | "tired" | "dizzy" | "shocked" | "sick" | "sleep";

export const FACE = "#fff3d0";
/** hero + extras. Remy: hoodie (hood + drawstrings) + beanie with a pom tuft. Extras vary hat/hair and rim colour. */
export const LOOKS: Record<string, FigLook> = {
  remy: { name: "Remy", color: "#f5b942", hat: "beanie", hood: true },
  mo: { name: "Mo", color: "#ff7a59", hat: "cap" },
  june: { name: "June", color: "#ffd98a", hat: "bun" },
  kit: { name: "Kit", color: "#ff9e6b", hat: "spiky", hood: true },
  randy: { name: "Randy (1964)", color: "#ffe9c4", hat: "flattop", collar: true },
};

type P = [number, number];
type Part = { d: string; w: number; fill: boolean };
const line = (...pts: P[]) => pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
const circ = (cx: number, cy: number, r: number) => `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;

type Arms = { l: [P, P]; r: [P, P] }; // elbow, hand (shoulders are fixed per pose)
const poseArms = (pose: FigPose, sy: number, f: number): Arms => {
  const sw = Math.sin(f * 0.08) * 3;
  switch (pose) {
    case "play": return { l: [[-82, sy + 66], [-24, sy + 78]], r: [[82, sy + 66], [24, sy + 78]] };
    case "slump": return { l: [[-70, sy + 70], [-64, sy + 140]], r: [[70, sy + 70], [64, sy + 140]] };
    case "wave": { const a = Math.sin(f * 0.25) * 14; return { l: [[-70, sy + 72], [-72, sy + 142 + sw]], r: [[108, sy - 34], [128 + a, sy - 112]] }; }
    case "point": return { l: [[-70, sy + 72], [-72, sy + 142 + sw]], r: [[124, sy + 6], [196, sy - 2]] };
    case "shrug": return { l: [[-104, sy + 52], [-118, sy - 14]], r: [[104, sy + 52], [118, sy - 14]] };
    default: return { l: [[-70, sy + 72], [-72, sy + 142 + sw]], r: [[70, sy + 72], [72, sy + 142 - sw]] };
  }
};

const Face: React.FC<{ expr: FigExpr; hy: number; blink: boolean; f: number }> = ({ expr, hy, blink, f }) => {
  const ey = hy - 4, my = hy + 28;
  const L = (d: string, w = 6, o = 1) => <path d={d} stroke={FACE} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={o} />;
  const eyes = (fn: (x: number) => string, w = 6) => <>{L(fn(-22), w)}{L(fn(22), w)}</>;
  const shut = (x: number) => `M ${x - 11} ${ey} Q ${x} ${ey + 7} ${x + 11} ${ey}`;
  let e: React.ReactNode, m: React.ReactNode;
  switch (expr) {
    case "happy": e = eyes((x) => `M ${x - 11} ${ey + 3} Q ${x} ${ey - 11} ${x + 11} ${ey + 3}`); m = L(`M -16 ${my - 4} Q 0 ${my + 10} 16 ${my - 4}`); break;
    case "focused": e = <>{eyes((x) => `M ${x - 10} ${ey} L ${x + 10} ${ey}`, 7)}{L(`M -34 ${ey - 18} L -12 ${ey - 12} M 34 ${ey - 18} L 12 ${ey - 12}`, 4, 0.8)}</>; m = L(`M -9 ${my} L 9 ${my}`); break;
    case "tired": e = <>{eyes((x) => `M ${x - 12} ${ey} L ${x + 12} ${ey} M ${x - 10} ${ey} Q ${x} ${ey + 10} ${x + 10} ${ey}`, 5)}
      {eyes((x) => `M ${x - 10} ${ey + 15} Q ${x} ${ey + 20} ${x + 10} ${ey + 15}`, 3)}</>;
      m = L(`M -14 ${my + 2} q 7 -5 14 0 q 7 5 14 0`, 4); break;
    case "dizzy": { const s = f * 0.3; e = [-22, 22].map((x) => <g key={x} transform={`rotate(${(s * 57) % 360} ${x} ${ey})`}>{L(`M ${x} ${ey} m -2 0 a 3 3 0 1 1 5 2 a 7 7 0 1 1 -11 -6 a 11 11 0 1 1 16 12`, 3.5)}</g>);
      m = L(`M -16 ${my} q 8 -7 16 0 q 8 7 16 0`, 4); break; }
    case "shocked": e = <>{L(`${circ(-22, ey, 8)}`, 4)}{L(`${circ(22, ey, 8)}`, 4)}</>; m = L(circ(0, my + 2, 8), 4); break;
    case "sick": e = eyes((x) => x < 0 ? `M ${x - 10} ${ey - 7} L ${x + 8} ${ey} L ${x - 10} ${ey + 7}` : `M ${x + 10} ${ey - 7} L ${x - 8} ${ey} L ${x + 10} ${ey + 7}`, 5);
      m = <>{L(`M -18 ${my + 2} q 6 -6 12 0 q 6 6 12 0 q 6 -6 12 0`, 4)}{L(`M -46 ${hy + 10} l 12 0 M 34 ${hy + 10} l 12 0`, 3, 0.7)}</>; break;
    case "sleep": e = eyes(shut, 5); m = L(circ(0, my + 2, 4), 3); break;
    default: e = blink ? eyes(shut, 5) : eyes((x) => `M ${x} ${ey - 8} L ${x} ${ey + 6}`, 8); m = L(`M -10 ${my} Q 0 ${my + 4} 10 ${my}`, 5);
  }
  if (blink && (expr === "focused" || expr === "happy")) e = eyes(shut, 5);
  return <g>{e}{m}</g>;
};

/**
 * NeonFigure: x, y = feet; scale; look (LOOKS.*); pose; expr; f = frame (breathing, arm sway, dizzy spin);
 * tilt = head tilt in degrees; blink (true closes neutral/focused/happy eyes); glow 0..1 overall rim intensity.
 * `prop` is drawn in the hands' coordinate frame (e.g. <Controller/> for "play").
 */
export const NeonFigure: React.FC<{ x: number; y: number; scale?: number; look: FigLook; pose?: FigPose; expr?: FigExpr; f?: number; tilt?: number;
  blink?: boolean; glow?: number; prop?: React.ReactNode; color?: string }> =
  ({ x, y, scale = 1, look, pose = "stand", expr = "neutral", f = 0, tilt = 0, blink = false, glow = 1, prop, color }) => {
    const col = color ?? look.color;
    const sit = pose === "sit" || pose === "play" || pose === "slump";
    const br = Math.sin(f * 0.1) * 2.5;
    const drop = sit ? 62 : 0;
    const sy = -270 + drop + br + (pose === "slump" ? 16 : 0);           // shoulder line
    const hy = sy - 74 + (pose === "slump" ? 10 : 0);                       // head centre
    const hx = pose === "slump" ? 8 : 0;
    const hipY = -140 + drop;
    const arms = poseArms(pose, sy, f);
    const parts: Part[] = [];
    // legs
    if (sit) {
      for (const s of [-1, 1]) parts.push({ d: line([s * 26, hipY], [s * 44, hipY + 22], [s * 44, -6]), w: 34, fill: false }, { d: line([s * 44, -6], [s * 62, -4]), w: 22, fill: false });
    } else {
      for (const s of [-1, 1]) parts.push({ d: line([s * 26, hipY], [s * 31, -70], [s * 34, -6]), w: 34, fill: false }, { d: line([s * 34, -6], [s * 58, -4]), w: 22, fill: false });
    }
    // torso (hoodie block: wide shoulders, slight taper)
    parts.push({ d: `M -56 ${sy - 4} Q 0 ${sy - 16} 56 ${sy - 4} Q 66 ${sy + 4} 62 ${sy + 30} L 48 ${hipY + 6} Q 0 ${hipY + 16} -48 ${hipY + 6} L -62 ${sy + 30} Q -66 ${sy + 4} -56 ${sy - 4} Z`, w: 0, fill: true });
    if (look.hood) parts.push({ d: `M -64 ${sy - 2} Q -60 ${sy - 40} 0 ${sy - 40} Q 60 ${sy - 40} 64 ${sy - 2} Q 0 ${sy + 18} -64 ${sy - 2} Z`, w: 0, fill: true });
    // arms
    for (const [s, a] of [[-1, arms.l], [1, arms.r]] as const) {
      parts.push({ d: line([s * 54, sy + 6], a[0], a[1]), w: 28, fill: false }, { d: circ(a[1][0], a[1][1], 14), w: 0, fill: true });
    }
    // head + neck
    const head: Part[] = [{ d: line([hx, hy + 40], [0, sy]), w: 30, fill: false }, { d: circ(hx, hy, 58), w: 0, fill: true }];
    const hat: Part[] = [];
    const H = (d: string) => hat.push({ d, w: 0, fill: true });
    switch (look.hat) {
      case "beanie": H(`M ${hx - 62} ${hy - 14} Q ${hx - 60} ${hy - 82} ${hx} ${hy - 84} Q ${hx + 60} ${hy - 82} ${hx + 62} ${hy - 14} Z`); H(circ(hx + 4, hy - 96, 16)); break;
      case "cap": H(`M ${hx - 60} ${hy - 18} Q ${hx - 56} ${hy - 78} ${hx} ${hy - 78} Q ${hx + 56} ${hy - 78} ${hx + 60} ${hy - 18} L ${hx + 116} ${hy - 12} Q ${hx + 110} ${hy - 26} ${hx + 60} ${hy - 30} Z`); break;
      case "bun": H(circ(hx + 30, hy - 66, 26)); break;
      case "spiky": H(`M ${hx - 58} ${hy - 10} L ${hx - 66} ${hy - 62} L ${hx - 34} ${hy - 50} L ${hx - 20} ${hy - 92} L ${hx + 4} ${hy - 58} L ${hx + 30} ${hy - 96} L ${hx + 38} ${hy - 54} L ${hx + 70} ${hy - 66} L ${hx + 58} ${hy - 10} Z`); break;
      case "flattop": H(`M ${hx - 52} ${hy - 26} L ${hx - 50} ${hy - 74} L ${hx + 50} ${hy - 74} L ${hx + 52} ${hy - 26} Q ${hx} ${hy - 50} ${hx - 52} ${hy - 26} Z`); break;
      default: break;
    }
    const all = [...parts, ...head, ...hat];
    const rim = 5;
    const pass = (extra: number, stroke: string, op: number, k: string) => (
      <g key={k} opacity={op}>
        {all.map((p, i) => <path key={i} d={p.d} stroke={stroke} strokeWidth={p.w + 2 * extra} fill={p.fill ? stroke : "none"} strokeLinecap="round" strokeLinejoin="round" />)}
      </g>
    );
    const dl = (d: string, w = 3.5, o = 0.85) => <path d={d} stroke={col} strokeWidth={w} fill="none" strokeLinecap="round" opacity={o} />;
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        {pass(rim + 14, col, 0.08 * glow, "g0")}
        {pass(rim + 6, col, 0.2 * glow, "g1")}
        {pass(rim, col, glow, "g2")}
        {pass(0, "#050404", 1, "fill")}
        {/* inner seams (thin, dim): arms over torso, legs, hat cuff, hoodie details */}
        <g opacity={0.9}>
          {[arms.l, arms.r].map((a, i) => <React.Fragment key={i}>{dl(line([(i ? 1 : -1) * 54, sy + 6], a[0], a[1]), 2.5, 0.35)}</React.Fragment>)}
          {look.hood && <>{dl(`M -14 ${sy + 2} L -17 ${sy + 46}`)}{dl(`M 14 ${sy + 2} L 17 ${sy + 46}`)}
            {dl(`M -36 ${hipY - 34} L 36 ${hipY - 34} L 44 ${hipY - 4} M -36 ${hipY - 34} L -44 ${hipY - 4}`, 3, 0.55)}</>}
          {look.collar && dl(`M -26 ${sy - 6} L 0 ${sy + 26} L 26 ${sy - 6}`, 3.5)}
          {look.hat === "beanie" && <>{dl(`M ${hx - 62} ${hy - 22} Q ${hx} ${hy - 32} ${hx + 62} ${hy - 22}`, 3.5)}
            {dl(`M ${hx - 2} ${hy - 110} l -8 -16 M ${hx + 6} ${hy - 112} l 0 -18 M ${hx + 12} ${hy - 110} l 10 -14`, 3.5)}</>}
          {look.hat === "cap" && dl(`M ${hx + 58} ${hy - 30} L ${hx + 112} ${hy - 14}`, 3)}
        </g>
        <g transform={`rotate(${tilt} ${hx} ${hy + 40})`}><Face expr={expr} hy={hy} blink={blink} f={f} /></g>
        {prop && <g transform={`translate(0 ${sy + 80})`}>{prop}</g>}
      </g>
    );
  };

/** soft glowing floor reflection under a figure/prop: stacked ellipses (no blur) + a hot contact line */
export const FloorGlow: React.FC<{ x: number; y: number; w?: number; color?: string; o?: number }> = ({ x, y, w = 160, color = "#f5b942", o = 1 }) => (
  <g opacity={o}>
    <ellipse cx={x} cy={y + 4} rx={w * 1.25} ry={w * 0.16} fill={color} opacity={0.06} />
    <ellipse cx={x} cy={y + 3} rx={w * 0.9} ry={w * 0.11} fill={color} opacity={0.1} />
    <ellipse cx={x} cy={y + 2} rx={w * 0.55} ry={w * 0.06} fill={color} opacity={0.18} />
    <path d={`M ${x - w * 0.5} ${y + 2} L ${x + w * 0.5} ${y + 2}`} stroke={color} strokeWidth={2} opacity={0.5} strokeLinecap="round" />
  </g>
);
