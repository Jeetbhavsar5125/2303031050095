/**
 * src/config/auth.js
 *
 * Manages access token lifecycle for the frontend application.
 * Automatically fetches a fresh token from the auth API and caches it
 * in memory. Re-fetches before expiry so no manual token rotation is needed.
 */

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AUTH_CREDENTIALS = {
  email: import.meta.env.VITE_EMAIL,
  name: import.meta.env.VITE_NAME,
  rollNo: import.meta.env.VITE_ROLL_NO,
  accessCode: import.meta.env.VITE_ACCESS_CODE,
  clientID: import.meta.env.VITE_CLIENT_ID,
  clientSecret: import.meta.env.VITE_CLIENT_SECRET,
};

// In-memory token cache
let cachedToken = null;
let tokenExpiresAt = 0; // Unix timestamp in seconds

/**
 * Returns a valid Bearer access token.
 * Fetches a new one from the auth API if none is cached or it has expired.
 *
 * @returns {Promise<string>} A valid access token
 */
export async function getToken() {
  const nowSeconds = Math.floor(Date.now() / 1000);
  // Refresh 60 seconds before actual expiry to avoid edge cases
  if (cachedToken && nowSeconds < tokenExpiresAt - 60) {
    return cachedToken;
  }

  const response = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(AUTH_CREDENTIALS),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Auth API failed with status ${response.status}: ${text}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = data.expires_in; // absolute Unix timestamp from API
  return cachedToken;
}
