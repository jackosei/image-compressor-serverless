const multiparty = require("multiparty");
const { compressImageBuffer } = require("./_utils/tinifyService");
const path = require("path");

module.exports = async (req, res) => {
  // Set CORS headers - restrict to frontend origin
  const allowedOrigin = process.env.ALLOW_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
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
    // Parse multipart form data with size limits
    const form = new multiparty.Form({
      maxFilesSize: 4 * 1024 * 1024, // 4MB limit for Vercel free tier
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(400).json({ error: "Failed to parse form data." });
      }

      // Check if image file was provided
      if (!files.image || files.image.length === 0) {
        return res.status(400).json({ error: "No image file provided." });
      }

      const file = files.image[0];
      const targetFormat = fields.format ? fields.format[0] : "original";

      console.log(
        `Received upload: ${file.originalFilename} (${file.size} bytes)`,
      );
      console.log(`Converting to: ${targetFormat}`);

      // Read file buffer
      const fs = require("fs");
      const fileBuffer = fs.readFileSync(file.path);

      // Compress image
      const compressedBuffer = await compressImageBuffer(
        fileBuffer,
        targetFormat,
      );
      console.log(`Compressed successfully.`);

      // Clean up temp file
      fs.unlinkSync(file.path);

      // Determine content type and extension
      let mimeType = file.headers["content-type"];
      let ext = path.extname(file.originalFilename).slice(1); // default extension (no dot)

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

      res.setHeader("Content-Type", mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="compressed_${path.parse(file.originalFilename).name}.${ext}"`,
      );
      res.send(compressedBuffer);
    });
  } catch (error) {
    console.error("Compression failed:", error);
    res.status(500).json({ error: "Image compression failed." });
  }
};
