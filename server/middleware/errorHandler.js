export function notFound(_req, res) {
  res.status(404).json({ error: 'Route not found.' });
}

export function errorHandler(error, _req, res, _next) {
  const status = Number.isInteger(error.status) ? error.status : error.name === 'MulterError' ? 400 : 500;
  if (status >= 500) console.error(error);
  const message = status === 500 ? 'An unexpected server error occurred.' : error.name === 'MulterError' ? error.message : error.message;
  res.status(status).json({ error: message });
}
