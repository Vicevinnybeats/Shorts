// TINY WORLD #1 - "The Sugar Road": Pip, a 3 mm odorous house ant, crosses a kitchen floor for one grain of sugar
// and paints the trail her sisters follow. Units: 1 = 1 mm. Every shot starts on a phrase of the narration.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, getInputProps } from "remotion";
import type { Story, SceneProps } from "../../src/engine/EpisodeShort";
import { shotAt, cueTime, FPS } from "../../src/engine/timeline";
import { CamState, V3, glide, creep, kick, smoother, easeOut, lerp, lerp3, clamp01 } from "../../src/engine/cam";
import { usePost, PostChain } from "../../src/engine/Post";
import { LOOKS, LookName, applyLook } from "../../src/engine/look";
import { Card } from "../../src/engine/card";
import { untone } from "../../src/vendor/bridge/shade";
import { buildKitchen, sugar } from "../../library/environments/kitchen";
import { drawAnt, antKey, AntPose, AntExpr } from "../../library/characters/ant";

const SHOTS = [
  { id: "hook", cue: "Day one." },
  { id: "meet", cue: "Pip is an odorous" },
  { id: "scent", cue: "No map." },
  { id: "tiles", cue: "Tile one." },
  { id: "crumb", cue: "A crumb the size" },
  { id: "leg", cue: "A table leg like" },
  { id: "slam", cue: "Then the ground shakes." },
  { id: "flat", cue: "the wind knocks", lead: 0.05 },
  { id: "up", cue: "She gets up." },
  { id: "sugar", cue: "And there it is." },
  { id: "carry", cue: "Ants can lift" },
  { id: "trail", cue: "But here is the clever" },
  { id: "march", cue: "By morning," },
  { id: "found", cue: "One ant found" },
  { id: "ask", cue: "What tiny thing" },
];

type AntState = { pos: V3; heading: number; pose: AntPose; carry?: boolean };
type ShotOut = {
  cam: CamState; ant: AntState | null; look: LookName; cInf: number; focus?: V3; shadowR: number;
  trailFrom?: number; trailGlow?: number; scent?: number; slipperY?: number; marchers?: boolean; kickAmp?: number;
};
type Ctx = { u: number; len: number; t: number; f: number; slamF: number; words: SceneProps["words"] };

const WALK = 26;                       // mm per second
const step = (t: number, speed = WALK) => t * 2 * Math.PI * (speed / 11);   // leg phase: ~2.4 steps/s at 26 mm/s
const blinkAt = (f: number, seed = 0) => ((f + seed * 37) % 83) < 4;
const pose = (f: number, expr: AntExpr, o: Partial<AntPose> = {}): AntPose => ({ expr, phase: 0, stride: 0, blink: blinkAt(f), ...o });
const walking = (f: number, t: number, expr: AntExpr, o: Partial<AntPose> = {}): AntPose => pose(f, expr, { phase: step(t), stride: 1, ...o });

const SUGAR: V3 = [0, 0, 1500];
const SLIPPER_X = -64, SLIPPER_Z = 1060;

const shot = (id: string, c: Ctx): ShotOut => {
  const { u, len, t, f } = c;
  const k = u / Math.max(1, len - 1);
  switch (id) {
    case "hook": {                                        // behind Pip as she leaves the crack: the floor is a desert
      const z = 4 + t * WALK;
      const cam = creep({ pos: [-0.6, 2.3, -12], look: [3, 8, 900], fov: 34, roll: -2 }, u, 0.003);
      return { cam, ant: { pos: [0.5, 0, z], heading: 0.08, pose: walking(f, t, "determined") }, look: "warmInterior", cInf: 9, focus: [0, 2, z], shadowR: 60 };
    }
    case "meet": {                                        // side close-up, antennae up: she smells something
      const cam = glide({ pos: [15, 3.4, 47], look: [0, 2.2, 40], fov: 30 }, { pos: [12, 3.0, 49], look: [0, 2.3, 40], fov: 28 }, k);
      const sniff = 0.5 + 0.5 * Math.sin(t * 5);
      return { cam, ant: { pos: [0, 0, 40], heading: 0, pose: pose(f, t > 2.4 ? "curious" : "neutral", { sniff }) }, look: "warmInterior", cInf: 16, shadowR: 30 };
    }
    case "scent": {                                       // crane up: a pink ribbon of smell from the far sugar
      const cam = glide({ pos: [50, 30, -6], look: [0, 2, 260], fov: 40 }, { pos: [260, 520, -60], look: [0, 0, 600], fov: 44 }, k);
      const z = 60 + t * WALK;
      return { cam, ant: { pos: [0, 0, z], heading: 0, pose: walking(f, t, "curious") }, look: "warmInterior", cInf: lerp(4, 0, k), focus: [0, 2, z], shadowR: 700, scent: clamp01(k * 2) };
    }
    case "tiles": {                                       // tracking past a grout seam: tile one, tile two
      const z = 286 + t * WALK * 1.1;
      const cam = { pos: [17, 3.2, z - 7] as V3, look: [0, 2.4, z + 5] as V3, fov: 34, roll: 3 };
      return { cam, ant: { pos: [0, 0, z], heading: 0, pose: walking(f, t * 1.1, "determined") }, look: "warmInterior", cInf: 12, shadowR: 40 };
    }
    case "crumb": {                                       // a crumb looms like a boulder
      const z = 214 + t * WALK * 0.8;
      const cam = glide({ pos: [-16, 1.4, 196], look: [10, 5, 236], fov: 40 }, { pos: [-13, 1.5, 203], look: [9, 5.5, 236], fov: 38 }, k);
      return { cam, ant: { pos: [-3, 0, z], heading: 0.05, pose: walking(f, t * 0.8, "curious") }, look: "warmInterior", cInf: 11, focus: [-3, 2, z], shadowR: 40 };
    }
    case "leg": {                                         // tilt up a table leg: a tower
      const z = 702 + t * WALK * 0.7;
      const cam = glide({ pos: [52, 1.6, 650], look: [86, 14, 760], fov: 46 }, { pos: [50, 1.8, 646], look: [95, 520, 760], fov: 50, roll: -4 }, k);
      return { cam, ant: { pos: [70, 0, z], heading: 0.2, pose: walking(f, t * 0.7, "neutral") }, look: "warmInterior", cInf: 7, focus: [70, 2, z], shadowR: 300 };
    }
    case "slam": {                                        // the slipper drops beside her
      const z = 1030 + Math.min(t, (c.slamF - (f - u)) / FPS) * WALK;
      const fs = f - c.slamF;                             // frames since impact
      const drop = fs >= 0 ? 0 : Math.min(400, Math.pow(-fs / 6, 2) * 40);
      const cam0: CamState = { pos: [62, 16, 985], look: [-20, 14, 1065], fov: 42 };
      const cam = fs >= 0 ? creep(cam0, fs, 0.002) : cam0;
      const expr: AntExpr = fs >= 0 ? "shock" : "determined";
      return { cam, ant: { pos: [2, 0, z], heading: 0, pose: fs >= 0 ? pose(f, expr) : walking(f, t, expr) }, look: "warmInterior", cInf: 5, focus: [2, 2, z], shadowR: 260, slipperY: drop, kickAmp: 1.4 };
    }
    case "flat": {                                        // knocked onto her back by the wind of it
      const cam = creep({ pos: [13, 2.6, 1052], look: [3, 1.2, 1046], fov: 30, roll: 5 }, u, 0.003);
      return { cam, ant: { pos: [3, 0, 1046], heading: 0, pose: pose(f, "dazed", { flat: true, phase: t * 3, stride: 0.6 }) }, look: "warmInterior", cInf: 16, shadowR: 40, slipperY: 0 };
    }
    case "up": {                                          // she gets up
      const cam = glide({ pos: [11, 2.2, 1057], look: [3, 2.1, 1046], fov: 30 }, { pos: [8, 2.1, 1052], look: [3, 2.3, 1046], fov: 28 }, k);
      return { cam, ant: { pos: [3, 0, 1046], heading: 0, pose: pose(f, t > 0.5 ? "determined" : "neutral") }, look: "warmInterior", cInf: 15, shadowR: 40, slipperY: 0 };
    }
    case "sugar": {                                       // orbit the spilled sugar: diamonds
      const a = lerp(-0.9, -0.35, smoother(k));
      const cam = { pos: [SUGAR[0] + 6 + Math.sin(a) * 20, 4.2, SUGAR[2] - 26 + Math.cos(a) * 6] as V3, look: [-4, 1.6, 1490] as V3, fov: 38 };
      return { cam, ant: { pos: [-7, 0, 1486], heading: 0.3, pose: pose(f, t > 1.4 ? "happy" : "shock", { sniff: 0.8 }) }, look: "warmInterior", cInf: 12, focus: [-2, 1, 1492], shadowR: 60 };
    }
    case "carry": {                                       // she lifts it alone and heads home
      const z = 1484 - t * WALK * 0.75;
      const cam = { pos: [-15, 3.4, z - 6] as V3, look: [0, 3, z - 1] as V3, fov: 32, roll: -3 };
      return { cam, ant: { pos: [0, 0, z], heading: Math.PI, pose: walking(f, t * 0.75, t < 1.2 ? "strain" : "happy"), carry: true }, look: "warmInterior", cInf: 13, shadowR: 40 };
    }
    case "trail": {                                       // the invisible chemical road appears behind her
      const z = 1440 - t * WALK * 0.8;
      const cam = glide({ pos: [16, 3, z - 8], look: [0, 2, z + 6], fov: 34 }, { pos: [70, 120, z - 70], look: [0, 0, z + 120], fov: 42 }, k);
      return { cam, ant: { pos: [0, 0, z], heading: Math.PI, pose: walking(f, t * 0.8, "determined", { trail: true }), carry: true }, look: "warmInterior", cInf: lerp(12, 2, k), focus: [0, 2, z], shadowR: 200, trailFrom: z, trailGlow: 1.6 };
    }
    case "march": {                                       // morning: her sisters march on the road
      const cam = creep({ pos: [-16, 3.6, 470], look: [2, 2.4, 560], fov: 36, roll: 2 }, u, 0.002);
      return { cam, ant: null, look: "morning", cInf: 9, focus: [0, 2, 500], shadowR: 120, trailFrom: 0, trailGlow: 0.9, marchers: true };
    }
    case "found": {                                       // Pip beside the line, proud
      const cam = creep({ pos: [21, 3.2, 512], look: [8, 2.4, 505], fov: 30 }, u, 0.0025);
      return { cam, ant: { pos: [8, 0, 505], heading: -0.6, pose: pose(f, "happy") }, look: "morning", cInf: 15, shadowR: 50, trailFrom: 0, trailGlow: 0.9, marchers: true };
    }
    default: {                                            // ask: pull back and up: the whole road across the kitchen
      const cam = glide({ pos: [21, 3.2, 512], look: [8, 2.4, 505], fov: 30 }, { pos: [520, 1100, -150], look: [0, 0, 760], fov: 46 }, k, easeOut);
      return { cam, ant: { pos: [8, 0, 505], heading: -0.6, pose: pose(f, "happy") }, look: "morning", cInf: lerp(15, 0, clamp01(k * 1.6)), focus: [8, 2, 505], shadowR: lerp(50, 900, k), trailFrom: 0, trailGlow: 1.2, marchers: true };
    }
  }
};

// ---------------------------------------------------------------- props built once per render tab
const buildSlipper = () => {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  const W = 92, L = 250, r = 40;
  shape.moveTo(-W / 2 + r, -L / 2); shape.lineTo(W / 2 - r, -L / 2); shape.quadraticCurveTo(W / 2, -L / 2, W / 2, -L / 2 + r);
  shape.lineTo(W / 2, L / 2 - r); shape.quadraticCurveTo(W / 2, L / 2, W / 2 - r, L / 2); shape.lineTo(-W / 2 + r, L / 2);
  shape.quadraticCurveTo(-W / 2, L / 2, -W / 2, L / 2 - r); shape.lineTo(-W / 2, -L / 2 + r); shape.quadraticCurveTo(-W / 2, -L / 2, -W / 2 + r, -L / 2);
  const sole = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 22, bevelEnabled: true, bevelSize: 4, bevelThickness: 4, bevelSegments: 2 }),
    new THREE.MeshLambertMaterial({ color: "#c63f55" }));
  sole.rotation.x = -Math.PI / 2;
  const upper = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: "#f08ea0" }));
  upper.scale.set(W * 0.52, 70, L * 0.34); upper.position.set(0, 22, L * 0.12);
  [sole, upper].forEach((m) => { m.castShadow = m.receiveShadow = true; g.add(m); });
  return g;
};

const buildTrail = () => {
  const pts: THREE.Vector3[] = [];
  for (let z = 1490; z > 0; z -= 5) pts.push(new THREE.Vector3(Math.sin(z / 37) * 1.2 + Math.sin(z / 11) * 0.5, 0.06, z));
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#9effc8").multiplyScalar(1.6), toneMapped: true });
  const mesh = new THREE.InstancedMesh(new THREE.CircleGeometry(0.9, 10), mat, pts.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  pts.forEach((p, i) => mesh.setMatrixAt(i, m4.compose(p, q, new THREE.Vector3(1, 1, 1))));
  mesh.layers.set(3); // NOINK
  return { mesh, mat, zs: pts.map((p) => p.z) };
};

const buildScent = () => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) { const z = lerp(1490, 70, i / 24); pts.push(new THREE.Vector3(Math.sin(i * 0.9) * 40, 10 + Math.sin(i * 0.6) * 8 + i * 1.2, z)); }
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 1.6, 8, false);
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff8fb8").multiplyScalar(1.5), transparent: true, opacity: 0.55, depthWrite: false });
  const m = new THREE.Mesh(geo, mat); m.layers.set(3);
  return { mesh: m, mat };
};

const buildWorld = () => {
  const root = new THREE.Group();
  const k = buildKitchen(); root.add(k.root);
  const sun = new THREE.DirectionalLight("#fff0d8", 2.8);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);         // CPU budget: 1024 (the skill used 4096)
  const hemi = new THREE.HemisphereLight("#dcecff", "#b49a78", 0.55);
  root.add(sun, sun.target, hemi);
  // spilled sugar: one hero grain + a scatter
  const pile = new THREE.Group();
  let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 46; i++) {
    const g = sugar(0.5 + rnd() * 0.6, 1.2 + rnd() * 1.4);
    const a = rnd() * 6.28, r = 3 + rnd() * 26;
    g.position.set(SUGAR[0] + Math.cos(a) * r, 0.3, SUGAR[2] + Math.sin(a) * r * 0.8); g.rotation.set(rnd(), rnd() * 3, rnd());
    pile.add(g);
  }
  root.add(pile);
  const carried = sugar(0.8, 1.9); root.add(carried);
  const slipper = buildSlipper(); root.add(slipper);
  const trail = buildTrail(); root.add(trail.mesh);
  const scent = buildScent(); root.add(scent.mesh);
  const pip = new Card(4.6, 2.76, 1000, 600, 575, 0.75, "ant"); root.add(pip.root);
  const sisters = Array.from({ length: 16 }, () => { const c = new Card(4.6, 2.76, 1000, 600, 575, 0.75, "ant"); root.add(c.root); return c; });
  return { root, sun, hemi, carried, slipper, trail, scent, pip, sisters };
};

const v = new THREE.Vector3();

const AntScene: React.FC<SceneProps> = ({ words, spans }) => {
  const f = useCurrentFrame();
  const { camera, scene, size } = useThree();
  const W = useMemo(buildWorld, []);
  const fx = usePost();
  const slamF = useMemo(() => Math.round(cueTime(words, "lands") * FPS), [words]);
  const span = shotAt(spans, f);
  const u = f - span.a;
  const o = shot(span.id, { u, len: span.b - span.a, t: u / FPS, f, slamF, words });
  const lk = LOOKS[o.look];

  // camera (+ impact shake)
  const cam = camera as THREE.PerspectiveCamera;
  const sh = o.kickAmp ? kick(f - slamF, o.kickAmp) : 0;
  cam.position.set(o.cam.pos[0] + sh, o.cam.pos[1] + sh * 0.6, o.cam.pos[2]);
  cam.up.set(0, 1, 0);
  cam.lookAt(...o.cam.look);
  cam.rotateZ(THREE.MathUtils.degToRad(o.cam.roll ?? 0));
  cam.fov = o.cam.fov; cam.updateProjectionMatrix();   // near/far stay fixed (ThreeCanvas): the lens blur decodes depth with them

  // world look
  scene.background = untone(lk.bg);
  scene.fog = new THREE.Fog(untone(lk.fog), lk.fogNear, lk.fogFar);
  const focusP = new THREE.Vector3(...(o.focus ?? (o.ant ? [o.ant.pos[0], 2, o.ant.pos[2]] : o.cam.look)));
  applyLook(lk, W.sun, W.hemi, focusP, o.shadowR, size.height);

  // Pip
  W.pip.root.visible = !!o.ant;
  if (o.ant) {
    W.pip.pose(antKey(o.ant.pose), (p, g) => drawAnt(p, g, o.ant!.pose));
    W.pip.place(v.set(...o.ant.pos), cam, o.ant.heading);
  }
  W.carried.visible = !!o.ant?.carry;
  if (o.ant?.carry) W.carried.position.set(o.ant.pos[0] + Math.sin(o.ant.heading) * 1.9, 2.75, o.ant.pos[2] + Math.cos(o.ant.heading) * 1.9);

  // slipper, scent ribbon, pheromone trail
  W.slipper.visible = o.slipperY !== undefined;
  W.slipper.position.set(SLIPPER_X, o.slipperY ?? 0, SLIPPER_Z);
  W.scent.mesh.visible = (o.scent ?? 0) > 0;
  W.scent.mat.opacity = 0.55 * (o.scent ?? 0);
  if (o.trailFrom !== undefined) {
    const n = W.trail.zs.findIndex((z) => z < o.trailFrom!);
    W.trail.mesh.count = n < 0 ? W.trail.zs.length : n;   // dots run from the sugar back toward the nest
    W.trail.mat.color.set("#9effc8").multiplyScalar(o.trailGlow ?? 1);
    W.trail.mesh.visible = true;
  } else W.trail.mesh.visible = false;

  // the morning march: sisters on the road, some carrying sugar home
  W.sisters.forEach((c, i) => {
    c.root.visible = !!o.marchers;
    if (!o.marchers) return;
    const home = i % 3 === 2, t = f / FPS;
    const z = home ? 760 - ((t * WALK + i * 37) % 420) : 320 + ((t * WALK + i * 29) % 420);
    const x = Math.sin(z / 37) * 1.2 + (home ? 2.6 : -2.4);
    const ps: AntPose = { expr: i % 4 ? "determined" : "happy", phase: step(t + i * 0.37), stride: 1, blink: blinkAt(f, i + 1), body: i % 2 ? "#5d2d20" : "#6f3828" };
    c.pose(antKey(ps), (p, g) => drawAnt(p, g, ps));
    c.place(v.set(x, 0, z), cam, home ? Math.PI : 0);
  });

  return (
    <>
      <primitive object={W.root} dispose={null} />
      <PostChain fx={fx} st={{ ...((getInputProps() as { post?: object }).post ?? {}), focus: focusP.clone().sub(cam.position).dot(cam.getWorldDirection(new THREE.Vector3())), cInf: o.cInf, grade: lk.grade }} />
    </>
  );
};

const story: Omit<Story, "script"> & { script?: string } = {
  id: "ant-kitchen",
  shots: SHOTS,
  Scene: AntScene,
  hookFlash: 4,
  background: "#efe0c6",
};
export default story;
