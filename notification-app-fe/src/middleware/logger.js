import { getToken } from "../config/auth";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_PACKAGES = [
  "api",
  "component",
  "hook",
  "page",
  "state",
  "auth",
  "config",
  "middleware",
  "utils",
];

/**
 * Log sends a structured log entry to the assessment logging API.
 *
 * @param {string} stack   - Must be "frontend"
 * @param {string} level   - One of: debug | info | warn | error | fatal
 * @param {string} pkg     - One of the allowed frontend packages
 * @param {string} message - Human-readable log message
 * @returns {Promise<any>} The parsed API response on success
 */
export async function Log(stack, level, pkg, message) {
  if (!VALID_LEVELS.includes(level)) {
    throw new Error(`[logger] Invalid log level: "${level}"`);
  }
  if (!VALID_PACKAGES.includes(pkg)) {
    throw new Error(`[logger] Invalid package: "${pkg}"`);
  }

  const body = {
    stack,
    level,
    package: pkg,
    message: typeof message === "string" ? message.substring(0, 48) : String(message).substring(0, 48),
  };


  try {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `[logger] API responded with ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Gracefully catch logging errors so they never crash the main application flows
    return null;
  }
}
