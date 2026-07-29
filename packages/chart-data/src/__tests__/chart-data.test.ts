import { describe, expect, it } from "vitest";
import { downsampleMinMax, windowSamples } from "../index";

describe("chart data", () => {
  it("windows and downsamples samples", () => {
    const samples = Float32Array.from({ length: 1000 }, (_, index) => index);
    expect(windowSamples(samples, 10, 1, 2)).toHaveLength(10);
    expect(downsampleMinMax(samples, { sampleRate: 10, startSeconds: 0, endSeconds: 100, maxPoints: 100 }).length).toBeLessThanOrEqual(100);
  });
});
