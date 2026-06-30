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

export async function Log(stack, level, pkg, message) {
  if (!VALID_LEVELS.includes(level)) {
    throw new Error(`Invalid log level: "${level}"`);
  }
  if (!VALID_PACKAGES.includes(pkg)) {
    throw new Error(`Invalid package: "${pkg}"`);
  }

  const truncatedMsg = typeof message === "string" ? message.substring(0, 48) : String(message).substring(0, 48);
  const body = {
    stack,
    level,
    package: pkg,
    message: truncatedMsg,
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
      throw new Error(`Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}
