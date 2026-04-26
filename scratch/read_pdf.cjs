const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('C:\\Users\\Shadow\\Desktop\\Projects\\partner_portal_analysis.pdf');



console.log(typeof pdf, Object.keys(pdf));
