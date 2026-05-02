const express = require("express");
const { setToken, Log } = require("../logging_middleware/logger");
const { getToken } = require("../logging_middleware/auth");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ──────────────────────────────────────────────
// Simulated notification dispatcher
// Replace sendEmail / sendSMS with real integrations
// ──────────────────────────────────────────────
async function sendEmail(depotId, maxScore, taskIDs) {
  // Placeholder: integrate SendGrid / Nodemailer here
  await Log(
    "backend",
    "debug",
    "service",
    `Email sent for depot ${depotId}: maxScore=${maxScore}, tasks=${taskIDs.join(",")}`
  );
}

async function sendSMS(depotId, maxScore) {
  // Placeholder: integrate Twilio here
  await Log(
    "backend",
    "debug",
    "service",
    `SMS sent for depot ${depotId}: maxScore=${maxScore}`
  );
}

// ──────────────────────────────────────────────
// POST /notify — receives schedule events
// ──────────────────────────────────────────────
app.post("/notify", async (req, res) => {
  const { event, timestamp, payload } = req.body;

  await Log("backend", "info", "handler", `Notification event received: ${event} at ${timestamp}`);

  if (!event || !Array.isArray(payload)) {
    await Log("backend", "warn", "handler", "Invalid notification payload received");
    return res.status(400).json({ error: "Invalid payload" });
  }

  let dispatched = 0;
  let failed = 0;

  for (const item of payload) {
    const { depot, maxScore, selectedTaskIDs = [] } = item;
    try {
      await sendEmail(depot, maxScore, selectedTaskIDs);

      // Send SMS only for high-impact schedules
      if (maxScore > 100) {
        await sendSMS(depot, maxScore);
      }

      dispatched++;
      await Log(
        "backend",
        "info",
        "service",
        `Notification dispatched for depot ${depot}`
      );
    } catch (err) {
      failed++;
      await Log(
        "backend",
        "error",
        "service",
        `Notification failed for depot ${depot}: ${err.message}`
      );
    }
  }

  res.json({ dispatched, failed });
});

// ──────────────────────────────────────────────
// Health check
// ──────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ──────────────────────────────────────────────
// Bootstrap
// ──────────────────────────────────────────────
async function start() {
  try {
    const token = await getToken();
    setToken(token);
    await Log("backend", "info", "handler", "Notification service started successfully");
  } catch (err) {
    process.stderr.write(`[FATAL] Auth failed: ${err.message}\n`);
    process.exit(1);
  }

  app.listen(PORT, () => {
    // Only allowed console.log: server startup confirmation
    console.log(`Notification service listening on port ${PORT}`);
  });
}

start();
