const tinify = require("tinify");
require("dotenv").config();

// Initialize Tinify with the API key
function initTinify() {
  const key = process.env.TINIFY_KEY;
  if (!key || key === "your_api_key_here") {
    console.error("Error: TINIFY_KEY is missing or invalid in .env file.");
    return false;
  }
  tinify.key = key;
  return true;
}

/**
 * Compress an image from a buffer.
 * @param {Buffer} buffer - The image buffer.
 * @param {string} [format] - Target format (e.g., 'image/png', 'image/webp'). If not provided, maintains original format.
 * @returns {Promise<Buffer>} - The compressed image buffer.
 */
async function compressImageBuffer(buffer, format) {
  if (!initTinify()) throw new Error("Tinify API key not configured.");

  try {
    const source = tinify.fromBuffer(buffer);
    let result;

    if (format && format !== "original") {
      result = source.convert({ type: format });
    } else {
      result = source;
    }

    const bufferResult = await result.toBuffer();
    return bufferResult;
  } catch (err) {
    console.error("Compression error:", err);
    throw err;
  }
}

/**
 * Compress an image from a file path and save to destination.
 * @param {string} sourcePath - Path to the source image.
 * @param {string} destPath - Path to save the compressed image.
 * @param {string} [format] - Target format (e.g., 'image/png').
 */
async function compressFile(sourcePath, destPath, format) {
  if (!initTinify()) throw new Error("Tinify API key not configured.");

  try {
    const source = tinify.fromFile(sourcePath);
    let result;

    if (format && format !== "original") {
      result = source.convert({ type: format });
    } else {
      result = source;
    }

    await result.toFile(destPath);
    console.log(`Compressed: ${sourcePath} -> ${destPath}`);
  } catch (err) {
    console.error(`Error compressing ${sourcePath}:`, err.message);
  }
}

module.exports = {
  compressImageBuffer,
  compressFile,
  initTinify,
};
