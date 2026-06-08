import fs from 'fs';

const logPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\9af80de1-8f28-4297-8cb7-4eddce15c82b\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
const line = lines[390]; // 0-indexed line 391
console.log("Raw line 391 length:", line.length);

// Let's write it to a file so we can view it
fs.writeFileSync('scratch/line391_raw.txt', line, 'utf8');
console.log("Wrote raw line 391 to scratch/line391_raw.txt");
