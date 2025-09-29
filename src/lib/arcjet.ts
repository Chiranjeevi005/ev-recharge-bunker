import arcjet, { detectBot, shield } from "@arcjet/next";

// Initialize Arcjet with your API key
const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // Protect against common attacks with Shield
    shield({
      mode: "LIVE", // Will block requests. Use "DRY_RUN" to log only
    }),
    // Detect and block bots
    detectBot({
      mode: "LIVE", // Will block requests. Use "DRY_RUN" to log only
      allow: [], // Add any bots you want to allow e.g. ["Google", "Bing"]
    }),
  ],
});

export default aj;