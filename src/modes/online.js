const express = require("express");
const multer = require("multer");
const path = require("path");
const archiver = require("archiver");
const { compressImageBuffer } = require("../services/tinifyService");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post("/compress", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided." });
  }

  try {
    console.log(
      `Received upload: ${req.file.originalname} (${req.file.size} bytes)`,
    );
    const targetFormat = req.body.format || "original";
    console.log(`Converting to: ${targetFormat}`);

    const compressedBuffer = await compressImageBuffer(
      req.file.buffer,
      targetFormat,
    );
    console.log(`Compressed successfully.`);

    // Determine content type and extension
    let mimeType = req.file.mimetype;
    let ext = path.extname(req.file.originalname).slice(1); // default extension (no dot)

    if (targetFormat === "image/png") {
      mimeType = "image/png";
      ext = "png";
    } else if (targetFormat === "image/jpeg") {
      mimeType = "image/jpeg";
      ext = "jpg";
    } else if (targetFormat === "image/webp") {
      mimeType = "image/webp";
      ext = "webp";
    } else if (targetFormat === "image/avif") {
      mimeType = "image/avif";
      ext = "avif";
    }

    res.set("Content-Type", mimeType);
    res.set(
      "Content-Disposition",
      `attachment; filename="compressed_${path.parse(req.file.originalname).name}.${ext}"`,
    );
    res.send(compressedBuffer);
  } catch (error) {
    console.error("Compression failed:", error);
    res.status(500).json({ error: "Image compression failed." });
  }
});

// Batch compress endpoint - handles multiple files and returns ZIP
router.post("/compress-batch", upload.array("images", 20), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No image files provided." });
  }

  try {
    console.log(`Batch compression: ${req.files.length} files received`);
    const targetFormat = req.body.format || "original";

    // Set response headers for ZIP download
    res.set("Content-Type", "application/zip");
    res.set(
      "Content-Disposition",
      'attachment; filename="compressed-images.zip"',
    );

    // Create ZIP archive
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    // Pipe archive to response
    archive.pipe(res);

    // Handle archive errors
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      throw err;
    });

    // Process each file and add to archive
    for (const file of req.files) {
      try {
        console.log(`Compressing: ${file.originalname}`);
        const compressedBuffer = await compressImageBuffer(
          file.buffer,
          targetFormat,
        );

        // Determine file extension based on format
        let ext = path.extname(file.originalname).slice(1);
        if (targetFormat === "image/png") ext = "png";
        else if (targetFormat === "image/jpeg") ext = "jpg";
        else if (targetFormat === "image/webp") ext = "webp";
        else if (targetFormat === "image/avif") ext = "avif";

        const fileName = `compressed_${path.parse(file.originalname).name}.${ext}`;

        // Add compressed file to archive
        archive.append(compressedBuffer, { name: fileName });
        console.log(`Added to ZIP: ${fileName}`);
      } catch (err) {
        console.error(`Error compressing ${file.originalname}:`, err);
        // Continue with other files even if one fails
      }
    }

    // Finalize the archive
    await archive.finalize();
    console.log("ZIP archive created successfully");
  } catch (error) {
    console.error("Batch compression failed:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Batch compression failed." });
    }
  }
});

module.exports = router;
