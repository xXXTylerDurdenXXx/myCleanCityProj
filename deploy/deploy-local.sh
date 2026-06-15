#!/usr/bin/env bash
# Сборка и выкладка на ЭТОМ сервере (без ssh/rsync)
# Использование из корня репозитория: ./deploy/deploy-local.sh
set -euo pipefail

WEB_ROOT="/var/www/mycleancity"

echo "==> Сборка production..."
npm ci
npm run build:prod

echo "==> Копирование в ${WEB_ROOT}..."
sudo mkdir -p "${WEB_ROOT}"
sudo rsync -a --delete dist/ "${WEB_ROOT}/"

echo "==> Готово. Откройте http://89.108.66.220"
