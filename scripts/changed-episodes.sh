#!/usr/bin/env bash
# Prints the episode ids touched by a push (or every episode on a branch's first push). Ignores stills/ and build/.
set -euo pipefail
before="${1:-}"; after="${2:-HEAD}"
if [ -z "$before" ] || [ "$before" = "0000000000000000000000000000000000000000" ] || ! git cat-file -e "$before" 2>/dev/null; then
  ls -d episodes/*/ 2>/dev/null | cut -d/ -f2
else
  git diff --name-only "$before" "$after" -- episodes | grep -v -E '^episodes/[^/]+/(stills|build)/' | cut -d/ -f2 | sort -u
fi | while read -r id; do [ -f "episodes/$id/episode.json" ] && echo "$id"; done
