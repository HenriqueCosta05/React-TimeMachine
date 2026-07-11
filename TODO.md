# TODO

Live backlog. Remove items when done — this is not a changelog.

## Now

- [ ] Scaffold pnpm monorepo (packages/recorder, player, video-exporter, shared; apps/demo, web)
- [ ] Recorder: hook React Fiber commit phase to diff state/props per component
- [ ] Recorder: MutationObserver-based DOM capture
- [ ] Recorder: fetch/XHR interception (request/response, timing)
- [ ] Shared event schema: single ordered log of {timestamp, type, payload} events
- [ ] Player: deterministic replay of a captured event log against apps/demo

## Next

- [ ] Timeline scrubber UI (jump to any point in the recording)
- [ ] video-exporter: Playwright-driven headless replay -> MP4
- [ ] Shareable replay link: upload recording, generate viewable URL (apps/web)
- [ ] Recording size/perf budget — long sessions must not bloat memory or the exported file

## Later / ideas

- [ ] Browser extension wrapper (one-click record, no manual instrumentation)
- [ ] Redux DevTools import (migrate existing users' action logs)
- [ ] Diffing two recordings (before/after a fix) side by side
- [ ] Public gallery of shared bug replays (adoption/virality play)

## Known issues

- [ ] No code exists yet — architecture below is a target design, not yet validated against a real capture
