// 2.5D stage: flat illustrated layers at different depths, moved by one camera with parallax. Plain DOM/SVG with
// CSS transforms (no WebGL), so frames render fast on CPU runners. Coordinates: a 1080x1920 design space.
//   depth p: 0 = sky (never moves), 0.3 = far stands, 1 = the subject plane, 1.4+ = foreground (moves more than 1).
import React from "react";
import { AbsoluteFill } from "remotion";

export type Cam = { x: number; y: number; zoom: number; rot?: number };
export const CAM0: Cam = { x: 0, y: 0, zoom: 1, rot: 0 };

const W = 1080, H = 1920;

/** Camera shake/drift added on top of a camera (handheld feel), deterministic per frame. */
export const drift = (c: Cam, f: number, amp = 6, speed = 1): Cam => ({
  ...c,
  x: c.x + Math.sin(f * 0.045 * speed) * amp + Math.sin(f * 0.13 * speed) * amp * 0.35,
  y: c.y + Math.cos(f * 0.038 * speed) * amp * 0.7,
  rot: (c.rot ?? 0) + Math.sin(f * 0.03 * speed) * amp * 0.03,
});

/** Impact shake: sign flips every frame, decays over 8 frames (the skill's camera kick). */
export const kickCam = (c: Cam, framesSince: number, amp = 18): Cam => {
  if (framesSince < 0 || framesSince > 8) return c;
  const k = amp * (framesSince % 2 ? -1 : 1) * (1 - framesSince / 9);
  return { ...c, x: c.x + k, y: c.y - k * 0.6, rot: (c.rot ?? 0) + k * 0.05 };
};

export const CamContext = React.createContext<Cam>(CAM0);

/** A depth layer. Its content is drawn in the 1080x1920 design space around (cx, cy) = (540, 960). */
export const Layer: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, children, style }) => {
  const c = React.useContext(CamContext);
  const s = 1 + (c.zoom - 1) * p;
  const t = `translate(${W / 2}px, ${H / 2}px) rotate(${(c.rot ?? 0) * Math.min(1, p + 0.2)}deg) scale(${s}) translate(${-c.x * p - W / 2}px, ${-c.y * p - H / 2}px)`;
  return (
    <AbsoluteFill style={{ transform: t, transformOrigin: "0 0", ...style }}>
      {children}
    </AbsoluteFill>
  );
};

export const Stage: React.FC<{ cam: Cam; bg?: string; children: React.ReactNode }> = ({ cam, bg = "#0d1630", children }) => (
  <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
    <CamContext.Provider value={cam}>{children}</CamContext.Provider>
  </AbsoluteFill>
);

/** Full-frame SVG in design coordinates, for use inside a Layer. */
export const Svg: React.FC<{ children: React.ReactNode; w?: number; h?: number; x?: number; y?: number }> = ({ children, w = W, h = H, x = 0, y = 0 }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    {children}
  </svg>
);

// ---------------------------------------------------------------- colour helpers (fake depth = colour fade)
const hex = (h: string) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
/** mix two #rrggbb colours, t = 0 -> a, 1 -> b */
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
export const shade = (c: string, k: number) => mix(c, k < 1 ? "#000000" : "#ffffff", k < 1 ? 1 - k : k - 1);

/** deterministic random */
export const rnd = (seed: number) => { let s = seed * 9301 + 49297; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
