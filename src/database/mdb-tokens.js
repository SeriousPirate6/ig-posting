require("dotenv").config();
const { ObjectId } = require("mongodb");
const { isJSON } = require("../utils/json");
const {
  getDB,
  insertData,
  closeConnection,
  createConnection,
  getDocumentById,
  updateData,
  listRecordForAttribute,
} = require("./mdb-basics");
const { encrypt, decrypt, fromHexToBytes } = require("../utils/string");
const { encryptTokenData, decryptTokenData } = require("./utils/token-data");

getTokenIfExists = async ({ db, objectId }) => {
  if (typeof objectId !== "string" || objectId.length !== 24) return false;

  const tokenFile = await getDocumentById(
    db,
    process.env.COLLECTION_TOKENS,
    objectId
  );
  return tokenFile;
};

module.exports = {
  encryptAndInsertToken: async ({ tokenData, objectId }) => {
    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);

    const expiration_date = new Date();
    expiration_date.setDate(expiration_date.getDate() + 59);

    const encryptedTokenData = encryptTokenData(tokenData);

    encryptedTokenData.expiration_date;

    const isTokenPresent = await getTokenIfExists({ db, objectId });

    try {
      const insertedData = isTokenPresent
        ? await updateData(
            db,
            process.env.COLLECTION_TOKENS,
            objectId,
            encryptedTokenData
          )
        : await insertData(
            db,
            process.env.COLLECTION_TOKENS,
            encryptedTokenData
          );

      return { insertedData };
    } finally {
      await closeConnection(client);
    }
  },

  decryptAndGetToken: async ({ objectId }) => {
    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);
    const tokenData = await getTokenIfExists({ db, objectId });

    if (tokenData) {
      const decryptedTokenData = decryptTokenData(tokenData);

      return decryptedTokenData;
    }
  },

  getTokenDataFromId: async ({ objectId }) => {
    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);

    const tokenData = await getDocumentById(
      db,
      process.env.COLLECTION_TOKENS,
      objectId
    );

    /*
     * if tokenData found, decrypting it and returning its access token
     */
    return tokenData ? decryptTokenData(tokenData) : null;
  },

  searchTokenByIgId: async ({ igId }) => {
    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);

    const tokenData = await listRecordForAttribute(
      db,
      process.env.COLLECTION_TOKENS,
      {
        fields: ["_id", "ig_id"],
      }
    );

    if (!tokenData) return null;

    const tokenId = tokenData.map((user) => {
      const decryptedTokenData = decryptTokenData(user);
      if (decryptedTokenData.ig_id === igId)
        return String(decryptedTokenData._id);
    })[0];

    /*
     * returning the tokenId of the token
     * matching with the igId provided, otherwise null
     */
    return tokenId;
  },
};
