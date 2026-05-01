import fs from 'fs';

const text = fs.readFileSync('scratch/infills_ts.txt', 'utf8');
const lines = text.split('\n');
const uniqueLines = [];
const seen = new Set();
for(const line of lines) {
    if(!seen.has(line)) {
        seen.add(line);
        uniqueLines.push(line);
    }
}
fs.writeFileSync('scratch/infills_ts.txt', uniqueLines.join('\n'));
