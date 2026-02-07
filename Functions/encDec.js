const crypto = require("crypto");

const SECRET_KEY = process.env.SECRET_KEY;

const encryptJSON = (obj) => {
  const jsonString = JSON.stringify(obj);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(SECRET_KEY, "hex"), iv);

  let encrypted = cipher.update(jsonString, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    data: encrypted
  };
}

const decryptJSON = ({ iv, data }) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(SECRET_KEY, "hex"), Buffer.from(iv, "hex"));

  let decrypted = decipher.update(data, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return (decrypted);
}

const generateAES256Key = () => {
  // 32 bytes = 256 bits
  const key = crypto.randomBytes(32);
  console.log(key.toString("hex"));
}

module.exports = { encryptJSON, decryptJSON, generateAES256Key }


/*
const map = {
        "string-string": (v) => String(v),
        "Text-Array of Text": (v) => [String(v)],
        "string-Array of strings": (v) => [String(v)],
        "number-string": (v) => String(v),
        "string-number": (v) => Number(v),
        "number-number": (v) => Number(v),
        "boolean-string": (v) => (v ? "true" : "false"),
        "boolean-boolean": (v) => Boolean(v),
        "dropdown-dropdown": (v) => v,
        "picklist-dropdown": (v) => v,
        "textarea-string": (v) => v,
        "phone-string": (v) => v,
        "address-string": (v) => v,
        "currency-string": (v) => v,
        "double-string": (v) => v,
        "reference-string": (v) => v,
        "email-string": (v) => v,
        "textarea-textarea": (v) => v,
        "multipicklist-dropdown": (v) => v[0],
        "dropdown-text": (v) => String(v),
        "date-date": (v) => moment(v).format("YYYY-MM-DD"),
        "datetime-date": (v) =>
          moment.tz(v, DEFAULT_TIMEZONE).format("YYYY-MM-DD"),
        "datetime-datetime": (v) =>
          moment.tz(v, DEFAULT_TIMEZONE).format("YYYY-MM-DDTHH:mm:ss[Z]"),
      };
*/
