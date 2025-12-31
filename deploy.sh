#!/usr/bin/env bash
set -euo pipefail

# Simple deploy script: build locally then rsync to remote
# Usage: ./deploy.sh
# Optional env overrides: DEPLOY_HOST, DEPLOY_DEST

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOST="${DEPLOY_HOST:-47.97.155.226}"
DEST="${DEPLOY_DEST:-/opt/ruhoowww/dist/2048}"

cd "$ROOT_DIR"

echo "[1/3] Building project..."
npm install >/dev/null 2>&1 || npm install
npm run build

echo "[2/3] Ensuring remote directory exists: ${HOST}:${DEST}" 
ssh "$HOST" "mkdir -p '${DEST}'"

echo "[3/3] Syncing dist/ to ${HOST}:${DEST}"
if ssh "$HOST" "command -v rsync >/dev/null 2>&1"; then
	rsync -av --delete "$ROOT_DIR/dist/" "${HOST}:${DEST}/"
else
	echo "rsync not found on remote, using scp fallback"
	ssh "$HOST" "rm -rf '${DEST}'/*"
	scp -r "$ROOT_DIR/dist/"* "${HOST}:${DEST}/"
fi

echo "Deploy complete: ${HOST}:${DEST}"
