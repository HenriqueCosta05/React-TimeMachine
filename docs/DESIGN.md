# Design Spec

Concrete tokens and component rules, not a mood board. This file should be
usable directly by a UI-generation tool.

> Status: the `devtools` package (`TimeMachineDevtools` panel) is built and its tokens/specs below are real, taken directly from `application/packages/devtools/src/TimeMachineDevtools.tsx`. The `apps/web` shareable-link viewer is still unbuilt — its section stays placeholder until that app exists.

## Brand

- Name: React Time Machine
- Tone: technical, fast, a little dramatic — this is a "holy shit" developer
  tool, not an enterprise dashboard
  - technical: monospace for all timestamps/event data, no decorative UI chrome
  - fast: instant timeline scrub, no loading spinners on playback
  - dramatic: the shareable-link viewer is the "wow" moment — full-bleed
    player, minimal surrounding chrome

## Color tokens — `devtools` panel (implemented)

| Token | Value | Usage |
|---|---|---|
| `color-bg` | `#09090b` | panel base background |
| `color-surface` | `rgba(24, 24, 27, 0.9)` | toggle + panel surface, blurred (`backdrop-filter: blur`) |
| `color-border` | `rgba(255, 255, 255, 0.08)` | hairline borders on toggle, panel, rows, panes |
| `color-text` | `#fafafa` | primary text |
| `color-muted` | `#a1a1aa` | labels, timestamps, eyebrow text |
| `color-blue` | `#3b82f6` | primary action (record), selected-row highlight, scrubber accent |
| `color-red` | `#ef4444` | destructive action (stop) |
| `shadow` | `0 24px 80px rgba(0,0,0,.45), 0 8px 24px rgba(0,0,0,.25)` | toggle + panel elevation |
| diff add | `#4ade80` | `+` lines in the per-event diff pane |
| diff remove | `#f87171` | `-` lines in the per-event diff pane |

## Typography — `devtools` panel (implemented)

| Role | Font stack | Size | Weight |
|---|---|---|---|
| UI text (titles, labels, buttons) | `Inter, system-ui, sans-serif` | 18px (title) / 13px (body) / 12px (labels) | 700 (title) / 600 (buttons) / 400 (body) |
| Monospace (raw JSON, diff lines) | `"JetBrains Mono", SFMono-Regular, Consolas, monospace` | 12–13px | 400 |

## Spacing scale

4px base: 4 / 8 / 16 / 24 / 32 / 48

## Component specs

### Time Machine devtools panel (implemented — `packages/devtools`)

- **Toggle**: fixed bottom-right circle, 50×50, `⏱`, `zIndex: 2147483647` —
  always above host app chrome. Next.js-dev-indicator style: closed by
  default, click to open/close.
- **Panel**: near-fullscreen card (`top/left/right/bottom` inset by
  `4vh`/`2vw`), not a small popover — the interactions list and JSON detail
  pane both need real room. Opening the panel covers the host app; close it
  (click the toggle again) to interact with the app underneath while a
  recording continues in the background.
- **Header**: title + eyebrow ("session recorder & debugger"), record/stop
  button (`color-blue` when idle+`root` set, `color-red` mid-recording,
  disabled/dimmed when `root` is null), state + interaction count label.
- **Interactions pane** (left, 420px fixed): virtualized list (44px rows,
  4-row overscan), one row per deduped event — type tag (`STATE`/`DOM`/`REQ
  →`/`RES ←`), one-line description, timestamp. Selecting a row seeks the
  replay to that event's timestamp.
- **Debug pane** (right, flexible): visible once `state === "stopped"` —
  timeline scrubber (`<input type="range">`, `color-blue` accent), live
  replay preview (`replayRef` target), per-event diff (`+`/`-`/info lines,
  green/red/muted) with a collapsible raw-JSON `<details>`.
- Do: keep state/DOM/network event types visually distinct (tag + color) so
  causality across types is scannable at a glance.
- Don't: let the panel intercept clicks on the host app while open — that's
  why it's close-then-interact, not an overlay you can partially see through.

### Timeline scrubber (implemented, inside the devtools debug pane)

- States: default, dragging (native range input), disabled (hidden entirely
  until `state === "stopped"`, since there's nothing to scrub mid-recording)
- Do: pair every scrub with an immediate `player.seekTo` — no debounce, no
  loading state, scrubbing must feel instant

### Replay viewer (apps/web — still placeholder, not built)

- Variants: standalone shared-link page, embedded (iframe) for future
  ticket/PR integrations
- States: loading recording, playing, paused/scrubbing, export-in-progress
  (video)
- Do: default to full-bleed player with the URL bar as the only chrome —
  the replay itself is the product moment
- Don't: gate the first view behind a signup wall — the shareable link is the
  adoption mechanism, friction here kills virality
