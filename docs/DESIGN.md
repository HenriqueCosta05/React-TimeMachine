# Design Spec

Concrete tokens and component rules, not a mood board. This file should be
usable directly by a UI-generation tool.

> Status: placeholder tokens for the `apps/web` viewer and timeline scrubber. No UI has been built yet — swap these for real brand decisions before implementation.

## Brand

- Name: React Time Machine
- Tone: technical, fast, a little dramatic — this is a "holy shit" developer
  tool, not an enterprise dashboard
  - technical: monospace for all timestamps/event data, no decorative UI chrome
  - fast: instant timeline scrub, no loading spinners on playback
  - dramatic: the shareable-link viewer is the "wow" moment — full-bleed
    player, minimal surrounding chrome

## Color tokens

| Token | Value | Usage |
|---|---|---|
| `color-primary` | `#6366F1` | scrubber playhead, primary buttons, links |
| `color-secondary` | `#22D3EE` | network-event markers on the timeline |
| `color-bg` | `#0B0F19` | app background (dark by default — this is a dev tool) |
| `color-error` | `#F43F5E` | error events / thrown exceptions on the timeline |

## Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Heading 1 | Inter | 28px | 600 |
| Body | Inter | 14px | 400 |
| Monospace (event data, timestamps) | JetBrains Mono | 13px | 400 |

## Spacing scale

4px base: 4 / 8 / 16 / 24 / 32 / 48

## Component specs

### Timeline scrubber

- Variants: full-width (viewer page), compact (embedded in recorder overlay)
- States: default, dragging (playhead follows cursor), event-hover (tooltip
  with event type + timestamp)
- Do: mark state/DOM/network events as distinct colored ticks on the same
  timeline so a viewer can see causality at a glance
- Don't: collapse different event types into one generic "event" marker — the
  whole value is seeing state vs. DOM vs. network correlate in time

### Replay viewer (apps/web)

- Variants: standalone shared-link page, embedded (iframe) for future
  ticket/PR integrations
- States: loading recording, playing, paused/scrubbing, export-in-progress
  (video)
- Do: default to full-bleed player with the URL bar as the only chrome —
  the replay itself is the product moment
- Don't: gate the first view behind a signup wall — the shareable link is the
  adoption mechanism, friction here kills virality

### Record button (recorder overlay)

- Variants: idle, recording (pulsing `color-error` dot), stopped
- States: default, hover, disabled (already recording)
- Do: keep it a small fixed-position overlay, dev-tool style
- Don't: interfere with the host app's own UI or z-index stack
