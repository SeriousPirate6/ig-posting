const axios = require("axios");

module.exports = {
  getUserInfo: async ({ access_token }) => {
    try {
      const response = await axios.get(`${process.env.IG_GRAPH_URL}/me`, {
        params: { access_token },
      });

      const userInfo = response.data;
      console.log(userInfo);

      return userInfo;
    } catch (error) {
      console.log(error);
    }
  },
};
