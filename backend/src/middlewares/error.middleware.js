function notFoundHandler(_req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

function errorHandler(err, _req, res, _next) {
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ success: false, message });
}

module.exports = { notFoundHandler, errorHandler };
