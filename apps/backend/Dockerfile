# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copy only package files for caching
COPY package.json package-lock.json* ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
COPY shared/package.json ./shared/

# 2. Install ALL dependencies (needed for tsc)
RUN npm install --workspace=apps/backend

# 3. Copy source and compile
COPY shared/ ./shared/
COPY apps/backend/ ./apps/backend/
RUN npm run build --workspace=apps/backend

# ── Stage 2: Production ─────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# 1. Copy only package files for caching production deps
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY shared/package.json ./shared/

# 2. Install production dependencies ONLY
RUN npm install --workspace=apps/backend --omit=dev

# 3. Copy compiled output and static assets
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY apps/backend/src/data ./apps/backend/src/data
COPY apps/backend/serviceAccount.json ./apps/backend/serviceAccount.json

EXPOSE 3000

CMD ["node", "apps/backend/dist/server.js"]
