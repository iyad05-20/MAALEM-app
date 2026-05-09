# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copy only package files for caching
COPY package.json package-lock.json* ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
COPY shared/package.json ./shared/

# 2. Install dependencies (Cached unless package.json changes)
RUN npm install --workspace=apps/frontend

# 3. Copy source files
COPY shared/ ./shared/
COPY apps/frontend/ ./apps/frontend/

# 4. Build the app
ARG VITE_BACKEND_URL=/api
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build --workspace=apps/frontend

# ── Stage 2: Serve with nginx ────────────────────────────────────
FROM nginx:alpine AS production

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
