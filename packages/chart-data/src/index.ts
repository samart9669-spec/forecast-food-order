export type ChartPoint = { t: number; v: number; min?: number; max?: number };
export type SeriesWindow = { startSeconds: number; endSeconds: number; maxPoints: number; sampleRate: number };

export function downsampleMinMax(samples: ArrayLike<number>, options: SeriesWindow): ChartPoint[] {
  const startIndex = Math.max(0, Math.floor(options.startSeconds * options.sampleRate));
  const endIndex = Math.min(samples.length, Math.ceil(options.endSeconds * options.sampleRate));
  const total = Math.max(0, endIndex - startIndex);
  if (total === 0) return [];
  const bucketSize = Math.max(1, Math.ceil(total / Math.max(1, options.maxPoints)));
  const points: ChartPoint[] = [];
  for (let index = startIndex; index < endIndex; index += bucketSize) {
    const bucketEnd = Math.min(endIndex, index + bucketSize);
    let min = Number.POSITIVE_INFINITY; let max = Number.NEGATIVE_INFINITY; let totalValue = 0; let count = 0;
    for (let cursor = index; cursor < bucketEnd; cursor += 1) { const value = samples[cursor]; if (typeof value === "number" && Number.isFinite(value)) { min = Math.min(min, value); max = Math.max(max, value); totalValue += value; count += 1; } }
    if (count > 0) points.push({ t: index / options.sampleRate, v: totalValue / count, min, max });
  }
  return points;
}

export function windowSamples(samples: ArrayLike<number>, sampleRate: number, startSeconds: number, endSeconds: number): Float32Array {
  const start = Math.max(0, Math.floor(startSeconds * sampleRate));
  const end = Math.min(samples.length, Math.ceil(endSeconds * sampleRate));
  const output = new Float32Array(Math.max(0, end - start));
  for (let index = 0; index < output.length; index += 1) output[index] = samples[start + index] ?? 0;
  return output;
}
