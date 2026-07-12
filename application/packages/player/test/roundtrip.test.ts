import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Player } from "../src/player";

let sourceContainer: HTMLDivElement;
let replayContainer: HTMLDivElement;

beforeEach(() => {
  sourceContainer = document.createElement("div");
  replayContainer = document.createElement("div");
  document.body.append(sourceContainer, replayContainer);
  delete window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  vi.resetModules();
});

afterEach(() => {
  sourceContainer.remove();
  replayContainer.remove();
});

describe("record then replay", () => {
  it("reproduces the final DOM of a scripted interaction", async () => {
    const { Recorder } = await import("@react-debugmachine/recorder");
    const recorder = new Recorder({ root: sourceContainer });
    recorder.start();

    const list = document.createElement("ul");
    sourceContainer.appendChild(list);
    const item1 = document.createElement("li");
    item1.textContent = "first";
    list.appendChild(item1);
    const item2 = document.createElement("li");
    item2.textContent = "second";
    list.appendChild(item2);
    item1.setAttribute("data-done", "true");

    // MutationObserver callbacks run as microtasks; flush before stopping so
    // every mutation above lands in the recording.
    await new Promise((resolve) => queueMicrotask(resolve));

    const recording = recorder.stop();

    const player = new Player(recording);
    player.seekTo(replayContainer, player.durationMs);

    expect(replayContainer.innerHTML).toBe(sourceContainer.innerHTML);
  });

  it("is deterministic across repeated seeks to the same timestamp", async () => {
    const { Recorder } = await import("@react-debugmachine/recorder");
    const recorder = new Recorder({ root: sourceContainer });
    recorder.start();

    const span = document.createElement("span");
    span.textContent = "hello";
    sourceContainer.appendChild(span);
    await new Promise((resolve) => queueMicrotask(resolve));

    const recording = recorder.stop();
    const player = new Player(recording);

    player.seekTo(replayContainer, player.durationMs);
    const firstPass = replayContainer.innerHTML;
    player.seekTo(replayContainer, 0);
    player.seekTo(replayContainer, player.durationMs);
    const secondPass = replayContainer.innerHTML;

    expect(secondPass).toBe(firstPass);
  });

  it("replays a characterData mutation on the second of two adjacent text nodes", async () => {
    // Mirrors how React renders `<p>count: {count}</p>`: a static text node
    // ("count: ") immediately followed by a separate dynamic text node ("0").
    // Serializing the baseline as an HTML string would let the parser merge
    // them into one node on replay, desyncing every path recorded against
    // the original two-node structure — this is a regression test for that.
    const { Recorder } = await import("@react-debugmachine/recorder");
    const recorder = new Recorder({ root: sourceContainer });
    recorder.start();

    const p = document.createElement("p");
    sourceContainer.appendChild(p);
    const staticText = document.createTextNode("count: ");
    const dynamicText = document.createTextNode("0");
    p.appendChild(staticText);
    p.appendChild(dynamicText);
    await new Promise((resolve) => queueMicrotask(resolve));

    dynamicText.data = "1";
    await new Promise((resolve) => queueMicrotask(resolve));

    const recording = recorder.stop();
    const player = new Player(recording);
    player.seekTo(replayContainer, player.durationMs);

    expect(replayContainer.textContent).toBe("count: 1");
  });
});
