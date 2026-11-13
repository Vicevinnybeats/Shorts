// usage: node scripts/render-stills.mjs <compositionId> <outPrefix> <frame,frame,...> [scale] [propsJson]
// Bundles once, renders JPEG stills with CPU WebGL (SwiftShader via ANGLE). Prints per-still timings as JSON lines.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const tmp = process.env.REMOTION_TMP || path.join(os.tmpdir(), "remotion-tmp");
fs.mkdirSync(tmp, { recursive: true });
process.env.TEMP = process.env.TMP = process.env.TMPDIR = tmp;
const { bundle } = await import("@remotion/bundler");
const { renderStill, selectComposition } = await import("@remotion/renderer");

const [id, prefix, frames, scale = "0.5", props = "{}"] = process.argv.slice(2);
if (!id || !prefix || !frames) { console.error("usage: render-stills.mjs <comp> <outPrefix> <frames> [scale] [props]"); process.exit(2); }
const browserExecutable = process.env.CHROME_PATH || null;
const chromiumOptions = { gl: process.env.REMOTION_GL || "swangle" };
const inputProps = JSON.parse(props);
fs.mkdirSync(path.dirname(path.resolve(prefix)), { recursive: true });
const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
console.log(JSON.stringify({ bundle_s: (Date.now() - t0) / 1000 }));
const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable, chromiumOptions });
const onBrowserLog = (l) => { if (l.type === "error" || l.type === "warning") console.log(`[${l.type}]`, l.text.slice(0, 300)); };
for (const f of frames.split(",").map(Number)) {
  const t = Date.now();
  await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${String(f).padStart(4, "0")}.jpg`, imageFormat: "jpeg",
    jpegQuality: 85, scale: Number(scale), inputProps, browserExecutable, chromiumOptions, timeoutInMilliseconds: 300000, onBrowserLog });
  console.log(JSON.stringify({ still: f, s: (Date.now() - t) / 1000 }));
}
