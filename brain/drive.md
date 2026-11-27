# Google Drive (via Zapier)

## MAIN folder (owner, 2026-11-15): TheLittleEpic Drive, folder "Shorts" id 1-uCqfGVyoJBbyNCT8zVw0PvM1xXqFMlh
(owned by thelittleepic@gmail.com). Every approved video + its metadata txt goes HERE, named "<n> - <title>.mp4".
How: (1) Zapier resumable session + drive-put -> staging folder Review on vicevinnybeats Drive (shared read-only with
thelittleepic), (2) claude.ai Google Drive connector (signed in as thelittleepic) copy_file into the main folder,
(3) metadata txt created directly in the main folder with the connector. The vicevinnybeats folders below are staging only.

Uploads go through the owner's Zapier Google Drive connection (the newer connection is the default; the first one had
no file permission). Nothing is ever published from here: files only go into Drive.

| Folder | Drive folder id |
|---|---|
| Shorts | 1C-FcvGIB3BXhh3GShiGuykiUt6fdZNzD |
| Shorts/Review | 1Jt8dk9P8FMI9Q_R5WIdbOYrrOvdQKl_X |
| Shorts/Approved | 1zqbsssYZ782CdYmYJKBZBJRLNDF93yfy |
| Shorts/Published | 1gj-Xc1EGj6OxSqA8nUre9FeIE41qem1X |
| Shorts/Rejected | 1dMLqniQIJxvUMptRDQJV3du6Z_2zyFlc |

How a finished video gets into Drive (no rclone secrets needed):
1. Zapier "API Request" (POST https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable, body {name, parents:[Review id]})
   returns a one-file upload session URL in the `location` header.
2. Actions workflow `drive-put` (inputs: session_url, run_id, episode) PUTs `final-<episode>/<episode>.mp4` from that run.
3. Zapier "Create File From Text" puts "<episode> - title, description, tags, caption.txt" next to it.

| Date | Episode | File in Review |
|---|---|---|
| 2026-11-14 | goalkeeper-still | goalkeeper-still - The Goalkeeper Who Did Nothing and Won.mp4 (42.8 MB) + metadata txt |
| 2026-11-14 | slow-queue (remake) | slow-queue - Why You Always Pick the Slow Queue.mp4 + metadata txt |
| 2026-11-15 | coin-flip | coin-flip - This Coin Flip Isn't 50-50.mp4 + metadata txt |
| 2026-11-15 | ALL 4 copied to TheLittleEpic/Shorts | 1 Goalkeeper, 2 Slow Queue, 3 Coin Flip, 4 Lift Button (mp4 + txt each) |
| 2026-11-15 | tickle -> TheLittleEpic/Shorts | 5 - You Can't Tickle Yourself. Here's Why.mp4 (54.8 MB) + 5 - Tickle txt |
| 2026-11-15 | toast -> TheLittleEpic/Shorts | 6 - Your Toast Isn't Unlucky, Your Table Is.mp4 (48.4 MB) + 6 - Toast txt |
| 2026-11-16 | pole -> TheLittleEpic/Shorts | 7 - Stop Looking at the Pole.mp4 (66.5 MB) + 7 - Pole txt |
| 2026-11-16 | silent -> TheLittleEpic/Shorts | 8 - Why the Silent Player Took Everything.mp4 + 8 - Silent Player txt |
| 2026-11-16 | slow-queue removed from TheLittleEpic/Shorts (owner: "I don't like it"); mp4 + txt moved to Drive trash; slot 2 waits for a replacement |
| 2026-11-16 | first-offer -> TheLittleEpic/Shorts as video 2 | 2 - He Said the Price First and Still Won.mp4 + 2 - Price First txt |
| 2026-11-17 | winner -> TheLittleEpic/Shorts as video 9 | 9 - The Winner Paid the Most and Lost.mp4 + 9 - Winner txt |
| 2026-11-20 | gta-army -> TheLittleEpic/Shorts as video 10 | 10 - 43 Soldiers Re-Enlisted. The Headline Was GTA 6.mp4 (41.8 MB) + 10 - Soldiers GTA 6 txt (pizza moves to 11) |
| 2026-11-20 | gta-ufo -> TheLittleEpic/Shorts as video 11 (cheap mode: 1 builder) | 11 - GTA 6 Has a UFO. Your Eyes Can Make One Too.mp4 (18.8 MB) + 11 - UFO GTA 6 txt (pizza -> 12) |
| 2026-11-20 | gta-redlight -> TheLittleEpic/Shorts as video 12 (cheap mode) | 12 - He Can Do Anything in GTA 6. He Still Stops at Red Lights.mp4 (30.6 MB) + 12 - Red Lights txt (pizza -> 13) |
| 2026-11-20 | gta-radio -> TheLittleEpic/Shorts as video 13 (cheap mode) | 13 - You'll Love the GTA 6 Song You Hate. Here's Why.mp4 (30.6 MB) + 13 - Radio txt (pizza -> 14) |
| 2026-11-21 | wi-gta-nosleep -> 'What if' folder (1C3YDZzPqlFhBQM_7rurN7XRCnhhyqT_o) as What If 1 | What If 1 - You Played GTA 6 for 30 Days Straight.mp4 (30.8 MB) + txt; repo made PUBLIC by owner (free Actions minutes) |
| 2026-11-21 | wi-gta-leonida -> 'What if' folder as What If 2 | What If 2 - You Moved to the Real Leonida.mp4 (23.7 MB) + txt; natural-voice fix: 71 s vs 89 s for the same word count |
| 2026-11-23 | wi-gta-nosleep (bright look, Gemini Algieba, run 45074484655) -> What if folder as What If 1 (APPROVED by owner) | What If 1 - You Played GTA 6 for 30 Days Straight.mp4 (68.1 MB) + What If 1 - title, description, tags, caption.txt |
| 2026-11-26 | wi-gta-leonida + wi-gta-physics (bright look, Algieba) -> What if folder as What If 2 + 3 (owner: upload) | What If 2 - You Moved to the Real Leonida.mp4 (88.5 MB) + txt; What If 3 - GTA Physics in Real Life.mp4 (75.7 MB) + txt |
| 2026-11-27 | wi-gta-healing (run 45906889106) -> What if folder as What If 4 (APPROVED) | What If 4 - You Healed Like a GTA 6 Character.mp4 + txt |
