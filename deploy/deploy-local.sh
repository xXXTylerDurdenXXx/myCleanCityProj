#!/usr/bin/env bash
# Сборка и выкладка на ЭТОМ сервере (системный nginx, без Docker)
# Использование: ./deploy/deploy-local.sh
set -euo pipefail

WEB_ROOT="/var/www/mycleancity"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Сборка (nginx + прокси на :5000)..."
npm ci
npm run build:nginx

echo "==> Копирование в ${WEB_ROOT}..."
sudo mkdir -p "${WEB_ROOT}"
sudo rsync -a --delete dist/ "${WEB_ROOT}/"

echo "==> Обновление nginx..."
sudo cp "${SCRIPT_DIR}/nginx.conf" /etc/nginx/sites-available/mycleancity
sudo ln -sf /etc/nginx/sites-available/mycleancity /etc/nginx/sites-enabled/mycleancity
sudo nginx -t && sudo systemctl reload nginx

echo "==> Готово. Откройте http://89.108.66.220"
