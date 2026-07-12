# Usage examples

Worked examples against a realistic app: a multi-step checkout flow (`CartStep` → `ShippingStep` → `PaymentStep`) that calls a `/api/orders` endpoint. The scenario: a customer reports the payment step "just hangs" — these examples capture that bug and let an engineer replay it without reproducing it locally.

All examples use the single wrapper package:

```bash
npm install @henriquecosta/react-debugmachine
```

## 1. Record a bug report from a "Report a bug" button

Mount the recorder against the app's root node, keep the returned `Recording` around, and ship it wherever your bug reports go (upload endpoint, attach to a support ticket, etc).

```tsx
import { useRef, useState } from "react";
import { Recorder, type Recording } from "@henriquecosta/react-debugmachine";

function CheckoutApp() {
  const appRootRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<Recorder | null>(null);
  const [lastRecording, setLastRecording] = useState<Recording | null>(null);

  const startBugReport = () => {
    if (!appRootRef.current) return;
    recorderRef.current = new Recorder({ root: appRootRef.current });
    recorderRef.current.start();
  };

  const finishBugReport = async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    const recording = recorder.stop();
    setLastRecording(recording);

    // Recording is plain JSON — send it to your own backend.
    await fetch("/api/bug-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recording,
        route: window.location.pathname,
        userId: getCurrentUserId(),
      }),
    });
  };

  return (
    <div ref={appRootRef}>
      <CartStep />
      <ShippingStep />
      <PaymentStep />
      <button onClick={startBugReport}>Start recording</button>
      <button onClick={finishBugReport}>Report this bug</button>
    </div>
  );
}
```

`recorder.start()` installs three hooks scoped to `appRootRef.current`: a Fiber hook for state/props diffs, a `MutationObserver` for DOM changes, and a fetch/XHR interceptor for network activity. `recorder.stop()` tears all three down and returns a self-contained `Recording` (schema version + initial DOM snapshot + time-ordered events) — safe to `JSON.stringify` and store.

## 2. Replay a stored recording in a support/engineering viewer

Given a `Recording` fetched back from your backend, replay it against a detached DOM node so it doesn't touch the live app:

```tsx
import { useEffect, useRef } from "react";
import { Player, type Recording } from "@henriquecosta/react-debugmachine";

function BugReportViewer({ recording }: { recording: Recording }) {
  const replayRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!replayRootRef.current) return;
    const player = new Player(recording);
    player.seekTo(replayRootRef.current, player.durationMs); // jump to end state
  }, [recording]);

  return <div ref={replayRootRef} />;
}
```

`new Player(recording)` throws if `recording.schemaVersion` doesn't match the package's `EVENT_SCHEMA_VERSION` — guard against replaying reports captured by an older/newer package version:

```tsx
import { isSupportedSchemaVersion } from "@henriquecosta/react-debugmachine";

if (!isSupportedSchemaVersion(recording)) {
  showError("This bug report was captured by an incompatible version — ask the reporter to re-record.");
}
```

## 3. Scrub a timeline to find where `PaymentStep` actually hung

This is the payoff for the "just hangs" report: step through the recording millisecond-by-millisecond and inspect DOM + component state + network at each point, without adding a single `console.log` to the app.

```tsx
function TimelineScrubber({ recording }: { recording: Recording }) {
  const replayRootRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [timestamp, setTimestamp] = useState(0);

  useEffect(() => {
    playerRef.current = new Player(recording);
  }, [recording]);

  const handleScrub = (ms: number) => {
    setTimestamp(ms);
    if (replayRootRef.current) {
      playerRef.current?.seekTo(replayRootRef.current, ms);
    }
  };

  const player = playerRef.current;
  const state = player?.stateAt(timestamp);
  const network = player?.networkAt(timestamp) ?? [];

  return (
    <>
      <input
        type="range"
        min={0}
        max={player?.durationMs ?? 0}
        value={timestamp}
        onChange={(e) => handleScrub(Number(e.target.value))}
      />
      <div ref={replayRootRef} />

      {/* PaymentStep's Fiber-tracked state/props as of this point in time */}
      <pre>{JSON.stringify(state?.get("PaymentStep"), null, 2)}</pre>

      {/* every request the app had made by this point, paired with its response (or null if still pending) */}
      <ul>
        {network.map((exchange) => (
          <li key={exchange.request.requestId}>
            {exchange.request.method} {exchange.request.url} —{" "}
            {exchange.response ? `${exchange.response.status} (${exchange.response.durationMs}ms)` : "pending"}
          </li>
        ))}
      </ul>
    </>
  );
}
```

Dragging the scrubber to just before the hang and reading `network` directly shows a request whose `response` stays `null` — the `/api/orders` call that never resolved, without needing to reproduce the bug or add temporary logging.

## 4. Split-package install (advanced)

Most apps should use the wrapper. Install the underlying packages directly only if you need to tree-shake out the recorder in a viewer-only bundle, or the player in a recorder-only agent bundle:

```bash
npm install @henriquecosta/react-debugmachine-recorder   # capture agent, embedded in the app being debugged
npm install @henriquecosta/react-debugmachine-player     # replay engine, embedded in a separate viewer app
```

```ts
// capture-only bundle
import { Recorder } from "@henriquecosta/react-debugmachine-recorder";

// viewer-only bundle
import { Player } from "@henriquecosta/react-debugmachine-player";
import type { Recording } from "@henriquecosta/react-debugmachine-shared";
```

Both depend on `@henriquecosta/react-debugmachine-shared` for the event schema; `createRecording` and `isSupportedSchemaVersion` live there too if you're building `Recording` objects by hand (e.g. converting from another capture format).
