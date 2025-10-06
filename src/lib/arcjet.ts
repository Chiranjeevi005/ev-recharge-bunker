import arcjet, { 
  detectBot, 
  shield, 
  sensitiveInfo,
  validateEmail,
  fixedWindow
} from "@arcjet/next";

// Initialize Arcjet with your API key
const aj = arcjet({
  key: process.env['ARCJET_KEY']!, // Get your site key from https://app.arcjet.com
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
    // Detect sensitive information
    sensitiveInfo({
      mode: "LIVE",
      deny: ["EMAIL"], // Block requests containing email addresses
    }),
  ],
});

// Create specific Arcjet instances for different use cases
export const ajAuth = arcjet({
  key: process.env['ARCJET_KEY']!,
  characteristics: ["userId"], // Track requests by user ID
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1m", // 1 minute window
      max: 10, // Maximum 10 requests per minute per user
    })
  ],
});

export const ajPayment = arcjet({
  key: process.env['ARCJET_KEY']!,
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h", // 1 hour window
      max: 100, // Maximum 100 payment requests per hour per IP
    })
  ],
});

export const ajApi = arcjet({
  key: process.env['ARCJET_KEY']!,
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1m", // 1 minute window
      max: 60, // Maximum 60 API requests per minute per IP
    })
  ],
});

// Email validation utility
export const validateEmailInput = validateEmail;

export default aj;