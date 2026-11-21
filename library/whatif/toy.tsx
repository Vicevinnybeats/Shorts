// WHAT IF style kit: original "toy" figures with a soft pseudo-3D look (radial-gradient shading, rim light, soft contact
// shadow). Big pale rounded-square head, painted dot eyes, small mouth, rosy cheeks, beanie or hair tuft, colored hoodie
// with a pocket and strings, stubby limbs. NEVER a dark round robot head with glowing visor eyes (the reference channel's
// character) - ours are pale, painted, soft. No CSS filters or blur: gradients only (fast on CPU renders).
// Local coordinates: feet (or seat, when sitting) at (0, 0), y up is negative; ~430 px tall standing at scale 1.
import React from "react";

export type ToyLook = {
  hood: string; hood2: string; pants: string; shoes: string;
  head?: string; hat?: "beanie" | "tuft" | "none"; hatColor?: string; cheek?: string;
};
export type ToyExpr = "neutral" | "happy" | "tired" | "shocked" | "sleepy" | "dizzy";
export type ToyPose = "stand" | "wave" | "point" | "sit" | "play" | "slump";

export const TOY_HEAD = "#f3ebe0";
export const TOY_INK = "#2a2233";

/** the hero (Remy, gold hoodie + teal beanie) and recolorable extras */
export const TOY_LOOKS: Record<string, ToyLook> = {
  remy: { hood: "#f2b43a", hood2: "#b97a12", pants: "#26304d", shoes: "#f1ede6", hat: "beanie", hatColor: "#1f7a84" },
  mo: { hood: "#3fc1d9", hood2: "#1f7f96", pants: "#3a2f4d", shoes: "#f1ede6", hat: "tuft", hatColor: "#4a3426" },
  june: { hood: "#ef6f6a", hood2: "#b0413f", pants: "#2a3a4a", shoes: "#f1ede6", hat: "beanie", hatColor: "#f2e6c9" },
  kit: { hood: "#9a7be0", hood2: "#6248a8", pants: "#2b2f44", shoes: "#f1ede6", hat: "tuft", hatColor: "#d9a441" },
  pip: { hood: "#5cc98a", hood2: "#2f8a58", pants: "#33304a", shoes: "#f1ede6", hat: "none", head: "#efe2d0" },
  sol: { hood: "#ff9a4a", hood2: "#c4621c", pants: "#1f2a40", shoes: "#f1ede6", hat: "beanie", hatColor: "#3a3f6a", head: "#eadccb" },
};

// ---------------------------------------------------------------- colour helpers
const hx = (h: string) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const tint = (a: string, b: string, t: number) => {
  const A = hx(a), B = hx(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
const gid = (...c: string[]) => "wi" + c.map((x) => x.replace("#", "")).join("");

/** soft contact shadow (radial gradient ellipse) */
export const ContactShadow: React.FC<{ x?: number; y?: number; rx?: number; ry?: number; o?: number }> = ({ x = 0, y = 0, rx = 120, ry = 20, o = 0.55 }) => (
  <g>
    <defs><radialGradient id="wiShadow"><stop offset="0" stopColor="#000" stopOpacity={1} /><stop offset="1" stopColor="#000" stopOpacity={0} /></radialGradient></defs>
    <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#wiShadow)" opacity={o} />
  </g>
);

/** a generic game controller (no logos): rounded body, d-pad, four colored buttons */
export const Controller: React.FC<{ x: number; y: number; scale?: number; rot?: number; lit?: number }> = ({ x, y, scale = 1, rot = 0, lit = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <defs><linearGradient id="wiPad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a5168" /><stop offset="1" stopColor="#1d2131" /></linearGradient></defs>
    <path d="M -70 -26 Q -84 -30 -92 -10 Q -108 34 -88 46 Q -70 54 -52 24 L 52 24 Q 70 54 88 46 Q 108 34 92 -10 Q 84 -30 70 -26 Q 0 -36 -70 -26 Z"
      fill="url(#wiPad)" stroke={TOY_INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -66 -20 Q 0 -30 66 -20" stroke="#8a93b0" strokeWidth={3} fill="none" opacity={0.6} />
    <path d="M -62 -4 L -38 -4 M -50 -16 L -50 8" stroke="#0e1018" strokeWidth={9} strokeLinecap="round" />
    {[[46, -14, "#5fe3ff"], [60, -2, "#ffc94a"], [32, -2, "#ff6b6b"], [46, 10, "#5ee08a"]].map(([bx, by, c], i) =>
      <circle key={i} cx={bx as number} cy={by as number} r={6.5} fill={c as string} />)}
    {lit > 0 && <ellipse cx={0} cy={-6} rx={110} ry={50} fill="#5fe3ff" opacity={0.12 * lit} />}
  </g>
);

const EYE_Y = -300, EYE_X = 44;

const Face: React.FC<{ expr: ToyExpr; lids: number; head: string; f: number; cheek: string }> = ({ expr, lids, head, f, cheek }) => {
  const arcEyes = expr === "happy";
  const lid = Math.max(lids, expr === "tired" ? 0.45 : expr === "sleepy" ? 0.78 : 0);
  const eyeR = expr === "shocked" ? 18 : 14;
  const eye = (sx: number) => {
    const ex = sx * EYE_X;
    if (arcEyes) return <path d={`M ${ex - 15} ${EYE_Y + 5} Q ${ex} ${EYE_Y - 15} ${ex + 15} ${EYE_Y + 5}`} stroke={TOY_INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
    if (expr === "dizzy") {
      const a = f * 0.25 * sx;
      return <g transform={`translate(${ex} ${EYE_Y}) rotate(${(a * 180) / Math.PI})`}>
        <path d="M 0 0 Q 6 -2 5 5 Q 2 11 -6 8 Q -13 3 -9 -7 Q -3 -15 8 -12 Q 17 -6 15 6" stroke={TOY_INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      </g>;
    }
    const closed = lid >= 0.98;
    return <g>
      {expr === "shocked" && <circle cx={ex} cy={EYE_Y} r={eyeR + 8} fill="#ffffff" stroke={TOY_INK} strokeWidth={3} />}
      {!closed && <circle cx={ex} cy={EYE_Y} r={eyeR} fill={TOY_INK} />}
      {!closed && <circle cx={ex - 4} cy={EYE_Y - 5} r={4.5} fill="#ffffff" />}
      {lid > 0.02 && !closed && <>
        <rect x={ex - eyeR - 3} y={EYE_Y - eyeR - 3} width={2 * eyeR + 6} height={(2 * eyeR + 4) * lid} fill={head} />
        <path d={`M ${ex - eyeR - 3} ${EYE_Y - eyeR - 2 + (2 * eyeR + 4) * lid} L ${ex + eyeR + 3} ${EYE_Y - eyeR - 2 + (2 * eyeR + 4) * lid}`} stroke={TOY_INK} strokeWidth={4.5} strokeLinecap="round" />
      </>}
      {closed && <path d={`M ${ex - 15} ${EYE_Y + 2} Q ${ex} ${EYE_Y + 10} ${ex + 15} ${EYE_Y + 2}`} stroke={TOY_INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />}
      {(expr === "tired" || expr === "sleepy" || lids > 0.3) && <path d={`M ${ex - 13} ${EYE_Y + 22} Q ${ex} ${EYE_Y + 30} ${ex + 13} ${EYE_Y + 22}`} stroke="#b48fb0" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />}
    </g>;
  };
  const mouth = (() => {
    switch (expr) {
      case "happy": return <path d="M -24 -262 Q 0 -228 24 -262 Z" fill="#5a2a35" stroke={TOY_INK} strokeWidth={4} strokeLinejoin="round" />;
      case "shocked": return <ellipse cx={0} cy={-250} rx={13} ry={17} fill="#5a2a35" stroke={TOY_INK} strokeWidth={4} />;
      case "tired": return <path d="M -13 -254 L 13 -256" stroke={TOY_INK} strokeWidth={5} strokeLinecap="round" />;
      case "sleepy": return <ellipse cx={4} cy={-252} rx={8} ry={6} fill="#5a2a35" />;
      case "dizzy": return <path d="M -22 -254 Q -15 -262 -8 -254 Q -1 -246 6 -254 Q 13 -262 20 -254" stroke={TOY_INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
      default: return <path d="M -14 -258 Q 0 -248 14 -258" stroke={TOY_INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    }
  })();
  return <g>
    {eye(-1)}{eye(1)}
    <ellipse cx={-72} cy={-264} rx={20} ry={12} fill={cheek} opacity={expr === "dizzy" ? 0.25 : 0.5} />
    <ellipse cx={72} cy={-264} rx={20} ry={12} fill={cheek} opacity={expr === "dizzy" ? 0.25 : 0.5} />
    {mouth}
  </g>;
};

/** the head on its own (head + hat + face), centred at (0, -300) in toy coordinates; used by Toy and by close-ups */
export const ToyHead: React.FC<{ look: ToyLook; expr?: ToyExpr; lids?: number; f?: number; rim?: string; green?: number }> =
  ({ look, expr = "neutral", lids = 0, f = 0, rim = "#7fe7ff", green = 0 }) => {
    const head = green > 0 ? tint(look.head ?? TOY_HEAD, "#b9d9a0", green) : (look.head ?? TOY_HEAD);
    const id = gid("h", head);
    const hatC = look.hatColor ?? "#333";
    const hid = gid("t", hatC);
    return <g>
      <defs>
        <radialGradient id={id} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#fffdf8" /><stop offset="0.55" stopColor={head} /><stop offset="1" stopColor={tint(head, "#8a7a6a", 0.35)} /></radialGradient>
        <linearGradient id={hid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={tint(hatC, "#ffffff", 0.25)} /><stop offset="1" stopColor={tint(hatC, "#000000", 0.3)} /></linearGradient>
      </defs>
      <rect x={-118} y={-402} width={236} height={204} rx={80} fill={`url(#${id})`} stroke={TOY_INK} strokeWidth={5} />
      <path d="M 96 -370 Q 118 -310 104 -236" stroke={rim} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.55} />
      <ellipse cx={-50} cy={-372} rx={34} ry={14} fill="#ffffff" opacity={0.35} transform="rotate(-18 -50 -372)" />
      {look.hat === "beanie" && <g>
        <path d="M -122 -334 Q -124 -432 0 -434 Q 124 -432 122 -334 Z" fill={`url(#${hid})`} stroke={TOY_INK} strokeWidth={5} strokeLinejoin="round" />
        <rect x={-128} y={-350} width={256} height={36} rx={18} fill={tint(hatC, "#000000", 0.18)} stroke={TOY_INK} strokeWidth={5} />
        {[-80, -40, 0, 40, 80].map((x) => <path key={x} d={`M ${x} -346 L ${x} -318`} stroke={tint(hatC, "#000000", 0.35)} strokeWidth={4} />)}
        <circle cx={0} cy={-438} r={22} fill={tint(hatC, "#ffffff", 0.45)} stroke={TOY_INK} strokeWidth={5} />
      </g>}
      {look.hat === "tuft" && <g fill="none" strokeLinecap="round">
        {[[-24, -398, -46, -448, -14, -462], [0, -400, -4, -458, 26, -466], [22, -398, 40, -440, 58, -438]].map((p, i) =>
          <g key={i}>
            <path d={`M ${p[0]} ${p[1]} Q ${p[2]} ${p[3]} ${p[4]} ${p[5]}`} stroke={TOY_INK} strokeWidth={20} />
            <path d={`M ${p[0]} ${p[1]} Q ${p[2]} ${p[3]} ${p[4]} ${p[5]}`} stroke={hatC} strokeWidth={12} />
          </g>)}
      </g>}
      <Face expr={expr} lids={lids} head={head} f={f} cheek={look.cheek ?? "#ff8f8f"} />
    </g>;
  };

const Arm: React.FC<{ sx: number; a: number; look: ToyLook; hid: string; head: string; len?: number }> = ({ sx, a, look, hid, head, len = 92 }) => (
  <g transform={`translate(${sx * 80} -192) rotate(${sx < 0 ? a : -a})`}>
    <rect x={-21} y={-12} width={42} height={len} rx={21} fill={`url(#${hid})`} stroke={TOY_INK} strokeWidth={5} />
    <circle cx={0} cy={len - 6} r={22} fill={head} stroke={TOY_INK} strokeWidth={5} />
  </g>
);

/**
 * A WHAT IF toy figure. x/y = feet (standing) or seat (sit/play/slump) in the parent's coordinates.
 * lids 0..1 closes the eyes gradually (heavy eyelids); tilt = head tilt (deg); green 0..1 = sick tint;
 * blink = automatic blinks from f.
 */
export const Toy: React.FC<{ x: number; y: number; scale?: number; look: ToyLook; pose?: ToyPose; expr?: ToyExpr; f?: number;
  lids?: number; tilt?: number; blink?: boolean; rim?: string; shadow?: number; seed?: number; green?: number; flip?: boolean }> =
  ({ x, y, scale = 1, look, pose = "stand", expr = "neutral", f = 0, lids = 0, tilt = 0, blink = true, rim = "#7fe7ff", shadow = 1, seed = 0, green = 0, flip = false }) => {
    const head = look.head ?? TOY_HEAD;
    const hid = gid("b", look.hood, look.hood2);
    const sitting = pose === "sit" || pose === "play" || pose === "slump";
    const breathe = 1 + 0.014 * Math.sin(f * 0.11 + seed);
    const bl = blink && expr !== "happy" && expr !== "dizzy" && ((f + seed * 37) % 97) < 3 ? 1 : 0;
    const L = Math.max(lids, bl);
    const arms: [number, number] =
      pose === "wave" ? [10, 128 + 22 * Math.sin(f * 0.32)] :
      pose === "point" ? [10, 92] :
      pose === "play" ? [-28, -28] :
      pose === "slump" ? [4, 4] :
      pose === "sit" ? [14, 14] : [9 + 2 * Math.sin(f * 0.07 + seed), 9 + 2 * Math.sin(f * 0.07 + seed + 1)];
    const lift = sitting ? 62 : 0;
    const slump = pose === "slump" ? 1 : 0;
    const headTilt = tilt + (slump ? 12 : 0);
    const headDrop = slump ? 18 : 0;
    return (
      <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
        <defs>
          <linearGradient id={hid} x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stopColor={tint(look.hood, "#ffffff", 0.18)} /><stop offset="0.55" stopColor={look.hood} /><stop offset="1" stopColor={look.hood2} /></linearGradient>
        </defs>
        {shadow > 0 && <ContactShadow rx={sitting ? 150 : 120} ry={sitting ? 26 : 20} o={0.55 * shadow} />}
        {/* legs */}
        {sitting
          ? [-1, 1].map((s) => <g key={s}>
              <rect x={s * 52 - 24} y={-40} width={48} height={40} rx={20} fill={look.pants} stroke={TOY_INK} strokeWidth={5} />
              <ellipse cx={s * 60} cy={-4} rx={34} ry={30} fill={look.shoes} stroke={TOY_INK} strokeWidth={5} />
              <ellipse cx={s * 60} cy={-4} rx={18} ry={15} fill={tint(look.shoes, "#9a8f86", 0.35)} />
            </g>)
          : [-1, 1].map((s) => <g key={s}>
              <rect x={s * 33 - 19} y={-82} width={38} height={72} rx={18} fill={look.pants} stroke={TOY_INK} strokeWidth={5} />
              <ellipse cx={s * 38} cy={-10} rx={32} ry={16} fill={look.shoes} stroke={TOY_INK} strokeWidth={5} />
            </g>)}
        <g transform={`translate(0 ${lift}) rotate(${slump ? 6 : 0} 0 -64) scale(1 ${breathe}) translate(0 ${(1 - breathe) * 0})`}>
          {/* back arm layer for play pose (arms come forward over the body) */}
          {pose !== "play" && <><Arm sx={-1} a={arms[0]} look={look} hid={hid} head={head} /><Arm sx={1} a={arms[1]} look={look} hid={hid} head={head} /></>}
          {/* hoodie */}
          <path d="M -72 -214 Q -86 -214 -90 -194 L -98 -90 Q -100 -62 -72 -62 L 72 -62 Q 100 -62 98 -90 L 90 -194 Q 86 -214 72 -214 Z"
            fill={`url(#${hid})`} stroke={TOY_INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 86 -188 L 93 -94" stroke={rim} strokeWidth={5} strokeLinecap="round" opacity={0.55} />
          <path d="M -50 -128 L 50 -128 Q 58 -128 58 -118 L 60 -88 L -60 -88 L -58 -118 Q -58 -128 -50 -128 Z" fill={look.hood2} opacity={0.55} stroke={TOY_INK} strokeWidth={3} />
          <path d="M -20 -204 L -22 -160 M 20 -204 L 22 -160" stroke="#f6efe4" strokeWidth={5} strokeLinecap="round" />
          <circle cx={-22} cy={-157} r={6} fill="#f6efe4" /><circle cx={22} cy={-157} r={6} fill="#f6efe4" />
          <ellipse cx={0} cy={-212} rx={86} ry={22} fill={look.hood2} stroke={TOY_INK} strokeWidth={5} />
          {/* head */}
          <g transform={`translate(0 ${headDrop}) rotate(${headTilt} 0 -210)`}>
            <ToyHead look={look} expr={expr} lids={L} f={f} rim={rim} green={green} />
          </g>
          {pose === "play" && <>
            <Arm sx={-1} a={arms[0]} look={look} hid={hid} head={head} len={84} />
            <Arm sx={1} a={arms[1]} look={look} hid={hid} head={head} len={84} />
            <Controller x={0} y={-108 + 2 * Math.sin(f * 0.5)} scale={0.62} rot={2 * Math.sin(f * 0.21)} />
          </>}
        </g>
      </g>
    );
  };
