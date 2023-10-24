const axios = require("axios");
const { handlingRedirects } = require("./redirections");

module.exports = {
  getMimeType: async (url) => {
    try {
      /*
       * fetching the headers from the url and extracting the content-type
       */
      const response = await axios.head(url);
      const contentType = response.headers["content-type"];

      /*
       * returning the content-type / mime-type
       */
      return contentType;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  },
};
