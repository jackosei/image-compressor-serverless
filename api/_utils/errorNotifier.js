const { Resend } = require("resend");

/**
 * Send an error notification email.
 * Fire-and-forget — never blocks the response or throws.
 *
 * @param {Object} opts
 * @param {string} opts.endpoint - The API route or source where the error occurred.
 * @param {string} opts.message  - Human-readable error description.
 * @param {string} [opts.stack]  - Stack trace (if available).
 * @param {Object} [opts.meta]   - Any extra context (filename, format, etc.).
 */
async function notifyError({ endpoint, message, stack, meta }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;

  if (!apiKey || !to) {
    // Silently skip — email notifications not configured
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const timestamp = new Date().toISOString();

    const metaBlock = meta
      ? `<h3>Context</h3><pre>${JSON.stringify(meta, null, 2)}</pre>`
      : "";

    await resend.emails.send({
      from: "LilPic Errors <onboarding@resend.dev>",
      to,
      subject: `[LilPic Error] ${endpoint} — ${message.slice(0, 80)}`,
      html: `
        <h2>Error in ${endpoint}</h2>
        <p><strong>Time:</strong> ${timestamp}</p>
        <p><strong>Message:</strong> ${message}</p>
        ${stack ? `<h3>Stack Trace</h3><pre>${stack}</pre>` : ""}
        ${metaBlock}
      `,
    });
  } catch (emailErr) {
    // Never let notification failures affect the app
    console.error("Failed to send error notification email:", emailErr.message);
  }
}

module.exports = { notifyError };
