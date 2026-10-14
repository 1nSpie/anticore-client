# syntax=docker/dockerfile:1

# ---- build ----
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# NEXT_PUBLIC_* и переменные статических страниц вшиваются в сборку —
# задавать при `docker build` (в CI — из GitHub Variables), а не на сервере.
ARG NEXT_PUBLIC_BACKEND_API_URL
ARG NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY
ARG NEXT_PUBLIC_S3_URL
ARG NEXT_PUBLIC_REACT_APP_YMAP_KEY
ARG SITE_LINK
ARG USE_YANDEX_METRICS=false
ENV NEXT_PUBLIC_BACKEND_API_URL=$NEXT_PUBLIC_BACKEND_API_URL \
    NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY=$NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY \
    NEXT_PUBLIC_S3_URL=$NEXT_PUBLIC_S3_URL \
    NEXT_PUBLIC_REACT_APP_YMAP_KEY=$NEXT_PUBLIC_REACT_APP_YMAP_KEY \
    SITE_LINK=$SITE_LINK \
    USE_YANDEX_METRICS=$USE_YANDEX_METRICS \
    NEXT_TELEMETRY_DISABLED=1

# Без адреса S3 все картинки сайта сломаются — лучше упасть при сборке
RUN test -n "$NEXT_PUBLIC_S3_URL" || (echo "ОШИБКА: NEXT_PUBLIC_S3_URL не задан (GitHub Variables)" >&2; exit 1)

COPY . .
RUN npm run build

# ---- runtime ----
FROM node:24-bookworm-slim
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
