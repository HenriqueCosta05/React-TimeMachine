# React Time Machine

Records every state change, DOM mutation, and network request in a React app, then replays it deterministically — including generating a shareable video of a bug, from a link. Portfolio project; no code written yet, this repo currently holds only the spec.

## Project structure

```
packages/
  recorder/       browser-side capture agent: React state/props diffs (Fiber),
                  DOM MutationObserver, fetch/XHR interception
  player/         deterministic replay engine + timeline scrubber UI
  video-exporter/ headless replay -> video (Playwright-driven frame capture)
  shared/         event schema, serialization format shared by recorder/player
apps/
  demo/           sample React app used to dogfood the recorder
  web/            hosted viewer for shareable replay links
docs/             architecture, design, testing docs (this skill's output)
deployment/       CI + hosting config for apps/web
```

## Quick start

```bash
# not yet implemented — planned once packages/recorder exists
pnpm install
pnpm dev            # runs apps/demo with recorder attached
pnpm test
```

## Prerequisites

- Node 20+
- pnpm 9+
- Playwright browsers (for video-exporter) — `pnpm exec playwright install`

## Where to look next

- Architecture and design decisions: [docs/architecture-and-walkthrough.md](docs/architecture-and-walkthrough.md)
- UI/branding spec: [docs/DESIGN.md](docs/DESIGN.md)
- Testing: [docs/testing.md](docs/testing.md)
- Deployment: [deployment/README.md](deployment/README.md)
