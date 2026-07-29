import type { TimelineEvent } from "@/lib/dashboard";

export function EventTimeline({ events, durationSeconds }: { events: TimelineEvent[]; durationSeconds: number }) {
  return <section className="rounded-2xl border border-border bg-background/80 p-5"><h3 className="font-semibold">Night timeline</h3><div className="relative mt-4 h-20 rounded-xl bg-slate-950/70">{events.map((event) => <span key={event.id} title={`${event.type} ${event.start_seconds}s`} className="absolute top-3 h-14 rounded bg-primary/80 px-1 text-[10px] text-primary-foreground" style={{ left: `${Math.min(99, (event.start_seconds / Math.max(1, durationSeconds)) * 100)}%` }}>{event.type}</span>)}</div></section>;
}
