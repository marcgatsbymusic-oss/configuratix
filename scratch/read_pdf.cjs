const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('C:\\Users\\Shadow\\Desktop\\product categories group md.pdf');

const pdfParser = typeof pdf === 'function' ? pdf : pdf.default;

pdfParser(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(function(err) {
    console.error(err);
});
