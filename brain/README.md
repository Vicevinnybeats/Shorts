# Brain: project memory

Read every file here before planning a new video. Update the relevant file after every step.

| File | What it holds |
|---|---|
| `channel-rules.md` | Hard rules, format, series identities, script formula, anti-template rule |
| `style-decisions.md` | Look, voice and audio decisions (with dates and reasons) |
| `topics.md` | Every topic per series: backlog, made, published. Never repeat one. |
| `series-parts.md` | Multi-part stories and where each one stands |
| `asset-index.md` | Summary of `/library/index.json` (filled in Phase 1) |
| `performance.md` | What performed well or badly after publishing |
| `feedback.md` | The owner's feedback on every reviewed video, and what changed because of it |
| `render-log.md` | Every Actions run: workflow, minutes, month total (written by the workflows) |
| `tools.md` | Tool choices, versions and health-check results |

Code map: the owner's own MyBrain (github.com/Vicevinnybeats/MyBrain, free, no AI) maps this repo into
`mybrain-out/graph.json`; the `mybrain` MCP server in `.mcp.json` lets sessions query it, and the `mybrain-map`
workflow refreshes it on every push. These markdown files stay the place for rules, topics and feedback.

Why not the dnaidionov MyBrain plugin: MyBrain needs a paid OpenRouter key for embeddings and a PostgreSQL server
(Docker or AWS RDS) that would not survive an ephemeral cloud session. Rule: free only. Decided 2026-11-13.
