import fs from 'fs';

const data = JSON.parse(fs.readFileSync("src/data/profiles/IG5_F100.json", 'utf-8'));
console.log("Keys in IG5_F100.json profiles:", Object.keys(data.profiles));
