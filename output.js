const BASE_URL = "http://4.224.186.213/evaluation-service";

const AUTH_CREDENTIALS = {
  email: "2303031050095@paruluniversity.ac.in",
  name: "jeet chetankumar bhavsar",
  rollNo: "2303031050095",
  accessCode: "cJqaEB",
  clientID: "76265e4d-9343-47a3-88a3-72c72ce2b990",
  clientSecret: "NuUTXarGWUtArQNN",
};

async function getToken() {
  const response = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(AUTH_CREDENTIALS),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Auth failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

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
    const timeA = new Date(a.Timestamp ?? 0).getTime();
    const timeB = new Date(b.Timestamp ?? 0).getTime();
    return timeB - timeA;
  });
}

function getTopN(notifications, n = 10) {
  return sortByPriority(notifications).slice(0, n);
}

async function Log(token, stack, level, pkg, message) {
  try {
    await fetch(`${BASE_URL}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch (err) {
    // Ignore logging errors to prevent breaking the flow
  }
}

async function main() {
  let token;
  try {
    token = await getToken();
  } catch (err) {
    process.stderr.write(`Error: Could not retrieve token - ${err.message}\n`);
    process.exit(1);
  }

  await Log(token, "frontend", "info", "utils", "Fetching notifications");

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
      process.stderr.write(`Error: API responded with status ${response.status}\n`);
      process.exit(1);
    }

    data = await response.json();
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }

  const raw = data.notifications ?? [];
  const top10 = getTopN(raw, 10);

  process.stdout.write("\n========================================\n");
  process.stdout.write("   TOP 10 PRIORITY NOTIFICATIONS\n");
  process.stdout.write("========================================\n\n");

  top10.forEach((n, i) => {
    const weight = PRIORITY_WEIGHTS[n.Type] ?? 0;
    process.stdout.write(`#${String(i + 1).padStart(2, "0")}  [${n.Type}] (weight=${weight})\n`);
    process.stdout.write(`      ID        : ${n.ID}\n`);
    process.stdout.write(`      Message   : ${n.Message}\n`);
    process.stdout.write(`      Timestamp : ${n.Timestamp}\n\n`);
  });
}

main();
