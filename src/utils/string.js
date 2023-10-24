const crypto = require("crypto");
const { isJSON } = require("./json");

module.exports = {
  generateRandom: (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  },

  getRandomState: () => {
    const randString = (Math.random() + 1).toString(36).substring(7);
    return randString;
  },

  getRandomBytes: (keyLength) => {
    /*
     * each byte count as double
     */
    return crypto
      .randomBytes(keyLength % 2 ? keyLength / 2 : (keyLength + 1) / 2)
      .toString("hex");
  },

  fromHexToBytes: (hexString) => {
    return Buffer.from(hexString, "hex");
  },

  fromBytesToHex: (bytes) => {
    return bytes.toString("hex");
  },

  encrypt: (text, secretKey) => {
    const algorithm = "aes-256-cbc";
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(
      isJSON(text) ? JSON.stringify(text) : text,
      "utf8",
      "hex"
    );
    encrypted += cipher.final("hex");
    return {
      iv: iv.toString("hex"),
      encryptedText: encrypted,
    };
  },

  decrypt: (encryptedData, secretKey) => {
    const algorithm = "aes-256-cbc";
    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      Buffer.from(encryptedData.iv, "hex")
    );
    let decrypted = decipher.update(encryptedData.encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return isJSON(decrypted) ? JSON.parse(decrypted) : decrypted;
  },
};
