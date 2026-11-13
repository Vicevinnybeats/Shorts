// usage: node scripts/bench-render.mjs <compositionId> <from> <to> <scale> <out.mp4> [concurrency]
// Renders a frame range and reports setup time, steady-state seconds per frame and an estimate for a full short.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const tmp = process.env.REMOTION_TMP || path.join(os.tmpdir(), "remotion-tmp");
fs.mkdirSync(tmp, { recursive: true });
process.env.TEMP = process.env.TMP = process.env.TMPDIR = tmp;
const { bundle } = await import("@remotion/bundler");
const { renderMedia, selectComposition } = await import("@remotion/renderer");
const [id, from, to, scale, out, conc, props = "{}"] = process.argv.slice(2);
const inputProps = JSON.parse(props);
const browserExecutable = process.env.CHROME_PATH || null;
const chromiumOptions = { gl: process.env.REMOTION_GL || "swangle" };
const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable, chromiumOptions });
const frameRange = [Number(from), Number(to)];
const n = frameRange[1] - frameRange[0] + 1;
let tFirst = null, last = 0;
const t1 = Date.now();
await renderMedia({
  composition, serveUrl, inputProps, codec: "h264", outputLocation: out, frameRange, scale: Number(scale), browserExecutable, chromiumOptions,
  concurrency: conc ? Number(conc) : null, timeoutInMilliseconds: 600000, crf: 18,
  onProgress: ({ renderedFrames }) => {
    if (renderedFrames > 0 && tFirst === null) tFirst = Date.now();
    if (renderedFrames !== last && renderedFrames % 5 === 0) console.log(`frames ${renderedFrames}/${n} at ${((Date.now() - t1) / 1000).toFixed(0)}s`);
    last = renderedFrames;
  },
});
const t2 = Date.now();
const steady = tFirst ? (t2 - tFirst) / 1000 / Math.max(n - 1, 1) : (t2 - t1) / 1000 / n;
const res = { composition: id, frames: n, scale: Number(scale), cpus: os.cpus().length, bundle_s: (t1 - t0) / 1000,
  first_frame_s: tFirst ? (tFirst - t1) / 1000 : null, s_per_frame: +steady.toFixed(2),
  est_minutes_2000f: +((2000 * steady) / 60).toFixed(0) };
console.log(JSON.stringify(res));
if (process.env.BENCH_JSON) fs.writeFileSync(process.env.BENCH_JSON, JSON.stringify(res, null, 1));
