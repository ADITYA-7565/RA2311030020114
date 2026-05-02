const { getToken } = require("../../logging_middleware/auth");
const { setToken, Log } = require("../../logging_middleware/logger");
const { getDepots, getVehicles } = require("./api/fetch");
const { runScheduler } = require("./services/scheduler");

async function main() {
  let token;

  try {
    token = await getToken();
  } catch (err) {
    process.stderr.write(`[FATAL] Auth failed: ${err.message}\n`);
    process.exit(1);
  }

  setToken(token);

  await Log("backend", "info", "handler", "App started");

  let depots;
  let vehicles;

  try {
    [depots, vehicles] = await Promise.all([getDepots(token), getVehicles(token)]);
  } catch (err) {
    await Log("backend", "fatal", "handler", `Data fetch failed: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(depots) || depots.length === 0) {
    await Log("backend", "warn", "handler", "No depots returned from API");
    console.log(JSON.stringify([]));
    return;
  }

  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    await Log("backend", "warn", "No vehicles returned from API");
    console.log(JSON.stringify([]));
    return;
  }

  let schedule;

  try {
    schedule = await runScheduler(depots, vehicles);
  } catch (err) {
    await Log("backend", "fatal", "handler", `Scheduler failed: ${err.message}`);
    process.exit(1);
  }

  await Log("backend", "info", "handler", "Vehicle Maintenance Scheduler service finished successfully");
  console.log(JSON.stringify(schedule, null, 2));
}

main().catch((err) => {
  process.stderr.write(`[FATAL] Unexpected error: ${err.message}\n`);
  process.exit(1);
});
