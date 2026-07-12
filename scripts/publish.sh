#!/usr/bin/env bash
# Version-bump and publish the react-debugmachine wrapper package to npm.
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

WRAPPER_FILTER="./packages/react-debugmachine..."

echo "==> Typecheck"
pnpm --filter "$WRAPPER_FILTER" run typecheck

echo "==> Test"
pnpm --filter "$WRAPPER_FILTER" run test

echo "==> Build"
pnpm --filter "$WRAPPER_FILTER" run build

echo "==> Bumping version ($BUMP) for wrapper package"
pnpm --filter "./packages/react-debugmachine" exec -- npm version "$BUMP" --no-git-tag-version

NEW_VERSION=$(node -p "require('./packages/react-debugmachine/package.json').version")
echo "==> New version: $NEW_VERSION"

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
pkg.version = '$NEW_VERSION';
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

if [ "$DRY_RUN" = "--dry-run" ]; then
  echo "==> Dry run - publishing skipped"
  pnpm --filter "./packages/react-debugmachine" publish --access public --no-git-checks --dry-run
else
  echo "==> Publishing to npm"
  pnpm --filter "./packages/react-debugmachine" publish --access public --no-git-checks
fi

echo "==> Done. Published version $NEW_VERSION"
