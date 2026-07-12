# Testing

> Status: `shared`, `recorder`, `player`, and `devtools` have Vitest suites in `application/packages/*/test/`. `video-exporter` and `apps/web` aren't scaffolded yet, so there's no automated E2E/Playwright suite — Playwright is currently only used ad hoc (e.g. scripting `apps/complex-demo` to record a demo video), not wired into `pnpm test`.

## Frameworks

- Unit: Vitest
- Integration: Vitest + jsdom (for recorder/player/devtools against a mock React tree)
- E2E: none yet — Playwright is the intended engine (also to be reused by `video-exporter` in prod) but no suite is wired up

## Running tests

```bash
pnpm test                          # all packages, unit + integration
pnpm --filter recorder run test    # scope to one package
pnpm test -- --watch               # watch mode
```

## Test inventory

| Area | Location | Coverage notes |
|---|---|---|
| shared event schema | `application/packages/shared/test/event-schema.test.ts` | covered |
| recorder capture (state/props diff) | `application/packages/recorder/test/recorder.test.ts` | covered — asserts a `useState` update produces a `state-diff` event |
| recorder capture (DOM mutation) | `application/packages/recorder/test/recorder.test.ts` | covered |
| recorder capture (network: fetch + XHR) | `application/packages/recorder/test/recorder.test.ts` | covered — both `fetch` and `XMLHttpRequest` interception have direct tests |
| player deterministic replay | `application/packages/player/test/roundtrip.test.ts` | covered — record/replay round trip, repeat-seek determinism, an adjacent-text-node regression case, prepend (out-of-order insert), and middle-of-list removal |
| devtools panel (`TimeMachineDevtools`) | `application/packages/devtools/test/time-machine-devtools.test.tsx` | covered |
| devtools hook (`useTimeMachine`) | `application/packages/devtools/test/use-time-machine.test.tsx` | covered |
| video-exporter frame capture | `packages/video-exporter/test/` | not started — package not scaffolded |
| apps/web share link flow | `apps/web/test/` | not started — app not scaffolded |

## Known gaps

- No automated E2E suite — Playwright is used only ad hoc against `apps/complex-demo` (e.g. to record a demo video of the devtools panel), not run in CI or via `pnpm test`.
