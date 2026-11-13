#!/usr/bin/env bash
# Free CC0 3D props (Kenney Nature Kit + Fantasy Town Kit) -> public/bridge/kenney/*.glb
# kenney.nl refuses automated downloads, so the owner downloads the two kit zips once by hand and attaches them to a
# GitHub Release named "kenney-assets" in this repo (CC0 allows that). The workflow pulls them from there.
# Cached by actions/cache, so this only runs when the cache is cold. Never committed (public/bridge is gitignored).
set -euo pipefail
cd "$(dirname "$0")/.."
DEST=public/bridge/kenney
mkdir -p "$DEST"
work=$(mktemp -d)
if gh release view kenney-assets >/dev/null 2>&1; then
  gh release download kenney-assets -p "*.zip" -D "$work"
  for z in "$work"/*.zip; do
    d="${z%.zip}"; mkdir -p "$d" && unzip -q -o "$z" -d "$d"
    find "$d" -iname "*.glb" -exec cp -n {} "$DEST/" \;
  done
else
  echo "::warning::No 'kenney-assets' release yet (see docs/SETUP-ASSETS.md). Scenes render without the props."
fi
rm -rf "$work"
n=$(ls "$DEST" | wc -l); echo "kenney models: $n"
# never cache an empty folder (it would never be retried)
[ "$n" -gt 0 ] || rmdir "$DEST"
