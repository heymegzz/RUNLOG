import { CronExpressionParser } from 'cron-parser';

/**
 * Validates a cron expression string.
 * Returns { valid: true } or { valid: false, message: '...' }
 */
export const validateCron = (expression) => {
  try {
    CronExpressionParser.parse(expression);
    return { valid: true };
  } catch (err) {
    return { valid: false, message: err.message };
  }
};
