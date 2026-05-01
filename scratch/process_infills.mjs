import fs from 'fs';

const json = fs.readFileSync('scratch/infills_output.json', 'utf16le').replace(/^\uFEFF/, '');
const arr = JSON.parse(json);

let strWithExamples = `  infills: [\n`;
for (const item of arr) {
    strWithExamples += `    { name: '${item.name.replace(/'/g, "\\'")}', image: '${item.image}', largeImage: '${item.largeImage}' },\n`;
}
strWithExamples += `  ],\n`;

fs.writeFileSync('scratch/infills_ts.txt', strWithExamples);
console.log("Done");
