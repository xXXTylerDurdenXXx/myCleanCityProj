# Деплой фронтенда «Чистый город»

Бэкенд: `http://89.108.66.220:5000`  
Фронтенд: `http://89.108.66.220` (порт 80)

---

## Docker (одна команда) — рекомендуется

Бэкенд должен уже работать на хосте (порт 5000). Контейнер проксирует `/api`, `/supportChat`, `/reports`, `/uploads`, `/avatars` на него — **CORS не нужен**.

```bash
cd /var/www/myCleanCityProj
git pull

# Если порт 80 занят системным nginx:
sudo systemctl stop nginx

docker compose --env-file .env.docker up -d --build
```

Или: `npm run docker:up`

Проверка: `curl -I http://127.0.0.1` → `200 OK`  
Сайт: **http://89.108.66.220**

Остановить: `docker compose down`  
Логи: `docker compose logs -f web`

Другой порт (если 80 занят): `HTTP_PORT=8080 docker compose --env-file .env.docker up -d --build`

---

## Быстрый деплой без Docker (rsync)

Репозиторий: `/var/www/myCleanCityProj`  
Сайт отдаёт nginx из: `/var/www/mycleancity`

```bash
cd /var/www/myCleanCityProj
git pull
chmod +x deploy/deploy-local.sh
./deploy/deploy-local.sh
```

Скрипт соберёт проект и скопирует `dist/` в `/var/www/mycleancity`.

> **Важно:** `npm run build:prod` только создаёт папку `dist/` в репозитории.  
> Nginx смотрит на `/var/www/mycleancity` — без `rsync` сайт не обновится.

---

## Первичная настройка nginx (один раз)

```bash
cd /var/www/myCleanCityProj
sudo mkdir -p /var/www/mycleancity
sudo cp deploy/nginx.conf /etc/nginx/sites-available/mycleancity
sudo ln -sf /etc/nginx/sites-available/mycleancity /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## Проверка после деплоя

```bash
# Файлы на месте?
ls -la /var/www/mycleancity/

# Nginx отвечает?
curl -I http://127.0.0.1

# Статус nginx
sudo systemctl status nginx
```

Откройте в браузере: **http://89.108.66.220**

---

## Деплой с локального ПК

```bash
npm ci && npm run build:prod
scp -r dist/* root@89.108.66.220:/var/www/mycleancity/
```

Или: `./deploy/deploy.sh root@89.108.66.220` (сборка + rsync по SSH с ПК).

---

## Переменные окружения (`.env.production`)

| Переменная | Значение |
|---|---|
| `VITE_API_URL` | `http://89.108.66.220:5000/api` |
| `VITE_API_ORIGIN` | `http://89.108.66.220:5000` |
| `VITE_SIGNALR_URL` | `http://89.108.66.220:5000/supportChat` |

---

## CORS на бэкенде

Фронт (порт 80) и API (порт 5000) — разные origin. На бэкенде нужно:

- `Access-Control-Allow-Origin: http://89.108.66.220`
- `Access-Control-Allow-Credentials: true`

Без этого логин и запросы к API не будут работать.

## Альтернатива: nginx-прокси (без CORS)

В `deploy/nginx.conf` раскомментируйте блоки `/api/` и `/supportChat`,  
затем в `.env.production`:

```
VITE_API_URL=/api
VITE_API_ORIGIN=
VITE_SIGNALR_URL=/supportChat
```

Пересоберите: `./deploy/deploy-local.sh`
