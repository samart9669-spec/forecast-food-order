import { Activity, HardDrive, Moon, UploadCloud } from "lucide-react";
import { useState } from "react";
import { EventTimeline } from "@/components/dashboard/EventTimeline";
import { SignalChart } from "@/components/dashboard/SignalChart";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type ScanFile = { file: File; path: string };

function demoWave(points: number, frequency: number, baseline: number) {
  return Array.from({ length: points }, (_, index) => ({
    t: index * 30,
    v: baseline + Math.sin(index * frequency) * (baseline > 1 ? 1.8 : 0.08) + Math.cos(index * frequency * 0.37) * 0.3,
  }));
}

async function scanDirectory(dir: FileSystemDirectoryHandle, prefix = ""): Promise<ScanFile[]> {
  const files: ScanFile[] = [];

  for await (const [name, handle] of dir.entries()) {
    const path = prefix ? `${prefix}/${name}` : name;

    if (handle.kind === "file") {
      const file = await handle.getFile();
      files.push({ file, path });
    } else {
      files.push(...(await scanDirectory(handle, path)));
    }
  }

  return files;
}

async function uploadFiles(files: ScanFile[], onProgress: (value: number) => void) {
  let done = 0;

  for (const item of files) {
    const form = new FormData();
    form.append("file", item.file, item.path);
    form.append("path", item.path);

    const response = await fetch("/api/uploads", { method: "POST", body: form });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Upload failed for ${item.path}`);
    }

    done += 1;
    onProgress(Math.round((done / files.length) * 100));
  }
}

export function Dashboard() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Ready to import CPAP SD card data.");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setUploading] = useState(false);

  async function importSdCard() {
    setError(null);
    setProgress(0);

    try {
      if (!("showDirectoryPicker" in window) || !window.showDirectoryPicker) {
        throw new Error(
          "Your browser does not support the File System Access API. Use Chrome or Edge.",
        );
      }

      const directory = await window.showDirectoryPicker({ mode: "read" });
      setStatus("Scanning SD card recursively...");
      const files = await scanDirectory(directory);

      if (files.length === 0) {
        throw new Error("No files found in the selected directory.");
      }

      setStatus(`Uploading ${files.length} files...`);
      setUploading(true);
      await uploadFiles(files, setProgress);
      setStatus(`Import complete. Uploaded ${files.length} files.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown import error");
      setStatus("Import failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#0f3d5a,transparent_32rem)]">
      <div className="mx-auto flex max-w-6xl gap-6 p-6">
        <aside className="hidden w-64 rounded-2xl border border-border bg-background/70 p-6 md:block">
          <div className="flex items-center gap-3 text-xl font-semibold">
            <Moon className="text-primary" />
            SleepHQ Clone
          </div>
          <nav className="mt-10 space-y-2 text-muted-foreground">
            <a className="block rounded-lg bg-muted px-3 py-2 text-foreground">Dashboard</a>
            <a className="block px-3 py-2">Imports</a>
            <a className="block px-3 py-2">Reports</a>
          </nav>
        </aside>

        <section className="flex-1 space-y-6">
          <header className="rounded-2xl border border-border bg-background/70 p-8">
            <p className="text-sm uppercase tracking-widest text-primary">Phase 3</p>
            <h1 className="mt-2 text-4xl font-bold">Sleep therapy dashboard</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Import SD cards, decode EDF waveforms, cache statistics, and review SleepHQ-style
              timelines with synchronized pressure, leak, flow, ventilation, respiratory-rate,
              snore, and flow-limitation charts.
            </p>
          </header>


          <SummaryCards
            stats={[
              { label: "Usage", value: "7.6h" },
              { label: "AHI", value: "1.8" },
              { label: "Leak 95%", value: "18 L/min" },
              { label: "Pressure 95%", value: "11.4 cmH₂O" },
            ]}
          />

          <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
            <div className="space-y-6">
              <SignalChart title="Flow Rate" points={demoWave(900, 0.06, 0)} color="#38bdf8" />
              <SignalChart title="Pressure" points={demoWave(600, 0.012, 8)} color="#a78bfa" />
              <SignalChart title="Leak Rate" points={demoWave(600, 0.02, 6)} color="#fb7185" />
              <SignalChart title="Minute Ventilation" points={demoWave(500, 0.018, 7)} color="#34d399" />
              <SignalChart title="Respiratory Rate" points={demoWave(500, 0.03, 14)} color="#fbbf24" />
              <SignalChart title="Flow Limitation" points={demoWave(500, 0.04, 0.05)} color="#f97316" />
              <SignalChart title="Snore" points={demoWave(500, 0.05, 0.02)} color="#22d3ee" />
            </div>
            <aside className="space-y-6">
              <section className="rounded-2xl border border-border bg-background/80 p-5">
                <div className="flex items-center gap-2 text-lg font-semibold"><Activity className="text-primary" /> Compliance</div>
                <p className="mt-3 text-sm text-muted-foreground">Statistics are cached by source fingerprint and invalidated only when uploaded EDF files change.</p>
              </section>
              <EventTimeline durationSeconds={28800} events={[{ id: "1", type: "OA", start_seconds: 3400, duration_seconds: 12 }, { id: "2", type: "H", start_seconds: 12800, duration_seconds: 18 }, { id: "3", type: "RERA", start_seconds: 21800, duration_seconds: 10 }]} />
            </aside>
          </div>

          <div className="rounded-2xl border border-border bg-background/80 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">SD Card Import</h2>
                <p className="text-muted-foreground">{status}</p>
              </div>
              <HardDrive className="h-10 w-10 text-primary" />
            </div>

            <Button onClick={importSdCard} disabled={isUploading} className="gap-2">
              <UploadCloud className="h-4 w-4" />
              Import SD Card
            </Button>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
