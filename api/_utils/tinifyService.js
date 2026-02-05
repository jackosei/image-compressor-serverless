const tinify = require("tinify");

// Initialize Tinify with the API key
function initTinify() {
  const key = process.env.TINIFY_KEY;
  if (!key || key === "your_api_key_here") {
    console.error("Error: TINIFY_KEY is missing or invalid in environment.");
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
      // Tinify expects full MIME types: 'image/webp', 'image/jpeg', 'image/png', 'image/avif'
      result = source.convert({ type: format });
      console.log(`Converting to format: ${format}`);
    } else {
      result = source;
      console.log("Maintaining original format");
    }

    const bufferResult = await result.toBuffer();
    return bufferResult;
  } catch (err) {
    console.error("Compression error:", err);
    throw err;
  }
}

module.exports = {
  compressImageBuffer,
  initTinify,
};
