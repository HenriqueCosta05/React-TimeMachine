import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act, createElement } from "react";
import { useTimeMachine } from "../src/use-time-machine";

let container: HTMLDivElement;
let recordedRoot: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  recordedRoot = document.createElement("div");
  document.body.appendChild(recordedRoot);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  recordedRoot.remove();
});

function Harness({ onReady }: { onReady: (api: ReturnType<typeof useTimeMachine>) => void }) {
  const api = useTimeMachine({ root: recordedRoot });
  onReady(api);
  return createElement("div", { ref: api.replayRef });
}

describe("useTimeMachine", () => {
  it("captures dom mutations while recording and replays them on stop", async () => {
    let latest: ReturnType<typeof useTimeMachine> | null = null;

    root = createRoot(container);
    act(() => {
      root.render(createElement(Harness, { onReady: (api) => (latest = api) }));
    });

    expect(latest!.state).toBe("idle");

    act(() => {
      latest!.start();
    });
    expect(latest!.state).toBe("recording");

    const span = document.createElement("span");
    span.textContent = "hello";
    recordedRoot.appendChild(span);
    await act(async () => {
      await new Promise((resolve) => queueMicrotask(resolve));
    });

    act(() => {
      latest!.stop();
    });

    expect(latest!.state).toBe("stopped");
    expect(latest!.eventCount).toBeGreaterThan(0);
    expect(latest!.durationMs).toBeGreaterThanOrEqual(0);
    expect(container.querySelector("span")?.textContent).toBe("hello");
  });

  it("reflects scrubbing to an earlier timestamp in the replay element", async () => {
    let latest: ReturnType<typeof useTimeMachine> | null = null;

    root = createRoot(container);
    act(() => {
      root.render(createElement(Harness, { onReady: (api) => (latest = api) }));
    });

    act(() => {
      latest!.start();
    });

    const span = document.createElement("span");
    span.textContent = "hello";
    recordedRoot.appendChild(span);
    await act(async () => {
      await new Promise((resolve) => queueMicrotask(resolve));
    });

    act(() => {
      latest!.stop();
    });
    expect(container.querySelector("span")).not.toBeNull();

    act(() => {
      latest!.seek(0);
    });
    expect(container.querySelector("span")).toBeNull();
  });
});
