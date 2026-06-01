/** Extract a user-facing message from axios / API errors */
export const getApiErrorMessage = (err, fallback = 'Something went wrong') => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (err.error?.message) return err.error.message;
  if (err.message && err.message !== 'Network Error') return err.message;
  if (err.message === 'Network Error') {
    return 'Cannot reach the API. Start the server (port 5005) and try again.';
  }
  return fallback;
};
