// Install check for the Stick3D pack (library/stick3d) in the What If Golden Neon colours. Never published.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Person, Lights, Desk, CamSet, Grade } from "../../library/stick3d/kit";
import { Floor, WallDoor, Glow, Shaft, Plant, Shelf, Lamp, Monitor, Rug, Dust } from "../../library/stick3d/props";
import type { Look } from "../../library/stick3d/puppet";

export const NEON3D = { bg: "#07080d", wallA: "#141826", wallB: "#10131f", floorA: "#1b1f2e", floorB: "#161a27", gold: "#f5b942", coral: "#ff7a59", cyan: "#5fd4e6" };
export const REMY3D: Look = { skin: "#f3d2b3", body: NEON3D.gold, outfit: "hoodie", hair: "short", hairColor: "#1b1b2a", shoe: "#0b0d1a" };

export const Stick3DTest: React.FC = () => {
  const f = useCurrentFrame(), t = f / 30;
  return (
    <AbsoluteFill style={{ background: NEON3D.bg }}>
      <ThreeCanvas width={1080} height={1920} linear flat>
        <color attach="background" args={[NEON3D.bg]} />
        <CamSet t={t} pos={[0.6 * Math.sin(t * 0.3), 3.2, 9.5]} look={[0, 2.2, 0]} fov={60} />
        <Lights warm="#ffd59a" />
        <Floor kind="tile" a={NEON3D.floorA} b={NEON3D.floorB} />
        <WallDoor z={-5} W={18} kind="brick" a={NEON3D.wallA} b={NEON3D.wallB} door={{ x: 4, w: 2.2, h: 4.2 }} />
        <Rug p={[0, 0.02, 0.5]} s={[6, 3.5]} a="#3a2208" b={NEON3D.gold} />
        <Desk p={[-3, 0, -2]} top="#2a2f44" leg="#1a1d2b" />
        <Monitor p={[-3, 1.75, -2.2]} screen={NEON3D.cyan} />
        <Shelf p={[3.8, 0, -4.6]} wood="#3a2a18" />
        <Plant p={[-6, 0, -3.5]} pot={NEON3D.coral} />
        <Lamp p={[6, 0, -3]} color="#ffd27a" />
        <Person p={[0, 0, 0.5]} look={REMY3D} pose={{ mood: "grin", arms: "up", armK: Math.min(1, t) }} f={f} />
        <Glow p={[0, 6, -1]} r={3} color={NEON3D.gold} o={0.35} />
        <Shaft p={[0, 4, -1]} s={[3, 9]} color="245,185,66" o={0.18} />
        <Dust t={t} area={[10, 6, 6]} color="rgba(245,185,66,.9)" />
      </ThreeCanvas>
      <Grade t={t} />
    </AbsoluteFill>
  );
};
