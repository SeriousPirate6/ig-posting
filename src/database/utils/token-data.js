const { encrypt, fromHexToBytes, decrypt } = require("../../utils/string");

module.exports = {
  encryptTokenData: (tokenData) => {
    const encryptedTokenData = {};

    for (key in tokenData) {
      if (tokenData.hasOwnProperty(key)) {
        encryptedTokenData[key] = encrypt(
          tokenData[key],
          fromHexToBytes(process.env.ENC_SECRET_KEY)
        );
      }
    }

    return encryptedTokenData;
  },

  decryptTokenData: (tokenData) => {
    const decryptedTokenData = {};

    for (key in tokenData) {
      /*
       * saving the plain text if the key does not have the attribute iv, used in encryption
       */
      decryptedTokenData[key] = tokenData[key].hasOwnProperty("iv")
        ? decrypt(tokenData[key], fromHexToBytes(process.env.ENC_SECRET_KEY))
        : tokenData[key];
    }

    return decryptedTokenData;
  },
};
