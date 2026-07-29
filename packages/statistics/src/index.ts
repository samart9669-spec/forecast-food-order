export type EventType = "OA" | "CA" | "H" | "RERA" | "FL" | "CSR" | "LL";
export type SleepEvent = { type: EventType; startSeconds: number; durationSeconds: number; source?: string };
export type StatisticsInput = { durationSeconds: number; leak?: ArrayLike<number>; pressure?: ArrayLike<number>; minuteVentilation?: ArrayLike<number>; respiratoryRate?: ArrayLike<number>; snore?: ArrayLike<number>; flowLimitation?: ArrayLike<number>; events?: SleepEvent[] };
export type SessionStatistics = { ahi: number; ca: number; oa: number; h: number; rera: number; leakMedian: number | null; leak95: number | null; pressureMedian: number | null; pressure95: number | null; usageHours: number; minuteVentilationAverage: number | null; respiratoryRateAverage: number | null; snoreIndex: number; flowLimitationIndex: number; maskOnOff: number };

export function percentile(values: ArrayLike<number> | undefined, p: number): number | null {
  if (!values || values.length === 0) return null;
  const finite = Array.from(values).filter(Number.isFinite).sort((a, b) => a - b);
  if (finite.length === 0) return null;
  const index = Math.min(finite.length - 1, Math.max(0, Math.ceil((p / 100) * finite.length) - 1));
  return finite[index] ?? null;
}

export function average(values: ArrayLike<number> | undefined): number | null {
  if (!values || values.length === 0) return null;
  let total = 0; let count = 0;
  for (let index = 0; index < values.length; index += 1) { const value = values[index]; if (typeof value === "number" && Number.isFinite(value)) { total += value; count += 1; } }
  return count === 0 ? null : total / count;
}

export function eventIndex(events: SleepEvent[] | undefined, type: EventType, hours: number): number {
  if (!events || hours <= 0) return 0;
  return events.filter((event) => event.type === type).length / hours;
}

export function calculateStatistics(input: StatisticsInput): SessionStatistics {
  const events = input.events ?? [];
  const usageHours = Math.max(0, input.durationSeconds / 3600);
  const count = (type: EventType) => events.filter((event) => event.type === type).length;
  const apneaHypopneaEvents = count("OA") + count("CA") + count("H");
  const maskOnOff = events.filter((event) => event.type === "LL" || event.source === "mask").length;
  return { ahi: usageHours > 0 ? apneaHypopneaEvents / usageHours : 0, ca: count("CA"), oa: count("OA"), h: count("H"), rera: count("RERA"), leakMedian: percentile(input.leak, 50), leak95: percentile(input.leak, 95), pressureMedian: percentile(input.pressure, 50), pressure95: percentile(input.pressure, 95), usageHours, minuteVentilationAverage: average(input.minuteVentilation), respiratoryRateAverage: average(input.respiratoryRate), snoreIndex: eventIndex(events, "FL", usageHours) + ((average(input.snore) ?? 0) > 0 ? (average(input.snore) ?? 0) : 0), flowLimitationIndex: eventIndex(events, "FL", usageHours) + (average(input.flowLimitation) ?? 0), maskOnOff };
}

export function parseEventMarkers(markers: string, source = "edf"): SleepEvent[] {
  const eventPattern = /\b(OA|CA|H|RERA|FL|CSR|LL)\b[^\d]*(\d+(?:\.\d+)?)?[^\d]*(\d+(?:\.\d+)?)?/gi;
  const events: SleepEvent[] = [];
  for (const match of markers.matchAll(eventPattern)) {
    const type = match[1]?.toUpperCase() as EventType | undefined;
    if (!type) continue;
    events.push({ type, startSeconds: Number.parseFloat(match[2] ?? "0") || 0, durationSeconds: Number.parseFloat(match[3] ?? "0") || 0, source });
  }
  return events;
}
