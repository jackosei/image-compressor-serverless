module.exports = async (req, res) => {
  // Set CORS headers - restrict to frontend origin
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Health check response
  res.status(200).json({
    status: "ok",
    message: "Image Compressor API is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      compress: "/api/compress",
      compressBatch: "/api/compress-batch",
      health: "/api/health",
    },
  });
};
