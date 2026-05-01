import fs from 'fs';

let tsFile = fs.readFileSync('src/data/productDetails.ts', 'utf8');
const newInfills = fs.readFileSync('scratch/infills_ts.txt', 'utf8');

const targetStart = "  infills: [\n    { name: 'Pattern 1', image: '/assets/glass/thumbs/segura-331.webp', largeImage: '/assets/glass/large/segura-331.jpg' },\n    { name: 'Pattern 2', image: '/assets/glass/thumbs/segura-332-mat.webp', largeImage: '/assets/glass/large/segura-332-mat.jpg' },\n    { name: 'Pattern 3', image: '/assets/glass/thumbs/float-4.webp', largeImage: '/assets/glass/large/float-4.jpg' }\n  ],\n";

if(tsFile.includes(targetStart)) {
    tsFile = tsFile.replace(targetStart, newInfills);
    fs.writeFileSync('src/data/productDetails.ts', tsFile);
    console.log("Replaced successfully!");
} else {
    console.log("Could not find the target string!");
}
