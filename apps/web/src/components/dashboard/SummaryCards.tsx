import type { DashboardStat } from "@/lib/dashboard";

export function SummaryCards({ stats }: { stats: DashboardStat[] }) {
  return <div className="grid gap-4 md:grid-cols-4">{stats.map((stat) => <article key={stat.label} className="rounded-2xl border border-border bg-background/80 p-5 shadow-xl"><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-2 text-3xl font-bold">{stat.value}</p></article>)}</div>;
}
