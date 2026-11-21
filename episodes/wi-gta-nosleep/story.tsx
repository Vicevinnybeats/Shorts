// WHAT IF #1 "What If You Played GTA 6 for 30 Days Straight?" - Stick3D look (3D toon rooms + bean-body stick puppets,
// library/stick3d) in the Golden Neon colours (black/navy rooms, gold/amber/coral, cyan only for the game world and
// hallucinations) with the What-If HUD on top (library/whatif: live counter, chapter screens, choice cards, stamps).
// Remy (fictional gamer: hoodie, beanie, gold accents) tries 30 days of GTA 6 without sleep. Real science
// (RESEARCH.md): one study (Williamson & Feyer 2000): after 17-19 h awake, as bad on SOME tests as at the drink-drive
// limit (0.05%) in many countries; Randy Gardner (1964, age 17, San Diego) 264 h = 11 days, Guinness stopped accepting
// attempts; microsleeps; Randy slept 14 h. "GTA 6" only as plain words: no game art, footage or logos.
// Every beat is cue-driven (C(phrase, fallback)) so the picture follows words.json; fallbacks = estimated timing.
// Layout: HUD text y 300-1350 (counter card 316-556 -> other text >= 620 in counter shots); every figure's lowest
// visible pixel stays above y 1430 (captions own 1440-1640); place changes dip through black with the HUD hidden.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, getInputProps } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, ShotSpan, cueTime, FPS } from "../../src/engine/timeline";
import type { Word } from "../../src/captions/Captions";
import { EASE, arrive } from "../../src/engine25/motion";
import {
  NEON, NeonDefs, HudText, StrokeWord, LiveCounter, CompareBars, ChapterScreen, ChoiceCards, Stamp, NeonPath, NeonText, Digits, RepeatIcon, drawOn, rnd,
} from "../../library/whatif/kit";
import { Box, Cyl, Ball } from "../../library/stick3d/toon";
import { Person, V3, clamp, Lights, Grade } from "../../library/stick3d/kit";
import { NEON3D, REMY3D } from "../../src/tests/Stick3DTest";
import { Floor, WallDoor, SideWall, Shelf, Lamp, Monitor, Cabinet, Rug, Shaft, Dust } from "../../library/stick3d/props";
import { Cam, Key, Taxi, Barrier, Curtain } from "../../library/stick3d/extra";
import { Glb } from "../../library/stick3d/glb";
import { drawPuppet, Look, Pose } from "../../library/stick3d/puppet";
import { N3, FONT3, Halo, FloorPool, NeonBar, HeroLight, Motes, Panel, NeonSign, NeonClock, NightWindow, NeonPoster } from "../../library/stick3d/neon";
import scenes from "../../content/scripts/wi-gta-nosleep.json";

// ---------------------------------------------------------------- cast
// Remy = the installed pack look REMY3D (src/tests/Stick3DTest.tsx: gold hoodie puppet) + the series beanie (gold band/pom)
const REMY: Look = { ...REMY3D, beanie: "#2e3658", beanieBand: N3.gold, pom: N3.amber };
const RANDY: Look = { skin: "#efcfae", body: "#f1e7d3", outfit: "shirt", hair: "flattop", hairColor: "#4a2e18", collar: "#fffaf0", shoe: "#3a2a1a" };
const MO: Look = { skin: "#c98d5f", body: N3.coral, outfit: "shirt", hair: "short", hairColor: "#1b1b2a", shoe: N3.ink };
const { gold: GOLD, coral: CORAL, amber: AMBER, text: CREAM, muted: MUTED, cyan: CYAN } = NEON;

// ---------------------------------------------------------------- shots (cues from content/scripts, places here)
const PLACE: Record<string, string> = {
  hook: "room", crash: "room", hour0: "room", hour17: "room", study: "lab", hour24: "road", day2: "stage", day3: "room",
  real: "y1964", symptoms: "y1964", record: "void", day30: "calendar", micro: "room", slept: "bed", speedrun: "loop", ask: "room",
};
const SHOTS = scenes.shots.map((s) => ({ id: s.id, cue: s.cue }));
/** [place change INTO this shot, place change OUT of it] -> whip-pan carry-over across the dip */
const CUT: Record<string, [boolean, boolean]> = Object.fromEntries(SHOTS.map((sh, i) => [sh.id, [
  i > 0 && PLACE[SHOTS[i - 1].id] !== PLACE[sh.id], i < SHOTS.length - 1 && PLACE[SHOTS[i + 1].id] !== PLACE[sh.id]]]));

// ---------------------------------------------------------------- helpers
/** exposure gain for the lit walls/floors (linear canvas output is dark): sets read clearly behind the characters */
const SG = 3.2;
const k = (u: number, a: number, b: number, from: number, to: number, e = EASE.camera) =>
  interpolate(u, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const pop = (u: number, at: number, d = 10) => interpolate(u, [at, at + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(2.2)) });
const ck = (u: number, pos: V3, look: V3, fov = 46, roll = 0): Key => ({ t: u / FPS, pos, look, fov, roll });
/** Camera: piecewise-LINEAR moves (constant speed, never eased to a stop) so motion carries through the cuts; every shot
 *  trucks left + pushes in (one direction for the whole film). At a place change the camera whips left: the old shot
 *  accelerates its pan over its last 8 frames, the new one starts mid-whip and settles (motion carry-over across the dip). */
const camLin = (t: number, keys: Key[]): Key => {
  if (keys.length === 1) return keys[0];
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1], w = (t - a.t) / Math.max(1e-6, b.t - a.t);
  const L = (x: number, y: number) => x + (y - x) * w;
  return { t, pos: [L(a.pos[0], b.pos[0]), L(a.pos[1], b.pos[1]), L(a.pos[2], b.pos[2])], look: [L(a.look[0], b.look[0]), L(a.look[1], b.look[1]), L(a.look[2], b.look[2])], fov: L(a.fov ?? 46, b.fov ?? 46), roll: L(a.roll ?? 0, b.roll ?? 0) };
};
const WHIP = 8;
const Shot: React.FC<{ u: number; len?: number; cut?: [boolean, boolean]; keys: Key[]; kicks?: number[]; impacts?: [number, number][] }> = ({ u, len = 9999, cut = [false, false], keys, kicks = [], impacts = [] }) => {
  const c = camLin(u / FPS, keys);
  const out = cut[1] ? Math.pow(clamp((u - (len - WHIP)) / WHIP), 2) : 0;
  const inn = cut[0] ? Math.pow(1 - clamp(u / WHIP), 2) : 0;
  const dist = Math.hypot(c.look[0] - c.pos[0], c.look[2] - c.pos[2]);
  const dx = (inn - out) * 0.09 * dist; // gentle whip (~5 deg) so close shots never swing the hero off frame
  const look: V3 = [c.look[0] + dx, c.look[1], c.look[2]];
  return <Cam t={u / FPS} keys={[{ ...c, t: 0, look }]} fovKick={kicks.map((x) => x / FPS)} impacts={impacts.map(([a, b]) => [a / FPS, b] as [number, number])} />;
};
/** Lighting rig for every scene: warm KEY from front-top, cool sky/ground FILL, gold RIM from behind the hero, a soft
 *  pool over the hero, plus motivated practicals (lamp, TV/game glow, neon, window) as point lights; the pack's Shaft. */
type Prac = [V3, string, number];
const Lights3: React.FC<{ warm?: string; k?: number; hero?: V3; prac?: Prac[]; rim?: string; heroI?: number }> = ({ warm = "#ffd59a", k: kk = 1, hero = [0, 0, 0], prac = [], rim = N3.gold, heroI = 7 }) => (<>
  <ambientLight intensity={0.85 * kk} />
  {/* sky/ground fill = bounce light so walls, floor and props read (owner: sets were murky) */}
  <hemisphereLight args={["#9fb2e8", "#5a3a22", 1.0 * kk]} />
  {/* KEY: warm, front-top-right, the one shadow-casting light (PCF soft, 1024 map, frustum around the hero) */}
  <directionalLight position={[hero[0] + 6, hero[1] + 8, hero[2] + 4.5]} intensity={1.6 * kk} color={warm} castShadow
    shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.03} shadow-radius={4}
    shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-camera-near={0.5} shadow-camera-far={40}>
    <object3D attach="target" position={hero} />
  </directionalLight>
  {/* RIM / back light (gold) */}
  <directionalLight position={[hero[0] - 3, hero[1] + 5, hero[2] - 8]} intensity={1.1} color={rim}><object3D attach="target" position={hero} /></directionalLight>
  <pointLight position={[hero[0], hero[1] + 3.4, hero[2] + 0.8]} intensity={heroI} distance={7} decay={2} color={N3.amber} />
  {prac.map(([pp, c, i], j) => <pointLight key={j} position={pp} intensity={i} distance={9} decay={2} color={c} />)}
  <Shaft p={[0, 4, -1]} s={[3, 9]} color="245,185,66" o={0.14} />
</>);
/** shadows: every solid mesh casts + receives (puppet billboards cast a cut-out shadow through their alphaTest);
 *  glows, cones, shafts, outlines and transparent planes are skipped */
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
/** soft DROP SHADOW of a standing puppet: its own silhouette laid on the floor, stretched away from the key light
 *  (key sits at hero + (6, 8, 4.5) in every scene -> shadow falls back-left, length 0.94 h), fading toward the head */
const SH_YAW = Math.atan2(6, 4.5);
const DropShadow: React.FC<{ p: V3; h: number; look: Look; pose: Omit<Pose, "t">; f: number; o?: number }> = ({ p, h, look, pose, f, o = 0.62 }) => {
  const L = h * 0.94, W = h * 512 / 768;
  return <group position={[p[0], 0.035, p[2]]} rotation={[0, SH_YAW, 0]}>
    <Panel p={[0, 0, -L / 2 + 0.06]} s={[W, L]} rot={[-Math.PI / 2, 0, 0]} px={[256, 384]} draw={(c, Wc, Hc) => {
      drawPuppet(c, Wc, Hc, look, { ...pose, t: f, sweat: 0 });
      c.globalCompositeOperation = "source-in";
      const g = c.createLinearGradient(0, Hc, 0, 0); g.addColorStop(0, `rgba(2,3,10,${o})`); g.addColorStop(1, `rgba(2,3,10,${o * 0.35})`);
      c.fillStyle = g; c.fillRect(0, 0, Wc, Hc); c.globalCompositeOperation = "source-over";
    }} />
  </group>;
};
/** puppet (Person) with a warm rim halo behind it so it separates from the dark room; standing puppets (shadow) also
 *  get the contact blob (pack Shadow) + a drop shadow on the floor */
const Hero: React.FC<{ p: V3; look: Look; pose: Omit<Pose, "t">; f: number; h?: number; rim?: string; shadow?: boolean; rimO?: number }> = ({ p, look, pose, f, h = 2.5, rim = N3.amber, shadow = true, rimO = 0.35 }) => (<>
  <Halo p={[p[0], p[1] + h * 0.62, p[2] - 0.25]} r={h * 0.72} color={rim} o={rimO} />
  {shadow && p[1] < 0.6 ? <DropShadow p={p} h={h} look={look} pose={pose} f={f} /> : null}
  <Person p={p} h={h} look={look} pose={pose} f={f} shadow={shadow} />
</>);
/** small game controller held at a puppet's hands (arms "hold") */
const Pad: React.FC<{ p: V3; f: number; rot?: V3 }> = ({ p, f, rot = [0.35, 0, 0] }) => (
  <group position={[p[0] + Math.sin(f * 1.7) * 0.01, p[1] + Math.sin(f * 2.3) * 0.012, p[2]]} rotation={rot}>
    <Glb name="game_controller" line={2} fallback={<>
      <Box p={[0, 0, 0]} s={[0.56, 0.12, 0.26]} color="#1c2032" line={2} />
      <Box p={[-0.24, -0.02, 0.1]} s={[0.16, 0.12, 0.2]} color="#1c2032" line={2} /><Box p={[0.24, -0.02, 0.1]} s={[0.16, 0.12, 0.2]} color="#1c2032" line={2} />
      <Ball p={[0.13, 0.07, 0]} r={0.03} color={N3.coral} ink={0.01} /><Ball p={[0.19, 0.07, -0.05]} r={0.03} color={N3.gold} ink={0.01} /></>} />
    <Halo p={[0, 0.05, 0.05]} r={0.25} color={N3.gold} o={0.25} />
  </group>
);
/** lying puppet: the puppet canvas laid sideways (head to -x) in a vertical plane facing +z */
const LyingPuppet: React.FC<{ p: V3; h: number; look: Look; pose: Omit<Pose, "t">; f: number }> = ({ p, h, look, pose, f }) => (
  <Panel p={p} s={[h * 512 / 768, h]} rot={[0, 0, Math.PI / 2]} px={[512, 768]} draw={(c, W, H) => drawPuppet(c, W, H, look, { ...pose, t: f })} />
);

// ---------------------------------------------------------------- sets
const SNACK_COLS = [N3.coral, N3.gold, "#2a3355", N3.amber, "#7a2f26"];
/** snacks on the coffee table; n = how many have popped in (fraction pops) */
const Snacks: React.FC<{ n: number; x?: number; z?: number; y?: number }> = ({ n, x = 0, z = 0.9, y = 0.62 }) => {
  const items = [
    (s: number) => <Glb name="chips_bag" p={[-1.15, 0, 0]} rot={[0, 0.3, 0.12]} fallback={<Box p={[-1.15, 0.3 * s, 0]} s={[0.5, 0.62, 0.18]} rot={[0, 0.3, 0.12]} color={N3.coral} line={3} />} />,
    (s: number) => <Glb name="soda_can" p={[-0.55, 0, 0.2]} line={2} fallback={<Cyl p={[-0.55, 0.17 * s, 0.2]} rt={0.1} h={0.34} color={N3.gold} line={2} />} />,
    (s: number) => <Glb name="pizza_box" p={[0.1, 0, -0.15]} fallback={<Box p={[0.1, 0.06 * s, -0.15]} s={[0.95, 0.1, 0.95]} color="#b9772e" line={3} />} />,
    (s: number) => <Glb name="soda_can" p={[0.9, 0, 0.1]} rot={[0, 1, 0]} line={2} fallback={<Cyl p={[0.9, 0.17 * s, 0.1]} rt={0.1} h={0.34} color={N3.coral} line={2} />} />,
    (s: number) => <Box p={[0.1, 0.16 * s, -0.15]} s={[0.8, 0.1, 0.8]} color="#2a3355" line={3} />,
    (s: number) => <Glb name="chips_bag" p={[1.2, 0, -0.25]} rot={[0, -0.4, -0.1]} s={0.9} fallback={<Box p={[1.2, 0.27 * s, -0.25]} s={[0.42, 0.55, 0.16]} rot={[0, -0.4, -0.1]} color={N3.amber} line={3} />} />,
    (s: number) => <Glb name="soda_can" p={[-0.2, 0.0, 0.35]} rot={[0, 2, 0]} line={2} fallback={<Cyl p={[-0.2, 0.25 * s, 0.35]} rt={0.1} h={0.34} color="#7a2f26" line={2} />} />,
    (s: number) => <Box p={[0.15, 0.26 * s, -0.15]} s={[0.6, 0.1, 0.6]} color={N3.gold} line={3} />,
  ];
  return <group position={[x, y, z]}>{items.map((it, i) => { const s = clamp(n - i); return s > 0.01 ? <group key={i} scale={[s, s, s]}>{it(s)}</group> : null; })}</group>;
};
const Couch: React.FC<{ z?: number }> = ({ z = -1.3 }) => <Glb name="couch" blob={3.0} p={[0, 0, z]} fallback={<CouchBox z={z} />} />;
const CouchBox: React.FC<{ z?: number }> = ({ z = -1.3 }) => (
  <group position={[0, 0, z]}>
    <Box p={[0, 0.42, 0]} s={[4.8, 0.84, 1.5]} color={N3.navy2} />
    <Box p={[0, 1.3, -0.62]} s={[4.8, 1.3, 0.34]} color={N3.navy2} />
    <Box p={[-1.15, 0.92, 0.05]} s={[2.2, 0.18, 1.3]} color="#2e3758" line={3} /><Box p={[1.15, 0.92, 0.05]} s={[2.2, 0.18, 1.3]} color="#2e3758" line={3} />
    <Box p={[-2.55, 0.75, 0]} s={[0.4, 1.5, 1.6]} color="#1f2640" /><Box p={[2.55, 0.75, 0]} s={[0.4, 1.5, 1.6]} color="#1f2640" />
    <Box p={[1.75, 1.35, -0.35]} s={[0.8, 0.7, 0.22]} rot={[0, 0, 0.15]} color={N3.coral} line={3} />
  </group>
);
const Table: React.FC<{ z?: number }> = ({ z = 0.9 }) => (
  <group position={[0, 0, z]}>
    <Box p={[0, 0.56, 0]} s={[3.6, 0.12, 1.3]} color="#3a2717" />
    {[-1.6, 1.6].map((x) => <Box key={x} p={[x, 0.27, 0]} s={[0.14, 0.54, 1.1]} color="#24180e" line={3} />)}
  </group>
);
/** Remy's gaming den (navy brick, gold/coral neon, night window, clock, shelf, lamp, couch, table, rug, beanbag) */
const GamerRoom: React.FC<{ t: number; dawn?: number; clockH?: number; table?: boolean; snacks?: number; tvGlow?: number; decor?: boolean; hero?: V3 }> = ({ t, dawn = 0, clockH = 0, table = true, snacks = 8, tvGlow = 1, decor = true, hero = [0, 0, -1.35] }) => {
  const tv = tvGlow * (0.75 + 0.25 * Math.abs(Math.sin(t * 9.3) * Math.cos(t * 3.9)));
  return (<>
    <Lights3 warm={dawn > 0.4 ? "#ffd59a" : "#ffcf9a"} k={0.95 + 0.15 * dawn} hero={hero} prac={[[[7.2, 2.6, -2.9], N3.amber, 14], [[4.4, 3.9, -4.2], dawn > 0.3 ? N3.amber : "#7d8fd8", 6 + 14 * dawn], [[0, 5.9, -4.3], N3.gold, 8], [[-6.0, 3.0, -4.3], N3.coral, 6]]} />
    <Floor lit gain={SG} kind="tile" a="#30354c" b="#282c40" w={30} d={44} />
    <WallDoor lit gain={SG} z={-5} W={24} kind="brick" a="#2b3252" b="#232945" />
    <SideWall lit gain={SG} x={-9} kind="plain" a="#20263c" b="#20263c" />
    <NeonBar p={[0, 6.3, -4.9]} s={[15, 0.07, 0.05]} color={N3.gold} />
    <NeonBar p={[-6.4, 3.2, -4.9]} s={[0.07, 5.2, 0.05]} color={N3.coral} glow={0.4} />
    <NightWindow p={[4.4, 3.9, -4.92]} s={[3.2, 2.5]} dawn={dawn} />
    {decor && <><NeonClock p={[-5.0, 3.6, -4.9]} r={0.55} hours={clockH} />
    <NeonPoster p={[-3.2, 3.0, -4.92]} s={[1.2, 1.6]} art={0} />
    <NeonPoster p={[2.2, 2.9, -4.92]} s={[0.9, 1.2]} art={1} /></>}
    <Shelf p={[-7.3, 0, -4.4]} w={2.4} rows={4} wood="#24180e" cols={[N3.gold, "#2a3355", N3.coral, "#1d2236", N3.amber, "#3a2c52"]} />
    <Lamp p={[7.2, 0, -3.4]} color={N3.amber} /><Halo p={[7.2, 2.75, -3.4]} r={1.0} color={N3.amber} o={0.7} />
    <Ball p={[5.6, 0.55, -1.6]} r={0.75} color={N3.coral} s={[1.2, 0.75, 1.1]} />
    {[0, 1, 2, 3].map((i) => <Box key={i} p={[6.3 + (i % 2) * 0.05, 0.12 + i * 0.22, 0.8]} s={[1.0, 0.2, 0.7]} rot={[0, i * 0.15, 0]} color={[N3.gold, "#2a3355", N3.coral, "#1d2236"][i]} line={3} />)}
    <Cabinet p={[-5.6, 0, -4.3]} w={1.4} h={1.6} color="#1d2236" />
    <Monitor p={[-5.6, 1.6, -4.3]} s={0.9} screen="#1a1730" />
    <Rug p={[0, 0, 0.3]} s={[7.5, 4.4]} a="#120d09" b={N3.gold} />
    <Couch />
    {/* snack side table beside the couch (not in the foreground: nothing important in the caption band) */}
    {table && <><Glb name="side_table" blob={1.4} p={[-1.9, 0, -0.2]} fallback={<group position={[-1.9, 0, -0.2]} scale={[0.6, 1.75, 0.8]}><Table z={0} /></group>} /><group position={[-1.9, 0, -0.2]} scale={[0.6, 0.6, 0.6]}><Snacks n={snacks} x={0} z={0} y={1.72} /></group></>}
    <pointLight position={[0, 1.8, 4.0]} intensity={6 * tv} distance={10} decay={1.4} color="#ffcf9a" />
    <Halo p={[0, 1.6, 2.6]} r={2.6} color={N3.amber} o={0.05 * tv} />
    <Motes t={t} n={10} c={[0, 0.5, -1]} area={[5, 5, 3]} />
    <Dust t={t} area={[10, 6, 6]} color="rgba(245,185,66,.9)" />
  </>);
};

// ---------------------------------------------------------------- shot builder
type View = { world: React.ReactNode; hud?: React.ReactNode; black?: number; dim?: number };
const build = (id: string, f: number, u: number, len: number, C: (p: string, fb: number) => number, hide: boolean): View => {
  const t = f / FPS;
  switch (id) {
    case "hook": { // frame 0 sting: WHAT IF already drawing on, Remy lit on the couch mashing the controller; counter + subtitle follow
      const NS = C("No sleep", 117), NB = C("No breaks", 150);
      const wp = k(u, 0, 34, 0.42, 1, EASE.arrive);
      const world = <>
        <GamerRoom t={t} />
        <Hero p={[0, 0.2, -1.35]} look={REMY} pose={{ arms: "hold", mood: u >= NS ? "deadpan" : "grin", lookX: Math.sin(f * 0.21) * 0.6 }} f={f} shadow={false} rimO={0.45} />
        <Pad p={[0, 1.2, -1.2]} f={f} />
        <HeroLight p={[0, 0, -1.35]} h={6.2} r={1.6} t={t} />
        <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} keys={[ck(0, [1.2, 2.45, 6.9], [0.1, 2.33, -1.3], 42, 0.03), ck(len, [0.5, 2.42, 6.8], [0.05, 2.32, -1.3], 41, -0.01)]} />
      </>;
      const hud = !hide && <>
        <StrokeWord text="WHAT IF" x={540} y={565} h={125} p={wp} />
        <LiveCounter f={u} from={0} to={0} at={16} tag="DAY 1" />
        <HudText f={u} x={540} y={790} size={58} color={CREAM} enter="rise" at={30} out={len - 6}>GOAL: 720 H</HudText>
      </>;
      return { world, hud };
    }
    case "crash": { // the only CHOICE CARDS: where do you crash first? Remy stands on the rug scratching his beanie
      const pick = u < 24 ? -1 : Math.floor((u - 24) / 10) % 4;
      const world = <>
        <GamerRoom t={t} hero={[0.2, 0, 2.2]} />
        <Hero p={[0.2, 0, 2.2]} look={REMY} pose={{ arms: "head", mood: "worry", nerv: 0.5, lookX: pick >= 0 ? [-1, 1, -1, 1][pick] : 0 }} f={f} rimO={0.4} />
        <HeroLight p={[0.2, 0, 2.2]} h={6} r={1.3} t={t} />
        <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} keys={[ck(0, [0.5, 3.3, 15.3], [0.25, 2.56, 2.2], 46, 0.02), ck(len, [-0.5, 3.2, 14.7], [0.1, 2.54, 2.2], 46, -0.01)]} />
      </>;
      const hud = !hide && <>
        <HudText f={u} x={540} y={420} size={62} color={CREAM} enter="words" at={0} out={len - 6}>WHERE DO YOU</HudText>
        <HudText f={u} x={540} y={505} size={78} color={GOLD} enter="scale" at={4} out={len - 6}>CRASH FIRST?</HudText>
        <ChoiceCards f={u} y={790} at={6} pick={pick} pickAt={24} out={len - 6}
          cards={[{ letter: "A", text: "HOUR 17" }, { letter: "B", text: "DAY 2" }, { letter: "C", text: "DAY 3" }, { letter: "D", text: "NEVER" }]} />
      </>;
      return { world, hud, dim: 0.25 };
    }
    case "hour0": { // chapter HOUR 0 / LAUNCH NIGHT; snacks pop onto the table one by one; the phone goes silent; Remy: READY.
      const SS = C("Snacks stacked", 61), PS = C("Phone on", 89), YR = C("You're ready", 128);
      const chapOut = SS - 8;
      const silent = u >= PS + 4;
      const nSn = k(u, SS - 2, SS + 22, 0, 8, Easing.linear);
      const ready = u >= YR;
      const jump = ready ? Math.max(0, Math.sin(((u - YR) / 14) * Math.PI)) * (u - YR < 14 ? 1 : 0) : 0;
      const world = <>
        <GamerRoom t={t} snacks={nSn} hero={[1.9, 0, 1.6]} />
        <group position={[-1.3, 1.07, 0.05]} rotation={[-0.35, 0.2, 0]}>
          <Glb name="smartphone" p={[0, 0.3, 0]} line={2} fallback={<Box p={[0, 0.3, 0]} s={[0.4, 0.7, 0.05]} color="#11131f" line={3} />} />
          <Panel p={[0, 0.3, 0.035]} s={[0.34, 0.62]} px={[136, 248]} dep={(silent ? 1 : 0) + Math.floor(u / 6) % 2 * 2} draw={(c, W, H) => {
            c.fillStyle = "#0a0c16"; c.fillRect(0, 0, W, H); c.textAlign = "center"; c.font = `900 26px ${FONT3}`;
            if (silent) { c.strokeStyle = CORAL; c.lineWidth = 7; c.beginPath(); c.arc(W / 2, H * 0.42, 34, Math.PI, 0); c.lineTo(W / 2 + 34, H * 0.55); c.lineTo(W / 2 - 34, H * 0.55); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(W / 2 - 46, H * 0.3); c.lineTo(W / 2 + 46, H * 0.62); c.stroke(); c.fillStyle = CORAL; c.fillText("SILENT", W / 2, H * 0.8); }
            else { for (let i = 0; i < 3; i++) { c.fillStyle = i === 0 && Math.floor(u / 6) % 2 ? GOLD : "#2a2f45"; c.fillRect(12, 30 + i * 62, W - 24, 48); } }
          }} />
          {!silent && <Halo p={[0, 0.3, 0.1]} r={0.5} color={N3.gold} o={0.35 + 0.25 * Math.sin(f * 1.4)} />}
        </group>
        <Hero p={[1.9, 0.3 * jump, 1.6]} look={REMY} pose={{ arms: ready ? "up" : "chest", armK: ready ? 1 : 0.6, mood: ready ? "grin" : "smile", squash: ready ? -0.08 * jump : 0, lookX: -0.8 }} f={f} rimO={0.4} />
        <HeroLight p={[1.9, 0, 1.6]} h={6} r={1.2} t={t} />
        <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} keys={[ck(0, [4.6, 3.6, 11.4], [0.6, 2.1, 1.1], 46, 0.02), ck(len, [3.6, 3.4, 10.8], [0.6, 2.06, 1.1], 46, -0.01)]} />
      </>;
      const hud = !hide && <>
        <ChapterScreen f={u} id="h0" big="DAY 1" y={800} size={190} at={0} out={chapOut} />
        <LiveCounter f={u} from={0} to={0} at={chapOut + 8} tag="DAY 1" />
      </>;
      return { world, hud, dim: u < chapOut ? 0.55 : 0 };
    }
    case "hour17": { // medium close on Remy: counter ticks to 017; "YOU FEEL FINE" -> "YOU'RE NOT." heavy lids, sweat, head bob
      const YN = C("You're not", 71);
      const tired = k(u, YN, YN + 16, 0, 1, EASE.arrive);
      const world = <>
        <GamerRoom t={t} clockH={17} />
        <Hero p={[0, 0.2, -1.35]} look={REMY} pose={{ arms: "hold", mood: tired > 0.5 ? "tired" : "smile", lids: 0.15 + 0.35 * tired, bags: 0.2 + 0.6 * tired, sweat: 0.45 * tired, nod: tired * 0.12 * (0.5 + 0.5 * Math.sin(f * 0.09)), tilt: -0.05 * tired }} f={f} shadow={false} rimO={0.5} />
        <Pad p={[0, 1.2, -1.2]} f={f} />
        <HeroLight p={[0, 0, -1.35]} h={6.2} r={1.5} t={t} />
        <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} keys={[ck(0, [0.7, 2.2, 6.4], [0.05, 1.98, -1.3], 40, 0.02), ck(len, [-0.3, 2.2, 5.9], [0, 1.98, -1.3], 40, -0.02)]} />
      </>;
      const hud = !hide && <>
        <LiveCounter f={u} from={0} to={17} at={2} dur={22} tag="DAY 1" />
      </>;
      return { world, hud };
    }
    case "study": { // test lab: Remy (17-19 h awake) and someone at the drink-drive limit wobble the same; bars fill equally
      const AS = C("as badly", 126), DD = C("drink drive", 221), PD = C("people did", 110), MC = C("many countries", 250);
      const sway = Math.sin(f * 0.11) * (0.04 + 0.06 * k(u, AS, AS + 20, 0, 1));
      const slump = k(u, AS, AS + 16, 0, 1, EASE.arrive);
      const world = <>
        <Lights3 hero={[0, 0, 0.6]} prac={[[[-3.6, 1.8, -2.9], N3.gold, 7], [[3.6, 1.8, -2.9], N3.gold, 7], [[0, 1.4, -4.3], N3.coral, 5], [[0, 5.3, -4.3], N3.gold, 8]]} />
        <Floor lit gain={SG} kind="tile" a="#2e3550" b="#262c44" w={30} d={44} />
        <WallDoor lit gain={SG} z={-5} W={24} kind="plain" a="#2a3150" b="#2a3150" />
        <NeonBar p={[0, 5.6, -4.9]} s={[13, 0.07, 0.05]} color={N3.gold} />
        <Panel p={[0, 0.95, -4.9]} s={[2.6, 1.3]} px={[440, 220]} dep={Math.floor(u / 8)} draw={(c, W, H) => {
          c.fillStyle = "#0a0d18"; c.fillRect(0, 0, W, H); c.strokeStyle = GOLD; c.lineWidth = 6; c.strokeRect(6, 6, W - 12, H - 12);
          c.strokeStyle = "rgba(245,185,66,.25)"; c.lineWidth = 2; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(0, (H * i) / 6); c.lineTo(W, (H * i) / 6); c.stroke(); }
          const ph = Math.floor(u / 8); c.fillStyle = CORAL; c.beginPath(); c.arc(60 + ((ph * 97) % (W - 120)), 50 + ((ph * 53) % (H - 100)), 18, 0, 7); c.fill();
        }} />
        {[-3.6, 3.6].map((x) => <group key={x}><Box p={[x, 0.55, -3.6]} s={[2.4, 1.1, 1.1]} color="#1d2236" /><Monitor p={[x, 1.1, -3.7]} s={1.0} screen="#2a2210" /></group>)}
        <Cabinet p={[-6.5, 0, -4.4]} w={1.6} h={2.4} color="#1d2236" />
        <Shelf p={[6.6, 0, -4.4]} w={2.4} rows={3} wood="#24180e" cols={[N3.gold, "#2a3355", N3.coral, "#1d2236"]} />
        <NeonClock p={[5.2, 4.7, -4.9]} r={0.5} hours={5 + u / 400} />
        <Hero p={[-1.5, 0, 0.6]} look={REMY} pose={{ mood: "tired", lids: 0.35, bags: 0.6, sweat: 0.3, tilt: sway, hunch: slump * 0.8, arms: "down" }} f={f} rimO={0.4} />
        <Hero p={[1.5, 0, 0.6]} look={MO} pose={{ mood: "deadpan", lids: 0.45, tilt: sway, hunch: slump * 0.8, arms: "down" }} f={f + 7} rim={N3.coral} rimO={0.35} />
        <HeroLight p={[-1.5, 0, 0.6]} h={6} r={1.1} t={t} /><HeroLight p={[1.5, 0, 0.6]} h={6} r={1.1} t={t + 1} color={N3.coral} o={0.8} />
        <Motes t={t} c={[0, 0.5, 0]} area={[4, 5, 2]} />
        <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} keys={[ck(0, [1.2, 3.1, 12.3], [0.1, 2.3, 0.6], 46, 0.0), ck(len, [-0.6, 3.0, 11.85], [-0.05, 2.28, 0.6], 46, 0.0)]} />
      </>;
      const hud = !hide && <>
        <HudText f={u} x={540} y={410} size={60} color={CREAM} enter="rise" at={2} out={len - 6}>RESEARCH · 2000</HudText>
        <CompareBars f={u} y={530} gap={190} bh={70} labelSize={46} out={len - 6} rows={[
          { label: "17-19 H AWAKE", fill: 0.74, at: PD },
          { label: "BLOOD ALCOHOL 0.05%", fill: 0.74, color: CORAL, at: AS },
        ]} />
        <Stamp f={u} x={540} y={920} text="SOME TESTS: EQUAL" at={MC + 8} out={len - 6} color={GOLD} size={48} rot={-2} />
      </>;
      return { world, hud };
    }
    case "hour24": { // the game world (cyan road) runs right up to Remy's couch: the toy car drifts, Remy sways with it
      const IG = C("In the game", 124), IH = C("in your head", 170);
      const sway = Math.sin(u * 0.07) * (0.6 + 0.4 * k(u, 0, len, 0, 1));
      const head = k(u, IH - 2, IH + 14, 0, 1, EASE.arrive);
      const roll = 0.05 * sway * (0.4 + 0.6 * head);
      const dash = (u * 0.09) % 1.6;
      const world = <>
        <Lights3 k={0.75} hero={[0, 0, -7.5]} rim={N3.cyan} prac={[[[0, 0.6, -3], N3.cyan, 10], [[-2.6, 2.6, -5.6], N3.cyan, 8], [[2.6, 2.6, -2.4], N3.cyan, 8], [[sway * 0.9, 0.6, -4.9], N3.coral, 4]]} />
        <Floor lit gain={SG} kind="tile" a="#07080e" b="#090b12" w={30} d={40} />
        <mesh position={[0, 0.01, -2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3.2, 30]} /><meshBasicMaterial color="#0d1220" /></mesh>
        {[-1.6, 1.6].map((x) => <NeonBar key={x} p={[x, 0.04, -2]} s={[0.06, 0.04, 30]} color={CYAN} glow={0} />)}
        {Array.from({ length: 14 }, (_, i) => <NeonBar key={i} p={[0, 0.03, 8 - i * 1.6 + dash]} s={[0.1, 0.03, 0.7]} color={CYAN} glow={0} o={0.8} />)}
        {Array.from({ length: 6 }, (_, i) => <group key={i}><NeonBar p={[i % 2 ? 2.6 : -2.6, 1.4, 4 - i * 3.2]} s={[0.06, 2.8, 0.06]} color={CYAN} glow={0.3} /><Halo p={[i % 2 ? 2.6 : -2.6, 2.85, 4 - i * 3.2]} r={0.5} color={CYAN} o={0.6} /></group>)}
        <FloorPool p={[0, 0, -2]} r={3} color={CYAN} o={0.15} sx={0.6} />
        <group position={[sway * 0.9 - k(u, IG, IG + 36, 0, 5, Easing.in(Easing.quad)), 0, -5.6]} rotation={[0, Math.PI / 2 + 0.35 * Math.cos(u * 0.07), 0]}><Glb name="toy_car" blob={0.9} fallback={<group scale={0.32}><Taxi p={[0, 0, 0]} color={CORAL} /></group>} /></group>
        <Halo p={[sway * 0.9, 0.3, -6.0]} r={0.6} color={CORAL} o={0.3} />
        <Couch z={-7.5} />
        <Hero p={[0, 0.2, -7.55]} look={REMY} pose={{ arms: "hold", mood: head > 0.5 ? "dizzy" : "tired", lids: 0.3, bags: 0.8, sweat: 0.5, tilt: 0.16 * sway }} f={f} shadow={false} rimO={0.5} />
        <Pad p={[0, 1.2, -7.4]} f={f} />
        <HeroLight p={[0, 0, -7.5]} h={6} r={1.6} t={t} />
        {head > 0 && <Panel p={[0, 1.75, -7.2]} s={[2.0, 2.0]} px={[256, 256]} additive o={head} dep={Math.floor(u / 2)} draw={(c, W) => {
          c.strokeStyle = CYAN; c.shadowColor = CYAN; c.shadowBlur = 14; c.lineWidth = 7; c.setLineDash([16, 14]); c.lineDashOffset = -u * 2; c.beginPath(); c.arc(W / 2, W / 2, W * 0.44, 0, 7); c.stroke();
        }} />}
        <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} keys={[ck(0, [0.3, 2.8, 3.0], [0, 1.6, -6], 44, 0), ck(IG, [0.2, 2.6, 1.2], [0, 1.85, -7.5], 44, roll), ck(Math.max(IG + 1, len), [0, 2.3, -0.85], [0, 2.0, -7.55], 42, roll)]} />
      </>;
      const hud = !hide && <>
        <LiveCounter f={u} from={17} to={24} at={2} dur={18} tag="DAY 2" />
      </>;
      return { world, hud };
    }
    case "day2": { // chapter DAY 2; Remy on a tiny stage at a mic trips over a tongue twister: the bubble's letters scramble
      const BS = C("You stumble", 30);
      const chapOut = BS + 26;
      const scr = u > BS + 10;
      const sc = (w: string, s: number) => { if (!scr || w.length < 4) return w; const m = w.slice(1, -1).split(""); const sd = Math.floor((u + s) / 5); for (let i = m.length - 1; i > 0; i--) { const j = Math.floor(rnd(sd * 13 + i) * (i + 1)); [m[i], m[j]] = [m[j], m[i]]; } return w[0] + m.join("") + w[w.length - 1]; };
      const line1 = sc("SHE", 0) + " " + sc("SELLS", 3), line2 = sc("SEASHELLS", 7);
      const bp = pop(u, chapOut + 2, 12);
      const wob = Math.sin(f * 0.13) * 0.08 * k(u, BS, BS + 20, 0.3, 1);
      const world = <>
        <Lights3 k={0.85} hero={[0.15, 0.5, 0.5]} rim={N3.coral} prac={[[[0, 0.9, 2.4], N3.amber, 12], [[-4.2, 4.6, -2.1], N3.coral, 6], [[4.2, 4.6, -2.1], N3.coral, 6], [[0, 3, -3.8], N3.coral, 5]]} />
        <Floor lit gain={SG} kind="plank" a="#3e2c1c" b="#352516" w={30} d={44} />
        <Curtain p={[0, 4.2, -4.6]} s={[16, 8.6]} color="#3a1612" folds={12} />
        <Box p={[0, 0.25, -0.5]} s={[9, 0.5, 5]} color="#1b1410" />
        <NeonBar p={[0, 0.52, 2.02]} s={[9, 0.06, 0.06]} color={N3.gold} />
        {Array.from({ length: 7 }, (_, i) => <Halo key={i} p={[-3.6 + i * 1.2, 0.62, 2.05]} r={0.32} color={N3.amber} o={0.7} />)}
        <Glb name="mic_stand" blob={0.45} p={[0.85, 0.5, 0.75]} rot={[0, -0.5, 0]} fallback={<>
          <Cyl p={[0.9, 1.4, 0.75]} rt={0.03} h={1.8} color="#2b3350" line={2} rot={[0, 0, -0.15]} />
          <Cyl p={[0.9, 0.55, 0.75]} rt={0.35} h={0.06} color="#2b3350" line={2} />
          <Ball p={[0.76, 2.35, 0.78]} r={0.12} color="#3a3f55" /></>} />
        <Hero p={[0.15, 0.5, 0.5]} look={REMY} pose={{ mood: scr ? "dizzy" : "worry", nerv: 0.6, sweat: 0.6, lids: 0.25, bags: 0.8, tilt: wob, arms: scr ? "head" : "chest", armK: 0.9 }} f={f} rimO={0.5} />
        <HeroLight p={[0.15, 0.5, 0.5]} h={6} r={1.4} t={t} />
        {[-4.2, 4.2].map((x) => <group key={x}><Cyl p={[x, 2.2, -2.5]} rt={0.5} h={4.4} color="#1d2236" /><NeonBar p={[x, 4.45, -2.5]} s={[1.0, 0.06, 1.0]} color={N3.coral} glow={0.3} /></group>)}
        {bp > 0 && <group scale={[bp, bp, bp]} position={[-0.5, 3.35, 0.4]}><Panel p={[0, 0, 0]} s={[3.0, 1.42]} px={[540, 255]} face dep={line1 + line2} draw={(c, W, H) => {
          c.fillStyle = "#0b0d16"; c.strokeStyle = GOLD; c.lineWidth = 8; c.beginPath(); c.roundRect(8, 8, W - 16, H - 50, 34); c.fill(); c.stroke();
          c.beginPath(); c.moveTo(W * 0.62, H - 44); c.lineTo(W * 0.7, H - 4); c.lineTo(W * 0.74, H - 44); c.fill(); c.stroke();
          c.fillStyle = CREAM; c.textAlign = "center"; c.font = `900 66px ${FONT3}`; c.fillText(line1, W / 2, 92); c.fillStyle = scr ? CORAL : CREAM; c.fillText(line2, W / 2, 166);
        }} /></group>}
        <Motes t={t} c={[0, 1, 0]} area={[4, 5, 2]} />
        <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} keys={[ck(0, [1.6, 2.7, 11.3], [0.15, 2.6, 0.5], 46, 0.02), ck(len, [0.65, 2.6, 10.9], [0.15, 2.58, 0.5], 46, -0.04)]} />
      </>;
      const hud = !hide && <>
        <ChapterScreen f={u} id="d2" big="DAY 2" y={800} size={210} at={BS} out={chapOut} />
        <LiveCounter f={u} from={24} to={36} at={chapOut + 8} dur={20} tag="DAY 2" />
      </>;
      return { world, hud, dim: u >= BS - 4 && u < chapOut ? 0.55 : 0 };
    }
    case "day3": { // high angle: Remy slumped on the floor among wrappers; the (cyan, game) mission marker cracks and fades; queasy camera
      const FM = C("You forget", 22), FS = C("You feel sick", 114);
      const q = k(u, FS - 6, FS + 20, 0, 1);
      const broken = k(u, FM + 16, FM + 50, 0, 1);
      const sick = u >= FS;
      const world = <>
        <GamerRoom t={t} table={false} clockH={60} decor={false} hero={[0, 0, 1.5]} />
        {[[-2.4, 0.9, 0.4], [2.6, 0.6, -0.6], [1.6, -0.3, 1.2], [-1.6, -0.2, 2.2], [2.0, 1.0, 1.6]].map(([x, z, r], i) =>
          <Box key={i} p={[x, 0.06, z]} s={[0.5, 0.08, 0.36]} rot={[0, r, 0]} color={SNACK_COLS[i % 5]} line={3} />)}
        {[[-0.9, 0.8], [1.2, 0.2]].map(([x, z], i) => <Cyl key={i} p={[x, 0.1, z]} rt={0.1} h={0.34} rot={[0, 0, Math.PI / 2]} color={i ? N3.coral : N3.gold} line={2} />)}
        <Pad p={[1.3, 0.1, 1.0]} f={0} rot={[0, 0.5, 0]} />
        <Hero p={[0, -0.75, 1.5]} look={REMY} pose={{ mood: sick ? "sick" : "tired", lids: 0.45, bags: 1, sweat: sick ? 0.9 : 0.4, hunch: 1, tilt: -0.12 + 0.05 * Math.sin(f * 0.08) * q, arms: "chest", armK: sick ? 1 : 0.3 }} f={f} shadow={false} rim={sick ? N3.coral : N3.amber} rimO={0.45} />
        <FloorPool p={[0, 0, 1.6]} r={1.6} color={sick ? N3.coral : N3.amber} o={0.45} />
        <Panel p={[0, 2.6 + 0.08 * Math.sin(f * 0.1), 1.6]} s={[1.8, 1.8]} px={[256, 256]} additive face o={1 - 0.75 * broken} dep={Math.round(broken * 40)} draw={(c, W) => {
          const m = W / 2, d = broken * 34; c.strokeStyle = CYAN; c.shadowColor = CYAN; c.shadowBlur = 16; c.lineWidth = 9;
          for (const s of [-1, 1]) { c.save(); c.translate(s * d, s * d * 0.4); c.rotate(s * broken * 0.25); c.beginPath(); c.rect(s < 0 ? 0 : m, 0, m, W); c.clip();
            c.beginPath(); c.moveTo(m, 30); c.lineTo(W - 40, m); c.lineTo(m, W - 30); c.lineTo(40, m); c.closePath(); c.stroke(); c.font = `900 110px ${FONT3}`; c.fillStyle = CYAN; c.textAlign = "center"; c.fillText("!", m, m + 40); c.restore(); }
        }} />
        <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} keys={[ck(0, [2.2, 6.3, 14.3], [0, 2.76, 1.5], 46, 0.03 * Math.sin(u * 0.07) * (0.3 + q)), ck(len, [1.2, 6.0, 13.95], [0, 2.74, 1.5], 46, 0.05 * Math.sin(u * 0.07) * (0.3 + q))]} />
      </>;
      const hud = !hide && <>
        <LiveCounter f={u} from={48} to={60} at={FM + 4} dur={20} tag="DAY 3" />
        <HudText f={u} x={540} y={670} size={56} color={CORAL} enter="rise" at={FM + 10} out={len - 6}>OBJECTIVE: ???</HudText>
      </>;
      return { world, hud };
    }
    case "real":
    case "symptoms": { // 1964 room: wood panels, wall calendar (year rolls 2026 -> 1964), SAN DIEGO sign, radio, old TV (off)
      const isR = id === "real";
      const Y64 = isR ? C("In nineteen", 45) : -999, SY = isR ? C("seventeen year", 100) : -999, RG = isR ? C("Randy Gardner", 183) : -999, FR = isR ? C("for real", 215) : -999, NG = isR ? C("No games", 264) : -999;
      const MO_ = !isR ? C("his mood", 39) : 0, SR = !isR ? C("some reports", 95) : 0, ST = !isR ? C("saw things", 137) : 0, WT = !isR ? C("weren't there", 160) : 0;
      const year = isR ? Math.round(k(u, Y64, Y64 + 26, 2026, 1964, EASE.arrive)) : 1964;
      const chapIn = isR && u >= Y64 - 4 && u < RG;
      const gp = isR ? 0 : k(u, ST - 4, ST + 18, 0, 1, EASE.arrive);
      const randyMood: Pose["mood"] = isR ? (u >= NG ? "deadpan" : u >= RG ? "smile" : "deadpan") : (u >= ST ? "shock" : u >= MO_ ? "worry" : "tired");
      const world = <>
        <Lights3 warm="#ffd7a0" hero={[isR ? 0 : 1.2, 0, 0.6]} prac={[[[4.6, 2.6, -1.2], N3.amber, 12], [[0, 5.8, -4.2], N3.gold, 9], [[-1.2, 1.6, -3.6], N3.amber, 5], [[2.8, 1.9, -4.4], "#7d8fd8", 5], ...(!isR ? [[[1.2, 2.4, -0.8], N3.cyan, 10 * gp] as Prac] : [])]} />
        <Floor lit gain={SG} kind="carpet" a="#3a3048" b="#31283e" w={30} d={44} />
        <WallDoor lit gain={SG} z={-5} W={24} kind="wood" a="#5a3a22" b="#4c311c" />
        <SideWall lit gain={SG} x={-9} kind="wood" a="#4c311c" b="#432b18" />
        {isR && <Panel p={[-2.6, 1.7, -4.88]} s={[1.5, 1.8]} px={[380, 460]} dep={year} draw={(c, W, H) => {
          c.fillStyle = "#f3e7cf"; c.fillRect(0, 0, W, H); c.fillStyle = "#9a3a2a"; c.fillRect(0, 0, W, 110); c.fillStyle = "#fff6e6"; c.textAlign = "center"; c.font = `900 76px ${FONT3}`; c.fillText("JAN", W / 2, 82);
          c.fillStyle = "#2a1b10"; c.font = `900 120px ${FONT3}`; c.fillText(String(year), W / 2, 260);
          c.strokeStyle = "rgba(42,27,16,.35)"; c.lineWidth = 3; for (let r = 0; r < 3; r++) for (let q = 0; q < 6; q++) c.strokeRect(22 + q * 56, 300 + r * 50, 50, 44);
        }} />}
        <NeonSign p={[0, 6.2, -4.85]} s={[4.2, 1.0]} text="SAN DIEGO" color={N3.gold} box />
        <NightWindow p={[2.8, 1.9, -4.92]} s={[2.2, 1.5]} seed={9} palm />
        <NeonClock p={[-2.8, 6.1, -4.88]} r={0.45} hours={u / 200} />
        {isR && <group position={[-1.5, 0, -4.2]}><Box p={[0, 0.55, 0]} s={[1.6, 1.1, 0.9]} color="#3a2412" /><Glb name="radio_1964" p={[0, 1.1, 0.05]} fallback={<><Box p={[0, 1.45, 0.05]} s={[1.4, 0.7, 0.6]} color="#5a3a1e" />
          <Panel p={[0, 1.45, 0.36]} s={[1.0, 0.45]} px={[200, 90]} dep={1} draw={(c, W, H) => { c.fillStyle = "#1a1008"; c.fillRect(0, 0, W, H); c.strokeStyle = N3.amber; c.lineWidth = 3; for (let x = 10; x < W * 0.6; x += 10) { c.beginPath(); c.moveTo(x, 8); c.lineTo(x, H - 8); c.stroke(); } c.fillStyle = N3.amber; c.beginPath(); c.arc(W * 0.8, H / 2, 18, 0, 7); c.fill(); }} /></>} />
          <Halo p={[0.38, 1.55, 0.45]} r={0.25} color={N3.amber} o={0.5} /></group>}
        <group position={[2.6, 0, -3.5]} rotation={[0, -0.25, 0]}><Glb name="tv_1964" blob={1.1} fallback={<><Box p={[0, 0.5, 0]} s={[1.6, 1.0, 1.2]} color="#3a2412" /><Box p={[0, 1.55, 0]} s={[1.6, 1.2, 1.2]} color="#4a3220" />
          <Box p={[-0.1, 1.55, 0.61]} s={[1.1, 0.85, 0.02]} color="#1c1f26" line={3} /><Cyl p={[-0.2, 2.45, 0]} rt={0.02} h={0.8} rot={[0, 0, 0.5]} color="#9aa0b8" line={1} /><Cyl p={[0.2, 2.45, 0]} rt={0.02} h={0.8} rot={[0, 0, -0.5]} color="#9aa0b8" line={1} /></>} />
          {isR && u >= NG && <NeonSign p={[-0.15, 1.6, 0.6]} s={[1.0, 0.5]} text="OFF" color={N3.coral} />}</group>
        <group position={[-4.4, 0, -1.6]} rotation={[0, 0.5, 0]}><Box p={[0, 0.45, 0]} s={[1.5, 0.9, 1.4]} color="#5a2a20" /><Box p={[0, 1.25, -0.6]} s={[1.5, 1.3, 0.3]} color="#5a2a20" /><Box p={[-0.7, 0.9, 0]} s={[0.24, 0.6, 1.4]} color="#4a2018" /><Box p={[0.7, 0.9, 0]} s={[0.24, 0.6, 1.4]} color="#4a2018" /></group>
        <Lamp p={[4.6, 0, -1.6]} color={N3.amber} /><Halo p={[4.6, 2.75, -1.6]} r={0.9} color={N3.amber} o={0.6} />
        <Rug p={[0, 0, 0.6]} s={[6, 3.6]} a="#2a1410" b={N3.coral} />
        <Hero p={[isR ? 0 : 1.2, 0, 0.6]} look={RANDY} pose={{ mood: randyMood, arms: isR && u >= RG && u < NG ? "up" : isR ? "down" : u >= ST ? "head" : "chest", armK: 0.85, lids: isR ? 0 : 0.35, bags: isR ? 0.2 : 0.8, sweat: isR ? 0 : 0.5, nerv: !isR && u >= ST ? 0.7 : 0, lookX: !isR && u >= ST ? Math.sin(f * 0.2) : 0 }} f={f} rim={N3.amber} rimO={0.45} />
        <HeroLight p={[isR ? 0 : 1.2, 0, 0.6]} h={6} r={1.3} t={t} />
        {!isR && gp > 0 && [[-0.3, 1.2, -0.4], [2.4, 1.3, -0.2], [-1.6, 0.7, -2.6]].map(([x, y, z], i) => (
          <Panel key={i} p={[x, y + 0.15 * Math.sin(f * 0.08 + i), z]} s={[1.3, 1.5]} px={[160, 184]} additive face o={gp * 0.85} dep={i} draw={(c, W, H) => {
            c.strokeStyle = CYAN; c.shadowColor = CYAN; c.shadowBlur = 12; c.lineWidth = 6; c.setLineDash([10, 9]);
            c.beginPath(); c.moveTo(20, H - 14); c.lineTo(20, 70); c.quadraticCurveTo(20, 14, W / 2, 14); c.quadraticCurveTo(W - 20, 14, W - 20, 70); c.lineTo(W - 20, H - 14);
            for (let s = 0; s < 4; s++) c.lineTo(W - 20 - (s + 0.5) * (W - 40) / 4, s % 2 ? H - 14 : H - 40); c.lineTo(20, H - 14); c.stroke();
            c.setLineDash([]); c.fillStyle = CYAN; c.beginPath(); c.arc(W * 0.38, 72, 9, 0, 7); c.arc(W * 0.62, 72, 9, 0, 7); c.fill();
          }} />))}
        {!isR && gp > 0 && <Halo p={[1.2, 2.5, -1]} r={3} color={CYAN} o={0.08 * gp} />}
        <Motes t={t} c={[0, 0.5, -0.5]} area={[4, 5, 2.5]} />
        {isR ? <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} keys={[ck(0, [1.2, 3.1, 11.9], [0.1, 2.22, 0.6], 46, 0.02), ck(len, [-0.2, 3.0, 11.45], [0, 2.2, 0.6], 46, -0.01)]} />
          : <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} keys={[ck(0, [3.6, 2.7, 8.3], [1.2, 1.44, 0.6], 42, 0.03), ck(len, [2.7, 2.6, 7.9], [1.2, 1.42, 0.6], 42, 0.0)]} />}
      </>;
      const hud = !hide && (isR ? <>
        {chapIn && <ChapterScreen f={u} id="y64" big={String(year)} y={760} size={220} at={Y64} out={RG - 8} />}
        <HudText f={u} x={540} y={640} size={60} color={CREAM} enter="rise" at={FR} out={len - 6}>RANDY GARDNER, 17</HudText>
        <HudText f={u} x={540} y={720} size={46} color={GOLD} enter="rise" at={FR + 6} out={len - 6} spacing={3}>SAN DIEGO · 1964</HudText>
      </> : <>
        <HudText f={u} x={540} y={420} size={62} color={GOLD} enter="rise" at={0} out={len - 6}>SYMPTOMS</HudText>
        {[{ t: "MEMORY", a: MO_ + 6 }, { t: "MOOD", a: SR + 4 }, { t: "SEES THINGS (REPORTED)", a: WT + 12 }].map((it, i) => {
          const y = 545 + i * 100, cp = drawOn(u, it.a, 12);
          return <g key={i}>
            {cp > 0 && <rect x={86} y={y - 52} width={760} height={76} rx={14} fill="#000" opacity={0.5 * cp} />}
            {cp > 0 && <NeonPath d={`M 110 ${y - 40} L 154 ${y - 40} L 154 ${y + 4} L 110 ${y + 4} Z`} w={3} p={cp} color={NEON.dim} />}
            {cp > 0.5 && <NeonPath d={`M 116 ${y - 18} L 130 ${y - 2} L 156 ${y - 48}`} w={5} p={drawOn(u, it.a + 6, 10)} color={i === 2 ? CYAN : CORAL} hot />}
            <HudText f={u} x={184} y={y} size={i === 2 ? 44 : 54} color={i === 2 ? CYAN : CREAM} enter="rise" at={it.a + 4} out={len - 6} anchor="start">{it.t}</HudText>
          </g>;
        })}
      </>);
      return { world, hud, dim: chapIn ? 0.5 : 0 };
    }
    case "record": { // void stage with a gold grid: a day-block rises for every 24 h as the digits tick to 264; Guinness barrier slams down
      const ED = C("Eleven days", 96), GU = C("Guinness later", 124), TD = C("too dangerous", 229);
      const v = k(u, 6, 60, 0, 264, EASE.arrive);
      const st = u > 60 && u < 68 ? 1 + 0.1 * Math.sin(((u - 60) / 8) * Math.PI) : 1;
      const BA = GU + 26;
      const by = u < BA - 10 ? 6 : u < BA ? k(u, BA - 10, BA, 6, 0, Easing.in(Easing.quad)) : Math.abs(Math.sin((u - BA) * 0.35)) * 0.4 * Math.exp(-(u - BA) * 0.12);
      const world = <>
        <Lights3 k={0.9} hero={[-1.5, 0, 0.6]} prac={[[[0, 1.8, -1.4], N3.gold, 3 + 9 * clamp(v / 264)], [[1.4, 1.8, 2.0], N3.coral, u >= BA ? 9 : 0]]} />
        <Panel p={[0, 0, 2]} s={[40, 40]} rot={[-Math.PI / 2, 0, 0]} px={[800, 800]} dep={1} draw={(c, W, H) => {
          c.fillStyle = "#1a1e30"; c.fillRect(0, 0, W, H); c.strokeStyle = "rgba(245,185,66,.32)"; c.lineWidth = 2; for (let i = 0; i <= 30; i++) { c.beginPath(); c.moveTo((i * W) / 30, 0); c.lineTo((i * W) / 30, H); c.moveTo(0, (i * H) / 30); c.lineTo(W, (i * H) / 30); c.stroke(); }
        }} />
        {Array.from({ length: 11 }, (_, i) => {
          const g = clamp(v / 24 - i), h = 0.15 + 1.1 * g, x = -2.75 + i * 0.55, z = -1.6 - 0.08 * Math.abs(i - 5) ** 1.5;
          return <group key={i}><Box p={[x, h / 2, z]} s={[0.42, h, 0.42]} color={g >= 1 ? "#3a2c14" : "#1b2238"} line={3} />
            {g >= 1 && <NeonBar p={[x, h + 0.04, z]} s={[0.44, 0.06, 0.44]} color={N3.gold} glow={0} />}
            {g >= 1 && <Halo p={[x, h + 0.1, z]} r={0.3} color={N3.gold} o={0.5} />}</group>;
        })}
        <Hero p={[-1.5, 0, 0.6]} look={RANDY} pose={{ mood: u >= BA ? "worry" : "tired", lids: 0.55, bags: 1, sweat: 0.5, hunch: 0.5, tilt: 0.04 * Math.sin(f * 0.1) }} f={f} rimO={0.45} />
        <HeroLight p={[-1.5, 0, 0.6]} h={6} r={1.3} t={t} />
        {u >= BA - 10 && <group position={[1.4, by, 1.4]}><Barrier p={[0, 0, 0]} w={2.4} /></group>}
        {u >= BA - 10 && <NeonSign p={[1.4, 1.55 + by, 1.45]} s={[2.6, 0.55]} text="CLOSED" color={N3.coral} box />}
        <Motes t={t} c={[0, 0.3, 0]} area={[5, 4, 2]} />
        <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} impacts={[[BA, 0.015]]} keys={[ck(0, [0.6, 3.3, 14.6], [-0.55, 2.62, 0.6], 44, 0), ck(len, [-0.6, 3.2, 14.2], [-0.7, 2.6, 0.6], 44, -0.01)]} />
      </>;
      const hud = !hide && <>
        <HudText f={u} x={540} y={400} size={44} color={MUTED} enter="rise" at={0} out={len - 6} spacing={6}>HOURS AWAKE</HudText>
        <g opacity={arrive(u, 2, 10)} transform={`translate(540 560) scale(${st}) translate(-540 -560)`}>
          <Digits x={470} y={560} text={String(Math.round(v)).padStart(3, "0")} size={170} color={AMBER} anchor="middle" />
          <NeonText x={710} y={560} size={96} color={GOLD} anchor="start">H</NeonText>
        </g>
        <HudText f={u} x={540} y={690} size={66} color={GOLD} enter="scale" at={ED} out={len - 6}>= 11 DAYS</HudText>
        <HudText f={u} x={540} y={790} size={48} color={CREAM} enter="rise" at={TD} out={len - 6}>GUINNESS:</HudText>
        <Stamp f={u} x={540} y={890} text="NO MORE ATTEMPTS" at={TD + 6} out={len - 6} size={54} />
      </>;
      return { world, hud };
    }
    case "day30": { // DAY 30 glitches: a 30-day wall calendar lights to 11 and stops, the rest is crossed out; Remy nods off below
      const YN = C("You never", 43);
      const lit = Math.round(k(u, 6, 40, 0, 11, EASE.arrive));
      const cross = u >= YN;
      const gl = 0.18 * (0.5 + 0.5 * Math.sin(u * 0.15)); // calm, slow glitch
      const nod = 0.5 + 0.5 * Math.sin(f * 0.12);
      const world = <>
        <Lights3 k={0.85} hero={[2.4, 0, 0.4]} prac={[[[-0.3, 2.0, -3.0], N3.gold, 10], [[1.0, 0.9, -3.2], Math.floor(u / 15) % 2 ? N3.cyan : N3.coral, 4]]} />
        <Floor lit gain={SG} kind="tile" a="#252a3c" b="#2c3247" w={30} d={44} />
        <WallDoor lit gain={SG} z={-4} W={24} kind="plain" a="#272d46" b="#272d46" />
        <Panel p={[-0.3, 2.0, -3.9]} s={[4.2, 3.5]} px={[660, 550]} dep={lit * 10 + (cross ? 1 : 0) + Math.floor(u / 15) * 100} draw={(c, W, H) => {
          c.fillStyle = "#080a12"; c.fillRect(0, 0, W, H); c.strokeStyle = GOLD; c.lineWidth = 6; c.strokeRect(4, 4, W - 8, H - 8);
          const cw = W / 6, ch = H / 5; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `900 40px ${FONT3}`;
          for (let i = 0; i < 30; i++) { const x = (i % 6) * cw, y = Math.floor(i / 6) * ch, on = i < lit, last = i === 29;
            c.fillStyle = on ? "rgba(245,185,66,.28)" : "#0d1020"; c.fillRect(x + 8, y + 8, cw - 16, ch - 16);
            c.strokeStyle = on ? GOLD : "#2a2f45"; c.lineWidth = 3; c.strokeRect(x + 8, y + 8, cw - 16, ch - 16);
            c.fillStyle = last ? (Math.floor(u / 15) % 2 ? CYAN : CORAL) : on ? N3.hot : "#3a3f55"; c.fillText(String(i + 1), x + cw / 2 + (last ? (rnd(Math.floor(u / 15)) - 0.5) * 8 : 0), y + ch / 2);
            if (cross && i >= 11) { c.strokeStyle = CORAL; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 22, y + 22); c.lineTo(x + cw - 22, y + ch - 22); c.moveTo(x + cw - 22, y + 22); c.lineTo(x + 22, y + ch - 22); c.stroke(); } }
        }} />
        <Halo p={[-0.3, 2.0, -3.6]} r={3.2} color={N3.gold} o={0.1} />
        <Hero p={[2.4, 0, 0.4]} look={REMY} pose={{ mood: "tired", lids: 0.4 + 0.5 * nod, bags: 1, sweat: 0.6, nod: nod * 0.8, hunch: 0.6, tilt: -0.06 * nod }} f={f} rimO={0.45} />
        <HeroLight p={[2.4, 0, 0.4]} h={6} r={1.2} t={t} />
        <Motes t={t} c={[0, 0.3, 0]} area={[4, 4, 2]} />
        <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} keys={[ck(0, [2.6, 2.7, 12.9], [1.4, 2.44, 0.4], 46, 0.02), ck(len, [2.0, 2.6, 12.5], [1.4, 2.42, 0.4], 46, -0.02)]} />
      </>;
      const hud = !hide && <>
        <ChapterScreen f={u} id="d30" big="DAY 30" y={560} size={170} at={YN} glitch={gl} />
        <Stamp f={u} x={540} y={720} text="UNREACHABLE" at={YN + 20} out={len - 6} size={54} color={NEON.red} />
      </>;
      return { world, hud, dim: 0.35 };
    }
    case "micro": { // medium close on Remy: lids droop, the screen blacks out (microsleeps), he snaps back with a jolt
      const TN = C("tiny naps", 46), WY = C("whether you", 104);
      const B = [[TN + 4, 9], [WY + 2, 12], [len - 30, 7]];
      const inB = B.find(([s, d]) => u >= s && u < s + d);
      const since = Math.min(...B.map(([s, d]) => (u >= s + d ? u - (s + d) : 999)));
      const droop = Math.min(...B.map(([s]) => (u < s ? clamp((s - u) / 24) : 1)));
      const closed = since < 6 ? 0 : 1 - droop;
      const jolt = since < 8 ? Math.exp(-since * 0.5) : 0;
      const world = <>
        <GamerRoom t={t} clockH={300} />
        <Hero p={[0, 0.2, -1.35]} look={REMY} pose={{ arms: "hold", armK: 1 - closed * 0.5, mood: since < 6 ? "shock" : "tired", lids: since < 6 ? 0 : 0.3 + 0.7 * closed, bags: 1, sweat: 0.7, nod: since < 6 ? 0 : closed * 0.9, squash: -0.06 * jolt }} f={f} shadow={false} rimO={0.5} />
        <Pad p={[0, 1.2 - closed * 0.15, -1.2]} f={f} />
        <HeroLight p={[0, 0, -1.35]} h={6.2} r={1.5} t={t} />
        <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} kicks={B.map(([s, d]) => s + d)} keys={[ck(0, [0.6, 2.2, 6.2], [0, 1.98, -1.3], 40, 0.02), ck(len, [0, 2.2, 5.7], [0, 1.98, -1.3], 40, -0.02)]} />
      </>;
      const hud = !hide && !inB && <>
        <HudText f={u} x={540} y={680} size={92} color={GOLD} enter="scale" at={TN + 14} out={len - 6} tube spacing={4}>MICROSLEEP</HudText>
      </>;
      return { world, hud, black: inB ? 1 : 0 };
    }
    case "slept": { // 1964 bedroom: Randy finally asleep; the clock spins 14 hours, the window turns to dawn; HOURS ASLEEP 014
      const FH = C("fourteen hours", 77);
      const hrs = k(u, 0, len, 0, 14, EASE.camera);
      const world = <>
        <Lights3 warm="#ffd7a0" k={0.8} heroI={2} hero={[-0.4, 0, -1.4]} prac={[[[3.2, 2.0, -2.0], N3.amber, 5], [[0.6, 4.5, -3.3], k(u, 0, len, 0, 1) > 0.4 ? N3.amber : "#7d8fd8", 4 + 10 * k(u, 0, len, 0, 0.8)]]} />
        <Floor lit gain={SG} kind="carpet" a="#3a3048" b="#31283e" />
        <WallDoor lit gain={SG} z={-4} W={24} kind="wood" a="#5a3a22" b="#4c311c" />
        <NightWindow p={[0.6, 4.7, -3.92]} s={[2.6, 1.8]} dawn={k(u, 0, len, 0, 0.8)} seed={11} />
        <NeonClock p={[-2.3, 2.75, -3.9]} r={0.42} hours={hrs} />
        <Panel p={[-2.2, 1.65, -3.92]} s={[0.9, 1.08]} px={[200, 240]} dep={1964} draw={(c, W, H) => { c.fillStyle = "#f3e7cf"; c.fillRect(0, 0, W, H); c.fillStyle = "#9a3a2a"; c.fillRect(0, 0, W, 60); c.fillStyle = "#2a1b10"; c.textAlign = "center"; c.font = `900 60px ${FONT3}`; c.fillText("1964", W / 2, 150); }} />
        <group position={[0, 0, -1.6]}>
          <Glb name="bed_1964" blob={2.8} fallback={<>
          <Box p={[0, 0.35, 0]} s={[4.4, 0.7, 2.2]} color="#3a2412" />
          <Box p={[-2.25, 1.0, 0]} s={[0.2, 2.0, 2.3]} color="#4a2e18" /><Box p={[2.25, 0.7, 0]} s={[0.2, 1.4, 2.3]} color="#4a2e18" />
          <Box p={[0, 0.82, 0]} s={[4.2, 0.26, 2.0]} color="#efe3cc" />
          <Box p={[-1.6, 1.08, 0]} s={[0.9, 0.28, 1.2]} color="#fffaf0" /></>} />
          <LyingPuppet p={[-0.1, 1.5, 0.15]} h={2.6} look={RANDY} pose={{ mood: "sleep", arms: "down" }} f={f} />
          <Box p={[0.65, 1.12 + 0.02 * Math.sin(f * 0.1), 0.35]} s={[2.7, 0.34, 1.5]} color={N3.coral} />
          <Box p={[0.65, 1.3 + 0.02 * Math.sin(f * 0.1), 0.35]} s={[2.72, 0.04, 1.52]} color={N3.gold} line={2} />
        </group>
        <Box p={[3.2, 0.5, -2.4]} s={[1.0, 1.0, 0.9]} color="#3a2412" /><Lamp p={[3.2, 1.0, -2.4]} h={0.8} color={N3.amber} /><Halo p={[3.2, 2.0, -2.4]} r={0.8} color={N3.amber} o={0.55} />
        <Rug p={[0, 0, 1.2]} s={[5, 2.4]} a="#2a1410" b={N3.gold} />
        <HeroLight p={[-0.4, 0, -1.4]} h={6} r={1.8} t={t} o={0.35} />
        {[0, 1, 2].map((i) => { const q = ((f / 70 + i / 3) % 1); return <NeonSign key={i} p={[1.0 + q * 0.5, 2.0 + q * 0.5, -1.2]} s={[0.7, 0.7]} text="Z" color={N3.amber} face o={Math.min(1, (1 - q) * 3) * Math.min(1, q * 6)} />; })}
        <Motes t={t} c={[0, 0.5, -1]} area={[4, 4, 2]} />
        <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} keys={[ck(0, [1.8, 3.3, 7.9], [0, 1.8, -1.4], 44, 0.02), ck(len, [0.8, 3.2, 7.45], [0, 1.78, -1.4], 44, 0)]} />
      </>;
      const hud = !hide && <>
        <LiveCounter f={u} label="HOURS ASLEEP" from={0} to={14} at={FH} dur={16} />
      </>;
      return { world, hud };
    }
    case "speedrun": { // THE REAL SPEEDRUN: a gold loop ring on the floor, three stations light up PLAY / SLEEP / REPEAT; camera orbits
      const PL = C("Play. Sleep", 64), SL = C("Sleep. Repeat", 82), RP = C("Repeat.", 100);
      const R = 2.0;
      const ang = (deg: number) => (deg * Math.PI) / 180;
      const dotA = -90 + k(u, 0, PL, -120, 0) + k(u, PL, SL, 0, 120) + k(u, SL, RP, 0, 120) + (u > RP ? (u - RP) * 6 : 0);
      const at = (deg: number): V3 => [R * Math.cos(ang(deg)), 0, R * Math.sin(ang(deg))];
      const st = [{ a: -90, c: PL }, { a: 30, c: SL }, { a: 150, c: RP }];
      const D = at(dotA);
      const mode = u >= RP ? 3 : u >= SL ? 2 : u >= PL ? 1 : 0;
      const ring = drawOn(u, 0, 24);
      const word = mode === 3 ? "REPEAT" : mode === 2 ? "SLEEP" : mode === 1 ? "PLAY" : "";
      const oa = interpolate(u, [0, len], [0.35, -0.35]);
      const world = <>
        <Lights3 k={0.9} hero={[0, 0, 0]} prac={st.map((x) => { const q = at(x.a); return [[q[0], 1.3, q[2]], u >= x.c ? N3.coral : N3.dim, u >= x.c ? 7 : 2] as Prac; })} />
        <Floor lit gain={SG} kind="tile" a="#20253a" b="#1a1e30" w={30} d={44} />
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[R, 0.05, 8, 120, Math.PI * 2 * ring]} /><meshBasicMaterial color={N3.gold} toneMapped={false} /></mesh>
        <FloorPool p={[0, 0, 0]} r={R * 1.25} color={N3.gold} o={0.12} />
        <Ball p={[D[0], 0.12, D[2]]} r={0.12} color={N3.hot} ink={0.02} /><Halo p={[D[0], 0.2, D[2]]} r={0.6} color={N3.amber} o={0.8} />
        {st.map((s, i) => { const p = at(s.a), on = u >= s.c; return <group key={i} position={[p[0], 0, p[2]]}>
          <Cyl p={[0, 0.35, 0]} rt={0.55} h={0.7} color="#1b2238" />
          <NeonBar p={[0, 0.72, 0]} s={[1.1, 0.04, 1.1]} color={on ? N3.coral : "#5a4520"} glow={0} />
          <Halo p={[0, 1.3, 0]} r={on ? 1.1 : 0.5} color={on ? N3.coral : N3.dim} o={on ? 0.55 : 0.25} />
          {i === 0 && <Pad p={[0, 1.1, 0]} f={on ? f : 0} rot={[0.5, 0.3, 0]} />}
          {i === 1 && <group position={[0, 0.95, 0]}><Box p={[0, 0, 0]} s={[0.8, 0.2, 0.5]} color="#3a2412" line={2} /><Box p={[0.15, 0.13, 0]} s={[0.5, 0.08, 0.48]} color={N3.coral} line={2} /><Box p={[-0.27, 0.15, 0]} s={[0.2, 0.1, 0.36]} color="#fffaf0" line={2} /></group>}
          {i === 2 && <Panel p={[0, 1.2, 0]} s={[0.9, 0.9]} px={[180, 180]} face additive dep={on ? 1 : 0} draw={(c, W) => {
            const col = on ? N3.coral : N3.dim; c.strokeStyle = col; c.shadowColor = col; c.shadowBlur = 10; c.lineWidth = 12; c.lineCap = "round"; const m = W / 2;
            c.beginPath(); c.arc(m, m, W * 0.32, Math.PI * 1.15, Math.PI * 1.95); c.stroke(); c.beginPath(); c.arc(m, m, W * 0.32, Math.PI * 0.15, Math.PI * 0.95); c.stroke();
            c.beginPath(); c.moveTo(m + W * 0.3, m - W * 0.2); c.lineTo(m + W * 0.36, m - W * 0.02); c.lineTo(m + W * 0.18, m - W * 0.06); c.stroke();
            c.beginPath(); c.moveTo(m - W * 0.3, m + W * 0.2); c.lineTo(m - W * 0.36, m + W * 0.02); c.lineTo(m - W * 0.18, m + W * 0.06); c.stroke();
          }} />}
        </group>; })}
        <Hero p={[0, 0, 0]} look={REMY} pose={{ mood: mode === 2 ? "sleep" : mode === 3 ? "grin" : "smile", arms: mode === 1 ? "hold" : mode === 3 ? "up" : "down", lids: mode === 2 ? 1 : 0, nod: mode === 2 ? 0.4 : 0 }} f={f} rimO={0.5} />
        {mode === 1 && <Pad p={[0, 0.95, 0.12]} f={f} />}
        <HeroLight p={[0, 0, 0]} h={6.5} r={1.2} t={t} />
        <Motes t={t} c={[0, 0.3, 0]} area={[4, 4, 3]} />
        <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} keys={[ck(0, [12.5 * Math.sin(oa), 8, 12.5 * Math.cos(oa)], [0, 0.6, 0], 40, 0), ck(len, [12.5 * Math.sin(oa), 8, 12.5 * Math.cos(oa)], [0, 0.6, 0], 40, 0)]} />
      </>;
      const hud = !hide && <>
      </>;
      return { world, hud };
    }
    default: { // ask: dawn in the den, Remy rested (grin), waves then points at the viewer; loop icon + the question card
      const world = <>
        <GamerRoom t={t} dawn={0.85} clockH={8} hero={[0.2, 0, 1.9]} />
        <Hero p={[0.2, 0, 1.9]} look={REMY} pose={{ mood: "grin", arms: u > 24 ? "point" : "up", armK: u > 24 ? 1 : 0.7 + 0.3 * Math.sin(f * 0.5), tilt: u > 24 ? 0 : 0.04 * Math.sin(f * 0.25) }} f={f} rimO={0.45} />
        <HeroLight p={[0.2, 0, 1.9]} h={6} r={1.3} t={t} />
        <Shot u={u} len={len} cut={CUT[id] ?? [false, false]} keys={[ck(0, [1.6, 3.1, 12.2], [0.2, 2.04, 1.9], 46, 0.02), ck(len, [0.8, 3.0, 11.75], [0.2, 2.02, 1.9], 46, -0.01)]} />
      </>;
      const roll = Array.from({ length: 3 }, (_, i) => String(Math.floor(rnd(Math.floor(u / 3) * 5 + i) * 10))).join("");
      const qp = drawOn(u, 8, 14);
      const hud = !hide && <>
        <LiveCounter f={u} label="YOUR RECORD" from={0} to={0} at={0} display={u < 40 ? roll : "???"} unit="H" />
        <g transform="translate(870 436)"><RepeatIcon x={0} y={0} s={0.85} p={drawOn(u, 4, 16)} color={GOLD} /></g>
        {qp > 0 && <>
          <rect x={90} y={640} width={900} height={250} rx={26} fill="#000" opacity={0.55 * qp} />
          <NeonPath d="M 116 640 L 964 640 Q 990 640 990 666 L 990 864 Q 990 890 964 890 L 116 890 Q 90 890 90 864 L 90 666 Q 90 640 116 640 Z" p={qp} w={4} color={CORAL} />
        </>}
        <HudText f={u} x={540} y={740} size={66} color={CREAM} enter="rise" at={12} out={len + 30}>DROP YOUR HOURS</HudText>
        <HudText f={u} x={540} y={840} size={74} color={CORAL} enter="scale" at={18} out={len + 30}>IN THE COMMENTS</HudText>
      </>;
      return { world, hud };
    }
  }
};

// ---------------------------------------------------------------- scene: one persistent WebGL canvas + SVG HUD on top
const renderDpr = () => Number((getInputProps() as { dpr?: number }).dpr ?? 0.5);
const cueLocal = (words: Word[], phrase: string, span: ShotSpan, fallback: number) => {
  try { return Math.round(cueTime(words, phrase, span.a / FPS - 0.3) * FPS) - span.a; } catch { return fallback; }
};
const XF = 6, HALF = 3;
const Scene: React.FC<SceneProps> = ({ spans, words }) => {
  const f0 = useCurrentFrame();
  const span = shotAt(spans, f0);
  const prev = span.i > 0 ? spans[span.i - 1] : null;
  const u0 = f0 - span.a;
  const dip = !!prev && u0 < XF && PLACE[prev.id] !== PLACE[span.id];
  const show = dip && prev && u0 < HALF ? prev : span;
  const f = show === span ? f0 : show.b - 1;
  const u = f - show.a, len = show.b - show.a;
  const v = build(show.id, f, u, len, (p, fb) => cueLocal(words, p, show, fb), dip);
  const fade = dip ? (u0 < HALF ? (u0 + 1) / (HALF + 1) : 1 - (u0 - HALF + 1) / (XF - HALF + 1)) : 0;
  const black = Math.max(fade, v.black ?? 0);
  return (
    <AbsoluteFill style={{ background: N3.bg }}>
      <ThreeCanvas width={1080} height={1920} dpr={renderDpr()} linear flat shadows="soft" gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }}>
        <color attach="background" args={[N3.bg]} />
        <group key={show.id}>{v.world}</group>
        <ShadowSetup />
      </ThreeCanvas>
      <Grade t={f / FPS} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.42) 30%, rgba(0,0,0,0) 52%)" }} />
      {v.dim ? <AbsoluteFill style={{ background: "#000", opacity: v.dim }} /> : null}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}><NeonDefs />{v.hud || null}</svg>
      {black > 0 ? <AbsoluteFill style={{ background: "#000", opacity: black }} /> : null}
    </AbsoluteFill>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "wi-gta-nosleep",
  shots: SHOTS,
  Scene,
  flat: true,
  hookFlash: 0,
  background: N3.bg,
};
export default story;
