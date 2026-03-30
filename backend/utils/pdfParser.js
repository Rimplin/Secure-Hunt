const pdfParse = require("pdf-parse");

module.exports = async (buffer) => {
  const data = await pdfParse(buffer);
  return { text: data.text?.trim() || "" };
};