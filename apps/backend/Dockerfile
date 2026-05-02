# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package for workspace resolution
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY shared/ ./shared/

# Install all deps (including devDeps for tsc)
RUN npm install --workspace=apps/backend

# Copy source and compile
COPY apps/backend/ ./apps/backend/
RUN npm run build --workspace=apps/backend

# ── Stage 2: Production ─────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY shared/ ./shared/

# Production deps only
RUN npm install --workspace=apps/backend --omit=dev

# Copy compiled output
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy category JSON data files (not compiled by tsc)
COPY apps/backend/src/data ./apps/backend/src/data

EXPOSE 3000

CMD ["node", "apps/backend/dist/server.js"]
