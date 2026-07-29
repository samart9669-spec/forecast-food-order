import { describe, expect, it } from "vitest";
import { calculateStatistics, parseEventMarkers, percentile } from "../index";

describe("statistics", () => {
  it("computes percentile and AHI", () => {
    expect(percentile([1, 2, 3, 4, 5], 95)).toBe(5);
    const stats = calculateStatistics({ durationSeconds: 7200, events: [{ type: "OA", startSeconds: 10, durationSeconds: 12 }, { type: "H", startSeconds: 50, durationSeconds: 10 }], leak: [1, 2, 10], pressure: [8, 9, 12] });
    expect(stats.ahi).toBe(1);
    expect(stats.leak95).toBe(10);
  });

  it("parses event markers", () => {
    expect(parseEventMarkers("OA 10 12; RERA 20 5").map((event) => event.type)).toEqual(["OA", "RERA"]);
  });
});
