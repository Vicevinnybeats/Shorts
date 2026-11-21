// Golden Neon helpers for Stick3D (WHAT IF series, owner decision 2026-11-21: Stick3D look in the Golden Neon colours).
// Black/navy rooms, gold #f5b942 / amber #ffcf6e / coral #ff7a59 accents, cyan #5fe3ff ONLY for HUD or "not real" things
// (game world, hallucinations). Glow = additive sprites/planes with one shared cached texture (no CSS blur/filters);
// canvases redraw only when their `dep` changes (cheap on CPU renders). Logged in brain/stick3d/ACTION-LIBRARY.md.
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Box, Cyl } from "./toon";
import { V3 } from "./kit";
import { SpotCone } from "./extra";

export const N3 = {
  bg: "#040509", wallA: "#131829", wallB: "#0f1322", navy: "#1b2238", navy2: "#252d48", floorA: "#1a1510", floorB: "#15110c",
  gold: "#f5b942", amber: "#ffcf6e", coral: "#ff7a59", cyan: "#5fe3ff", hot: "#fff3d0", cream: "#fff1d6", muted: "#b89a66",
  dim: "#8a6a2e", faint: "#3a2c14", ink: "#0b0d1a",
} as const;
export const FONT3 = "CaptionSans, Arial, sans-serif";

// ---------------------------------------------------------------- shared textures (built once)
const cache: Record<string, THREE.Texture> = {};
const make = (key: string, w: number, h: number, paint: (g: CanvasRenderingContext2D) => void) => {
  if (cache[key]) return cache[key];
  const c = document.createElement("canvas"); c.width = w; c.height = h; paint(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); cache[key] = t; return t;
};
/** soft white radial blob (tinted by material colour) */
export const radialTex = () => make("radial", 128, 128, (g) => {
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.25, "rgba(255,255,255,.55)"); r.addColorStop(0.6, "rgba(255,255,255,.14)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
});
/** soft horizontal band (neon tube halo) */
const bandTex = () => make("band", 64, 64, (g) => {
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const v = 1 - Math.abs(y - 31.5) / 32, e = Math.min(1, Math.min(x, 63 - x) / 10);
    g.fillStyle = `rgba(255,255,255,${(v * v * e).toFixed(3)})`; g.fillRect(x, y, 1, 1);
  }
});

// ---------------------------------------------------------------- glow
/** camera-facing additive glow sprite (no per-frame canvas work) */
export const Halo: React.FC<{ p: V3; r: number; color: string; o?: number }> = ({ p, r, color, o = 0.6 }) => o <= 0.002 ? null : (
  <sprite position={p} scale={[r * 2, r * 2, 1]}>
    <spriteMaterial map={radialTex()} color={color} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
  </sprite>
);
/** flat light pool on the floor */
export const FloorPool: React.FC<{ p: V3; r: number; color: string; o?: number; sx?: number }> = ({ p, r, color, o = 0.5, sx = 1 }) => (
  <mesh position={[p[0], p[1] + 0.025, p[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[sx, 1, 1]}>
    <planeGeometry args={[r * 2, r * 2]} />
    <meshBasicMaterial map={radialTex()} color={color} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
  </mesh>
);
/** unlit neon tube (box) + soft band halo in its local XY plane */
export const NeonBar: React.FC<{ p: V3; s: V3; color: string; rot?: V3; glow?: number; o?: number }> = ({ p, s, color, rot, glow = 0.55, o = 1 }) => {
  const vert = s[1] > s[0];
  return (
    <group position={p} rotation={rot}>
      <mesh><boxGeometry args={s} /><meshBasicMaterial color={color} transparent={o < 1} opacity={o} toneMapped={false} /></mesh>
      {glow > 0 && <mesh position={[0, 0, -s[2] / 2 - 0.01]} rotation={[0, 0, vert ? Math.PI / 2 : 0]}>
        <planeGeometry args={vert ? [s[1] + 0.3, 0.7] : [s[0] + 0.3, 0.7]} />
        <meshBasicMaterial map={bandTex()} color={color} transparent opacity={glow * o} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>}
    </group>
  );
};
/** hero spotlight: visible cone from a ceiling can + floor pool + source glow */
export const HeroLight: React.FC<{ p: V3; h?: number; r?: number; color?: string; o?: number; t?: number }> = ({ p, h = 6.5, r = 1.5, color = N3.amber, o = 1, t = 0 }) => {
  const fl = 0.94 + 0.06 * Math.sin(t * 4.1) * Math.sin(t * 1.3);
  return (<>
    <SpotCone p={[p[0], p[1] + h, p[2]]} h={h} r={r} color={color} o={0.075 * o * fl} />
    <FloorPool p={p} r={r * 1.35} color={color} o={0.5 * o * fl} />
    <Cyl p={[p[0], p[1] + h + 0.15, p[2]]} rt={0.22} rb={0.3} h={0.32} color="#1b1f30" line={2} />
    <Halo p={[p[0], p[1] + h - 0.05, p[2]]} r={0.7} color={color} o={0.9 * o} />
  </>);
};
/** floating dust motes (additive sprites) drifting in an area around c */
export const Motes: React.FC<{ t: number; n?: number; c?: V3; area: V3; color?: string; size?: number; o?: number }> = ({ t, n = 16, c = [0, 0, 0], area, color = N3.amber, size = 0.05, o = 0.85 }) => (
  <>{Array.from({ length: n }, (_, i) => {
    const u = (t * 0.06 + i * 0.137) % 1;
    const x = c[0] + Math.sin(i * 12.9 + t * 0.2) * area[0], y = c[1] + (((i * 0.37) % 1) * 0.8 + u * 0.4) * area[1], z = c[2] + Math.cos(i * 7.7) * area[2];
    return <Halo key={i} p={[x, y, z]} r={size * (1 + (i % 3) * 0.5)} color={color} o={o * Math.sin(u * Math.PI)} />;
  })}</>
);

// ---------------------------------------------------------------- canvas panel (redraws only when dep changes)
export const Panel: React.FC<{ p: V3; s: [number, number]; rot?: V3; px?: [number, number]; draw: (c: CanvasRenderingContext2D, W: number, H: number) => void;
  dep?: string | number; additive?: boolean; face?: boolean; o?: number }> = ({ p, s, rot = [0, 0, 0], px = [512, 512], draw, dep, additive, face, o = 1 }) => {
  const { camera } = useThree();
  const { cv, tex } = useMemo(() => { const cv = document.createElement("canvas"); cv.width = px[0]; cv.height = px[1]; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; return { cv, tex }; }, []);
  const last = useRef<string | number | null | undefined>(Symbol("init") as unknown as string);
  if (dep === undefined || last.current !== dep) { const c = cv.getContext("2d")!; c.clearRect(0, 0, px[0], px[1]); draw(c, px[0], px[1]); tex.needsUpdate = true; last.current = dep; }
  const ref = useRef<THREE.Group>(null);
  React.useLayoutEffect(() => { if (face && ref.current) ref.current.quaternion.copy(camera.quaternion); });
  return <group ref={ref} position={p} rotation={face ? undefined : rot}>
    <mesh><planeGeometry args={s} />
      <meshBasicMaterial map={tex} transparent opacity={o} alphaTest={additive ? 0 : 0.02} blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending} depthWrite={!additive} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  </group>;
};
/** glowing neon text drawn into a canvas (shadowBlur glow inside the canvas, additive) */
export const NeonSign: React.FC<{ p: V3; s: [number, number]; text: string; color: string; rot?: V3; o?: number; face?: boolean; box?: boolean; size?: number }> =
  ({ p, s, text, color, rot, o = 1, face, box, size }) => {
    const px: [number, number] = [Math.round(s[0] * 140), Math.round(s[1] * 140)];
    const fs = size ?? px[1] * 0.62;
    return <Panel p={p} s={s} rot={rot} px={px} face={face} additive o={o} dep={text + color + (box ? 1 : 0)} draw={(c, W, H) => {
      c.textAlign = "center"; c.textBaseline = "middle"; c.font = `900 ${fs}px ${FONT3}`; c.lineJoin = "round";
      c.shadowColor = color; c.shadowBlur = fs * 0.3;
      if (box) { c.strokeStyle = color; c.lineWidth = Math.max(4, H * 0.05); c.beginPath(); c.roundRect(H * 0.08, H * 0.08, W - H * 0.16, H - H * 0.16, H * 0.14); c.stroke(); }
      c.fillStyle = color; c.fillText(text, W / 2, H / 2 + fs * 0.04);
      c.shadowBlur = 0; c.globalAlpha = 0.55; c.fillStyle = N3.hot; c.fillText(text, W / 2, H / 2 + fs * 0.04);
    }} />;
  };

// ---------------------------------------------------------------- props
/** dark wall clock with a gold glowing rim; `hours` drives the hands (0..∞) */
export const NeonClock: React.FC<{ p: V3; r?: number; hours: number; rot?: V3 }> = ({ p, r = 0.6, hours, rot }) => (
  <Panel p={p} s={[r * 2, r * 2]} rot={rot} px={[256, 256]} dep={Math.round(hours * 120)} draw={(c, W) => {
    const m = W / 2; c.fillStyle = "#0c0f1a"; c.beginPath(); c.arc(m, m, m - 8, 0, 7); c.fill();
    c.shadowColor = N3.gold; c.shadowBlur = 14; c.strokeStyle = N3.gold; c.lineWidth = 9; c.beginPath(); c.arc(m, m, m - 12, 0, 7); c.stroke();
    c.lineWidth = 6; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; c.beginPath(); c.moveTo(m + Math.sin(a) * (m - 30), m - Math.cos(a) * (m - 30)); c.lineTo(m + Math.sin(a) * (m - 46), m - Math.cos(a) * (m - 46)); c.stroke(); }
    const hand = (a: number, l: number, w: number, col: string) => { c.strokeStyle = col; c.shadowColor = col; c.lineWidth = w; c.lineCap = "round"; c.beginPath(); c.moveTo(m, m); c.lineTo(m + Math.sin(a) * l, m - Math.cos(a) * l); c.stroke(); };
    hand((hours / 12) * Math.PI * 2, m * 0.5, 10, N3.amber); hand(hours * Math.PI * 2, m * 0.72, 6, N3.coral);
    c.fillStyle = N3.hot; c.beginPath(); c.arc(m, m, 9, 0, 7); c.fill();
  }} />
);
/** night skyline window (navy sky, gold lit windows, moon); dawn 0..1 warms the sky to amber */
export const NightWindow: React.FC<{ p: V3; s: [number, number]; dawn?: number; seed?: number; palm?: boolean }> = ({ p, s, dawn = 0, seed = 3, palm }) => (
  <group position={p}>
    <Box p={[0, 0, -0.06]} s={[s[0] + 0.3, s[1] + 0.3, 0.1]} color="#2b2f45" line={4} />
    <Panel p={[0, 0, 0.0]} s={s} px={[Math.round(s[0] * 110), Math.round(s[1] * 110)]} dep={Math.round(dawn * 30)} draw={(c, W, H) => {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, dawn > 0 ? `rgb(${20 + 60 * dawn},${22 + 40 * dawn},${50 + 10 * dawn})` : "#0b1030"); g.addColorStop(1, dawn > 0 ? `rgb(${60 + 190 * dawn},${40 + 120 * dawn},${50 + 20 * dawn})` : "#1d1840"); c.fillStyle = g; c.fillRect(0, 0, W, H);
      let n = seed * 31; const rr = () => { n = (n * 9301 + 49297) % 233280; return n / 233280; };
      for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(255,240,210,${(0.3 + rr() * 0.6) * (1 - dawn)})`; c.fillRect(rr() * W, rr() * H * 0.5, 2, 2); }
      c.fillStyle = dawn > 0.5 ? "rgba(255,230,170,.9)" : "#fff3d0"; c.shadowColor = N3.amber; c.shadowBlur = 20; c.beginPath(); c.arc(W * 0.75, H * (0.22 + 0.4 * dawn), H * 0.08, 0, 7); c.fill(); c.shadowBlur = 0;
      for (let i = 0; i < 9; i++) { const bw = W / 7, bh = H * (0.25 + rr() * 0.35), x = i * bw * 0.85 - 10; c.fillStyle = "#06070d"; c.fillRect(x, H - bh, bw, bh);
        for (let yy = H - bh + 10; yy < H - 8; yy += 16) for (let xx = x + 6; xx < x + bw - 8; xx += 13) if (rr() > 0.62) { c.fillStyle = rr() > 0.85 ? N3.coral : N3.gold; c.fillRect(xx, yy, 5, 7); } }
      if (palm) { c.strokeStyle = "#06070d"; c.lineWidth = W * 0.02; c.beginPath(); c.moveTo(W * 0.2, H); c.quadraticCurveTo(W * 0.24, H * 0.6, W * 0.18, H * 0.4); c.stroke(); c.fillStyle = "#06070d"; for (let k = 0; k < 6; k++) { const a = -2.6 + k * 0.5; c.beginPath(); c.ellipse(W * 0.18 + Math.cos(a) * W * 0.09, H * 0.4 + Math.sin(a) * H * 0.05, W * 0.1, H * 0.018, a, 0, 7); c.fill(); } }
      c.strokeStyle = "#2b2f45"; c.lineWidth = 8; c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, H); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.stroke();
    }} />
  </group>
);
/** abstract poster in palette colours (no logos, no game art) */
export const NeonPoster: React.FC<{ p: V3; s: [number, number]; art?: number; rot?: V3 }> = ({ p, s, art = 0, rot }) => (
  <group position={p} rotation={rot}>
    <Box p={[0, 0, -0.04]} s={[s[0] + 0.14, s[1] + 0.14, 0.06]} color="#1d2236" line={3} />
    <Panel p={[0, 0, 0]} s={s} px={[Math.round(s[0] * 90), Math.round(s[1] * 90)]} dep={art} draw={(c, W, H) => {
      c.fillStyle = "#0a0c16"; c.fillRect(0, 0, W, H); c.shadowBlur = 10;
      const col = [N3.gold, N3.coral, N3.amber][art % 3]; c.shadowColor = col; c.strokeStyle = col; c.lineWidth = 5;
      if (art % 3 === 0) { for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(W / 2, H * 0.55, W * (0.12 + i * 0.09), Math.PI, 0); c.stroke(); } c.fillStyle = col; c.fillRect(W * 0.15, H * 0.8, W * 0.7, 6); }
      else if (art % 3 === 1) { c.beginPath(); c.moveTo(W * 0.2, H * 0.8); c.lineTo(W * 0.5, H * 0.2); c.lineTo(W * 0.8, H * 0.8); c.closePath(); c.stroke(); c.beginPath(); c.arc(W / 2, H * 0.6, W * 0.08, 0, 7); c.stroke(); }
      else { for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(W * 0.15, H * (0.2 + i * 0.13)); c.lineTo(W * (0.4 + 0.1 * ((i * 7) % 5)), H * (0.2 + i * 0.13)); c.stroke(); } }
    }} />
  </group>
);
