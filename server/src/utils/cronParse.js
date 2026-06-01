import cronParser from 'cron-parser';

/** @param {string} expression cron schedule */
export const parseCron = (expression) => cronParser.parseExpression(expression);
