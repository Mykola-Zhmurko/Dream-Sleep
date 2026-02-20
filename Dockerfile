# ── Stage 1: install dependencies ─────────────────────────────
FROM node:20-slim AS deps

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Stage 2: build server bundle ──────────────────────────────
FROM deps AS build

COPY . .
RUN pnpm run build

# ── Stage 3: production image ─────────────────────────────────
FROM node:20-slim AS runner

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app

# Copy only what's needed at runtime
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
