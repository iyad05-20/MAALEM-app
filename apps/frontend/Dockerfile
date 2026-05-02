# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/frontend/package.json ./apps/frontend/
COPY shared/ ./shared/

# Install deps (optionalDependencies for rollup platform binaries)
RUN npm install --workspace=apps/frontend

COPY apps/frontend/ ./apps/frontend/

# Pass backend URL at build time
ARG VITE_BACKEND_URL=http://localhost:3000
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build --workspace=apps/frontend

# ── Stage 2: Serve with nginx ────────────────────────────────────
FROM nginx:alpine AS production

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# nginx config: serve SPA, proxy /api to backend
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
