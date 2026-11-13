#!/usr/bin/env bash
# VoiceStudio (OmniVoice engine) on CPU via its Docker image + OpenAI-style API.
# usage: voicestudio_tts.sh <script.txt> <out_dir>      env: VS_INSTRUCT, VS_SEED, VS_TIMEOUT (s, default 600)
set -euo pipefail
SCRIPT="$1"; OUT="$2"; mkdir -p "$OUT"
INSTRUCT="${VS_INSTRUCT:-male, middle-aged, low pitch, american accent}"
TIMEOUT="${VS_TIMEOUT:-600}"
IMAGE="${VS_IMAGE:-ghcr.io/debpalash/voicestudio:stable}"
t0=$(date +%s)
docker run -d --name vs -p 127.0.0.1:3900:3900 -e OMNIVOICE_DEVICE=cpu -e OMNIVOICE_DATA_DIR=/app/omnivoice_data \
  -e OMNIVOICE_CPU_GENERATE_TIMEOUT_S="$TIMEOUT" "$IMAGE" >/dev/null
for i in $(seq 1 120); do curl -sf http://127.0.0.1:3900/health >/dev/null && break; sleep 5; done
t_ready=$(date +%s)
BODY=$(python3 -c 'import json,sys; print(json.dumps({"model":"omnivoice","input":open(sys.argv[1]).read().strip(),"voice":"default","instruct":sys.argv[2],"response_format":"wav","language":"en","seed":int(sys.argv[3])}))' "$SCRIPT" "$INSTRUCT" "${VS_SEED:-7}")
code=$(curl -s -o "$OUT/voice.wav" -w "%{http_code}" --max-time "$TIMEOUT" -H "Content-Type: application/json" -d "$BODY" http://127.0.0.1:3900/v1/audio/speech || echo 000)
t1=$(date +%s)
docker logs vs 2>&1 | tail -40 > "$OUT/voicestudio.log" || true
docker rm -f vs >/dev/null 2>&1 || true
echo "{\"engine\":\"voicestudio\",\"http\":\"$code\",\"startup_s\":$((t_ready-t0)),\"generate_s\":$((t1-t_ready)),\"instruct\":\"$INSTRUCT\"}" | tee "$OUT/voice_info.json"
[ "$code" = "200" ]
