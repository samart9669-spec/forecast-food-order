FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY package.json pnpm-workspace.yaml turbo.json .prettierrc ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile=false
EXPOSE 5173 8787
CMD ["pnpm", "dev"]
