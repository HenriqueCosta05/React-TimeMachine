# Changelog

All notable changes to the React Time Machine packages. Versions below refer to `@henriquecosta/react-debugmachine` and its underlying packages, which are versioned together.

## Unreleased

### Added
- `@henriquecosta/react-debugmachine-devtools` package (`application/packages/devtools/`) — batteries-included debug UI: a fixed bottom-right toggle opening a near-fullscreen panel with a virtualized interactions list, timeline scrubber, live replay preview, and per-event JSON/diff pane. Exports `TimeMachineDevtools` (the panel, `builtInUI={false}` to opt out) and `useTimeMachine` (the underlying record/stop/seek hook for a fully custom UI).
- `application/apps/complex-demo` — mock chat app (conversations, streaming-style mock AI replies, message editing/regeneration) used to dogfood `devtools` against a busier, more realistic component tree than `apps/demo`.
- XHR interception in `recorder`'s `network-hook.ts` (previously fetch-only), with direct tests.
- `docs/EXAMPLES.md` — worked usage examples against a realistic checkout-flow app: recording a bug report, replaying it in a viewer, scrubbing the timeline to inspect per-timestamp component state and network activity, the batteries-included devtools panel, and split-package installs for tree-shaking.

### Fixed
- Player's `childList` DOM mutation replay only supported appends, so out-of-order inserts and removals couldn't be reconstructed. `dom-observer.ts` now records `previousSiblingIndex` (the target's child immediately before the mutated range, from `MutationRecord.previousSibling`) and `dom-replay.ts` anchors both removal and insertion to it via `insertBefore`/positional `removeChild` — prepends, middle-of-list inserts, and removals now replay in the same position they happened live.

## [1.0.2] — wrapper package

### Added
- `@henriquecosta/react-debugmachine` wrapper package (`application/packages/react-debugmachine/`) — re-exports `Recorder`, `Player`, and the shared event schema from one entry point, so consumers install a single package instead of three.

### Changed
- `scripts/publish.ps1` / `scripts/publish.sh` now scope typecheck/test/build/version-bump/publish to the wrapper package (and its workspace dependencies) instead of every package under `packages/*`. Only the wrapper is version-bumped and published by the script going forward; `shared`, `recorder`, and `player` are published independently when their own source changes.
- `scripts/bootstrap.ps1` / `scripts/bootstrap.sh` build the wrapper package instead of building `packages/*` in bulk.

## [1.0.1] — npm scope migration

### Changed
- Renamed all packages from the `@react-debugmachine` org scope to the `@henriquecosta` npm user scope: `@henriquecosta/react-debugmachine-shared`, `-recorder`, `-player`. A scoped package name is only publishable if the scope matches an npm user or org the publishing account belongs to — org scopes require creating the org first, so packages moved to the already-owned user scope instead.

## [1.0.0] — initial publish attempts and scope naming

### Added
- `scripts/publish.ps1` / `scripts/publish.sh` — version-bump and publish workflow: install, typecheck, test, build, bump version, `pnpm -r publish`.
- `scripts/bootstrap.ps1` / `scripts/bootstrap.sh` — install pnpm if missing, install workspace deps, build packages.

### Fixed
- `publish.ps1` reported `Done. Published version ...` even after a real `npm publish` failure (`404 Not Found — Scope not found`). `$ErrorActionPreference = "Stop"` only halts on PowerShell cmdlet errors, not non-zero exit codes from native executables like `pnpm`/`npm`. Fixed by checking `$LASTEXITCODE` explicitly after every external command and exiting on failure.

### Changed
- Package scope renamed twice while resolving npm publish failures:
  - `@react-time-machine` → `@react-debugmachine` (first scope was unavailable)
  - `@react-debugmachine` → `@henriquecosta` (org scope also returned `Scope not found`; moved to the already-owned user scope rather than creating a new org)
