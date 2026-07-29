export type DashboardStat = { label: string; value: string; tone?: "good" | "warn" | "bad" };
export type SignalPoint = { t: number; v: number; min?: number; max?: number };
export type TimelineEvent = { id: string; type: string; start_seconds: number; duration_seconds: number };

export function formatHours(hours: number | null | undefined): string {
  return typeof hours === "number" ? `${hours.toFixed(1)}h` : "—";
}
