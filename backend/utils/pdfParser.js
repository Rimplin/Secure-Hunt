const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
 
pdfjsLib.GlobalWorkerOptions.workerSrc = false;
 
const pdfParse = async (buffer) => {
  const data = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;
 
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
 
  return { text: text.trim() };
};
 
module.exports = pdfParse;