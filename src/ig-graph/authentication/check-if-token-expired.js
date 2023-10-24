require("dotenv").config();
const axios = require("axios");
const { getRandomState } = require("../../utils/string");

module.exports = {
  checkIfTokenExpired: async ({ access_token }) => {
    try {
      await axios.get(process.env.IG_GRAPH_URL + `/me`, {
        params: {
          access_token,
        },
      });
    } catch (error) {
      if (error.response.data.error.code === 190) {
        const state = getRandomState();
        const login_url = `${process.env.FB_AUTH_URL}?client_id=${process.env.IG_APP_CLIENT_ID}&redirect_uri=${process.env.IG_REDIRECT_URL}&state=${state}`;
        console.log(
          "IG access token expired, generate a new one by loggin at this url:",
          login_url
        );
        return true;
      }
    }
  },
};
