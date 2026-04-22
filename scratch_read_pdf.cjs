const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
  console.log("PDF TEXT:\n", pdfParser.getRawTextContent());
});

pdfParser.loadPDF('C:/Users/Shadow/Desktop/Format debug page.pdf');
