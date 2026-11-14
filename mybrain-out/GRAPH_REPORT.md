# Brain Scan - shorts  (2026-11-14)

## Corpus Check
- 43 files · ~12,324 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 3)

## Summary
- 221 neurons · 265 synapses · 30 lobes (12 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `20c576c9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `mybrain update .` after code changes (no API cost).

## Lobes (Navigation)
- kokoro_tts.py
- package.json
- bench-render.mjs
- HealthCard.tsx
- mixdown.py
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

## Core Neurons (most connected - your core abstractions)
1. `compilerOptions` - 11 synapses
2. `main()` - 9 synapses
3. `Channel rules` - 9 synapses
4. `main()` - 8 synapses
5. `map_script()` - 7 synapses
6. `Topics` - 6 synapses
7. `Google Drive (rclone) - 3 secrets` - 6 synapses
8. `scripts` - 5 synapses
9. `remotion` - 5 synapses
10. `music_bed()` - 5 synapses

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `map_script()`  [EXTRACTED]
  pipeline/voice/align_words.py → pipeline/voice/wordmap.py
- `main()` --calls--> `map_script()`  [EXTRACTED]
  pipeline/voice/kokoro_tts.py → pipeline/voice/wordmap.py
- `HealthCard()` --calls--> `Captions()`  [EXTRACTED]
  src/health/HealthCard.tsx → src/captions/Captions.tsx

## Import Cycles
- None detected.

## Lobes (30 total, 18 thin omitted)

### Lobe 0 - "kokoro_tts.py"
Cohesion: 0.13
Neurons (8): j(), main(), run_jobs(), ts(), main(), main(), map_script(), norm()

### Lobe 1 - "package.json"
Cohesion: 0.07
Neurons (26): description, devDependencies, @types/react, @types/three, typescript, name, private, scripts (+18 more)

### Lobe 2 - "bench-render.mjs"
Cohesion: 0.10
Neurons (16): chromiumOptions, frameRange, [id, from, to, scale, out, conc, props = "{}"], inputProps, res, t0, t1, t2 (+8 more)

### Lobe 3 - "HealthCard.tsx"
Cohesion: 0.17
Neurons (15): @fontsource/montserrat, react, remotion, @remotion/fonts, Captions(), Group, groupWords(), Word (+7 more)

### Lobe 4 - "mixdown.py"
Cohesion: 0.24
Neurons (5): call_sfx(), duck_curve(), limiter(), main(), music_bed()

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

## Knowledge Gaps
- **11 isolated node(s):** `mybrain-mcp`, `@react-three/fiber`, `@react-three/postprocessing`, `@remotion/bundler`, `@remotion/renderer` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 147 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `mybrain query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `mybrain-mcp`, `@react-three/fiber`, `@react-three/postprocessing` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `kokoro_tts.py` be split into smaller, more focused modules?**
  _Cohesion score 0.12688172043010754 - nodes in this community are weakly interconnected._
- **Why does `remotion` connect `HealthCard.tsx` to `package.json`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Why does `react` connect `HealthCard.tsx` to `package.json`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Should `bench-render.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.09666666666666666 - nodes in this community are weakly interconnected._