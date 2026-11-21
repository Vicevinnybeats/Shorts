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
