const axios = require("axios");
const { response } = require("express");

module.exports = {
  getBusinessAccountId: async ({ page_id, access_token }) => {
    try {
      const response = await axios.get(
        `${process.env.IG_GRAPH_URL}/${page_id}`,
        {
          params: { fields: "instagram_business_account", access_token },
        }
      );

      const business_id = response.data.instagram_business_account?.id;
      console.log(business_id);

      return business_id;
    } catch (error) {
      console.log(error);
    }
  },
};
