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
| 2026-11-13 21:11 | render-final | _pipeline-test | voice-and-mix | 4 | 17 | success (run 43503657275) |
| 2026-11-13 21:11 | render-final | _pipeline-test | render (1131-1505) | 27 | 44 | success (run 43503657275) |
| 2026-11-13 21:11 | render-final | _pipeline-test | render (0-376) | 28 | 72 | success (run 43503657275) |
| 2026-11-13 21:11 | render-final | _pipeline-test | render (377-753) | 20 | 92 | success (run 43503657275) |
| 2026-11-13 21:11 | render-final | _pipeline-test | render (754-1130) | 20 | 112 | success (run 43503657275) |
| 2026-11-13 21:11 | render-final | _pipeline-test | assemble | 1 | 113 | success (run 43503657275) |
| 2026-11-13 21:11 | render-final | _pipeline-test | log | 1 | 114 | success (run 43503657275) |
| 2026-11-13 21:17 | health-check | - | drive | 1 | 115 | success (run 43508222258) |
| 2026-11-13 21:17 | health-check | - | voice-kokoro | 6 | 121 | success (run 43508222258) |
| 2026-11-13 21:17 | health-check | - | voice-voicestudio | 5 | 126 | failure (run 43508222258) |
| 2026-11-13 21:17 | health-check | - | render | 1 | 127 | skipped (run 43508222258) |
| 2026-11-13 21:17 | health-check | - | audio-mix | 2 | 129 | success (run 43508222258) |
| 2026-11-13 21:17 | health-check | - | report | 1 | 130 | running (run 43508222258) |
| 2026-11-14 13:47 | health-check | - | drive | 1 | 131 | cancelled (run 43601452804) |
| 2026-11-14 13:47 | health-check | - | voice-voicestudio | 1 | 132 | cancelled (run 43601452804) |
| 2026-11-14 13:47 | health-check | - | voice-kokoro | 1 | 133 | cancelled (run 43601452804) |
| 2026-11-14 13:47 | health-check | - | render | 1 | 134 | cancelled (run 43601452804) |
| 2026-11-14 13:47 | health-check | - | audio-mix | 1 | 135 | cancelled (run 43601452804) |
| 2026-11-14 13:47 | health-check | - | report | 1 | 136 | running (run 43601452804) |
| 2026-11-14 13:49 | render-stills | ant-kitchen  | stills | 3 | 139 | running (run 43601452778) |
| 2026-11-14 15:36 | render-final | ant-kitchen | voice-and-mix | 3 | 142 | success (run 43601452782) |
| 2026-11-14 15:36 | render-final | ant-kitchen | render (0-315) | 53 | 195 | success (run 43601452782) |
| 2026-11-14 15:36 | render-final | ant-kitchen | render (632-947) | 89 | 284 | success (run 43601452782) |
| 2026-11-14 15:36 | render-final | ant-kitchen | render (1580-1894) | 95 | 379 | success (run 43601452782) |
| 2026-11-14 15:36 | render-final | ant-kitchen | render (1264-1579) | 48 | 427 | success (run 43601452782) |
| 2026-11-14 15:36 | render-final | ant-kitchen | render (316-631) | 103 | 530 | success (run 43601452782) |
| 2026-11-14 15:36 | render-final | ant-kitchen | render (948-1263) | 106 | 636 | success (run 43601452782) |
| 2026-11-14 15:36 | render-final | ant-kitchen | assemble | 2 | 638 | success (run 43601452782) |
| 2026-11-14 15:36 | render-final | ant-kitchen | log | 1 | 639 | success (run 43601452782) |
| 2026-11-14 18:45 | render-final | goalkeeper-still | voice-and-mix | 5 | 644 | success (run 43623117897) |
| 2026-11-14 18:45 | render-final | goalkeeper-still | render (1002-2002) | 52 | 696 | success (run 43623117897) |
| 2026-11-14 18:45 | render-final | goalkeeper-still | render (0-1001) | 39 | 735 | success (run 43623117897) |
| 2026-11-14 18:45 | render-final | goalkeeper-still | assemble | 2 | 737 | success (run 43623117897) |
| 2026-11-14 18:45 | render-final | goalkeeper-still | log | 1 | 738 | success (run 43623117897) |
| 2026-11-14 19:24 | render-final | goalkeeper-still | voice-and-mix | 4 | 742 | success (run 43629337758) |
| 2026-11-14 19:24 | render-final | goalkeeper-still | render (1336-1669) | 16 | 758 | success (run 43629337758) |
| 2026-11-14 19:24 | render-final | goalkeeper-still | render (334-667) | 18 | 776 | success (run 43629337758) |
| 2026-11-14 19:24 | render-final | goalkeeper-still | render (1670-2002) | 23 | 799 | success (run 43629337758) |
| 2026-11-14 19:24 | render-final | goalkeeper-still | render (0-333) | 12 | 811 | success (run 43629337758) |
| 2026-11-14 19:24 | render-final | goalkeeper-still | render (668-1001) | 23 | 834 | success (run 43629337758) |
| 2026-11-14 19:24 | render-final | goalkeeper-still | render (1002-1335) | 12 | 846 | success (run 43629337758) |
| 2026-11-14 19:24 | render-final | goalkeeper-still | assemble | 2 | 848 | success (run 43629337758) |
| 2026-11-14 19:24 | render-final | goalkeeper-still | log | 1 | 849 | success (run 43629337758) |
| 2026-11-14 19:56 | remix-audio | goalkeeper-still | remix | 3 | 852 | running (run 43634619138) |
| 2026-11-14 21:14 | render-final | slow-queue | voice-and-mix | 3 | 855 | success (run 43639471014) |
| 2026-11-14 21:14 | render-final | slow-queue | render (706-1058) | 17 | 872 | success (run 43639471014) |
| 2026-11-14 21:14 | render-final | slow-queue | render (1412-1764) | 14 | 886 | success (run 43639471014) |
| 2026-11-14 21:14 | render-final | slow-queue | render (353-705) | 20 | 906 | success (run 43639471014) |
| 2026-11-14 21:14 | render-final | slow-queue | render (1059-1411) | 18 | 924 | success (run 43639471014) |
| 2026-11-14 21:14 | render-final | slow-queue | render (1765-2112) | 19 | 943 | success (run 43639471014) |
| 2026-11-14 21:14 | render-final | slow-queue | render (0-352) | 21 | 964 | success (run 43639471014) |
| 2026-11-14 21:14 | render-final | slow-queue | assemble | 2 | 966 | success (run 43639471014) |
| 2026-11-14 21:14 | render-final | slow-queue | log | 1 | 967 | success (run 43639471014) |
| 2026-11-14 22:49 | render-final | slow-queue | voice-and-mix | 3 | 970 | success (run 43647779284) |
| 2026-11-14 22:49 | render-final | slow-queue | render (706-1058) | 9 | 979 | success (run 43647779284) |
| 2026-11-14 22:49 | render-final | slow-queue | render (353-705) | 12 | 991 | success (run 43647779284) |
| 2026-11-14 22:49 | render-final | slow-queue | render (1412-1764) | 12 | 1003 | success (run 43647779284) |
| 2026-11-14 22:49 | render-final | slow-queue | render (1765-2112) | 11 | 1014 | success (run 43647779284) |
| 2026-11-14 22:49 | render-final | slow-queue | render (1059-1411) | 23 | 1037 | success (run 43647779284) |
| 2026-11-14 22:49 | render-final | slow-queue | render (0-352) | 22 | 1059 | success (run 43647779284) |
| 2026-11-14 22:49 | render-final | slow-queue | assemble | 2 | 1061 | success (run 43647779284) |
| 2026-11-14 22:49 | render-final | slow-queue | log | 1 | 1062 | success (run 43647779284) |
| 2026-11-14 23:22 | render-final | coin-flip | voice-and-mix | 4 | 1066 | success (run 43650658138) |
| 2026-11-14 23:22 | render-final | coin-flip | render (1083-1443) | 16 | 1082 | success (run 43650658138) |
| 2026-11-14 23:22 | render-final | coin-flip | render (1805-2160) | 20 | 1102 | success (run 43650658138) |
| 2026-11-14 23:22 | render-final | coin-flip | render (0-360) | 21 | 1123 | success (run 43650658138) |
| 2026-11-14 23:22 | render-final | coin-flip | render (361-721) | 10 | 1133 | success (run 43650658138) |
| 2026-11-14 23:22 | render-final | coin-flip | render (1444-1804) | 16 | 1149 | success (run 43650658138) |
| 2026-11-14 23:22 | render-final | coin-flip | render (722-1082) | 18 | 1167 | success (run 43650658138) |
| 2026-11-14 23:22 | render-final | coin-flip | assemble | 3 | 1170 | success (run 43650658138) |
| 2026-11-14 23:22 | render-final | coin-flip | log | 1 | 1171 | success (run 43650658138) |
| 2026-11-15 10:55 | render-final | lift-button | voice-and-mix | 3 | 1174 | success (run 43704527048) |
| 2026-11-15 10:55 | render-final | lift-button | render (1615-1934) | 20 | 1194 | success (run 43704527048) |
| 2026-11-15 10:55 | render-final | lift-button | render (0-322) | 12 | 1206 | success (run 43704527048) |
| 2026-11-15 10:55 | render-final | lift-button | render (969-1291) | 12 | 1218 | success (run 43704527048) |
| 2026-11-15 10:55 | render-final | lift-button | render (323-645) | 16 | 1234 | success (run 43704527048) |
| 2026-11-15 10:55 | render-final | lift-button | render (646-968) | 16 | 1250 | success (run 43704527048) |
| 2026-11-15 10:55 | render-final | lift-button | render (1292-1614) | 15 | 1265 | success (run 43704527048) |
| 2026-11-15 10:55 | render-final | lift-button | assemble | 2 | 1267 | success (run 43704527048) |
| 2026-11-15 10:55 | render-final | lift-button | log | 1 | 1268 | success (run 43704527048) |
| 2026-11-15 16:34 | render-final | tickle | voice-and-mix | 3 | 1271 | success (run 43733594780) |
| 2026-11-15 16:34 | render-final | tickle | render (1396-1744) | 19 | 1290 | success (run 43733594780) |
| 2026-11-15 16:34 | render-final | tickle | render (1745-2092) | 22 | 1312 | success (run 43733594780) |
| 2026-11-15 16:34 | render-final | tickle | render (1047-1395) | 12 | 1324 | success (run 43733594780) |
| 2026-11-15 16:34 | render-final | tickle | render (698-1046) | 23 | 1347 | success (run 43733594780) |
| 2026-11-15 16:34 | render-final | tickle | render (0-348) | 20 | 1367 | success (run 43733594780) |
| 2026-11-15 16:34 | render-final | tickle | render (349-697) | 16 | 1383 | success (run 43733594780) |
| 2026-11-15 16:34 | render-final | tickle | assemble | 3 | 1386 | success (run 43733594780) |
| 2026-11-15 16:34 | render-final | tickle | log | 1 | 1387 | success (run 43733594780) |
| 2026-11-15 18:22 | render-final | toast | voice-and-mix | 3 | 1390 | success (run 43745676065) |
| 2026-11-15 18:22 | render-final | toast | render (1360-2039) | 3 | 1393 | success (run 43745676065) |
| 2026-11-15 18:22 | render-final | toast | render (680-1359) | 2 | 1395 | success (run 43745676065) |
| 2026-11-15 18:22 | render-final | toast | render (0-679) | 3 | 1398 | success (run 43745676065) |
| 2026-11-15 18:22 | render-final | toast | assemble | 2 | 1400 | success (run 43745676065) |
| 2026-11-15 18:22 | render-final | toast | log | 1 | 1401 | success (run 43745676065) |
| 2026-11-15 22:50 | render-final | pole | voice-and-mix | 3 | 1404 | success (run 43770792582) |
| 2026-11-15 22:50 | render-final | pole | render (654-1307) | 2 | 1406 | success (run 43770792582) |
| 2026-11-15 22:50 | render-final | pole | render (0-653) | 3 | 1409 | success (run 43770792582) |
| 2026-11-15 22:50 | render-final | pole | render (1308-1960) | 3 | 1412 | success (run 43770792582) |
| 2026-11-15 22:50 | render-final | pole | assemble | 2 | 1414 | success (run 43770792582) |
| 2026-11-15 22:50 | render-final | pole | log | 1 | 1415 | success (run 43770792582) |
| 2026-11-16 06:15 | render-final | silent | voice-and-mix | 3 | 1418 | success (run 43814738293) |
| 2026-11-16 06:15 | render-final | silent | render (642-1283) | 3 | 1421 | success (run 43814738293) |
| 2026-11-16 06:15 | render-final | silent | render (1284-1923) | 3 | 1424 | success (run 43814738293) |
| 2026-11-16 06:15 | render-final | silent | render (0-641) | 3 | 1427 | success (run 43814738293) |
| 2026-11-16 06:15 | render-final | silent | assemble | 2 | 1429 | success (run 43814738293) |
| 2026-11-16 06:15 | render-final | silent | log | 1 | 1430 | success (run 43814738293) |
| 2026-11-16 21:11 | render-final | first-offer | voice-and-mix | 4 | 1434 | success (run 43956041968) |
| 2026-11-16 21:11 | render-final | first-offer | render (0-678) | 4 | 1438 | success (run 43956041968) |
| 2026-11-16 21:11 | render-final | first-offer | render (679-1357) | 3 | 1441 | success (run 43956041968) |
| 2026-11-16 21:11 | render-final | first-offer | render (1358-2035) | 3 | 1444 | success (run 43956041968) |
| 2026-11-16 21:11 | render-final | first-offer | assemble | 2 | 1446 | success (run 43956041968) |
| 2026-11-16 21:11 | render-final | first-offer | log | 1 | 1447 | success (run 43956041968) |
| 2026-11-17 05:08 | render-final | winner | voice-and-mix | 4 | 1451 | success (run 44020846226) |
| 2026-11-17 05:08 | render-final | winner | render (0-693) | 4 | 1455 | success (run 44020846226) |
| 2026-11-17 05:08 | render-final | winner | render (1388-2079) | 3 | 1458 | success (run 44020846226) |
| 2026-11-17 05:08 | render-final | winner | render (694-1387) | 2 | 1460 | success (run 44020846226) |
| 2026-11-17 05:08 | render-final | winner | assemble | 3 | 1463 | success (run 44020846226) |
| 2026-11-17 05:08 | render-final | winner | log | 1 | 1464 | success (run 44020846226) |
| 2026-11-20 12:13 | render-final | gta-army | voice-and-mix | 4 | 1468 | success (run 44732930535) |
| 2026-11-20 12:13 | render-final | gta-army | render (709-1417) | 3 | 1471 | success (run 44732930535) |
| 2026-11-20 12:13 | render-final | gta-army | render (1418-2126) | 3 | 1474 | success (run 44732930535) |
| 2026-11-20 12:13 | render-final | gta-army | render (0-708) | 3 | 1477 | success (run 44732930535) |
| 2026-11-20 12:13 | render-final | gta-army | assemble | 2 | 1479 | success (run 44732930535) |
| 2026-11-20 12:13 | render-final | gta-army | log | 1 | 1480 | success (run 44732930535) |
| 2026-11-20 | local stills | gta-ufo | 17 stills + 6 re-check (scale 0.3) | - | - | built (cheap mode, 1 builder): camp/road/lab/darkroom drawn in story.tsx; not committed |
| 2026-11-20 13:52 | render-final | gta-ufo | voice-and-mix | 3 | 1483 | success (run 44743393121) |
| 2026-11-20 13:52 | render-final | gta-ufo | render (1446-2168) | 3 | 1486 | success (run 44743393121) |
| 2026-11-20 13:52 | render-final | gta-ufo | render (0-722) | 18 | 1504 | success (run 44743393121) |
| 2026-11-20 13:52 | render-final | gta-ufo | render (723-1445) | 3 | 1507 | success (run 44743393121) |
| 2026-11-20 13:52 | render-final | gta-ufo | assemble | 13 | 1520 | success (run 44743393121) |
| 2026-11-20 13:52 | render-final | gta-ufo | log | 1 | 1521 | success (run 44743393121) |
| 2026-11-20 14:17 | render-final | gta-redlight | voice-and-mix | 3 | 1524 | success (run 44750546862) |
| 2026-11-20 14:17 | render-final | gta-redlight | render (731-1461) | 4 | 1528 | success (run 44750546862) |
| 2026-11-20 14:17 | render-final | gta-redlight | render (1462-2190) | 2 | 1530 | success (run 44750546862) |
| 2026-11-20 14:17 | render-final | gta-redlight | render (0-730) | 4 | 1534 | success (run 44750546862) |
| 2026-11-20 14:17 | render-final | gta-redlight | assemble | 3 | 1537 | success (run 44750546862) |
| 2026-11-20 14:17 | render-final | gta-redlight | log | 1 | 1538 | success (run 44750546862) |
| 2026-11-20 20:13 | render-final | gta-radio | voice-and-mix | 3 | 1541 | success (run 44808334770) |
| 2026-11-20 20:13 | render-final | gta-radio | render (0-731) | 3 | 1544 | success (run 44808334770) |
| 2026-11-20 20:13 | render-final | gta-radio | render (1464-2195) | 3 | 1547 | success (run 44808334770) |
| 2026-11-20 20:13 | render-final | gta-radio | render (732-1463) | 3 | 1550 | success (run 44808334770) |
| 2026-11-20 20:13 | render-final | gta-radio | assemble | 2 | 1552 | success (run 44808334770) |
| 2026-11-20 20:13 | render-final | gta-radio | log | 1 | 1553 | success (run 44808334770) |
| 2026-11-21 | local stills | wi-gta-nosleep | 17 stills @0.4 (Golden Neon kit, 2 fix rounds) | - | - | ~1.3 s/still incl. overhead; tsc ok; voice bm_george pending in CI |
| 2026-11-21 10:06 | render-final | wi-gta-nosleep | voice-and-mix | 3 | 1556 | success (run 44892202134) |
| 2026-11-21 10:06 | render-final | wi-gta-nosleep | render (0-888) | 3 | 1559 | success (run 44892202134) |
| 2026-11-21 10:06 | render-final | wi-gta-nosleep | render (1778-2664) | 3 | 1562 | success (run 44892202134) |
| 2026-11-21 10:06 | render-final | wi-gta-nosleep | render (889-1777) | 2 | 1564 | success (run 44892202134) |
| 2026-11-21 10:06 | render-final | wi-gta-nosleep | assemble | 2 | 1566 | success (run 44892202134) |
| 2026-11-21 10:06 | render-final | wi-gta-nosleep | log | 1 | 1567 | success (run 44892202134) |
| 2026-11-21 | local stills | wi-gta-leonida | 20 stills @0.4 (fixed Golden Neon kit, 1 fix round) | - | - | ~1.4 s/still; tsc ok; contact sheet scratchpad wi2/r2/sheet.jpg; voice bm_george pending in CI |
| 2026-11-21 10:39 | render-final | wi-gta-leonida | voice-and-mix | 3 | 1570 | success (run 44894907117) |
| 2026-11-21 10:39 | render-final | wi-gta-leonida | render (0-713) | 2 | 1572 | success (run 44894907117) |
| 2026-11-21 10:39 | render-final | wi-gta-leonida | render (714-1427) | 2 | 1574 | success (run 44894907117) |
| 2026-11-21 10:39 | render-final | wi-gta-leonida | render (1428-2140) | 2 | 1576 | success (run 44894907117) |
| 2026-11-21 10:39 | render-final | wi-gta-leonida | assemble | 2 | 1578 | success (run 44894907117) |
| 2026-11-21 10:39 | render-final | wi-gta-leonida | log | 1 | 1579 | success (run 44894907117) |
| 2026-11-21 13:33 | health-check | - | voice-kokoro | 5 | 1584 | success (run 44908447024) |
| 2026-11-21 13:33 | health-check | - | render | 13 | 1597 | success (run 44908447024) |
| 2026-11-21 13:33 | health-check | - | voice-voicestudio | 5 | 1602 | failure (run 44908447024) |
| 2026-11-21 13:33 | health-check | - | drive | 1 | 1603 | success (run 44908447024) |
| 2026-11-21 13:33 | health-check | - | audio-mix | 1 | 1604 | success (run 44908447024) |
| 2026-11-21 13:33 | health-check | - | report | 1 | 1605 | running (run 44908447024) |

## 2026-11-21 wi-gta-nosleep REMAKE in Stick3D + Golden Neon (stills only, local, not pushed/published)
- story.tsx rewritten: one persistent ThreeCanvas (pack puppets/rooms, @remotion/three, gl swangle) + What-If SVG HUD on top;
  16 cue-driven shots (hook sting at frame 0, choice cards once, counter 0->17->24->36->60, 264 H record, DAY 30 glitch,
  microsleep blackouts, 14 H asleep, speedrun loop, question card). Dip-through-black place changes, HUD hidden in dips.
- Reused from the pack / Stick3DTest: REMY3D look (+ series beanie), NEON3D floor/wall colours, Lights, Grade, Shaft, Dust,
  Person/Billboard puppets, Floor/WallDoor/SideWall/Shelf/Lamp/Monitor/Cabinet/Rug, Cam (Catmull-Rom + FOV kicks/impacts),
  Taxi, Barrier, Curtain, SpotCone. New: library/stick3d/neon.tsx (Halo, FloorPool, NeonBar, HeroLight, Motes, Panel,
  NeonSign, NeonClock, NightWindow, NeonPoster); puppet.ts: beanie/pom, flattop hair, collar, moods tired/sleep/sick/dizzy,
  lids/bags/nod. Stills (rough 2.85 w/s timing) checked; contact sheet library/previews/whatif/wi-gta-nosleep-stick3d.png.
- ~2 s per half-scale still locally (swangle). Real timing comes from words.json at render time (all beats cue-driven).
| 2026-11-21 13:49 | render-stills | wi-gta-nosleep  | stills | 2 | 1607 | running (run 44910624186) |
| 2026-11-21 13:59 | render-stills | wi-gta-nosleep  | stills | 1 | 1608 | running (run 44911562601) |
- 2026-11-21 (later): What If #1 now uses 12 Blender props (library/models, built by workflow blender-models) via
  library/stick3d/glb.tsx, and a per-scene lighting rig (key + fill + gold rim + hero pool + motivated practicals:
  lamp/TV/neon/window, cyan game light on the road, footlights on stage, gold calendar/blocks, coral stations).
| 2026-11-21 14:08 | render-stills | wi-gta-nosleep  | stills | 2 | 1610 | running (run 44912243381) |
| 2026-11-21 14:55 | render-final | wi-gta-nosleep | voice-and-mix | 27 | 1637 | success (run 44912499914) |
| 2026-11-21 14:55 | render-final | wi-gta-nosleep | render (0-484) | 16 | 1653 | success (run 44912499914) |
| 2026-11-21 14:55 | render-final | wi-gta-nosleep | render (1940-2424) | 17 | 1670 | success (run 44912499914) |
| 2026-11-21 14:55 | render-final | wi-gta-nosleep | render (485-969) | 9 | 1679 | success (run 44912499914) |
| 2026-11-21 14:55 | render-final | wi-gta-nosleep | render (970-1454) | 11 | 1690 | success (run 44912499914) |
| 2026-11-21 14:55 | render-final | wi-gta-nosleep | render (1455-1939) | 12 | 1702 | success (run 44912499914) |
| 2026-11-21 14:55 | render-final | wi-gta-nosleep | render (2425-2905) | 16 | 1718 | success (run 44912499914) |
| 2026-11-21 14:55 | render-final | wi-gta-nosleep | assemble | 3 | 1721 | success (run 44912499914) |
| 2026-11-21 14:55 | render-final | wi-gta-nosleep | log | 1 | 1722 | success (run 44912499914) |
| 2026-11-21 16:01 | remix-audio | wi-gta-nosleep | remix | 3 | 1725 | running (run 44922080023) |
| 2026-11-21 16:03 | health-check | - | render | 13 | 1738 | success (run 44921323863) |
| 2026-11-21 16:03 | health-check | - | voice-voicestudio | 6 | 1744 | failure (run 44921323863) |
| 2026-11-21 16:03 | health-check | - | drive | 1 | 1745 | success (run 44921323863) |
| 2026-11-21 16:03 | health-check | - | voice-kokoro | 3 | 1748 | success (run 44921323863) |
| 2026-11-21 16:03 | health-check | - | audio-mix | 1 | 1749 | success (run 44921323863) |
| 2026-11-21 16:03 | health-check | - | report | 1 | 1750 | running (run 44921323863) |
| 2026-11-21 16:10 | remix-audio | wi-gta-nosleep | remix | 2 | 1752 | running (run 44922935325) |
| 2026-11-21 16:23 | render-stills | wi-gta-nosleep  | stills | 3 | 1755 | running (run 44924099317) |
| 2026-11-21 16:28 | render-final | wi-gta-nosleep | voice-and-mix | 4 | 1759 | success (run 44924099314) |
| 2026-11-21 16:28 | render-final | wi-gta-nosleep | render (0-534) | 4 | 1763 | cancelled (run 44924099314) |
| 2026-11-21 16:28 | render-final | wi-gta-nosleep | render (2140-2674) | 4 | 1767 | cancelled (run 44924099314) |
| 2026-11-21 16:28 | render-final | wi-gta-nosleep | render (1605-2139) | 4 | 1771 | cancelled (run 44924099314) |
| 2026-11-21 16:28 | render-final | wi-gta-nosleep | render (535-1069) | 4 | 1775 | cancelled (run 44924099314) |
| 2026-11-21 16:28 | render-final | wi-gta-nosleep | render (2675-3207) | 4 | 1779 | cancelled (run 44924099314) |
| 2026-11-21 16:28 | render-final | wi-gta-nosleep | render (1070-1604) | 4 | 1783 | cancelled (run 44924099314) |
| 2026-11-21 16:28 | render-final | wi-gta-nosleep | log | 1 | 1784 | cancelled (run 44924099314) |
| 2026-11-21 16:28 | render-final | wi-gta-nosleep | assemble | 1 | 1785 | cancelled (run 44924099314) |
- 2026-11-21 What If 1 picture redo (owner: lighting, shadows, camera through cuts): walls/floors now LIT (Surface `lit`
  Lambert + `gain` 3.2 for the dark linear canvas output) with brighter navy/wood/carpet colours; rig = ambient 0.85 +
  sky/ground bounce 1.0 + warm key (shadow-casting, PCF soft 1024) + gold rim + hero pool + practicals; bed light toned
  down. Shadows: drop shadow of every standing puppet (silhouette on the floor away from the key) + pack contact blobs +
  blobs under Blender props (Glb `blob`); shadow maps on, but under swangle they barely show -> the drop/blob shadows
  carry the look. Camera: piecewise-linear moves (no ease to a stop), the whole film trucks LEFT + pushes in, whip-pan
  carry-over (8 f) out of and into every place change. Stills ~2.8 s avg (max 3.3) vs ~1.9 s before.
| 2026-11-21 16:54 | render-stills | wi-gta-nosleep  | stills | 3 | 1788 | running (run 44926962631) |
| 2026-11-21 17:20 | render-final | wi-gta-nosleep | voice-and-mix | 3 | 1791 | success (run 44927000990) |
| 2026-11-21 17:20 | render-final | wi-gta-nosleep | render (535-1069) | 16 | 1807 | success (run 44927000990) |
| 2026-11-21 17:20 | render-final | wi-gta-nosleep | render (1070-1604) | 21 | 1828 | success (run 44927000990) |
| 2026-11-21 17:20 | render-final | wi-gta-nosleep | render (1605-2139) | 22 | 1850 | success (run 44927000990) |
| 2026-11-21 17:20 | render-final | wi-gta-nosleep | render (2675-3206) | 22 | 1872 | success (run 44927000990) |
| 2026-11-21 17:20 | render-final | wi-gta-nosleep | render (0-534) | 20 | 1892 | success (run 44927000990) |
| 2026-11-21 17:20 | render-final | wi-gta-nosleep | render (2140-2674) | 12 | 1904 | success (run 44927000990) |
| 2026-11-21 17:20 | render-final | wi-gta-nosleep | assemble | 3 | 1907 | success (run 44927000990) |
| 2026-11-21 17:20 | render-final | wi-gta-nosleep | log | 1 | 1908 | success (run 44927000990) |
| 2026-11-21 18:30 | health-check | - | voice-kokoro | 4 | 1912 | success (run 44934711776) |
| 2026-11-21 18:30 | health-check | - | render | 14 | 1926 | success (run 44934711776) |
| 2026-11-21 18:30 | health-check | - | drive | 1 | 1927 | success (run 44934711776) |
| 2026-11-21 18:30 | health-check | - | voice-voicestudio | 4 | 1931 | failure (run 44934711776) |
| 2026-11-21 18:30 | health-check | - | audio-mix | 2 | 1933 | success (run 44934711776) |
| 2026-11-21 18:30 | health-check | - | report | 1 | 1934 | running (run 44934711776) |
| 2026-11-21 18:35 | render-stills | wi-gta-nosleep  | stills | 3 | 1937 | running (run 44936135336) |
| 2026-11-21 18:54 | render-final | wi-gta-nosleep | voice-and-mix | 3 | 1940 | success (run 44936176684) |
| 2026-11-21 18:54 | render-final | wi-gta-nosleep | render (0-273) | 17 | 1957 | success (run 44936176684) |
| 2026-11-21 18:54 | render-final | wi-gta-nosleep | render (822-1095) | 6 | 1963 | success (run 44936176684) |
| 2026-11-21 18:54 | render-final | wi-gta-nosleep | render (548-821) | 14 | 1977 | success (run 44936176684) |
| 2026-11-21 18:54 | render-final | wi-gta-nosleep | render (1096-1369) | 14 | 1991 | success (run 44936176684) |
| 2026-11-21 18:54 | render-final | wi-gta-nosleep | render (274-547) | 13 | 2004 | success (run 44936176684) |
| 2026-11-21 18:54 | render-final | wi-gta-nosleep | render (1370-1643) | 9 | 2013 | success (run 44936176684) |
| 2026-11-21 18:54 | render-final | wi-gta-nosleep | assemble | 2 | 2015 | success (run 44936176684) |
| 2026-11-21 18:54 | render-final | wi-gta-nosleep | log | 1 | 2016 | success (run 44936176684) |

2026-11-21 wi-gta-leonida REMAKE in Stick3D (builder agent): story.tsx rewritten like What If 1 (REMY3D + beanie, lit toon sets, drop/blob shadows,
linear camera + gentle whip at place changes), 15 shots / 9 places (home, Miami street, wishlist dioramas, golf pond, Florida map diorama,
beach sky, house in storm, game/real split, sunset beach). New Blender props: suitcase, palm_tree, beach_umbrella, sports_car, golf_flag,
alligator, flat_tv (+ library/stick3d/leonida.tsx). 19 local stills (half scale, swangle, rough timing) checked: no caption words on screen
(slogan shown before it is spoken, fades when said), figures above the caption band, sets lit. Contact sheet:
library/previews/whatif/wi-gta-leonida-stick3d.png. Note: three's ExtrudeGeometry drops the caps of the Florida outline -> separate ShapeGeometry cap.
| 2026-11-21 18:57 | render-stills | wi-gta-leonida  | stills | 3 | 2019 | running (run 44938171741) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | voice-and-mix | 4 | 2023 | success (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | render (1400-1679) | 3 | 2026 | cancelled (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | render (560-839) | 3 | 2029 | cancelled (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | render (0-279) | 3 | 2032 | cancelled (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | render (1120-1399) | 3 | 2035 | cancelled (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | render (280-559) | 3 | 2038 | cancelled (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | render (840-1119) | 3 | 2041 | cancelled (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | log | 1 | 2042 | cancelled (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | assemble | 1 | 2043 | cancelled (run 44938267008) |
- 2026-11-21 What If 1 re-edit (owner: "no cuts, one sequence"): 23 SHOTS (each script line = 1-2 shots, own framing +
  short in-shot move), hard cuts on line changes, 5 transitions via @remotion/transitions 4.0.290 (slide into study,
  fade into 1964, wipe into DAY 30, fade into Randy's bedroom, slide into the ask; 10 f each, outgoing shot extended so
  cues stay on the voice). Sub-shots share the parent scene clock (HUD/counter continue across the cut). Stills ~3.1 s.
| 2026-11-21 19:03 | render-final | wi-gta-leonida | voice-and-mix | 4 | 2047 | success (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | render (1400-1679) | 3 | 2050 | cancelled (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | render (560-839) | 3 | 2053 | cancelled (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | render (0-279) | 3 | 2056 | cancelled (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | render (1120-1399) | 3 | 2059 | cancelled (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | render (280-559) | 3 | 2062 | cancelled (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | render (840-1119) | 3 | 2065 | cancelled (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | log | 1 | 2066 | cancelled (run 44938267008) |
| 2026-11-21 19:03 | render-final | wi-gta-leonida | assemble | 1 | 2067 | cancelled (run 44938267008) |
| 2026-11-21 19:12 | health-check | - | voice-voicestudio | 5 | 2072 | failure (run 44938853872) |
| 2026-11-21 19:12 | health-check | - | render | 9 | 2081 | cancelled (run 44938853872) |
| 2026-11-21 19:12 | health-check | - | drive | 1 | 2082 | success (run 44938853872) |
| 2026-11-21 19:12 | health-check | - | voice-kokoro | 5 | 2087 | success (run 44938853872) |
| 2026-11-21 19:12 | health-check | - | audio-mix | 2 | 2089 | success (run 44938853872) |
| 2026-11-21 19:12 | health-check | - | report | 1 | 2090 | running (run 44938853872) |
| 2026-11-21 19:14 | render-stills | wi-gta-nosleep  | stills | 4 | 2094 | running (run 44939600514) |
2026-11-21 wi-gta-leonida RE-EDIT (real shots + cuts): 26 shots (14 lines -> 1-2 shots each: wide / medium / insert, own short
camera move per shot), hard cuts on line changes, 5 x 10-frame @remotion/transitions (slide miami, wipe gators, fade tv,
slide rules, fade ask), sub-shots share the parent HUD clock. Couch drawn without its coral pillow. 29 local stills checked;
contact sheet rebuilt (library/previews/whatif/wi-gta-leonida-stick3d.png).
| 2026-11-21 19:23 | render-stills | wi-gta-leonida  | stills | 3 | 2097 | running (run 44940457257) |
| 2026-11-21 19:35 | render-final | wi-gta-nosleep | voice-and-mix | 4 | 2101 | success (run 44939643924) |
| 2026-11-21 19:35 | render-final | wi-gta-nosleep | render (0-340) | 19 | 2120 | success (run 44939643924) |
| 2026-11-21 19:35 | render-final | wi-gta-nosleep | render (341-681) | 17 | 2137 | success (run 44939643924) |
| 2026-11-21 19:35 | render-final | wi-gta-nosleep | render (1364-1704) | 18 | 2155 | success (run 44939643924) |
| 2026-11-21 19:35 | render-final | wi-gta-nosleep | render (1705-2044) | 13 | 2168 | success (run 44939643924) |
| 2026-11-21 19:35 | render-final | wi-gta-nosleep | render (682-1022) | 13 | 2181 | success (run 44939643924) |
| 2026-11-21 19:35 | render-final | wi-gta-nosleep | render (1023-1363) | 10 | 2191 | success (run 44939643924) |
| 2026-11-21 19:35 | render-final | wi-gta-nosleep | assemble | 2 | 2193 | success (run 44939643924) |
| 2026-11-21 19:35 | render-final | wi-gta-nosleep | log | 1 | 2194 | success (run 44939643924) |
| 2026-11-21 21:07 | render-final | wi-gta-leonida | voice-and-mix | 3 | 2197 | success (run 44947593679) |
| 2026-11-21 21:07 | render-final | wi-gta-leonida | render (1730-2075) | 8 | 2205 | success (run 44947593679) |
| 2026-11-21 21:07 | render-final | wi-gta-leonida | render (692-1037) | 12 | 2217 | success (run 44947593679) |
| 2026-11-21 21:07 | render-final | wi-gta-leonida | render (346-691) | 22 | 2239 | success (run 44947593679) |
| 2026-11-21 21:07 | render-final | wi-gta-leonida | render (0-345) | 19 | 2258 | success (run 44947593679) |
| 2026-11-21 21:07 | render-final | wi-gta-leonida | render (1384-1729) | 21 | 2279 | success (run 44947593679) |
| 2026-11-21 21:07 | render-final | wi-gta-leonida | render (1038-1383) | 20 | 2299 | success (run 44947593679) |
| 2026-11-21 21:07 | render-final | wi-gta-leonida | assemble | 2 | 2301 | success (run 44947593679) |
| 2026-11-21 21:07 | render-final | wi-gta-leonida | log | 1 | 2302 | success (run 44947593679) |
| 2026-11-22 15:59 | render-final | wi-gta-nosleep | voice-and-mix | 3 | 2305 | success (run 45038579654) |
| 2026-11-22 15:59 | render-final | wi-gta-nosleep | render (1362-1815) | 11 | 2316 | success (run 45038579654) |
| 2026-11-22 15:59 | render-final | wi-gta-nosleep | render (2270-2718) | 17 | 2333 | success (run 45038579654) |
| 2026-11-22 15:59 | render-final | wi-gta-nosleep | render (908-1361) | 21 | 2354 | success (run 45038579654) |
| 2026-11-22 15:59 | render-final | wi-gta-nosleep | render (0-453) | 25 | 2379 | success (run 45038579654) |
| 2026-11-22 15:59 | render-final | wi-gta-nosleep | render (1816-2269) | 10 | 2389 | success (run 45038579654) |
| 2026-11-22 15:59 | render-final | wi-gta-nosleep | render (454-907) | 26 | 2415 | success (run 45038579654) |
| 2026-11-22 15:59 | render-final | wi-gta-nosleep | assemble | 3 | 2418 | success (run 45038579654) |
| 2026-11-22 15:59 | render-final | wi-gta-nosleep | log | 1 | 2419 | success (run 45038579654) |
| 2026-11-22 16:34 | render-final | wi-gta-leonida | voice-and-mix | 4 | 2423 | success (run 45038587691) |
| 2026-11-22 16:34 | render-final | wi-gta-leonida | render (0-465) | 24 | 2447 | success (run 45038587691) |
| 2026-11-22 16:34 | render-final | wi-gta-leonida | render (2330-2792) | 12 | 2459 | success (run 45038587691) |
| 2026-11-22 16:34 | render-final | wi-gta-leonida | render (1398-1863) | 17 | 2476 | success (run 45038587691) |
| 2026-11-22 16:34 | render-final | wi-gta-leonida | render (932-1397) | 15 | 2491 | success (run 45038587691) |
| 2026-11-22 16:34 | render-final | wi-gta-leonida | render (1864-2329) | 29 | 2520 | success (run 45038587691) |
| 2026-11-22 16:34 | render-final | wi-gta-leonida | render (466-931) | 12 | 2532 | success (run 45038587691) |
| 2026-11-22 16:34 | render-final | wi-gta-leonida | assemble | 3 | 2535 | success (run 45038587691) |
| 2026-11-22 16:34 | render-final | wi-gta-leonida | log | 1 | 2536 | success (run 45038587691) |
- 2026-11-22 What If 1 BRIGHT DAYLIGHT restyle (owner go + Motion Design rules): library/stick3d/daylight.tsx (DaySky +
  haze fog + sun sprite, SunRig = one warm sun + sky fill, DayGround, CityBackdrop, Palms, Clouds, WindowWall,
  SunPatch, disp() for `linear flat` colours). Every set re-done in daylight (sunny den with window onto a hazy city,
  bright clinic, desert highway with mesas/cacti, red-curtain theatre, sunlit 1964 San Diego room, bright studio,
  bright calendar set, dawn bedroom, outdoor plaza). Place changes = SHAPE MORPH (key object squashes 8 %, grows,
  floods with the next scene colour, next shot 93 -> 100 %); HUD text word-by-word soft-to-sharp with rise; camera
  fast-then-slow inside each shot. 6 new Blender models. Stills ~4.1 s avg (max ~7 s on morph frames: 2 canvases).
| 2026-11-22 20:47 | render-stills | wi-gta-nosleep  | stills | 4 | 2540 | running (run 45068120430) |
| 2026-11-22 21:17 | render-final | wi-gta-nosleep | voice-and-mix | 4 | 2544 | success (run 45068163389) |
| 2026-11-22 21:17 | render-final | wi-gta-nosleep | render (1260-1679) | 28 | 2572 | success (run 45068163389) |
| 2026-11-22 21:17 | render-final | wi-gta-nosleep | render (420-839) | 27 | 2599 | success (run 45068163389) |
| 2026-11-22 21:17 | render-final | wi-gta-nosleep | render (2100-2515) | 18 | 2617 | success (run 45068163389) |
| 2026-11-22 21:17 | render-final | wi-gta-nosleep | render (840-1259) | 25 | 2642 | success (run 45068163389) |
| 2026-11-22 21:17 | render-final | wi-gta-nosleep | render (1680-2099) | 19 | 2661 | success (run 45068163389) |
| 2026-11-22 21:17 | render-final | wi-gta-nosleep | render (0-419) | 20 | 2681 | success (run 45068163389) |
| 2026-11-22 21:17 | render-final | wi-gta-nosleep | assemble | 2 | 2683 | success (run 45068163389) |
| 2026-11-22 21:17 | render-final | wi-gta-nosleep | log | 1 | 2684 | success (run 45068163389) |
| 2026-11-22 22:03 | health-check | - | render | 12 | 2696 | success (run 45074484640) |
| 2026-11-22 22:03 | health-check | - | voice-kokoro | 4 | 2700 | success (run 45074484640) |
| 2026-11-22 22:03 | health-check | - | voice-voicestudio | 4 | 2704 | failure (run 45074484640) |
| 2026-11-22 22:03 | health-check | - | drive | 1 | 2705 | success (run 45074484640) |
| 2026-11-22 22:03 | health-check | - | audio-mix | 2 | 2707 | success (run 45074484640) |
| 2026-11-22 22:03 | health-check | - | report | 1 | 2708 | running (run 45074484640) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | voice-and-mix | 4 | 2712 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | render (880-1319) | 20 | 2732 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | render (0-439) | 27 | 2759 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | render (2200-2637) | 17 | 2776 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | render (1320-1759) | 26 | 2802 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | render (1760-2199) | 19 | 2821 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | render (440-879) | 29 | 2850 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | assemble | 2 | 2852 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | log | 1 | 2853 | success (run 45074484655) |
- 2026-11-26 What If 2 (wi-gta-leonida) BRIGHT DAYLIGHT restyle (builder wt2-leonida, same look/rules as What If 1):
  sunny apartment with window, humid Miami street, wishlist boardwalk by the sea, golf course pond + gator, 3D Florida
  map on a table on a sea terrace (storm over it for lightning), beach noon -> 4 pm storm, Florida flat with storm-track
  TV, house in the storm (rulebook), game grid vs storm beach (respawn), sunset beach with A-D ICON cards (no double
  text). 26 shots, hard cuts, 12 shape morphs (every place change), a NAMED camera move per shot (push-in, orbit,
  tracking, dolly zoom x2, crane + land x3, crane up, pull back x3, low hero angle x4, top-down x2). No new Blender
  models (reused palm_tree, suitcase, alligator, golf_flag, beach_umbrella, sports_car, flat_tv, game_controller,
  window_frame, city_block, cloud_puff); navy couch replaced by a bright box couch. Local stills (half scale,
  swangle, rough 2.85 w/s timing): 32 frames, avg 5.4 s, max 10.4 s (morph frames). 2 fix rounds (HUD spacing,
  framing of golf low angle/orbit/crane up/death trophy, brighter tv room + house).
| 2026-11-26 17:34 | render-stills | wi-gta-leonida  | stills | 4 | 2857 | running (run 45868340758) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | voice-and-mix | 4 | 2861 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | render (880-1319) | 20 | 2881 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | render (0-439) | 27 | 2908 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | render (2200-2637) | 17 | 2925 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | render (1320-1759) | 26 | 2951 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | render (1760-2199) | 19 | 2970 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | render (440-879) | 29 | 2999 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | assemble | 2 | 3001 | success (run 45074484655) |
| 2026-11-22 22:25 | render-final | wi-gta-nosleep | log | 1 | 3002 | success (run 45074484655) |

## 2026-11-26 wi-gta-physics (WHAT IF #3) built - bright daylight Stick3D, stills checked (not rendered final)
episodes/wi-gta-physics/{episode.json, story.tsx, sound.json, metadata.json}; script.txt + RESEARCH.md unchanged.
18 shots, hard cuts + 8 shape morphs (place changes), one NAMED camera move per shot: hook crane+land, hookb push-in
(cyan game jump arc), test1 tracking/truck, gravity DOLLY ZOOM down the facade, fall orbit, fallb low angle (gravity vs
air arrows, TERMINAL VELOCITY label timed after the caption), chute pull back (reveal canopy), stairs tracking, test2
low hero angle, math crane up with the lifted car to the floor-3 mark (IMPACT SPEED 050 + gauge), energy top-down
(bars x2 speed / x4 energy), energyb push-in ("+" turns into "x"), belt orbit (seated crash dummy, dark belts, gold
force cones, abstract impact ring - no gore), test3 tracking (cyan ghost pops back up), survive pull back (>95% / ~85%
bars), zone low-angle push-in (30 sign, kids on the zebra), respawn push-in (cyan respawn icon vs gold save card "1"),
ask crane+land (COMMENT A, B OR C cards). 7 new Blender models (README table). Stills at half scale, swangle, rough
2.85 w/s timing: 2 fix rounds (sky had a ground skyline behind the jumper; belt camera was behind the foam block +
coral cones read badly -> removed block, gold cones; math crane now follows the car; zone kids lifted above captions).
Contact sheet library/previews/whatif/wi-gta-physics-stick3d.png. Next: GO_FINAL only on the owner's word.
| 2026-11-26 17:35 | render-stills | wi-gta-physics  | stills | 1 | 3003 | running (run 45868875332) |
| 2026-11-26 17:38 | render-stills | wi-gta-physics  | stills | 4 | 3007 | running (run 45868954776) |
| 2026-11-26 18:04 | render-final | wi-gta-leonida | voice-and-mix | 4 | 3011 | success (run 45868417105) |
| 2026-11-26 18:04 | render-final | wi-gta-leonida | render (1018-1526) | 18 | 3029 | success (run 45868417105) |
| 2026-11-26 18:04 | render-final | wi-gta-leonida | render (0-508) | 27 | 3056 | success (run 45868417105) |
| 2026-11-26 18:04 | render-final | wi-gta-leonida | render (509-1017) | 25 | 3081 | success (run 45868417105) |
| 2026-11-26 18:04 | render-final | wi-gta-leonida | render (1527-2035) | 29 | 3110 | success (run 45868417105) |
| 2026-11-26 18:04 | render-final | wi-gta-leonida | render (2545-3053) | 15 | 3125 | success (run 45868417105) |
| 2026-11-26 18:04 | render-final | wi-gta-leonida | render (2036-2544) | 15 | 3140 | success (run 45868417105) |
| 2026-11-26 18:04 | render-final | wi-gta-leonida | assemble | 2 | 3142 | success (run 45868417105) |
| 2026-11-26 18:04 | render-final | wi-gta-leonida | log | 1 | 3143 | success (run 45868417105) |
| 2026-11-26 18:33 | render-final | wi-gta-physics | voice-and-mix | 4 | 3147 | success (run 45868954706) |
| 2026-11-26 18:33 | render-final | wi-gta-physics | render (0-446) | 24 | 3171 | success (run 45868954706) |
| 2026-11-26 18:33 | render-final | wi-gta-physics | render (2235-2680) | 24 | 3195 | success (run 45868954706) |
| 2026-11-26 18:33 | render-final | wi-gta-physics | render (1341-1787) | 20 | 3215 | success (run 45868954706) |
| 2026-11-26 18:33 | render-final | wi-gta-physics | render (894-1340) | 13 | 3228 | success (run 45868954706) |
| 2026-11-26 18:33 | render-final | wi-gta-physics | render (1788-2234) | 22 | 3250 | success (run 45868954706) |
| 2026-11-26 18:33 | render-final | wi-gta-physics | render (447-893) | 11 | 3261 | success (run 45868954706) |
| 2026-11-26 18:33 | render-final | wi-gta-physics | assemble | 2 | 3263 | success (run 45868954706) |
| 2026-11-26 18:33 | render-final | wi-gta-physics | log | 1 | 3264 | success (run 45868954706) |
2026-11-26 ~23:00 BUILD wi-gta-healing (What If #4, builder in its own worktree): episode.json/sound.json/metadata.json/story.tsx.
Bright daylight Stick3D, Remy + beanie, motif = cyan GAME health bar (refills in a blink) vs gold REAL timeline bar.
17 shots, one named move each: hook crane+land (WHAT IF #4), hookb push-in (chips, cyan bar jumps full, gold bar
appears), test1 tracking (gold spark = small cut, cyan ghost, bar dips + snaps back), cut ORBIT (plaster finger insert,
~1 WEEK), layers crane+land (skin cross-section, fibres knit, 12 month cells), scar low hero angle (100% vs ~80%), test2
pull back (donor centre, cyan hologram burger), plasma push-in (stylised bag, ~1 DAY), cells tracking (red-cell discs
pop up, 4-6 WEEKS), calendar DOLLY ZOOM (8-week calendar crosses off, 8+ WEEKS), test3 orbit (cast + sling, ghost jogs
off the parked car), xray push-in (bone knits, 6-8 WEEKS), xrayb pull back (bad break, 3-6 MONTHS), rest top-down
(burger crossed out, bed/apple/moon icons), realbar tracking (giant real bar on the lawn), outro crane up (cyan full vs
gold creeping + day ticks), ask crane+land (A CUT / A BREAK / A SPRAIN / OTHER). 7 place-change shape morphs.
8 new Blender models (burger, plaster, picnic_table, donation_chair, blood_bag_stand, xray_lightbox, arm_cast,
hospital_bed; README table); arm_cast rebuilt once (sling strap crossed the face). Stills half scale, swangle, rough
2.85 w/s: 2 fix rounds (framing of cut/layers/scar/plasma/xray/realbar, duplicate Remy in cells, red cells too dark,
calendar HUD clutter, ghost off-screen, ask card text overflow). Contact sheet
library/previews/whatif/wi-gta-healing-stick3d.png. Not rendered, no GO_FINAL: owner decides.
| 2026-11-26 22:48 | render-stills | wi-gta-healing  | stills | 3 | 3267 | running (run 45906832749) |
| 2026-11-26 23:15 | render-final | wi-gta-healing | voice-and-mix | 6 | 3273 | success (run 45906889106) |
| 2026-11-26 23:15 | render-final | wi-gta-healing | render (1564-1954) | 22 | 3295 | success (run 45906889106) |
| 2026-11-26 23:15 | render-final | wi-gta-healing | render (391-781) | 19 | 3314 | success (run 45906889106) |
| 2026-11-26 23:15 | render-final | wi-gta-healing | render (1955-2344) | 18 | 3332 | success (run 45906889106) |
| 2026-11-26 23:15 | render-final | wi-gta-healing | render (782-1172) | 16 | 3348 | success (run 45906889106) |
| 2026-11-26 23:15 | render-final | wi-gta-healing | render (1173-1563) | 15 | 3363 | success (run 45906889106) |
| 2026-11-26 23:15 | render-final | wi-gta-healing | render (0-390) | 16 | 3379 | success (run 45906889106) |
| 2026-11-26 23:15 | render-final | wi-gta-healing | assemble | 2 | 3381 | success (run 45906889106) |
| 2026-11-26 23:15 | render-final | wi-gta-healing | log | 1 | 3382 | success (run 45906889106) |
2026-11-27 ~01:30 BUILD wi-gta-money (What If #5, builder in its own worktree): episode.json/sound.json/metadata.json/story.tsx.
Bright daylight Stick3D, Remy + beanie, motif = cyan GAME "$" counter that JUMPS (no roll-up) vs real stylised cash
(green bricks of 1,000 bills, no banknote images/portraits/serials) with weight, height and counting time.
18 shots, one named move each: hook crane+land (WHAT IF #5), hookb push-in (counter $0 -> $1,000,000 + cyan coin),
hookc low hero angle (Remy + duffel), test1 tracking (Remy hauls the bag, coin pops, counter jumps), bill push-in (one
bill on the kitchen scale, ~1 G), tenk top-down (10 bricks land, x 10,000), weight ORBIT (duffel on floor scale 10.0 +
potato sack, ~10 KG), tower crane up (10 bricks ~ Remy's height + tape, ~1 M), test2 pull back (park table, counter jumps),
count truck (1 bill/s, clock + 0:00:01 timer), countb DOLLY ZOOM (time-lapse to 2:46:40, ~2.8 H, sweaty thumb), test3
orbit (bank hall, deposit lands), bank push-in (form flies to the government icon, > $10,000), split top-down (pile
splits into $9K piles, red X, ILLEGAL stamp), recap pull back (Remy hunched, counter), recapb tracking (bag / thumb /
paperwork icons), outro crane up (cyan coin floats vs bag on the scale, ~10 KG), ask crane+land (SAVE IT / A HOUSE /
A CAR / SHARE IT). 4 place-change shape morphs (plaza -> kitchen -> park -> bank -> plaza).
8 new Blender models (cash_bill, cash_brick, duffel_bag, kitchen_scale, potato_sack, desk_clock, kitchen_counter,
bank_counter; README table). Stills half scale, swangle, rough 2.85 w/s: 2 fix rounds (framing of hookc/bill/tenk/
weight/tower/count/bank/split, piles hiding Remy, clock cut off). Contact sheet
library/previews/whatif/wi-gta-money-stick3d.png. Not rendered, no GO_FINAL: owner decides.
2026-11-27 BUILD wi-gta-breath (What If #6, builder in its own worktree): episode.json/sound.json/metadata.json/story.tsx +
library/stick3d/water.tsx (new, cheap water: translucent planes, caustic nets, light shafts, bubbles, underwater fog dome).
Motif = cyan GAME air bar (bubbles, barely moves) vs gold REAL breath timer (lungs/stopwatch). 16 shots, one named move
each: hook crane+land (pier, WHAT IF #6), hookb top-down (cyan swimmer on the sea bottom), test1 tracking/lead (Remy
walks the pier holding his breath), land push-in (stopwatch, 30-90 S), freediver crane down (silhouette + safety buddy,
SEVERAL MIN), record orbit (11:35 clock), test2 pull back (grey-blue cold lake, cyan swimmer lounging, Remy on shore,
lifeguard), gasp low angle (icy wave at his shoes, gasp icon), rule push-in (life jacket + lifeguard, 1-10-1), ruleb
tracking (1 MIN / 10 MIN / ~1 H tiles), test3 crane+land (pool, lifeguard chair), blackout dolly zoom (EMPTY pool
underwater, BLACKOUT / NO WARNING after the caption), safety low hero angle (Remy + buddy, never-alone + breathe icons),
surface orbit (both surface in life jackets, cyan bar refills), surfaceb pull back (+1 +1 hearts), ask push-in (A UNDER
30 S / B 30-60 S / C 60-90 S / D OVER 90 S). 6 place-change shape morphs. 7 new Blender models (pier, stopwatch,
life_jacket, lifeguard_chair, pool_ladder, buoy, life_ring_post; chair + ladder rebuilt once). Stills half scale,
swangle, rough 2.85 w/s, 2 fix rounds (life jacket covered faces, stopwatch too big, deep water showed a sand floor,
pool hole covered by the grass ground, framing of test2/rule/safety/surface). Contact sheet
library/previews/whatif/wi-gta-breath-stick3d.png. Not rendered, no GO_FINAL: owner decides.
| 2026-11-27 01:09 | render-stills | wi-gta-breath  | stills | 4 | 3386 | running (run 45920610754) |
| 2026-11-27 01:36 | render-final | wi-gta-money | voice-and-mix | 4 | 3390 | success (run 45920511178) |
| 2026-11-27 01:36 | render-final | wi-gta-money | render (0-408) | 12 | 3402 | success (run 45920511178) |
| 2026-11-27 01:36 | render-final | wi-gta-money | render (818-1226) | 25 | 3427 | success (run 45920511178) |
| 2026-11-27 01:36 | render-final | wi-gta-money | render (1636-2044) | 21 | 3448 | success (run 45920511178) |
| 2026-11-27 01:36 | render-final | wi-gta-money | render (1227-1635) | 26 | 3474 | success (run 45920511178) |
| 2026-11-27 01:36 | render-final | wi-gta-money | render (2045-2453) | 16 | 3490 | success (run 45920511178) |
| 2026-11-27 01:36 | render-final | wi-gta-money | render (409-817) | 19 | 3509 | success (run 45920511178) |
| 2026-11-27 01:36 | render-final | wi-gta-money | assemble | 3 | 3512 | success (run 45920511178) |
| 2026-11-27 01:36 | render-final | wi-gta-money | log | 1 | 3513 | success (run 45920511178) |
| 2026-11-27 02:01 | render-final | wi-gta-breath | voice-and-mix | 3 | 3516 | success (run 45920660937) |
| 2026-11-27 02:01 | render-final | wi-gta-breath | render (2215-2656) | 19 | 3535 | success (run 45920660937) |
| 2026-11-27 02:01 | render-final | wi-gta-breath | render (0-442) | 15 | 3550 | success (run 45920660937) |
| 2026-11-27 02:01 | render-final | wi-gta-breath | render (886-1328) | 17 | 3567 | success (run 45920660937) |
| 2026-11-27 02:01 | render-final | wi-gta-breath | render (443-885) | 9 | 3576 | success (run 45920660937) |
| 2026-11-27 02:01 | render-final | wi-gta-breath | render (1772-2214) | 21 | 3597 | success (run 45920660937) |
| 2026-11-27 02:01 | render-final | wi-gta-breath | render (1329-1771) | 20 | 3617 | success (run 45920660937) |
| 2026-11-27 02:01 | render-final | wi-gta-breath | assemble | 2 | 3619 | success (run 45920660937) |
| 2026-11-27 02:01 | render-final | wi-gta-breath | log | 1 | 3620 | success (run 45920660937) |
| 2026-11-27 02:15 | render-stills | wi-gta-breath  | stills | 3 | 3623 | running (run 45927056107) |
| 2026-11-27 02:42 | render-final | wi-gta-breath | voice-and-mix | 3 | 3626 | success (run 45927056138) |
| 2026-11-27 02:42 | render-final | wi-gta-breath | render (425-849) | 13 | 3639 | success (run 45927056138) |
| 2026-11-27 02:42 | render-final | wi-gta-breath | render (0-424) | 20 | 3659 | success (run 45927056138) |
| 2026-11-27 02:42 | render-final | wi-gta-breath | render (1700-2124) | 21 | 3680 | success (run 45927056138) |
| 2026-11-27 02:42 | render-final | wi-gta-breath | render (2125-2548) | 24 | 3704 | success (run 45927056138) |
| 2026-11-27 02:42 | render-final | wi-gta-breath | render (1275-1699) | 13 | 3717 | success (run 45927056138) |
| 2026-11-27 02:42 | render-final | wi-gta-breath | render (850-1274) | 9 | 3726 | success (run 45927056138) |
| 2026-11-27 02:42 | render-final | wi-gta-breath | assemble | 2 | 3728 | success (run 45927056138) |
| 2026-11-27 02:42 | render-final | wi-gta-breath | log | 1 | 3729 | success (run 45927056138) |
- 2026-11-27 wi-gta-respawn (GTA 6 WHAT IF #9) BUILT (stick3d-bright, story.tsx, 19 shots): hook pull back (Remy on top
  of a big stylised globe in the sky, WHAT IF #9), hookb orbit (hospital + safe-house icons struck, cyan pin appears),
  r1 crane up (cyan dice tumbles, globe spins, pin drops in the Pacific), ocean low angle (splash, Remy pops up in a swim
  ring), oceanb orbit (71% + odds bar), far crane up (tiny in open ocean), farb top-down (dashed range circle, land icon
  struck), r2 orbit (pin on the Sahara, 29%), desert crane + land (~1/3 land disc), desertb dolly zoom (dune/rock/sun
  icons, heat shimmer), r3 crane down (pin on Antarctica), ice tracking (slide, ~1/10), iceb push-in (mini globe, two
  ice caps), r4 push-in (pin on a city light), city crane-up top-down reveal (1-3%), total dolly zoom (0.29 x 0.03,
  < 1%, city sliver circled), game low hero angle (cyan respawn beam on a safe beach), sea pull back (pins keep landing
  in the blue, x10), ask push-in (A OCEAN / B DESERT / C ICE / D CITY). 10 place-change shape morphs. Globe = code
  (canvas-painted approximate continents). 3 new Blender models: swim_ring, map_pin, ice_floe. Stills half scale,
  swangle, rough 2.85 w/s, 2 fix rounds (globe too big/low, grey clouds, pin seen end-on, legs visible under the sea,
  bar icons cramped, camera ends). Contact sheet library/previews/whatif/wi-gta-respawn-stick3d.png. No GO_FINAL.
2026-11-27 BUILD wi-gta-npc (GTA 6 What If #8, builder in its own worktree): episode.json/sound.json/metadata.json/story.tsx.
Bright daylight Stick3D, Remy + beanie as a background NPC with a floating cyan NPC map-pin marker (icon, no letters).
Motif = 24-hour DAY RING HUD filling slice by slice (sleep ~9 H, commute ~27 MIN, work ~7.5 H, chores ~2 H, leisure =
the rest ~5 H, TV ~2.6 H inner coral arc; illustration of separate ATUS/ACS averages, noted in metadata). 15 shots, one
named move each: hook crane+land (WHAT IF #8), hookb push-in (mission + heist icons struck red), wake pull back (alarm
clock -> dawn bedroom, stretch), commute tracking/truck (bus pulls in behind him at the stop), work orbit (office desk,
grey NPC coworkers), chores low hero angle (broom, steaming pot), leisure crane down (evening couch), leisureb DOLLY
ZOOM (Remy + cartoon TV), loop top-down/high (ring path through his 5 places, cyan route chevrons, icon row + repeat
tile), car low hero angle (cyan "main character" coupe whooshes past, Remy waves), twist orbit (spotlight swings on,
marker flips into a gold star), twistb pull back (friend, mum, kid beaming, hearts), outro crane up over the loop
(cyan script-page icon), outrob tracking (Remy steps off the ring onto a gold branch path, gold pen stroke), ask
crane+land (A SLEEP / B WORK / C SCREEN TIME / D COMMUTE). 7 place-change shape morphs (the day ring is the key shape).
6 new Blender models (bed_modern, bus_stop, city_bus, office_desk (monitor moved off-centre once), broom, cyan_coupe;
README table). Stills half scale, swangle, rough 2.85 w/s, 2 fix rounds (HUD plate covered the NPC marker -> plate
moved up; Remy hidden behind the desk -> stands at it; TV off-frame; loop camera too steep (billboards vanished);
coupe crossed the frame in 3 frames -> slower; broom/steam; mum read as bearded). Contact sheet
library/previews/whatif/wi-gta-npc-stick3d.png. Not rendered, no GO_FINAL: owner decides.
| 2026-11-27 10:31 | render-stills | wi-gta-respawn  | stills | 2 | 3731 | running (run 45982636547) |
| 2026-11-27 10:33 | render-stills | wi-gta-npc  | stills | 3 | 3732 | running (run 45982789054) |

2026-11-27 BUILD wi-gta-snow (GTA 6 What If #7 "What If It Snowed in Vice City?", builder in its own worktree):
episode.json/sound.json/metadata.json/story.tsx. Bright daylight Stick3D, Remy + beanie (flip flops = bare-foot look +
coral 3D soles), Golden Neon HUD only, cold = sky/haze/sun lerp to grey + cool grade + flurries + snow dusting, never dark.
21 shots, hard cuts, one named move each: hook crane+land (WHAT IF #7), hookb pull back (sunny beach -> grey, first
flurries), hookc push-in (snowflake tile x1), date top-down (desk calendar JAN 19 1977 + blank folded paper, flakes land),
dateb orbit (Remy + neighbour catching flakes, clock ~8 AM), trace push-in (flakes melt on the car hood, clock -> 9:30),
traceb crane up (pastel deco street -> skyline, 1977 tile), imagine DOLLY ZOOM (world turns wintry, thermometer 26 -> 2 C),
imagineb low hero angle (flip flops in snow, white breath), iguana tracking up the palm (3 frosty iguanas on fronds),
iguanab slow wide push-in (they drop softly one by one, < 10 C), stunned push-in (belly-up iguana, heart + pulse),
stunnedb orbit (sun returns, they climb back), manatee top-down (manatees under cool water, 15 C + gold 20 C mark),
manateeb pull back (huddle in the glowing warm outflow, power plant + steam, > 20 C), shovel push-in (beach-store shelf,
dashed missing-shovel outline in the empty slot, x 0), snowman orbit (#1 star), puddle truck (clock 9 -> 12, melts to
a puddle with carrot/scarf/shades), rare crane up, rareb tracking (timeline 1977 -> 2026, one snowflake), ask crane+land
(A SNOW IN MIAMI / B SUN IN WINTER / C BOTH / D NEITHER). 5 place-change shape morphs. 7 new Blender models (iguana,
manatee (re-coloured lighter once: read too dark under water), snowman, power_plant, store_shelf, deco_hotel_pink/mint via
_deco.py; README table). Stills half scale, swangle, rough 2.85 w/s, 2 fix rounds (framing: Remy cut / under captions in
several shots, iguana drop too small, manatees invisible under water + plume hidden, flakes too faint then too big near
the lens). Contact sheet library/previews/whatif/wi-gta-snow-stick3d.png. Not rendered, no GO_FINAL: owner decides.
