function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err.code === "23505") {
    return res.status(409).json({ error: "A record with this value already exists" });
  }

  return res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
}

module.exports = { notFound, errorHandler };
