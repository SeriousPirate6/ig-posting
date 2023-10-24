require("dotenv").config();
const axios = require("axios");
const {
  checkIfTokenExpired,
} = require("./authentication/check-if-token-expired");
const { getMimeType } = require("../utils/mime-type");
const { MEDIA_MIME_TYPES, MEDIA_TYPES } = require("../constants/properties");
const { handlingRedirects } = require("../utils/redirections");

async function getPostId({
  access_token,
  business_id,
  media_url,
  media_type,
  caption,
  children = null,
  is_carousel_item = false,
}) {
  /*
   * getting only provided params
   */
  const params = arguments[0];

  const isTokenExpired = await checkIfTokenExpired({ access_token });
  if (isTokenExpired) process.exit(0);

  switch (media_type) {
    case MEDIA_TYPES.STORIES:
    case MEDIA_TYPES.CAROUSEL:
      if (MEDIA_MIME_TYPES.VIDEO.includes(media_type)) {
        params.video_url = params.media_url;
        delete params.media_url;
      } else {
        params.image_url = params.media_url;
        delete params.media_url;
      }
      break;
    case MEDIA_TYPES.REELS:
    case MEDIA_TYPES.VIDEO:
      params.video_url = params.media_url;
      delete params.media_url;
      break;
    default:
      params.image_url = params.media_url;
      delete params.media_url;
  }

  try {
    const response = (
      await axios.post(
        `${process.env.IG_GRAPH_URL}/${business_id}/media`,
        null /* data params not needed */,
        {
          params,
        }
      )
    ).data?.id;
    return response;
  } catch (err) {
    const response_error = err.response?.data.error;
    if (response_error) {
      console.log(response_error);
    }
    console.log(err);
  }
}

postMedia = async ({
  access_token,
  business_id,
  creation_id,
  cooldownSeconds = 2,
}) => {
  const isTokenExpired = await checkIfTokenExpired({ access_token });
  if (isTokenExpired) process.exit(0);

  return new Promise(async (resolve, reject) => {
    try {
      const post_media = await axios.post(
        process.env.IG_GRAPH_URL + `/${business_id}/media_publish`,
        null /* data params not needed */,
        {
          params: {
            creation_id,
            access_token,
          },
        }
      );

      resolve(post_media.data);
    } catch (err) {
      if (err.response?.data?.error?.code === 9007) {
        setTimeout(async () => {
          console.log(
            `Media not ready yet, retrying in ${cooldownSeconds} second(s)...`
          );
          resolve(await postMedia({ access_token, business_id, creation_id }));
        }, cooldownSeconds * 1000);
      } else {
        console.log(err.response?.data);
        reject(err.response?.data);
      }
    }
  });
};

checkPublishingLimits = async ({ access_token, business_id }) => {
  const isTokenExpired = await checkIfTokenExpired({ access_token });
  if (isTokenExpired) process.exit(0);

  const response = (
    await axios.get(
      process.env.IG_GRAPH_URL + `/${business_id}/content_publishing_limit`,
      {
        params: {
          fields: "config, quota_usage",
          access_token,
        },
      }
    )
  ).data.data;
  return response;
};

module.exports = {
  createImagePost: async ({
    access_token,
    business_id,
    media_url,
    caption,
  }) => {
    const creation_id = await getPostId({
      access_token,
      media_url,
      caption,
    });
    await postMedia({ access_token, business_id, creation_id });

    console.log(`New feed with id: ${creation_id}`);
    return creation_id;
  },

  createVideoPost: async ({
    access_token,
    business_id,
    media_url,
    caption,
  }) => {
    const creation_id = await getPostId({
      access_token,
      business_id,
      media_url,
      media_type: MEDIA_TYPES.VIDEO,
      caption,
    });
    await postMedia({ access_token, business_id, creation_id });

    console.log(`New video with id: ${creation_id}`);
    return creation_id;
  },

  createStoryPost: async ({ access_token, business_id, story_url }) => {
    const creation_id = await getPostId({
      access_token,
      business_id,
      media_url: story_url,
      media_type: MEDIA_TYPES.STORIES,
    });
    await postMedia({ access_token, business_id, creation_id });

    console.log(`New story with id: ${creation_id}`);
    return creation_id;
  },

  createReelPost: async ({ access_token, business_id, media_url, caption }) => {
    const creation_id = await getPostId({
      access_token,
      business_id,
      media_url,
      media_type: MEDIA_TYPES.REELS,
      caption,
    });

    await postMedia({ access_token, business_id, creation_id });

    console.log(`New reel with id: ${creation_id}`);
    return creation_id;
  },

  createCarouselPost: async ({
    access_token,
    business_id,
    media_url_list,
    caption,
  }) => {
    if (!Array.isArray(media_url_list)) {
      media_url_list = [media_url_list];
    } else if (media_url_list.length < 2 || media_url_list.length > 10) {
      console.log("The maximum number of images/video per carousel is 10.");
      return;
    }

    const children = [];

    for await (media_url of media_url_list) {
      const mimeType = await getMimeType(media_url);

      const media_type = MEDIA_MIME_TYPES.VIDEO.includes(mimeType)
        ? MEDIA_TYPES.VIDEO
        : null;

      const children_id = await getPostId({
        access_token,
        business_id,
        media_url,
        media_type,
        is_carousel_item: true,
      });

      children.push(children_id);
    }

    const creation_id = await getPostId({
      access_token,
      business_id,
      media_type: MEDIA_TYPES.CAROUSEL,
      children,
      caption,
    });

    await postMedia({ access_token, business_id, creation_id });

    console.log(`New carousel post with id: ${creation_id}`);
    return creation_id;
  },

  getPostedLast24h: async ({ access_token, business_id }) => {
    const response = await checkPublishingLimits({ access_token, business_id });
    return response[0].quota_usage;
  },
};
