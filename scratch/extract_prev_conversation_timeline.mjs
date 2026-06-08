import fs from 'fs';
import readline from 'readline';

const transcriptPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\1402b35e-6e35-4b2b-85d7-4c14038c258f\\.system_generated\\logs\\transcript.jsonl';

const fileStream = fs.createReadStream(transcriptPath);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let count = 0;
for await (const line of rl) {
  count++;
  if (count < 730) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT') {
      console.log(`Step ${count} [USER]: ${data.content}`);
    } else if (data.content && data.source === 'MODEL' && data.type === 'PLANNER_RESPONSE') {
      console.log(`Step ${count} [MODEL]: ${data.content.slice(0, 150)}...`);
    }
  } catch (e) {
    console.log(`Line ${count}: Error parsing JSON:`, e.message);
  }
}
