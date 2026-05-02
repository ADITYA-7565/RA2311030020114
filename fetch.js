const axios = require("axios");
const { Log } = require("../../../logging_middleware/logger");

const BASE_URL = "http://20.207.122.201/evaluation-service";

let _token = null;

/**
 * Set the Bearer token for API requests.
 * @param {string} token
 */
function setFetchToken(token) {
  _token = token;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${_token}`,
  };
}

/**
 * Fetch all depots from the evaluation service.
 * @returns {Promise<Array>}
 */
async function fetchDepots() {
  try {
    await Log("backend", "info", "api", "Fetching depots from evaluation service");

    const response = await axios.get(`${BASE_URL}/depots`, {
      headers: authHeaders(),
    });

    const depots = response.data;
    await Log(
      "backend",
      "info",
      "api",
      `Successfully fetched ${Array.isArray(depots) ? depots.length : 0} depots`
    );

    return depots;
  } catch (err) {
    const detail = err.response
      ? JSON.stringify(err.response.data)
      : err.message;
    await Log("backend", "error", "api", `Failed to fetch depots: ${detail}`);
    throw err;
  }
}

/**
 * Fetch all vehicles from the evaluation service.
 * @returns {Promise<Array>}
 */
async function fetchVehicles() {
  try {
    await Log("backend", "info", "api", "Fetching vehicles from evaluation service");

    const response = await axios.get(`${BASE_URL}/vehicles`, {
      headers: authHeaders(),
    });

    const vehicles = response.data;
    await Log(
      "backend",
      "info",
      "api",
      `Successfully fetched ${Array.isArray(vehicles) ? vehicles.length : 0} vehicles`
    );

    return vehicles;
  } catch (err) {
    const detail = err.response
      ? JSON.stringify(err.response.data)
      : err.message;
    await Log("backend", "error", "api", `Failed to fetch vehicles: ${detail}`);
    throw err;
  }
}

module.exports = { setFetchToken, fetchDepots, fetchVehicles };
