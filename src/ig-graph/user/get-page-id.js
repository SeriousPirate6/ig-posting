const axios = require("axios");

module.exports = {
  getPageId: async ({ access_token }) => {
    try {
      const response = await axios.get(
        `${process.env.IG_GRAPH_URL}/me/accounts`,
        {
          params: { access_token },
        }
      );

      const page_id = response.data.data[0]?.id;
      console.log(page_id);

      return page_id;
    } catch (error) {
      console.log(error);
    }
  },
};
