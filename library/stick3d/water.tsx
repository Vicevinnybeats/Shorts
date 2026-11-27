// WATER kit for the bright daylight Stick3D look (What If #6 breath, 2026-11-27). New file, shared files untouched.
// Cheap but convincing water: translucent tinted planes + moving caustic light stripes (additive canvas textures),
// sun glints, rising bubbles, light shafts, and an underwater "room" (blue gradient dome + blue fog + bright surface
// seen from below). Colours go through disp() (Stick3D canvases render `linear flat`).
import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "./kit";
import { disp } from "./daylight";

// ---------------------------------------------------------------- textures (cached per kind, cloned per user for offsets)
const texCache: Record<string, THREE.CanvasTexture> = {};
/** caustic net: wavy bright lines that cross into cells (tileable); `soft` = wider, dimmer lines */
const causticTex = (soft = false) => {
  const key = "caustic" + soft;
  if (texCache[key]) return texCache[key];
  const S = 256, c = document.createElement("canvas"); c.width = c.height = S; const g = c.getContext("2d")!;
  g.fillStyle = "#000"; g.fillRect(0, 0, S, S);
  g.lineCap = "round"; g.lineJoin = "round";
  const pass = (w: number, a: number) => {
    g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = w;
    for (let k = 0; k < 7; k++) {
      // horizontal-ish wobbly lines (tileable: period S)
      g.beginPath();
      for (let x = 0; x <= S; x += 8) { const y = (k * S) / 7 + 10 * Math.sin((x / S) * Math.PI * 2 * 2 + k * 1.7) + 6 * Math.sin((x / S) * Math.PI * 2 * 3 + k); x === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
      g.beginPath();
      for (let y = 0; y <= S; y += 8) { const x = (k * S) / 7 + 12 * Math.sin((y / S) * Math.PI * 2 * 2 + k * 2.3) + 5 * Math.sin((y / S) * Math.PI * 2 * 3 + k * 0.6); y === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
    }
  };
  if (soft) { pass(14, 0.18); pass(6, 0.35); } else { pass(9, 0.22); pass(3.2, 0.8); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; texCache[key] = t; return t;
};
/** vertical fade (bright top -> clear bottom) for light shafts */
const shaftTex = () => {
  if (texCache.shaft) return texCache.shaft;
  const c = document.createElement("canvas"); c.width = 64; c.height = 256; const g = c.getContext("2d")!;
  const v = g.createLinearGradient(0, 0, 0, 256); v.addColorStop(0, "rgba(255,255,255,1)"); v.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = v; g.fillRect(0, 0, 64, 256);
  g.globalCompositeOperation = "destination-in";
  const h = g.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, "rgba(0,0,0,0)"); h.addColorStop(0.5, "rgba(0,0,0,1)"); h.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = h; g.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c); texCache.shaft = t; return t;
};
const domeTex = (top: string, mid: string, bottom: string) => {
  const key = "dome" + top + mid + bottom; if (texCache[key]) return texCache[key];
  const c = document.createElement("canvas"); c.width = 8; c.height = 256; const g = c.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, top); gr.addColorStop(0.45, mid); gr.addColorStop(1, bottom);
  g.fillStyle = gr; g.fillRect(0, 0, 8, 256);
  const t = new THREE.CanvasTexture(c); texCache[key] = t; return t;
};
/** a moving copy of a cached texture (offset follows time t in seconds) */
const useMoving = (base: THREE.CanvasTexture, repeat: number, t: number, speed: [number, number]) => {
  const tex = useMemo(() => { const x = base.clone(); x.needsUpdate = true; x.wrapS = x.wrapT = THREE.RepeatWrapping; return x; }, [base]);
  tex.repeat.set(repeat, repeat);
  tex.offset.set((t * speed[0]) % 1, (t * speed[1]) % 1);
  return tex;
};

// ---------------------------------------------------------------- above water
/** sea / lake / pool surface seen from ABOVE: translucent tinted plane (things under it show through, tinted) + two
 *  caustic glint layers drifting in different directions. y = water level. */
export const WaterSurface: React.FC<{ t: number; p?: V3; s?: [number, number]; color?: string; o?: number; glint?: number; rep?: number }> =
  ({ t, p = [0, 0, 0], s = [400, 400], color = "#3fb6d8", o = 0.72, glint = 0.32, rep }) => {
    const r = rep ?? Math.max(4, s[0] / 6);
    const a = useMoving(causticTex(false), r, t, [0.018, 0.011]);
    const b = useMoving(causticTex(true), r * 0.7, t, [-0.012, 0.016]);
    return <group position={p}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={s} /><meshLambertMaterial color={disp(color)} transparent opacity={o} depthWrite={false} /></mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={s} /><meshBasicMaterial map={a} transparent opacity={glint} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={s} /><meshBasicMaterial map={b} transparent opacity={glint * 0.8} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
    </group>;
  };
/** moving caustic light net projected on a floor (seabed / pool floor) - additive */
export const Caustics: React.FC<{ t: number; p: V3; s: [number, number]; o?: number; rep?: number; color?: string }> = ({ t, p, s, o = 0.35, rep = 6, color = "#ffffff" }) => {
  const a = useMoving(causticTex(false), rep, t, [0.02, 0.013]);
  return <mesh position={p} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={s} /><meshBasicMaterial map={a} color={color} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>;
};
/** expanding ripple rings on the surface (y = water level), e.g. where someone surfaces */
export const Ripples: React.FC<{ p: V3; t: number; n?: number; r?: number; o?: number; period?: number }> = ({ p, t, n = 3, r = 2.4, o = 0.6, period = 1.8 }) => (
  <group position={p}>{Array.from({ length: n }, (_, i) => {
    const q = ((t / period) + i / n) % 1, rr = 0.3 + r * q;
    return <mesh key={i} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[rr, rr + 0.07 + 0.05 * (1 - q), 48]} /><meshBasicMaterial color="#ffffff" transparent opacity={o * (1 - q)} depthWrite={false} toneMapped={false} /></mesh>;
  })}</group>
);

// ---------------------------------------------------------------- under water
/** underwater "room": gradient dome (bright cyan up, deep blue down), blue fog, bright surface seen from below with a
 *  caustic net, optional seabed with caustics. Everything else is placed by the scene. */
export const UnderwaterWorld: React.FC<{ t: number; surfaceY?: number; floorY?: number; fogNear?: number; fogFar?: number; deep?: string; mid?: string; top?: string; floor?: string; floorSize?: number }> =
  ({ t, surfaceY = 0, floorY, fogNear = 3, fogFar = 34, deep = "#0b3d6b", mid = "#2d8fc6", top = "#bdeeff", floor = "#d9c79c", floorSize = 200 }) => {
    const dome = domeTex(top, mid, deep);
    const surf = useMoving(causticTex(false), 30, t, [0.014, -0.01]);
    return <>
      <fog attach="fog" args={[disp(mid), fogNear, fogFar]} />
      <mesh renderOrder={-10}><sphereGeometry args={[150, 24, 16]} /><meshBasicMaterial map={dome} side={THREE.BackSide} fog={false} depthWrite={false} toneMapped={false} /></mesh>
      {/* surface from below: pale glowing sheet + bright caustic net */}
      <mesh position={[0, surfaceY, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[300, 300]} /><meshBasicMaterial color={disp("#9fe2f7")} transparent opacity={0.85} fog={false} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, surfaceY - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[300, 300]} /><meshBasicMaterial map={surf} transparent opacity={0.5} fog={false} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} /></mesh>
      {floorY !== undefined && <>
        <mesh position={[0, floorY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[floorSize, floorSize]} /><meshLambertMaterial color={disp(floor)} /></mesh>
        <Caustics t={t} p={[0, floorY + 0.02, 0]} s={[floorSize, floorSize]} rep={floorSize / 5} o={0.32} />
      </>}
    </>;
  };
/** slanted light shafts from the surface (additive, fade downward). at = list of [x, z] roots on the surface */
export const LightShafts: React.FC<{ at: [number, number][]; surfaceY?: number; len?: number; w?: number; o?: number; t?: number; lean?: number }> =
  ({ at, surfaceY = 0, len = 16, w = 1.6, o = 0.22, t = 0, lean = 0.28 }) => {
    const tex = shaftTex();
    return <>{at.map(([x, z], i) => {
      const flick = 0.75 + 0.25 * Math.sin(t * 0.9 + i * 1.7);
      return <group key={i} position={[x, surfaceY, z]} rotation={[0, i * 0.9, lean]}>
        {[0, Math.PI / 2].map((ry) => <mesh key={ry} position={[0, -len / 2, 0]} rotation={[0, ry, 0]}><planeGeometry args={[w * (0.7 + (i % 3) * 0.25), len]} /><meshBasicMaterial map={tex} color="#e9fbff" transparent opacity={o * flick} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} fog={false} /></mesh>)}
      </group>;
    })}</>;
  };
/** rising bubbles from a source point (deterministic): small bright spheres with a soft rim */
export const Bubbles: React.FC<{ p: V3; t: number; n?: number; rise?: number; spread?: number; size?: number; o?: number }> = ({ p, t, n = 10, rise = 4, spread = 0.35, size = 0.07, o = 0.75 }) => (
  <group position={p}>{Array.from({ length: n }, (_, i) => {
    const q = (t * 0.35 + i / n) % 1, r = size * (0.5 + ((i * 7) % 5) * 0.18) * (0.7 + q * 0.6);
    const x = Math.sin(i * 2.3 + t * 2.0) * spread * (0.3 + q), z = Math.cos(i * 1.7) * spread * 0.6;
    return <mesh key={i} position={[x, q * rise, z]}><sphereGeometry args={[r, 10, 8]} /><meshBasicMaterial color="#f2fdff" transparent opacity={o * Math.sin(q * Math.PI)} depthWrite={false} toneMapped={false} /></mesh>;
  })}</group>
);
