// Renders the WHAT IF kit preview sheets: bundles kit-sheet.tsx with esbuild, prints SVG, screenshots it with headless
// Chrome (CHROME_PATH) into kit.png + characters.png. usage: CHROME_PATH=... node library/previews/whatif/build.mjs
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, "../../..");
const tmp = fs.mkdtempSync(path.join(process.env.REMOTION_TMP || os.tmpdir(), "wikit-"));
const out = path.join(tmp, "sheet.cjs");
execFileSync(path.join(root, "node_modules/.bin/esbuild"), [path.join(here, "kit-sheet.tsx"), "--bundle", "--platform=node", "--format=cjs", "--jsx=automatic", `--outfile=${out}`, "--log-level=warning"], { stdio: "inherit" });
const sheets = JSON.parse(execFileSync("node", [out], { maxBuffer: 1 << 28 }).toString());
const font = path.join(root, "node_modules/@fontsource/montserrat/files/montserrat-latin-900-normal.woff2");
const chrome = process.env.CHROME_PATH || "chromium";
for (const [name, svg] of Object.entries(sheets)) {
  const w = Number(/width="(\d+)"/.exec(svg)[1]), h = Number(/height="(\d+)"/.exec(svg)[1]);
  const html = path.join(tmp, `${name}.html`);
  fs.writeFileSync(html, `<!doctype html><html><head><style>@font-face{font-family:CaptionSans;src:url(file://${font});font-weight:100 900}html,body{margin:0;background:#05070d}</style></head><body>${svg}</body></html>`);
  const scale = name === "kit" ? 0.5 : 0.6;
  execFileSync(chrome, ["--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", `--force-device-scale-factor=${scale}`,
    `--window-size=${w},${h}`, "--virtual-time-budget=3000", `--screenshot=${path.join(here, name + ".png")}`, `file://${html}`], { stdio: "ignore" });
  console.log(`${name}.png ${Math.round(w * scale)}x${Math.round(h * scale)}`);
}
