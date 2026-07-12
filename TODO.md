# TODO

Live backlog. Remove items when done — this is not a changelog.

## Now

- [ ] Wire Playwright into `pnpm test`/CI as a real E2E suite — right now it's only used ad hoc (e.g. scripting `apps/complex-demo` to record a demo video), see docs/testing.md

## Next

- [ ] Scaffold packages/video-exporter and apps/web
- [ ] video-exporter: Playwright-driven headless replay -> MP4
- [ ] Shareable replay link: upload recording, generate viewable URL (apps/web)
- [ ] Recording size/perf budget — long sessions must not bloat memory or the exported file

## Later / ideas
- [ ] Browser extension wrapper (one-click record, no manual instrumentation)
- [ ] Redux DevTools import (migrate existing users' action logs)
- [ ] Diffing two recordings (before/after a fix) side by side
- [ ] Public gallery of shared bug replays (adoption/virality play)

## Known issues

- [ ] Fiber commit hook must install before `react-dom/client` first evaluates (same constraint as the real DevTools extension) — apps/demo works around this with a dedicated `instrumentation.ts` imported first; document this requirement wherever recorder gets embedded next
