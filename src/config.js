const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const API_URL = apiUrl;

export const API_ORIGIN = (
  import.meta.env.VITE_API_ORIGIN || apiUrl.replace(/\/api$/, '')
).replace(/\/$/, '');

export const SIGNALR_HUB_URL =
  import.meta.env.VITE_SIGNALR_URL || `${API_ORIGIN}/supportChat`;

/** Собирает полный URL для фото/файлов с бэкенда */
export function resolveMediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${normalized}`;
}
