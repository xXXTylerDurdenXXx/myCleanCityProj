# Деплой фронтенда «Чистый город»

Бэкенд: `http://89.108.66.220:5000`  
Фронтенд: `http://89.108.66.220` (nginx, порт 80)

## 1. Сборка на своём ПК

```bash
npm ci
npm run build:prod
```

Артефакты появятся в папке `dist/`.

Переменные production заданы в `.env.production`:

| Переменная | Значение |
|---|---|
| `VITE_API_URL` | `http://89.108.66.220:5000/api` |
| `VITE_API_ORIGIN` | `http://89.108.66.220:5000` |
| `VITE_SIGNALR_URL` | `http://89.108.66.220:5000/supportChat` |

## 2. Первичная настройка сервера (один раз)

```bash
# На сервере
sudo apt update && sudo apt install -y nginx

sudo mkdir -p /var/www/mycleancity
sudo cp deploy/nginx.conf /etc/nginx/sites-available/mycleancity
sudo ln -sf /etc/nginx/sites-available/mycleancity /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 3. Загрузка сборки

**Вариант A — скрипт (Linux/macOS/Git Bash):**

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh root@89.108.66.220
```

**Вариант B — вручную:**

```bash
scp -r dist/* root@89.108.66.220:/var/www/mycleancity/
```

**Вариант C — сборка прямо на сервере:**

```bash
ssh root@89.108.66.220
git clone <repo-url> /opt/mycleancity && cd /opt/mycleancity
npm ci && npm run build:prod
sudo rsync -a dist/ /var/www/mycleancity/
```

## 4. Проверка

Откройте `http://89.108.66.220` — должна открыться страница входа.

## CORS на бэкенде

Фронт и API на разных портах (80 и 5000). Убедитесь, что бэкенд разрешает:

- `Access-Control-Allow-Origin: http://89.108.66.220`
- `Access-Control-Allow-Credentials: true`

## Альтернатива: nginx-прокси (без CORS)

В `deploy/nginx.conf` есть закомментированные блоки `/api/` и `/supportChat`.  
После их включения измените `.env.production`:

```
VITE_API_URL=/api
VITE_API_ORIGIN=
VITE_SIGNALR_URL=/supportChat
```

Пересоберите и залейте заново.
