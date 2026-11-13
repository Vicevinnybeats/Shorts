// Pipeline test scene: a lit 3D object + word-by-word captions driven by words.json (inputProps.words).
// Used by the health check and the `_pipeline-test` episode to exercise voice -> mix -> render -> captions -> mux.
import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Captions, Word } from "../captions/Captions";

export const HEALTH_FRAMES = 90;
export type HealthProps = { words: Word[] };
export const HEALTH_DEFAULT: HealthProps = {
  words: [
    { w: "Health", s: 0.1, e: 0.6 }, { w: "check:", s: 0.6, e: 1.2 }, { w: "three.js", s: 1.3, e: 1.9 },
    { w: "renders", s: 1.9, e: 2.4 }, { w: "here.", s: 2.4, e: 2.9 },
  ],
};
/** Length follows the narration: last word + 0.8 s. */
export const healthMetadata: CalculateMetadataFunction<HealthProps> = ({ props }) => {
  const end = props.words.length ? props.words[props.words.length - 1].e : 2.2;
  return { durationInFrames: Math.max(HEALTH_FRAMES, Math.ceil((end + 0.8) * 30)) };
};

const Spin: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <mesh rotation={[f * 0.03, f * 0.05, 0]}>
      <torusKnotGeometry args={[1, 0.32, 160, 24]} />
      <meshStandardMaterial color="#f2a13b" />
    </mesh>
  );
};

export const HealthCard: React.FC<HealthProps> = ({ words }) => (
  <AbsoluteFill style={{ background: "linear-gradient(#3e7fd2, #b8d0ec)" }}>
    <ThreeCanvas width={1080} height={1920} camera={{ position: [0, 0, 6], fov: 40 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <Spin />
    </ThreeCanvas>
    <Captions words={words} />
  </AbsoluteFill>
);
