# Brain Scan - shorts  (2026-11-14)

## Corpus Check
- 56 files · ~21,250 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 4)

## Summary
- 345 neurons · 510 synapses · 35 lobes (17 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0db6f373`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `mybrain update .` after code changes (no API cost).

## Lobes (Navigation)
- kokoro_tts.py
- package.json
- bench-render.mjs
- EpisodeShort.tsx
- story.tsx
- dependencies
- compilerOptions
- Channel rules
- Google Drive (rclone) - 3 secrets
- Topics
- Health check
- Shorts
- Tools
- drive.sh
- asset-index.md
- feedback.md
- performance.md
- brain/README.md
- render-log.md
- series-parts.md
- style-decisions.md
- SETUP-ASSETS.md
- library/README.md
- voicestudio_tts.sh
- changed-episodes.sh
- commit-push.sh
- fetch-assets.sh
- fetch-skill.sh
- assets.d.ts
- mybrain
- look.ts
- kitchen.ts
- Post.tsx
- scripts
- CLAUDE.md

## Core Neurons (most connected - your core abstractions)
1. `AntScene()` - 15 synapses
2. `compilerOptions` - 11 synapses
3. `shot()` - 10 synapses
4. `main()` - 10 synapses
5. `buildKitchen()` - 9 synapses
6. `Channel rules` - 9 synapses
7. `buildWorld()` - 8 synapses
8. `remotion` - 8 synapses
9. `main()` - 8 synapses
10. `react` - 7 synapses

## Surprising Connections (you probably didn't know these)
- `shot()` --indirect_call--> `easeOut()`  [INFERRED]
  episodes/ant-kitchen/story.tsx → src/engine/cam.ts
- `buildWorld()` --calls--> `buildKitchen()`  [EXTRACTED]
  episodes/ant-kitchen/story.tsx → library/environments/kitchen.ts
- `buildWorld()` --calls--> `Card`  [EXTRACTED]
  episodes/ant-kitchen/story.tsx → src/engine/card.ts
- `AntScene()` --calls--> `applyLook()`  [EXTRACTED]
  episodes/ant-kitchen/story.tsx → src/engine/look.ts
- `AntScene()` --calls--> `PostChain()`  [EXTRACTED]
  episodes/ant-kitchen/story.tsx → src/engine/Post.tsx

## Import Cycles
- None detected.

## Lobes (35 total, 18 thin omitted)

### Lobe 0 - "kokoro_tts.py"
Cohesion: 0.09
Neurons (14): call_sfx(), cue_time(), duck_curve(), limiter(), main(), music_bed(), j(), main() (+6 more)

### Lobe 1 - "package.json"
Cohesion: 0.07
Neurons (31): description, devDependencies, @types/react, @types/three, typescript, name, private, type (+23 more)

### Lobe 2 - "bench-render.mjs"
Cohesion: 0.09
Neurons (17): chromiumOptions, frameRange, [id, from, to, scale, out, conc, props = "{}"], inputProps, res, t0, t1, t2 (+9 more)

### Lobe 3 - "EpisodeShort.tsx"
Cohesion: 0.20
Neurons (17): Word, episodeMetadata(), EpisodeProps, EpisodeShort(), framesOf(), renderDpr(), SceneProps, Story (+9 more)

### Lobe 4 - "story.tsx"
Cohesion: 0.10
Neurons (36): AntScene(), AntState, blinkAt(), buildScent(), buildSlipper(), buildTrail(), buildWorld(), Ctx (+28 more)

### Lobe 5 - "dependencies"
Cohesion: 0.14
Neurons (14): dependencies, @fontsource/montserrat, postprocessing, react, react-dom, @react-three/fiber, @react-three/postprocessing, remotion (+6 more)

### Lobe 6 - "compilerOptions"
Cohesion: 0.15
Neurons (12): compilerOptions, esModuleInterop, jsx, lib, module, moduleResolution, noEmit, resolveJsonModule (+4 more)

### Lobe 7 - "Channel rules"
Cohesion: 0.20
Neurons (9): Animation skill (mromidev/claude-animated-shorts), Anti-template rule (YouTube inauthentic-content policy), Channel rules, Five rotating series, Format, Hard rules (from the owner), Identity, Script formula (+1 more)

### Lobe 8 - "Google Drive (rclone) - 3 secrets"
Cohesion: 0.22
Neurons (8): 1. Make a free Google Cloud project (no billing account needed), 2. Consent screen, 3. OAuth client, 4. Get a refresh token with the OAuth Playground, 5. Add the secrets, Google Drive (rclone) - 3 secrets, Optional repository variables (Settings -> Secrets and variables -> Actions -> Variables tab), Secrets setup (all from your phone, all free)

### Lobe 9 - "Topics"
Cohesion: 0.29
Neurons (6): Series 1: Tiny World, Series 2: Made of Time, Series 3: Inside Out, Series 4: Alternate Earth, Series 5: Animals Explain Humans, Topics

### Lobe 10 - "Health check"
Cohesion: 0.33
Neurons (5): Audio mix, Drive, Health check, Render, Voice

### Lobe 11 - "Shorts"
Cohesion: 0.50
Neurons (3): Shorts, Visual style, Workflows (start them from the GitHub app: Actions -> workflow -> Run workflow)

### Lobe 12 - "Tools"
Cohesion: 0.50
Neurons (3): Budget render profile (2026-11-14, local 4-CPU sandbox, 1080x1920 output), Render cost on the free private runner (2 CPUs), measured 2026-11-13, Tools

### Lobe 30 - "look.ts"
Cohesion: 0.09
Neurons (9): three, blobTex, Card, Draw, applyLook(), Look, LookName, LOOKS (+1 more)

### Lobe 31 - "kitchen.ts"
Cohesion: 0.18
Neurons (10): buildKitchen(), cabinet(), crumb(), crumbTex(), Kitchen, lam(), TILE, tiles() (+2 more)

### Lobe 32 - "Post.tsx"
Cohesion: 0.14
Neurons (6): postprocessing, @react-three/fiber, @react-three/postprocessing, msaa(), PostChain(), PostState

### Lobe 33 - "scripts"
Cohesion: 0.40
Neurons (5): scripts, skill, stills, studio, typecheck

## Knowledge Gaps
- **7 isolated node(s):** `mybrain-mcp`, `@remotion/bundler`, `@remotion/renderer`, `react-dom`, `@types/react` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 191 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `mybrain query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `three` connect `look.ts` to `Post.tsx`, `package.json`, `story.tsx`, `kitchen.ts`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `AntScene()` (e.g. with `story.tsx` and `buildWorld()`) actually correct?**
  _`AntScene()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `mybrain-mcp`, `@remotion/bundler`, `@remotion/renderer` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `kokoro_tts.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08603145235892692 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06852497096399536 - nodes in this community are weakly interconnected._
- **Why does `remotion` connect `package.json` to `Post.tsx`, `EpisodeShort.tsx`, `story.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._