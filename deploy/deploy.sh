#!/usr/bin/env bash
# Сборка и выкладка на сервер 89.108.66.220
# Использование: ./deploy/deploy.sh [user@89.108.66.220]
set -euo pipefail

REMOTE="${1:-root@89.108.66.220}"
REMOTE_DIR="/var/www/mycleancity"

echo "==> Сборка production..."
npm ci
npm run build:prod

echo "==> Загрузка на ${REMOTE}:${REMOTE_DIR}..."
ssh "$REMOTE" "mkdir -p ${REMOTE_DIR}"
rsync -avz --delete dist/ "${REMOTE}:${REMOTE_DIR}/"

echo "==> Готово. Откройте http://89.108.66.220"
