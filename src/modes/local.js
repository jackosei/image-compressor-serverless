const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");
const { compressFile } = require("../services/tinifyService");

function startLocalMode() {
  const uploadDir = path.resolve(__dirname, "../../uploads");
  const convertedDir = path.resolve(__dirname, "../../converted");

  // Ensure directories exist
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  if (!fs.existsSync(convertedDir))
    fs.mkdirSync(convertedDir, { recursive: true });

  console.log(`Starting Local Mode...`);
  console.log(`Watching for images in: ${uploadDir}`);
  console.log(`Compressed results will be in: ${convertedDir}`);

  const watcher = chokidar.watch(uploadDir, {
    persistent: true,
    ignoreInitial: true, //set to 'false' to convert files in the uploads folder and 'true' to only convert new files added
    depth: 0,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100,
    },
  });

  watcher
    .on("add", (filePath) => {
      const fileName = path.basename(filePath);
      // Basic image extension check
      if (!/\.(jpg|jpeg|png|webp)$/i.test(fileName)) {
        console.log(`Ignoring non-image file: ${fileName}`);
        return;
      }

      console.log(`New file detected: ${fileName}`);

      const outputFormat = process.env.OUTPUT_FORMAT || "original";
      let destExt = path.extname(fileName);
      let targetMime = "original";

      if (outputFormat === "jpeg" || outputFormat === "jpg") {
        targetMime = "image/jpeg";
        destExt = ".jpg";
      } else if (outputFormat === "png") {
        targetMime = "image/png";
        destExt = ".png";
      } else if (outputFormat === "webp") {
        targetMime = "image/webp";
        destExt = ".webp";
      } else if (outputFormat === "avif") {
        targetMime = "image/avif";
        destExt = ".avif";
      }

      const destFileName = path.parse(fileName).name + destExt;
      const destPath = path.join(convertedDir, destFileName);

      compressFile(filePath, destPath, targetMime);
    })
    .on("error", (error) => console.error(`Watcher error: ${error}`));
}

module.exports = { startLocalMode };
