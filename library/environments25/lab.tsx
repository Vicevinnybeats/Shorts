// Library (2.5D): the shared "explain" look (LAB) used by every fact shot: navy backdrop, faint grid on a slow
// parallax layer, soft radial spotlight, content on the subject plane. Use inside a <Stage>.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Layer, Svg } from "../../src/engine25/stage";
import { LAB } from "../style/channel";

export { LAB };

/** The lab set: renders its own layers; `children` are SVG elements in design coordinates on a p=1 layer. */
export const Lab: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>
    <Layer p={0}><AbsoluteFill style={{ background: LAB.bg }} /></Layer>
    <Layer p={0.3}><Svg>{Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-400 + i * 80} -400 L ${-400 + i * 80} 2400 M -400 ${-400 + i * 100} L 1500 ${-400 + i * 100}`} stroke={LAB.grid} strokeWidth={3} />)}</Svg></Layer>
    <Layer p={0}><AbsoluteFill style={{ background: "radial-gradient(60% 40% at 50% 45%, rgba(127,224,255,0.14) 0%, transparent 70%)" }} /></Layer>
    <Layer p={1}><Svg>{children}</Svg></Layer>
  </>
);

/** Centered on-screen text (CaptionSans 900). Keep y between 300 and 1350. */
export const T: React.FC<{ x: number; y: number; s: number; c?: string; o?: number; children: React.ReactNode }> = ({ x, y, s, c = LAB.text, o = 1, children }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="CaptionSans, sans-serif" fontWeight={900} fontSize={s} fill={c} opacity={o}>{children}</text>
);
