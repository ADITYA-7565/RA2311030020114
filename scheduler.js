const { Log } = require("../../../logging_middleware/logger");
const { knapsack } = require("../utils/knapsack");

/**
 * For each depot, run the 0/1 knapsack algorithm using the depot's MechanicHours
 * as capacity and all fetched vehicles as items.
 *
 * @param {Array<{DepotID: number|string, MechanicHours: number}>} depots
 * @param {Array<{Duration: number, Impact: number, TaskID?: any}>} vehicles
 * @returns {Promise<Array<{depot: number|string, maxScore: number, selectedTaskIDs: Array}>>}
 */
async function runScheduler(depots, vehicles) {
  await Log(
    "backend",
    "info",
    "service",
    `Starting scheduler: ${depots.length} depots, ${vehicles.length} vehicles`
  );

  const results = [];

  for (const depot of depots) {
    const depotId = depot.DepotID ?? depot.depotId ?? depot.id;
    const mechanicHours = depot.MechanicHours ?? depot.mechanicHours ?? 0;

    await Log(
      "backend",
      "debug",
      "service",
      `Processing depot ${depotId} with MechanicHours=${mechanicHours}`
    );

    let result;
    try {
      result = knapsack(vehicles, mechanicHours);
    } catch (err) {
      await Log(
        "backend",
        "error",
        "service",
        `Knapsack failed for depot ${depotId}: ${err.message}`
      );
      result = { maxScore: 0, selectedTaskIDs: [] };
    }

    await Log(
      "backend",
      "info",
      "service",
      `Depot ${depotId}: maxScore=${result.maxScore}, selectedTasks=${result.selectedTaskIDs.length}`
    );

    results.push({
      depot: depotId,
      maxScore: result.maxScore,
      selectedTaskIDs: result.selectedTaskIDs,
    });
  }

  await Log(
    "backend",
    "info",
    "service",
    `Scheduler complete. Processed ${results.length} depots.`
  );

  return results;
}

module.exports = { runScheduler };
