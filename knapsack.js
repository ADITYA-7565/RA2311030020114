/**
 * 0/1 Knapsack — optimized DP with space-efficient 1D array.
 *
 * Time complexity:  O(n * capacity)
 * Space complexity: O(n * capacity) for backtracking table, O(capacity) if only maxScore needed
 *
 * @param {Array<{Duration: number, Impact: number, TaskID?: string|number}>} vehicles
 * @param {number} capacity - MechanicHours available at the depot
 * @returns {{ maxScore: number, selectedTaskIDs: Array }}
 */
function knapsack(vehicles, capacity) {
  const n = vehicles.length;
  const cap = Math.floor(capacity);

  if (n === 0 || cap <= 0) {
    return { maxScore: 0, selectedTaskIDs: [] };
  }

  // Build full 2D DP table for backtracking (bonus: selected task IDs)
  // dp[i][w] = max Impact using first i items with weight limit w
  // Use flat Uint32Array for memory efficiency
  const dp = [];
  for (let i = 0; i <= n; i++) {
    dp.push(new Array(cap + 1).fill(0));
  }

  for (let i = 1; i <= n; i++) {
    const duration = Math.floor(vehicles[i - 1].Duration);
    const impact = vehicles[i - 1].Impact;

    for (let w = 0; w <= cap; w++) {
      // Don't take item i
      dp[i][w] = dp[i - 1][w];

      // Take item i if it fits and improves score
      if (duration <= w) {
        const withItem = dp[i - 1][w - duration] + impact;
        if (withItem > dp[i][w]) {
          dp[i][w] = withItem;
        }
      }
    }
  }

  const maxScore = dp[n][cap];

  // Backtrack to find selected items
  const selectedTaskIDs = [];
  let w = cap;
  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      // Item i was included
      const vehicle = vehicles[i - 1];
      if (vehicle.TaskID !== undefined) {
        selectedTaskIDs.push(vehicle.TaskID);
      } else {
        selectedTaskIDs.push(i - 1); // fallback: index
      }
      w -= Math.floor(vehicle.Duration);
    }
  }

  return { maxScore, selectedTaskIDs: selectedTaskIDs.reverse() };
}

module.exports = { knapsack };
