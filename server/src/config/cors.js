/** Production frontend (Vercel). Override with CLIENT_URL env if you add a custom domain. */
export const PRODUCTION_FRONTEND_URL = 'https://runlog-eta.vercel.app';

/** Production API (Render). */
export const PRODUCTION_API_URL = 'https://runlog-1.onrender.com';

export const getAllowedOrigins = () => {
  const origins = new Set([
    'http://localhost:5173',
    'http://localhost:8080',
    PRODUCTION_FRONTEND_URL,
  ]);
  if (process.env.CLIENT_URL) {
    origins.add(process.env.CLIENT_URL.replace(/\/$/, ''));
  }
  return [...origins];
};

export const corsOrigin = (origin, callback) => {
  if (!origin) {
    callback(null, true);
    return;
  }
  const allowed = getAllowedOrigins();
  if (allowed.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error(`CORS blocked origin: ${origin}`));
  }
};
