const axios = require("axios");

const BASE_URL = "http://20.207.122.201/evaluation-service";

const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_PACKAGES = [
  "api",
  "controller",
  "service",
  "db",
  "handler",
  "repository",
  "route",
];
const VALID_STACKS = ["backend"];

let _token = null;

/**
 * Set the Bearer token used for authenticated log requests.
 * Must be called before Log() is used.
 * @param {string} token
 */
function setToken(token) {
  _token = token;
}

/**
 * Send a structured log entry to the evaluation service.
 *
 * @param {string} stack   - Must be "backend"
 * @param {string} level   - One of: debug | info | warn | error | fatal
 * @param {string} pkg     - One of: api | controller | service | db | handler | repository | route
 * @param {string} message - Human-readable log message
 */
async function Log(stack, level, pkg, message) {
  if (!VALID_STACKS.includes(stack)) {
    throw new Error(`Invalid stack: "${stack}". Must be one of: ${VALID_STACKS.join(", ")}`);
  }
  if (!VALID_LEVELS.includes(level)) {
    throw new Error(`Invalid level: "${level}". Must be one of: ${VALID_LEVELS.join(", ")}`);
  }
  if (!VALID_PACKAGES.includes(pkg)) {
    throw new Error(`Invalid package: "${pkg}". Must be one of: ${VALID_PACKAGES.join(", ")}`);
  }
  if (!_token) {
    throw new Error("Logger token not set. Call setToken(token) before logging.");
  }

  try {
    await axios.post(
      `${BASE_URL}/logs`,
      {
        stack,
        level,
        package: pkg,
        message,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${_token}`,
        },
      }
    );
  } catch (err) {
    // Fallback: only allowed console output is for logger internal errors
    const detail = err.response
      ? JSON.stringify(err.response.data)
      : err.message;
    process.stderr.write(`[LOGGER ERROR] Failed to send log: ${detail}\n`);
  }
}

module.exports = { setToken, Log };
