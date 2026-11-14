// One composition for every episode: the episode's story.ts supplies the script, cue-timed shots and a 3D scene;
// this wraps it in a ThreeCanvas, adds the hook flash and the word-by-word captions, and sizes the video from the
// narration (words.json passed as inputProps.words; a steady 2.85 words/s estimate before a voice exists).
import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, useCurrentFrame, getInputProps } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Captions, Word } from "../captions/Captions";
import { roughWords, resolveShots, totalFrames, ShotSpec, ShotSpan } from "./timeline";

export type SceneProps = { words: Word[]; spans: ShotSpan[] };
export type Story = {
  id: string;
  script: string;
  shots: ShotSpec[];
  Scene: React.FC<SceneProps>;
  /** frames of white flash right after the hook shot (the skill's 4-frame flash), 0 = none */
  hookFlash?: number;
  background?: string;
};
export type EpisodeProps = { story: Story; episode: string; words?: Word[]; captions?: boolean };

/** 3D buffer scale. R3F would clamp dpr to >= 1, so it is set explicitly: 0.5 = a 540x960 WebGL buffer stretched to
 *  1080x1920 by the page (CPU budget), while captions stay full-resolution page text. inputProps.dpr overrides. */
const renderDpr = () => Number((getInputProps() as { dpr?: number }).dpr ?? 0.5);

const wordsOf = (p: EpisodeProps) => (p.words && p.words.length ? p.words : roughWords(p.story.script));
export const framesOf = (story: Story) => totalFrames(roughWords(story.script));
export const episodeMetadata: CalculateMetadataFunction<EpisodeProps> = ({ props }) => ({ durationInFrames: totalFrames(wordsOf(props)) });

export const EpisodeShort: React.FC<EpisodeProps> = (props) => {
  const f = useCurrentFrame();
  const words = wordsOf(props);
  const spans = resolveShots(props.story.shots, words);
  const { Scene } = props.story;
  const fl = props.story.hookFlash ?? 4;
  const flashAt = spans[1]?.a ?? -99;
  const flash = fl && f >= flashAt && f < flashAt + fl ? [1, 0.75, 0.45, 0.2, 0.1, 0.05][f - flashAt] ?? 0 : 0;
  return (
    <AbsoluteFill style={{ background: props.story.background ?? "#e9dcc8" }}>
      <ThreeCanvas width={1080} height={1920} dpr={renderDpr()} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }}
        camera={{ fov: 40, near: 0.3, far: 12000 }}>
        <Scene words={words} spans={spans} />
      </ThreeCanvas>
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      {props.captions !== false && <Captions words={words} yFrac={0.76} />}
    </AbsoluteFill>
  );
};
