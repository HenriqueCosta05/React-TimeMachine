import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act, createElement } from "react";
import { TimeMachineDevtools } from "../src/TimeMachineDevtools";

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

describe("TimeMachineDevtools", () => {
  it("renders only a closed toggle until clicked, then reveals recorder controls", () => {
    root = createRoot(container);
    act(() => {
      root.render(createElement(TimeMachineDevtools, { root: recordedRoot }));
    });

    const toggle = container.querySelector("button[aria-label='Toggle Time Machine devtools']");
    expect(toggle).not.toBeNull();
    expect(container.querySelector("button:not([aria-label])")).toBeNull();

    act(() => {
      (toggle as HTMLButtonElement).click();
    });

    expect(container.textContent).toContain("idle");
    expect(container.querySelector("button")).not.toBeNull();
  });

  it("records, stops, and shows a scrubber wired to the replay preview", async () => {
    root = createRoot(container);
    act(() => {
      root.render(createElement(TimeMachineDevtools, { root: recordedRoot }));
    });

    act(() => {
      (
        container.querySelector(
          "button[aria-label='Toggle Time Machine devtools']",
        ) as HTMLButtonElement
      ).click();
    });

    const findButton = (label: string) =>
      Array.from(container.querySelectorAll("button")).find((b) => b.textContent === label);

    act(() => {
      findButton("record")!.click();
    });

    const span = document.createElement("span");
    span.textContent = "hi";
    recordedRoot.appendChild(span);
    await act(async () => {
      await new Promise((resolve) => queueMicrotask(resolve));
    });

    act(() => {
      findButton("stop")!.click();
    });

    expect(container.textContent).toContain("stopped");
    const slider = container.querySelector("input[type='range']") as HTMLInputElement;
    expect(slider).not.toBeNull();
    expect(container.querySelector("span")?.textContent).toBeTruthy();
  });

  it("renders nothing when builtInUI is false", () => {
    root = createRoot(container);
    act(() => {
      root.render(createElement(TimeMachineDevtools, { root: recordedRoot, builtInUI: false }));
    });

    expect(container.innerHTML).toBe("");
  });
});
