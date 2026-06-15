# ── Сборка фронтенда ──
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=/api
ARG VITE_API_ORIGIN=
ARG VITE_SIGNALR_URL=/supportChat

ENV VITE_API_URL=$VITE_API_URL \
    VITE_API_ORIGIN=$VITE_API_ORIGIN \
    VITE_SIGNALR_URL=$VITE_SIGNALR_URL

RUN npm run build

# ── Nginx ──
FROM nginx:1.28-alpine

COPY deploy/nginx.docker.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
