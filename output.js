/**
 * output.js
 * Standalone script to fetch notifications from the assessment API,
 * apply priority sorting (Placement > Result > Event + recency),
 * and display the Top 10 notifications as terminal output.
 *
 * Token is fetched automatically — no manual updates needed.
 * Run: node output.js
 */

const BASE_URL = "http://4.224.186.213/evaluation-service";

// ── Auth credentials ───────────────────────────────────────────────────────────
const AUTH_CREDENTIALS = {
  email: "2303031050095@paruluniversity.ac.in",
  name: "jeet chetankumar bhavsar",
  rollNo: "2303031050095",
  accessCode: "cJqaEB",
  clientID: "76265e4d-9343-47a3-88a3-72c72ce2b990",
  clientSecret: "NuUTXarGWUtArQNN",
};

// ── Auto token fetch ───────────────────────────────────────────────────────────
async function getToken() {
  process.stdout.write("[auth] Fetching fresh access token...\n");
  const response = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(AUTH_CREDENTIALS),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Auth failed with status ${response.status}: ${text}`);
  }

  const data = await response.json();
  process.stdout.write("[auth] Token acquired successfully.\n");
  return data.access_token;
}

// ── Priority weights ───────────────────────────────────────────────────────────
const PRIORITY_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function getWeight(notification) {
  return PRIORITY_WEIGHTS[notification.Type] ?? 0;
}

function sortByPriority(notifications) {
  return [...notifications].sort((a, b) => {
    const weightDiff = getWeight(b) - getWeight(a);
    if (weightDiff !== 0) return weightDiff;
    // Same weight — newer Timestamp first
    const timeA = new Date(a.Timestamp ?? 0).getTime();
    const timeB = new Date(b.Timestamp ?? 0).getTime();
    return timeB - timeA;
  });
}

function getTopN(notifications, n = 10) {
  return sortByPriority(notifications).slice(0, n);
}

// ── Logging to assessment API ──────────────────────────────────────────────────
async function Log(token, stack, level, pkg, message) {
  try {
    const res = await fetch(`${BASE_URL}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
    return res.ok ? await res.json() : null;
  } catch {
    // Gracefully ignore logging errors so they don't crash the output script
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  let token;
  try {
    token = await getToken();
  } catch (err) {
    process.stderr.write(`Error: Could not retrieve token - ${err.message}\n`);
    process.exit(1);
  }

  await Log(token, "frontend", "info", "utils", "output.js: fetching notifications from API");

  let data;
  try {
    const response = await fetch(`${BASE_URL}/notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await Log(token, "frontend", "error", "utils", `output.js: API responded with ${response.status}`);
      process.stderr.write(`Error: API responded with status ${response.status}\n`);
      process.exit(1);
    }

    data = await response.json();
  } catch (err) {
    await Log(token, "frontend", "error", "utils", `output.js: fetch failed - ${err.message}`);
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }

  const raw = data.notifications ?? [];
  await Log(token, "frontend", "info", "utils", `output.js: received ${raw.length} notifications, sorting started`);

  const top10 = getTopN(raw, 10);
  await Log(token, "frontend", "info", "utils", "output.js: sorting complete, top 10 generated");

  // ── Display output ───────────────────────────────────────────────────────────
  process.stdout.write("\n========================================\n");
  process.stdout.write("   TOP 10 PRIORITY NOTIFICATIONS\n");
  process.stdout.write("   (Placement=3 > Result=2 > Event=1)\n");
  process.stdout.write("========================================\n\n");
  process.stdout.write(`Total notifications fetched : ${raw.length}\n`);
  process.stdout.write(`Top 10 shown below          :\n\n`);

  top10.forEach((n, i) => {
    const weight = PRIORITY_WEIGHTS[n.Type] ?? 0;
    process.stdout.write(`#${String(i + 1).padStart(2, "0")}  [${n.Type}] (weight=${weight})\n`);
    process.stdout.write(`      ID        : ${n.ID}\n`);
    process.stdout.write(`      Message   : ${n.Message}\n`);
    process.stdout.write(`      Timestamp : ${n.Timestamp}\n`);
    process.stdout.write("\n");
  });

  process.stdout.write("========================================\n");
  process.stdout.write("   END OF PRIORITY INBOX\n");
  process.stdout.write("========================================\n\n");
}

main();
