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
| 2026-11-13 21:11 | render-final | _pipeline-test | voice-and-mix | 4 | 4 | success (run 43503657275) |
| 2026-11-13 21:11 | render-final | _pipeline-test | render (1131-1505) | 27 | 31 | success (run 43503657275) |
| 2026-11-13 21:11 | render-final | _pipeline-test | render (0-376) | 28 | 59 | success (run 43503657275) |
| 2026-11-13 21:11 | render-final | _pipeline-test | render (377-753) | 20 | 79 | success (run 43503657275) |
| 2026-11-13 21:11 | render-final | _pipeline-test | render (754-1130) | 20 | 99 | success (run 43503657275) |
| 2026-11-13 21:11 | render-final | _pipeline-test | assemble | 1 | 100 | success (run 43503657275) |
| 2026-11-13 21:11 | render-final | _pipeline-test | log | 1 | 101 | success (run 43503657275) |
| 2026-11-13 21:17 | health-check | - | drive | 1 | 14 | success (run 43508222258) |
| 2026-11-13 21:17 | health-check | - | voice-kokoro | 6 | 20 | success (run 43508222258) |
| 2026-11-13 21:17 | health-check | - | voice-voicestudio | 5 | 25 | failure (run 43508222258) |
| 2026-11-13 21:17 | health-check | - | render | 1 | 26 | skipped (run 43508222258) |
| 2026-11-13 21:17 | health-check | - | audio-mix | 2 | 28 | success (run 43508222258) |
| 2026-11-13 21:17 | health-check | - | report | 1 | 29 | running (run 43508222258) |
