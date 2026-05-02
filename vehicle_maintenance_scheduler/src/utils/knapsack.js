function knapsack(vehicles, capacity) {
  const cap = Math.max(0, Math.floor(Number(capacity) || 0));
  const items = Array.isArray(vehicles) ? vehicles : [];

  if (cap <= 0 || items.length === 0) {
    return { maxScore: 0 };
  }

  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(cap + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const duration = Math.max(0, Math.floor(Number(items[i - 1].Duration) || 0));
    const impact = Math.max(0, Number(items[i - 1].Impact) || 0);

    for (let w = 0; w <= cap; w++) {
      dp[i][w] = dp[i - 1][w];
      if (duration > 0 && duration <= w) {
        const candidate = dp[i - 1][w - duration] + impact;
        if (candidate > dp[i][w]) {
          dp[i][w] = candidate;
        }
      }
    }
  }

  return { maxScore: dp[n][cap] };
}

module.exports = { knapsack };
