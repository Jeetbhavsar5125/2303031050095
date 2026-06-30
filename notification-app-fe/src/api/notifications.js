import { Log } from "../middleware/logger";
import { getToken } from "../config/auth";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function fetchNotifications({ page = 1, limit = 10, notification_type } = {}) {
  const queryParams = new URLSearchParams();
  queryParams.set("page", String(page));
  queryParams.set("limit", String(limit));
  if (notification_type && notification_type !== "All") {
    queryParams.set("notification_type", notification_type);
  }

  const url = `${BASE_URL}/notifications?${queryParams.toString()}`;

  await Log(
    "frontend",
    "info",
    "api",
    `Fetch: page=${page}`
  );

  try {
    const token = await getToken();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await Log(
        "frontend",
        "error",
        "api",
        `API error: ${response.status}`
      );
      throw new Error(`Status: ${response.status}`);
    }

    const data = await response.json();
    await Log(
      "frontend",
      "info",
      "api",
      `Success: ${page}`
    );

    return data;
  } catch (error) {
    await Log(
      "frontend",
      "error",
      "api",
      `Failed: ${error.message}`
    ).catch(() => {});
    throw error;
  }
}
