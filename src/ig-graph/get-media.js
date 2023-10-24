require("dotenv").config();
const axios = require("axios");
const {
  DEFAULT_MEDIA_FIELDS,
  MAX_POSTS_PER_DAY,
} = require("../constants/properties");
const { getDifference } = require("../utils/date");

getMedia = async ({
  business_id,
  fields = DEFAULT_MEDIA_FIELDS,
  access_token,
  since,
}) => {
  try {
    const response = (
      await axios.get(`${process.env.IG_GRAPH_URL}/${business_id}/media`, {
        params: {
          fields,
          since,
          access_token,
        },
      })
    ).data;
    return response;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getMediaLast24h: (getMediaLast24h = async ({ business_id, access_token }) => {
    const twentyFourHoursAgo = Math.floor(
      /* Unix timestamp (epoch) */
      new Date(new Date().getTime() - 24 * 60 * 60 * 1000).getTime() / 1000
    );

    const media = await getMedia({
      business_id,
      access_token,
      since: twentyFourHoursAgo,
    });
    return media.data;
  }),

  howMuchTillTheNextPost: async ({ business_id, access_token }) => {
    const postedLast24h = await getMediaLast24h({ business_id, access_token });
    const posts_number = postedLast24h.length;

    if (posts_number < MAX_POSTS_PER_DAY) {
      console.log("The posts per day quota hasn't been reached yet.");
      return;
    }

    const oldestPost = postedLast24h[posts_number - 1];

    const oldestPostDate = new Date(oldestPost.timestamp);
    const twentyFourHoursAgo = new Date(
      new Date().getTime() - 24 * 60 * 60 * 1000
    );

    const dateDifference = getDifference(oldestPostDate, twentyFourHoursAgo);

    console.log(
      `How much to the next post: HH:mm:ss ${dateDifference.hours}:${dateDifference.minutes}:${dateDifference.seconds}`
    );

    return {
      HH: dateDifference.hours,
      mm: dateDifference.minutes,
      ss: dateDifference.seconds,
    };
  },
};
