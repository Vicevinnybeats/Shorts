# Google Drive (via Zapier)

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
