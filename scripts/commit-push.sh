#!/usr/bin/env bash
# usage: commit-push.sh "<message>" <path>...   Commits the given paths as the Actions bot and pushes, retrying on races.
# Pushes made with GITHUB_TOKEN never trigger other workflows, so this cannot loop.
set -euo pipefail
msg="$1"; shift
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add -A -- "$@"
git diff --cached --quiet && { echo "nothing to commit"; exit 0; }
git commit -q -m "$msg [skip ci]"
for i in 1 2 3 4; do
  git pull -q --rebase origin "${GITHUB_REF_NAME:-main}" || { git rebase --abort 2>/dev/null; git pull -q --no-rebase --no-edit origin "${GITHUB_REF_NAME:-main}"; }
  git push -q origin "HEAD:${GITHUB_REF_NAME:-main}" && { echo "pushed"; exit 0; }
  sleep $((i * 5))
done
echo "::warning::could not push after 4 tries"
