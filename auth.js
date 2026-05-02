const axios = require("axios");

const BASE_URL = "http://20.207.122.201/evaluation-service";

// Replace with your actual credentials obtained from register.js
const CLIENT_ID = process.env.CLIENT_ID || "YOUR_CLIENT_ID";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "YOUR_CLIENT_SECRET";

/**
 * Authenticates with the evaluation service and returns an access token.
 * @returns {Promise<string>} access_token
 */
async function getToken() {
  try {
    const response = await axios.post(
      `${BASE_URL}/auth`,
      {
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const { access_token } = response.data;

    if (!access_token) {
      throw new Error("No access_token in auth response");
    }

    return access_token;
  } catch (err) {
    const msg = err.response
      ? JSON.stringify(err.response.data)
      : err.message;
    throw new Error(`Authentication failed: ${msg}`);
  }
}

module.exports = { getToken };
