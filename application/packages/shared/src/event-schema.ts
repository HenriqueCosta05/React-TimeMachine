/** Bumped when the shape of `TimeMachineEvent` changes in a way that breaks old recordings. */
export const EVENT_SCHEMA_VERSION = 1;

export type EventType = "state-diff" | "dom-mutation" | "network-request" | "network-response";

interface BaseEvent {
  /** Monotonic ms timestamp from the recording's shared clock, not wall-clock time. */
  timestamp: number;
  type: EventType;
}

export interface StateDiffPayload {
  /** Fiber-assigned identity for the component instance, stable across re-renders. */
  componentId: string;
  componentName: string;
  changedProps: Record<string, unknown>;
  changedState: Record<string, unknown>;
}

export interface StateDiffEvent extends BaseEvent {
  type: "state-diff";
  payload: StateDiffPayload;
}

export type DomMutationKind = "childList" | "attributes" | "characterData";

/** Structural snapshot of a DOM (sub)tree — used instead of an HTML string so
 * replay can rebuild nodes with `createElement`/`createTextNode` directly.
 * Round-tripping through `innerHTML` would merge adjacent text nodes (e.g.
 * React's static `"count: "` text and its dynamic `{count}` text collapse
 * into one parsed node), which desyncs every `targetPath` recorded against
 * the original, unmerged DOM. */
export type DomSnapshot = ElementSnapshot | TextSnapshot;

export interface ElementSnapshot {
  kind: "element";
  tag: string;
  attributes: Record<string, string>;
  children: DomSnapshot[];
}

export interface TextSnapshot {
  kind: "text";
  text: string;
}

export interface DomMutationPayload {
  kind: DomMutationKind;
  /** Path of child indices from the recorded root to the mutated node. */
  targetPath: number[];
  attributeName?: string;
  oldValue?: string | null;
  newValue?: string | null;
  addedNodes?: DomSnapshot[];
  removedNodes?: DomSnapshot[];
  /** For `childList`: index of the target's child immediately before the
   * added/removed range, or null if the range started at the first child. */
  previousSiblingIndex?: number | null;
}

export interface DomMutationEvent extends BaseEvent {
  type: "dom-mutation";
  payload: DomMutationPayload;
}

export interface NetworkRequestPayload {
  requestId: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
}

export interface NetworkRequestEvent extends BaseEvent {
  type: "network-request";
  payload: NetworkRequestPayload;
}

export interface NetworkResponsePayload {
  requestId: string;
  status: number;
  headers: Record<string, string>;
  body: string | null;
  durationMs: number;
}

export interface NetworkResponseEvent extends BaseEvent {
  type: "network-response";
  payload: NetworkResponsePayload;
}

export type TimeMachineEvent =
  | StateDiffEvent
  | DomMutationEvent
  | NetworkRequestEvent
  | NetworkResponseEvent;

export interface Recording {
  schemaVersion: number;
  /** Structural snapshot of the recorded root's children at the moment
   * recording started — DOM mutations are captured relative to this
   * baseline, so replay needs it to reconstruct anything before the first
   * mutation event. */
  initialSnapshot: DomSnapshot[];
  /** Events in the order they were captured; replay assumes this ordering. */
  events: TimeMachineEvent[];
}

export function createRecording(
  events: TimeMachineEvent[],
  initialSnapshot: DomSnapshot[] = [],
): Recording {
  return { schemaVersion: EVENT_SCHEMA_VERSION, initialSnapshot, events };
}

export function isSupportedSchemaVersion(recording: Recording): boolean {
  return recording.schemaVersion === EVENT_SCHEMA_VERSION;
}
