import { describe, expect, it } from "vitest";
import { normalizeSignalName } from "../edf/signal-map";

describe("normalizeSignalName", () => {
  it("maps ResMed labels", () => {
    expect(normalizeSignalName("Flow")).toBe("FLOW");
    expect(normalizeSignalName("Mask Pressure")).toBe("MASK_PRESSURE");
    expect(normalizeSignalName("Leak")).toBe("LEAK");
  });
});
