#!/usr/bin/env bash
# Free CC0 3D props the skill's world builder loads (Kenney Nature Kit + Fantasy Town Kit) -> public/bridge/kenney/*.glb
# Cached by actions/cache, so this only runs when the cache is cold. Never committed (public/bridge is gitignored).
set -euo pipefail
cd "$(dirname "$0")/.."
DEST=public/bridge/kenney
mkdir -p "$DEST"
work=$(mktemp -d)
for kit in nature-kit fantasy-town-kit; do
  url=$(curl -fsSL "https://kenney.nl/assets/$kit" | grep -o "https://kenney.nl/media/pages/assets/$kit/[^\"']*\.zip" | head -1 || true)
  if [ -z "$url" ]; then echo "::warning::could not find the $kit download link on kenney.nl"; continue; fi
  curl -fsSL "$url" -o "$work/$kit.zip"
  mkdir -p "$work/$kit" && unzip -q -o "$work/$kit.zip" -d "$work/$kit"
  # prefer the GLB export; keep flat names (tree_oak.glb, stall-red.glb ...)
  find "$work/$kit" -iname "*.glb" -path "*GLB*" -exec cp -n {} "$DEST/" \; 2>/dev/null || true
  find "$work/$kit" -iname "*.glb" -exec cp -n {} "$DEST/" \;
done
rm -rf "$work"
# never cache an empty folder (it would never be retried); the world builder runs without these props
[ "$(ls "$DEST" | wc -l)" -gt 0 ] || rmdir "$DEST"
echo "kenney models: $(ls "$DEST" | wc -l)"
