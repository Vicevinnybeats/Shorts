// Draw static (or few-pose) SVG scenery ONCE into an image and reuse it every frame - the biggest CPU saver in 2.5D.
// Remotion waits (delayRender) until each image is decoded, so no frame ever renders without it.
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { continueRender, delayRender } from "remotion";

const loaded = new Set<string>();
const pending = new Set<string>();
const cache = new Map<string, string>();

/** Renders `children` (SVG elements in design coordinates) inside the box (x, y, w, h) as a cached <image>.
 *  `cacheKey` must change whenever the drawing changes (e.g. include a pose index). Use inside an <svg>. */
export const CachedSvg: React.FC<{ cacheKey: string; x: number; y: number; w: number; h: number; children: React.ReactNode }> = ({ cacheKey, x, y, w, h, children }) => {
  let src = cache.get(cacheKey);
  if (!src) {
    const markup = renderToStaticMarkup(
      <svg xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox={`${x} ${y} ${w} ${h}`}>{children}</svg>,
    );
    src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(markup);
    cache.set(cacheKey, src);
  }
  if (!loaded.has(src) && !pending.has(src)) {
    pending.add(src);
    const handle = delayRender("cached svg " + cacheKey.slice(0, 40));
    const img = new Image();
    img.onload = img.onerror = () => { loaded.add(src!); continueRender(handle); };
    img.src = src;
  }
  return <image href={src} x={x} y={y} width={w} height={h} />;
};
