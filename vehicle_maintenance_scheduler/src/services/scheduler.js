const { Log } = require("../../logging_middleware/logger");
const { knapsack } = require("../utils/knapsack");

async function runScheduler(depots, vehicles) {
  if (!Array.isArray(depots)) {
    throw new Error("Depots must be an array");
  }
  if (!Array.isArray(vehicles)) {
    throw new Error("Vehicles must be an array");
  }

  const results = [];

  for (const depot of depots) {
    const depotId = depot?.DepotID ?? depot?.id ?? depot?.depotId;
    const capacity = Number(depot?.MechanicHours || depot?.mechanicHours || 0);

    await Log(
      "backend",
      "debug",
      "service",
      `Processing depot ${depotId} with capacity=${capacity}`
    );

    const { maxScore } = knapsack(vehicles, capacity);

    await Log(
      "backend",
      "info",
      "service",
      `Depot ${depotId}: maxScore=${maxScore}`
    );

    results.push({ depot: depotId, maxScore });
  }

  await Log("backend", "info", "service", `Scheduler completed for ${results.length} depots`);
  return results;
}

module.exports = { runScheduler };
