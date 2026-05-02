const axios = require("axios");
const { Log } = require("../../../logging_middleware/logger");

const BASE_URL = "http://20.207.122.201/evaluation-service";
let _token = null;

function setFetchToken(token) {
  _token = token;
}

function authHeaders() {
  if (!_token) {
    throw new Error("Fetch token not set");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${_token}`,
  };
}

async function fetchDepots() {
  try {
    await Log("backend", "info", "api", "Fetching depots from evaluation service");

    const response = await axios.get(`${BASE_URL}/depots`, {
      headers: authHeaders(),
    });

    await Log(
      "backend",
      "info",
      "api",
      `Fetched depots count=${Array.isArray(response.data) ? response.data.length : 0}`
    );

    return response.data;
  } catch (err) {
    const detail = err.response ? JSON.stringify(err.response.data) : err.message;
    await Log("backend", "error", "api", `Failed to fetch depots: ${detail}`);
    throw err;
  }
}

async function fetchVehicles() {
  try {
    await Log("backend", "info", "api", "Fetching vehicles from evaluation service");

    const response = await axios.get(`${BASE_URL}/vehicles`, {
      headers: authHeaders(),
    });

    await Log(
      "backend",
      "info",
      "api",
      `Fetched vehicles count=${Array.isArray(response.data) ? response.data.length : 0}`
    );

    return response.data;
  } catch (err) {
    const detail = err.response ? JSON.stringify(err.response.data) : err.message;
    await Log("backend", "error", "api", `Failed to fetch vehicles: ${detail}`);
    throw err;
  }
}

async function getDepots(token) {
  try {
    await Log("backend", "info", "api", "Fetching depots from evaluation service");

    const response = await axios.get(`${BASE_URL}/depots`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    await Log(
      "backend",
      "info",
      "api",
      `Fetched depots count=${Array.isArray(response.data) ? response.data.length : 0}`
    );

    return response.data;
  } catch (err) {
    const detail = err.response ? JSON.stringify(err.response.data) : err.message;
    await Log("backend", "error", "api", `Failed to fetch depots: ${detail}`);
    throw err;
  }
}

async function getVehicles(token) {
  try {
    await Log("backend", "info", "api", "Fetching vehicles from evaluation service");

    const response = await axios.get(`${BASE_URL}/vehicles`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    await Log(
      "backend",
      "info",
      "api",
      `Fetched vehicles count=${Array.isArray(response.data) ? response.data.length : 0}`
    );

    return response.data;
  } catch (err) {
    const detail = err.response ? JSON.stringify(err.response.data) : err.message;
    await Log("backend", "error", "api", `Failed to fetch vehicles: ${detail}`);
    throw err;
  }
}

module.exports = {
  setFetchToken,
  fetchDepots,
  fetchVehicles,
  getDepots,
  getVehicles,
};
