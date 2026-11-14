// Generates src/episodes.generated.tsx from episodes/<id>/episode.json + story.ts, so every episode is a composition.
// The file is gitignored and rebuilt before every bundle. Episode rendering (src/engine) is built in Phase 1.
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const epDir = path.join(root, "episodes");
const eps = fs.existsSync(epDir) ? fs.readdirSync(epDir).filter((d) => fs.existsSync(path.join(epDir, d, "episode.json")) && (fs.existsSync(path.join(epDir, d, "story.ts")) || fs.existsSync(path.join(epDir, d, "story.tsx")))) : [];
const lines = ['import React from "react";', 'import { Composition, CalculateMetadataFunction } from "remotion";'];
if (eps.length) lines.push('import { EpisodeShort, EpisodeProps, framesOf, episodeMetadata } from "./engine/EpisodeShort";');
eps.forEach((id, i) => lines.push(`import story${i} from "../episodes/${id}/story";`));
// Remotion sends props to the browser as JSON (functions are dropped), so each episode gets its own wrapper
// component that closes over its story; only plain data (episode id, words) travels as props.
const comps = [];
eps.forEach((id, i) => {
  const meta = JSON.parse(fs.readFileSync(path.join(epDir, id, "episode.json"), "utf8"));
  const comp = meta.composition || `Ep-${id}`;
  const scriptFile = path.join(epDir, id, "script.txt");
  const script = fs.existsSync(scriptFile) ? fs.readFileSync(scriptFile, "utf8").trim() : "";
  lines.push(`const S${i} = { ...story${i}, script: ${JSON.stringify(script)} };`);
  lines.push(`const C${i}: React.FC<Omit<EpisodeProps, "story">> = (p) => <EpisodeShort {...p} story={S${i}} />;`);
  lines.push(`const M${i}: CalculateMetadataFunction<Omit<EpisodeProps, "story">> = (a) => episodeMetadata({ ...a, props: { ...a.props, story: S${i} } } as any);`);
  comps.push(`    <Composition id=${JSON.stringify(comp)} component={C${i}} calculateMetadata={M${i}} defaultProps={{ episode: ${JSON.stringify(id)} }} durationInFrames={framesOf(S${i})} fps={30} width={1080} height={1920} />`);
});
lines.push("export const Episodes: React.FC = () => (", "  <>");
comps.forEach((c) => lines.push(c));
lines.push("  </>", ");", "");
fs.writeFileSync(path.join(root, "src", "episodes.generated.tsx"), lines.join("\n"));
console.log(`episodes registered: ${eps.length ? eps.join(", ") : "none"}`);
