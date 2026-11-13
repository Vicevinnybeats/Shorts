#!/usr/bin/env bash
# Fetches the animation skill (visual techniques only) fresh and wires it into this project.
# The skill is never committed here: .skill/ and src/vendor/ are gitignored.
#   SKILL_REPO / SKILL_REF can override the source (default: mromidev/claude-animated-shorts @ main).
set -euo pipefail
cd "$(dirname "$0")/.."
REPO="${SKILL_REPO:-https://github.com/mromidev/claude-animated-shorts}"
REF="${SKILL_REF:-main}"
if [ -d .skill/.git ]; then
  git -C .skill fetch -q --depth 1 origin "$REF" && git -C .skill reset -q --hard FETCH_HEAD
else
  rm -rf .skill && git clone -q --depth 1 --branch "$REF" "$REPO" .skill
fi
echo "skill @ $(git -C .skill rev-parse --short HEAD)"
rm -rf src/vendor vendor
mkdir -p src/vendor vendor
cp -r .skill/templates/bridge src/vendor/bridge      # three.js look engine (ink, lens blur, grade, toon cards, paint)
cp -r .skill/templates/audio vendor/audio            # synth SFX / music / mix (ducking + loudness)
cp -r .skill/templates/scripts vendor/scripts        # sbs sheets, frame QA
# the skill's references (frames, sheets, reports) stay in .skill/references for look checks
for f in src/vendor/bridge/*.ts src/vendor/bridge/*.tsx; do sed -i "1i // @ts-nocheck (vendored from the skill at fetch time; upstream types target an older React)" "$f"; done
git -C .skill rev-parse HEAD > vendor/SKILL_COMMIT
