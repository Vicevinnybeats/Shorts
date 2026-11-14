# Brain Scan - shorts  (2026-11-14)

## Corpus Check
- 66 files · ~38,641 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 5)

## Summary
- 431 neurons · 706 synapses · 34 lobes (15 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `057fb05d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `mybrain update .` after code changes (no API cost).

## Lobes (Navigation)
- kokoro_tts.py
- package.json
- bench-render.mjs
- goalkeeper-still/story.tsx
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
- kitchen.ts
- package.json
- CLAUDE.md
- RESEARCH.md

## Core Neurons (most connected - your core abstractions)
1. `ShotView()` - 28 synapses
2. `AntScene()` - 15 synapses
3. `react` - 13 synapses
4. `remotion` - 12 synapses
5. `compilerOptions` - 11 synapses
6. `shot()` - 10 synapses
7. `main()` - 10 synapses
8. `Channel rules` - 10 synapses
9. `Stadium()` - 9 synapses
10. `Person()` - 9 synapses

## Surprising Connections (you probably didn't know these)
- `shot()` --indirect_call--> `easeOut()`  [INFERRED]
  episodes/ant-kitchen/story.tsx → src/engine/cam.ts
- `buildWorld()` --calls--> `buildKitchen()`  [EXTRACTED]
  episodes/ant-kitchen/story.tsx → library/environments/kitchen.ts
- `AntScene()` --calls--> `PostChain()`  [EXTRACTED]
  episodes/ant-kitchen/story.tsx → src/engine/Post.tsx
- `AntScene()` --calls--> `cueTime()`  [EXTRACTED]
  episodes/ant-kitchen/story.tsx → src/engine/timeline.ts
- `AntScene()` --calls--> `shotAt()`  [EXTRACTED]
  episodes/ant-kitchen/story.tsx → src/engine/timeline.ts

## Import Cycles
- None detected.

## Lobes (34 total, 19 thin omitted)

### Lobe 0 - "kokoro_tts.py"
Cohesion: 0.08
Neurons (15): call_sfx(), crowd(), cue_time(), duck_curve(), limiter(), main(), music_bed(), j() (+7 more)

### Lobe 1 - "package.json"
Cohesion: 0.09
Neurons (31): @fontsource/montserrat, remotion, @remotion/fonts, @remotion/three, Captions(), Group, groupWords(), Word (+23 more)

### Lobe 2 - "bench-render.mjs"
Cohesion: 0.09
Neurons (17): chromiumOptions, frameRange, [id, from, to, scale, out, conc, props = "{}"], inputProps, res, t0, t1, t2 (+9 more)

### Lobe 3 - "goalkeeper-still/story.tsx"
Cohesion: 0.05
Neurons (74): Burst(), Diver(), ease, k(), LAMPS, Leo(), OTHER_KEEPERS, PLACE (+66 more)

### Lobe 4 - "story.tsx"
Cohesion: 0.06
Neurons (44): AntScene(), AntState, blinkAt(), buildScent(), buildSlipper(), buildTrail(), buildWorld(), Ctx (+36 more)

### Lobe 5 - "dependencies"
Cohesion: 0.14
Neurons (14): dependencies, @fontsource/montserrat, postprocessing, react, react-dom, @react-three/fiber, @react-three/postprocessing, remotion (+6 more)

### Lobe 6 - "compilerOptions"
Cohesion: 0.15
Neurons (12): compilerOptions, esModuleInterop, jsx, lib, module, moduleResolution, noEmit, resolveJsonModule (+4 more)

### Lobe 7 - "Channel rules"
Cohesion: 0.18
Neurons (10): Animation skill (mromidev/claude-animated-shorts), Anti-template rule (YouTube inauthentic-content policy), Channel rules, Channel theme (decided 2026-11-14, replaces the five series below and the 'What If' series), Five rotating series (retired 2026-11-14, kept for reference), Format, Hard rules (from the owner), Identity (+2 more)

### Lobe 8 - "Google Drive (rclone) - 3 secrets"
Cohesion: 0.22
Neurons (8): 1. Make a free Google Cloud project (no billing account needed), 2. Consent screen, 3. OAuth client, 4. Get a refresh token with the OAuth Playground, 5. Add the secrets, Google Drive (rclone) - 3 secrets, Optional repository variables (Settings -> Secrets and variables -> Actions -> Variables tab), Secrets setup (all from your phone, all free)

### Lobe 9 - "Topics"
Cohesion: 0.22
Neurons (8): Channel theme: everyday face-offs decided by a surprising rule (active), Retired series (2026-11-14) - kept so nothing repeats, Series 1: Tiny World, Series 2: Made of Time, Series 3: Inside Out, Series 4: Alternate Earth, Series 5: Animals Explain Humans, Topics

### Lobe 10 - "Health check"
Cohesion: 0.33
Neurons (5): Audio mix, Drive, Health check, Render, Voice

### Lobe 11 - "Shorts"
Cohesion: 0.50
Neurons (3): Shorts, Visual style, Workflows (start them from the GitHub app: Actions -> workflow -> Run workflow)

### Lobe 12 - "Tools"
Cohesion: 0.50
Neurons (3): Budget render profile (2026-11-14, local 4-CPU sandbox, 1080x1920 output), Render cost on the free private runner (2 CPUs), measured 2026-11-13, Tools

### Lobe 31 - "kitchen.ts"
Cohesion: 0.18
Neurons (10): buildKitchen(), cabinet(), crumb(), crumbTex(), Kitchen, lam(), TILE, tiles() (+2 more)

### Lobe 32 - "package.json"
Cohesion: 0.06
Neurons (26): description, devDependencies, @types/react, @types/three, typescript, name, private, scripts (+18 more)

## Knowledge Gaps
- **6 isolated node(s):** `mybrain-mcp`, `@remotion/bundler`, `@remotion/renderer`, `@types/react`, `@types/three` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 213 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `mybrain query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `goalkeeper-still/story.tsx` to `package.json`, `package.json`, `story.tsx`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `AntScene()` (e.g. with `ant-kitchen/story.tsx` and `buildWorld()`) actually correct?**
  _`AntScene()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `mybrain-mcp`, `@remotion/bundler`, `@remotion/renderer` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `kokoro_tts.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Why does `remotion` connect `package.json` to `package.json`, `goalkeeper-still/story.tsx`, `story.tsx`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08943089430894309 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._