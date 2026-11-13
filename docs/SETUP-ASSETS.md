# Kenney 3D props (free, CC0) - one-time setup from your phone

Why: kenney.nl blocks downloads from servers, so GitHub's runners get "403 Forbidden". You download the two free
kits once in your browser and attach them to this repo; the workflows take them from there and cache them.

1. Open https://kenney.nl/assets/nature-kit -> **Download** (choose "Continue without donating" - it's free) -> you get `kenney_nature-kit.zip`.
2. Open https://kenney.nl/assets/fantasy-town-kit -> **Download** the same way -> `kenney_fantasy-town-kit.zip`.
3. On github.com (browser, "Desktop site" on) open the **Shorts** repo -> **Releases** (right side) -> **Create a new release**.
4. **Choose a tag** -> type `kenney-assets` -> "Create new tag". Title: `kenney-assets`.
5. Drag/attach both zip files under "Attach binaries" (upload limit is 2 GB per file, so size is fine).
6. **Publish release**. (A release in a private repo stays private.)
7. Actions -> **health-check** -> Run workflow. The log line `kenney models: N` should show a number above 0.
