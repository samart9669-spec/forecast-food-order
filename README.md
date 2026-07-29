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
