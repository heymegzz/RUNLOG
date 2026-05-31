import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Generate a random API key, return the raw key + bcrypt hash.
 * Raw key is shown ONCE at creation time and never stored.
 */
export const generateApiKey = async () => {
  const rawKey = `rl_${crypto.randomBytes(32).toString('hex')}`;
  const keyHash = await bcrypt.hash(rawKey, 10);
  const keyPrefix = rawKey.slice(0, 11); // "rl_" + first 8 hex chars

  return { rawKey, keyHash, keyPrefix };
};

/**
 * Compare a raw key against its bcrypt hash.
 */
export const compareApiKey = async (rawKey, hash) => {
  return bcrypt.compare(rawKey, hash);
};
