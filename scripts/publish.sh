#!/usr/bin/env bash
# Version-bump and publish the publishable packages (shared, recorder, player) to npm.
#
# Usage:
#   ./scripts/publish.sh 1.0.0
#   ./scripts/publish.sh patch
#   ./scripts/publish.sh minor --dry-run

set -euo pipefail

BUMP="${1:-patch}"
DRY_RUN="${2:-}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/application"

cd "$APP_DIR"

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Typecheck"
pnpm -r run typecheck

echo "==> Test"
pnpm -r run test

echo "==> Build"
pnpm -r run build

echo "==> Bumping version ($BUMP) for publishable packages"
pnpm --filter "./packages/*" exec -- npm version "$BUMP" --no-git-tag-version

NEW_VERSION=$(node -p "require('./packages/shared/package.json').version")
echo "==> New version: $NEW_VERSION"

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
pkg.version = '$NEW_VERSION';
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

if [ "$DRY_RUN" = "--dry-run" ]; then
  echo "==> Dry run - publishing skipped"
  pnpm -r publish --access public --no-git-checks --dry-run
else
  echo "==> Publishing to npm"
  pnpm -r publish --access public --no-git-checks
fi

echo "==> Done. Published version $NEW_VERSION"
