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

  it("captures network-request/response events for XHR calls, not just fetch", async () => {
    // jsdom's real XMLHttpRequest would attempt an actual network call, which
    // is flaky/unavailable in CI. Swap in a minimal fake that mimics the
    // open/setRequestHeader/send/loadend contract our hook relies on.
    class FakeXMLHttpRequest extends EventTarget {
      status = 200;
      responseType = "";
      responseText = '{"ok":true}';
      private method = "";
      private url = "";

      open(method: string, url: string) {
        this.method = method;
        this.url = url;
      }

      setRequestHeader(_name: string, _value: string) {}

      getAllResponseHeaders() {
        return "content-type: application/json\r\n";
      }

      send() {
        queueMicrotask(() => this.dispatchEvent(new Event("loadend")));
      }
    }

    const OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = FakeXMLHttpRequest as unknown as typeof XMLHttpRequest;

    const { Recorder } = await import("../src/recorder");
    const recorder = new Recorder({ root: container });
    recorder.start();

    await new Promise<void>((resolve) => {
      const xhr = new window.XMLHttpRequest();
      xhr.open("GET", "https://example.com/api/ping");
      xhr.setRequestHeader("X-Test", "1");
      xhr.addEventListener("loadend", () => resolve());
      xhr.send();
    });

    const recording = recorder.stop();
    window.XMLHttpRequest = OriginalXHR;

    const requests = recording.events.filter((event) => event.type === "network-request");
    const responses = recording.events.filter((event) => event.type === "network-response");

    expect(requests.length).toBe(1);
    expect(requests[0].payload).toMatchObject({
      method: "GET",
      url: "https://example.com/api/ping",
      headers: { "X-Test": "1" },
    });
    expect(responses.length).toBe(1);
    expect(responses[0].payload).toMatchObject({
      requestId: requests[0].payload.requestId,
      status: 200,
      body: '{"ok":true}',
    });
  });
});
