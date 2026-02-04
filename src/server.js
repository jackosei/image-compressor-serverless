require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const onlineRouter = require("./modes/online");
const { startLocalMode } = require("./modes/local");

const app = express();
const PORT = process.env.PORT || 3000;
const MODE = process.env.APP_MODE || "online";

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Routes
app.use("/api", onlineRouter);

// Start logic based on mode
if (MODE === "local") {
  startLocalMode();
  // In local mode, we might not need the server, but keeping it alive for potential status UI could be nice.
  // However, the requirement implies "Local (if env set to local)".
  // We will still start the server so the process doesn't exit immediately and to provide a UI if needed/wanted.
  // But strictly speaking, the core requirement is just the watcher.
  // Let's print a message clarify what's happening.
  console.log(
    "APP_MODE is set to 'local'. Web server is also running but watcher is active.",
  );
} else {
  console.log("APP_MODE is 'online' (default). Web interface is available.");
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
