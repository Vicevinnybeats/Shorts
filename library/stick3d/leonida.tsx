// Florida set pieces for WHAT IF #2 (episodes/wi-gta-leonida) in the Stick3D look + Golden Neon colours. Additive file:
// nothing in the shared kit changes. A hand-made Florida outline (real geography, simplified; never the game's map),
// 67 "county" dots placed inside it, hazy sky walls with sun / storm, storm clouds, lightning bolts, pond/sea water,
// hurricane spiral, grass tufts and rain. Canvases redraw only when their `dep` changes (cheap on CPU renders).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Ball, Box } from "./toon";
import { V3, clamp } from "./kit";
import { N3, Halo, Panel, NeonBar } from "./neon";

// ---------------------------------------------------------------- Florida outline (lon, lat) -> local units
const LONLAT: [number, number][] = [
  [-87.6, 31.0], [-85.0, 31.0], [-84.9, 30.7], [-83.2, 30.65], [-82.0, 30.6], [-81.45, 30.72], [-81.3, 29.9], [-81.0, 29.2],
  [-80.6, 28.5], [-80.55, 28.0], [-80.2, 27.0], [-80.05, 26.4], [-80.12, 25.8], [-80.35, 25.3], [-80.7, 25.15], [-81.1, 25.15],
  [-81.25, 25.65], [-81.7, 25.95], [-81.95, 26.5], [-82.2, 26.9], [-82.6, 27.45], [-82.8, 28.0], [-82.7, 28.7], [-82.9, 29.1],
  [-83.4, 29.6], [-83.75, 29.95], [-84.2, 30.08], [-84.6, 29.9], [-85.1, 29.7], [-85.4, 29.9], [-85.9, 30.2], [-86.5, 30.38],
  [-87.3, 30.35], [-87.6, 30.3],
];
/** outline in local units: x east, y north; ~6.3 wide, ~5.4 tall, centred */
export const FL_PTS: [number, number][] = LONLAT.map(([lo, la]) => [(lo + 83.8) * 0.82, (la - 28.0) * 0.9]);
const inPoly = (x: number, y: number) => {
  let c = false;
  for (let i = 0, j = FL_PTS.length - 1; i < FL_PTS.length; j = i++) {
    const [xi, yi] = FL_PTS[i], [xj, yj] = FL_PTS[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const r01 = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
/** 67 dots (one per county, schematic) spread over the outline: jittered grid, inside points only, order = west -> south */
export const COUNTY_DOTS: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let step = 0.62; out.length < 67 && step > 0.2; step -= 0.03) {
    out.length = 0;
    for (let y = 2.9; y > -3.0; y -= step) for (let x = -3.4; x < 3.6; x += step) {
      const i = out.length * 7 + Math.round(x * 13 + y * 31);
      const px = x + (r01(i) - 0.5) * step * 0.5, py = y + (r01(i + 3) - 0.5) * step * 0.5;
      if (inPoly(px, py) && inPoly(px + 0.12, py) && inPoly(px - 0.12, py) && inPoly(px, py + 0.12) && inPoly(px, py - 0.12)) out.push([px, py]);
    }
    if (out.length >= 67) break;
  }
  return out.slice(0, 67).sort((a, b) => (a[1] > 1.6 && b[1] > 1.6 ? a[0] - b[0] : b[1] - a[1]));
})();

/** Florida as a raised 3D slab lying on the floor (north = away from the camera, -z). s = scale. Dots pop in (n of 67).
 *  `hits` = coral strike marks (count), `glow` = gold rim glow 0..1 */
export const FloridaMap: React.FC<{ p: V3; s?: number; color?: string; n?: number; dotColor?: string; hits?: number; glow?: number; t?: number }> =
  ({ p, s = 1, color = "#2f4a3a", n = 0, dotColor = N3.gold, hits = 0, glow = 0.6, t = 0 }) => {
    const rim = useMemo(() => {
      const g = new THREE.BufferGeometry().setFromPoints([...FL_PTS, FL_PTS[0]].map(([x, y]) => new THREE.Vector3(x, 0, -y)));
      return new THREE.Line(g, new THREE.LineBasicMaterial({ color: N3.gold, toneMapped: false, transparent: true }));
    }, []);
    // walls from ExtrudeGeometry + a separate top cap (three's Extrude drops the caps of this outline: earcut returns none)
    const slab = useMemo(() => { const g = new THREE.ExtrudeGeometry(new THREE.Shape(FL_PTS.map(([x, y]) => new THREE.Vector2(x, y))), { depth: 0.3, bevelEnabled: false }); g.translate(0, 0, -0.15); return g; }, []);
    const cap = useMemo(() => new THREE.ShapeGeometry(new THREE.Shape(FL_PTS.map(([x, y]) => new THREE.Vector2(x, y)))), []);
    const mat = useMemo(() => new THREE.MeshLambertMaterial({ color: new THREE.Color(color).multiplyScalar(1.5) }), [color]);
    const wall = useMemo(() => new THREE.MeshLambertMaterial({ color: new THREE.Color(color).multiplyScalar(0.9), side: THREE.DoubleSide }), [color]);
    (rim.material as THREE.LineBasicMaterial).opacity = 0.5 + 0.5 * glow;
    return <group position={p} scale={[s, s, s]}>
      <mesh geometry={slab} material={wall} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]} />
      <mesh geometry={cap} material={mat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.302, 0]} />
      <primitive object={rim} position={[0, 0.32, 0]} />
      {COUNTY_DOTS.map(([x, y], i) => {
        const k = clamp(n - i);
        if (k <= 0) return null;
        const pop = k < 1 ? 1 + 0.6 * Math.sin(k * Math.PI) : 1;
        return <group key={i} position={[x, 0.33, -y]}>
          <mesh scale={[pop, 1, pop]}><cylinderGeometry args={[0.07, 0.07, 0.04, 10]} /><meshBasicMaterial color={dotColor} toneMapped={false} /></mesh>
          <Halo p={[0, 0.08, 0]} r={0.2 * pop} color={dotColor} o={0.45 + 0.15 * Math.sin(t * 3 + i)} />
        </group>;
      })}
      {Array.from({ length: Math.floor(hits) }, (_, i) => {
        const [x, y] = COUNTY_DOTS[(i * 23 + 5) % 67];
        return <group key={"h" + i} position={[x + 0.12, 0.34, -y + 0.1]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.08, 0.14, 12]} /><meshBasicMaterial color={N3.coral} toneMapped={false} /></mesh>
        </group>;
      })}
      <Halo p={[0, 0.2, 0]} r={4.2} color={N3.gold} o={0.07 * glow} />
    </group>;
  };

// ---------------------------------------------------------------- sky + weather
/** big sky wall behind an outdoor set: haze gradient (golden, humid), sun disc with glow, storm 0..1 darkens it to navy,
 *  `flash` 0..1 brightens (lightning), `dusk` warms to coral */
export const SkyWall: React.FC<{ p?: V3; s?: [number, number]; storm?: number; flash?: number; sun?: [number, number]; dusk?: number; haze?: number }> =
  ({ p = [0, 7, -16], s = [60, 26], storm = 0, flash = 0, sun = [0.62, 0.3], dusk = 0, haze = 0.5 }) => (
    <Panel p={p} s={s} px={[480, 208]} dep={`${storm.toFixed(2)}|${flash.toFixed(2)}|${sun[0].toFixed(2)},${sun[1].toFixed(2)}|${dusk.toFixed(2)}`} draw={(c, W, H) => {
      const L = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
      const top = L(L([112, 150, 204], [60, 40, 92], dusk), [22, 26, 44], storm), mid = L(L([240, 204, 156], [236, 118, 88], dusk), [58, 62, 86], storm), bot = L(L([255, 238, 204], [255, 184, 120], dusk), [86, 86, 108], storm);
      const g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, `rgb(${top})`); g.addColorStop(0.62, `rgb(${mid})`); g.addColorStop(1, `rgb(${bot})`);
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      const so = 1 - storm;
      if (so > 0.02) {
        const sx = sun[0] * W, sy = sun[1] * H, rg = c.createRadialGradient(sx, sy, 0, sx, sy, H * 0.5);
        rg.addColorStop(0, `rgba(255,243,208,${0.95 * so})`); rg.addColorStop(0.12, `rgba(255,207,110,${0.75 * so})`); rg.addColorStop(1, "rgba(255,180,90,0)");
        c.fillStyle = rg; c.fillRect(0, 0, W, H);
        c.fillStyle = `rgba(255,246,220,${so})`; c.beginPath(); c.arc(sx, sy, H * 0.07, 0, 7); c.fill();
      }
      // humid haze bands
      for (let i = 0; i < 5; i++) { c.fillStyle = `rgba(255,220,170,${0.05 * haze * (1 - storm * 0.6)})`; c.fillRect(0, H * (0.55 + i * 0.08), W, H * 0.05); }
      if (flash > 0) { c.fillStyle = `rgba(220,230,255,${0.55 * flash})`; c.fillRect(0, 0, W, H); }
    }} />
  );
/** low-poly storm cloud: clustered toon balls; inner flash glow */
export const StormCloud: React.FC<{ p: V3; s?: number; dark?: number; flash?: number; seed?: number }> = ({ p, s = 1, dark = 1, flash = 0, seed = 1 }) => {
  const c1 = new THREE.Color("#b9c0d8").lerp(new THREE.Color("#2b3150"), dark).getStyle();
  const c2 = new THREE.Color("#d6dbea").lerp(new THREE.Color("#3a4166"), dark).getStyle();
  return <group position={p} scale={[s, s, s]}>
    {Array.from({ length: 9 }, (_, i) => {
      const x = (i - 4) * 0.62 + (r01(seed * 9 + i) - 0.5) * 0.4, y = Math.sin((i / 8) * Math.PI) * 0.6 + r01(seed * 5 + i) * 0.3, r = 0.55 + Math.sin((i / 8) * Math.PI) * 0.5 + r01(seed + i) * 0.2;
      return <Ball key={i} p={[x, y, (r01(seed * 3 + i) - 0.5) * 0.6]} r={r} color={i % 2 ? c1 : c2} s={[1, 0.8, 0.9]} ink={0.04} />;
    })}
    <Box p={[0, -0.2, 0]} s={[5.2, 0.5, 1.2]} color={c1} line={3} />
    {flash > 0 && <Halo p={[0, 0.2, 0.9]} r={3.5} color="#dfe8ff" o={0.75 * flash} />}
  </group>;
};
/** lightning bolt from (x, top) down to the ground point p (zig-zag neon tubes); o = visibility 0..1 */
export const Bolt: React.FC<{ p: V3; top: number; o?: number; seed?: number; color?: string; w?: number }> = ({ p, top, o = 1, seed = 1, color = "#eaf2ff", w = 0.09 }) => {
  if (o <= 0.01) return null;
  const n = 6, pts: V3[] = [];
  for (let i = 0; i <= n; i++) { const k = i / n; pts.push([p[0] + (i === 0 || i === n ? 0 : (r01(seed * 11 + i) - 0.5) * 1.2), top + (p[1] - top) * k, p[2]]); }
  return <group>
    {pts.slice(1).map((b, i) => {
      const a = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      return <NeonBar key={i} p={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, p[2]]} s={[w, L + w, w]} rot={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]} color={color} glow={0.8} o={o} />;
    })}
    <Halo p={[p[0], p[1] + 0.2, p[2]]} r={1.6} color="#dfe8ff" o={0.8 * o} />
  </group>;
};
/** flat water disc / plane with moving ripple rings (pond, sea) */
export const Water: React.FC<{ p: V3; s: [number, number]; t: number; color?: string; deep?: string; round?: boolean }> = ({ p, s, t, color = "#3d8fb0", deep = "#1d4a6a", round }) => (
  <Panel p={[p[0], p[1] + 0.03, p[2]]} s={s} rot={[-Math.PI / 2, 0, 0]} px={[256, Math.round(256 * s[1] / s[0])]} dep={Math.floor(t * 10)} draw={(c, W, H) => {
    c.save();
    if (round) { c.beginPath(); c.ellipse(W / 2, H / 2, W / 2 - 2, H / 2 - 2, 0, 0, 7); c.clip(); }
    const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 2); g.addColorStop(0, color); g.addColorStop(1, deep);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = "rgba(255,236,190,.35)"; c.lineWidth = 3;
    for (let i = 0; i < 9; i++) { const ph = (t * 0.25 + i / 9) % 1, x = (r01(i) * 0.8 + 0.1) * W, y = (r01(i + 9) * 0.8 + 0.1) * H; c.globalAlpha = 1 - ph; c.beginPath(); c.ellipse(x, y, 6 + ph * 40, 3 + ph * 16, 0, 0, 7); c.stroke(); }
    c.globalAlpha = 1;
    if (round) { c.restore(); c.strokeStyle = "#0b0d1a"; c.lineWidth = 6; c.beginPath(); c.ellipse(W / 2, H / 2, W / 2 - 4, H / 2 - 4, 0, 0, 7); c.stroke(); }
    else c.restore();
  }} />
);
/** hurricane spiral (additive canvas lying flat or facing the camera) */
export const Spiral: React.FC<{ p: V3; r: number; t: number; o?: number; flat?: boolean; color?: string }> = ({ p, r, t, o = 1, flat = true, color = "#f2f5ff" }) => (
  <group position={p} rotation={flat ? [-Math.PI / 2, 0, t * 1.6] : [0, 0, t * 1.6]}>
    <Panel p={[0, 0, 0]} s={[r * 2, r * 2]} px={[256, 256]} additive o={o} dep={1} draw={(c, W) => {
      const m = W / 2; c.strokeStyle = color; c.lineCap = "round"; c.shadowColor = color; c.shadowBlur = 10;
      for (let arm = 0; arm < 3; arm++) { c.lineWidth = 16; c.beginPath(); for (let k = 0; k <= 60; k++) { const a = arm * 2.094 + k * 0.09, rr = 14 + k * 1.75; const x = m + Math.cos(a) * rr, y = m + Math.sin(a) * rr; k ? c.lineTo(x, y) : c.moveTo(x, y); } c.globalAlpha = 0.85; c.stroke(); }
      c.globalAlpha = 1; c.fillStyle = "#0b0d1a"; c.beginPath(); c.arc(m, m, 12, 0, 7); c.fill();
    }} />
  </group>
);
/** grass tufts scattered over an area (cheap boxes) */
export const Tufts: React.FC<{ c: V3; area: [number, number]; n?: number; color?: string; seed?: number }> = ({ c, area, n = 18, color = "#3f7a3c", seed = 2 }) => (
  <>{Array.from({ length: n }, (_, i) => {
    const x = c[0] + (r01(seed * 31 + i) - 0.5) * area[0], z = c[2] + (r01(seed * 17 + i) - 0.5) * area[1];
    return <group key={i} position={[x, 0, z]} rotation={[0, r01(i + seed) * 3, 0]}>
      {[-1, 0, 1].map((k) => <Box key={k} p={[k * 0.08, 0.16, 0]} s={[0.05, 0.32 + (k === 0 ? 0.12 : 0), 0.05]} rot={[0, 0, k * 0.35]} color={color} line={1} />)}
    </group>;
  })}</>
);
/** rain streaks (additive canvas, scrolls with t) in front of a set */
export const Rain: React.FC<{ p: V3; s: [number, number]; t: number; o?: number }> = ({ p, s, t, o = 0.5 }) => o <= 0.01 ? null : (
  <Panel p={p} s={s} px={[256, 384]} additive o={o} dep={Math.floor(t * 15)} draw={(c, W, H) => {
    c.strokeStyle = "rgba(200,215,255,.8)"; c.lineWidth = 2;
    for (let i = 0; i < 90; i++) { const x = r01(i) * W, y = ((r01(i + 90) * H + t * 900) % (H + 40)) - 20; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 4, y + 22); c.stroke(); }
  }} />
);
