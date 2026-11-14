// Fast crowd: the ~600 SVG fans are drawn ONCE per pose into an image (a data URL) and reused on every frame,
// instead of being re-rasterised each frame. Cheering/laughing bounce uses a few cached poses in a loop.
// Remotion waits (delayRender) until each image is decoded, so no frame ever renders without its crowd.
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { continueRender, delayRender } from "remotion";
import { Crowd, CrowdMood } from "./person";

const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();
const cache = new Map<string, string>();

type Props = { f: number; rows: number; width: number; y0: number; rowH?: number; size?: number; mood: CrowdMood; fogColor?: string; fog?: number; seed?: number; x?: number };

/** frame -> one of a few cached bounce poses (period matches the bounce speed in Crowd) */
const poseFrame = (mood: CrowdMood, f: number) =>
  mood === "cheer" ? (Math.floor(f / 3) % 6) * 3 : mood === "laugh" ? (Math.floor(f / 2) % 5) * 2 : 0;

export const CrowdImg: React.FC<Props> = (p) => {
  const { rows, width, y0, rowH = 70, size = 46, x = 0 } = p;
  const pf = poseFrame(p.mood, p.f);
  const top = y0 - size * 2.2, h = rows * rowH + size * 2.4, left = -40, w = width + 80;
  const key = JSON.stringify({ ...p, f: pf });
  let src = cache.get(key);
  if (!src) {
    const markup = renderToStaticMarkup(
      <svg xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox={`${left} ${top} ${w} ${h}`}>
        <Crowd {...p} f={pf} />
      </svg>,
    );
    src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(markup);
    cache.set(key, src);
  }
  if (!loaded.has(src) && !pending.has(src)) {
    const handle = delayRender("crowd image");
    const img = new Image();
    pending.set(src, new Promise<void>((res) => {
      img.onload = img.onerror = () => { loaded.add(src!); continueRender(handle); res(); };
    }));
    img.src = src;
  }
  return <image href={src} x={x + left} y={top} width={w} height={h} />;
};
