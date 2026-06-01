import { parseCron } from './cronParse.js';

/**
 * Validates a cron expression string.
 * Returns { valid: true } or { valid: false, message: '...' }
 */
export const validateCron = (expression) => {
  try {
    parseCron(expression);
    return { valid: true };
  } catch (err) {
    return { valid: false, message: err.message };
  }
};
