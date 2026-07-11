# Testing

> Status: `shared`, `recorder`, and `player` have Vitest suites in `application/packages/*/test/`. `video-exporter` and `apps/web` aren't scaffolded yet.

## Frameworks

- Unit: Vitest
- Integration: Vitest + jsdom (for recorder/player against a mock React tree)
- E2E: Playwright (also the engine reused by `video-exporter` in prod)

## Running tests

```bash
pnpm test                 # all packages, unit + integration
pnpm test --filter recorder
pnpm test:e2e              # Playwright, apps/demo + apps/web
pnpm test -- --watch       # watch mode
```

## Test inventory

| Area | Location | Coverage notes |
|---|---|---|
| recorder capture (state/props diff) | `application/packages/recorder/test/recorder.test.ts` | covered — asserts a `useState` update produces a `state-diff` event |
| recorder capture (DOM mutation) | `application/packages/recorder/test/recorder.test.ts` | covered |
| recorder capture (network) | — | not started — `network-hook.ts` wraps `fetch` but has no direct test yet |
| player deterministic replay | `application/packages/player/test/roundtrip.test.ts` | covered — record/replay round trip, repeat-seek determinism, and an adjacent-text-node regression case |
| video-exporter frame capture | `packages/video-exporter/test/` | not started — package not scaffolded |
| apps/web share link flow | `apps/web/test/` | not started — app not scaffolded |

## Known gaps

- `network-hook.ts` (fetch interception) has no direct test — only exercised indirectly via `Recorder`.
- XHR interception isn't implemented, so no test either.
- Player's `childList` replay only supports appends (see TODO.md); no test covers removal or reordering since the recorder doesn't capture enough info to replay them yet.
