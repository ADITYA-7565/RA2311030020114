const axios = require("axios");

const BASE_URL = "http://20.207.122.201/evaluation-service";

// User registration details — fill these in before running
const USER_DETAILS = {
  name: "Your Full Name",
  email: "your.email@example.com",
  rollNo: "your-roll-number",
  accessCode: "your-access-code",
  githubUsername: "your-github-username",
};

async function register() {
  try {
    const response = await axios.post(`${BASE_URL}/register`, USER_DETAILS, {
      headers: { "Content-Type": "application/json" },
    });

    const { clientID, clientSecret } = response.data;

    // SAVE THESE, cannot regenerate
    console.log("=== REGISTRATION SUCCESSFUL ===");
    console.log("clientID:    ", clientID);
    console.log("clientSecret:", clientSecret);
    console.log("================================");
    console.log("SAVE THESE CREDENTIALS — they cannot be regenerated.");

    return { clientID, clientSecret };
  } catch (err) {
    console.error(
      "Registration failed:",
      err.response ? JSON.stringify(err.response.data) : err.message
    );
    throw err;
  }
}

register();
