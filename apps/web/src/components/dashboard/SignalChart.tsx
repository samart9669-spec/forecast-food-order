import { useMemo, useState } from "react";
import type { SignalPoint } from "@/lib/dashboard";

export function SignalChart({ title, points, color = "#38bdf8" }: { title: string; points: SignalPoint[]; color?: string }) {
  const [domain, setDomain] = useState<[number, number] | null>(null);
  const visible = useMemo(() => domain ? points.filter((point) => point.t >= domain[0] && point.t <= domain[1]) : points, [domain, points]);
  const bounds = useMemo(() => {
    const values = visible.flatMap((point) => [point.min ?? point.v, point.max ?? point.v]);
    return { min: Math.min(...values, 0), max: Math.max(...values, 1) };
  }, [visible]);
  const path = visible.map((point, index) => {
    const x = visible.length <= 1 ? 0 : (index / (visible.length - 1)) * 1000;
    const y = 240 - ((point.v - bounds.min) / Math.max(0.001, bounds.max - bounds.min)) * 220;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return <section className="rounded-2xl border border-border bg-background/80 p-5"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">{title}</h3><button className="text-sm text-primary" onClick={() => setDomain(null)}>Reset zoom</button></div><svg viewBox="0 0 1000 260" className="h-64 w-full rounded-xl bg-slate-950/60" onDoubleClick={() => setDomain(null)} onClick={() => visible.length > 0 && setDomain([visible[0]?.t ?? 0, visible[Math.max(0, Math.floor(visible.length * 0.6))]?.t ?? 0])}><path d={path} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg><p className="mt-2 text-xs text-muted-foreground">Click to zoom, double-click or Reset zoom to restore. Charts share consistent time-based samples from downsampled API windows.</p></section>;
}
