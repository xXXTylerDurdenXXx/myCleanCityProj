#!/usr/bin/env bash
# Запуск через настоящий Docker (не Podman)
# Использование: ./deploy/docker-up.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Диагностика Docker..."

# Podman подменяет Docker через переменную окружения
if [[ "${DOCKER_HOST:-}" == *podman* ]]; then
  echo "    DOCKER_HOST указывает на Podman — сбрасываем"
  unset DOCKER_HOST
fi

export DOCKER_HOST=unix:///var/run/docker.sock

# Переключить context с podman на default
if docker context ls 2>/dev/null | grep -q 'podman.*\*'; then
  echo "    Переключаем docker context: podman → default"
  docker context use default
fi

echo "==> Запуск Docker daemon..."
sudo systemctl enable --now docker

if ! sudo docker info >/dev/null 2>&1; then
  echo "ОШИБКА: Docker daemon не отвечает."
  echo "Проверьте: sudo systemctl status docker"
  exit 1
fi

echo "==> Остановка системного nginx (освободить порт 80)..."
sudo systemctl stop nginx 2>/dev/null || true

echo "==> Сборка и запуск контейнера..."
sudo -E docker compose --env-file .env.docker up -d --build

echo ""
echo "==> Готово!"
sudo docker compose ps
echo "Сайт: http://89.108.66.220"
echo ""
echo "Если снова лезет в Podman после перелогина, удалите из ~/.bashrc:"
echo "  export DOCKER_HOST=unix:///run/podman/podman.sock"
