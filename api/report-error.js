const { notifyError } = require("./_utils/errorNotifier");

module.exports = async (req, res) => {
  // Set CORS headers
  const allowedOrigin = process.env.ALLOW_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, source, context } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Missing error message." });
    }

    await notifyError({
      endpoint: source || "frontend",
      message,
      meta: context,
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error report handler failed:", error);
    res.status(500).json({ error: "Failed to process error report." });
  }
};
