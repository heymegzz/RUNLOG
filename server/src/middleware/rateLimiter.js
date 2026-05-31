import rateLimit from 'express-rate-limit';

// Auth routes: stricter limit
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests, try again later' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests, try again later' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
