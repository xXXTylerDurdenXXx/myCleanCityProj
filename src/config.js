const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const API_URL = apiUrl;

function resolveOrigin() {
  const envOrigin = import.meta.env.VITE_API_ORIGIN;
  if (envOrigin) return envOrigin.replace(/\/$/, '');
  if (apiUrl.startsWith('/')) {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }
  return apiUrl.replace(/\/api$/, '');
}

export const API_ORIGIN = resolveOrigin();

export const SIGNALR_HUB_URL = (() => {
  const url = import.meta.env.VITE_SIGNALR_URL;
  if (url) return url;
  return API_ORIGIN ? `${API_ORIGIN}/supportChat` : '/supportChat';
})();

/** Собирает полный URL для фото/файлов с бэкенда */
export function resolveMediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!API_ORIGIN) return normalized;
  return `${API_ORIGIN}${normalized}`;
}
