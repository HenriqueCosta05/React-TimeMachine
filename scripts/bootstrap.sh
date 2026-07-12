#!/usr/bin/env bash
# Install pnpm (if missing), install workspace dependencies, and build packages.
#
# Usage:
#   ./scripts/bootstrap.sh
#   ./scripts/bootstrap.sh --skip-build

set -euo pipefail

SKIP_BUILD="${1:-}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/application"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "==> pnpm not found, installing globally via npm"
  npm install -g pnpm
fi

echo "==> pnpm version: $(pnpm --version)"

cd "$APP_DIR"

echo "==> Installing workspace dependencies"
pnpm install

if [ "$SKIP_BUILD" != "--skip-build" ]; then
  echo "==> Building packages (shared, recorder, player)"
  pnpm --filter "./packages/*" run build
fi

echo ""
echo "==> Bootstrap complete."
echo "Run 'pnpm dev' from application/ to start the demo app."
