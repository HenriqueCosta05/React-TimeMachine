import { describe, expect, it } from "vitest";
import { Player, Recorder, createRecording, isSupportedSchemaVersion } from "../src/index";

describe("package entry point", () => {
  it("re-exports the recorder, player, and shared schema", () => {
    expect(Recorder).toBeTypeOf("function");
    expect(Player).toBeTypeOf("function");
    expect(createRecording).toBeTypeOf("function");
    expect(isSupportedSchemaVersion).toBeTypeOf("function");
  });
});
