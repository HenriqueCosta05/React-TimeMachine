import {
  createRecording,
  type DomSnapshot,
  type Recording,
  type TimeMachineEvent,
} from "@react-time-machine/shared";
import { RecordingClock } from "./clock";
import { installDomObserver } from "./dom-observer";
import { nodeToSnapshot } from "./dom-snapshot";
import { installFiberHook } from "./fiber-hook";
import { installNetworkHook } from "./network-hook";

export interface RecorderOptions {
  /** DOM subtree to observe for mutations — typically the app's mount node. */
  root: Node;
}

/** Composes the state, DOM, and network hooks into one time-ordered event log. */
export class Recorder {
  private readonly clock = new RecordingClock();
  private readonly events: TimeMachineEvent[] = [];
  private readonly stopFns: Array<() => void> = [];
  private recording = false;
  private initialSnapshot: DomSnapshot[] = [];

  constructor(private readonly options: RecorderOptions) {}

  start(): void {
    if (this.recording) return;
    this.recording = true;
    this.initialSnapshot = Array.from(this.options.root.childNodes).map(nodeToSnapshot);

    this.stopFns.push(
      installFiberHook({
        clock: this.clock,
        onStateDiff: (payload, timestamp) => {
          this.events.push({ timestamp, type: "state-diff", payload });
        },
      }),
    );

    this.stopFns.push(
      installDomObserver({
        root: this.options.root,
        clock: this.clock,
        onMutation: (payload, timestamp) => {
          this.events.push({ timestamp, type: "dom-mutation", payload });
        },
      }),
    );

    this.stopFns.push(
      installNetworkHook({
        clock: this.clock,
        onRequest: (payload, timestamp) => {
          this.events.push({ timestamp, type: "network-request", payload });
        },
        onResponse: (payload, timestamp) => {
          this.events.push({ timestamp, type: "network-response", payload });
        },
      }),
    );
  }

  stop(): Recording {
    this.recording = false;
    while (this.stopFns.length > 0) this.stopFns.pop()?.();
    return createRecording(
      [...this.events].sort((a, b) => a.timestamp - b.timestamp),
      this.initialSnapshot,
    );
  }
}
