# Render log

Written by the workflows (`pipeline/log_run.py`). Minutes are wall-clock per job, rounded up like GitHub bills them.
Private repos get 2,000 free Linux minutes per month; the workflows warn at 1,500.

| Date (UTC) | Workflow | Episode | Job | Minutes | Month total | Result |
|---|---|---|---|---|---|---|
| 2026-11-13 20:41 | render-stills | _pipeline-test  | stills | 2 | 2 | running (run 43503657910) |
| 2026-11-13 21:03 | health-check | - | drive | 1 | 3 | success (run 43506564892) |
| 2026-11-13 21:03 | health-check | - | voice-voicestudio | 5 | 8 | failure (run 43506564892) |
| 2026-11-13 21:03 | health-check | - | voice-kokoro | 2 | 10 | failure (run 43506564892) |
| 2026-11-13 21:03 | health-check | - | render | 1 | 11 | skipped (run 43506564892) |
| 2026-11-13 21:03 | health-check | - | audio-mix | 1 | 12 | skipped (run 43506564892) |
| 2026-11-13 21:03 | health-check | - | report | 1 | 13 | running (run 43506564892) |
