const axios = require("axios");

const BASE_URL = "http://20.207.122.201/evaluation-service";

async function getToken() {
  const response = await axios.post(
    `${BASE_URL}/auth`,
    {
      email: process.env.EMAIL,
      name: process.env.NAME,
      rollNo: process.env.ROLL_NO,
      accessCode: process.env.ACCESS_CODE,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response?.data?.access_token) {
    throw new Error("Authentication response did not contain access_token");
  }

  return response.data.access_token;
}

module.exports = { getToken };
