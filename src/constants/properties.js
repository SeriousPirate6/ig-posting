module.exports = Object.freeze({
  /* IG REQUESTS FIELDS */
  DEFAULT_MEDIA_FIELDS: "id, caption, timestamp, media_type",

  /* DAILTY POSTS QUOTA (feed + stories) */
  MAX_POSTS_PER_DAY: 10,

  /* allowed MEDIA MIME TYPES for IG posts */
  MEDIA_MIME_TYPES: {
    IMAGE: "image/jpeg",
    VIDEO: ["video/mp4", "video/quicktime", "VIDEO"],
  },

  /* allowed MEDIA TYPES for IG posts */
  MEDIA_TYPES: {
    CAROUSEL: "CAROUSEL",
    REELS: "REELS",
    STORIES: "STORIES",
    VIDEO: "VIDEO",
  },
});
