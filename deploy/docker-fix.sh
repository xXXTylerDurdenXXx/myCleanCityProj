#!/usr/bin/env bash
# Одноразовое исправление: убрать Podman из настроек Docker
set -euo pipefail

echo "==> Текущие настройки:"
echo "DOCKER_HOST=${DOCKER_HOST:-<не задан>}"
docker context ls 2>/dev/null || true

# Убрать из .bashrc root
BASHRC="/root/.bashrc"
if [[ -f "$BASHRC" ]] && grep -q 'podman.sock' "$BASHRC" 2>/dev/null; then
  echo "==> Удаляем DOCKER_HOST=podman из $BASHRC"
  sed -i '/podman\.sock/d' "$BASHRC"
  sed -i '/DOCKER_HOST.*podman/d' "$BASHRC"
fi

# Убрать из /etc/environment
if [[ -f /etc/environment ]] && grep -q 'podman.sock' /etc/environment 2>/dev/null; then
  echo "==> Удаляем DOCKER_HOST=podman из /etc/environment"
  sudo sed -i '/podman\.sock/d' /etc/environment
  sudo sed -i '/DOCKER_HOST.*podman/d' /etc/environment
fi

# Переключить context
unset DOCKER_HOST
export DOCKER_HOST=unix:///var/run/docker.sock
docker context use default 2>/dev/null || true

# Удалить podman context (опционально)
docker context rm podman -f 2>/dev/null || true

sudo systemctl enable --now docker

echo ""
echo "==> Проверка:"
docker info | head -5
echo ""
echo "Готово. Запускайте: ./deploy/docker-up.sh"
