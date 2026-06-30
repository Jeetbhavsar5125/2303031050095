const BASE_URL = import.meta.env.VITE_BASE_URL;

const AUTH_CREDENTIALS = {
  email: import.meta.env.VITE_EMAIL,
  name: import.meta.env.VITE_NAME,
  rollNo: import.meta.env.VITE_ROLL_NO,
  accessCode: import.meta.env.VITE_ACCESS_CODE,
  clientID: import.meta.env.VITE_CLIENT_ID,
  clientSecret: import.meta.env.VITE_CLIENT_SECRET,
};

let cachedToken = null;
let tokenExpiresAt = 0;

export async function getToken() {
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (cachedToken && nowSeconds < tokenExpiresAt - 60) {
    return cachedToken;
  }

  const response = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(AUTH_CREDENTIALS),
  });

  if (!response.ok) {
    throw new Error(`Auth failed with status ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = data.expires_in;
  return cachedToken;
}
