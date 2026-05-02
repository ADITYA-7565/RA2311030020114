const { getToken } = require("../../../logging_middleware/auth");
const { setToken, Log } = require("../../../logging_middleware/logger");
const { setFetchToken, fetchDepots, fetchVehicles } = require("./api/fetch");
const { runScheduler } = require("./services/scheduler");

async function main() {
  // Step 1: Authenticate and set token globally
  let token;
  try {
    token = await getToken();
  } catch (err) {
    process.stderr.write(`[FATAL] Could not obtain auth token: ${err.message}\n`);
    process.exit(1);
  }

  // Step 2: Inject token into logger and fetch module
  setToken(token);
  setFetchToken(token);

  // Step 3: Log application start
  await Log("backend", "info", "handler", "Vehicle Maintenance Scheduler service starting");

  // Step 4: Fetch depots and vehicles in parallel
  let depots, vehicles;
  try {
    await Log("backend", "debug", "handler", "Initiating parallel fetch of depots and vehicles");
    [depots, vehicles] = await Promise.all([fetchDepots(), fetchVehicles()]);
  } catch (err) {
    await Log("backend", "fatal", "handler", `Data fetch failed: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(depots) || depots.length === 0) {
    await Log("backend", "warn", "handler", "No depots returned from API; exiting");
    process.exit(0);
  }

  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    await Log("backend", "warn", "handler", "No vehicles returned from API; exiting");
    process.exit(0);
  }

  // Step 5: Run the scheduler
  let results;
  try {
    results = await runScheduler(depots, vehicles);
  } catch (err) {
    await Log("backend", "fatal", "handler", `Scheduler failed: ${err.message}`);
    process.exit(1);
  }

  await Log("backend", "info", "handler", "Vehicle Maintenance Scheduler service finished successfully");

  // Step 6: Final output — ONLY allowed console.log in the entire project
  const output = results.map(({ depot, maxScore, selectedTaskIDs }) => ({
    depot,
    maxScore,
    selectedTaskIDs,
  }));

  console.log(JSON.stringify(output, null, 2));
}

main();
