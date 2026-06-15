# Деплой фронтенда «Чистый город»

Бэкенд: `http://89.108.66.220:5000`  
Фронтенд: `http://89.108.66.220` (Docker, порт 80)

---

## Docker — запуск одной командой

```bash
cd /var/www/myCleanCityProj
git pull
chmod +x deploy/docker-fix.sh deploy/docker-up.sh
./deploy/docker-fix.sh    # один раз, если docker лезет в Podman
./deploy/docker-up.sh
```

---

## Ошибка `Cannot connect to Docker daemon at podman.sock`

Команда `docker` настроена на **Podman**, а не на Docker.

**Причина:** в системе задано `DOCKER_HOST=unix:///run/podman/podman.sock`

**Исправление (на сервере):**

```bash
# 1. Найти, откуда берётся podman
echo $DOCKER_HOST
grep -r podman /root/.bashrc /etc/environment /etc/profile.d/ 2>/dev/null

# 2. Автоисправление
./deploy/docker-fix.sh

# 3. Запуск
./deploy/docker-up.sh
```

**Вручную:**

```bash
unset DOCKER_HOST
export DOCKER_HOST=unix:///var/run/docker.sock
docker context use default
docker context rm podman -f 2>/dev/null || true

sudo systemctl enable --now docker
sudo docker info          # Server: без ошибок
sudo systemctl stop nginx
sudo docker compose --env-file .env.docker up -d --build
```

> Используйте `sudo docker compose` — у root может быть свой DOCKER_HOST в .bashrc.

---

## Полезные команды

```bash
sudo docker compose ps
sudo docker compose logs -f web
sudo docker compose down
sudo docker compose --env-file .env.docker up -d --build   # пересборка
```

---

## Альтернатива: nginx без Docker

```bash
./deploy/deploy-local.sh
```

---

## Переменные (`.env.docker`)

| Переменная | Значение |
|---|---|
| `VITE_API_URL` | `/api` |
| `VITE_SIGNALR_URL` | `/supportChat` |
| `HTTP_PORT` | `80` |

Nginx в контейнере проксирует `/api`, `/supportChat`, `/reports`, `/uploads`, `/avatars` на бэкенд `:5000`.
