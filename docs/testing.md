# Testing

> Status: no tests exist yet — this documents the planned setup for when packages/* are scaffolded.

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
| recorder capture (state/props diff) | `packages/recorder/test/` | not started |
| recorder capture (DOM mutation) | `packages/recorder/test/` | not started |
| recorder capture (network) | `packages/recorder/test/` | not started |
| player deterministic replay | `packages/player/test/` | not started — highest-risk area, needs a "record then replay, assert identical final state" test harness before anything else |
| video-exporter frame capture | `packages/video-exporter/test/` | not started |
| apps/web share link flow | `apps/web/test/` | not started |

## Known gaps

- Everything — repo has no code yet. Priority once scaffolded: a
  round-trip test (record a scripted interaction, replay it, assert the
  final DOM/state matches) since deterministic replay is the riskiest
  technical bet in the whole project.
