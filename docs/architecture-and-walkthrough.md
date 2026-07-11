# Architecture & Walkthrough

> Status: target design. No code written yet — this is the spec the first implementation should follow, not a description of working code.

## Overview

React Time Machine attaches to a running React app, records a single ordered
log of every state/props change, DOM mutation, and network call, then can
deterministically replay that log — in the browser for scrubbing, or headless
for generating a shareable bug-replay video. The core idea: one event log is
the source of truth for both live scrubbing and offline video rendering, so
"watch the replay" and "render the replay to MP4" are the same code path.

## Components

### recorder

- Responsibility: capture state/props diffs, DOM mutations, and network
  activity into one ordered event log
- Location: `packages/recorder/`
- Key files: `fiber-hook.ts` — taps React's commit phase for state/props diffs;
  `dom-observer.ts` — MutationObserver wrapper; `network-hook.ts` — wraps
  `fetch`/`XMLHttpRequest`
- Depends on: shared (event schema)

### shared

- Responsibility: event schema and serialization format used by both recorder
  and player, so a recording made today replays correctly later
- Location: `packages/shared/`
- Key files: `event-schema.ts` — event types and versioning
- Depends on: nothing internal

### player

- Responsibility: deterministic replay of an event log — re-apply state/DOM
  events in order against a live or headless instance of the app; timeline
  scrubber UI
- Location: `packages/player/`
- Depends on: shared

### video-exporter

- Responsibility: drive `player` headlessly (Playwright) and capture frames to
  produce an MP4 of a recording
- Location: `packages/video-exporter/`
- Depends on: player

### apps/web

- Responsibility: hosted viewer — accepts an uploaded recording, generates a
  shareable link, plays it back via `player` in-browser
- Location: `apps/web/`
- Depends on: player

## Data flow

1. `recorder` attaches to the target React app (dev build) and starts logging
   events (state diff, DOM mutation, network request/response) with a shared
   clock
2. On stop, the event log is serialized (via `shared`'s schema) to a single
   recording file
3. **Scrub path**: `player` loads the recording client-side, lets a user drag a
   timeline scrubber to any point, re-applying events up to that point
4. **Video path**: `video-exporter` loads the same recording into a headless
   browser via Playwright, drives `player` frame-by-frame, and captures each
   frame into an MP4
5. **Share path**: a recording is uploaded to `apps/web`, which stores it and
   returns a link; opening the link loads `player` against that recording

## Design decisions

### One event log drives both live scrub and video export

- **Choice**: `video-exporter` reuses `player`'s replay logic instead of having
  its own rendering path
- **Alternatives considered**: separate lightweight renderer just for video,
  optimized for headless capture
- **Why**: two replay implementations drifting apart (bug reproduces when
  scrubbing but not in the exported video, or vice versa) would undermine the
  entire pitch — the video must be trustworthy proof of the bug

### Hook React's Fiber commit phase, not a state-management library

- **Choice**: capture state/props diffs at the Fiber commit level, framework
  library agnostic (works regardless of Redux/Zustand/local state)
- **Alternatives considered**: Redux DevTools-style middleware (only captures
  Redux-managed state)
- **Why**: "not just Redux DevTools, much more" is the core differentiator —
  restricting capture to one state library would contradict the product's
  reason to exist

## User journeys

### Developer records and shares a bug

1. Developer attaches recorder to their app (dev mode), reproduces the bug
2. Stops recording; recorder produces a recording file
3. Developer uploads it to apps/web, gets a shareable link
4. Developer pastes the link in Slack/a bug ticket: "replay of the bug from
   yesterday"
5. Teammate opens the link, scrubs the timeline, sees state/DOM/network at the
   exact moment of the bug — no need to reproduce it locally

### Developer generates a bug video for a ticket

1. Developer has a recording (see above)
2. Runs video-exporter against it
3. Gets an MP4 to attach directly to a GitHub issue or PR
