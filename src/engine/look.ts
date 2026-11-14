// Lighting presets for the channel, derived from the skill's measured day / golden presets (vendor lights.ts).
// The world uses the skill's two-tone shading (shade.ts) and the cards its card shading (cardshade.ts);
// applyLook() keeps their uniforms, the sun and the hemisphere light in sync.
import * as THREE from "three";
import { LIGHTS, LightPreset } from "../vendor/bridge/lights";
import { TONE, CHAR } from "../vendor/bridge/shade";
import { CARD_K } from "../vendor/bridge/cardshade";

export type LookName = "warmInterior" | "morning" | "night" | "storm" | "coldLab" | "golden" | "day";
export type Look = LightPreset & { grade: "day" | "golden"; sat: number; bounce: [number, number, number]; bg: string };

const L = (base: "day" | "golden", o: Partial<Look>): Look => ({ ...LIGHTS[base], grade: base, sat: 1.08, bounce: [0, 0, 0], bg: "#e9dcc8", ...o });

export const LOOKS: Record<LookName, Look> = {
  day: L("day", {}),
  golden: L("golden", { sat: 1.1, bounce: [0.04, 0.02, 0] }),
  // window light on a kitchen floor: high warm key, cream fog, soft violet shade
  warmInterior: L("day", { az: 55, el: 38, lit: [1.62, 1.46, 1.2], shade: [0.46, 0.39, 0.4], lift: [0.07, 0.05, 0.06],
    fog: "#efe0c6", fogNear: 300, fogFar: 6500, bg: "#efe0c6", sunCol: "#fff0d8", sat: 1.1 }),
  // first light through the window: low peach sun, long shadows, violet shade
  morning: L("golden", { az: 40, el: 12, lit: [1.55, 0.92, 0.5], shade: [0.3, 0.24, 0.34], lift: [0.06, 0.05, 0.1],
    fog: "#f3c79e", fogNear: 300, fogFar: 6500, bg: "#f3c79e", sat: 1.08, bounce: [0.04, 0.02, 0] }),
  night: L("day", { az: 120, el: 30, lit: [0.55, 0.62, 0.95], shade: [0.1, 0.11, 0.24], lift: [0.03, 0.04, 0.1],
    fog: "#1d2440", fogNear: 100, fogFar: 2000, bg: "#1d2440", sunCol: "#b8c8ff", sat: 0.95 }),
  storm: L("day", { az: 80, el: 55, lit: [0.95, 1.0, 1.08], shade: [0.2, 0.22, 0.3], lift: [0.05, 0.06, 0.09],
    fog: "#7d8796", fogNear: 60, fogFar: 1500, bg: "#7d8796", sat: 0.85 }),
  coldLab: L("day", { az: 90, el: 70, lit: [1.25, 1.42, 1.55], shade: [0.3, 0.34, 0.42], lift: [0.06, 0.08, 0.12],
    fog: "#d7e6ee", fogNear: 100, fogFar: 2200, bg: "#d7e6ee", sunCol: "#eef7ff", sat: 0.95 }),
};

const sunDir = (az: number, el: number) => {
  const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
  return new THREE.Vector3(Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a));
};

/** Sets lights + shading uniforms for one frame. `center` is where the action is (shadow camera follows it). */
export const applyLook = (lk: Look, sun: THREE.DirectionalLight, hemi: THREE.HemisphereLight, center: THREE.Vector3,
  shadowRadius: number, outHeight: number) => {
  const d = sunDir(lk.az, lk.el);
  sun.position.copy(center).addScaledVector(d, shadowRadius * 3);
  sun.target.position.copy(center);
  sun.target.updateMatrixWorld();
  sun.color.set(lk.sunCol); sun.intensity = lk.sunI;
  const sc = sun.shadow.camera;
  sc.left = -shadowRadius; sc.right = shadowRadius; sc.top = shadowRadius; sc.bottom = -shadowRadius;
  sc.near = 0.1; sc.far = shadowRadius * 6; sc.updateProjectionMatrix();
  sun.shadow.bias = lk.bias; sun.shadow.normalBias = lk.normalBias * (shadowRadius / 12);
  hemi.color.set(lk.sky); hemi.groundColor.set(lk.ground); hemi.intensity = lk.hemiI;
  TONE.uLitCol.value.set(...lk.lit); TONE.uShadeCol.value.set(...lk.shade); TONE.uShadeLift.value.set(...lk.lift);
  TONE.uLambert.value = lk.lambert; TONE.uSideK.value = lk.sideK; TONE.uTerm.value = lk.term;
  TONE.uBounce.value.set(...lk.bounce); TONE.uSat.value = lk.sat;
  CHAR.uCharTint.value.set(...lk.charTint); CHAR.uCharShade.value = lk.charShade; CHAR.uGrad.value = lk.charGrad;
  CHAR.uBodyGrad.value = lk.bodyGrad; CHAR.uSideTint.value.set(...lk.sideTint);
  CARD_K.uPx.value = outHeight / 1920;
};
