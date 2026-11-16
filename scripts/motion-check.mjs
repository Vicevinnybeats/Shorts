// Measured motion check for a rendered episode (idea from motion-director's critique.mjs, MIT, (c) 2026 Sharbel):
// finds stretches where the PICTURE (captions band excluded) does not change for more than N seconds, and
// checks that frame 0 is not empty. Free: ffmpeg only.
//   node scripts/motion-check.mjs episodes/<id>/preview.mp4 [maxHoldSeconds=3]
import { spawnSync } from "node:child_process";

const [file, maxHold = "3"] = process.argv.slice(2);
if (!file) { console.error("usage: motion-check.mjs <video.mp4> [maxHoldSeconds]"); process.exit(2); }
// crop away the caption band (captions sit at ~80 % of the height and change every few words)
const crop = "crop=iw:ih*0.72:0:0";
const fd = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-vf", `${crop},freezedetect=n=0.002:d=${maxHold}`, "-an", "-f", "null", "-"], { encoding: "utf8" });
const holds = [];
for (const m of fd.stderr.matchAll(/freeze_start: ([\d.]+)[\s\S]*?freeze_duration: ([\d.]+)/g)) holds.push({ at: +(+m[1]).toFixed(2), seconds: +(+m[2]).toFixed(2) });
// frame 0 "ink": share of pixels that differ from the frame's mean (an empty/black first frame scores ~0)
const sig = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-vf", `${crop},select=eq(n\\,0),signalstats,metadata=print`, "-frames:v", "1", "-f", "null", "-"], { encoding: "utf8" });
const ymin = /signalstats\.YMIN=(\d+)/.exec(sig.stderr), ymax = /signalstats\.YMAX=(\d+)/.exec(sig.stderr);
const range = ymin && ymax ? +ymax[1] - +ymin[1] : null;
const out = { file, maxHold: +maxHold, longHolds: holds, frame0LumaRange: range, frame0Empty: range !== null && range < 20 };
console.log(JSON.stringify(out));
process.exit(holds.length || out.frame0Empty ? 1 : 0);
