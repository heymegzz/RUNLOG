/** Production Render API — used when VITE_API_URL is not set on Vercel */
export const PRODUCTION_API_BASE = 'https://runlog-1.onrender.com/api';

export const PRODUCTION_SOCKET_ORIGIN = 'https://runlog-1.onrender.com';

/**
 * API base URL for axios.
 * - Local dev: `/api` (Vite proxy → localhost:5005)
 * - Production: VITE_API_URL or Render fallback (never `/api` on Vercel — that causes 405)
 */
export const getApiBaseUrl = () => {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (import.meta.env.PROD) {
    return PRODUCTION_API_BASE;
  }

  return '/api';
};

export const getSocketOrigin = () => {
  const base = getApiBaseUrl();
  if (base.startsWith('http')) {
    return base.replace(/\/api\/?$/, '');
  }
  if (import.meta.env.PROD) {
    return PRODUCTION_SOCKET_ORIGIN;
  }
  return 'http://localhost:5005';
};
