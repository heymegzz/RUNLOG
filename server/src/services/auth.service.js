// Auth service — token generation/validation logic
// Implement in Phase 1

import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

const refreshSecret = () =>
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

export const generateRefreshToken = (userId) => {
  const secret = refreshSecret();
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET or JWT_SECRET must be set');
  }
  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshSecret());
};
