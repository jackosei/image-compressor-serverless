const multiparty = require("multiparty");
const archiver = require("archiver");
const { compressImageBuffer } = require("./_utils/tinifyService");
const path = require("path");
const fs = require("fs");

module.exports = async (req, res) => {
  // Set CORS headers
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

  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse multipart form data
    const form = new multiparty.Form({
      maxFiles: 20,
      maxFilesSize: 200 * 1024 * 1024, // 200MB total
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(400).json({ error: "Failed to parse form data." });
      }

      // Check if images were provided
      if (!files.images || files.images.length === 0) {
        return res.status(400).json({ error: "No image files provided." });
      }

      const targetFormat = fields.format ? fields.format[0] : "original";
      console.log(`Batch compression: ${files.images.length} files received`);

      // Set response headers for ZIP download
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
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
      archive.on("error", (archiveErr) => {
        console.error("Archive error:", archiveErr);
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to create archive." });
        }
      });

      // Process each file and add to archive
      for (const file of files.images) {
        try {
          console.log(`Compressing: ${file.originalFilename}`);

          // Read file buffer
          const fileBuffer = fs.readFileSync(file.path);

          // Compress image
          const compressedBuffer = await compressImageBuffer(
            fileBuffer,
            targetFormat,
          );

          // Determine file extension based on format
          let ext = path.extname(file.originalFilename).slice(1);
          if (targetFormat === "image/png") ext = "png";
          else if (targetFormat === "image/jpeg") ext = "jpg";
          else if (targetFormat === "image/webp") ext = "webp";
          else if (targetFormat === "image/avif") ext = "avif";

          const fileName = `compressed_${path.parse(file.originalFilename).name}.${ext}`;

          // Add compressed file to archive
          archive.append(compressedBuffer, { name: fileName });
          console.log(`Added to ZIP: ${fileName}`);

          // Clean up temp file
          fs.unlinkSync(file.path);
        } catch (compressionErr) {
          console.error(
            `Error compressing ${file.originalFilename}:`,
            compressionErr,
          );
          // Continue with other files even if one fails
          // Clean up temp file on error
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkErr) {
            // Ignore unlink errors
          }
        }
      }

      // Finalize the archive
      await archive.finalize();
      console.log("ZIP archive created successfully");
    });
  } catch (error) {
    console.error("Batch compression failed:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Batch compression failed." });
    }
  }
};
