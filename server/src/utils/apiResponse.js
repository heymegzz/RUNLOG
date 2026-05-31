/**
 * Standardised API response helpers.
 */

export const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

export const error = (res, code, message, statusCode = 400, field = null) => {
  return res.status(statusCode).json({
    success: false,
    error: { code, message, field },
  });
};
