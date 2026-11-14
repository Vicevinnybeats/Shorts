// Library (2.5D): a posable SVG person in the skill's character style: bean head (h/w ~0.93, narrower chin),
// plum ink (#241726), stick limbs with ink-dot hands, dot eyes, no blush, flat fills with one shade step.
// Local coordinates: feet at (0, 0), y up is negative. ~3.5 head heights tall at scale 1 (head width 120 px).
import React from "react";

export const INK = "#241726";
export type Expr = "neutral" | "calm" | "determined" | "smile" | "laugh" | "shock" | "smirk" | "worried" | "focused" | "cheer";
export type Look = { skin: string; hair: string; hairStyle: "short" | "buzz" | "curly" | "none" | "bun"; jersey: string; jersey2?: string;
  shorts: string; socks: string; boots?: string; gloves?: string; number?: string };
/** limb angles in degrees, 0 = straight down. Front view (default): positive = outward from the body, so a pose is
 *  symmetric when armL == armR. Profile view (profile: true, runs/dives/kicks): positive = toward `facing`. */
export type Pose = { armL: [number, number]; armR: [number, number]; legL: [number, number]; legR: [number, number];
  lean?: number; crouch?: number; headTilt?: number; lookX?: number; profile?: boolean };

export const POSES: Record<string, Pose> = {
  stand: { armL: [12, -6], armR: [12, -6], legL: [6, 0], legR: [6, 0] },
  ready: { armL: [48, -55], armR: [48, -55], legL: [22, -26], legR: [22, -26], crouch: 0.2 },            // keeper set, gloves out
  catch: { armL: [140, -30], armR: [140, -30], legL: [10, -6], legR: [10, -6], crouch: 0.06 },          // hands up high
  hug: { armL: [20, -125], armR: [20, -125], legL: [8, 0], legR: [8, 0], crouch: 0.03 },                // ball held at the chest
  arms_up: { armL: [160, 8], armR: [160, 8], legL: [10, 0], legR: [10, 0] },
  shrug: { armL: [45, -110], armR: [45, -110], legL: [6, 0], legR: [6, 0], headTilt: 8 },
  point: { armL: [12, -6], armR: [95, 0], legL: [8, 0], legR: [8, 0], lean: 3 },
  kick: { armL: [-40, 20], armR: [70, 30], legL: [-8, 0], legR: [75, -15], lean: -10, profile: true },
};
/** run cycle at phase ph (radians) */
export const runPose = (ph: number, amt = 1): Pose => {
  const sL = Math.sin(ph), sR = Math.sin(ph + Math.PI);
  const knee = (s: number, c: number) => -(25 + Math.max(0, c) * 85) * amt;   // shin folds back most on the recovery swing
  return {
    armL: [-sL * 55 * amt, 85], armR: [-sR * 55 * amt, 85],                    // arms opposite the legs, elbows bent
    legL: [sL * 48 * amt, knee(sL, -Math.cos(ph))], legR: [sR * 48 * amt, knee(sR, Math.cos(ph))],
    lean: 12 * amt, crouch: 0.06 + Math.abs(Math.cos(ph)) * 0.07 * amt, profile: true,
  };
};
/** dive pose (the keepers who guess) */
export const DIVE: Pose = { armL: [170, 0], armR: [150, 10], legL: [-30, -20], legR: [10, -40], lean: 70, profile: true };

const rad = (d: number) => (d * Math.PI) / 180;
const limb = (x: number, y: number, a: number, b: number, l1: number, l2: number, dir: number): [number, number][] => {
  // a = upper angle from straight down, b = lower bend; dir = facing
  const ax = Math.sin(rad(a)) * dir, ay = Math.cos(rad(a));
  const k: [number, number] = [x + ax * l1, y + ay * l1];
  const c = rad(a + b);
  return [[x, y], k, [k[0] + Math.sin(c) * dir * l2, k[1] + Math.cos(c) * l2]];
};
const path = (pts: [number, number][]) => "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L");

/** Bean head outline (pointier crown, narrower chin). */
const headPath = (w: number) => {
  const h = w * 0.93, rx = w / 2;
  return `M 0 ${-h} C ${rx * 0.95} ${-h} ${rx * 1.05} ${-h * 0.45} ${rx * 0.92} ${-h * 0.25} C ${rx * 0.8} ${-h * 0.02} ${rx * 0.38} ${h * 0.02} 0 0`
    + ` C ${-rx * 0.38} ${h * 0.02} ${-rx * 0.8} ${-h * 0.02} ${-rx * 0.92} ${-h * 0.25} C ${-rx * 1.05} ${-h * 0.45} ${-rx * 0.95} ${-h} 0 ${-h} Z`;
};

const Face: React.FC<{ w: number; expr: Expr; blink: boolean; lookX: number }> = ({ w, expr, blink, lookX }) => {
  const h = w * 0.93, ey = -h * 0.5, ex = w * 0.13, lx = lookX * w * 0.04, sw = w * 0.035;
  const eye = (x: number) => {
    if (blink) return <path d={`M ${x - w * 0.05} ${ey} L ${x + w * 0.05} ${ey}`} stroke={INK} strokeWidth={sw} strokeLinecap="round" />;
    switch (expr) {
      case "laugh": case "cheer": return <path d={`M ${x - w * 0.055} ${ey + 3} Q ${x} ${ey - w * 0.06} ${x + w * 0.055} ${ey + 3}`} stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />;
      case "shock": return <g><ellipse cx={x} cy={ey} rx={w * 0.05} ry={w * 0.065} fill="#fffaf2" stroke={INK} strokeWidth={sw * 0.8} /><circle cx={x + lx} cy={ey} r={w * 0.022} fill={INK} /></g>;
      case "focused": case "determined": return <ellipse cx={x + lx} cy={ey} rx={w * 0.03} ry={w * 0.036} fill={INK} />;
      default: return <ellipse cx={x + lx} cy={ey} rx={w * 0.03} ry={w * 0.045} fill={INK} />;
    }
  };
  const brow = (x: number, side: number) => {
    const t: Record<Expr, [number, number]> = { neutral: [0, 0], calm: [0, -2], determined: [7, -3], smile: [-2, -2], laugh: [-5, -5], shock: [-12, -10],
      smirk: [side > 0 ? -6 : 3, side > 0 ? -8 : 1], worried: [-6, 5], focused: [6, -1], cheer: [-6, -6] };
    const [inner, outer] = t[expr];
    return <path d={`M ${x - side * w * 0.07} ${ey - w * 0.11 + outer} L ${x + side * w * 0.04} ${ey - w * 0.11 + inner}`} stroke={INK} strokeWidth={sw} strokeLinecap="round" />;
  };
  const my = -h * 0.24, mw = w * 0.1;
  const mouth = (() => {
    switch (expr) {
      case "smile": return <path d={`M ${-mw} ${my - 3} Q 0 ${my + mw * 0.8} ${mw} ${my - 3}`} stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />;
      case "laugh": case "cheer": return <path d={`M ${-mw * 1.2} ${my - 6} Q 0 ${my + mw * 1.6} ${mw * 1.2} ${my - 6} Z`} fill="#5a1626" stroke={INK} strokeWidth={sw * 0.8} />;
      case "shock": return <ellipse cx={0} cy={my} rx={mw * 0.45} ry={mw * 0.6} fill="#5a1626" stroke={INK} strokeWidth={sw * 0.7} />;
      case "smirk": return <path d={`M ${-mw * 0.8} ${my + 2} Q ${mw * 0.3} ${my + 5} ${mw} ${my - 6}`} stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />;
      case "worried": return <path d={`M ${-mw} ${my + 4} Q -${mw * 0.3} ${my - 4} 0 ${my + 2} Q ${mw * 0.4} ${my + 6} ${mw} ${my}`} stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />;
      case "determined": case "focused": return <path d={`M ${-mw * 0.7} ${my + 2} L ${mw * 0.7} ${my}`} stroke={INK} strokeWidth={sw} strokeLinecap="round" />;
      default: return <path d={`M ${-mw * 0.7} ${my} Q 0 ${my + mw * 0.35} ${mw * 0.7} ${my}`} stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />;
    }
  })();
  return <g>{eye(-ex)}{eye(ex)}{brow(-ex, -1)}{brow(ex, 1)}{mouth}</g>;
};

export const Person: React.FC<{ x: number; y: number; scale?: number; facing?: 1 | -1; look: Look; pose: Pose; expr?: Expr;
  blink?: boolean; rot?: number; shadow?: number; rim?: string; t?: number; squash?: number; ghost?: number }> = ({ x, y, scale = 1, facing = 1, look, pose: pose0, expr = "neutral", blink = false, rot = 0, shadow = 0.35, rim, t, squash = 0, ghost }) => {
  // secondary motion (t = frame): breathing bob and a slow arm sway, so a held pose never looks frozen
  const br = t === undefined || pose0.profile ? 0 : Math.sin(t * 0.11);
  const sway = t === undefined || pose0.profile ? 0 : Math.sin(t * 0.07) * 4;
  const pose: Pose = { ...pose0, armL: [pose0.armL[0] + sway, pose0.armL[1]], armR: [pose0.armR[0] - sway, pose0.armR[1]], crouch: (pose0.crouch ?? 0) + br * 0.012 };
  const W = 120, H = W * 0.93;
  const crouch = (pose.crouch ?? 0) * 140;
  const hipY = -150 + crouch, shY = -285 + crouch * 0.9, legL = 82, legL2 = 78, armL = 70, armL2 = 64;
  const lean = (pose.lean ?? 0) * facing;
  const limbW = W * 0.11, ink = W * 0.035;
  // front view: left limbs open to -x, right limbs to +x (symmetric); profile: every limb swings toward `facing`
  const dL = pose.profile ? facing : -1, dR = pose.profile ? facing : 1;
  const leg = (p: [number, number], dx: number, d: number) => limb(dx, hipY, p[0], p[1], legL, legL2, d);
  const arm = (p: [number, number], dx: number, d: number) => limb(dx, shY + 14, p[0], p[1], armL, armL2, d);
  const hipX = pose.profile ? 10 : 22;
  const L1 = leg(pose.legL, -hipX, dL), L2 = leg(pose.legR, hipX, dR), A1 = arm(pose.armL, -42, dL), A2 = arm(pose.armR, 42, dR);
  const limbEl = (pts: [number, number][], col: string, end: string, endR: number, k: string) => (
    <g key={k}>
      <path d={path(pts)} stroke={INK} strokeWidth={limbW + ink * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path(pts)} stroke={col} strokeWidth={limbW} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[2][0]} cy={pts[2][1]} r={endR} fill={end} stroke={INK} strokeWidth={ink} />
    </g>
  );
  const torso = `M ${-48} ${shY} C ${-58} ${shY + 40} ${-50} ${hipY - 10} ${-40} ${hipY + 8} L ${40} ${hipY + 8} C ${50} ${hipY - 10} ${58} ${shY + 40} ${48} ${shY} C ${30} ${shY - 14} ${-30} ${shY - 14} ${-48} ${shY} Z`;
  const hand = look.gloves ?? look.skin;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * (1 + squash * 0.5)} ${scale * (1 - squash)})`} opacity={ghost ?? 1}>
      {shadow > 0 && <ellipse cx={0} cy={4} rx={70} ry={14} fill="#05040c" opacity={shadow} />}
      <g transform={`rotate(${lean + rot} 0 ${hipY})`}>
        {/* far limbs first */}
        {limbEl(facing > 0 ? L1 : L2, look.socks, look.boots ?? INK, limbW * 0.75, "l1")}
        {limbEl(facing > 0 ? A1 : A2, look.skin, hand, look.gloves ? limbW * 1.1 : limbW * 0.6, "a1")}
        {/* shorts + torso */}
        <path d={`M -42 ${hipY - 6} L 42 ${hipY - 6} L 46 ${hipY + 38} L 4 ${hipY + 38} L 0 ${hipY + 18} L -4 ${hipY + 38} L -46 ${hipY + 38} Z`} fill={look.shorts} stroke={INK} strokeWidth={ink} strokeLinejoin="round" />
        <path d={torso} fill={look.jersey} stroke={INK} strokeWidth={ink * 1.2} strokeLinejoin="round" />
        <path d={`M ${-30} ${shY + 6} C ${-44} ${shY + 50} ${-36} ${hipY - 20} ${-28} ${hipY}`} stroke={look.jersey2 ?? "#000"} strokeOpacity={look.jersey2 ? 1 : 0.18} strokeWidth={14} fill="none" />
        {look.number && <text x={0} y={shY + 82} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={46} fill={look.jersey2 ?? "#fff"} stroke={INK} strokeWidth={2}>{look.number}</text>}
        {rim && <path d={torso} fill="none" stroke={rim} strokeWidth={5} opacity={0.45} transform="translate(-3 -2)" />}
        {limbEl(facing > 0 ? L2 : L1, look.socks, look.boots ?? INK, limbW * 0.75, "l2")}
        {limbEl(facing > 0 ? A2 : A1, look.skin, hand, look.gloves ? limbW * 1.1 : limbW * 0.6, "a2")}
        {/* head */}
        <g transform={`translate(${facing * 4} ${shY - 6}) rotate(${(pose.headTilt ?? 0) * facing})`}>
          <rect x={-12} y={-14} width={24} height={20} fill={look.skin} stroke={INK} strokeWidth={ink} />
          <path d={headPath(W)} transform={`translate(0 -6)`} fill={look.skin} stroke={INK} strokeWidth={ink * 1.3} strokeLinejoin="round" />
          {look.hairStyle !== "none" && (
            <path transform="translate(0 -6)" fill={look.hair} stroke={INK} strokeWidth={ink} strokeLinejoin="round"
              d={look.hairStyle === "buzz" ? `M ${-W * 0.47} ${-H * 0.62} C ${-W * 0.4} ${-H * 1.05} ${W * 0.4} ${-H * 1.05} ${W * 0.47} ${-H * 0.62} C ${W * 0.3} ${-H * 0.82} ${-W * 0.3} ${-H * 0.82} ${-W * 0.47} ${-H * 0.62} Z`
                : look.hairStyle === "curly" ? `M ${-W * 0.5} ${-H * 0.55} C ${-W * 0.62} ${-H * 1.05} ${W * 0.62} ${-H * 1.1} ${W * 0.5} ${-H * 0.55} C ${W * 0.42} ${-H * 0.75} ${W * 0.2} ${-H * 0.72} 0 ${-H * 0.78} C ${-W * 0.2} ${-H * 0.72} ${-W * 0.42} ${-H * 0.75} ${-W * 0.5} ${-H * 0.55} Z`
                : look.hairStyle === "bun" ? `M ${-W * 0.48} ${-H * 0.58} C ${-W * 0.5} ${-H * 1.02} ${W * 0.5} ${-H * 1.02} ${W * 0.48} ${-H * 0.58} C ${W * 0.3} ${-H * 0.8} ${-W * 0.3} ${-H * 0.8} ${-W * 0.48} ${-H * 0.58} Z M ${-W * 0.12} ${-H * 1.0} a ${W * 0.14} ${W * 0.13} 0 1 1 ${W * 0.24} 0 a ${W * 0.14} ${W * 0.13} 0 1 1 ${-W * 0.24} 0 Z`
                : `M ${-W * 0.49} ${-H * 0.5} C ${-W * 0.55} ${-H * 1.08} ${W * 0.55} ${-H * 1.08} ${W * 0.49} ${-H * 0.5} C ${W * 0.4} ${-H * 0.74} ${W * 0.05} ${-H * 0.82} ${-W * 0.2} ${-H * 0.72} C ${-W * 0.33} ${-H * 0.7} ${-W * 0.42} ${-H * 0.62} ${-W * 0.49} ${-H * 0.5} Z`} />
          )}
          <g transform="translate(0 -6)"><Face w={W} expr={expr} blink={blink} lookX={pose.lookX ?? 0} /></g>
        </g>
      </g>
    </g>
  );
};

export const blinkAt = (f: number, seed = 0) => ((f + seed * 41) % 97) < 4;

// ---------------------------------------------------------------- crowd (simplified figures, one SVG)
const SKINS = ["#ffd9b8", "#f2c39b", "#d99c6c", "#a8673f", "#7a4a2e", "#ffe2c8"];
const TEAM_A = ["#e8443a", "#f6f1e7", "#e8443a", "#c9332b"], TEAM_B = ["#2d6fd8", "#f2c230", "#2d6fd8"];
export type CrowdMood = "idle" | "tense" | "cheer" | "laugh";

/** Rows of fans. Deterministic: every render tab draws the same crowd. `fog` fades far rows (fake depth). */
export const Crowd: React.FC<{ f: number; rows: number; width: number; y0: number; rowH?: number; size?: number; mood: CrowdMood;
  fogColor?: string; fog?: number; seed?: number }> = ({ f, rows, width, y0, rowH = 70, size = 46, mood, fogColor = "#101a3a", fog = 0.55, seed = 7 }) => {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out: React.ReactElement[] = [];
  for (let row = 0; row < rows; row++) {
    const depth = 1 - row / rows;                       // 0 = back row
    const sc = size * (0.78 + 0.22 * (1 - depth));
    const y = y0 + row * rowH;
    const n = Math.floor(width / (sc * 1.05));
    for (let i = 0; i < n; i++) {
      const x = (i + (row % 2) * 0.5) * (width / n) + (r() - 0.5) * 10;
      const team = r() < 0.62 ? TEAM_A : TEAM_B;
      const shirt = team[Math.floor(r() * team.length)], skin = SKINS[Math.floor(r() * SKINS.length)];
      const ph = r() * 6.28, energetic = r();
      const bounce = mood === "cheer" ? Math.abs(Math.sin(f * 0.35 + ph)) * 14 : mood === "laugh" ? Math.abs(Math.sin(f * 0.6 + ph)) * 6 : Math.sin(f * 0.08 + ph) * 1.5;
      const armsUp = (mood === "cheer" && energetic > 0.3) || (mood === "tense" && energetic > 0.85);
      const fade = fog * depth;
      const fc = (c: string) => mixC(c, fogColor, fade);
      out.push(
        <g key={`${row}-${i}`} transform={`translate(${x} ${y - bounce})`}>
          {armsUp && <path d={`M ${-sc * 0.35} ${-sc * 0.2} L ${-sc * 0.55} ${-sc * 1.25} M ${sc * 0.35} ${-sc * 0.2} L ${sc * 0.55} ${-sc * 1.25}`} stroke={INK} strokeWidth={sc * 0.16} strokeLinecap="round" />}
          <path d={`M ${-sc * 0.5} 0 C ${-sc * 0.5} ${-sc * 0.55} ${sc * 0.5} ${-sc * 0.55} ${sc * 0.5} 0 Z`} fill={fc(shirt)} stroke={INK} strokeWidth={sc * 0.06} />
          <ellipse cx={0} cy={-sc * 0.72} rx={sc * 0.32} ry={sc * 0.3} fill={fc(skin)} stroke={INK} strokeWidth={sc * 0.06} />
          {mood === "laugh" ? <path d={`M ${-sc * 0.12} ${-sc * 0.62} Q 0 ${-sc * 0.5} ${sc * 0.12} ${-sc * 0.62} Z`} fill="#5a1626" />
            : <path d={`M ${-sc * 0.1} ${-sc * 0.75} L ${-sc * 0.1} ${-sc * 0.73} M ${sc * 0.1} ${-sc * 0.75} L ${sc * 0.1} ${-sc * 0.73}`} stroke={INK} strokeWidth={sc * 0.07} strokeLinecap="round" />}
        </g>,
      );
    }
  }
  return <g>{out}</g>;
};
const hx = (h: string) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixC = (a: string, b: string, t: number) => { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };

export const KEEPER: Look = { skin: "#f2c39b", hair: "#2a1a14", hairStyle: "short", jersey: "#2fbf71", jersey2: "#156d40", shorts: "#1d2b44", socks: "#2fbf71", gloves: "#f5f2ea", number: "1" };
export const STRIKER: Look = { skin: "#a8673f", hair: "#151014", hairStyle: "curly", jersey: "#e8443a", jersey2: "#ffffff", shorts: "#ffffff", socks: "#e8443a", number: "9" };
