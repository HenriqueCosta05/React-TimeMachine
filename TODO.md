# TODO

Live backlog. Remove items when done — this is not a changelog.

## Now

- [X] Recorder: XHR interception (fetch-only today)
- [X] Player: childList replay only supports appends (no recorded sibling position, so out-of-order inserts/removals aren't reconstructed)

## Next

- [ ] Scaffold packages/video-exporter and apps/web
- [ ] Timeline scrubber UI (jump to any point in the recording)
- [ ] video-exporter: Playwright-driven headless replay -> MP4
- [ ] Shareable replay link: upload recording, generate viewable URL (apps/web)
- [ ] Recording size/perf budget — long sessions must not bloat memory or the exported file

## Later / ideas
- [ ] Make the project available as a helper dev plugin with modern UI
- [ ] Browser extension wrapper (one-click record, no manual instrumentation)
- [ ] Redux DevTools import (migrate existing users' action logs)
- [ ] Diffing two recordings (before/after a fix) side by side
- [ ] Public gallery of shared bug replays (adoption/virality play)

## Known issues

- [ ] Fiber commit hook must install before `react-dom/client` first evaluates (same constraint as the real DevTools extension) — apps/demo works around this with a dedicated `instrumentation.ts` imported first; document this requirement wherever recorder gets embedded next
