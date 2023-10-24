const {
  getBusinessAccountId,
} = require("../ig-graph/user/get-business-account-id");
const {
  getLongLiveAccessToken,
} = require("../ig-graph/authentication/get-access-token");
const { getPageId } = require("../ig-graph/user/get-page-id");
const { getUserInfo } = require("../ig-graph/user/get-user-info");
const {
  encryptAndInsertToken,
  searchTokenByIgId,
} = require("../database/mdb-tokens");

module.exports = {
  generateAccessTokenAndUpdate: async ({ code }) => {
    /*
     * generating long live access token
     */
    const access_token = await getLongLiveAccessToken(code);

    /*
     * defaulting the function if the access token is not found
     */
    if (!access_token) {
      console.log("Error generating access token.");
      return;
    }
    /*
     * fetching the page id of the user
     */
    const page_id = await getPageId({
      access_token,
    });

    /*
     * fetching the business id of the user
     */
    const business_id = await getBusinessAccountId({ access_token, page_id });

    /*
     * fetching user info
     */
    const { id, name } = await getUserInfo({ access_token });

    /*
     * constructing the tokenData object
     */
    const tokenData = {
      access_token,
      business_id,
      ig_id: id,
      ig_username: name,
    };

    /*
     * fetching the objectId of of the igId if already saved
     */
    const objectId = await searchTokenByIgId({ igId: id });

    /*
     * encrypting and insert or updating the access token
     */
    const createdTokenId = await encryptAndInsertToken({
      tokenData,
      objectId,
    });

    return createdTokenId;
  },
};
