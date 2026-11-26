// WHAT IF #2 "What If You Moved to the Real Leonida?" - BRIGHT DAYLIGHT restyle (owner 2026-11-26), same look and rules
// as the approved What If #1 (episodes/wi-gta-nosleep + library/stick3d/daylight.tsx): big sunny 3D worlds (sky dome,
// clouds, sun, haze fog for depth, warm saturated colours), ONE warm sun + soft sky fill, drop + blob shadows, REMY3D
// puppet + series beanie inside the worlds, Golden Neon colours only for the HUD/counter/titles. Blender .glb props
// (library/models: suitcase, palm_tree (What If 2's own palm), beach_umbrella, sports_car, golf_flag, alligator, flat_tv,
// couch, game_controller, window_frame, city_block, cloud_puff). Florida set pieces: library/stick3d/leonida.tsx (real
// outline, never the game's map).
// EDIT: every script line = 1-2 real SHOTS with HARD CUTS; every PLACE change = SHAPE MORPH (outgoing key object squashes
// ~8 %, grows to fill, floods with the next shot's background colour, next shot eases 93 -> 100 %). Each shot has ONE
// NAMED camera move (owner 2026-11-24/26: pull back, dolly zoom, crane + land, push-in, orbit, tracking, low hero angle,
// top-down), one continuous non-reversing curve, fast first then slow; the move name is noted per shot (CAM: ...).
// Facts (RESEARCH.md): FWC ~1.3 million alligators in all 67 counties, serious injuries rare; Florida has the most
// lightning per km2 of any state and has led US lightning deaths for years (97 confirmed 2006-2025, NLSC/NWS); ~40 % of
// US hurricane landfalls are in Florida; NWS slogan "When thunder roars, go indoors". "GTA 6" only as words.
// NO DOUBLE TEXT: on-screen text only adds NEW info (numbers, labels, icons) and never shows what the caption says at that
// moment (the NWS slogan is shown BEFORE it is spoken and fades out when the voice says it; the A-D cards are icons).
// Every beat is cue-driven (C(phrase, fallback)) so the picture follows words.json (Gemini Algieba ~2.3-2.6 words/s).
// Layout: HUD text y 300-1350 (counter card 316-556 -> other text >= 620 in counter shots); figures stay above y 1430.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, getInputProps } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { ShotSpan, cueTime, FPS } from "../../src/engine/timeline";
import type { Word } from "../../src/captions/Captions";
import { EASE, arrive } from "../../src/engine25/motion";
import { NEON, NeonDefs, StrokeWord, LiveCounter, NeonPath, NeonText, Digits, WI_FONT, drawOn } from "../../library/whatif/kit";
import { Box, Cyl, Ball, Surface } from "../../library/stick3d/toon";
import { Person, V3, clamp, Grade, Sign } from "../../library/stick3d/kit";
import { REMY3D } from "../../src/tests/Stick3DTest";
import { SideWall, WallDoor, Shelf, Lamp, Rug, Dust, Plant } from "../../library/stick3d/props";
import { Cam, Building } from "../../library/stick3d/extra";
import { Glb } from "../../library/stick3d/glb";
import { DaySky, SunRig, DayGround, CityBackdrop, Clouds, WindowWall, SunPatch, disp, DAY } from "../../library/stick3d/daylight";
import { drawPuppet, Look, Pose } from "../../library/stick3d/puppet";
import { N3, FONT3, Halo, NeonBar, Motes, Panel, NeonSign, NeonClock } from "../../library/stick3d/neon";
import { FL_PTS, FloridaMap, StormCloud, Bolt, Water, Spiral, Tufts, Rain, COUNTY_DOTS } from "../../library/stick3d/leonida";

// ---------------------------------------------------------------- cast
const REMY: Look = { ...REMY3D, beanie: "#2e3658", beanieBand: N3.gold, pom: N3.amber };
/** game-world Remy (respawn): cyan ghost colours (cyan = "not real" only) */
const GHOST: Look = { ...REMY, skin: "#bdf3ff", body: N3.cyan, beanie: "#2a6a80", beanieBand: "#dffaff", pom: "#dffaff", shoe: "#1b4a5a" };
const { gold: GOLD, coral: CORAL, amber: AMBER, text: CREAM, muted: MUTED, cyan: CYAN } = NEON;

// ---------------------------------------------------------------- shots (each script line = 1-2 shots; cues = narration words)
type ShotDef = { id: string; cue: string; parent: string; sub: number };
const DEFS: ShotDef[] = [
  { id: "hook", cue: "What if you", parent: "hook", sub: 0 },
  { id: "hookb", cue: "So let's pack", parent: "hook", sub: 1 },
  { id: "miami", cue: "Day one. Remy", parent: "miami", sub: 0 },
  { id: "miamib", cue: "The air feels", parent: "miami", sub: 1 },
  { id: "wish", cue: "He wants the", parent: "wish", sub: 0 },
  { id: "wishb", cue: "Swamps.", parent: "wish", sub: 1 },
  { id: "golf", cue: "Day three. A", parent: "golf", sub: 0 },
  { id: "golfb", cue: "Something is lying", parent: "golf", sub: 1 },
  { id: "gators", cue: "Florida has around", parent: "gators", sub: 0 },
  { id: "gatorsb", cue: "Wildlife officials say", parent: "gators", sub: 1 },
  { id: "twist", cue: "Scared? Here's the", parent: "twist", sub: 0 },
  { id: "twistb", cue: "Most gators avoid", parent: "twist", sub: 1 },
  { id: "above", cue: "The bigger danger", parent: "above", sub: 0 },
  { id: "sky", cue: "Day ten. Every", parent: "sky", sub: 0 },
  { id: "skyb", cue: "Sunshine at noon", parent: "sky", sub: 1 },
  { id: "strikes", cue: "Florida gets more", parent: "strikes", sub: 0 },
  { id: "deaths", cue: "and it has", parent: "deaths", sub: 0 },
  { id: "tv", cue: "Day thirty. A", parent: "tv", sub: 0 },
  { id: "tvb", cue: "A cone appears", parent: "tv", sub: 1 },
  { id: "landfall", cue: "Roughly forty percent", parent: "landfall", sub: 0 },
  { id: "landfallb", cue: "make landfall in", parent: "landfall", sub: 1 },
  { id: "rules", cue: "So Remy learns", parent: "rules", sub: 0 },
  { id: "rulesb", cue: "When thunder roars", parent: "rules", sub: 1 },
  { id: "respawn", cue: "In the game,", parent: "respawn", sub: 0 },
  { id: "respawnb", cue: "In real life,", parent: "respawn", sub: 1 },
  { id: "ask", cue: "Would you still", parent: "ask", sub: 0 },
];
const DEF: Record<string, ShotDef> = Object.fromEntries(DEFS.map((d) => [d.id, d]));
const SHOTS = DEFS.map((d) => ({ id: d.id, cue: d.cue }));
const TR_FRAMES = 14;
/** place of each scene (parent): a PLACE change = shape-morph transition, everything else = hard cut */
const PLACE: Record<string, string> = {
  hook: "home", miami: "street", wish: "wish", golf: "golf", gators: "map", twist: "golf", above: "golf", sky: "beach",
  strikes: "map", deaths: "map", tv: "home", landfall: "map", rules: "house", respawn: "split", ask: "sunset",
};
/** background colour of each scene = the flood colour of the morph INTO it */
const BG: Record<string, string> = {
  hook: "#f4e8d4", miami: "#f6e3c8", wish: "#cfe9fb", golf: "#c7e6a8", gators: "#efd9b8", twist: "#c7e6a8", above: "#c7e6a8",
  sky: "#cfe9fb", strikes: "#b9c3d3", deaths: "#b9c3d3", tv: "#f4e8d4", landfall: "#d7dde6", rules: "#8c9ab3", respawn: "#d9f4f8", ask: "#ffc896",
};
/** key object of the OUTGOING shot that becomes the transition shape (screen rect, radius); default = the HUD counter card */
const KEY_CARD = { cx: 374, cy: 436, w: 608, h: 240, r: 22 };
const KEY_OBJ: Record<string, typeof KEY_CARD> = {
  hookb: { cx: 890, cy: 640, w: 360, h: 600, r: 14 }, wishb: { cx: 540, cy: 1040, w: 340, h: 340, r: 170 },
  gatorsb: { cx: 540, cy: 1040, w: 380, h: 380, r: 190 }, above: { cx: 540, cy: 640, w: 320, h: 320, r: 160 },
  deaths: { cx: 540, cy: 900, w: 300, h: 300, r: 150 }, landfallb: { cx: 540, cy: 1000, w: 360, h: 360, r: 180 },
  rulesb: { cx: 540, cy: 1040, w: 260, h: 420, r: 24 }, respawnb: { cx: 540, cy: 1000, w: 320, h: 320, r: 160 },
};

// ---------------------------------------------------------------- helpers
const k = (u: number, a: number, b: number, from: number, to: number, e = EASE.camera) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const pop = (u: number, at: number, d = 10) => interpolate(u, [at, at + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.6)) });
const mix = (a: string, b: string, t: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), clamp(t)).getHexString();
const L3 = (a: V3, b: V3, e: number): V3 => [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];

// ---------------------------------------------------------------- NAMED camera moves
// One continuous curve per shot, FAST first then slow (cubic ease-out), direction never reverses, nothing carries across
// a cut. push / pull / truck / low / top = straight eased line a -> b; crane = quadratic arc through a raised midpoint
// (rise over, then settle); orbit = eased angle round a centre; dolly = dolly zoom (camera travels along the view axis
// while the FOV counter-zooms so the subject keeps its size and the background stretches: vertigo).
type CamPose = [V3, V3, number]; // pos, look, fov
type CamSpec =
  | { move: "push" | "pull" | "truck" | "low" | "top" | "crane"; a: CamPose; b: CamPose; arc?: number }
  | { move: "orbit"; c: V3; look: V3; r: number; y: [number, number]; ang: [number, number]; fov: number }
  | { move: "dolly"; look: V3; dir: V3; d: [number, number]; fov0: number };
const camPose = (s: CamSpec, e: number): CamPose => {
  if (s.move === "orbit") { const a = s.ang[0] + (s.ang[1] - s.ang[0]) * e, y = s.y[0] + (s.y[1] - s.y[0]) * e; return [[s.c[0] + s.r * Math.sin(a), y, s.c[2] + s.r * Math.cos(a)], s.look, s.fov]; }
  if (s.move === "dolly") {
    const n = Math.hypot(...s.dir), dir = s.dir.map((v) => v / n) as V3, d = s.d[0] + (s.d[1] - s.d[0]) * e;
    const half = s.d[0] * Math.tan((s.fov0 * Math.PI) / 360);
    return [[s.look[0] + dir[0] * d, s.look[1] + dir[1] * d, s.look[2] + dir[2] * d], s.look, (Math.atan(half / d) * 360) / Math.PI];
  }
  const [pa, la, fa] = s.a, [pb, lb, fb] = s.b;
  if (s.move === "crane" && s.arc) { const m = L3(pa, pb, 0.5); m[1] += s.arc; const q = (i: number) => (1 - e) * (1 - e) * pa[i] + 2 * (1 - e) * e * m[i] + e * e * pb[i]; return [[q(0), q(1), q(2)], L3(la, lb, e), fa + (fb - fa) * e]; }
  return [L3(pa, pb, e), L3(la, lb, e), fa + (fb - fa) * e];
};
const Move: React.FC<{ us: number; ls: number; spec: CamSpec; off?: number; impacts?: [number, number][]; kicks?: number[] }> = ({ us, ls, spec, off = 0, impacts = [], kicks = [] }) => {
  const x = clamp(us / Math.max(1, ls)), e = 1 - Math.pow(1 - x, 3);
  const [pos, look, fov] = camPose(spec, e);
  return <Cam t={us / FPS} keys={[{ t: 0, pos, look, fov, roll: 0 }]} fovKick={kicks.filter((q) => q - off >= 0).map((q) => (q - off) / FPS)} impacts={impacts.map(([a, b]) => [(a - off) / FPS, b] as [number, number])} />;
};

// ---------------------------------------------------------------- HUD text (motion-design rules, same as What If #1)
let mctx: CanvasRenderingContext2D | null = null;
const measure = (w: string, size: number) => {
  if (!mctx) mctx = document.createElement("canvas").getContext("2d");
  if (!mctx) return w.length * size * 0.76;
  mctx.font = `900 ${size}px CaptionSans, Arial, sans-serif`; return mctx.measureText(w).width;
};
/** word by word, each word fades up from soft to sharp with a small rise, 0.08 s stagger, leaves the same way */
const HudText: React.FC<{ f: number; x: number; y: number; size: number; color?: string; at: number; out?: number; children: string; anchor?: "start" | "middle" | "end"; spacing?: number }> =
  ({ f, x, y, size, color = NEON.gold, at, out = Infinity, children, anchor = "middle", spacing = 0 }) => {
    if (f < at) return null;
    const ws = children.split(" "), cw = (w: string) => measure(w, size) + spacing * w.length, gap = size * 0.3;
    const total = ws.reduce((t2, w) => t2 + cw(w), 0) + gap * (ws.length - 1);
    let cx = anchor === "middle" ? x - total / 2 : anchor === "end" ? x - total : x;
    return <g>{ws.map((w, i) => {
      const x0 = cx; cx += cw(w) + gap;
      const p = arrive(f, at + i * 2.4, 11), ex = Number.isFinite(out) ? clamp((f - out - i * 2.4) / 9) : 0;
      const o = p * (1 - ex); if (o <= 0.01) return null;
      const dy = (1 - p) * 16 - ex * 12;
      const c = { x: x0, y: y + dy, fontFamily: WI_FONT, fontWeight: 900, fontSize: size, letterSpacing: spacing };
      return <g key={i} opacity={o}>
        <text {...c} fill="none" stroke={color} strokeWidth={size * 0.35} opacity={0.35 * (1 - p + ex)} strokeLinejoin="round">{w}</text>
        <text {...c} fill={color} stroke="#0b0d1a" strokeWidth={size * 0.13} paintOrder="stroke" strokeLinejoin="round">{w}</text>
      </g>;
    })}</g>;
  };
/** payoff stamp: words (as above) + an outline that draws on + a small tick; no scale slam */
const Stamp: React.FC<{ f: number; x: number; y: number; text: string; at: number; out?: number; color?: string; size?: number }> = ({ f, x, y, text, at, out, color = NEON.coral, size = 56 }) => {
  if (f < at) return null;
  const w = measure(text, size) + 140, p = drawOn(f, at, 14), ex = out !== undefined && Number.isFinite(out) ? clamp((f - out) / 9) : 0;
  return <g opacity={1 - ex}>
    <rect x={x - w / 2} y={y - size * 0.95} width={w} height={size * 1.35} rx={14} fill="#0b0d1a" opacity={0.55 * p} />
    <NeonPath d={`M ${x - w / 2} ${y - size * 0.95} L ${x + w / 2} ${y - size * 0.95} L ${x + w / 2} ${y + size * 0.4} L ${x - w / 2} ${y + size * 0.4} Z`} p={p} w={4} color={color} />
    <NeonPath d={`M ${x - w / 2 + 22} ${y - size * 0.3} l 12 14 l 24 -30`} p={drawOn(f, at + 8, 8)} w={6} color={color} hot />
    <HudText f={f} x={x + 24} y={y + size * 0.12} size={size} color={color} at={at + 4} out={out}>{text}</HudText>
  </g>;
};
/** dark rounded HUD panel that draws on (keeps gold text readable over bright daylight) */
const Card: React.FC<{ f: number; at: number; x: number; y: number; w: number; h: number; color?: string; out?: number }> = ({ f, at, x, y, w, h, color = GOLD, out }) => {
  const p = drawOn(f, at, 14), ex = out !== undefined && Number.isFinite(out) ? clamp((f - out) / 9) : 0;
  if (p <= 0 || ex >= 1) return null;
  const r = 26;
  return <g opacity={1 - ex}>
    <rect x={x} y={y} width={w} height={h} rx={r} fill="#0b0d1a" opacity={0.55 * p} />
    <NeonPath d={`M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`} p={p} w={4} color={color} />
  </g>;
};

// ---------------------------------------------------------------- light, sky, shadows (daylight kit)
/** sky: noon blue -> storm (grey-blue, still readable) -> dusk (sunset coral); lightning flash brightens it */
const Sky: React.FC<{ storm?: number; dusk?: number; flash?: number; fogNear?: number; fogFar?: number }> = ({ storm = 0, dusk = 0, flash = 0, fogNear = 30, fogFar = 170 }) => {
  const s = Math.round(storm * 25) / 25, d = Math.round(dusk * 25) / 25, fl = Math.round(flash * 10) / 10;
  const top = mix(mix(mix(DAY.skyTop, "#6a7fc6", d), "#66758f", s), "#c9d6ee", fl * 0.6);
  const hor = mix(mix(mix(DAY.skyHorizon, "#ffc58e", d), "#b3bccb", s), "#eef3ff", fl * 0.6);
  const haze = mix(mix(mix(DAY.haze, "#ffd4a6", d), "#b0b9c8", s), "#eef3ff", fl * 0.5);
  const sun: V3 = d > 0.5 ? [-38, 9, -150] : [60, 70 - 120 * clamp(s * 1.4), -140];
  return <DaySky top={top} horizon={hor} haze={haze} fogNear={fogNear} fogFar={fogFar} sun={sun} warm={d} />;
};
/** ONE warm sun (shadow caster) + sky fill; storm dims it (still readable), dusk adds a low coral glow, flash = bolt light */
const Sun: React.FC<{ hero: V3; storm?: number; dusk?: number; flash?: number }> = ({ hero, storm = 0, dusk = 0, flash = 0 }) => (<>
  <SunRig target={hero} k={(1 - 0.45 * storm) * (1 - 0.2 * dusk)} fill={1 - 0.22 * storm} />
  {dusk > 0 && <directionalLight position={[hero[0] - 8, hero[1] + 2.5, hero[2] - 6]} intensity={0.9 * dusk} color="#ff9a6a" />}
  {flash > 0 && <directionalLight position={[hero[0] + 2, hero[1] + 12, hero[2] + 3]} intensity={2.4 * flash} color="#e4ecff" />}
</>);
/** shadows: every solid mesh casts + receives; glows, cones, outlines and transparent planes are skipped */
const ShadowSetup: React.FC = () => {
  const { scene } = useThree();
  React.useLayoutEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.Material & { isLineMaterial?: boolean; alphaTest?: number };
      const skip = !!mat.isLineMaterial || mat.blending === THREE.AdditiveBlending || (mat.transparent && !(mat.alphaTest && mat.alphaTest > 0)) || m.geometry?.type === "ConeGeometry";
      const flat = m.geometry?.type === "PlaneGeometry" && Math.abs(m.rotation.x + Math.PI / 2) < 0.01;
      m.castShadow = !skip && !flat;
      m.receiveShadow = !skip && !!(mat as THREE.MeshLambertMaterial).isMeshLambertMaterial || !!(mat as THREE.MeshToonMaterial).isMeshToonMaterial;
    });
  });
  return null;
};
/** soft DROP SHADOW of a standing puppet: its silhouette laid on the floor, away from the sun (SunRig dir 6,10,5) */
const SH_YAW = Math.atan2(6, 5);
const DropShadow: React.FC<{ p: V3; h: number; look: Look; pose: Omit<Pose, "t">; f: number; o?: number }> = ({ p, h, look, pose, f, o = 0.5 }) => {
  const L = h * 0.94, W = h * 512 / 768;
  return <group position={[p[0], p[1] + 0.035, p[2]]} rotation={[0, SH_YAW, 0]}>
    <Panel p={[0, 0, -L / 2 + 0.06]} s={[W, L]} rot={[-Math.PI / 2, 0, 0]} px={[256, 384]} draw={(c, Wc, Hc) => {
      drawPuppet(c, Wc, Hc, look, { ...pose, t: f, sweat: 0 });
      c.globalCompositeOperation = "source-in";
      const g = c.createLinearGradient(0, Hc, 0, 0); g.addColorStop(0, `rgba(20,24,40,${o})`); g.addColorStop(1, `rgba(20,24,40,${o * 0.3})`);
      c.fillStyle = g; c.fillRect(0, 0, Wc, Hc); c.globalCompositeOperation = "source-over";
    }} />
  </group>;
};
/** puppet with a soft white rim halo (separates it from busy daylight sets) + contact blob + drop shadow */
const Hero: React.FC<{ p: V3; look: Look; pose: Omit<Pose, "t">; f: number; h?: number; rim?: string; shadow?: boolean; rimO?: number; ground?: number }> = ({ p, look, pose, f, h = 2.5, rim = "#ffffff", shadow = true, rimO = 0.22, ground = 0 }) => (<>
  <Halo p={[p[0], p[1] + h * 0.62, p[2] - 0.25]} r={h * 0.72} color={rim} o={rimO} />
  {shadow && p[1] - ground < 0.6 && p[1] - ground > -0.2 ? <DropShadow p={[p[0], ground, p[2]]} h={h} look={look} pose={pose} f={f} /> : null}
  <Person p={p} h={h} look={look} pose={pose} f={f} shadow={shadow && p[1] - ground > -0.2} sy={ground + 0.01} />
</>);

// ---------------------------------------------------------------- props
const Suitcase: React.FC<{ p: V3; tilt?: number; s?: number }> = ({ p, tilt = 0, s = 0.72 }) => (
  <group position={p} rotation={[0, 0, tilt]}>
    <Glb name="suitcase" s={s} blob={0.45} fallback={<><Box p={[0, 0.4, 0]} s={[0.52, 0.66, 0.26]} color={N3.coral} line={3} /><Box p={[0, 0.98, 0.08]} s={[0.34, 0.05, 0.05]} color="#1c2032" line={2} /></>} />
  </group>
);
/** What If 2's own palm (palm_tree.glb) */
const Palm: React.FC<{ p: V3; s?: number; rot?: number; lean?: number }> = ({ p, s = 1, rot = 0, lean = 0 }) => (
  <group position={p} rotation={[0, 0, lean]}>
    <Glb name="palm_tree" s={s} rot={[0, rot, 0]} blob={0.6 * s} line={2} fallback={<group scale={[s, s, s]}><Cyl p={[0, 2.4, 0]} rt={0.16} rb={0.22} h={4.8} color="#7a5a36" line={2} /><Ball p={[0, 4.9, 0]} r={0.9} color="#2f9e5a" s={[1.6, 0.5, 1.6]} /></group>} />
  </group>
);
const Gator: React.FC<{ p: V3; yaw?: number; lift?: number; s?: number; eyes?: number }> = ({ p, yaw = 0, lift = 0, s = 1, eyes = 0 }) => (
  <group position={p} rotation={[0, yaw, 0]} scale={[s, s, s]}>
    <group rotation={[0, 0, lift * 0.14]}>
      <Glb name="alligator" blob={1.2} fallback={<><Box p={[0, 0.25, 0]} s={[3.2, 0.4, 0.75]} color="#4c6b34" line={3} /><Box p={[1.8, 0.22, 0]} s={[0.8, 0.2, 0.4]} color="#4c6b34" line={3} /></>} />
      {eyes > 0 && [-1, 1].map((q) => <Halo key={q} p={[1.5, 0.47, q * 0.19]} r={0.22} color={N3.amber} o={eyes} />)}
    </group>
  </group>
);
/** open sea to the horizon (lit, fades into the haze) with slow foam lines near the shore */
const Sea: React.FC<{ z: number; t: number; color?: string; foam?: number; storm?: number }> = ({ z, t, color = "#3fb4cc", foam = 1, storm = 0 }) => (<>
  <mesh position={[0, 0.015, z - 100]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[400, 200]} /><meshLambertMaterial color={disp(mix(color, "#557089", storm))} /></mesh>
  {foam > 0 && Array.from({ length: 7 }, (_, i) => <Box key={i} p={[-18 + i * 6 + ((t * 0.35 + i * 0.37) % 1) * 0.8, 0.03, z - 0.4 - (i % 3) * 0.7]} s={[3.4, 0.03, 0.14]} color="#ffffff" line={0} />)}
</>);
const Bush: React.FC<{ p: V3; s?: number; color?: string }> = ({ p, s = 1, color = "#7cc35e" }) => (
  <group position={p} scale={[s, s, s]}>
    <Ball p={[0, 0.5, 0]} r={0.75} color={disp(color)} s={[1.3, 0.85, 1.1]} /><Ball p={[0.7, 0.35, 0.1]} r={0.5} color={disp(color)} /><Ball p={[-0.65, 0.38, 0.05]} r={0.55} color={disp(color)} />
  </group>
);

// ---------------------------------------------------------------- sets
/** bright fabric couch (teal, cream cushions) built from boxes: the navy Blender couch read as a dark slab in daylight */
const BrightCouch: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <Box p={[0, 0.42, 0]} s={[4.8, 0.84, 1.5]} color={disp("#4fa3c4")} line={3} />
    <Box p={[0, 1.3, -0.62]} s={[4.8, 1.3, 0.34]} color={disp("#4fa3c4")} line={3} />
    <Box p={[-1.15, 0.92, 0.05]} s={[2.2, 0.18, 1.3]} color={disp("#f3e6cc")} line={3} /><Box p={[1.15, 0.92, 0.05]} s={[2.2, 0.18, 1.3]} color={disp("#f3e6cc")} line={3} />
    <Box p={[-2.55, 0.75, 0]} s={[0.4, 1.5, 1.6]} color={disp("#3f8fb0")} line={3} /><Box p={[2.55, 0.75, 0]} s={[0.4, 1.5, 1.6]} color={disp("#3f8fb0")} line={3} />
    <Box p={[1.75, 1.35, -0.35]} s={[0.8, 0.7, 0.22]} rot={[0, 0, 0.15]} color={disp("#f5b942")} line={3} />
  </group>
);
/** Florida wall map on cream paper: dashed navy outline (made up) turns into solid coral + green land (real) */
const MapPoster: React.FC<{ p: V3; s: [number, number]; mode: number; draw: number }> = ({ p, s, mode, draw }) => (
  <group position={p}>
    <Box p={[0, 0, -0.05]} s={[s[0] + 0.18, s[1] + 0.18, 0.06]} color={disp("#b5804f")} line={3} />
    <Panel p={[0, 0, 0]} s={s} px={[Math.round(s[0] * 110), Math.round(s[1] * 110)]} dep={`${mode.toFixed(2)}|${Math.round(draw * 40)}`} draw={(c, W, H) => {
      c.fillStyle = "#fdf6e6"; c.fillRect(0, 0, W, H);
      c.strokeStyle = "rgba(90,120,160,.18)"; c.lineWidth = 1; for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo((W * i) / 8, 0); c.lineTo((W * i) / 8, H); c.moveTo(0, (H * i) / 8); c.lineTo(W, (H * i) / 8); c.stroke(); }
      const sc = Math.min(W / 7.4, H / 6.4), ox = W / 2 + 0.3 * sc, oy = H / 2 + 0.3 * sc;
      const n = Math.max(2, Math.round(FL_PTS.length * draw));
      const path = () => { c.beginPath(); FL_PTS.slice(0, n).forEach(([x, y], i) => (i ? c.lineTo(ox + x * sc, oy - y * sc) : c.moveTo(ox + x * sc, oy - y * sc))); if (n >= FL_PTS.length) c.closePath(); };
      if (mode > 0.5 && draw >= 1) { path(); c.fillStyle = disp("#8cc46b"); c.fill(); }
      c.strokeStyle = mode > 0.5 ? disp("#e2543c") : "#2e3658"; c.lineWidth = 6; c.lineJoin = "round";
      c.setLineDash(mode > 0.5 ? [] : [14, 12]); path(); c.stroke(); c.setLineDash([]);
      if (mode > 0.5 && draw >= 1) { c.fillStyle = disp("#e2543c"); c.beginPath(); c.arc(ox + 3.0 * sc, oy + 2.45 * sc, 10, 0, 7); c.fill(); }
    }} />
  </group>
);
/** Remy's apartment in daylight: warm plaster, big window (city before the move, palms in Florida), wood floor */
const Home: React.FC<{ t: number; hero: V3; florida?: boolean; map?: number; mapDraw?: number; couch?: boolean; storm?: number }> = ({ t, hero, florida, map = 0, mapDraw = 1, couch, storm = 0 }) => (<>
  <Sky storm={storm} fogNear={25} fogFar={135} />
  <Sun hero={hero} storm={storm} />
  <Surface lit gain={1.0} p={[0, 0, 7.5]} s={[30, 25]} rot={[-Math.PI / 2, 0, 0]} kind="plank" a={disp(DAY.wood)} b={disp(DAY.wood2)} unit={2.2} />
  <WindowWall z={-5} win={{ x: 3.4, y: 1.5, w: 5.4, h: 3.9 }} a={DAY.plaster} b="#efe0c8" kind="plain" />
  <SideWall lit gain={1.0} x={-9} kind="plain" a={disp("#f0dfc6")} b={disp("#f0dfc6")} />
  <DayGround base={DAY.grass} speck="#6fae52" y={-0.05} />
  {florida ? <>{[[1.2, -11], [6.2, -13], [9.5, -19], [-1.5, -22]].map(([x, z], i) => <Palm key={i} p={[x, 0, z]} s={1.3 + (i % 2) * 0.2} rot={i * 1.3} />)}
    <Sea z={-30} t={t} foam={0} storm={storm} /></>
    : <CityBackdrop z={-125} spread={190} />}
  <Clouds t={t} at={[[-20, 26, -90], [14, 32, -110], [40, 24, -100], [-45, 30, -120]]} s={4} />
  <MapPoster p={[-3.3, 3.3, -4.92]} s={[2.9, 2.5]} mode={map} draw={mapDraw} />
  <Shelf p={[-7.4, 0, -4.4]} w={2.0} rows={4} wood="#9c6a3e" cols={[N3.gold, "#4f86b8", N3.coral, "#f3e2c4", "#6fae52", "#d9743a"]} />
  <Lamp p={[7.6, 0, -3.6]} color="#fff3d0" />
  <Plant p={[-5.8, 0, -3.8]} pot={N3.coral} />
  <Rug p={[0, 0, 0.8]} s={[7.5, 4.4]} a="#e8b98a" b={N3.coral} />
  <SunPatch p={[1.6, 0, 0.6]} s={[7, 4]} o={0.25 * (1 - storm)} />
  {couch && <BrightCouch p={[0, 0, -1.3]} />}
  <Dust t={t} area={[8, 6, 5]} color="rgba(255,245,220,.9)" />
</>);

// ---------------------------------------------------------------- shot builder
type View = { world: React.ReactNode; hud?: React.ReactNode };
const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number, sub: number, us: number, ls: number): View => {
  const t = f / FPS, off = u - us;
  switch (id) {
    case "hook": { // Remy at home under a wall map: dashed (made-up) outline turns solid + green (real); suitcase rolls in
      const GT = C("GTA 6's map", 96), MU = C("made up", 149), PB = C("pack a bag", 209), TR = C("try the real", 251);
      const real = u >= TR ? 1 : 0;
      const sx = k(u, PB - 4, PB + 18, 3.6, 0.85, EASE.arrive);
      const hero: V3 = [0, 0, 1.2];
      const cams: CamSpec[] = [
        // CAM hook: PUSH-IN - wide on the room, slow push to Remy under the map
        { move: "push", a: [[0.7, 3.1, 14.2], [-0.4, 2.2, 0.0], 46], b: [[0.2, 2.8, 11.4], [-0.3, 2.05, 0.2], 44] },
        // CAM hookb: ORBIT - arc round Remy + suitcase (right to centre)
        { move: "orbit", c: [0.3, 0, 1.2], look: [0.3, 1.75, 1.2], r: 10.6, y: [2.3, 2.1], ang: [0.5, 0.14], fov: 40 },
      ];
      const world = <>
        <Home t={t} hero={hero} map={real} mapDraw={k(u, 0, 40, 0.05, 1, EASE.arrive)} />
        <Hero p={hero} look={REMY} pose={{ mood: u >= TR ? "grin" : u >= MU ? "smile" : "deadpan", arms: u >= TR ? "up" : u >= MU ? "point" : "down", armK: u >= TR ? 0.9 : 0.8, lookX: u >= PB && u < TR ? 0.8 : -0.4, flip: u >= MU && u < PB }} f={f} />
        {u >= PB - 4 && <Suitcase p={[sx, 0, 1.35]} tilt={u < PB + 18 ? -0.15 : 0} />}
        <Move us={us} ls={ls} spec={cams[sub]} off={off} kicks={[TR]} />
      </>;
      const hud = <>
        <StrokeWord text="WHAT IF" x={540} y={405} h={100} p={k(u, GT, GT + 34, 0, 1, EASE.arrive)} />
        <HudText f={u} x={540} y={592} size={40} color={MUTED} at={GT + 10} out={len - 6} spacing={10}>EPISODE 2</HudText>
        <HudText f={u} x={540} y={676} size={56} color={CYAN} at={MU} out={TR - 4}>LEONIDA: FICTIONAL</HudText>
        <HudText f={u} x={540} y={676} size={60} color={GOLD} at={TR} out={len - 6}>FLORIDA, USA</HudText>
        <Stamp f={u} x={540} y={772} text="ONE-WAY TICKET" at={PB} out={len - 6} size={46} color={CORAL} />
      </>;
      return { world, hud };
    }
    case "miami": { // hazy humid Miami street outside ARRIVALS: Remy rolls his suitcase in, the heat hits; HUMIDITY meter fills
      const RL = C("Remy lands", 32), AIR = C("The air", 82), TW = C("warm, wet towel", 134);
      const x = k(u, 0, AIR, -3.4, 0.0, Easing.out(Easing.quad));
      const walking = u < AIR - 6;
      const heat = k(u, AIR, TW + 20, 0, 1);
      const cams: CamSpec[] = [
        // CAM miami: TRACKING / TRUCK - the camera slides along the sidewalk with Remy
        { move: "truck", a: [[-3.0, 2.5, 11.4], [-3.4, 1.75, 1.2], 44], b: [[0.4, 2.5, 11.4], [0.0, 1.75, 1.2], 44] },
        // CAM miamib: DOLLY ZOOM (vertigo) - camera backs away while the lens zooms in: Remy stays, the street closes in
        { move: "dolly", look: [0, 1.4, 1.2], dir: [0.05, 0.1, 1], d: [9, 17], fov0: 40 },
      ];
      const world = <>
        <Sky fogNear={18} fogFar={120} />
        <Sun hero={[x, 0, 1.2]} />
        <DayGround base="#d9c9ae" speck="#c4b292" y={-0.05} />
        <mesh position={[0, 0.0, 6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[120, 6]} /><meshLambertMaterial color={disp(DAY.asphalt)} /></mesh>
        {Array.from({ length: 14 }, (_, i) => <Box key={i} p={[-26 + i * 4, 0.012, 6]} s={[1.8, 0.02, 0.16]} color="#fff6d8" line={0} />)}
        <Surface lit gain={1.0} p={[0, 0.02, 0.4]} s={[120, 5.2]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#efe4d2")} b={disp("#e6d9c4")} unit={1.6} />
        <Box p={[0, 0.06, 3.0]} s={[120, 0.12, 0.3]} color={disp("#d8cdb8")} line={2} />
        <Building p={[-12, 0, -9]} s={[5, 9, 3]} color={disp("#f4b8a0")} seed={3} lit={0.05} trim={disp("#e2543c")} />
        <Building p={[-5.6, 0, -10.5]} s={[5.4, 12, 3]} color={disp("#9fdad3")} seed={5} lit={0.05} trim={disp("#2b8a90")} />
        <Building p={[1.4, 0, -10]} s={[5, 8, 3]} color={disp("#f7d98e")} seed={7} lit={0.05} trim={disp("#e2543c")} />
        <Building p={[7.8, 0, -9.5]} s={[4.6, 10.5, 3]} color={disp("#f0a2b8")} seed={9} lit={0.05} trim={disp("#b03a5a")} />
        <Building p={[13.6, 0, -9]} s={[5, 7, 3]} color={disp("#b9d8f4")} seed={11} lit={0.05} trim={disp("#2e6fb0")} />
        <CityBackdrop z={-70} spread={120} />
        <Clouds t={t} at={[[-24, 26, -90], [10, 30, -110], [36, 24, -95]]} s={4} />
        {/* airport arrivals hall on the left */}
        <Box p={[-9.4, 2.4, -1.6]} s={[5.6, 4.8, 1.2]} color={disp("#eef2f6")} line={3} />
        <Box p={[-8.4, 1.5, -0.98]} s={[2.6, 3.0, 0.06]} color={disp("#7fb6d9")} line={3} />
        <Sign p={[-9.0, 4.2, -0.95]} s={[3.8, 0.8]} text="ARRIVALS" bg="#2e3658" fg="#f5b942" size={110} frame="#1b2238" />
        {[[-4.6, -1.6, 0.4], [3.6, -1.9, 2.2], [8.8, -1.4, 1.0], [-14, -1.8, 2.8]].map(([px, pz, r], i) => <Palm key={i} p={[px, 0, pz]} s={1.0 + (i % 2) * 0.12} rot={r} />)}
        <Hero p={[x, 0, 1.2]} look={REMY} pose={{ mood: heat > 0.5 ? "gulp" : "smile", walk: x * 2.4, speed: walking ? 1 : 0, sweat: 0.15 + 0.85 * heat, nerv: 0.3 * heat, armR: [0.33, 0.42], armRK: 1, tilt: walking ? 0 : 0.03 * Math.sin(f * 0.15) }} f={f} />
        <Suitcase p={[x + 0.82, 0, 1.3]} tilt={walking ? -0.22 : 0} />
        <Motes t={t} n={22} c={[0, 0.3, 0]} area={[7, 5, 3]} color={N3.amber} />
        <Move us={us} ls={ls} spec={cams[sub]} off={off} />
      </>;
      const hp = drawOn(u, AIR, 14), fill = k(u, AIR + 6, TW + 10, 0, 0.94, EASE.arrive);
      const hud = <>
        <LiveCounter f={u} label="DAYS IN FLORIDA" from={0} to={1} at={RL + 6} dur={14} />
        {hp > 0 && <g opacity={hp}>
          <HudText f={u} x={70} y={690} size={42} color={MUTED} at={AIR} anchor="start" spacing={6}>HUMIDITY</HudText>
          <rect x={70} y={712} width={430} height={64} rx={14} fill="#0b0d1a" opacity={0.55} />
          <NeonPath d="M 70 712 L 500 712 L 500 776 L 70 776 Z" w={2.5} p={hp} color={NEON.dim} glow={0.4} />
          <rect x={76} y={718} width={Math.max(0, 418 * fill)} height={52} rx={10} fill={fill > 0.8 ? CORAL : AMBER} opacity={0.75} />
          {fill > 0.85 && <g transform={`translate(${76 + 418 * fill - 30} 744)`}><path d="M 0 -22 C 14 -4 16 6 0 18 C -16 6 -14 -4 0 -22 Z" fill={N3.cyan} opacity={0.95} /></g>}
        </g>}
      </>;
      return { world, hud };
    }
    case "wish": { // a sunny boardwalk by the sea with three round dioramas that pop on their words: swamp, beach, fast car
      const SW = C("Swamps.", 74), BE = C("Beaches.", 92), FC = C("Fast cars.", 110);
      const on = [SW, BE, FC].map((c) => (u >= c ? 1 : 0));
      const sel = u >= FC ? 2 : u >= BE ? 1 : u >= SW ? 0 : -1;
      const P: V3[] = [[-4.0, 0, -1.0], [0, 0, -2.2], [4.0, 0, -1.0]];
      const cams: CamSpec[] = [
        // CAM wish: CRANE + LAND - rises from behind Remy, over the boardwalk, settles high and wide on all three dioramas
        { move: "crane", a: [[0.3, 1.7, 9.5], [0, 1.6, 0], 46], b: [[0.4, 5.6, 14.0], [0, 1.0, -0.6], 46], arc: 2.6 },
        // CAM wishb: TRACKING / TRUCK - slides left to right past swamp, beach, car as the voice names them
        { move: "truck", a: [[-4.6, 2.7, 9.6], [-3.4, 1.2, -1.0], 44], b: [[4.6, 2.7, 9.6], [3.4, 1.2, -1.0], 44] },
      ];
      const world = <>
        <Sky fogNear={30} fogFar={170} />
        <Sun hero={[0, 0, 1]} />
        <DayGround base={DAY.sand} speck="#c99a62" y={-0.05} />
        <Sea z={-7} t={t} />
        <Surface lit gain={1.0} p={[0, 0.03, 1.6]} s={[40, 9]} rot={[-Math.PI / 2, 0, 0]} kind="plank" a={disp("#d9a56a")} b={disp("#c99358")} unit={1.4} />
        <Clouds t={t} at={[[-22, 24, -90], [12, 30, -110], [40, 22, -100]]} s={4} />
        <Palm p={[-8.5, 0, -2.4]} s={1.2} rot={0.6} /><Palm p={[8.6, 0, -2.8]} s={1.1} rot={2.1} />
        {P.map((p, i) => <group key={i}>
          <Cyl p={[p[0], 0.22, p[2]]} rt={1.75} h={0.44} color={disp("#f3e6cc")} />
          <NeonBar p={[p[0], 0.46, p[2] + 1.74]} s={[1.2, 0.05, 0.05]} color={on[i] ? [AMBER, GOLD, CORAL][i] : "#c8b48a"} glow={on[i] ? 0.4 : 0} />
        </group>)}
        {/* swamp: dark green water, reeds, two cypress, a gator peeking */}
        <group position={[P[0][0], 0.45, P[0][2]]} scale={pop(u, SW, 12) * 0.999 + 0.001}>
          <Water p={[0, 0, 0]} s={[3.2, 3.2]} t={t} color={disp("#6f8f4a")} deep={disp("#3f5f2e")} round />
          <Tufts c={[0, 0, 0]} area={[3.0, 3.0]} n={14} color={disp("#5a9a44")} seed={4} />
          {[[-0.9, -0.6], [0.8, -0.9]].map(([x, z], j) => <group key={j}><Cyl p={[x, 0.8, z]} rt={0.1} rb={0.2} h={1.6} color={disp("#7a5a3a")} line={2} /><Ball p={[x, 1.8, z]} r={0.55} color={disp("#4f9a48")} s={[1.3, 0.8, 1.3]} /></group>)}
          <Gator p={[0.2, -0.05, 0.6]} yaw={0.4} s={0.42} />
        </group>
        <group position={[P[1][0], 0.45, P[1][2]]} scale={pop(u, BE, 12) * 0.999 + 0.001}>
          <Cyl p={[0, 0.02, 0]} rt={1.7} h={0.06} color={disp("#f0d29a")} line={2} />
          <Water p={[0, 0.04, -0.9]} s={[3.0, 1.2]} t={t} color={disp("#4fc0d6")} deep={disp("#2a8fb0")} />
          <Glb name="beach_umbrella" p={[-0.4, 0.05, 0.1]} s={0.62} fallback={<Cyl p={[-0.4, 1.4, 0.1]} rt={0.05} rb={0.8} h={0.4} color={N3.coral} line={2} />} />
          <Palm p={[0.9, 0.05, -0.4]} s={0.42} rot={1.2} />
        </group>
        <group position={[P[2][0], 0.45, P[2][2]]} scale={pop(u, FC, 12) * 0.999 + 0.001}>
          <Cyl p={[0, 0.02, 0]} rt={1.7} h={0.06} color={disp(DAY.asphalt)} line={2} />
          <group rotation={[0, -0.45 + 0.15 * Math.sin(t * 0.8), 0]}><Glb name="sports_car" s={0.82} p={[0, 0.05, 0]} blob={1.0} fallback={<Box p={[0, 0.35, 0]} s={[2.3, 0.5, 1.0]} color={N3.gold} line={3} />} /></group>
        </group>
        <Hero p={[0, 0, 3.0]} look={REMY} pose={{ mood: sel >= 0 ? "grin" : "smile", arms: sel >= 0 ? "point" : "chest", armK: 0.9, flip: sel === 0, lookX: sel < 0 ? 0 : [-1, 0, 1][sel], squash: sel >= 0 ? -0.05 * Math.max(0, 1 - (u - [SW, BE, FC][sel]) / 8) : 0 }} f={f} />
        <Move us={us} ls={ls} spec={cams[sub]} off={off} />
      </>;
      const hud = <>
        <HudText f={u} x={540} y={400} size={58} color={GOLD} at={2} out={len - 6} spacing={4}>THE WISHLIST</HudText>
        {[0, 1, 2].map((i) => {
          const x = 300 + i * 240, cp = drawOn(u, 4 + i * 3, 10), tk = drawOn(u, [SW, BE, FC][i], 8);
          return <g key={i}>
            {cp > 0 && <rect x={x - 40} y={480} width={80} height={80} rx={8} fill="#0b0d1a" opacity={0.5 * cp} />}
            <NeonPath d={`M ${x - 40} 480 L ${x + 40} 480 L ${x + 40} 560 L ${x - 40} 560 Z`} w={3} p={cp} color={NEON.dim} />
            {tk > 0 && <NeonPath d={`M ${x - 24} 520 L ${x - 6} 540 L ${x + 30} 494`} w={6} p={tk} color={[AMBER, GOLD, CORAL][i]} hot />}
          </g>;
        })}
      </>;
      return { world, hud };
    }
    case "golf":
    case "twist":
    case "above": { // sunny golf course by a pond. golf: a "log" opens its eyes; twist: the gator turns away; above: crane up to the storm
      const G = id === "golf", T = id === "twist", A = id === "above";
      const GC = G ? C("A golf course", 32) : 0, SL = G ? C("Something is lying", 71) : 0, NL = G ? C("It's not", 153) : 0;
      const MG = T ? C("Most gators", 121) : 0;
      const eyes = G ? k(u, NL - 2, NL + 8, 0, 1) : T ? k(u, MG, MG + 30, 1, 0.2) : 0.2;
      const lift = G ? k(u, NL, NL + 10, 0, 1, EASE.arrive) : T ? k(u, MG + 10, MG + 30, 1, 0) : 0;
      const yaw = T ? k(u, MG - 4, MG + 26, Math.PI, Math.PI * 1.75, EASE.arrive) : A ? Math.PI * 1.75 : Math.PI;
      const gp: V3 = T ? [k(u, MG + 18, len, 1.6, 3.0, Easing.linear), k(u, MG + 30, len, 0, -0.28, Easing.linear), k(u, MG + 18, len, 0.8, -0.7, Easing.linear)] : A ? [3.2, -0.32, -0.9] : [1.6, 0, 0.8];
      const rx = G ? k(u, 0, SL, -3.4, -1.8, Easing.out(Easing.quad)) : -1.8;
      const jump = G && u >= NL ? Math.max(0, Math.sin(((u - NL) / 14) * Math.PI)) * (u - NL < 14 ? 1 : 0) : 0;
      const back = G ? k(u, NL, NL + 14, 0, -0.5, EASE.arrive) : -0.5;
      const storm = A ? k(u, 0, len, 0.1, 0.5) : 0;
      const mood: Pose["mood"] = G ? (u >= NL ? "shock" : u >= SL ? "worry" : "smile") : T ? (u >= MG + 10 ? "smile" : "worry") : "worry";
      const cams: CamSpec[] = G ? [
        // CAM golf: PULL BACK (reveal) - close on happy Remy walking, pulls back to reveal the pond and the "log"
        { move: "pull", a: [[-2.4, 2.0, 7.0], [-2.4, 1.45, 1.2], 40], b: [[-0.3, 3.2, 14.0], [-0.2, 1.6, 0.4], 46] },
        // CAM golfb: LOW HERO ANGLE - camera on the grass, pushes in on the gator as its eyes open
        { move: "low", a: [[-6.9, 0.95, 9.6], [-0.9, 1.5, 1.0], 50], b: [[-6.3, 0.9, 8.8], [-0.95, 1.5, 1.0], 50] },
      ] : T ? [
        // CAM twist: ORBIT - arcs round Remy and the gator while the gator turns away
        { move: "orbit", c: [0, 0, 1.0], look: [-0.3, 1.3, 1.0], r: 14, y: [3.2, 2.9], ang: [-0.55, -0.15], fov: 44 },
        // CAM twistb: TOP-DOWN (high angle) - looks down on the pond as the gator slides in and swims off
        { move: "top", a: [[0.2, 11.5, 9.0], [0.9, 0, 0.2], 46], b: [[0.6, 10.4, 8.0], [1.4, 0, 0.0], 46] },
      ] : [
        // CAM above: CRANE UP - rises from Remy and tilts up to the storm clouds building over the course
        { move: "crane", a: [[-0.8, 1.9, 10.5], [-1.2, 1.8, 1.2], 46], b: [[-0.4, 3.6, 11.8], [-0.6, 16.0, -16.0], 50], arc: 0.6 },
      ];
      const world = <>
        <Sky storm={storm} fogNear={30} fogFar={170} />
        <Sun hero={[rx, 0, 1.2]} storm={storm} />
        <DayGround base={DAY.grass} speck="#6fae52" y={-0.05} />
        <mesh position={[-3.4, 0.0, -3.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[2.6, 40]} /><meshLambertMaterial color={disp("#a6d97e")} /></mesh>
        <mesh position={[5.6, 0.0, 2.2]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 1, 1]} receiveShadow><circleGeometry args={[1.3, 30]} /><meshLambertMaterial color={disp("#f0dca8")} /></mesh>
        <Water p={[2.4, 0, -0.9]} s={[6.4, 4.0]} t={t} color={disp("#5cc0cf")} deep={disp("#2f8aa6")} round />
        <Tufts c={[2.4, 0, -0.9]} area={[7.4, 5]} n={26} seed={3} color={disp("#4f9a44")} />
        <Glb name="golf_flag" p={[-3.4, 0, -3.4]} blob={0.3} fallback={<><Cyl p={[-3.4, 1.2, -3.4]} rt={0.03} h={2.4} color="#fffaf0" line={1} /><Box p={[-3.0, 2.1, -3.4]} s={[0.75, 0.48, 0.03]} color={N3.coral} line={2} /></>} />
        <Palm p={[-7.6, 0, -6]} s={1.15} rot={0.3} /><Palm p={[7.6, 0, -5]} s={1.0} rot={2.0} /><Palm p={[4.4, 0, -9.5]} s={1.25} rot={1.2} /><Palm p={[-3, 0, -14]} s={1.3} rot={2.6} />
        {[[-11, -10, 1.4], [-1, -12, 1.8], [10, -11, 1.5], [16, -16, 2]].map(([x, z, s], i) => <Bush key={i} p={[x, 0, z]} s={s} />)}
        <CityBackdrop z={-130} spread={200} />
        <Clouds t={t} at={[[-26, 26, -90], [10, 32, -115], [38, 24, -100]]} s={4} />
        <Gator p={gp} yaw={yaw} lift={lift} eyes={eyes} />
        {G && u >= SL && u < NL + 30 && <Panel p={[gp[0] + 0.3, 0.9, gp[2] + 0.3]} s={[2.6, 2.6]} px={[256, 256]} face o={k(u, SL, SL + 8, 0, 0.95) * (u > NL + 20 ? k(u, NL + 20, NL + 30, 1, 0) : 1)} dep={Math.floor(u / 3)} draw={(c, W) => {
          const m = W / 2; c.strokeStyle = "#e2543c"; c.lineWidth = 7; c.setLineDash([18, 12]); c.lineDashOffset = -u * 2;
          c.beginPath(); c.arc(m, m, W * 0.42, 0, 7); c.stroke(); c.setLineDash([]);
          for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2; c.beginPath(); c.moveTo(m + Math.cos(a) * W * 0.36, m + Math.sin(a) * W * 0.36); c.lineTo(m + Math.cos(a) * W * 0.48, m + Math.sin(a) * W * 0.48); c.stroke(); }
          if (u < NL) { c.fillStyle = "#e2543c"; c.font = `900 70px ${FONT3}`; c.textAlign = "center"; c.fillText("?", m, m - W * 0.18); }
        }} />}
        {A && <StormCloud p={[k(u, 0, len, -7, 0.5), 16, -16]} s={2.6} dark={k(u, 0, len, 0.1, 0.45)} flash={u > len - 22 ? Math.max(0, 1 - (u - (len - 22)) / 6) : 0} />}
        {A && <StormCloud p={[k(u, 0, len, -14, -7), 15, -19]} s={2.0} dark={k(u, 0, len, 0.1, 0.45)} seed={3} />}
        <Hero p={[rx + back, 0.35 * jump, 1.2]} look={REMY} pose={{ mood, walk: rx * 2.4, speed: G && u < SL - 6 ? 1 : 0, arms: G && u >= NL ? "up" : T && u < MG + 10 ? "chest" : "down", armK: 0.9, squash: -0.07 * jump, nerv: (G && u >= SL) || (T && u < MG + 10) ? 0.6 : A ? 0.3 : 0, sweat: G && u >= NL ? 0.8 : T && u < MG ? 0.5 : 0.3, lookX: A ? 0 : 0.8, tilt: A ? -0.08 : 0 }} f={f} />
        <Move us={us} ls={ls} spec={cams[sub]} off={off} />
      </>;
      const hud = G ? <>
        <LiveCounter f={u} label="DAYS IN FLORIDA" from={1} to={3} at={GC + 8} dur={16} />
        <Stamp f={u} x={540} y={650} text="SPECIES: ALLIGATOR" at={NL + 6} out={len - 6} size={48} color={CORAL} />
      </> : T ? <>
        <LiveCounter f={u} label="DAYS IN FLORIDA" from={3} to={3} at={0} />
        <HudText f={u} x={540} y={680} size={44} color={CREAM} at={MG} out={len - 6} spacing={4}>FLORIDA WILDLIFE DATA</HudText>
        <Stamp f={u} x={540} y={790} text="SERIOUS INJURIES: RARE" at={MG + 4} out={len - 6} size={48} color={GOLD} />
      </> : <>
        <g opacity={arrive(u, 6, 12) * (1 - arrive(u, len - 8, 6))}>
          <NeonPath d="M 540 1200 L 540 1000 M 480 1060 L 540 1000 L 600 1060" w={8} p={drawOn(u, 6, 14)} color={GOLD} hot />
        </g>
        <HudText f={u} x={540} y={1290} size={56} color={CREAM} at={10} out={len - 6} spacing={6}>LOOK UP</HudText>
      </>;
      return { world, hud };
    }
    case "gators":
    case "strikes":
    case "deaths":
    case "landfall": { // big 3D Florida map on a wooden table on a sunny sea terrace: gators / storm + bolts / #1 trophy / hurricane spiral
      const isG = id === "gators", isS = id === "strikes", isD = id === "deaths", isL = id === "landfall";
      const OP = isG ? C("one point three", 35) : 0, SS = isG ? C("sixty seven", 169) : 0;
      const TA = isS ? C("than any", 78) : 0, FY = isD ? C("for years", 99) : 0, FP = isL ? C("forty percent", 14) : 0;
      const nDots = isG ? k(u, SS - 6, SS + 40, 0, 67, Easing.linear) : 67;
      const period = 22, sIdx = Math.floor(u / period), sPh = (u % period) / period;
      const boltOn = (isS || isD) && sPh < 0.25 ? 1 - sPh / 0.25 : 0;
      const target = COUNTY_DOTS[(sIdx * 23 + 5) % 67];
      const storm = isS || isD ? 0.6 : isL ? 0.4 : 0;
      const TY = 1.0; // table top; the map slab is 0.3 thick
      const spx = isL ? k(u, 0, len, 7.5, 3.0, Easing.linear) : 0, spz = isL ? k(u, 0, len, -3.6, 0.2, Easing.linear) : 0;
      const remy: V3 = [-2.8, 0, 4.4];
      const cams: CamSpec[] = isG ? [
        // CAM gators: TOP-DOWN - straight down on the map, slowly descending
        { move: "top", a: [[0.1, 17.5, 1.6], [0.1, TY, -0.6], 46], b: [[0.1, 14.5, 1.2], [0.1, TY, -0.6], 46] },
        // CAM gatorsb: ORBIT - arcs round the table at a high angle while the 67 county dots pop in
        { move: "orbit", c: [0.1, 0, -0.2], look: [0.1, TY, -1.6], r: 12.5, y: [8.8, 7.8], ang: [0.55, 0.12], fov: 44 },
      ] : isS ? [
        // CAM strikes: PUSH-IN (high angle) - pushes in over the storm clouds as bolts hit the map
        { move: "push", a: [[0.8, 13.5, 13.5], [0.1, TY, -0.6], 46], b: [[0.4, 11.0, 10.8], [0.1, TY, -0.6], 46] },
      ] : isD ? [
        // CAM deaths: LOW HERO ANGLE - low on the table edge looking up at the #1 trophy under the storm
        { move: "low", a: [[3.4, 2.4, 11.6], [0.4, 2.6, -0.6], 40], b: [[2.9, 2.3, 10.4], [0.4, 2.65, -0.6], 40] },
      ] : [
        // CAM landfall: CRANE + LAND - sweeps in high from the sea side and settles over the map
        { move: "crane", a: [[8.5, 13, 12], [2.5, TY, -1.5], 46], b: [[1.4, 10.0, 11.5], [0.8, TY, -0.6], 46], arc: 2 },
        // CAM landfallb: TRACKING - follows the hurricane spiral as it makes landfall
        { move: "truck", a: [[spx + 1.2, 8.0, spz + 9.0], [spx - 0.8, TY, spz - 0.2], 44], b: [[spx + 1.0, 7.6, spz + 8.6], [spx - 1.0, TY, spz - 0.2], 44] },
      ];
      const world = <>
        <Sky storm={storm} flash={boltOn * 0.6} fogNear={30} fogFar={170} />
        <Sun hero={[0, TY, 0]} storm={storm} flash={boltOn} />
        <DayGround base={DAY.sand} speck="#c99a62" y={-0.05} />
        <Surface lit gain={1.0} p={[0, 0.02, 2]} s={[34, 22]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#efe4d2")} b={disp("#e3d4bc")} unit={2.2} />
        <Sea z={-9} t={t} storm={storm} />
        <Palm p={[-9, 0, -4]} s={1.2} rot={0.5} /><Palm p={[9.5, 0, -5]} s={1.1} rot={2.3} /><Palm p={[-12, 0, 4]} s={1.3} rot={1.4} />
        {storm < 0.5 && <Clouds t={t} at={[[-26, 26, -90], [12, 30, -110], [40, 22, -100]]} s={4} />}
        {/* the table */}
        <Box p={[0, TY - 0.08, -0.2]} s={[8.8, 0.16, 7.2]} color={disp(DAY.wood)} line={3} />
        {[[-4, -3.4], [4, -3.4], [-4, 3.0], [4, 3.0]].map(([x, z], i) => <Box key={i} p={[x, (TY - 0.16) / 2, z]} s={[0.24, TY - 0.16, 0.24]} color={disp(DAY.wood2)} line={2} />)}
        <FloridaMap p={[0.1, TY, -0.2]} s={1.0} color={disp(isL ? "#7fb86a" : "#8cc46b")} n={nDots} dotColor={GOLD} hits={isS ? Math.min(30, sIdx) : isD ? 30 : 0} t={t} glow={0.5} />
        <Water p={[0, TY - 0.02, -0.2]} s={[8.6, 7.0]} t={t} color={disp("#5cc0d8")} deep={disp("#3a9cc0")} />
        {isG && [[-2.0, 2.4, 0.3], [1.6, -0.6, 2.2], [2.0, -1.6, -0.5], [-0.4, 2.2, 3.4]].map(([x, y, r], i) => (
          <Gator key={i} p={[x + 0.08 * Math.sin(t * 0.7 + i), TY + 0.32, -y]} yaw={r + 0.1 * Math.sin(t + i)} s={0.26} eyes={0.3} />))}
        {(isS || isD) && <>
          <StormCloud p={[-1.5, 6.4, -2.6]} s={1.3} dark={0.65} flash={boltOn} seed={2} />
          <StormCloud p={[2.4, 6.9, -3.4]} s={1.1} dark={0.65} flash={boltOn * 0.6} seed={5} />
          <Bolt p={[target[0] + 0.1, TY + 0.35, -target[1] - 0.2]} top={6.2} o={boltOn} seed={sIdx} />
        </>}
        {isD && <group position={[0.4, TY + 0.32 + 0.25 * pop(u, 6, 14), -0.6]}>
          <Cyl p={[0, 0.5, 0]} rt={0.5} h={1.0} color={disp("#f5b942")} />
          <Cyl p={[0, 1.02, 0]} rt={0.62} h={0.08} color={disp("#e0a030")} line={2} />
          <Sign p={[0, 1.75, 0]} s={[1.3, 1.0]} text="#1" bg="#2e3658" fg="#f5b942" size={150} frame="#1b2238" face />
        </group>}
        {isL && <>
          <Spiral p={[spx, TY + 0.5, spz]} r={1.9} t={t} o={0.95} color="#ffffff" />
          <Spiral p={[8.5, TY + 0.3, -6]} r={1.1} t={t + 2} o={0.4} color="#ffffff" />
        </>}
        <Hero p={remy} look={REMY} pose={{ mood: isG ? (u >= SS ? "shock" : "worry") : isS || isD ? "worry" : "gulp", arms: isG ? "point" : isL ? "head" : "chest", armK: 0.9, nerv: isS || isD ? 0.5 : 0.2, sweat: isL ? 0.6 : 0.3, lookX: 0.8 }} f={f} />
        {(isS || isD) && <Rain p={[0, 3.5, 4.5]} s={[18, 10]} t={t} o={0.18} />}
        <Move us={us} ls={ls} spec={cams[sub]} off={off} impacts={isS ? [[TA, 0.03]] : []} />
      </>;
      const pct = isL ? k(u, FP, FP + 26, 0, 40, EASE.arrive) : 0;
      const g13 = isG ? k(u, OP, OP + 24, 0, 1.3, EASE.arrive) : 0;
      const hud = isG ? <>
        <Card f={u} at={OP - 8} x={170} y={330} w={740} h={350} out={len - 6} />
        <HudText f={u} x={540} y={395} size={40} color={CREAM} at={OP - 6} out={len - 6} spacing={6}>WILD GATORS, ESTIMATE</HudText>
        <g opacity={arrive(u, OP, 8)}><NeonText x={540} y={530} size={120} color={AMBER}>{`~${g13.toFixed(1)} M`}</NeonText></g>
        <g opacity={arrive(u, SS, 8)}><Digits x={540} y={645} text={`${String(Math.round(nDots)).padStart(2, "0")}/67`} size={84} color={GOLD} anchor="middle" /></g>
      </> : isS ? <>
        <Card f={u} at={2} x={190} y={340} w={700} h={400} out={len - 6} />
        <HudText f={u} x={540} y={410} size={44} color={CREAM} at={4} out={len - 6} spacing={6}>LIGHTNING PER KM²</HudText>
        <g opacity={arrive(u, TA, 8)}><NeonText x={540} y={610} size={190} color={CORAL}>#1</NeonText></g>
        <HudText f={u} x={540} y={700} size={44} color={GOLD} at={TA + 8} out={len - 6} spacing={4}>OF 50 STATES</HudText>
      </> : isD ? <>
        <Card f={u} at={0} x={190} y={330} w={700} h={320} out={len - 6} color={CORAL} />
        <HudText f={u} x={540} y={395} size={40} color={CREAM} at={2} out={len - 6} spacing={4}>LIGHTNING DEATHS</HudText>
        <g opacity={arrive(u, 4, 8)}><Digits x={540} y={540} text={String(Math.round(k(u, 4, 34, 0, 97, EASE.arrive)))} size={130} color={CORAL} anchor="middle" /></g>
        <HudText f={u} x={540} y={615} size={38} color={GOLD} at={FY} out={len - 6} spacing={4}>CONFIRMED · 2006–2025</HudText>
      </> : <>
        <Card f={u} at={0} x={110} y={340} w={860} h={500} out={len - 6} />
        <HudText f={u} x={540} y={410} size={42} color={CREAM} at={2} out={len - 6} spacing={4}>U.S. HURRICANE LANDFALLS</HudText>
        <g opacity={arrive(u, FP, 8)}>
          <Digits x={470} y={590} text={`~${Math.round(pct)}`} size={150} color={AMBER} anchor="middle" />
          <NeonText x={680} y={590} size={110} color={GOLD} anchor="start">%</NeonText>
        </g>
        {Array.from({ length: 10 }, (_, i) => {
          const x = 135 + i * 90, p = drawOn(u, FP + 10 + i * 2, 8), hot = i < 4 && u >= FP + 34;
          return p > 0 && <g key={i} transform={`translate(${x} 720) rotate(${(u * 4 + i * 30) % 360})`} opacity={p}>
            <path d="M 0 -26 C 22 -26 26 -4 10 4 M 0 26 C -22 26 -26 4 -10 -4" fill="none" stroke={hot ? CORAL : "#8a90a8"} strokeWidth={6} strokeLinecap="round" />
            <circle r={7} fill={hot ? CORAL : "#8a90a8"} />
          </g>;
        })}
        <HudText f={u} x={540} y={810} size={38} color={GOLD} at={FP + 36} out={len - 6} spacing={4}>FLORIDA: 4 IN 10</HudText>
      </>;
      return { world, hud };
    }
    case "sky":
    case "ask": { // the beach: noon sun turns to a 4 pm storm with a strike at sea / sunset beach for the final question
      const isSky = id === "sky";
      const EA = isSky ? C("Every afternoon", 32) : 0, SN = isSky ? C("Sunshine at noon", 95) : 0, TB = isSky ? C("Thunder by", 134) : 0;
      const storm = isSky ? k(u, SN + 10, TB + 10, 0, 0.75) : 0;
      const strike = isSky ? (u >= TB + 6 && u < TB + 14 ? 1 - (u - TB - 6) / 8 : u >= len - 24 && u < len - 16 ? 1 - (u - len + 24) / 8 : 0) : 0;
      const hrs = isSky ? k(u, SN - 10, TB + 6, 11.5, 16) : 0;
      const dusk = isSky ? 0 : 1;
      const cx = isSky ? k(u, SN, len, -16, -2, Easing.linear) : 0;
      const cues = isSky ? [] : [C("A, for the", 74), C("B, for the", 127), C("C, never", 179), C("D, I", 211)];
      const pick = cues.reduce((acc, c, i) => (u >= c ? i : acc), -1);
      const hero: V3 = isSky ? [0.4, 0, 1.6] : [0, 0, 2.0];
      const cams: CamSpec[] = isSky ? [
        // CAM sky: PULL BACK (reveal) - from Remy in the sun back to the whole beach, sea and lifeguard tower
        { move: "pull", a: [[0.7, 2.0, 7.0], [0.4, 1.5, 1.6], 40], b: [[1.4, 3.0, 14.8], [0.6, 2.0, 0.2], 46] },
        // CAM skyb: LOW HERO ANGLE - low on the sand looking up at Remy as the sky behind him turns to storm
        { move: "low", a: [[-1.4, 1.0, 13.2], [0.3, 1.85, 1.6], 44], b: [[-1.0, 0.95, 12.2], [0.3, 1.9, 1.6], 44] },
      ] : [
        // CAM ask: CRANE + LAND - descends from above the sunset beach and lands centred on Remy (end card: settles still)
        { move: "crane", a: [[0.6, 8.5, 17.5], [0, 1.0, -2.5], 46], b: [[0.0, 2.6, 13.0], [0, 1.95, 1.6], 44], arc: 0 },
      ];
      const world = <>
        <Sky storm={storm} dusk={dusk} flash={strike} fogNear={30} fogFar={170} />
        <Sun hero={hero} storm={storm} dusk={dusk} flash={strike} />
        <DayGround base={DAY.sand} speck="#c99a62" y={-0.05} />
        <Sea z={-5} t={t} color={dusk ? "#4f9ec0" : "#3fb4cc"} storm={storm} />
        <Tufts c={[-6, 0, -1]} area={[6, 3]} n={10} color={disp("#7aa84a")} seed={9} />
        <Glb name="beach_umbrella" p={[-2.8, 0, -0.4]} blob={1.4} fallback={<Cyl p={[-2.8, 2.4, -0.4]} rt={0.05} rb={1.2} h={0.5} color={N3.coral} line={2} />} />
        <Palm p={[-6.8, 0, -2.6]} s={1.15} rot={0.6} lean={storm * 0.08} /><Palm p={[7.4, 0, -3.6]} s={1.0} rot={2.4} lean={-storm * 0.08} />
        {/* lifeguard tower with a clock (time of day) */}
        <group position={[4.0, 0, -2.4]}>
          {[[-0.7, -0.5], [0.7, -0.5], [-0.7, 0.5], [0.7, 0.5]].map(([x, z], i) => <Box key={i} p={[x, 1.2, z]} s={[0.14, 2.4, 0.14]} rot={[0, 0, x * 0.08]} color={disp("#f4ede0")} line={2} />)}
          <Box p={[0, 2.5, 0]} s={[2.0, 0.16, 1.4]} color={disp("#f4ede0")} line={3} />
          <Box p={[0, 3.3, -0.1]} s={[1.8, 1.4, 1.1]} color={disp("#e2543c")} line={3} />
          <Box p={[0, 4.1, -0.1]} s={[2.2, 0.16, 1.5]} color={disp("#f4ede0")} line={3} />
          {isSky && <NeonClock p={[0, 3.3, 0.48]} r={0.5} hours={hrs} />}
        </group>
        {isSky ? <>
          {storm < 0.4 && <Clouds t={t} at={[[-24, 26, -90], [12, 32, -110], [40, 24, -100]]} s={4} />}
          <StormCloud p={[cx, 8.4, -8]} s={2.3} dark={0.3 + 0.4 * storm} flash={strike} seed={4} />
          <StormCloud p={[cx - 7, 7.6, -10]} s={1.9} dark={0.3 + 0.4 * storm} seed={8} />
          <Bolt p={[4.2, 0.05, -12]} top={8.0} o={strike} seed={7} />
          <Rain p={[0, 3.5, 4.0]} s={[18, 10]} t={t} o={0.3 * clamp((storm - 0.55) / 0.2)} />
        </> : <Clouds t={t} at={[[-20, 18, -95], [18, 22, -110]]} s={4} />}
        <Hero p={hero} look={REMY} pose={isSky
          ? { mood: storm > 0.45 ? "worry" : "grin", arms: storm > 0.45 ? "head" : "up", armK: storm > 0.45 ? 0.9 : 0.6 + 0.2 * Math.sin(f * 0.2), nerv: storm > 0.5 ? 0.5 : 0, sweat: 0.4, lookX: storm > 0.3 ? -0.6 : 0, squash: strike > 0 ? -0.06 : 0 }
          : { mood: "grin", arms: u > 30 ? "point" : "up", armK: u > 30 ? 1 : 0.7 + 0.3 * Math.sin(f * 0.5), tilt: u > 30 ? 0 : 0.04 * Math.sin(f * 0.25) }} f={f} />
        <Move us={us} ls={ls} spec={cams[sub]} off={off} impacts={isSky ? [[TB + 6, 0.03]] : []} />
      </>;
      const hud = isSky ? <>
        <LiveCounter f={u} label="DAYS IN FLORIDA" from={3} to={10} at={EA + 4} dur={18} />
        <Card f={u} at={SN - 6} x={110} y={650} w={380} h={230} color={u < TB ? AMBER : CORAL} />
        <g opacity={arrive(u, SN - 4, 8)}>
          <Digits x={300} y={790} text={u < TB ? "12:00" : "4:00"} size={110} color={u < TB ? AMBER : CORAL} anchor="middle" />
          <NeonText x={300} y={852} size={40} color={CREAM}>{u < TB ? "PM · CLEAR" : "PM · STORM"}</NeonText>
        </g>
      </> : <>
        <HudText f={u} x={540} y={420} size={56} color={CREAM} at={2} out={len + 30}>COMMENT YOUR PICK</HudText>
        <IconCards f={u} y={640} at={8} pick={pick} pickAt={pick >= 0 ? cues[pick] : Infinity} />
      </>;
      return { world, hud };
    }
    case "tv": { // day 30: Remy on the couch in his Florida flat, the TV shows the storm track: a cone grows toward Florida
      const AC = C("A cone", 32), HS = C("Hurricane season", 102);
      const cone = k(u, AC, AC + 30, 0, 1, EASE.arrive);
      const hero: V3 = [-0.6, 0.45, -1.35];
      const cams: CamSpec[] = [
        // CAM tv: PUSH-IN - from the room's corner in toward Remy and the TV beside him
        { move: "push", a: [[-3.2, 3.3, 12.4], [0.5, 1.8, -0.4], 46], b: [[-2.2, 2.9, 8.8], [0.6, 1.75, -0.2], 46] },
        // CAM tvb: DOLLY ZOOM (vertigo) - camera backs off as the lens zooms: Remy stays, the room swells round him
        { move: "dolly", look: [-0.3, 1.75, -1.0], dir: [-0.12, 0.08, 1], d: [8.4, 15], fov0: 42 },
      ];
      const world = <>
        <Home t={t} hero={hero} florida map={1} couch />
        <Hero p={hero} look={REMY} pose={{ mood: u >= HS ? "gulp" : u >= AC + 10 ? "worry" : "deadpan", arms: u >= HS ? "head" : "down", armK: 0.85, lookX: 1, sweat: u >= HS ? 0.6 : 0.2, nerv: u >= HS ? 0.4 : 0 }} f={f} shadow={false} />
        <group position={[2.0, 0, 0.5]} rotation={[0, -0.7, 0]}>
          <Glb name="flat_tv" blob={1.5} fallback={<><Box p={[0, 0.35, 0]} s={[3.2, 0.7, 0.8]} color="#3a2717" /><Box p={[0, 1.95, -0.1]} s={[2.55, 1.5, 0.1]} color="#0b0d1a" /></>} />
          <Panel p={[0, 1.95, 0.01]} s={[2.36, 1.32]} px={[472, 264]} dep={Math.round(cone * 40) + Math.floor(u / 4) * 100} draw={(c, W, H) => {
            c.fillStyle = disp("#2f7fb8"); c.fillRect(0, 0, W, H);
            c.fillStyle = "#11264a"; c.fillRect(0, 0, W, 44); c.fillStyle = disp("#e2543c"); c.fillRect(0, 44, W, 6);
            c.fillStyle = "#ffffff"; c.font = `900 30px ${FONT3}`; c.textAlign = "left"; c.fillText("STORM TRACK", 16, 32);
            c.fillStyle = Math.floor(u / 15) % 2 ? disp("#e2543c") : "#6a2a20"; c.beginPath(); c.arc(W - 26, 22, 9, 0, 7); c.fill();
            const sc = 26, ox = W * 0.36, oy = H * 0.58;
            c.beginPath(); FL_PTS.forEach(([x, y], i) => (i ? c.lineTo(ox + x * sc, oy - y * sc) : c.moveTo(ox + x * sc, oy - y * sc))); c.closePath();
            c.fillStyle = disp("#7fc46a"); c.fill(); c.strokeStyle = "#ffffff"; c.lineWidth = 3; c.stroke();
            if (cone > 0) {
              const tx = ox + 3.0 * sc, ty = oy - 0.6 * sc, sx0 = W - 30, sy0 = H * 0.86, ex = sx0 + (tx - sx0) * cone, ey = sy0 + (ty - sy0) * cone;
              const nx = -(ey - sy0), ny = ex - sx0, L = Math.hypot(nx, ny) || 1;
              c.fillStyle = "rgba(255,255,255,.4)"; c.strokeStyle = "#ffffff"; c.lineWidth = 3;
              c.beginPath(); c.moveTo(sx0 + (nx / L) * 8, sy0 + (ny / L) * 8); c.lineTo(ex + (nx / L) * 50 * cone, ey + (ny / L) * 50 * cone); c.arc(ex, ey, 50 * cone, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI); c.lineTo(sx0 - (nx / L) * 8, sy0 - (ny / L) * 8); c.closePath(); c.fill(); c.stroke();
              for (let q = 0; q < 4; q++) { const kq = (q + 1) / 4 * cone; c.fillStyle = q === 3 ? disp("#e2543c") : "#ffffff"; c.beginPath(); c.arc(sx0 + (tx - sx0) * kq, sy0 + (ty - sy0) * kq, 8, 0, 7); c.fill(); }
            }
          }} />
        </group>
        <Move us={us} ls={ls} spec={cams[sub]} off={off} />
      </>;
      const hud = <>
        <LiveCounter f={u} label="DAYS IN FLORIDA" from={10} to={30} at={AC + 6} dur={20} />
      </>;
      return { world, hud };
    }
    case "rules": { // storm at Remy's house (darker but readable): porch light on, he walks to the door; RULEBOOK card
      const WS = C("Watch the sky", 74), NJ = C("not just the", 109), WT = C("When thunder roars", 158), GI = C("go indoors", 193);
      const x = k(u, 0, WT, 3.6, 0.0, Easing.out(Easing.quad)), z = k(u, WT, GI + 14, 1.6, -3.0, Easing.inOut(Easing.quad));
      const walking = u < WT - 6 || (u > WT && u < GI + 14);
      const fl = [40, 96, 150].some((a) => u >= a && u < a + 6) ? 1 : 0;
      const cams: CamSpec[] = [
        // CAM rules: TRACKING / TRUCK - slides along the front yard with Remy walking home in the storm
        { move: "truck", a: [[4.2, 2.5, 12.2], [3.4, 1.9, 0.4], 44], b: [[0.6, 2.5, 12.2], [0.1, 1.9, 0.4], 44] },
        // CAM rulesb: PUSH-IN - pushes in on the lit doorway as Remy goes inside
        { move: "push", a: [[0.3, 2.4, 11.4], [0, 2.0, -1.5], 44], b: [[0.1, 2.3, 8.0], [0, 2.1, -3.0], 42] },
      ];
      const world = <>
        <Sky storm={0.7} flash={fl * 0.8} fogNear={22} fogFar={120} />
        <Sun hero={[x, 0, z]} storm={0.55} flash={fl} />
        <DayGround base="#86b866" speck="#6a9e52" y={-0.05} />
        <Surface lit gain={1.0} p={[0, 0.02, -1.0]} s={[2.4, 9]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={disp("#d8cdb8")} b={disp("#cbbfa8")} unit={1.2} />
        <Box p={[0, 0.12, -3.0]} s={[9, 0.24, 2.0]} color={disp("#c9b9a0")} line={3} />
        <WallDoor lit gain={1.0} z={-4} W={14} kind="wood" a={disp("#d3ebfa")} b={disp("#c6e2f6")} door={{ x: 0, w: 2.2, h: 4.2 }} />
        <Box p={[0, 9.4, -4.2]} s={[15, 0.8, 1.4]} color={disp("#e9e2d6")} line={3} />
        <mesh position={[0, 2.2, -5.6]}><planeGeometry args={[2.8, 4.6]} /><meshBasicMaterial color={disp("#ffd796")} /></mesh>
        <Halo p={[0, 2.2, -4.6]} r={2.2} color={N3.amber} o={0.45} />
        {[-3.6, 3.6].map((wx) => <group key={wx}><Box p={[wx, 3.0, -3.94]} s={[1.8, 1.6, 0.08]} color={disp("#ffd796")} line={3} /><Halo p={[wx, 3.0, -3.7]} r={1.2} color={N3.amber} o={0.35} /></group>)}
        <Cyl p={[1.6, 4.7, -3.9]} rt={0.14} rb={0.2} h={0.3} color="#1b1f30" line={2} /><Halo p={[1.6, 4.5, -3.7]} r={0.7} color={N3.amber} o={0.9} />
        <Palm p={[6.6, 0, -2.6]} s={1.1} rot={0.8} lean={0.08} /><Palm p={[-6.8, 0, -3.2]} s={1.2} rot={2.0} lean={0.08} />
        {[[-4.6, -3.0, 1.0], [4.8, -3.1, 1.1]].map(([bx, bz, s], i) => <Bush key={i} p={[bx, 0, bz]} s={s} color="#4f9a44" />)}
        <StormCloud p={[-3, 10, -12]} s={2.6} dark={0.6} flash={fl} seed={3} /><StormCloud p={[5, 11, -14]} s={2.2} dark={0.6} flash={fl * 0.7} seed={6} />
        <Hero p={[x, 0, z]} look={REMY} pose={{ mood: u >= WT ? "worry" : "deadpan", walk: (x + z) * 2.4, speed: walking ? 1 : 0, arms: "down", lookX: -0.6, sweat: 0.3, nerv: fl ? 0.6 : 0.1, squash: fl ? -0.05 : 0 }} f={f} />
        <Rain p={[0, 3.5, 3.5]} s={[18, 10]} t={t} o={0.4} />
        <Move us={us} ls={ls} spec={cams[sub]} off={off} />
      </>;
      const cp = drawOn(u, 4, 14), r1 = drawOn(u, WS, 10), r2 = drawOn(u, NJ, 10);
      const slogan = u < WT - 2 ? arrive(u, NJ, 10) : 1 - arrive(u, WT - 2, 6); // gone before the voice says it (no double text)
      const tick2 = drawOn(u, WT + 2, 10);
      const hud = cp > 0 && <>
        <Card f={u} at={4} x={90} y={330} w={900} h={420} />
        <HudText f={u} x={540} y={410} size={54} color={GOLD} at={6} spacing={8}>RULEBOOK</HudText>
        {r1 > 0 && <g opacity={r1}>
          <path d="M 150 520 C 150 490 190 480 205 500 C 215 478 255 482 255 510 C 275 510 280 540 255 545 L 160 545 C 140 545 135 525 150 520 Z" fill="none" stroke={CREAM} strokeWidth={5} />
          <NeonPath d="M 196 556 L 186 580 L 204 580 L 192 606" w={4} color={AMBER} />
          <HudText f={u} x={300} y={540} size={48} color={CREAM} at={WS} anchor="start">CLOUDS FIRST</HudText>
          <NeonPath d="M 880 512 L 898 532 L 934 494" w={6} p={drawOn(u, WS + 8, 8)} color={GOLD} hot />
        </g>}
        {r2 > 0 && <g opacity={r2}>
          <path d="M 160 680 L 160 640 L 205 610 L 250 640 L 250 680 Z M 195 680 L 195 655 L 215 655 L 215 680" fill="none" stroke={CREAM} strokeWidth={5} strokeLinejoin="round" />
          {slogan > 0 && <g opacity={slogan}>
            <NeonText x={300} y={640} size={42} color={CREAM} anchor="start">WHEN THUNDER ROARS,</NeonText>
            <NeonText x={300} y={692} size={42} color={AMBER} anchor="start">GO INDOORS</NeonText>
          </g>}
          {tick2 > 0 && <NeonPath d="M 880 652 L 898 672 L 934 634" w={6} p={tick2} color={GOLD} hot />}
        </g>}
      </>;
      return { world, hud };
    }
    case "respawn": { // split world: GAME side (bright cyan grid, ghost Remy rises from a spawn ring) | REAL side (storm, bolt hits a palm)
      const YR = C("you respawn", 38), DC = C("doesn't care", 122);
      const rise = k(u, YR, YR + 18, -2.6, 0, EASE.arrive);
      const ring = k(u, YR - 6, YR + 6, 0, 1) * (1 - k(u, YR + 24, YR + 40, 0, 0.6));
      const strike = u >= DC && u < DC + 10 ? 1 - (u - DC) / 10 : 0;
      const cams: CamSpec[] = [
        // CAM respawn: LOW HERO ANGLE - low on the game grid looking up as ghost Remy rises from the spawn ring
        { move: "low", a: [[-2.4, 1.0, 12.4], [-1.6, 1.75, 1.2], 42], b: [[-2.1, 0.95, 11.4], [-1.6, 1.8, 1.2], 42] },
        // CAM respawnb: PULL BACK (reveal) - from real Remy under the umbrella back to the whole split: game vs real weather
        { move: "pull", a: [[2.0, 2.0, 7.4], [1.6, 1.5, 1.2], 40], b: [[0.3, 3.2, 15.5], [0.1, 2.1, 0.2], 46] },
      ];
      const world = <>
        <Sky storm={0.75} flash={strike} fogNear={24} fogFar={130} />
        <Sun hero={[0, 0, 1]} storm={0.6} flash={strike} />
        <DayGround base={DAY.sand} speck="#c99a62" y={-0.05} />
        <Sea z={-8} t={t} storm={0.75} />
        {/* game side: bright white grid floor + backdrop wall with cyan lines */}
        <Panel p={[-4.8, 0.03, -1]} s={[9.6, 14]} rot={[-Math.PI / 2, 0, 0]} px={[384, 560]} dep={1} draw={(c, W, H) => {
          c.fillStyle = "#eefbfd"; c.fillRect(0, 0, W, H); c.strokeStyle = disp("#38c7e0"); c.lineWidth = 3;
          for (let i = 0; i <= 12; i++) { c.beginPath(); c.moveTo((i * W) / 12, 0); c.lineTo((i * W) / 12, H); c.stroke(); } for (let i = 0; i <= 17; i++) { c.beginPath(); c.moveTo(0, (i * H) / 17); c.lineTo(W, (i * H) / 17); c.stroke(); }
        }} />
        <Panel p={[-4.8, 4, -7.9]} s={[9.6, 8]} px={[384, 320]} dep={1} draw={(c, W, H) => {
          const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#bff0fa"); g.addColorStop(1, "#effcfe"); c.fillStyle = g; c.fillRect(0, 0, W, H);
          c.strokeStyle = disp("#38c7e0"); c.lineWidth = 3; for (let i = 0; i <= 12; i++) { c.beginPath(); c.moveTo((i * W) / 12, 0); c.lineTo((i * W) / 12, H); c.stroke(); } for (let i = 0; i <= 10; i++) { c.beginPath(); c.moveTo(0, (i * H) / 10); c.lineTo(W, (i * H) / 10); c.stroke(); }
        }} />
        <NeonBar p={[0, 4, -1]} s={[0.08, 8, 0.08]} color={N3.gold} glow={0.3} />
        <mesh position={[-1.6, 0.06, 1.2]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.8, 1.0, 40]} /><meshBasicMaterial color={N3.cyan} toneMapped={false} transparent opacity={0.4 + 0.6 * ring} /></mesh>
        <Halo p={[-1.6, 0.6, 1.2]} r={1.8 + ring} color={N3.cyan} o={0.2 + 0.4 * ring} />
        <group position={[-3.0, 3.2 + 0.1 * Math.sin(t * 2), -2.6]} rotation={[0.4, t * 0.6, 0]}><Glb name="game_controller" s={1.6} line={2} /></group>
        <Hero p={[-1.6, rise, 1.2]} look={GHOST} pose={{ mood: "grin", arms: u >= YR + 18 ? "up" : "down", armK: 0.9 }} f={f} rim={N3.cyan} rimO={0.35} shadow={rise > -0.05} />
        {/* real side: storm beach */}
        <StormCloud p={[3.0, 7.2, -4]} s={1.5} dark={0.65} flash={strike} seed={6} />
        <Palm p={[3.8, 0, -2.6]} s={1.0} rot={1.8} lean={-0.08} />
        <Bolt p={[4.3, 4.6, -2.6]} top={8.0} o={strike} seed={3} />
        <Rain p={[4.0, 3.5, 2.5]} s={[9, 10]} t={t} o={0.45} />
        <Glb name="beach_umbrella" p={[1.9, 0, 0.4]} s={1.3} blob={1.2} />
        <Hero p={[1.8, 0, 1.2]} look={REMY} pose={{ mood: u >= DC ? "shock" : "worry", arms: "head", armK: 0.9, nerv: 0.6, sweat: 0.6, squash: strike > 0 ? -0.06 : 0, lookX: 0.5 }} f={f} />
        <Move us={us} ls={ls} spec={cams[sub]} off={off} />
      </>;
      const hud = <>
        {sub === 0 && <HudText f={u} x={540} y={640} size={66} color={CYAN} at={YR + 4}>+1 LIFE</HudText>}
        <Stamp f={u} x={540} y={600} text="NO RETRIES" at={DC} out={len + 6} size={56} color={CORAL} />
      </>;
      return { world, hud };
    }
    default: return { world: null };
  }
};

/** final question cards: letters + drawn icons only (the voice reads the options: no double text) */
const IconCards: React.FC<{ f: number; y: number; at: number; pick: number; pickAt: number }> = ({ f, y, at, pick, pickAt }) => {
  const cw = 226, gap = 18, x0 = 540 - (4 * cw + 3 * gap) / 2;
  const icon = (i: number, col: string) => {
    const s = { fill: "none", stroke: col, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (i === 0) return <g {...s}><path d="M -52 6 Q 0 -60 52 6 Z" /><path d="M 0 6 L 0 52 M -40 52 L 40 52" /></g>; // beach umbrella
    if (i === 1) return <g {...s}><path d="M -66 6 Q -40 -14 0 -12 L 34 -10 Q 50 -12 64 -2 L 64 6 L 30 8 Q -20 20 -66 6 Z" /><path d="M -34 12 L -40 28 M -6 14 L -10 30 M -40 -8 L -34 -18 L -26 -9 M -18 -11 L -12 -21 L -5 -12 M 4 -12 L 10 -22 L 16 -12" /><circle cx={36} cy={-14} r={5} fill={col} /></g>; // alligator
    if (i === 2) return <g {...s}><path d="M -36 -36 L 36 36 M 36 -36 L -36 36" /></g>; // never
    return <g {...s}><path d="M -44 50 L -44 0 L 0 -38 L 44 0 L 44 50 Z" /><path d="M -12 50 L -12 18 L 12 18 L 12 50" /></g>; // home
  };
  return <g>{[0, 1, 2, 3].map((i) => {
    const a = at + i * 3, p = drawOn(f, a, 10); if (p <= 0) return null;
    const hi = i === pick && f >= pickAt, col = hi ? CORAL : GOLD, cx = x0 + i * (cw + gap) + cw / 2;
    const s = hi ? 1 + 0.06 * arrive(f, pickAt, 10) : 1, x = -cw / 2, yy = -cw / 2, r = 24;
    return <g key={i} transform={`translate(${cx} ${y}) scale(${s})`}>
      <rect x={x} y={yy} width={cw} height={cw} rx={r} fill={hi ? "#3a1410" : "#0b0d1a"} opacity={0.62} />
      <NeonPath d={`M ${x + r} ${yy} L ${-x - r} ${yy} Q ${-x} ${yy} ${-x} ${yy + r} L ${-x} ${-yy - r} Q ${-x} ${-yy} ${-x - r} ${-yy} L ${x + r} ${-yy} Q ${x} ${-yy} ${x} ${-yy - r} L ${x} ${yy + r} Q ${x} ${yy} ${x + r} ${yy} Z`} p={p} w={4} color={col} />
      <g opacity={arrive(f, a + 3, 8)}>
        <NeonText x={0} y={-48} size={54} color={col}>{"ABCD"[i]}</NeonText>
        <g transform="translate(0 40) scale(0.9)">{icon(i, hi ? CORAL : CREAM)}</g>
      </g>
    </g>;
  })}</g>;
};

// ---------------------------------------------------------------- scene: one WebGL canvas per shot + SVG HUD on top
const renderDpr = () => Number((getInputProps() as { dpr?: number }).dpr ?? 0.5);
const cueLocal = (words: Word[], phrase: string, span: ShotSpan, fallback: number) => {
  try { return Math.round(cueTime(words, phrase, span.a / FPS - 0.3) * FPS) - span.a; } catch { return fallback; }
};
/** SHAPE MORPH (every place change): the outgoing key object squashes ~8 %, grows to fill the frame and floods with the
 *  next scene's background colour; the next shot eases in from 93 % to 100 % while the flood clears. No cross dissolve. */
type MorphProps = { cx: number; cy: number; w: number; h: number; r: number; color: string };
const MorphPres: React.FC<TransitionPresentationComponentProps<MorphProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps: m }) => {
  if (presentationDirection === "exiting") {
    const sq = p < 0.18 ? Math.sin((p / 0.18) * Math.PI) * 0.08 : 0;
    const g = Easing.in(Easing.cubic)(clamp((p - 0.18) / 0.42));
    const sc = 1 + g * (2600 / Math.min(m.w, m.h));
    const w = m.w * sc * (1 + sq), h = m.h * sc * (1 - sq);
    return <AbsoluteFill>{children}<div style={{ position: "absolute", left: m.cx - w / 2, top: m.cy - h / 2, width: w, height: h, borderRadius: m.r * sc, background: m.color, opacity: clamp(p / 0.12) }} /></AbsoluteFill>;
  }
  if (p < 0.6) return <AbsoluteFill style={{ opacity: 0 }}>{children}</AbsoluteFill>;
  const q = Easing.out(Easing.cubic)(clamp((p - 0.6) / 0.4));
  return <AbsoluteFill><AbsoluteFill style={{ transform: `scale(${0.93 + 0.07 * q})` }}>{children}</AbsoluteFill><AbsoluteFill style={{ background: m.color, opacity: 1 - q }} /></AbsoluteFill>;
};
const morph = (m: MorphProps): TransitionPresentation<MorphProps> => ({ component: MorphPres, props: m });
/** one shot = its own WebGL canvas + HUD; animation clock = the parent line (u), camera clock = this shot (us) */
const ShotView: React.FC<{ span: ShotSpan; pa: number; pb: number; words: Word[] }> = ({ span, pa, pb, words }) => {
  const us = useCurrentFrame();
  const f = span.a + us, u = f - pa, len = pb - pa, ls = span.b - span.a;
  const d = DEF[span.id];
  const parentSpan: ShotSpan = { id: d.parent, a: pa, b: pb, i: span.i };
  const v = build(d.parent, f, u, len, (p, fb) => cueLocal(words, p, parentSpan, fb), d.sub, us, ls);
  return (
    <AbsoluteFill style={{ background: BG[d.parent] }}>
      <ThreeCanvas width={1080} height={1920} dpr={renderDpr()} linear flat shadows="soft" gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }}>
        <color attach="background" args={[disp(DAY.skyHorizon)]} />
        <group>{v.world}</group>
        <ShadowSetup />
      </ThreeCanvas>
      <Grade t={f / FPS} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,14,30,.5) 0%, rgba(10,14,30,.38) 26%, rgba(10,14,30,.16) 40%, rgba(10,14,30,0) 50%)" }} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}><NeonDefs />{v.hud || null}</svg>
    </AbsoluteFill>
  );
};
/** the edit: hard cuts on the line changes, a 14-frame shape morph on every place change (the outgoing shot is
 *  extended by the transition length so every cut still lands on its narration cue) */
const Scene: React.FC<SceneProps> = ({ spans, words }) => {
  const parentOf = (id: string) => DEF[id].parent;
  const range = (p: string) => { const ss = spans.filter((x) => parentOf(x.id) === p); return [ss[0].a, ss[ss.length - 1].b]; };
  const out: React.ReactNode[] = [];
  spans.forEach((sp, i) => {
    const next = spans[i + 1];
    const tr = next && PLACE[DEF[next.id].parent] !== PLACE[DEF[sp.id].parent] ? morph({ ...(KEY_OBJ[sp.id] ?? KEY_CARD), color: BG[DEF[next.id].parent] }) : undefined;
    const [pa, pb] = range(parentOf(sp.id));
    out.push(<TransitionSeries.Sequence key={sp.id} durationInFrames={Math.max(1, sp.b - sp.a + (tr ? TR_FRAMES : 0))}>
      <ShotView span={sp} pa={pa} pb={pb} words={words} />
    </TransitionSeries.Sequence>);
    if (tr) out.push(<TransitionSeries.Transition key={sp.id + "-tr"} presentation={tr} timing={linearTiming({ durationInFrames: TR_FRAMES })} />);
  });
  return <AbsoluteFill style={{ background: BG.hook }}><TransitionSeries>{out}</TransitionSeries></AbsoluteFill>;
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "wi-gta-leonida",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: BG.hook,
};
export default story;
