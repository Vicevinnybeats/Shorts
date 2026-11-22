// DAYLIGHT kit for Stick3D (owner 2026-11-22: bright daylight, big full 3D worlds with depth: blue sky with soft clouds,
// sun, haze/fog into the distance, warm saturated colours, large environments). Our 2D bean puppets stay as they are.
// New file (shared Stick3D files untouched). Colours for canvases/surfaces go through `disp()` because Stick3D canvases
// render with `linear flat` (no sRGB output encode): disp() pre-encodes the wanted DISPLAY colour.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Surface } from "./toon";
import { V3 } from "./kit";
import { Glb } from "./glb";

/** colour you want to SEE on screen -> value to author under `linear flat` (sRGB-encode it once more) */
export const disp = (hex: string) => {
  const c = new THREE.Color(hex); // three converts the sRGB hex to linear working space
  const enc = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
  const lin = new THREE.Color().setRGB(c.r, c.g, c.b, THREE.LinearSRGBColorSpace);
  const r = enc(enc(lin.r)), g = enc(enc(lin.g)), b = enc(enc(lin.b)); // undo the decode + the missing encode
  return "#" + [r, g, b].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("");
};

export const DAY = {
  skyTop: "#3f8fe0", skyHorizon: "#cfe9fb", haze: "#d6ecfa", sun: "#fff2d6", sand: "#e9c48e", grass: "#8cc46b",
  plaster: "#f4e8d4", wood: "#c8925e", wood2: "#b5804f", tileA: "#eef2f6", tileB: "#e2e8ef", asphalt: "#5e626b",
} as const;

// ---------------------------------------------------------------- sky + sun + haze
const skyTexCache: Record<string, THREE.CanvasTexture> = {};
const skyTex = (top: string, hor: string, warm: number) => {
  const key = top + hor + warm;
  if (skyTexCache[key]) return skyTexCache[key];
  const c = document.createElement("canvas"); c.width = 8; c.height = 256; const g = c.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, top); gr.addColorStop(0.42, hor); gr.addColorStop(0.5, warm > 0 ? "#ffe2b8" : hor); gr.addColorStop(1, hor); // NoColorSpace texture: shown as authored
  g.fillStyle = gr; g.fillRect(0, 0, 8, 256);
  const t = new THREE.CanvasTexture(c); skyTexCache[key] = t; return t;
};
/** sky dome (no fog), sun disc + glow, distance haze (scene fog) */
export const DaySky: React.FC<{ top?: string; horizon?: string; haze?: string; fogNear?: number; fogFar?: number; sun?: V3; warm?: number }> =
  ({ top = DAY.skyTop, horizon = DAY.skyHorizon, haze = DAY.haze, fogNear = 30, fogFar = 170, sun = [60, 70, -140], warm = 0 }) => {
    const tex = skyTex(top, horizon, warm);
    return (<>
      <fog attach="fog" args={[disp(haze), fogNear, fogFar]} />
      <mesh renderOrder={-10}><sphereGeometry args={[190, 24, 16]} /><meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} toneMapped={false} /></mesh>
      <sprite position={sun} scale={[26, 26, 1]}><spriteMaterial map={sunTex()} color={disp(DAY.sun)} transparent fog={false} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} /></sprite>
    </>);
  };
let sunT: THREE.CanvasTexture | null = null;
const sunTex = () => {
  if (sunT) return sunT;
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.18, "rgba(255,255,255,1)"); r.addColorStop(0.24, "rgba(255,250,230,.5)"); r.addColorStop(1, "rgba(255,240,210,0)");
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); sunT = new THREE.CanvasTexture(c); return sunT;
};
/** ONE main light (warm sun, soft shadow map) + soft sky/ground fill. `target` = where the action is. */
export const SunRig: React.FC<{ target?: V3; dir?: V3; k?: number; fill?: number }> = ({ target = [0, 0, 0], dir = [6, 10, 5], k = 1, fill = 1 }) => (<>
  <ambientLight intensity={0.55 * fill} />
  <hemisphereLight args={["#cfe6ff", "#e0b27e", 1.15 * fill]} />
  <directionalLight position={[target[0] + dir[0], target[1] + dir[1], target[2] + dir[2]]} intensity={2.3 * k} color="#fff1d8" castShadow
    shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.03}
    shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-camera-near={0.5} shadow-camera-far={45}>
    <object3D attach="target" position={target} />
  </directionalLight>
</>);

// ---------------------------------------------------------------- ground
const groundCache: Record<string, THREE.CanvasTexture> = {};
const groundTex = (base: string, speck: string, seed: number) => {
  const key = base + speck + seed; if (groundCache[key]) return groundCache[key];
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d")!;
  g.fillStyle = disp(base); g.fillRect(0, 0, 256, 256);
  let n = seed * 977; const rr = () => { n = (n * 9301 + 49297) % 233280; return n / 233280; };
  for (let i = 0; i < 900; i++) { g.fillStyle = rr() > 0.5 ? disp(speck) : "rgba(255,255,255,.18)"; const s = 1 + rr() * 2.5; g.fillRect(rr() * 256, rr() * 256, s, s); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(60, 60); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; groundCache[key] = t; return t;
};
/** huge lit ground (sand/gravel/grass speckle) that runs into the haze */
export const DayGround: React.FC<{ base?: string; speck?: string; y?: number; seed?: number; size?: number; z?: number }> = ({ base = DAY.sand, speck = "#c99a62", y = -0.02, seed = 3, size = 400, z = -120 }) => (
  <mesh position={[0, y, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[size, size]} /><meshLambertMaterial map={groundTex(base, speck, seed)} /></mesh>
);
/** distant city skyline from city_block models, palms in front, all fading into the haze */
export const CityBackdrop: React.FC<{ z?: number; spread?: number; t?: number }> = ({ z = -60, spread = 70 }) => (<>
  {[-3, -2, -1, 0, 1, 2, 3].map((i) => <Glb key={i} name="city_block" p={[i * spread / 6 + (i % 2) * 3, 0, z - Math.abs(i) * 6 - (i % 2 ? 12 : 0)]} rot={[0, i * 0.7, 0]} s={1.2 + ((i + 7) % 3) * 0.3} line={2} />)}
</>);
export const Palms: React.FC<{ at: V3[]; s?: number }> = ({ at, s = 1 }) => <>{at.map((p, i) => <Glb key={i} name="palm_tree_day" p={p} rot={[0, i * 1.3, 0]} s={s * (0.9 + (i % 3) * 0.12)} line={2} />)}</>;
/** soft clouds that drift slowly (t seconds) */
export const Clouds: React.FC<{ t: number; at: V3[]; s?: number }> = ({ t, at, s = 3 }) => <>{at.map((p, i) => <Glb key={i} name="cloud_puff" p={[p[0] + t * 0.25 * (i % 2 ? 1 : 0.7), p[1], p[2]]} rot={[0, i, 0]} s={s * (0.8 + (i % 3) * 0.25)} line={0} />)}</>;

// ---------------------------------------------------------------- interiors
/** back wall (z) with a big window opening (window_frame model in the hole); everything outside shows through */
export const WindowWall: React.FC<{ z: number; W?: number; H?: number; win: { x: number; y: number; w: number; h: number }; a: string; b?: string; kind?: "plain" | "brick" | "wood"; gain?: number }> =
  ({ z, W = 30, H = 10, win, a, b, kind = "plain", gain = 1 }) => {
    const l = win.x - win.w / 2, r = win.x + win.w / 2, bt = win.y, tp = win.y + win.h;
    const pieces: [number, number, number, number][] = [[-W / 2, l, 0, H], [r, W / 2, 0, H], [l, r, 0, bt], [l, r, tp, H]];
    const A = disp(a), B = disp(b ?? a);
    return (<>
      {pieces.map(([x0, x1, y0, y1], i) => <Surface key={i} lit gain={gain} p={[(x0 + x1) / 2, (y0 + y1) / 2, z]} s={[x1 - x0, y1 - y0]} kind={kind} a={A} b={B} unit={1.6} />)}
      <Glb name="window_frame" p={[win.x, win.y, z + 0.05]} s={[win.w / 6, win.h / 4, 1]} line={2} />
    </>);
  };
/** light patch of sun through a window on the floor (soft, additive) */
export const SunPatch: React.FC<{ p: V3; s: [number, number]; o?: number }> = ({ p, s, o = 0.22 }) => {
  const tex = useMemo(() => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d")!; const gr = g.createRadialGradient(32, 32, 4, 32, 32, 32); gr.addColorStop(0, "rgba(255,240,200,1)"); gr.addColorStop(1, "rgba(255,240,200,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); }, []);
  return <mesh position={[p[0], p[1] + 0.03, p[2]]} rotation={[-Math.PI / 2, 0, 0.3]}><planeGeometry args={s} /><meshBasicMaterial map={tex} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>;
};
