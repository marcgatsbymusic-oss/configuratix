import fs from 'fs';
import readline from 'readline';

const transcriptPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\9af80de1-8f28-4297-8cb7-4eddce15c82b\\.system_generated\\logs\\transcript.jsonl';

const fileStream = fs.createReadStream(transcriptPath);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let count = 0;
for await (const line of rl) {
  count++;
  if (count > 200) break;
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT') {
      console.log(`Step ${count} [USER]: ${data.content} (time=${data.created_at || 'unknown'})`);
    } else if (data.tool_calls) {
      const gitCalls = data.tool_calls.filter(tc => tc.name === 'run_command' && (tc.args?.CommandLine || '').includes('git'));
      if (gitCalls.length > 0) {
        console.log(`Step ${count} [Git Command]:`, gitCalls.map(tc => tc.args?.CommandLine));
      }
    }
  } catch (e) {
    console.log(`Line ${count}: Error parsing JSON:`, e.message);
  }
}
