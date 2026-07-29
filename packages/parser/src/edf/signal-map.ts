export type NormalizedSignalName = "FLOW" | "MASK_PRESSURE" | "PRESSURE" | "LEAK" | "RESPIRATORY_RATE" | "MINUTE_VENTILATION" | "TIDAL_VOLUME" | "SNORE" | "FLOW_LIMITATION" | "EVENTS" | "UNKNOWN";

export type EdfSignalDefinition = { index: number; label: string; normalizedName: NormalizedSignalName; unit: string; physicalMinimum: number; physicalMaximum: number; digitalMinimum: number; digitalMaximum: number; samplesPerRecord: number; sampleRate: number };

const patterns: Array<[NormalizedSignalName, RegExp]> = [
  ["FLOW", /^(flow|flow\s*rate|resp\.?.*flow)$/i],
  ["MASK_PRESSURE", /mask\s*pressure|mask\s*press/i],
  ["PRESSURE", /^(pressure|therapy\s*pressure|press)$/i],
  ["LEAK", /leak|leak\s*rate/i],
  ["RESPIRATORY_RATE", /resp(iratory)?\s*rate|breath\s*rate/i],
  ["MINUTE_VENTILATION", /minute\s*vent|min\s*vent|ventilation/i],
  ["TIDAL_VOLUME", /tidal\s*volume|tidal\s*vol|\btv\b/i],
  ["SNORE", /snore/i],
  ["FLOW_LIMITATION", /flow\s*limitation|flow\s*limit|\bfl\b/i],
  ["EVENTS", /event|marker|annotation/i],
];

export function normalizeSignalName(label: string): NormalizedSignalName {
  const cleaned = label.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return patterns.find(([, pattern]) => pattern.test(cleaned))?.[0] ?? "UNKNOWN";
}

export function mapSignals(signals: Omit<EdfSignalDefinition, "normalizedName">[]): EdfSignalDefinition[] {
  return signals.map((signal) => ({ ...signal, normalizedName: normalizeSignalName(signal.label) }));
}
