#!/usr/bin/env bash
# Google Drive via rclone (free). Builds the rclone config from GitHub secrets at run time; nothing is stored in the repo.
#   Either RCLONE_CONF (a whole rclone.conf with a [gdrive] remote)
#   or GDRIVE_CLIENT_ID + GDRIVE_CLIENT_SECRET + GDRIVE_REFRESH_TOKEN (see docs/SETUP-SECRETS.md).
# usage: drive.sh check | init | up <local_path> <remote_dir> | ls <remote_dir> | mv <remote_src> <remote_dst>
set -euo pipefail
ROOT_DIR="${DRIVE_ROOT:-Shorts}"
conf="${RUNNER_TEMP:-/tmp}/rclone.conf"
have_secrets() { [ -n "${RCLONE_CONF:-}" ] || { [ -n "${GDRIVE_CLIENT_ID:-}" ] && [ -n "${GDRIVE_CLIENT_SECRET:-}" ] && [ -n "${GDRIVE_REFRESH_TOKEN:-}" ]; }; }
if ! have_secrets; then echo "::notice::Google Drive is not configured yet (no secrets): skipping '$1'."; exit 0; fi
command -v rclone >/dev/null || { curl -fsSL https://rclone.org/install.sh | sudo bash >/dev/null; }
if [ -n "${RCLONE_CONF:-}" ]; then
  printf '%s\n' "$RCLONE_CONF" > "$conf"
else
  tok=$(python3 -c 'import json,os; print(json.dumps({"access_token":"","token_type":"Bearer","refresh_token":os.environ["GDRIVE_REFRESH_TOKEN"],"expiry":"2000-01-01T00:00:00Z"}))')
  printf '[gdrive]\ntype = drive\nscope = drive\nclient_id = %s\nclient_secret = %s\ntoken = %s\n' "$GDRIVE_CLIENT_ID" "$GDRIVE_CLIENT_SECRET" "$tok" > "$conf"
fi
chmod 600 "$conf"
R="rclone --config $conf"
case "$1" in
  check) $R lsd "gdrive:" --max-depth 1 >/dev/null && echo "drive: connected" && $R lsd "gdrive:$ROOT_DIR" 2>/dev/null || true ;;
  init)  for d in Review Approved Published Rejected; do $R mkdir "gdrive:$ROOT_DIR/$d"; done; $R lsd "gdrive:$ROOT_DIR" ;;
  up)    $R copy "$2" "gdrive:$ROOT_DIR/$3" --transfers 4 && echo "uploaded $2 -> $ROOT_DIR/$3" ;;
  ls)    $R lsf "gdrive:$ROOT_DIR/$2" ;;
  mv)    $R moveto "gdrive:$ROOT_DIR/$2" "gdrive:$ROOT_DIR/$3" ;;
  *) echo "unknown command $1"; exit 2 ;;
esac
