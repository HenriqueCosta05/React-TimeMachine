import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  delete window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  // React only checks for the devtools hook once, at react-dom module
  // evaluation time — same as a real DevTools extension, which injects before
  // page scripts run. Force a fresh module graph per test so `Recorder.start()`
  // (which installs the hook) runs before `react-dom/client` is evaluated.
  vi.resetModules();
});

afterEach(() => {
  container.remove();
});

describe("Recorder", () => {
  it("captures a state-diff event when a hooked component re-renders with new state", async () => {
    const { Recorder } = await import("../src/recorder");
    const recorder = new Recorder({ root: container });
    recorder.start();

    const React = (await import("react")).default;
    const { act, useState } = await import("react");
    const { createRoot } = await import("react-dom/client");

    function Counter() {
      const [count, setCount] = useState(0);
      return React.createElement(
        "button",
        { onClick: () => setCount((c) => c + 1) },
        `count:${count}`,
      );
    }

    const root = createRoot(container);
    act(() => {
      root.render(React.createElement(Counter));
    });

    const button = container.querySelector("button")!;
    act(() => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const recording = recorder.stop();
    const stateDiffs = recording.events.filter((event) => event.type === "state-diff");

    expect(stateDiffs.length).toBeGreaterThan(0);
    expect(
      stateDiffs.some((event) => JSON.stringify(event.payload.changedState).includes("1")),
    ).toBe(true);

    act(() => {
      root.unmount();
    });
  });

  it("captures dom-mutation events for changes inside the recorded root", async () => {
    const { Recorder } = await import("../src/recorder");
    const recorder = new Recorder({ root: container });
    recorder.start();

    const span = document.createElement("span");
    span.textContent = "hello";
    container.appendChild(span);

    await new Promise((resolve) => queueMicrotask(resolve));

    const recording = recorder.stop();
    const mutations = recording.events.filter((event) => event.type === "dom-mutation");
    expect(mutations.length).toBeGreaterThan(0);
  });
});
