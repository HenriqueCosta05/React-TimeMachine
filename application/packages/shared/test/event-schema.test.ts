import { describe, expect, it } from "vitest";
import { createRecording, EVENT_SCHEMA_VERSION, isSupportedSchemaVersion } from "../src/event-schema";
import type { StateDiffEvent } from "../src/event-schema";

describe("event-schema", () => {
  it("stamps new recordings with the current schema version", () => {
    const event: StateDiffEvent = {
      timestamp: 0,
      type: "state-diff",
      payload: {
        componentId: "1:App",
        componentName: "App",
        changedProps: {},
        changedState: { count: 1 },
      },
    };

    const recording = createRecording([event]);

    expect(recording.schemaVersion).toBe(EVENT_SCHEMA_VERSION);
    expect(recording.events).toEqual([event]);
    expect(isSupportedSchemaVersion(recording)).toBe(true);
  });

  it("flags recordings from a future schema version as unsupported", () => {
    const recording = createRecording([]);
    recording.schemaVersion = EVENT_SCHEMA_VERSION + 1;

    expect(isSupportedSchemaVersion(recording)).toBe(false);
  });
});
