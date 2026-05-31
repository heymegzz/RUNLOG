/**
 * Central error handler — catches anything that falls through.
 * Express recognises this as an error handler because it has 4 params.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  console.error('💥 Unhandled error:', err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Something went wrong'
          : err.message,
    },
  });
};

export default errorHandler;
