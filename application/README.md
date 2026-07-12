# application/

pnpm workspace for React Time Machine. All installable packages and the demo app live here.

## Workspace layout

```
packages/
  shared/               @henriquecosta/react-debugmachine-shared
  recorder/             @henriquecosta/react-debugmachine-recorder
  player/                @henriquecosta/react-debugmachine-player
  react-debugmachine/   @henriquecosta/react-debugmachine (wrapper — re-exports the three above)
  devtools/              @henriquecosta/react-debugmachine-devtools (built-in record/replay UI panel)
apps/
  demo/                 minimal sample app, consumes recorder + player directly
  complex-demo/          mock chat app, consumes devtools' TimeMachineDevtools component
```

`react-debugmachine` has no implementation of its own — it only re-exports `Recorder`, `Player`, and the shared event schema, so external consumers install one package instead of three. `shared`, `recorder`, and `player` are still published independently since `react-debugmachine` depends on them via `workspace:*`, which pnpm resolves to real semver ranges on publish.

`devtools` is a separate install from the wrapper — it depends directly on `recorder`, `player`, and `shared` (not on `react-debugmachine`) and exports `TimeMachineDevtools` (the batteries-included panel) plus the underlying `useTimeMachine` hook for building a custom UI on the same primitives.

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

To run `complex-demo` (the chat app dogfooding `TimeMachineDevtools`) instead:

```bash
pnpm --filter complex-demo dev   # rsbuild dev server on http://localhost:3000
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
