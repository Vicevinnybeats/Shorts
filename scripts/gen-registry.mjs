// Generates src/episodes.generated.tsx from episodes/<id>/episode.json + story.ts, so every episode is a composition.
// The file is gitignored and rebuilt before every bundle. Episode rendering (src/engine) is built in Phase 1.
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const epDir = path.join(root, "episodes");
const eps = fs.existsSync(epDir) ? fs.readdirSync(epDir).filter((d) => fs.existsSync(path.join(epDir, d, "episode.json")) && fs.existsSync(path.join(epDir, d, "story.ts"))) : [];
const lines = ['import React from "react";', 'import { Composition } from "remotion";'];
if (eps.length) lines.push('import { EpisodeShort, framesOf } from "./engine/EpisodeShort";');
eps.forEach((id, i) => lines.push(`import story${i} from "../episodes/${id}/story";`));
lines.push("export const Episodes: React.FC = () => (", "  <>");
eps.forEach((id, i) => {
  const meta = JSON.parse(fs.readFileSync(path.join(epDir, id, "episode.json"), "utf8"));
  const comp = meta.composition || `Ep-${id}`;
  lines.push(`    <Composition id=${JSON.stringify(comp)} component={EpisodeShort} defaultProps={{ story: story${i}, episode: ${JSON.stringify(id)} }} durationInFrames={framesOf(story${i})} fps={30} width={1080} height={1920} />`);
});
lines.push("  </>", ");", "");
fs.writeFileSync(path.join(root, "src", "episodes.generated.tsx"), lines.join("\n"));
console.log(`episodes registered: ${eps.length ? eps.join(", ") : "none"}`);
