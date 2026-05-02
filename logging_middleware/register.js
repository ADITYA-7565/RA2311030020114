const axios = require("axios");

const BASE_URL = "http://20.207.122.201/evaluation-service";

const USER_DETAILS = {
  name: "Your Full Name",
  email: "your.email@example.com",
  rollNo: "your-roll-number",
  accessCode: "your-access-code",
  githubUsername: "your-github-username",
};

async function register() {
  const response = await axios.post(
    `${BASE_URL}/register`,
    USER_DETAILS,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response?.data?.clientID || !response?.data?.clientSecret) {
    throw new Error("Register response did not contain clientID/clientSecret");
  }

  console.log("clientID:", response.data.clientID);
  console.log("clientSecret:", response.data.clientSecret);
}

register().catch((err) => {
  console.error("Registration failed:", err.message);
  process.exit(1);
});
