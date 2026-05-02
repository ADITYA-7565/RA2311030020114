const axios = require("axios");

const BASE_URL = "http://20.207.122.201/evaluation-service";
const VALID_STACKS = ["backend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_PACKAGES = ["api", "controller", "service", "db", "handler", "repository", "route"];

let TOKEN = null;

function setToken(token) {
  TOKEN = token;
}

async function Log(stack, level, pkg, message) {
  if (!VALID_STACKS.includes(stack)) {
    throw new Error(`Invalid stack: ${stack}`);
  }
  if (!VALID_LEVELS.includes(level)) {
    throw new Error(`Invalid level: ${level}`);
  }
  if (!VALID_PACKAGES.includes(pkg)) {
    throw new Error(`Invalid package: ${pkg}`);
  }
  if (!TOKEN) {
    throw new Error("Logger token not set");
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
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );
  } catch (err) {
    const detail = err.response ? JSON.stringify(err.response.data) : err.message;
    process.stderr.write(`[LOGGER ERROR] Failed to send log: ${detail}\n`);
  }
}

module.exports = { setToken, Log };
