# SleepHQ Clone

A production-ready Phase 1 monorepo for importing CPAP SD card data into a Cloudflare-native stack.

## Stack

- Turborepo + pnpm workspaces
- React 19, Vite, TypeScript, TailwindCSS, shadcn/ui-style primitives
- React Router and TanStack Query
- Cloudflare Workers, Hono, D1, R2, Wrangler v4
- Vitest, ESLint, Prettier

## Structure

```text
apps/web      React dashboard and SD card importer
apps/api      Hono Cloudflare Worker, D1 migrations, R2 upload API
packages/*    Shared TypeScript and ESLint configuration
```

## Phase 1 Features

- Dashboard shell with import card and progress bar.
- `Import SD Card` button using `showDirectoryPicker`.
- Recursive File System Access API directory scanner.
- Multipart upload API at `POST /api/uploads`.
- Worker streams each `File` body directly to R2.
- Upload metadata is stored in D1.
- User-visible browser and upload error handling.

## Local Development

```bash
pnpm install
pnpm --filter @sleephq-clone/api db:migrate:local
pnpm dev
```

The Vite app proxies `/api/*` requests to the Worker at `http://localhost:8787`.

## Cloudflare Setup

1. Create resources:
   ```bash
   wrangler d1 create sleephq_clone
   wrangler r2 bucket create sleephq-clone-uploads
   wrangler r2 bucket create sleephq-clone-uploads-preview
   ```
2. Replace the placeholder `database_id` in `apps/api/wrangler.toml`.
3. Apply migrations:
   ```bash
   pnpm --filter @sleephq-clone/api db:migrate
   ```
4. Deploy:
   ```bash
   pnpm --filter @sleephq-clone/api deploy
   ```

## Docker

```bash
docker build -t sleephq-clone .
docker run --rm -p 5173:5173 -p 8787:8787 sleephq-clone
```

## Phase 3: waveform dashboard architecture

Phase 3 adds production-oriented EDF waveform decoding, signal normalization, cached statistics, and SleepHQ-style dashboard primitives.

### Signal decoding

`@sleephq-clone/parser` reads EDF headers and exposes a lazy `EdfSignalReader`. The reader calculates byte offsets per data record, decodes signed 16-bit digital samples, scales them into physical units, and can read a single normalized signal over a bounded record window. This avoids loading unrelated channels and supports files with multi-million sample counts.

ResMed labels are normalized in `packages/parser/src/edf/signal-map.ts` so device-specific names such as `Flow`, `Mask Pressure`, and `Leak` map into stable application names including `FLOW`, `MASK_PRESSURE`, `PRESSURE`, `LEAK`, `RESPIRATORY_RATE`, `MINUTE_VENTILATION`, `TIDAL_VOLUME`, `SNORE`, and `FLOW_LIMITATION`.

### Statistics engine

`@sleephq-clone/statistics` provides reusable calculation functions for AHI, event counts, leak and pressure medians/95th percentiles, usage hours, minute ventilation average, respiratory-rate average, snore index, flow-limitation index, and mask on/off counts. Event marker parsing recognizes `OA`, `CA`, `H`, `RERA`, `FL`, `CSR`, and `LL` markers.

### Dashboard API

The API exposes:

- `GET /api/dashboard` for recent nights.
- `GET /api/dashboard/:session` for session metadata plus cached statistics.
- `GET /api/signals/:session` for windowed signal-cache metadata with `signal`, `start`, `end`, and `maxPoints` query parameters.
- `GET /api/events/:session` for ordered event markers.
- `GET /api/statistics/:session` for cached statistics.

Responses are JSON and are suitable for Cloudflare compression at the edge.

### Performance strategy

Decoded signal windows are stored in `signal_cache` and keyed by source upload metadata so the application does not decode EDF data repeatedly. Statistics are cached in `statistics` with a source fingerprint and should only be invalidated when underlying uploaded files change. Chart data uses min/max downsampling and explicit time windows to keep rendering stable for sessions longer than 12 hours.

### Dashboard UI

The React dashboard now includes summary cards, compliance context, an event timeline, and reusable SVG charts for flow, pressure, leak, minute ventilation, respiratory rate, flow limitation, and snore. The chart components include resettable zoom interactions and are structured for synchronized cursor, brush, pan, and tooltip enhancements as API-backed samples are connected.
