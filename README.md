# React Time Machine

Records every state change, DOM mutation, and network request in a React app, then replays it deterministically.

![Overview](docs/assets/overview.png)
Published on npm as a single wrapper package, a batteries-included devtools UI, and the underlying pieces, all scoped to `@henriquecosta`, my npm username:

- [`@henriquecosta/react-debugmachine`](https://www.npmjs.com/package/@henriquecosta/react-debugmachine) — single-entry-point package (`Recorder` + `Player`), install this one for a custom debug UI
- [`@henriquecosta/react-debugmachine-devtools`](https://www.npmjs.com/package/@henriquecosta/react-debugmachine-devtools) — drop-in floating record/replay panel (Next.js-dev-indicator style), install this one for zero-UI-work debugging

## Project structure

```
application/        pnpm workspace root — all installable code lives here
  packages/
    shared/               event schema, serialization format
    recorder/             capture agent (Fiber, DOM, network incl. XHR)
    player/                deterministic replay engine
    react-debugmachine/   wrapper package re-exporting recorder + player + shared
    devtools/              built-in debug UI (toggle + panel) on top of recorder + player
  apps/
    demo/                 minimal sample app used to dogfood the recorder
    complex-demo/          mock chat app (conversations, streaming-style replies, edits) used to dogfood devtools against a busier tree
scripts/           bootstrap.ps1/.sh, publish.ps1/.sh — see below
docs/              architecture, design, changelog
deployment/        CI + hosting config
```

## Quick start (development)

```bash
git clone "git@github.com:HenriqueCosta05/React-TimeMachine.git"
./scripts/bootstrap.ps1        # or ./scripts/bootstrap.sh
cd application
pnpm dev                       # runs apps/demo with recorder attached
```

Or, to use the published packages in your own app — fastest path, the built-in devtools panel:

```bash
npm install @henriquecosta/react-debugmachine-devtools
```

```tsx
import { TimeMachineDevtools } from "@henriquecosta/react-debugmachine-devtools";

<div ref={setRecordedRoot}>{/* your app */}</div>
<TimeMachineDevtools root={recordedRoot} />
```

That renders a fixed bottom-right toggle; open it, hit record, reproduce a bug, hit stop, scrub the timeline. No custom UI required.

For a fully custom debug UI, drop to the primitives directly:

```bash
npm install @henriquecosta/react-debugmachine
```

```ts
import { Recorder, Player } from "@henriquecosta/react-debugmachine";
```

See [docs/EXAMPLES.md](docs/EXAMPLES.md) for a full record → store → replay → scrub walkthrough against a realistic checkout flow.

## Prerequisites

- Node 20+
- pnpm 9+ (bootstrap script installs it if missing)

## Scripts

- `scripts/bootstrap.ps1` / `scripts/bootstrap.sh` — install pnpm if missing, install workspace deps, build the wrapper package
- `scripts/publish.ps1` / `scripts/publish.sh` — typecheck/test/build the wrapper package (and its workspace dependencies), bump its version, publish to npm. See [application/README.md](application/README.md) for details.

## Where to look next

- Usage examples (real-world recording/replay flow): [docs/EXAMPLES.md](docs/EXAMPLES.md)
- Development and publishing workflow: [application/README.md](application/README.md)
- Architecture and design decisions: [docs/DESIGN.md](docs/DESIGN.md)
- Changelog: [docs/CHANGELOG.md](docs/CHANGELOG.md)
- Deployment: [docs/deployment/README.md](docs/deployment/README.md)
