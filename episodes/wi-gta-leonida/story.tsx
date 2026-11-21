// WHAT IF #2 "What If You Moved to the Real Leonida?" - Stick3D look (3D toon sets + bean-body stick puppets, library/stick3d)
// in the Golden Neon colours with the What-If HUD on top (library/whatif), built like What If #1 (wi-gta-nosleep): same
// REMY3D puppet + beanie, Blender .glb props (library/models: suitcase, palm_tree, beach_umbrella, sports_car, golf_flag,
// alligator, flat_tv, couch, game_controller), lit sets (key + fill + rim + motivated practicals: sun, TV glow, porch
// light, storm flashes), drop + blob shadows. EDIT (owner 2026-11-21, What If 1 note "no cuts, one long sequence"): every
// script line = 1-2 real SHOTS with their own framing (wide / medium / insert) and a short move INSIDE the shot; hard
// cuts on the line changes, 5 short @remotion/transitions on place changes; sub-shots share the parent's HUD clock. Florida set pieces: library/stick3d/leonida.tsx (real outline, never the
// game's map). Facts (RESEARCH.md): FWC ~1.3 million alligators in all 67 counties, serious injuries rare; Florida has
// the most lightning per km2 of any state and has led US lightning deaths for years (97 confirmed 2006-2025, NLSC/NWS);
// ~40% of US hurricane landfalls are in Florida; NWS slogan "When thunder roars, go indoors". "GTA 6" only as words.
// NO DOUBLE TEXT (owner rule): on-screen text only adds NEW info (numbers, labels, choices) and never shows the words the
// caption is saying at that moment (the NWS slogan is shown BEFORE it is spoken and fades out when the voice says it).
// Every beat is cue-driven (C(phrase, fallback)) so the picture follows words.json; fallbacks = rough timing.
// Layout: HUD text y 300-1350 (counter card 316-556 -> other text >= 620 in counter shots); figures stay above y 1430.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, getInputProps } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { ShotSpan, cueTime, FPS } from "../../src/engine/timeline";
import type { Word } from "../../src/captions/Captions";
import { EASE, arrive } from "../../src/engine25/motion";
import { NEON, NeonDefs, HudText, StrokeWord, LiveCounter, CompareBars, ChoiceCards, Stamp, NeonPath, NeonText, Digits, drawOn } from "../../library/whatif/kit";
import { Box, Cyl, Ball } from "../../library/stick3d/toon";
import { Person, V3, clamp, Grade } from "../../library/stick3d/kit";
import { REMY3D } from "../../src/tests/Stick3DTest";
import { Floor, WallDoor, SideWall, Shelf, Lamp, Rug, Shaft, Dust, Plant } from "../../library/stick3d/props";
import { Cam, Key, Building, StreetLamp } from "../../library/stick3d/extra";
import { Glb, useGlb } from "../../library/stick3d/glb";
import { INK } from "../../library/stick3d/toon";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { drawPuppet, Look, Pose } from "../../library/stick3d/puppet";
import { N3, FONT3, Halo, FloorPool, NeonBar, HeroLight, Motes, Panel, NeonSign, NeonClock, NightWindow } from "../../library/stick3d/neon";
import { FL_PTS, FloridaMap, SkyWall, StormCloud, Bolt, Water, Spiral, Tufts, Rain, COUNTY_DOTS } from "../../library/stick3d/leonida";
import scenes from "../../content/scripts/wi-gta-leonida.json";

// ---------------------------------------------------------------- cast
const REMY: Look = { ...REMY3D, beanie: "#2e3658", beanieBand: N3.gold, pom: N3.amber };
/** game-world Remy (respawn): cyan ghost colours (cyan = "not real" only) */
const GHOST: Look = { ...REMY, skin: "#bdf3ff", body: N3.cyan, beanie: "#2a6a80", beanieBand: "#dffaff", pom: "#dffaff", shoe: "#1b4a5a" };
const { gold: GOLD, coral: CORAL, amber: AMBER, text: CREAM, muted: MUTED, cyan: CYAN } = NEON;

// ---------------------------------------------------------------- shots (each script line = 1-2 shots; cues = narration words)
type Tr = "fade" | "slide" | "wipe";
type ShotDef = { id: string; cue: string; parent: string; sub: number; tr?: Tr };
const DEFS: ShotDef[] = [
  { id: "hook", cue: "What if you", parent: "hook", sub: 0 },
  { id: "hookb", cue: "So let's pack", parent: "hook", sub: 1 },
  { id: "miami", cue: "Day one. Remy", parent: "miami", sub: 0, tr: "slide" },
  { id: "miamib", cue: "The air feels", parent: "miami", sub: 1 },
  { id: "wish", cue: "He wants the", parent: "wish", sub: 0 },
  { id: "wishb", cue: "Swamps.", parent: "wish", sub: 1 },
  { id: "golf", cue: "Day three. A", parent: "golf", sub: 0 },
  { id: "golfb", cue: "Something is lying", parent: "golf", sub: 1 },
  { id: "gators", cue: "Florida has around", parent: "gators", sub: 0, tr: "wipe" },
  { id: "gatorsb", cue: "Wildlife officials say", parent: "gators", sub: 1 },
  { id: "twist", cue: "Scared? Here's the", parent: "twist", sub: 0 },
  { id: "twistb", cue: "Most gators avoid", parent: "twist", sub: 1 },
  { id: "above", cue: "The bigger danger", parent: "above", sub: 0 },
  { id: "sky", cue: "Day ten. Every", parent: "sky", sub: 0 },
  { id: "skyb", cue: "Sunshine at noon", parent: "sky", sub: 1 },
  { id: "strikes", cue: "Florida gets more", parent: "strikes", sub: 0 },
  { id: "deaths", cue: "and it has", parent: "deaths", sub: 0 },
  { id: "tv", cue: "Day thirty. A", parent: "tv", sub: 0, tr: "fade" },
  { id: "tvb", cue: "A cone appears", parent: "tv", sub: 1 },
  { id: "landfall", cue: "Roughly forty percent", parent: "landfall", sub: 0 },
  { id: "landfallb", cue: "make landfall in", parent: "landfall", sub: 1 },
  { id: "rules", cue: "So Remy learns", parent: "rules", sub: 0, tr: "slide" },
  { id: "rulesb", cue: "When thunder roars", parent: "rules", sub: 1 },
  { id: "respawn", cue: "In the game,", parent: "respawn", sub: 0 },
  { id: "respawnb", cue: "In real life,", parent: "respawn", sub: 1 },
  { id: "ask", cue: "Would you still", parent: "ask", sub: 0, tr: "fade" },
];
const DEF: Record<string, ShotDef> = Object.fromEntries(DEFS.map((d) => [d.id, d]));
const SHOTS = DEFS.map((d) => ({ id: d.id, cue: d.cue }));
const TR_FRAMES = 10;

// ---------------------------------------------------------------- helpers (same rig as What If #1)
const SG = 3.2; // exposure gain for lit walls/floors so sets read behind the characters
const k = (u: number, a: number, b: number, from: number, to: number, e = EASE.camera) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const pop = (u: number, at: number, d = 10) => interpolate(u, [at, at + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(2.2)) });
const ck = (u: number, pos: V3, look: V3, fov = 46, roll = 0): Key => ({ t: u / FPS, pos, look, fov, roll });
/** Camera: one short eased move INSIDE each shot (push / truck / slight arc); nothing carries across a cut.
 *  `cams[sub]` = [start pos, start look, end pos, end look, fov] for that shot's framing. */
type CamDef = [V3, V3, V3, V3, number];
const Shot: React.FC<{ off?: number; us: number; ls: number; sub: number; cams: CamDef[]; kicks?: number[]; impacts?: [number, number][]; roll?: number }> = ({ off = 0, us, ls, sub, cams, kicks = [], impacts = [], roll = 0.01 }) => {
  const [p0, l0, p1, l1, fov] = cams[Math.min(sub, cams.length - 1)];
  return <Cam t={us / FPS} keys={[ck(0, p0, l0, fov, roll), ck(Math.max(1, ls), p1, l1, fov, -roll)]} fovKick={kicks.filter((x) => x - off >= 0).map((x) => (x - off) / FPS)} impacts={impacts.map(([a, b]) => [(a - off) / FPS, b] as [number, number])} />;
};
/** Lighting rig: warm KEY (shadow caster) front-top-right of the hero, sky/ground FILL, RIM from behind, a soft pool over
 *  the hero, plus motivated practicals as point lights, and the pack's light shaft */
type Prac = [V3, string, number];
const Lights3: React.FC<{ warm?: string; k?: number; hero?: V3; prac?: Prac[]; rim?: string; heroI?: number; sky?: string; ground?: string; shaft?: boolean }> =
  ({ warm = "#ffd59a", k: kk = 1, hero = [0, 0, 0], prac = [], rim = N3.gold, heroI = 7, sky = "#9fb2e8", ground = "#5a3a22", shaft = true }) => (<>
  <ambientLight intensity={0.85 * kk} />
  <hemisphereLight args={[sky, ground, 1.0 * kk]} />
  <directionalLight position={[hero[0] + 6, hero[1] + 8, hero[2] + 4.5]} intensity={1.6 * kk} color={warm} castShadow
    shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.03} shadow-radius={4}
    shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-camera-near={0.5} shadow-camera-far={40}>
    <object3D attach="target" position={hero} />
  </directionalLight>
  <directionalLight position={[hero[0] - 3, hero[1] + 5, hero[2] - 8]} intensity={1.1} color={rim}><object3D attach="target" position={hero} /></directionalLight>
  <pointLight position={[hero[0], hero[1] + 3.4, hero[2] + 0.8]} intensity={heroI} distance={7} decay={2} color={N3.amber} />
  {prac.map(([pp, c, i], j) => <pointLight key={j} position={pp} intensity={i} distance={9} decay={2} color={c} />)}
  {shaft && <Shaft p={[0, 4, -1]} s={[3, 9]} color="245,185,66" o={0.12} />}
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
/** soft DROP SHADOW of a standing puppet: its silhouette laid on the floor, away from the key light */
const SH_YAW = Math.atan2(6, 4.5);
const DropShadow: React.FC<{ p: V3; h: number; look: Look; pose: Omit<Pose, "t">; f: number; o?: number }> = ({ p, h, look, pose, f, o = 0.62 }) => {
  const L = h * 0.94, W = h * 512 / 768;
  return <group position={[p[0], p[1] + 0.035, p[2]]} rotation={[0, SH_YAW, 0]}>
    <Panel p={[0, 0, -L / 2 + 0.06]} s={[W, L]} rot={[-Math.PI / 2, 0, 0]} px={[256, 384]} draw={(c, Wc, Hc) => {
      drawPuppet(c, Wc, Hc, look, { ...pose, t: f, sweat: 0 });
      c.globalCompositeOperation = "source-in";
      const g = c.createLinearGradient(0, Hc, 0, 0); g.addColorStop(0, `rgba(2,3,10,${o})`); g.addColorStop(1, `rgba(2,3,10,${o * 0.35})`);
      c.fillStyle = g; c.fillRect(0, 0, Wc, Hc); c.globalCompositeOperation = "source-over";
    }} />
  </group>;
};
/** puppet with a warm rim halo; standing puppets get the contact blob + drop shadow */
const Hero: React.FC<{ p: V3; look: Look; pose: Omit<Pose, "t">; f: number; h?: number; rim?: string; shadow?: boolean; rimO?: number; ground?: number }> = ({ p, look, pose, f, h = 2.5, rim = N3.amber, shadow = true, rimO = 0.35, ground = 0 }) => (<>
  <Halo p={[p[0], p[1] + h * 0.62, p[2] - 0.25]} r={h * 0.72} color={rim} o={rimO} />
  {shadow && p[1] - ground < 0.6 && p[1] - ground > -0.2 ? <DropShadow p={[p[0], ground, p[2]]} h={h} look={look} pose={pose} f={f} /> : null}
  <Person p={p} h={h} look={look} pose={pose} f={f} shadow={shadow && p[1] - ground > -0.2} sy={ground + 0.01} />
</>);
/** the Blender couch WITHOUT its coral pillow (it read as a loose red box in this episode's framings); same toon look as Glb */
const toonRamp = (() => { const d = new Uint8Array([90, 170, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const CouchNoPillow: React.FC<{ p: V3 }> = ({ p }) => {
  const src = useGlb("couch");
  const { size } = useThree();
  const obj = React.useMemo(() => {
    if (!src) return null;
    const root = src.clone(true);
    const drop: THREE.Object3D[] = [];
    root.traverse((o) => { if (o.name.toLowerCase().startsWith("pillow")) drop.push(o); });
    drop.forEach((o) => o.parent?.remove(o));
    const lm = new LineMaterial({ color: new THREE.Color(INK).getHex(), linewidth: 3, resolution: new THREE.Vector2(size.width, size.height) });
    const meshes: THREE.Mesh[] = [];
    root.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
    for (const m of meshes) {
      const old = m.material as THREE.MeshStandardMaterial;
      const em = old.emissive && (old.emissive.r + old.emissive.g + old.emissive.b) > 0.01;
      m.material = em ? new THREE.MeshBasicMaterial({ color: old.emissive.clone(), toneMapped: false }) : new THREE.MeshToonMaterial({ color: old.color ?? new THREE.Color("#888"), gradientMap: toonRamp });
      const eg = new LineSegmentsGeometry(); eg.setPositions(new THREE.EdgesGeometry(m.geometry, 35).attributes.position.array as Float32Array);
      m.add(new LineSegments2(eg, lm));
    }
    return root;
  }, [src, size]);
  return <>{obj ? <primitive object={obj} position={p} /> : <Box p={[p[0], 0.45, p[2]]} s={[4.8, 0.9, 1.5]} color={N3.navy2} />}</>;
};
/** rolling suitcase (Blender) pulled at Remy's right hand */
const Suitcase: React.FC<{ p: V3; tilt?: number; s?: number }> = ({ p, tilt = 0, s = 0.72 }) => (
  <group position={p} rotation={[0, 0, tilt]}>
    <Glb name="suitcase" s={s} blob={0.45} fallback={<><Box p={[0, 0.4, 0]} s={[0.52, 0.66, 0.26]} color={N3.coral} line={3} /><Box p={[0, 0.98, 0.08]} s={[0.34, 0.05, 0.05]} color="#1c2032" line={2} /></>} />
  </group>
);
const Palm: React.FC<{ p: V3; s?: number; rot?: number }> = ({ p, s = 1, rot = 0 }) => (
  <Glb name="palm_tree" p={p} s={s} rot={[0, rot, 0]} blob={0.6 * s} fallback={<group position={p} scale={[s, s, s]}><Cyl p={[0, 2.4, 0]} rt={0.16} rb={0.22} h={4.8} color="#7a5a36" line={2} /><Ball p={[0, 4.9, 0]} r={0.9} color="#2f9e5a" s={[1.6, 0.5, 1.6]} /></group>} />
);
const Gator: React.FC<{ p: V3; yaw?: number; lift?: number; s?: number; eyes?: number }> = ({ p, yaw = 0, lift = 0, s = 1, eyes = 0 }) => (
  <group position={p} rotation={[0, yaw, 0]} scale={[s, s, s]}>
    <group rotation={[0, 0, lift * 0.14]}>
      <Glb name="alligator" blob={1.2} fallback={<><Box p={[0, 0.25, 0]} s={[3.2, 0.4, 0.75]} color="#4c6b34" line={3} /><Box p={[1.8, 0.22, 0]} s={[0.8, 0.2, 0.4]} color="#4c6b34" line={3} /></>} />
      {eyes > 0 && [-1, 1].map((q) => <Halo key={q} p={[1.5, 0.47, q * 0.19]} r={0.22} color={N3.amber} o={eyes} />)}
    </group>
  </group>
);

// ---------------------------------------------------------------- sets
/** Remy's apartment (before the move + day 30): navy brick, gold/coral neon, night window with palms, wall map of Florida */
const MapPoster: React.FC<{ p: V3; s: [number, number]; mode: number; draw: number }> = ({ p, s, mode, draw }) => (
  <group position={p}>
    <Box p={[0, 0, -0.05]} s={[s[0] + 0.16, s[1] + 0.16, 0.06]} color="#1d2236" line={3} />
    <Panel p={[0, 0, 0]} s={s} px={[Math.round(s[0] * 110), Math.round(s[1] * 110)]} dep={`${mode.toFixed(2)}|${Math.round(draw * 40)}`} draw={(c, W, H) => {
      c.fillStyle = "#0a0d18"; c.fillRect(0, 0, W, H);
      c.strokeStyle = "rgba(245,185,66,.14)"; c.lineWidth = 1; for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo((W * i) / 8, 0); c.lineTo((W * i) / 8, H); c.moveTo(0, (H * i) / 8); c.lineTo(W, (H * i) / 8); c.stroke(); }
      const sc = Math.min(W / 7.4, H / 6.4), ox = W / 2 + 0.3 * sc, oy = H / 2 + 0.3 * sc;
      const n = Math.max(2, Math.round(FL_PTS.length * draw));
      const path = () => { c.beginPath(); FL_PTS.slice(0, n).forEach(([x, y], i) => (i ? c.lineTo(ox + x * sc, oy - y * sc) : c.moveTo(ox + x * sc, oy - y * sc))); if (n >= FL_PTS.length) c.closePath(); };
      if (mode > 0.5 && draw >= 1) { path(); c.fillStyle = "rgba(245,185,66,.18)"; c.fill(); }
      const col = mode > 0.5 ? N3.gold : N3.cyan; c.strokeStyle = col; c.shadowColor = col; c.shadowBlur = 12; c.lineWidth = 6; c.lineJoin = "round";
      c.setLineDash(mode > 0.5 ? [] : [14, 12]); path(); c.stroke(); c.setLineDash([]); c.shadowBlur = 0;
      if (mode > 0.5 && draw >= 1) { c.fillStyle = N3.coral; c.beginPath(); c.arc(ox + 3.0 * sc, oy + 2.45 * sc, 9, 0, 7); c.fill(); }
    }} />
  </group>
);
const HomeRoom: React.FC<{ t: number; hero?: V3; tvGlow?: number; map?: number; mapDraw?: number; couch?: boolean }> = ({ t, hero = [0, 0, 0], tvGlow = 0, map = 0, mapDraw = 1, couch = true }) => (<>
  <Lights3 k={1.25} heroI={9} hero={hero} prac={[[[0, 3.2, 4.5], "#ffd59a", 10], [[6.8, 2.6, -3.0], N3.amber, 14], [[3.6, 3.9, -4.2], "#7d8fd8", 6], [[0, 5.9, -4.3], N3.gold, 8], [[-5.8, 3.0, -4.3], N3.coral, 6], [[3.4, 2.2, 2.4], "#cfe6ff", 16 * tvGlow]]} />
  <Floor lit gain={SG} kind="plank" a="#3a2c22" b="#33261c" w={30} d={44} />
  <WallDoor lit gain={SG} z={-5} W={24} kind="brick" a="#2b3252" b="#232945" />
  <SideWall lit gain={SG} x={-9} kind="plain" a="#20263c" b="#20263c" />
  <NeonBar p={[0, 6.3, -4.9]} s={[15, 0.07, 0.05]} color={N3.gold} />
  <NeonBar p={[-6.4, 3.2, -4.9]} s={[0.07, 5.2, 0.05]} color={N3.coral} glow={0.4} />
  <NightWindow p={[3.6, 3.9, -4.92]} s={[3.0, 2.4]} palm seed={5} />
  <MapPoster p={[-2.9, 3.6, -4.92]} s={[2.8, 2.4]} mode={map} draw={mapDraw} />
  <Halo p={[-2.9, 3.6, -4.6]} r={2.2} color={map > 0.5 ? N3.gold : N3.cyan} o={0.12} />
  <Shelf p={[-7.3, 0, -4.4]} w={2.4} rows={4} wood="#24180e" cols={[N3.gold, "#2a3355", N3.coral, "#1d2236", N3.amber, "#3a2c52"]} />
  <Lamp p={[6.8, 0, -3.4]} color={N3.amber} /><Halo p={[6.8, 2.75, -3.4]} r={1.0} color={N3.amber} o={0.7} />
  <Plant p={[-5.4, 0, -3.6]} pot={N3.coral} />
  <Rug p={[0, 0, 0.6]} s={[7.5, 4.4]} a="#120d09" b={N3.gold} />
  {couch && <CouchNoPillow p={[0, 0, -1.3]} />}
  <Motes t={t} n={10} c={[0, 0.5, -1]} area={[5, 5, 3]} />
  <Dust t={t} area={[10, 6, 6]} color="rgba(245,185,66,.9)" />
</>);
/** outdoor day light (hazy golden sun as key, sky fill); storm 0..1 cools and dims it; flash adds a blue-white burst */
const SunLights: React.FC<{ hero: V3; storm?: number; flash?: number; prac?: Prac[]; dusk?: number }> = ({ hero, storm = 0, flash = 0, prac = [], dusk = 0 }) => {
  const warm = new THREE.Color("#ffd59a").lerp(new THREE.Color("#ff9a6a"), dusk).lerp(new THREE.Color("#9aa8d8"), storm).getStyle();
  return <>
    <Lights3 warm={warm} k={1.12 - 0.4 * storm} hero={hero} sky={storm > 0.5 ? "#7d8ab8" : "#ffd9a8"} ground={storm > 0.5 ? "#2a2e40" : "#6a5a3a"} prac={[...prac, [[hero[0] + 2, hero[1] + 9, hero[2] + 3], "#dfe8ff", 60 * flash]]} shaft={false} />
  </>;
};

// ---------------------------------------------------------------- shot builder
type View = { world: React.ReactNode; hud?: React.ReactNode; black?: number; dim?: number };
const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number, hide: boolean, sub = 0, us = u, ls = len): View => {
  const t = f / FPS;
  switch (id) {
    case "hook": { // Remy at home under a wall map: the cyan dashed (made-up) outline turns solid gold (real); suitcase rolls in
      const GT = C("GTA 6's map", 96), MU = C("made up", 149), PB = C("pack a bag", 209), TR = C("try the real", 251);
      const real = u >= TR ? 1 : 0;
      const sx = k(u, PB - 4, PB + 18, 3.2, 0.75, EASE.arrive);
      const hx = sub ? 690 : 540; // medium shot: Remy sits left, labels move right
      const world = <>
        <HomeRoom t={t} hero={[-0.6, 0, 1.4]} map={real} mapDraw={k(u, 0, 40, 0.05, 1, EASE.arrive)} couch />
        <Hero p={[-0.6, 0, 1.4]} look={REMY} pose={{ mood: u >= TR ? "grin" : u >= MU ? "smile" : "deadpan", arms: u >= TR ? "up" : u >= MU ? "point" : "down", armK: u >= TR ? 0.9 : 0.8, lookX: u >= PB && u < TR ? 0.8 : -0.4, flip: u >= MU && u < PB }} f={f} rimO={0.45} />
        {u >= PB - 4 && <Suitcase p={[sx, 0, 1.55]} tilt={u < PB + 18 ? -0.15 : 0} />}
        <HeroLight p={[-0.6, 0, 1.4]} h={6.2} r={1.4} t={t} />
        <Shot off={u - us} us={us} ls={ls} sub={sub} kicks={[TR]} cams={[[[0.6, 3.0, 13.0], [-0.9, 1.75, 0.2], [-0.2, 2.95, 12.4], [-1.0, 1.75, 0.2], 46], [[3.8, 1.5, 10.8], [0.25, 1.6, 1.4], [3.3, 1.5, 10.2], [0.15, 1.55, 1.4], 44]]} />
      </>;
      const hud = !hide && <>
        <StrokeWord text="WHAT IF" x={hx} y={430} h={112} p={k(u, GT, GT + 34, 0, 1, EASE.arrive)} />
        <HudText f={u} x={hx} y={625} size={40} color={MUTED} enter="rise" at={GT + 10} out={len - 6} spacing={10}>EPISODE 2</HudText>
        <HudText f={u} x={hx} y={725} size={58} color={CYAN} enter="rise" at={MU} out={TR - 4}>LEONIDA: FICTIONAL</HudText>
        <HudText f={u} x={hx} y={725} size={62} color={GOLD} enter="scale" at={TR} out={len - 6}>FLORIDA, USA</HudText>
        <Stamp f={u} x={hx} y={830} text="ONE-WAY TICKET" at={PB} out={len - 6} size={50} rot={-3} color={CORAL} />
      </>;
      return { world, hud };
    }
    case "miami": { // hazy Miami street outside ARRIVALS: Remy rolls his suitcase in, the heat hits, sweat; HUMIDITY meter fills
      const RL = C("Remy lands", 32), AIR = C("The air", 82), TW = C("warm, wet towel", 134);
      const x = k(u, 0, Math.min(len, 120), -3.2, 0.2, Easing.linear);
      const walking = u < 120;
      const heat = k(u, AIR, TW + 20, 0, 1);
      const world = <>
        <SunLights hero={[x, 0, 1.2]} prac={[[[-6, 3.6, -1.6], N3.gold, 10], [[3.8, 4.8, -1.2], N3.amber, 6]]} />
        <SkyWall sun={[0.68, 0.26]} haze={1} />
        <Floor lit gain={SG} kind="tile" a="#4a4048" b="#433a42" w={40} d={44} unit={2.6} />
        <Box p={[0, 0.08, -2.6]} s={[40, 0.16, 3.2]} color="#7a6a5e" line={2} />
        {Array.from({ length: 8 }, (_, i) => <Box key={i} p={[-14 + i * 4, 0.012, 4.2]} s={[1.6, 0.02, 0.16]} color="#e9d9a8" line={0} />)}
        <Building p={[-9.5, 0, -10]} s={[5, 9, 3]} color="#f0b89a" seed={3} lit={0.25} trim={N3.coral} />
        <Building p={[-3.2, 0, -12]} s={[5.5, 12, 3]} color="#9ad4cf" seed={5} lit={0.2} trim="#2b6a70" />
        <Building p={[3.6, 0, -11]} s={[5, 8, 3]} color="#f5d38a" seed={7} lit={0.2} trim={N3.coral} />
        <Building p={[9.8, 0, -10]} s={[4.5, 10.5, 3]} color="#e59a8a" seed={9} lit={0.25} trim="#7a2f26" />
        {/* airport arrivals hall on the left */}
        <Box p={[-7.4, 2.4, -1.2]} s={[5.2, 4.8, 1.0]} color="#d8d2c4" line={3} />
        <Box p={[-6.4, 1.5, -0.68]} s={[2.4, 3.0, 0.06]} color="#2b3a52" line={3} />
        <NeonSign p={[-7.0, 4.15, -0.62]} s={[3.6, 0.8]} text="ARRIVALS" color={N3.gold} box />
        <Palm p={[-3.4, 0, -3.2]} s={1.0} rot={0.4} /><Palm p={[4.2, 0, -3.6]} s={1.1} rot={2.2} /><Palm p={[8.4, 0, -2.8]} s={0.95} rot={1.0} />
        <StreetLamp p={[1.6, 0, -2.2]} on={0.4} />
        <Hero p={[x, 0, 1.2]} look={REMY} pose={{ mood: heat > 0.5 ? "gulp" : "smile", walk: x * 2.4, speed: walking ? 1 : 0, sweat: 0.2 + 0.8 * heat, nerv: 0.3 * heat, armR: [0.33, 0.42], armRK: 1, tilt: walking ? 0 : 0.03 * Math.sin(f * 0.15) }} f={f} rimO={0.35} />
        <Suitcase p={[x + 0.82, 0, 1.3]} tilt={walking ? -0.22 : 0} />
        <FloorPool p={[x, 0, 1.2]} r={1.6} color={N3.amber} o={0.3} />
        <Halo p={[0, 1.2, -1]} r={7} color={N3.amber} o={0.1 + 0.12 * heat} />
        <Motes t={t} n={22} c={[0, 0.3, 0]} area={[7, 5, 3]} color={N3.amber} />
        <Shot off={u - us} us={us} ls={ls} sub={sub} cams={[[[-1.6, 3.0, 12.4], [-2.0, 1.8, 0.4], [-0.9, 2.95, 12.0], [-1.3, 1.8, 0.4], 46], [[-1.4, 1.6, 9.4], [-0.75, 1.3, 1.2], [-1.0, 1.6, 8.9], [-0.55, 1.28, 1.2], 42]]} />
      </>;
      const hp = drawOn(u, AIR, 14), fill = k(u, AIR + 6, TW + 10, 0, 0.94, EASE.arrive);
      const hud = !hide && <>
        <LiveCounter f={u} label="DAYS IN FLORIDA" from={0} to={1} at={RL + 6} dur={14} />
        {hp > 0 && <g opacity={hp}>
          <HudText f={u} x={70} y={690} size={42} color={MUTED} enter="rise" at={AIR} anchor="start" spacing={6}>HUMIDITY</HudText>
          <rect x={70} y={712} width={430} height={64} rx={14} fill="#000" opacity={0.5} />
          <NeonPath d="M 70 712 L 500 712 L 500 776 L 70 776 Z" w={2.5} p={hp} color={NEON.dim} glow={0.4} />
          <rect x={76} y={718} width={Math.max(0, 418 * fill)} height={52} rx={10} fill={fill > 0.8 ? CORAL : AMBER} opacity={0.55} />
          {fill > 0.85 && <g transform={`translate(${76 + 418 * fill - 30} 744)`}><path d="M 0 -22 C 14 -4 16 6 0 18 C -16 6 -14 -4 0 -22 Z" fill={N3.cyan} opacity={0.9} /></g>}
        </g>}
      </>;
      return { world, hud };
    }
    case "wish": { // three lit dioramas pop on their words: swamp, beach, fast car; Remy points from one to the next
      const SW = C("Swamps.", 74), BE = C("Beaches.", 92), FC = C("Fast cars.", 110);
      const on = [SW, BE, FC].map((c) => (u >= c ? 1 : 0));
      const sel = u >= FC ? 2 : u >= BE ? 1 : u >= SW ? 0 : -1;
      const P: V3[] = [[-3.8, 0, -1.0], [0, 0, -2.0], [3.8, 0, -1.0]];
      const world = <>
        <Lights3 k={0.95} hero={[0, 0, 3.0]} prac={P.map((p, i) => [[p[0], 3.2, p[2] + 1.2], [N3.amber, N3.gold, N3.cyan][i], on[i] ? 16 : 2] as Prac)} />
        <Floor lit gain={SG} kind="tile" a="#252b44" b="#20253c" w={30} d={44} />
        <WallDoor lit gain={SG} z={-5} W={26} kind="plain" a="#262c48" b="#262c48" />
        <NeonBar p={[0, 6.0, -4.9]} s={[16, 0.07, 0.05]} color={N3.gold} />
        {P.map((p, i) => <group key={i}>
          <Cyl p={[p[0], 0.22, p[2]]} rt={1.75} h={0.44} color="#1b2238" />
          <Halo p={[p[0], 0.7, p[2]]} r={1.7} color={N3.gold} o={on[i] ? 0 : 0.4} />
          <NeonBar p={[p[0], 0.46, p[2] + 1.74]} s={[1.2, 0.04, 0.04]} color={on[i] ? [N3.amber, N3.gold, N3.cyan][i] : "#3a3020"} glow={on[i] ? 0.5 : 0} />
          {on[i] ? <HeroLight p={[p[0], 0.44, p[2]]} h={5.2} r={1.6} t={t + i} color={[N3.amber, N3.gold, N3.cyan][i]} o={0.8} /> : null}
        </group>)}
        {/* swamp: dark water, reeds, two cypress, a gator peeking */}
        <group position={[P[0][0], 0.45, P[0][2]]} scale={pop(u, SW, 12) * 0.999 + 0.001}>
          <Water p={[0, 0, 0]} s={[3.2, 3.2]} t={t} color="#4f6a3a" deep="#22381e" round />
          <Tufts c={[0, 0, 0]} area={[3.0, 3.0]} n={14} color="#5a8a44" seed={4} />
          {[[-0.9, -0.6], [0.8, -0.9]].map(([x, z], j) => <group key={j}><Cyl p={[x, 0.8, z]} rt={0.1} rb={0.2} h={1.6} color="#5e4329" line={2} /><Ball p={[x, 1.8, z]} r={0.55} color="#3f7a3c" s={[1.3, 0.8, 1.3]} /></group>)}
          <Gator p={[0.2, -0.05, 0.6]} yaw={0.4} s={0.42} />
        </group>
        <group position={[P[1][0], 0.45, P[1][2]]} scale={pop(u, BE, 12) * 0.999 + 0.001}>
          <Cyl p={[0, 0.02, 0]} rt={1.7} h={0.06} color="#d9b27a" line={2} />
          <Water p={[0, 0.04, -0.9]} s={[3.0, 1.2]} t={t} color="#3fa6c0" deep="#1d6a8a" />
          <Glb name="beach_umbrella" p={[-0.4, 0.05, 0.1]} s={0.62} fallback={<Cyl p={[-0.4, 1.4, 0.1]} rt={0.05} rb={0.8} h={0.4} color={N3.coral} line={2} />} />
          <Palm p={[0.9, 0.05, -0.4]} s={0.42} rot={1.2} />
        </group>
        <group position={[P[2][0], 0.45, P[2][2]]} scale={pop(u, FC, 12) * 0.999 + 0.001}>
          <Cyl p={[0, 0.02, 0]} rt={1.7} h={0.06} color="#2a2d3a" line={2} />
          <group rotation={[0, -0.45 + 0.15 * Math.sin(t * 0.8), 0]}><Glb name="sports_car" s={0.82} p={[0, 0.05, 0]} blob={1.0} fallback={<Box p={[0, 0.35, 0]} s={[2.3, 0.5, 1.0]} color={N3.gold} line={3} />} /></group>
        </group>
        <Hero p={[0, 0, 3.0]} look={REMY} pose={{ mood: sel >= 0 ? "grin" : "smile", arms: sel >= 0 ? "point" : "chest", armK: 0.9, flip: sel === 0, lookX: sel < 0 ? 0 : [-1, 0, 1][sel], squash: sel >= 0 ? -0.05 * Math.max(0, 1 - (u - [SW, BE, FC][sel]) / 8) : 0 }} f={f} rimO={0.45} />
        <HeroLight p={[0, 0, 3.0]} h={6} r={1.2} t={t} />
        <Motes t={t} c={[0, 0.5, 0]} area={[6, 4, 2]} />
        <Shot off={u - us} us={us} ls={ls} sub={sub} cams={[[[1.0, 5.9, 14.6], [0.1, 1.2, 0.0], [0.4, 5.7, 13.9], [0.0, 1.2, 0.0], 46], [[5.6, 2.4, 9.8], [-0.4, 1.3, -0.8], [5.0, 2.3, 9.2], [-0.6, 1.3, -0.8], 44]]} />
      </>;
      const hud = !hide && <>
        <HudText f={u} x={540} y={400} size={58} color={GOLD} enter="rise" at={2} out={len - 6} spacing={4}>THE WISHLIST</HudText>
        {[0, 1, 2].map((i) => {
          const x = 300 + i * 240, cp = drawOn(u, 4 + i * 3, 10), tk = drawOn(u, [SW, BE, FC][i], 8);
          return <g key={i}>
            <NeonPath d={`M ${x - 40} 480 L ${x + 40} 480 L ${x + 40} 560 L ${x - 40} 560 Z`} w={3} p={cp} color={NEON.dim} />
            {tk > 0 && <NeonPath d={`M ${x - 24} 520 L ${x - 6} 540 L ${x + 30} 494`} w={6} p={tk} color={[AMBER, GOLD, CYAN][i]} hot />}
          </g>;
        })}
      </>;
      return { world, hud };
    }
    case "golf":
    case "twist":
    case "above": { // golf course by a pond. golf: a "log" opens its eyes; twist: the gator turns away into the pond; above: tilt up to a storm
      const G = id === "golf", T = id === "twist", A = id === "above";
      const GC = G ? C("A golf course", 32) : 0, SL = G ? C("Something is lying", 71) : 0, NL = G ? C("It's not", 153) : 0;
      const SC = T ? C("Scared? Here's", 4) : 0, MG = T ? C("Most gators", 121) : 0;
      const eyes = G ? k(u, NL - 2, NL + 8, 0, 1) : T ? k(u, MG, MG + 30, 1, 0.2) : 0.2;
      const lift = G ? k(u, NL, NL + 10, 0, 1, EASE.arrive) : T ? k(u, MG + 10, MG + 30, 1, 0) : 0;
      const yaw = T ? k(u, MG - 4, MG + 26, Math.PI, Math.PI * 1.75, EASE.arrive) : A ? Math.PI * 1.75 : Math.PI;
      const gp: V3 = T ? [k(u, MG + 18, len, 1.6, 3.0, Easing.linear), k(u, MG + 30, len, 0, -0.28, Easing.linear), k(u, MG + 18, len, 0.8, -0.7, Easing.linear)] : A ? [3.2, -0.32, -0.9] : [1.6, 0, 0.8];
      const rx = G ? k(u, 0, SL, -3.4, -1.8, Easing.linear) : -1.8;
      const jump = G && u >= NL ? Math.max(0, Math.sin(((u - NL) / 14) * Math.PI)) * (u - NL < 14 ? 1 : 0) : 0;
      const back = G ? k(u, NL, NL + 14, 0, -0.5, EASE.arrive) : -0.5;
      const storm = A ? k(u, 0, len, 0.05, 0.35) : 0;
      const mood: Pose["mood"] = G ? (u >= NL ? "shock" : u >= SL ? "worry" : "smile") : T ? (u >= MG + 10 ? "smile" : "worry") : "worry";
      const world = <>
        <SunLights hero={[rx, 0, 1.2]} storm={storm} prac={[[[1.8, 1.2, 2.0], N3.amber, 6], [[-6, 4, -3], N3.gold, 6]]} />
        <SkyWall sun={[0.7, 0.24]} storm={storm} haze={0.8} />
        <Floor lit gain={SG} kind="carpet" a="#3f6e38" b="#3a6634" w={50} d={50} unit={3} />
        <mesh position={[-2.8, 0.012, -3.2]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2.4, 40]} /><meshLambertMaterial color={new THREE.Color("#5f9a4a").multiplyScalar(2.2)} /></mesh>
        <mesh position={[5.4, 0.012, 1.4]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 1, 1]}><circleGeometry args={[1.3, 30]} /><meshLambertMaterial color={new THREE.Color("#d9c08a").multiplyScalar(2.0)} /></mesh>
        <Water p={[2.4, 0, -0.9]} s={[6.2, 3.8]} t={t} color="#4a8fa0" deep="#1f4a5e" round />
        <Tufts c={[2.4, 0, -0.9]} area={[7.4, 5]} n={26} seed={3} />
        <Glb name="golf_flag" p={[-2.8, 0, -3.2]} blob={0.3} fallback={<><Cyl p={[-2.8, 1.2, -3.2]} rt={0.03} h={2.4} color="#fffaf0" line={1} /><Box p={[-2.4, 2.1, -3.2]} s={[0.75, 0.48, 0.03]} color={N3.coral} line={2} /></>} />
        <Palm p={[-7.2, 0, -6]} s={1.15} rot={0.3} /><Palm p={[7.4, 0, -5]} s={1.0} rot={2.0} /><Palm p={[4.2, 0, -8.5]} s={1.25} rot={1.2} />
        {[[-10, -9, 5], [0, -11, 8], [10, -9.5, 6]].map(([x, z, w], i) => <Box key={i} p={[x, 0.8, z]} s={[w, 1.6, 1.4]} color="#4f8a46" line={3} />)}
        <Gator p={gp} yaw={yaw} lift={lift} eyes={eyes} />
        {G && u >= SL && u < NL + 30 && <Panel p={[gp[0] + 0.3, 0.9, gp[2] + 0.3]} s={[3.6, 3.6]} px={[256, 256]} additive face o={k(u, SL, SL + 8, 0, 0.9) * (u > NL + 20 ? k(u, NL + 20, NL + 30, 1, 0) : 1)} dep={Math.floor(u / 3)} draw={(c, W) => {
          const m = W / 2; c.strokeStyle = N3.coral; c.shadowColor = N3.coral; c.shadowBlur = 12; c.lineWidth = 6; c.setLineDash([18, 12]); c.lineDashOffset = -u * 2;
          c.beginPath(); c.arc(m, m, W * 0.42, 0, 7); c.stroke(); c.setLineDash([]);
          for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2; c.beginPath(); c.moveTo(m + Math.cos(a) * W * 0.36, m + Math.sin(a) * W * 0.36); c.lineTo(m + Math.cos(a) * W * 0.48, m + Math.sin(a) * W * 0.48); c.stroke(); }
          if (u < NL) { c.fillStyle = N3.coral; c.font = `900 70px ${FONT3}`; c.textAlign = "center"; c.fillText("?", m, m - W * 0.18); }
        }} />}
        {A && <StormCloud p={[0.5, 9.2, -7]} s={2.2} dark={k(u, 0, len, 0.2, 0.85)} flash={u > len - 22 ? Math.max(0, 1 - (u - (len - 22)) / 6) : 0} />}
        {A && <StormCloud p={[-4.5, 8.4, -9]} s={1.6} dark={k(u, 0, len, 0.2, 0.85)} seed={3} />}
        {A && <pointLight position={[0, 5, -3]} intensity={30} distance={14} decay={1.5} color="#ffe2b0" />}
        <Hero p={[rx + back, 0.35 * jump, 1.2]} look={REMY} pose={{ mood, walk: rx * 2.4, speed: G && u < SL ? 1 : 0, arms: G && u >= NL ? "up" : T && u < MG + 10 ? "chest" : A ? "down" : "down", armK: 0.9, squash: -0.07 * jump, nerv: (G && u >= SL) || (T && u < MG + 10) ? 0.6 : A ? 0.3 : 0, sweat: G && u >= NL ? 0.8 : T && u < MG ? 0.5 : 0.3, lookX: A ? 0 : 0.8, tilt: A ? -0.08 : 0 }} f={f} rimO={0.4} />
        <Motes t={t} c={[0, 0.3, 0]} area={[6, 4, 3]} />
        {G && <Shot off={u - us} us={us} ls={ls} sub={sub} cams={[[[-0.2, 3.4, 13.6], [-0.6, 1.95, 0.2], [-0.7, 3.3, 13.0], [-0.6, 1.9, 0.2], 46], [[2.2, 1.5, 7.4], [0.0, 0.7, 0.8], [1.8, 1.4, 6.9], [-0.1, 0.7, 0.8], 44]]} />}
        {T && <Shot off={u - us} us={us} ls={ls} sub={sub} cams={[[[-3.8, 1.8, 9.6], [-1.75, 1.4, 1.2], [-3.3, 1.8, 9.1], [-1.8, 1.32, 1.2], 42], [[4.2, 3.8, 11.0], [1.0, 1.0, 0.0], [3.6, 3.6, 10.4], [0.9, 1.0, 0.0], 46]]} />}
        {A && <Cam t={us / FPS} keys={[ck(0, [-0.2, 2.9, 11.6], [-0.5, 1.8, 0.0], 46, 0.01), ck(ls * 0.25, [-0.3, 2.8, 11.3], [-0.4, 2.6, -1.0], 46, 0.0), ck(ls, [0.0, 2.4, 10.4], [0.0, 7.2, -6.5], 52, -0.01)]} />}
      </>;
      const hud = !hide && (G ? <>
        <LiveCounter f={u} label="DAYS IN FLORIDA" from={1} to={3} at={GC + 8} dur={16} />
        <Stamp f={u} x={540} y={720} text="SPECIES: ALLIGATOR" at={NL + 6} out={len - 6} size={54} color={CORAL} rot={-3} />
      </> : T ? <>
        <LiveCounter f={u} label="DAYS IN FLORIDA" from={3} to={3} at={0} />
        <HudText f={u} x={540} y={680} size={44} color={MUTED} enter="rise" at={MG} out={len - 6} spacing={4}>FLORIDA WILDLIFE DATA</HudText>
        <Stamp f={u} x={540} y={790} text="SERIOUS INJURIES: RARE" at={MG + 4} out={len - 6} size={50} color={GOLD} rot={-2} />
      </> : <>
        <g opacity={arrive(u, 6, 12) * (1 - arrive(u, len - 8, 6))}>
          <NeonPath d="M 540 1240 L 540 1040 M 480 1100 L 540 1040 L 600 1100" w={7} p={drawOn(u, 6, 14)} color={GOLD} hot />
        </g>
        <HudText f={u} x={540} y={1320} size={56} color={CREAM} enter="rise" at={10} out={len - 6} spacing={6}>LOOK UP</HudText>
      </>);
      return { world, hud };
    }
    case "gators":
    case "strikes":
    case "deaths":
    case "landfall": { // the Florida map diorama: 67 county dots + little gators / bolts striking it / a #1 plaque / a hurricane spiral landing
      const isG = id === "gators", isS = id === "strikes", isD = id === "deaths", isL = id === "landfall";
      const OP = isG ? C("one point three", 35) : 0, SS = isG ? C("sixty seven", 169) : 0;
      const TA = isS ? C("than any", 78) : 0, FY = isD ? C("for years", 99) : 0, FP = isL ? C("forty percent", 14) : 0;
      const nDots = isG ? k(u, SS - 6, SS + 40, 0, 67, Easing.linear) : 67;
      const period = 22, sIdx = Math.floor(u / period), sPh = (u % period) / period;
      const boltOn = (isS || isD) && sPh < 0.25 ? 1 - sPh / 0.25 : 0;
      const target = COUNTY_DOTS[(sIdx * 23 + 5) % 67];
      const flash = boltOn;
      const storm = isS || isD ? 1 : isL ? 0.6 : 0;
      const sp = isL ? k(u, 0, len, 0, 1, Easing.linear) : 0;
      const world = <>
        <Lights3 k={1.25 - 0.15 * storm} heroI={4} shaft={false} hero={[0, 0, 0]} rim={storm ? "#9fb2e8" : N3.gold} prac={[[[0, 4.2, 0], isS || isD ? "#dfe8ff" : N3.gold, 22 + 50 * flash], [[-2.7, 3.2, 3.4], N3.amber, 12], [[4.4, 2.5, -2.6], N3.coral, 8], [[0, 3.5, 5], "#ffd59a", 10]]} />
        <Floor lit gain={SG} kind="tile" a="#232a40" b="#1e2438" w={34} d={44} />
        <WallDoor lit gain={SG} z={-7} W={30} kind="plain" a="#252c48" b="#252c48" />
        <NeonBar p={[0, 6.6, -6.9]} s={[18, 0.07, 0.05]} color={N3.gold} />
        <Box p={[0, 0.15, -0.1]} s={[8.2, 0.3, 6.6]} color="#24180e" line={3} />
        <NeonBar p={[0, 0.31, 3.2]} s={[8.2, 0.04, 0.04]} color={N3.gold} glow={0.4} />
        <FloridaMap p={[0.1, 0.3, -0.2]} s={1.0} color={isL ? "#5a7a5a" : "#4f8a5a"} n={nDots} hits={isS ? Math.min(30, sIdx) : isD ? 30 : 0} t={t} glow={0.6} />
        {isG && [[-2.0, 2.4, 0.3], [1.6, -0.6, 2.2], [2.0, -1.6, -0.5], [-0.4, 2.2, 3.4]].map(([x, y, r], i) => (
          <Gator key={i} p={[x + 0.08 * Math.sin(t * 0.7 + i), 0.62, -y]} yaw={r + 0.1 * Math.sin(t + i)} s={0.26} eyes={0.3} />))}
        {(isS || isD) && <>
          <StormCloud p={[-1.5, 6.2, -3.2]} s={1.3} dark={1} flash={flash} seed={2} />
          <StormCloud p={[2.4, 6.6, -3.8]} s={1.1} dark={1} flash={flash * 0.6} seed={5} />
          <Bolt p={[target[0] + 0.1, 0.65, -target[1] - 0.2]} top={6.0} o={boltOn} seed={sIdx} />
        </>}
        {isD && <group position={[0.4, 0.62 + 0.25 * pop(u, 6, 14), -0.6]}>
          <Cyl p={[0, 0.5, 0]} rt={0.5} h={1.0} color="#1b2238" />
          <NeonSign p={[0, 1.6, 0]} s={[1.6, 1.0]} text="#1" color={N3.coral} face box />
        </group>}
        {isL && <>
          <Spiral p={[k(u, 0, len, 7.5, 3.0, Easing.linear), 1.2, k(u, 0, len, -3.6, 0.2, Easing.linear)]} r={1.9} t={t} o={0.95} />
          <Halo p={[3.2, 1.0, 0.2]} r={2.4} color={N3.coral} o={0.25 * sp} />
          <Spiral p={[8.5, 1.0, -6]} r={1.1} t={t + 2} o={0.35} />
        </>}
        <Hero p={[-2.7, 0.3, 2.2]} ground={0.3} look={REMY} pose={{ mood: isG ? (u >= SS ? "shock" : "worry") : isS || isD ? "worry" : "gulp", arms: isG ? "point" : isL ? "head" : "chest", armK: 0.9, nerv: isS || isD ? 0.5 : 0.2, sweat: isL ? 0.6 : 0.3, lookX: 0.8 }} f={f} rimO={0.45} />
        <FloorPool p={[-2.7, 0.3, 2.2]} r={1.3} color={N3.amber} o={0.4} />
        {isL && <Rain p={[0, 3, 3.5]} s={[16, 10]} t={t} o={0.25} />}
        <Motes t={t} c={[0, 0.5, 0]} area={[6, 4, 3]} />
        {isG && <Shot off={u - us} us={us} ls={ls} sub={sub} cams={[[[0.6, 12.4, 14.6], [0.0, 0.0, -2.2], [-0.2, 12.1, 14.0], [-0.1, 0.0, -2.2], 46], [[5.2, 6.8, 9.6], [0.4, 0.2, -1.2], [4.6, 6.5, 9.0], [0.3, 0.2, -1.2], 44]]} />}
        {isS && <Shot off={u - us} us={us} ls={ls} sub={sub} impacts={[[TA, 0.03]]} cams={[[[1.2, 12.6, 14.8], [0.1, 0.0, -2.2], [0.4, 12.3, 14.2], [0.0, 0.0, -2.2], 46]]} />}
        {isD && <Shot off={u - us} us={us} ls={ls} sub={sub} cams={[[[4.8, 7.4, 10.4], [0.2, 1.4, -1.6], [4.2, 7.1, 9.8], [0.3, 1.4, -1.6], 44]]} />}
        {isL && <Shot off={u - us} us={us} ls={ls} sub={sub} cams={[[[1.4, 12.6, 14.8], [0.3, 0.0, -2.2], [0.6, 12.2, 14.2], [0.2, 0.0, -2.2], 46], [[6.6, 7.4, 8.8], [2.2, 0.9, -1.4], [6.0, 7.2, 8.2], [2.2, 0.9, -1.4], 44]]} />}
      </>;
      const pct = isL ? k(u, FP, FP + 26, 0, 40, EASE.arrive) : 0;
      const g13 = isG ? k(u, OP, OP + 24, 0, 1.3, EASE.arrive) : 0;
      const hud = !hide && (isG ? <>
        <HudText f={u} x={540} y={390} size={44} color={MUTED} enter="rise" at={OP - 6} out={len - 6} spacing={6}>WILD GATORS, ESTIMATE</HudText>
        <g opacity={arrive(u, OP, 8)}>
          <NeonText x={540} y={560} size={150} color={AMBER}>{`~${g13.toFixed(1)} M`}</NeonText>
        </g>
        <g opacity={arrive(u, SS, 8)}>
          <Digits x={540} y={740} text={`${String(Math.round(nDots)).padStart(2, "0")}/67`} size={110} color={GOLD} anchor="middle" />
        </g>
      </> : isS ? <>
        <HudText f={u} x={540} y={390} size={50} color={MUTED} enter="rise" at={4} out={len - 6} spacing={6}>FLASH DENSITY · KM²</HudText>
        <CompareBars f={u} y={500} gap={170} bh={70} labelSize={44} out={len - 6} rows={[
          { label: "FL  #1", fill: 1.0, color: CORAL, at: TA },
          { label: "REST OF THE U.S.", fill: 0.7, at: TA + 10 },
        ]} />
      </> : isD ? <>
        <HudText f={u} x={540} y={390} size={44} color={MUTED} enter="rise" at={2} out={len - 6} spacing={4}>CONFIRMED · 2006–2025</HudText>
        <g opacity={arrive(u, 4, 8)}><Digits x={540} y={560} text={String(Math.round(k(u, 4, 34, 0, 97, EASE.arrive)))} size={150} color={CORAL} anchor="middle" /></g>
        <Stamp f={u} x={540} y={690} text="#1 IN THE U.S." at={FY} out={len - 6} size={56} color={GOLD} rot={-3} />
      </> : <>
        <HudText f={u} x={540} y={390} size={46} color={MUTED} enter="rise" at={2} out={len - 6} spacing={6}>FL SHARE</HudText>
        <g opacity={arrive(u, FP, 8)}>
          <Digits x={470} y={570} text={`~${Math.round(pct)}`} size={150} color={AMBER} anchor="middle" />
          <NeonText x={680} y={570} size={110} color={GOLD} anchor="start">%</NeonText>
        </g>
        {Array.from({ length: 10 }, (_, i) => {
          const x = 135 + i * 90, p = drawOn(u, FP + 10 + i * 2, 8), hot = i < 4 && u >= FP + 34;
          return p > 0 && <g key={i} transform={`translate(${x} 700) rotate(${(u * 4 + i * 30) % 360})`} opacity={p}>
            <path d="M 0 -26 C 22 -26 26 -4 10 4 M 0 26 C -22 26 -26 4 -10 -4" fill="none" stroke={hot ? CORAL : NEON.dim} strokeWidth={6} strokeLinecap="round" />
            <circle r={7} fill={hot ? CORAL : NEON.dim} />
          </g>;
        })}
        <HudText f={u} x={540} y={800} size={40} color={MUTED} enter="rise" at={FP + 36} out={len - 6} spacing={4}>4 OUT OF EVERY 10</HudText>
      </>);
      return { world, hud };
    }
    case "sky":
    case "ask": { // the beach: sky turns from noon sun to a 4 pm storm with a strike at sea / sunset beach for the final question
      const isSky = id === "sky";
      const EA = isSky ? C("Every afternoon", 32) : 0, SN = isSky ? C("Sunshine at noon", 95) : 0, TB = isSky ? C("Thunder by", 134) : 0;
      const storm = isSky ? k(u, SN + 10, TB + 10, 0, 0.85) : 0;
      const strike = isSky ? (u >= TB + 6 && u < TB + 14 ? 1 - (u - TB - 6) / 8 : u >= len - 24 && u < len - 16 ? 1 - (u - len + 24) / 8 : 0) : 0;
      const hrs = isSky ? k(u, SN - 10, TB + 6, 11.5, 16) : 0;
      const dusk = isSky ? 0 : 0.85;
      const cx = isSky ? k(u, SN, len, -16, -2, Easing.linear) : 0;
      const cues = isSky ? [] : [C("A, for the", 74), C("B, for the", 127), C("C, never", 179), C("D, I", 211)];
      const pick = cues.reduce((acc, c, i) => (u >= c ? i : acc), -1);
      const hero: V3 = isSky ? [0.4, 0, 1.6] : [0.3, 0, 2.0];
      const world = <>
        <SunLights hero={hero} storm={storm} flash={strike} dusk={dusk} prac={[[[-2.6, 2.4, 0.4], N3.amber, 6], [[4.6, 3.2, -2.5], N3.gold, 6]]} />
        <SkyWall sun={isSky ? [0.5 + 0.18 * k(u, 0, len, 0, 1), 0.16 + 0.1 * k(u, 0, len, 0, 1)] : [0.3, 0.62]} storm={storm} flash={strike} dusk={dusk} haze={0.7} />
        <mesh position={[0, 0, -2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[60, 34]} /><meshLambertMaterial color={new THREE.Color("#c99a62").multiplyScalar(1.5)} /></mesh>
        <Tufts c={[-5, 0, -1]} area={[6, 3]} n={10} color="#6a8a44" seed={9} />
        <Water p={[0, 0.01, -12]} s={[70, 16]} t={t} color={storm > 0.5 ? "#2f4a66" : dusk ? "#c07a6a" : "#3fa6c0"} deep={storm > 0.5 ? "#182638" : dusk ? "#5a3a5a" : "#1d6a8a"} />
        {Array.from({ length: 5 }, (_, i) => <Box key={i} p={[-12 + i * 6 + ((t * 0.4 + i) % 1) * 0.6, 0.03, -4.0 - (i % 2) * 0.3]} s={[3.2, 0.04, 0.12]} color="#fff4dc" line={0} />)}
        <Glb name="beach_umbrella" p={[-2.6, 0, -0.4]} blob={1.4} fallback={<Cyl p={[-2.6, 2.4, -0.4]} rt={0.05} rb={1.2} h={0.5} color={N3.coral} line={2} />} />
        <Palm p={[-6.4, 0, -3.2]} s={1.15} rot={0.6} /><Palm p={[7.0, 0, -4.4]} s={1.0} rot={2.4} />
        {/* lifeguard tower with a clock (time of day) */}
        <group position={[3.7, 0, -2.6]}>
          {[[-0.7, -0.5], [0.7, -0.5], [-0.7, 0.5], [0.7, 0.5]].map(([x, z], i) => <Box key={i} p={[x, 1.2, z]} s={[0.14, 2.4, 0.14]} rot={[0, 0, x * 0.08]} color="#e9e0cc" line={2} />)}
          <Box p={[0, 2.5, 0]} s={[2.0, 0.16, 1.4]} color="#e9e0cc" line={3} />
          <Box p={[0, 3.3, -0.1]} s={[1.8, 1.4, 1.1]} color={N3.coral} line={3} />
          <Box p={[0, 4.1, -0.1]} s={[2.2, 0.16, 1.5]} color="#e9e0cc" line={3} />
          {isSky && <NeonClock p={[0, 3.3, 0.48]} r={0.5} hours={hrs} />}
        </group>
        {isSky && <>
          <StormCloud p={[cx, 8.0, -7]} s={2.1} dark={0.4 + 0.6 * storm} flash={strike} seed={4} />
          <StormCloud p={[cx - 7, 7.2, -9]} s={1.7} dark={0.4 + 0.6 * storm} seed={8} />
          <Bolt p={[3.8, 0.05, -9]} top={7.0} o={strike} seed={7} />
          <Rain p={[0, 3.5, 3.5]} s={[18, 10]} t={t} o={0.35 * clamp((storm - 0.6) / 0.25)} />
        </>}
        {!isSky && <><Halo p={[-6, 2.5, -10]} r={6} color={N3.coral} o={0.18} /><NeonBar p={[-2.6, 0.06, -1.3]} s={[1.6, 0.03, 0.03]} color={N3.gold} glow={0.4} /></>}
        <Hero p={hero} look={REMY} pose={isSky
          ? { mood: storm > 0.5 ? "worry" : "grin", arms: storm > 0.5 ? "head" : "up", armK: storm > 0.5 ? 0.9 : 0.6 + 0.2 * Math.sin(f * 0.2), nerv: storm > 0.6 ? 0.5 : 0, sweat: 0.4, lookX: storm > 0.3 ? -0.6 : 0, squash: strike > 0 ? -0.06 : 0 }
          : { mood: "grin", arms: u > 30 ? "point" : "up", armK: u > 30 ? 1 : 0.7 + 0.3 * Math.sin(f * 0.5), tilt: u > 30 ? 0 : 0.04 * Math.sin(f * 0.25) }} f={f} rimO={0.45} />
        <FloorPool p={hero} r={1.5} color={N3.amber} o={0.3} />
        <Motes t={t} c={[0, 0.3, 0]} area={[6, 4, 3]} />
        {isSky ? <Shot off={u - us} us={us} ls={ls} sub={sub} impacts={[[TB + 6, 0.03]]} cams={[[[1.6, 3.1, 13.0], [0.4, 1.95, 0.2], [0.9, 3.15, 12.6], [0.3, 2.0, 0.1], 46], [[-1.8, 0.9, 9.2], [0.0, 1.45, 1.6], [-1.3, 0.95, 8.8], [0.05, 1.4, 1.6], 44]]} />
          : <Shot off={u - us} us={us} ls={ls} sub={sub} cams={[[[1.4, 3.2, 13.2], [0.3, 2.0, 0.8], [0.2, 3.1, 12.4], [0.3, 1.95, 0.8], 46]]} />}
      </>;
      const hud = !hide && (isSky ? <>
        <LiveCounter f={u} label="DAYS IN FLORIDA" from={3} to={10} at={EA + 4} dur={18} />
        <g opacity={arrive(u, SN - 4, 8)}>
          <Digits x={300} y={760} text={u < TB ? "12:00" : "4:00"} size={120} color={u < TB ? AMBER : CORAL} anchor="middle" />
          <NeonText x={300} y={830} size={44} color={MUTED}>{u < TB ? "PM · CLEAR" : "PM · STORM"}</NeonText>
        </g>
      </> : <>
        <HudText f={u} x={540} y={400} size={56} color={CREAM} enter="rise" at={2} out={len + 30}>COMMENT YOUR PICK</HudText>
        <ChoiceCards f={u} y={690} at={8} pick={pick} pickAt={pick >= 0 ? cues[pick] : Infinity} out={len + 30}
          cards={[{ letter: "A", text: "BEACHES" }, { letter: "B", text: "GATORS" }, { letter: "C", text: "NEVER" }, { letter: "D", text: "I LIVE HERE" }]} />
      </>);
      return { world, hud };
    }
    case "tv": { // day 30: Remy on the couch, the TV shows the storm track: a cone grows toward Florida
      const AC = C("A cone", 32), HS = C("Hurricane season", 102);
      const cone = k(u, AC, AC + 30, 0, 1, EASE.arrive);
      const glow = 0.8 + 0.2 * Math.abs(Math.sin(t * 7.3) * Math.cos(t * 2.1));
      const world = <>
        <HomeRoom t={t} hero={[-1.1, 0, -1.35]} tvGlow={glow} map={1} couch />
        <Hero p={[-1.1, 0.2, -1.35]} look={REMY} pose={{ mood: u >= HS ? "gulp" : u >= AC + 10 ? "worry" : "deadpan", arms: u >= HS ? "head" : "down", armK: 0.85, lookX: 1, sweat: u >= HS ? 0.6 : 0.2, nerv: u >= HS ? 0.4 : 0 }} f={f} shadow={false} rimO={0.5} />
        <group position={[2.1, 0, 1.3]} rotation={[0, -0.85, 0]}>
          <Glb name="flat_tv" blob={1.5} fallback={<><Box p={[0, 0.35, 0]} s={[3.2, 0.7, 0.8]} color="#3a2717" /><Box p={[0, 1.95, -0.1]} s={[2.55, 1.5, 0.1]} color="#0b0d1a" /></>} />
          <Panel p={[0, 1.95, 0.01]} s={[2.36, 1.32]} px={[472, 264]} dep={Math.round(cone * 40) + Math.floor(u / 4) * 100} draw={(c, W, H) => {
            c.fillStyle = "#0a1428"; c.fillRect(0, 0, W, H);
            c.fillStyle = "#11264a"; c.fillRect(0, 0, W, 44); c.fillStyle = N3.coral; c.fillRect(0, 44, W, 6);
            c.fillStyle = "#fff1d6"; c.font = `900 30px ${FONT3}`; c.textAlign = "left"; c.fillText("STORM TRACK", 16, 32);
            c.fillStyle = Math.floor(u / 15) % 2 ? N3.coral : "#6a2a20"; c.beginPath(); c.arc(W - 26, 22, 9, 0, 7); c.fill();
            const sc = 26, ox = W * 0.36, oy = H * 0.58;
            c.beginPath(); FL_PTS.forEach(([x, y], i) => (i ? c.lineTo(ox + x * sc, oy - y * sc) : c.moveTo(ox + x * sc, oy - y * sc))); c.closePath();
            c.fillStyle = "#2f6a4a"; c.fill(); c.strokeStyle = N3.gold; c.lineWidth = 3; c.stroke();
            if (cone > 0) {
              const tx = ox + 3.0 * sc, ty = oy - 0.6 * sc, sx0 = W - 30, sy0 = H * 0.86, ex = sx0 + (tx - sx0) * cone, ey = sy0 + (ty - sy0) * cone;
              const nx = -(ey - sy0), ny = ex - sx0, L = Math.hypot(nx, ny) || 1;
              c.fillStyle = "rgba(255,255,255,.32)"; c.strokeStyle = "#ffffff"; c.lineWidth = 3;
              c.beginPath(); c.moveTo(sx0 + (nx / L) * 8, sy0 + (ny / L) * 8); c.lineTo(ex + (nx / L) * 50 * cone, ey + (ny / L) * 50 * cone); c.arc(ex, ey, 50 * cone, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI); c.lineTo(sx0 - (nx / L) * 8, sy0 - (ny / L) * 8); c.closePath(); c.fill(); c.stroke();
              for (let q = 0; q < 4; q++) { const kq = (q + 1) / 4 * cone; c.fillStyle = q === 3 ? N3.coral : "#ffffff"; c.beginPath(); c.arc(sx0 + (tx - sx0) * kq, sy0 + (ty - sy0) * kq, 8, 0, 7); c.fill(); }
            }
          }} />
          <Halo p={[0, 1.95, 0.6]} r={2.2} color="#cfe6ff" o={0.16 * glow} />
        </group>
        <FloorPool p={[0.8, 0, 0.6]} r={2.4} color="#cfe6ff" o={0.18 * glow} />
        <pointLight position={[0.6, 2.2, 0.4]} intensity={14 * glow} distance={7} decay={2} color="#cfe6ff" />
        <Shot off={u - us} us={us} ls={ls} sub={sub} cams={[[[-3.2, 3.4, 10.6], [0.6, 1.75, -0.3], [-2.6, 3.3, 10.0], [0.7, 1.75, -0.3], 46], [[-2.4, 2.2, 6.2], [1.7, 1.75, 1.0], [-2.0, 2.15, 5.7], [1.75, 1.8, 1.0], 40]]} />
      </>;
      const hud = !hide && <>
        <LiveCounter f={u} label="DAYS IN FLORIDA" from={10} to={30} at={AC + 6} dur={20} />
      </>;
      return { world, hud };
    }
    case "rules": { // storm at the house: the porch light is on, Remy heads for the door; RULEBOOK card (slogan BEFORE it is spoken)
      const WS = C("Watch the sky", 74), NJ = C("not just the", 109), WT = C("When thunder roars", 158), GI = C("go indoors", 193);
      const x = k(u, 0, GI + 10, 3.6, 0.2, Easing.linear), z = k(u, WT, GI + 14, 1.6, -3.0, Easing.linear);
      const walking = u < GI + 14;
      const fl = [40, 96, 150].some((a) => u >= a && u < a + 6) ? 1 : 0;
      const world = <>
        <SunLights hero={[x, 0, z]} storm={0.85} flash={fl} prac={[[[0, 3.6, -3.2], N3.amber, 14], [[0, 2.0, -5.5], N3.amber, 18], [[-3.4, 2.4, -3.4], N3.amber, 8]]} />
        <SkyWall p={[0, 9, -16]} storm={0.9} flash={fl} />
        <Floor lit gain={SG} kind="carpet" a="#2f4a2e" b="#2a442a" w={40} d={44} />
        <Box p={[0, 0.1, -2.6]} s={[9, 0.2, 2.6]} color="#5a4a3a" line={3} />
        <WallDoor lit gain={SG} z={-4} W={12} kind="wood" a="#4c5a7a" b="#44526e" door={{ x: 0, w: 2.2, h: 4.2 }} />
        <Box p={[0, 9.4, -4.2]} s={[13, 0.8, 1.2]} color="#2a2f45" line={3} />
        <Box p={[0, 2.2, -5.6]} s={[2.4, 4.4, 0.1]} color="#ffcf8a" line={2} />
        <Halo p={[0, 2.2, -4.6]} r={2.2} color={N3.amber} o={0.5} />
        {[-3.4, 3.4].map((wx) => <group key={wx}><Box p={[wx, 3.0, -3.94]} s={[1.8, 1.6, 0.08]} color="#ffd27a" line={3} /><Halo p={[wx, 3.0, -3.7]} r={1.3} color={N3.amber} o={0.4} /></group>)}
        <Cyl p={[1.5, 4.6, -3.9]} rt={0.14} rb={0.2} h={0.3} color="#1b1f30" line={2} /><Halo p={[1.5, 4.4, -3.7]} r={0.7} color={N3.amber} o={0.9} />
        <Palm p={[6.2, 0, -2.6]} s={1.1} rot={0.8} /><Palm p={[-6.4, 0, -3.2]} s={1.2} rot={2.0} />
        <Hero p={[x, 0, z]} look={REMY} pose={{ mood: u >= WT ? "worry" : "deadpan", walk: (x + z) * 2.4, speed: walking ? 1 : 0, arms: "down", lookX: -0.6, sweat: 0.3, nerv: fl ? 0.6 : 0.1, squash: fl ? -0.05 : 0 }} f={f} rimO={0.5} />
        <Rain p={[0, 3.5, 2.5]} s={[18, 10]} t={t} o={0.45} />
        <Shot off={u - us} us={us} ls={ls} sub={sub} cams={[[[3.4, 3.1, 11.8], [1.6, 1.75, -1.0], [2.6, 3.05, 11.2], [1.3, 1.8, -1.2], 46], [[-3.4, 2.1, 7.4], [0.3, 1.7, -1.8], [-2.9, 2.05, 6.8], [0.2, 1.75, -2.2], 44]]} />
      </>;
      const cp = drawOn(u, 4, 14), r1 = drawOn(u, WS, 10), r2 = drawOn(u, NJ, 10);
      const slogan = u < WT - 2 ? arrive(u, NJ, 10) : 1 - arrive(u, WT - 2, 6); // gone before the voice says it (no double text)
      const tick2 = drawOn(u, WT + 2, 10);
      const hud = !hide && cp > 0 && <>
        <rect x={90} y={330} width={900} height={420} rx={26} fill="#000" opacity={0.55 * cp} />
        <NeonPath d="M 116 330 L 964 330 Q 990 330 990 356 L 990 724 Q 990 750 964 750 L 116 750 Q 90 750 90 724 L 90 356 Q 90 330 116 330 Z" p={cp} w={4} color={GOLD} />
        <HudText f={u} x={540} y={410} size={54} color={GOLD} enter="rise" at={6} spacing={8}>RULEBOOK</HudText>
        {r1 > 0 && <g opacity={r1}>
          <path d="M 150 520 C 150 490 190 480 205 500 C 215 478 255 482 255 510 C 275 510 280 540 255 545 L 160 545 C 140 545 135 525 150 520 Z" fill="none" stroke={CREAM} strokeWidth={5} />
          <NeonPath d="M 196 556 L 186 580 L 204 580 L 192 606" w={4} color={AMBER} />
          <HudText f={u} x={300} y={540} size={48} color={CREAM} enter="rise" at={WS} anchor="start">CLOUDS FIRST</HudText>
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
    case "respawn": { // split stage: GAME side (cyan grid, ghost Remy rises from a spawn ring) | REAL side (storm, bolt hits a palm)
      const YR = C("you respawn", 38), DC = C("doesn't care", 122);
      const rise = k(u, YR, YR + 18, -2.6, 0, EASE.arrive);
      const ring = k(u, YR - 6, YR + 6, 0, 1) * (1 - k(u, YR + 24, YR + 40, 0, 0.6));
      const strike = u >= DC && u < DC + 10 ? 1 - (u - DC) / 10 : 0;
      const world = <>
        <Lights3 k={0.85} hero={[0, 0, 1]} rim="#9fb2e8" prac={[[[-1.6, 1.2, 2.0], N3.cyan, 14], [[2.4, 6, -1], "#dfe8ff", 6 + 60 * strike], [[1.6, 2.0, 2.6], N3.amber, 10]]} />
        <SkyWall p={[6, 8, -14]} s={[30, 24]} storm={0.95} flash={strike} />
        <Floor lit gain={SG} kind="tile" a="#232a40" b="#1e2438" w={34} d={44} />
        <Panel p={[-4.6, 0.02, -1]} s={[9.2, 12]} rot={[-Math.PI / 2, 0, 0]} px={[368, 480]} dep={1} draw={(c, W, H) => {
          c.fillStyle = "#06121c"; c.fillRect(0, 0, W, H); c.strokeStyle = "rgba(95,227,255,.55)"; c.lineWidth = 2;
          for (let i = 0; i <= 12; i++) { c.beginPath(); c.moveTo((i * W) / 12, 0); c.lineTo((i * W) / 12, H); c.stroke(); } for (let i = 0; i <= 16; i++) { c.beginPath(); c.moveTo(0, (i * H) / 16); c.lineTo(W, (i * H) / 16); c.stroke(); }
        }} />
        <Box p={[-4.6, 3.5, -7]} s={[9.2, 7, 0.2]} color="#08202c" line={3} />
        <NeonBar p={[0, 3.5, -1]} s={[0.07, 7, 0.07]} color={N3.gold} />
        <NeonBar p={[0, 0.04, -1]} s={[0.07, 0.04, 12]} color={N3.gold} glow={0} />
        <mesh position={[-1.6, 0.05, 1.2]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.8, 1.0, 40]} /><meshBasicMaterial color={N3.cyan} toneMapped={false} transparent opacity={0.3 + 0.7 * ring} /></mesh>
        <Halo p={[-1.6, 0.6, 1.2]} r={1.8 + ring} color={N3.cyan} o={0.25 + 0.5 * ring} />
        <group position={[-2.4, 3.0 + 0.1 * Math.sin(t * 2), -2.6]} rotation={[0.4, t * 0.6, 0]}><Glb name="game_controller" s={1.6} line={2} /></group>
        <Halo p={[-2.4, 3.0, -2.6]} r={1.1} color={N3.cyan} o={0.35} />
        <Hero p={[-1.6, rise, 1.2]} look={GHOST} pose={{ mood: "grin", arms: u >= YR + 18 ? "up" : "down", armK: 0.9 }} f={f} rim={N3.cyan} rimO={0.5} shadow={rise > -0.05} />
        <StormCloud p={[2.6, 6.6, -4]} s={1.4} dark={1} flash={strike} seed={6} />
        <Palm p={[3.4, 0, -2.6]} s={1.0} rot={1.8} />
        <Bolt p={[3.9, 4.6, -2.6]} top={7.4} o={strike} seed={3} />
        <Rain p={[3.6, 3.5, 2.5]} s={[8, 10]} t={t} o={0.5} />
        <Glb name="beach_umbrella" p={[1.6, 0, 0.5]} s={1.3} blob={1.2} />
        <Hero p={[1.6, 0, 1.2]} look={REMY} pose={{ mood: u >= DC ? "shock" : "worry", arms: "head", armK: 0.9, nerv: 0.6, sweat: 0.6, squash: strike > 0 ? -0.06 : 0, lookX: 0.5 }} f={f} rimO={0.45} />
        <Shot off={u - us} us={us} ls={ls} sub={sub} cams={[[[-3.4, 2.2, 9.6], [-2.15, 1.45, 1.2], [-3.0, 2.2, 9.1], [-2.15, 1.38, 1.2], 40], [[3.6, 2.2, 9.6], [1.05, 1.45, 1.2], [3.2, 2.2, 9.1], [1.05, 1.38, 1.2], 40]]} />
      </>;
      const hud = !hide && <>
        {sub === 0 && <HudText f={u} x={300} y={560} size={62} color={CYAN} enter="scale" at={YR + 4}>+1 LIFE</HudText>}
        <Stamp f={u} x={760} y={560} text="NO RETRIES" at={DC} out={len + 6} size={52} color={CORAL} rot={3} />
      </>;
      return { world, hud };
    }
    default: return { world: null };
  }
};

// ---------------------------------------------------------------- scene: one persistent WebGL canvas + SVG HUD on top
const renderDpr = () => Number((getInputProps() as { dpr?: number }).dpr ?? 0.5);
const cueLocal = (words: Word[], phrase: string, span: ShotSpan, fallback: number) => {
  try { return Math.round(cueTime(words, phrase, span.a / FPS - 0.3) * FPS) - span.a; } catch { return fallback; }
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const presentation = (t: Tr): any => t === "fade" ? fade() : t === "slide" ? slide({ direction: "from-right" }) : wipe({ direction: "from-left" });
/** one shot = its own WebGL canvas + HUD; animation clock = the parent line (u), camera clock = this shot (us) */
const ShotView: React.FC<{ span: ShotSpan; pa: number; pb: number; words: Word[] }> = ({ span, pa, pb, words }) => {
  const us = useCurrentFrame();
  const f = span.a + us, u = f - pa, len = pb - pa, ls = span.b - span.a;
  const d = DEF[span.id];
  const parentSpan: ShotSpan = { id: d.parent, a: pa, b: pb, i: span.i };
  const v = build(d.parent, f, u, len, (p, fb) => cueLocal(words, p, parentSpan, fb), false, d.sub, us, ls);
  return (
    <AbsoluteFill style={{ background: N3.bg }}>
      <ThreeCanvas width={1080} height={1920} dpr={renderDpr()} linear flat shadows="soft" gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }}>
        <color attach="background" args={[N3.bg]} />
        <group>{v.world}</group>
        <ShadowSetup />
      </ThreeCanvas>
      <Grade t={f / FPS} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.42) 30%, rgba(0,0,0,0) 52%)" }} />
      {v.dim ? <AbsoluteFill style={{ background: "#000", opacity: v.dim }} /> : null}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}><NeonDefs />{v.hud || null}</svg>
      {v.black ? <AbsoluteFill style={{ background: "#000", opacity: v.black }} /> : null}
    </AbsoluteFill>
  );
};
/** the edit: hard cuts on the line changes, a 10-frame transition where a shot asks for one (the outgoing shot is
 *  extended by the transition length so every cut still lands on its narration cue) */
const Scene: React.FC<SceneProps> = ({ spans, words }) => {
  const parentOf = (id: string) => DEF[id].parent;
  const range = (p: string) => { const ss = spans.filter((x) => parentOf(x.id) === p); return [ss[0].a, ss[ss.length - 1].b]; };
  const out: React.ReactNode[] = [];
  spans.forEach((sp, i) => {
    const next = spans[i + 1];
    const tr = next ? DEF[next.id].tr : undefined;
    const [pa, pb] = range(parentOf(sp.id));
    out.push(<TransitionSeries.Sequence key={sp.id} durationInFrames={Math.max(1, sp.b - sp.a + (tr ? TR_FRAMES : 0))}>
      <ShotView span={sp} pa={pa} pb={pb} words={words} />
    </TransitionSeries.Sequence>);
    if (tr) out.push(<TransitionSeries.Transition key={sp.id + "-tr"} presentation={presentation(tr)} timing={linearTiming({ durationInFrames: TR_FRAMES })} />);
  });
  return <AbsoluteFill style={{ background: N3.bg }}><TransitionSeries>{out}</TransitionSeries></AbsoluteFill>;
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "wi-gta-leonida",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: N3.bg,
};
export default story;
