# application/

pnpm workspace for React Time Machine. All installable packages and the demo app live here.

## Workspace layout

```
packages/
  shared/               @henriquecosta/react-debugmachine-shared
  recorder/             @henriquecosta/react-debugmachine-recorder
  player/                @henriquecosta/react-debugmachine-player
  react-debugmachine/   @henriquecosta/react-debugmachine (wrapper — re-exports the three above)
apps/
  demo/                 sample app, consumes recorder + player directly
```

`react-debugmachine` has no implementation of its own — it only re-exports `Recorder`, `Player`, and the shared event schema, so external consumers install one package instead of three. `shared`, `recorder`, and `player` are still published independently since `react-debugmachine` depends on them via `workspace:*`, which pnpm resolves to real semver ranges on publish.

## Setup

```bash
pnpm install
```

## Common commands

```bash
pnpm dev          # run apps/demo (rsbuild dev server) with the recorder attached
pnpm build        # build all packages
pnpm test         # test all packages
pnpm typecheck    # typecheck all packages
```

Scope any command to a single package with `--filter`:

```bash
pnpm --filter "./packages/react-debugmachine" run build
```

## Publishing

`scripts/publish.ps1` / `scripts/publish.sh` (at repo root) drive the release:

```bash
./scripts/publish.ps1 -Bump patch          # or minor / major / an explicit semver
./scripts/publish.ps1 -Bump patch -DryRun  # verify without publishing
```

What it does, in order:

1. `pnpm install --frozen-lockfile`
2. Typecheck, test, build — scoped to `packages/react-debugmachine` **and its workspace dependencies** (`shared`, `recorder`, `player`), since the wrapper's build needs their compiled `dist/` output to resolve.
3. Bump `packages/react-debugmachine/package.json` version (`npm version <bump>`).
4. Mirror that version onto the root `application/package.json`.
5. `pnpm --filter "./packages/react-debugmachine" publish --access public --no-git-checks`.

Only the wrapper package is version-bumped and published by this script. `shared`, `recorder`, and `player` keep whatever version they were last published at — bump and publish those individually (`pnpm --filter "./packages/<name>" publish --access public`) if you've changed their source and need a new release for the wrapper to pick up via `workspace:*`.

### npm scope

All packages publish under the `@henriquecosta` npm user scope (`npm whoami`), not an npm org — a scoped package name only works if the scope matches an npm user or org you belong to, so this needs to stay in sync with whichever npm account runs the publish script.
