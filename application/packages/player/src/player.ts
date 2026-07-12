import type {
  DomMutationEvent,
  NetworkRequestEvent,
  NetworkResponseEvent,
  Recording,
  StateDiffEvent,
} from "@henriquecosta/react-debugmachine-shared";
import { isSupportedSchemaVersion } from "@henriquecosta/react-debugmachine-shared";
import { replayDom } from "./dom-replay";

export interface NetworkExchange {
  request: NetworkRequestEvent["payload"];
  response: NetworkResponseEvent["payload"] | null;
}

/** Deterministic replay of a `Recording` against a DOM root. The same
 * `seekTo` timestamp always yields the same DOM, component state snapshot,
 * and network log — video-exporter drives this frame-by-frame; a scrubber UI
 * drives it on drag. */
export class Player {
  private readonly domMutations: Array<{ timestamp: number; payload: DomMutationEvent["payload"] }>;
  private readonly stateDiffs: StateDiffEvent[];
  private readonly networkRequests: NetworkRequestEvent[];
  private readonly networkResponses: NetworkResponseEvent[];

  constructor(private readonly recording: Recording) {
    if (!isSupportedSchemaVersion(recording)) {
      throw new Error(`Unsupported recording schema version: ${recording.schemaVersion}`);
    }

    this.domMutations = recording.events
      .filter((event): event is DomMutationEvent => event.type === "dom-mutation")
      .map((event) => ({ timestamp: event.timestamp, payload: event.payload }));
    this.stateDiffs = recording.events.filter(
      (event): event is StateDiffEvent => event.type === "state-diff",
    );
    this.networkRequests = recording.events.filter(
      (event): event is NetworkRequestEvent => event.type === "network-request",
    );
    this.networkResponses = recording.events.filter(
      (event): event is NetworkResponseEvent => event.type === "network-response",
    );
  }

  get durationMs(): number {
    return this.recording.events.at(-1)?.timestamp ?? 0;
  }

  /** Re-renders `root` to reflect the DOM as it was at `timestamp`. */
  seekTo(root: Element, timestamp: number): void {
    replayDom(root, this.recording.initialSnapshot, this.domMutations, timestamp);
  }

  /** Per-component state/props as of `timestamp`, merging every diff up to
   * that point — later diffs for the same component override earlier ones. */
  stateAt(timestamp: number): Map<string, Record<string, unknown>> {
    const state = new Map<string, Record<string, unknown>>();
    for (const event of this.stateDiffs) {
      if (event.timestamp > timestamp) break;
      const existing = state.get(event.payload.componentId) ?? {};
      state.set(event.payload.componentId, {
        ...existing,
        ...event.payload.changedProps,
        ...event.payload.changedState,
      });
    }
    return state;
  }

  /** Request/response pairs whose request was made at or before `timestamp`. */
  networkAt(timestamp: number): NetworkExchange[] {
    return this.networkRequests
      .filter((event) => event.timestamp <= timestamp)
      .map((request) => {
        const response = this.networkResponses.find(
          (candidate) =>
            candidate.payload.requestId === request.payload.requestId &&
            candidate.timestamp <= timestamp,
        );
        return { request: request.payload, response: response?.payload ?? null };
      });
  }
}
